import type { MatchInput, TacticalPlan, TeamSnapshot } from "../../contracts/engineToCoach";
import type { TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { ScoreState } from "../../models/match";

export type FullMatchTeamSegmentState = {
  readonly teamId: TeamId;
  readonly condition: Rating;
  readonly mentalFreshness: Rating;
  readonly momentum: Rating;
  readonly pressureLoad: Rating;
  readonly scoringConfidence: Rating;
  readonly defensiveStress: Rating;
};

export type FullMatchSegmentState = {
  readonly segmentIndex: number;
  readonly minute: number;
  readonly score: ScoreState;
  readonly home: FullMatchTeamSegmentState;
  readonly away: FullMatchTeamSegmentState;
  readonly previousScoringTeamId?: TeamId;
  readonly repeatedPatternCount: number;
};

function clampRating(value: number): Rating {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function averageRosterValue(team: TeamSnapshot, selector: (player: TeamSnapshot["roster"][number]) => number): Rating {
  if (team.roster.length === 0) {
    return 100;
  }

  return clampRating(team.roster.reduce((total, player) => total + selector(player), 0) / team.roster.length);
}

function initialTeamState(team: TeamSnapshot, plan: TacticalPlan): FullMatchTeamSegmentState {
  return {
    teamId: team.teamId,
    condition: averageRosterValue(team, (player) => player.currentCondition),
    mentalFreshness: averageRosterValue(team, (player) => player.mentalFreshness),
    momentum: 50,
    pressureLoad: clampRating(15 + plan.pressingIntensity * 0.55),
    scoringConfidence: 50,
    defensiveStress: clampRating(12 + (100 - plan.restDefensePriority) * 0.2),
  };
}

export function createInitialFullMatchSegmentState(input: MatchInput): FullMatchSegmentState {
  return {
    segmentIndex: 0,
    minute: 0,
    score: { home: 0, away: 0 },
    home: initialTeamState(input.homeTeam, input.homePlan),
    away: initialTeamState(input.awayTeam, input.awayPlan),
    repeatedPatternCount: 0,
  };
}

export function scoreStateTags(score: ScoreState): readonly string[] {
  const scoreDifference = Math.abs(score.home - score.away);
  const tags = ["score_state_level"];

  if (score.home > score.away) {
    tags.push("score_state_home_leading");
  } else if (score.away > score.home) {
    tags.push("score_state_away_leading");
  }

  if (scoreDifference <= 7) {
    tags.push("score_state_close");
  }

  if (scoreDifference >= 21) {
    tags.push("score_state_lopsided");
  }

  return tags;
}

export function teamStateForId(state: FullMatchSegmentState, teamId: TeamId): FullMatchTeamSegmentState {
  return state.home.teamId === teamId ? state.home : state.away;
}

export function opponentTeamStateForId(state: FullMatchSegmentState, teamId: TeamId): FullMatchTeamSegmentState {
  return state.home.teamId === teamId ? state.away : state.home;
}

import type { TeamId } from "../../core/ids";
import type { ScoreState } from "../../models/match";
import type {
  FullMatchSegmentState,
  FullMatchTeamSegmentState,
} from "./fullMatchSegmentState";

export type FullMatchScoreStateLabel =
  | "level"
  | "close"
  | "home_leading"
  | "away_leading"
  | "lopsided";

export type FullMatchTeamSegmentInfluence = {
  readonly teamId: TeamId;
  readonly conditionModifier: number;
  readonly mentalFreshnessModifier: number;
  readonly momentumModifier: number;
  readonly pressureLoadModifier: number;
  readonly defensiveStressModifier: number;
  readonly scoringConfidenceModifier: number;
  readonly routeRiskModifier: number;
  readonly supportStabilityModifier: number;
  readonly finalActionComposureModifier: number;
};

export type FullMatchSegmentInfluence = {
  readonly segmentIndex: number;
  readonly scoreState: FullMatchScoreStateLabel;
  readonly home: FullMatchTeamSegmentInfluence;
  readonly away: FullMatchTeamSegmentInfluence;
  readonly global: {
    readonly repeatedPatternPressure: number;
    readonly matchTempoAdjustment: number;
    readonly conversionVolatilityAdjustment: number;
  };
};

const MODIFIER_LIMIT = 5;

function boundedModifier(value: number): number {
  return Math.max(-MODIFIER_LIMIT, Math.min(MODIFIER_LIMIT, Math.round(value)));
}

function scoreState(score: ScoreState): FullMatchScoreStateLabel {
  const difference = Math.abs(score.home - score.away);

  if (difference >= 21) {
    return "lopsided";
  }

  if (score.home === score.away) {
    return "level";
  }

  if (difference <= 7) {
    return "close";
  }

  return score.home > score.away ? "home_leading" : "away_leading";
}

function lowRatingPenalty(value: number, neutral = 85): number {
  return boundedModifier((value - neutral) / 8);
}

function highRatingPressure(value: number, neutral = 55): number {
  return boundedModifier((value - neutral) / 10);
}

function teamInfluence(team: FullMatchTeamSegmentState): FullMatchTeamSegmentInfluence {
  const condition = lowRatingPenalty(team.condition);
  const mental = lowRatingPenalty(team.mentalFreshness);
  const momentum = boundedModifier((team.momentum - 50) / 10);
  const pressureLoad = highRatingPressure(team.pressureLoad);
  const defensiveStress = highRatingPressure(team.defensiveStress);
  const scoringConfidence = boundedModifier((team.scoringConfidence - 50) / 12);

  return {
    teamId: team.teamId,
    conditionModifier: condition,
    mentalFreshnessModifier: mental,
    momentumModifier: momentum,
    pressureLoadModifier: pressureLoad,
    defensiveStressModifier: defensiveStress,
    scoringConfidenceModifier: scoringConfidence,
    routeRiskModifier: boundedModifier(momentum + scoringConfidence - pressureLoad - defensiveStress),
    supportStabilityModifier: boundedModifier(condition + mental + momentum - Math.max(0, defensiveStress)),
    finalActionComposureModifier: boundedModifier(mental + scoringConfidence - Math.max(0, pressureLoad)),
  };
}

export function createFullMatchSegmentInfluence(state: FullMatchSegmentState): FullMatchSegmentInfluence {
  return {
    segmentIndex: state.segmentIndex,
    scoreState: scoreState(state.score),
    home: teamInfluence(state.home),
    away: teamInfluence(state.away),
    global: {
      repeatedPatternPressure: boundedModifier(state.repeatedPatternCount * 2),
      matchTempoAdjustment: boundedModifier((state.home.momentum + state.away.momentum - 100) / 14),
      conversionVolatilityAdjustment: boundedModifier(
        (state.home.scoringConfidence + state.away.scoringConfidence - 100) / 16,
      ),
    },
  };
}

export function allSegmentInfluenceModifiers(input: FullMatchSegmentInfluence): readonly number[] {
  const teamValues = [input.home, input.away].flatMap((team) => [
    team.conditionModifier,
    team.mentalFreshnessModifier,
    team.momentumModifier,
    team.pressureLoadModifier,
    team.defensiveStressModifier,
    team.scoringConfidenceModifier,
    team.routeRiskModifier,
    team.supportStabilityModifier,
    team.finalActionComposureModifier,
  ]);

  return [
    ...teamValues,
    input.global.repeatedPatternPressure,
    input.global.matchTempoAdjustment,
    input.global.conversionVolatilityAdjustment,
  ];
}

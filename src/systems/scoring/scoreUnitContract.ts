import type { MiniMatchResult, MiniMatchTryEvent } from "../../simulation/miniMatch";
import type { ShotOutcomeContract } from "../actions";
import { scoringActionTypeForShotOutcome } from "./scoringRules";
import type { ConversionAttemptResult } from "./conversionTypes";
import type { ScoreUnitContract, ScoreUnitScoringEvent, ScoreUnitTeamTotal } from "./scoreUnitTypes";

function scoreDisplay(input: { readonly homeName: string; readonly homePoints: number; readonly awayPoints: number; readonly awayName: string }): string {
  return `${input.homeName} ${input.homePoints} - ${input.awayPoints} ${input.awayName}`;
}

export function createScoreUnitContract(input: {
  readonly result: MiniMatchResult;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
  readonly liveTryEvents?: readonly MiniMatchTryEvent[];
  readonly liveConversionAttempts?: readonly ConversionAttemptResult[];
}): ScoreUnitContract {
  const home = input.result.state.context.teamA;
  const away = input.result.state.context.teamB;
  const shotScoringEvents: readonly ScoreUnitScoringEvent[] = input.shotOutcomes
    .filter((outcome) => outcome.scoringImpact.pointsAdded > 0)
    .map((outcome) => ({
      actionId: outcome.actionId,
      sequenceId: outcome.sequenceId,
      teamId: outcome.shootingTeamId,
      actorId: outcome.shooterId,
      actorInitials: outcome.shooterInitials,
      scoringActionType: scoringActionTypeForShotOutcome(outcome.ballOutcome),
      pointValue: outcome.scoringImpact.pointsAdded,
      scoreBefore: outcome.scoringImpact.scoreBefore,
      scoreAfter: outcome.scoringImpact.scoreAfter,
      reason: outcome.scoringImpact.reason,
    }));
  const tryScoringEvents: readonly ScoreUnitScoringEvent[] = (input.liveTryEvents ?? input.result.summary.liveTryEvents)
    .filter((event) => event.eventType === "TRY_TOUCHDOWN_SCORED")
    .map((event) => ({
      actionId: event.actionId,
      sequenceId: `Sequence ${event.sequenceNumber}`,
      teamId: event.teamId,
      actorId: event.carrierId,
      actorInitials: event.carrierRole,
      scoringActionType: "TRY_TOUCHDOWN",
      pointValue: event.pointValue,
      scoreBefore: event.scoreBefore,
      scoreAfter: event.scoreAfter,
      reason: event.reason,
    }));
  const conversionScoringEvents: readonly ScoreUnitScoringEvent[] = (input.liveConversionAttempts ?? [])
    .filter((attempt) => attempt.outcome === "CONVERSION_GOAL")
    .map((attempt) => ({
      actionId: `${attempt.sourceTryActionId}-conversion`,
      sequenceId: attempt.sourceTryActionId,
      teamId: attempt.scoringTeamId,
      actorId: attempt.kickerId,
      actorInitials: attempt.kickerRole,
      scoringActionType: "CONVERSION_GOAL",
      pointValue: attempt.pointValue,
      scoreBefore: attempt.scoreBefore,
      scoreAfter: attempt.scoreAfter,
      reason: attempt.reason,
    }));
  const scoringEvents = [...shotScoringEvents, ...tryScoringEvents, ...conversionScoringEvents];
  const totalsFor = (teamId: string, teamName: string): ScoreUnitTeamTotal => {
    const teamEvents = scoringEvents.filter((event) => event.teamId === teamId);

    return {
      teamId,
      teamName,
      goalCount: teamEvents.filter((event) => event.scoringActionType === "SHOT_GOAL").length,
      points: teamEvents.reduce((sum, event) => sum + event.pointValue, 0),
      scoringActions: teamEvents.length,
    };
  };
  const teamTotals = [totalsFor(home.id, home.displayName), totalsFor(away.id, away.displayName)];
  const homePoints = teamTotals.find((total) => total.teamId === home.id)?.points ?? 0;
  const awayPoints = teamTotals.find((total) => total.teamId === away.id)?.points ?? 0;
  const finalScore = {
    homeTeamId: home.id,
    awayTeamId: away.id,
    homePoints: input.result.summary.finalScore.teamA,
    awayPoints: input.result.summary.finalScore.teamB,
    display: scoreDisplay({
      homeName: home.displayName,
      homePoints: input.result.summary.finalScore.teamA,
      awayPoints: input.result.summary.finalScore.teamB,
      awayName: away.displayName,
    }),
  };
  const computedDisplay = scoreDisplay({
    homeName: home.displayName,
    homePoints,
    awayPoints,
    awayName: away.displayName,
  });
  const consistencyStatus = computedDisplay === finalScore.display ? "PASS" : "FAIL";

  return {
    scoreUnit: "POINTS",
    scoringEvents,
    finalScore,
    teamTotals,
    consistencyStatus,
    reason:
      consistencyStatus === "PASS"
        ? "Final score is expressed in points; scoring event point values, not goal counts, reproduce the scoreline."
        : `Scoring event point values produce ${computedDisplay}, which differs from ${finalScore.display}.`,
  };
}

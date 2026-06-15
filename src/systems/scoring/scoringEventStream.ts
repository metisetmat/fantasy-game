import type { MiniMatchResult } from "../../simulation/miniMatch";
import { scoreSourceLabel } from "../../reports/scoreSourceLabel";
import type { ShotOutcomeContract } from "../actions";
import type { OffensivePossessionDangerPhaseSnapshot } from "../phases";
import type { ConversionAttemptResult } from "./conversionTypes";
import type { DropGoalAttemptResult } from "./dropGoalTypes";
import { dropGoalRuleLabel } from "./dropGoalRules";
import { scoringActionLabel } from "./scoringActionRegistry";
import { conversionRuleLabel } from "./conversionRules";
import { scoringRuleLabel } from "./scoringRules";
import type { ScoringEvent, ScoringEventScoreState, ScoringEventSourceOutcome, UnifiedScoringEventSummary } from "./scoringEventTypes";
import { TRY_TOUCHDOWN_SCORING_VERSION, tryTouchdownRuleLabel } from "./tryTouchdownRules";
import type { ScoringChoiceBalanceSnapshot } from "./scoringChoiceBalanceTypes";
import type { ScoringAffordanceVolumeSnapshot } from "./scoringAffordanceTypes";
import type { ShotDominanceDiagnosticSnapshot } from "./shotDominanceDiagnosticTypes";
import type { NonShotResolutionRebalanceSummary } from "./nonShotResolutionRebalance";
import type { RouteBalancePostRankingMonitoringSummary } from "./routeBalancePostRankingMonitoring";
import type { RouteSuccessRateCalibrationSummary } from "./routeSuccessRateCalibration";
import type { GoalkeeperShotStoppingImpactCalibrationSummary } from "./goalkeeperShotStoppingImpactCalibration";
import type { TryGroundingPressureCalibrationSummary } from "./tryGroundingPressureCalibration";
import type { CleanShotSuccessCalibrationSummary } from "./cleanShotSuccessCalibration";
import type { PostResolutionRouteEconomyMonitoringSummary } from "./postResolutionRouteEconomyMonitoring";
import type { DangerPhaseConversionEconomySummary } from "./dangerPhaseConversionEconomy";
import type { ContinuationPayoffCalibrationSummary } from "./continuationPayoffCalibration";
import type { MatchDurationPossessionVolumeCalibrationSummary } from "./matchDurationPossessionVolumeCalibration";
import type { FullMatchEconomyValidationSummary } from "./fullMatchEconomyValidation";

function scoreStateFromDisplay(score: string): ScoringEventScoreState {
  const match = /CONTROL (\d+) - (\d+) BLITZ/.exec(score);

  return {
    CONTROL: match?.[1] === undefined ? 0 : Number.parseInt(match[1], 10),
    BLITZ: match?.[2] === undefined ? 0 : Number.parseInt(match[2], 10),
  };
}

function scoreStateWithPoints(input: { readonly scoreBefore: ScoringEventScoreState; readonly teamId: string; readonly points: number }): ScoringEventScoreState {
  const normalizedTeamId = input.teamId.toUpperCase();

  return {
    CONTROL: input.scoreBefore.CONTROL + (normalizedTeamId === "CONTROL" ? input.points : 0),
    BLITZ: input.scoreBefore.BLITZ + (normalizedTeamId === "BLITZ" ? input.points : 0),
  };
}

function scoreDisplay(score: ScoringEventScoreState): string {
  return `CONTROL ${score.CONTROL} - ${score.BLITZ} BLITZ`;
}

function actionLabel(actionId: string): string {
  const match = /^dt-s(\d+)-a(\d+)$/.exec(actionId);
  return match === null ? actionId : `Sequence ${match[1]} Action ${match[2]}`;
}

function sourceOutcomeForShot(outcome: ShotOutcomeContract): ScoringEventSourceOutcome {
  switch (outcome.ballOutcome) {
    case "GOAL":
      return "GOAL";
    case "MISSED_HIGH":
    case "MISSED_WIDE":
    case "MISSED":
    case "OUT_OF_PLAY":
      return "MISSED_HIGH";
    case "SAVED_BY_GK":
    case "SAVED":
    case "CAUGHT_BY_GK":
      return "SAVED_BY_GK";
    case "DEFLECTED_BY_GK":
    case "REBOUND":
    case "REBOUND_CONTESTED":
      return "DEFLECTED_BY_GK";
    case "BLOCKED":
    case "BLOCKED_BY_DEFENDER":
    case "PENDING":
      return "NONE";
  }
}

function recommendation(input: {
  readonly finalScoreMismatchCount: number;
  readonly batchLiveContaminationCount: number;
  readonly conversionWithoutTryCount: number;
  readonly activeScoringEventCount: number;
}): UnifiedScoringEventSummary["recommendation"] {
  if (input.finalScoreMismatchCount > 0) {
    return "FIX_SCORE_AGGREGATION";
  }

  if (input.batchLiveContaminationCount > 0) {
    return "FIX_BATCH_LIVE_SCORE_SEPARATION";
  }

  if (input.conversionWithoutTryCount > 0) {
    return "FIX_CONVERSION_SCORING_LINK";
  }

  if (input.activeScoringEventCount === 0) {
    return "NEEDS_MORE_SAMPLE";
  }

  return "KEEP_UNIFIED_SCORING_STREAM";
}

export function buildUnifiedLiveScoringEvents(input: {
  readonly result: MiniMatchResult;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
  readonly liveConversionAttempts?: readonly ConversionAttemptResult[] | undefined;
  readonly liveDropGoalAttempts?: readonly DropGoalAttemptResult[] | undefined;
}): readonly ScoringEvent[] {
  const shotEvents: readonly ScoringEvent[] = input.shotOutcomes.map((outcome) => {
    const active = outcome.ballOutcome === "GOAL" && outcome.scoringImpact.pointsAdded > 0;
    const scoreBefore = scoreStateFromDisplay(outcome.scoringImpact.scoreBefore);
    const scoreAfter = active
      ? scoreStateWithPoints({ scoreBefore, teamId: outcome.shootingTeamId, points: outcome.scoringImpact.pointsAdded })
      : scoreBefore;

    return {
      id: `${outcome.actionId}-shot-scoring`,
      matchId: "current-mini-match",
      sequenceId: actionLabel(outcome.actionId),
      sourceActionId: outcome.actionId,
      teamId: outcome.shootingTeamId,
      actorId: outcome.shooterId,
      eventFamily: "SHOT",
      scoringAction: active ? "SHOT_GOAL" : "NONE",
      pointValue: active ? outcome.scoringImpact.pointsAdded : 0,
      scoreBefore,
      scoreAfter,
      active,
      sourceOutcome: sourceOutcomeForShot(outcome),
      reason: active ? outcome.scoringImpact.reason : outcome.outcomeReason,
    };
  });
  const tryEvents: readonly ScoringEvent[] = input.result.summary.liveTryEvents.map((event) => {
    const active = event.eventType === "TRY_TOUCHDOWN_SCORED";
    const scoreBefore = scoreStateFromDisplay(event.scoreBefore);
    const scoreAfter = active
      ? scoreStateWithPoints({ scoreBefore, teamId: event.teamId, points: event.pointValue })
      : scoreBefore;

    return {
      id: `${event.actionId}-try-scoring`,
      matchId: "current-mini-match",
      sequenceId: `Sequence ${event.sequenceNumber} Try Attempt`,
      sourceActionId: event.actionId,
      teamId: event.teamId,
      actorId: event.carrierId,
      eventFamily: "TRY_TOUCHDOWN",
      scoringAction: active ? "TRY_TOUCHDOWN" : "NONE",
      pointValue: active ? event.pointValue : 0,
      scoreBefore,
      scoreAfter,
      active,
      sourceOutcome: active ? "TRY_SCORED" : event.outcome === "LOST_FORWARD" ? "LOST_FORWARD" : event.outcome === "TACKLED_SHORT" ? "TACKLED_SHORT" : event.outcome === "HELD_UP" ? "HELD_UP" : "NONE",
      reason: event.reason,
    };
  });
  const conversionEvents: readonly ScoringEvent[] = (input.liveConversionAttempts ?? []).map((attempt) => {
    const active = attempt.outcome === "CONVERSION_GOAL";
    const scoreBefore = scoreStateFromDisplay(attempt.scoreBefore);
    const scoreAfter = active
      ? scoreStateWithPoints({ scoreBefore, teamId: attempt.scoringTeamId, points: attempt.pointValue })
      : scoreBefore;

    return {
      id: `${attempt.sourceTryActionId}-conversion-scoring`,
      matchId: "current-mini-match",
      sequenceId: attempt.sourceTryActionId,
      sourceActionId: attempt.sourceTryActionId,
      teamId: attempt.scoringTeamId,
      actorId: attempt.kickerId,
      eventFamily: "CONVERSION",
      scoringAction: active ? "CONVERSION_GOAL" : "NONE",
      pointValue: active ? attempt.pointValue : 0,
      scoreBefore,
      scoreAfter,
      active,
      sourceOutcome: attempt.outcome === "CONVERSION_GOAL" ? "CONVERSION_GOAL" : "CONVERSION_MISSED",
      reason: attempt.reason,
    };
  });
  const dropEvents: readonly ScoringEvent[] = (input.liveDropGoalAttempts ?? []).map((attempt) => {
    const active = attempt.outcome === "DROP_GOAL";
    const scoreBefore = scoreStateFromDisplay(attempt.scoreBefore);
    const scoreAfter = active
      ? scoreStateWithPoints({ scoreBefore, teamId: attempt.context.attackingTeamId, points: attempt.pointValue })
      : scoreBefore;

    return {
      id: `${attempt.context.actionId}-drop-scoring`,
      matchId: "current-mini-match",
      sequenceId: attempt.context.sequenceId,
      sourceActionId: attempt.context.actionId,
      teamId: attempt.context.attackingTeamId,
      actorId: attempt.context.kickerId,
      eventFamily: "DROP_GOAL",
      scoringAction: active ? "DROP_GOAL" : "NONE",
      pointValue: active ? attempt.pointValue : 0,
      scoreBefore,
      scoreAfter,
      active,
      sourceOutcome: attempt.outcome,
      reason: attempt.reason,
    };
  });

  return [...shotEvents, ...tryEvents, ...conversionEvents, ...dropEvents];
}

export function summarizeUnifiedLiveScoringEvents(input: {
  readonly result: MiniMatchResult;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
  readonly liveConversionAttempts?: readonly ConversionAttemptResult[] | undefined;
  readonly liveDropGoalAttempts?: readonly DropGoalAttemptResult[] | undefined;
  readonly batchConversionAttempts: number;
  readonly batchConversionPoints: number;
  readonly batchDropOpportunities?: number | undefined;
  readonly batchDropCandidatesGenerated?: number | undefined;
  readonly batchDropAttempts?: number | undefined;
  readonly batchDropPoints?: number | undefined;
}): UnifiedScoringEventSummary {
  const events = buildUnifiedLiveScoringEvents({
    result: input.result,
    shotOutcomes: input.shotOutcomes,
    liveConversionAttempts: input.liveConversionAttempts,
    liveDropGoalAttempts: input.liveDropGoalAttempts,
  });
  const activeEvents = events.filter((event) => event.active);
  const nonScoringEvents = events.filter((event) => !event.active);
  const finalScoreFromEvents = activeEvents.reduce<ScoringEventScoreState>(
    (score, event) => scoreStateWithPoints({ scoreBefore: score, teamId: event.teamId, points: event.pointValue }),
    { CONTROL: 0, BLITZ: 0 },
  );
  const finalScoreReported = {
    CONTROL: input.result.summary.finalScore.teamA,
    BLITZ: input.result.summary.finalScore.teamB,
  };
  const finalScoreMismatchCount =
    finalScoreFromEvents.CONTROL === finalScoreReported.CONTROL && finalScoreFromEvents.BLITZ === finalScoreReported.BLITZ ? 0 : 1;
  const conversionGoalEvents = activeEvents.filter((event) => event.scoringAction === "CONVERSION_GOAL");
  const dropGoalEvents = activeEvents.filter((event) => event.scoringAction === "DROP_GOAL");
  const tryTouchdownEvents = activeEvents.filter((event) => event.scoringAction === "TRY_TOUCHDOWN");
  const conversionWithoutTryCount = conversionGoalEvents.length > 0 && tryTouchdownEvents.length === 0 ? conversionGoalEvents.length : 0;
  const batchLiveContaminationCount =
    (input.batchConversionPoints > 0 && conversionGoalEvents.length === 0 ? 0 : 0) +
    ((input.batchDropPoints ?? 0) > 0 && dropGoalEvents.length === 0 ? 0 : 0);
  const inactiveScoringLeakageCount = events.filter((event) => !event.active && event.pointValue !== 0).length;

  return {
    scoringVersion: TRY_TOUCHDOWN_SCORING_VERSION,
    scoreUnit: "POINTS",
    scoringSource: "UNIFIED_LIVE_SCORING_EVENTS",
    events,
    activeEvents,
    nonScoringEvents,
    finalScoreFromEvents,
    finalScoreReported,
    finalScoreDisplay: scoreDisplay(finalScoreFromEvents),
    scoringEventCount: events.length,
    activeScoringEventCount: activeEvents.length,
    shotGoalEvents: activeEvents.filter((event) => event.scoringAction === "SHOT_GOAL").length,
    tryTouchdownEvents: tryTouchdownEvents.length,
    conversionGoalEvents: conversionGoalEvents.length,
    dropGoalEvents: dropGoalEvents.length,
    failedTryActiveScoringLeakageCount: events.filter((event) => event.eventFamily === "TRY_TOUCHDOWN" && event.sourceOutcome !== "TRY_SCORED" && event.active).length,
    conversionWithoutTryCount,
    batchLiveContaminationCount,
    finalScoreMismatchCount,
    inactiveScoringLeakageCount,
    recommendation: recommendation({
      finalScoreMismatchCount,
      batchLiveContaminationCount,
      conversionWithoutTryCount,
      activeScoringEventCount: activeEvents.length,
    }),
  };
}

export function createScoringEventsSummaryReport(input: {
  readonly result: MiniMatchResult;
  readonly shotOutcomes: readonly ShotOutcomeContract[];
  readonly liveConversionAttempts?: readonly ConversionAttemptResult[] | undefined;
  readonly liveDropGoalAttempts?: readonly DropGoalAttemptResult[] | undefined;
  readonly batchTryAttempts: number;
  readonly batchTriesScored: number;
  readonly batchConversionAttempts: number;
  readonly batchConversionsMade: number;
  readonly batchConversionPoints: number;
  readonly batchDropOpportunities?: number | undefined;
  readonly batchDropCandidatesGenerated?: number | undefined;
  readonly batchDropAttempts?: number | undefined;
  readonly batchDropGoals?: number | undefined;
  readonly batchDropMissed?: number | undefined;
  readonly batchDropBlocked?: number | undefined;
  readonly batchDropInvalid?: number | undefined;
  readonly batchDropSuccessRate?: number | undefined;
  readonly batchDropPoints?: number | undefined;
  readonly scoringChoiceBalance?: ScoringChoiceBalanceSnapshot | undefined;
  readonly scoringAffordanceVolume?: ScoringAffordanceVolumeSnapshot | undefined;
  readonly possessionDangerPhase?: OffensivePossessionDangerPhaseSnapshot | undefined;
  readonly shotDominanceDiagnostic?: ShotDominanceDiagnosticSnapshot | undefined;
  readonly nonShotResolutionRebalance?: NonShotResolutionRebalanceSummary | undefined;
  readonly routeBalancePostRankingMonitoring?: RouteBalancePostRankingMonitoringSummary | undefined;
  readonly routeSuccessRateCalibration?: RouteSuccessRateCalibrationSummary | undefined;
  readonly goalkeeperShotStoppingImpactCalibration?: GoalkeeperShotStoppingImpactCalibrationSummary | undefined;
  readonly tryGroundingPressureCalibration?: TryGroundingPressureCalibrationSummary | undefined;
  readonly cleanShotSuccessCalibration?: CleanShotSuccessCalibrationSummary | undefined;
  readonly postResolutionRouteEconomyMonitoring?: PostResolutionRouteEconomyMonitoringSummary | undefined;
  readonly dangerPhaseConversionEconomy?: DangerPhaseConversionEconomySummary | undefined;
  readonly continuationPayoffCalibration?: ContinuationPayoffCalibrationSummary | undefined;
  readonly matchDurationPossessionVolumeCalibration?: MatchDurationPossessionVolumeCalibrationSummary | undefined;
  readonly fullMatchEconomyValidation?: FullMatchEconomyValidationSummary | undefined;
}): string {
  const summary = summarizeUnifiedLiveScoringEvents({
    result: input.result,
    shotOutcomes: input.shotOutcomes,
    liveConversionAttempts: input.liveConversionAttempts,
    liveDropGoalAttempts: input.liveDropGoalAttempts,
    batchConversionAttempts: input.batchConversionAttempts,
    batchConversionPoints: input.batchConversionPoints,
    batchDropOpportunities: input.batchDropOpportunities,
    batchDropCandidatesGenerated: input.batchDropCandidatesGenerated,
    batchDropAttempts: input.batchDropAttempts,
    batchDropPoints: input.batchDropPoints,
  });

  return [
    "# Scoring Events Summary",
    "",
    "## Summary",
    `- scoring version: ${summary.scoringVersion}`,
    `- score unit: ${summary.scoreUnit}`,
    `- scoring source: ${summary.scoringSource}`,
    `- score source label: ${scoreSourceLabel("live_scoring_events_sample").label}`,
    `- score source note: ${scoreSourceLabel("live_scoring_events_sample").compactNote}`,
    `- batch diagnostics label: ${scoreSourceLabel("batch_diagnostic").label}`,
    "- active scoring actions:",
    `  - ${scoringRuleLabel("SHOT_GOAL")}`,
    `  - ${tryTouchdownRuleLabel()}`,
    `  - ${conversionRuleLabel()}`,
    `  - ${dropGoalRuleLabel()}`,
    "- active match point values:",
    "  - SHOT_GOAL remains 3 match points",
    "  - TRY_TOUCHDOWN remains 5 match points",
    "  - CONVERSION_GOAL remains 2 match points",
    "  - DROP_GOAL remains 2 match points",
    "- inactive scoring actions:",
    `  - ${scoringActionLabel("PENALTY_SHOT")}`,
    `- final score: CONTROL ${summary.finalScoreReported.CONTROL} - ${summary.finalScoreReported.BLITZ} BLITZ`,
    `- scoring event count: ${summary.scoringEventCount}`,
    `- active scoring event count: ${summary.activeScoringEventCount}`,
    `- active live scoring events: ${summary.activeScoringEventCount}`,
    `- DROP_GOAL live events: ${summary.dropGoalEvents}`,
    `- non-scoring tactical event count: ${summary.nonScoringEvents.length}`,
    `- recommendation: ${summary.recommendation}`,
    "",
    "## Live Scoring Event Stream",
    "",
    "| event id | sequence/action | team | actor | event family | source outcome | scoring action | point value | score before | score after | active | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...summary.activeEvents.map(
      (event) =>
        `| ${event.id} | ${event.sequenceId ?? event.sourceActionId} | ${event.teamId} | ${event.actorId ?? "none"} | ${event.eventFamily} | ${event.sourceOutcome} | ${event.scoringAction} | +${event.pointValue} | ${scoreDisplay(event.scoreBefore)} | ${scoreDisplay(event.scoreAfter)} | YES | ${event.reason} |`,
    ),
    "",
    "## Non-Scoring Live Tactical Events",
    "",
    "| sequence/action | team | event family | outcome | active scoring event | point value | reason |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...summary.nonScoringEvents.map(
      (event) =>
        `| ${event.sequenceId ?? event.sourceActionId} | ${event.teamId} | ${event.eventFamily} | ${event.sourceOutcome} | NO | 0 | ${event.reason} |`,
    ),
    "",
    "## Batch Scoring Diagnostics",
    `- batch try attempts: ${input.batchTryAttempts}`,
    `- batch tries scored: ${input.batchTriesScored}`,
    `- batch conversion attempts: ${input.batchConversionAttempts}`,
    `- batch conversions made: ${input.batchConversionsMade}`,
    `- batch conversion points: ${input.batchConversionPoints}`,
    `- batch drop opportunities: ${input.batchDropOpportunities ?? 0}`,
    `- batch drop candidates generated: ${input.batchDropCandidatesGenerated ?? 0}`,
    `- batch drop attempts: ${input.batchDropAttempts ?? 0}`,
    `- batch drop goals: ${input.batchDropGoals ?? 0}`,
    `- batch drop missed: ${input.batchDropMissed ?? 0}`,
    `- batch drop blocked: ${input.batchDropBlocked ?? 0}`,
    `- batch drop invalid: ${input.batchDropInvalid ?? 0}`,
    `- batch drop success rate: ${input.batchDropSuccessRate ?? 0}%`,
    `- batch drop points: ${input.batchDropPoints ?? 0}`,
    "- batch scoring note: batch diagnostics remain separate from live score and do not affect current mini-match score.",
    "- batch drop scoring note: batch drop diagnostics do not affect current mini-match score.",
    "",
    "## Scoring Choice Balance Snapshot",
    `- shot points: ${input.scoringChoiceBalance?.shotPoints ?? 0}`,
    `- try points: ${input.scoringChoiceBalance?.tryPoints ?? 0}`,
    `- conversion points: ${input.scoringChoiceBalance?.conversionPoints ?? 0}`,
    `- drop points: ${input.scoringChoiceBalance?.dropPoints ?? 0}`,
    `- shot/try/drop balance recommendation: ${input.scoringChoiceBalance?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- route warnings: ${[
      ...(input.scoringChoiceBalance?.routeDominanceWarnings ?? []),
      ...(input.scoringChoiceBalance?.routeStarvationWarnings ?? []),
      ...(input.scoringChoiceBalance?.routeIdentityWarnings ?? []),
    ].join(", ") || "none"}`,
    `- batch/live separation status: ${summary.batchLiveContaminationCount === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Shot Dominance Diagnostic Snapshot",
    `- SHOT_GOAL points share: ${input.shotDominanceDiagnostic?.shotPointsShare ?? 0}%`,
    `- dominant cause: ${input.shotDominanceDiagnostic?.routeDominanceCause ?? "NEEDS_MORE_SAMPLE"}`,
    `- recommendation: ${input.shotDominanceDiagnostic?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    "- shot dominance root-cause analysis: active",
    "- root-cause scope: shape vs decision vs resolution; scoring values unchanged.",
    "- non-shot candidate ranking calibration: active",
    "- ranking scope: try/drop/carry/switch/progression candidate competition; scoring values and live ScoringEvents unchanged.",
    "- candidate tie-breaking: active",
    "- tie-breaking scope: equal and near-equal calibrated candidate scores explain selection without changing scoring values or live ScoringEvents.",
    "- route balance monitoring: active",
    `- route balance selected mix: SHOT ${input.routeBalancePostRankingMonitoring?.selectedShotActions ?? 0}, TRY ${input.routeBalancePostRankingMonitoring?.selectedTryAttempts ?? 0}, DROP ${input.routeBalancePostRankingMonitoring?.selectedDropAttempts ?? 0}, continuation ${input.routeBalancePostRankingMonitoring?.selectedAdvanceContinuationActions ?? 0}, safe continuity ${input.routeBalancePostRankingMonitoring?.selectedSafeContinuityActions ?? 0}`,
    `- route balance recommendation: ${input.routeBalancePostRankingMonitoring?.recommendation ?? "MONITOR_ROUTE_BALANCE"}`,
    "- route balance scope: post-ranking batch diagnostics only; live score remains from active ScoringEvents.",
    "- route success calibration: active",
    `- route success snapshot: SHOT ${input.routeSuccessRateCalibration?.shotSuccessRate ?? 0}%, TRY ${input.routeSuccessRateCalibration?.trySuccessRate ?? 0}%, DROP ${input.routeSuccessRateCalibration?.dropSuccessRate ?? 0}%, CONVERSION ${input.routeSuccessRateCalibration?.conversionSuccessRate ?? 0}%`,
    `- route success recommendation: ${input.routeSuccessRateCalibration?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_SUCCESS_CALIBRATION"}`,
    "- route success scope: batch diagnostics only; scoring values and live ScoringEvents unchanged.",
    "- goalkeeper shot-stopping impact calibration: active",
    `- goalkeeper calibration snapshot: projected SHOT ${input.goalkeeperShotStoppingImpactCalibration?.projectedShotSuccessRateAfterGkCalibration ?? 0}%, projected CLEAN_SHOT ${input.goalkeeperShotStoppingImpactCalibration?.projectedCleanShotSuccessRateAfterGkCalibration ?? 0}%, failed saves ${input.goalkeeperShotStoppingImpactCalibration?.failedSaveCount ?? 0}, GK underweighted goals ${input.goalkeeperShotStoppingImpactCalibration?.gkUnderweightedGoalCount ?? 0}`,
    `- goalkeeper calibration recommendation: ${input.goalkeeperShotStoppingImpactCalibration?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_GK_CALIBRATION"}`,
    "- goalkeeper calibration scope: batch diagnostic projection only; scoring values and live ScoringEvents unchanged.",
    "- clean shot success calibration: active",
    `- clean shot success snapshot: CLEAN_SHOT ${input.cleanShotSuccessCalibration?.cleanShotSuccessRate ?? 0}%, overall SHOT ${input.cleanShotSuccessCalibration?.overallShotSuccessRate ?? 0}%, FORCED_SHOT ${input.cleanShotSuccessCalibration?.forcedShotSuccessRate ?? 0}%, threshold-edge clean goals reduced ${input.cleanShotSuccessCalibration?.thresholdEdgeCleanGoalsReduced ?? 0}`,
    `- clean shot success recommendation: ${input.cleanShotSuccessCalibration?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_ROUTE_RESOLUTION_CALIBRATION"}`,
    "- clean shot success scope: batch clean-window resolution diagnostics only; scoring values and live ScoringEvents unchanged.",
    "- post-resolution route economy monitoring: active",
    `- route economy snapshot: average total points ${input.postResolutionRouteEconomyMonitoring?.scorelineHealth.averageTotalPoints ?? 0}, 0-0 draw rate ${input.postResolutionRouteEconomyMonitoring?.scorelineHealth.nilNilDrawRate ?? 0}%, scoring draw rate ${input.postResolutionRouteEconomyMonitoring?.scorelineHealth.scoringDrawRate ?? 0}%, risks ${input.postResolutionRouteEconomyMonitoring?.metaRisks.join(", ") || "none"}`,
    `- route economy recommendation: ${input.postResolutionRouteEconomyMonitoring?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_ROUTE_ECONOMY_MONITORING"}`,
    "- route economy scope: batch monitoring only; scoring values and live ScoringEvents unchanged.",
    "- danger phase conversion economy: active",
    `- danger phase economy snapshot: sterile danger phases ${input.dangerPhaseConversionEconomy?.sterileDangerPhaseCount ?? 0}, danger-to-score conversion ${input.dangerPhaseConversionEconomy?.dangerToScoreConversionRate ?? 0}%, 0-0 draw rate ${input.dangerPhaseConversionEconomy?.nilNilDrawRate ?? 0}%, risks ${input.dangerPhaseConversionEconomy?.metaRisks.join(", ") || "none"}`,
    `- danger phase economy recommendation: ${input.dangerPhaseConversionEconomy?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_DANGER_PHASE_ECONOMY"}`,
    "- danger phase economy scope: batch monitoring only; scoring values and live ScoringEvents unchanged.",
    "- continuation payoff calibration: active",
    `- continuation payoff snapshot: projected sterile danger rate ${input.continuationPayoffCalibration?.projectedSterileDangerRate ?? 0}%, SUPPORT_CLUSTER_RECYCLE payoff ${input.continuationPayoffCalibration?.supportClusterRecyclePayoffRate ?? 0}%, FORWARD_PROGRESS payoff ${input.continuationPayoffCalibration?.forwardProgressPayoffRate ?? 0}%`,
    `- continuation payoff recommendation: ${input.continuationPayoffCalibration?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_CONTINUATION_PAYOFF"}`,
    "- continuation payoff scope: batch monitoring only; future route quality changes do not add live scoring events.",
    "- match duration possession volume calibration: active",
    `- match volume snapshot: interpretation ${input.matchDurationPossessionVolumeCalibration?.matchLengthInterpretation ?? "MINI_MATCH_SAMPLE"}, calibrated possessions ${input.matchDurationPossessionVolumeCalibration?.possessionVolume.calibratedOffensivePossessionsPerMatch ?? 0}, calibrated danger phases ${input.matchDurationPossessionVolumeCalibration?.dangerPhaseVolume.calibratedDangerPhasesPerMatch ?? 0}, projected 0-0 ${input.matchDurationPossessionVolumeCalibration?.scorelineHealth.nilNilDrawRate ?? 0}%`,
    `- match volume recommendation: ${input.matchDurationPossessionVolumeCalibration?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_MATCH_VOLUME_CALIBRATION"}`,
    "- match volume scope: batch projection only; no forced live scoring events.",
    "- full-match economy validation: active",
    `- full-match economy snapshot: observed 0-0 ${input.fullMatchEconomyValidation?.scorelineHealth.nilNilDrawRate ?? 0}%, average points ${input.fullMatchEconomyValidation?.scorelineHealth.averageTotalPoints ?? 0}, unique final scores ${input.fullMatchEconomyValidation?.scorelineHealth.uniqueFinalScores ?? 0}, risks ${input.fullMatchEconomyValidation?.metaRisks.join(", ") || "none"}`,
    `- full-match economy recommendation: ${input.fullMatchEconomyValidation?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_TRY_ATTRITION_CALIBRATION"}`,
    "- shot/rebound/half-space guardrail: clean angled windows remain calibrated locally; forced/narrow/desperate half-space shots remain difficult.",
    "- full-match economy scope: batch validation only; live score remains from active ScoringEvents.",
    "- bonus readiness audit: MATCH_BONUS_EVENT_IMPLEMENTED_FOR_LEAGUE_TABLE.",
    "- bonus source-of-truth guardrail: bonuses use separate MatchBonusEvent records and league-table points only, not live ScoringEvents.",
    "- league points bonus implementation: WIN 4 / DRAW 2 / LOSS 0 / FORFEIT -1 base points plus post-final-whistle MatchBonusEvents.",
    "- bonus rule refinement applied: 3+ tries and conversion-excluded three-main-family bonus are implemented in MatchBonusEvent V1.",
    "- MatchBonusEvent is not part of this live ScoringEvent stream.",
    "- bonus points do not alter match score.",
    `- league table integration: ${input.fullMatchEconomyValidation?.leagueTableIntegration.matchPointsEqualTablePoints === "YES" ? "generated from LeaguePointsSummary" : "not available in this scoring summary input"}.`,
    `- fatigue bonus correlation instrumentation: ${input.fullMatchEconomyValidation?.leagueTableIntegration.fatigueInstrumentationAvailable === "YES" ? "AVAILABLE_WITH_REAL_VALUES" : "NOT_AVAILABLE"}.`,
    "- fatigue/load/roster schemas: PlayerFatigueTimelineRow / TeamFatigueTimelineRow / TeamMatchFatigueSummary / PlayerMatchLoadSummary / TeamLoadSummary / LateMatchPerformanceSummary / RosterQualitySummary remain outside live ScoringEvents.",
    "- roster stress test guardrail: weak-build variants are diagnostics only and never create active ScoringEvents or live match points.",
    "- player load balancing guardrail: load tuning diagnostics never create ScoringEvents, alter live score, change scoring values, or replace production rosters.",
    "- role economy guardrail: role taxonomy, role documentation, and role-value diagnostics never create ScoringEvents, alter live score, change scoring values, or make non-GK roles universally mandatory.",
    "- fatigue effect calibration: CONFIRMED_CONSERVATIVE_V1; fatigue audits influence interpretation and regression monitoring, not live ScoringEvent totals.",
    "- try attrition calibration: active",
    `- try attrition snapshot: TRY ${input.tryGroundingPressureCalibration?.trySuccessRate ?? 0}%, contested TRY ${input.tryGroundingPressureCalibration?.contestedTrySuccessRate ?? 0}%, LOST_FORWARD ${input.tryGroundingPressureCalibration?.lostForwardCount ?? 0}, HELD_UP ${input.tryGroundingPressureCalibration?.heldUpCount ?? 0}, TACKLED_SHORT ${input.tryGroundingPressureCalibration?.tackledShortCount ?? 0}`,
    `- try attrition recommendation: ${input.tryGroundingPressureCalibration?.recommendations.join(", ") ?? "ONLY_REBALANCE_SCORING_AFTER_TRY_ATTRITION_CALIBRATION"}`,
    "- try attrition scope: batch route-resolution diagnostics only; scoring values and live ScoringEvents unchanged.",
    "- batch/live separation status: batch diagnostics remain separate from live score",
    "- canonical diagnostic report: shot-dominance-diagnostic.md",
    "",
    "## Scoring Affordance Volume Snapshot",
    `- known scoring affordances excluding conversion: ${input.scoringAffordanceVolume?.totalKnownScoringAffordances ?? 0}`,
    `- known scoring affordances per match: ${input.scoringAffordanceVolume?.knownScoringAffordancesPerMatch ?? 0}`,
    `- known scoring affordances per team per match: ${input.scoringAffordanceVolume?.knownScoringAffordancesPerTeamPerMatch ?? 0}`,
    `- non-shot affordance share: ${input.scoringAffordanceVolume?.nonShotAffordanceShare ?? 0}%`,
    `- affordance volume recommendation: ${input.scoringAffordanceVolume?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    "- batch/live separation status: batch diagnostics remain separate from live score",
    "",
    "## Offensive Possession / Danger Phase Snapshot",
    `- offensive possessions per match: ${input.possessionDangerPhase?.offensivePossessionsPerMatch ?? 0}`,
    `- danger phases per match: ${input.possessionDangerPhase?.dangerPhasesPerMatch ?? 0}`,
    `- danger phase to scoring affordance rate: ${input.possessionDangerPhase?.dangerPhaseToScoringAffordanceRate ?? 0}%`,
    `- danger phase instrumentation recommendation: ${input.possessionDangerPhase?.recommendation ?? "NEEDS_MORE_SAMPLE"}`,
    "- batch/live separation status: batch diagnostics remain separate from live score",
    "",
    "## Danger Phase Non-Shot Affordance Snapshot",
    `- TRY_TOUCHDOWN affordances: ${input.scoringAffordanceVolume?.tryAffordances ?? 0}`,
    `- DROP_GOAL affordances: ${input.scoringAffordanceVolume?.dropAffordances ?? 0}`,
    `- non-shot setup affordances: ${input.scoringAffordanceVolume?.nonShotSetupAffordances ?? 0}`,
    `- non-shot affordance share: ${input.scoringAffordanceVolume?.nonShotAffordanceShare ?? 0}%`,
    `- recommendation: ${input.scoringAffordanceVolume?.nonShotAffordanceGenerationRecommendation ?? "NEEDS_MORE_SAMPLE"}`,
    "- batch/live separation status: batch diagnostics remain separate from live score",
    "",
    "## Non-Shot Resolution Rebalance Snapshot",
    `- conversion attempts: ${input.nonShotResolutionRebalance?.conversionAttempts ?? input.batchConversionAttempts}`,
    `- conversions made: ${input.nonShotResolutionRebalance?.conversionsMade ?? input.batchConversionsMade}`,
    `- conversion success rate: ${input.nonShotResolutionRebalance?.conversionSuccessRate ?? 0}%`,
    `- conversion recommendation: ${input.nonShotResolutionRebalance?.conversionRecommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- drop attempts: ${input.nonShotResolutionRebalance?.dropAttempts ?? input.batchDropAttempts ?? 0}`,
    `- drop goals: ${input.nonShotResolutionRebalance?.dropGoals ?? input.batchDropGoals ?? 0}`,
    `- drop success rate: ${input.nonShotResolutionRebalance?.dropSuccessRate ?? input.batchDropSuccessRate ?? 0}%`,
    `- drop recommendation: ${input.nonShotResolutionRebalance?.dropRecommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- try attempts: ${input.nonShotResolutionRebalance?.tryAttempts ?? input.batchTryAttempts}`,
    `- tries scored: ${input.nonShotResolutionRebalance?.triesScored ?? input.batchTriesScored}`,
    `- try scoring rate: ${input.nonShotResolutionRebalance?.tryScoringRate ?? 0}%`,
    `- try recommendation: ${input.nonShotResolutionRebalance?.tryRecommendation ?? "NEEDS_MORE_SAMPLE"}`,
    `- batch/live separation status: ${summary.batchLiveContaminationCount === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Team Shape Intent Calibration Note",
    "- team shape intent calibration does not change scoring events.",
    "- team shape intent generalization does not change scoring events.",
    "- live score remains from active ScoringEvents.",
    "- batch/live separation preserved.",
    "",
    "## Score Consistency Checks",
    `- final score from event stream: ${summary.finalScoreDisplay}`,
    `- final score reported: CONTROL ${summary.finalScoreReported.CONTROL} - ${summary.finalScoreReported.BLITZ} BLITZ`,
    `- mismatch count: ${summary.finalScoreMismatchCount}`,
    `- batch/live contamination count: ${summary.batchLiveContaminationCount}`,
    `- inactive scoring leakage count: ${summary.inactiveScoringLeakageCount}`,
    "",
  ].join("\n");
}

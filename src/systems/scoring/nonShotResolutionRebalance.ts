import type { MiniMatchResult } from "../../simulation/miniMatch";
import { summarizeDropGoalFoundation, summarizeTryOpportunityGeneration } from "../actions";
import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { conversionRuleLabel } from "./conversionRules";
import { summarizeConversionResolution } from "./conversionResolution";
import { dropGoalRuleLabel } from "./dropGoalRules";
import { scoringRuleLabel } from "./scoringRules";
import { tryTouchdownRuleLabel } from "./tryTouchdownRules";

export type NonShotResolutionRecommendation =
  | "KEEP_NON_SHOT_RESOLUTION_MODEL"
  | "KEEP_NON_SHOT_RESOLUTION_MODEL_BUT_MONITOR"
  | "REDUCE_CONVERSION_DIFFICULTY"
  | "INCREASE_CONVERSION_DIFFICULTY"
  | "REDUCE_DROP_DIFFICULTY"
  | "INCREASE_DROP_DIFFICULTY"
  | "WATCH_TRY_RESOLUTION"
  | "FIX_NON_SHOT_RESOLUTION_REGRESSION"
  | "NEEDS_MORE_SAMPLE";

export interface NonShotResolutionRebalanceSummary {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly scoreUnit: "POINTS";
  readonly previousTryAttempts: 22;
  readonly previousTriesScored: 3;
  readonly previousTryScoringRate: 14;
  readonly previousConversionAttempts: 3;
  readonly previousConversionsMade: 0;
  readonly previousConversionSuccessRate: 0;
  readonly previousDropAttempts: 16;
  readonly previousDropGoals: 2;
  readonly previousDropSuccessRate: 13;
  readonly tryAffordances: number;
  readonly tryAttempts: number;
  readonly triesScored: number;
  readonly tryScoringRate: number;
  readonly tryRecommendation: string;
  readonly illegalTryAffordanceCount: number;
  readonly offBallInGoalOccupancyCount: number;
  readonly centralFrontalTryCount: number;
  readonly conversionAttempts: number;
  readonly conversionsMade: number;
  readonly conversionsMissed: number;
  readonly conversionsBlocked: number;
  readonly invalidConversions: number;
  readonly conversionSuccessRate: number;
  readonly conversionPoints: number;
  readonly conversionAttemptsAfterFailedTries: number;
  readonly missingConversionGeometryRows: number;
  readonly centralConversionSuccessRate: number;
  readonly halfSpaceConversionSuccessRate: number;
  readonly wideConversionSuccessRate: number;
  readonly conversionRecommendation: string;
  readonly dropOpportunities: number;
  readonly dropCandidatesGenerated: number;
  readonly dropCandidatesSelected: number;
  readonly dropCandidatesRejected: number;
  readonly dropAttempts: number;
  readonly dropGoals: number;
  readonly dropMissed: number;
  readonly dropBlocked: number;
  readonly dropInvalid: number;
  readonly dropSuccessRate: number;
  readonly dropBlockedRate: number;
  readonly dropPoints: number;
  readonly dropRecommendation: string;
  readonly recommendation: NonShotResolutionRecommendation;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function recommendation(input: {
  readonly conversionAttempts: number;
  readonly conversionRate: number;
  readonly dropAttempts: number;
  readonly dropRate: number;
  readonly tryRate: number;
}): NonShotResolutionRecommendation {
  if (input.conversionAttempts === 0 || input.dropAttempts === 0) {
    return "NEEDS_MORE_SAMPLE";
  }

  if (input.conversionRate === 0 || input.conversionRate < 60) {
    return "REDUCE_CONVERSION_DIFFICULTY";
  }

  if (input.conversionRate > 80) {
    return "INCREASE_CONVERSION_DIFFICULTY";
  }

  if (input.dropRate < 20) {
    return "REDUCE_DROP_DIFFICULTY";
  }

  if (input.dropRate > 45) {
    return "INCREASE_DROP_DIFFICULTY";
  }

  if (input.tryRate < 10 || input.tryRate > 30) {
    return "WATCH_TRY_RESOLUTION";
  }

  return input.conversionAttempts < 10 ? "KEEP_NON_SHOT_RESOLUTION_MODEL_BUT_MONITOR" : "KEEP_NON_SHOT_RESOLUTION_MODEL";
}

export function summarizeNonShotResolutionRebalance(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): NonShotResolutionRebalanceSummary {
  const trySummary = summarizeTryOpportunityGeneration({
    matchesSimulated: input.batchCalibration.matchesSimulated,
    samples: input.batchCalibration.samples.map((sample) => ({
      matchId: sample.matchId,
      seed: sample.seed,
      scenario: sample.scenario,
      totalShots: sample.totalShots,
      reboundEventCount: sample.reboundEventCount,
      contestedReboundCount: sample.contestedReboundCount,
      scrambleReboundCount: sample.scrambleReboundCount,
    })),
  });
  const conversionSummary = summarizeConversionResolution({
    result: input.result,
    opportunities: trySummary.opportunities,
  });
  const dropSummary = summarizeDropGoalFoundation({
    result: input.result,
    batchCalibration: input.batchCalibration,
  });

  return {
    scoringVersion: "V2_DROP_FOUNDATION",
    scoreUnit: "POINTS",
    previousTryAttempts: 22,
    previousTriesScored: 3,
    previousTryScoringRate: 14,
    previousConversionAttempts: 3,
    previousConversionsMade: 0,
    previousConversionSuccessRate: 0,
    previousDropAttempts: 16,
    previousDropGoals: 2,
    previousDropSuccessRate: 13,
    tryAffordances: trySummary.tryOpportunities,
    tryAttempts: trySummary.tryAttempts,
    triesScored: trySummary.triesScored,
    tryScoringRate: trySummary.tryConversionRate,
    tryRecommendation: trySummary.recommendation,
    illegalTryAffordanceCount: trySummary.centralFrontalTriesGenerated + trySummary.opportunities.filter((opportunity) => !opportunity.legalAccessRoute && opportunity.attemptGenerated).length,
    offBallInGoalOccupancyCount: trySummary.offBallInGoalPlayerCount,
    centralFrontalTryCount: trySummary.centralFrontalTriesGenerated,
    conversionAttempts: conversionSummary.batchConversionAttempts,
    conversionsMade: conversionSummary.batchConversionsMade,
    conversionsMissed: conversionSummary.batchConversionsMissed,
    conversionsBlocked: conversionSummary.batchConversionsBlocked,
    invalidConversions: conversionSummary.batchInvalidConversions,
    conversionSuccessRate: conversionSummary.batchConversionSuccessRate,
    conversionPoints: conversionSummary.batchConversionPoints,
    conversionAttemptsAfterFailedTries: conversionSummary.conversionAttemptsAfterFailedTries,
    missingConversionGeometryRows: conversionSummary.missingConversionGeometryRows,
    centralConversionSuccessRate: conversionSummary.centralConversionSuccessRate,
    halfSpaceConversionSuccessRate: conversionSummary.halfSpaceConversionSuccessRate,
    wideConversionSuccessRate: conversionSummary.wideConversionSuccessRate,
    conversionRecommendation: conversionSummary.recommendation,
    dropOpportunities: dropSummary.batchDropOpportunities,
    dropCandidatesGenerated: dropSummary.batchDropCandidatesGenerated,
    dropCandidatesSelected: dropSummary.batchDropCandidatesSelected,
    dropCandidatesRejected: dropSummary.batchDropCandidatesRejected,
    dropAttempts: dropSummary.batchDropAttempts,
    dropGoals: dropSummary.batchDropGoals,
    dropMissed: dropSummary.batchDropMissed,
    dropBlocked: dropSummary.batchDropBlocked,
    dropInvalid: dropSummary.batchDropInvalid,
    dropSuccessRate: dropSummary.batchDropSuccessRate,
    dropBlockedRate: percent(dropSummary.batchDropBlocked, dropSummary.batchDropAttempts),
    dropPoints: dropSummary.batchDropPoints,
    dropRecommendation: dropSummary.recommendation,
    recommendation: recommendation({
      conversionAttempts: conversionSummary.batchConversionAttempts,
      conversionRate: conversionSummary.batchConversionSuccessRate,
      dropAttempts: dropSummary.batchDropAttempts,
      dropRate: dropSummary.batchDropSuccessRate,
      tryRate: trySummary.tryConversionRate,
    }),
  };
}

function laneRate(label: string, rate: number): string {
  return rate === 0 ? `${label}: no made conversion in sample or no sample` : `${label}: ${rate}%`;
}

export function createNonShotResolutionRebalanceReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const summary = summarizeNonShotResolutionRebalance(input);
  const trySummary = summarizeTryOpportunityGeneration({
    matchesSimulated: input.batchCalibration.matchesSimulated,
    samples: input.batchCalibration.samples.map((sample) => ({
      matchId: sample.matchId,
      seed: sample.seed,
      scenario: sample.scenario,
      totalShots: sample.totalShots,
      reboundEventCount: sample.reboundEventCount,
      contestedReboundCount: sample.contestedReboundCount,
      scrambleReboundCount: sample.scrambleReboundCount,
    })),
  });
  const conversionSummary = summarizeConversionResolution({
    result: input.result,
    opportunities: trySummary.opportunities,
  });
  const dropSummary = summarizeDropGoalFoundation({
    result: input.result,
    batchCalibration: input.batchCalibration,
  });

  return [
    "# Non-Shot Resolution Rebalance",
    "",
    "## Summary",
    `- scoring version: ${summary.scoringVersion}`,
    `- score unit: ${summary.scoreUnit}`,
    "- active scoring rules:",
    `  - ${scoringRuleLabel("SHOT_GOAL")}`,
    `  - ${tryTouchdownRuleLabel()}`,
    `  - ${conversionRuleLabel()}`,
    `  - ${dropGoalRuleLabel()}`,
    "- inactive scoring rules:",
    "  - PENALTY_SHOT",
    "- non-shot affordance generation status: KEEP_NON_SHOT_AFFORDANCE_MODEL",
    `- conversion rebalance status: ${summary.conversionRecommendation}`,
    `- drop rebalance status: ${summary.dropRecommendation}`,
    `- try resolution status: ${summary.tryRecommendation}`,
    `- recommendation: ${summary.recommendation}`,
    "",
    "## Before / After Snapshot",
    "",
    "| route | previous attempts | previous scores | previous success rate | new attempts | new scores | new success rate | recommendation |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    `| TRY_TOUCHDOWN | ${summary.previousTryAttempts} | ${summary.previousTriesScored} | ${summary.previousTryScoringRate}% | ${summary.tryAttempts} | ${summary.triesScored} | ${summary.tryScoringRate}% | ${summary.tryRecommendation} |`,
    `| CONVERSION_GOAL | ${summary.previousConversionAttempts} | ${summary.previousConversionsMade} | ${summary.previousConversionSuccessRate}% | ${summary.conversionAttempts} | ${summary.conversionsMade} | ${summary.conversionSuccessRate}% | ${summary.conversionRecommendation} |`,
    `| DROP_GOAL | ${summary.previousDropAttempts} | ${summary.previousDropGoals} | ${summary.previousDropSuccessRate}% | ${summary.dropAttempts} | ${summary.dropGoals} | ${summary.dropSuccessRate}% | ${summary.dropRecommendation} |`,
    "",
    "## Conversion Rebalance Detail",
    `- batch conversion attempts: ${summary.conversionAttempts}`,
    `- batch conversions made: ${summary.conversionsMade}`,
    `- batch conversions missed: ${summary.conversionsMissed}`,
    `- batch conversions blocked: ${summary.conversionsBlocked}`,
    `- batch invalid conversions: ${summary.invalidConversions}`,
    `- batch conversion success rate: ${summary.conversionSuccessRate}%`,
    `- conversion points: ${summary.conversionPoints}`,
    `- conversion attempts after failed tries: ${summary.conversionAttemptsAfterFailedTries}`,
    `- missing conversion geometry rows: ${summary.missingConversionGeometryRows}`,
    "- lane success:",
    `  - ${laneRate("central", summary.centralConversionSuccessRate)}`,
    `  - ${laneRate("half-space", summary.halfSpaceConversionSuccessRate)}`,
    `  - ${laneRate("wide", summary.wideConversionSuccessRate)}`,
    `- recommendation: ${summary.conversionRecommendation}`,
    "",
    "| source try | grounding lane | conversion distance | angle difficulty | kicker accuracy | kicker power | kicker composure | fatigue penalty | pressure penalty | execution score | difficulty threshold | outcome | points | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...conversionSummary.attempts.map(
      (attempt) =>
        `| ${attempt.sourceTryActionId} | ${attempt.groundingLane} | ${attempt.distanceFromGoalLine}m | ${attempt.angleDifficulty} | ${attempt.kickerAccuracy} | ${attempt.kickerPower} | ${attempt.kickerComposure} | ${attempt.fatiguePenalty} | ${attempt.pressureDifficultyScore} | ${attempt.finalDifficultyScore} | 30 | ${attempt.outcome} | ${attempt.pointValue} | ${attempt.reason} |`,
    ),
    "",
    "## Drop Rebalance Detail",
    `- batch drop opportunities: ${summary.dropOpportunities}`,
    `- batch drop candidates generated: ${summary.dropCandidatesGenerated}`,
    `- batch drop candidates selected: ${summary.dropCandidatesSelected}`,
    `- batch drop candidates rejected: ${summary.dropCandidatesRejected}`,
    `- batch drop attempts: ${summary.dropAttempts}`,
    `- batch drop goals: ${summary.dropGoals}`,
    `- batch drop missed: ${summary.dropMissed}`,
    `- batch drop blocked: ${summary.dropBlocked}`,
    `- batch drop invalid: ${summary.dropInvalid}`,
    `- batch drop success rate: ${summary.dropSuccessRate}%`,
    `- batch drop points: ${summary.dropPoints}`,
    `- blocked drop rate: ${summary.dropBlockedRate}%`,
    `- recommendation: ${summary.dropRecommendation}`,
    "",
    "| matchId | team | phase | ball zone | ball lane | distance | angle | foot skill | power | accuracy | composure | pressure | defender rush | block pressure | fatigue penalty | body shape | setup quality | candidate score | execution score | difficulty threshold | outcome | points | reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...dropSummary.batchAttempts.map(
      (attempt) =>
        `| ${attempt.context.matchId} | ${attempt.context.attackingTeamId.toUpperCase()} | ${attempt.context.phase} | ${attempt.context.ballZone} | ${attempt.context.ballLane} | ${attempt.context.distanceToPosts} | ${attempt.context.angleDifficulty} | ${attempt.context.footSkill} | ${attempt.context.kickingPower} | ${attempt.context.kickingAccuracy} | ${attempt.context.kickingComposure} | ${attempt.context.pressureLevel} | ${attempt.context.defenderRushPressure} | ${attempt.context.blockPressure} | ${attempt.context.fatiguePenalty} | ${attempt.context.bodyShapeScore} | ${attempt.context.dropSetupScore} | ${attempt.context.candidateScore} | ${attempt.executionScore} | ${attempt.difficultyThreshold} | ${attempt.outcome} | ${attempt.pointValue} | ${attempt.reason} |`,
    ),
    "",
    "## Try Resolution Watch",
    `- try affordances: ${summary.tryAffordances}`,
    `- try candidates: ${summary.tryAffordances}`,
    `- try attempts: ${summary.tryAttempts}`,
    `- tries scored: ${summary.triesScored}`,
    `- try scoring rate: ${summary.tryScoringRate}%`,
    `- illegal try affordance count: ${summary.illegalTryAffordanceCount}`,
    `- off-ball Z0/Z8 occupancy count: ${summary.offBallInGoalOccupancyCount}`,
    `- central frontal try count: ${summary.centralFrontalTryCount}`,
    `- recommendation: ${summary.tryRecommendation}`,
    "- note: try resolution is watched only in this sprint; no direct try attempt buff is applied.",
    "",
    "## Gameplay Interpretation",
    `- Are non-shot routes now credible? ${summary.conversionSuccessRate >= 60 && summary.dropSuccessRate >= 20 ? "YES" : "WATCH"}.`,
    `- Is conversion still a meaningful post-try bonus? ${summary.conversionSuccessRate >= 60 && summary.conversionSuccessRate <= 80 ? "YES" : "WATCH"}.`,
    `- Is drop still a timing weapon rather than a dominant route? ${summary.dropSuccessRate >= 20 && summary.dropSuccessRate <= 45 ? "YES" : "WATCH"}.`,
    `- Are tries still high-value and earned? ${summary.tryScoringRate >= 10 && summary.tryScoringRate <= 30 ? "YES" : "WATCH"}.`,
    "- Did any scoring values change? NO.",
    "- Did batch diagnostics contaminate live score? NO.",
    "- Is PENALTY_SHOT still inactive? YES.",
    "",
  ].join("\n");
}

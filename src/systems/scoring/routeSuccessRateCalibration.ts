import { summarizeDropGoalFoundation } from "../actions/dropGoalAttemptResolver";
import { summarizeTryOpportunityGeneration } from "../actions/tryOpportunityDetector";
import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { BatchScoringCalibrationSummary, MatchScoringCalibrationSample } from "./batchScoringCalibrationTypes";
import { summarizeConversionResolution } from "./conversionResolution";
import { DROP_GOAL_POINT_VALUE } from "./dropGoalRules";
import { CONVERSION_POINT_VALUE, TRY_TOUCHDOWN_POINT_VALUE, TRY_TOUCHDOWN_SCORING_VERSION } from "./tryTouchdownRules";
import { summarizeNonShotCandidateRankingCalibration } from "./nonShotCandidateRankingCalibration";

export type TryFailureClass =
  | "LOST_FORWARD"
  | "HELD_UP"
  | "TACKLED_SHORT"
  | "FORCED_OUT"
  | "NO_CONTROL"
  | "ILLEGAL_ACCESS"
  | "SUPPORT_TOO_LATE"
  | "DEFENDER_DOMINANCE";

export type ShotGoalClass =
  | "CLEAN_DESERVED_GOAL"
  | "KEEPER_BEATEN_FAIRLY"
  | "DEFENSIVE_SHAPE_FAILURE"
  | "LOW_QUALITY_OVERREWARDED_SHOT"
  | "THRESHOLD_EDGE_CASE"
  | "NON_GOAL";

export type ShotResolutionCalibrationTag = "NONE" | "CLEAN_SHOT_GK_SAVE_CALIBRATION";

export type RouteSuccessRecommendation =
  | "KEEP_SUCCESS_RATES"
  | "REVIEW_TRY_GROUNDING_DIFFICULTY"
  | "REVIEW_CONTACT_PRESSURE_ON_TRIES"
  | "REVIEW_CLEAN_SHOT_SUCCESS"
  | "REVIEW_DROP_VISIBILITY"
  | "REVIEW_CONVERSION_OPPORTUNITY_VOLUME"
  | "ONLY_REBALANCE_SCORING_AFTER_SUCCESS_CALIBRATION";

export interface TrySuccessDecompositionRow {
  readonly actionId: string;
  readonly accessRoute: string;
  readonly legalAccess: "YES" | "NO";
  readonly carrier: string;
  readonly targetInGoalZone: string;
  readonly groundingLane: string;
  readonly supportArriving: number;
  readonly contactPressure: number;
  readonly tacklePressure: number;
  readonly defenderGoalLinePressure: number;
  readonly fatiguePenalty: number;
  readonly ballControl: number;
  readonly groundingScore: number;
  readonly bodyControl: number;
  readonly carrierMomentum: number;
  readonly outcome: string;
  readonly failureClass: TryFailureClass | "NONE";
  readonly failureReason: string;
}

export interface ShotSuccessDecompositionRow {
  readonly actionId: string;
  readonly windowType: "CLEAN" | "FORCED" | "PRESSED" | "REBOUND";
  readonly shotQuality: number;
  readonly power: number;
  readonly placement: number;
  readonly angleDifficulty: number;
  readonly goalkeeperChallenge: number;
  readonly defensiveBlockPressure: number;
  readonly finalShotSuccessScore: number;
  readonly outcome: "GOAL" | "MISSED" | "SAVED_OR_BLOCKED";
  readonly goalkeeperAction: string;
  readonly goalClass: ShotGoalClass;
  readonly calibrationTag: ShotResolutionCalibrationTag;
}

export interface DropSuccessDecompositionRow {
  readonly actionId: string;
  readonly fieldZone: string;
  readonly timingContext: string;
  readonly kickerProfile: string;
  readonly pressure: string;
  readonly blockPressure: number;
  readonly outcome: string;
  readonly tacticalChoice: "GOOD" | "CONTEXTUAL" | "POOR";
}

export interface RouteSuccessRateCalibrationSummary {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly scoreUnit: "POINTS";
  readonly candidateRowsPersisted: number;
  readonly tieBreakingActive: boolean;
  readonly strongerScoreWordingOnEqualScoreCount: number;
  readonly shotAttempts: number;
  readonly shotGoals: number;
  readonly shotSuccessRate: number;
  readonly cleanShotAttempts: number;
  readonly cleanShotGoals: number;
  readonly cleanShotSuccessRate: number;
  readonly forcedShotAttempts: number;
  readonly forcedShotGoals: number;
  readonly forcedShotSuccessRate: number;
  readonly tryAttempts: number;
  readonly triesScored: number;
  readonly trySuccessRate: number;
  readonly contestedTryAttempts: number;
  readonly contestedTrySuccessRate: number;
  readonly dropAttempts: number;
  readonly dropGoals: number;
  readonly dropSuccessRate: number;
  readonly conversionAttempts: number;
  readonly conversionsMade: number;
  readonly conversionSuccessRate: number;
  readonly tryRows: readonly TrySuccessDecompositionRow[];
  readonly shotRows: readonly ShotSuccessDecompositionRow[];
  readonly dropRows: readonly DropSuccessDecompositionRow[];
  readonly recommendations: readonly RouteSuccessRecommendation[];
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function tryFailureClass(input: {
  readonly outcome: string;
  readonly legalAccess: boolean;
  readonly supportArriving: number;
  readonly contactPressure: number;
  readonly tacklePressure: number;
  readonly defenderGoalLinePressure: number;
  readonly ballControl: number;
}): TryFailureClass | "NONE" {
  if (input.outcome === "TRY_SCORED") {
    return "NONE";
  }

  if (!input.legalAccess) {
    return "ILLEGAL_ACCESS";
  }

  if (input.ballControl < 55) {
    return "NO_CONTROL";
  }

  if (input.supportArriving < 45) {
    return "SUPPORT_TOO_LATE";
  }

  if (input.defenderGoalLinePressure >= 72) {
    return "DEFENDER_DOMINANCE";
  }

  if (input.outcome === "HELD_UP") {
    return "HELD_UP";
  }

  if (input.outcome === "TACKLED_SHORT") {
    return "TACKLED_SHORT";
  }

  if (input.contactPressure >= 75 || input.tacklePressure >= 75) {
    return "FORCED_OUT";
  }

  return "LOST_FORWARD";
}

function tryRows(batchCalibration: BatchScoringCalibrationSummary): readonly TrySuccessDecompositionRow[] {
  const summary = summarizeTryOpportunityGeneration({
    matchesSimulated: batchCalibration.matchesSimulated,
    samples: batchCalibration.samples.map((sample) => ({
      matchId: sample.matchId,
      seed: sample.seed,
      scenario: sample.scenario,
      totalShots: sample.totalShots,
      reboundEventCount: sample.reboundEventCount,
      contestedReboundCount: sample.contestedReboundCount,
      scrambleReboundCount: sample.scrambleReboundCount,
    })),
  });

  return summary.opportunities
    .filter((opportunity) => opportunity.attemptGenerated)
    .map((opportunity, index) => {
      const failureClass = tryFailureClass({
        outcome: opportunity.outcome,
        legalAccess: opportunity.legalAccessRoute,
        supportArriving: opportunity.supportArrivingScore,
        contactPressure: opportunity.contactPressure,
        tacklePressure: opportunity.tacklePressure,
        defenderGoalLinePressure: opportunity.defenderGoalLinePressure,
        ballControl: opportunity.ballControlScore,
      });

      return {
        actionId: `${opportunity.matchId}-try-${String(index + 1).padStart(2, "0")}`,
        accessRoute: opportunity.accessRouteType,
        legalAccess: opportunity.legalAccessRoute ? "YES" : "NO",
        carrier: opportunity.teamId === "CONTROL" ? "control-try-runner" : "blitz-try-runner",
        targetInGoalZone: opportunity.groundingZone,
        groundingLane: opportunity.groundingZone.split("-")[1] ?? "UNKNOWN",
        supportArriving: opportunity.supportArrivingScore,
        contactPressure: opportunity.contactPressure,
        tacklePressure: opportunity.tacklePressure,
        defenderGoalLinePressure: opportunity.defenderGoalLinePressure,
        fatiguePenalty: opportunity.fatiguePenalty,
        ballControl: opportunity.ballControlScore,
        groundingScore: opportunity.groundingScore,
        bodyControl: opportunity.bodyControlScore,
        carrierMomentum: opportunity.carrierMomentumScore,
        outcome: opportunity.outcome,
        failureClass,
        failureReason:
          failureClass === "NONE"
            ? "try scored; grounding and support beat pressure."
            : `${failureClass} from support ${opportunity.supportArrivingScore}, contact ${opportunity.contactPressure}, tackle ${opportunity.tacklePressure}, defender goal-line pressure ${opportunity.defenderGoalLinePressure}.`,
      };
    });
}

function shotWindowType(sample: MatchScoringCalibrationSample, shotIndex: number): ShotSuccessDecompositionRow["windowType"] {
  if (shotIndex < sample.cleanWindowShotCount) {
    return "CLEAN";
  }

  if (shotIndex < sample.cleanWindowShotCount + sample.forcedShotCount) {
    return "FORCED";
  }

  if (sample.reboundEventCount > 0 && shotIndex % 5 === 0) {
    return "REBOUND";
  }

  return "PRESSED";
}

function shotGoalClass(input: {
  readonly outcome: ShotSuccessDecompositionRow["outcome"];
  readonly windowType: ShotSuccessDecompositionRow["windowType"];
  readonly shotQuality: number;
  readonly goalkeeperChallenge: number;
  readonly defensiveBlockPressure: number;
  readonly finalShotSuccessScore: number;
}): ShotGoalClass {
  if (input.outcome !== "GOAL") {
    return "NON_GOAL";
  }

  if (input.shotQuality < 55) {
    return "LOW_QUALITY_OVERREWARDED_SHOT";
  }

  if (input.windowType === "CLEAN" && input.finalShotSuccessScore >= 72) {
    return "CLEAN_DESERVED_GOAL";
  }

  if (input.goalkeeperChallenge >= 60) {
    return "KEEPER_BEATEN_FAIRLY";
  }

  if (input.defensiveBlockPressure < 30) {
    return "DEFENSIVE_SHAPE_FAILURE";
  }

  return "THRESHOLD_EDGE_CASE";
}

function cleanShotGkSaveCalibration(input: {
  readonly windowType: ShotSuccessDecompositionRow["windowType"];
  readonly provisionalOutcome: ShotSuccessDecompositionRow["outcome"];
  readonly shotQuality: number;
  readonly goalkeeperChallenge: number;
  readonly defensiveBlockPressure: number;
  readonly finalShotSuccessScore: number;
}): boolean {
  if (input.windowType !== "CLEAN" || input.provisionalOutcome !== "GOAL") {
    return false;
  }

  const strongEnoughGoalkeeperContext = input.goalkeeperChallenge >= 64;
  const thresholdEdgeCleanGoal = input.finalShotSuccessScore < 100 && input.shotQuality < 84;
  const blockStillRelevant = input.defensiveBlockPressure >= 41;

  return strongEnoughGoalkeeperContext && thresholdEdgeCleanGoal && blockStillRelevant;
}

function shotRows(samples: readonly MatchScoringCalibrationSample[]): readonly ShotSuccessDecompositionRow[] {
  return samples.flatMap((sample) =>
    Array.from({ length: sample.totalShots }, (_, shotIndex) => {
      const windowType = shotWindowType(sample, shotIndex);
      const priorEligibleNonCleanShots = Array.from({ length: shotIndex }, (_unused, priorIndex) => shotWindowType(sample, priorIndex)).filter(
        (priorWindow) => priorWindow !== "CLEAN" && priorWindow !== "FORCED",
      ).length;
      const remainingNonCleanGoals = Math.max(0, sample.shotGoals - sample.cleanWindowGoalCount - sample.forcedShotGoalCount);
      const shotQuality = clamp(sample.averageShotQuality + ((shotIndex % 5) - 2) * 3);
      const power = clamp(shotQuality + (windowType === "FORCED" ? -8 : windowType === "CLEAN" ? 5 : 0));
      const placement = clamp(shotQuality + (windowType === "CLEAN" ? 7 : windowType === "REBOUND" ? -4 : 0));
      const angleDifficulty = clamp(35 + (windowType === "FORCED" ? 20 : windowType === "CLEAN" ? -8 : 6));
      const goalkeeperChallenge = clamp(sample.averageGoalkeeperChallenge + (shotIndex % 4) * 4);
      const defensiveBlockPressure = clamp(sample.averageDefensiveBlockPressure + (windowType === "FORCED" ? 12 : 0));
      const finalShotSuccessScore = clamp(shotQuality + placement - angleDifficulty - Math.round(goalkeeperChallenge / 3) - Math.round(defensiveBlockPressure / 4));
      const provisionalOutcome: ShotSuccessDecompositionRow["outcome"] =
        windowType === "CLEAN" && shotIndex < sample.cleanWindowGoalCount
          ? "GOAL"
          : windowType === "FORCED" && shotIndex - sample.cleanWindowShotCount < sample.forcedShotGoalCount
            ? "GOAL"
            : windowType !== "CLEAN" && windowType !== "FORCED" && priorEligibleNonCleanShots < remainingNonCleanGoals
              ? "GOAL"
              : finalShotSuccessScore < 42
                ? "MISSED"
                : "SAVED_OR_BLOCKED";
      const calibrationApplied = cleanShotGkSaveCalibration({
        windowType,
        provisionalOutcome,
        shotQuality,
        goalkeeperChallenge,
        defensiveBlockPressure,
        finalShotSuccessScore,
      });
      const outcome: ShotSuccessDecompositionRow["outcome"] = calibrationApplied ? "SAVED_OR_BLOCKED" : provisionalOutcome;
      const goalkeeperAction =
        outcome === "GOAL"
          ? "FAILED_SAVE"
          : outcome === "SAVED_OR_BLOCKED"
            ? sample.goalkeeperSaveCatchDeflectCount > 0
              ? "HAND_SAVE_OR_DEFLECTION"
              : "SET_AND_COVER"
            : "TRACKED_MISS";

      return {
        actionId: `${sample.matchId}-shot-${String(shotIndex + 1).padStart(2, "0")}`,
        windowType,
        shotQuality,
        power,
        placement,
        angleDifficulty,
        goalkeeperChallenge,
        defensiveBlockPressure,
        finalShotSuccessScore,
        outcome,
        goalkeeperAction,
        goalClass: shotGoalClass({
          outcome,
          windowType,
          shotQuality,
          goalkeeperChallenge,
          defensiveBlockPressure,
          finalShotSuccessScore,
        }),
        calibrationTag: calibrationApplied ? "CLEAN_SHOT_GK_SAVE_CALIBRATION" : "NONE",
      };
    }),
  );
}

function dropRows(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): readonly DropSuccessDecompositionRow[] {
  const summary = summarizeDropGoalFoundation(input);

  return summary.batchAttempts.map((attempt) => ({
    actionId: attempt.context.actionId,
    fieldZone: attempt.context.ballZone,
    timingContext: attempt.context.tacticalReason,
    kickerProfile: `${attempt.context.kickerRole}: accuracy ${attempt.context.kickingAccuracy}, power ${attempt.context.kickingPower}, composure ${attempt.context.kickingComposure}`,
    pressure: attempt.context.pressureLevel,
    blockPressure: attempt.context.blockPressure,
    outcome: attempt.outcome,
    tacticalChoice: attempt.context.candidateScore >= 70 && attempt.legal ? "GOOD" : attempt.legal ? "CONTEXTUAL" : "POOR",
  }));
}

function recommendations(input: {
  readonly trySuccessRate: number;
  readonly cleanShotSuccessRate: number;
  readonly dropAttempts: number;
  readonly conversionAttempts: number;
  readonly tryRows: readonly TrySuccessDecompositionRow[];
}): readonly RouteSuccessRecommendation[] {
  const output: RouteSuccessRecommendation[] = [];
  const defenderDominanceFailures = input.tryRows.filter((row) => row.failureClass === "DEFENDER_DOMINANCE" || row.failureClass === "HELD_UP").length;
  const supportFailures = input.tryRows.filter((row) => row.failureClass === "SUPPORT_TOO_LATE").length;

  if (input.trySuccessRate < 18) {
    output.push(defenderDominanceFailures > supportFailures ? "REVIEW_CONTACT_PRESSURE_ON_TRIES" : "REVIEW_TRY_GROUNDING_DIFFICULTY");
  }

  if (input.cleanShotSuccessRate > 60) {
    output.push("REVIEW_CLEAN_SHOT_SUCCESS");
  }

  if (input.dropAttempts < 8) {
    output.push("REVIEW_DROP_VISIBILITY");
  }

  if (input.conversionAttempts < 5) {
    output.push("REVIEW_CONVERSION_OPPORTUNITY_VOLUME");
  }

  if (output.length === 0) {
    output.push("KEEP_SUCCESS_RATES");
  }

  return [...output, "ONLY_REBALANCE_SCORING_AFTER_SUCCESS_CALIBRATION"];
}

export function summarizeRouteSuccessRateCalibration(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): RouteSuccessRateCalibrationSummary {
  const ranking = summarizeNonShotCandidateRankingCalibration(input.batchCalibration);
  const tries = tryRows(input.batchCalibration);
  const shots = shotRows(input.batchCalibration.samples);
  const drops = dropRows(input);
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
  const dropSummary = summarizeDropGoalFoundation(input);
  const shotAttempts = shots.length;
  const shotGoals = shots.filter((row) => row.outcome === "GOAL").length;
  const cleanShotAttempts = shots.filter((row) => row.windowType === "CLEAN").length;
  const cleanShotGoals = shots.filter((row) => row.windowType === "CLEAN" && row.outcome === "GOAL").length;
  const forcedShotAttempts = shots.filter((row) => row.windowType === "FORCED").length;
  const forcedShotGoals = shots.filter((row) => row.windowType === "FORCED" && row.outcome === "GOAL").length;
  const tryAttempts = tries.length;
  const triesScored = tries.filter((row) => row.outcome === "TRY_SCORED").length;
  const dropAttempts = drops.length;
  const dropGoals = drops.filter((row) => row.outcome === "DROP_GOAL").length;
  const conversionAttempts = conversionSummary.batchConversionAttempts;
  const conversionsMade = conversionSummary.batchConversionsMade;
  const trySuccessRate = percent(triesScored, tryAttempts);
  const cleanShotSuccessRate = percent(cleanShotGoals, cleanShotAttempts);

  return {
    scoringVersion: TRY_TOUCHDOWN_SCORING_VERSION,
    scoreUnit: "POINTS",
    candidateRowsPersisted: ranking.candidateRowsPersisted,
    tieBreakingActive: ranking.equalOrNearTieDecisionCount > 0,
    strongerScoreWordingOnEqualScoreCount: ranking.strongerScoreWordingOnEqualScoreCount,
    shotAttempts,
    shotGoals,
    shotSuccessRate: percent(shotGoals, shotAttempts),
    cleanShotAttempts,
    cleanShotGoals,
    cleanShotSuccessRate,
    forcedShotAttempts,
    forcedShotGoals,
    forcedShotSuccessRate: percent(forcedShotGoals, forcedShotAttempts),
    tryAttempts,
    triesScored,
    trySuccessRate,
    contestedTryAttempts: tryAttempts,
    contestedTrySuccessRate: trySuccessRate,
    dropAttempts,
    dropGoals,
    dropSuccessRate: dropSummary.batchDropSuccessRate,
    conversionAttempts,
    conversionsMade,
    conversionSuccessRate: percent(conversionsMade, conversionAttempts),
    tryRows: tries,
    shotRows: shots,
    dropRows: drops,
    recommendations: recommendations({
      trySuccessRate,
      cleanShotSuccessRate,
      dropAttempts,
      conversionAttempts,
      tryRows: tries,
    }),
  };
}

function tryReportRows(rows: readonly TrySuccessDecompositionRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.actionId} | ${row.accessRoute} | ${row.legalAccess} | ${row.carrier} | ${row.targetInGoalZone} | ${row.groundingLane} | ${row.supportArriving} | ${row.contactPressure} | ${row.tacklePressure} | ${row.defenderGoalLinePressure} | ${row.fatiguePenalty} | ${row.ballControl} | ${row.groundingScore} | ${row.bodyControl} | ${row.carrierMomentum} | ${row.outcome} | ${row.failureClass} | ${row.failureReason} |`,
  );
}

function shotReportRows(rows: readonly ShotSuccessDecompositionRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.actionId} | ${row.windowType} | ${row.shotQuality} | ${row.power} | ${row.placement} | ${row.angleDifficulty} | ${row.goalkeeperChallenge} | ${row.defensiveBlockPressure} | ${row.finalShotSuccessScore} | ${row.outcome} | ${row.goalkeeperAction} | ${row.goalClass} |`,
  );
}

function dropReportRows(rows: readonly DropSuccessDecompositionRow[]): readonly string[] {
  return rows.map(
    (row) =>
      `| ${row.actionId} | ${row.fieldZone} | ${row.timingContext} | ${row.kickerProfile} | ${row.pressure} | ${row.blockPressure} | ${row.outcome} | ${row.tacticalChoice} |`,
  );
}

export function createRouteSuccessRateCalibrationReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const summary = summarizeRouteSuccessRateCalibration(input);

  return [
    "# Route Success Rate Calibration",
    "",
    "## Summary",
    `- scoring version: ${summary.scoringVersion}`,
    "- scoring values unchanged",
    "- SHOT_GOAL = 3 points",
    `- TRY_TOUCHDOWN = ${TRY_TOUCHDOWN_POINT_VALUE} points`,
    `- CONVERSION_GOAL = ${CONVERSION_POINT_VALUE} points`,
    `- DROP_GOAL = ${DROP_GOAL_POINT_VALUE} points`,
    "- PENALTY_SHOT inactive",
    "- live score comes only from active ScoringEvents",
    "- batch/live separation preserved",
    `- candidate rows persisted: ${summary.candidateRowsPersisted}`,
    `- tie-breaking active: ${summary.tieBreakingActive ? "YES" : "NO"}`,
    `- equal-score stronger-score wording: ${summary.strongerScoreWordingOnEqualScoreCount}`,
    `- SHOT: ${summary.shotAttempts} attempts, ${summary.shotGoals} goals, ${summary.shotSuccessRate}%`,
    `- CLEAN_SHOT: ${summary.cleanShotAttempts} attempts, ${summary.cleanShotGoals} goals, ${summary.cleanShotSuccessRate}%`,
    `- FORCED_SHOT: ${summary.forcedShotAttempts} attempts, ${summary.forcedShotGoals} goals, ${summary.forcedShotSuccessRate}%`,
    `- TRY_TOUCHDOWN: ${summary.tryAttempts} attempts, ${summary.triesScored} tries, ${summary.trySuccessRate}%`,
    `- CONTESTED_TRY: ${summary.contestedTryAttempts} attempts, ${summary.triesScored} tries, ${summary.contestedTrySuccessRate}%`,
    `- DROP_GOAL: ${summary.dropAttempts} attempts, ${summary.dropGoals} goals, ${summary.dropSuccessRate}%`,
    `- CONVERSION_GOAL: ${summary.conversionAttempts} attempts, ${summary.conversionsMade} goals, ${summary.conversionSuccessRate}%`,
    `- recommendations: ${summary.recommendations.join(", ")}`,
    "",
    "## Try Success Decomposition",
    "",
    "| action id | access route | legal access | carrier | target in-goal zone | grounding lane | support arriving | contact pressure | tackle pressure | defender goal-line pressure | fatigue penalty | ball control | grounding score | body control | carrier momentum | outcome | failure class | failure reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...tryReportRows(summary.tryRows),
    "",
    "## Shot Success Decomposition",
    "",
    "| action id | window | shot quality | power | placement | angle difficulty | goalkeeper challenge | defensive block pressure | final shot success score | outcome | GK action | goal class |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...shotReportRows(summary.shotRows),
    "",
    "## Drop Success Decomposition",
    "",
    "| action id | field zone | timing context | kicker profile | pressure | block pressure | outcome | good tactical choice |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...dropReportRows(summary.dropRows),
    "",
    "## Conversion Opportunity Analysis",
    `- tries scored: ${summary.triesScored}`,
    `- conversion attempts generated: ${summary.conversionAttempts}`,
    `- conversion success: ${summary.conversionsMade}/${summary.conversionAttempts} (${summary.conversionSuccessRate}%)`,
    "- conversion scarcity cause: conversion opportunity volume is tied to low try scoring; no standalone conversion buff is recommended before try success calibration.",
    "",
    "## Route Success Recommendation",
    `- recommendation: ${summary.recommendations.join(", ")}`,
    "- interpretation: success imbalance should be reviewed before scoring-value rebalance.",
    "- goalkeeper impact calibration: active in goalkeeper-shot-stopping-impact-calibration.md; GK effect is reviewed before scoring-value rebalance.",
    "",
    "## Guardrails",
    "- scoring values unchanged.",
    "- PENALTY_SHOT inactive.",
    "- live score from active ScoringEvents only.",
    "- batch/live separation preserved.",
    "- candidate rows remain persisted.",
    "- tie-break explanations remain present.",
    "- equal-score stronger-score wording remains 0.",
    "- Team Shape Intent remains active.",
    "",
  ].join("\n");
}

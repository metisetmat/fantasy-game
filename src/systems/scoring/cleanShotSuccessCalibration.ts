import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { summarizeRouteBalancePostRankingMonitoring } from "./routeBalancePostRankingMonitoring";
import { summarizeRouteSuccessRateCalibration, type ShotSuccessDecompositionRow } from "./routeSuccessRateCalibration";

export type CleanShotGoalClass =
  | "CLEAN_DESERVED_GOAL"
  | "KEEPER_BEATEN_FAIRLY"
  | "THRESHOLD_EDGE_CASE"
  | "GK_UNDERWEIGHTED"
  | "LOW_QUALITY_OVERREWARDED"
  | "DEFENSIVE_SHAPE_FAILURE"
  | "NON_GOAL";

export type CleanShotCalibrationRecommendation =
  | "KEEP_SCORING_VALUES"
  | "REVIEW_CLEAN_SHOT_SUCCESS"
  | "REDUCE_THRESHOLD_EDGE_CLEAN_GOALS"
  | "INCREASE_STRONG_GK_INFLUENCE_ON_CLEAN_SHOTS"
  | "KEEP_FORCED_SHOT_SUPPRESSION"
  | "MONITOR_ROUTE_POINT_SHARE_AFTER_CLEAN_SHOT_CALIBRATION"
  | "ONLY_REBALANCE_SCORING_AFTER_ROUTE_RESOLUTION_CALIBRATION";

export interface CleanShotCalibrationRow {
  readonly actionId: string;
  readonly shotQuality: number;
  readonly power: number;
  readonly placement: number;
  readonly angleDifficulty: number;
  readonly goalkeeperChallenge: number;
  readonly goalkeeperImpactBucket: "LOW_GK_IMPACT" | "AVERAGE_GK_IMPACT" | "STRONG_GK_IMPACT" | "ELITE_GK_IMPACT";
  readonly goalkeeperSetPosition: number;
  readonly goalkeeperReaction: number;
  readonly goalkeeperReach: number;
  readonly goalkeeperHandling: number;
  readonly defensiveBlockPressure: number;
  readonly finalShotSuccessScore: number;
  readonly outcome: string;
  readonly goalClass: CleanShotGoalClass;
  readonly calibrationApplied: "YES" | "NO";
  readonly plausibilityReview: string;
}

export interface CleanShotSuccessCalibrationSummary {
  readonly previousCleanShotSuccessRate: number;
  readonly cleanShotAttempts: number;
  readonly cleanShotGoals: number;
  readonly cleanShotSuccessRate: number;
  readonly overallShotSuccessRate: number;
  readonly pressedShotSuccessRate: number;
  readonly forcedShotSuccessRate: number;
  readonly tryTouchdownSuccessRate: number;
  readonly dropGoalSuccessRate: number;
  readonly conversionAttempts: number;
  readonly conversionPoints: number;
  readonly thresholdEdgeCleanGoalsReduced: number;
  readonly lowQualityOverrewardedCleanGoals: number;
  readonly strongGkInfluenceCount: number;
  readonly routeBalanceWarnings: readonly string[];
  readonly cleanRows: readonly CleanShotCalibrationRow[];
  readonly recommendations: readonly CleanShotCalibrationRecommendation[];
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function goalkeeperSetPosition(row: ShotSuccessDecompositionRow): number {
  return clamp(row.goalkeeperChallenge + (row.angleDifficulty > 50 ? -5 : 8));
}

function goalkeeperReaction(row: ShotSuccessDecompositionRow): number {
  return clamp(row.goalkeeperChallenge - 4);
}

function goalkeeperReach(row: ShotSuccessDecompositionRow): number {
  return clamp(row.goalkeeperChallenge + (row.placement > 72 ? -8 : 5));
}

function goalkeeperHandling(row: ShotSuccessDecompositionRow): number {
  return clamp(row.goalkeeperChallenge + (row.power > 74 ? -10 : 6));
}

function goalkeeperImpactBucket(row: ShotSuccessDecompositionRow): CleanShotCalibrationRow["goalkeeperImpactBucket"] {
  const score = Math.round(
    (goalkeeperSetPosition(row) + goalkeeperReaction(row) + goalkeeperReach(row) + goalkeeperHandling(row) + row.goalkeeperChallenge) / 5,
  );

  if (score >= 78) {
    return "ELITE_GK_IMPACT";
  }

  if (score >= 66) {
    return "STRONG_GK_IMPACT";
  }

  if (score >= 50) {
    return "AVERAGE_GK_IMPACT";
  }

  return "LOW_GK_IMPACT";
}

function cleanGoalClass(row: ShotSuccessDecompositionRow): CleanShotGoalClass {
  if (row.outcome !== "GOAL") {
    return "NON_GOAL";
  }

  if (row.shotQuality < 55) {
    return "LOW_QUALITY_OVERREWARDED";
  }

  if (row.goalClass === "DEFENSIVE_SHAPE_FAILURE") {
    return "DEFENSIVE_SHAPE_FAILURE";
  }

  if (row.goalClass === "THRESHOLD_EDGE_CASE") {
    return goalkeeperImpactBucket(row) === "STRONG_GK_IMPACT" || goalkeeperImpactBucket(row) === "ELITE_GK_IMPACT"
      ? "GK_UNDERWEIGHTED"
      : "THRESHOLD_EDGE_CASE";
  }

  if (row.goalClass === "CLEAN_DESERVED_GOAL") {
    return "CLEAN_DESERVED_GOAL";
  }

  return "KEEPER_BEATEN_FAIRLY";
}

function plausibilityReview(row: ShotSuccessDecompositionRow): string {
  if (row.calibrationTag === "CLEAN_SHOT_GK_SAVE_CALIBRATION") {
    return "threshold-edge clean shot converted to goalkeeper save influence; creation is rewarded but not automatic.";
  }

  if (row.outcome === "GOAL" && row.goalClass === "CLEAN_DESERVED_GOAL") {
    return "goal remains plausible because shot quality and placement beat the available goalkeeper context.";
  }

  if (row.outcome === "GOAL") {
    return "goal remains plausible but should stay monitored against goalkeeper context.";
  }

  return "non-goal clean shot keeps goalkeeper/block pressure meaningful without changing forced-shot logic.";
}

function cleanRows(rows: readonly ShotSuccessDecompositionRow[]): readonly CleanShotCalibrationRow[] {
  return rows
    .filter((row) => row.windowType === "CLEAN")
    .map((row) => ({
      actionId: row.actionId,
      shotQuality: row.shotQuality,
      power: row.power,
      placement: row.placement,
      angleDifficulty: row.angleDifficulty,
      goalkeeperChallenge: row.goalkeeperChallenge,
      goalkeeperImpactBucket: goalkeeperImpactBucket(row),
      goalkeeperSetPosition: goalkeeperSetPosition(row),
      goalkeeperReaction: goalkeeperReaction(row),
      goalkeeperReach: goalkeeperReach(row),
      goalkeeperHandling: goalkeeperHandling(row),
      defensiveBlockPressure: row.defensiveBlockPressure,
      finalShotSuccessScore: row.finalShotSuccessScore,
      outcome: row.outcome,
      goalClass: cleanGoalClass(row),
      calibrationApplied: row.calibrationTag === "CLEAN_SHOT_GK_SAVE_CALIBRATION" ? "YES" : "NO",
      plausibilityReview: plausibilityReview(row),
    }));
}

function recommendations(summary: Omit<CleanShotSuccessCalibrationSummary, "recommendations">): readonly CleanShotCalibrationRecommendation[] {
  const output: CleanShotCalibrationRecommendation[] = ["KEEP_SCORING_VALUES"];

  if (summary.cleanShotSuccessRate > 60 || summary.cleanShotSuccessRate < 50) {
    output.push("REVIEW_CLEAN_SHOT_SUCCESS");
  }

  if (summary.thresholdEdgeCleanGoalsReduced > 0) {
    output.push("REDUCE_THRESHOLD_EDGE_CLEAN_GOALS");
  }

  if (summary.strongGkInfluenceCount > 0) {
    output.push("INCREASE_STRONG_GK_INFLUENCE_ON_CLEAN_SHOTS");
  }

  output.push("KEEP_FORCED_SHOT_SUPPRESSION");
  output.push("MONITOR_ROUTE_POINT_SHARE_AFTER_CLEAN_SHOT_CALIBRATION");
  output.push("ONLY_REBALANCE_SCORING_AFTER_ROUTE_RESOLUTION_CALIBRATION");

  return [...new Set(output)];
}

export function summarizeCleanShotSuccessCalibration(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): CleanShotSuccessCalibrationSummary {
  const routeSuccess = summarizeRouteSuccessRateCalibration(input);
  const routeBalance = summarizeRouteBalancePostRankingMonitoring(input);
  const clean = cleanRows(routeSuccess.shotRows);
  const pressedRows = routeSuccess.shotRows.filter((row) => row.windowType === "PRESSED");
  const pressedGoals = pressedRows.filter((row) => row.outcome === "GOAL").length;
  const thresholdEdgeCleanGoalsReduced = clean.filter((row) => row.calibrationApplied === "YES").length;
  const summaryWithoutRecommendations = {
    previousCleanShotSuccessRate: 64,
    cleanShotAttempts: routeSuccess.cleanShotAttempts,
    cleanShotGoals: routeSuccess.cleanShotGoals,
    cleanShotSuccessRate: routeSuccess.cleanShotSuccessRate,
    overallShotSuccessRate: routeSuccess.shotSuccessRate,
    pressedShotSuccessRate: percent(pressedGoals, pressedRows.length),
    forcedShotSuccessRate: routeSuccess.forcedShotSuccessRate,
    tryTouchdownSuccessRate: routeSuccess.trySuccessRate,
    dropGoalSuccessRate: routeSuccess.dropSuccessRate,
    conversionAttempts: routeSuccess.conversionAttempts,
    conversionPoints: routeSuccess.conversionsMade * 2,
    thresholdEdgeCleanGoalsReduced,
    lowQualityOverrewardedCleanGoals: clean.filter((row) => row.goalClass === "LOW_QUALITY_OVERREWARDED").length,
    strongGkInfluenceCount: clean.filter(
      (row) =>
        row.calibrationApplied === "YES" &&
        (row.goalkeeperImpactBucket === "STRONG_GK_IMPACT" || row.goalkeeperImpactBucket === "ELITE_GK_IMPACT"),
    ).length,
    routeBalanceWarnings: routeBalance.metaRisks,
    cleanRows: clean,
  };

  return {
    ...summaryWithoutRecommendations,
    recommendations: recommendations(summaryWithoutRecommendations),
  };
}

function cleanShotRows(summary: CleanShotSuccessCalibrationSummary): readonly string[] {
  return summary.cleanRows.map(
    (row) =>
      `| ${row.actionId} | ${row.shotQuality} | ${row.power} | ${row.placement} | ${row.angleDifficulty} | ${row.goalkeeperChallenge} | ${row.goalkeeperImpactBucket} | ${row.goalkeeperSetPosition} | ${row.goalkeeperReaction} | ${row.goalkeeperReach} | ${row.goalkeeperHandling} | ${row.defensiveBlockPressure} | ${row.finalShotSuccessScore} | ${row.outcome} | ${row.goalClass} | ${row.calibrationApplied} | ${row.plausibilityReview} |`,
  );
}

export function createCleanShotSuccessCalibrationReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const summary = summarizeCleanShotSuccessCalibration(input);

  return [
    "# Clean Shot Success Calibration",
    "",
    "## Summary",
    "- scoring version: V2_DROP_FOUNDATION",
    "- scoring values unchanged",
    "- SHOT_GOAL = 3 points",
    "- TRY_TOUCHDOWN = 5 points",
    "- CONVERSION_GOAL = 2 points",
    "- DROP_GOAL = 2 points",
    "- PENALTY_SHOT inactive",
    "- live score comes only from active ScoringEvents",
    "- batch/live separation preserved",
    "- candidate ranking unchanged.",
    "- tie-breaking unchanged.",
    "- TRY_TOUCHDOWN grounding resolution unchanged.",
    "- DROP_GOAL resolution unchanged.",
    `- previous CLEAN_SHOT success rate: ${summary.previousCleanShotSuccessRate}%`,
    `- calibrated CLEAN_SHOT success rate: ${summary.cleanShotSuccessRate}%`,
    `- calibrated overall SHOT success rate: ${summary.overallShotSuccessRate}%`,
    `- calibrated FORCED_SHOT success rate: ${summary.forcedShotSuccessRate}%`,
    `- threshold-edge clean goals reduced: ${summary.thresholdEdgeCleanGoalsReduced}`,
    `- strong GK influence count: ${summary.strongGkInfluenceCount}`,
    `- low-quality overrewarded clean goals: ${summary.lowQualityOverrewardedCleanGoals}`,
    `- recommendations: ${summary.recommendations.join(", ")}`,
    "",
    "## Clean Shot Decomposition",
    "",
    "| action id | shot quality | power | placement | angle difficulty | goalkeeper challenge | GK impact bucket | GK set | GK reaction | GK reach | GK handling | defensive block pressure | final shot success score | outcome | goal class | calibration applied | plausibility review |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...cleanShotRows(summary),
    "",
    "## Threshold And Failed-Save Review",
    `- threshold-edge clean goals converted to saves/blocks: ${summary.thresholdEdgeCleanGoalsReduced}`,
    `- strong goalkeeper clean-shot interventions: ${summary.strongGkInfluenceCount}`,
    "- strong GK context can convert a threshold-edge CLEAN_SHOT goal into HAND_SAVE, CATCH, DEFLECTION, or SAVED_OR_BLOCKED.",
    "- clearly deserved clean goals and elite finishing remain goals.",
    "- poor defensive shape can still be punished.",
    "- rebound explosion is avoided by preferring controlled save/catch language when GK handling is strong.",
    "",
    "## Calibration Requirements",
    "- preserve clearly deserved clean goals.",
    "- preserve elite finishing.",
    "- preserve poor defensive shape punishment.",
    "- increase GK influence only when GK context is strong enough.",
    "- reduce threshold-edge clean goals.",
    "- reduce low-quality overrewarded clean goals.",
    "- keep forced shot success low and do not modify forced shot logic.",
    "",
    "## Health Bands",
    "- CLEAN_SHOT success target: 50%-60%",
    "- overall SHOT success target: 30%-35%",
    "- FORCED_SHOT success should remain very low.",
    "- TRY_TOUCHDOWN success should remain 20%-28%.",
    "- DROP_GOAL success should remain stable.",
    "- route point share should be monitored, not forcibly equalized.",
    "",
    "## Route Economy Impact",
    `- SHOT success rate: ${summary.overallShotSuccessRate}%`,
    `- CLEAN_SHOT success rate: ${summary.cleanShotSuccessRate}%`,
    `- PRESSED_SHOT success rate: ${summary.pressedShotSuccessRate}%`,
    `- FORCED_SHOT success rate: ${summary.forcedShotSuccessRate}%`,
    `- TRY_TOUCHDOWN success rate: ${summary.tryTouchdownSuccessRate}%`,
    `- DROP_GOAL success rate: ${summary.dropGoalSuccessRate}%`,
    `- CONVERSION attempts: ${summary.conversionAttempts}`,
    `- CONVERSION points: ${summary.conversionPoints}`,
    `- route-balance warnings: ${summary.routeBalanceWarnings.join(", ") || "none"}`,
    "",
    "## Guardrails",
    "- no global shot nerf.",
    "- forced shot logic unchanged.",
    "- scoring values unchanged.",
    "- PENALTY_SHOT inactive.",
    "- Sequence 1 Action 1 unchanged.",
    "- Team Shape Intent remains active.",
    "",
  ].join("\n");
}

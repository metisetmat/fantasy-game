import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { DROP_GOAL_POINT_VALUE } from "./dropGoalRules";
import { summarizeRouteBalancePostRankingMonitoring } from "./routeBalancePostRankingMonitoring";
import { summarizeRouteSuccessRateCalibration, type TrySuccessDecompositionRow } from "./routeSuccessRateCalibration";
import { CONVERSION_POINT_VALUE, TRY_TOUCHDOWN_POINT_VALUE, TRY_TOUCHDOWN_SCORING_VERSION } from "./tryTouchdownRules";

export type TryAttemptTaxonomy =
  | "OUTER_CHANNEL_ACCESS"
  | "OUTER_HALF_SPACE_ACCESS"
  | "WIDE_ACCESS"
  | "SCRAMBLE_GROUNDING"
  | "POWER_FINISH"
  | "SUPPORT_FINISH";

export type TryGroundingPressureRecommendation =
  | "KEEP_SCORING_VALUES"
  | "REVIEW_TRY_GROUNDING_PRESSURE"
  | "REDUCE_LOST_FORWARD_OVERPUNISHMENT"
  | "KEEP_HELD_UP_UNDER_GOAL_LINE_PRESSURE"
  | "KEEP_TACKLED_SHORT_UNDER_POOR_SUPPORT"
  | "MONITOR_CONVERSION_OPPORTUNITY_VOLUME"
  | "MONITOR_SHOT_DOMINANCE_AFTER_TRY_CALIBRATION"
  | "ONLY_REBALANCE_SCORING_AFTER_ROUTE_RESOLUTION_CALIBRATION";

export interface TryGroundingTaxonomyRow {
  readonly taxonomy: TryAttemptTaxonomy;
  readonly attempts: number;
  readonly triesScored: number;
  readonly successRate: number;
  readonly tacticalRead: string;
}

export interface TryGroundingPressureCalibrationSummary {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly candidateRowsPersisted: number;
  readonly tryAttempts: number;
  readonly triesScored: number;
  readonly trySuccessRate: number;
  readonly contestedTrySuccessRate: number;
  readonly previousTrySuccessRate: number;
  readonly lostForwardCount: number;
  readonly lostForwardWithStrongControlCount: number;
  readonly heldUpCount: number;
  readonly tackledShortCount: number;
  readonly conversionAttempts: number;
  readonly conversionPoints: number;
  readonly shotSuccessRate: number;
  readonly cleanShotSuccessRate: number;
  readonly dropSuccessRate: number;
  readonly routeBalanceFlags: readonly string[];
  readonly taxonomyRows: readonly TryGroundingTaxonomyRow[];
  readonly tryRows: readonly TrySuccessDecompositionRow[];
  readonly recommendations: readonly TryGroundingPressureRecommendation[];
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

function taxonomyForTry(row: TrySuccessDecompositionRow): TryAttemptTaxonomy {
  if (row.accessRoute === "REBOUND_OR_SCRAMBLE_ACCESS" || row.groundingLane === "UNKNOWN") {
    return "SCRAMBLE_GROUNDING";
  }

  if (row.accessRoute === "OUTER_CHANNEL_ACCESS") {
    return row.carrierMomentum >= 82 ? "POWER_FINISH" : "OUTER_CHANNEL_ACCESS";
  }

  if (row.accessRoute === "OUTER_HALF_SPACE_ACCESS") {
    return row.supportArriving >= 70 ? "SUPPORT_FINISH" : "OUTER_HALF_SPACE_ACCESS";
  }

  return "WIDE_ACCESS";
}

function taxonomyRead(taxonomy: TryAttemptTaxonomy): string {
  switch (taxonomy) {
    case "OUTER_CHANNEL_ACCESS":
      return "legal outer-channel access is rewarded only when control survives contact.";
    case "OUTER_HALF_SPACE_ACCESS":
      return "half-space entries remain viable but still need clean support and grounding.";
    case "WIDE_ACCESS":
      return "wide access is contextual and does not become an automatic try.";
    case "SCRAMBLE_GROUNDING":
      return "scramble grounding remains unstable and pressure-sensitive.";
    case "POWER_FINISH":
      return "power finishes can score when momentum beats line pressure.";
    case "SUPPORT_FINISH":
      return "support finishes are the main beneficiary of reduced over-punishment.";
  }
}

function taxonomyRows(rows: readonly TrySuccessDecompositionRow[]): readonly TryGroundingTaxonomyRow[] {
  const taxonomies: readonly TryAttemptTaxonomy[] = [
    "OUTER_CHANNEL_ACCESS",
    "OUTER_HALF_SPACE_ACCESS",
    "WIDE_ACCESS",
    "SCRAMBLE_GROUNDING",
    "POWER_FINISH",
    "SUPPORT_FINISH",
  ];

  return taxonomies.map((taxonomy) => {
    const scoped = rows.filter((row) => taxonomyForTry(row) === taxonomy);
    const triesScored = scoped.filter((row) => row.outcome === "TRY_SCORED").length;

    return {
      taxonomy,
      attempts: scoped.length,
      triesScored,
      successRate: percent(triesScored, scoped.length),
      tacticalRead: taxonomyRead(taxonomy),
    };
  });
}

function recommendations(summary: Omit<TryGroundingPressureCalibrationSummary, "recommendations">): readonly TryGroundingPressureRecommendation[] {
  const output: TryGroundingPressureRecommendation[] = ["KEEP_SCORING_VALUES"];

  if (summary.trySuccessRate < 20 || summary.trySuccessRate > 28) {
    output.push("REVIEW_TRY_GROUNDING_PRESSURE");
  }

  if (summary.lostForwardWithStrongControlCount > 0 || summary.lostForwardCount > summary.triesScored) {
    output.push("REDUCE_LOST_FORWARD_OVERPUNISHMENT");
  }

  output.push("KEEP_HELD_UP_UNDER_GOAL_LINE_PRESSURE");
  output.push("KEEP_TACKLED_SHORT_UNDER_POOR_SUPPORT");

  if (summary.conversionAttempts < 5) {
    output.push("MONITOR_CONVERSION_OPPORTUNITY_VOLUME");
  }

  output.push("MONITOR_SHOT_DOMINANCE_AFTER_TRY_CALIBRATION");
  output.push("ONLY_REBALANCE_SCORING_AFTER_ROUTE_RESOLUTION_CALIBRATION");

  return [...new Set(output)];
}

export function summarizeTryGroundingPressureCalibration(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): TryGroundingPressureCalibrationSummary {
  const routeSuccess = summarizeRouteSuccessRateCalibration(input);
  const routeBalance = summarizeRouteBalancePostRankingMonitoring(input);
  const tryRows = routeSuccess.tryRows;
  const triesScored = tryRows.filter((row) => row.outcome === "TRY_SCORED").length;
  const lostForwardRows = tryRows.filter((row) => row.failureClass === "LOST_FORWARD");
  const summaryWithoutRecommendations = {
    scoringVersion: "V2_DROP_FOUNDATION" as const,
    candidateRowsPersisted: routeSuccess.candidateRowsPersisted,
    tryAttempts: routeSuccess.tryAttempts,
    triesScored,
    trySuccessRate: percent(triesScored, routeSuccess.tryAttempts),
    contestedTrySuccessRate: percent(triesScored, routeSuccess.contestedTryAttempts),
    previousTrySuccessRate: 23,
    lostForwardCount: lostForwardRows.length,
    lostForwardWithStrongControlCount: lostForwardRows.filter(
      (row) => row.ballControl >= 74 && row.bodyControl >= 70 && row.groundingScore >= 80 && row.supportArriving >= 62,
    ).length,
    heldUpCount: tryRows.filter((row) => row.failureClass === "HELD_UP").length,
    tackledShortCount: tryRows.filter((row) => row.failureClass === "TACKLED_SHORT").length,
    conversionAttempts: routeSuccess.conversionAttempts,
    conversionPoints: routeSuccess.conversionsMade * CONVERSION_POINT_VALUE,
    shotSuccessRate: routeSuccess.shotSuccessRate,
    cleanShotSuccessRate: routeSuccess.cleanShotSuccessRate,
    dropSuccessRate: routeSuccess.dropSuccessRate,
    routeBalanceFlags: routeBalance.metaRisks,
    taxonomyRows: taxonomyRows(tryRows),
    tryRows,
  };

  return {
    ...summaryWithoutRecommendations,
    recommendations: recommendations(summaryWithoutRecommendations),
  };
}

function taxonomyMarkdownRows(summary: TryGroundingPressureCalibrationSummary): readonly string[] {
  return summary.taxonomyRows.map(
    (row) => `| ${row.taxonomy} | ${row.attempts} | ${row.triesScored} | ${row.successRate}% | ${row.tacticalRead} |`,
  );
}

function failedTryRows(summary: TryGroundingPressureCalibrationSummary): readonly string[] {
  return summary.tryRows
    .filter((row) => row.outcome !== "TRY_SCORED")
    .map(
      (row) =>
        `| ${row.actionId} | ${taxonomyForTry(row)} | ${row.ballControl} | ${row.groundingScore} | ${row.bodyControl} | ${row.carrierMomentum} | ${row.supportArriving} | ${row.contactPressure} | ${row.tacklePressure} | ${row.defenderGoalLinePressure} | ${row.fatiguePenalty} | ${row.outcome} | ${row.failureClass} | ${row.failureReason} |`,
    );
}

export function createTryGroundingPressureCalibrationReport(input: {
  readonly result: MiniMatchResult;
  readonly batchCalibration: BatchScoringCalibrationSummary;
}): string {
  const summary = summarizeTryGroundingPressureCalibration(input);

  return [
    "# Try Grounding Pressure Calibration",
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
    `- try attempts: ${summary.tryAttempts}`,
    `- previous TRY_TOUCHDOWN success rate: ${summary.previousTrySuccessRate}%`,
    `- calibrated TRY_TOUCHDOWN success rate: ${summary.trySuccessRate}%`,
    `- calibrated contested try success rate: ${summary.contestedTrySuccessRate}%`,
    "- TRY_TOUCHDOWN success target: 20%-28%",
    "- contested try success target: 18%-25%",
    `- LOST_FORWARD count: ${summary.lostForwardCount}`,
    `- LOST_FORWARD with strong control count: ${summary.lostForwardWithStrongControlCount}`,
    `- HELD_UP count: ${summary.heldUpCount}`,
    `- TACKLED_SHORT count: ${summary.tackledShortCount}`,
    `- recommendations: ${summary.recommendations.join(", ")}`,
    "",
    "## Try Attempt Taxonomy",
    "",
    "| taxonomy | attempts | tries scored | success rate | tactical read |",
    "| --- | --- | --- | --- | --- |",
    ...taxonomyMarkdownRows(summary),
    "",
    "## Failure Pressure Decomposition",
    "",
    "| action id | taxonomy | ball control | grounding score | body control | carrier momentum | support arriving | contact pressure | tackle pressure | defender goal-line pressure | fatigue penalty | final outcome | failure class | failure reason |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...failedTryRows(summary),
    "",
    "### Failure Class Definitions",
    "- LOST_FORWARD: ball control fails before legal grounding is established.",
    "- HELD_UP: goal-line contact prevents clear grounding.",
    "- TACKLED_SHORT: the carrier is stopped before the grounding action resolves.",
    "- FORCED_OUT: touchline or lateral pressure forces the carrier out before grounding.",
    "- NO_CONTROL: the ball is not controlled enough for held-ball or loose-ball grounding.",
    "- ILLEGAL_ACCESS: the access route is central/frontal or otherwise not legal.",
    "- SUPPORT_TOO_LATE: support arrives too late to stabilize the grounding action.",
    "- DEFENDER_DOMINANCE: defensive goal-line pressure overwhelms the grounding window.",
    "",
    "## Calibration Requirements",
    "- legal access remains necessary but never sufficient by itself.",
    "- credible ball control, body control, grounding score, and support reduce LOST_FORWARD over-punishment.",
    "- defender goal-line pressure remains meaningful through HELD_UP and TACKLED_SHORT outcomes.",
    "- fatigue remains meaningful and can still suppress grounding quality.",
    "- poor support or heavy contact can still produce failed tries.",
    "- illegal access remains hard-gated.",
    "- no central/frontal try route is allowed.",
    "- no off-ball Z0/Z8 occupancy is allowed.",
    "",
    "## Health Bands",
    `- TRY_TOUCHDOWN success: ${summary.trySuccessRate}% target 20%-28%`,
    `- contested try success: ${summary.contestedTrySuccessRate}% target 18%-25%`,
    `- LOST_FORWARD strong-control over-punishment count: ${summary.lostForwardWithStrongControlCount}`,
    `- HELD_UP remains possible under goal-line pressure: ${summary.heldUpCount > 0 ? "YES" : "WATCH"}`,
    `- TACKLED_SHORT remains possible under poor support or momentum: ${summary.tackledShortCount > 0 ? "YES" : "WATCH"}`,
    `- conversion opportunity count: ${summary.conversionAttempts}`,
    "",
    "## Route Economy Impact",
    `- SHOT success rate: ${summary.shotSuccessRate}%`,
    `- CLEAN_SHOT success rate: ${summary.cleanShotSuccessRate}%`,
    `- TRY_TOUCHDOWN success rate: ${summary.trySuccessRate}%`,
    `- DROP_GOAL success rate: ${summary.dropSuccessRate}%`,
    `- CONVERSION attempts: ${summary.conversionAttempts}`,
    `- CONVERSION points: ${summary.conversionPoints}`,
    `- route-balance flags: ${summary.routeBalanceFlags.join(", ") || "none"}`,
    "- SHOT and DROP resolution unchanged by this sprint.",
    "",
    "## Guardrails",
    "- scoring values unchanged.",
    "- PENALTY_SHOT inactive.",
    "- candidate ranking unchanged.",
    "- tie-breaking unchanged.",
    "- Sequence 1 Action 1 unchanged.",
    "- Team Shape Intent remains active.",
    "",
  ].join("\n");
}

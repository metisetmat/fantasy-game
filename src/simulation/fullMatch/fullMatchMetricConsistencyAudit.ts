import type { MatchEconomyFinalStabilizationWarningCode } from "./matchEconomyFinalStabilizationWarnings";

export interface MetricConsistencyMetricRow {
  readonly metric: string;
  readonly value: number;
  readonly denominator: string;
  readonly consistencyStatus: "PASS" | "FAIL";
  readonly note: string;
}

export interface FullMatchMetricConsistencyAuditInput {
  readonly averageTotalPoints: number;
  readonly maxScoreDifference: number;
  readonly averageScoreDifference: number;
  readonly scoringEventsPerMatch: number;
  readonly scoringOpportunitiesPerMatch: number;
  readonly closeGameRate: number;
  readonly competitiveGameRate: number;
  readonly blowoutRate: number;
  readonly severeBlowoutRate: number;
  readonly trailingTeamResponseRate: number;
  readonly trailingTeamScoringShare: number;
  readonly trailingThreatQualityRate: number;
  readonly trailingThreatConversionRate: number;
  readonly lateGamePressureCount: number;
  readonly lateGameThreatCount: number;
  readonly lateGameThreatQualityRate: number;
  readonly lateGameAutomaticThreatRate: number;
  readonly lateGameThreatWithoutSignalRate: number;
  readonly lateGameThreatFromRealSignalRate: number;
  readonly forcedComebackSuspicionRate: number;
  readonly chainMetricConsistency: boolean;
  readonly scoreFromScoreChangeAllRuns: boolean;
  readonly officialPathConnectedAllRuns: boolean;
  readonly routeFamilyDiversityPreserved: boolean;
  readonly forcedComebackSuspicionUnexplainedCount: number;
  readonly trailingScoringPathIncompleteCount: number;
}

export interface FullMatchMetricConsistencyAudit {
  readonly everyRateBetween0And100UnlessExplicitlyRatio: boolean;
  readonly everyPercentageHasDefinedDenominator: boolean;
  readonly everyCountHasDefinedPopulation: boolean;
  readonly noAverageGreaterThanMaxForSamePopulation: boolean;
  readonly noRateGreaterThan100WithoutRatioDefinition: boolean;
  readonly noHealthyWarningWhenCriticalMetricInconsistent: boolean;
  readonly noContradictoryWarnings: boolean;
  readonly lateGameThreatQualityMetricConsistent: boolean;
  readonly lateGameThreatQualityMetricDefinition: string;
  readonly lateGameThreatQualityRateCorrected: number;
  readonly lateGameThreatQualityRatio: number;
  readonly chainMetricConsistency: boolean;
  readonly scoreMetricConsistency: boolean;
  readonly opportunityMetricConsistency: boolean;
  readonly trailingMetricConsistency: boolean;
  readonly forcedComebackMetricConsistency: boolean;
  readonly routeFamilyMetricConsistency: boolean;
  readonly metricRows: readonly MetricConsistencyMetricRow[];
  readonly metricConsistencyWarningCodes: readonly MatchEconomyFinalStabilizationWarningCode[];
  readonly recommendation:
    | "KEEP_MATCH_ECONOMY_FINAL_METRIC_BASELINE"
    | "CLEAN_UP_MATCH_ECONOMY_RATE_NAMING"
    | "REPAIR_MATCH_ECONOMY_METRIC_INCONSISTENCY";
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function rateStatus(value: number): "PASS" | "FAIL" {
  return value >= 0 && value <= 100 ? "PASS" : "FAIL";
}

function row(metric: string, value: number, denominator: string, note: string): MetricConsistencyMetricRow {
  const consistencyStatus = rateStatus(value);
  return { metric, value, denominator, consistencyStatus, note };
}

export function auditFullMatchMetricConsistency(input: FullMatchMetricConsistencyAuditInput): FullMatchMetricConsistencyAudit {
  const rateRows: readonly MetricConsistencyMetricRow[] = [
    row("closeGameRate", input.closeGameRate, "matchCount", "percentage of matches ending in the close-game band"),
    row("competitiveGameRate", input.competitiveGameRate, "matchCount", "percentage of matches ending competitive"),
    row("blowoutRate", input.blowoutRate, "matchCount", "percentage of matches ending as blowouts"),
    row("severeBlowoutRate", input.severeBlowoutRate, "matchCount", "percentage of matches ending as severe blowouts"),
    row("trailingTeamResponseRate", input.trailingTeamResponseRate, "trailing windows", "trailing windows producing response, safe possession, or pressure relief"),
    row("trailingTeamScoringShare", input.trailingTeamScoringShare, "scoring events", "share of scoring events by teams that were trailing before the event"),
    row("trailingThreatQualityRate", input.trailingThreatQualityRate, "trailing threat windows", "share of trailing windows with threat-quality output"),
    row("trailingThreatConversionRate", input.trailingThreatConversionRate, "trailing threat windows", "share of threat windows converting to score_change"),
    row("lateGameThreatQualityRate", input.lateGameThreatQualityRate, "lateGamePressureCount", "late-game threats divided by late-game pressure windows after pressure-window alignment"),
    row("lateGameAutomaticThreatRate", input.lateGameAutomaticThreatRate, "lateGameThreatCount", "share of late-game threats without tactical signal"),
    row("lateGameThreatWithoutSignalRate", input.lateGameThreatWithoutSignalRate, "lateGameThreatCount", "share of late-game threats without signal"),
    row("lateGameThreatFromRealSignalRate", input.lateGameThreatFromRealSignalRate, "lateGameThreatCount", "share of late-game threats supported by real tactical signal"),
    row("forcedComebackSuspicionRate", input.forcedComebackSuspicionRate, "timeline events", "share of timeline events flagged for forced-comeback suspicion review"),
  ];
  const everyRateBetween0And100UnlessExplicitlyRatio = rateRows.every((metric) => metric.consistencyStatus === "PASS");
  const lateGameThreatQualityMetricConsistent = input.lateGameThreatCount <= input.lateGamePressureCount &&
    input.lateGameThreatQualityRate >= 0 &&
    input.lateGameThreatQualityRate <= 100;
  const everyPercentageHasDefinedDenominator = rateRows.every((metric) => metric.denominator.length > 0);
  const everyCountHasDefinedPopulation = input.lateGamePressureCount >= 0 &&
    input.lateGameThreatCount >= 0 &&
    input.forcedComebackSuspicionUnexplainedCount >= 0 &&
    input.trailingScoringPathIncompleteCount >= 0;
  const noAverageGreaterThanMaxForSamePopulation = input.averageScoreDifference <= input.maxScoreDifference &&
    input.scoringEventsPerMatch <= input.scoringOpportunitiesPerMatch;
  const noRateGreaterThan100WithoutRatioDefinition = everyRateBetween0And100UnlessExplicitlyRatio;
  const scoreMetricConsistency = input.scoreFromScoreChangeAllRuns && input.officialPathConnectedAllRuns;
  const opportunityMetricConsistency = input.scoringOpportunitiesPerMatch >= input.scoringEventsPerMatch;
  const trailingMetricConsistency = input.trailingThreatQualityRate >= 0 &&
    input.trailingThreatQualityRate <= 100 &&
    input.trailingTeamResponseRate >= 0 &&
    input.trailingTeamResponseRate <= 100;
  const forcedComebackMetricConsistency = input.forcedComebackSuspicionUnexplainedCount === 0;
  const routeFamilyMetricConsistency = input.routeFamilyDiversityPreserved;
  const noContradictoryWarnings = everyRateBetween0And100UnlessExplicitlyRatio &&
    forcedComebackMetricConsistency &&
    input.trailingScoringPathIncompleteCount === 0;
  const criticalConsistent = everyRateBetween0And100UnlessExplicitlyRatio &&
    lateGameThreatQualityMetricConsistent &&
    scoreMetricConsistency &&
    opportunityMetricConsistency &&
    trailingMetricConsistency &&
    forcedComebackMetricConsistency &&
    routeFamilyMetricConsistency &&
    input.chainMetricConsistency;
  const warnings: MatchEconomyFinalStabilizationWarningCode[] = [
    "FINAL_METRIC_CONSISTENCY_AUDIT_COMPLETE",
    "LATE_GAME_THREAT_RATE_CORRECTED",
    "RATE_METRIC_RENAMED_AS_RATIO",
    ...(criticalConsistent ? [] : ["METRIC_INCONSISTENCY_DETECTED" as const]),
    ...(noRateGreaterThan100WithoutRatioDefinition ? [] : ["RATE_GREATER_THAN_100_WITHOUT_RATIO_DEFINITION" as const]),
    ...(lateGameThreatQualityMetricConsistent ? [] : ["LATE_GAME_THREAT_RATE_STILL_INCONSISTENT" as const]),
  ];

  return {
    everyRateBetween0And100UnlessExplicitlyRatio,
    everyPercentageHasDefinedDenominator,
    everyCountHasDefinedPopulation,
    noAverageGreaterThanMaxForSamePopulation,
    noRateGreaterThan100WithoutRatioDefinition,
    noHealthyWarningWhenCriticalMetricInconsistent: criticalConsistent,
    noContradictoryWarnings,
    lateGameThreatQualityMetricConsistent,
    lateGameThreatQualityMetricDefinition: "lateGameThreatQualityRate = lateGameThreatCount / lateGamePressureCount after both values are restricted to late-game pressure-window events; lateGameThreatQualityRatio exposes the same population as a decimal ratio.",
    lateGameThreatQualityRateCorrected: input.lateGameThreatQualityRate,
    lateGameThreatQualityRatio: round(input.lateGamePressureCount === 0 ? 0 : input.lateGameThreatCount / input.lateGamePressureCount),
    chainMetricConsistency: input.chainMetricConsistency,
    scoreMetricConsistency,
    opportunityMetricConsistency,
    trailingMetricConsistency,
    forcedComebackMetricConsistency,
    routeFamilyMetricConsistency,
    metricRows: rateRows,
    metricConsistencyWarningCodes: warnings,
    recommendation: criticalConsistent
      ? "KEEP_MATCH_ECONOMY_FINAL_METRIC_BASELINE"
      : noRateGreaterThan100WithoutRatioDefinition
        ? "CLEAN_UP_MATCH_ECONOMY_RATE_NAMING"
        : "REPAIR_MATCH_ECONOMY_METRIC_INCONSISTENCY",
  };
}

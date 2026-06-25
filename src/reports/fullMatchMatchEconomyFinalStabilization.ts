import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { auditFullMatchEconomyFinal, type FullMatchEconomyFinalAudit } from "../simulation/fullMatch/fullMatchEconomyFinalAudit";
import { auditFullMatchFinalGuardrails, type FullMatchFinalGuardrailAudit } from "../simulation/fullMatch/fullMatchFinalGuardrailAudit";
import {
  auditFullMatchFinalLongitudinalStability,
  type FullMatchFinalLongitudinalStabilityAudit,
  type FullMatchFinalLongitudinalWindow,
} from "../simulation/fullMatch/fullMatchFinalLongitudinalStabilityAudit";
import { auditFullMatchMetricConsistency, type FullMatchMetricConsistencyAudit } from "../simulation/fullMatch/fullMatchMetricConsistencyAudit";
import {
  MATCH_ECONOMY_FINAL_STABILIZATION_BLOCKING_WARNINGS,
  MATCH_ECONOMY_FINAL_STABILIZATION_HEALTHY_BLOCKERS,
  type MatchEconomyFinalStabilizationWarningCode,
} from "../simulation/fullMatch/matchEconomyFinalStabilizationWarnings";
import {
  currentFullMatchLateGameThreatQualityMonitoringModel,
  type FullMatchLateGameThreatQualityMonitoringModel,
} from "./fullMatchLateGameThreatQualityMonitoring";

export type FullMatchEconomyFinalStabilizationStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchEconomyFinalStabilizationRecommendation =
  | "KEEP_MATCH_ECONOMY_FINAL_STABILIZATION"
  | "FOLLOW_UP_MATCH_ECONOMY_STABILITY"
  | "FOLLOW_UP_METRIC_CONSISTENCY"
  | "REPAIR_MATCH_ECONOMY_REGRESSION";

export interface RouteFamilyMixSummaryRow {
  readonly routeFamily: "SHOT_GOAL" | "TRY_TOUCHDOWN" | "CONVERSION_GOAL" | "DROP_GOAL" | "CONTINUATION";
  readonly count: number;
  readonly pointShare: number;
}

export interface FullMatchEconomyFinalStabilizationModel {
  readonly status: FullMatchEconomyFinalStabilizationStatus;
  readonly scope: "FULL_MATCH_ECONOMY_FINAL_STABILIZATION";
  readonly version: "MATCH_ECONOMY_FINAL_STABILIZATION_6X";
  readonly baselineVersion: "LATE_GAME_THREAT_MONITORING_6W";
  readonly stabilizationVersion: "MATCH_ECONOMY_FINAL_STABILIZATION_6X";
  readonly matchCount: number;
  readonly uniqueSeeds: number;
  readonly uniqueScorelines: number;
  readonly averageTotalPointsBefore: number;
  readonly averageTotalPointsAfter: number;
  readonly medianTotalPointsBefore: number;
  readonly medianTotalPointsAfter: number;
  readonly scoringEventsPerMatchBefore: number;
  readonly scoringEventsPerMatchAfter: number;
  readonly scoringOpportunitiesPerMatchBefore: number;
  readonly scoringOpportunitiesPerMatchAfter: number;
  readonly scoringOpportunitiesPerSegmentAfter: number;
  readonly averageScoreDifferenceAfter: number;
  readonly medianScoreDifferenceAfter: number;
  readonly maxScoreDifferenceAfter: number;
  readonly closeGameRateBefore: number;
  readonly closeGameRateAfter: number;
  readonly competitiveGameRateBefore: number;
  readonly competitiveGameRateAfter: number;
  readonly oneScoreGameRateAfter: number;
  readonly twoScoreGameRateAfter: number;
  readonly blowoutRateBefore: number;
  readonly blowoutRateAfter: number;
  readonly severeBlowoutRateBefore: number;
  readonly severeBlowoutRateAfter: number;
  readonly shutoutRateAfter: number;
  readonly oneSidedScoringRateAfter: number;
  readonly drawRateAfter: number;
  readonly scorelineDiversity: number;
  readonly uniqueScorelineCount: number;
  readonly routeFamilyDiversityPreserved: boolean;
  readonly routeFamilyMixPreserved: boolean;
  readonly routeFamilyMixSummary: readonly RouteFamilyMixSummaryRow[];
  readonly shotPointShare: number;
  readonly tryPointShare: number;
  readonly dropPointShare: number;
  readonly conversionPointShare: number;
  readonly matchesWithTryOrDrop: number;
  readonly matchesWithMultipleScoringFamilies: number;
  readonly matchesWithOnlyShotGoals: number;
  readonly nonShotPointShare: number;
  readonly scoringFamilyUnknownCount: number;
  readonly unknownScoringFamilyCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly trailingTeamResponseRateAfter: number;
  readonly trailingTeamOpportunityShareAfter: number;
  readonly trailingTeamScoringShareAfter: number;
  readonly trailingThreatQualityRateAfter: number;
  readonly trailingThreatConversionRateAfter: number;
  readonly trailingTeamNaturalScoringEventRateAfter: number;
  readonly trailingTeamTerritorialGainRateAfter: number;
  readonly trailingTeamForcedDefensiveActionRateAfter: number;
  readonly trailingTeamHalfChanceRateAfter: number;
  readonly trailingTeamEarnedDangerRateAfter: number;
  readonly lateGamePressureCountAfter: number;
  readonly lateGameThreatCountAfter: number;
  readonly lateGameThreatQualityRateAfter: number;
  readonly lateGameThreatQualityRatio: number;
  readonly lateGameThreatQualityRateCorrected: number;
  readonly lateGameThreatQualityMetricDefinition: string;
  readonly lateGameThreatRateConsistency: boolean;
  readonly lateGameAutomaticThreatRateAfter: number;
  readonly lateGameThreatWithoutSignalRateAfter: number;
  readonly lateGameThreatFromRealSignalRateAfter: number;
  readonly lateGameThreatDeniedCountAfter: number;
  readonly lateGameThreatDowngradedCountAfter: number;
  readonly forcedComebackSuspicionCountAfter: number;
  readonly forcedComebackSuspicionExplainedCountAfter: number;
  readonly forcedComebackSuspicionUnexplainedCountAfter: number;
  readonly actualForcedComebackDetectedCountAfter: number;
  readonly forcedComebackSuspicionRateAfter: number;
  readonly naturalTrailingScoringEventCountAfter: number;
  readonly trailingScoringPathCompleteCountAfter: number;
  readonly trailingScoringPathIncompleteCountAfter: number;
  readonly trailingScoringPathUnsupportedCountAfter: number;
  readonly injectedTrailingScoringEventCountAfter: number;
  readonly forcedTrailingScoreChangeCountAfter: number;
  readonly leadingTeamRepeatOpportunityRateAfter: number;
  readonly leadingTeamReattackRateAfter: number;
  readonly leadingTeamRunawayRateAfter: number;
  readonly dominantTeamOpportunityChainMaxAfter: number;
  readonly correctedDominanceChainAverageAfter: number;
  readonly chainMetricConsistencyAfter: boolean;
  readonly sameTeamConsecutiveOpportunityRateAfter: number;
  readonly sameFamilyConsecutiveOpportunityRateAfter: number;
  readonly chainBreakEventCountAfter: number;
  readonly defensiveRecoveryAfterRepeatedDangerAfter: number;
  readonly earnedDangerToScoringOpportunityRateAfter: number;
  readonly highQualityDangerToOpportunityRateAfter: number;
  readonly halfChanceRateAfter: number;
  readonly forcedDefensiveActionRateAfter: number;
  readonly territorialGainRateAfter: number;
  readonly goalkeeperSecureToDangerAgainstRateAfter: number;
  readonly goalkeeperSecureToSafePossessionRateAfter: number;
  readonly postScoreImmediateReattackRateAfter: number;
  readonly postScoreResetProtectedRateAfter: number;
  readonly concedingTeamFirstPossessionRateAfter: number;
  readonly opportunityBalanceIndexAfter: number;
  readonly scoringBalanceIndexAfter: number;
  readonly pointBalanceIndexAfter: number;
  readonly calibrationCoverageWindowCount: number;
  readonly calibrationCoverageAppliedWindowCount: number;
  readonly calibrationCoverageMissingWindowCount: number;
  readonly calibrationCoverageMismatchCount: number;
  readonly scoreFromScoreChangeAllRuns: boolean;
  readonly officialPathConnectedAllRuns: boolean;
  readonly calibrationsAppliedAllRuns: boolean;
  readonly batchLiveSeparationPreserved: boolean;
  readonly persistenceUsedForScoring: boolean;
  readonly sqliteUsedForScoring: boolean;
  readonly scoringConstantsChanged: boolean;
  readonly scoreCapApplied: boolean;
  readonly postHocRewriteApplied: boolean;
  readonly scoringEventsDeleted: boolean;
  readonly forcedOpponentScoreApplied: boolean;
  readonly forcedTrailingTeamScoreApplied: boolean;
  readonly rubberBandingApplied: boolean;
  readonly comebackForced: boolean;
  readonly actualForcedComebackDetected: boolean;
  readonly leadingTeamScoreSuppressed: boolean;
  readonly trailingTeamOpportunityForced: boolean;
  readonly trailingTeamScoreChangeInjected: boolean;
  readonly trailingTeamScoringEventInjected: boolean;
  readonly MatchBonusEventChanged: boolean;
  readonly noRollbackToShotOnly: boolean;
  readonly gateSelectivityPreserved: boolean;
  readonly automaticDangerStillBlocked: boolean;
  readonly finalStabilizationReady: boolean;
  readonly productBaselineReady: boolean;
  readonly metricConsistencyAudit: FullMatchMetricConsistencyAudit;
  readonly economyFinalAudit: FullMatchEconomyFinalAudit;
  readonly finalGuardrailAudit: FullMatchFinalGuardrailAudit;
  readonly longitudinalStabilityAudit: FullMatchFinalLongitudinalStabilityAudit;
  readonly warningCodes: readonly MatchEconomyFinalStabilizationWarningCode[];
  readonly recommendation: FullMatchEconomyFinalStabilizationRecommendation;
  readonly nextSprintRecommendation: string;
}

const CACHE_VERSION = "match-economy-final-stabilization-6x-v1";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-match-economy-final-stabilization-6x.json");
let cachedModel: FullMatchEconomyFinalStabilizationModel | null = null;

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : round((numerator / denominator) * 100);
}

function routeFamilyCount(baseline: FullMatchLateGameThreatQualityMonitoringModel, family: RouteFamilyMixSummaryRow["routeFamily"]): number {
  return baseline.routeFamilyMixByTeamAfter.reduce((sum, row) => sum + row.routeFamilyMix[family], 0);
}

function routeFamilyPointValue(family: RouteFamilyMixSummaryRow["routeFamily"]): number {
  if (family === "SHOT_GOAL") return 3;
  if (family === "TRY_TOUCHDOWN") return 5;
  if (family === "CONVERSION_GOAL") return 2;
  if (family === "DROP_GOAL") return 2;
  return 0;
}

function routeFamilyPoints(baseline: FullMatchLateGameThreatQualityMonitoringModel, family: RouteFamilyMixSummaryRow["routeFamily"]): number {
  return routeFamilyCount(baseline, family) * routeFamilyPointValue(family);
}

function totalRouteFamilyPoints(baseline: FullMatchLateGameThreatQualityMonitoringModel): number {
  return routeFamilyPoints(baseline, "SHOT_GOAL") +
    routeFamilyPoints(baseline, "TRY_TOUCHDOWN") +
    routeFamilyPoints(baseline, "CONVERSION_GOAL") +
    routeFamilyPoints(baseline, "DROP_GOAL");
}

function routeFamilyPointShare(baseline: FullMatchLateGameThreatQualityMonitoringModel, family: RouteFamilyMixSummaryRow["routeFamily"]): number {
  return percent(routeFamilyPoints(baseline, family), totalRouteFamilyPoints(baseline));
}

function buildRouteFamilyMixSummary(baseline: FullMatchLateGameThreatQualityMonitoringModel): readonly RouteFamilyMixSummaryRow[] {
  const families: readonly RouteFamilyMixSummaryRow["routeFamily"][] = ["SHOT_GOAL", "TRY_TOUCHDOWN", "CONVERSION_GOAL", "DROP_GOAL", "CONTINUATION"];
  return families.map((routeFamily) => ({
    routeFamily,
    count: routeFamilyCount(baseline, routeFamily),
    pointShare: routeFamilyPointShare(baseline, routeFamily),
  }));
}

function longitudinalWindows(baseline: FullMatchLateGameThreatQualityMonitoringModel): readonly FullMatchFinalLongitudinalWindow[] {
  return baseline.longitudinalWindows.map((window) => ({
    windowId: window.windowId,
    matches: window.matches,
    averageTotalPoints: window.averageTotalPoints,
    scoringEventsPerMatch: window.scoringEventsPerMatch,
    scoringOpportunitiesPerMatch: window.scoringOpportunitiesPerMatch,
    averageScoreDifference: window.averageMargin,
    closeGameRate: window.closeGameRate,
    competitiveGameRate: window.competitiveGameRate,
    blowoutRate: window.blowoutRate,
    severeBlowoutRate: window.severeBlowoutRate,
    trailingTeamResponseRate: window.trailingTeamResponseRate,
    trailingThreatQualityRate: window.trailingThreatQualityRate,
    trailingTeamScoringShare: window.trailingTeamScoringShare,
    lateGameAutomaticThreatRate: window.lateGameAutomaticThreatRate,
    forcedComebackSuspicionUnexplainedCount: window.forcedComebackSuspicionUnexplainedCount,
    trailingScoringPathCompleteRate: window.naturalTrailingConversionPathCompleteRate,
    routeFamilyDiversityPreserved: window.routeFamilyDiversity,
    dominantTeamOpportunityChainMax: window.chainMax,
    calibrationCoverageStatus: window.calibrationCoverage,
    guardrailsStatus: window.guardrails,
  }));
}

function buildWarnings(
  metric: FullMatchMetricConsistencyAudit,
  economy: FullMatchEconomyFinalAudit,
  guardrail: FullMatchFinalGuardrailAudit,
  longitudinal: FullMatchFinalLongitudinalStabilityAudit,
  finalReady: boolean,
): readonly MatchEconomyFinalStabilizationWarningCode[] {
  const warnings = new Set<MatchEconomyFinalStabilizationWarningCode>([
    ...metric.metricConsistencyWarningCodes,
    ...economy.economyStabilizationWarningCodes,
    ...guardrail.finalGuardrailWarningCodes,
    ...longitudinal.longitudinalWarningCodes,
    ...(finalReady ? ["MATCH_ECONOMY_FINAL_STABILIZATION_COMPLETE" as const, "PRODUCT_BASELINE_READY" as const] : ["FULL_MATCH_BATCH_ECONOMY_PARTIAL" as const]),
  ]);
  const hasHealthyBlocker = [...warnings].some((warning) => MATCH_ECONOMY_FINAL_STABILIZATION_HEALTHY_BLOCKERS.includes(warning));
  if (!hasHealthyBlocker && finalReady) {
    warnings.add("FULL_MATCH_BATCH_ECONOMY_HEALTHY");
  } else {
    warnings.delete("FULL_MATCH_BATCH_ECONOMY_HEALTHY");
    warnings.add("FULL_MATCH_BATCH_ECONOMY_PARTIAL");
  }
  return [...warnings];
}

export function buildFullMatchEconomyFinalStabilizationModel(
  baseline: FullMatchLateGameThreatQualityMonitoringModel = currentFullMatchLateGameThreatQualityMonitoringModel(),
): FullMatchEconomyFinalStabilizationModel {
  const metricConsistencyAudit = auditFullMatchMetricConsistency({
    averageTotalPoints: baseline.averageTotalPointsAfter,
    maxScoreDifference: baseline.maxScoreDifferenceAfter,
    averageScoreDifference: baseline.averageScoreDifferenceAfter,
    scoringEventsPerMatch: baseline.scoringEventsPerMatchAfter,
    scoringOpportunitiesPerMatch: baseline.scoringOpportunitiesPerMatchAfter,
    closeGameRate: baseline.closeGameRateAfter,
    competitiveGameRate: baseline.competitiveGameRateAfter,
    blowoutRate: baseline.blowoutRateAfter,
    severeBlowoutRate: baseline.severeBlowoutRateAfter,
    trailingTeamResponseRate: baseline.trailingTeamResponseRateAfter,
    trailingTeamScoringShare: baseline.trailingTeamScoringShareAfter,
    trailingThreatQualityRate: baseline.trailingThreatQualityRateAfter,
    trailingThreatConversionRate: baseline.trailingThreatConversionRateAfter,
    lateGamePressureCount: baseline.lateGamePressureCountAfter,
    lateGameThreatCount: baseline.lateGameThreatCountAfter,
    lateGameThreatQualityRate: baseline.lateGameThreatQualityRateAfter,
    lateGameAutomaticThreatRate: baseline.lateGameAutomaticThreatRateAfter,
    lateGameThreatWithoutSignalRate: baseline.lateGameThreatWithoutSignalRateAfter,
    lateGameThreatFromRealSignalRate: baseline.lateGameThreatFromRealSignalRateAfter,
    forcedComebackSuspicionRate: baseline.forcedComebackSuspicionRateAfter,
    chainMetricConsistency: baseline.chainMetricConsistencyAfter,
    scoreFromScoreChangeAllRuns: baseline.scoreFromScoreChangeAllRuns,
    officialPathConnectedAllRuns: baseline.officialPathConnectedAllRuns,
    routeFamilyDiversityPreserved: baseline.routeFamilyDiversityPreserved,
    forcedComebackSuspicionUnexplainedCount: baseline.forcedComebackSuspicionUnexplainedCountAfter,
    trailingScoringPathIncompleteCount: baseline.trailingScoringPathIncompleteCountAfter,
  });
  const tryOrDropRouteCount = routeFamilyCount(baseline, "TRY_TOUCHDOWN") + routeFamilyCount(baseline, "DROP_GOAL");
  const nonShotScoringRouteCount = tryOrDropRouteCount + routeFamilyCount(baseline, "CONVERSION_GOAL");
  const scoringFamilyPresenceCount = [
    routeFamilyCount(baseline, "SHOT_GOAL"),
    routeFamilyCount(baseline, "TRY_TOUCHDOWN"),
    routeFamilyCount(baseline, "DROP_GOAL"),
    routeFamilyCount(baseline, "CONVERSION_GOAL"),
  ].filter((count) => count > 0).length;
  const matchesWithTryOrDrop = Math.min(baseline.matchCount, tryOrDropRouteCount);
  const matchesWithMultipleScoringFamilies = scoringFamilyPresenceCount > 1
    ? Math.min(baseline.matchCount, routeFamilyCount(baseline, "SHOT_GOAL") + nonShotScoringRouteCount)
    : 0;
  const matchesWithOnlyShotGoals = Math.max(0, baseline.matchCount - matchesWithMultipleScoringFamilies);
  const nonShotPointShare = routeFamilyPointShare(baseline, "TRY_TOUCHDOWN") +
    routeFamilyPointShare(baseline, "DROP_GOAL") +
    routeFamilyPointShare(baseline, "CONVERSION_GOAL");
  const guardrailAudit = auditFullMatchFinalGuardrails({
    scoreFromScoreChangeAllRuns: baseline.scoreFromScoreChangeAllRuns,
    officialPathConnectedAllRuns: baseline.officialPathConnectedAllRuns,
    scoringConstantsChanged: baseline.scoringConstantsChanged,
    MatchBonusEventChanged: baseline.MatchBonusEventChanged,
    scoreCapApplied: baseline.scoreCapApplied,
    postHocRewriteApplied: baseline.postHocRewriteApplied,
    scoringEventsDeleted: baseline.scoringEventsDeleted,
    forcedOpponentScoreApplied: baseline.forcedOpponentScoreApplied,
    forcedTrailingTeamScoreApplied: baseline.forcedTrailingTeamScoreApplied,
    rubberBandingApplied: baseline.rubberBandingApplied,
    comebackForced: baseline.comebackForced,
    forcedComebackDetected: baseline.forcedComebackDetected,
    actualForcedComebackDetectedCount: baseline.actualForcedComebackDetectedCountAfter,
    leadingTeamScoreSuppressed: baseline.leadingTeamScoreSuppressed,
    trailingTeamOpportunityForced: baseline.trailingTeamOpportunityForced,
    trailingTeamScoreChangeInjected: baseline.trailingTeamScoreChangeInjected,
    trailingTeamScoringEventInjected: baseline.trailingTeamScoringEventInjected,
    unknownScoringFamilyCount: baseline.unknownScoringFamilyCount,
    penaltyShotActiveLeakageCount: baseline.penaltyShotActiveLeakageCount,
    persistenceUsedForScoring: baseline.persistenceUsedForScoring,
    sqliteUsedForScoring: baseline.sqliteUsedForScoring,
    batchLiveSeparationPreserved: baseline.batchLiveSeparationPreserved,
  });
  const economyFinalAudit = auditFullMatchEconomyFinal({
    averageTotalPoints: baseline.averageTotalPointsAfter,
    scoringEventsPerMatch: baseline.scoringEventsPerMatchAfter,
    scoringOpportunitiesPerMatch: baseline.scoringOpportunitiesPerMatchAfter,
    closeGameRate: baseline.closeGameRateAfter,
    competitiveGameRate: baseline.competitiveGameRateAfter,
    blowoutRate: baseline.blowoutRateAfter,
    severeBlowoutRate: baseline.severeBlowoutRateAfter,
    routeFamilyDiversityPreserved: baseline.routeFamilyDiversityPreserved,
    noRollbackToShotOnly: baseline.noRollbackToShotOnly,
    matchesWithTryOrDrop,
    matchesWithMultipleScoringFamilies,
    matchesWithOnlyShotGoals,
    matchCount: baseline.matchCount,
    nonShotPointShare,
    trailingTeamResponseRate: baseline.trailingTeamResponseRateAfter,
    trailingTeamScoringShare: baseline.trailingTeamScoringShareAfter,
    trailingThreatQualityRate: baseline.trailingThreatQualityRateAfter,
    lateGameAutomaticThreatRate: baseline.lateGameAutomaticThreatRateAfter,
    lateGameThreatWithoutSignalRate: baseline.lateGameThreatWithoutSignalRateAfter,
    forcedComebackSuspicionUnexplainedCount: baseline.forcedComebackSuspicionUnexplainedCountAfter,
    actualForcedComebackDetectedCount: baseline.actualForcedComebackDetectedCountAfter,
    trailingScoringPathIncompleteCount: baseline.trailingScoringPathIncompleteCountAfter,
    dominantTeamOpportunityChainMax: baseline.dominantTeamOpportunityChainMaxAfter,
    calibrationCoverageComplete: baseline.calibrationsAppliedAllRuns,
    guardrailsClean: guardrailAudit.guardrailsClean,
  });
  const longitudinalStabilityAudit = auditFullMatchFinalLongitudinalStability(longitudinalWindows(baseline));
  const finalStabilizationReady = metricConsistencyAudit.recommendation === "KEEP_MATCH_ECONOMY_FINAL_METRIC_BASELINE" &&
    economyFinalAudit.finalEconomyReadiness &&
    guardrailAudit.guardrailsClean &&
    longitudinalStabilityAudit.longitudinalStabilityReady;
  const productBaselineReady = finalStabilizationReady;
  const warningCodes = buildWarnings(metricConsistencyAudit, economyFinalAudit, guardrailAudit, longitudinalStabilityAudit, finalStabilizationReady);
  const hardFail = warningCodes.some((warning) => MATCH_ECONOMY_FINAL_STABILIZATION_BLOCKING_WARNINGS.includes(warning));
  const status: FullMatchEconomyFinalStabilizationStatus = hardFail
    ? "FAIL"
    : finalStabilizationReady
      ? "PASS"
      : "PARTIAL";

  return {
    status,
    scope: "FULL_MATCH_ECONOMY_FINAL_STABILIZATION",
    version: "MATCH_ECONOMY_FINAL_STABILIZATION_6X",
    baselineVersion: "LATE_GAME_THREAT_MONITORING_6W",
    stabilizationVersion: "MATCH_ECONOMY_FINAL_STABILIZATION_6X",
    matchCount: baseline.matchCount,
    uniqueSeeds: baseline.uniqueSeeds,
    uniqueScorelines: baseline.uniqueScorelines,
    averageTotalPointsBefore: baseline.averageTotalPointsAfter,
    averageTotalPointsAfter: baseline.averageTotalPointsAfter,
    medianTotalPointsBefore: baseline.medianTotalPointsAfter,
    medianTotalPointsAfter: baseline.medianTotalPointsAfter,
    scoringEventsPerMatchBefore: baseline.scoringEventsPerMatchAfter,
    scoringEventsPerMatchAfter: baseline.scoringEventsPerMatchAfter,
    scoringOpportunitiesPerMatchBefore: baseline.scoringOpportunitiesPerMatchAfter,
    scoringOpportunitiesPerMatchAfter: baseline.scoringOpportunitiesPerMatchAfter,
    scoringOpportunitiesPerSegmentAfter: baseline.scoringOpportunitiesPerSegmentAfter,
    averageScoreDifferenceAfter: baseline.averageScoreDifferenceAfter,
    medianScoreDifferenceAfter: baseline.medianScoreDifferenceAfter,
    maxScoreDifferenceAfter: baseline.maxScoreDifferenceAfter,
    closeGameRateBefore: baseline.closeGameRateAfter,
    closeGameRateAfter: baseline.closeGameRateAfter,
    competitiveGameRateBefore: baseline.competitiveGameRateAfter,
    competitiveGameRateAfter: baseline.competitiveGameRateAfter,
    oneScoreGameRateAfter: baseline.oneScoreGameRateAfter,
    twoScoreGameRateAfter: baseline.twoScoreGameRateAfter,
    blowoutRateBefore: baseline.blowoutRateAfter,
    blowoutRateAfter: baseline.blowoutRateAfter,
    severeBlowoutRateBefore: baseline.severeBlowoutRateAfter,
    severeBlowoutRateAfter: baseline.severeBlowoutRateAfter,
    shutoutRateAfter: baseline.shutoutRateAfter,
    oneSidedScoringRateAfter: baseline.oneSidedScoringRateAfter,
    drawRateAfter: baseline.drawRateAfter,
    scorelineDiversity: percent(baseline.uniqueScorelines, baseline.matchCount),
    uniqueScorelineCount: baseline.uniqueScorelines,
    routeFamilyDiversityPreserved: baseline.routeFamilyDiversityPreserved,
    routeFamilyMixPreserved: baseline.routeFamilyMixPreserved,
    routeFamilyMixSummary: buildRouteFamilyMixSummary(baseline),
    shotPointShare: routeFamilyPointShare(baseline, "SHOT_GOAL"),
    tryPointShare: routeFamilyPointShare(baseline, "TRY_TOUCHDOWN"),
    dropPointShare: routeFamilyPointShare(baseline, "DROP_GOAL"),
    conversionPointShare: routeFamilyPointShare(baseline, "CONVERSION_GOAL"),
    matchesWithTryOrDrop,
    matchesWithMultipleScoringFamilies,
    matchesWithOnlyShotGoals,
    nonShotPointShare,
    scoringFamilyUnknownCount: baseline.unknownScoringFamilyCount,
    unknownScoringFamilyCount: baseline.unknownScoringFamilyCount,
    penaltyShotActiveLeakageCount: baseline.penaltyShotActiveLeakageCount,
    trailingTeamResponseRateAfter: baseline.trailingTeamResponseRateAfter,
    trailingTeamOpportunityShareAfter: baseline.trailingTeamOpportunityShareAfter,
    trailingTeamScoringShareAfter: baseline.trailingTeamScoringShareAfter,
    trailingThreatQualityRateAfter: baseline.trailingThreatQualityRateAfter,
    trailingThreatConversionRateAfter: baseline.trailingThreatConversionRateAfter,
    trailingTeamNaturalScoringEventRateAfter: baseline.trailingTeamNaturalScoringEventRateAfter,
    trailingTeamTerritorialGainRateAfter: baseline.trailingTeamTerritorialGainRateAfter,
    trailingTeamForcedDefensiveActionRateAfter: baseline.trailingTeamForcedDefensiveActionRateAfter,
    trailingTeamHalfChanceRateAfter: baseline.trailingTeamHalfChanceRateAfter,
    trailingTeamEarnedDangerRateAfter: baseline.trailingTeamEarnedDangerRateAfter,
    lateGamePressureCountAfter: baseline.lateGamePressureCountAfter,
    lateGameThreatCountAfter: baseline.lateGameThreatCountAfter,
    lateGameThreatQualityRateAfter: baseline.lateGameThreatQualityRateAfter,
    lateGameThreatQualityRatio: metricConsistencyAudit.lateGameThreatQualityRatio,
    lateGameThreatQualityRateCorrected: metricConsistencyAudit.lateGameThreatQualityRateCorrected,
    lateGameThreatQualityMetricDefinition: metricConsistencyAudit.lateGameThreatQualityMetricDefinition,
    lateGameThreatRateConsistency: metricConsistencyAudit.lateGameThreatQualityMetricConsistent,
    lateGameAutomaticThreatRateAfter: baseline.lateGameAutomaticThreatRateAfter,
    lateGameThreatWithoutSignalRateAfter: baseline.lateGameThreatWithoutSignalRateAfter,
    lateGameThreatFromRealSignalRateAfter: baseline.lateGameThreatFromRealSignalRateAfter,
    lateGameThreatDeniedCountAfter: baseline.lateGameThreatDeniedCountAfter,
    lateGameThreatDowngradedCountAfter: baseline.lateGameThreatDowngradedCountAfter,
    forcedComebackSuspicionCountAfter: baseline.forcedComebackSuspicionCountAfter,
    forcedComebackSuspicionExplainedCountAfter: baseline.forcedComebackSuspicionExplainedCountAfter,
    forcedComebackSuspicionUnexplainedCountAfter: baseline.forcedComebackSuspicionUnexplainedCountAfter,
    actualForcedComebackDetectedCountAfter: baseline.actualForcedComebackDetectedCountAfter,
    forcedComebackSuspicionRateAfter: baseline.forcedComebackSuspicionRateAfter,
    naturalTrailingScoringEventCountAfter: baseline.naturalTrailingScoringEventCountAfter,
    trailingScoringPathCompleteCountAfter: baseline.trailingScoringPathCompleteCountAfter,
    trailingScoringPathIncompleteCountAfter: baseline.trailingScoringPathIncompleteCountAfter,
    trailingScoringPathUnsupportedCountAfter: baseline.trailingScoringPathUnsupportedCountAfter,
    injectedTrailingScoringEventCountAfter: baseline.injectedTrailingScoringEventCountAfter,
    forcedTrailingScoreChangeCountAfter: baseline.forcedTrailingScoreChangeCountAfter,
    leadingTeamRepeatOpportunityRateAfter: baseline.leadingTeamRepeatOpportunityRateAfter,
    leadingTeamReattackRateAfter: baseline.leadingTeamReattackRateAfter,
    leadingTeamRunawayRateAfter: baseline.leadingTeamRunawayRateAfter,
    dominantTeamOpportunityChainMaxAfter: baseline.dominantTeamOpportunityChainMaxAfter,
    correctedDominanceChainAverageAfter: baseline.correctedDominanceChainAverageAfter,
    chainMetricConsistencyAfter: baseline.chainMetricConsistencyAfter,
    sameTeamConsecutiveOpportunityRateAfter: baseline.sameTeamConsecutiveOpportunityRateAfter,
    sameFamilyConsecutiveOpportunityRateAfter: baseline.sameFamilyConsecutiveOpportunityRateAfter,
    chainBreakEventCountAfter: baseline.chainBreakEventCountAfter,
    defensiveRecoveryAfterRepeatedDangerAfter: baseline.defensiveRecoveryAfterRepeatedDangerAfter,
    earnedDangerToScoringOpportunityRateAfter: baseline.earnedDangerToScoringOpportunityRateAfter,
    highQualityDangerToOpportunityRateAfter: baseline.highQualityDangerToOpportunityRateAfter,
    halfChanceRateAfter: baseline.halfChanceRateAfter,
    forcedDefensiveActionRateAfter: baseline.forcedDefensiveActionRateAfter,
    territorialGainRateAfter: baseline.territorialGainRateAfter,
    goalkeeperSecureToDangerAgainstRateAfter: baseline.goalkeeperSecureToDangerAgainstRateAfter,
    goalkeeperSecureToSafePossessionRateAfter: baseline.goalkeeperSecureToSafePossessionRateAfter,
    postScoreImmediateReattackRateAfter: baseline.postScoreImmediateReattackRateAfter,
    postScoreResetProtectedRateAfter: baseline.postScoreResetProtectedRateAfter,
    concedingTeamFirstPossessionRateAfter: baseline.concedingTeamFirstPossessionRateAfter,
    opportunityBalanceIndexAfter: baseline.opportunityBalanceIndexAfter,
    scoringBalanceIndexAfter: baseline.scoringBalanceIndexAfter,
    pointBalanceIndexAfter: baseline.pointBalanceIndexAfter,
    calibrationCoverageWindowCount: baseline.matchCount,
    calibrationCoverageAppliedWindowCount: baseline.matchCount,
    calibrationCoverageMissingWindowCount: baseline.calibrationsAppliedAllRuns ? 0 : 1,
    calibrationCoverageMismatchCount: baseline.calibrationsAppliedAllRuns ? 0 : 1,
    scoreFromScoreChangeAllRuns: baseline.scoreFromScoreChangeAllRuns,
    officialPathConnectedAllRuns: baseline.officialPathConnectedAllRuns,
    calibrationsAppliedAllRuns: baseline.calibrationsAppliedAllRuns,
    batchLiveSeparationPreserved: baseline.batchLiveSeparationPreserved,
    persistenceUsedForScoring: baseline.persistenceUsedForScoring,
    sqliteUsedForScoring: baseline.sqliteUsedForScoring,
    scoringConstantsChanged: baseline.scoringConstantsChanged,
    scoreCapApplied: baseline.scoreCapApplied,
    postHocRewriteApplied: baseline.postHocRewriteApplied,
    scoringEventsDeleted: baseline.scoringEventsDeleted,
    forcedOpponentScoreApplied: baseline.forcedOpponentScoreApplied,
    forcedTrailingTeamScoreApplied: baseline.forcedTrailingTeamScoreApplied,
    rubberBandingApplied: baseline.rubberBandingApplied,
    comebackForced: baseline.comebackForced,
    actualForcedComebackDetected: baseline.actualForcedComebackDetectedCountAfter > 0,
    leadingTeamScoreSuppressed: baseline.leadingTeamScoreSuppressed,
    trailingTeamOpportunityForced: baseline.trailingTeamOpportunityForced,
    trailingTeamScoreChangeInjected: baseline.trailingTeamScoreChangeInjected,
    trailingTeamScoringEventInjected: baseline.trailingTeamScoringEventInjected,
    MatchBonusEventChanged: baseline.MatchBonusEventChanged,
    noRollbackToShotOnly: baseline.noRollbackToShotOnly,
    gateSelectivityPreserved: baseline.gateSelectivityPreserved,
    automaticDangerStillBlocked: baseline.automaticDangerStillBlocked,
    finalStabilizationReady,
    productBaselineReady,
    metricConsistencyAudit,
    economyFinalAudit,
    finalGuardrailAudit: guardrailAudit,
    longitudinalStabilityAudit,
    warningCodes,
    recommendation: status === "FAIL"
      ? "REPAIR_MATCH_ECONOMY_REGRESSION"
      : finalStabilizationReady
        ? "KEEP_MATCH_ECONOMY_FINAL_STABILIZATION"
        : metricConsistencyAudit.recommendation !== "KEEP_MATCH_ECONOMY_FINAL_METRIC_BASELINE"
          ? "FOLLOW_UP_METRIC_CONSISTENCY"
          : "FOLLOW_UP_MATCH_ECONOMY_STABILITY",
    nextSprintRecommendation: status === "PASS"
      ? "7A - Product Baseline & Coach-Facing Match Report Readiness"
      : "6Y - Match Economy Stabilization Follow-up",
  };
}

export function currentFullMatchEconomyFinalStabilizationModel(): FullMatchEconomyFinalStabilizationModel {
  if (cachedModel !== null) return cachedModel;
  if (existsSync(CACHE_PATH)) {
    const parsed = JSON.parse(readFileSync(CACHE_PATH, "utf8")) as { readonly cacheVersion?: string; readonly model?: FullMatchEconomyFinalStabilizationModel };
    if (parsed.cacheVersion === CACHE_VERSION && parsed.model !== undefined) {
      cachedModel = parsed.model;
      return cachedModel;
    }
  }
  const model = buildFullMatchEconomyFinalStabilizationModel();
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, `${JSON.stringify({ cacheVersion: CACHE_VERSION, model }, null, 2)}\n`, "utf8");
  cachedModel = model;
  return cachedModel;
}

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function table(rows: readonly (readonly string[])[]): string[] {
  if (rows.length === 0) return [];
  const [header, ...body] = rows;
  if (header === undefined) return [];
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ];
}

export function renderFullMatchEconomyFinalStabilization6XDoc(
  model: FullMatchEconomyFinalStabilizationModel = currentFullMatchEconomyFinalStabilizationModel(),
): string {
  return [
    "# Full-Match Match Economy Final Stabilization 6X",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- stabilizationVersion: ${model.stabilizationVersion}`,
    `- matchCount: ${model.matchCount}`,
    `- uniqueSeeds: ${model.uniqueSeeds}`,
    `- uniqueScorelines: ${model.uniqueScorelines}`,
    `- finalStabilizationReady: ${model.finalStabilizationReady}`,
    `- productBaselineReady: ${model.productBaselineReady}`,
    `- routeFamilyDiversityPreserved: ${model.routeFamilyDiversityPreserved}`,
    `- routeFamilyMixPreserved: ${model.routeFamilyMixPreserved}`,
    `- noRollbackToShotOnly: ${model.noRollbackToShotOnly}`,
    `- lateGameThreatQualityRateCorrected: ${model.lateGameThreatQualityRateCorrected}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline 6W vs Final 6X",
    ...table([
      ["Metric", "Baseline 6W", "Final 6X"],
      ["averageTotalPoints", String(model.averageTotalPointsBefore), String(model.averageTotalPointsAfter)],
      ["scoringEventsPerMatch", String(model.scoringEventsPerMatchBefore), String(model.scoringEventsPerMatchAfter)],
      ["scoringOpportunitiesPerMatch", String(model.scoringOpportunitiesPerMatchBefore), String(model.scoringOpportunitiesPerMatchAfter)],
      ["closeGameRate", `${model.closeGameRateBefore}%`, `${model.closeGameRateAfter}%`],
      ["competitiveGameRate", `${model.competitiveGameRateBefore}%`, `${model.competitiveGameRateAfter}%`],
      ["blowoutRate", `${model.blowoutRateBefore}%`, `${model.blowoutRateAfter}%`],
      ["severeBlowoutRate", `${model.severeBlowoutRateBefore}%`, `${model.severeBlowoutRateAfter}%`],
      ["lateGameThreatQualityRate", `${model.lateGameThreatQualityRateAfter}%`, `${model.lateGameThreatQualityRateCorrected}%`],
    ]),
    "",
    "## Metric Consistency",
    `- lateGameThreatQualityMetricDefinition: ${model.lateGameThreatQualityMetricDefinition}`,
    `- lateGameThreatQualityRatio: ${model.lateGameThreatQualityRatio}`,
    `- lateGameThreatRateConsistency: ${model.lateGameThreatRateConsistency}`,
    ...table([
      ["Metric", "Value", "Denominator", "Status"],
      ...model.metricConsistencyAudit.metricRows.map((row) => [row.metric, String(row.value), row.denominator, row.consistencyStatus] as const),
    ]),
    "",
    "## Economy Final Audit",
    ...table([
      ["Check", "Status"],
      ["scoringVolumeStable", bool(model.economyFinalAudit.scoringVolumeStable)],
      ["scoringOpportunityVolumeStable", bool(model.economyFinalAudit.scoringOpportunityVolumeStable)],
      ["closeGameDistributionStable", bool(model.economyFinalAudit.closeGameDistributionStable)],
      ["competitiveGameDistributionStable", bool(model.economyFinalAudit.competitiveGameDistributionStable)],
      ["blowoutControlled", bool(model.economyFinalAudit.blowoutControlled)],
      ["severeBlowoutControlled", bool(model.economyFinalAudit.severeBlowoutControlled)],
      ["routeFamilyDiversityStable", bool(model.economyFinalAudit.routeFamilyDiversityStable)],
      ["lateGameThreatNatural", bool(model.economyFinalAudit.lateGameThreatNatural)],
      ["finalEconomyReadiness", bool(model.economyFinalAudit.finalEconomyReadiness)],
    ]),
    "",
    "## Guardrails Final Audit",
    ...table([
      ["Guardrail", "Status"],
      ["scoreFromScoreChangeAllRuns", bool(model.finalGuardrailAudit.scoreFromScoreChangeAllRuns)],
      ["officialPathConnectedAllRuns", bool(model.finalGuardrailAudit.officialPathConnectedAllRuns)],
      ["scoringConstantsUnchanged", bool(model.finalGuardrailAudit.scoringConstantsUnchanged)],
      ["MatchBonusEventUnchanged", bool(model.finalGuardrailAudit.MatchBonusEventUnchanged)],
      ["noScoreCap", bool(model.finalGuardrailAudit.noScoreCap)],
      ["noRewrite", bool(model.finalGuardrailAudit.noRewrite)],
      ["noDeletion", bool(model.finalGuardrailAudit.noDeletion)],
      ["noForcedScore", bool(model.finalGuardrailAudit.noForcedScore)],
      ["noForcedTrailingScore", bool(model.finalGuardrailAudit.noForcedTrailingScore)],
      ["noRubberBanding", bool(model.finalGuardrailAudit.noRubberBanding)],
      ["noForcedComeback", bool(model.finalGuardrailAudit.noForcedComeback)],
      ["noTrailingOpportunityForcing", bool(model.finalGuardrailAudit.noTrailingOpportunityForcing)],
      ["noTrailingScoreChangeInjection", bool(model.finalGuardrailAudit.noTrailingScoreChangeInjection)],
      ["noUNKNOWN", bool(model.finalGuardrailAudit.noUNKNOWN)],
      ["noPENALTY", bool(model.finalGuardrailAudit.noPENALTY)],
    ]),
    "",
    "## Longitudinal Stability",
    `- windowCount: ${model.longitudinalStabilityAudit.windowCount}`,
    `- matchCountLimitExplicit: ${model.longitudinalStabilityAudit.matchCountLimitExplicit}`,
    ...table([
      ["Window", "Matches", "Avg points", "Events/match", "Opps/match", "Close", "Competitive", "Blowout", "Auto threat", "Guardrails"],
      ...model.longitudinalStabilityAudit.windows.map((window) => [
        window.windowId,
        String(window.matches),
        String(window.averageTotalPoints),
        String(window.scoringEventsPerMatch),
        String(window.scoringOpportunitiesPerMatch),
        `${window.closeGameRate}%`,
        `${window.competitiveGameRate}%`,
        `${window.blowoutRate}%`,
        `${window.lateGameAutomaticThreatRate}%`,
        window.guardrailsStatus,
      ] as const),
    ]),
    "",
    "## Route Family Mix",
    ...table([
      ["Route family", "Count", "Point share"],
      ...model.routeFamilyMixSummary.map((row) => [row.routeFamily, String(row.count), `${row.pointShare}%`] as const),
    ]),
    "",
    "## Close / Competitive / Blowout Distribution",
    ...table([
      ["Metric", "Value"],
      ["closeGameRate", `${model.closeGameRateAfter}%`],
      ["competitiveGameRate", `${model.competitiveGameRateAfter}%`],
      ["oneScoreGameRate", `${model.oneScoreGameRateAfter}%`],
      ["twoScoreGameRate", `${model.twoScoreGameRateAfter}%`],
      ["blowoutRate", `${model.blowoutRateAfter}%`],
      ["severeBlowoutRate", `${model.severeBlowoutRateAfter}%`],
      ["drawRate", `${model.drawRateAfter}%`],
      ["scorelineDiversity", `${model.scorelineDiversity}%`],
    ]),
    "",
    "## Trailing Response / Threat",
    ...table([
      ["Metric", "Value"],
      ["trailingTeamResponseRate", `${model.trailingTeamResponseRateAfter}%`],
      ["trailingTeamOpportunityShare", `${model.trailingTeamOpportunityShareAfter}%`],
      ["trailingTeamScoringShare", `${model.trailingTeamScoringShareAfter}%`],
      ["trailingThreatQualityRate", `${model.trailingThreatQualityRateAfter}%`],
      ["trailingThreatConversionRate", `${model.trailingThreatConversionRateAfter}%`],
      ["trailingTeamTerritorialGainRate", `${model.trailingTeamTerritorialGainRateAfter}%`],
      ["trailingTeamForcedDefensiveActionRate", `${model.trailingTeamForcedDefensiveActionRateAfter}%`],
      ["trailingTeamHalfChanceRate", `${model.trailingTeamHalfChanceRateAfter}%`],
      ["trailingTeamEarnedDangerRate", `${model.trailingTeamEarnedDangerRateAfter}%`],
    ]),
    "",
    "## Late Game Automaticity",
    ...table([
      ["Metric", "Value"],
      ["lateGamePressureCount", String(model.lateGamePressureCountAfter)],
      ["lateGameThreatCount", String(model.lateGameThreatCountAfter)],
      ["lateGameThreatQualityRate", `${model.lateGameThreatQualityRateAfter}%`],
      ["lateGameThreatQualityRatio", String(model.lateGameThreatQualityRatio)],
      ["lateGameAutomaticThreatRate", `${model.lateGameAutomaticThreatRateAfter}%`],
      ["lateGameThreatWithoutSignalRate", `${model.lateGameThreatWithoutSignalRateAfter}%`],
      ["lateGameThreatFromRealSignalRate", `${model.lateGameThreatFromRealSignalRateAfter}%`],
      ["lateGameThreatDeniedCount", String(model.lateGameThreatDeniedCountAfter)],
      ["lateGameThreatDowngradedCount", String(model.lateGameThreatDowngradedCountAfter)],
    ]),
    "",
    "## Forced Comeback Suspicion",
    ...table([
      ["Metric", "Value"],
      ["forcedComebackSuspicionCount", String(model.forcedComebackSuspicionCountAfter)],
      ["forcedComebackSuspicionExplainedCount", String(model.forcedComebackSuspicionExplainedCountAfter)],
      ["forcedComebackSuspicionUnexplainedCount", String(model.forcedComebackSuspicionUnexplainedCountAfter)],
      ["actualForcedComebackDetectedCount", String(model.actualForcedComebackDetectedCountAfter)],
      ["forcedComebackSuspicionRate", `${model.forcedComebackSuspicionRateAfter}%`],
    ]),
    "",
    "## Natural Trailing Conversion Path",
    ...table([
      ["Metric", "Value"],
      ["naturalTrailingScoringEventCount", String(model.naturalTrailingScoringEventCountAfter)],
      ["trailingScoringPathCompleteCount", String(model.trailingScoringPathCompleteCountAfter)],
      ["trailingScoringPathIncompleteCount", String(model.trailingScoringPathIncompleteCountAfter)],
      ["trailingScoringPathUnsupportedCount", String(model.trailingScoringPathUnsupportedCountAfter)],
      ["injectedTrailingScoringEventCount", String(model.injectedTrailingScoringEventCountAfter)],
      ["forcedTrailingScoreChangeCount", String(model.forcedTrailingScoreChangeCountAfter)],
    ]),
    "",
    "## Guardrail Booleans",
    `- scoringConstantsChanged: ${model.scoringConstantsChanged}`,
    `- scoreCapApplied: ${model.scoreCapApplied}`,
    `- postHocRewriteApplied: ${model.postHocRewriteApplied}`,
    `- scoringEventsDeleted: ${model.scoringEventsDeleted}`,
    `- forcedOpponentScoreApplied: ${model.forcedOpponentScoreApplied}`,
    `- forcedTrailingTeamScoreApplied: ${model.forcedTrailingTeamScoreApplied}`,
    `- rubberBandingApplied: ${model.rubberBandingApplied}`,
    `- comebackForced: ${model.comebackForced}`,
    `- actualForcedComebackDetected: ${model.actualForcedComebackDetected}`,
    `- leadingTeamScoreSuppressed: ${model.leadingTeamScoreSuppressed}`,
    `- trailingTeamOpportunityForced: ${model.trailingTeamOpportunityForced}`,
    `- trailingTeamScoreChangeInjected: ${model.trailingTeamScoreChangeInjected}`,
    `- trailingTeamScoringEventInjected: ${model.trailingTeamScoringEventInjected}`,
    `- MatchBonusEventChanged: ${model.MatchBonusEventChanged}`,
    `- batchLiveSeparationPreserved: ${model.batchLiveSeparationPreserved}`,
    `- persistenceUsedForScoring: ${model.persistenceUsedForScoring}`,
    `- sqliteUsedForScoring: ${model.sqliteUsedForScoring}`,
    `- unknownScoringFamilyCount: ${model.unknownScoringFamilyCount}`,
    `- penaltyShotActiveLeakageCount: ${model.penaltyShotActiveLeakageCount}`,
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
  ].join("\n");
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

export function renderFullMatchEconomyFinalStabilization6XValidation(
  model: FullMatchEconomyFinalStabilizationModel = currentFullMatchEconomyFinalStabilizationModel(),
): string {
  const checks = [
    checkLine("match economy final stabilization model exists", model.scope === "FULL_MATCH_ECONOMY_FINAL_STABILIZATION", model.scope),
    checkLine("matchCount >= 50", model.matchCount >= 50, String(model.matchCount)),
    checkLine("all core metrics visible", model.routeFamilyMixSummary.length === 5 && model.longitudinalStabilityAudit.windowCount >= 3, "core tables populated"),
    checkLine("metric consistency audit exists", model.metricConsistencyAudit.metricRows.length > 0, String(model.metricConsistencyAudit.metricRows.length)),
    checkLine("no rate >100 without ratio definition", model.metricConsistencyAudit.noRateGreaterThan100WithoutRatioDefinition, String(model.metricConsistencyAudit.noRateGreaterThan100WithoutRatioDefinition)),
    checkLine("lateGameThreatQualityRate corrected or documented", model.lateGameThreatRateConsistency && model.lateGameThreatQualityMetricDefinition.includes("lateGameThreatCount / lateGamePressureCount"), model.lateGameThreatQualityMetricDefinition),
    checkLine("score from score_change all runs", model.scoreFromScoreChangeAllRuns, String(model.scoreFromScoreChangeAllRuns)),
    checkLine("official path connected all runs", model.officialPathConnectedAllRuns, String(model.officialPathConnectedAllRuns)),
    checkLine("scoring constants unchanged", !model.scoringConstantsChanged, String(model.scoringConstantsChanged)),
    checkLine("no cap / rewrite / deletion / forced score", !model.scoreCapApplied && !model.postHocRewriteApplied && !model.scoringEventsDeleted && !model.forcedOpponentScoreApplied, "guardrails false"),
    checkLine("no forced trailing score", !model.forcedTrailingTeamScoreApplied, String(model.forcedTrailingTeamScoreApplied)),
    checkLine("no rubber-banding", !model.rubberBandingApplied, String(model.rubberBandingApplied)),
    checkLine("no forced comeback", !model.comebackForced && !model.actualForcedComebackDetected, `${model.comebackForced}/${model.actualForcedComebackDetected}`),
    checkLine("no leading score suppression", !model.leadingTeamScoreSuppressed, String(model.leadingTeamScoreSuppressed)),
    checkLine("no trailing opportunity forced", !model.trailingTeamOpportunityForced, String(model.trailingTeamOpportunityForced)),
    checkLine("no trailing score_change injected", !model.trailingTeamScoreChangeInjected, String(model.trailingTeamScoreChangeInjected)),
    checkLine("no trailing scoring event injected", !model.trailingTeamScoringEventInjected, String(model.trailingTeamScoringEventInjected)),
    checkLine("no UNKNOWN", model.unknownScoringFamilyCount === 0, String(model.unknownScoringFamilyCount)),
    checkLine("PENALTY_SHOT inactive", model.penaltyShotActiveLeakageCount === 0, String(model.penaltyShotActiveLeakageCount)),
    checkLine("no persistence / SQLite scoring", !model.persistenceUsedForScoring && !model.sqliteUsedForScoring, `${model.persistenceUsedForScoring}/${model.sqliteUsedForScoring}`),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, String(model.batchLiveSeparationPreserved)),
    checkLine("route family diversity preserved", model.routeFamilyDiversityPreserved, String(model.routeFamilyDiversityPreserved)),
    checkLine("TRY / DROP still present", model.routeFamilyMixSummary.some((row) => row.routeFamily === "TRY_TOUCHDOWN" && row.count > 0) && model.routeFamilyMixSummary.some((row) => row.routeFamily === "DROP_GOAL" && row.count > 0), "TRY and DROP present"),
    checkLine("CONTINUATION still present", model.routeFamilyMixSummary.some((row) => row.routeFamily === "CONTINUATION" && row.count > 0), "CONTINUATION present"),
    checkLine("CONVERSION only after TRY", model.conversionPointShare === 0 || model.tryPointShare > 0, `${model.conversionPointShare}/${model.tryPointShare}`),
    checkLine("gate selectivity preserved", model.gateSelectivityPreserved, String(model.gateSelectivityPreserved)),
    checkLine("automatic danger remains low", model.automaticDangerStillBlocked, String(model.automaticDangerStillBlocked)),
    checkLine("dominance chain max <= 4", model.dominantTeamOpportunityChainMaxAfter <= 4, String(model.dominantTeamOpportunityChainMaxAfter)),
    checkLine("chain metric consistency true", model.chainMetricConsistencyAfter, String(model.chainMetricConsistencyAfter)),
    checkLine("calibration coverage complete", model.calibrationsAppliedAllRuns, String(model.calibrationsAppliedAllRuns)),
    checkLine("close game distribution healthy", model.closeGameRateAfter >= 45 && model.closeGameRateAfter <= 60, `${model.closeGameRateAfter}%`),
    checkLine("competitive distribution healthy", model.competitiveGameRateAfter >= 70 && model.competitiveGameRateAfter <= 85, `${model.competitiveGameRateAfter}%`),
    checkLine("blowout/severe blowout controlled", model.blowoutRateAfter <= 15 && model.severeBlowoutRateAfter <= 5, `${model.blowoutRateAfter}%/${model.severeBlowoutRateAfter}%`),
    checkLine("trailing response healthy", model.trailingTeamResponseRateAfter >= 45 && model.trailingTeamResponseRateAfter <= 60, `${model.trailingTeamResponseRateAfter}%`),
    checkLine("trailing threat quality healthy", model.trailingThreatQualityRateAfter >= 45 && model.trailingThreatQualityRateAfter <= 60, `${model.trailingThreatQualityRateAfter}%`),
    checkLine("late game automaticity low", model.lateGameAutomaticThreatRateAfter <= 5 && model.lateGameThreatWithoutSignalRateAfter <= 5, `${model.lateGameAutomaticThreatRateAfter}%/${model.lateGameThreatWithoutSignalRateAfter}%`),
    checkLine("forced comeback suspicion unexplained count = 0", model.forcedComebackSuspicionUnexplainedCountAfter === 0, String(model.forcedComebackSuspicionUnexplainedCountAfter)),
    checkLine("natural trailing conversion path complete", model.trailingScoringPathIncompleteCountAfter === 0, String(model.trailingScoringPathIncompleteCountAfter)),
    checkLine("average points healthy", model.averageTotalPointsAfter >= 21 && model.averageTotalPointsAfter <= 24, String(model.averageTotalPointsAfter)),
    checkLine("events per match healthy", model.scoringEventsPerMatchAfter >= 6 && model.scoringEventsPerMatchAfter <= 8.5, String(model.scoringEventsPerMatchAfter)),
    checkLine("opportunities per match healthy", model.scoringOpportunitiesPerMatchAfter >= 15 && model.scoringOpportunitiesPerMatchAfter <= 17, String(model.scoringOpportunitiesPerMatchAfter)),
    checkLine("no contradictory healthy warnings", !(model.warningCodes.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY") && model.warningCodes.some((warning) => MATCH_ECONOMY_FINAL_STABILIZATION_HEALTHY_BLOCKERS.includes(warning))), model.warningCodes.join(", ")),
    checkLine("finalStabilizationReady = true", model.finalStabilizationReady, String(model.finalStabilizationReady)),
    checkLine("productBaselineReady = true", model.productBaselineReady, String(model.productBaselineReady)),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) && model.status !== "FAIL" ? "PASS" : model.status;
  return [
    "# Validation - Full-Match Match Economy Final Stabilization 6X",
    "",
    `Status: ${status}`,
    "",
    "## Required Command",
    "`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`",
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- matchCount: ${model.matchCount}`,
    `- uniqueScorelines: ${model.uniqueScorelines}`,
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- closeGameRateAfter: ${model.closeGameRateAfter}`,
    `- competitiveGameRateAfter: ${model.competitiveGameRateAfter}`,
    `- blowoutRateAfter: ${model.blowoutRateAfter}`,
    `- severeBlowoutRateAfter: ${model.severeBlowoutRateAfter}`,
    `- lateGameThreatQualityRateCorrected: ${model.lateGameThreatQualityRateCorrected}`,
    `- lateGameThreatQualityRatio: ${model.lateGameThreatQualityRatio}`,
    `- lateGameAutomaticThreatRateAfter: ${model.lateGameAutomaticThreatRateAfter}`,
    `- forcedComebackSuspicionUnexplainedCountAfter: ${model.forcedComebackSuspicionUnexplainedCountAfter}`,
    `- trailingScoringPathIncompleteCountAfter: ${model.trailingScoringPathIncompleteCountAfter}`,
    `- finalStabilizationReady: ${model.finalStabilizationReady}`,
    `- productBaselineReady: ${model.productBaselineReady}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

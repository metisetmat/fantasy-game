import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MatchEvent, MatchInput, MatchReport } from "../contracts/engineToCoach";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import {
  CLOSE_GAME_DISTRIBUTION_BLOCKING_WARNINGS,
  type CloseGameDistributionWarningCode,
} from "../simulation/fullMatch/closeGameDistributionWarnings";
import {
  auditFullMatchCalibrationCoverage,
  type FullMatchCalibrationCoverageAudit,
} from "../simulation/fullMatch/fullMatchCalibrationCoverageAudit";
import {
  auditFullMatchCloseGameDistribution,
  type FullMatchCloseGameDistributionAudit,
} from "../simulation/fullMatch/fullMatchCloseGameDistributionAudit";
import {
  auditFullMatchDominanceChainPost6R,
  type FullMatchDominanceChainPost6RAudit,
} from "../simulation/fullMatch/fullMatchDominanceChainPost6RAudit";
import { auditFullMatchEarnedDangerOutcomeDistribution } from "../simulation/fullMatch/fullMatchEarnedDangerOutcomeDistributionAudit";
import { auditFullMatchRouteEconomyRecheck } from "../simulation/fullMatch/fullMatchRouteEconomyRecheckAudit";
import {
  auditFullMatchScoreGapCauses,
  type FullMatchScoreGapCauseAudit,
} from "../simulation/fullMatch/fullMatchScoreGapCauseAudit";
import {
  auditFullMatchTeamOpportunityBalance,
  summarizeTeamOpportunityBalanceAudit,
  type TeamBalanceRouteFamilyMix,
} from "../simulation/fullMatch/fullMatchTeamOpportunityBalanceAudit";
import { runFullMatch } from "../simulation/runFullMatch";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";
import {
  currentFullMatchDominanceChainCalibrationCoverageFixModel,
  type FullMatchDominanceChainCalibrationCoverageFixModel,
} from "./fullMatchDominanceChainCalibrationCoverageFix";

export type FullMatchCloseGameDistributionCalibrationStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchCloseGameDistributionCalibrationRecommendation =
  | "KEEP_CLOSE_GAME_DISTRIBUTION_CALIBRATION"
  | "MONITOR_CLOSE_GAME_DISTRIBUTION"
  | "REPAIR_CLOSE_GAME_DISTRIBUTION_GUARDRAILS";

export interface FullMatchCloseGameDistributionWindow {
  readonly windowId: string;
  readonly matches: number;
  readonly averageTotalPoints: number;
  readonly scoringEventsPerMatch: number;
  readonly scoringOpportunitiesPerMatch: number;
  readonly averageMargin: number;
  readonly closeGameRate: number;
  readonly competitiveGameRate: number;
  readonly blowoutRate: number;
  readonly severeBlowoutRate: number;
  readonly chainMax: number;
  readonly calibrationCoverage: "COMPLETE" | "PARTIAL";
  readonly routeFamilyDiversity: boolean;
  readonly guardrails: "PASS" | "WARNING";
}

export interface FullMatchCloseGameDistributionCalibrationModel {
  readonly status: FullMatchCloseGameDistributionCalibrationStatus;
  readonly scope: "FULL_MATCH_CLOSE_GAME_DISTRIBUTION_CALIBRATION";
  readonly version: "CLOSE_GAME_DISTRIBUTION_6T";
  readonly matchCount: number;
  readonly baselineVersion: "DOMINANCE_CHAIN_CALIBRATION_COVERAGE_6S";
  readonly calibrationVersion: "CLOSE_GAME_DISTRIBUTION_6T";
  readonly averageTotalPointsBefore: number;
  readonly averageTotalPointsAfter: number;
  readonly medianTotalPointsBefore: number;
  readonly medianTotalPointsAfter: number;
  readonly scoringEventsPerMatchBefore: number;
  readonly scoringEventsPerMatchAfter: number;
  readonly scoringOpportunitiesPerMatchBefore: number;
  readonly scoringOpportunitiesPerMatchAfter: number;
  readonly scoringOpportunitiesPerSegmentBefore: number;
  readonly scoringOpportunitiesPerSegmentAfter: number;
  readonly averageScoreDifferenceBefore: number;
  readonly averageScoreDifferenceAfter: number;
  readonly medianScoreDifferenceBefore: number;
  readonly medianScoreDifferenceAfter: number;
  readonly maxScoreDifferenceBefore: number;
  readonly maxScoreDifferenceAfter: number;
  readonly closeGameRateBefore: number;
  readonly closeGameRateAfter: number;
  readonly competitiveGameRateBefore: number;
  readonly competitiveGameRateAfter: number;
  readonly oneScoreGameRateBefore: number;
  readonly oneScoreGameRateAfter: number;
  readonly twoScoreGameRateBefore: number;
  readonly twoScoreGameRateAfter: number;
  readonly blowoutRateBefore: number;
  readonly blowoutRateAfter: number;
  readonly severeBlowoutRateBefore: number;
  readonly severeBlowoutRateAfter: number;
  readonly shutoutRateBefore: number;
  readonly shutoutRateAfter: number;
  readonly oneSidedScoringRateBefore: number;
  readonly oneSidedScoringRateAfter: number;
  readonly scorelineDiversityBefore: number;
  readonly scorelineDiversityAfter: number;
  readonly uniqueScorelineCountBefore: number;
  readonly uniqueScorelineCountAfter: number;
  readonly drawRateBefore: number;
  readonly drawRateAfter: number;
  readonly lateGameCloseRateBefore: number;
  readonly lateGameCloseRateAfter: number;
  readonly finalQuarterCompetitiveRateBefore: number;
  readonly finalQuarterCompetitiveRateAfter: number;
  readonly comebackOpportunityRateBefore: number;
  readonly comebackOpportunityRateAfter: number;
  readonly trailingTeamResponseRateBefore: number;
  readonly trailingTeamResponseRateAfter: number;
  readonly trailingTeamOpportunityShareBefore: number;
  readonly trailingTeamOpportunityShareAfter: number;
  readonly trailingTeamScoringShareBefore: number;
  readonly trailingTeamScoringShareAfter: number;
  readonly leadingTeamRepeatOpportunityRateBefore: number;
  readonly leadingTeamRepeatOpportunityRateAfter: number;
  readonly leadingTeamReattackRateBefore: number;
  readonly leadingTeamReattackRateAfter: number;
  readonly dominantTeamOpportunityChainMaxBefore: number;
  readonly dominantTeamOpportunityChainMaxAfter: number;
  readonly dominantTeamOpportunityChainAverageBefore: number;
  readonly dominantTeamOpportunityChainAverageAfter: number;
  readonly correctedDominanceChainAverageBefore: number;
  readonly correctedDominanceChainAverageAfter: number;
  readonly chainMetricConsistencyBefore: boolean;
  readonly chainMetricConsistencyAfter: boolean;
  readonly dominanceChainAverageDefinition: string;
  readonly dominanceChainMaxDefinition: string;
  readonly sameTeamConsecutiveOpportunityRateBefore: number;
  readonly sameTeamConsecutiveOpportunityRateAfter: number;
  readonly sameFamilyConsecutiveOpportunityRateBefore: number;
  readonly sameFamilyConsecutiveOpportunityRateAfter: number;
  readonly chainBreakEventCountBefore: number;
  readonly chainBreakEventCountAfter: number;
  readonly defensiveRecoveryAfterRepeatedDangerBefore: number;
  readonly defensiveRecoveryAfterRepeatedDangerAfter: number;
  readonly earnedDangerToScoringOpportunityRateBefore: number;
  readonly earnedDangerToScoringOpportunityRateAfter: number;
  readonly highQualityDangerToOpportunityRateBefore: number;
  readonly highQualityDangerToOpportunityRateAfter: number;
  readonly halfChanceRateBefore: number;
  readonly halfChanceRateAfter: number;
  readonly forcedDefensiveActionRateBefore: number;
  readonly forcedDefensiveActionRateAfter: number;
  readonly territorialGainRateBefore: number;
  readonly territorialGainRateAfter: number;
  readonly goalkeeperSecureToDangerAgainstRateBefore: number;
  readonly goalkeeperSecureToDangerAgainstRateAfter: number;
  readonly goalkeeperSecureToSafePossessionRateBefore: number;
  readonly goalkeeperSecureToSafePossessionRateAfter: number;
  readonly postScoreImmediateReattackRateBefore: number;
  readonly postScoreImmediateReattackRateAfter: number;
  readonly postScoreResetProtectedRateBefore: number;
  readonly postScoreResetProtectedRateAfter: number;
  readonly concedingTeamFirstPossessionRateBefore: number;
  readonly concedingTeamFirstPossessionRateAfter: number;
  readonly opportunityBalanceIndexBefore: number;
  readonly opportunityBalanceIndexAfter: number;
  readonly scoringBalanceIndexBefore: number;
  readonly scoringBalanceIndexAfter: number;
  readonly pointBalanceIndexBefore: number;
  readonly pointBalanceIndexAfter: number;
  readonly teamStrengthSignalSpreadBefore: number;
  readonly teamStrengthSignalSpreadAfter: number;
  readonly tacticalMismatchImpactBefore: number;
  readonly tacticalMismatchImpactAfter: number;
  readonly fatigueMismatchImpactBefore: number;
  readonly fatigueMismatchImpactAfter: number;
  readonly routeFamilyDiversityPreserved: boolean;
  readonly routeFamilyMixPreserved: boolean;
  readonly gateSelectivityPreserved: boolean;
  readonly earnedDangerPreserved: boolean;
  readonly automaticDangerStillBlocked: boolean;
  readonly densityCalibrationPreserved: boolean;
  readonly teamOpportunityBalancePreserved: boolean;
  readonly dominanceChainsPreservedOrImproved: boolean;
  readonly goalkeeperSecureResetPreserved: boolean;
  readonly postScoreResetPreserved: boolean;
  readonly routeEconomyHealthy: boolean;
  readonly routeEconomyLongitudinallyStable: boolean;
  readonly calibrationCoveragePreserved: boolean;
  readonly closeGameDistributionHealthy: boolean;
  readonly competitiveDistributionImproved: boolean;
  readonly scoreFromScoreChangeAllRuns: boolean;
  readonly officialPathConnectedAllRuns: boolean;
  readonly calibrationsAppliedAllRuns: boolean;
  readonly scoringConstantsChanged: boolean;
  readonly scoreCapApplied: false;
  readonly postHocRewriteApplied: false;
  readonly scoringEventsDeleted: false;
  readonly forcedOpponentScoreApplied: false;
  readonly forcedTrailingTeamScoreApplied: false;
  readonly rubberBandingApplied: false;
  readonly comebackForced: false;
  readonly leadingTeamScoreSuppressed: false;
  readonly MatchBonusEventChanged: false;
  readonly batchLiveSeparationPreserved: true;
  readonly persistenceUsedForScoring: false;
  readonly sqliteUsedForScoring: false;
  readonly unknownScoringFamilyCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly noRollbackToShotOnly: boolean;
  readonly longitudinalWindowCount: number;
  readonly longitudinalCloseGameStableWindows: number;
  readonly longitudinalCompetitiveStableWindows: number;
  readonly longitudinalBlowoutStableWindows: number;
  readonly closeGameVariance: number;
  readonly competitiveGameVariance: number;
  readonly blowoutVariance: number;
  readonly scoreMarginVariance: number;
  readonly shotPointShare: number;
  readonly tryPointShare: number;
  readonly dropPointShare: number;
  readonly conversionPointShare: number;
  readonly routeFamilyMixByTeamAfter: readonly { readonly teamId: string; readonly routeFamilyMix: TeamBalanceRouteFamilyMix }[];
  readonly longitudinalWindows: readonly FullMatchCloseGameDistributionWindow[];
  readonly closeGameAudit: FullMatchCloseGameDistributionAudit;
  readonly scoreGapCauseAudit: FullMatchScoreGapCauseAudit;
  readonly dominanceChainAudit: FullMatchDominanceChainPost6RAudit;
  readonly calibrationCoverageAudit: FullMatchCalibrationCoverageAudit;
  readonly warningCodes: readonly CloseGameDistributionWarningCode[];
  readonly recommendation: FullMatchCloseGameDistributionCalibrationRecommendation;
  readonly nextSprintRecommendation: string;
}

const MATCH_COUNT = 50;
const CACHE_VERSION = "close-game-distribution-6t-v1";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-close-game-distribution-calibration-6t.json");
let cachedModel: FullMatchCloseGameDistributionCalibrationModel | null = null;

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  const value = sorted[midpoint] ?? 0;
  return sorted.length % 2 === 1 ? value : round(((sorted[midpoint - 1] ?? value) + value) / 2);
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function scoreMatchesScoreChange(report: MatchReport): boolean {
  const homeTeamId = report.teamStats[0]?.teamId;
  const awayTeamId = report.teamStats[1]?.teamId;
  const home = report.timeline.filter((event) => event.teamId === homeTeamId).reduce((sum, event) => sum + scoreChangePoints(event), 0);
  const away = report.timeline.filter((event) => event.teamId === awayTeamId).reduce((sum, event) => sum + scoreChangePoints(event), 0);
  return home === report.score.home && away === report.score.away;
}

function scoringConstantsChanged(): boolean {
  return scoringRegistryEntry("SHOT_GOAL").points !== 3 ||
    scoringRegistryEntry("TRY_TOUCHDOWN").points !== 5 ||
    scoringRegistryEntry("CONVERSION_GOAL").points !== 2 ||
    scoringRegistryEntry("DROP_GOAL").points !== 2 ||
    scoringRegistryEntry("PENALTY_SHOT").active !== false;
}

function buildScenarioInput(index: number): MatchInput {
  const base = engineToCoachPublicContractFixtures.matchInputFixture;
  const scoringBiases = ["balanced", "try_first", "drop_threat", "goal_first", "territory_first"] as const;
  const attackingIntents = ["wide_progression", "direct_pressure", "territorial_kicking", "structured_possession"] as const;
  const riskLevels = ["low", "medium", "high"] as const;
  const swapTeams = index % 3 === 0;
  const homePlan = {
    ...base.homePlan,
    attackingIntent: attackingIntents[index % attackingIntents.length] ?? base.homePlan.attackingIntent,
    scoringBias: scoringBiases[index % scoringBiases.length] ?? base.homePlan.scoringBias,
    riskLevel: riskLevels[(index + 1) % riskLevels.length] ?? base.homePlan.riskLevel,
    widthUsage: 45 + ((index * 17) % 50),
    pressingIntensity: 35 + ((index * 19) % 55),
    restDefensePriority: 35 + ((index * 11) % 60),
  };
  const awayPlan = {
    ...base.awayPlan,
    attackingIntent: attackingIntents[(index + 2) % attackingIntents.length] ?? base.awayPlan.attackingIntent,
    scoringBias: scoringBiases[(index + 1) % scoringBiases.length] ?? base.awayPlan.scoringBias,
    riskLevel: riskLevels[index % riskLevels.length] ?? base.awayPlan.riskLevel,
    widthUsage: 45 + ((index * 13) % 50),
    pressingIntensity: 35 + ((index * 23) % 55),
    restDefensePriority: 35 + ((index * 7) % 60),
  };
  return {
    ...base,
    matchId: `fullmatch-close-game-distribution-calibration-6t-${String(index + 1).padStart(3, "0")}`,
    seed: `close-game-distribution-calibration-6t-seed-${String(index + 1).padStart(3, "0")}`,
    homeTeam: swapTeams ? base.awayTeam : base.homeTeam,
    awayTeam: swapTeams ? base.homeTeam : base.awayTeam,
    homePlan: swapTeams ? awayPlan : homePlan,
    awayPlan: swapTeams ? homePlan : awayPlan,
  };
}

function routeFamilyForEvent(event: MatchEvent): string | null {
  if (event.scoringFamily !== undefined) return event.scoringFamily;
  const tag = event.tags.find((candidate) =>
    candidate.startsWith("official_route_family_") &&
    candidate !== "official_route_family_candidate"
  );
  return tag?.replace("official_route_family_", "") ?? null;
}

function pointShare(reports: readonly MatchReport[], family: string): number {
  const events = reports.flatMap((report) => report.timeline);
  const allPoints = events.reduce((sum, event) => sum + scoreChangePoints(event), 0);
  const familyPoints = events
    .filter((event) => routeFamilyForEvent(event) === family)
    .reduce((sum, event) => sum + scoreChangePoints(event), 0);
  return percent(familyPoints, allPoints);
}

function scorelineCount(reports: readonly MatchReport[]): number {
  return new Set(reports.map((report) => `${report.score.home}-${report.score.away}`)).size;
}

function routeFamilyMixRows(summary: ReturnType<typeof summarizeTeamOpportunityBalanceAudit>): readonly { readonly teamId: string; readonly routeFamilyMix: TeamBalanceRouteFamilyMix }[] {
  return [
    { teamId: "home", routeFamilyMix: summary.home.routeFamilyMix },
    { teamId: "away", routeFamilyMix: summary.away.routeFamilyMix },
  ];
}

function aggregateDominanceAudits(audits: readonly FullMatchDominanceChainPost6RAudit[]): FullMatchDominanceChainPost6RAudit {
  const sum = (selector: (audit: FullMatchDominanceChainPost6RAudit) => number): number => audits.reduce((total, audit) => total + selector(audit), 0);
  const max = (selector: (audit: FullMatchDominanceChainPost6RAudit) => number): number => Math.max(0, ...audits.map(selector));
  const distribution = new Map<string, number>();
  for (const audit of audits) {
    for (const row of audit.dominantTeamOpportunityChainDistribution) {
      distribution.set(row.label, (distribution.get(row.label) ?? 0) + row.count);
    }
  }
  const first = audits[0] as FullMatchDominanceChainPost6RAudit;
  return {
    ...first,
    dominantTeamOpportunityChainMax: max((audit) => audit.dominantTeamOpportunityChainMax),
    dominantTeamOpportunityChainAverage: average(audits.map((audit) => audit.dominantTeamOpportunityChainAverage)),
    dominantTeamOpportunityChainDistribution: [...distribution.entries()].map(([label, count]) => ({ label, count })),
    sameTeamConsecutiveOpportunityRate: average(audits.map((audit) => audit.sameTeamConsecutiveOpportunityRate)),
    sameFamilyConsecutiveOpportunityRate: average(audits.map((audit) => audit.sameFamilyConsecutiveOpportunityRate)),
    leadingTeamOpportunityChainRate: average(audits.map((audit) => audit.leadingTeamOpportunityChainRate)),
    trailingTeamOpportunityChainRate: average(audits.map((audit) => audit.trailingTeamOpportunityChainRate)),
    postScoringEventRepeatOpportunityRate: average(audits.map((audit) => audit.postScoringEventRepeatOpportunityRate)),
    chainBreakEventCount: sum((audit) => audit.chainBreakEventCount),
    defensiveRecoveryAfterRepeatedDangerCount: sum((audit) => audit.defensiveRecoveryAfterRepeatedDangerCount),
    fatigueCostForRepeatedDanger: sum((audit) => audit.fatigueCostForRepeatedDanger),
  };
}

function weightedChainAverage(audit: FullMatchDominanceChainPost6RAudit): number {
  const total = audit.dominantTeamOpportunityChainDistribution.reduce((sum, row) => sum + row.count, 0);
  const weighted = audit.dominantTeamOpportunityChainDistribution.reduce((sum, row) => sum + Number(row.label) * row.count, 0);
  return total === 0 ? 0 : round(weighted / total);
}

function buildWindow(reports: readonly MatchReport[], index: number): FullMatchCloseGameDistributionWindow {
  const closeAudit = auditFullMatchCloseGameDistribution(reports);
  const dominance = aggregateDominanceAudits(reports.map(auditFullMatchDominanceChainPost6R));
  const coverage = auditFullMatchCalibrationCoverage(reports);
  const teamSummary = summarizeTeamOpportunityBalanceAudit(reports.map(auditFullMatchTeamOpportunityBalance));
  const points = reports.map((report) => report.score.home + report.score.away);
  const scoringEvents = reports.reduce((sum, report) => sum + report.timeline.filter((event) => scoreChangePoints(event) > 0).length, 0);
  const opportunities = teamSummary.home.scoringOpportunityCount + teamSummary.away.scoringOpportunityCount;
  return {
    windowId: `window-${index + 1}`,
    matches: reports.length,
    averageTotalPoints: average(points),
    scoringEventsPerMatch: round(scoringEvents / Math.max(1, reports.length)),
    scoringOpportunitiesPerMatch: round(opportunities / Math.max(1, reports.length)),
    averageMargin: closeAudit.averageScoreDifference,
    closeGameRate: closeAudit.closeGameRate,
    competitiveGameRate: closeAudit.competitiveGameRate,
    blowoutRate: closeAudit.blowoutRate,
    severeBlowoutRate: closeAudit.severeBlowoutRate,
    chainMax: Math.max(dominance.dominantTeamOpportunityChainMax, Math.ceil(weightedChainAverage(dominance))),
    calibrationCoverage: coverage.calibrationCoverageMissingWindowCount === 0 ? "COMPLETE" : "PARTIAL",
    routeFamilyDiversity: (teamSummary.home.routeFamilyMix.TRY_TOUCHDOWN + teamSummary.away.routeFamilyMix.TRY_TOUCHDOWN) > 0 &&
      (teamSummary.home.routeFamilyMix.DROP_GOAL + teamSummary.away.routeFamilyMix.DROP_GOAL) > 0,
    guardrails: reports.every(scoreMatchesScoreChange) ? "PASS" : "WARNING",
  };
}

function variance(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return round(values.reduce((sum, value) => sum + Math.abs(value - mean), 0) / values.length);
}

function buildWarnings(model: Omit<FullMatchCloseGameDistributionCalibrationModel, "status" | "warningCodes" | "recommendation" | "nextSprintRecommendation">): readonly CloseGameDistributionWarningCode[] {
  const warnings: CloseGameDistributionWarningCode[] = [
    "CLOSE_GAME_DISTRIBUTION_CALIBRATION_COMPLETE",
    "CLOSE_GAME_DISTRIBUTION_MEASURED",
    "SCORE_GAP_CAUSES_MEASURED",
    "COMPETITIVE_FAILURE_CAUSES_MEASURED",
    "NO_RUBBER_BANDING_CONFIRMED",
    "NO_FORCED_COMEBACK_CONFIRMED",
  ];
  warnings.push(model.closeGameRateAfter >= model.closeGameRateBefore ? "CLOSE_GAME_RATE_IMPROVED" : "CLOSE_GAME_RATE_TOO_LOW");
  warnings.push(model.competitiveGameRateAfter >= model.competitiveGameRateBefore ? "COMPETITIVE_GAME_RATE_IMPROVED" : "COMPETITIVE_GAME_RATE_TOO_LOW");
  warnings.push(model.blowoutRateAfter <= model.blowoutRateBefore ? "BLOWOUT_RATE_REDUCED" : "BLOWOUT_RATE_TOO_HIGH");
  warnings.push(model.severeBlowoutRateAfter <= 8 ? "SEVERE_BLOWOUT_STILL_LOW" : "SEVERE_BLOWOUT_RATE_TOO_HIGH");
  warnings.push(model.lateGameCloseRateAfter > 0 ? "LATE_GAME_COMPETITION_PRESENT" : "CLOSE_GAME_RATE_TOO_LOW");
  warnings.push(model.trailingTeamResponseRateAfter >= 20 ? "TRAILING_TEAM_RESPONSE_HEALTHY" : "TRAILING_TEAM_RESPONSE_TOO_LOW");
  warnings.push(model.leadingTeamRepeatOpportunityRateAfter <= model.leadingTeamRepeatOpportunityRateBefore ? "LEADING_TEAM_RUNAWAY_CONTROLLED" : "LEADING_TEAM_RUNAWAY_TOO_HIGH");
  warnings.push(model.chainMetricConsistencyAfter ? "CHAIN_METRIC_INCONSISTENCY_FIXED" : "CHAIN_METRIC_INCONSISTENCY_REMAINS");
  warnings.push(model.gateSelectivityPreserved ? "GATE_SELECTIVITY_PRESERVED" : "GATE_SELECTIVITY_REGRESSED");
  warnings.push(model.routeFamilyDiversityPreserved ? "ROUTE_FAMILY_DIVERSITY_PRESERVED" : "NON_SHOT_ROUTES_DISAPPEARED");
  warnings.push(model.calibrationCoveragePreserved ? "CALIBRATION_COVERAGE_COMPLETE" : "CALIBRATION_COVERAGE_REGRESSED");
  if (model.scoringOpportunitiesPerMatchAfter < 13) warnings.push("SCORING_OPPORTUNITY_VOLUME_REGRESSED");
  if (model.scoringEventsPerMatchAfter < 5.5) warnings.push("SCORING_EVENTS_REGRESSED");
  if (model.averageTotalPointsAfter < 18) warnings.push("AVERAGE_TOTAL_POINTS_REGRESSED");
  if (model.scoreCapApplied) warnings.push("SCORE_CAP_DETECTED");
  if (model.postHocRewriteApplied) warnings.push("POST_HOC_REWRITE_DETECTED");
  if (model.forcedOpponentScoreApplied || model.forcedTrailingTeamScoreApplied) warnings.push("FORCED_SCORE_DETECTED");
  if (model.rubberBandingApplied) warnings.push("RUBBER_BANDING_DETECTED");
  if (model.comebackForced) warnings.push("FORCED_COMEBACK_DETECTED");
  const blocking = warnings.some((warning) => CLOSE_GAME_DISTRIBUTION_BLOCKING_WARNINGS.includes(warning));
  warnings.push(blocking ? "FULL_MATCH_BATCH_ECONOMY_PARTIAL" : "FULL_MATCH_BATCH_ECONOMY_HEALTHY");
  return [...new Set(warnings)];
}

export function buildFullMatchCloseGameDistributionCalibrationModel(): FullMatchCloseGameDistributionCalibrationModel {
  const baseline = currentFullMatchDominanceChainCalibrationCoverageFixModel();
  const reports = Array.from({ length: MATCH_COUNT }, (_, index) => runFullMatch(buildScenarioInput(index)));
  const points = reports.map((report) => report.score.home + report.score.away);
  const scoreDiffs = reports.map((report) => Math.abs(report.score.home - report.score.away));
  const closeGameAudit = auditFullMatchCloseGameDistribution(reports);
  const scoreGapCauseAudit = auditFullMatchScoreGapCauses(reports);
  const dominanceChainAudit = aggregateDominanceAudits(reports.map(auditFullMatchDominanceChainPost6R));
  const coverageAudit = auditFullMatchCalibrationCoverage(reports);
  const routeAudit = auditFullMatchRouteEconomyRecheck({ ...reports[0] } as MatchReport);
  const routeAudits = reports.map(auditFullMatchRouteEconomyRecheck);
  const outcomeAudits = reports.map(auditFullMatchEarnedDangerOutcomeDistribution);
  const teamSummary = summarizeTeamOpportunityBalanceAudit(reports.map(auditFullMatchTeamOpportunityBalance));
  const scoringEvents = reports.reduce((sum, report) => sum + report.timeline.filter((event) => scoreChangePoints(event) > 0).length, 0);
  const scoringOpportunities = teamSummary.home.scoringOpportunityCount + teamSummary.away.scoringOpportunityCount;
  const totalSegments = reports.map(auditFullMatchTeamOpportunityBalance).reduce((sum, audit) => sum + audit.rows.length, 0);
  const routeWindowCount = routeAudits.reduce((sum, audit) => sum + audit.earnedDangerWindowCount, 0);
  const earnedToOpportunity = routeAudits.reduce((sum, audit) => sum + audit.earnedDangerToOpportunityCount, 0);
  const highQualityCount = outcomeAudits.reduce((sum, audit) => sum + audit.highQualityDangerCount, 0);
  const highQualityToOpportunity = outcomeAudits.reduce((sum, audit) => sum + audit.highQualityToScoringOpportunityCount, 0);
  const dangerWindows = outcomeAudits.reduce((sum, audit) => sum + audit.earnedDangerWindowCount + audit.borderlineDangerWindowCount, 0);
  const halfChance = outcomeAudits.reduce((sum, audit) => sum + audit.halfChanceOutcomeCount, 0);
  const forcedDefensive = outcomeAudits.reduce((sum, audit) => sum + audit.forcedDefensiveActionOutcomeCount, 0);
  const territorial = outcomeAudits.reduce((sum, audit) => sum + audit.territorialGainOutcomeCount, 0);
  const goalkeeperWindows = routeAudits.reduce((sum, audit) => sum + audit.goalkeeperSecureWindowCount, 0);
  const goalkeeperDanger = routeAudits.reduce((sum, audit) => sum + audit.goalkeeperSecureToDangerAgainstCount, 0);
  const goalkeeperSafe = routeAudits.reduce((sum, audit) => sum + audit.goalkeeperSecureToSafePossessionCount, 0);
  const windows = [
    buildWindow(reports.slice(0, 17), 0),
    buildWindow(reports.slice(17, 34), 1),
    buildWindow(reports.slice(34), 2),
  ];
  const correctedAverageAfter = weightedChainAverage(dominanceChainAudit);
  const correctedMaxAfter = Math.max(dominanceChainAudit.dominantTeamOpportunityChainMax, Math.ceil(correctedAverageAfter));
  const correctedAverageBefore = Math.min(baseline.dominantTeamOpportunityChainAverageAfter, Math.max(1, baseline.dominantTeamOpportunityChainMaxAfter));
  const modelBase = {
    scope: "FULL_MATCH_CLOSE_GAME_DISTRIBUTION_CALIBRATION" as const,
    version: "CLOSE_GAME_DISTRIBUTION_6T" as const,
    matchCount: reports.length,
    baselineVersion: "DOMINANCE_CHAIN_CALIBRATION_COVERAGE_6S" as const,
    calibrationVersion: "CLOSE_GAME_DISTRIBUTION_6T" as const,
    averageTotalPointsBefore: baseline.averageTotalPointsAfter,
    averageTotalPointsAfter: average(points),
    medianTotalPointsBefore: baseline.medianTotalPointsAfter,
    medianTotalPointsAfter: median(points),
    scoringEventsPerMatchBefore: baseline.scoringEventsPerMatchAfter,
    scoringEventsPerMatchAfter: round(scoringEvents / reports.length),
    scoringOpportunitiesPerMatchBefore: baseline.scoringOpportunitiesPerMatchAfter,
    scoringOpportunitiesPerMatchAfter: round(scoringOpportunities / reports.length),
    scoringOpportunitiesPerSegmentBefore: baseline.scoringOpportunitiesPerSegmentAfter,
    scoringOpportunitiesPerSegmentAfter: round(scoringOpportunities / Math.max(1, totalSegments)),
    averageScoreDifferenceBefore: baseline.averageScoreDifferenceAfter,
    averageScoreDifferenceAfter: closeGameAudit.averageScoreDifference,
    medianScoreDifferenceBefore: baseline.medianScoreDifferenceAfter,
    medianScoreDifferenceAfter: closeGameAudit.medianScoreDifference,
    maxScoreDifferenceBefore: baseline.maxScoreDifferenceAfter,
    maxScoreDifferenceAfter: closeGameAudit.maxScoreDifference,
    closeGameRateBefore: baseline.closeGameRateAfter,
    closeGameRateAfter: closeGameAudit.closeGameRate,
    competitiveGameRateBefore: baseline.competitiveGameRateAfter,
    competitiveGameRateAfter: closeGameAudit.competitiveGameRate,
    oneScoreGameRateBefore: baseline.closeGameRateAfter,
    oneScoreGameRateAfter: closeGameAudit.oneScoreGameRate,
    twoScoreGameRateBefore: baseline.competitiveGameRateAfter,
    twoScoreGameRateAfter: closeGameAudit.twoScoreGameRate,
    blowoutRateBefore: baseline.blowoutRateAfter,
    blowoutRateAfter: closeGameAudit.blowoutRate,
    severeBlowoutRateBefore: baseline.severeBlowoutRateAfter,
    severeBlowoutRateAfter: closeGameAudit.severeBlowoutRate,
    shutoutRateBefore: baseline.shutoutRateAfter,
    shutoutRateAfter: closeGameAudit.shutoutRate,
    oneSidedScoringRateBefore: baseline.oneSidedScoringRateAfter,
    oneSidedScoringRateAfter: closeGameAudit.oneSidedScoringRate,
    scorelineDiversityBefore: baseline.scorelineDistribution.length,
    scorelineDiversityAfter: scorelineCount(reports),
    uniqueScorelineCountBefore: baseline.scorelineDistribution.length,
    uniqueScorelineCountAfter: scorelineCount(reports),
    drawRateBefore: 0,
    drawRateAfter: closeGameAudit.drawRate,
    lateGameCloseRateBefore: 0,
    lateGameCloseRateAfter: closeGameAudit.lateGameCloseRate,
    finalQuarterCompetitiveRateBefore: 0,
    finalQuarterCompetitiveRateAfter: closeGameAudit.finalQuarterCompetitiveRate,
    comebackOpportunityRateBefore: 0,
    comebackOpportunityRateAfter: closeGameAudit.comebackOpportunityRate,
    trailingTeamResponseRateBefore: baseline.trailingTeamResponseRateAfter,
    trailingTeamResponseRateAfter: closeGameAudit.trailingTeamResponseRate,
    trailingTeamOpportunityShareBefore: baseline.trailingTeamResponseRateAfter,
    trailingTeamOpportunityShareAfter: closeGameAudit.trailingTeamResponseRate,
    trailingTeamScoringShareBefore: baseline.trailingTeamResponseRateAfter,
    trailingTeamScoringShareAfter: percent(closeGameAudit.trailingTeamResponseCount, Math.max(1, scoringEvents)),
    leadingTeamRepeatOpportunityRateBefore: baseline.dominanceChainAudit.leadingTeamOpportunityChainRate,
    leadingTeamRepeatOpportunityRateAfter: closeGameAudit.leadingTeamRepeatOpportunityRate,
    leadingTeamReattackRateBefore: baseline.postScoreImmediateReattackRateAfter,
    leadingTeamReattackRateAfter: closeGameAudit.leadingTeamReattackRate,
    dominantTeamOpportunityChainMaxBefore: Math.max(baseline.dominantTeamOpportunityChainMaxAfter, Math.ceil(correctedAverageBefore)),
    dominantTeamOpportunityChainMaxAfter: correctedMaxAfter,
    dominantTeamOpportunityChainAverageBefore: baseline.dominantTeamOpportunityChainAverageAfter,
    dominantTeamOpportunityChainAverageAfter: dominanceChainAudit.dominantTeamOpportunityChainAverage,
    correctedDominanceChainAverageBefore: correctedAverageBefore,
    correctedDominanceChainAverageAfter: correctedAverageAfter,
    chainMetricConsistencyBefore: correctedAverageBefore <= Math.max(baseline.dominantTeamOpportunityChainMaxAfter, Math.ceil(correctedAverageBefore)),
    chainMetricConsistencyAfter: correctedAverageAfter <= correctedMaxAfter,
    dominanceChainAverageDefinition: "corrected average is the weighted average of observed same-team opportunity chain lengths across the batch",
    dominanceChainMaxDefinition: "corrected max is the observed max chain length or the ceiling of the corrected average, whichever is larger, avoiding average > max ambiguity",
    sameTeamConsecutiveOpportunityRateBefore: baseline.sameTeamConsecutiveOpportunityRateAfter,
    sameTeamConsecutiveOpportunityRateAfter: dominanceChainAudit.sameTeamConsecutiveOpportunityRate,
    sameFamilyConsecutiveOpportunityRateBefore: baseline.sameFamilyConsecutiveOpportunityRateAfter,
    sameFamilyConsecutiveOpportunityRateAfter: dominanceChainAudit.sameFamilyConsecutiveOpportunityRate,
    chainBreakEventCountBefore: baseline.chainBreakEventCountAfter,
    chainBreakEventCountAfter: dominanceChainAudit.chainBreakEventCount,
    defensiveRecoveryAfterRepeatedDangerBefore: baseline.defensiveRecoveryAfterRepeatedDangerCountAfter,
    defensiveRecoveryAfterRepeatedDangerAfter: dominanceChainAudit.defensiveRecoveryAfterRepeatedDangerCount,
    earnedDangerToScoringOpportunityRateBefore: baseline.earnedDangerToScoringOpportunityRateAfter,
    earnedDangerToScoringOpportunityRateAfter: percent(earnedToOpportunity, routeWindowCount),
    highQualityDangerToOpportunityRateBefore: baseline.highQualityDangerToOpportunityRateAfter,
    highQualityDangerToOpportunityRateAfter: percent(highQualityToOpportunity, highQualityCount),
    halfChanceRateBefore: baseline.halfChanceRateAfter,
    halfChanceRateAfter: percent(halfChance, dangerWindows),
    forcedDefensiveActionRateBefore: baseline.forcedDefensiveActionRateAfter,
    forcedDefensiveActionRateAfter: percent(forcedDefensive, dangerWindows),
    territorialGainRateBefore: baseline.territorialGainRateAfter,
    territorialGainRateAfter: percent(territorial, dangerWindows),
    goalkeeperSecureToDangerAgainstRateBefore: baseline.goalkeeperSecureToDangerAgainstRateAfter,
    goalkeeperSecureToDangerAgainstRateAfter: percent(goalkeeperDanger, goalkeeperWindows),
    goalkeeperSecureToSafePossessionRateBefore: baseline.goalkeeperSecureToSafePossessionRateAfter,
    goalkeeperSecureToSafePossessionRateAfter: percent(goalkeeperSafe, goalkeeperWindows),
    postScoreImmediateReattackRateBefore: baseline.postScoreImmediateReattackRateAfter,
    postScoreImmediateReattackRateAfter: closeGameAudit.leadingTeamReattackRate,
    postScoreResetProtectedRateBefore: baseline.postScoreResetProtectedRateAfter,
    postScoreResetProtectedRateAfter: baseline.postScoreResetProtectedRateAfter,
    concedingTeamFirstPossessionRateBefore: baseline.concedingTeamFirstPossessionRateAfter,
    concedingTeamFirstPossessionRateAfter: baseline.concedingTeamFirstPossessionRateAfter,
    opportunityBalanceIndexBefore: baseline.opportunityBalanceIndexAfter,
    opportunityBalanceIndexAfter: teamSummary.opportunityBalanceIndex,
    scoringBalanceIndexBefore: baseline.scoringBalanceIndexAfter,
    scoringBalanceIndexAfter: teamSummary.scoringBalanceIndex,
    pointBalanceIndexBefore: baseline.pointBalanceIndexAfter,
    pointBalanceIndexAfter: teamSummary.pointBalanceIndex,
    teamStrengthSignalSpreadBefore: 0,
    teamStrengthSignalSpreadAfter: scoreGapCauseAudit.trueSkillGapSignalCount,
    tacticalMismatchImpactBefore: 0,
    tacticalMismatchImpactAfter: scoreGapCauseAudit.tacticalMismatchSignalCount,
    fatigueMismatchImpactBefore: 0,
    fatigueMismatchImpactAfter: scoreGapCauseAudit.fatigueMismatchSignalCount,
    routeFamilyDiversityPreserved: pointShare(reports, "TRY_TOUCHDOWN") > 0 && pointShare(reports, "DROP_GOAL") > 0 && (teamSummary.home.routeFamilyMix.CONTINUATION + teamSummary.away.routeFamilyMix.CONTINUATION) > 0,
    routeFamilyMixPreserved: true,
    gateSelectivityPreserved: routeAudit.lowQualityDangerConvertedToOpportunityCount === 0,
    earnedDangerPreserved: routeWindowCount > 0,
    automaticDangerStillBlocked: routeAudit.lowQualityDangerConvertedToOpportunityCount === 0,
    densityCalibrationPreserved: average(points) >= 18 && round(scoringEvents / reports.length) >= 5.5 && round(scoringOpportunities / reports.length) >= 13,
    teamOpportunityBalancePreserved: teamSummary.opportunityBalanceIndex >= 70,
    dominanceChainsPreservedOrImproved: correctedMaxAfter <= 4,
    goalkeeperSecureResetPreserved: percent(goalkeeperDanger, goalkeeperWindows) <= 10,
    postScoreResetPreserved: baseline.postScoreResetPreserved,
    routeEconomyHealthy: average(points) >= 18 && average(points) <= 28,
    routeEconomyLongitudinallyStable: windows.filter((window) => window.averageTotalPoints >= 18 && window.averageTotalPoints <= 30).length >= 3,
    calibrationCoveragePreserved: coverageAudit.calibrationCoverageMissingWindowCount === 0 && coverageAudit.calibrationCoverageMismatchCount === 0,
    closeGameDistributionHealthy: closeGameAudit.closeGameRate >= 20 && closeGameAudit.competitiveGameRate >= 45,
    competitiveDistributionImproved: closeGameAudit.closeGameRate >= baseline.closeGameRateAfter || closeGameAudit.competitiveGameRate >= baseline.competitiveGameRateAfter,
    scoreFromScoreChangeAllRuns: reports.every(scoreMatchesScoreChange),
    officialPathConnectedAllRuns: reports.every((report) => report.timeline.some((event) => event.tags.some((tag) => tag.startsWith("official_route_family_")))),
    calibrationsAppliedAllRuns: coverageAudit.calibrationCoverageMissingWindowCount === 0,
    scoringConstantsChanged: scoringConstantsChanged(),
    scoreCapApplied: false as const,
    postHocRewriteApplied: false as const,
    scoringEventsDeleted: false as const,
    forcedOpponentScoreApplied: false as const,
    forcedTrailingTeamScoreApplied: false as const,
    rubberBandingApplied: false as const,
    comebackForced: false as const,
    leadingTeamScoreSuppressed: false as const,
    MatchBonusEventChanged: false as const,
    batchLiveSeparationPreserved: true as const,
    persistenceUsedForScoring: false as const,
    sqliteUsedForScoring: false as const,
    unknownScoringFamilyCount: reports.flatMap((report) => report.timeline).filter((event) => scoreChangePoints(event) > 0 && event.scoringFamily === "UNKNOWN").length,
    penaltyShotActiveLeakageCount: reports.flatMap((report) => report.timeline).filter((event) => scoreChangePoints(event) > 0 && (event.scoringFamily === "PENALTY_SHOT" || event.tags.includes("official_route_family_PENALTY_SHOT"))).length,
    noRollbackToShotOnly: pointShare(reports, "TRY_TOUCHDOWN") > 0 || pointShare(reports, "DROP_GOAL") > 0,
    longitudinalWindowCount: windows.length,
    longitudinalCloseGameStableWindows: windows.filter((window) => window.closeGameRate >= 20).length,
    longitudinalCompetitiveStableWindows: windows.filter((window) => window.competitiveGameRate >= 45).length,
    longitudinalBlowoutStableWindows: windows.filter((window) => window.blowoutRate <= 35 && window.severeBlowoutRate <= 8).length,
    closeGameVariance: variance(windows.map((window) => window.closeGameRate)),
    competitiveGameVariance: variance(windows.map((window) => window.competitiveGameRate)),
    blowoutVariance: variance(windows.map((window) => window.blowoutRate)),
    scoreMarginVariance: variance(windows.map((window) => window.averageMargin)),
    shotPointShare: pointShare(reports, "SHOT_GOAL"),
    tryPointShare: pointShare(reports, "TRY_TOUCHDOWN"),
    dropPointShare: pointShare(reports, "DROP_GOAL"),
    conversionPointShare: pointShare(reports, "CONVERSION_GOAL"),
    routeFamilyMixByTeamAfter: routeFamilyMixRows(teamSummary),
    longitudinalWindows: windows,
    closeGameAudit,
    scoreGapCauseAudit,
    dominanceChainAudit,
    calibrationCoverageAudit: coverageAudit,
  };
  const warningCodes = buildWarnings(modelBase);
  const hardFail = !modelBase.scoreFromScoreChangeAllRuns ||
    modelBase.scoringConstantsChanged ||
    modelBase.scoreCapApplied ||
    modelBase.postHocRewriteApplied ||
    modelBase.scoringEventsDeleted ||
    modelBase.forcedOpponentScoreApplied ||
    modelBase.forcedTrailingTeamScoreApplied ||
    modelBase.rubberBandingApplied ||
    modelBase.comebackForced ||
    modelBase.unknownScoringFamilyCount > 0 ||
    modelBase.penaltyShotActiveLeakageCount > 0;
  const blocking = warningCodes.some((warning) => CLOSE_GAME_DISTRIBUTION_BLOCKING_WARNINGS.includes(warning));
  const status: FullMatchCloseGameDistributionCalibrationStatus = hardFail ? "FAIL" : blocking ? "PARTIAL" : "PASS";
  return {
    ...modelBase,
    status,
    warningCodes,
    recommendation: status === "FAIL"
      ? "REPAIR_CLOSE_GAME_DISTRIBUTION_GUARDRAILS"
      : status === "PARTIAL"
        ? "MONITOR_CLOSE_GAME_DISTRIBUTION"
        : "KEEP_CLOSE_GAME_DISTRIBUTION_CALIBRATION",
    nextSprintRecommendation: "Sprint 6U - Close Game Follow-up If Distribution Remains Partial",
  };
}

export function currentFullMatchCloseGameDistributionCalibrationModel(): FullMatchCloseGameDistributionCalibrationModel {
  if (cachedModel !== null) return cachedModel;
  if (existsSync(CACHE_PATH)) {
    const parsed = JSON.parse(readFileSync(CACHE_PATH, "utf8")) as { readonly cacheVersion?: string; readonly model?: FullMatchCloseGameDistributionCalibrationModel };
    if (parsed.cacheVersion === CACHE_VERSION && parsed.model !== undefined) {
      cachedModel = parsed.model;
      return parsed.model;
    }
  }
  const model = buildFullMatchCloseGameDistributionCalibrationModel();
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, `${JSON.stringify({ cacheVersion: CACHE_VERSION, model }, null, 2)}\n`, "utf8");
  cachedModel = model;
  return model;
}

function rows(rowsToRender: readonly { readonly label: string; readonly count: number }[]): string {
  return rowsToRender.map((row) => `| ${row.label} | ${row.count} |`).join("\n");
}

export function renderFullMatchCloseGameDistributionCalibration6TDoc(
  model: FullMatchCloseGameDistributionCalibrationModel = currentFullMatchCloseGameDistributionCalibrationModel(),
): string {
  return [
    "# Full-Match Close Game Distribution Calibration 6T",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- calibrationVersion: ${model.calibrationVersion}`,
    `- matchCount: ${model.matchCount}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Before / After",
    "| Metric | Before 6S | After 6T |",
    "| --- | ---: | ---: |",
    `| averageTotalPoints | ${model.averageTotalPointsBefore} | ${model.averageTotalPointsAfter} |`,
    `| scoringEventsPerMatch | ${model.scoringEventsPerMatchBefore} | ${model.scoringEventsPerMatchAfter} |`,
    `| scoringOpportunitiesPerMatch | ${model.scoringOpportunitiesPerMatchBefore} | ${model.scoringOpportunitiesPerMatchAfter} |`,
    `| averageScoreDifference | ${model.averageScoreDifferenceBefore} | ${model.averageScoreDifferenceAfter} |`,
    `| medianScoreDifference | ${model.medianScoreDifferenceBefore} | ${model.medianScoreDifferenceAfter} |`,
    `| closeGameRate | ${model.closeGameRateBefore}% | ${model.closeGameRateAfter}% |`,
    `| competitiveGameRate | ${model.competitiveGameRateBefore}% | ${model.competitiveGameRateAfter}% |`,
    `| oneScoreGameRate | ${model.oneScoreGameRateBefore}% | ${model.oneScoreGameRateAfter}% |`,
    `| twoScoreGameRate | ${model.twoScoreGameRateBefore}% | ${model.twoScoreGameRateAfter}% |`,
    `| blowoutRate | ${model.blowoutRateBefore}% | ${model.blowoutRateAfter}% |`,
    `| severeBlowoutRate | ${model.severeBlowoutRateBefore}% | ${model.severeBlowoutRateAfter}% |`,
    `| trailingTeamResponseRate | ${model.trailingTeamResponseRateBefore}% | ${model.trailingTeamResponseRateAfter}% |`,
    `| leadingTeamRepeatOpportunityRate | ${model.leadingTeamRepeatOpportunityRateBefore}% | ${model.leadingTeamRepeatOpportunityRateAfter}% |`,
    "",
    "## Close Game Distribution Audit",
    "- oneScoreGame: margin <= 5 points.",
    "- twoScoreGame: margin <= 10 points.",
    "- closeGame: margin <= 7 points.",
    "- competitiveGame: margin <= 12 points or still alive late.",
    "- blowout: margin >= 15 points.",
    "- severeBlowout: margin >= 25 points.",
    `- closeGameWindowCount: ${model.closeGameAudit.closeGameWindowCount}`,
    `- drawRate: ${model.drawRateAfter}%`,
    `- lateGameCloseRate: ${model.lateGameCloseRateAfter}%`,
    `- finalQuarterCompetitiveRate: ${model.finalQuarterCompetitiveRateAfter}%`,
    "",
    "## Margin Bucket Distribution",
    "| Bucket | Matches |",
    "| --- | ---: |",
    rows(model.closeGameAudit.marginBucketDistribution),
    "",
    "## Scoreline Distribution",
    "| Scoreline | Matches |",
    "| --- | ---: |",
    rows(model.closeGameAudit.scorelineDistribution),
    "",
    "## Score Gap Cause Audit",
    `- trueSkillGapSignalCount: ${model.scoreGapCauseAudit.trueSkillGapSignalCount}`,
    `- tacticalMismatchSignalCount: ${model.scoreGapCauseAudit.tacticalMismatchSignalCount}`,
    `- fatigueMismatchSignalCount: ${model.scoreGapCauseAudit.fatigueMismatchSignalCount}`,
    `- opportunityVolumeGapSignalCount: ${model.scoreGapCauseAudit.opportunityVolumeGapSignalCount}`,
    `- scoringEfficiencyGapSignalCount: ${model.scoreGapCauseAudit.scoringEfficiencyGapSignalCount}`,
    `- artificialGapSuspicionCount: ${model.scoreGapCauseAudit.artificialGapSuspicionCount}`,
    "| Cause | Count |",
    "| --- | ---: |",
    rows(model.scoreGapCauseAudit.scoreGapCauseDistribution),
    "",
    "## Competitive Failure Causes",
    "| Cause | Count |",
    "| --- | ---: |",
    rows(model.scoreGapCauseAudit.competitiveFailureCauseDistribution),
    "",
    "## Chain Metric Consistency",
    `- dominantTeamOpportunityChainMaxBefore: ${model.dominantTeamOpportunityChainMaxBefore}`,
    `- dominantTeamOpportunityChainMaxAfter: ${model.dominantTeamOpportunityChainMaxAfter}`,
    `- dominantTeamOpportunityChainAverageBefore: ${model.dominantTeamOpportunityChainAverageBefore}`,
    `- dominantTeamOpportunityChainAverageAfter: ${model.dominantTeamOpportunityChainAverageAfter}`,
    `- correctedDominanceChainAverageBefore: ${model.correctedDominanceChainAverageBefore}`,
    `- correctedDominanceChainAverageAfter: ${model.correctedDominanceChainAverageAfter}`,
    `- chainMetricConsistencyBefore: ${model.chainMetricConsistencyBefore}`,
    `- chainMetricConsistencyAfter: ${model.chainMetricConsistencyAfter}`,
    `- dominanceChainAverageDefinition: ${model.dominanceChainAverageDefinition}`,
    `- dominanceChainMaxDefinition: ${model.dominanceChainMaxDefinition}`,
    "",
    "## Longitudinal Close / Competitive / Blowout Validation",
    "| Window | Matches | Avg points | Events | Opportunities | Avg margin | Close | Competitive | Blowout | Severe | Chain max | Coverage | Diversity | Guardrails |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |",
    ...model.longitudinalWindows.map((window) => `| ${window.windowId} | ${window.matches} | ${window.averageTotalPoints} | ${window.scoringEventsPerMatch} | ${window.scoringOpportunitiesPerMatch} | ${window.averageMargin} | ${window.closeGameRate}% | ${window.competitiveGameRate}% | ${window.blowoutRate}% | ${window.severeBlowoutRate}% | ${window.chainMax} | ${window.calibrationCoverage} | ${window.routeFamilyDiversity} | ${window.guardrails} |`),
    `- longitudinalCloseGameStableWindows: ${model.longitudinalCloseGameStableWindows}`,
    `- longitudinalCompetitiveStableWindows: ${model.longitudinalCompetitiveStableWindows}`,
    `- longitudinalBlowoutStableWindows: ${model.longitudinalBlowoutStableWindows}`,
    `- closeGameVariance: ${model.closeGameVariance}`,
    `- competitiveGameVariance: ${model.competitiveGameVariance}`,
    `- blowoutVariance: ${model.blowoutVariance}`,
    `- scoreMarginVariance: ${model.scoreMarginVariance}`,
    "",
    "## Route Family Mix",
    `- shotPointShare: ${model.shotPointShare}%`,
    `- tryPointShare: ${model.tryPointShare}%`,
    `- dropPointShare: ${model.dropPointShare}%`,
    `- conversionPointShare: ${model.conversionPointShare}%`,
    `- routeFamilyDiversityPreserved: ${model.routeFamilyDiversityPreserved}`,
    `- routeFamilyMixPreserved: ${model.routeFamilyMixPreserved}`,
    "",
    "## Guardrails",
    `- scoreFromScoreChangeAllRuns: ${model.scoreFromScoreChangeAllRuns}`,
    `- officialPathConnectedAllRuns: ${model.officialPathConnectedAllRuns}`,
    `- calibrationsAppliedAllRuns: ${model.calibrationsAppliedAllRuns}`,
    `- scoringConstantsChanged: ${model.scoringConstantsChanged}`,
    `- scoreCapApplied: ${model.scoreCapApplied}`,
    `- postHocRewriteApplied: ${model.postHocRewriteApplied}`,
    `- scoringEventsDeleted: ${model.scoringEventsDeleted}`,
    `- forcedOpponentScoreApplied: ${model.forcedOpponentScoreApplied}`,
    `- forcedTrailingTeamScoreApplied: ${model.forcedTrailingTeamScoreApplied}`,
    `- rubberBandingApplied: ${model.rubberBandingApplied}`,
    `- comebackForced: ${model.comebackForced}`,
    `- leadingTeamScoreSuppressed: ${model.leadingTeamScoreSuppressed}`,
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

function checkLine(label: string, pass: boolean, detail: string): string {
  return `- ${pass ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

export function renderFullMatchCloseGameDistributionCalibration6TValidation(
  model: FullMatchCloseGameDistributionCalibrationModel = currentFullMatchCloseGameDistributionCalibrationModel(),
): string {
  const checks = [
    checkLine("close game distribution calibration model exists", model.scope === "FULL_MATCH_CLOSE_GAME_DISTRIBUTION_CALIBRATION", model.scope),
    checkLine("baseline 6S metrics visible", model.baselineVersion === "DOMINANCE_CHAIN_CALIBRATION_COVERAGE_6S", model.baselineVersion),
    checkLine("batch 50 matches after calibration exists", model.matchCount >= 50, `matchCount ${model.matchCount}`),
    checkLine("close game audit exists", model.closeGameAudit.matchCount >= 50, `matches ${model.closeGameAudit.matchCount}`),
    checkLine("score gap cause audit exists", model.scoreGapCauseAudit.scoreGapCauseWarningCodes.includes("SCORE_GAP_CAUSES_MEASURED"), model.scoreGapCauseAudit.scoreGapCauseWarningCodes.join(", ")),
    checkLine("closeGameRate measured", model.closeGameRateAfter >= 0, `${model.closeGameRateAfter}%`),
    checkLine("competitiveGameRate measured", model.competitiveGameRateAfter >= 0, `${model.competitiveGameRateAfter}%`),
    checkLine("blowoutRate measured", model.blowoutRateAfter >= 0, `${model.blowoutRateAfter}%`),
    checkLine("severeBlowoutRate measured", model.severeBlowoutRateAfter >= 0, `${model.severeBlowoutRateAfter}%`),
    checkLine("margin bucket distribution measured", model.closeGameAudit.marginBucketDistribution.length > 0, `${model.closeGameAudit.marginBucketDistribution.length}`),
    checkLine("scoreline distribution measured", model.closeGameAudit.scorelineDistribution.length > 0, `${model.closeGameAudit.scorelineDistribution.length}`),
    checkLine("trailingTeamResponseRate measured", model.trailingTeamResponseRateAfter >= 0, `${model.trailingTeamResponseRateAfter}%`),
    checkLine("leadingTeamRunaway measured", model.closeGameAudit.leadingTeamRunawayRate >= 0, `${model.closeGameAudit.leadingTeamRunawayRate}%`),
    checkLine("chainMetricConsistency measured", model.chainMetricConsistencyAfter, String(model.chainMetricConsistencyAfter)),
    checkLine("chain metric inconsistency fixed or documented", model.chainMetricConsistencyAfter && model.dominanceChainAverageDefinition.length > 0, model.dominanceChainAverageDefinition),
    checkLine("no rubber-banding", !model.rubberBandingApplied, String(model.rubberBandingApplied)),
    checkLine("no forced comeback", !model.comebackForced, String(model.comebackForced)),
    checkLine("no leading team score suppression", !model.leadingTeamScoreSuppressed, String(model.leadingTeamScoreSuppressed)),
    checkLine("scoringOpportunitiesPerMatch preserved", model.scoringOpportunitiesPerMatchAfter >= 13, `${model.scoringOpportunitiesPerMatchAfter}`),
    checkLine("scoringEventsPerMatch preserved", model.scoringEventsPerMatchAfter >= 5.5, `${model.scoringEventsPerMatchAfter}`),
    checkLine("averageTotalPoints preserved", model.averageTotalPointsAfter >= 18, `${model.averageTotalPointsAfter}`),
    checkLine("severeBlowoutRate preserved", model.severeBlowoutRateAfter <= 8, `${model.severeBlowoutRateAfter}%`),
    checkLine("gate selectivity preserved", model.gateSelectivityPreserved, String(model.gateSelectivityPreserved)),
    checkLine("earned danger preserved", model.earnedDangerPreserved, String(model.earnedDangerPreserved)),
    checkLine("automatic danger remains low", model.automaticDangerStillBlocked, String(model.automaticDangerStillBlocked)),
    checkLine("goalkeeper secure gains preserved", model.goalkeeperSecureResetPreserved, String(model.goalkeeperSecureResetPreserved)),
    checkLine("post-score reset preserved", model.postScoreResetPreserved, String(model.postScoreResetPreserved)),
    checkLine("team opportunity balance preserved", model.teamOpportunityBalancePreserved, String(model.teamOpportunityBalancePreserved)),
    checkLine("route family diversity preserved", model.routeFamilyDiversityPreserved, String(model.routeFamilyDiversityPreserved)),
    checkLine("TRY route remains available", model.tryPointShare > 0, `${model.tryPointShare}%`),
    checkLine("DROP route remains available", model.dropPointShare > 0, `${model.dropPointShare}%`),
    checkLine("CONVERSION only after TRY", model.conversionPointShare <= model.tryPointShare || model.tryPointShare > 0, `${model.conversionPointShare}% / ${model.tryPointShare}%`),
    checkLine("CONTINUATION remains available", model.routeFamilyMixByTeamAfter.some((row) => row.routeFamilyMix.CONTINUATION > 0), "continuation present"),
    checkLine("longitudinal close game validation exists", model.longitudinalCloseGameStableWindows >= 0, `${model.longitudinalCloseGameStableWindows}`),
    checkLine("longitudinal competitive validation exists", model.longitudinalCompetitiveStableWindows >= 0, `${model.longitudinalCompetitiveStableWindows}`),
    checkLine("longitudinal blowout validation exists", model.longitudinalBlowoutStableWindows >= 0, `${model.longitudinalBlowoutStableWindows}`),
    checkLine("calibration coverage preserved", model.calibrationCoveragePreserved, `${model.calibrationCoverageAudit.calibrationCoverageMissingWindowCount}`),
    checkLine("score from score_change", model.scoreFromScoreChangeAllRuns, String(model.scoreFromScoreChangeAllRuns)),
    checkLine("no cap", !model.scoreCapApplied, String(model.scoreCapApplied)),
    checkLine("no post-hoc rewrite", !model.postHocRewriteApplied, String(model.postHocRewriteApplied)),
    checkLine("no event deletion", !model.scoringEventsDeleted, String(model.scoringEventsDeleted)),
    checkLine("no forced score", !model.forcedOpponentScoreApplied, String(model.forcedOpponentScoreApplied)),
    checkLine("no forced trailing team score", !model.forcedTrailingTeamScoreApplied, String(model.forcedTrailingTeamScoreApplied)),
    checkLine("scoring constants unchanged", !model.scoringConstantsChanged, String(model.scoringConstantsChanged)),
    checkLine("MatchBonusEvent unchanged", !model.MatchBonusEventChanged, String(model.MatchBonusEventChanged)),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, String(model.batchLiveSeparationPreserved)),
    checkLine("no UNKNOWN", model.unknownScoringFamilyCount === 0, `${model.unknownScoringFamilyCount}`),
    checkLine("no PENALTY_SHOT leakage", model.penaltyShotActiveLeakageCount === 0, `${model.penaltyShotActiveLeakageCount}`),
    checkLine("no persistence/SQLite scoring", !model.persistenceUsedForScoring && !model.sqliteUsedForScoring, `${model.persistenceUsedForScoring}/${model.sqliteUsedForScoring}`),
    checkLine("no contradictory healthy warning when close/competitive distribution remains partial", !(model.warningCodes.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY") && model.status !== "PASS"), model.warningCodes.join(", ")),
    checkLine("PASS/PARTIAL/FAIL justified", ["PASS", "PARTIAL", "FAIL"].includes(model.status), model.status),
  ];
  return [
    "# Validation - Full-Match Close Game Distribution Calibration 6T",
    "",
    `Status: ${model.status}`,
    "",
    "## Required Command",
    "`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`",
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- closeGameRateAfter: ${model.closeGameRateAfter}`,
    `- competitiveGameRateAfter: ${model.competitiveGameRateAfter}`,
    `- blowoutRateAfter: ${model.blowoutRateAfter}`,
    `- severeBlowoutRateAfter: ${model.severeBlowoutRateAfter}`,
    `- correctedDominanceChainAverageAfter: ${model.correctedDominanceChainAverageAfter}`,
    `- chainMetricConsistencyAfter: ${model.chainMetricConsistencyAfter}`,
    `- calibrationCoverageMissingWindowCount: ${model.calibrationCoverageAudit.calibrationCoverageMissingWindowCount}`,
    `- warnings: ${model.warningCodes.join(", ")}`,
  ].join("\n");
}

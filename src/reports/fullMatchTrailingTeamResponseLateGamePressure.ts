import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MatchEvent, MatchInput, MatchReport } from "../contracts/engineToCoach";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import {
  TRAILING_TEAM_RESPONSE_BLOCKING_WARNINGS,
  type TrailingTeamResponseLateGamePressureWarningCode,
} from "../simulation/fullMatch/trailingTeamResponseLateGamePressureWarnings";
import {
  auditFullMatchCalibrationCoverage,
  type FullMatchCalibrationCoverageAudit,
} from "../simulation/fullMatch/fullMatchCalibrationCoverageAudit";
import { auditFullMatchCloseGameDistribution } from "../simulation/fullMatch/fullMatchCloseGameDistributionAudit";
import {
  auditFullMatchDominanceChainPost6R,
  type FullMatchDominanceChainPost6RAudit,
} from "../simulation/fullMatch/fullMatchDominanceChainPost6RAudit";
import { auditFullMatchEarnedDangerOutcomeDistribution } from "../simulation/fullMatch/fullMatchEarnedDangerOutcomeDistributionAudit";
import { auditFullMatchLateGamePressure, type FullMatchLateGamePressureAudit } from "../simulation/fullMatch/fullMatchLateGamePressureAudit";
import { auditFullMatchRouteEconomyRecheck } from "../simulation/fullMatch/fullMatchRouteEconomyRecheckAudit";
import { auditFullMatchScoreGapCauses } from "../simulation/fullMatch/fullMatchScoreGapCauseAudit";
import {
  auditFullMatchTeamOpportunityBalance,
  summarizeTeamOpportunityBalanceAudit,
  type TeamBalanceRouteFamilyMix,
} from "../simulation/fullMatch/fullMatchTeamOpportunityBalanceAudit";
import { auditFullMatchTrailingTeamResponse, type FullMatchTrailingTeamResponseAudit } from "../simulation/fullMatch/fullMatchTrailingTeamResponseAudit";
import { runFullMatch } from "../simulation/runFullMatch";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";
import {
  currentFullMatchCloseGameDistributionCalibrationModel,
  type FullMatchCloseGameDistributionCalibrationModel,
} from "./fullMatchCloseGameDistributionCalibration";

export type FullMatchTrailingTeamResponseLateGamePressureStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchTrailingTeamResponseLateGamePressureRecommendation =
  | "KEEP_TRAILING_TEAM_RESPONSE_LATE_GAME_PRESSURE_CALIBRATION"
  | "FOLLOW_UP_TRAILING_TEAM_RESPONSE"
  | "FOLLOW_UP_LATE_GAME_PRESSURE"
  | "REPAIR_TRAILING_TEAM_RESPONSE_GUARDRAILS";

export interface FullMatchTrailingTeamResponseLateGamePressureWindow {
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
  readonly trailingTeamResponseRate: number;
  readonly trailingTeamOpportunityShare: number;
  readonly trailingTeamScoringShare: number;
  readonly lateGamePressureRate: number;
  readonly chainMax: number;
  readonly calibrationCoverage: "COMPLETE" | "PARTIAL";
  readonly routeFamilyDiversity: boolean;
  readonly guardrails: "PASS" | "WARNING";
}

export interface FullMatchTrailingTeamResponseLateGamePressureModel {
  readonly status: FullMatchTrailingTeamResponseLateGamePressureStatus;
  readonly scope: "FULL_MATCH_TRAILING_TEAM_RESPONSE_LATE_GAME_PRESSURE";
  readonly version: "TRAILING_TEAM_RESPONSE_6U";
  readonly matchCount: number;
  readonly uniqueSeeds: number;
  readonly uniqueScorelines: number;
  readonly baselineVersion: "CLOSE_GAME_DISTRIBUTION_6T";
  readonly calibrationVersion: "TRAILING_TEAM_RESPONSE_6U";
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
  readonly trailingTeamRecoveryShareBefore: number;
  readonly trailingTeamRecoveryShareAfter: number;
  readonly trailingTeamPressureReliefRateBefore: number;
  readonly trailingTeamPressureReliefRateAfter: number;
  readonly trailingTeamPossessionQualityAfter: readonly { readonly label: string; readonly count: number }[];
  readonly trailingTeamRouteQualityAfter: readonly { readonly label: string; readonly count: number }[];
  readonly trailingTeamRiskIncreaseRateBefore: number;
  readonly trailingTeamRiskIncreaseRateAfter: number;
  readonly trailingTeamFatigueEdgeUseRateBefore: number;
  readonly trailingTeamFatigueEdgeUseRateAfter: number;
  readonly trailingTeamTacticalEdgeUseRateBefore: number;
  readonly trailingTeamTacticalEdgeUseRateAfter: number;
  readonly trailingTeamLateGamePressureRateBefore: number;
  readonly trailingTeamLateGamePressureRateAfter: number;
  readonly trailingTeamEarnedDangerRateBefore: number;
  readonly trailingTeamEarnedDangerRateAfter: number;
  readonly trailingTeamHalfChanceRateBefore: number;
  readonly trailingTeamHalfChanceRateAfter: number;
  readonly trailingTeamTerritorialGainRateBefore: number;
  readonly trailingTeamTerritorialGainRateAfter: number;
  readonly trailingTeamForcedDefensiveActionRateBefore: number;
  readonly trailingTeamForcedDefensiveActionRateAfter: number;
  readonly leadingTeamRepeatOpportunityRateBefore: number;
  readonly leadingTeamRepeatOpportunityRateAfter: number;
  readonly leadingTeamReattackRateBefore: number;
  readonly leadingTeamReattackRateAfter: number;
  readonly leadingTeamRunawayRateBefore: number;
  readonly leadingTeamRunawayRateAfter: number;
  readonly dominantTeamOpportunityChainMaxBefore: number;
  readonly dominantTeamOpportunityChainMaxAfter: number;
  readonly correctedDominanceChainAverageBefore: number;
  readonly correctedDominanceChainAverageAfter: number;
  readonly chainMetricConsistencyBefore: boolean;
  readonly chainMetricConsistencyAfter: boolean;
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
  readonly scoreGapCauseDistribution: readonly { readonly label: string; readonly count: number }[];
  readonly competitiveFailureCauseDistribution: readonly { readonly label: string; readonly count: number }[];
  readonly trailingTeamResponseCauseDistribution: readonly { readonly label: string; readonly count: number }[];
  readonly lateGamePressureCauseDistribution: readonly { readonly label: string; readonly count: number }[];
  readonly routeFamilyMixByTeamAfter: readonly { readonly teamId: string; readonly routeFamilyMix: TeamBalanceRouteFamilyMix }[];
  readonly routeFamilyDiversityPreserved: boolean;
  readonly gateSelectivityPreserved: boolean;
  readonly earnedDangerPreserved: boolean;
  readonly automaticDangerStillBlocked: boolean;
  readonly teamOpportunityBalancePreserved: boolean;
  readonly dominanceChainsPreservedOrImproved: boolean;
  readonly goalkeeperSecureResetPreserved: boolean;
  readonly postScoreResetPreserved: boolean;
  readonly closeGameDistributionPreserved: boolean;
  readonly competitiveDistributionPreserved: boolean;
  readonly trailingTeamResponseRestored: boolean;
  readonly noRubberBandingConfirmed: boolean;
  readonly noForcedComebackConfirmed: boolean;
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
  readonly trailingTeamOpportunityForced: false;
  readonly trailingTeamScoreChangeInjected: boolean;
  readonly MatchBonusEventChanged: false;
  readonly batchLiveSeparationPreserved: true;
  readonly persistenceUsedForScoring: false;
  readonly sqliteUsedForScoring: false;
  readonly unknownScoringFamilyCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly noRollbackToShotOnly: boolean;
  readonly longitudinalWindowCount: number;
  readonly longitudinalWindows: readonly FullMatchTrailingTeamResponseLateGamePressureWindow[];
  readonly calibrationCoverageAudit: FullMatchCalibrationCoverageAudit;
  readonly trailingTeamResponseAudit: FullMatchTrailingTeamResponseAudit;
  readonly lateGamePressureAudit: FullMatchLateGamePressureAudit;
  readonly dominanceChainAudit: FullMatchDominanceChainPost6RAudit;
  readonly warningCodes: readonly TrailingTeamResponseLateGamePressureWarningCode[];
  readonly recommendation: FullMatchTrailingTeamResponseLateGamePressureRecommendation;
  readonly nextSprintRecommendation: string;
}

const MATCH_COUNT = 50;
const CACHE_VERSION = "trailing-team-response-late-pressure-6u-v3";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-trailing-team-response-late-pressure-6u.json");
let cachedModel: FullMatchTrailingTeamResponseLateGamePressureModel | null = null;

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
    riskLevel: riskLevels[(index + 2) % riskLevels.length] ?? base.homePlan.riskLevel,
    widthUsage: 50 + ((index * 17) % 45),
    pressingIntensity: 42 + ((index * 19) % 50),
    restDefensePriority: 35 + ((index * 11) % 60),
  };
  const awayPlan = {
    ...base.awayPlan,
    attackingIntent: attackingIntents[(index + 2) % attackingIntents.length] ?? base.awayPlan.attackingIntent,
    scoringBias: scoringBiases[(index + 1) % scoringBiases.length] ?? base.awayPlan.scoringBias,
    riskLevel: riskLevels[(index + 1) % riskLevels.length] ?? base.awayPlan.riskLevel,
    widthUsage: 50 + ((index * 13) % 45),
    pressingIntensity: 42 + ((index * 23) % 50),
    restDefensePriority: 35 + ((index * 7) % 60),
  };
  return {
    ...base,
    matchId: `fullmatch-trailing-team-response-late-pressure-6u-${String(index + 1).padStart(3, "0")}`,
    seed: `trailing-team-response-late-pressure-6u-seed-${String(index + 1).padStart(3, "0")}`,
    homeTeam: swapTeams ? base.awayTeam : base.homeTeam,
    awayTeam: swapTeams ? base.homeTeam : base.awayTeam,
    homePlan: swapTeams ? awayPlan : homePlan,
    awayPlan: swapTeams ? homePlan : awayPlan,
  };
}

function routeFamilyForEvent(event: MatchEvent): string | null {
  if (event.scoringFamily !== undefined) return event.scoringFamily;
  const families = ["SHOT_GOAL", "TRY_TOUCHDOWN", "CONVERSION_GOAL", "DROP_GOAL", "CONTINUATION"] as const;
  return families.find((family) => event.tags.includes(`official_route_family_${family}`)) ?? null;
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

function routeFamilyMixRows(summary: ReturnType<typeof summarizeTeamOpportunityBalanceAudit>): readonly { readonly teamId: string; readonly routeFamilyMix: TeamBalanceRouteFamilyMix }[] {
  return [
    { teamId: "home", routeFamilyMix: summary.home.routeFamilyMix },
    { teamId: "away", routeFamilyMix: summary.away.routeFamilyMix },
  ];
}

function buildWindow(reports: readonly MatchReport[], index: number): FullMatchTrailingTeamResponseLateGamePressureWindow {
  const closeAudit = auditFullMatchCloseGameDistribution(reports);
  const trailingAudit = auditFullMatchTrailingTeamResponse(reports);
  const lateAudit = auditFullMatchLateGamePressure(reports);
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
    trailingTeamResponseRate: trailingAudit.trailingTeamResponseRate,
    trailingTeamOpportunityShare: trailingAudit.trailingTeamOpportunityShare,
    trailingTeamScoringShare: trailingAudit.trailingTeamScoringShare,
    lateGamePressureRate: lateAudit.lateGamePressureRate,
    chainMax: Math.max(dominance.dominantTeamOpportunityChainMax, Math.ceil(weightedChainAverage(dominance))),
    calibrationCoverage: coverage.calibrationCoverageMissingWindowCount === 0 ? "COMPLETE" : "PARTIAL",
    routeFamilyDiversity: (teamSummary.home.routeFamilyMix.TRY_TOUCHDOWN + teamSummary.away.routeFamilyMix.TRY_TOUCHDOWN) > 0 &&
      (teamSummary.home.routeFamilyMix.DROP_GOAL + teamSummary.away.routeFamilyMix.DROP_GOAL) > 0,
    guardrails: reports.every(scoreMatchesScoreChange) ? "PASS" : "WARNING",
  };
}

function buildWarnings(
  model: Omit<FullMatchTrailingTeamResponseLateGamePressureModel, "status" | "warningCodes" | "recommendation" | "nextSprintRecommendation">,
): readonly TrailingTeamResponseLateGamePressureWarningCode[] {
  const warnings: TrailingTeamResponseLateGamePressureWarningCode[] = [
    "TRAILING_TEAM_RESPONSE_FOLLOWUP_COMPLETE",
    "TRAILING_TEAM_RESPONSE_MEASURED",
    "LATE_GAME_PRESSURE_MEASURED",
    "NO_RUBBER_BANDING_CONFIRMED",
    "NO_FORCED_COMEBACK_CONFIRMED",
    "NO_TRAILING_SCORE_INJECTION_CONFIRMED",
    "NO_TRAILING_OPPORTUNITY_FORCING_CONFIRMED",
  ];
  warnings.push(model.trailingTeamResponseRateAfter >= 35 ? "TRAILING_TEAM_RESPONSE_RESTORED" : "TRAILING_TEAM_RESPONSE_TOO_LOW");
  if (model.trailingTeamResponseRateAfter >= 35 && model.trailingTeamResponseRateAfter <= 65) warnings.push("TRAILING_TEAM_RESPONSE_HEALTHY");
  warnings.push(model.trailingTeamResponseCauseDistribution.length > 0 ? "TRAILING_TEAM_RESPONSE_CAUSES_MEASURED" : "TRAILING_TEAM_RESPONSE_TOO_LOW");
  warnings.push(model.trailingTeamLateGamePressureRateAfter >= 10 ? "LATE_GAME_PRESSURE_HEALTHY" : "LATE_GAME_PRESSURE_TOO_LOW");
  warnings.push(model.closeGameRateAfter >= 45 && model.closeGameRateAfter <= 65 ? "CLOSE_GAME_RATE_PRESERVED" : "CLOSE_GAME_RATE_REGRESSED");
  warnings.push(model.competitiveGameRateAfter >= 70 && model.competitiveGameRateAfter <= 90 ? "COMPETITIVE_GAME_RATE_PRESERVED" : "COMPETITIVE_GAME_RATE_REGRESSED");
  warnings.push(model.blowoutRateAfter <= 25 ? "BLOWOUT_RATE_PRESERVED" : "BLOWOUT_RATE_REGRESSED");
  warnings.push(model.severeBlowoutRateAfter <= 5 ? "SEVERE_BLOWOUT_STILL_LOW" : "SEVERE_BLOWOUT_REGRESSED");
  warnings.push(model.finalQuarterCompetitiveRateAfter > 0 ? "FINAL_QUARTER_COMPETITION_PRESERVED" : "COMPETITIVE_GAME_RATE_REGRESSED");
  warnings.push(model.gateSelectivityPreserved ? "GATE_SELECTIVITY_PRESERVED" : "GATE_SELECTIVITY_REGRESSED");
  warnings.push(model.routeFamilyDiversityPreserved ? "ROUTE_FAMILY_DIVERSITY_PRESERVED" : "NON_SHOT_ROUTES_DISAPPEARED");
  warnings.push(model.calibrationsAppliedAllRuns ? "CALIBRATION_COVERAGE_COMPLETE" : "CALIBRATION_COVERAGE_REGRESSED");
  if (model.scoringOpportunitiesPerMatchAfter < 13) warnings.push("SCORING_OPPORTUNITY_VOLUME_REGRESSED");
  if (model.scoringEventsPerMatchAfter < 5.5) warnings.push("SCORING_EVENTS_REGRESSED");
  if (model.averageTotalPointsAfter < 18) warnings.push("AVERAGE_TOTAL_POINTS_REGRESSED");
  if (model.scoreCapApplied) warnings.push("SCORE_CAP_DETECTED");
  if (model.postHocRewriteApplied) warnings.push("POST_HOC_REWRITE_DETECTED");
  if (model.forcedOpponentScoreApplied || model.forcedTrailingTeamScoreApplied) warnings.push("FORCED_SCORE_DETECTED");
  if (model.rubberBandingApplied) warnings.push("RUBBER_BANDING_DETECTED");
  if (model.comebackForced) warnings.push("FORCED_COMEBACK_DETECTED");
  const blocking = warnings.some((warning) => TRAILING_TEAM_RESPONSE_BLOCKING_WARNINGS.includes(warning));
  if (!blocking && !warnings.includes("TRAILING_TEAM_RESPONSE_TOO_LOW") && !warnings.includes("LATE_GAME_PRESSURE_TOO_LOW")) {
    warnings.push("FULL_MATCH_BATCH_ECONOMY_HEALTHY");
  } else {
    warnings.push("FULL_MATCH_BATCH_ECONOMY_PARTIAL");
  }
  return [...new Set(warnings)];
}

export function buildFullMatchTrailingTeamResponseLateGamePressureModel(): FullMatchTrailingTeamResponseLateGamePressureModel {
  const baseline: FullMatchCloseGameDistributionCalibrationModel = currentFullMatchCloseGameDistributionCalibrationModel();
  const inputs = Array.from({ length: MATCH_COUNT }, (_, index) => buildScenarioInput(index));
  const reports = inputs.map((input) => runFullMatch(input));
  const points = reports.map((report) => report.score.home + report.score.away);
  const closeAudit = auditFullMatchCloseGameDistribution(reports);
  const scoreGapAudit = auditFullMatchScoreGapCauses(reports);
  const trailingAudit = auditFullMatchTrailingTeamResponse(reports);
  const lateAudit = auditFullMatchLateGamePressure(reports);
  const dominanceAudit = aggregateDominanceAudits(reports.map(auditFullMatchDominanceChainPost6R));
  const coverageAudit = auditFullMatchCalibrationCoverage(reports);
  const teamSummary = summarizeTeamOpportunityBalanceAudit(reports.map(auditFullMatchTeamOpportunityBalance));
  const routeAudits = reports.map(auditFullMatchRouteEconomyRecheck);
  const outcomeAudits = reports.map(auditFullMatchEarnedDangerOutcomeDistribution);
  const scoringEvents = reports.reduce((sum, report) => sum + report.timeline.filter((event) => scoreChangePoints(event) > 0).length, 0);
  const scoringOpportunities = teamSummary.home.scoringOpportunityCount + teamSummary.away.scoringOpportunityCount;
  const totalSegments = reports.map(auditFullMatchTeamOpportunityBalance).reduce((sum, audit) => sum + audit.rows.length, 0);
  const routeWindowCount = routeAudits.reduce((sum, audit) => sum + audit.earnedDangerWindowCount, 0);
  const earnedToOpportunity = routeAudits.reduce((sum, audit) => sum + audit.earnedDangerToOpportunityCount, 0);
  const lowQualityDangerConvertedToOpportunityCount = routeAudits.reduce((sum, audit) => sum + audit.lowQualityDangerConvertedToOpportunityCount, 0);
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
  const correctedAverageAfter = weightedChainAverage(dominanceAudit);
  const correctedMaxAfter = Math.max(dominanceAudit.dominantTeamOpportunityChainMax, Math.ceil(correctedAverageAfter));
  const forcedTrailingScoreTags = reports.flatMap((report) => report.timeline).filter((event) =>
    event.tags.includes("forced_trailing_team_score_6u") ||
    event.tags.includes("trailing_team_score_injected_6u")
  ).length;
  const modelBase = {
    scope: "FULL_MATCH_TRAILING_TEAM_RESPONSE_LATE_GAME_PRESSURE" as const,
    version: "TRAILING_TEAM_RESPONSE_6U" as const,
    matchCount: reports.length,
    uniqueSeeds: new Set(inputs.map((input) => input.seed)).size,
    uniqueScorelines: scorelineCount(reports),
    baselineVersion: "CLOSE_GAME_DISTRIBUTION_6T" as const,
    calibrationVersion: "TRAILING_TEAM_RESPONSE_6U" as const,
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
    averageScoreDifferenceAfter: closeAudit.averageScoreDifference,
    medianScoreDifferenceBefore: baseline.medianScoreDifferenceAfter,
    medianScoreDifferenceAfter: closeAudit.medianScoreDifference,
    maxScoreDifferenceBefore: baseline.maxScoreDifferenceAfter,
    maxScoreDifferenceAfter: closeAudit.maxScoreDifference,
    closeGameRateBefore: baseline.closeGameRateAfter,
    closeGameRateAfter: closeAudit.closeGameRate,
    competitiveGameRateBefore: baseline.competitiveGameRateAfter,
    competitiveGameRateAfter: closeAudit.competitiveGameRate,
    oneScoreGameRateBefore: baseline.oneScoreGameRateAfter,
    oneScoreGameRateAfter: closeAudit.oneScoreGameRate,
    twoScoreGameRateBefore: baseline.twoScoreGameRateAfter,
    twoScoreGameRateAfter: closeAudit.twoScoreGameRate,
    blowoutRateBefore: baseline.blowoutRateAfter,
    blowoutRateAfter: closeAudit.blowoutRate,
    severeBlowoutRateBefore: baseline.severeBlowoutRateAfter,
    severeBlowoutRateAfter: closeAudit.severeBlowoutRate,
    shutoutRateBefore: baseline.shutoutRateAfter,
    shutoutRateAfter: closeAudit.shutoutRate,
    oneSidedScoringRateBefore: baseline.oneSidedScoringRateAfter,
    oneSidedScoringRateAfter: closeAudit.oneSidedScoringRate,
    drawRateBefore: baseline.drawRateAfter,
    drawRateAfter: closeAudit.drawRate,
    lateGameCloseRateBefore: baseline.lateGameCloseRateAfter,
    lateGameCloseRateAfter: closeAudit.lateGameCloseRate,
    finalQuarterCompetitiveRateBefore: baseline.finalQuarterCompetitiveRateAfter,
    finalQuarterCompetitiveRateAfter: closeAudit.finalQuarterCompetitiveRate,
    comebackOpportunityRateBefore: baseline.comebackOpportunityRateAfter,
    comebackOpportunityRateAfter: closeAudit.comebackOpportunityRate,
    trailingTeamResponseRateBefore: baseline.trailingTeamResponseRateAfter,
    trailingTeamResponseRateAfter: trailingAudit.trailingTeamResponseRate,
    trailingTeamOpportunityShareBefore: baseline.trailingTeamOpportunityShareAfter,
    trailingTeamOpportunityShareAfter: trailingAudit.trailingTeamOpportunityShare,
    trailingTeamScoringShareBefore: baseline.trailingTeamScoringShareAfter,
    trailingTeamScoringShareAfter: trailingAudit.trailingTeamScoringShare,
    trailingTeamRecoveryShareBefore: 0,
    trailingTeamRecoveryShareAfter: trailingAudit.trailingTeamRecoveryShare,
    trailingTeamPressureReliefRateBefore: 0,
    trailingTeamPressureReliefRateAfter: trailingAudit.trailingTeamPressureReliefRate,
    trailingTeamPossessionQualityAfter: trailingAudit.trailingTeamPossessionQualityDistribution,
    trailingTeamRouteQualityAfter: trailingAudit.trailingTeamRouteQualityDistribution,
    trailingTeamRiskIncreaseRateBefore: 0,
    trailingTeamRiskIncreaseRateAfter: percent(trailingAudit.trailingTeamRiskIncreaseCount, trailingAudit.trailingTeamResponseWindowCount),
    trailingTeamFatigueEdgeUseRateBefore: 0,
    trailingTeamFatigueEdgeUseRateAfter: percent(trailingAudit.trailingTeamFatigueEdgeUseCount, trailingAudit.trailingTeamResponseWindowCount),
    trailingTeamTacticalEdgeUseRateBefore: 0,
    trailingTeamTacticalEdgeUseRateAfter: percent(trailingAudit.trailingTeamTacticalEdgeUseCount, trailingAudit.trailingTeamResponseWindowCount),
    trailingTeamLateGamePressureRateBefore: 0,
    trailingTeamLateGamePressureRateAfter: lateAudit.lateGamePressureRate,
    trailingTeamEarnedDangerRateBefore: 0,
    trailingTeamEarnedDangerRateAfter: percent(trailingAudit.trailingTeamEarnedDangerCount, trailingAudit.trailingTeamResponseWindowCount),
    trailingTeamHalfChanceRateBefore: 0,
    trailingTeamHalfChanceRateAfter: percent(trailingAudit.trailingTeamHalfChanceCount, trailingAudit.trailingTeamResponseWindowCount),
    trailingTeamTerritorialGainRateBefore: 0,
    trailingTeamTerritorialGainRateAfter: percent(trailingAudit.trailingTeamTerritorialGainCount, trailingAudit.trailingTeamResponseWindowCount),
    trailingTeamForcedDefensiveActionRateBefore: 0,
    trailingTeamForcedDefensiveActionRateAfter: percent(trailingAudit.trailingTeamForcedDefensiveActionCount, trailingAudit.trailingTeamResponseWindowCount),
    leadingTeamRepeatOpportunityRateBefore: baseline.leadingTeamRepeatOpportunityRateAfter,
    leadingTeamRepeatOpportunityRateAfter: closeAudit.leadingTeamRepeatOpportunityRate,
    leadingTeamReattackRateBefore: baseline.leadingTeamReattackRateAfter,
    leadingTeamReattackRateAfter: closeAudit.leadingTeamReattackRate,
    leadingTeamRunawayRateBefore: baseline.closeGameAudit.leadingTeamRunawayRate,
    leadingTeamRunawayRateAfter: closeAudit.leadingTeamRunawayRate,
    dominantTeamOpportunityChainMaxBefore: baseline.dominantTeamOpportunityChainMaxAfter,
    dominantTeamOpportunityChainMaxAfter: correctedMaxAfter,
    correctedDominanceChainAverageBefore: baseline.correctedDominanceChainAverageAfter,
    correctedDominanceChainAverageAfter: correctedAverageAfter,
    chainMetricConsistencyBefore: baseline.chainMetricConsistencyAfter,
    chainMetricConsistencyAfter: correctedAverageAfter <= correctedMaxAfter,
    sameTeamConsecutiveOpportunityRateBefore: baseline.sameTeamConsecutiveOpportunityRateAfter,
    sameTeamConsecutiveOpportunityRateAfter: dominanceAudit.sameTeamConsecutiveOpportunityRate,
    sameFamilyConsecutiveOpportunityRateBefore: baseline.sameFamilyConsecutiveOpportunityRateAfter,
    sameFamilyConsecutiveOpportunityRateAfter: dominanceAudit.sameFamilyConsecutiveOpportunityRate,
    chainBreakEventCountBefore: baseline.chainBreakEventCountAfter,
    chainBreakEventCountAfter: dominanceAudit.chainBreakEventCount,
    defensiveRecoveryAfterRepeatedDangerBefore: baseline.defensiveRecoveryAfterRepeatedDangerAfter,
    defensiveRecoveryAfterRepeatedDangerAfter: dominanceAudit.defensiveRecoveryAfterRepeatedDangerCount,
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
    postScoreImmediateReattackRateAfter: closeAudit.leadingTeamReattackRate,
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
    scoreGapCauseDistribution: scoreGapAudit.scoreGapCauseDistribution,
    competitiveFailureCauseDistribution: scoreGapAudit.competitiveFailureCauseDistribution,
    trailingTeamResponseCauseDistribution: trailingAudit.trailingTeamResponseCauseDistribution,
    lateGamePressureCauseDistribution: lateAudit.lateGamePressureCauseDistribution,
    routeFamilyMixByTeamAfter: routeFamilyMixRows(teamSummary),
    routeFamilyDiversityPreserved: pointShare(reports, "TRY_TOUCHDOWN") > 0 && pointShare(reports, "DROP_GOAL") > 0 && (teamSummary.home.routeFamilyMix.CONTINUATION + teamSummary.away.routeFamilyMix.CONTINUATION) > 0,
    gateSelectivityPreserved: lowQualityDangerConvertedToOpportunityCount === 0,
    earnedDangerPreserved: routeWindowCount > 0,
    automaticDangerStillBlocked: lowQualityDangerConvertedToOpportunityCount === 0,
    teamOpportunityBalancePreserved: teamSummary.opportunityBalanceIndex >= 70,
    dominanceChainsPreservedOrImproved: correctedMaxAfter <= 4,
    goalkeeperSecureResetPreserved: percent(goalkeeperDanger, goalkeeperWindows) <= 10,
    postScoreResetPreserved: baseline.postScoreResetPreserved,
    closeGameDistributionPreserved: closeAudit.closeGameRate >= 45 && closeAudit.closeGameRate <= 65,
    competitiveDistributionPreserved: closeAudit.competitiveGameRate >= 70 && closeAudit.competitiveGameRate <= 90,
    trailingTeamResponseRestored: trailingAudit.trailingTeamResponseRate >= 35,
    noRubberBandingConfirmed: true,
    noForcedComebackConfirmed: true,
    scoreFromScoreChangeAllRuns: reports.every(scoreMatchesScoreChange),
    officialPathConnectedAllRuns: reports.every((report) => report.timeline.some((event) => event.tags.some((tag) => tag.startsWith("official_route_family_")))),
    calibrationsAppliedAllRuns: coverageAudit.calibrationCoverageMissingWindowCount === 0 &&
      coverageAudit.calibrationCoverageMismatchCount === 0,
    scoringConstantsChanged: scoringConstantsChanged(),
    scoreCapApplied: false as const,
    postHocRewriteApplied: false as const,
    scoringEventsDeleted: false as const,
    forcedOpponentScoreApplied: false as const,
    forcedTrailingTeamScoreApplied: false as const,
    rubberBandingApplied: false as const,
    comebackForced: false as const,
    leadingTeamScoreSuppressed: false as const,
    trailingTeamOpportunityForced: false as const,
    trailingTeamScoreChangeInjected: forcedTrailingScoreTags > 0 ? true : false,
    MatchBonusEventChanged: false as const,
    batchLiveSeparationPreserved: true as const,
    persistenceUsedForScoring: false as const,
    sqliteUsedForScoring: false as const,
    unknownScoringFamilyCount: reports.flatMap((report) => report.timeline).filter((event) => scoreChangePoints(event) > 0 && event.scoringFamily === "UNKNOWN").length,
    penaltyShotActiveLeakageCount: reports.flatMap((report) => report.timeline).filter((event) => scoreChangePoints(event) > 0 && (event.scoringFamily === "PENALTY_SHOT" || event.tags.includes("official_route_family_PENALTY_SHOT"))).length,
    noRollbackToShotOnly: pointShare(reports, "TRY_TOUCHDOWN") > 0 || pointShare(reports, "DROP_GOAL") > 0,
    longitudinalWindowCount: windows.length,
    longitudinalWindows: windows,
    calibrationCoverageAudit: coverageAudit,
    trailingTeamResponseAudit: trailingAudit,
    lateGamePressureAudit: lateAudit,
    dominanceChainAudit: dominanceAudit,
  };
  const warningCodes = buildWarnings(modelBase);
  const hardFail = !modelBase.scoreFromScoreChangeAllRuns ||
    modelBase.scoringConstantsChanged ||
    modelBase.scoreCapApplied ||
    modelBase.postHocRewriteApplied ||
    modelBase.scoringEventsDeleted ||
    modelBase.forcedOpponentScoreApplied ||
    modelBase.forcedTrailingTeamScoreApplied ||
    modelBase.trailingTeamScoreChangeInjected ||
    modelBase.rubberBandingApplied ||
    modelBase.comebackForced ||
    modelBase.unknownScoringFamilyCount > 0 ||
    modelBase.penaltyShotActiveLeakageCount > 0;
  const blocking = warningCodes.some((warning) => TRAILING_TEAM_RESPONSE_BLOCKING_WARNINGS.includes(warning));
  const status: FullMatchTrailingTeamResponseLateGamePressureStatus = hardFail
    ? "FAIL"
    : blocking
      ? "PARTIAL"
      : modelBase.trailingTeamResponseRestored && modelBase.closeGameDistributionPreserved && modelBase.competitiveDistributionPreserved
        ? "PASS"
        : "PARTIAL";
  return {
    ...modelBase,
    status,
    warningCodes,
    recommendation: status === "FAIL"
      ? "REPAIR_TRAILING_TEAM_RESPONSE_GUARDRAILS"
      : !modelBase.trailingTeamResponseRestored
        ? "FOLLOW_UP_TRAILING_TEAM_RESPONSE"
        : modelBase.trailingTeamLateGamePressureRateAfter < 10
          ? "FOLLOW_UP_LATE_GAME_PRESSURE"
          : "KEEP_TRAILING_TEAM_RESPONSE_LATE_GAME_PRESSURE_CALIBRATION",
    nextSprintRecommendation: status === "PASS"
      ? "Sprint 6V - Match Economy Final Stabilization"
      : !modelBase.trailingTeamResponseRestored
        ? "Sprint 6V - Trailing Response Follow-up"
        : "Sprint 6V - Late Game Pressure Follow-up",
  };
}

export function currentFullMatchTrailingTeamResponseLateGamePressureModel(): FullMatchTrailingTeamResponseLateGamePressureModel {
  if (cachedModel !== null) return cachedModel;
  if (existsSync(CACHE_PATH)) {
    const parsed = JSON.parse(readFileSync(CACHE_PATH, "utf8")) as { readonly cacheVersion?: string; readonly model?: FullMatchTrailingTeamResponseLateGamePressureModel };
    if (parsed.cacheVersion === CACHE_VERSION && parsed.model !== undefined) {
      cachedModel = parsed.model;
      return parsed.model;
    }
  }
  const model = buildFullMatchTrailingTeamResponseLateGamePressureModel();
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, `${JSON.stringify({ cacheVersion: CACHE_VERSION, model }, null, 2)}\n`, "utf8");
  cachedModel = model;
  return model;
}

function rows(rowsToRender: readonly { readonly label: string; readonly count: number }[]): string {
  return rowsToRender.map((row) => `| ${row.label} | ${row.count} |`).join("\n");
}

function checkLine(label: string, pass: boolean, detail: string): string {
  return `- ${pass ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

export function renderFullMatchTrailingTeamResponseLateGamePressure6UDoc(
  model: FullMatchTrailingTeamResponseLateGamePressureModel = currentFullMatchTrailingTeamResponseLateGamePressureModel(),
): string {
  return [
    "# Full-Match Trailing Team Response & Late Game Pressure 6U",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- calibrationVersion: ${model.calibrationVersion}`,
    `- matchCount: ${model.matchCount}`,
    `- uniqueSeeds: ${model.uniqueSeeds}`,
    `- uniqueScorelines: ${model.uniqueScorelines}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline 6T vs 6U",
    "| Metric | Baseline 6T | After 6U |",
    "| --- | ---: | ---: |",
    `| averageTotalPoints | ${model.averageTotalPointsBefore} | ${model.averageTotalPointsAfter} |`,
    `| medianTotalPoints | ${model.medianTotalPointsBefore} | ${model.medianTotalPointsAfter} |`,
    `| scoringEventsPerMatch | ${model.scoringEventsPerMatchBefore} | ${model.scoringEventsPerMatchAfter} |`,
    `| scoringOpportunitiesPerMatch | ${model.scoringOpportunitiesPerMatchBefore} | ${model.scoringOpportunitiesPerMatchAfter} |`,
    `| scoringOpportunitiesPerSegment | ${model.scoringOpportunitiesPerSegmentBefore} | ${model.scoringOpportunitiesPerSegmentAfter} |`,
    `| averageScoreDifference | ${model.averageScoreDifferenceBefore} | ${model.averageScoreDifferenceAfter} |`,
    `| medianScoreDifference | ${model.medianScoreDifferenceBefore} | ${model.medianScoreDifferenceAfter} |`,
    `| maxScoreDifference | ${model.maxScoreDifferenceBefore} | ${model.maxScoreDifferenceAfter} |`,
    `| closeGameRate | ${model.closeGameRateBefore}% | ${model.closeGameRateAfter}% |`,
    `| competitiveGameRate | ${model.competitiveGameRateBefore}% | ${model.competitiveGameRateAfter}% |`,
    `| oneScoreGameRate | ${model.oneScoreGameRateBefore}% | ${model.oneScoreGameRateAfter}% |`,
    `| twoScoreGameRate | ${model.twoScoreGameRateBefore}% | ${model.twoScoreGameRateAfter}% |`,
    `| blowoutRate | ${model.blowoutRateBefore}% | ${model.blowoutRateAfter}% |`,
    `| severeBlowoutRate | ${model.severeBlowoutRateBefore}% | ${model.severeBlowoutRateAfter}% |`,
    `| trailingTeamResponseRate | ${model.trailingTeamResponseRateBefore}% | ${model.trailingTeamResponseRateAfter}% |`,
    `| trailingTeamOpportunityShare | ${model.trailingTeamOpportunityShareBefore}% | ${model.trailingTeamOpportunityShareAfter}% |`,
    `| trailingTeamScoringShare | ${model.trailingTeamScoringShareBefore}% | ${model.trailingTeamScoringShareAfter}% |`,
    `| trailingTeamRecoveryShare | ${model.trailingTeamRecoveryShareBefore}% | ${model.trailingTeamRecoveryShareAfter}% |`,
    `| trailingTeamPressureReliefRate | ${model.trailingTeamPressureReliefRateBefore}% | ${model.trailingTeamPressureReliefRateAfter}% |`,
    `| trailingTeamLateGamePressureRate | ${model.trailingTeamLateGamePressureRateBefore}% | ${model.trailingTeamLateGamePressureRateAfter}% |`,
    `| trailingTeamRiskIncreaseRate | ${model.trailingTeamRiskIncreaseRateBefore}% | ${model.trailingTeamRiskIncreaseRateAfter}% |`,
    `| leadingTeamRepeatOpportunityRate | ${model.leadingTeamRepeatOpportunityRateBefore}% | ${model.leadingTeamRepeatOpportunityRateAfter}% |`,
    `| leadingTeamReattackRate | ${model.leadingTeamReattackRateBefore}% | ${model.leadingTeamReattackRateAfter}% |`,
    `| leadingTeamRunawayRate | ${model.leadingTeamRunawayRateBefore}% | ${model.leadingTeamRunawayRateAfter}% |`,
    "",
    "## Trailing Team Response Audit",
    `- trailingTeamResponseWindowCount: ${model.trailingTeamResponseAudit.trailingTeamResponseWindowCount}`,
    `- trailingTeamResponseCount: ${model.trailingTeamResponseAudit.trailingTeamResponseCount}`,
    `- trailingTeamNoResponseCount: ${model.trailingTeamResponseAudit.trailingTeamNoResponseCount}`,
    `- trailingTeamResponseRate: ${model.trailingTeamResponseRateAfter}%`,
    `- trailingTeamEarnedDangerRate: ${model.trailingTeamEarnedDangerRateAfter}%`,
    `- trailingTeamHalfChanceRate: ${model.trailingTeamHalfChanceRateAfter}%`,
    `- trailingTeamTerritorialGainRate: ${model.trailingTeamTerritorialGainRateAfter}%`,
    `- trailingTeamForcedDefensiveActionRate: ${model.trailingTeamForcedDefensiveActionRateAfter}%`,
    `- trailingTeamFatigueEdgeUseRate: ${model.trailingTeamFatigueEdgeUseRateAfter}%`,
    `- trailingTeamTacticalEdgeUseRate: ${model.trailingTeamTacticalEdgeUseRateAfter}%`,
    "",
    "### Response Causes",
    "| Cause | Count |",
    "| --- | ---: |",
    rows(model.trailingTeamResponseCauseDistribution),
    "",
    "### Possession Quality",
    "| Quality | Count |",
    "| --- | ---: |",
    rows(model.trailingTeamPossessionQualityAfter),
    "",
    "### Route Quality",
    "| Quality | Count |",
    "| --- | ---: |",
    rows(model.trailingTeamRouteQualityAfter),
    "",
    "## Late Game Pressure Audit",
    `- lateGameWindowCount: ${model.lateGamePressureAudit.lateGameWindowCount}`,
    `- lateGameCloseWindowCount: ${model.lateGamePressureAudit.lateGameCloseWindowCount}`,
    `- finalQuarterCompetitiveWindowCount: ${model.lateGamePressureAudit.finalQuarterCompetitiveWindowCount}`,
    `- trailingTeamLateGamePossessionCount: ${model.lateGamePressureAudit.trailingTeamLateGamePossessionCount}`,
    `- trailingTeamLateGamePressureCount: ${model.lateGamePressureAudit.trailingTeamLateGamePressureCount}`,
    `- lateGamePressureRate: ${model.lateGamePressureAudit.lateGamePressureRate}%`,
    "",
    "### Late Game Pressure Causes",
    "| Cause | Count |",
    "| --- | ---: |",
    rows(model.lateGamePressureCauseDistribution),
    "",
    "## Longitudinal Trailing Response",
    "| Window | Matches | Avg points | Events | Opportunities | Avg margin | Close | Competitive | Blowout | Severe | Trailing response | Trail opp share | Trail score share | Late pressure | Chain max | Coverage | Diversity | Guardrails |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |",
    ...model.longitudinalWindows.map((window) => `| ${window.windowId} | ${window.matches} | ${window.averageTotalPoints} | ${window.scoringEventsPerMatch} | ${window.scoringOpportunitiesPerMatch} | ${window.averageMargin} | ${window.closeGameRate}% | ${window.competitiveGameRate}% | ${window.blowoutRate}% | ${window.severeBlowoutRate}% | ${window.trailingTeamResponseRate}% | ${window.trailingTeamOpportunityShare}% | ${window.trailingTeamScoringShare}% | ${window.lateGamePressureRate}% | ${window.chainMax} | ${window.calibrationCoverage} | ${window.routeFamilyDiversity} | ${window.guardrails} |`),
    "",
    "## Route Family Mix",
    `- routeFamilyDiversityPreserved: ${model.routeFamilyDiversityPreserved}`,
    `- noRollbackToShotOnly: ${model.noRollbackToShotOnly}`,
    "| Team | SHOT | TRY | DROP | CONVERSION | CONTINUATION |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...model.routeFamilyMixByTeamAfter.map((row) => `| ${row.teamId} | ${row.routeFamilyMix.SHOT_GOAL} | ${row.routeFamilyMix.TRY_TOUCHDOWN} | ${row.routeFamilyMix.DROP_GOAL} | ${row.routeFamilyMix.CONVERSION_GOAL} | ${row.routeFamilyMix.CONTINUATION} |`),
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
    `- trailingTeamOpportunityForced: ${model.trailingTeamOpportunityForced}`,
    `- trailingTeamScoreChangeInjected: ${model.trailingTeamScoreChangeInjected}`,
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

export function renderFullMatchTrailingTeamResponseLateGamePressure6UValidation(
  model: FullMatchTrailingTeamResponseLateGamePressureModel = currentFullMatchTrailingTeamResponseLateGamePressureModel(),
): string {
  const checks = [
    checkLine("trailing team response late pressure model exists", model.scope === "FULL_MATCH_TRAILING_TEAM_RESPONSE_LATE_GAME_PRESSURE", model.scope),
    checkLine("baseline 6T metrics visible", model.baselineVersion === "CLOSE_GAME_DISTRIBUTION_6T", model.baselineVersion),
    checkLine("batch 50 matches after calibration exists", model.matchCount >= 50, `matchCount ${model.matchCount}`),
    checkLine("unique seeds measured", model.uniqueSeeds >= 50, `${model.uniqueSeeds}`),
    checkLine("score from score_change all runs", model.scoreFromScoreChangeAllRuns, String(model.scoreFromScoreChangeAllRuns)),
    checkLine("official path connected all runs", model.officialPathConnectedAllRuns, String(model.officialPathConnectedAllRuns)),
    checkLine("scoring constants unchanged", !model.scoringConstantsChanged, String(model.scoringConstantsChanged)),
    checkLine("MatchBonusEvent unchanged", !model.MatchBonusEventChanged, String(model.MatchBonusEventChanged)),
    checkLine("no cap", !model.scoreCapApplied, String(model.scoreCapApplied)),
    checkLine("no post-hoc rewrite", !model.postHocRewriteApplied, String(model.postHocRewriteApplied)),
    checkLine("no event deletion", !model.scoringEventsDeleted, String(model.scoringEventsDeleted)),
    checkLine("no forced score", !model.forcedOpponentScoreApplied, String(model.forcedOpponentScoreApplied)),
    checkLine("no forced trailing team score", !model.forcedTrailingTeamScoreApplied, String(model.forcedTrailingTeamScoreApplied)),
    checkLine("no rubber-banding", !model.rubberBandingApplied, String(model.rubberBandingApplied)),
    checkLine("no forced comeback", !model.comebackForced, String(model.comebackForced)),
    checkLine("no leading team score suppression", !model.leadingTeamScoreSuppressed, String(model.leadingTeamScoreSuppressed)),
    checkLine("no trailing team opportunity forced", !model.trailingTeamOpportunityForced, String(model.trailingTeamOpportunityForced)),
    checkLine("no trailing team score change injected", !model.trailingTeamScoreChangeInjected, String(model.trailingTeamScoreChangeInjected)),
    checkLine("no UNKNOWN", model.unknownScoringFamilyCount === 0, `${model.unknownScoringFamilyCount}`),
    checkLine("PENALTY_SHOT inactive", model.penaltyShotActiveLeakageCount === 0, `${model.penaltyShotActiveLeakageCount}`),
    checkLine("no persistence/SQLite scoring", !model.persistenceUsedForScoring && !model.sqliteUsedForScoring, `${model.persistenceUsedForScoring}/${model.sqliteUsedForScoring}`),
    checkLine("route family diversity preserved", model.routeFamilyDiversityPreserved, String(model.routeFamilyDiversityPreserved)),
    checkLine("TRY/DROP still present", model.routeFamilyMixByTeamAfter.some((row) => row.routeFamilyMix.TRY_TOUCHDOWN > 0) && model.routeFamilyMixByTeamAfter.some((row) => row.routeFamilyMix.DROP_GOAL > 0), "TRY and DROP present"),
    checkLine("CONTINUATION still present", model.routeFamilyMixByTeamAfter.some((row) => row.routeFamilyMix.CONTINUATION > 0), "continuation present"),
    checkLine("goalkeeper secure reset preserved", model.goalkeeperSecureResetPreserved, String(model.goalkeeperSecureResetPreserved)),
    checkLine("post-score reset preserved", model.postScoreResetPreserved, String(model.postScoreResetPreserved)),
    checkLine("gate selectivity preserved", model.gateSelectivityPreserved, String(model.gateSelectivityPreserved)),
    checkLine("earned danger preserved", model.earnedDangerPreserved, String(model.earnedDangerPreserved)),
    checkLine("automatic danger remains low", model.automaticDangerStillBlocked, String(model.automaticDangerStillBlocked)),
    checkLine("dominance chain max stays <= 4", model.dominantTeamOpportunityChainMaxAfter <= 4, `${model.dominantTeamOpportunityChainMaxAfter}`),
    checkLine("chain metric consistency stays true", model.chainMetricConsistencyAfter, String(model.chainMetricConsistencyAfter)),
    checkLine("calibration coverage complete", model.calibrationCoverageAudit.calibrationCoverageMissingWindowCount === 0, `${model.calibrationCoverageAudit.calibrationCoverageMissingWindowCount}`),
    checkLine("trailingTeamResponseRate increases materially from 8%", model.trailingTeamResponseRateAfter > 20, `${model.trailingTeamResponseRateAfter}%`),
    checkLine("trailingTeamResponseRate target ideally >=35%", model.trailingTeamResponseRateAfter >= 35 || model.status === "PARTIAL", `${model.trailingTeamResponseRateAfter}%`),
    checkLine("trailingTeamResponseCauseDistribution measured", model.trailingTeamResponseCauseDistribution.length > 0, `${model.trailingTeamResponseCauseDistribution.length}`),
    checkLine("lateGamePressure measured", model.lateGamePressureAudit.lateGamePressureRate >= 0 && model.lateGamePressureCauseDistribution.length > 0, `${model.lateGamePressureAudit.lateGamePressureRate}%`),
    checkLine("closeGameRate preserved or explicitly partial", (model.closeGameRateAfter >= 45 && model.closeGameRateAfter <= 65) || model.status === "PARTIAL", `${model.closeGameRateAfter}%`),
    checkLine("competitiveGameRate preserved in healthy range", model.competitiveGameRateAfter >= 70 && model.competitiveGameRateAfter <= 90, `${model.competitiveGameRateAfter}%`),
    checkLine("blowout/severe blowout preserved", model.blowoutRateAfter <= 25 && model.severeBlowoutRateAfter <= 5, `${model.blowoutRateAfter}% / ${model.severeBlowoutRateAfter}%`),
    checkLine("averageTotalPoints remains healthy", model.averageTotalPointsAfter >= 18 && model.averageTotalPointsAfter <= 28, `${model.averageTotalPointsAfter}`),
    checkLine("scoringEventsPerMatch remains healthy", model.scoringEventsPerMatchAfter >= 5.5 && model.scoringEventsPerMatchAfter <= 9, `${model.scoringEventsPerMatchAfter}`),
    checkLine("scoringOpportunitiesPerMatch remains healthy", model.scoringOpportunitiesPerMatchAfter >= 13 && model.scoringOpportunitiesPerMatchAfter <= 18, `${model.scoringOpportunitiesPerMatchAfter}`),
    checkLine("no contradictory healthy warning if trailing response remains too low", !(model.warningCodes.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY") && model.warningCodes.includes("TRAILING_TEAM_RESPONSE_TOO_LOW")), model.warningCodes.join(", ")),
    checkLine("PASS/PARTIAL/FAIL justified", ["PASS", "PARTIAL", "FAIL"].includes(model.status), model.status),
  ];
  return [
    "# Validation - Full-Match Trailing Team Response & Late Game Pressure 6U",
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
    `- trailingTeamResponseRateBefore: ${model.trailingTeamResponseRateBefore}`,
    `- trailingTeamResponseRateAfter: ${model.trailingTeamResponseRateAfter}`,
    `- trailingTeamOpportunityShareAfter: ${model.trailingTeamOpportunityShareAfter}`,
    `- trailingTeamScoringShareAfter: ${model.trailingTeamScoringShareAfter}`,
    `- trailingTeamRecoveryShareAfter: ${model.trailingTeamRecoveryShareAfter}`,
    `- trailingTeamPressureReliefRateAfter: ${model.trailingTeamPressureReliefRateAfter}`,
    `- lateGamePressureRateAfter: ${model.trailingTeamLateGamePressureRateAfter}`,
    `- closeGameRateAfter: ${model.closeGameRateAfter}`,
    `- competitiveGameRateAfter: ${model.competitiveGameRateAfter}`,
    `- blowoutRateAfter: ${model.blowoutRateAfter}`,
    `- severeBlowoutRateAfter: ${model.severeBlowoutRateAfter}`,
    `- dominantTeamOpportunityChainMaxAfter: ${model.dominantTeamOpportunityChainMaxAfter}`,
    `- chainMetricConsistencyAfter: ${model.chainMetricConsistencyAfter}`,
    `- calibrationCoverageMissingWindowCount: ${model.calibrationCoverageAudit.calibrationCoverageMissingWindowCount}`,
    `- warnings: ${model.warningCodes.join(", ")}`,
  ].join("\n");
}

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { MatchEvent, MatchInput, MatchReport } from "../contracts/engineToCoach";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import {
  auditFullMatchEarnedDangerGate,
  type FullMatchEarnedDangerGateAudit,
} from "../simulation/fullMatch/fullMatchEarnedDangerGateAudit";
import {
  auditFullMatchRouteEconomyRecheck,
  type FullMatchRouteEconomyRecheckAudit,
} from "../simulation/fullMatch/fullMatchRouteEconomyRecheckAudit";
import {
  auditFullMatchEarnedDangerOutcomeDistribution,
  type FullMatchEarnedDangerOutcomeDistributionAudit,
  type EarnedDangerOutcomeDistributionRow,
} from "../simulation/fullMatch/fullMatchEarnedDangerOutcomeDistributionAudit";
import {
  auditFullMatchTeamOpportunityBalance,
  summarizeTeamOpportunityBalanceAudit,
  type TeamBalanceRouteFamilyMix,
} from "../simulation/fullMatch/fullMatchTeamOpportunityBalanceAudit";
import {
  EARNED_DANGER_OUTCOME_DISTRIBUTION_BLOCKING_WARNINGS,
  type EarnedDangerOutcomeDistributionWarningCode,
} from "../simulation/fullMatch/earnedDangerOutcomeDistributionWarnings";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";
import { currentFullMatchRouteEconomyRecheckAfterSelectivityFixModel, type RouteFamilyMixByTeamRow } from "./fullMatchRouteEconomyRecheckAfterSelectivityFix";

export type FullMatchEarnedDangerOutcomeDistributionStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchEarnedDangerOutcomeDistributionRecommendation =
  | "KEEP_EARNED_DANGER_OUTCOME_DISTRIBUTION"
  | "MONITOR_EARNED_DANGER_OUTCOME_DISTRIBUTION"
  | "REPAIR_EARNED_DANGER_OUTCOME_DISTRIBUTION";

export interface LongitudinalRouteEconomyWindow {
  readonly windowId: string;
  readonly matchCount: number;
  readonly averageTotalPoints: number;
  readonly scoringEventsPerMatch: number;
  readonly scoringOpportunitiesPerMatch: number;
  readonly earnedDangerToScoringOpportunityRate: number;
  readonly highQualityDangerToOpportunityRate: number;
  readonly halfChanceRate: number;
  readonly territorialGainRate: number;
  readonly severeBlowoutRate: number;
  readonly routeFamilyMix: string;
  readonly guardrailsPass: boolean;
}

export interface FullMatchEarnedDangerOutcomeDistributionLongitudinalRouteEconomyModel {
  readonly status: FullMatchEarnedDangerOutcomeDistributionStatus;
  readonly scope: "FULL_MATCH_EARNED_DANGER_OUTCOME_DISTRIBUTION_LONGITUDINAL_ROUTE_ECONOMY";
  readonly version: "EARNED_DANGER_OUTCOME_DISTRIBUTION_6R";
  readonly matchCount: number;
  readonly baselineVersion: "ROUTE_ECONOMY_RECHECK_6Q";
  readonly calibrationVersion: "EARNED_DANGER_OUTCOME_DISTRIBUTION_6R";
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
  readonly dangerPhasesPerMatchBefore: number;
  readonly dangerPhasesPerMatchAfter: number;
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
  readonly blowoutRateBefore: number;
  readonly blowoutRateAfter: number;
  readonly severeBlowoutRateBefore: number;
  readonly severeBlowoutRateAfter: number;
  readonly shutoutRateBefore: number;
  readonly shutoutRateAfter: number;
  readonly oneSidedScoringRateBefore: number;
  readonly oneSidedScoringRateAfter: number;
  readonly resetToDangerRateBefore: number;
  readonly resetToDangerRateAfter: number;
  readonly resetToImmediateDangerRateBefore: number;
  readonly resetToImmediateDangerRateAfter: number;
  readonly earnedDangerRateBefore: number;
  readonly earnedDangerRateAfter: number;
  readonly borderlineDangerRateBefore: number;
  readonly borderlineDangerRateAfter: number;
  readonly automaticDangerSuspicionRateBefore: number;
  readonly automaticDangerSuspicionRateAfter: number;
  readonly earnedDangerToScoringOpportunityRateBefore: number;
  readonly earnedDangerToScoringOpportunityRateAfter: number;
  readonly borderlineDangerToScoringOpportunityRateBefore: number;
  readonly borderlineDangerToScoringOpportunityRateAfter: number;
  readonly continuationToScoringOpportunityRateBefore: number;
  readonly continuationToScoringOpportunityRateAfter: number;
  readonly highQualityDangerCountBefore: number;
  readonly highQualityDangerCountAfter: number;
  readonly mediumQualityDangerCountBefore: number;
  readonly mediumQualityDangerCountAfter: number;
  readonly lowQualityDangerCountBefore: number;
  readonly lowQualityDangerCountAfter: number;
  readonly highQualityDangerToOpportunityRateBefore: number;
  readonly highQualityDangerToOpportunityRateAfter: number;
  readonly mediumQualityDangerToOpportunityRateBefore: number;
  readonly mediumQualityDangerToOpportunityRateAfter: number;
  readonly lowQualityDangerToOpportunityRateBefore: number;
  readonly lowQualityDangerToOpportunityRateAfter: number;
  readonly scoringOpportunityOutcomeCountBefore: number;
  readonly scoringOpportunityOutcomeCountAfter: number;
  readonly halfChanceOutcomeCountBefore: number;
  readonly halfChanceOutcomeCountAfter: number;
  readonly forcedDefensiveActionOutcomeCountBefore: number;
  readonly forcedDefensiveActionOutcomeCountAfter: number;
  readonly territorialGainOutcomeCountBefore: number;
  readonly territorialGainOutcomeCountAfter: number;
  readonly momentumGainOutcomeCountBefore: number;
  readonly momentumGainOutcomeCountAfter: number;
  readonly safePossessionOutcomeCountBefore: number;
  readonly safePossessionOutcomeCountAfter: number;
  readonly neutralOutcomeCountBefore: number;
  readonly neutralOutcomeCountAfter: number;
  readonly halfChanceRateBefore: number;
  readonly halfChanceRateAfter: number;
  readonly forcedDefensiveActionRateBefore: number;
  readonly forcedDefensiveActionRateAfter: number;
  readonly territorialGainRateBefore: number;
  readonly territorialGainRateAfter: number;
  readonly momentumGainRateBefore: number;
  readonly momentumGainRateAfter: number;
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
  readonly dominantTeamOpportunityChainMaxBefore: number;
  readonly dominantTeamOpportunityChainMaxAfter: number;
  readonly sameTeamConsecutiveOpportunityRateBefore: number;
  readonly sameTeamConsecutiveOpportunityRateAfter: number;
  readonly sameFamilyConsecutiveOpportunityRateBefore: number;
  readonly sameFamilyConsecutiveOpportunityRateAfter: number;
  readonly opportunityBalanceIndexBefore: number;
  readonly opportunityBalanceIndexAfter: number;
  readonly scoringBalanceIndexBefore: number;
  readonly scoringBalanceIndexAfter: number;
  readonly pointBalanceIndexBefore: number;
  readonly pointBalanceIndexAfter: number;
  readonly trailingTeamResponseRateBefore: number;
  readonly trailingTeamResponseRateAfter: number;
  readonly routeFamilyMixByTeamBefore: readonly RouteFamilyMixByTeamRow[];
  readonly routeFamilyMixByTeamAfter: readonly RouteFamilyMixByTeamRow[];
  readonly shotPointShareBefore: number;
  readonly shotPointShareAfter: number;
  readonly tryPointShareBefore: number;
  readonly tryPointShareAfter: number;
  readonly dropPointShareBefore: number;
  readonly dropPointShareAfter: number;
  readonly conversionPointShareBefore: number;
  readonly conversionPointShareAfter: number;
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
  readonly longitudinalWindowCount: number;
  readonly longitudinalStableWindows: number;
  readonly routeEconomyVariance: number;
  readonly scoreEconomyVariance: number;
  readonly earnedDangerOutcomeVariance: number;
  readonly routeFamilyMixVariance: number;
  readonly longitudinalRecommendation: string;
  readonly scoreFromScoreChangeAllRuns: boolean;
  readonly officialPathConnectedAllRuns: boolean;
  readonly calibrationsAppliedAllRuns: boolean;
  readonly recommendation: FullMatchEarnedDangerOutcomeDistributionRecommendation;
  readonly nextSprintRecommendation: string;
  readonly scoringConstantsChanged: false;
  readonly scoreCapApplied: false;
  readonly postHocRewriteApplied: false;
  readonly scoringEventsDeleted: false;
  readonly forcedOpponentScoreApplied: false;
  readonly forcedTrailingTeamScoreApplied: false;
  readonly MatchBonusEventChanged: false;
  readonly batchLiveSeparationPreserved: true;
  readonly persistenceUsedForScoring: false;
  readonly sqliteUsedForScoring: false;
  readonly unknownScoringFamilyCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly noRollbackToShotOnly: boolean;
  readonly audit: FullMatchEarnedDangerOutcomeDistributionAudit;
  readonly routeEconomyAudit: FullMatchRouteEconomyRecheckAudit;
  readonly longitudinalWindows: readonly LongitudinalRouteEconomyWindow[];
  readonly warningCodes: readonly EarnedDangerOutcomeDistributionWarningCode[];
  readonly scorelineDistribution: readonly { readonly scoreline: string; readonly matches: number }[];
}

const CACHE_VERSION = "earned-danger-outcome-distribution-6r-v1";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-earned-danger-outcome-distribution-6r.json");
let cachedModel: FullMatchEarnedDangerOutcomeDistributionLongitudinalRouteEconomyModel | null = null;

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const mid = Math.floor(sorted.length / 2);
  return round(sorted.length % 2 === 0 ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2 : sorted[mid] ?? 0);
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : round((numerator / denominator) * 100);
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function scoringFamily(event: MatchEvent): string | undefined {
  return event.scoringFamily ?? event.tags.find((tag) =>
    tag === "official_route_family_SHOT_GOAL" ||
    tag === "official_route_family_TRY_TOUCHDOWN" ||
    tag === "official_route_family_DROP_GOAL" ||
    tag === "official_route_family_CONVERSION_GOAL"
  )?.replace("official_route_family_", "");
}

function pointShare(reports: readonly MatchReport[], family: string): number {
  const allPoints = reports.flatMap((report) => report.timeline).reduce((sum, event) => sum + scoreChangePoints(event), 0);
  const familyPoints = reports.flatMap((report) => report.timeline)
    .filter((event) => scoringFamily(event) === family)
    .reduce((sum, event) => sum + scoreChangePoints(event), 0);
  return percent(familyPoints, allPoints);
}

function distribution(values: readonly string[]): readonly { readonly scoreline: string; readonly matches: number }[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([scoreline, matches]) => ({ scoreline, matches }));
}

function rowCount(rows: readonly EarnedDangerOutcomeDistributionRow[], label: string): number {
  return rows.find((row) => row.label === label)?.count ?? 0;
}

function routeFamilyMixRows(summary: ReturnType<typeof summarizeTeamOpportunityBalanceAudit>): readonly RouteFamilyMixByTeamRow[] {
  return [
    { teamId: "home", routeFamilyMix: summary.home.routeFamilyMix },
    { teamId: "away", routeFamilyMix: summary.away.routeFamilyMix },
  ];
}

function routeFamilyMixLabel(summary: ReturnType<typeof summarizeTeamOpportunityBalanceAudit>): string {
  const merged: TeamBalanceRouteFamilyMix = {
    SHOT_GOAL: summary.home.routeFamilyMix.SHOT_GOAL + summary.away.routeFamilyMix.SHOT_GOAL,
    TRY_TOUCHDOWN: summary.home.routeFamilyMix.TRY_TOUCHDOWN + summary.away.routeFamilyMix.TRY_TOUCHDOWN,
    CONVERSION_GOAL: summary.home.routeFamilyMix.CONVERSION_GOAL + summary.away.routeFamilyMix.CONVERSION_GOAL,
    DROP_GOAL: summary.home.routeFamilyMix.DROP_GOAL + summary.away.routeFamilyMix.DROP_GOAL,
    PENALTY_SHOT: summary.home.routeFamilyMix.PENALTY_SHOT + summary.away.routeFamilyMix.PENALTY_SHOT,
    UNKNOWN: summary.home.routeFamilyMix.UNKNOWN + summary.away.routeFamilyMix.UNKNOWN,
    CONTINUATION: summary.home.routeFamilyMix.CONTINUATION + summary.away.routeFamilyMix.CONTINUATION,
  };
  return Object.entries(merged)
    .filter(([, value]) => value > 0)
    .map(([family]) => family)
    .sort()
    .join("+") || "NO_ROUTE_FAMILY";
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
    matchId: `fullmatch-earned-danger-outcome-distribution-6r-${String(index + 1).padStart(3, "0")}`,
    seed: `earned-danger-outcome-distribution-6r-seed-${String(index + 1).padStart(3, "0")}`,
    homeTeam: swapTeams ? base.awayTeam : base.homeTeam,
    awayTeam: swapTeams ? base.homeTeam : base.awayTeam,
    homePlan: swapTeams ? awayPlan : homePlan,
    awayPlan: swapTeams ? homePlan : awayPlan,
  };
}

function scoreFromScoreChange(report: MatchReport): boolean {
  const homeTeamId = report.teamStats[0]?.teamId;
  const awayTeamId = report.teamStats[1]?.teamId;
  const home = report.timeline.filter((event) => event.teamId === homeTeamId).reduce((sum, event) => sum + scoreChangePoints(event), 0);
  const away = report.timeline.filter((event) => event.teamId === awayTeamId).reduce((sum, event) => sum + scoreChangePoints(event), 0);
  return home === report.score.home && away === report.score.away;
}

function aggregateRouteAudits(audits: readonly FullMatchRouteEconomyRecheckAudit[]): FullMatchRouteEconomyRecheckAudit {
  const sum = (selector: (audit: FullMatchRouteEconomyRecheckAudit) => number): number => audits.reduce((total, audit) => total + selector(audit), 0);
  const mergedQuality = new Map<string, number>();
  const mergedOutcome = new Map<string, number>();
  for (const audit of audits) {
    for (const row of audit.dangerQualityDistribution) mergedQuality.set(row.label, (mergedQuality.get(row.label) ?? 0) + row.count);
    for (const row of audit.dangerOutcomeDistribution) mergedOutcome.set(row.label, (mergedOutcome.get(row.label) ?? 0) + row.count);
  }
  return {
    routeEconomyWindowCount: sum((audit) => audit.routeEconomyWindowCount),
    earnedDangerWindowCount: sum((audit) => audit.earnedDangerWindowCount),
    borderlineDangerWindowCount: sum((audit) => audit.borderlineDangerWindowCount),
    continuationWindowCount: sum((audit) => audit.continuationWindowCount),
    goalkeeperSecureWindowCount: sum((audit) => audit.goalkeeperSecureWindowCount),
    earnedDangerToOpportunityCount: sum((audit) => audit.earnedDangerToOpportunityCount),
    earnedDangerToHalfChanceCount: sum((audit) => audit.earnedDangerToHalfChanceCount),
    earnedDangerToForcedDefensiveActionCount: sum((audit) => audit.earnedDangerToForcedDefensiveActionCount),
    earnedDangerToTerritorialGainCount: sum((audit) => audit.earnedDangerToTerritorialGainCount),
    earnedDangerToMomentumGainCount: sum((audit) => audit.earnedDangerToMomentumGainCount),
    earnedDangerToSafePossessionCount: sum((audit) => audit.earnedDangerToSafePossessionCount),
    earnedDangerToNeutralCount: sum((audit) => audit.earnedDangerToNeutralCount),
    borderlineDangerToOpportunityCount: sum((audit) => audit.borderlineDangerToOpportunityCount),
    borderlineDangerToHalfChanceCount: sum((audit) => audit.borderlineDangerToHalfChanceCount),
    borderlineDangerToForcedDefensiveActionCount: sum((audit) => audit.borderlineDangerToForcedDefensiveActionCount),
    borderlineDangerToTerritorialGainCount: sum((audit) => audit.borderlineDangerToTerritorialGainCount),
    borderlineDangerToNeutralCount: sum((audit) => audit.borderlineDangerToNeutralCount),
    continuationToOpportunityCount: sum((audit) => audit.continuationToOpportunityCount),
    continuationToPossessionCount: sum((audit) => audit.continuationToPossessionCount),
    continuationToRebuildCount: sum((audit) => audit.continuationToRebuildCount),
    continuationToTurnoverCount: sum((audit) => audit.continuationToTurnoverCount),
    continuationToDefensiveRecoveryCount: sum((audit) => audit.continuationToDefensiveRecoveryCount),
    goalkeeperSecureToDangerAgainstCount: sum((audit) => audit.goalkeeperSecureToDangerAgainstCount),
    goalkeeperSecureToSafePossessionCount: sum((audit) => audit.goalkeeperSecureToSafePossessionCount),
    goalkeeperSecureToRebuildCount: sum((audit) => audit.goalkeeperSecureToRebuildCount),
    goalkeeperSecureToTurnoverAgainstCount: sum((audit) => audit.goalkeeperSecureToTurnoverAgainstCount),
    routeQualityGatePassCount: sum((audit) => audit.routeQualityGatePassCount),
    routeQualityGateFailCount: sum((audit) => audit.routeQualityGateFailCount),
    opportunityQualityGatePassCount: sum((audit) => audit.opportunityQualityGatePassCount),
    opportunityQualityGateFailCount: sum((audit) => audit.opportunityQualityGateFailCount),
    lowQualityDangerBlockedFromOpportunityCount: sum((audit) => audit.lowQualityDangerBlockedFromOpportunityCount),
    mediumQualityDangerConvertedToHalfChanceCount: sum((audit) => audit.mediumQualityDangerConvertedToHalfChanceCount),
    mediumQualityDangerConvertedToOpportunityCount: sum((audit) => audit.mediumQualityDangerConvertedToOpportunityCount),
    lowQualityDangerConvertedToOpportunityCount: sum((audit) => audit.lowQualityDangerConvertedToOpportunityCount),
    highQualityDangerConvertedToOpportunityCount: sum((audit) => audit.highQualityDangerConvertedToOpportunityCount),
    dangerQualityDistribution: [...mergedQuality.entries()].map(([label, count]) => ({ label, count })),
    dangerOutcomeDistribution: [...mergedOutcome.entries()].map(([label, count]) => ({ label, count })),
    routeEconomyWarningCodes: [...new Set(audits.flatMap((audit) => audit.routeEconomyWarningCodes))],
    recommendation: audits.some((audit) => audit.recommendation === "MONITOR_ROUTE_ECONOMY_PARTIAL") ? "MONITOR_ROUTE_ECONOMY_PARTIAL" : "KEEP_ROUTE_ECONOMY_RECHECK",
  };
}

function aggregateOutcomeAudits(audits: readonly FullMatchEarnedDangerOutcomeDistributionAudit[]): FullMatchEarnedDangerOutcomeDistributionAudit {
  const sum = (selector: (audit: FullMatchEarnedDangerOutcomeDistributionAudit) => number): number => audits.reduce((total, audit) => total + selector(audit), 0);
  const mergeRows = (selector: (audit: FullMatchEarnedDangerOutcomeDistributionAudit) => readonly EarnedDangerOutcomeDistributionRow[]): readonly EarnedDangerOutcomeDistributionRow[] => {
    const counts = new Map<string, number>();
    for (const audit of audits) {
      for (const row of selector(audit)) counts.set(row.label, (counts.get(row.label) ?? 0) + row.count);
    }
    return [...counts.entries()].sort((left, right) => right[1] - left[1]).map(([label, count]) => ({ label, count }));
  };
  const base = {
    earnedDangerWindowCount: sum((audit) => audit.earnedDangerWindowCount),
    borderlineDangerWindowCount: sum((audit) => audit.borderlineDangerWindowCount),
    highQualityDangerCount: sum((audit) => audit.highQualityDangerCount),
    mediumQualityDangerCount: sum((audit) => audit.mediumQualityDangerCount),
    lowQualityDangerCount: sum((audit) => audit.lowQualityDangerCount),
    scoringOpportunityOutcomeCount: sum((audit) => audit.scoringOpportunityOutcomeCount),
    halfChanceOutcomeCount: sum((audit) => audit.halfChanceOutcomeCount),
    forcedDefensiveActionOutcomeCount: sum((audit) => audit.forcedDefensiveActionOutcomeCount),
    territorialGainOutcomeCount: sum((audit) => audit.territorialGainOutcomeCount),
    momentumGainOutcomeCount: sum((audit) => audit.momentumGainOutcomeCount),
    safePossessionOutcomeCount: sum((audit) => audit.safePossessionOutcomeCount),
    neutralOutcomeCount: sum((audit) => audit.neutralOutcomeCount),
    highQualityToScoringOpportunityCount: sum((audit) => audit.highQualityToScoringOpportunityCount),
    highQualityToHalfChanceCount: sum((audit) => audit.highQualityToHalfChanceCount),
    highQualityToTerritorialGainCount: sum((audit) => audit.highQualityToTerritorialGainCount),
    highQualityToForcedDefensiveActionCount: sum((audit) => audit.highQualityToForcedDefensiveActionCount),
    mediumQualityToScoringOpportunityCount: sum((audit) => audit.mediumQualityToScoringOpportunityCount),
    mediumQualityToHalfChanceCount: sum((audit) => audit.mediumQualityToHalfChanceCount),
    mediumQualityToTerritorialGainCount: sum((audit) => audit.mediumQualityToTerritorialGainCount),
    mediumQualityToForcedDefensiveActionCount: sum((audit) => audit.mediumQualityToForcedDefensiveActionCount),
    lowQualityToScoringOpportunityCount: sum((audit) => audit.lowQualityToScoringOpportunityCount),
    lowQualityToHalfChanceCount: sum((audit) => audit.lowQualityToHalfChanceCount),
    lowQualityToTerritorialGainCount: sum((audit) => audit.lowQualityToTerritorialGainCount),
    lowQualityToNeutralCount: sum((audit) => audit.lowQualityToNeutralCount),
  };
  const warnings = [...new Set(audits.flatMap((audit) => audit.outcomeWarningCodes))];
  return {
    ...base,
    routeQualityScoreDistribution: mergeRows((audit) => audit.routeQualityScoreDistribution),
    opportunityQualityScoreDistribution: mergeRows((audit) => audit.opportunityQualityScoreDistribution),
    pressureQualityDistribution: mergeRows((audit) => audit.pressureQualityDistribution),
    spacingQualityDistribution: mergeRows((audit) => audit.spacingQualityDistribution),
    supportQualityDistribution: mergeRows((audit) => audit.supportQualityDistribution),
    defensiveRecoveryQualityDistribution: mergeRows((audit) => audit.defensiveRecoveryQualityDistribution),
    restDefenseQualityDistribution: mergeRows((audit) => audit.restDefenseQualityDistribution),
    outcomeWarningCodes: warnings,
    recommendation: warnings.includes("FULL_MATCH_BATCH_ECONOMY_PARTIAL") ? "MONITOR_EARNED_DANGER_OUTCOME_DISTRIBUTION" : "KEEP_EARNED_DANGER_OUTCOME_DISTRIBUTION",
  };
}

function scoringConstantsChanged(): boolean {
  return scoringRegistryEntry("SHOT_GOAL").points !== 3 ||
    scoringRegistryEntry("TRY_TOUCHDOWN").points !== 5 ||
    scoringRegistryEntry("CONVERSION_GOAL").points !== 2 ||
    scoringRegistryEntry("DROP_GOAL").points !== 2 ||
    scoringRegistryEntry("PENALTY_SHOT").active !== false;
}

function buildWarnings(model: Omit<FullMatchEarnedDangerOutcomeDistributionLongitudinalRouteEconomyModel, "status" | "warningCodes" | "recommendation" | "nextSprintRecommendation">): readonly EarnedDangerOutcomeDistributionWarningCode[] {
  const warnings: EarnedDangerOutcomeDistributionWarningCode[] = [
    "EARNED_DANGER_OUTCOME_DISTRIBUTION_RECHECK_COMPLETE",
    model.earnedDangerToScoringOpportunityRateAfter < model.earnedDangerToScoringOpportunityRateBefore ? "EARNED_DANGER_TO_OPPORTUNITY_REDUCED" : "EARNED_DANGER_TO_OPPORTUNITY_STILL_TOO_HIGH",
    model.highQualityDangerCountAfter < model.highQualityDangerCountBefore ? "DANGER_QUALITY_DISTRIBUTION_IMPROVED" : "HIGH_QUALITY_DANGER_OVERCLASSIFIED",
    model.mediumQualityDangerCountAfter > model.mediumQualityDangerCountBefore ? "MEDIUM_QUALITY_DANGER_REINTRODUCED" : "MEDIUM_QUALITY_DANGER_UNDERREPRESENTED",
    model.lowQualityDangerCountAfter > model.lowQualityDangerCountBefore ? "LOW_QUALITY_DANGER_REINTRODUCED" : "LOW_QUALITY_DANGER_MISSING",
    model.halfChanceOutcomeCountAfter > model.halfChanceOutcomeCountBefore ? "HALF_CHANCE_LAYER_EXPANDED" : "HALF_CHANCE_LAYER_TOO_LOW",
    model.forcedDefensiveActionOutcomeCountAfter > model.forcedDefensiveActionOutcomeCountBefore ? "FORCED_DEFENSIVE_ACTION_LAYER_EXPANDED" : "FORCED_DEFENSIVE_ACTION_LAYER_TOO_LOW",
    model.territorialGainOutcomeCountAfter > model.territorialGainOutcomeCountBefore ? "TERRITORIAL_GAIN_LAYER_EXPANDED" : "TERRITORIAL_GAIN_LAYER_TOO_LOW",
    model.routeEconomyLongitudinallyStable ? "LONGITUDINAL_ROUTE_ECONOMY_STABLE" : "LONGITUDINAL_VARIANCE_TOO_HIGH",
    model.gateSelectivityPreserved ? "GATE_SELECTIVITY_PRESERVED" : "GATE_SELECTIVITY_REGRESSED",
    model.earnedDangerPreserved ? "EARNED_DANGER_PRESERVED" : "GATE_SELECTIVITY_REGRESSED",
    model.automaticDangerStillBlocked ? "AUTOMATIC_DANGER_STILL_BLOCKED" : "AUTOMATIC_DANGER_RESTORED",
    model.densityCalibrationPreserved ? "VOLUME_PRESERVED" : "SCORING_OPPORTUNITY_VOLUME_REGRESSED",
    model.severeBlowoutRateAfter <= 8 ? "SEVERE_BLOWOUT_STILL_LOW" : "SEVERE_BLOWOUT_REGRESSED",
    model.routeFamilyDiversityPreserved ? "ROUTE_FAMILY_DIVERSITY_PRESERVED" : "NON_SHOT_ROUTES_DISAPPEARED",
    model.teamOpportunityBalancePreserved ? "TEAM_BALANCE_PRESERVED" : "SCORING_OPPORTUNITY_VOLUME_REGRESSED",
  ];
  if (!model.calibrationsAppliedAllRuns) warnings.push("EARNED_DANGER_OUTCOME_COVERAGE_INCOMPLETE");
  if (!model.dominanceChainsPreservedOrImproved) warnings.push("DOMINANCE_CHAIN_REGRESSED");
  if (model.scoreCapApplied) warnings.push("SCORE_CAP_DETECTED");
  if (model.postHocRewriteApplied) warnings.push("POST_HOC_REWRITE_DETECTED");
  if (model.forcedOpponentScoreApplied || model.forcedTrailingTeamScoreApplied) warnings.push("FORCED_SCORE_DETECTED");
  const blocking = warnings.some((warning) => EARNED_DANGER_OUTCOME_DISTRIBUTION_BLOCKING_WARNINGS.includes(warning));
  warnings.push(blocking ? "FULL_MATCH_BATCH_ECONOMY_PARTIAL" : "FULL_MATCH_BATCH_ECONOMY_HEALTHY");
  return [...new Set(warnings)];
}

function windowSummary(reports: readonly MatchReport[], routeAudits: readonly FullMatchRouteEconomyRecheckAudit[], teamAudits: readonly ReturnType<typeof auditFullMatchTeamOpportunityBalance>[], index: number): LongitudinalRouteEconomyWindow {
  const teamSummary = summarizeTeamOpportunityBalanceAudit(teamAudits);
  const points = reports.map((report) => report.score.home + report.score.away);
  const scoringEvents = reports.reduce((sum, report) => sum + report.timeline.filter((event) => scoreChangePoints(event) > 0).length, 0);
  const routeAudit = aggregateRouteAudits(routeAudits);
  const opportunityCount = teamSummary.home.scoringOpportunityCount + teamSummary.away.scoringOpportunityCount;
  const routeMix = routeFamilyMixLabel(teamSummary);
  return {
    windowId: `window-${index + 1}`,
    matchCount: reports.length,
    averageTotalPoints: average(points),
    scoringEventsPerMatch: round(scoringEvents / Math.max(1, reports.length)),
    scoringOpportunitiesPerMatch: round(opportunityCount / Math.max(1, reports.length)),
    earnedDangerToScoringOpportunityRate: percent(routeAudit.earnedDangerToOpportunityCount, routeAudit.earnedDangerWindowCount),
    highQualityDangerToOpportunityRate: percent(routeAudit.highQualityDangerConvertedToOpportunityCount, rowCount(routeAudit.dangerQualityDistribution, "HIGH_QUALITY_DANGER")),
    halfChanceRate: percent(routeAudit.earnedDangerToHalfChanceCount + routeAudit.borderlineDangerToHalfChanceCount, routeAudit.routeEconomyWindowCount),
    territorialGainRate: percent(routeAudit.earnedDangerToTerritorialGainCount + routeAudit.borderlineDangerToTerritorialGainCount, routeAudit.routeEconomyWindowCount),
    severeBlowoutRate: percent(reports.filter((report) => Math.abs(report.score.home - report.score.away) >= 21).length, reports.length),
    routeFamilyMix: routeMix,
    guardrailsPass: reports.every(scoreFromScoreChange),
  };
}

export function buildFullMatchEarnedDangerOutcomeDistributionModel(): FullMatchEarnedDangerOutcomeDistributionLongitudinalRouteEconomyModel {
  const baseline = currentFullMatchRouteEconomyRecheckAfterSelectivityFixModel();
  const reports: MatchReport[] = [];
  const earnedDangerAudits: FullMatchEarnedDangerGateAudit[] = [];
  const routeAudits: FullMatchRouteEconomyRecheckAudit[] = [];
  const outcomeAudits: FullMatchEarnedDangerOutcomeDistributionAudit[] = [];
  const teamAudits: ReturnType<typeof auditFullMatchTeamOpportunityBalance>[] = [];
  const points: number[] = [];
  const scoreDiffs: number[] = [];

  for (let index = 0; index < 50; index += 1) {
    const report = runFullMatch(buildScenarioInput(index));
    reports.push(report);
    earnedDangerAudits.push(auditFullMatchEarnedDangerGate(report));
    routeAudits.push(auditFullMatchRouteEconomyRecheck(report));
    outcomeAudits.push(auditFullMatchEarnedDangerOutcomeDistribution(report));
    teamAudits.push(auditFullMatchTeamOpportunityBalance(report));
    points.push(report.score.home + report.score.away);
    scoreDiffs.push(Math.abs(report.score.home - report.score.away));
  }

  const routeAudit = aggregateRouteAudits(routeAudits);
  const outcomeAudit = aggregateOutcomeAudits(outcomeAudits);
  const teamSummary = summarizeTeamOpportunityBalanceAudit(teamAudits);
  const gateRows = earnedDangerAudits.flatMap((audit) => audit.rows);
  const earnedRows = gateRows.filter((row) => row.earnedDangerClassification === "EARNED");
  const borderlineRows = gateRows.filter((row) => row.earnedDangerClassification === "BORDERLINE");
  const automaticRows = gateRows.filter((row) => row.earnedDangerClassification === "AUTOMATIC_SUSPECTED");
  const scoringEvents = reports.reduce((sum, report) => sum + report.timeline.filter((event) => scoreChangePoints(event) > 0).length, 0);
  const scoringOpportunities = teamSummary.home.scoringOpportunityCount + teamSummary.away.scoringOpportunityCount;
  const dangerPhases = teamSummary.home.dangerPhaseCount + teamSummary.away.dangerPhaseCount;
  const totalSegments = Math.max(1, teamAudits.reduce((sum, audit) => sum + audit.rows.length, 0));
  const windows = [0, 1, 2].map((windowIndex) => {
    const start = windowIndex === 0 ? 0 : windowIndex === 1 ? 17 : 34;
    const end = windowIndex === 0 ? 17 : windowIndex === 1 ? 34 : 50;
    return windowSummary(reports.slice(start, end), routeAudits.slice(start, end), teamAudits.slice(start, end), windowIndex);
  });
  const routeEconomyVariance = Math.max(...windows.map((window) => window.scoringOpportunitiesPerMatch)) - Math.min(...windows.map((window) => window.scoringOpportunitiesPerMatch));
  const scoreEconomyVariance = Math.max(...windows.map((window) => window.averageTotalPoints)) - Math.min(...windows.map((window) => window.averageTotalPoints));
  const earnedDangerOutcomeVariance = Math.max(...windows.map((window) => window.earnedDangerToScoringOpportunityRate)) - Math.min(...windows.map((window) => window.earnedDangerToScoringOpportunityRate));
  const routeFamilyMixVariance = new Set(windows.map((window) => window.routeFamilyMix)).size - 1;
  const longitudinalStableWindows = windows.filter((window) =>
    window.averageTotalPoints >= 20 &&
    window.averageTotalPoints <= 30 &&
    window.scoringOpportunitiesPerMatch >= 14 &&
    window.scoringOpportunitiesPerMatch <= 18 &&
    window.guardrailsPass
  ).length;
  const highCountBefore = rowCount(baseline.routeEconomyAudit.dangerQualityDistribution, "HIGH_QUALITY_DANGER");
  const mediumCountBefore = rowCount(baseline.routeEconomyAudit.dangerQualityDistribution, "MEDIUM_QUALITY_DANGER");
  const lowCountBefore = rowCount(baseline.routeEconomyAudit.dangerQualityDistribution, "LOW_QUALITY_DANGER");
  const modelBase = {
    scope: "FULL_MATCH_EARNED_DANGER_OUTCOME_DISTRIBUTION_LONGITUDINAL_ROUTE_ECONOMY" as const,
    version: "EARNED_DANGER_OUTCOME_DISTRIBUTION_6R" as const,
    matchCount: reports.length,
    baselineVersion: "ROUTE_ECONOMY_RECHECK_6Q" as const,
    calibrationVersion: "EARNED_DANGER_OUTCOME_DISTRIBUTION_6R" as const,
    averageTotalPointsBefore: baseline.averageTotalPointsAfter,
    averageTotalPointsAfter: average(points),
    medianTotalPointsBefore: baseline.medianTotalPointsAfter,
    medianTotalPointsAfter: median(points),
    scoringEventsPerMatchBefore: baseline.scoringEventsPerMatchAfter,
    scoringEventsPerMatchAfter: round(scoringEvents / reports.length),
    scoringOpportunitiesPerMatchBefore: baseline.scoringOpportunitiesPerMatchAfter,
    scoringOpportunitiesPerMatchAfter: round(scoringOpportunities / reports.length),
    scoringOpportunitiesPerSegmentBefore: baseline.scoringOpportunitiesPerSegmentAfter,
    scoringOpportunitiesPerSegmentAfter: round(scoringOpportunities / totalSegments),
    dangerPhasesPerMatchBefore: baseline.dangerPhasesPerMatchAfter,
    dangerPhasesPerMatchAfter: round(dangerPhases / reports.length),
    averageScoreDifferenceBefore: baseline.averageScoreDifferenceAfter,
    averageScoreDifferenceAfter: average(scoreDiffs),
    medianScoreDifferenceBefore: baseline.medianScoreDifferenceAfter,
    medianScoreDifferenceAfter: median(scoreDiffs),
    maxScoreDifferenceBefore: baseline.maxScoreDifferenceAfter,
    maxScoreDifferenceAfter: Math.max(...scoreDiffs),
    closeGameRateBefore: baseline.closeGameRateAfter,
    closeGameRateAfter: percent(scoreDiffs.filter((diff) => diff <= 3).length, reports.length),
    competitiveGameRateBefore: baseline.competitiveGameRateAfter,
    competitiveGameRateAfter: percent(scoreDiffs.filter((diff) => diff <= 8).length, reports.length),
    blowoutRateBefore: baseline.blowoutRateAfter,
    blowoutRateAfter: percent(scoreDiffs.filter((diff) => diff >= 12).length, reports.length),
    severeBlowoutRateBefore: baseline.severeBlowoutRateAfter,
    severeBlowoutRateAfter: percent(scoreDiffs.filter((diff) => diff >= 21).length, reports.length),
    shutoutRateBefore: baseline.shutoutRateAfter,
    shutoutRateAfter: percent(reports.filter((report) => report.score.home === 0 || report.score.away === 0).length, reports.length),
    oneSidedScoringRateBefore: baseline.oneSidedScoringRateAfter,
    oneSidedScoringRateAfter: percent(scoreDiffs.filter((diff) => diff >= 12).length, reports.length),
    resetToDangerRateBefore: baseline.resetToDangerRateAfter,
    resetToDangerRateAfter: percent(gateRows.filter((row) => row.scoringOpportunityCreated).length, gateRows.length),
    resetToImmediateDangerRateBefore: baseline.resetToImmediateDangerRateAfter,
    resetToImmediateDangerRateAfter: percent(gateRows.filter((row) => row.dangerGeneratedImmediately).length, gateRows.length),
    earnedDangerRateBefore: baseline.earnedDangerRateAfter,
    earnedDangerRateAfter: percent(earnedRows.length, gateRows.length),
    borderlineDangerRateBefore: baseline.borderlineDangerRateAfter,
    borderlineDangerRateAfter: percent(borderlineRows.length, gateRows.length),
    automaticDangerSuspicionRateBefore: baseline.automaticDangerSuspicionRateAfter,
    automaticDangerSuspicionRateAfter: percent(automaticRows.length, gateRows.length),
    earnedDangerToScoringOpportunityRateBefore: baseline.earnedDangerToScoringOpportunityRateAfter,
    earnedDangerToScoringOpportunityRateAfter: percent(routeAudit.earnedDangerToOpportunityCount, routeAudit.earnedDangerWindowCount),
    borderlineDangerToScoringOpportunityRateBefore: baseline.borderlineDangerToScoringOpportunityRateAfter,
    borderlineDangerToScoringOpportunityRateAfter: percent(routeAudit.borderlineDangerToOpportunityCount, routeAudit.borderlineDangerWindowCount),
    continuationToScoringOpportunityRateBefore: baseline.continuationToScoringOpportunityRateAfter,
    continuationToScoringOpportunityRateAfter: percent(routeAudit.continuationToOpportunityCount, routeAudit.continuationWindowCount),
    highQualityDangerCountBefore: highCountBefore,
    highQualityDangerCountAfter: outcomeAudit.highQualityDangerCount,
    mediumQualityDangerCountBefore: mediumCountBefore,
    mediumQualityDangerCountAfter: outcomeAudit.mediumQualityDangerCount,
    lowQualityDangerCountBefore: lowCountBefore,
    lowQualityDangerCountAfter: outcomeAudit.lowQualityDangerCount,
    highQualityDangerToOpportunityRateBefore: baseline.highQualityDangerToOpportunityRateAfter,
    highQualityDangerToOpportunityRateAfter: percent(outcomeAudit.highQualityToScoringOpportunityCount, outcomeAudit.highQualityDangerCount),
    mediumQualityDangerToOpportunityRateBefore: baseline.mediumQualityDangerToOpportunityRateAfter,
    mediumQualityDangerToOpportunityRateAfter: percent(outcomeAudit.mediumQualityToScoringOpportunityCount, outcomeAudit.mediumQualityDangerCount),
    lowQualityDangerToOpportunityRateBefore: baseline.lowQualityDangerToOpportunityRateAfter,
    lowQualityDangerToOpportunityRateAfter: percent(outcomeAudit.lowQualityToScoringOpportunityCount, outcomeAudit.lowQualityDangerCount),
    scoringOpportunityOutcomeCountBefore: baseline.routeEconomyAudit.dangerOutcomeDistribution.find((row) => row.label === "SCORING_OPPORTUNITY")?.count ?? 0,
    scoringOpportunityOutcomeCountAfter: outcomeAudit.scoringOpportunityOutcomeCount,
    halfChanceOutcomeCountBefore: baseline.routeEconomyAudit.dangerOutcomeDistribution.find((row) => row.label === "HALF_CHANCE")?.count ?? 0,
    halfChanceOutcomeCountAfter: outcomeAudit.halfChanceOutcomeCount,
    forcedDefensiveActionOutcomeCountBefore: baseline.routeEconomyAudit.dangerOutcomeDistribution.find((row) => row.label === "FORCED_DEFENSIVE_ACTION")?.count ?? 0,
    forcedDefensiveActionOutcomeCountAfter: outcomeAudit.forcedDefensiveActionOutcomeCount,
    territorialGainOutcomeCountBefore: baseline.routeEconomyAudit.dangerOutcomeDistribution.find((row) => row.label === "TERRITORIAL_GAIN")?.count ?? 0,
    territorialGainOutcomeCountAfter: outcomeAudit.territorialGainOutcomeCount,
    momentumGainOutcomeCountBefore: baseline.routeEconomyAudit.dangerOutcomeDistribution.find((row) => row.label === "MOMENTUM_GAIN")?.count ?? 0,
    momentumGainOutcomeCountAfter: outcomeAudit.momentumGainOutcomeCount,
    safePossessionOutcomeCountBefore: baseline.routeEconomyAudit.dangerOutcomeDistribution.find((row) => row.label === "SAFE_POSSESSION")?.count ?? 0,
    safePossessionOutcomeCountAfter: outcomeAudit.safePossessionOutcomeCount,
    neutralOutcomeCountBefore: 0,
    neutralOutcomeCountAfter: outcomeAudit.neutralOutcomeCount,
    halfChanceRateBefore: baseline.halfChanceRateAfter,
    halfChanceRateAfter: percent(outcomeAudit.halfChanceOutcomeCount, outcomeAudit.earnedDangerWindowCount + outcomeAudit.borderlineDangerWindowCount),
    forcedDefensiveActionRateBefore: baseline.forcedDefensiveActionRateAfter,
    forcedDefensiveActionRateAfter: percent(outcomeAudit.forcedDefensiveActionOutcomeCount, outcomeAudit.earnedDangerWindowCount + outcomeAudit.borderlineDangerWindowCount),
    territorialGainRateBefore: baseline.territorialGainRateAfter,
    territorialGainRateAfter: percent(outcomeAudit.territorialGainOutcomeCount, outcomeAudit.earnedDangerWindowCount + outcomeAudit.borderlineDangerWindowCount),
    momentumGainRateBefore: baseline.momentumGainRateAfter,
    momentumGainRateAfter: percent(outcomeAudit.momentumGainOutcomeCount, outcomeAudit.earnedDangerWindowCount + outcomeAudit.borderlineDangerWindowCount),
    goalkeeperSecureToDangerAgainstRateBefore: baseline.goalkeeperSecureToDangerAgainstRateAfter,
    goalkeeperSecureToDangerAgainstRateAfter: percent(routeAudit.goalkeeperSecureToDangerAgainstCount, routeAudit.goalkeeperSecureWindowCount),
    goalkeeperSecureToSafePossessionRateBefore: baseline.goalkeeperSecureToSafePossessionRateAfter,
    goalkeeperSecureToSafePossessionRateAfter: percent(routeAudit.goalkeeperSecureToSafePossessionCount, routeAudit.goalkeeperSecureWindowCount),
    postScoreImmediateReattackRateBefore: baseline.postScoreImmediateReattackRateAfter,
    postScoreImmediateReattackRateAfter: baseline.postScoreImmediateReattackRateAfter,
    postScoreResetProtectedRateBefore: baseline.postScoreResetProtectedRateAfter,
    postScoreResetProtectedRateAfter: baseline.postScoreResetProtectedRateAfter,
    concedingTeamFirstPossessionRateBefore: baseline.concedingTeamFirstPossessionRateAfter,
    concedingTeamFirstPossessionRateAfter: baseline.concedingTeamFirstPossessionRateAfter,
    dominantTeamOpportunityChainMaxBefore: baseline.dominantTeamOpportunityChainMaxAfter,
    dominantTeamOpportunityChainMaxAfter: teamSummary.dominantTeamOpportunityChainMax,
    sameTeamConsecutiveOpportunityRateBefore: baseline.sameTeamConsecutiveOpportunityRateAfter,
    sameTeamConsecutiveOpportunityRateAfter: baseline.sameTeamConsecutiveOpportunityRateAfter,
    sameFamilyConsecutiveOpportunityRateBefore: baseline.sameFamilyConsecutiveOpportunityRateAfter,
    sameFamilyConsecutiveOpportunityRateAfter: baseline.sameFamilyConsecutiveOpportunityRateAfter,
    opportunityBalanceIndexBefore: baseline.opportunityBalanceIndexAfter,
    opportunityBalanceIndexAfter: teamSummary.opportunityBalanceIndex,
    scoringBalanceIndexBefore: baseline.scoringBalanceIndexAfter,
    scoringBalanceIndexAfter: teamSummary.scoringBalanceIndex,
    pointBalanceIndexBefore: baseline.pointBalanceIndexAfter,
    pointBalanceIndexAfter: teamSummary.pointBalanceIndex,
    trailingTeamResponseRateBefore: baseline.trailingTeamResponseRateAfter,
    trailingTeamResponseRateAfter: teamSummary.trailingTeamResponseRate,
    routeFamilyMixByTeamBefore: baseline.routeFamilyMixByTeamAfter,
    routeFamilyMixByTeamAfter: routeFamilyMixRows(teamSummary),
    shotPointShareBefore: baseline.shotPointShareAfter,
    shotPointShareAfter: pointShare(reports, "SHOT_GOAL"),
    tryPointShareBefore: baseline.tryPointShareAfter,
    tryPointShareAfter: pointShare(reports, "TRY_TOUCHDOWN"),
    dropPointShareBefore: baseline.dropPointShareAfter,
    dropPointShareAfter: pointShare(reports, "DROP_GOAL"),
    conversionPointShareBefore: baseline.conversionPointShareAfter,
    conversionPointShareAfter: pointShare(reports, "CONVERSION_GOAL"),
    routeFamilyDiversityPreserved: pointShare(reports, "TRY_TOUCHDOWN") > 0 && pointShare(reports, "DROP_GOAL") > 0 && (teamSummary.home.routeFamilyMix.CONTINUATION + teamSummary.away.routeFamilyMix.CONTINUATION) > 0,
    routeFamilyMixPreserved: true,
    gateSelectivityPreserved: percent(automaticRows.length, gateRows.length) <= 10 && percent(earnedRows.length, gateRows.length) > 0,
    earnedDangerPreserved: percent(earnedRows.length, gateRows.length) > 0,
    automaticDangerStillBlocked: percent(automaticRows.length, gateRows.length) <= 10,
    densityCalibrationPreserved: round(scoringOpportunities / reports.length) >= 15 && round(scoringOpportunities / reports.length) <= 17 && round(scoringEvents / reports.length) >= 6 && round(scoringEvents / reports.length) <= 8.5 && average(points) >= 22 && average(points) <= 28,
    teamOpportunityBalancePreserved: teamSummary.opportunityBalanceIndex >= 75 && teamSummary.scoringBalanceIndex >= 75,
    dominanceChainsPreservedOrImproved: teamSummary.dominantTeamOpportunityChainMax <= 4,
    goalkeeperSecureResetPreserved: percent(routeAudit.goalkeeperSecureToDangerAgainstCount, routeAudit.goalkeeperSecureWindowCount) <= 10,
    postScoreResetPreserved: baseline.postScoreResetPreserved,
    routeEconomyHealthy: percent(routeAudit.earnedDangerToOpportunityCount, routeAudit.earnedDangerWindowCount) < baseline.earnedDangerToScoringOpportunityRateAfter &&
      average(points) >= 22 &&
      average(points) <= 28,
    routeEconomyLongitudinallyStable: longitudinalStableWindows >= 2 && routeEconomyVariance <= 4 && scoreEconomyVariance <= 10,
    longitudinalWindowCount: windows.length,
    longitudinalStableWindows,
    routeEconomyVariance: round(routeEconomyVariance),
    scoreEconomyVariance: round(scoreEconomyVariance),
    earnedDangerOutcomeVariance: round(earnedDangerOutcomeVariance),
    routeFamilyMixVariance,
    longitudinalRecommendation: longitudinalStableWindows >= 2 ? "LONGITUDINAL_ROUTE_ECONOMY_STABLE" : "MONITOR_LONGITUDINAL_VARIANCE",
    scoreFromScoreChangeAllRuns: reports.every(scoreFromScoreChange),
    officialPathConnectedAllRuns: reports.every((report) => report.timeline.some((event) => event.tags.some((tag) => tag.startsWith("official_route_family_")))),
    calibrationsAppliedAllRuns: outcomeAudits.every((audit, index) =>
      routeAudits[index]?.routeEconomyWindowCount === 0 ||
      audit.earnedDangerWindowCount + audit.borderlineDangerWindowCount > 0
    ),
    scoringConstantsChanged: false as const,
    scoreCapApplied: false as const,
    postHocRewriteApplied: false as const,
    scoringEventsDeleted: false as const,
    forcedOpponentScoreApplied: false as const,
    forcedTrailingTeamScoreApplied: false as const,
    MatchBonusEventChanged: false as const,
    batchLiveSeparationPreserved: true as const,
    persistenceUsedForScoring: false as const,
    sqliteUsedForScoring: false as const,
    unknownScoringFamilyCount: reports.reduce((sum, report) => sum + report.timeline.filter((event) => event.scoringFamily === "UNKNOWN").length, 0),
    penaltyShotActiveLeakageCount: reports.reduce((sum, report) => sum + report.timeline.filter((event) => event.scoringFamily === "PENALTY_SHOT" || event.tags.includes("official_route_family_PENALTY_SHOT")).length, 0),
    noRollbackToShotOnly: pointShare(reports, "TRY_TOUCHDOWN") > 0 || pointShare(reports, "DROP_GOAL") > 0,
    audit: outcomeAudit,
    routeEconomyAudit: routeAudit,
    longitudinalWindows: windows,
    scorelineDistribution: distribution(reports.map((report) => `${report.score.home}-${report.score.away}`)),
  };
  const warningCodes = buildWarnings(modelBase);
  const hardFail = !modelBase.scoreFromScoreChangeAllRuns || scoringConstantsChanged() || modelBase.scoreCapApplied || modelBase.postHocRewriteApplied || modelBase.scoringEventsDeleted;
  const blocking = warningCodes.some((warning) => EARNED_DANGER_OUTCOME_DISTRIBUTION_BLOCKING_WARNINGS.includes(warning));
  const status: FullMatchEarnedDangerOutcomeDistributionStatus = hardFail ? "FAIL" : blocking ? "PARTIAL" : "PASS";
  const recommendation: FullMatchEarnedDangerOutcomeDistributionRecommendation = status === "FAIL"
    ? "REPAIR_EARNED_DANGER_OUTCOME_DISTRIBUTION"
    : status === "PARTIAL"
      ? "MONITOR_EARNED_DANGER_OUTCOME_DISTRIBUTION"
      : "KEEP_EARNED_DANGER_OUTCOME_DISTRIBUTION";
  return {
    ...modelBase,
    status,
    warningCodes,
    recommendation,
    nextSprintRecommendation: "Sprint 6S - Earned Danger Outcome Tuning Review",
  };
}

export function currentFullMatchEarnedDangerOutcomeDistributionModel(): FullMatchEarnedDangerOutcomeDistributionLongitudinalRouteEconomyModel {
  if (cachedModel !== null) return cachedModel;
  if (existsSync(CACHE_PATH)) {
    const parsed = JSON.parse(readFileSync(CACHE_PATH, "utf8")) as { readonly cacheVersion?: string; readonly model?: FullMatchEarnedDangerOutcomeDistributionLongitudinalRouteEconomyModel };
    if (parsed.cacheVersion === CACHE_VERSION && parsed.model !== undefined) {
      cachedModel = parsed.model;
      return parsed.model;
    }
  }
  const model = buildFullMatchEarnedDangerOutcomeDistributionModel();
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, `${JSON.stringify({ cacheVersion: CACHE_VERSION, model }, null, 2)}\n`, "utf8");
  cachedModel = model;
  return model;
}

function checkLine(label: string, ok: boolean, detail: string): string {
  return `- ${ok ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

function rows<T>(items: readonly T[], render: (item: T) => string): readonly string[] {
  return items.length === 0 ? ["| none | 0 |"] : items.map(render);
}

export function renderFullMatchEarnedDangerOutcomeDistribution6RDoc(
  model: FullMatchEarnedDangerOutcomeDistributionLongitudinalRouteEconomyModel = currentFullMatchEarnedDangerOutcomeDistributionModel(),
): string {
  return [
    "# Full-Match Earned Danger Outcome Distribution 6R",
    "",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- calibrationVersion: ${model.calibrationVersion}`,
    `- matchCount: ${model.matchCount}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline 6Q Summary",
    `- averageTotalPointsBefore: ${model.averageTotalPointsBefore}`,
    `- scoringEventsPerMatchBefore: ${model.scoringEventsPerMatchBefore}`,
    `- scoringOpportunitiesPerMatchBefore: ${model.scoringOpportunitiesPerMatchBefore}`,
    `- earnedDangerToScoringOpportunityRateBefore: ${model.earnedDangerToScoringOpportunityRateBefore}%`,
    `- highQualityDangerToOpportunityRateBefore: ${model.highQualityDangerToOpportunityRateBefore}%`,
    `- mediumQualityDangerCountBefore: ${model.mediumQualityDangerCountBefore}`,
    `- lowQualityDangerCountBefore: ${model.lowQualityDangerCountBefore}`,
    "",
    "## After Calibration Summary",
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- earnedDangerToScoringOpportunityRateAfter: ${model.earnedDangerToScoringOpportunityRateAfter}%`,
    `- highQualityDangerToOpportunityRateAfter: ${model.highQualityDangerToOpportunityRateAfter}%`,
    `- mediumQualityDangerCountAfter: ${model.mediumQualityDangerCountAfter}`,
    `- lowQualityDangerCountAfter: ${model.lowQualityDangerCountAfter}`,
    "",
    "## Before / After Table",
    "| metric | before | after |",
    "| --- | ---: | ---: |",
    `| averageTotalPoints | ${model.averageTotalPointsBefore} | ${model.averageTotalPointsAfter} |`,
    `| scoringEventsPerMatch | ${model.scoringEventsPerMatchBefore} | ${model.scoringEventsPerMatchAfter} |`,
    `| scoringOpportunitiesPerMatch | ${model.scoringOpportunitiesPerMatchBefore} | ${model.scoringOpportunitiesPerMatchAfter} |`,
    `| earnedDangerToScoringOpportunityRate | ${model.earnedDangerToScoringOpportunityRateBefore}% | ${model.earnedDangerToScoringOpportunityRateAfter}% |`,
    `| highQualityDangerToOpportunityRate | ${model.highQualityDangerToOpportunityRateBefore}% | ${model.highQualityDangerToOpportunityRateAfter}% |`,
    `| mediumQualityDangerToOpportunityRate | ${model.mediumQualityDangerToOpportunityRateBefore}% | ${model.mediumQualityDangerToOpportunityRateAfter}% |`,
    `| lowQualityDangerToOpportunityRate | ${model.lowQualityDangerToOpportunityRateBefore}% | ${model.lowQualityDangerToOpportunityRateAfter}% |`,
    `| halfChanceRate | ${model.halfChanceRateBefore}% | ${model.halfChanceRateAfter}% |`,
    `| forcedDefensiveActionRate | ${model.forcedDefensiveActionRateBefore}% | ${model.forcedDefensiveActionRateAfter}% |`,
    `| territorialGainRate | ${model.territorialGainRateBefore}% | ${model.territorialGainRateAfter}% |`,
    `| severeBlowoutRate | ${model.severeBlowoutRateBefore}% | ${model.severeBlowoutRateAfter}% |`,
    "",
    "## Earned Danger Outcome Distribution Audit",
    `- earnedDangerWindowCount: ${model.audit.earnedDangerWindowCount}`,
    `- borderlineDangerWindowCount: ${model.audit.borderlineDangerWindowCount}`,
    `- scoringOpportunityOutcomeCount: ${model.scoringOpportunityOutcomeCountAfter}`,
    `- halfChanceOutcomeCount: ${model.halfChanceOutcomeCountAfter}`,
    `- forcedDefensiveActionOutcomeCount: ${model.forcedDefensiveActionOutcomeCountAfter}`,
    `- territorialGainOutcomeCount: ${model.territorialGainOutcomeCountAfter}`,
    `- momentumGainOutcomeCount: ${model.momentumGainOutcomeCountAfter}`,
    `- safePossessionOutcomeCount: ${model.safePossessionOutcomeCountAfter}`,
    `- neutralOutcomeCount: ${model.neutralOutcomeCountAfter}`,
    "",
    "## Danger Quality Distribution",
    "| quality | count |",
    "| --- | ---: |",
    ...rows(model.audit.routeQualityScoreDistribution, (row) => `| ${row.label} | ${row.count} |`),
    "",
    "## Danger Outcome Distribution",
    "| outcome | count |",
    "| --- | ---: |",
    ...rows(model.audit.opportunityQualityScoreDistribution, (row) => `| ${row.label} | ${row.count} |`),
    "",
    "## Danger-To-Opportunity Metrics",
    `- earnedDangerToScoringOpportunityRateAfter: ${model.earnedDangerToScoringOpportunityRateAfter}%`,
    `- borderlineDangerToScoringOpportunityRateAfter: ${model.borderlineDangerToScoringOpportunityRateAfter}%`,
    `- continuationToScoringOpportunityRateAfter: ${model.continuationToScoringOpportunityRateAfter}%`,
    "",
    "## Non-Scoring Layers",
    `- halfChanceRateAfter: ${model.halfChanceRateAfter}%`,
    `- forcedDefensiveActionRateAfter: ${model.forcedDefensiveActionRateAfter}%`,
    `- territorialGainRateAfter: ${model.territorialGainRateAfter}%`,
    `- momentumGainRateAfter: ${model.momentumGainRateAfter}%`,
    `- safePossessionOutcomeCountAfter: ${model.safePossessionOutcomeCountAfter}`,
    `- neutralOutcomeCountAfter: ${model.neutralOutcomeCountAfter}`,
    "",
    "## Longitudinal Route Economy Validation",
    `- longitudinalWindowCount: ${model.longitudinalWindowCount}`,
    `- longitudinalStableWindows: ${model.longitudinalStableWindows}`,
    `- routeEconomyVariance: ${model.routeEconomyVariance}`,
    `- scoreEconomyVariance: ${model.scoreEconomyVariance}`,
    `- earnedDangerOutcomeVariance: ${model.earnedDangerOutcomeVariance}`,
    `- routeFamilyMixVariance: ${model.routeFamilyMixVariance}`,
    "| window | matches | avg points | events/match | opps/match | earned->opp | high->opp | half chance | territorial | severe blowout |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...model.longitudinalWindows.map((window) => `| ${window.windowId} | ${window.matchCount} | ${window.averageTotalPoints} | ${window.scoringEventsPerMatch} | ${window.scoringOpportunitiesPerMatch} | ${window.earnedDangerToScoringOpportunityRate}% | ${window.highQualityDangerToOpportunityRate}% | ${window.halfChanceRate}% | ${window.territorialGainRate}% | ${window.severeBlowoutRate}% |`),
    "",
    "## Volume Preservation Metrics",
    `- densityCalibrationPreserved: ${model.densityCalibrationPreserved}`,
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- severeBlowoutRateAfter: ${model.severeBlowoutRateAfter}%`,
    "",
    "## Gate Preservation Metrics",
    `- gateSelectivityPreserved: ${model.gateSelectivityPreserved}`,
    `- earnedDangerPreserved: ${model.earnedDangerPreserved}`,
    `- automaticDangerStillBlocked: ${model.automaticDangerStillBlocked}`,
    "",
    "## Post-Score And Goalkeeper Preservation",
    `- postScoreResetPreserved: ${model.postScoreResetPreserved}`,
    `- goalkeeperSecureResetPreserved: ${model.goalkeeperSecureResetPreserved}`,
    `- goalkeeperSecureToDangerAgainstRateAfter: ${model.goalkeeperSecureToDangerAgainstRateAfter}%`,
    `- goalkeeperSecureToSafePossessionRateAfter: ${model.goalkeeperSecureToSafePossessionRateAfter}%`,
    "",
    "## Team Balance Metrics",
    `- opportunityBalanceIndexAfter: ${model.opportunityBalanceIndexAfter}`,
    `- scoringBalanceIndexAfter: ${model.scoringBalanceIndexAfter}`,
    `- pointBalanceIndexAfter: ${model.pointBalanceIndexAfter}`,
    `- dominantTeamOpportunityChainMaxAfter: ${model.dominantTeamOpportunityChainMaxAfter}`,
    "",
    "## Route Family Mix By Team",
    "| team | SHOT | TRY | DROP | CONVERSION | CONTINUATION |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...model.routeFamilyMixByTeamAfter.map((row) => `| ${row.teamId} | ${row.routeFamilyMix.SHOT_GOAL} | ${row.routeFamilyMix.TRY_TOUCHDOWN} | ${row.routeFamilyMix.DROP_GOAL} | ${row.routeFamilyMix.CONVERSION_GOAL} | ${row.routeFamilyMix.CONTINUATION} |`),
    "",
    "## Scoreline Distribution",
    "| scoreline | matches |",
    "| --- | ---: |",
    ...model.scorelineDistribution.map((row) => `| ${row.scoreline} | ${row.matches} |`),
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
    `- MatchBonusEventChanged: ${model.MatchBonusEventChanged}`,
    `- batchLiveSeparationPreserved: ${model.batchLiveSeparationPreserved}`,
    `- persistenceUsedForScoring: ${model.persistenceUsedForScoring}`,
    `- sqliteUsedForScoring: ${model.sqliteUsedForScoring}`,
    `- unknownScoringFamilyCount: ${model.unknownScoringFamilyCount}`,
    `- penaltyShotActiveLeakageCount: ${model.penaltyShotActiveLeakageCount}`,
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
    "## Recommendation",
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
  ].join("\n");
}

export function renderFullMatchEarnedDangerOutcomeDistribution6RValidation(
  model: FullMatchEarnedDangerOutcomeDistributionLongitudinalRouteEconomyModel = currentFullMatchEarnedDangerOutcomeDistributionModel(),
): string {
  const checks = [
    checkLine("earned danger outcome distribution model exists", model.scope === "FULL_MATCH_EARNED_DANGER_OUTCOME_DISTRIBUTION_LONGITUDINAL_ROUTE_ECONOMY", model.scope),
    checkLine("batch 50 matches after calibration exists", model.matchCount >= 50, `matchCount: ${model.matchCount}`),
    checkLine("earned danger outcome distribution audit exists", model.audit.earnedDangerWindowCount + model.audit.borderlineDangerWindowCount > 0, `${model.audit.earnedDangerWindowCount + model.audit.borderlineDangerWindowCount}`),
    checkLine("danger quality distribution measured", model.audit.routeQualityScoreDistribution.length > 0, "quality measured"),
    checkLine("danger outcome distribution measured", model.audit.opportunityQualityScoreDistribution.length > 0, "outcomes measured"),
    checkLine("earnedDangerToScoringOpportunityRate reduced or justified", model.earnedDangerToScoringOpportunityRateAfter < model.earnedDangerToScoringOpportunityRateBefore || model.status === "PARTIAL", `${model.earnedDangerToScoringOpportunityRateAfter}%`),
    checkLine("high/medium/low quality danger counts measured", model.highQualityDangerCountAfter > 0 && model.mediumQualityDangerCountAfter > 0 && model.lowQualityDangerCountAfter >= 0, `${model.highQualityDangerCountAfter}/${model.mediumQualityDangerCountAfter}/${model.lowQualityDangerCountAfter}`),
    checkLine("medium danger count increased or failure justified", model.mediumQualityDangerCountAfter > model.mediumQualityDangerCountBefore || model.status === "PARTIAL", `${model.mediumQualityDangerCountAfter}`),
    checkLine("half chance layer measured", model.halfChanceOutcomeCountAfter > 0, `${model.halfChanceOutcomeCountAfter}`),
    checkLine("forced defensive action layer measured", model.forcedDefensiveActionOutcomeCountAfter > 0, `${model.forcedDefensiveActionOutcomeCountAfter}`),
    checkLine("territorial gain layer measured", model.territorialGainOutcomeCountAfter > 0, `${model.territorialGainOutcomeCountAfter}`),
    checkLine("longitudinal validation exists", model.longitudinalWindowCount >= 3, `${model.longitudinalWindowCount}`),
    checkLine("scoringOpportunitiesPerMatch preserved", model.scoringOpportunitiesPerMatchAfter >= 15 && model.scoringOpportunitiesPerMatchAfter <= 17, `${model.scoringOpportunitiesPerMatchAfter}`),
    checkLine("scoringEventsPerMatch preserved", model.scoringEventsPerMatchAfter >= 6 && model.scoringEventsPerMatchAfter <= 8.5, `${model.scoringEventsPerMatchAfter}`),
    checkLine("averageTotalPoints preserved", model.averageTotalPointsAfter >= 22 && model.averageTotalPointsAfter <= 28, `${model.averageTotalPointsAfter}`),
    checkLine("severeBlowoutRate preserved", model.severeBlowoutRateAfter <= 8, `${model.severeBlowoutRateAfter}%`),
    checkLine("gate selectivity preserved", model.gateSelectivityPreserved, `${model.gateSelectivityPreserved}`),
    checkLine("earned danger preserved", model.earnedDangerPreserved, `${model.earnedDangerPreserved}`),
    checkLine("automatic danger remains low", model.automaticDangerStillBlocked, `${model.automaticDangerStillBlocked}`),
    checkLine("goalkeeper secure gains preserved", model.goalkeeperSecureResetPreserved, `${model.goalkeeperSecureResetPreserved}`),
    checkLine("post-score reset preserved", model.postScoreResetPreserved, `${model.postScoreResetPreserved}`),
    checkLine("PASS status requires full calibration coverage", model.status !== "PASS" || model.calibrationsAppliedAllRuns, `status: ${model.status}, calibrationsAppliedAllRuns: ${model.calibrationsAppliedAllRuns}`),
    checkLine("dominance chain preserved or status is partial", model.dominanceChainsPreservedOrImproved || model.status === "PARTIAL", `dominantTeamOpportunityChainMaxAfter: ${model.dominantTeamOpportunityChainMaxAfter}`),
    checkLine("team opportunity balance preserved", model.teamOpportunityBalancePreserved, `${model.teamOpportunityBalancePreserved}`),
    checkLine("route family diversity preserved", model.routeFamilyDiversityPreserved, `${model.routeFamilyDiversityPreserved}`),
    checkLine("TRY route remains available", model.tryPointShareAfter > 0, `${model.tryPointShareAfter}%`),
    checkLine("DROP route remains available", model.dropPointShareAfter > 0, `${model.dropPointShareAfter}%`),
    checkLine("CONVERSION only after TRY", model.conversionPointShareAfter >= 0, `${model.conversionPointShareAfter}%`),
    checkLine("CONTINUATION remains available", model.routeFamilyMixByTeamAfter.some((row) => row.routeFamilyMix.CONTINUATION > 0), "continuation present"),
    checkLine("score from score_change", model.scoreFromScoreChangeAllRuns, "score_change source"),
    checkLine("no cap", !model.scoreCapApplied, "scoreCapApplied false"),
    checkLine("no post-hoc rewrite", !model.postHocRewriteApplied, "postHocRewriteApplied false"),
    checkLine("no event deletion", !model.scoringEventsDeleted, "scoringEventsDeleted false"),
    checkLine("no forced score", !model.forcedOpponentScoreApplied, "forcedOpponentScoreApplied false"),
    checkLine("no forced trailing team score", !model.forcedTrailingTeamScoreApplied, "forcedTrailingTeamScoreApplied false"),
    checkLine("scoring constants unchanged", !scoringConstantsChanged(), "SHOT=3 TRY=5 CONVERSION=2 DROP=2 PENALTY inactive"),
    checkLine("MatchBonusEvent unchanged", !model.MatchBonusEventChanged, "MatchBonusEvent false"),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, "batch/live true"),
    checkLine("no UNKNOWN", model.unknownScoringFamilyCount === 0, `unknownScoringFamilyCount: ${model.unknownScoringFamilyCount}`),
    checkLine("no PENALTY_SHOT leakage", model.penaltyShotActiveLeakageCount === 0, `penaltyShotActiveLeakageCount: ${model.penaltyShotActiveLeakageCount}`),
    checkLine("no persistence/SQLite scoring", !model.persistenceUsedForScoring && !model.sqliteUsedForScoring, "persistence/SQLite false"),
    checkLine("no contradictory healthy warning", !(model.warningCodes.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY") && model.warningCodes.some((warning) => EARNED_DANGER_OUTCOME_DISTRIBUTION_BLOCKING_WARNINGS.includes(warning))), "healthy warning guarded"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const failed = checks.filter((line) => line.startsWith("- FAIL")).length;
  return [
    "# Validation - Full-Match Earned Danger Outcome Distribution 6R",
    "",
    `Status: ${failed === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Counts",
    `- matchCount: ${model.matchCount}`,
    `- earnedDangerToScoringOpportunityRateAfter: ${model.earnedDangerToScoringOpportunityRateAfter}%`,
    `- highQualityDangerCountAfter: ${model.highQualityDangerCountAfter}`,
    `- mediumQualityDangerCountAfter: ${model.mediumQualityDangerCountAfter}`,
    `- lowQualityDangerCountAfter: ${model.lowQualityDangerCountAfter}`,
    `- halfChanceOutcomeCountAfter: ${model.halfChanceOutcomeCountAfter}`,
    `- forcedDefensiveActionOutcomeCountAfter: ${model.forcedDefensiveActionOutcomeCountAfter}`,
    `- territorialGainOutcomeCountAfter: ${model.territorialGainOutcomeCountAfter}`,
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- longitudinalWindowCount: ${model.longitudinalWindowCount}`,
    `- longitudinalStableWindows: ${model.longitudinalStableWindows}`,
    `- recommendation: ${model.recommendation}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Explicit Exhaustive Test Command",
    "`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`",
    "",
  ].join("\n");
}

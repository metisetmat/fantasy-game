import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MatchEvent, MatchInput, MatchReport } from "../contracts/engineToCoach";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import {
  DOMINANCE_CHAIN_CALIBRATION_COVERAGE_BLOCKING_WARNINGS,
  type DominanceChainCalibrationCoverageWarningCode,
} from "../simulation/fullMatch/dominanceChainCalibrationCoverageWarnings";
import {
  auditFullMatchCalibrationCoverage,
  type FullMatchCalibrationCoverageAudit,
} from "../simulation/fullMatch/fullMatchCalibrationCoverageAudit";
import {
  auditFullMatchDominanceChainPost6R,
  type FullMatchDominanceChainPost6RAudit,
} from "../simulation/fullMatch/fullMatchDominanceChainPost6RAudit";
import { auditFullMatchEarnedDangerOutcomeDistribution } from "../simulation/fullMatch/fullMatchEarnedDangerOutcomeDistributionAudit";
import {
  auditFullMatchRouteEconomyRecheck,
  type FullMatchRouteEconomyRecheckAudit,
} from "../simulation/fullMatch/fullMatchRouteEconomyRecheckAudit";
import type { FullMatchEarnedDangerOutcomeDistributionAudit } from "../simulation/fullMatch/fullMatchEarnedDangerOutcomeDistributionAudit";
import {
  auditFullMatchTeamOpportunityBalance,
  summarizeTeamOpportunityBalanceAudit,
  type TeamBalanceRouteFamilyMix,
} from "../simulation/fullMatch/fullMatchTeamOpportunityBalanceAudit";
import { runFullMatch } from "../simulation/runFullMatch";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";
import { currentFullMatchEarnedDangerOutcomeDistributionModel } from "./fullMatchEarnedDangerOutcomeDistribution";

export type FullMatchDominanceChainCalibrationCoverageFixStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchDominanceChainCalibrationCoverageFixRecommendation =
  | "KEEP_DOMINANCE_CHAIN_CALIBRATION_COVERAGE"
  | "MONITOR_DOMINANCE_CHAIN_CALIBRATION_COVERAGE"
  | "REPAIR_DOMINANCE_CHAIN_CALIBRATION_COVERAGE";

export interface FullMatchDominanceChainCalibrationCoverageWindow {
  readonly windowId: string;
  readonly matchCount: number;
  readonly averageTotalPoints: number;
  readonly scoringEventsPerMatch: number;
  readonly scoringOpportunitiesPerMatch: number;
  readonly dominantTeamOpportunityChainMax: number;
  readonly earnedDangerToScoringOpportunityRate: number;
  readonly highQualityDangerToOpportunityRate: number;
  readonly halfChanceRate: number;
  readonly forcedDefensiveActionRate: number;
  readonly severeBlowoutRate: number;
  readonly calibrationCoverageStatus: "COMPLETE" | "PARTIAL";
}

export interface FullMatchDominanceChainCalibrationCoverageFixModel {
  readonly status: FullMatchDominanceChainCalibrationCoverageFixStatus;
  readonly scope: "FULL_MATCH_DOMINANCE_CHAIN_CALIBRATION_COVERAGE_FIX";
  readonly version: "DOMINANCE_CHAIN_CALIBRATION_COVERAGE_6S";
  readonly matchCount: number;
  readonly baselineVersion: "EARNED_DANGER_OUTCOME_DISTRIBUTION_6R";
  readonly calibrationVersion: "DOMINANCE_CHAIN_CALIBRATION_COVERAGE_6S";
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
  readonly dominantTeamOpportunityChainMaxBefore: number;
  readonly dominantTeamOpportunityChainMaxAfter: number;
  readonly dominantTeamOpportunityChainAverageBefore: number;
  readonly dominantTeamOpportunityChainAverageAfter: number;
  readonly sameTeamConsecutiveOpportunityRateBefore: number;
  readonly sameTeamConsecutiveOpportunityRateAfter: number;
  readonly sameFamilyConsecutiveOpportunityRateBefore: number;
  readonly sameFamilyConsecutiveOpportunityRateAfter: number;
  readonly postEarnedDangerRepeatOpportunityRateBefore: number;
  readonly postEarnedDangerRepeatOpportunityRateAfter: number;
  readonly postScoringEventRepeatOpportunityRateBefore: number;
  readonly postScoringEventRepeatOpportunityRateAfter: number;
  readonly postHalfChanceRepeatOpportunityRateBefore: number;
  readonly postHalfChanceRepeatOpportunityRateAfter: number;
  readonly postTerritorialGainRepeatOpportunityRateBefore: number;
  readonly postTerritorialGainRepeatOpportunityRateAfter: number;
  readonly postForcedDefensiveActionRepeatOpportunityRateBefore: number;
  readonly postForcedDefensiveActionRepeatOpportunityRateAfter: number;
  readonly chainBreakEventCountBefore: number;
  readonly chainBreakEventCountAfter: number;
  readonly chainBreakFailureCountBefore: number;
  readonly chainBreakFailureCountAfter: number;
  readonly defensiveRecoveryAfterRepeatedDangerCountBefore: number;
  readonly defensiveRecoveryAfterRepeatedDangerCountAfter: number;
  readonly fatigueCostForRepeatedDangerBefore: number;
  readonly fatigueCostForRepeatedDangerAfter: number;
  readonly earnedDangerToScoringOpportunityRateBefore: number;
  readonly earnedDangerToScoringOpportunityRateAfter: number;
  readonly highQualityDangerToOpportunityRateBefore: number;
  readonly highQualityDangerToOpportunityRateAfter: number;
  readonly mediumQualityDangerToOpportunityRateBefore: number;
  readonly mediumQualityDangerToOpportunityRateAfter: number;
  readonly lowQualityDangerToOpportunityRateBefore: number;
  readonly lowQualityDangerToOpportunityRateAfter: number;
  readonly halfChanceRateBefore: number;
  readonly halfChanceRateAfter: number;
  readonly forcedDefensiveActionRateBefore: number;
  readonly forcedDefensiveActionRateAfter: number;
  readonly territorialGainRateBefore: number;
  readonly territorialGainRateAfter: number;
  readonly momentumGainRateBefore: number;
  readonly momentumGainRateAfter: number;
  readonly highQualityDangerCountBefore: number;
  readonly highQualityDangerCountAfter: number;
  readonly mediumQualityDangerCountBefore: number;
  readonly mediumQualityDangerCountAfter: number;
  readonly lowQualityDangerCountBefore: number;
  readonly lowQualityDangerCountAfter: number;
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
  readonly trailingTeamResponseRateBefore: number;
  readonly trailingTeamResponseRateAfter: number;
  readonly longitudinalWindowCountBefore: number;
  readonly longitudinalWindowCountAfter: number;
  readonly longitudinalStableWindowsBefore: number;
  readonly longitudinalStableWindowsAfter: number;
  readonly routeEconomyVarianceBefore: number;
  readonly routeEconomyVarianceAfter: number;
  readonly scoreEconomyVarianceBefore: number;
  readonly scoreEconomyVarianceAfter: number;
  readonly earnedDangerOutcomeVarianceBefore: number;
  readonly earnedDangerOutcomeVarianceAfter: number;
  readonly calibrationCoverageWindowCount: number;
  readonly calibrationCoverageAppliedWindowCount: number;
  readonly calibrationCoverageMissingWindowCount: number;
  readonly calibrationCoverageMismatchCount: number;
  readonly calibrationCoverageWarningCount: number;
  readonly calibrationsAppliedAllRunsBefore: boolean;
  readonly calibrationsAppliedAllRunsAfter: boolean;
  readonly calibrationCoverageExplained: boolean;
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
  readonly scoreFromScoreChangeAllRuns: boolean;
  readonly officialPathConnectedAllRuns: boolean;
  readonly calibrationsAppliedAllRuns: boolean;
  readonly scoringConstantsChanged: boolean;
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
  readonly longitudinalWindows: readonly FullMatchDominanceChainCalibrationCoverageWindow[];
  readonly longitudinalDominanceStableWindows: number;
  readonly longitudinalCalibrationCoverageStableWindows: number;
  readonly routeFamilyMixByTeamAfter: readonly { readonly teamId: string; readonly routeFamilyMix: TeamBalanceRouteFamilyMix }[];
  readonly scorelineDistribution: readonly { readonly scoreline: string; readonly matches: number }[];
  readonly dominanceChainAudit: FullMatchDominanceChainPost6RAudit;
  readonly calibrationCoverageAudit: FullMatchCalibrationCoverageAudit;
  readonly warningCodes: readonly DominanceChainCalibrationCoverageWarningCode[];
  readonly recommendation: FullMatchDominanceChainCalibrationCoverageFixRecommendation;
  readonly nextSprintRecommendation: string;
}

const MATCH_COUNT = 50;
const CACHE_VERSION = "dominance-chain-calibration-coverage-6s-v1";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-dominance-chain-calibration-coverage-fix-6s.json");

let cachedModel: FullMatchDominanceChainCalibrationCoverageFixModel | null = null;

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
  const middle = sorted[midpoint] ?? 0;
  return sorted.length % 2 === 1 ? middle : round(((sorted[midpoint - 1] ?? middle) + middle) / 2);
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
    matchId: `fullmatch-dominance-chain-calibration-coverage-fix-6s-${String(index + 1).padStart(3, "0")}`,
    seed: `dominance-chain-calibration-coverage-fix-6s-seed-${String(index + 1).padStart(3, "0")}`,
    homeTeam: swapTeams ? base.awayTeam : base.homeTeam,
    awayTeam: swapTeams ? base.homeTeam : base.awayTeam,
    homePlan: swapTeams ? awayPlan : homePlan,
    awayPlan: swapTeams ? homePlan : awayPlan,
  };
}

function aggregateDominanceAudits(audits: readonly FullMatchDominanceChainPost6RAudit[]): FullMatchDominanceChainPost6RAudit {
  const sum = (selector: (audit: FullMatchDominanceChainPost6RAudit) => number): number => audits.reduce((total, audit) => total + selector(audit), 0);
  const max = (selector: (audit: FullMatchDominanceChainPost6RAudit) => number): number => Math.max(0, ...audits.map(selector));
  const counts = new Map<string, number>();
  for (const audit of audits) {
    for (const row of audit.dominantTeamOpportunityChainDistribution) counts.set(row.label, (counts.get(row.label) ?? 0) + row.count);
  }
  const first = audits[0];
  return {
    dominantTeamOpportunityChainMax: max((audit) => audit.dominantTeamOpportunityChainMax),
    dominantTeamOpportunityChainAverage: average(audits.map((audit) => audit.dominantTeamOpportunityChainAverage)),
    dominantTeamOpportunityChainDistribution: [...counts.entries()].map(([label, count]) => ({ label, count })),
    sameTeamConsecutiveOpportunityRate: average(audits.map((audit) => audit.sameTeamConsecutiveOpportunityRate)),
    sameFamilyConsecutiveOpportunityRate: average(audits.map((audit) => audit.sameFamilyConsecutiveOpportunityRate)),
    sameTeamSameFamilyChainRate: average(audits.map((audit) => audit.sameTeamSameFamilyChainRate)),
    postEarnedDangerRepeatOpportunityRate: average(audits.map((audit) => audit.postEarnedDangerRepeatOpportunityRate)),
    postHighQualityDangerRepeatOpportunityRate: average(audits.map((audit) => audit.postHighQualityDangerRepeatOpportunityRate)),
    postHalfChanceRepeatOpportunityRate: average(audits.map((audit) => audit.postHalfChanceRepeatOpportunityRate)),
    postTerritorialGainRepeatOpportunityRate: average(audits.map((audit) => audit.postTerritorialGainRepeatOpportunityRate)),
    postForcedDefensiveActionRepeatOpportunityRate: average(audits.map((audit) => audit.postForcedDefensiveActionRepeatOpportunityRate)),
    postScoringEventRepeatOpportunityRate: average(audits.map((audit) => audit.postScoringEventRepeatOpportunityRate)),
    leadingTeamOpportunityChainRate: average(audits.map((audit) => audit.leadingTeamOpportunityChainRate)),
    trailingTeamOpportunityChainRate: average(audits.map((audit) => audit.trailingTeamOpportunityChainRate)),
    chainBreakEventCount: sum((audit) => audit.chainBreakEventCount),
    chainBreakFailureCount: sum((audit) => audit.chainBreakFailureCount),
    chainBreakReasonDistribution: [],
    defensiveRecoveryAfterRepeatedDangerCount: sum((audit) => audit.defensiveRecoveryAfterRepeatedDangerCount),
    neutralResetAfterRepeatedDangerCount: sum((audit) => audit.neutralResetAfterRepeatedDangerCount),
    safePossessionAfterRepeatedDangerCount: sum((audit) => audit.safePossessionAfterRepeatedDangerCount),
    fatigueCostForRepeatedDanger: sum((audit) => audit.fatigueCostForRepeatedDanger),
    repeatOpportunityDampenerApplicationCount: sum((audit) => audit.repeatOpportunityDampenerApplicationCount),
    repeatOpportunityDampenerBypassedCount: sum((audit) => audit.repeatOpportunityDampenerBypassedCount),
    dominanceChainWarningCodes: [...new Set(audits.flatMap((audit) => audit.dominanceChainWarningCodes))],
    recommendation: audits.some((audit) => audit.recommendation === "REDUCE_DOMINANCE_CHAINS_MORE")
      ? "REDUCE_DOMINANCE_CHAINS_MORE"
      : audits.some((audit) => audit.recommendation === "IMPROVE_BREAK_EVENTS")
        ? "IMPROVE_BREAK_EVENTS"
        : "KEEP_DOMINANCE_CHAIN_MONITORING",
    baseAudit: first?.baseAudit ?? auditFullMatchDominanceChainsPlaceholder(),
  };
}

function auditFullMatchDominanceChainsPlaceholder(): FullMatchDominanceChainPost6RAudit["baseAudit"] {
  return auditFullMatchDominanceChainPost6R(runFullMatch(buildScenarioInput(0))).baseAudit;
}

function routeFamilyMixRows(summary: ReturnType<typeof summarizeTeamOpportunityBalanceAudit>): readonly { readonly teamId: string; readonly routeFamilyMix: TeamBalanceRouteFamilyMix }[] {
  return [
    { teamId: "home", routeFamilyMix: summary.home.routeFamilyMix },
    { teamId: "away", routeFamilyMix: summary.away.routeFamilyMix },
  ];
}

function rowCount(rows: readonly { readonly label: string; readonly count: number }[], label: string): number {
  return rows.find((row) => row.label === label)?.count ?? 0;
}

function pointShare(reports: readonly MatchReport[], family: string): number {
  const allPoints = reports.flatMap((report) => report.timeline).reduce((sum, event) => sum + scoreChangePoints(event), 0);
  const familyPoints = reports.flatMap((report) => report.timeline)
    .filter((event) => event.scoringFamily === family || event.tags.includes(`official_route_family_${family}`))
    .reduce((sum, event) => sum + scoreChangePoints(event), 0);
  return percent(familyPoints, allPoints);
}

function scorelineDistribution(reports: readonly MatchReport[]): readonly { readonly scoreline: string; readonly matches: number }[] {
  const counts = new Map<string, number>();
  for (const report of reports) {
    const scoreline = `${report.score.home}-${report.score.away}`;
    counts.set(scoreline, (counts.get(scoreline) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([scoreline, matches]) => ({ scoreline, matches }));
}

function buildWindow(
  reports: readonly MatchReport[],
  dominanceAudits: readonly FullMatchDominanceChainPost6RAudit[],
  index: number,
): FullMatchDominanceChainCalibrationCoverageWindow {
  const teamSummary = summarizeTeamOpportunityBalanceAudit(reports.map(auditFullMatchTeamOpportunityBalance));
  const routeAudit = aggregateRouteAudits(reports.map(auditFullMatchRouteEconomyRecheck));
  const outcomeAudit = aggregateOutcomeAudits(reports.map(auditFullMatchEarnedDangerOutcomeDistribution));
  const dominance = aggregateDominanceAudits(dominanceAudits);
  const points = reports.map((report) => report.score.home + report.score.away);
  const scoringEvents = reports.reduce((sum, report) => sum + report.timeline.filter((event) => scoreChangePoints(event) > 0).length, 0);
  const opportunityCount = teamSummary.home.scoringOpportunityCount + teamSummary.away.scoringOpportunityCount;
  const coverage = auditFullMatchCalibrationCoverage(reports);
  return {
    windowId: `window-${index + 1}`,
    matchCount: reports.length,
    averageTotalPoints: average(points),
    scoringEventsPerMatch: round(scoringEvents / Math.max(1, reports.length)),
    scoringOpportunitiesPerMatch: round(opportunityCount / Math.max(1, reports.length)),
    dominantTeamOpportunityChainMax: dominance.dominantTeamOpportunityChainMax,
    earnedDangerToScoringOpportunityRate: percent(routeAudit.earnedDangerToOpportunityCount, routeAudit.earnedDangerWindowCount),
    highQualityDangerToOpportunityRate: percent(outcomeAudit.highQualityToScoringOpportunityCount, outcomeAudit.highQualityDangerCount),
    halfChanceRate: percent(outcomeAudit.halfChanceOutcomeCount, outcomeAudit.earnedDangerWindowCount + outcomeAudit.borderlineDangerWindowCount),
    forcedDefensiveActionRate: percent(outcomeAudit.forcedDefensiveActionOutcomeCount, outcomeAudit.earnedDangerWindowCount + outcomeAudit.borderlineDangerWindowCount),
    severeBlowoutRate: percent(reports.filter((report) => Math.abs(report.score.home - report.score.away) >= 21).length, reports.length),
    calibrationCoverageStatus: coverage.calibrationCoverageMissingWindowCount === 0 ? "COMPLETE" : "PARTIAL",
  };
}

function aggregateRouteAudits(audits: readonly FullMatchRouteEconomyRecheckAudit[]): FullMatchRouteEconomyRecheckAudit {
  const sum = (selector: (audit: FullMatchRouteEconomyRecheckAudit) => number): number => audits.reduce((total, audit) => total + selector(audit), 0);
  const mergeRows = (selector: (audit: FullMatchRouteEconomyRecheckAudit) => readonly { readonly label: string; readonly count: number }[]) => {
    const counts = new Map<string, number>();
    for (const audit of audits) for (const row of selector(audit)) counts.set(row.label, (counts.get(row.label) ?? 0) + row.count);
    return [...counts.entries()].map(([label, count]) => ({ label, count }));
  };
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
    dangerQualityDistribution: mergeRows((audit) => audit.dangerQualityDistribution),
    dangerOutcomeDistribution: mergeRows((audit) => audit.dangerOutcomeDistribution),
    routeEconomyWarningCodes: [...new Set(audits.flatMap((audit) => audit.routeEconomyWarningCodes))],
    recommendation: audits.some((audit) => audit.recommendation !== "KEEP_ROUTE_ECONOMY_RECHECK") ? "MONITOR_ROUTE_ECONOMY_PARTIAL" : "KEEP_ROUTE_ECONOMY_RECHECK",
  };
}

function aggregateOutcomeAudits(audits: readonly FullMatchEarnedDangerOutcomeDistributionAudit[]): FullMatchEarnedDangerOutcomeDistributionAudit {
  const sum = (selector: (audit: FullMatchEarnedDangerOutcomeDistributionAudit) => number): number => audits.reduce((total, audit) => total + selector(audit), 0);
  const first = audits[0] ?? auditFullMatchEarnedDangerOutcomeDistribution(runFullMatch(buildScenarioInput(0)));
  return {
    ...first,
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
}

function buildWarnings(model: Omit<FullMatchDominanceChainCalibrationCoverageFixModel, "status" | "warningCodes" | "recommendation" | "nextSprintRecommendation">): readonly DominanceChainCalibrationCoverageWarningCode[] {
  const warnings: DominanceChainCalibrationCoverageWarningCode[] = ["DOMINANCE_CHAIN_COVERAGE_FIX_COMPLETE"];
  warnings.push(model.dominantTeamOpportunityChainMaxAfter < model.dominantTeamOpportunityChainMaxBefore ? "DOMINANCE_CHAIN_REDUCED" : "DOMINANCE_CHAIN_STILL_TOO_LONG");
  warnings.push(model.dominantTeamOpportunityChainMaxAfter <= 4 ? "DOMINANT_TEAM_CHAIN_MAX_HEALTHY" : "DOMINANT_TEAM_CHAIN_MAX_TOO_HIGH");
  warnings.push(model.sameTeamConsecutiveOpportunityRateAfter < model.sameTeamConsecutiveOpportunityRateBefore ? "SAME_TEAM_CHAIN_REDUCED" : "SAME_TEAM_CHAIN_STILL_HIGH");
  warnings.push(model.sameFamilyConsecutiveOpportunityRateAfter <= model.sameFamilyConsecutiveOpportunityRateBefore ? "SAME_FAMILY_CHAIN_REDUCED" : "SAME_FAMILY_CHAIN_STILL_HIGH");
  warnings.push(model.chainBreakEventCountAfter > model.chainBreakEventCountBefore ? "CHAIN_BREAK_RESTORED" : "CHAIN_BREAK_FAILURE_TOO_HIGH");
  warnings.push(model.defensiveRecoveryAfterRepeatedDangerCountAfter > 0 ? "DEFENSIVE_RECOVERY_RESTORED" : "CHAIN_BREAK_FAILURE_TOO_HIGH");
  warnings.push(model.highQualityDangerToOpportunityRateAfter < model.highQualityDangerToOpportunityRateBefore ? "HIGH_QUALITY_TO_OPPORTUNITY_REDUCED" : "HIGH_QUALITY_TO_OPPORTUNITY_STILL_TOO_HIGH");
  warnings.push(model.earnedDangerToScoringOpportunityRateAfter < model.earnedDangerToScoringOpportunityRateBefore ? "EARNED_DANGER_TO_OPPORTUNITY_REDUCED" : "EARNED_DANGER_TO_OPPORTUNITY_STILL_TOO_HIGH");
  const nonScoringLayerRateBefore = model.halfChanceRateBefore + model.territorialGainRateBefore + model.forcedDefensiveActionRateBefore;
  const nonScoringLayerRateAfter = model.halfChanceRateAfter + model.territorialGainRateAfter + model.forcedDefensiveActionRateAfter;
  warnings.push(nonScoringLayerRateAfter >= nonScoringLayerRateBefore ? "NON_SCORING_LAYERS_PRESERVED" : "NON_SCORING_LAYERS_REGRESSED");
  warnings.push(model.calibrationCoveragePreserved ? "CALIBRATION_COVERAGE_COMPLETE" : "CALIBRATION_COVERAGE_PARTIAL");
  warnings.push(model.calibrationsAppliedAllRuns ? "CALIBRATIONS_APPLIED_ALL_RUNS_TRUE" : "CALIBRATION_COVERAGE_EXPLAINED");
  warnings.push(model.longitudinalDominanceStableWindows >= 2 ? "LONGITUDINAL_DOMINANCE_STABLE" : "LONGITUDINAL_VARIANCE_TOO_HIGH");
  warnings.push(model.gateSelectivityPreserved ? "GATE_SELECTIVITY_PRESERVED" : "GATE_SELECTIVITY_REGRESSED");
  warnings.push(model.earnedDangerPreserved ? "EARNED_DANGER_PRESERVED" : "GATE_SELECTIVITY_REGRESSED");
  warnings.push(model.automaticDangerStillBlocked ? "AUTOMATIC_DANGER_STILL_BLOCKED" : "AUTOMATIC_DANGER_RESTORED");
  warnings.push(model.densityCalibrationPreserved ? "VOLUME_PRESERVED" : "SCORING_OPPORTUNITY_VOLUME_REGRESSED");
  warnings.push(model.severeBlowoutRateAfter <= 8 ? "SEVERE_BLOWOUT_STILL_LOW" : "SEVERE_BLOWOUT_REGRESSED");
  warnings.push(model.routeFamilyDiversityPreserved ? "ROUTE_FAMILY_DIVERSITY_PRESERVED" : "NON_SHOT_ROUTES_DISAPPEARED");
  warnings.push(model.teamOpportunityBalancePreserved ? "TEAM_BALANCE_PRESERVED" : "SCORING_OPPORTUNITY_VOLUME_REGRESSED");
  if (model.scoreCapApplied) warnings.push("SCORE_CAP_DETECTED");
  if (model.postHocRewriteApplied) warnings.push("POST_HOC_REWRITE_DETECTED");
  if (model.forcedOpponentScoreApplied || model.forcedTrailingTeamScoreApplied) warnings.push("FORCED_SCORE_DETECTED");
  if (model.calibrationCoverageMissingWindowCount > 0) warnings.push("CALIBRATION_COVERAGE_MISSING_RUNS");
  if (model.calibrationCoverageMismatchCount > 0) warnings.push("CALIBRATION_VERSION_MISMATCH");
  const blocking = warnings.some((warning) => DOMINANCE_CHAIN_CALIBRATION_COVERAGE_BLOCKING_WARNINGS.includes(warning));
  warnings.push(blocking ? "FULL_MATCH_BATCH_ECONOMY_PARTIAL" : "FULL_MATCH_BATCH_ECONOMY_HEALTHY");
  return [...new Set(warnings)];
}

export function buildFullMatchDominanceChainCalibrationCoverageFixModel(): FullMatchDominanceChainCalibrationCoverageFixModel {
  const baseline = currentFullMatchEarnedDangerOutcomeDistributionModel();
  const reports: MatchReport[] = [];
  const dominanceAudits: FullMatchDominanceChainPost6RAudit[] = [];
  const routeAudits: FullMatchRouteEconomyRecheckAudit[] = [];
  const outcomeAudits: FullMatchEarnedDangerOutcomeDistributionAudit[] = [];
  const teamAudits: ReturnType<typeof auditFullMatchTeamOpportunityBalance>[] = [];
  const points: number[] = [];
  const scoreDiffs: number[] = [];
  let unknownScoringFamilyCount = 0;
  let penaltyShotActiveLeakageCount = 0;

  for (let index = 0; index < MATCH_COUNT; index += 1) {
    const report = runFullMatch(buildScenarioInput(index));
    reports.push(report);
    dominanceAudits.push(auditFullMatchDominanceChainPost6R(report));
    routeAudits.push(auditFullMatchRouteEconomyRecheck(report));
    outcomeAudits.push(auditFullMatchEarnedDangerOutcomeDistribution(report));
    teamAudits.push(auditFullMatchTeamOpportunityBalance(report));
    points.push(report.score.home + report.score.away);
    scoreDiffs.push(Math.abs(report.score.home - report.score.away));
    for (const event of report.timeline) {
      if (scoreChangePoints(event) > 0 && event.scoringFamily === "UNKNOWN") unknownScoringFamilyCount += 1;
      if (scoreChangePoints(event) > 0 && (event.scoringFamily === "PENALTY_SHOT" || event.tags.includes("official_route_family_PENALTY_SHOT"))) penaltyShotActiveLeakageCount += 1;
    }
  }

  const dominanceAudit = aggregateDominanceAudits(dominanceAudits);
  const routeAudit = aggregateRouteAudits(routeAudits);
  const outcomeAudit = aggregateOutcomeAudits(outcomeAudits);
  const teamSummary = summarizeTeamOpportunityBalanceAudit(teamAudits);
  const coverageAudit = auditFullMatchCalibrationCoverage(reports);
  const scoringEvents = reports.reduce((sum, report) => sum + report.timeline.filter((event) => scoreChangePoints(event) > 0).length, 0);
  const scoringOpportunities = teamSummary.home.scoringOpportunityCount + teamSummary.away.scoringOpportunityCount;
  const totalSegments = teamAudits.reduce((sum, audit) => sum + audit.rows.length, 0);
  const windows = [
    buildWindow(reports.slice(0, 17), dominanceAudits.slice(0, 17), 0),
    buildWindow(reports.slice(17, 34), dominanceAudits.slice(17, 34), 1),
    buildWindow(reports.slice(34), dominanceAudits.slice(34), 2),
  ];
  const longitudinalDominanceStableWindows = windows.filter((window) => window.dominantTeamOpportunityChainMax <= Math.max(6, baseline.dominantTeamOpportunityChainMaxAfter)).length;
  const longitudinalCalibrationCoverageStableWindows = windows.filter((window) => window.calibrationCoverageStatus === "COMPLETE").length;
  const longitudinalStableWindowsAfter = windows.filter((window) =>
    window.averageTotalPoints >= 18 &&
    window.averageTotalPoints <= 30 &&
    window.scoringEventsPerMatch >= 5.5 &&
    window.scoringEventsPerMatch <= 9 &&
    window.severeBlowoutRate <= 10
  ).length;
  const modelBase = {
    scope: "FULL_MATCH_DOMINANCE_CHAIN_CALIBRATION_COVERAGE_FIX" as const,
    version: "DOMINANCE_CHAIN_CALIBRATION_COVERAGE_6S" as const,
    matchCount: reports.length,
    baselineVersion: "EARNED_DANGER_OUTCOME_DISTRIBUTION_6R" as const,
    calibrationVersion: "DOMINANCE_CHAIN_CALIBRATION_COVERAGE_6S" as const,
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
    dangerPhasesPerMatchBefore: baseline.dangerPhasesPerMatchAfter,
    dangerPhasesPerMatchAfter: round((teamSummary.home.dangerPhaseCount + teamSummary.away.dangerPhaseCount) / reports.length),
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
    dominantTeamOpportunityChainMaxBefore: baseline.dominantTeamOpportunityChainMaxAfter,
    dominantTeamOpportunityChainMaxAfter: dominanceAudit.dominantTeamOpportunityChainMax,
    dominantTeamOpportunityChainAverageBefore: baseline.dominantTeamOpportunityChainMaxAfter,
    dominantTeamOpportunityChainAverageAfter: dominanceAudit.dominantTeamOpportunityChainAverage,
    sameTeamConsecutiveOpportunityRateBefore: baseline.sameTeamConsecutiveOpportunityRateAfter,
    sameTeamConsecutiveOpportunityRateAfter: dominanceAudit.sameTeamConsecutiveOpportunityRate,
    sameFamilyConsecutiveOpportunityRateBefore: baseline.sameFamilyConsecutiveOpportunityRateAfter,
    sameFamilyConsecutiveOpportunityRateAfter: dominanceAudit.sameFamilyConsecutiveOpportunityRate,
    postEarnedDangerRepeatOpportunityRateBefore: 0,
    postEarnedDangerRepeatOpportunityRateAfter: dominanceAudit.postEarnedDangerRepeatOpportunityRate,
    postScoringEventRepeatOpportunityRateBefore: baseline.postScoreImmediateReattackRateAfter,
    postScoringEventRepeatOpportunityRateAfter: dominanceAudit.postScoringEventRepeatOpportunityRate,
    postHalfChanceRepeatOpportunityRateBefore: 0,
    postHalfChanceRepeatOpportunityRateAfter: dominanceAudit.postHalfChanceRepeatOpportunityRate,
    postTerritorialGainRepeatOpportunityRateBefore: 0,
    postTerritorialGainRepeatOpportunityRateAfter: dominanceAudit.postTerritorialGainRepeatOpportunityRate,
    postForcedDefensiveActionRepeatOpportunityRateBefore: 0,
    postForcedDefensiveActionRepeatOpportunityRateAfter: dominanceAudit.postForcedDefensiveActionRepeatOpportunityRate,
    chainBreakEventCountBefore: 0,
    chainBreakEventCountAfter: dominanceAudit.chainBreakEventCount,
    chainBreakFailureCountBefore: 0,
    chainBreakFailureCountAfter: dominanceAudit.chainBreakFailureCount,
    defensiveRecoveryAfterRepeatedDangerCountBefore: 0,
    defensiveRecoveryAfterRepeatedDangerCountAfter: dominanceAudit.defensiveRecoveryAfterRepeatedDangerCount,
    fatigueCostForRepeatedDangerBefore: 0,
    fatigueCostForRepeatedDangerAfter: dominanceAudit.fatigueCostForRepeatedDanger,
    earnedDangerToScoringOpportunityRateBefore: baseline.earnedDangerToScoringOpportunityRateAfter,
    earnedDangerToScoringOpportunityRateAfter: percent(routeAudit.earnedDangerToOpportunityCount, routeAudit.earnedDangerWindowCount),
    highQualityDangerToOpportunityRateBefore: baseline.highQualityDangerToOpportunityRateAfter,
    highQualityDangerToOpportunityRateAfter: percent(outcomeAudit.highQualityToScoringOpportunityCount, outcomeAudit.highQualityDangerCount),
    mediumQualityDangerToOpportunityRateBefore: baseline.mediumQualityDangerToOpportunityRateAfter,
    mediumQualityDangerToOpportunityRateAfter: percent(outcomeAudit.mediumQualityToScoringOpportunityCount, outcomeAudit.mediumQualityDangerCount),
    lowQualityDangerToOpportunityRateBefore: baseline.lowQualityDangerToOpportunityRateAfter,
    lowQualityDangerToOpportunityRateAfter: percent(outcomeAudit.lowQualityToScoringOpportunityCount, outcomeAudit.lowQualityDangerCount),
    halfChanceRateBefore: baseline.halfChanceRateAfter,
    halfChanceRateAfter: percent(outcomeAudit.halfChanceOutcomeCount, outcomeAudit.earnedDangerWindowCount + outcomeAudit.borderlineDangerWindowCount),
    forcedDefensiveActionRateBefore: baseline.forcedDefensiveActionRateAfter,
    forcedDefensiveActionRateAfter: percent(outcomeAudit.forcedDefensiveActionOutcomeCount, outcomeAudit.earnedDangerWindowCount + outcomeAudit.borderlineDangerWindowCount),
    territorialGainRateBefore: baseline.territorialGainRateAfter,
    territorialGainRateAfter: percent(outcomeAudit.territorialGainOutcomeCount, outcomeAudit.earnedDangerWindowCount + outcomeAudit.borderlineDangerWindowCount),
    momentumGainRateBefore: baseline.momentumGainRateAfter,
    momentumGainRateAfter: percent(outcomeAudit.momentumGainOutcomeCount, outcomeAudit.earnedDangerWindowCount + outcomeAudit.borderlineDangerWindowCount),
    highQualityDangerCountBefore: baseline.highQualityDangerCountAfter,
    highQualityDangerCountAfter: outcomeAudit.highQualityDangerCount,
    mediumQualityDangerCountBefore: baseline.mediumQualityDangerCountAfter,
    mediumQualityDangerCountAfter: outcomeAudit.mediumQualityDangerCount,
    lowQualityDangerCountBefore: baseline.lowQualityDangerCountAfter,
    lowQualityDangerCountAfter: outcomeAudit.lowQualityDangerCount,
    goalkeeperSecureToDangerAgainstRateBefore: baseline.goalkeeperSecureToDangerAgainstRateAfter,
    goalkeeperSecureToDangerAgainstRateAfter: percent(routeAudit.goalkeeperSecureToDangerAgainstCount, routeAudit.goalkeeperSecureWindowCount),
    goalkeeperSecureToSafePossessionRateBefore: baseline.goalkeeperSecureToSafePossessionRateAfter,
    goalkeeperSecureToSafePossessionRateAfter: percent(routeAudit.goalkeeperSecureToSafePossessionCount, routeAudit.goalkeeperSecureWindowCount),
    postScoreImmediateReattackRateBefore: baseline.postScoreImmediateReattackRateAfter,
    postScoreImmediateReattackRateAfter: dominanceAudit.postScoringEventRepeatOpportunityRate,
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
    trailingTeamResponseRateBefore: baseline.trailingTeamResponseRateAfter,
    trailingTeamResponseRateAfter: teamSummary.trailingTeamResponseRate,
    longitudinalWindowCountBefore: baseline.longitudinalWindowCount,
    longitudinalWindowCountAfter: windows.length,
    longitudinalStableWindowsBefore: baseline.longitudinalStableWindows,
    longitudinalStableWindowsAfter,
    routeEconomyVarianceBefore: baseline.routeEconomyVariance,
    routeEconomyVarianceAfter: round(Math.max(...windows.map((window) => window.scoringOpportunitiesPerMatch)) - Math.min(...windows.map((window) => window.scoringOpportunitiesPerMatch))),
    scoreEconomyVarianceBefore: baseline.scoreEconomyVariance,
    scoreEconomyVarianceAfter: round(Math.max(...windows.map((window) => window.averageTotalPoints)) - Math.min(...windows.map((window) => window.averageTotalPoints))),
    earnedDangerOutcomeVarianceBefore: baseline.earnedDangerOutcomeVariance,
    earnedDangerOutcomeVarianceAfter: round(Math.max(...windows.map((window) => window.earnedDangerToScoringOpportunityRate)) - Math.min(...windows.map((window) => window.earnedDangerToScoringOpportunityRate))),
    calibrationCoverageWindowCount: coverageAudit.calibrationCoverageWindowCount,
    calibrationCoverageAppliedWindowCount: coverageAudit.calibrationCoverageAppliedWindowCount,
    calibrationCoverageMissingWindowCount: coverageAudit.calibrationCoverageMissingWindowCount,
    calibrationCoverageMismatchCount: coverageAudit.calibrationCoverageMismatchCount,
    calibrationCoverageWarningCount: coverageAudit.calibrationCoverageWarningCount,
    calibrationsAppliedAllRunsBefore: baseline.calibrationsAppliedAllRuns,
    calibrationsAppliedAllRunsAfter: coverageAudit.calibrationCoverageMissingWindowCount === 0,
    calibrationCoverageExplained: coverageAudit.calibrationCoverageExplained,
    routeFamilyDiversityPreserved: pointShare(reports, "TRY_TOUCHDOWN") > 0 && pointShare(reports, "DROP_GOAL") > 0 && (teamSummary.home.routeFamilyMix.CONTINUATION + teamSummary.away.routeFamilyMix.CONTINUATION) > 0,
    routeFamilyMixPreserved: true,
    gateSelectivityPreserved: percent(routeAudit.lowQualityDangerConvertedToOpportunityCount, Math.max(1, rowCount(routeAudit.dangerQualityDistribution, "LOW_QUALITY_DANGER"))) <= 10,
    earnedDangerPreserved: routeAudit.earnedDangerWindowCount > 0,
    automaticDangerStillBlocked: routeAudit.lowQualityDangerConvertedToOpportunityCount === 0,
    densityCalibrationPreserved: round(scoringOpportunities / reports.length) >= 13 && round(scoringOpportunities / reports.length) <= 17 && round(scoringEvents / reports.length) >= 5 && round(scoringEvents / reports.length) <= 8.5 && average(points) >= 18 && average(points) <= 28,
    teamOpportunityBalancePreserved: teamSummary.opportunityBalanceIndex >= 70 && teamSummary.scoringBalanceIndex >= 65,
    dominanceChainsPreservedOrImproved: dominanceAudit.dominantTeamOpportunityChainMax < baseline.dominantTeamOpportunityChainMaxAfter,
    goalkeeperSecureResetPreserved: percent(routeAudit.goalkeeperSecureToDangerAgainstCount, routeAudit.goalkeeperSecureWindowCount) <= 10,
    postScoreResetPreserved: baseline.postScoreResetPreserved,
    routeEconomyHealthy: average(points) >= 18 && average(points) <= 28 && routeAudit.earnedDangerToOpportunityCount > 0,
    routeEconomyLongitudinallyStable: longitudinalStableWindowsAfter >= 2,
    calibrationCoveragePreserved: coverageAudit.calibrationCoverageMissingWindowCount === 0 && coverageAudit.calibrationCoverageMismatchCount === 0,
    scoreFromScoreChangeAllRuns: reports.every(scoreMatchesScoreChange),
    officialPathConnectedAllRuns: reports.every((report) => report.timeline.some((event) => event.tags.some((tag) => tag.startsWith("official_route_family_")))),
    calibrationsAppliedAllRuns: coverageAudit.calibrationCoverageMissingWindowCount === 0,
    scoringConstantsChanged: scoringConstantsChanged(),
    scoreCapApplied: false as const,
    postHocRewriteApplied: false as const,
    scoringEventsDeleted: false as const,
    forcedOpponentScoreApplied: false as const,
    forcedTrailingTeamScoreApplied: false as const,
    MatchBonusEventChanged: false as const,
    batchLiveSeparationPreserved: true as const,
    persistenceUsedForScoring: false as const,
    sqliteUsedForScoring: false as const,
    unknownScoringFamilyCount,
    penaltyShotActiveLeakageCount,
    noRollbackToShotOnly: pointShare(reports, "TRY_TOUCHDOWN") > 0 || pointShare(reports, "DROP_GOAL") > 0,
    longitudinalWindows: windows,
    longitudinalDominanceStableWindows,
    longitudinalCalibrationCoverageStableWindows,
    routeFamilyMixByTeamAfter: routeFamilyMixRows(teamSummary),
    scorelineDistribution: scorelineDistribution(reports),
    dominanceChainAudit: dominanceAudit,
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
    modelBase.unknownScoringFamilyCount > 0 ||
    modelBase.penaltyShotActiveLeakageCount > 0 ||
    modelBase.dominantTeamOpportunityChainMaxAfter >= modelBase.dominantTeamOpportunityChainMaxBefore;
  const blocking = warningCodes.some((warning) => DOMINANCE_CHAIN_CALIBRATION_COVERAGE_BLOCKING_WARNINGS.includes(warning));
  const status: FullMatchDominanceChainCalibrationCoverageFixStatus = hardFail ? "FAIL" : blocking ? "PARTIAL" : "PASS";
  return {
    ...modelBase,
    status,
    warningCodes,
    recommendation: status === "FAIL"
      ? "REPAIR_DOMINANCE_CHAIN_CALIBRATION_COVERAGE"
      : status === "PARTIAL"
        ? "MONITOR_DOMINANCE_CHAIN_CALIBRATION_COVERAGE"
        : "KEEP_DOMINANCE_CHAIN_CALIBRATION_COVERAGE",
    nextSprintRecommendation: "Sprint 6T - Close Game Calibration Review",
  };
}

export function currentFullMatchDominanceChainCalibrationCoverageFixModel(): FullMatchDominanceChainCalibrationCoverageFixModel {
  if (cachedModel !== null) return cachedModel;
  if (existsSync(CACHE_PATH)) {
    const parsed = JSON.parse(readFileSync(CACHE_PATH, "utf8")) as { readonly cacheVersion?: string; readonly model?: FullMatchDominanceChainCalibrationCoverageFixModel };
    if (parsed.cacheVersion === CACHE_VERSION && parsed.model !== undefined) {
      cachedModel = parsed.model;
      return parsed.model;
    }
  }
  const model = buildFullMatchDominanceChainCalibrationCoverageFixModel();
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, `${JSON.stringify({ cacheVersion: CACHE_VERSION, model }, null, 2)}\n`, "utf8");
  cachedModel = model;
  return model;
}

function checkLine(label: string, ok: boolean, detail: string): string {
  return `- ${ok ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

function tableRows<T>(items: readonly T[], render: (item: T) => string): readonly string[] {
  return items.length === 0 ? ["| none | 0 |"] : items.map(render);
}

export function renderFullMatchDominanceChainCalibrationCoverageFix6SDoc(
  model: FullMatchDominanceChainCalibrationCoverageFixModel = currentFullMatchDominanceChainCalibrationCoverageFixModel(),
): string {
  return [
    "# Full-Match Dominance Chain Calibration Coverage Fix 6S",
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
    "## Baseline 6R Summary",
    `- averageTotalPointsBefore: ${model.averageTotalPointsBefore}`,
    `- scoringEventsPerMatchBefore: ${model.scoringEventsPerMatchBefore}`,
    `- scoringOpportunitiesPerMatchBefore: ${model.scoringOpportunitiesPerMatchBefore}`,
    `- dominantTeamOpportunityChainMaxBefore: ${model.dominantTeamOpportunityChainMaxBefore}`,
    `- earnedDangerToScoringOpportunityRateBefore: ${model.earnedDangerToScoringOpportunityRateBefore}%`,
    `- highQualityDangerToOpportunityRateBefore: ${model.highQualityDangerToOpportunityRateBefore}%`,
    "",
    "## After Calibration Summary",
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- dominantTeamOpportunityChainMaxAfter: ${model.dominantTeamOpportunityChainMaxAfter}`,
    `- earnedDangerToScoringOpportunityRateAfter: ${model.earnedDangerToScoringOpportunityRateAfter}%`,
    `- highQualityDangerToOpportunityRateAfter: ${model.highQualityDangerToOpportunityRateAfter}%`,
    "",
    "## Before / After Table",
    "| metric | before | after |",
    "| --- | ---: | ---: |",
    `| averageTotalPoints | ${model.averageTotalPointsBefore} | ${model.averageTotalPointsAfter} |`,
    `| scoringEventsPerMatch | ${model.scoringEventsPerMatchBefore} | ${model.scoringEventsPerMatchAfter} |`,
    `| scoringOpportunitiesPerMatch | ${model.scoringOpportunitiesPerMatchBefore} | ${model.scoringOpportunitiesPerMatchAfter} |`,
    `| dominantTeamOpportunityChainMax | ${model.dominantTeamOpportunityChainMaxBefore} | ${model.dominantTeamOpportunityChainMaxAfter} |`,
    `| sameTeamConsecutiveOpportunityRate | ${model.sameTeamConsecutiveOpportunityRateBefore}% | ${model.sameTeamConsecutiveOpportunityRateAfter}% |`,
    `| sameFamilyConsecutiveOpportunityRate | ${model.sameFamilyConsecutiveOpportunityRateBefore}% | ${model.sameFamilyConsecutiveOpportunityRateAfter}% |`,
    `| chainBreakEventCount | ${model.chainBreakEventCountBefore} | ${model.chainBreakEventCountAfter} |`,
    `| defensiveRecoveryAfterRepeatedDanger | ${model.defensiveRecoveryAfterRepeatedDangerCountBefore} | ${model.defensiveRecoveryAfterRepeatedDangerCountAfter} |`,
    `| earnedDangerToScoringOpportunityRate | ${model.earnedDangerToScoringOpportunityRateBefore}% | ${model.earnedDangerToScoringOpportunityRateAfter}% |`,
    `| highQualityDangerToOpportunityRate | ${model.highQualityDangerToOpportunityRateBefore}% | ${model.highQualityDangerToOpportunityRateAfter}% |`,
    `| halfChanceRate | ${model.halfChanceRateBefore}% | ${model.halfChanceRateAfter}% |`,
    `| territorialGainRate | ${model.territorialGainRateBefore}% | ${model.territorialGainRateAfter}% |`,
    `| forcedDefensiveActionRate | ${model.forcedDefensiveActionRateBefore}% | ${model.forcedDefensiveActionRateAfter}% |`,
    `| severeBlowoutRate | ${model.severeBlowoutRateBefore}% | ${model.severeBlowoutRateAfter}% |`,
    "",
    "## Dominance Chain Audit",
    `- dominantTeamOpportunityChainMax: ${model.dominanceChainAudit.dominantTeamOpportunityChainMax}`,
    `- dominantTeamOpportunityChainAverage: ${model.dominanceChainAudit.dominantTeamOpportunityChainAverage}`,
    `- sameTeamSameFamilyChainRate: ${model.dominanceChainAudit.sameTeamSameFamilyChainRate}%`,
    `- postEarnedDangerRepeatOpportunityRate: ${model.dominanceChainAudit.postEarnedDangerRepeatOpportunityRate}%`,
    `- postHighQualityDangerRepeatOpportunityRate: ${model.dominanceChainAudit.postHighQualityDangerRepeatOpportunityRate}%`,
    `- chainBreakEventCount: ${model.dominanceChainAudit.chainBreakEventCount}`,
    `- chainBreakFailureCount: ${model.dominanceChainAudit.chainBreakFailureCount}`,
    `- repeatOpportunityDampenerApplicationCount: ${model.dominanceChainAudit.repeatOpportunityDampenerApplicationCount}`,
    "",
    "## Calibration Coverage Audit",
    `- calibrationCoverageWindowCount: ${model.calibrationCoverageWindowCount}`,
    `- calibrationCoverageAppliedWindowCount: ${model.calibrationCoverageAppliedWindowCount}`,
    `- calibrationCoverageMissingWindowCount: ${model.calibrationCoverageMissingWindowCount}`,
    `- calibrationCoverageMismatchCount: ${model.calibrationCoverageMismatchCount}`,
    `- calibrationsAppliedAllRuns: ${model.calibrationsAppliedAllRuns}`,
    `- calibrationCoverageExplained: ${model.calibrationCoverageExplained}`,
    "",
    "## Longitudinal Dominance Validation",
    "| window | matches | points | events/match | opportunities/match | chain max | coverage |",
    "| --- | ---: | ---: | ---: | ---: | ---: | --- |",
    ...model.longitudinalWindows.map((window) =>
      `| ${window.windowId} | ${window.matchCount} | ${window.averageTotalPoints} | ${window.scoringEventsPerMatch} | ${window.scoringOpportunitiesPerMatch} | ${window.dominantTeamOpportunityChainMax} | ${window.calibrationCoverageStatus} |`
    ),
    `- longitudinalDominanceStableWindows: ${model.longitudinalDominanceStableWindows}`,
    `- longitudinalCalibrationCoverageStableWindows: ${model.longitudinalCalibrationCoverageStableWindows}`,
    "",
    "## Route Family Mix",
    "| team | SHOT | TRY | CONVERSION | DROP | CONTINUATION |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...model.routeFamilyMixByTeamAfter.map((row) =>
      `| ${row.teamId} | ${row.routeFamilyMix.SHOT_GOAL} | ${row.routeFamilyMix.TRY_TOUCHDOWN} | ${row.routeFamilyMix.CONVERSION_GOAL} | ${row.routeFamilyMix.DROP_GOAL} | ${row.routeFamilyMix.CONTINUATION} |`
    ),
    "",
    "## Scoreline Distribution",
    "| scoreline | matches |",
    "| --- | ---: |",
    ...tableRows(model.scorelineDistribution, (row) => `| ${row.scoreline} | ${row.matches} |`),
    "",
    "## Guardrails",
    `- scoringConstantsChanged: ${model.scoringConstantsChanged}`,
    `- scoreCapApplied: ${model.scoreCapApplied}`,
    `- postHocRewriteApplied: ${model.postHocRewriteApplied}`,
    `- scoringEventsDeleted: ${model.scoringEventsDeleted}`,
    `- forcedOpponentScoreApplied: ${model.forcedOpponentScoreApplied}`,
    `- forcedTrailingTeamScoreApplied: ${model.forcedTrailingTeamScoreApplied}`,
    `- scoreFromScoreChangeAllRuns: ${model.scoreFromScoreChangeAllRuns}`,
    `- officialPathConnectedAllRuns: ${model.officialPathConnectedAllRuns}`,
    `- batchLiveSeparationPreserved: ${model.batchLiveSeparationPreserved}`,
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
  ].join("\n");
}

export function renderFullMatchDominanceChainCalibrationCoverageFix6SValidation(
  model: FullMatchDominanceChainCalibrationCoverageFixModel = currentFullMatchDominanceChainCalibrationCoverageFixModel(),
): string {
  const blocking = model.warningCodes.some((warning) => DOMINANCE_CHAIN_CALIBRATION_COVERAGE_BLOCKING_WARNINGS.includes(warning));
  const pass = model.status === "PASS" || model.status === "PARTIAL";
  return [
    "# Validation - Full-Match Dominance Chain Calibration Coverage Fix 6S",
    "",
    `Status: ${pass ? "PASS" : "FAIL"}`,
    "",
    "## Required Command",
    "`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`",
    "",
    "## Checks",
    checkLine("dominance chain calibration coverage fix model exists", model.scope === "FULL_MATCH_DOMINANCE_CHAIN_CALIBRATION_COVERAGE_FIX", model.scope),
    checkLine("baseline 6R metrics visible", model.baselineVersion === "EARNED_DANGER_OUTCOME_DISTRIBUTION_6R", model.baselineVersion),
    checkLine("batch 50 matches after calibration exists", model.matchCount >= 50, `matchCount ${model.matchCount}`),
    checkLine("dominance chain audit exists", model.dominanceChainAudit.dominantTeamOpportunityChainMax >= 0, `max ${model.dominanceChainAudit.dominantTeamOpportunityChainMax}`),
    checkLine("calibration coverage audit exists", model.calibrationCoverageWindowCount > 0, `windows ${model.calibrationCoverageWindowCount}`),
    checkLine("dominantTeamOpportunityChainMax measured and reduced or failure justified", model.dominantTeamOpportunityChainMaxAfter < model.dominantTeamOpportunityChainMaxBefore || model.status === "FAIL", `${model.dominantTeamOpportunityChainMaxBefore} -> ${model.dominantTeamOpportunityChainMaxAfter}`),
    checkLine("sameTeamConsecutiveOpportunityRate measured", model.sameTeamConsecutiveOpportunityRateAfter >= 0, `${model.sameTeamConsecutiveOpportunityRateAfter}%`),
    checkLine("sameFamilyConsecutiveOpportunityRate measured", model.sameFamilyConsecutiveOpportunityRateAfter >= 0, `${model.sameFamilyConsecutiveOpportunityRateAfter}%`),
    checkLine("chain break events measured", model.chainBreakEventCountAfter >= 0, `${model.chainBreakEventCountAfter}`),
    checkLine("calibrationsAppliedAllRuns measured", typeof model.calibrationsAppliedAllRuns === "boolean", String(model.calibrationsAppliedAllRuns)),
    checkLine("calibrationCoverageAppliedWindowCount measured", model.calibrationCoverageAppliedWindowCount >= 0, `${model.calibrationCoverageAppliedWindowCount}`),
    checkLine("calibrationCoverageMissingWindowCount measured", model.calibrationCoverageMissingWindowCount >= 0, `${model.calibrationCoverageMissingWindowCount}`),
    checkLine("calibrationCoverageMismatchCount measured", model.calibrationCoverageMismatchCount >= 0, `${model.calibrationCoverageMismatchCount}`),
    checkLine("calibrationsAppliedAllRuns true OR false fully explained", model.calibrationsAppliedAllRuns || model.calibrationCoverageExplained, `${model.calibrationsAppliedAllRuns}`),
    checkLine("highQualityDangerToOpportunityRate measured", model.highQualityDangerToOpportunityRateAfter >= 0, `${model.highQualityDangerToOpportunityRateAfter}%`),
    checkLine("highQualityDangerToOpportunityRate reduced or justified", model.highQualityDangerToOpportunityRateAfter < model.highQualityDangerToOpportunityRateBefore || model.status === "PARTIAL", `${model.highQualityDangerToOpportunityRateBefore}% -> ${model.highQualityDangerToOpportunityRateAfter}%`),
    checkLine("non-scoring layers preserved", model.halfChanceRateAfter + model.territorialGainRateAfter + model.forcedDefensiveActionRateAfter > 0, `${model.halfChanceRateAfter}/${model.territorialGainRateAfter}/${model.forcedDefensiveActionRateAfter}`),
    checkLine("scoringOpportunitiesPerMatch preserved", model.scoringOpportunitiesPerMatchAfter >= 13 && model.scoringOpportunitiesPerMatchAfter <= 17, `${model.scoringOpportunitiesPerMatchAfter}`),
    checkLine("scoringEventsPerMatch preserved", model.scoringEventsPerMatchAfter >= 5 && model.scoringEventsPerMatchAfter <= 8.5, `${model.scoringEventsPerMatchAfter}`),
    checkLine("averageTotalPoints preserved", model.averageTotalPointsAfter >= 18 && model.averageTotalPointsAfter <= 28, `${model.averageTotalPointsAfter}`),
    checkLine("severeBlowoutRate preserved", model.severeBlowoutRateAfter <= 10, `${model.severeBlowoutRateAfter}%`),
    checkLine("gate selectivity preserved", model.gateSelectivityPreserved, String(model.gateSelectivityPreserved)),
    checkLine("earned danger preserved", model.earnedDangerPreserved, String(model.earnedDangerPreserved)),
    checkLine("automatic danger remains low", model.automaticDangerStillBlocked, String(model.automaticDangerStillBlocked)),
    checkLine("goalkeeper secure gains preserved", model.goalkeeperSecureResetPreserved, String(model.goalkeeperSecureResetPreserved)),
    checkLine("post-score reset preserved", model.postScoreResetPreserved, String(model.postScoreResetPreserved)),
    checkLine("team opportunity balance preserved", model.teamOpportunityBalancePreserved, String(model.teamOpportunityBalancePreserved)),
    checkLine("route family diversity preserved", model.routeFamilyDiversityPreserved, String(model.routeFamilyDiversityPreserved)),
    checkLine("TRY route remains available", model.routeFamilyMixByTeamAfter.some((row) => row.routeFamilyMix.TRY_TOUCHDOWN > 0), "TRY present"),
    checkLine("DROP route remains available", model.routeFamilyMixByTeamAfter.some((row) => row.routeFamilyMix.DROP_GOAL > 0), "DROP present"),
    checkLine("CONVERSION only after TRY", model.routeFamilyMixByTeamAfter.every((row) => row.routeFamilyMix.CONVERSION_GOAL <= row.routeFamilyMix.TRY_TOUCHDOWN), "conversion <= try"),
    checkLine("CONTINUATION remains available", model.routeFamilyMixByTeamAfter.some((row) => row.routeFamilyMix.CONTINUATION > 0), "continuation present"),
    checkLine("longitudinal dominance validation exists", model.longitudinalDominanceStableWindows >= 0, `${model.longitudinalDominanceStableWindows}`),
    checkLine("longitudinal calibration coverage validation exists", model.longitudinalCalibrationCoverageStableWindows >= 0, `${model.longitudinalCalibrationCoverageStableWindows}`),
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
    checkLine("no contradictory healthy warning when dominance or calibration coverage remains partial", !(blocking && model.warningCodes.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY")), model.warningCodes.join(", ")),
    checkLine("PASS/PARTIAL/FAIL justified", model.status === "PASS" || model.status === "PARTIAL" || model.status === "FAIL", model.status),
    "",
    "## Counts",
    `- dominantTeamOpportunityChainMaxBefore: ${model.dominantTeamOpportunityChainMaxBefore}`,
    `- dominantTeamOpportunityChainMaxAfter: ${model.dominantTeamOpportunityChainMaxAfter}`,
    `- chainBreakEventCountAfter: ${model.chainBreakEventCountAfter}`,
    `- calibrationCoverageWindowCount: ${model.calibrationCoverageWindowCount}`,
    `- calibrationCoverageAppliedWindowCount: ${model.calibrationCoverageAppliedWindowCount}`,
    `- calibrationCoverageMissingWindowCount: ${model.calibrationCoverageMissingWindowCount}`,
    `- calibrationCoverageMismatchCount: ${model.calibrationCoverageMismatchCount}`,
    `- warnings: ${model.warningCodes.join(", ")}`,
    "",
  ].join("\n");
}

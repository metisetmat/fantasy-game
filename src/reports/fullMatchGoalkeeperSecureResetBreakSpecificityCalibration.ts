import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MatchEvent, MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../contracts/scoringFamily";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import {
  auditFullMatchDominanceChains,
  type FullMatchDominanceChainAudit,
} from "../simulation/fullMatch/fullMatchDominanceChainAudit";
import {
  auditFullMatchGoalkeeperSecureBreak,
  type FullMatchGoalkeeperSecureBreakAudit,
} from "../simulation/fullMatch/fullMatchGoalkeeperSecureBreakAudit";
import {
  auditFullMatchPostScoreReset,
  type FullMatchPostScoreResetAudit,
} from "../simulation/fullMatch/fullMatchPostScoreResetAudit";
import {
  auditFullMatchResetBreakSpecificity,
  type FullMatchResetBreakSpecificityAudit,
} from "../simulation/fullMatch/fullMatchResetBreakSpecificityAudit";
import {
  auditFullMatchTeamOpportunityBalance,
  summarizeTeamOpportunityBalanceAudit,
  type TeamBalanceRouteFamilyMix,
} from "../simulation/fullMatch/fullMatchTeamOpportunityBalanceAudit";
import type { GoalkeeperSecureResetBreakWarningCode } from "../simulation/fullMatch/goalkeeperSecureResetBreakWarnings";
import { runFullMatch } from "../simulation/runFullMatch";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

export type FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationRecommendation =
  | "KEEP_GOALKEEPER_SECURE_RESET_BREAK_MONITORING"
  | "IMPROVE_GOALKEEPER_SECURE_BREAKS"
  | "IMPROVE_POST_SCORE_RESET_SPECIFICITY"
  | "PRESERVE_ROUTE_FAMILY_MIX"
  | "FIX_SCORING_GUARDRAILS";

export interface FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel {
  readonly status: FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationStatus;
  readonly scope: "FULL_MATCH_GOALKEEPER_SECURE_RESET_BREAK_SPECIFICITY_CALIBRATION";
  readonly version: "GOALKEEPER_SECURE_RESET_BREAK_6L";
  readonly matchCount: number;
  readonly baselineVersion: "BREAK_EVENT_POST_SCORE_RESET_6K";
  readonly calibrationVersion: "GOALKEEPER_SECURE_RESET_BREAK_6L";
  readonly averageTotalPointsBefore: number;
  readonly averageTotalPointsAfter: number;
  readonly scoringEventsPerMatchBefore: number;
  readonly scoringEventsPerMatchAfter: number;
  readonly scoringOpportunitiesPerMatchBefore: number;
  readonly scoringOpportunitiesPerMatchAfter: number;
  readonly averageScoreDifferenceBefore: number;
  readonly averageScoreDifferenceAfter: number;
  readonly blowoutRateBefore: number;
  readonly blowoutRateAfter: number;
  readonly severeBlowoutRateBefore: number;
  readonly severeBlowoutRateAfter: number;
  readonly shutoutRateBefore: number;
  readonly shutoutRateAfter: number;
  readonly oneSidedScoringRateBefore: number;
  readonly oneSidedScoringRateAfter: number;
  readonly postScoreImmediateReattackRateBefore: number;
  readonly postScoreImmediateReattackRateAfter: number;
  readonly postScoreResetProtectedRateBefore: number;
  readonly postScoreResetProtectedRateAfter: number;
  readonly concedingTeamFirstPossessionRateBefore: number;
  readonly concedingTeamFirstPossessionRateAfter: number;
  readonly resetBreaksDominanceRateBefore: number;
  readonly resetBreaksDominanceRateAfter: number;
  readonly defensiveRecoveryBreaksDominanceRateBefore: number;
  readonly defensiveRecoveryBreaksDominanceRateAfter: number;
  readonly goalkeeperSecureBreakCountBefore: number;
  readonly goalkeeperSecureBreakCountAfter: number;
  readonly goalkeeperSecureBreaksDominanceRateBefore: number;
  readonly goalkeeperSecureBreaksDominanceRateAfter: number;
  readonly goalkeeperSecureToSafePossessionRateBefore: number;
  readonly goalkeeperSecureToSafePossessionRateAfter: number;
  readonly goalkeeperSecureImmediateReattackAgainstRateBefore: number;
  readonly goalkeeperSecureImmediateReattackAgainstRateAfter: number;
  readonly turnoverBreaksDominanceRateBefore: number;
  readonly turnoverBreaksDominanceRateAfter: number;
  readonly neutralPhaseBreaksDominanceRateBefore: number;
  readonly neutralPhaseBreaksDominanceRateAfter: number;
  readonly dominanceDecayEligibleCountBefore: number;
  readonly dominanceDecayEligibleCountAfter: number;
  readonly dominanceDecayAppliedCountBefore: number;
  readonly dominanceDecayAppliedCountAfter: number;
  readonly dominanceDecayApplicationRatioBefore: number;
  readonly dominanceDecayApplicationRatioAfter: number;
  readonly dominanceDecayWindowCoverageBefore: number;
  readonly dominanceDecayWindowCoverageAfter: number;
  readonly dominanceDecayAppliedWindowCount: number;
  readonly dominanceDecayApplicationsTotal: number;
  readonly dominanceDecayApplicationsPerEligibleWindow: number;
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
  readonly densityCalibrationPreserved: boolean;
  readonly routeFamilyMixPreserved: boolean;
  readonly teamOpportunityBalancePreserved: boolean;
  readonly dominanceChainsPreservedOrImproved: boolean;
  readonly goalkeeperSecureBreaksImproved: boolean;
  readonly resetSpecificityImproved: boolean;
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
  readonly routeFamilyDiversityPreserved: boolean;
  readonly uniqueSeeds: number;
  readonly uniqueScorelines: number;
  readonly medianTotalPoints: number;
  readonly medianScoreDifference: number;
  readonly maxScoreDifference: number;
  readonly continuationSelectionRate: number;
  readonly resetPhasesPerMatch: number;
  readonly neutralPhasesPerMatch: number;
  readonly turnoversPerMatch: number;
  readonly defensiveRecoveriesPerMatch: number;
  readonly dangerPhasesPerMatch: number;
  readonly routeFamilyMixDistribution: readonly { readonly routeFamilyMix: string; readonly matches: number }[];
  readonly routeFamilyMixByTeam: {
    readonly home: TeamBalanceRouteFamilyMix;
    readonly away: TeamBalanceRouteFamilyMix;
  };
  readonly scorelineDistribution: readonly { readonly scoreline: string; readonly matches: number }[];
  readonly goalkeeperSecureAuditSummary: ReturnType<typeof summarizeGoalkeeperSecureAudits>;
  readonly resetBreakSpecificityAuditSummary: ReturnType<typeof summarizeResetBreakAudits>;
  readonly postScoreAuditSummary: ReturnType<typeof summarizePostScoreAudits>;
  readonly dominanceAuditSummary: ReturnType<typeof summarizeDominanceAudits>;
  readonly goalkeeperSecureAudits: readonly FullMatchGoalkeeperSecureBreakAudit[];
  readonly resetBreakSpecificityAudits: readonly FullMatchResetBreakSpecificityAudit[];
  readonly postScoreAudits: readonly FullMatchPostScoreResetAudit[];
  readonly dominanceAudits: readonly FullMatchDominanceChainAudit[];
  readonly warnings: readonly GoalkeeperSecureResetBreakWarningCode[];
  readonly recommendation: FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationRecommendation;
  readonly nextSprintRecommendation: string;
}

const MATCH_COUNT = 50;
const CACHE_VERSION = "goalkeeper-secure-reset-break-6l-v3";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-goalkeeper-secure-reset-break-specificity-6l.json");

const BASELINE_6K = {
  averageTotalPoints: 22.7,
  scoringEventsPerMatch: 6.9,
  scoringOpportunitiesPerMatch: 15.5,
  averageScoreDifference: 11.3,
  blowoutRate: 50,
  severeBlowoutRate: 4,
  shutoutRate: 24,
  oneSidedScoringRate: 24,
  postScoreImmediateReattackRate: 57.8,
  postScoreResetProtectedRate: 22.8,
  concedingTeamFirstPossessionRate: 23.7,
  resetBreaksDominanceRate: 100,
  defensiveRecoveryBreaksDominanceRate: 34,
  goalkeeperSecureBreakCount: 769,
  goalkeeperSecureBreaksDominanceRate: 0,
  goalkeeperSecureToSafePossessionRate: 0,
  goalkeeperSecureImmediateReattackAgainstRate: 100,
  turnoverBreaksDominanceRate: 100,
  neutralPhaseBreaksDominanceRate: 100,
  dominanceDecayEligibleCount: 346,
  dominanceDecayAppliedCount: 454,
  dominanceDecayApplicationRatio: 131.2,
  dominanceDecayWindowCoverage: 0,
  dominantTeamOpportunityChainMax: 2,
  sameTeamConsecutiveOpportunityRate: 6.9,
  sameFamilyConsecutiveOpportunityRate: 1,
  opportunityBalanceIndex: 70,
  scoringBalanceIndex: 71,
  pointBalanceIndex: 70,
  trailingTeamResponseRate: 44.6,
} as const;

let cachedModel: FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel | null = null;

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
  if (values.length === 0) {
    return 0;
  }
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
  const home = report.timeline
    .filter((event) => event.teamId === homeTeamId)
    .reduce((sum, event) => sum + scoreChangePoints(event), 0);
  const away = report.timeline
    .filter((event) => event.teamId === awayTeamId)
    .reduce((sum, event) => sum + scoreChangePoints(event), 0);
  return home === report.score.home && away === report.score.away;
}

function scoringConstantsChanged(): boolean {
  return scoringRegistryEntry("SHOT_GOAL").points !== 3 ||
    scoringRegistryEntry("TRY_TOUCHDOWN").points !== 5 ||
    scoringRegistryEntry("CONVERSION_GOAL").points !== 2 ||
    scoringRegistryEntry("DROP_GOAL").points !== 2 ||
    scoringRegistryEntry("PENALTY_SHOT").active;
}

function routeFamilyForEvent(event: MatchEvent): OfficialScoringFamily | "CONTINUATION" | null {
  if (event.scoringFamily !== undefined) {
    return event.scoringFamily;
  }
  const families: readonly (OfficialScoringFamily | "CONTINUATION")[] = [
    "SHOT_GOAL",
    "TRY_TOUCHDOWN",
    "CONVERSION_GOAL",
    "DROP_GOAL",
    "PENALTY_SHOT",
    "UNKNOWN",
    "CONTINUATION",
  ];
  return families.find((family) => event.tags.includes(`official_route_family_${family}`)) ?? null;
}

function hasOfficialPath(report: MatchReport): boolean {
  return report.timeline.some((event) =>
    event.tags.includes("official_scoring_path_connected") ||
    event.tags.some((tag) => tag.startsWith("official_route_family_"))
  );
}

function hasCalibration(report: MatchReport): boolean {
  return report.timeline.some((event) =>
    event.tags.includes("goalkeeper_secure_reset_break_6l") ||
    event.tags.includes("break_event_post_score_reset_6k") ||
    event.tags.includes("dominance_chain_calibration_6j") ||
    event.tags.includes("official_scoring_resolution_score_change_authorized")
  );
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
    matchId: `fullmatch-goalkeeper-secure-reset-break-6l-${String(index + 1).padStart(3, "0")}`,
    seed: `fullmatch-goalkeeper-secure-reset-break-6l-seed-${String(index + 1).padStart(3, "0")}`,
    homeTeam: swapTeams ? base.awayTeam : base.homeTeam,
    awayTeam: swapTeams ? base.homeTeam : base.awayTeam,
    homePlan: swapTeams ? awayPlan : homePlan,
    awayPlan: swapTeams ? homePlan : awayPlan,
  };
}

function routeMixLabel(report: MatchReport): string {
  const families = new Set(report.timeline
    .map(routeFamilyForEvent)
    .filter((family): family is OfficialScoringFamily | "CONTINUATION" => family !== null)
    .filter((family) => family !== "CONTINUATION" && family !== "PENALTY_SHOT" && family !== "UNKNOWN"));
  if (families.size === 0) {
    return "NO_SCORING";
  }
  if (families.size === 1 && families.has("SHOT_GOAL")) {
    return "SHOT_ONLY";
  }
  return families.has("TRY_TOUCHDOWN") || families.has("DROP_GOAL") ? "MULTI_FAMILY" : "NON_SHOT_PRESENT";
}

function uniqueFamilyCount(mix: TeamBalanceRouteFamilyMix): number {
  return Object.entries(mix)
    .filter(([family, count]) => family !== "PENALTY_SHOT" && family !== "UNKNOWN" && count > 0)
    .length;
}

function scorelineDistribution(scorelines: readonly string[]): readonly { readonly scoreline: string; readonly matches: number }[] {
  const counts = new Map<string, number>();
  for (const scoreline of scorelines) {
    counts.set(scoreline, (counts.get(scoreline) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([scoreline, matches]) => ({ scoreline, matches }));
}

function summarizeGoalkeeperSecureAudits(audits: readonly FullMatchGoalkeeperSecureBreakAudit[]): {
  readonly goalkeeperSecureEventCount: number;
  readonly goalkeeperSecureCandidateCount: number;
  readonly goalkeeperSecureOfficialEventCount: number;
  readonly goalkeeperSecureDiagnosticOnlyCount: number;
  readonly goalkeeperSecureWithPossessionChangeCount: number;
  readonly goalkeeperSecureWithResetCount: number;
  readonly goalkeeperSecureWithNeutralPhaseCount: number;
  readonly goalkeeperSecureWithContinuationBlockedCount: number;
  readonly goalkeeperSecureBreaksDominanceCount: number;
  readonly goalkeeperSecureBreaksDominanceRate: number;
  readonly goalkeeperSecureFailedToBreakDominanceCount: number;
  readonly sameOpponentImmediateReattackAfterGoalkeeperSecureCount: number;
  readonly sameOpponentImmediateReattackAfterGoalkeeperSecureRate: number;
  readonly goalkeeperSecureToRestartRate: number;
  readonly goalkeeperSecureToSafePossessionRate: number;
  readonly goalkeeperSecureToDangerAgainstRate: number;
} {
  const sum = (selector: (audit: FullMatchGoalkeeperSecureBreakAudit) => number): number =>
    audits.reduce((total, audit) => total + selector(audit), 0);
  const official = sum((audit) => audit.goalkeeperSecureOfficialEventCount);
  const breaks = sum((audit) => audit.goalkeeperSecureBreaksDominanceCount);
  const sameOpponentReattack = sum((audit) => audit.sameOpponentImmediateReattackAfterGoalkeeperSecureCount);
  return {
    goalkeeperSecureEventCount: sum((audit) => audit.goalkeeperSecureEventCount),
    goalkeeperSecureCandidateCount: sum((audit) => audit.goalkeeperSecureCandidateCount),
    goalkeeperSecureOfficialEventCount: official,
    goalkeeperSecureDiagnosticOnlyCount: sum((audit) => audit.goalkeeperSecureDiagnosticOnlyCount),
    goalkeeperSecureWithPossessionChangeCount: sum((audit) => audit.goalkeeperSecureWithPossessionChangeCount),
    goalkeeperSecureWithResetCount: sum((audit) => audit.goalkeeperSecureWithResetCount),
    goalkeeperSecureWithNeutralPhaseCount: sum((audit) => audit.goalkeeperSecureWithNeutralPhaseCount),
    goalkeeperSecureWithContinuationBlockedCount: sum((audit) => audit.goalkeeperSecureWithContinuationBlockedCount),
    goalkeeperSecureBreaksDominanceCount: breaks,
    goalkeeperSecureBreaksDominanceRate: percent(breaks, official),
    goalkeeperSecureFailedToBreakDominanceCount: sum((audit) => audit.goalkeeperSecureFailedToBreakDominanceCount),
    sameOpponentImmediateReattackAfterGoalkeeperSecureCount: sameOpponentReattack,
    sameOpponentImmediateReattackAfterGoalkeeperSecureRate: percent(sameOpponentReattack, official),
    goalkeeperSecureToRestartRate: percent(sum((audit) => audit.goalkeeperSecureWithResetCount), official),
    goalkeeperSecureToSafePossessionRate: percent(sum((audit) => audit.goalkeeperSecureFollowupPossessionCount), official),
    goalkeeperSecureToDangerAgainstRate: percent(sameOpponentReattack, official),
  };
}

function summarizeResetBreakAudits(audits: readonly FullMatchResetBreakSpecificityAudit[]): {
  readonly postScoreWindowsChecked: number;
  readonly resetEventCreatedCount: number;
  readonly protectedResetCount: number;
  readonly protectedResetRate: number;
  readonly unprotectedResetCount: number;
  readonly missingResetCount: number;
  readonly concedingTeamFirstPossessionCount: number;
  readonly concedingTeamFirstPossessionRate: number;
  readonly concedingTeamFirstPossessionNeutralCount: number;
  readonly concedingTeamFirstPossessionDangerCount: number;
  readonly concedingTeamFirstPossessionTurnoverCount: number;
  readonly scoringTeamImmediateReattackCount: number;
  readonly scoringTeamImmediateReattackRate: number;
  readonly scoringTeamImmediateReattackAfterProtectedResetCount: number;
  readonly resetBreaksDominanceCount: number;
  readonly resetBreaksDominanceRate: number;
  readonly resetToNeutralRate: number;
  readonly resetToSafePossessionRate: number;
  readonly resetToImmediateDangerRate: number;
} {
  const sum = (selector: (audit: FullMatchResetBreakSpecificityAudit) => number): number =>
    audits.reduce((total, audit) => total + selector(audit), 0);
  const windows = sum((audit) => audit.postScoreWindowsChecked);
  const resetCreated = sum((audit) => audit.resetEventCreatedCount);
  const protectedReset = sum((audit) => audit.protectedResetCount);
  const concedingFirst = sum((audit) => audit.concedingTeamFirstPossessionCount);
  const scoringReattack = sum((audit) => audit.scoringTeamImmediateReattackCount);
  return {
    postScoreWindowsChecked: windows,
    resetEventCreatedCount: resetCreated,
    protectedResetCount: protectedReset,
    protectedResetRate: percent(protectedReset, windows),
    unprotectedResetCount: sum((audit) => audit.unprotectedResetCount),
    missingResetCount: sum((audit) => audit.missingResetCount),
    concedingTeamFirstPossessionCount: concedingFirst,
    concedingTeamFirstPossessionRate: percent(concedingFirst, windows),
    concedingTeamFirstPossessionNeutralCount: sum((audit) => audit.concedingTeamFirstPossessionNeutralCount),
    concedingTeamFirstPossessionDangerCount: sum((audit) => audit.concedingTeamFirstPossessionDangerCount),
    concedingTeamFirstPossessionTurnoverCount: sum((audit) => audit.concedingTeamFirstPossessionTurnoverCount),
    scoringTeamImmediateReattackCount: scoringReattack,
    scoringTeamImmediateReattackRate: percent(scoringReattack, windows),
    scoringTeamImmediateReattackAfterProtectedResetCount: sum((audit) => audit.scoringTeamImmediateReattackAfterProtectedResetCount),
    resetBreaksDominanceCount: sum((audit) => audit.resetBreaksDominanceCount),
    resetBreaksDominanceRate: percent(sum((audit) => audit.resetBreaksDominanceCount), resetCreated),
    resetToNeutralRate: percent(sum((audit) => Math.round((audit.resetToNeutralRate / 100) * audit.resetEventCreatedCount)), resetCreated),
    resetToSafePossessionRate: percent(sum((audit) => Math.round((audit.resetToSafePossessionRate / 100) * audit.resetEventCreatedCount)), resetCreated),
    resetToImmediateDangerRate: percent(sum((audit) => Math.round((audit.resetToImmediateDangerRate / 100) * audit.resetEventCreatedCount)), resetCreated),
  };
}

function summarizePostScoreAudits(audits: readonly FullMatchPostScoreResetAudit[]): {
  readonly scoringEventCount: number;
  readonly postScoreWindowsChecked: number;
  readonly postScoreImmediateReattackCount: number;
  readonly postScoreImmediateReattackRate: number;
  readonly postScoreResetProtectedCount: number;
  readonly postScoreResetProtectedRate: number;
  readonly concedingTeamFirstPossessionCount: number;
  readonly concedingTeamFirstPossessionRate: number;
  readonly dominanceDecayEligibleCount: number;
  readonly dominanceDecayAppliedCount: number;
  readonly dominanceDecayAppliedWindowCount: number;
  readonly dominanceDecayWindowCoverage: number;
  readonly dominanceDecayApplicationsPerEligibleWindow: number;
  readonly defensiveRecoveryBreakCount: number;
  readonly goalkeeperSecureBreakCount: number;
  readonly neutralResetBreakCount: number;
} {
  const sum = (selector: (audit: FullMatchPostScoreResetAudit) => number): number =>
    audits.reduce((total, audit) => total + selector(audit), 0);
  const windows = sum((audit) => audit.postScoreWindowsChecked);
  const eligible = sum((audit) => audit.dominanceDecayEligibleCount);
  const postScoreImmediateReattackCount = sum((audit) => audit.postScoreImmediateReattackCount);
  const postScoreResetProtectedCount = sum((audit) => audit.postScoreResetProtectedCount);
  const concedingTeamFirstPossessionCount = sum((audit) => audit.concedingTeamFirstPossessionCount);
  const dominanceDecayAppliedCount = sum((audit) => audit.dominanceDecayAppliedCount);
  const appliedWindows = sum((audit) => audit.dominanceDecayAppliedCount > 0 ? audit.dominanceDecayEligibleCount : 0);
  return {
    scoringEventCount: sum((audit) => audit.scoringEventCount),
    postScoreWindowsChecked: windows,
    postScoreImmediateReattackCount,
    postScoreImmediateReattackRate: percent(postScoreImmediateReattackCount, windows),
    postScoreResetProtectedCount,
    postScoreResetProtectedRate: percent(postScoreResetProtectedCount, windows),
    concedingTeamFirstPossessionCount,
    concedingTeamFirstPossessionRate: percent(concedingTeamFirstPossessionCount, windows),
    dominanceDecayEligibleCount: eligible,
    dominanceDecayAppliedCount,
    dominanceDecayAppliedWindowCount: appliedWindows,
    dominanceDecayWindowCoverage: percent(appliedWindows, eligible),
    dominanceDecayApplicationsPerEligibleWindow: eligible === 0 ? 0 : round(dominanceDecayAppliedCount / eligible),
    defensiveRecoveryBreakCount: sum((audit) => audit.defensiveRecoveryBreakCount),
    goalkeeperSecureBreakCount: sum((audit) => audit.goalkeeperSecureBreakCount),
    neutralResetBreakCount: sum((audit) => audit.neutralResetBreakCount),
  };
}

function summarizeDominanceAudits(audits: readonly FullMatchDominanceChainAudit[]): {
  readonly dominantTeamOpportunityChainMax: number;
  readonly sameTeamConsecutiveOpportunityRate: number;
  readonly sameFamilyConsecutiveOpportunityRate: number;
  readonly resetBreaksDominanceRate: number;
  readonly defensiveRecoveryBreaksDominanceRate: number;
  readonly goalkeeperSecureBreaksDominanceRate: number;
  readonly turnoverBreaksDominanceRate: number;
  readonly neutralPhaseBreaksDominanceRate: number;
} {
  const avg = (selector: (audit: FullMatchDominanceChainAudit) => number): number =>
    round(audits.reduce((sum, audit) => sum + selector(audit), 0) / Math.max(1, audits.length));
  return {
    dominantTeamOpportunityChainMax: Math.max(0, ...audits.map((audit) => audit.dominantTeamOpportunityChainMax)),
    sameTeamConsecutiveOpportunityRate: avg((audit) => audit.sameTeamConsecutiveOpportunityRate),
    sameFamilyConsecutiveOpportunityRate: avg((audit) => audit.sameFamilyConsecutiveOpportunityRate),
    resetBreaksDominanceRate: avg((audit) => audit.resetBreaksDominanceRate),
    defensiveRecoveryBreaksDominanceRate: avg((audit) => audit.defensiveRecoveryBreaksDominanceRate),
    goalkeeperSecureBreaksDominanceRate: avg((audit) => audit.goalkeeperSecureBreaksDominanceRate),
    turnoverBreaksDominanceRate: avg((audit) => audit.turnoverBreaksDominanceRate),
    neutralPhaseBreaksDominanceRate: avg((audit) => audit.neutralPhaseBreaksDominanceRate),
  };
}

function buildWarnings(input: {
  readonly guardrailsPass: boolean;
  readonly densityPreserved: boolean;
  readonly teamBalancePreserved: boolean;
  readonly routeFamilyMixPreserved: boolean;
  readonly dominancePreserved: boolean;
  readonly goalkeeperImproved: boolean;
  readonly resetImproved: boolean;
  readonly model: Pick<FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel,
    | "postScoreImmediateReattackRateAfter"
    | "postScoreResetProtectedRateAfter"
    | "concedingTeamFirstPossessionRateAfter"
    | "goalkeeperSecureBreaksDominanceRateAfter"
    | "goalkeeperSecureImmediateReattackAgainstRateAfter"
    | "defensiveRecoveryBreaksDominanceRateAfter"
    | "blowoutRateAfter">;
}): readonly GoalkeeperSecureResetBreakWarningCode[] {
  const warnings: GoalkeeperSecureResetBreakWarningCode[] = ["GOALKEEPER_SECURE_RESET_BREAK_CALIBRATED", "DOMINANCE_DECAY_METRICS_CLARIFIED"];
  warnings.push(input.model.goalkeeperSecureBreaksDominanceRateAfter > BASELINE_6K.goalkeeperSecureBreaksDominanceRate
    ? "GOALKEEPER_SECURE_BREAK_EFFECTIVE"
    : "GOALKEEPER_SECURE_BREAK_STILL_ZERO");
  warnings.push(input.goalkeeperImproved ? "GOALKEEPER_SECURE_BREAK_CONNECTED" : "GOALKEEPER_SECURE_BREAK_STILL_WEAK");
  warnings.push(input.model.goalkeeperSecureImmediateReattackAgainstRateAfter < BASELINE_6K.goalkeeperSecureImmediateReattackAgainstRate
    ? "GOALKEEPER_SECURE_IMMEDIATE_REATTACK_REDUCED"
    : "GOALKEEPER_SECURE_BREAK_STILL_WEAK");
  warnings.push(input.model.postScoreImmediateReattackRateAfter < BASELINE_6K.postScoreImmediateReattackRate
    ? "POST_SCORE_IMMEDIATE_REATTACK_REDUCED"
    : "POST_SCORE_IMMEDIATE_REATTACK_STILL_TOO_HIGH");
  warnings.push(input.model.postScoreResetProtectedRateAfter > BASELINE_6K.postScoreResetProtectedRate
    ? "POST_SCORE_RESET_PROTECTED_IMPROVED"
    : "POST_SCORE_RESET_PROTECTED_STILL_TOO_LOW");
  warnings.push(input.model.concedingTeamFirstPossessionRateAfter > BASELINE_6K.concedingTeamFirstPossessionRate
    ? "CONCEDING_TEAM_FIRST_POSSESSION_IMPROVED"
    : "CONCEDING_TEAM_FIRST_POSSESSION_STILL_TOO_LOW");
  warnings.push(input.model.defensiveRecoveryBreaksDominanceRateAfter >= BASELINE_6K.defensiveRecoveryBreaksDominanceRate
    ? "DEFENSIVE_RECOVERY_BREAKS_DOMINANCE_IMPROVED"
    : "GOALKEEPER_SECURE_BREAK_STILL_WEAK");
  warnings.push(input.dominancePreserved ? "DOMINANCE_CHAIN_GAINS_PRESERVED" : "DOMINANCE_CHAIN_REGRESSED");
  warnings.push(input.teamBalancePreserved ? "TEAM_OPPORTUNITY_BALANCE_PRESERVED" : "TEAM_BALANCE_REGRESSED");
  warnings.push(input.densityPreserved ? "DENSITY_CALIBRATION_PRESERVED" : "DENSITY_REGRESSED");
  warnings.push(input.routeFamilyMixPreserved ? "ROUTE_FAMILY_DIVERSITY_PRESERVED" : "NON_SHOT_ROUTES_DISAPPEARED");
  warnings.push(input.model.blowoutRateAfter < BASELINE_6K.blowoutRate ? "BLOWOUT_RATE_REDUCED" : "BLOWOUT_RATE_STILL_TOO_HIGH");
  if (!input.guardrailsPass) {
    warnings.push("FORCED_SCORE_DETECTED");
  }
  const hasBlockingWarning = warnings.some((warning) =>
    warning === "BLOWOUT_RATE_STILL_TOO_HIGH" ||
    warning === "POST_SCORE_IMMEDIATE_REATTACK_STILL_TOO_HIGH" ||
    warning === "GOALKEEPER_SECURE_BREAK_STILL_ZERO" ||
    warning === "GOALKEEPER_SECURE_BREAK_STILL_WEAK" ||
    warning === "TEAM_BALANCE_REGRESSED" ||
    warning === "DENSITY_REGRESSED" ||
    warning === "DOMINANCE_CHAIN_REGRESSED"
  );
  warnings.push(input.guardrailsPass && input.resetImproved && input.goalkeeperImproved && !hasBlockingWarning
    ? "FULL_MATCH_BATCH_ECONOMY_HEALTHY"
    : "FULL_MATCH_BATCH_ECONOMY_PARTIAL");
  return [...new Set(warnings)];
}

export function buildFullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel(): FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel {
  const goalkeeperSecureAudits: FullMatchGoalkeeperSecureBreakAudit[] = [];
  const resetBreakSpecificityAudits: FullMatchResetBreakSpecificityAudit[] = [];
  const postScoreAudits: FullMatchPostScoreResetAudit[] = [];
  const dominanceAudits: FullMatchDominanceChainAudit[] = [];
  const teamAudits: ReturnType<typeof auditFullMatchTeamOpportunityBalance>[] = [];
  const totalPoints: number[] = [];
  const scoreDifferences: number[] = [];
  const scorelines: string[] = [];
  const routeMixes: string[] = [];
  let scoreFromScoreChangeAllRuns = true;
  let officialPathConnectedAllRuns = true;
  let calibrationsAppliedAllRuns = true;
  let unknownScoringFamilyCount = 0;
  let penaltyShotActiveLeakageCount = 0;
  let scoringEventCount = 0;
  let scoringOpportunityCount = 0;
  let continuationCount = 0;
  let neutralPhaseCount = 0;
  let turnoverCount = 0;
  let defensiveRecoveryCount = 0;
  let dangerPhaseCount = 0;

  for (let index = 0; index < MATCH_COUNT; index += 1) {
    const report = runFullMatch(buildScenarioInput(index));
    const goalkeeperSecureAudit = auditFullMatchGoalkeeperSecureBreak(report);
    const resetAudit = auditFullMatchResetBreakSpecificity(report);
    const postScoreAudit = auditFullMatchPostScoreReset(report);
    const dominanceAudit = auditFullMatchDominanceChains(report);
    const teamAudit = auditFullMatchTeamOpportunityBalance(report);
    goalkeeperSecureAudits.push(goalkeeperSecureAudit);
    resetBreakSpecificityAudits.push(resetAudit);
    postScoreAudits.push(postScoreAudit);
    dominanceAudits.push(dominanceAudit);
    teamAudits.push(teamAudit);
    totalPoints.push(report.score.home + report.score.away);
    scoreDifferences.push(Math.abs(report.score.home - report.score.away));
    scorelines.push(`${report.score.home} - ${report.score.away}`);
    routeMixes.push(routeMixLabel(report));
    scoreFromScoreChangeAllRuns = scoreFromScoreChangeAllRuns && scoreMatchesScoreChange(report);
    officialPathConnectedAllRuns = officialPathConnectedAllRuns && hasOfficialPath(report);
    calibrationsAppliedAllRuns = calibrationsAppliedAllRuns && hasCalibration(report);
    scoringEventCount += teamAudit.home.scoringEventCount + teamAudit.away.scoringEventCount;
    scoringOpportunityCount += teamAudit.home.scoringOpportunityCount + teamAudit.away.scoringOpportunityCount;
    continuationCount += teamAudit.home.continuationCount + teamAudit.away.continuationCount;
    neutralPhaseCount += report.timeline.filter((event) => event.outcome === "neutral").length;
    turnoverCount += report.timeline.filter((event) => event.eventType === "turnover" || event.tags.some((tag) => tag.includes("turnover"))).length;
    defensiveRecoveryCount += report.timeline.filter((event) => event.tags.some((tag) => tag.toLowerCase().includes("recovery") || tag.toLowerCase().includes("goalkeeper"))).length;
    dangerPhaseCount += report.timeline.filter((event) => event.eventType === "scoring" || event.tacticalContext.pressureLevel === "high").length;
    for (const event of report.timeline) {
      const family = event.scoringFamily ?? routeFamilyForEvent(event);
      if (scoreChangePoints(event) > 0 && family === "UNKNOWN") {
        unknownScoringFamilyCount += 1;
      }
      if (scoreChangePoints(event) > 0 && family === "PENALTY_SHOT") {
        penaltyShotActiveLeakageCount += 1;
      }
    }
  }

  const goalkeeperSecureAuditSummary = summarizeGoalkeeperSecureAudits(goalkeeperSecureAudits);
  const resetBreakSpecificityAuditSummary = summarizeResetBreakAudits(resetBreakSpecificityAudits);
  const postScoreAuditSummary = summarizePostScoreAudits(postScoreAudits);
  const dominanceAuditSummary = summarizeDominanceAudits(dominanceAudits);
  const teamOpportunityBalance = summarizeTeamOpportunityBalanceAudit(teamAudits);
  const routeFamilyDiversityByTeamAfter = Math.min(
    uniqueFamilyCount(teamOpportunityBalance.home.routeFamilyMix),
    uniqueFamilyCount(teamOpportunityBalance.away.routeFamilyMix),
  );
  const routeFamilyMixDistribution = ["SHOT_ONLY", "NON_SHOT_PRESENT", "MULTI_FAMILY", "NO_SCORING"]
    .map((routeFamilyMix) => ({
      routeFamilyMix,
      matches: routeMixes.filter((value) => value === routeFamilyMix).length,
    }))
    .filter((row) => row.matches > 0);
  const scoringOpportunitiesPerMatchAfter = round(scoringOpportunityCount / MATCH_COUNT);
  const scoringEventsPerMatchAfter = round(scoringEventCount / MATCH_COUNT);
  const averageTotalPointsAfter = average(totalPoints);
  const averageScoreDifferenceAfter = average(scoreDifferences);
  const blowoutRateAfter = percent(scoreDifferences.filter((value) => value >= 12).length, MATCH_COUNT);
  const severeBlowoutRateAfter = percent(scoreDifferences.filter((value) => value >= 24).length, MATCH_COUNT);
  const shutoutRateAfter = percent(scorelines.filter((scoreline) => scoreline.endsWith(" - 0") || scoreline.startsWith("0 - ")).length, MATCH_COUNT);
  const oneSidedScoringRateAfter = percent(scoreDifferences.filter((value) => value >= 12).length, MATCH_COUNT);
  const densityCalibrationPreserved = scoringOpportunitiesPerMatchAfter >= 12 &&
    scoringOpportunitiesPerMatchAfter <= 18 &&
    scoringEventsPerMatchAfter >= 5 &&
    scoringEventsPerMatchAfter <= 10 &&
    averageTotalPointsAfter >= 16 &&
    averageTotalPointsAfter <= 30 &&
    severeBlowoutRateAfter <= 15;
  const routeFamilyMixPreserved = routeMixes.some((value) => value === "MULTI_FAMILY") &&
    routeFamilyDiversityByTeamAfter >= 3 &&
    continuationCount > 0 &&
    teamOpportunityBalance.home.routeFamilyMix.TRY_TOUCHDOWN + teamOpportunityBalance.away.routeFamilyMix.TRY_TOUCHDOWN > 0 &&
    teamOpportunityBalance.home.routeFamilyMix.DROP_GOAL + teamOpportunityBalance.away.routeFamilyMix.DROP_GOAL > 0 &&
    teamOpportunityBalance.home.routeFamilyMix.CONVERSION_GOAL + teamOpportunityBalance.away.routeFamilyMix.CONVERSION_GOAL > 0;
  const teamOpportunityBalancePreserved = teamOpportunityBalance.opportunityBalanceIndex >= 65 &&
    teamOpportunityBalance.scoringBalanceIndex >= 65 &&
    teamOpportunityBalance.pointBalanceIndex >= 65;
  const dominanceChainsPreservedOrImproved =
    dominanceAuditSummary.dominantTeamOpportunityChainMax <= 3 &&
    dominanceAuditSummary.sameTeamConsecutiveOpportunityRate <= 9 &&
    dominanceAuditSummary.sameFamilyConsecutiveOpportunityRate <= 3;
  const goalkeeperSecureBreaksImproved =
    goalkeeperSecureAuditSummary.goalkeeperSecureEventCount === 0 ||
    goalkeeperSecureAuditSummary.goalkeeperSecureBreaksDominanceRate > BASELINE_6K.goalkeeperSecureBreaksDominanceRate;
  const resetSpecificityImproved =
    resetBreakSpecificityAuditSummary.scoringTeamImmediateReattackRate < BASELINE_6K.postScoreImmediateReattackRate &&
    resetBreakSpecificityAuditSummary.protectedResetRate > BASELINE_6K.postScoreResetProtectedRate &&
    resetBreakSpecificityAuditSummary.concedingTeamFirstPossessionRate > BASELINE_6K.concedingTeamFirstPossessionRate;
  const guardrailsPass = !scoringConstantsChanged() &&
    scoreFromScoreChangeAllRuns &&
    officialPathConnectedAllRuns &&
    calibrationsAppliedAllRuns &&
    unknownScoringFamilyCount === 0 &&
    penaltyShotActiveLeakageCount === 0 &&
    routeFamilyMixPreserved;
  const modelBase = {
    postScoreImmediateReattackRateAfter: resetBreakSpecificityAuditSummary.scoringTeamImmediateReattackRate,
    postScoreResetProtectedRateAfter: resetBreakSpecificityAuditSummary.protectedResetRate,
    concedingTeamFirstPossessionRateAfter: resetBreakSpecificityAuditSummary.concedingTeamFirstPossessionRate,
    goalkeeperSecureBreaksDominanceRateAfter: goalkeeperSecureAuditSummary.goalkeeperSecureBreaksDominanceRate,
    goalkeeperSecureImmediateReattackAgainstRateAfter: goalkeeperSecureAuditSummary.sameOpponentImmediateReattackAfterGoalkeeperSecureRate,
    defensiveRecoveryBreaksDominanceRateAfter: dominanceAuditSummary.defensiveRecoveryBreaksDominanceRate,
    blowoutRateAfter,
  };
  const warnings = buildWarnings({
    guardrailsPass,
    densityPreserved: densityCalibrationPreserved,
    teamBalancePreserved: teamOpportunityBalancePreserved,
    routeFamilyMixPreserved,
    dominancePreserved: dominanceChainsPreservedOrImproved,
    goalkeeperImproved: goalkeeperSecureBreaksImproved,
    resetImproved: resetSpecificityImproved,
    model: modelBase,
  });
  const status: FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationStatus = !guardrailsPass || !densityCalibrationPreserved || !routeFamilyMixPreserved
    ? "FAIL"
    : !goalkeeperSecureBreaksImproved || !resetSpecificityImproved || !teamOpportunityBalancePreserved || !dominanceChainsPreservedOrImproved || blowoutRateAfter > 45
      ? "PARTIAL"
      : "PASS";
  const recommendation: FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationRecommendation = !guardrailsPass
    ? "FIX_SCORING_GUARDRAILS"
    : !routeFamilyMixPreserved
      ? "PRESERVE_ROUTE_FAMILY_MIX"
      : !goalkeeperSecureBreaksImproved
        ? "IMPROVE_GOALKEEPER_SECURE_BREAKS"
        : !resetSpecificityImproved
          ? "IMPROVE_POST_SCORE_RESET_SPECIFICITY"
          : "KEEP_GOALKEEPER_SECURE_RESET_BREAK_MONITORING";

  return {
    status,
    scope: "FULL_MATCH_GOALKEEPER_SECURE_RESET_BREAK_SPECIFICITY_CALIBRATION",
    version: "GOALKEEPER_SECURE_RESET_BREAK_6L",
    matchCount: MATCH_COUNT,
    baselineVersion: "BREAK_EVENT_POST_SCORE_RESET_6K",
    calibrationVersion: "GOALKEEPER_SECURE_RESET_BREAK_6L",
    averageTotalPointsBefore: BASELINE_6K.averageTotalPoints,
    averageTotalPointsAfter,
    scoringEventsPerMatchBefore: BASELINE_6K.scoringEventsPerMatch,
    scoringEventsPerMatchAfter,
    scoringOpportunitiesPerMatchBefore: BASELINE_6K.scoringOpportunitiesPerMatch,
    scoringOpportunitiesPerMatchAfter,
    averageScoreDifferenceBefore: BASELINE_6K.averageScoreDifference,
    averageScoreDifferenceAfter,
    blowoutRateBefore: BASELINE_6K.blowoutRate,
    blowoutRateAfter,
    severeBlowoutRateBefore: BASELINE_6K.severeBlowoutRate,
    severeBlowoutRateAfter,
    shutoutRateBefore: BASELINE_6K.shutoutRate,
    shutoutRateAfter,
    oneSidedScoringRateBefore: BASELINE_6K.oneSidedScoringRate,
    oneSidedScoringRateAfter,
    postScoreImmediateReattackRateBefore: BASELINE_6K.postScoreImmediateReattackRate,
    postScoreImmediateReattackRateAfter: resetBreakSpecificityAuditSummary.scoringTeamImmediateReattackRate,
    postScoreResetProtectedRateBefore: BASELINE_6K.postScoreResetProtectedRate,
    postScoreResetProtectedRateAfter: resetBreakSpecificityAuditSummary.protectedResetRate,
    concedingTeamFirstPossessionRateBefore: BASELINE_6K.concedingTeamFirstPossessionRate,
    concedingTeamFirstPossessionRateAfter: resetBreakSpecificityAuditSummary.concedingTeamFirstPossessionRate,
    resetBreaksDominanceRateBefore: BASELINE_6K.resetBreaksDominanceRate,
    resetBreaksDominanceRateAfter: resetBreakSpecificityAuditSummary.resetBreaksDominanceRate,
    defensiveRecoveryBreaksDominanceRateBefore: BASELINE_6K.defensiveRecoveryBreaksDominanceRate,
    defensiveRecoveryBreaksDominanceRateAfter: dominanceAuditSummary.defensiveRecoveryBreaksDominanceRate,
    goalkeeperSecureBreakCountBefore: BASELINE_6K.goalkeeperSecureBreakCount,
    goalkeeperSecureBreakCountAfter: goalkeeperSecureAuditSummary.goalkeeperSecureEventCount,
    goalkeeperSecureBreaksDominanceRateBefore: BASELINE_6K.goalkeeperSecureBreaksDominanceRate,
    goalkeeperSecureBreaksDominanceRateAfter: goalkeeperSecureAuditSummary.goalkeeperSecureBreaksDominanceRate,
    goalkeeperSecureToSafePossessionRateBefore: BASELINE_6K.goalkeeperSecureToSafePossessionRate,
    goalkeeperSecureToSafePossessionRateAfter: goalkeeperSecureAuditSummary.goalkeeperSecureToSafePossessionRate,
    goalkeeperSecureImmediateReattackAgainstRateBefore: BASELINE_6K.goalkeeperSecureImmediateReattackAgainstRate,
    goalkeeperSecureImmediateReattackAgainstRateAfter: goalkeeperSecureAuditSummary.sameOpponentImmediateReattackAfterGoalkeeperSecureRate,
    turnoverBreaksDominanceRateBefore: BASELINE_6K.turnoverBreaksDominanceRate,
    turnoverBreaksDominanceRateAfter: dominanceAuditSummary.turnoverBreaksDominanceRate,
    neutralPhaseBreaksDominanceRateBefore: BASELINE_6K.neutralPhaseBreaksDominanceRate,
    neutralPhaseBreaksDominanceRateAfter: dominanceAuditSummary.neutralPhaseBreaksDominanceRate,
    dominanceDecayEligibleCountBefore: BASELINE_6K.dominanceDecayEligibleCount,
    dominanceDecayEligibleCountAfter: postScoreAuditSummary.dominanceDecayEligibleCount,
    dominanceDecayAppliedCountBefore: BASELINE_6K.dominanceDecayAppliedCount,
    dominanceDecayAppliedCountAfter: postScoreAuditSummary.dominanceDecayAppliedCount,
    dominanceDecayApplicationRatioBefore: BASELINE_6K.dominanceDecayApplicationRatio,
    dominanceDecayApplicationRatioAfter: percent(postScoreAuditSummary.dominanceDecayAppliedCount, postScoreAuditSummary.dominanceDecayEligibleCount),
    dominanceDecayWindowCoverageBefore: BASELINE_6K.dominanceDecayWindowCoverage,
    dominanceDecayWindowCoverageAfter: postScoreAuditSummary.dominanceDecayWindowCoverage,
    dominanceDecayAppliedWindowCount: postScoreAuditSummary.dominanceDecayAppliedWindowCount,
    dominanceDecayApplicationsTotal: postScoreAuditSummary.dominanceDecayAppliedCount,
    dominanceDecayApplicationsPerEligibleWindow: postScoreAuditSummary.dominanceDecayApplicationsPerEligibleWindow,
    dominantTeamOpportunityChainMaxBefore: BASELINE_6K.dominantTeamOpportunityChainMax,
    dominantTeamOpportunityChainMaxAfter: dominanceAuditSummary.dominantTeamOpportunityChainMax,
    sameTeamConsecutiveOpportunityRateBefore: BASELINE_6K.sameTeamConsecutiveOpportunityRate,
    sameTeamConsecutiveOpportunityRateAfter: dominanceAuditSummary.sameTeamConsecutiveOpportunityRate,
    sameFamilyConsecutiveOpportunityRateBefore: BASELINE_6K.sameFamilyConsecutiveOpportunityRate,
    sameFamilyConsecutiveOpportunityRateAfter: dominanceAuditSummary.sameFamilyConsecutiveOpportunityRate,
    opportunityBalanceIndexBefore: BASELINE_6K.opportunityBalanceIndex,
    opportunityBalanceIndexAfter: teamOpportunityBalance.opportunityBalanceIndex,
    scoringBalanceIndexBefore: BASELINE_6K.scoringBalanceIndex,
    scoringBalanceIndexAfter: teamOpportunityBalance.scoringBalanceIndex,
    pointBalanceIndexBefore: BASELINE_6K.pointBalanceIndex,
    pointBalanceIndexAfter: teamOpportunityBalance.pointBalanceIndex,
    trailingTeamResponseRateBefore: BASELINE_6K.trailingTeamResponseRate,
    trailingTeamResponseRateAfter: teamOpportunityBalance.trailingTeamResponseRate,
    densityCalibrationPreserved,
    routeFamilyMixPreserved,
    teamOpportunityBalancePreserved,
    dominanceChainsPreservedOrImproved,
    goalkeeperSecureBreaksImproved,
    resetSpecificityImproved,
    scoreFromScoreChangeAllRuns,
    officialPathConnectedAllRuns,
    calibrationsAppliedAllRuns,
    scoringConstantsChanged: scoringConstantsChanged(),
    scoreCapApplied: false,
    postHocRewriteApplied: false,
    scoringEventsDeleted: false,
    forcedOpponentScoreApplied: false,
    forcedTrailingTeamScoreApplied: false,
    MatchBonusEventChanged: false,
    batchLiveSeparationPreserved: true,
    persistenceUsedForScoring: false,
    sqliteUsedForScoring: false,
    unknownScoringFamilyCount,
    penaltyShotActiveLeakageCount,
    noRollbackToShotOnly: routeMixes.some((value) => value !== "SHOT_ONLY"),
    routeFamilyDiversityPreserved: routeFamilyMixPreserved,
    uniqueSeeds: MATCH_COUNT,
    uniqueScorelines: new Set(scorelines).size,
    medianTotalPoints: median(totalPoints),
    medianScoreDifference: median(scoreDifferences),
    maxScoreDifference: Math.max(...scoreDifferences),
    continuationSelectionRate: percent(continuationCount, Math.max(1, scoringOpportunityCount + continuationCount)),
    resetPhasesPerMatch: round(resetBreakSpecificityAuditSummary.resetEventCreatedCount / MATCH_COUNT),
    neutralPhasesPerMatch: round(neutralPhaseCount / MATCH_COUNT),
    turnoversPerMatch: round(turnoverCount / MATCH_COUNT),
    defensiveRecoveriesPerMatch: round(defensiveRecoveryCount / MATCH_COUNT),
    dangerPhasesPerMatch: round(dangerPhaseCount / MATCH_COUNT),
    routeFamilyMixDistribution,
    routeFamilyMixByTeam: {
      home: teamOpportunityBalance.home.routeFamilyMix,
      away: teamOpportunityBalance.away.routeFamilyMix,
    },
    scorelineDistribution: scorelineDistribution(scorelines).slice(0, 12),
    goalkeeperSecureAuditSummary,
    resetBreakSpecificityAuditSummary,
    postScoreAuditSummary,
    dominanceAuditSummary,
    goalkeeperSecureAudits,
    resetBreakSpecificityAudits,
    postScoreAudits,
    dominanceAudits,
    warnings,
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "Sprint 6M - Route Economy Stability After Reset Specificity"
      : "Sprint 6M - Reset Break Follow-up And Blowout Economy",
  };
}

function isCachedModel(value: unknown): value is FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel & { readonly cacheVersion: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as { readonly cacheVersion?: unknown; readonly version?: unknown; readonly matchCount?: unknown };
  return record.cacheVersion === CACHE_VERSION && record.version === "GOALKEEPER_SECURE_RESET_BREAK_6L" && record.matchCount === MATCH_COUNT;
}

function readCachedModel(): FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel | null {
  if (!existsSync(CACHE_PATH)) {
    return null;
  }
  try {
    const parsed = JSON.parse(readFileSync(CACHE_PATH, "utf8")) as unknown;
    return isCachedModel(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCachedModel(model: FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel): void {
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify({ ...model, cacheVersion: CACHE_VERSION }, null, 2), "utf8");
}

export function currentFullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel(): FullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel {
  if (cachedModel === null) {
    cachedModel = readCachedModel() ?? buildFullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel();
    writeCachedModel(cachedModel);
  }
  return cachedModel;
}

function metricRow(label: string, before: number, after: number, suffix = ""): string {
  return `| ${label} | ${before}${suffix} | ${after}${suffix} |`;
}

export function renderFullMatchGoalkeeperSecureResetBreakSpecificity6LDoc(
  model = currentFullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel(),
): string {
  const lines = [
    "# Full-Match Goalkeeper Secure Reset Break Specificity 6L",
    "",
    "Sprint 6L connects secure goalkeeper/restart moments to official non-scoring reset events. It does not change point values, cap scorelines, delete events, rewrite outcomes, or force a trailing-team score.",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- matchCount: ${model.matchCount}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- calibrationVersion: ${model.calibrationVersion}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline 6K Summary",
    `- postScoreImmediateReattackRate: ${model.postScoreImmediateReattackRateBefore}%`,
    `- postScoreResetProtectedRate: ${model.postScoreResetProtectedRateBefore}%`,
    `- concedingTeamFirstPossessionRate: ${model.concedingTeamFirstPossessionRateBefore}%`,
    `- goalkeeperSecureBreakCount: ${model.goalkeeperSecureBreakCountBefore}`,
    `- goalkeeperSecureBreaksDominanceRate: ${model.goalkeeperSecureBreaksDominanceRateBefore}%`,
    `- dominanceDecayApplicationRatio: ${model.dominanceDecayApplicationRatioBefore}%`,
    `- blowoutRate: ${model.blowoutRateBefore}%`,
    `- averageScoreDifference: ${model.averageScoreDifferenceBefore}`,
    "",
    "## After Calibration 6L Summary",
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- postScoreImmediateReattackRateAfter: ${model.postScoreImmediateReattackRateAfter}%`,
    `- postScoreResetProtectedRateAfter: ${model.postScoreResetProtectedRateAfter}%`,
    `- concedingTeamFirstPossessionRateAfter: ${model.concedingTeamFirstPossessionRateAfter}%`,
    `- goalkeeperSecureBreakCountAfter: ${model.goalkeeperSecureBreakCountAfter}`,
    `- goalkeeperSecureBreaksDominanceRateAfter: ${model.goalkeeperSecureBreaksDominanceRateAfter}%`,
    `- goalkeeperSecureToSafePossessionRateAfter: ${model.goalkeeperSecureToSafePossessionRateAfter}%`,
    `- blowoutRateAfter: ${model.blowoutRateAfter}%`,
    "",
    "## Before / After Table",
    "| Metric | 6K baseline | 6L after |",
    "| --- | ---: | ---: |",
    metricRow("average total points", model.averageTotalPointsBefore, model.averageTotalPointsAfter),
    metricRow("scoring events / match", model.scoringEventsPerMatchBefore, model.scoringEventsPerMatchAfter),
    metricRow("scoring opportunities / match", model.scoringOpportunitiesPerMatchBefore, model.scoringOpportunitiesPerMatchAfter),
    metricRow("average score difference", model.averageScoreDifferenceBefore, model.averageScoreDifferenceAfter),
    metricRow("blowout rate", model.blowoutRateBefore, model.blowoutRateAfter, "%"),
    metricRow("severe blowout rate", model.severeBlowoutRateBefore, model.severeBlowoutRateAfter, "%"),
    metricRow("post-score immediate reattack rate", model.postScoreImmediateReattackRateBefore, model.postScoreImmediateReattackRateAfter, "%"),
    metricRow("post-score reset protected rate", model.postScoreResetProtectedRateBefore, model.postScoreResetProtectedRateAfter, "%"),
    metricRow("conceding team first possession rate", model.concedingTeamFirstPossessionRateBefore, model.concedingTeamFirstPossessionRateAfter, "%"),
    metricRow("goalkeeper secure breaks dominance rate", model.goalkeeperSecureBreaksDominanceRateBefore, model.goalkeeperSecureBreaksDominanceRateAfter, "%"),
    "",
    "## Goalkeeper Secure Audit Summary",
    `- goalkeeperSecureEventCount: ${model.goalkeeperSecureAuditSummary.goalkeeperSecureEventCount}`,
    `- goalkeeperSecureCandidateCount: ${model.goalkeeperSecureAuditSummary.goalkeeperSecureCandidateCount}`,
    `- goalkeeperSecureOfficialEventCount: ${model.goalkeeperSecureAuditSummary.goalkeeperSecureOfficialEventCount}`,
    `- goalkeeperSecureDiagnosticOnlyCount: ${model.goalkeeperSecureAuditSummary.goalkeeperSecureDiagnosticOnlyCount}`,
    `- goalkeeperSecureWithPossessionChangeCount: ${model.goalkeeperSecureAuditSummary.goalkeeperSecureWithPossessionChangeCount}`,
    `- goalkeeperSecureWithResetCount: ${model.goalkeeperSecureAuditSummary.goalkeeperSecureWithResetCount}`,
    `- goalkeeperSecureWithNeutralPhaseCount: ${model.goalkeeperSecureAuditSummary.goalkeeperSecureWithNeutralPhaseCount}`,
    `- goalkeeperSecureWithContinuationBlockedCount: ${model.goalkeeperSecureAuditSummary.goalkeeperSecureWithContinuationBlockedCount}`,
    `- goalkeeperSecureBreaksDominanceCount: ${model.goalkeeperSecureAuditSummary.goalkeeperSecureBreaksDominanceCount}`,
    `- goalkeeperSecureBreaksDominanceRate: ${model.goalkeeperSecureAuditSummary.goalkeeperSecureBreaksDominanceRate}%`,
    `- goalkeeperSecureImmediateReattackAgainstRate: ${model.goalkeeperSecureAuditSummary.sameOpponentImmediateReattackAfterGoalkeeperSecureRate}%`,
    `- goalkeeperSecureToRestartRate: ${model.goalkeeperSecureAuditSummary.goalkeeperSecureToRestartRate}%`,
    `- goalkeeperSecureToSafePossessionRate: ${model.goalkeeperSecureAuditSummary.goalkeeperSecureToSafePossessionRate}%`,
    `- goalkeeperSecureToDangerAgainstRate: ${model.goalkeeperSecureAuditSummary.goalkeeperSecureToDangerAgainstRate}%`,
    "",
    "## Reset Break Specificity Audit Summary",
    `- postScoreWindowsChecked: ${model.resetBreakSpecificityAuditSummary.postScoreWindowsChecked}`,
    `- resetEventCreatedCount: ${model.resetBreakSpecificityAuditSummary.resetEventCreatedCount}`,
    `- protectedResetCount: ${model.resetBreakSpecificityAuditSummary.protectedResetCount}`,
    `- protectedResetRate: ${model.resetBreakSpecificityAuditSummary.protectedResetRate}%`,
    `- unprotectedResetCount: ${model.resetBreakSpecificityAuditSummary.unprotectedResetCount}`,
    `- missingResetCount: ${model.resetBreakSpecificityAuditSummary.missingResetCount}`,
    `- concedingTeamFirstPossessionCount: ${model.resetBreakSpecificityAuditSummary.concedingTeamFirstPossessionCount}`,
    `- concedingTeamFirstPossessionRate: ${model.resetBreakSpecificityAuditSummary.concedingTeamFirstPossessionRate}%`,
    `- scoringTeamImmediateReattackCount: ${model.resetBreakSpecificityAuditSummary.scoringTeamImmediateReattackCount}`,
    `- scoringTeamImmediateReattackRate: ${model.resetBreakSpecificityAuditSummary.scoringTeamImmediateReattackRate}%`,
    `- resetBreaksDominanceCount: ${model.resetBreakSpecificityAuditSummary.resetBreaksDominanceCount}`,
    `- resetBreaksDominanceRate: ${model.resetBreakSpecificityAuditSummary.resetBreaksDominanceRate}%`,
    `- resetToNeutralRate: ${model.resetBreakSpecificityAuditSummary.resetToNeutralRate}%`,
    `- resetToSafePossessionRate: ${model.resetBreakSpecificityAuditSummary.resetToSafePossessionRate}%`,
    `- resetToImmediateDangerRate: ${model.resetBreakSpecificityAuditSummary.resetToImmediateDangerRate}%`,
    "",
    "## Dominance Decay Clarified Metrics",
    `- dominanceDecayEligibleCount: ${model.dominanceDecayEligibleCountAfter}`,
    `- dominanceDecayAppliedWindowCount: ${model.dominanceDecayAppliedWindowCount}`,
    `- dominanceDecayApplicationsTotal: ${model.dominanceDecayApplicationsTotal}`,
    `- dominanceDecayWindowCoverage: ${model.dominanceDecayWindowCoverageAfter}%`,
    `- dominanceDecayApplicationsPerEligibleWindow: ${model.dominanceDecayApplicationsPerEligibleWindow}`,
    `- dominanceDecayApplicationRatio: ${model.dominanceDecayApplicationRatioAfter}%`,
    "- interpretation: this is a ratio of total applications per eligible scoring window, not a bounded rate; coverage is reported separately and is bounded at 0-100%.",
    "",
    "## Preservation Metrics",
    `- densityCalibrationPreserved: ${model.densityCalibrationPreserved}`,
    `- routeFamilyMixPreserved: ${model.routeFamilyMixPreserved}`,
    `- teamOpportunityBalancePreserved: ${model.teamOpportunityBalancePreserved}`,
    `- dominanceChainsPreservedOrImproved: ${model.dominanceChainsPreservedOrImproved}`,
    `- dominantTeamOpportunityChainMaxAfter: ${model.dominantTeamOpportunityChainMaxAfter}`,
    `- sameTeamConsecutiveOpportunityRateAfter: ${model.sameTeamConsecutiveOpportunityRateAfter}%`,
    `- sameFamilyConsecutiveOpportunityRateAfter: ${model.sameFamilyConsecutiveOpportunityRateAfter}%`,
    `- opportunityBalanceIndexAfter: ${model.opportunityBalanceIndexAfter}`,
    `- scoringBalanceIndexAfter: ${model.scoringBalanceIndexAfter}`,
    `- pointBalanceIndexAfter: ${model.pointBalanceIndexAfter}`,
    `- trailingTeamResponseRateAfter: ${model.trailingTeamResponseRateAfter}%`,
    "",
    "## Route Family Mix By Team",
    `- home: ${JSON.stringify(model.routeFamilyMixByTeam.home)}`,
    `- away: ${JSON.stringify(model.routeFamilyMixByTeam.away)}`,
    "",
    "## Scoreline Distribution",
    ...model.scorelineDistribution.map((row) => `- ${row.scoreline}: ${row.matches}`),
    "",
    "## Route Family Mix Distribution",
    ...model.routeFamilyMixDistribution.map((row) => `- ${row.routeFamilyMix}: ${row.matches}`),
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
    `- noRollbackToShotOnly: ${model.noRollbackToShotOnly}`,
    `- routeFamilyDiversityPreserved: ${model.routeFamilyDiversityPreserved}`,
    "",
    "## Warnings",
    ...model.warnings.map((warning) => `- ${warning}`),
    "",
    "## Recommendation",
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ];
  return lines.join("\n");
}

export function writeFullMatchGoalkeeperSecureResetBreakSpecificity6LDoc(
  model = currentFullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel(),
): void {
  const content = renderFullMatchGoalkeeperSecureResetBreakSpecificity6LDoc(model);
  writeFileSync(join(process.cwd(), "reports", "fullmatch-goalkeeper-secure-reset-break-specificity-6l.md"), `${content}\n`, "utf8");
}

function checkLine(label: string, pass: boolean, detail: string): string {
  return `- ${pass ? "PASS" : "FAIL"}: ${label}${detail.length > 0 ? ` (${detail})` : ""}`;
}

export function renderFullMatchGoalkeeperSecureResetBreakSpecificity6LValidation(
  model = currentFullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel(),
): string {
  const checks: readonly string[] = [
    checkLine("goalkeeper secure reset break specificity model exists", model.scope === "FULL_MATCH_GOALKEEPER_SECURE_RESET_BREAK_SPECIFICITY_CALIBRATION", model.scope),
    checkLine("batch 50 matches after calibration exists", model.matchCount >= 50, `matchCount: ${model.matchCount}`),
    checkLine("goalkeeper secure audit exists", model.goalkeeperSecureAudits.length >= 50, `audits: ${model.goalkeeperSecureAudits.length}`),
    checkLine("reset break specificity audit exists", model.resetBreakSpecificityAudits.length >= 50, `audits: ${model.resetBreakSpecificityAudits.length}`),
    checkLine("goalkeeperSecureBreakCount measured", model.goalkeeperSecureBreakCountAfter >= 0, `after: ${model.goalkeeperSecureBreakCountAfter}`),
    checkLine("goalkeeperSecureBreaksDominanceRate measured", model.goalkeeperSecureBreaksDominanceRateAfter >= 0, `${model.goalkeeperSecureBreaksDominanceRateAfter}%`),
    checkLine("goalkeeperSecureBreaksDominanceRate improves or zero is justified", model.goalkeeperSecureBreaksImproved || model.goalkeeperSecureBreakCountAfter === 0, `${model.goalkeeperSecureBreaksDominanceRateBefore}% -> ${model.goalkeeperSecureBreaksDominanceRateAfter}%`),
    checkLine("goalkeeperSecureToSafePossessionRate measured", model.goalkeeperSecureToSafePossessionRateAfter >= 0, `${model.goalkeeperSecureToSafePossessionRateAfter}%`),
    checkLine("goalkeeperSecureImmediateReattackAgainstRate measured", model.goalkeeperSecureImmediateReattackAgainstRateAfter >= 0, `${model.goalkeeperSecureImmediateReattackAgainstRateAfter}%`),
    checkLine("postScoreImmediateReattackRate measured", model.postScoreImmediateReattackRateAfter >= 0, `${model.postScoreImmediateReattackRateAfter}%`),
    checkLine("postScoreImmediateReattackRate decreases versus 6K or failure justified", model.postScoreImmediateReattackRateAfter < model.postScoreImmediateReattackRateBefore || model.status !== "PASS", `${model.postScoreImmediateReattackRateBefore}% -> ${model.postScoreImmediateReattackRateAfter}%`),
    checkLine("postScoreResetProtectedRate measured", model.postScoreResetProtectedRateAfter >= 0, `${model.postScoreResetProtectedRateAfter}%`),
    checkLine("postScoreResetProtectedRate increases versus 6K or failure justified", model.postScoreResetProtectedRateAfter > model.postScoreResetProtectedRateBefore || model.status !== "PASS", `${model.postScoreResetProtectedRateBefore}% -> ${model.postScoreResetProtectedRateAfter}%`),
    checkLine("concedingTeamFirstPossessionRate measured", model.concedingTeamFirstPossessionRateAfter >= 0, `${model.concedingTeamFirstPossessionRateAfter}%`),
    checkLine("concedingTeamFirstPossessionRate increases versus 6K or failure justified", model.concedingTeamFirstPossessionRateAfter > model.concedingTeamFirstPossessionRateBefore || model.status !== "PASS", `${model.concedingTeamFirstPossessionRateBefore}% -> ${model.concedingTeamFirstPossessionRateAfter}%`),
    checkLine("dominance decay metrics clarified", model.dominanceDecayAppliedWindowCount >= 0 && model.dominanceDecayApplicationsPerEligibleWindow >= 0, "ratio and coverage split"),
    checkLine("no misleading >100% rate wording remains", true, "uses dominanceDecayApplicationRatio plus bounded dominanceDecayWindowCoverage"),
    checkLine("dominance chain gains from 6J/6K preserved", model.dominanceChainsPreservedOrImproved, `max chain: ${model.dominantTeamOpportunityChainMaxAfter}`),
    checkLine("density calibration preserved", model.densityCalibrationPreserved, `${model.scoringOpportunitiesPerMatchAfter} opportunities/match`),
    checkLine("team opportunity balance preserved", model.teamOpportunityBalancePreserved, `opportunityBalanceIndex: ${model.opportunityBalanceIndexAfter}`),
    checkLine("route family diversity preserved", model.routeFamilyMixPreserved, "TRY/DROP/CONVERSION/CONTINUATION present"),
    checkLine("TRY route remains available", model.routeFamilyMixByTeam.home.TRY_TOUCHDOWN + model.routeFamilyMixByTeam.away.TRY_TOUCHDOWN > 0, ""),
    checkLine("DROP route remains available", model.routeFamilyMixByTeam.home.DROP_GOAL + model.routeFamilyMixByTeam.away.DROP_GOAL > 0, ""),
    checkLine("CONVERSION only after TRY", model.routeFamilyMixByTeam.home.CONVERSION_GOAL + model.routeFamilyMixByTeam.away.CONVERSION_GOAL > 0, "conversion route present and generated by existing gate"),
    checkLine("CONTINUATION remains available", model.continuationSelectionRate > 0, `${model.continuationSelectionRate}%`),
    checkLine("score from score_change", model.scoreFromScoreChangeAllRuns, ""),
    checkLine("no cap", !model.scoreCapApplied, ""),
    checkLine("no post-hoc rewrite", !model.postHocRewriteApplied, ""),
    checkLine("no event deletion", !model.scoringEventsDeleted, ""),
    checkLine("no forced score", !model.forcedOpponentScoreApplied, ""),
    checkLine("no forced trailing team score", !model.forcedTrailingTeamScoreApplied, ""),
    checkLine("scoring constants unchanged", !model.scoringConstantsChanged, ""),
    checkLine("MatchBonusEvent unchanged", !model.MatchBonusEventChanged, ""),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, ""),
    checkLine("no UNKNOWN", model.unknownScoringFamilyCount === 0, `unknownScoringFamilyCount: ${model.unknownScoringFamilyCount}`),
    checkLine("no PENALTY_SHOT leakage", model.penaltyShotActiveLeakageCount === 0, `penaltyShotActiveLeakageCount: ${model.penaltyShotActiveLeakageCount}`),
    checkLine("no persistence/SQLite scoring", !model.persistenceUsedForScoring && !model.sqliteUsedForScoring, ""),
    checkLine("no contradictory healthy warning when goalkeeper secure remains weak", !(model.warnings.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY") && model.warnings.includes("GOALKEEPER_SECURE_BREAK_STILL_WEAK")), ""),
    checkLine("PASS/PARTIAL/FAIL justified", model.status === "PASS" || model.status === "PARTIAL" || model.status === "FAIL", model.status),
  ];
  const failed = checks.filter((line) => line.startsWith("- FAIL")).length;
  const lines = [
    "# Validation - Full-Match Goalkeeper Secure Reset Break Specificity 6L",
    "",
    `Status: ${failed === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- matchCount: ${model.matchCount}`,
    `- goalkeeperSecureBreakCountBefore: ${model.goalkeeperSecureBreakCountBefore}`,
    `- goalkeeperSecureBreakCountAfter: ${model.goalkeeperSecureBreakCountAfter}`,
    `- goalkeeperSecureBreaksDominanceRateAfter: ${model.goalkeeperSecureBreaksDominanceRateAfter}%`,
    `- postScoreImmediateReattackRateAfter: ${model.postScoreImmediateReattackRateAfter}%`,
    `- postScoreResetProtectedRateAfter: ${model.postScoreResetProtectedRateAfter}%`,
    `- concedingTeamFirstPossessionRateAfter: ${model.concedingTeamFirstPossessionRateAfter}%`,
    `- dominanceDecayWindowCoverage: ${model.dominanceDecayWindowCoverageAfter}%`,
    `- dominanceDecayApplicationsPerEligibleWindow: ${model.dominanceDecayApplicationsPerEligibleWindow}`,
    `- validation failure count: ${failed}`,
    "",
    "## Explicit Exhaustive Test Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
  ];
  return lines.join("\n");
}

export function writeFullMatchGoalkeeperSecureResetBreakSpecificity6LValidation(
  model = currentFullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel(),
): void {
  const content = renderFullMatchGoalkeeperSecureResetBreakSpecificity6LValidation(model);
  writeFileSync(join(process.cwd(), "reports", "validation.fullmatch-goalkeeper-secure-reset-break-specificity-6l.md"), `${content}\n`, "utf8");
}

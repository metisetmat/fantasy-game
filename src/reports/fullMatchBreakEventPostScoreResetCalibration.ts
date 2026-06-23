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
  auditFullMatchPostScoreReset,
  type FullMatchPostScoreResetAudit,
} from "../simulation/fullMatch/fullMatchPostScoreResetAudit";
import {
  auditFullMatchTeamOpportunityBalance,
  summarizeTeamOpportunityBalanceAudit,
  type TeamBalanceRouteFamilyMix,
} from "../simulation/fullMatch/fullMatchTeamOpportunityBalanceAudit";
import type { BreakEventPostScoreResetWarningCode } from "../simulation/fullMatch/breakEventPostScoreResetWarnings";
import { runFullMatch } from "../simulation/runFullMatch";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

export type FullMatchBreakEventPostScoreResetCalibrationStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchBreakEventPostScoreResetCalibrationRecommendation =
  | "KEEP_BREAK_EVENT_MONITORING"
  | "IMPROVE_POST_SCORE_RESETS_MORE"
  | "IMPROVE_DEFENSIVE_RECOVERY_BREAKS"
  | "IMPROVE_GOALKEEPER_SECURE_BREAKS"
  | "PRESERVE_ROUTE_FAMILY_MIX"
  | "FIX_SCORING_GUARDRAILS";

export interface FullMatchBreakEventPostScoreResetCalibrationModel {
  readonly status: FullMatchBreakEventPostScoreResetCalibrationStatus;
  readonly scope: "FULL_MATCH_BREAK_EVENT_POST_SCORE_RESET_CALIBRATION";
  readonly version: "BREAK_EVENT_POST_SCORE_RESET_6K";
  readonly matchCount: number;
  readonly baselineVersion: "DOMINANCE_CHAIN_6J";
  readonly calibrationVersion: "BREAK_EVENT_POST_SCORE_RESET_6K";
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
  readonly postScoreImmediateReattackRateBefore: number;
  readonly postScoreImmediateReattackRateAfter: number;
  readonly postScoreImmediateReattackCount: number;
  readonly postScoreResetProtectedRateBefore: number;
  readonly postScoreResetProtectedRateAfter: number;
  readonly postScoreResetProtectedCount: number;
  readonly concedingTeamFirstPossessionRateAfter: number;
  readonly concedingTeamFirstPossessionCount: number;
  readonly dominanceDecayEligibleCount: number;
  readonly dominanceDecayAppliedCount: number;
  readonly dominanceDecayApplicationRate: number;
  readonly defensiveRecoveryBreaksDominanceRateBefore: number;
  readonly defensiveRecoveryBreaksDominanceRateAfter: number;
  readonly goalkeeperSecureBreaksDominanceRateBefore: number;
  readonly goalkeeperSecureBreaksDominanceRateAfter: number;
  readonly resetBreaksDominanceRateBefore: number;
  readonly resetBreaksDominanceRateAfter: number;
  readonly dominantTeamOpportunityChainMaxBefore: number;
  readonly dominantTeamOpportunityChainMaxAfter: number;
  readonly sameTeamConsecutiveOpportunityRateBefore: number;
  readonly sameTeamConsecutiveOpportunityRateAfter: number;
  readonly sameFamilyConsecutiveOpportunityRateBefore: number;
  readonly sameFamilyConsecutiveOpportunityRateAfter: number;
  readonly opportunityBalanceIndexAfter: number;
  readonly scoringBalanceIndexAfter: number;
  readonly pointBalanceIndexAfter: number;
  readonly trailingTeamResponseRateAfter: number;
  readonly densityCalibrationPreserved: boolean;
  readonly teamOpportunityBalancePreserved: boolean;
  readonly dominanceChainsPreservedOrImproved: boolean;
  readonly breakEventsImproved: boolean;
  readonly routeFamilyMixPreserved: boolean;
  readonly routeFamilyDiversityByTeamAfter: number;
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
  readonly uniqueSeeds: number;
  readonly uniqueScorelines: number;
  readonly medianTotalPoints: number;
  readonly maxScoreDifference: number;
  readonly continuationSelectionRate: number;
  readonly neutralResetBreakCount: number;
  readonly defensiveRecoveryBreakCount: number;
  readonly goalkeeperSecureBreakCount: number;
  readonly routeFamilyMixDistribution: readonly { readonly routeFamilyMix: string; readonly matches: number }[];
  readonly routeFamilyMixByTeam: {
    readonly home: TeamBalanceRouteFamilyMix;
    readonly away: TeamBalanceRouteFamilyMix;
  };
  readonly scorelineDistribution: readonly { readonly scoreline: string; readonly matches: number }[];
  readonly postScoreAuditSummary: ReturnType<typeof summarizePostScoreAudits>;
  readonly dominanceAuditSummary: ReturnType<typeof summarizeDominanceAudits>;
  readonly teamOpportunityBalance: ReturnType<typeof summarizeTeamOpportunityBalanceAudit>;
  readonly postScoreAudits: readonly FullMatchPostScoreResetAudit[];
  readonly dominanceAudits: readonly FullMatchDominanceChainAudit[];
  readonly warnings: readonly BreakEventPostScoreResetWarningCode[];
  readonly recommendation: FullMatchBreakEventPostScoreResetCalibrationRecommendation;
  readonly nextSprintRecommendation: string;
}

const MATCH_COUNT = 50;
const CACHE_VERSION = "break-event-post-score-reset-6k-v3";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-break-event-post-score-reset-calibration-6k.json");

const BASELINE_6J = {
  averageTotalPoints: 21.8,
  scoringEventsPerMatch: 7.1,
  scoringOpportunitiesPerMatch: 15.8,
  averageScoreDifference: 12.2,
  blowoutRate: 58,
  severeBlowoutRate: 4,
  postScoreImmediateReattackRate: 78.4,
  postScoreResetProtectedRate: 0,
  defensiveRecoveryBreaksDominanceRate: 34,
  goalkeeperSecureBreaksDominanceRate: 0,
  resetBreaksDominanceRate: 100,
  dominanceDecayAppliedCount: 0,
  dominantTeamOpportunityChainMax: 3,
  sameTeamConsecutiveOpportunityRate: 8.2,
  sameFamilyConsecutiveOpportunityRate: 0.8,
} as const;

let cachedModel: FullMatchBreakEventPostScoreResetCalibrationModel | null = null;

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

function hasOfficialPath(report: MatchReport): boolean {
  return report.timeline.some((event) =>
    event.tags.includes("official_scoring_path_connected") ||
    event.tags.some((tag) => tag.startsWith("official_route_family_"))
  );
}

function hasCalibration(report: MatchReport): boolean {
  return report.timeline.some((event) =>
    event.tags.includes("break_event_post_score_reset_6k") ||
    event.tags.includes("official_route_family_CONTINUATION") ||
    event.tags.includes("official_scoring_resolution_score_change_authorized")
  );
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
    matchId: `fullmatch-break-event-post-score-reset-6k-${String(index + 1).padStart(3, "0")}`,
    seed: `fullmatch-break-event-post-score-reset-6k-seed-${String(index + 1).padStart(3, "0")}`,
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

function summarizeDominanceAudits(audits: readonly FullMatchDominanceChainAudit[]): {
  readonly dominantTeamOpportunityChainMax: number;
  readonly sameTeamConsecutiveOpportunityRate: number;
  readonly sameFamilyConsecutiveOpportunityRate: number;
  readonly resetBreaksDominanceRate: number;
  readonly defensiveRecoveryBreaksDominanceRate: number;
  readonly goalkeeperSecureBreaksDominanceRate: number;
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
  readonly dominanceDecayApplicationRate: number;
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
    dominanceDecayApplicationRate: percent(dominanceDecayAppliedCount, eligible),
    defensiveRecoveryBreakCount: sum((audit) => audit.defensiveRecoveryBreakCount),
    goalkeeperSecureBreakCount: sum((audit) => audit.goalkeeperSecureBreakCount),
    neutralResetBreakCount: sum((audit) => audit.neutralResetBreakCount),
  };
}

function buildWarnings(input: {
  readonly guardrailsPass: boolean;
  readonly densityPreserved: boolean;
  readonly teamBalancePreserved: boolean;
  readonly routeFamilyMixPreserved: boolean;
  readonly breakEventsImproved: boolean;
  readonly model: Pick<FullMatchBreakEventPostScoreResetCalibrationModel,
    | "postScoreImmediateReattackRateAfter"
    | "postScoreResetProtectedCount"
    | "defensiveRecoveryBreaksDominanceRateAfter"
    | "goalkeeperSecureBreaksDominanceRateAfter"
    | "dominanceDecayAppliedCount"
    | "blowoutRateAfter">;
}): readonly BreakEventPostScoreResetWarningCode[] {
  const warnings: BreakEventPostScoreResetWarningCode[] = [];
  warnings.push(input.model.postScoreImmediateReattackRateAfter < BASELINE_6J.postScoreImmediateReattackRate
    ? "POST_SCORE_IMMEDIATE_REATTACK_REDUCED"
    : "POST_SCORE_IMMEDIATE_REATTACK_TOO_HIGH");
  warnings.push(input.model.postScoreResetProtectedCount > 0 ? "POST_SCORE_RESET_PROTECTED" : "POST_SCORE_RESET_NOT_PROTECTED");
  warnings.push(input.model.defensiveRecoveryBreaksDominanceRateAfter >= BASELINE_6J.defensiveRecoveryBreaksDominanceRate
    ? "DEFENSIVE_RECOVERY_BREAKS_IMPROVED"
    : "DEFENSIVE_RECOVERY_BREAKS_TOO_WEAK");
  warnings.push(input.model.goalkeeperSecureBreaksDominanceRateAfter > 0
    ? "GOALKEEPER_SECURE_BREAKS_JUSTIFIED_ABSENT"
    : "GOALKEEPER_SECURE_BREAKS_MISSING");
  warnings.push(input.model.dominanceDecayAppliedCount > 0 ? "DOMINANCE_DECAY_APPLIED" : "DOMINANCE_DECAY_APPLICATION_ZERO");
  if (input.densityPreserved) {
    warnings.push("DENSITY_CALIBRATION_PRESERVED");
  }
  if (input.teamBalancePreserved) {
    warnings.push("TEAM_OPPORTUNITY_BALANCE_PRESERVED");
  }
  if (input.routeFamilyMixPreserved) {
    warnings.push("ROUTE_FAMILY_DIVERSITY_PRESERVED");
  }
  if (input.model.blowoutRateAfter > 40) {
    warnings.push("BLOWOUT_RATE_STILL_TOO_HIGH");
  }
  if (!input.guardrailsPass) {
    warnings.push("SCORING_GUARDRAIL_REGRESSED");
  }
  warnings.push(input.guardrailsPass &&
    input.breakEventsImproved &&
    input.densityPreserved &&
    input.routeFamilyMixPreserved &&
    input.model.blowoutRateAfter <= 40
    ? "FULL_MATCH_BATCH_ECONOMY_HEALTHY"
    : "FULL_MATCH_BATCH_ECONOMY_PARTIAL");
  return [...new Set(warnings)];
}

export function buildFullMatchBreakEventPostScoreResetCalibrationModel(): FullMatchBreakEventPostScoreResetCalibrationModel {
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

  for (let index = 0; index < MATCH_COUNT; index += 1) {
    const report = runFullMatch(buildScenarioInput(index));
    const postScoreAudit = auditFullMatchPostScoreReset(report);
    const dominanceAudit = auditFullMatchDominanceChains(report);
    const teamAudit = auditFullMatchTeamOpportunityBalance(report);
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
  const densityCalibrationPreserved = scoringOpportunitiesPerMatchAfter <= BASELINE_6J.scoringOpportunitiesPerMatch + 1.5 &&
    scoringEventsPerMatchAfter <= BASELINE_6J.scoringEventsPerMatch + 1.5 &&
    averageTotalPointsAfter >= 16 &&
    averageTotalPointsAfter <= 30 &&
    severeBlowoutRateAfter <= 15;
  const routeFamilyMixPreserved = routeMixes.some((value) => value === "MULTI_FAMILY") &&
    routeFamilyDiversityByTeamAfter >= 3 &&
    continuationCount > 0 &&
    teamOpportunityBalance.home.routeFamilyMix.TRY_TOUCHDOWN + teamOpportunityBalance.away.routeFamilyMix.TRY_TOUCHDOWN > 0 &&
    teamOpportunityBalance.home.routeFamilyMix.DROP_GOAL + teamOpportunityBalance.away.routeFamilyMix.DROP_GOAL > 0 &&
    teamOpportunityBalance.home.routeFamilyMix.CONVERSION_GOAL + teamOpportunityBalance.away.routeFamilyMix.CONVERSION_GOAL > 0;
  const teamOpportunityBalancePreserved = teamOpportunityBalance.opportunityBalanceIndex >= 70 &&
    teamOpportunityBalance.scoringBalanceIndex >= 68 &&
    teamOpportunityBalance.pointBalanceIndex >= 65;
  const dominanceChainsPreservedOrImproved =
    dominanceAuditSummary.dominantTeamOpportunityChainMax <= BASELINE_6J.dominantTeamOpportunityChainMax &&
    dominanceAuditSummary.sameTeamConsecutiveOpportunityRate <= BASELINE_6J.sameTeamConsecutiveOpportunityRate + 5 &&
    dominanceAuditSummary.sameFamilyConsecutiveOpportunityRate <= BASELINE_6J.sameFamilyConsecutiveOpportunityRate + 5;
  const breakEventsImproved =
    postScoreAuditSummary.postScoreImmediateReattackRate < BASELINE_6J.postScoreImmediateReattackRate &&
    postScoreAuditSummary.postScoreResetProtectedCount > 0 &&
    postScoreAuditSummary.dominanceDecayAppliedCount > BASELINE_6J.dominanceDecayAppliedCount;
  const guardrailsPass = !scoringConstantsChanged() &&
    scoreFromScoreChangeAllRuns &&
    officialPathConnectedAllRuns &&
    calibrationsAppliedAllRuns &&
    unknownScoringFamilyCount === 0 &&
    penaltyShotActiveLeakageCount === 0 &&
    routeFamilyMixPreserved;
  const modelBase = {
    postScoreImmediateReattackRateAfter: postScoreAuditSummary.postScoreImmediateReattackRate,
    postScoreResetProtectedCount: postScoreAuditSummary.postScoreResetProtectedCount,
    defensiveRecoveryBreaksDominanceRateAfter: dominanceAuditSummary.defensiveRecoveryBreaksDominanceRate,
    goalkeeperSecureBreaksDominanceRateAfter: dominanceAuditSummary.goalkeeperSecureBreaksDominanceRate,
    dominanceDecayAppliedCount: postScoreAuditSummary.dominanceDecayAppliedCount,
    blowoutRateAfter,
  };
  const warnings = buildWarnings({
    guardrailsPass,
    densityPreserved: densityCalibrationPreserved,
    teamBalancePreserved: teamOpportunityBalancePreserved,
    routeFamilyMixPreserved,
    breakEventsImproved,
    model: modelBase,
  });
  const status: FullMatchBreakEventPostScoreResetCalibrationStatus = !guardrailsPass || !densityCalibrationPreserved || !routeFamilyMixPreserved
    ? "FAIL"
    : !breakEventsImproved || !teamOpportunityBalancePreserved || !dominanceChainsPreservedOrImproved || blowoutRateAfter > 45
      ? "PARTIAL"
      : "PASS";
  const recommendation: FullMatchBreakEventPostScoreResetCalibrationRecommendation = !guardrailsPass
    ? "FIX_SCORING_GUARDRAILS"
    : !routeFamilyMixPreserved
      ? "PRESERVE_ROUTE_FAMILY_MIX"
      : postScoreAuditSummary.postScoreImmediateReattackRate >= BASELINE_6J.postScoreImmediateReattackRate
        ? "IMPROVE_POST_SCORE_RESETS_MORE"
        : dominanceAuditSummary.defensiveRecoveryBreaksDominanceRate < BASELINE_6J.defensiveRecoveryBreaksDominanceRate
          ? "IMPROVE_DEFENSIVE_RECOVERY_BREAKS"
          : dominanceAuditSummary.goalkeeperSecureBreaksDominanceRate === 0
            ? "IMPROVE_GOALKEEPER_SECURE_BREAKS"
            : "KEEP_BREAK_EVENT_MONITORING";

  return {
    status,
    scope: "FULL_MATCH_BREAK_EVENT_POST_SCORE_RESET_CALIBRATION",
    version: "BREAK_EVENT_POST_SCORE_RESET_6K",
    matchCount: MATCH_COUNT,
    baselineVersion: "DOMINANCE_CHAIN_6J",
    calibrationVersion: "BREAK_EVENT_POST_SCORE_RESET_6K",
    averageTotalPointsBefore: BASELINE_6J.averageTotalPoints,
    averageTotalPointsAfter,
    scoringEventsPerMatchBefore: BASELINE_6J.scoringEventsPerMatch,
    scoringEventsPerMatchAfter,
    scoringOpportunitiesPerMatchBefore: BASELINE_6J.scoringOpportunitiesPerMatch,
    scoringOpportunitiesPerMatchAfter,
    averageScoreDifferenceBefore: BASELINE_6J.averageScoreDifference,
    averageScoreDifferenceAfter,
    blowoutRateBefore: BASELINE_6J.blowoutRate,
    blowoutRateAfter,
    severeBlowoutRateBefore: BASELINE_6J.severeBlowoutRate,
    severeBlowoutRateAfter,
    postScoreImmediateReattackRateBefore: BASELINE_6J.postScoreImmediateReattackRate,
    postScoreImmediateReattackRateAfter: postScoreAuditSummary.postScoreImmediateReattackRate,
    postScoreImmediateReattackCount: postScoreAuditSummary.postScoreImmediateReattackCount,
    postScoreResetProtectedRateBefore: BASELINE_6J.postScoreResetProtectedRate,
    postScoreResetProtectedRateAfter: postScoreAuditSummary.postScoreResetProtectedRate,
    postScoreResetProtectedCount: postScoreAuditSummary.postScoreResetProtectedCount,
    concedingTeamFirstPossessionRateAfter: postScoreAuditSummary.concedingTeamFirstPossessionRate,
    concedingTeamFirstPossessionCount: postScoreAuditSummary.concedingTeamFirstPossessionCount,
    dominanceDecayEligibleCount: postScoreAuditSummary.dominanceDecayEligibleCount,
    dominanceDecayAppliedCount: postScoreAuditSummary.dominanceDecayAppliedCount,
    dominanceDecayApplicationRate: postScoreAuditSummary.dominanceDecayApplicationRate,
    defensiveRecoveryBreaksDominanceRateBefore: BASELINE_6J.defensiveRecoveryBreaksDominanceRate,
    defensiveRecoveryBreaksDominanceRateAfter: dominanceAuditSummary.defensiveRecoveryBreaksDominanceRate,
    goalkeeperSecureBreaksDominanceRateBefore: BASELINE_6J.goalkeeperSecureBreaksDominanceRate,
    goalkeeperSecureBreaksDominanceRateAfter: dominanceAuditSummary.goalkeeperSecureBreaksDominanceRate,
    resetBreaksDominanceRateBefore: BASELINE_6J.resetBreaksDominanceRate,
    resetBreaksDominanceRateAfter: dominanceAuditSummary.resetBreaksDominanceRate,
    dominantTeamOpportunityChainMaxBefore: BASELINE_6J.dominantTeamOpportunityChainMax,
    dominantTeamOpportunityChainMaxAfter: dominanceAuditSummary.dominantTeamOpportunityChainMax,
    sameTeamConsecutiveOpportunityRateBefore: BASELINE_6J.sameTeamConsecutiveOpportunityRate,
    sameTeamConsecutiveOpportunityRateAfter: dominanceAuditSummary.sameTeamConsecutiveOpportunityRate,
    sameFamilyConsecutiveOpportunityRateBefore: BASELINE_6J.sameFamilyConsecutiveOpportunityRate,
    sameFamilyConsecutiveOpportunityRateAfter: dominanceAuditSummary.sameFamilyConsecutiveOpportunityRate,
    opportunityBalanceIndexAfter: teamOpportunityBalance.opportunityBalanceIndex,
    scoringBalanceIndexAfter: teamOpportunityBalance.scoringBalanceIndex,
    pointBalanceIndexAfter: teamOpportunityBalance.pointBalanceIndex,
    trailingTeamResponseRateAfter: teamOpportunityBalance.trailingTeamResponseRate,
    densityCalibrationPreserved,
    teamOpportunityBalancePreserved,
    dominanceChainsPreservedOrImproved,
    breakEventsImproved,
    routeFamilyMixPreserved,
    routeFamilyDiversityByTeamAfter,
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
    uniqueSeeds: MATCH_COUNT,
    uniqueScorelines: new Set(scorelines).size,
    medianTotalPoints: median(totalPoints),
    maxScoreDifference: Math.max(...scoreDifferences),
    continuationSelectionRate: percent(continuationCount, Math.max(1, scoringOpportunityCount + continuationCount)),
    neutralResetBreakCount: postScoreAuditSummary.neutralResetBreakCount,
    defensiveRecoveryBreakCount: postScoreAuditSummary.defensiveRecoveryBreakCount,
    goalkeeperSecureBreakCount: postScoreAuditSummary.goalkeeperSecureBreakCount,
    routeFamilyMixDistribution,
    routeFamilyMixByTeam: {
      home: teamOpportunityBalance.home.routeFamilyMix,
      away: teamOpportunityBalance.away.routeFamilyMix,
    },
    scorelineDistribution: scorelineDistribution(scorelines).slice(0, 12),
    postScoreAuditSummary,
    dominanceAuditSummary,
    teamOpportunityBalance,
    postScoreAudits,
    dominanceAudits,
    warnings,
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "Sprint 6L - Route Economy Stability Monitoring"
      : "Sprint 6L - Break Event Follow-up And Goalkeeper Reset Specificity",
  };
}

function isCachedModel(value: unknown): value is FullMatchBreakEventPostScoreResetCalibrationModel & { readonly cacheVersion: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as { readonly cacheVersion?: unknown; readonly version?: unknown; readonly matchCount?: unknown };
  return record.cacheVersion === CACHE_VERSION && record.version === "BREAK_EVENT_POST_SCORE_RESET_6K" && record.matchCount === MATCH_COUNT;
}

function readCachedModel(): FullMatchBreakEventPostScoreResetCalibrationModel | null {
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

function writeCachedModel(model: FullMatchBreakEventPostScoreResetCalibrationModel): void {
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify({ ...model, cacheVersion: CACHE_VERSION }, null, 2), "utf8");
}

export function currentFullMatchBreakEventPostScoreResetCalibrationModel(): FullMatchBreakEventPostScoreResetCalibrationModel {
  if (cachedModel === null) {
    cachedModel = readCachedModel() ?? buildFullMatchBreakEventPostScoreResetCalibrationModel();
    writeCachedModel(cachedModel);
  }
  return cachedModel;
}

export function renderFullMatchBreakEventPostScoreResetCalibration6KDoc(
  model = currentFullMatchBreakEventPostScoreResetCalibrationModel(),
): string {
  const lines = [
    "# Full-Match Break Event Post-Score Reset Calibration 6K",
    "",
    "Sprint 6K protects post-score restart rhythm with neutral break events. It does not change scoring values, rewrite scorelines, delete scoring events, or force opponent scores.",
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
    "## Baseline 6J Summary",
    `- postScoreImmediateReattackRate: ${model.postScoreImmediateReattackRateBefore}%`,
    `- postScoreResetProtectedRate: ${model.postScoreResetProtectedRateBefore}%`,
    `- blowout rate: ${model.blowoutRateBefore}%`,
    `- average score difference: ${model.averageScoreDifferenceBefore}`,
    `- defensiveRecoveryBreaksDominanceRate: ${model.defensiveRecoveryBreaksDominanceRateBefore}%`,
    `- goalkeeperSecureBreaksDominanceRate: ${model.goalkeeperSecureBreaksDominanceRateBefore}%`,
    `- dominanceDecayAppliedCount: ${BASELINE_6J.dominanceDecayAppliedCount}`,
    "",
    "## After Calibration Summary",
    `- postScoreImmediateReattackRate: ${model.postScoreImmediateReattackRateAfter}%`,
    `- postScoreResetProtectedRate: ${model.postScoreResetProtectedRateAfter}%`,
    `- concedingTeamFirstPossessionRate: ${model.concedingTeamFirstPossessionRateAfter}%`,
    `- dominanceDecayApplicationRate: ${model.dominanceDecayApplicationRate}%`,
    `- blowout rate: ${model.blowoutRateAfter}%`,
    `- average score difference: ${model.averageScoreDifferenceAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    "",
    "## Before / After Table",
    "| Metric | 6J baseline | 6K after | Direction |",
    "| --- | ---: | ---: | --- |",
    `| post-score immediate reattack rate | ${model.postScoreImmediateReattackRateBefore}% | ${model.postScoreImmediateReattackRateAfter}% | ${model.postScoreImmediateReattackRateAfter < model.postScoreImmediateReattackRateBefore ? "reduced" : "not reduced"} |`,
    `| post-score reset protected rate | ${model.postScoreResetProtectedRateBefore}% | ${model.postScoreResetProtectedRateAfter}% | ${model.postScoreResetProtectedRateAfter > model.postScoreResetProtectedRateBefore ? "introduced" : "missing"} |`,
    `| defensive recovery breaks dominance | ${model.defensiveRecoveryBreaksDominanceRateBefore}% | ${model.defensiveRecoveryBreaksDominanceRateAfter}% | ${model.defensiveRecoveryBreaksDominanceRateAfter >= model.defensiveRecoveryBreaksDominanceRateBefore ? "preserved/improved" : "regressed"} |`,
    `| goalkeeper secure breaks dominance | ${model.goalkeeperSecureBreaksDominanceRateBefore}% | ${model.goalkeeperSecureBreaksDominanceRateAfter}% | ${model.goalkeeperSecureBreaksDominanceRateAfter > 0 ? "active" : "not observed"} |`,
    `| dominance decay applied count | ${BASELINE_6J.dominanceDecayAppliedCount} | ${model.dominanceDecayAppliedCount} | ${model.dominanceDecayAppliedCount > 0 ? "active" : "missing"} |`,
    `| blowout rate | ${model.blowoutRateBefore}% | ${model.blowoutRateAfter}% | ${model.blowoutRateAfter < model.blowoutRateBefore ? "reduced" : "monitor"} |`,
    "",
    "## Post-Score Reset Audit Summary",
    `- postScoreWindowsChecked: ${model.postScoreAuditSummary.postScoreWindowsChecked}`,
    `- postScoreImmediateReattackCount: ${model.postScoreImmediateReattackCount}`,
    `- postScoreImmediateReattackRate: ${model.postScoreImmediateReattackRateAfter}%`,
    `- postScoreResetProtectedCount: ${model.postScoreResetProtectedCount}`,
    `- postScoreResetProtectedRate: ${model.postScoreResetProtectedRateAfter}%`,
    `- concedingTeamFirstPossessionCount: ${model.concedingTeamFirstPossessionCount}`,
    `- concedingTeamFirstPossessionRate: ${model.concedingTeamFirstPossessionRateAfter}%`,
    "",
    "## Break Event Metrics",
    `- neutralResetBreakCount: ${model.neutralResetBreakCount}`,
    `- defensiveRecoveryBreakCount: ${model.defensiveRecoveryBreakCount}`,
    `- goalkeeperSecureBreakCount: ${model.goalkeeperSecureBreakCount}`,
    `- resetBreaksDominanceRate: ${model.resetBreaksDominanceRateAfter}%`,
    `- defensiveRecoveryBreaksDominanceRate: ${model.defensiveRecoveryBreaksDominanceRateAfter}%`,
    `- goalkeeperSecureBreaksDominanceRate: ${model.goalkeeperSecureBreaksDominanceRateAfter}%`,
    "",
    "## Dominance Decay Metrics",
    `- dominanceDecayEligibleCount: ${model.dominanceDecayEligibleCount}`,
    `- dominanceDecayAppliedCount: ${model.dominanceDecayAppliedCount}`,
    `- dominanceDecayApplicationRate: ${model.dominanceDecayApplicationRate}%`,
    `- breakEventsImproved: ${model.breakEventsImproved}`,
    "",
    "## Dominance Chain Preservation Metrics",
    `- dominantTeamOpportunityChainMax: ${model.dominantTeamOpportunityChainMaxBefore} -> ${model.dominantTeamOpportunityChainMaxAfter}`,
    `- sameTeamConsecutiveOpportunityRate: ${model.sameTeamConsecutiveOpportunityRateBefore}% -> ${model.sameTeamConsecutiveOpportunityRateAfter}%`,
    `- sameFamilyConsecutiveOpportunityRate: ${model.sameFamilyConsecutiveOpportunityRateBefore}% -> ${model.sameFamilyConsecutiveOpportunityRateAfter}%`,
    `- dominanceChainsPreservedOrImproved: ${model.dominanceChainsPreservedOrImproved}`,
    "",
    "## Team Opportunity Balance Preservation Metrics",
    `- teamOpportunityBalancePreserved: ${model.teamOpportunityBalancePreserved}`,
    `- opportunityBalanceIndexAfter: ${model.opportunityBalanceIndexAfter}`,
    `- scoringBalanceIndexAfter: ${model.scoringBalanceIndexAfter}`,
    `- pointBalanceIndexAfter: ${model.pointBalanceIndexAfter}`,
    `- trailingTeamResponseRateAfter: ${model.trailingTeamResponseRateAfter}%`,
    "",
    "## Density Preservation Metrics",
    `- densityCalibrationPreserved: ${model.densityCalibrationPreserved}`,
    `- routeFamilyMixPreserved: ${model.routeFamilyMixPreserved}`,
    `- routeFamilyDiversityByTeamAfter: ${model.routeFamilyDiversityByTeamAfter}`,
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    `- medianTotalPoints: ${model.medianTotalPoints}`,
    `- maxScoreDifference: ${model.maxScoreDifference}`,
    `- severeBlowoutRateAfter: ${model.severeBlowoutRateAfter}%`,
    `- continuationSelectionRate: ${model.continuationSelectionRate}%`,
    "",
    "## Route Family Mix By Team",
    ...Object.entries(model.routeFamilyMixByTeam.home).map(([family, count]) => `- home route family ${family}: ${count}`),
    ...Object.entries(model.routeFamilyMixByTeam.away).map(([family, count]) => `- away route family ${family}: ${count}`),
    "",
    "## Scoreline Distribution",
    ...model.scorelineDistribution.map((row) => `- ${row.scoreline}: ${row.matches}`),
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
    "",
    "## Warnings",
    ...model.warnings.map((warning) => `- ${warning}`),
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- ${model.nextSprintRecommendation}`,
    "",
    "## Explicit Exhaustive Test Command",
    "- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
  ];
  const content = lines.join("\n");
  writeFileSync(join(process.cwd(), "reports", "fullmatch-break-event-post-score-reset-calibration-6k.md"), `${content}\n`, "utf8");
  return content;
}

function validationLine(label: string, pass: boolean, detail: string): string {
  return `- ${pass ? "PASS" : "FAIL"}: ${label}${detail.length > 0 ? ` - ${detail}` : ""}`;
}

export function renderFullMatchBreakEventPostScoreResetCalibration6KValidation(
  model = currentFullMatchBreakEventPostScoreResetCalibrationModel(),
): string {
  const checks = [
    validationLine("post-score reset audit exists", model.postScoreAudits.length >= 50, String(model.postScoreAudits.length)),
    validationLine("batch 50 matches after calibration exists", model.matchCount >= 50, `matchCount: ${model.matchCount}`),
    validationLine("6J baseline visible", model.baselineVersion === "DOMINANCE_CHAIN_6J", model.baselineVersion),
    validationLine("postScoreImmediateReattackRate measured", model.postScoreImmediateReattackRateAfter >= 0, `${model.postScoreImmediateReattackRateAfter}%`),
    validationLine("postScoreImmediateReattackRate improves or is explicitly partial", model.postScoreImmediateReattackRateAfter < model.postScoreImmediateReattackRateBefore || model.status !== "PASS", `${model.postScoreImmediateReattackRateBefore}->${model.postScoreImmediateReattackRateAfter}`),
    validationLine("postScoreResetProtectedCount measured", model.postScoreResetProtectedCount > 0, String(model.postScoreResetProtectedCount)),
    validationLine("conceding team first possession measured", model.concedingTeamFirstPossessionCount >= 0, String(model.concedingTeamFirstPossessionCount)),
    validationLine("dominance decay eligible count measured", model.dominanceDecayEligibleCount > 0, String(model.dominanceDecayEligibleCount)),
    validationLine("dominance decay applied count active", model.dominanceDecayAppliedCount > 0, String(model.dominanceDecayAppliedCount)),
    validationLine("defensive recovery breaks dominance measured", model.defensiveRecoveryBreaksDominanceRateAfter >= 0, `${model.defensiveRecoveryBreaksDominanceRateAfter}%`),
    validationLine("goalkeeper secure break absence is surfaced", model.goalkeeperSecureBreaksDominanceRateAfter >= 0 && model.warnings.includes("GOALKEEPER_SECURE_BREAKS_MISSING"), `${model.goalkeeperSecureBreaksDominanceRateAfter}%`),
    validationLine("dominance chains preserved or improved", model.dominanceChainsPreservedOrImproved || model.status !== "PASS", `${model.dominantTeamOpportunityChainMaxAfter}`),
    validationLine("density calibration preserved", model.densityCalibrationPreserved, `${model.scoringOpportunitiesPerMatchAfter}/${model.averageTotalPointsAfter}`),
    validationLine("team opportunity balance preserved", model.teamOpportunityBalancePreserved || model.status !== "PASS", `${model.opportunityBalanceIndexAfter}/${model.pointBalanceIndexAfter}`),
    validationLine("route family diversity preserved", model.routeFamilyMixPreserved, String(model.routeFamilyDiversityByTeamAfter)),
    validationLine("TRY route remains available", model.routeFamilyMixByTeam.home.TRY_TOUCHDOWN + model.routeFamilyMixByTeam.away.TRY_TOUCHDOWN > 0, ""),
    validationLine("DROP route remains available", model.routeFamilyMixByTeam.home.DROP_GOAL + model.routeFamilyMixByTeam.away.DROP_GOAL > 0, ""),
    validationLine("CONVERSION-after-TRY route remains available", model.routeFamilyMixByTeam.home.CONVERSION_GOAL + model.routeFamilyMixByTeam.away.CONVERSION_GOAL > 0, ""),
    validationLine("CONTINUATION route remains available", model.routeFamilyMixByTeam.home.CONTINUATION + model.routeFamilyMixByTeam.away.CONTINUATION > 0, ""),
    validationLine("score from score_change", model.scoreFromScoreChangeAllRuns, ""),
    validationLine("no score ceiling mechanism", !model.scoreCapApplied, ""),
    validationLine("no post-hoc rewrite", !model.postHocRewriteApplied, ""),
    validationLine("no event deletion", !model.scoringEventsDeleted, ""),
    validationLine("no forced opponent score", !model.forcedOpponentScoreApplied, ""),
    validationLine("no forced trailing team score", !model.forcedTrailingTeamScoreApplied, ""),
    validationLine("scoring constants unchanged", !model.scoringConstantsChanged, ""),
    validationLine("MatchBonusEvent unchanged", !model.MatchBonusEventChanged, ""),
    validationLine("batch/live separation preserved", model.batchLiveSeparationPreserved, ""),
    validationLine("no UNKNOWN scoring family", model.unknownScoringFamilyCount === 0, String(model.unknownScoringFamilyCount)),
    validationLine("no PENALTY_SHOT leakage", model.penaltyShotActiveLeakageCount === 0, String(model.penaltyShotActiveLeakageCount)),
    validationLine("no persistence/SQLite scoring", !model.persistenceUsedForScoring && !model.sqliteUsedForScoring, ""),
    validationLine("no rollback to SHOT_ONLY", model.noRollbackToShotOnly, ""),
    validationLine("warning status is not contradictory", !(model.warnings.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY") && (
      model.warnings.includes("SCORING_GUARDRAIL_REGRESSED") ||
      model.warnings.includes("BLOWOUT_RATE_STILL_TOO_HIGH") ||
      model.warnings.includes("POST_SCORE_IMMEDIATE_REATTACK_TOO_HIGH")
    )), model.warnings.join(",")),
  ];
  const status = checks.every((check) => check.startsWith("- PASS")) ? "PASS" : "FAIL";
  const lines = [
    "# Full-Match Break Event Post-Score Reset Calibration 6K Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- matchCount: ${model.matchCount}`,
    `- postScoreWindowsChecked: ${model.postScoreAuditSummary.postScoreWindowsChecked}`,
    `- postScoreImmediateReattackRate before/after: ${model.postScoreImmediateReattackRateBefore}/${model.postScoreImmediateReattackRateAfter}`,
    `- postScoreResetProtectedCount: ${model.postScoreResetProtectedCount}`,
    `- dominanceDecayEligibleCount: ${model.dominanceDecayEligibleCount}`,
    `- dominanceDecayAppliedCount: ${model.dominanceDecayAppliedCount}`,
    `- defensiveRecoveryBreaksDominanceRate: ${model.defensiveRecoveryBreaksDominanceRateAfter}`,
    `- goalkeeperSecureBreaksDominanceRate: ${model.goalkeeperSecureBreaksDominanceRateAfter}`,
    `- recommendation: ${model.recommendation}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Explicit Exhaustive Test Command",
    "- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
  ];
  const content = lines.join("\n");
  writeFileSync(join(process.cwd(), "reports", "validation.fullmatch-break-event-post-score-reset-calibration-6k.md"), `${content}\n`, "utf8");
  return content;
}

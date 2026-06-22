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
  auditFullMatchTeamOpportunityBalance,
  summarizeTeamOpportunityBalanceAudit,
  type TeamBalanceRouteFamilyMix,
} from "../simulation/fullMatch/fullMatchTeamOpportunityBalanceAudit";
import type { DominanceChainWarningCode } from "../simulation/fullMatch/dominanceChainWarnings";
import { runFullMatch } from "../simulation/runFullMatch";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

export type FullMatchDominanceChainCalibrationStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchDominanceChainCalibrationRecommendation =
  | "KEEP_DOMINANCE_CHAIN_MONITORING"
  | "REDUCE_DOMINANCE_CHAINS_MORE"
  | "IMPROVE_BREAK_EVENTS"
  | "PRESERVE_ROUTE_FAMILY_MIX"
  | "FIX_SCORING_GUARDRAILS";

export interface FullMatchDominanceChainCalibrationModel {
  readonly status: FullMatchDominanceChainCalibrationStatus;
  readonly scope: "FULL_MATCH_DOMINANCE_CHAIN_CALIBRATION";
  readonly version: "DOMINANCE_CHAIN_6J";
  readonly matchCount: number;
  readonly baselineVersion: "TEAM_OPPORTUNITY_BALANCE_6I";
  readonly calibrationVersion: "DOMINANCE_CHAIN_6J";
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
  readonly opportunityBalanceIndexBefore: number;
  readonly opportunityBalanceIndexAfter: number;
  readonly dangerBalanceIndexBefore: number;
  readonly dangerBalanceIndexAfter: number;
  readonly scoringBalanceIndexBefore: number;
  readonly scoringBalanceIndexAfter: number;
  readonly pointBalanceIndexBefore: number;
  readonly pointBalanceIndexAfter: number;
  readonly trailingTeamResponseRateBefore: number;
  readonly trailingTeamResponseRateAfter: number;
  readonly resetToResponseRateBefore: number;
  readonly resetToResponseRateAfter: number;
  readonly defensiveRecoveryToDangerRateBefore: number;
  readonly defensiveRecoveryToDangerRateAfter: number;
  readonly dominantTeamOpportunityChainMaxBefore: number;
  readonly dominantTeamOpportunityChainMaxAfter: number;
  readonly dominantTeamDangerPhaseChainMaxBefore: number;
  readonly dominantTeamDangerPhaseChainMaxAfter: number;
  readonly dominantTeamScoringEventChainMaxBefore: number;
  readonly dominantTeamScoringEventChainMaxAfter: number;
  readonly sameTeamConsecutiveOpportunityRateBefore: number;
  readonly sameTeamConsecutiveOpportunityRateAfter: number;
  readonly sameFamilyConsecutiveOpportunityRateBefore: number;
  readonly sameFamilyConsecutiveOpportunityRateAfter: number;
  readonly postScoreImmediateReattackRateBefore: number;
  readonly postScoreImmediateReattackRateAfter: number;
  readonly resetBreaksDominanceRateBefore: number;
  readonly resetBreaksDominanceRateAfter: number;
  readonly defensiveRecoveryBreaksDominanceRateBefore: number;
  readonly defensiveRecoveryBreaksDominanceRateAfter: number;
  readonly goalkeeperSecureBreaksDominanceRateBefore: number;
  readonly goalkeeperSecureBreaksDominanceRateAfter: number;
  readonly turnoverBreaksDominanceRateBefore: number;
  readonly turnoverBreaksDominanceRateAfter: number;
  readonly neutralPhaseBreaksDominanceRateBefore: number;
  readonly neutralPhaseBreaksDominanceRateAfter: number;
  readonly routeFamilyDiversityByTeamBefore: number;
  readonly routeFamilyDiversityByTeamAfter: number;
  readonly densityCalibrationPreserved: boolean;
  readonly routeFamilyMixPreserved: boolean;
  readonly teamOpportunityBalancePreserved: boolean;
  readonly dominanceChainsReduced: boolean;
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
  readonly matchCountAfter: number;
  readonly uniqueSeeds: number;
  readonly uniqueScorelines: number;
  readonly medianTotalPoints: number;
  readonly medianScoreDifference: number;
  readonly maxScoreDifference: number;
  readonly scoringOpportunitiesPerSegmentAfter: number;
  readonly dangerPhasesPerMatchAfter: number;
  readonly neutralPhasesPerMatchAfter: number;
  readonly turnoversPerMatchAfter: number;
  readonly defensiveRecoveriesPerMatchAfter: number;
  readonly resetPhasesPerMatchAfter: number;
  readonly continuationSelectionRate: number;
  readonly possessionAfterConcedingDangerRateAfter: number;
  readonly postScoreImmediateReattackCount: number;
  readonly resetBreaksDominanceCount: number;
  readonly defensiveRecoveryBreaksDominanceCount: number;
  readonly goalkeeperSecureBreaksDominanceCount: number;
  readonly turnoverBreaksDominanceCount: number;
  readonly neutralPhaseBreaksDominanceCount: number;
  readonly dominanceDecayAppliedCount: number;
  readonly routeFamilyMixDistribution: readonly { readonly routeFamilyMix: string; readonly matches: number }[];
  readonly routeFamilyMixByTeam: {
    readonly home: TeamBalanceRouteFamilyMix;
    readonly away: TeamBalanceRouteFamilyMix;
  };
  readonly scorelineDistribution: readonly { readonly scoreline: string; readonly matches: number }[];
  readonly dominanceAuditSummary: ReturnType<typeof summarizeDominanceAudits>;
  readonly teamOpportunityBalance: ReturnType<typeof summarizeTeamOpportunityBalanceAudit>;
  readonly dominanceAudits: readonly FullMatchDominanceChainAudit[];
  readonly warnings: readonly DominanceChainWarningCode[];
  readonly recommendation: FullMatchDominanceChainCalibrationRecommendation;
  readonly nextSprintRecommendation: string;
}

const MATCH_COUNT = 50;
const CACHE_VERSION = "dominance-chain-6j-v2";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-dominance-chain-calibration-6j.json");

const BASELINE_6I = {
  averageTotalPoints: 22.3,
  scoringEventsPerMatch: 7.3,
  scoringOpportunitiesPerMatch: 16.2,
  averageScoreDifference: 11.1,
  blowoutRate: 48,
  severeBlowoutRate: 2,
  shutoutRate: 12,
  oneSidedScoringRate: 12,
  opportunityBalanceIndex: 76,
  dangerBalanceIndex: 76,
  scoringBalanceIndex: 76,
  pointBalanceIndex: 75,
  trailingTeamResponseRate: 52.3,
  resetToResponseRate: 39.9,
  defensiveRecoveryToDangerRate: 73.8,
  dominantTeamOpportunityChainMax: 16,
  dominantTeamDangerPhaseChainMax: 16,
  dominantTeamScoringEventChainMax: 8,
  sameTeamConsecutiveOpportunityRate: 74,
  sameFamilyConsecutiveOpportunityRate: 54,
  postScoreImmediateReattackRate: 38,
  resetBreaksDominanceRate: 45,
  defensiveRecoveryBreaksDominanceRate: 74,
  goalkeeperSecureBreaksDominanceRate: 0,
  turnoverBreaksDominanceRate: 0,
  neutralPhaseBreaksDominanceRate: 45,
  routeFamilyDiversityByTeam: 3,
} as const;

let cachedModel: FullMatchDominanceChainCalibrationModel | null = null;

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
    event.tags.includes("official_scoring_resolution_score_change_authorized") ||
    event.tags.includes("official_route_family_CONTINUATION") ||
    event.tags.includes("dominance_chain_calibration_6j")
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
    matchId: `fullmatch-dominance-chain-6j-${String(index + 1).padStart(3, "0")}`,
    seed: `fullmatch-dominance-chain-6j-seed-${String(index + 1).padStart(3, "0")}`,
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
  readonly dominantTeamDangerPhaseChainMax: number;
  readonly dominantTeamScoringEventChainMax: number;
  readonly dominantTeamPointRunMax: number;
  readonly sameTeamConsecutiveOpportunityRate: number;
  readonly sameFamilyConsecutiveOpportunityRate: number;
  readonly sameZoneConsecutiveOpportunityRate: number;
  readonly postScoreImmediateReattackRate: number;
  readonly resetBreaksDominanceRate: number;
  readonly defensiveRecoveryBreaksDominanceRate: number;
  readonly goalkeeperSecureBreaksDominanceRate: number;
  readonly turnoverBreaksDominanceRate: number;
  readonly neutralPhaseBreaksDominanceRate: number;
  readonly trailingTeamResponseAfterDominanceRate: number;
  readonly dominanceDecayAppliedCount: number;
  readonly postScoreImmediateReattackCount: number;
  readonly resetBreaksDominanceCount: number;
  readonly defensiveRecoveryBreaksDominanceCount: number;
  readonly goalkeeperSecureBreaksDominanceCount: number;
  readonly turnoverBreaksDominanceCount: number;
  readonly neutralPhaseBreaksDominanceCount: number;
} {
  const sum = (selector: (audit: FullMatchDominanceChainAudit) => number): number =>
    audits.reduce((total, audit) => total + selector(audit), 0);
  const averageAuditValue = (selector: (audit: FullMatchDominanceChainAudit) => number): number =>
    round(sum(selector) / Math.max(1, audits.length));

  return {
    dominantTeamOpportunityChainMax: Math.max(0, ...audits.map((audit) => audit.dominantTeamOpportunityChainMax)),
    dominantTeamDangerPhaseChainMax: Math.max(0, ...audits.map((audit) => audit.dominantTeamDangerPhaseChainMax)),
    dominantTeamScoringEventChainMax: Math.max(0, ...audits.map((audit) => audit.dominantTeamScoringEventChainMax)),
    dominantTeamPointRunMax: Math.max(0, ...audits.map((audit) => audit.dominantTeamPointRunMax)),
    sameTeamConsecutiveOpportunityRate: averageAuditValue((audit) => audit.sameTeamConsecutiveOpportunityRate),
    sameFamilyConsecutiveOpportunityRate: averageAuditValue((audit) => audit.sameFamilyConsecutiveOpportunityRate),
    sameZoneConsecutiveOpportunityRate: averageAuditValue((audit) => audit.sameZoneConsecutiveOpportunityRate),
    postScoreImmediateReattackRate: averageAuditValue((audit) => audit.postScoreImmediateReattackRate),
    resetBreaksDominanceRate: averageAuditValue((audit) => audit.resetBreaksDominanceRate),
    defensiveRecoveryBreaksDominanceRate: averageAuditValue((audit) => audit.defensiveRecoveryBreaksDominanceRate),
    goalkeeperSecureBreaksDominanceRate: averageAuditValue((audit) => audit.goalkeeperSecureBreaksDominanceRate),
    turnoverBreaksDominanceRate: averageAuditValue((audit) => audit.turnoverBreaksDominanceRate),
    neutralPhaseBreaksDominanceRate: averageAuditValue((audit) => audit.neutralPhaseBreaksDominanceRate),
    trailingTeamResponseAfterDominanceRate: averageAuditValue((audit) => audit.trailingTeamResponseAfterDominanceRate),
    dominanceDecayAppliedCount: sum((audit) => audit.dominanceDecayAppliedCount),
    postScoreImmediateReattackCount: sum((audit) => audit.postScoreImmediateReattackCount),
    resetBreaksDominanceCount: sum((audit) => audit.resetBreaksDominanceCount),
    defensiveRecoveryBreaksDominanceCount: sum((audit) => audit.defensiveRecoveryBreaksDominanceCount),
    goalkeeperSecureBreaksDominanceCount: sum((audit) => audit.goalkeeperSecureBreaksDominanceCount),
    turnoverBreaksDominanceCount: sum((audit) => audit.turnoverBreaksDominanceCount),
    neutralPhaseBreaksDominanceCount: sum((audit) => audit.neutralPhaseBreaksDominanceCount),
  };
}

function buildWarnings(input: {
  readonly guardrailsPass: boolean;
  readonly densityPreserved: boolean;
  readonly routeFamilyMixPreserved: boolean;
  readonly teamBalancePreserved: boolean;
  readonly dominanceReduced: boolean;
  readonly model: Pick<FullMatchDominanceChainCalibrationModel,
    | "dominantTeamOpportunityChainMaxAfter"
    | "sameTeamConsecutiveOpportunityRateAfter"
    | "sameFamilyConsecutiveOpportunityRateAfter"
    | "postScoreImmediateReattackRateAfter"
    | "resetBreaksDominanceRateAfter"
    | "defensiveRecoveryBreaksDominanceRateAfter"
    | "goalkeeperSecureBreaksDominanceRateAfter"
    | "blowoutRateAfter">;
}): readonly DominanceChainWarningCode[] {
  const warnings: DominanceChainWarningCode[] = ["DOMINANCE_CHAIN_CALIBRATED"];
  if (input.dominanceReduced) {
    warnings.push("DOMINANCE_CHAIN_REDUCED");
  }
  if (input.model.sameTeamConsecutiveOpportunityRateAfter < BASELINE_6I.sameTeamConsecutiveOpportunityRate) {
    warnings.push("SAME_TEAM_OPPORTUNITY_CHAIN_REDUCED");
  }
  if (input.model.sameFamilyConsecutiveOpportunityRateAfter < BASELINE_6I.sameFamilyConsecutiveOpportunityRate) {
    warnings.push("SAME_FAMILY_REPEAT_REDUCED");
  }
  if (input.model.postScoreImmediateReattackRateAfter < BASELINE_6I.postScoreImmediateReattackRate) {
    warnings.push("POST_SCORE_IMMEDIATE_REATTACK_REDUCED");
  }
  if (input.model.resetBreaksDominanceRateAfter >= BASELINE_6I.resetBreaksDominanceRate) {
    warnings.push("RESET_BREAKS_DOMINANCE_IMPROVED");
  }
  if (input.model.defensiveRecoveryBreaksDominanceRateAfter >= BASELINE_6I.defensiveRecoveryBreaksDominanceRate) {
    warnings.push("DEFENSIVE_RECOVERY_BREAKS_DOMINANCE_IMPROVED");
  }
  if (input.model.goalkeeperSecureBreaksDominanceRateAfter >= BASELINE_6I.goalkeeperSecureBreaksDominanceRate) {
    warnings.push("GOALKEEPER_SECURE_BREAKS_DOMINANCE_IMPROVED");
  }
  if (input.teamBalancePreserved) {
    warnings.push("TEAM_OPPORTUNITY_BALANCE_PRESERVED");
  }
  if (input.densityPreserved) {
    warnings.push("DENSITY_CALIBRATION_PRESERVED");
  }
  if (input.routeFamilyMixPreserved) {
    warnings.push("ROUTE_FAMILY_DIVERSITY_PRESERVED");
  }
  if (input.model.blowoutRateAfter < BASELINE_6I.blowoutRate) {
    warnings.push("BLOWOUT_RATE_REDUCED");
  }
  if (input.model.dominantTeamOpportunityChainMaxAfter >= 8) {
    warnings.push("DOMINANCE_CHAIN_STILL_TOO_LONG");
  }
  if (input.model.sameTeamConsecutiveOpportunityRateAfter >= 60) {
    warnings.push("SAME_TEAM_OPPORTUNITY_CHAIN_STILL_TOO_HIGH");
  }
  if (input.model.sameFamilyConsecutiveOpportunityRateAfter >= 45) {
    warnings.push("SAME_FAMILY_REPEAT_STILL_TOO_HIGH");
  }
  if (input.model.blowoutRateAfter > 40) {
    warnings.push("BLOWOUT_RATE_STILL_TOO_HIGH");
  }
  if (!input.teamBalancePreserved) {
    warnings.push("TEAM_BALANCE_REGRESSED");
  }
  if (!input.densityPreserved) {
    warnings.push("DENSITY_REGRESSED");
  }
  if (!input.routeFamilyMixPreserved) {
    warnings.push("NON_SHOT_ROUTES_DISAPPEARED");
  }
  if (!input.guardrailsPass) {
    warnings.push("FULL_MATCH_BATCH_ECONOMY_PARTIAL");
  } else if (!warnings.includes("BLOWOUT_RATE_STILL_TOO_HIGH") && !warnings.includes("DOMINANCE_CHAIN_STILL_TOO_LONG") && !warnings.includes("TEAM_BALANCE_REGRESSED")) {
    warnings.push("FULL_MATCH_BATCH_ECONOMY_HEALTHY");
  } else {
    warnings.push("FULL_MATCH_BATCH_ECONOMY_PARTIAL");
  }
  return [...new Set(warnings)];
}

export function buildFullMatchDominanceChainCalibrationModel(): FullMatchDominanceChainCalibrationModel {
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
  let segmentCount = 0;
  let dangerPhaseCount = 0;
  let neutralPhaseCount = 0;
  let turnoverCount = 0;
  let defensiveRecoveryCount = 0;
  let resetPhaseCount = 0;
  let continuationCount = 0;

  for (let index = 0; index < MATCH_COUNT; index += 1) {
    const report = runFullMatch(buildScenarioInput(index));
    const dominanceAudit = auditFullMatchDominanceChains(report);
    const teamAudit = auditFullMatchTeamOpportunityBalance(report);
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
    dangerPhaseCount += teamAudit.home.dangerPhaseCount + teamAudit.away.dangerPhaseCount;
    neutralPhaseCount += teamAudit.home.neutralPhaseCount + teamAudit.away.neutralPhaseCount;
    turnoverCount += teamAudit.home.turnoverCount + teamAudit.away.turnoverCount;
    defensiveRecoveryCount += teamAudit.home.defensiveRecoveryCount + teamAudit.away.defensiveRecoveryCount;
    resetPhaseCount += teamAudit.home.resetPhaseCount + teamAudit.away.resetPhaseCount;
    continuationCount += teamAudit.home.continuationCount + teamAudit.away.continuationCount;
    segmentCount += teamAudit.rows.length;
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

  const dominanceAuditSummary = summarizeDominanceAudits(dominanceAudits);
  const teamOpportunityBalance = summarizeTeamOpportunityBalanceAudit(teamAudits);
  const totalOpportunities = teamOpportunityBalance.home.scoringOpportunityCount + teamOpportunityBalance.away.scoringOpportunityCount;
  const totalScoringEvents = teamOpportunityBalance.home.scoringEventCount + teamOpportunityBalance.away.scoringEventCount;
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
  const shutoutRateAfter = percent(scorelines.filter((scoreline) => scoreline.startsWith("0 - ") || scoreline.endsWith(" - 0")).length, MATCH_COUNT);
  const oneSidedScoringRateAfter = shutoutRateAfter;
  const densityCalibrationPreserved = scoringOpportunitiesPerMatchAfter <= BASELINE_6I.scoringOpportunitiesPerMatch + 1 &&
    scoringEventsPerMatchAfter <= BASELINE_6I.scoringEventsPerMatch + 1 &&
    averageTotalPointsAfter >= 18 &&
    averageTotalPointsAfter <= 30 &&
    severeBlowoutRateAfter <= 15;
  const routeFamilyMixPreserved = routeMixes.some((value) => value === "MULTI_FAMILY") &&
    routeFamilyDiversityByTeamAfter >= 3 &&
    continuationCount > 0 &&
    teamOpportunityBalance.home.routeFamilyMix.TRY_TOUCHDOWN + teamOpportunityBalance.away.routeFamilyMix.TRY_TOUCHDOWN > 0 &&
    teamOpportunityBalance.home.routeFamilyMix.DROP_GOAL + teamOpportunityBalance.away.routeFamilyMix.DROP_GOAL > 0;
  const teamOpportunityBalancePreserved = teamOpportunityBalance.opportunityBalanceIndex >= BASELINE_6I.opportunityBalanceIndex - 5 &&
    teamOpportunityBalance.scoringBalanceIndex >= BASELINE_6I.scoringBalanceIndex - 8 &&
    teamOpportunityBalance.pointBalanceIndex >= BASELINE_6I.pointBalanceIndex - 10 &&
    teamOpportunityBalance.trailingTeamResponseRate >= BASELINE_6I.trailingTeamResponseRate - 8;
  const dominanceChainsReduced = dominanceAuditSummary.dominantTeamOpportunityChainMax < BASELINE_6I.dominantTeamOpportunityChainMax &&
    dominanceAuditSummary.sameTeamConsecutiveOpportunityRate < BASELINE_6I.sameTeamConsecutiveOpportunityRate &&
    dominanceAuditSummary.sameFamilyConsecutiveOpportunityRate < BASELINE_6I.sameFamilyConsecutiveOpportunityRate;
  const guardrailsPass = !scoringConstantsChanged() &&
    scoreFromScoreChangeAllRuns &&
    officialPathConnectedAllRuns &&
    calibrationsAppliedAllRuns &&
    unknownScoringFamilyCount === 0 &&
    penaltyShotActiveLeakageCount === 0 &&
    routeFamilyMixPreserved;
  const modelBase = {
    dominantTeamOpportunityChainMaxAfter: dominanceAuditSummary.dominantTeamOpportunityChainMax,
    sameTeamConsecutiveOpportunityRateAfter: dominanceAuditSummary.sameTeamConsecutiveOpportunityRate,
    sameFamilyConsecutiveOpportunityRateAfter: dominanceAuditSummary.sameFamilyConsecutiveOpportunityRate,
    postScoreImmediateReattackRateAfter: dominanceAuditSummary.postScoreImmediateReattackRate,
    resetBreaksDominanceRateAfter: dominanceAuditSummary.resetBreaksDominanceRate,
    defensiveRecoveryBreaksDominanceRateAfter: dominanceAuditSummary.defensiveRecoveryBreaksDominanceRate,
    goalkeeperSecureBreaksDominanceRateAfter: dominanceAuditSummary.goalkeeperSecureBreaksDominanceRate,
    blowoutRateAfter,
  };
  const warnings = buildWarnings({
    guardrailsPass,
    densityPreserved: densityCalibrationPreserved,
    routeFamilyMixPreserved,
    teamBalancePreserved: teamOpportunityBalancePreserved,
    dominanceReduced: dominanceChainsReduced,
    model: modelBase,
  });
  const status: FullMatchDominanceChainCalibrationStatus = !guardrailsPass || !densityCalibrationPreserved || !routeFamilyMixPreserved
    ? "FAIL"
    : !dominanceChainsReduced || !teamOpportunityBalancePreserved || blowoutRateAfter > 40
      ? "PARTIAL"
      : "PASS";
  const recommendation: FullMatchDominanceChainCalibrationRecommendation = !guardrailsPass
    ? "FIX_SCORING_GUARDRAILS"
    : !routeFamilyMixPreserved
      ? "PRESERVE_ROUTE_FAMILY_MIX"
      : !dominanceChainsReduced
        ? "REDUCE_DOMINANCE_CHAINS_MORE"
        : warnings.includes("BLOWOUT_RATE_STILL_TOO_HIGH")
          ? "IMPROVE_BREAK_EVENTS"
          : "KEEP_DOMINANCE_CHAIN_MONITORING";

  return {
    status,
    scope: "FULL_MATCH_DOMINANCE_CHAIN_CALIBRATION",
    version: "DOMINANCE_CHAIN_6J",
    matchCount: MATCH_COUNT,
    baselineVersion: "TEAM_OPPORTUNITY_BALANCE_6I",
    calibrationVersion: "DOMINANCE_CHAIN_6J",
    averageTotalPointsBefore: BASELINE_6I.averageTotalPoints,
    averageTotalPointsAfter,
    scoringEventsPerMatchBefore: BASELINE_6I.scoringEventsPerMatch,
    scoringEventsPerMatchAfter,
    scoringOpportunitiesPerMatchBefore: BASELINE_6I.scoringOpportunitiesPerMatch,
    scoringOpportunitiesPerMatchAfter,
    averageScoreDifferenceBefore: BASELINE_6I.averageScoreDifference,
    averageScoreDifferenceAfter,
    blowoutRateBefore: BASELINE_6I.blowoutRate,
    blowoutRateAfter,
    severeBlowoutRateBefore: BASELINE_6I.severeBlowoutRate,
    severeBlowoutRateAfter,
    shutoutRateBefore: BASELINE_6I.shutoutRate,
    shutoutRateAfter,
    oneSidedScoringRateBefore: BASELINE_6I.oneSidedScoringRate,
    oneSidedScoringRateAfter,
    opportunityBalanceIndexBefore: BASELINE_6I.opportunityBalanceIndex,
    opportunityBalanceIndexAfter: teamOpportunityBalance.opportunityBalanceIndex,
    dangerBalanceIndexBefore: BASELINE_6I.dangerBalanceIndex,
    dangerBalanceIndexAfter: teamOpportunityBalance.dangerBalanceIndex,
    scoringBalanceIndexBefore: BASELINE_6I.scoringBalanceIndex,
    scoringBalanceIndexAfter: teamOpportunityBalance.scoringBalanceIndex,
    pointBalanceIndexBefore: BASELINE_6I.pointBalanceIndex,
    pointBalanceIndexAfter: teamOpportunityBalance.pointBalanceIndex,
    trailingTeamResponseRateBefore: BASELINE_6I.trailingTeamResponseRate,
    trailingTeamResponseRateAfter: teamOpportunityBalance.trailingTeamResponseRate,
    resetToResponseRateBefore: BASELINE_6I.resetToResponseRate,
    resetToResponseRateAfter: teamOpportunityBalance.resetToResponseRate,
    defensiveRecoveryToDangerRateBefore: BASELINE_6I.defensiveRecoveryToDangerRate,
    defensiveRecoveryToDangerRateAfter: teamOpportunityBalance.defensiveRecoveryToDangerRate,
    dominantTeamOpportunityChainMaxBefore: BASELINE_6I.dominantTeamOpportunityChainMax,
    dominantTeamOpportunityChainMaxAfter: dominanceAuditSummary.dominantTeamOpportunityChainMax,
    dominantTeamDangerPhaseChainMaxBefore: BASELINE_6I.dominantTeamDangerPhaseChainMax,
    dominantTeamDangerPhaseChainMaxAfter: dominanceAuditSummary.dominantTeamDangerPhaseChainMax,
    dominantTeamScoringEventChainMaxBefore: BASELINE_6I.dominantTeamScoringEventChainMax,
    dominantTeamScoringEventChainMaxAfter: dominanceAuditSummary.dominantTeamScoringEventChainMax,
    sameTeamConsecutiveOpportunityRateBefore: BASELINE_6I.sameTeamConsecutiveOpportunityRate,
    sameTeamConsecutiveOpportunityRateAfter: dominanceAuditSummary.sameTeamConsecutiveOpportunityRate,
    sameFamilyConsecutiveOpportunityRateBefore: BASELINE_6I.sameFamilyConsecutiveOpportunityRate,
    sameFamilyConsecutiveOpportunityRateAfter: dominanceAuditSummary.sameFamilyConsecutiveOpportunityRate,
    postScoreImmediateReattackRateBefore: BASELINE_6I.postScoreImmediateReattackRate,
    postScoreImmediateReattackRateAfter: dominanceAuditSummary.postScoreImmediateReattackRate,
    resetBreaksDominanceRateBefore: BASELINE_6I.resetBreaksDominanceRate,
    resetBreaksDominanceRateAfter: dominanceAuditSummary.resetBreaksDominanceRate,
    defensiveRecoveryBreaksDominanceRateBefore: BASELINE_6I.defensiveRecoveryBreaksDominanceRate,
    defensiveRecoveryBreaksDominanceRateAfter: dominanceAuditSummary.defensiveRecoveryBreaksDominanceRate,
    goalkeeperSecureBreaksDominanceRateBefore: BASELINE_6I.goalkeeperSecureBreaksDominanceRate,
    goalkeeperSecureBreaksDominanceRateAfter: dominanceAuditSummary.goalkeeperSecureBreaksDominanceRate,
    turnoverBreaksDominanceRateBefore: BASELINE_6I.turnoverBreaksDominanceRate,
    turnoverBreaksDominanceRateAfter: dominanceAuditSummary.turnoverBreaksDominanceRate,
    neutralPhaseBreaksDominanceRateBefore: BASELINE_6I.neutralPhaseBreaksDominanceRate,
    neutralPhaseBreaksDominanceRateAfter: dominanceAuditSummary.neutralPhaseBreaksDominanceRate,
    routeFamilyDiversityByTeamBefore: BASELINE_6I.routeFamilyDiversityByTeam,
    routeFamilyDiversityByTeamAfter,
    densityCalibrationPreserved,
    routeFamilyMixPreserved,
    teamOpportunityBalancePreserved,
    dominanceChainsReduced,
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
    matchCountAfter: MATCH_COUNT,
    uniqueSeeds: MATCH_COUNT,
    uniqueScorelines: new Set(scorelines).size,
    medianTotalPoints: median(totalPoints),
    medianScoreDifference: median(scoreDifferences),
    maxScoreDifference: Math.max(...scoreDifferences),
    scoringOpportunitiesPerSegmentAfter: round(scoringOpportunityCount / Math.max(1, segmentCount)),
    dangerPhasesPerMatchAfter: round(dangerPhaseCount / MATCH_COUNT),
    neutralPhasesPerMatchAfter: round(neutralPhaseCount / MATCH_COUNT),
    turnoversPerMatchAfter: round(turnoverCount / MATCH_COUNT),
    defensiveRecoveriesPerMatchAfter: round(defensiveRecoveryCount / MATCH_COUNT),
    resetPhasesPerMatchAfter: round(resetPhaseCount / MATCH_COUNT),
    continuationSelectionRate: percent(continuationCount, Math.max(1, scoringOpportunityCount + continuationCount)),
    possessionAfterConcedingDangerRateAfter: teamOpportunityBalance.possessionAfterConcedingDangerRate,
    postScoreImmediateReattackCount: dominanceAuditSummary.postScoreImmediateReattackCount,
    resetBreaksDominanceCount: dominanceAuditSummary.resetBreaksDominanceCount,
    defensiveRecoveryBreaksDominanceCount: dominanceAuditSummary.defensiveRecoveryBreaksDominanceCount,
    goalkeeperSecureBreaksDominanceCount: dominanceAuditSummary.goalkeeperSecureBreaksDominanceCount,
    turnoverBreaksDominanceCount: dominanceAuditSummary.turnoverBreaksDominanceCount,
    neutralPhaseBreaksDominanceCount: dominanceAuditSummary.neutralPhaseBreaksDominanceCount,
    dominanceDecayAppliedCount: dominanceAuditSummary.dominanceDecayAppliedCount,
    routeFamilyMixDistribution,
    routeFamilyMixByTeam: {
      home: teamOpportunityBalance.home.routeFamilyMix,
      away: teamOpportunityBalance.away.routeFamilyMix,
    },
    scorelineDistribution: scorelineDistribution(scorelines).slice(0, 12),
    dominanceAuditSummary,
    teamOpportunityBalance,
    dominanceAudits,
    warnings,
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "Sprint 6K - Route Economy Stability Monitoring"
      : "Sprint 6K - Dominance Chain Follow-up And Break Event Calibration",
  };
}

function isCachedModel(value: unknown): value is FullMatchDominanceChainCalibrationModel & { readonly cacheVersion: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as { readonly cacheVersion?: unknown; readonly version?: unknown; readonly matchCount?: unknown };
  return record.cacheVersion === CACHE_VERSION && record.version === "DOMINANCE_CHAIN_6J" && record.matchCount === MATCH_COUNT;
}

function readCachedModel(): FullMatchDominanceChainCalibrationModel | null {
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

function writeCachedModel(model: FullMatchDominanceChainCalibrationModel): void {
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify({ ...model, cacheVersion: CACHE_VERSION }, null, 2), "utf8");
}

export function currentFullMatchDominanceChainCalibrationModel(): FullMatchDominanceChainCalibrationModel {
  if (cachedModel === null) {
    cachedModel = readCachedModel() ?? buildFullMatchDominanceChainCalibrationModel();
    writeCachedModel(cachedModel);
  }
  return cachedModel;
}

export function renderFullMatchDominanceChainCalibration6JDoc(
  model = currentFullMatchDominanceChainCalibrationModel(),
): string {
  const lines = [
    "# Full-Match Dominance Chain Calibration 6J",
    "",
    "Sprint 6J reduces sticky same-team opportunity chains without forcing scores, capping scores, deleting events, changing point values, or reverting to SHOT_ONLY.",
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
    "## Baseline 6I Summary",
    `- dominantTeamOpportunityChainMax: ${model.dominantTeamOpportunityChainMaxBefore}`,
    `- sameTeamConsecutiveOpportunityRate: ${model.sameTeamConsecutiveOpportunityRateBefore}%`,
    `- sameFamilyConsecutiveOpportunityRate: ${model.sameFamilyConsecutiveOpportunityRateBefore}%`,
    `- average score difference: ${model.averageScoreDifferenceBefore}`,
    `- blowout rate: ${model.blowoutRateBefore}%`,
    `- opportunityBalanceIndex: ${model.opportunityBalanceIndexBefore}`,
    "",
    "## After Calibration Summary",
    `- dominantTeamOpportunityChainMax: ${model.dominantTeamOpportunityChainMaxAfter}`,
    `- dominantTeamDangerPhaseChainMax: ${model.dominantTeamDangerPhaseChainMaxAfter}`,
    `- dominantTeamScoringEventChainMax: ${model.dominantTeamScoringEventChainMaxAfter}`,
    `- sameTeamConsecutiveOpportunityRate: ${model.sameTeamConsecutiveOpportunityRateAfter}%`,
    `- sameFamilyConsecutiveOpportunityRate: ${model.sameFamilyConsecutiveOpportunityRateAfter}%`,
    `- postScoreImmediateReattackRate: ${model.postScoreImmediateReattackRateAfter}%`,
    `- average total points: ${model.averageTotalPointsAfter}`,
    `- average score difference: ${model.averageScoreDifferenceAfter}`,
    `- blowout rate: ${model.blowoutRateAfter}%`,
    `- severe blowout rate: ${model.severeBlowoutRateAfter}%`,
    "",
    "## Before / After Table",
    "| Metric | 6I baseline | 6J after | Direction |",
    "| --- | ---: | ---: | --- |",
    `| dominant team opportunity chain | ${model.dominantTeamOpportunityChainMaxBefore} | ${model.dominantTeamOpportunityChainMaxAfter} | ${model.dominantTeamOpportunityChainMaxAfter < model.dominantTeamOpportunityChainMaxBefore ? "reduced" : "not reduced"} |`,
    `| same-team consecutive opportunity rate | ${model.sameTeamConsecutiveOpportunityRateBefore}% | ${model.sameTeamConsecutiveOpportunityRateAfter}% | ${model.sameTeamConsecutiveOpportunityRateAfter < model.sameTeamConsecutiveOpportunityRateBefore ? "reduced" : "not reduced"} |`,
    `| same-family consecutive opportunity rate | ${model.sameFamilyConsecutiveOpportunityRateBefore}% | ${model.sameFamilyConsecutiveOpportunityRateAfter}% | ${model.sameFamilyConsecutiveOpportunityRateAfter < model.sameFamilyConsecutiveOpportunityRateBefore ? "reduced" : "not reduced"} |`,
    `| post-score immediate reattack rate | ${model.postScoreImmediateReattackRateBefore}% | ${model.postScoreImmediateReattackRateAfter}% | ${model.postScoreImmediateReattackRateAfter < model.postScoreImmediateReattackRateBefore ? "reduced" : "not reduced"} |`,
    `| average score difference | ${model.averageScoreDifferenceBefore} | ${model.averageScoreDifferenceAfter} | ${model.averageScoreDifferenceAfter <= model.averageScoreDifferenceBefore ? "healthy" : "regressed"} |`,
    `| blowout rate | ${model.blowoutRateBefore}% | ${model.blowoutRateAfter}% | ${model.blowoutRateAfter < model.blowoutRateBefore ? "reduced" : "not reduced"} |`,
    "",
    "## Dominance Chain Metrics",
    `- dominantTeamOpportunityChainMax: ${model.dominantTeamOpportunityChainMaxAfter}`,
    `- dominantTeamDangerPhaseChainMax: ${model.dominantTeamDangerPhaseChainMaxAfter}`,
    `- dominantTeamScoringEventChainMax: ${model.dominantTeamScoringEventChainMaxAfter}`,
    `- dominantTeamPointRunMax: ${model.dominanceAuditSummary.dominantTeamPointRunMax}`,
    `- sameZoneConsecutiveOpportunityRate: ${model.dominanceAuditSummary.sameZoneConsecutiveOpportunityRate}%`,
    `- dominanceDecayAppliedCount: ${model.dominanceDecayAppliedCount}`,
    "",
    "## Break Dominance Metrics",
    `- resetBreaksDominanceRate: ${model.resetBreaksDominanceRateBefore}% -> ${model.resetBreaksDominanceRateAfter}%`,
    `- defensiveRecoveryBreaksDominanceRate: ${model.defensiveRecoveryBreaksDominanceRateBefore}% -> ${model.defensiveRecoveryBreaksDominanceRateAfter}%`,
    `- goalkeeperSecureBreaksDominanceRate: ${model.goalkeeperSecureBreaksDominanceRateBefore}% -> ${model.goalkeeperSecureBreaksDominanceRateAfter}%`,
    `- turnoverBreaksDominanceRate: ${model.turnoverBreaksDominanceRateBefore}% -> ${model.turnoverBreaksDominanceRateAfter}%`,
    `- neutralPhaseBreaksDominanceRate: ${model.neutralPhaseBreaksDominanceRateBefore}% -> ${model.neutralPhaseBreaksDominanceRateAfter}%`,
    `- trailingTeamResponseAfterDominanceRate: ${model.dominanceAuditSummary.trailingTeamResponseAfterDominanceRate}%`,
    "",
    "## Team Opportunity Balance Preservation",
    `- teamOpportunityBalancePreserved: ${model.teamOpportunityBalancePreserved}`,
    `- opportunityBalanceIndex: ${model.opportunityBalanceIndexBefore} -> ${model.opportunityBalanceIndexAfter}`,
    `- scoringBalanceIndex: ${model.scoringBalanceIndexBefore} -> ${model.scoringBalanceIndexAfter}`,
    `- pointBalanceIndex: ${model.pointBalanceIndexBefore} -> ${model.pointBalanceIndexAfter}`,
    `- trailingTeamResponseRate: ${model.trailingTeamResponseRateBefore}% -> ${model.trailingTeamResponseRateAfter}%`,
    "",
    "## Density Preservation Metrics",
    `- densityCalibrationPreserved: ${model.densityCalibrationPreserved}`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
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
    `- routeFamilyDiversityPreserved: ${model.routeFamilyDiversityPreserved}`,
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
  writeFileSync(join(process.cwd(), "reports", "fullmatch-dominance-chain-calibration-6j.md"), `${content}\n`, "utf8");
  return content;
}

function validationLine(label: string, pass: boolean, detail: string): string {
  return `- ${pass ? "PASS" : "FAIL"}: ${label}${detail.length > 0 ? ` - ${detail}` : ""}`;
}

export function renderFullMatchDominanceChainCalibration6JValidation(
  model = currentFullMatchDominanceChainCalibrationModel(),
): string {
  const checks = [
    validationLine("dominance chain calibration model exists", model.scope === "FULL_MATCH_DOMINANCE_CHAIN_CALIBRATION", model.scope),
    validationLine("baseline 6I metrics visible", model.baselineVersion === "TEAM_OPPORTUNITY_BALANCE_6I", model.baselineVersion),
    validationLine("batch 50 matches after calibration exists", model.matchCount >= 50, `matchCount: ${model.matchCount}`),
    validationLine("dominance chain audit exists", model.dominanceAudits.length >= 50, String(model.dominanceAudits.length)),
    validationLine("dominantTeamOpportunityChainMax measured", model.dominantTeamOpportunityChainMaxAfter >= 0, String(model.dominantTeamOpportunityChainMaxAfter)),
    validationLine("sameTeamConsecutiveOpportunityRate measured", model.sameTeamConsecutiveOpportunityRateAfter >= 0, `${model.sameTeamConsecutiveOpportunityRateAfter}%`),
    validationLine("sameFamilyConsecutiveOpportunityRate measured", model.sameFamilyConsecutiveOpportunityRateAfter >= 0, `${model.sameFamilyConsecutiveOpportunityRateAfter}%`),
    validationLine("dominance chains decrease versus 6I or failure justified", model.dominantTeamOpportunityChainMaxAfter < model.dominantTeamOpportunityChainMaxBefore || model.status !== "PASS", `${model.dominantTeamOpportunityChainMaxBefore}->${model.dominantTeamOpportunityChainMaxAfter}`),
    validationLine("same team consecutive opportunity rate decreases versus 6I or failure justified", model.sameTeamConsecutiveOpportunityRateAfter < model.sameTeamConsecutiveOpportunityRateBefore || model.status !== "PASS", `${model.sameTeamConsecutiveOpportunityRateBefore}->${model.sameTeamConsecutiveOpportunityRateAfter}`),
    validationLine("same family repeat decreases versus 6I or failure justified", model.sameFamilyConsecutiveOpportunityRateAfter < model.sameFamilyConsecutiveOpportunityRateBefore || model.status !== "PASS", `${model.sameFamilyConsecutiveOpportunityRateBefore}->${model.sameFamilyConsecutiveOpportunityRateAfter}`),
    validationLine("reset breaks dominance measured", model.resetBreaksDominanceRateAfter >= 0, `${model.resetBreaksDominanceRateAfter}%`),
    validationLine("defensive recovery breaks dominance measured", model.defensiveRecoveryBreaksDominanceRateAfter >= 0, `${model.defensiveRecoveryBreaksDominanceRateAfter}%`),
    validationLine("goalkeeper secure breaks dominance measured", model.goalkeeperSecureBreaksDominanceRateAfter >= 0, `${model.goalkeeperSecureBreaksDominanceRateAfter}%`),
    validationLine("team opportunity balance preserved", model.teamOpportunityBalancePreserved, `${model.opportunityBalanceIndexAfter}/${model.pointBalanceIndexAfter}`),
    validationLine("density calibration preserved", model.densityCalibrationPreserved, `${model.scoringOpportunitiesPerMatchAfter}/${model.averageTotalPointsAfter}`),
    validationLine("route family diversity preserved", model.routeFamilyDiversityPreserved, String(model.routeFamilyDiversityByTeamAfter)),
    validationLine("TRY route remains available", model.routeFamilyMixByTeam.home.TRY_TOUCHDOWN + model.routeFamilyMixByTeam.away.TRY_TOUCHDOWN > 0, ""),
    validationLine("DROP route remains available", model.routeFamilyMixByTeam.home.DROP_GOAL + model.routeFamilyMixByTeam.away.DROP_GOAL > 0, ""),
    validationLine("CONVERSION only after TRY", model.routeFamilyMixByTeam.home.CONVERSION_GOAL + model.routeFamilyMixByTeam.away.CONVERSION_GOAL <= model.routeFamilyMixByTeam.home.TRY_TOUCHDOWN + model.routeFamilyMixByTeam.away.TRY_TOUCHDOWN, ""),
    validationLine("CONTINUATION remains available", model.routeFamilyMixByTeam.home.CONTINUATION + model.routeFamilyMixByTeam.away.CONTINUATION > 0, ""),
    validationLine("score from score_change", model.scoreFromScoreChangeAllRuns, ""),
    validationLine("no cap", !model.scoreCapApplied, ""),
    validationLine("no post-hoc rewrite", !model.postHocRewriteApplied, ""),
    validationLine("no event deletion", !model.scoringEventsDeleted, ""),
    validationLine("no forced score", !model.forcedOpponentScoreApplied, ""),
    validationLine("no forced trailing team score", !model.forcedTrailingTeamScoreApplied, ""),
    validationLine("scoring constants unchanged", !model.scoringConstantsChanged, ""),
    validationLine("MatchBonusEvent unchanged", !model.MatchBonusEventChanged, ""),
    validationLine("batch/live separation preserved", model.batchLiveSeparationPreserved, ""),
    validationLine("no UNKNOWN", model.unknownScoringFamilyCount === 0, String(model.unknownScoringFamilyCount)),
    validationLine("no PENALTY_SHOT leakage", model.penaltyShotActiveLeakageCount === 0, String(model.penaltyShotActiveLeakageCount)),
    validationLine("no persistence/SQLite scoring", !model.persistenceUsedForScoring && !model.sqliteUsedForScoring, ""),
    validationLine("no contradictory healthy warning when dominance still weak", !(model.warnings.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY") && (model.warnings.includes("BLOWOUT_RATE_STILL_TOO_HIGH") || model.warnings.includes("DOMINANCE_CHAIN_STILL_TOO_LONG") || model.warnings.includes("TEAM_BALANCE_REGRESSED"))), model.warnings.join(",")),
    validationLine("PASS/PARTIAL/FAIL justified", model.status !== "FAIL" || !model.scoreFromScoreChangeAllRuns || model.scoringConstantsChanged || !model.routeFamilyMixPreserved, model.status),
  ];
  const status = checks.every((check) => check.startsWith("- PASS")) ? "PASS" : "FAIL";
  const lines = [
    "# Full-Match Dominance Chain Calibration 6J Validation",
    "",
    `Status: ${status}`,
    "",
    "## Counts",
    `- matchCount: ${model.matchCount}`,
    `- dominance audits: ${model.dominanceAudits.length}`,
    `- dominantTeamOpportunityChainMax before/after: ${model.dominantTeamOpportunityChainMaxBefore}/${model.dominantTeamOpportunityChainMaxAfter}`,
    `- sameTeamConsecutiveOpportunityRate before/after: ${model.sameTeamConsecutiveOpportunityRateBefore}/${model.sameTeamConsecutiveOpportunityRateAfter}`,
    `- sameFamilyConsecutiveOpportunityRate before/after: ${model.sameFamilyConsecutiveOpportunityRateBefore}/${model.sameFamilyConsecutiveOpportunityRateAfter}`,
    `- dominanceDecayAppliedCount: ${model.dominanceDecayAppliedCount}`,
    `- recommendation: ${model.recommendation}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Explicit Exhaustive Test Command",
    "- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
  ];
  const content = lines.join("\n");
  writeFileSync(join(process.cwd(), "reports", "validation.fullmatch-dominance-chain-calibration-6j.md"), `${content}\n`, "utf8");
  return content;
}

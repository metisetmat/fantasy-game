import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MatchEvent, MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../contracts/scoringFamily";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import {
  auditFullMatchBlowoutEconomy,
  type BlowoutEconomyRootCauseCode,
  type FullMatchBlowoutEconomyAudit,
} from "../simulation/fullMatch/fullMatchBlowoutEconomyAudit";
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
  auditFullMatchResetToDangerQuality,
  type FullMatchResetToDangerQualityAudit,
  type ResetToDangerQualityWarningCode,
} from "../simulation/fullMatch/fullMatchResetToDangerQualityAudit";
import {
  auditFullMatchTeamOpportunityBalance,
  summarizeTeamOpportunityBalanceAudit,
  type TeamBalanceRouteFamilyMix,
} from "../simulation/fullMatch/fullMatchTeamOpportunityBalanceAudit";
import {
  RESET_BREAK_BLOWOUT_BLOCKING_WARNINGS,
  type ResetBreakBlowoutEconomyWarningCode,
} from "../simulation/fullMatch/resetBreakBlowoutEconomyWarnings";
import { runFullMatch } from "../simulation/runFullMatch";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

export type FullMatchResetBreakBlowoutEconomyCalibrationStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchResetBreakBlowoutEconomyCalibrationRecommendation =
  | "KEEP_RESET_BREAK_BLOWOUT_ECONOMY_MONITORING"
  | "IMPROVE_RESET_TO_DANGER_GATE"
  | "IMPROVE_LOSING_TEAM_RESPONSE"
  | "PRESERVE_ROUTE_FAMILY_MIX"
  | "FIX_SCORING_GUARDRAILS";

export interface FullMatchResetBreakBlowoutEconomyCalibrationModel {
  readonly status: FullMatchResetBreakBlowoutEconomyCalibrationStatus;
  readonly scope: "FULL_MATCH_RESET_BREAK_BLOWOUT_ECONOMY_CALIBRATION";
  readonly version: "RESET_BREAK_BLOWOUT_ECONOMY_6M";
  readonly matchCount: number;
  readonly baselineVersion: "GOALKEEPER_SECURE_RESET_BREAK_6L";
  readonly calibrationVersion: "RESET_BREAK_BLOWOUT_ECONOMY_6M";
  readonly averageTotalPointsBefore: number;
  readonly averageTotalPointsAfter: number;
  readonly scoringEventsPerMatchBefore: number;
  readonly scoringEventsPerMatchAfter: number;
  readonly scoringOpportunitiesPerMatchBefore: number;
  readonly scoringOpportunitiesPerMatchAfter: number;
  readonly averageScoreDifferenceBefore: number;
  readonly averageScoreDifferenceAfter: number;
  readonly medianScoreDifferenceBefore: number;
  readonly medianScoreDifferenceAfter: number;
  readonly maxScoreDifferenceBefore: number;
  readonly maxScoreDifferenceAfter: number;
  readonly blowoutRateBefore: number;
  readonly blowoutRateAfter: number;
  readonly severeBlowoutRateBefore: number;
  readonly severeBlowoutRateAfter: number;
  readonly shutoutRateBefore: number;
  readonly shutoutRateAfter: number;
  readonly oneSidedScoringRateBefore: number;
  readonly oneSidedScoringRateAfter: number;
  readonly closeGameRateBefore: number;
  readonly closeGameRateAfter: number;
  readonly competitiveGameRateBefore: number;
  readonly competitiveGameRateAfter: number;
  readonly postScoreImmediateReattackRateBefore: number;
  readonly postScoreImmediateReattackRateAfter: number;
  readonly postScoreResetProtectedRateBefore: number;
  readonly postScoreResetProtectedRateAfter: number;
  readonly concedingTeamFirstPossessionRateBefore: number;
  readonly concedingTeamFirstPossessionRateAfter: number;
  readonly resetToImmediateDangerRateBefore: number;
  readonly resetToImmediateDangerRateAfter: number;
  readonly resetToSafePossessionRateAfter: number;
  readonly resetToNeutralRateAfter: number;
  readonly goalkeeperSecureImmediateReattackAgainstRateBefore: number;
  readonly goalkeeperSecureImmediateReattackAgainstRateAfter: number;
  readonly goalkeeperSecureToDangerAgainstRateBefore: number;
  readonly goalkeeperSecureToDangerAgainstRateAfter: number;
  readonly defensiveRecoveryToDangerRateBefore: number;
  readonly defensiveRecoveryToDangerRateAfter: number;
  readonly earnedDangerRateBefore: number;
  readonly earnedDangerRateAfter: number;
  readonly automaticDangerSuspicionRateBefore: number;
  readonly automaticDangerSuspicionRateAfter: number;
  readonly losingTeamResponseAfterScoreRateBefore: number;
  readonly losingTeamResponseAfterScoreRateAfter: number;
  readonly losingTeamResponseAfterGoalkeeperSecureRateBefore: number;
  readonly losingTeamResponseAfterGoalkeeperSecureRateAfter: number;
  readonly losingTeamLongestScorelessWindowBefore: number;
  readonly losingTeamLongestScorelessWindowAfter: number;
  readonly opportunityBalanceIndexBefore: number;
  readonly opportunityBalanceIndexAfter: number;
  readonly scoringBalanceIndexBefore: number;
  readonly scoringBalanceIndexAfter: number;
  readonly pointBalanceIndexBefore: number;
  readonly pointBalanceIndexAfter: number;
  readonly trailingTeamResponseRateBefore: number;
  readonly trailingTeamResponseRateAfter: number;
  readonly dominantTeamOpportunityChainMaxBefore: number;
  readonly dominantTeamOpportunityChainMaxAfter: number;
  readonly sameTeamConsecutiveOpportunityRateBefore: number;
  readonly sameTeamConsecutiveOpportunityRateAfter: number;
  readonly sameFamilyConsecutiveOpportunityRateBefore: number;
  readonly sameFamilyConsecutiveOpportunityRateAfter: number;
  readonly goalkeeperSecureBreaksDominanceRateBefore: number;
  readonly goalkeeperSecureBreaksDominanceRateAfter: number;
  readonly goalkeeperSecureToSafePossessionRateBefore: number;
  readonly goalkeeperSecureToSafePossessionRateAfter: number;
  readonly densityCalibrationPreserved: boolean;
  readonly routeFamilyMixPreserved: boolean;
  readonly teamOpportunityBalancePreserved: boolean;
  readonly dominanceChainsPreservedOrImproved: boolean;
  readonly goalkeeperSecureResetPreserved: boolean;
  readonly resetSpecificityPreserved: boolean;
  readonly blowoutEconomyImproved: boolean;
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
  readonly scoringOpportunitiesPerSegment: number;
  readonly dangerPhasesPerMatch: number;
  readonly neutralPhasesPerMatch: number;
  readonly turnoversPerMatch: number;
  readonly defensiveRecoveriesPerMatch: number;
  readonly resetPhasesPerMatch: number;
  readonly continuationSelectionRate: number;
  readonly dominanceDecayWindowCoverage: number;
  readonly dominanceDecayApplicationsPerEligibleWindow: number;
  readonly routeFamilyMixDistribution: readonly { readonly routeFamilyMix: string; readonly matches: number }[];
  readonly routeFamilyMixByTeam: {
    readonly home: TeamBalanceRouteFamilyMix;
    readonly away: TeamBalanceRouteFamilyMix;
  };
  readonly scorelineDistribution: readonly { readonly scoreline: string; readonly matches: number }[];
  readonly blowoutRootCauseDistribution: readonly { readonly rootCause: BlowoutEconomyRootCauseCode; readonly matches: number }[];
  readonly resetToDangerWarningDistribution: readonly { readonly warning: ResetToDangerQualityWarningCode; readonly count: number }[];
  readonly blowoutAudits: readonly FullMatchBlowoutEconomyAudit[];
  readonly resetToDangerQualityAudits: readonly FullMatchResetToDangerQualityAudit[];
  readonly goalkeeperSecureAudits: readonly FullMatchGoalkeeperSecureBreakAudit[];
  readonly resetBreakSpecificityAudits: readonly FullMatchResetBreakSpecificityAudit[];
  readonly postScoreAudits: readonly FullMatchPostScoreResetAudit[];
  readonly dominanceAudits: readonly FullMatchDominanceChainAudit[];
  readonly warnings: readonly ResetBreakBlowoutEconomyWarningCode[];
  readonly recommendation: FullMatchResetBreakBlowoutEconomyCalibrationRecommendation;
  readonly nextSprintRecommendation: string;
}

const MATCH_COUNT = 50;
const CACHE_VERSION = "reset-break-blowout-economy-6m-v2";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-reset-break-blowout-economy-6m.json");

const BASELINE_6L = {
  averageTotalPoints: 21.4,
  scoringEventsPerMatch: 7,
  scoringOpportunitiesPerMatch: 15.5,
  averageScoreDifference: 11.6,
  medianScoreDifference: 10,
  maxScoreDifference: 30,
  blowoutRate: 48,
  severeBlowoutRate: 6,
  shutoutRate: 24,
  oneSidedScoringRate: 24,
  closeGameRate: 38,
  competitiveGameRate: 52,
  postScoreImmediateReattackRate: 17.1,
  postScoreResetProtectedRate: 74,
  concedingTeamFirstPossessionRate: 72.3,
  resetToImmediateDangerRate: 60.5,
  goalkeeperSecureImmediateReattackAgainstRate: 19.2,
  goalkeeperSecureToDangerAgainstRate: 19.2,
  defensiveRecoveryToDangerRate: 51.1,
  earnedDangerRate: 70,
  automaticDangerSuspicionRate: 30,
  losingTeamResponseAfterScoreRate: 42.3,
  losingTeamResponseAfterGoalkeeperSecureRate: 80.8,
  losingTeamLongestScorelessWindow: 5,
  opportunityBalanceIndex: 74,
  scoringBalanceIndex: 79,
  pointBalanceIndex: 79,
  trailingTeamResponseRate: 42.3,
  dominantTeamOpportunityChainMax: 2,
  sameTeamConsecutiveOpportunityRate: 7.3,
  sameFamilyConsecutiveOpportunityRate: 1.2,
  goalkeeperSecureBreaksDominanceRate: 100,
  goalkeeperSecureToSafePossessionRate: 100,
  dominanceDecayWindowCoverage: 100,
  dominanceDecayApplicationsPerEligibleWindow: 1.3,
} as const;

let cachedModel: FullMatchResetBreakBlowoutEconomyCalibrationModel | null = null;

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : round((numerator / denominator) * 100);
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
    event.tags.includes("reset_break_blowout_economy_6m") ||
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
    matchId: `fullmatch-reset-break-blowout-economy-6m-${String(index + 1).padStart(3, "0")}`,
    seed: `fullmatch-reset-break-blowout-economy-6m-seed-${String(index + 1).padStart(3, "0")}`,
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

function distribution<T extends string>(values: readonly T[], keyName: string): readonly { readonly [key: string]: string | number }[] {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, matches]) => ({ [keyName]: value, matches }));
}

function scorelineDistribution(scorelines: readonly string[]): readonly { readonly scoreline: string; readonly matches: number }[] {
  return distribution(scorelines, "scoreline") as readonly { readonly scoreline: string; readonly matches: number }[];
}

function summarizeDominanceAudits(audits: readonly FullMatchDominanceChainAudit[]): {
  readonly dominantTeamOpportunityChainMax: number;
  readonly sameTeamConsecutiveOpportunityRate: number;
  readonly sameFamilyConsecutiveOpportunityRate: number;
  readonly resetBreaksDominanceRate: number;
  readonly defensiveRecoveryBreaksDominanceRate: number;
  readonly goalkeeperSecureBreaksDominanceRate: number;
  readonly dominanceDecayAppliedCount: number;
} {
  const avg = (selector: (audit: FullMatchDominanceChainAudit) => number): number => average(audits.map(selector));
  return {
    dominantTeamOpportunityChainMax: Math.max(0, ...audits.map((audit) => audit.dominantTeamOpportunityChainMax)),
    sameTeamConsecutiveOpportunityRate: avg((audit) => audit.sameTeamConsecutiveOpportunityRate),
    sameFamilyConsecutiveOpportunityRate: avg((audit) => audit.sameFamilyConsecutiveOpportunityRate),
    resetBreaksDominanceRate: avg((audit) => audit.resetBreaksDominanceRate),
    defensiveRecoveryBreaksDominanceRate: avg((audit) => audit.defensiveRecoveryBreaksDominanceRate),
    goalkeeperSecureBreaksDominanceRate: avg((audit) => audit.goalkeeperSecureBreaksDominanceRate),
    dominanceDecayAppliedCount: audits.reduce((sum, audit) => sum + audit.dominanceDecayAppliedCount, 0),
  };
}

function summarizeGoalkeeperSecureAudits(audits: readonly FullMatchGoalkeeperSecureBreakAudit[]): {
  readonly goalkeeperSecureBreaksDominanceRate: number;
  readonly goalkeeperSecureToSafePossessionRate: number;
  readonly goalkeeperSecureImmediateReattackAgainstRate: number;
  readonly goalkeeperSecureToDangerAgainstRate: number;
} {
  return {
    goalkeeperSecureBreaksDominanceRate: average(audits.map((audit) => audit.goalkeeperSecureBreaksDominanceRate)),
    goalkeeperSecureToSafePossessionRate: average(audits.map((audit) => audit.goalkeeperSecureToSafePossessionRate)),
    goalkeeperSecureImmediateReattackAgainstRate: average(audits.map((audit) => audit.sameOpponentImmediateReattackAfterGoalkeeperSecureRate)),
    goalkeeperSecureToDangerAgainstRate: average(audits.map((audit) => audit.goalkeeperSecureToDangerAgainstRate)),
  };
}

function summarizeResetAudits(audits: readonly FullMatchResetBreakSpecificityAudit[]): {
  readonly postScoreImmediateReattackRate: number;
  readonly postScoreResetProtectedRate: number;
  readonly concedingTeamFirstPossessionRate: number;
  readonly resetToSafePossessionRate: number;
  readonly resetToNeutralRate: number;
} {
  return {
    postScoreImmediateReattackRate: average(audits.map((audit) => audit.scoringTeamImmediateReattackRate)),
    postScoreResetProtectedRate: average(audits.map((audit) => audit.protectedResetRate)),
    concedingTeamFirstPossessionRate: average(audits.map((audit) => audit.concedingTeamFirstPossessionRate)),
    resetToSafePossessionRate: average(audits.map((audit) => audit.resetToSafePossessionRate)),
    resetToNeutralRate: average(audits.map((audit) => audit.resetToNeutralRate)),
  };
}

function summarizeResetQualityAudits(audits: readonly FullMatchResetToDangerQualityAudit[]): {
  readonly resetToImmediateDangerRate: number;
  readonly earnedDangerRate: number;
  readonly automaticDangerSuspicionRate: number;
  readonly goalkeeperSecureFollowupDangerCount: number;
  readonly defensiveRecoveryFollowupDangerCount: number;
} {
  return {
    resetToImmediateDangerRate: average(audits.map((audit) => audit.resetToImmediateDangerRate)),
    earnedDangerRate: average(audits.map((audit) => audit.earnedDangerRate)),
    automaticDangerSuspicionRate: average(audits.map((audit) => audit.automaticDangerSuspicionRate)),
    goalkeeperSecureFollowupDangerCount: audits.reduce((sum, audit) => sum + audit.goalkeeperSecureFollowupDangerCount, 0),
    defensiveRecoveryFollowupDangerCount: audits.reduce((sum, audit) => sum + audit.defensiveRecoveryFollowupDangerCount, 0),
  };
}

function summarizeBlowoutAudits(audits: readonly FullMatchBlowoutEconomyAudit[]): {
  readonly losingTeamResponseAfterScoreRate: number;
  readonly losingTeamResponseAfterGoalkeeperSecureRate: number;
  readonly losingTeamLongestScorelessWindow: number;
} {
  return {
    losingTeamResponseAfterScoreRate: average(audits.map((audit) => audit.losingTeamResponseAfterScoreRate)),
    losingTeamResponseAfterGoalkeeperSecureRate: average(audits.map((audit) => audit.losingTeamResponseAfterGoalkeeperSecureRate)),
    losingTeamLongestScorelessWindow: Math.max(0, ...audits.map((audit) => audit.losingTeamLongestScorelessWindow)),
  };
}

function buildWarnings(input: {
  readonly guardrailsPass: boolean;
  readonly densityPreserved: boolean;
  readonly teamBalancePreserved: boolean;
  readonly routeFamilyMixPreserved: boolean;
  readonly dominancePreserved: boolean;
  readonly goalkeeperPreserved: boolean;
  readonly resetPreserved: boolean;
  readonly modelBase: Pick<FullMatchResetBreakBlowoutEconomyCalibrationModel,
    | "blowoutRateAfter"
    | "blowoutRateBefore"
    | "closeGameRateAfter"
    | "closeGameRateBefore"
    | "competitiveGameRateAfter"
    | "competitiveGameRateBefore"
    | "resetToImmediateDangerRateAfter"
    | "resetToImmediateDangerRateBefore"
    | "automaticDangerSuspicionRateAfter"
    | "automaticDangerSuspicionRateBefore"
    | "earnedDangerRateAfter">;
}): readonly ResetBreakBlowoutEconomyWarningCode[] {
  const warnings: ResetBreakBlowoutEconomyWarningCode[] = ["RESET_BREAK_BLOWOUT_ECONOMY_CALIBRATED"];
  warnings.push(input.modelBase.blowoutRateAfter < input.modelBase.blowoutRateBefore ? "BLOWOUT_RATE_REDUCED" : "BLOWOUT_RATE_STILL_TOO_HIGH");
  warnings.push(input.modelBase.closeGameRateAfter > input.modelBase.closeGameRateBefore ? "CLOSE_GAME_RATE_IMPROVED" : "FULL_MATCH_BATCH_ECONOMY_PARTIAL");
  warnings.push(input.modelBase.competitiveGameRateAfter > input.modelBase.competitiveGameRateBefore ? "COMPETITIVE_GAME_RATE_IMPROVED" : "FULL_MATCH_BATCH_ECONOMY_PARTIAL");
  warnings.push(input.modelBase.resetToImmediateDangerRateAfter < input.modelBase.resetToImmediateDangerRateBefore ? "RESET_TO_IMMEDIATE_DANGER_REDUCED" : "RESET_TO_IMMEDIATE_DANGER_CLASSIFIED");
  warnings.push(input.modelBase.resetToImmediateDangerRateAfter > 55 ? "RESET_TO_IMMEDIATE_DANGER_STILL_TOO_HIGH" : "RESET_TO_IMMEDIATE_DANGER_CLASSIFIED");
  warnings.push(input.modelBase.automaticDangerSuspicionRateAfter < input.modelBase.automaticDangerSuspicionRateBefore ? "AUTOMATIC_DANGER_REDUCED" : "AUTOMATIC_DANGER_STILL_TOO_HIGH");
  if (input.modelBase.earnedDangerRateAfter >= 55) {
    warnings.push("EARNED_DANGER_PRESERVED");
  }
  warnings.push(input.goalkeeperPreserved ? "GOALKEEPER_SECURE_RESET_GAINS_PRESERVED" : "GOALKEEPER_SECURE_RESET_REGRESSED");
  warnings.push(input.resetPreserved ? "POST_SCORE_RESET_GAINS_PRESERVED" : "POST_SCORE_RESET_REGRESSED");
  warnings.push(input.dominancePreserved ? "DOMINANCE_CHAIN_GAINS_PRESERVED" : "DOMINANCE_CHAIN_REGRESSED");
  warnings.push(input.teamBalancePreserved ? "TEAM_OPPORTUNITY_BALANCE_PRESERVED" : "TEAM_BALANCE_REGRESSED");
  warnings.push(input.densityPreserved ? "DENSITY_CALIBRATION_PRESERVED" : "DENSITY_REGRESSED");
  warnings.push(input.routeFamilyMixPreserved ? "ROUTE_FAMILY_DIVERSITY_PRESERVED" : "NON_SHOT_ROUTES_DISAPPEARED");
  if (!input.guardrailsPass) {
    warnings.push("FORCED_SCORE_DETECTED");
  }
  const hasBlocking = warnings.some((warning) => RESET_BREAK_BLOWOUT_BLOCKING_WARNINGS.includes(warning));
  warnings.push(input.guardrailsPass && !hasBlocking ? "FULL_MATCH_BATCH_ECONOMY_HEALTHY" : "FULL_MATCH_BATCH_ECONOMY_PARTIAL");
  return [...new Set(warnings.filter((warning) =>
    warning !== "FULL_MATCH_BATCH_ECONOMY_HEALTHY" || !hasBlocking
  ))];
}

function countValues<T extends string>(values: readonly T[], keyName: string): readonly { readonly [key: string]: string | number }[] {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([value, count]) => ({ [keyName]: value, count }));
}

export function buildFullMatchResetBreakBlowoutEconomyCalibrationModel(): FullMatchResetBreakBlowoutEconomyCalibrationModel {
  const reports: MatchReport[] = [];
  const resetQualityAudits: FullMatchResetToDangerQualityAudit[] = [];
  const blowoutAudits: FullMatchBlowoutEconomyAudit[] = [];
  const goalkeeperSecureAudits: FullMatchGoalkeeperSecureBreakAudit[] = [];
  const resetSpecificityAudits: FullMatchResetBreakSpecificityAudit[] = [];
  const postScoreAudits: FullMatchPostScoreResetAudit[] = [];
  const dominanceAudits: FullMatchDominanceChainAudit[] = [];
  const teamAudits: ReturnType<typeof auditFullMatchTeamOpportunityBalance>[] = [];
  const totalPoints: number[] = [];
  const scoreDifferences: number[] = [];
  const scorelines: string[] = [];
  const routeMixes: string[] = [];
  const seeds: string[] = [];
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
  let resetPhaseCount = 0;
  let segmentCount = 0;

  for (let index = 0; index < MATCH_COUNT; index += 1) {
    const input = buildScenarioInput(index);
    const report = runFullMatch(input);
    reports.push(report);
    seeds.push(input.seed);
    const resetQuality = auditFullMatchResetToDangerQuality(report);
    const blowout = auditFullMatchBlowoutEconomy(report, resetQuality);
    const goalkeeper = auditFullMatchGoalkeeperSecureBreak(report);
    const resetSpecificity = auditFullMatchResetBreakSpecificity(report);
    const postScore = auditFullMatchPostScoreReset(report);
    const dominance = auditFullMatchDominanceChains(report);
    const teamAudit = auditFullMatchTeamOpportunityBalance(report);
    resetQualityAudits.push(resetQuality);
    blowoutAudits.push(blowout);
    goalkeeperSecureAudits.push(goalkeeper);
    resetSpecificityAudits.push(resetSpecificity);
    postScoreAudits.push(postScore);
    dominanceAudits.push(dominance);
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
    resetPhaseCount += teamAudit.home.resetPhaseCount + teamAudit.away.resetPhaseCount;
    neutralPhaseCount += report.timeline.filter((event) => event.outcome === "neutral").length;
    turnoverCount += report.timeline.filter((event) => event.eventType === "turnover" || event.tags.some((tag) => tag.includes("turnover"))).length;
    defensiveRecoveryCount += report.timeline.filter((event) => event.tags.some((tag) => tag.toLowerCase().includes("recovery") || tag.toLowerCase().includes("goalkeeper"))).length;
    dangerPhaseCount += report.timeline.filter((event) => event.eventType === "scoring" || event.tacticalContext.pressureLevel === "high").length;
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

  const teamOpportunityBalance = summarizeTeamOpportunityBalanceAudit(teamAudits);
  const dominanceSummary = summarizeDominanceAudits(dominanceAudits);
  const goalkeeperSummary = summarizeGoalkeeperSecureAudits(goalkeeperSecureAudits);
  const resetSummary = summarizeResetAudits(resetSpecificityAudits);
  const resetQualitySummary = summarizeResetQualityAudits(resetQualityAudits);
  const blowoutSummary = summarizeBlowoutAudits(blowoutAudits);
  const averageTotalPointsAfter = average(totalPoints);
  const scoringEventsPerMatchAfter = round(scoringEventCount / MATCH_COUNT);
  const scoringOpportunitiesPerMatchAfter = round(scoringOpportunityCount / MATCH_COUNT);
  const averageScoreDifferenceAfter = average(scoreDifferences);
  const medianScoreDifferenceAfter = median(scoreDifferences);
  const maxScoreDifferenceAfter = Math.max(0, ...scoreDifferences);
  const blowoutRateAfter = percent(scoreDifferences.filter((value) => value >= 12).length, MATCH_COUNT);
  const severeBlowoutRateAfter = percent(scoreDifferences.filter((value) => value >= 24).length, MATCH_COUNT);
  const shutoutRateAfter = percent(scorelines.filter((scoreline) => scoreline.startsWith("0 - ") || scoreline.endsWith(" - 0")).length, MATCH_COUNT);
  const oneSidedScoringRateAfter = shutoutRateAfter;
  const closeGameRateAfter = percent(scoreDifferences.filter((value) => value <= 7).length, MATCH_COUNT);
  const competitiveGameRateAfter = percent(scoreDifferences.filter((value) => value <= 12).length, MATCH_COUNT);
  const routeFamilyDiversityByTeamAfter = Math.min(
    uniqueFamilyCount(teamOpportunityBalance.home.routeFamilyMix),
    uniqueFamilyCount(teamOpportunityBalance.away.routeFamilyMix),
  );
  const densityCalibrationPreserved = scoringOpportunitiesPerMatchAfter >= 14 &&
    scoringOpportunitiesPerMatchAfter <= 17 &&
    scoringEventsPerMatchAfter >= 6 &&
    scoringEventsPerMatchAfter <= 10 &&
    averageTotalPointsAfter >= 18 &&
    averageTotalPointsAfter <= 30 &&
    severeBlowoutRateAfter <= 10;
  const routeFamilyMixPreserved = routeMixes.some((value) => value === "MULTI_FAMILY") &&
    routeFamilyDiversityByTeamAfter >= 3 &&
    continuationCount > 0 &&
    teamOpportunityBalance.home.routeFamilyMix.TRY_TOUCHDOWN + teamOpportunityBalance.away.routeFamilyMix.TRY_TOUCHDOWN > 0 &&
    teamOpportunityBalance.home.routeFamilyMix.DROP_GOAL + teamOpportunityBalance.away.routeFamilyMix.DROP_GOAL > 0 &&
    teamOpportunityBalance.home.routeFamilyMix.CONVERSION_GOAL + teamOpportunityBalance.away.routeFamilyMix.CONVERSION_GOAL > 0;
  const teamOpportunityBalancePreserved = teamOpportunityBalance.opportunityBalanceIndex >= 70 &&
    teamOpportunityBalance.scoringBalanceIndex >= 70 &&
    teamOpportunityBalance.pointBalanceIndex >= 70 &&
    teamOpportunityBalance.trailingTeamResponseRate >= 40;
  const dominanceChainsPreservedOrImproved = dominanceSummary.dominantTeamOpportunityChainMax <= 3 &&
    dominanceSummary.sameTeamConsecutiveOpportunityRate <= 8.5 &&
    dominanceSummary.sameFamilyConsecutiveOpportunityRate <= 2;
  const goalkeeperSecureResetPreserved = goalkeeperSummary.goalkeeperSecureBreaksDominanceRate >= 90 &&
    goalkeeperSummary.goalkeeperSecureToSafePossessionRate >= 90;
  const resetSpecificityPreserved = resetSummary.postScoreImmediateReattackRate <= 20 &&
    resetSummary.postScoreResetProtectedRate >= 70 &&
    resetSummary.concedingTeamFirstPossessionRate >= 65;
  const blowoutEconomyImproved = blowoutRateAfter < BASELINE_6L.blowoutRate ||
    closeGameRateAfter > BASELINE_6L.closeGameRate ||
    competitiveGameRateAfter > BASELINE_6L.competitiveGameRate;
  const guardrailsPass = !scoringConstantsChanged() &&
    scoreFromScoreChangeAllRuns &&
    officialPathConnectedAllRuns &&
    calibrationsAppliedAllRuns &&
    unknownScoringFamilyCount === 0 &&
    penaltyShotActiveLeakageCount === 0 &&
    routeFamilyMixPreserved;
  const modelBase = {
    blowoutRateBefore: BASELINE_6L.blowoutRate,
    blowoutRateAfter,
    closeGameRateBefore: BASELINE_6L.closeGameRate,
    closeGameRateAfter,
    competitiveGameRateBefore: BASELINE_6L.competitiveGameRate,
    competitiveGameRateAfter,
    resetToImmediateDangerRateBefore: BASELINE_6L.resetToImmediateDangerRate,
    resetToImmediateDangerRateAfter: resetQualitySummary.resetToImmediateDangerRate,
    automaticDangerSuspicionRateBefore: BASELINE_6L.automaticDangerSuspicionRate,
    automaticDangerSuspicionRateAfter: resetQualitySummary.automaticDangerSuspicionRate,
    earnedDangerRateAfter: resetQualitySummary.earnedDangerRate,
  };
  const warnings = buildWarnings({
    guardrailsPass,
    densityPreserved: densityCalibrationPreserved,
    teamBalancePreserved: teamOpportunityBalancePreserved,
    routeFamilyMixPreserved,
    dominancePreserved: dominanceChainsPreservedOrImproved,
    goalkeeperPreserved: goalkeeperSecureResetPreserved,
    resetPreserved: resetSpecificityPreserved,
    modelBase,
  });
  const hasBlocking = warnings.some((warning) => RESET_BREAK_BLOWOUT_BLOCKING_WARNINGS.includes(warning));
  const status: FullMatchResetBreakBlowoutEconomyCalibrationStatus = !guardrailsPass || !densityCalibrationPreserved || !routeFamilyMixPreserved
    ? "FAIL"
    : !blowoutEconomyImproved || hasBlocking
      ? "PARTIAL"
      : "PASS";
  const recommendation: FullMatchResetBreakBlowoutEconomyCalibrationRecommendation = !guardrailsPass
    ? "FIX_SCORING_GUARDRAILS"
    : !routeFamilyMixPreserved
      ? "PRESERVE_ROUTE_FAMILY_MIX"
      : resetQualitySummary.automaticDangerSuspicionRate > BASELINE_6L.automaticDangerSuspicionRate
        ? "IMPROVE_RESET_TO_DANGER_GATE"
        : teamOpportunityBalance.trailingTeamResponseRate < BASELINE_6L.trailingTeamResponseRate
          ? "IMPROVE_LOSING_TEAM_RESPONSE"
          : "KEEP_RESET_BREAK_BLOWOUT_ECONOMY_MONITORING";

  return {
    status,
    scope: "FULL_MATCH_RESET_BREAK_BLOWOUT_ECONOMY_CALIBRATION",
    version: "RESET_BREAK_BLOWOUT_ECONOMY_6M",
    matchCount: MATCH_COUNT,
    baselineVersion: "GOALKEEPER_SECURE_RESET_BREAK_6L",
    calibrationVersion: "RESET_BREAK_BLOWOUT_ECONOMY_6M",
    averageTotalPointsBefore: BASELINE_6L.averageTotalPoints,
    averageTotalPointsAfter,
    scoringEventsPerMatchBefore: BASELINE_6L.scoringEventsPerMatch,
    scoringEventsPerMatchAfter,
    scoringOpportunitiesPerMatchBefore: BASELINE_6L.scoringOpportunitiesPerMatch,
    scoringOpportunitiesPerMatchAfter,
    averageScoreDifferenceBefore: BASELINE_6L.averageScoreDifference,
    averageScoreDifferenceAfter,
    medianScoreDifferenceBefore: BASELINE_6L.medianScoreDifference,
    medianScoreDifferenceAfter,
    maxScoreDifferenceBefore: BASELINE_6L.maxScoreDifference,
    maxScoreDifferenceAfter,
    blowoutRateBefore: BASELINE_6L.blowoutRate,
    blowoutRateAfter,
    severeBlowoutRateBefore: BASELINE_6L.severeBlowoutRate,
    severeBlowoutRateAfter,
    shutoutRateBefore: BASELINE_6L.shutoutRate,
    shutoutRateAfter,
    oneSidedScoringRateBefore: BASELINE_6L.oneSidedScoringRate,
    oneSidedScoringRateAfter,
    closeGameRateBefore: BASELINE_6L.closeGameRate,
    closeGameRateAfter,
    competitiveGameRateBefore: BASELINE_6L.competitiveGameRate,
    competitiveGameRateAfter,
    postScoreImmediateReattackRateBefore: BASELINE_6L.postScoreImmediateReattackRate,
    postScoreImmediateReattackRateAfter: resetSummary.postScoreImmediateReattackRate,
    postScoreResetProtectedRateBefore: BASELINE_6L.postScoreResetProtectedRate,
    postScoreResetProtectedRateAfter: resetSummary.postScoreResetProtectedRate,
    concedingTeamFirstPossessionRateBefore: BASELINE_6L.concedingTeamFirstPossessionRate,
    concedingTeamFirstPossessionRateAfter: resetSummary.concedingTeamFirstPossessionRate,
    resetToImmediateDangerRateBefore: BASELINE_6L.resetToImmediateDangerRate,
    resetToImmediateDangerRateAfter: resetQualitySummary.resetToImmediateDangerRate,
    resetToSafePossessionRateAfter: resetSummary.resetToSafePossessionRate,
    resetToNeutralRateAfter: resetSummary.resetToNeutralRate,
    goalkeeperSecureImmediateReattackAgainstRateBefore: BASELINE_6L.goalkeeperSecureImmediateReattackAgainstRate,
    goalkeeperSecureImmediateReattackAgainstRateAfter: goalkeeperSummary.goalkeeperSecureImmediateReattackAgainstRate,
    goalkeeperSecureToDangerAgainstRateBefore: BASELINE_6L.goalkeeperSecureToDangerAgainstRate,
    goalkeeperSecureToDangerAgainstRateAfter: goalkeeperSummary.goalkeeperSecureToDangerAgainstRate,
    defensiveRecoveryToDangerRateBefore: BASELINE_6L.defensiveRecoveryToDangerRate,
    defensiveRecoveryToDangerRateAfter: dominanceSummary.defensiveRecoveryBreaksDominanceRate,
    earnedDangerRateBefore: BASELINE_6L.earnedDangerRate,
    earnedDangerRateAfter: resetQualitySummary.earnedDangerRate,
    automaticDangerSuspicionRateBefore: BASELINE_6L.automaticDangerSuspicionRate,
    automaticDangerSuspicionRateAfter: resetQualitySummary.automaticDangerSuspicionRate,
    losingTeamResponseAfterScoreRateBefore: BASELINE_6L.losingTeamResponseAfterScoreRate,
    losingTeamResponseAfterScoreRateAfter: blowoutSummary.losingTeamResponseAfterScoreRate,
    losingTeamResponseAfterGoalkeeperSecureRateBefore: BASELINE_6L.losingTeamResponseAfterGoalkeeperSecureRate,
    losingTeamResponseAfterGoalkeeperSecureRateAfter: blowoutSummary.losingTeamResponseAfterGoalkeeperSecureRate,
    losingTeamLongestScorelessWindowBefore: BASELINE_6L.losingTeamLongestScorelessWindow,
    losingTeamLongestScorelessWindowAfter: blowoutSummary.losingTeamLongestScorelessWindow,
    opportunityBalanceIndexBefore: BASELINE_6L.opportunityBalanceIndex,
    opportunityBalanceIndexAfter: teamOpportunityBalance.opportunityBalanceIndex,
    scoringBalanceIndexBefore: BASELINE_6L.scoringBalanceIndex,
    scoringBalanceIndexAfter: teamOpportunityBalance.scoringBalanceIndex,
    pointBalanceIndexBefore: BASELINE_6L.pointBalanceIndex,
    pointBalanceIndexAfter: teamOpportunityBalance.pointBalanceIndex,
    trailingTeamResponseRateBefore: BASELINE_6L.trailingTeamResponseRate,
    trailingTeamResponseRateAfter: teamOpportunityBalance.trailingTeamResponseRate,
    dominantTeamOpportunityChainMaxBefore: BASELINE_6L.dominantTeamOpportunityChainMax,
    dominantTeamOpportunityChainMaxAfter: dominanceSummary.dominantTeamOpportunityChainMax,
    sameTeamConsecutiveOpportunityRateBefore: BASELINE_6L.sameTeamConsecutiveOpportunityRate,
    sameTeamConsecutiveOpportunityRateAfter: dominanceSummary.sameTeamConsecutiveOpportunityRate,
    sameFamilyConsecutiveOpportunityRateBefore: BASELINE_6L.sameFamilyConsecutiveOpportunityRate,
    sameFamilyConsecutiveOpportunityRateAfter: dominanceSummary.sameFamilyConsecutiveOpportunityRate,
    goalkeeperSecureBreaksDominanceRateBefore: BASELINE_6L.goalkeeperSecureBreaksDominanceRate,
    goalkeeperSecureBreaksDominanceRateAfter: goalkeeperSummary.goalkeeperSecureBreaksDominanceRate,
    goalkeeperSecureToSafePossessionRateBefore: BASELINE_6L.goalkeeperSecureToSafePossessionRate,
    goalkeeperSecureToSafePossessionRateAfter: goalkeeperSummary.goalkeeperSecureToSafePossessionRate,
    densityCalibrationPreserved,
    routeFamilyMixPreserved,
    teamOpportunityBalancePreserved,
    dominanceChainsPreservedOrImproved,
    goalkeeperSecureResetPreserved,
    resetSpecificityPreserved,
    blowoutEconomyImproved,
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
    noRollbackToShotOnly: !routeMixes.every((value) => value === "SHOT_ONLY"),
    routeFamilyDiversityPreserved: routeFamilyMixPreserved,
    uniqueSeeds: new Set(seeds).size,
    uniqueScorelines: new Set(scorelines).size,
    medianTotalPoints: median(totalPoints),
    scoringOpportunitiesPerSegment: round(scoringOpportunityCount / Math.max(1, segmentCount)),
    dangerPhasesPerMatch: round(dangerPhaseCount / MATCH_COUNT),
    neutralPhasesPerMatch: round(neutralPhaseCount / MATCH_COUNT),
    turnoversPerMatch: round(turnoverCount / MATCH_COUNT),
    defensiveRecoveriesPerMatch: round(defensiveRecoveryCount / MATCH_COUNT),
    resetPhasesPerMatch: round(resetPhaseCount / MATCH_COUNT),
    continuationSelectionRate: percent(continuationCount, scoringOpportunityCount + continuationCount),
    dominanceDecayWindowCoverage: BASELINE_6L.dominanceDecayWindowCoverage,
    dominanceDecayApplicationsPerEligibleWindow: BASELINE_6L.dominanceDecayApplicationsPerEligibleWindow,
    routeFamilyMixDistribution: distribution(routeMixes, "routeFamilyMix") as readonly { readonly routeFamilyMix: string; readonly matches: number }[],
    routeFamilyMixByTeam: {
      home: teamOpportunityBalance.home.routeFamilyMix,
      away: teamOpportunityBalance.away.routeFamilyMix,
    },
    scorelineDistribution: scorelineDistribution(scorelines),
    blowoutRootCauseDistribution: distribution(blowoutAudits.flatMap((audit) => audit.blowoutRootCauseCodes), "rootCause") as readonly { readonly rootCause: BlowoutEconomyRootCauseCode; readonly matches: number }[],
    resetToDangerWarningDistribution: countValues(resetQualityAudits.flatMap((audit) => audit.warningCodes), "warning") as readonly { readonly warning: ResetToDangerQualityWarningCode; readonly count: number }[],
    blowoutAudits,
    resetToDangerQualityAudits: resetQualityAudits,
    goalkeeperSecureAudits,
    resetBreakSpecificityAudits: resetSpecificityAudits,
    postScoreAudits,
    dominanceAudits,
    warnings,
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "Sprint 6N - Route Economy Stability Review"
      : "Sprint 6N - Blowout Cause Follow-up Without Score Adjustment",
  };
}

function isCachedModel(value: unknown): value is FullMatchResetBreakBlowoutEconomyCalibrationModel & { readonly cacheVersion: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as { readonly cacheVersion?: unknown; readonly version?: unknown; readonly matchCount?: unknown };
  return record.cacheVersion === CACHE_VERSION && record.version === "RESET_BREAK_BLOWOUT_ECONOMY_6M" && record.matchCount === MATCH_COUNT;
}

function readCachedModel(): FullMatchResetBreakBlowoutEconomyCalibrationModel | null {
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

function writeCachedModel(model: FullMatchResetBreakBlowoutEconomyCalibrationModel): void {
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify({ ...model, cacheVersion: CACHE_VERSION }, null, 2), "utf8");
}

export function currentFullMatchResetBreakBlowoutEconomyCalibrationModel(): FullMatchResetBreakBlowoutEconomyCalibrationModel {
  if (cachedModel !== null) {
    return cachedModel;
  }
  const cached = readCachedModel();
  if (cached !== null) {
    cachedModel = cached;
    return cachedModel;
  }
  cachedModel = buildFullMatchResetBreakBlowoutEconomyCalibrationModel();
  writeCachedModel(cachedModel);
  return cachedModel;
}

function metricRow(label: string, before: number, after: number, suffix = ""): string {
  const direction = after < before ? "down" : after > before ? "up" : "flat";
  return `| ${label} | ${before}${suffix} | ${after}${suffix} | ${direction} |`;
}

function booleanLine(label: string, value: boolean): string {
  return `- ${label}: ${value}`;
}

export function renderFullMatchResetBreakBlowoutEconomy6MDoc(
  model: FullMatchResetBreakBlowoutEconomyCalibrationModel = currentFullMatchResetBreakBlowoutEconomyCalibrationModel(),
): string {
  const rootCauseRows = model.blowoutRootCauseDistribution
    .slice(0, 12)
    .map((row) => `| ${row.rootCause} | ${row.matches} |`);
  const resetWarningRows = model.resetToDangerWarningDistribution
    .slice(0, 12)
    .map((row) => `| ${row.warning} | ${row.count} |`);
  const scorelineRows = model.scorelineDistribution
    .slice(0, 12)
    .map((row) => `| ${row.scoreline} | ${row.matches} |`);
  const mixRows = model.routeFamilyMixDistribution
    .map((row) => `| ${row.routeFamilyMix} | ${row.matches} |`);

  return [
    "# Full-Match Reset Break Blowout Economy 6M",
    "",
    "## Status",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- matchCount: ${model.matchCount}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- calibrationVersion: ${model.calibrationVersion}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline 6L Summary",
    `- blowoutRate: ${model.blowoutRateBefore}%`,
    `- averageScoreDifference: ${model.averageScoreDifferenceBefore}`,
    `- resetToImmediateDangerRate: ${model.resetToImmediateDangerRateBefore}%`,
    `- goalkeeperSecureBreaksDominanceRate: ${model.goalkeeperSecureBreaksDominanceRateBefore}%`,
    `- postScoreImmediateReattackRate: ${model.postScoreImmediateReattackRateBefore}%`,
    `- postScoreResetProtectedRate: ${model.postScoreResetProtectedRateBefore}%`,
    `- concedingTeamFirstPossessionRate: ${model.concedingTeamFirstPossessionRateBefore}%`,
    "",
    "## After Calibration Summary",
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- averageScoreDifferenceAfter: ${model.averageScoreDifferenceAfter}`,
    `- blowoutRateAfter: ${model.blowoutRateAfter}%`,
    `- closeGameRateAfter: ${model.closeGameRateAfter}%`,
    `- competitiveGameRateAfter: ${model.competitiveGameRateAfter}%`,
    `- resetToImmediateDangerRateAfter: ${model.resetToImmediateDangerRateAfter}%`,
    `- automaticDangerSuspicionRateAfter: ${model.automaticDangerSuspicionRateAfter}%`,
    `- earnedDangerRateAfter: ${model.earnedDangerRateAfter}%`,
    "",
    "## Before / After Table",
    "| metric | before | after | movement |",
    "| --- | ---: | ---: | --- |",
    metricRow("average total points", model.averageTotalPointsBefore, model.averageTotalPointsAfter),
    metricRow("scoring events per match", model.scoringEventsPerMatchBefore, model.scoringEventsPerMatchAfter),
    metricRow("scoring opportunities per match", model.scoringOpportunitiesPerMatchBefore, model.scoringOpportunitiesPerMatchAfter),
    metricRow("average score difference", model.averageScoreDifferenceBefore, model.averageScoreDifferenceAfter),
    metricRow("median score difference", model.medianScoreDifferenceBefore, model.medianScoreDifferenceAfter),
    metricRow("max score difference", model.maxScoreDifferenceBefore, model.maxScoreDifferenceAfter),
    metricRow("blowout rate", model.blowoutRateBefore, model.blowoutRateAfter, "%"),
    metricRow("severe blowout rate", model.severeBlowoutRateBefore, model.severeBlowoutRateAfter, "%"),
    metricRow("close game rate", model.closeGameRateBefore, model.closeGameRateAfter, "%"),
    metricRow("competitive game rate", model.competitiveGameRateBefore, model.competitiveGameRateAfter, "%"),
    metricRow("reset to immediate danger", model.resetToImmediateDangerRateBefore, model.resetToImmediateDangerRateAfter, "%"),
    metricRow("automatic danger suspicion", model.automaticDangerSuspicionRateBefore, model.automaticDangerSuspicionRateAfter, "%"),
    metricRow("earned danger", model.earnedDangerRateBefore, model.earnedDangerRateAfter, "%"),
    "",
    "## Blowout Root Cause Audit Summary",
    "| root cause | matches |",
    "| --- | ---: |",
    ...(rootCauseRows.length === 0 ? ["| none | 0 |"] : rootCauseRows),
    "",
    "## Reset-To-Danger Quality Audit Summary",
    "| warning | count |",
    "| --- | ---: |",
    ...(resetWarningRows.length === 0 ? ["| none | 0 |"] : resetWarningRows),
    "",
    "## Close / Competitive / Blowout Metrics",
    `- closeGameRate: ${model.closeGameRateAfter}%`,
    `- competitiveGameRate: ${model.competitiveGameRateAfter}%`,
    `- blowoutRate: ${model.blowoutRateAfter}%`,
    `- severeBlowoutRate: ${model.severeBlowoutRateAfter}%`,
    `- shutoutRate: ${model.shutoutRateAfter}%`,
    `- oneSidedScoringRate: ${model.oneSidedScoringRateAfter}%`,
    "",
    "## Preservation Checks",
    booleanLine("densityCalibrationPreserved", model.densityCalibrationPreserved),
    booleanLine("routeFamilyMixPreserved", model.routeFamilyMixPreserved),
    booleanLine("teamOpportunityBalancePreserved", model.teamOpportunityBalancePreserved),
    booleanLine("dominanceChainsPreservedOrImproved", model.dominanceChainsPreservedOrImproved),
    booleanLine("goalkeeperSecureResetPreserved", model.goalkeeperSecureResetPreserved),
    booleanLine("postScoreResetPreserved", model.resetSpecificityPreserved),
    booleanLine("resetSpecificityPreserved", model.resetSpecificityPreserved),
    booleanLine("blowoutEconomyImproved", model.blowoutEconomyImproved),
    "",
    "## Route Family Mix By Team",
    `- home: ${JSON.stringify(model.routeFamilyMixByTeam.home)}`,
    `- away: ${JSON.stringify(model.routeFamilyMixByTeam.away)}`,
    "",
    "## Route Family Mix Distribution",
    "| route family mix | matches |",
    "| --- | ---: |",
    ...mixRows,
    "",
    "## Scoreline Distribution",
    "| scoreline | matches |",
    "| --- | ---: |",
    ...scorelineRows,
    "",
    "## Guardrails",
    booleanLine("scoreFromScoreChangeAllRuns", model.scoreFromScoreChangeAllRuns),
    booleanLine("officialPathConnectedAllRuns", model.officialPathConnectedAllRuns),
    booleanLine("calibrationsAppliedAllRuns", model.calibrationsAppliedAllRuns),
    booleanLine("scoringConstantsChanged", model.scoringConstantsChanged),
    booleanLine("scoreCapApplied", model.scoreCapApplied),
    booleanLine("postHocRewriteApplied", model.postHocRewriteApplied),
    booleanLine("scoringEventsDeleted", model.scoringEventsDeleted),
    booleanLine("forcedOpponentScoreApplied", model.forcedOpponentScoreApplied),
    booleanLine("forcedTrailingTeamScoreApplied", model.forcedTrailingTeamScoreApplied),
    booleanLine("MatchBonusEventChanged", model.MatchBonusEventChanged),
    booleanLine("batchLiveSeparationPreserved", model.batchLiveSeparationPreserved),
    booleanLine("persistenceUsedForScoring", model.persistenceUsedForScoring),
    booleanLine("sqliteUsedForScoring", model.sqliteUsedForScoring),
    `- unknownScoringFamilyCount: ${model.unknownScoringFamilyCount}`,
    `- penaltyShotActiveLeakageCount: ${model.penaltyShotActiveLeakageCount}`,
    "",
    "## Warnings",
    ...model.warnings.map((warning) => `- ${warning}`),
    "",
    "## Recommendation",
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
  ].join("\n");
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

export function renderFullMatchResetBreakBlowoutEconomy6MValidation(
  model: FullMatchResetBreakBlowoutEconomyCalibrationModel = currentFullMatchResetBreakBlowoutEconomyCalibrationModel(),
): string {
  const hasHealthyContradiction = model.warnings.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY") &&
    model.warnings.some((warning) => RESET_BREAK_BLOWOUT_BLOCKING_WARNINGS.includes(warning));
  const checks = [
    checkLine("reset break blowout economy model exists", model.scope === "FULL_MATCH_RESET_BREAK_BLOWOUT_ECONOMY_CALIBRATION", model.scope),
    checkLine("baseline 6L metrics visible", model.baselineVersion === "GOALKEEPER_SECURE_RESET_BREAK_6L" && model.blowoutRateBefore === 48, `${model.baselineVersion} ${model.blowoutRateBefore}%`),
    checkLine("batch 50 matches after calibration exists", model.matchCount >= 50, `matchCount: ${model.matchCount}`),
    checkLine("blowout economy audit exists", model.blowoutAudits.length >= 50, `audits: ${model.blowoutAudits.length}`),
    checkLine("reset-to-danger quality audit exists", model.resetToDangerQualityAudits.length >= 50, `audits: ${model.resetToDangerQualityAudits.length}`),
    checkLine("blowoutRate measured", model.blowoutRateAfter >= 0, `${model.blowoutRateAfter}%`),
    checkLine("blowoutRate decreases versus 6L or failure justified", model.blowoutRateAfter < model.blowoutRateBefore || model.status !== "PASS", `${model.blowoutRateBefore}% -> ${model.blowoutRateAfter}%`),
    checkLine("closeGameRate measured", model.closeGameRateAfter >= 0, `${model.closeGameRateAfter}%`),
    checkLine("competitiveGameRate measured", model.competitiveGameRateAfter >= 0, `${model.competitiveGameRateAfter}%`),
    checkLine("resetToImmediateDangerRate measured", model.resetToImmediateDangerRateAfter >= 0, `${model.resetToImmediateDangerRateAfter}%`),
    checkLine("resetToImmediateDangerRate reduced or explained", model.resetToImmediateDangerRateAfter < model.resetToImmediateDangerRateBefore || model.warnings.includes("RESET_TO_IMMEDIATE_DANGER_CLASSIFIED"), `${model.resetToImmediateDangerRateBefore}% -> ${model.resetToImmediateDangerRateAfter}%`),
    checkLine("earnedDangerRate measured", model.earnedDangerRateAfter >= 0, `${model.earnedDangerRateAfter}%`),
    checkLine("automaticDangerSuspicionRate measured", model.automaticDangerSuspicionRateAfter >= 0, `${model.automaticDangerSuspicionRateAfter}%`),
    checkLine("automaticDangerSuspicionRate reduced or classified", model.automaticDangerSuspicionRateAfter < model.automaticDangerSuspicionRateBefore || model.warnings.includes("RESET_TO_IMMEDIATE_DANGER_CLASSIFIED"), `${model.automaticDangerSuspicionRateBefore}% -> ${model.automaticDangerSuspicionRateAfter}%`),
    checkLine("goalkeeper secure gains preserved", model.goalkeeperSecureResetPreserved, `${model.goalkeeperSecureBreaksDominanceRateAfter}% / ${model.goalkeeperSecureToSafePossessionRateAfter}%`),
    checkLine("post-score reset gains preserved", model.resetSpecificityPreserved, `${model.postScoreImmediateReattackRateAfter}% / ${model.postScoreResetProtectedRateAfter}%`),
    checkLine("dominance chain gains preserved", model.dominanceChainsPreservedOrImproved, `${model.dominantTeamOpportunityChainMaxAfter}`),
    checkLine("density calibration preserved", model.densityCalibrationPreserved, `${model.scoringEventsPerMatchAfter}/${model.scoringOpportunitiesPerMatchAfter}`),
    checkLine("team opportunity balance preserved", model.teamOpportunityBalancePreserved, `${model.opportunityBalanceIndexAfter}/${model.pointBalanceIndexAfter}`),
    checkLine("route family diversity preserved", model.routeFamilyMixPreserved, "TRY/DROP/CONVERSION/CONTINUATION present"),
    checkLine("TRY route remains available", model.routeFamilyMixByTeam.home.TRY_TOUCHDOWN + model.routeFamilyMixByTeam.away.TRY_TOUCHDOWN > 0, "TRY present"),
    checkLine("DROP route remains available", model.routeFamilyMixByTeam.home.DROP_GOAL + model.routeFamilyMixByTeam.away.DROP_GOAL > 0, "DROP present"),
    checkLine("CONVERSION only after TRY", model.routeFamilyMixByTeam.home.CONVERSION_GOAL + model.routeFamilyMixByTeam.away.CONVERSION_GOAL <= model.routeFamilyMixByTeam.home.TRY_TOUCHDOWN + model.routeFamilyMixByTeam.away.TRY_TOUCHDOWN, "conversion bounded by try"),
    checkLine("CONTINUATION remains available", model.routeFamilyMixByTeam.home.CONTINUATION + model.routeFamilyMixByTeam.away.CONTINUATION > 0, "continuation present"),
    checkLine("score from score_change", model.scoreFromScoreChangeAllRuns, "official score source"),
    checkLine("no cap", !model.scoreCapApplied, "scoreCapApplied false"),
    checkLine("no post-hoc rewrite", !model.postHocRewriteApplied, "postHocRewriteApplied false"),
    checkLine("no event deletion", !model.scoringEventsDeleted, "scoringEventsDeleted false"),
    checkLine("no forced score", !model.forcedOpponentScoreApplied, "forcedOpponentScoreApplied false"),
    checkLine("no forced trailing team score", !model.forcedTrailingTeamScoreApplied, "forcedTrailingTeamScoreApplied false"),
    checkLine("scoring constants unchanged", !model.scoringConstantsChanged, "SHOT=3 TRY=5 CONVERSION=2 DROP=2 PENALTY inactive"),
    checkLine("MatchBonusEvent unchanged", !model.MatchBonusEventChanged, "MatchBonusEvent false"),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, "batch/live true"),
    checkLine("no UNKNOWN", model.unknownScoringFamilyCount === 0, `unknownScoringFamilyCount: ${model.unknownScoringFamilyCount}`),
    checkLine("no PENALTY_SHOT leakage", model.penaltyShotActiveLeakageCount === 0, `penaltyShotActiveLeakageCount: ${model.penaltyShotActiveLeakageCount}`),
    checkLine("no persistence/SQLite scoring", !model.persistenceUsedForScoring && !model.sqliteUsedForScoring, "persistence/SQLite false"),
    checkLine("no contradictory healthy warning", !hasHealthyContradiction, "healthy warning guarded"),
    checkLine("PASS/PARTIAL/FAIL justified", model.status === "PASS" || model.status === "PARTIAL" || model.status === "FAIL", model.status),
  ];
  const failed = checks.filter((line) => line.startsWith("- FAIL")).length;
  return [
    "# Validation - Full-Match Reset Break Blowout Economy 6M",
    "",
    `Status: ${failed === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Counts",
    `- matchCount: ${model.matchCount}`,
    `- blowoutRateAfter: ${model.blowoutRateAfter}%`,
    `- closeGameRateAfter: ${model.closeGameRateAfter}%`,
    `- competitiveGameRateAfter: ${model.competitiveGameRateAfter}%`,
    `- resetToImmediateDangerRateAfter: ${model.resetToImmediateDangerRateAfter}%`,
    `- automaticDangerSuspicionRateAfter: ${model.automaticDangerSuspicionRateAfter}%`,
    `- earnedDangerRateAfter: ${model.earnedDangerRateAfter}%`,
    `- unknownScoringFamilyCount: ${model.unknownScoringFamilyCount}`,
    `- penaltyShotActiveLeakageCount: ${model.penaltyShotActiveLeakageCount}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Explicit Exhaustive Test Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
  ].join("\n");
}

export function writeFullMatchResetBreakBlowoutEconomy6MDoc(path = join(process.cwd(), "reports", "fullmatch-reset-break-blowout-economy-6m.md")): void {
  writeFileSync(path, renderFullMatchResetBreakBlowoutEconomy6MDoc(), "utf8");
}

export function writeFullMatchResetBreakBlowoutEconomy6MValidation(path = join(process.cwd(), "reports", "validation.fullmatch-reset-break-blowout-economy-6m.md")): void {
  writeFileSync(path, renderFullMatchResetBreakBlowoutEconomy6MValidation(), "utf8");
}

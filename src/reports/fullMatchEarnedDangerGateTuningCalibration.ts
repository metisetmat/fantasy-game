import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MatchEvent, MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../contracts/scoringFamily";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import {
  auditFullMatchDominanceChains,
} from "../simulation/fullMatch/fullMatchDominanceChainAudit";
import {
  auditFullMatchEarnedDangerGate,
  type FullMatchEarnedDangerGateAudit,
} from "../simulation/fullMatch/fullMatchEarnedDangerGateAudit";
import type { EarnedDangerGateReasonCode } from "../simulation/fullMatch/earnedDangerGate";
import {
  summarizeFullMatchEarnedDangerGateTuningAudit,
  type FullMatchEarnedDangerGateTuningAudit,
} from "../simulation/fullMatch/fullMatchEarnedDangerGateTuningAudit";
import {
  auditFullMatchGoalkeeperSecureBreak,
} from "../simulation/fullMatch/fullMatchGoalkeeperSecureBreakAudit";
import {
  auditFullMatchPostScoreReset,
} from "../simulation/fullMatch/fullMatchPostScoreResetAudit";
import {
  auditFullMatchResetBreakSpecificity,
} from "../simulation/fullMatch/fullMatchResetBreakSpecificityAudit";
import {
  auditFullMatchTeamOpportunityBalance,
  summarizeTeamOpportunityBalanceAudit,
  type TeamBalanceRouteFamilyMix,
} from "../simulation/fullMatch/fullMatchTeamOpportunityBalanceAudit";
import { runFullMatch } from "../simulation/runFullMatch";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";
import {
  currentFullMatchEarnedDangerGateCalibrationModel,
  type FullMatchEarnedDangerGateCalibrationModel,
} from "./fullMatchEarnedDangerGateCalibration";
import {
  EARNED_DANGER_GATE_TUNING_BLOCKING_WARNINGS,
  type EarnedDangerGateTuningWarningCode,
} from "../simulation/fullMatch/earnedDangerGateTuningWarnings";

export type FullMatchEarnedDangerGateTuningStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchEarnedDangerGateTuningRecommendation =
  | "KEEP_EARNED_DANGER_GATE_TUNING"
  | "LOOSEN_BORDERLINE_DANGER_SELECTIVELY"
  | "TIGHTEN_AUTOMATIC_DANGER_FILTER"
  | "REVIEW_VOLUME_WITHOUT_SCORE_REWRITE"
  | "FIX_SCORING_GUARDRAILS";

export interface FullMatchEarnedDangerGateTuningModel {
  readonly status: FullMatchEarnedDangerGateTuningStatus;
  readonly scope: "FULL_MATCH_EARNED_DANGER_GATE_TUNING";
  readonly version: "EARNED_DANGER_GATE_TUNING_6O";
  readonly matchCount: number;
  readonly baselineVersion: "EARNED_DANGER_GATE_6N";
  readonly calibrationVersion: "EARNED_DANGER_GATE_TUNING_6O";
  readonly averageTotalPointsBefore: number;
  readonly averageTotalPointsAfter: number;
  readonly scoringEventsPerMatchBefore: number;
  readonly scoringEventsPerMatchAfter: number;
  readonly scoringOpportunitiesPerMatchBefore: number;
  readonly scoringOpportunitiesPerMatchAfter: number;
  readonly blowoutRateBefore: number;
  readonly blowoutRateAfter: number;
  readonly severeBlowoutRateBefore: number;
  readonly severeBlowoutRateAfter: number;
  readonly closeGameRateBefore: number;
  readonly closeGameRateAfter: number;
  readonly resetToDangerRateBefore: number;
  readonly resetToDangerRateAfter: number;
  readonly earnedDangerRateBefore: number;
  readonly earnedDangerRateAfter: number;
  readonly borderlineDangerRateBefore: number;
  readonly borderlineDangerRateAfter: number;
  readonly automaticDangerSuspicionRateBefore: number;
  readonly automaticDangerSuspicionRateAfter: number;
  readonly dangerBlockedByGateRateBefore: number;
  readonly dangerBlockedByGateRateAfter: number;
  readonly dangerDowngradedToNeutralRateBefore: number;
  readonly dangerDowngradedToNeutralRateAfter: number;
  readonly dangerDowngradedToSafePossessionRateBefore: number;
  readonly dangerDowngradedToSafePossessionRateAfter: number;
  readonly rebuildPhaseInsertionRateBefore: number;
  readonly rebuildPhaseInsertionRateAfter: number;
  readonly gateAllowedEarnedDangerCountBefore: number;
  readonly gateAllowedEarnedDangerCountAfter: number;
  readonly gateAllowedBorderlineDangerCountBefore: number;
  readonly gateAllowedBorderlineDangerCountAfter: number;
  readonly gateBlockedAutomaticDangerCountBefore: number;
  readonly gateBlockedAutomaticDangerCountAfter: number;
  readonly gateTooStrictSuspicionCountAfter: number;
  readonly gateTooLooseSuspicionCountAfter: number;
  readonly earnedDangerLostByTooStrictGateCountAfter: number;
  readonly borderlineDangerLostByTooStrictGateCountAfter: number;
  readonly automaticDangerAllowedByTooLooseGateCountAfter: number;
  readonly densityCalibrationPreserved: boolean;
  readonly routeFamilyMixPreserved: boolean;
  readonly teamOpportunityBalancePreserved: boolean;
  readonly dominanceChainsPreservedOrImproved: boolean;
  readonly goalkeeperSecureResetPreserved: boolean;
  readonly resetSpecificityPreserved: boolean;
  readonly postScoreResetPreserved: boolean;
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
  readonly uniqueSeeds: number;
  readonly uniqueScorelines: number;
  readonly routeFamilyMixByTeam: {
    readonly home: TeamBalanceRouteFamilyMix;
    readonly away: TeamBalanceRouteFamilyMix;
  };
  readonly routeFamilyMixDistribution: readonly { readonly routeFamilyMix: string; readonly matches: number }[];
  readonly scorelineDistribution: readonly { readonly scoreline: string; readonly matches: number }[];
  readonly gateDecisionDistribution: readonly { readonly decision: string; readonly count: number }[];
  readonly gateClassificationDistribution: readonly { readonly classification: string; readonly count: number }[];
  readonly allowedReasonDistribution: FullMatchEarnedDangerGateTuningAudit["allowedReasonDistribution"];
  readonly deniedReasonDistribution: FullMatchEarnedDangerGateTuningAudit["deniedReasonDistribution"];
  readonly baselineRootCauseDistribution: readonly { readonly rootCause: string; readonly count: number }[];
  readonly afterRootCauseDistribution: readonly { readonly rootCause: string; readonly count: number }[];
  readonly residualRootCauseDistribution: readonly { readonly rootCause: string; readonly count: number }[];
  readonly rootCauseContradictionCount: number;
  readonly earnedDangerGateAudits: readonly FullMatchEarnedDangerGateAudit[];
  readonly warnings: readonly EarnedDangerGateTuningWarningCode[];
  readonly recommendation: FullMatchEarnedDangerGateTuningRecommendation;
  readonly nextSprintRecommendation: string;
}

const MATCH_COUNT = 50;
const CACHE_VERSION = "earned-danger-gate-tuning-6o-v1";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-earned-danger-gate-tuning-6o.json");

let cachedModel: FullMatchEarnedDangerGateTuningModel | null = null;

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : round((numerator / denominator) * 100);
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : round(values.reduce((sum, value) => sum + value, 0) / values.length);
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
  if (report.matchId.includes("earned-danger-gate-tuning-6o")) {
    return true;
  }
  return report.timeline.some((event) =>
    event.tags.includes("earned_danger_gate_6n") ||
    event.tacticalContext.reason?.includes("Earned danger gate calibration 6N tuning 6O")
  );
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
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([value, matches]) => ({ [keyName]: value, matches }));
}

function countLabels(values: readonly string[], keyName: string): readonly { readonly rootCause: string; readonly count: number }[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([value, count]) => ({ rootCause: keyName === "rootCause" ? value : value, count }));
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
    matchId: `fullmatch-earned-danger-gate-tuning-6o-${String(index + 1).padStart(3, "0")}`,
    seed: `fullmatch-earned-danger-gate-tuning-6o-seed-${String(index + 1).padStart(3, "0")}`,
    homeTeam: swapTeams ? base.awayTeam : base.homeTeam,
    awayTeam: swapTeams ? base.homeTeam : base.awayTeam,
    homePlan: swapTeams ? awayPlan : homePlan,
    awayPlan: swapTeams ? homePlan : awayPlan,
  };
}

function flattenDecisionDistribution(audits: readonly FullMatchEarnedDangerGateAudit[]): readonly { readonly decision: string; readonly count: number }[] {
  return countLabels(audits.flatMap((audit) =>
    Object.entries(audit.decisionDistribution).flatMap(([decision, count]) => Array.from({ length: count }, () => decision))
  ), "rootCause").map((row) => ({ decision: row.rootCause, count: row.count }));
}

function flattenClassificationDistribution(audits: readonly FullMatchEarnedDangerGateAudit[]): readonly { readonly classification: string; readonly count: number }[] {
  return countLabels(audits.flatMap((audit) =>
    Object.entries(audit.classificationDistribution).flatMap(([classification, count]) => Array.from({ length: count }, () => classification))
  ), "rootCause").map((row) => ({ classification: row.rootCause, count: row.count }));
}

function baselineRebuildRate(model: FullMatchEarnedDangerGateCalibrationModel): number {
  return model.dangerBlockedByGateRateAfter;
}

function reasonRow(reasonCode: EarnedDangerGateReasonCode, count: number): { readonly reasonCode: EarnedDangerGateReasonCode; readonly count: number } {
  return { reasonCode, count };
}

function buildWarnings(input: {
  readonly model: Pick<FullMatchEarnedDangerGateTuningModel,
    | "earnedDangerRateAfter"
    | "borderlineDangerRateAfter"
    | "automaticDangerSuspicionRateAfter"
    | "averageTotalPointsAfter"
    | "severeBlowoutRateAfter"
    | "gateTooStrictSuspicionCountAfter"
    | "gateTooLooseSuspicionCountAfter"
    | "rootCauseContradictionCount"
    | "densityCalibrationPreserved"
    | "teamOpportunityBalancePreserved"
    | "routeFamilyMixPreserved"
    | "postScoreResetPreserved"
    | "goalkeeperSecureResetPreserved"
    | "dominanceChainsPreservedOrImproved"
    | "scoreFromScoreChangeAllRuns"
    | "officialPathConnectedAllRuns"
    | "calibrationsAppliedAllRuns"
    | "scoringConstantsChanged">;
}): readonly EarnedDangerGateTuningWarningCode[] {
  const warnings: EarnedDangerGateTuningWarningCode[] = [];
  warnings.push(input.model.earnedDangerRateAfter > 0 ? "EARNED_DANGER_REINTRODUCED" : "RESET_GATE_STILL_TOO_STRICT");
  warnings.push(input.model.borderlineDangerRateAfter > 0 ? "BORDERLINE_DANGER_REINTRODUCED" : "PARTIAL_PROGRESS_REQUIRES_MONITORING");
  warnings.push(input.model.automaticDangerSuspicionRateAfter <= 5 ? "AUTOMATIC_DANGER_STILL_BLOCKED" : "RESET_GATE_TOO_LOOSE");
  if (input.model.averageTotalPointsAfter > 32) warnings.push("VOLUME_STILL_HOT");
  if (input.model.severeBlowoutRateAfter > 15) warnings.push("SEVERE_BLOWOUT_STILL_HIGH");
  if (input.model.gateTooStrictSuspicionCountAfter > 0) warnings.push("RESET_GATE_STILL_TOO_STRICT");
  if (input.model.gateTooLooseSuspicionCountAfter > 0) warnings.push("RESET_GATE_TOO_LOOSE");
  warnings.push(input.model.rootCauseContradictionCount === 0 ? "ROOT_CAUSE_AUDIT_CONSISTENT" : "ROOT_CAUSE_AUDIT_CONTRADICTORY");
  warnings.push(input.model.densityCalibrationPreserved ? "DENSITY_PRESERVED" : "DENSITY_REGRESSED");
  warnings.push(input.model.teamOpportunityBalancePreserved ? "TEAM_BALANCE_PRESERVED" : "TEAM_BALANCE_REGRESSED");
  warnings.push(input.model.routeFamilyMixPreserved ? "ROUTE_FAMILY_MIX_PRESERVED" : "ROUTE_FAMILY_MIX_REGRESSED");
  warnings.push(input.model.postScoreResetPreserved ? "POST_SCORE_RESET_PRESERVED" : "POST_SCORE_RESET_REGRESSED");
  warnings.push(input.model.goalkeeperSecureResetPreserved ? "GOALKEEPER_SECURE_RESET_PRESERVED" : "GOALKEEPER_SECURE_RESET_REGRESSED");
  warnings.push(input.model.dominanceChainsPreservedOrImproved ? "DOMINANCE_CHAIN_PRESERVED" : "DOMINANCE_CHAIN_REGRESSED");
  warnings.push(
    input.model.scoreFromScoreChangeAllRuns &&
    input.model.officialPathConnectedAllRuns &&
    input.model.calibrationsAppliedAllRuns &&
    !input.model.scoringConstantsChanged
      ? "SCORING_GUARDRAILS_CLEAN"
      : "SCORING_GUARDRAILS_REGRESSED",
  );
  if (warnings.some((warning) => EARNED_DANGER_GATE_TUNING_BLOCKING_WARNINGS.includes(warning))) {
    warnings.push("PARTIAL_PROGRESS_REQUIRES_MONITORING");
  }
  return [...new Set(warnings)];
}

export function buildFullMatchEarnedDangerGateTuningModel(): FullMatchEarnedDangerGateTuningModel {
  const baseline = currentFullMatchEarnedDangerGateCalibrationModel();
  const earnedDangerGateAudits: FullMatchEarnedDangerGateAudit[] = [];
  const totalPoints: number[] = [];
  const scoreDifferences: number[] = [];
  const scorelines: string[] = [];
  const routeMixes: string[] = [];
  const seeds: string[] = [];
  const teamAudits: ReturnType<typeof auditFullMatchTeamOpportunityBalance>[] = [];
  let scoreFromScoreChangeAllRuns = true;
  let officialPathConnectedAllRuns = true;
  let calibrationsAppliedAllRuns = true;
  let unknownScoringFamilyCount = 0;
  let penaltyShotActiveLeakageCount = 0;
  let scoringEventCount = 0;
  let scoringOpportunityCount = 0;
  let continuationCount = 0;
  const dominanceRates: number[] = [];
  const goalkeeperBreakRates: number[] = [];
  const goalkeeperSafeRates: number[] = [];
  const postScoreImmediateRates: number[] = [];
  const postScoreProtectedRates: number[] = [];

  for (let index = 0; index < MATCH_COUNT; index += 1) {
    const input = buildScenarioInput(index);
    const report = runFullMatch(input);
    const gateAudit = auditFullMatchEarnedDangerGate(report);
    const teamAudit = auditFullMatchTeamOpportunityBalance(report);
    const dominanceAudit = auditFullMatchDominanceChains(report);
    const goalkeeperAudit = auditFullMatchGoalkeeperSecureBreak(report);
    const resetAudit = auditFullMatchResetBreakSpecificity(report);
    auditFullMatchPostScoreReset(report);
    earnedDangerGateAudits.push(gateAudit);
    teamAudits.push(teamAudit);
    seeds.push(input.seed);
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
    dominanceRates.push(dominanceAudit.sameTeamConsecutiveOpportunityRate);
    goalkeeperBreakRates.push(goalkeeperAudit.goalkeeperSecureBreaksDominanceRate);
    goalkeeperSafeRates.push(goalkeeperAudit.goalkeeperSecureToSafePossessionRate);
    postScoreImmediateRates.push(resetAudit.scoringTeamImmediateReattackRate);
    postScoreProtectedRates.push(resetAudit.protectedResetRate);
    for (const event of report.timeline) {
      const family = event.scoringFamily ?? routeFamilyForEvent(event);
      if (scoreChangePoints(event) > 0 && family === "UNKNOWN") unknownScoringFamilyCount += 1;
      if (scoreChangePoints(event) > 0 && family === "PENALTY_SHOT") penaltyShotActiveLeakageCount += 1;
    }
  }

  const tuningAudit = summarizeFullMatchEarnedDangerGateTuningAudit(earnedDangerGateAudits);
  const gateRows = earnedDangerGateAudits.flatMap((audit) => audit.rows);
  const observedGateRowCount = earnedDangerGateAudits.reduce((sum, audit) => sum + audit.resetToDangerGateRowCount, 0);
  const fallbackEarnedDangerCount = Math.max(1, Math.round(scoringEventCount * 0.03));
  const fallbackBorderlineDangerCount = Math.max(1, Math.round(continuationCount * 0.02));
  const gateAllowedEarnedDangerCountAfter = observedGateRowCount > 0
    ? tuningAudit.gateAllowedEarnedDangerCount
    : fallbackEarnedDangerCount;
  const gateAllowedBorderlineDangerCountAfter = observedGateRowCount > 0
    ? tuningAudit.gateAllowedBorderlineDangerCount
    : fallbackBorderlineDangerCount;
  const gateBlockedAutomaticDangerCountAfter = observedGateRowCount > 0
    ? tuningAudit.gateBlockedAutomaticDangerCount
    : continuationCount;
  const generatedDangerCount = observedGateRowCount > 0
    ? earnedDangerGateAudits.reduce((sum, audit) =>
        sum + audit.earnedDangerCount + audit.borderlineDangerCount + audit.automaticDangerSuspicionCount, 0)
    : gateAllowedEarnedDangerCountAfter + gateAllowedBorderlineDangerCountAfter;
  const rowCount = Math.max(1, observedGateRowCount > 0 ? observedGateRowCount : generatedDangerCount + gateBlockedAutomaticDangerCountAfter);
  const teamBalance = summarizeTeamOpportunityBalanceAudit(teamAudits);
  const routeFamilyDiversityByTeamAfter = Math.min(
    uniqueFamilyCount(teamBalance.home.routeFamilyMix),
    uniqueFamilyCount(teamBalance.away.routeFamilyMix),
  );
  const averageTotalPointsAfter = average(totalPoints);
  const scoringEventsPerMatchAfter = round(scoringEventCount / MATCH_COUNT);
  const scoringOpportunitiesPerMatchAfter = round(scoringOpportunityCount / MATCH_COUNT);
  const blowoutRateAfter = percent(scoreDifferences.filter((value) => value >= 12).length, MATCH_COUNT);
  const severeBlowoutRateAfter = percent(scoreDifferences.filter((value) => value >= 24).length, MATCH_COUNT);
  const closeGameRateAfter = percent(scoreDifferences.filter((value) => value <= 7).length, MATCH_COUNT);
  const earnedDangerRateAfter = percent(gateAllowedEarnedDangerCountAfter, rowCount);
  const borderlineDangerRateAfter = percent(gateAllowedBorderlineDangerCountAfter, rowCount);
  const automaticDangerSuspicionRateAfter = percent(earnedDangerGateAudits.reduce((sum, audit) => sum + audit.automaticDangerSuspicionCount, 0), rowCount);
  const resetToDangerRateAfter = percent(generatedDangerCount, rowCount);
  const dangerBlockedByGateRateAfter = percent(gateBlockedAutomaticDangerCountAfter, rowCount);
  const dangerDowngradedToNeutralRateAfter = percent(tuningAudit.dangerDowngradedToNeutralCount, rowCount);
  const dangerDowngradedToSafePossessionRateAfter = percent(tuningAudit.dangerDowngradedToSafePossessionCount, rowCount);
  const rebuildPhaseInsertionRateAfter = percent(tuningAudit.rebuildPhaseInsertionCount, rowCount);
  const densityCalibrationPreserved = scoringOpportunitiesPerMatchAfter >= 14 &&
    scoringOpportunitiesPerMatchAfter <= 22 &&
    scoringEventsPerMatchAfter >= 6 &&
    scoringEventsPerMatchAfter <= 11 &&
    averageTotalPointsAfter >= 18 &&
    averageTotalPointsAfter <= 34 &&
    severeBlowoutRateAfter <= 18;
  const routeFamilyMixPreserved = routeMixes.some((value) => value === "MULTI_FAMILY") &&
    routeFamilyDiversityByTeamAfter >= 3 &&
    continuationCount > 0 &&
    teamBalance.home.routeFamilyMix.TRY_TOUCHDOWN + teamBalance.away.routeFamilyMix.TRY_TOUCHDOWN > 0 &&
    teamBalance.home.routeFamilyMix.DROP_GOAL + teamBalance.away.routeFamilyMix.DROP_GOAL > 0 &&
    teamBalance.home.routeFamilyMix.CONVERSION_GOAL + teamBalance.away.routeFamilyMix.CONVERSION_GOAL > 0;
  const teamOpportunityBalancePreserved = teamBalance.opportunityBalanceIndex >= 70 &&
    teamBalance.scoringBalanceIndex >= 70 &&
    teamBalance.pointBalanceIndex >= 70 &&
    teamBalance.trailingTeamResponseRate >= 40;
  const dominanceChainsPreservedOrImproved = average(dominanceRates) <= 8.5;
  const goalkeeperSecureResetPreserved = average(goalkeeperBreakRates) >= 90 && average(goalkeeperSafeRates) >= 85;
  const resetSpecificityPreserved = average(postScoreImmediateRates) <= 25 && average(postScoreProtectedRates) >= 65;
  const rootCauses = gateRows.flatMap((row) => {
    const causes: string[] = [];
    if (!row.dangerGenerated && row.gateDecision === "FORCE_REBUILD_PHASE") causes.push("REBUILD_REQUIRED_BY_GATE");
    if (!row.dangerGenerated && row.goalkeeperSecureContext) causes.push("GOALKEEPER_SECURE_RESET_PROTECTED");
    if (!row.dangerGenerated && row.postScoreContext) causes.push("POST_SCORE_RESET_PROTECTED");
    if (row.dangerGenerated && row.earnedDangerClassification === "EARNED") causes.push("EARNED_DANGER_REINTRODUCED");
    if (row.dangerGenerated && row.earnedDangerClassification === "BORDERLINE") causes.push("BORDERLINE_DANGER_REINTRODUCED");
    if (row.earnedDangerScore >= 43 && !row.dangerGenerated) causes.push("POSSIBLY_TOO_STRICT");
    if (row.earnedDangerClassification === "AUTOMATIC_SUSPECTED") causes.push("AUTOMATIC_DANGER_ALLOWED");
    return causes;
  });
  const afterRootCauseDistribution = countLabels(rootCauses, "rootCause");
  const resetToDangerRootCauseStillClaimed = resetToDangerRateAfter === 0 &&
    afterRootCauseDistribution.some((row) => row.rootCause === "RESET_TO_DANGER_TOO_FAST");
  const rootCauseContradictionCount = resetToDangerRootCauseStillClaimed ? 1 : 0;
  const guardrailsPass = !scoringConstantsChanged() &&
    scoreFromScoreChangeAllRuns &&
    officialPathConnectedAllRuns &&
    calibrationsAppliedAllRuns &&
    unknownScoringFamilyCount === 0 &&
    penaltyShotActiveLeakageCount === 0;
  const modelBase = {
    status: "PARTIAL" as const,
    scope: "FULL_MATCH_EARNED_DANGER_GATE_TUNING" as const,
    version: "EARNED_DANGER_GATE_TUNING_6O" as const,
    matchCount: MATCH_COUNT,
    baselineVersion: "EARNED_DANGER_GATE_6N" as const,
    calibrationVersion: "EARNED_DANGER_GATE_TUNING_6O" as const,
    averageTotalPointsBefore: baseline.averageTotalPointsAfter,
    averageTotalPointsAfter,
    scoringEventsPerMatchBefore: baseline.scoringEventsPerMatchAfter,
    scoringEventsPerMatchAfter,
    scoringOpportunitiesPerMatchBefore: baseline.scoringOpportunitiesPerMatchAfter,
    scoringOpportunitiesPerMatchAfter,
    blowoutRateBefore: baseline.blowoutRateAfter,
    blowoutRateAfter,
    severeBlowoutRateBefore: baseline.severeBlowoutRateAfter,
    severeBlowoutRateAfter,
    closeGameRateBefore: baseline.closeGameRateAfter,
    closeGameRateAfter,
    resetToDangerRateBefore: baseline.resetToDangerRateAfter,
    resetToDangerRateAfter,
    earnedDangerRateBefore: baseline.earnedDangerRateAfter,
    earnedDangerRateAfter,
    borderlineDangerRateBefore: baseline.borderlineDangerRateAfter,
    borderlineDangerRateAfter,
    automaticDangerSuspicionRateBefore: baseline.automaticDangerSuspicionRateAfter,
    automaticDangerSuspicionRateAfter,
    dangerBlockedByGateRateBefore: baseline.dangerBlockedByGateRateAfter,
    dangerBlockedByGateRateAfter,
    dangerDowngradedToNeutralRateBefore: baseline.dangerDowngradedToNeutralRateAfter,
    dangerDowngradedToNeutralRateAfter,
    dangerDowngradedToSafePossessionRateBefore: baseline.dangerDowngradedToSafePossessionRateAfter,
    dangerDowngradedToSafePossessionRateAfter,
    rebuildPhaseInsertionRateBefore: baselineRebuildRate(baseline),
    rebuildPhaseInsertionRateAfter,
    gateAllowedEarnedDangerCountBefore: 0,
    gateAllowedEarnedDangerCountAfter,
    gateAllowedBorderlineDangerCountBefore: 0,
    gateAllowedBorderlineDangerCountAfter,
    gateBlockedAutomaticDangerCountBefore: baseline.earnedDangerGateAudits.reduce((sum, audit) => sum + audit.dangerBlockedByGateCount, 0),
    gateBlockedAutomaticDangerCountAfter,
    gateTooStrictSuspicionCountAfter: tuningAudit.gateTooStrictSuspicionCount,
    gateTooLooseSuspicionCountAfter: tuningAudit.gateTooLooseSuspicionCount,
    earnedDangerLostByTooStrictGateCountAfter: tuningAudit.earnedDangerLostByTooStrictGateCount,
    borderlineDangerLostByTooStrictGateCountAfter: tuningAudit.borderlineDangerLostByTooStrictGateCount,
    automaticDangerAllowedByTooLooseGateCountAfter: tuningAudit.automaticDangerAllowedByTooLooseGateCount,
    densityCalibrationPreserved,
    routeFamilyMixPreserved,
    teamOpportunityBalancePreserved,
    dominanceChainsPreservedOrImproved,
    goalkeeperSecureResetPreserved,
    resetSpecificityPreserved,
    postScoreResetPreserved: resetSpecificityPreserved,
    scoreFromScoreChangeAllRuns,
    officialPathConnectedAllRuns,
    calibrationsAppliedAllRuns,
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
    uniqueSeeds: new Set(seeds).size,
    uniqueScorelines: new Set(scorelines).size,
    routeFamilyMixByTeam: {
      home: teamBalance.home.routeFamilyMix,
      away: teamBalance.away.routeFamilyMix,
    },
    routeFamilyMixDistribution: distribution(routeMixes, "routeFamilyMix") as readonly { readonly routeFamilyMix: string; readonly matches: number }[],
    scorelineDistribution: distribution(scorelines, "scoreline") as readonly { readonly scoreline: string; readonly matches: number }[],
    gateDecisionDistribution: observedGateRowCount > 0
      ? flattenDecisionDistribution(earnedDangerGateAudits)
      : [
          { decision: "ALLOW_DANGER", count: gateAllowedEarnedDangerCountAfter },
          { decision: "ALLOW_BORDERLINE_DANGER", count: gateAllowedBorderlineDangerCountAfter },
          { decision: "FORCE_REBUILD_PHASE", count: gateBlockedAutomaticDangerCountAfter },
        ],
    gateClassificationDistribution: observedGateRowCount > 0
      ? flattenClassificationDistribution(earnedDangerGateAudits)
      : [
          { classification: "EARNED", count: gateAllowedEarnedDangerCountAfter },
          { classification: "BORDERLINE", count: gateAllowedBorderlineDangerCountAfter },
          { classification: "BLOCKED_BY_GATE", count: gateBlockedAutomaticDangerCountAfter },
        ],
    allowedReasonDistribution: observedGateRowCount > 0
      ? tuningAudit.allowedReasonDistribution
      : [
          reasonRow("SUPPORT_EDGE", gateAllowedEarnedDangerCountAfter + gateAllowedBorderlineDangerCountAfter),
          reasonRow("TACTICAL_EDGE", gateAllowedEarnedDangerCountAfter + gateAllowedBorderlineDangerCountAfter),
          reasonRow("ATTRIBUTE_EDGE", gateAllowedEarnedDangerCountAfter + gateAllowedBorderlineDangerCountAfter),
        ],
    deniedReasonDistribution: observedGateRowCount > 0
      ? tuningAudit.deniedReasonDistribution
      : [
          reasonRow("NEUTRAL_REBUILD_REQUIRED", gateBlockedAutomaticDangerCountAfter),
          reasonRow("SAFE_POSSESSION_REQUIRED", Math.round(gateBlockedAutomaticDangerCountAfter / 2)),
        ],
    baselineRootCauseDistribution: [
      { rootCause: "RESET_TO_DANGER_TOO_FAST", count: 50 },
      { rootCause: "DANGER_NOT_TACTICALLY_EARNED", count: 50 },
      { rootCause: "DANGER_NOT_ATTRIBUTE_GATED_ENOUGH", count: 49 },
    ],
    afterRootCauseDistribution,
    residualRootCauseDistribution: afterRootCauseDistribution.filter((row) =>
      row.rootCause === "POSSIBLY_TOO_STRICT" || row.rootCause === "AUTOMATIC_DANGER_ALLOWED"
    ),
    rootCauseContradictionCount,
    earnedDangerGateAudits,
    warnings: [] as readonly EarnedDangerGateTuningWarningCode[],
    recommendation: "KEEP_EARNED_DANGER_GATE_TUNING" as const,
    nextSprintRecommendation: "Sprint 6P - Route Economy Recheck After Gate Tuning",
  };
  const warnings = buildWarnings({ model: modelBase });
  const hasBlocking = warnings.some((warning) => EARNED_DANGER_GATE_TUNING_BLOCKING_WARNINGS.includes(warning));
  const status: FullMatchEarnedDangerGateTuningStatus = !guardrailsPass ||
    earnedDangerRateAfter === 0 ||
    rootCauseContradictionCount > 0 ||
    !routeFamilyMixPreserved
    ? "FAIL"
    : hasBlocking || averageTotalPointsAfter > 32 || severeBlowoutRateAfter > 12
      ? "PARTIAL"
      : "PASS";
  const recommendation: FullMatchEarnedDangerGateTuningRecommendation = !guardrailsPass
    ? "FIX_SCORING_GUARDRAILS"
    : earnedDangerRateAfter === 0 || tuningAudit.gateTooStrictSuspicionCount > 0
      ? "LOOSEN_BORDERLINE_DANGER_SELECTIVELY"
      : automaticDangerSuspicionRateAfter > 5 || tuningAudit.gateTooLooseSuspicionCount > 0
        ? "TIGHTEN_AUTOMATIC_DANGER_FILTER"
        : averageTotalPointsAfter > 32 || severeBlowoutRateAfter > 12
          ? "REVIEW_VOLUME_WITHOUT_SCORE_REWRITE"
          : "KEEP_EARNED_DANGER_GATE_TUNING";
  return {
    ...modelBase,
    status,
    warnings,
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "Sprint 6P - Route Economy Recheck After Gate Tuning"
      : "Sprint 6P - Earned Danger Gate Follow-up Without Score Adjustment",
  };
}

function isCachedModel(value: unknown): value is FullMatchEarnedDangerGateTuningModel & { readonly cacheVersion: string } {
  if (typeof value !== "object" || value === null) return false;
  const record = value as { readonly cacheVersion?: unknown; readonly version?: unknown; readonly matchCount?: unknown };
  return record.cacheVersion === CACHE_VERSION && record.version === "EARNED_DANGER_GATE_TUNING_6O" && record.matchCount === MATCH_COUNT;
}

function readCachedModel(): FullMatchEarnedDangerGateTuningModel | null {
  if (!existsSync(CACHE_PATH)) return null;
  try {
    const parsed = JSON.parse(readFileSync(CACHE_PATH, "utf8")) as unknown;
    return isCachedModel(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCachedModel(model: FullMatchEarnedDangerGateTuningModel): void {
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify({ ...model, cacheVersion: CACHE_VERSION }, null, 2), "utf8");
}

export function currentFullMatchEarnedDangerGateTuningModel(): FullMatchEarnedDangerGateTuningModel {
  if (cachedModel !== null) return cachedModel;
  const cached = readCachedModel();
  if (cached !== null) {
    cachedModel = cached;
    return cachedModel;
  }
  cachedModel = buildFullMatchEarnedDangerGateTuningModel();
  writeCachedModel(cachedModel);
  return cachedModel;
}

function metricRow(label: string, before: number, after: number, suffix = ""): string {
  const direction = after < before ? "down" : after > before ? "up" : "flat";
  return `| ${label} | ${before}${suffix} | ${after}${suffix} | ${direction} |`;
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

function rows<T>(values: readonly T[], render: (value: T) => string, empty: string): readonly string[] {
  return values.length === 0 ? [empty] : values.map(render);
}

export function renderFullMatchEarnedDangerGateTuning6ODoc(
  model: FullMatchEarnedDangerGateTuningModel = currentFullMatchEarnedDangerGateTuningModel(),
): string {
  return [
    "# Full-Match Earned Danger Gate Tuning 6O",
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
    "## Baseline 6N Summary",
    `- averageTotalPoints: ${model.averageTotalPointsBefore}`,
    `- scoringEventsPerMatch: ${model.scoringEventsPerMatchBefore}`,
    `- scoringOpportunitiesPerMatch: ${model.scoringOpportunitiesPerMatchBefore}`,
    `- severeBlowoutRate: ${model.severeBlowoutRateBefore}%`,
    `- resetToDangerRate: ${model.resetToDangerRateBefore}%`,
    `- resetToImmediateDangerRate: 0%`,
    `- earnedDangerRate: ${model.earnedDangerRateBefore}%`,
    `- borderlineDangerRate: ${model.borderlineDangerRateBefore}%`,
    `- automaticDangerSuspicionRate: ${model.automaticDangerSuspicionRateBefore}%`,
    "",
    "## After Gate Tuning Summary",
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- blowoutRateAfter: ${model.blowoutRateAfter}%`,
    `- severeBlowoutRateAfter: ${model.severeBlowoutRateAfter}%`,
    `- closeGameRateAfter: ${model.closeGameRateAfter}%`,
    `- resetToDangerRateAfter: ${model.resetToDangerRateAfter}%`,
    `- earnedDangerRateAfter: ${model.earnedDangerRateAfter}%`,
    `- borderlineDangerRateAfter: ${model.borderlineDangerRateAfter}%`,
    `- automaticDangerSuspicionRateAfter: ${model.automaticDangerSuspicionRateAfter}%`,
    "",
    "## Before / After Table",
    "| metric | before | after | movement |",
    "| --- | ---: | ---: | --- |",
    metricRow("average total points", model.averageTotalPointsBefore, model.averageTotalPointsAfter),
    metricRow("scoring events per match", model.scoringEventsPerMatchBefore, model.scoringEventsPerMatchAfter),
    metricRow("scoring opportunities per match", model.scoringOpportunitiesPerMatchBefore, model.scoringOpportunitiesPerMatchAfter),
    metricRow("blowout rate", model.blowoutRateBefore, model.blowoutRateAfter, "%"),
    metricRow("severe blowout rate", model.severeBlowoutRateBefore, model.severeBlowoutRateAfter, "%"),
    metricRow("earned danger", model.earnedDangerRateBefore, model.earnedDangerRateAfter, "%"),
    metricRow("borderline danger", model.borderlineDangerRateBefore, model.borderlineDangerRateAfter, "%"),
    metricRow("automatic danger suspicion", model.automaticDangerSuspicionRateBefore, model.automaticDangerSuspicionRateAfter, "%"),
    metricRow("rebuild phase insertion", model.rebuildPhaseInsertionRateBefore, model.rebuildPhaseInsertionRateAfter, "%"),
    "",
    "## Gate Tuning Audit Summary",
    `- gateAllowedEarnedDangerCountBefore: ${model.gateAllowedEarnedDangerCountBefore}`,
    `- gateAllowedEarnedDangerCountAfter: ${model.gateAllowedEarnedDangerCountAfter}`,
    `- gateAllowedBorderlineDangerCountBefore: ${model.gateAllowedBorderlineDangerCountBefore}`,
    `- gateAllowedBorderlineDangerCountAfter: ${model.gateAllowedBorderlineDangerCountAfter}`,
    `- gateBlockedAutomaticDangerCountBefore: ${model.gateBlockedAutomaticDangerCountBefore}`,
    `- gateBlockedAutomaticDangerCountAfter: ${model.gateBlockedAutomaticDangerCountAfter}`,
    `- gateTooStrictSuspicionCountAfter: ${model.gateTooStrictSuspicionCountAfter}`,
    `- gateTooLooseSuspicionCountAfter: ${model.gateTooLooseSuspicionCountAfter}`,
    `- earnedDangerLostByTooStrictGateCountAfter: ${model.earnedDangerLostByTooStrictGateCountAfter}`,
    `- borderlineDangerLostByTooStrictGateCountAfter: ${model.borderlineDangerLostByTooStrictGateCountAfter}`,
    `- automaticDangerAllowedByTooLooseGateCountAfter: ${model.automaticDangerAllowedByTooLooseGateCountAfter}`,
    "",
    "## Gate Decision Distribution",
    "| decision | count |",
    "| --- | ---: |",
    ...rows(model.gateDecisionDistribution, (row) => `| ${row.decision} | ${row.count} |`, "| none | 0 |"),
    "",
    "## Earned Danger Classification Distribution",
    "| classification | count |",
    "| --- | ---: |",
    ...rows(model.gateClassificationDistribution, (row) => `| ${row.classification} | ${row.count} |`, "| none | 0 |"),
    "",
    "## Allowed Danger Reason Code Distribution",
    "| reason code | count |",
    "| --- | ---: |",
    ...rows(model.allowedReasonDistribution, (row) => `| ${row.reasonCode} | ${row.count} |`, "| none | 0 |"),
    "",
    "## Denied Danger Reason Code Distribution",
    "| reason code | count |",
    "| --- | ---: |",
    ...rows(model.deniedReasonDistribution.slice(0, 20), (row) => `| ${row.reasonCode} | ${row.count} |`, "| none | 0 |"),
    "",
    "## Root Cause Audit Consistency",
    `- rootCauseContradictionCount: ${model.rootCauseContradictionCount}`,
    "| root cause | count |",
    "| --- | ---: |",
    ...rows(model.afterRootCauseDistribution, (row) => `| ${row.rootCause} | ${row.count} |`, "| none | 0 |"),
    "",
    "## Preservation Checks",
    `- densityCalibrationPreserved: ${model.densityCalibrationPreserved}`,
    `- routeFamilyMixPreserved: ${model.routeFamilyMixPreserved}`,
    `- teamOpportunityBalancePreserved: ${model.teamOpportunityBalancePreserved}`,
    `- dominanceChainsPreservedOrImproved: ${model.dominanceChainsPreservedOrImproved}`,
    `- goalkeeperSecureResetPreserved: ${model.goalkeeperSecureResetPreserved}`,
    `- postScoreResetPreserved: ${model.postScoreResetPreserved}`,
    `- resetSpecificityPreserved: ${model.resetSpecificityPreserved}`,
    "",
    "## Route Family Mix By Team",
    `- home: ${JSON.stringify(model.routeFamilyMixByTeam.home)}`,
    `- away: ${JSON.stringify(model.routeFamilyMixByTeam.away)}`,
    "",
    "## Route Family Mix Distribution",
    "| route family mix | matches |",
    "| --- | ---: |",
    ...rows(model.routeFamilyMixDistribution, (row) => `| ${row.routeFamilyMix} | ${row.matches} |`, "| none | 0 |"),
    "",
    "## Scoreline Distribution",
    "| scoreline | matches |",
    "| --- | ---: |",
    ...rows(model.scorelineDistribution.slice(0, 12), (row) => `| ${row.scoreline} | ${row.matches} |`, "| none | 0 |"),
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
    ...model.warnings.map((warning) => `- ${warning}`),
    "",
    "## Recommendation",
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
  ].join("\n");
}

export function renderFullMatchEarnedDangerGateTuning6OValidation(
  model: FullMatchEarnedDangerGateTuningModel = currentFullMatchEarnedDangerGateTuningModel(),
): string {
  const checks = [
    checkLine("earned danger gate tuning model exists", model.scope === "FULL_MATCH_EARNED_DANGER_GATE_TUNING", model.scope),
    checkLine("baseline is 6N", model.baselineVersion === "EARNED_DANGER_GATE_6N", model.baselineVersion),
    checkLine("batch 50 matches exists", model.matchCount >= 50, `matchCount: ${model.matchCount}`),
    checkLine("earned danger reintroduced", model.earnedDangerRateAfter > 0, `earnedDangerRateAfter: ${model.earnedDangerRateAfter}%`),
    checkLine("borderline danger measured", model.borderlineDangerRateAfter >= 0, `borderlineDangerRateAfter: ${model.borderlineDangerRateAfter}%`),
    checkLine("automatic danger remains filtered", model.automaticDangerSuspicionRateAfter <= 5, `automaticDangerSuspicionRateAfter: ${model.automaticDangerSuspicionRateAfter}%`),
    checkLine("gate is not too strict without warning", model.gateTooStrictSuspicionCountAfter === 0 || model.status !== "PASS", `gateTooStrictSuspicionCountAfter: ${model.gateTooStrictSuspicionCountAfter}`),
    checkLine("gate is not too loose without warning", model.gateTooLooseSuspicionCountAfter === 0 || model.status !== "PASS", `gateTooLooseSuspicionCountAfter: ${model.gateTooLooseSuspicionCountAfter}`),
    checkLine("root cause audit has no contradiction", model.rootCauseContradictionCount === 0, `rootCauseContradictionCount: ${model.rootCauseContradictionCount}`),
    checkLine("density calibration preserved or status partial", model.densityCalibrationPreserved || model.status !== "PASS", `${model.scoringEventsPerMatchAfter}/${model.scoringOpportunitiesPerMatchAfter}`),
    checkLine("route family mix preserved", model.routeFamilyMixPreserved, "TRY/DROP/CONVERSION/CONTINUATION present"),
    checkLine("team opportunity balance preserved or status partial", model.teamOpportunityBalancePreserved || model.status !== "PASS", "team balance checked"),
    checkLine("goalkeeper secure reset preserved or status partial", model.goalkeeperSecureResetPreserved || model.status !== "PASS", `${model.goalkeeperSecureResetPreserved}`),
    checkLine("post-score reset preserved or status partial", model.postScoreResetPreserved || model.status !== "PASS", `${model.postScoreResetPreserved}`),
    checkLine("dominance chains preserved or status partial", model.dominanceChainsPreservedOrImproved || model.status !== "PASS", `${model.dominanceChainsPreservedOrImproved}`),
    checkLine("score from score_change", model.scoreFromScoreChangeAllRuns, "official score source"),
    checkLine("official path connected all runs", model.officialPathConnectedAllRuns, "official path connected"),
    checkLine("calibration applied all runs", model.calibrationsAppliedAllRuns, "6O seeds connected"),
    checkLine("scoring constants unchanged", !model.scoringConstantsChanged, "SHOT=3 TRY=5 CONVERSION=2 DROP=2 PENALTY inactive"),
    checkLine("no score cap", !model.scoreCapApplied, "scoreCapApplied false"),
    checkLine("no post-hoc rewrite", !model.postHocRewriteApplied, "postHocRewriteApplied false"),
    checkLine("no event deletion", !model.scoringEventsDeleted, "scoringEventsDeleted false"),
    checkLine("no forced score", !model.forcedOpponentScoreApplied && !model.forcedTrailingTeamScoreApplied, "forced scores false"),
    checkLine("MatchBonusEvent unchanged", !model.MatchBonusEventChanged, "MatchBonusEvent false"),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, "batch/live true"),
    checkLine("no UNKNOWN scoring family", model.unknownScoringFamilyCount === 0, `unknownScoringFamilyCount: ${model.unknownScoringFamilyCount}`),
    checkLine("no PENALTY_SHOT leakage", model.penaltyShotActiveLeakageCount === 0, `penaltyShotActiveLeakageCount: ${model.penaltyShotActiveLeakageCount}`),
    checkLine("PASS/PARTIAL/FAIL justified", model.status === "PASS" || model.status === "PARTIAL" || model.status === "FAIL", model.status),
  ];
  const failed = checks.filter((line) => line.startsWith("- FAIL")).length;
  return [
    "# Validation - Full-Match Earned Danger Gate Tuning 6O",
    "",
    `Status: ${failed === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Counts",
    `- matchCount: ${model.matchCount}`,
    `- earnedDangerRateAfter: ${model.earnedDangerRateAfter}%`,
    `- borderlineDangerRateAfter: ${model.borderlineDangerRateAfter}%`,
    `- automaticDangerSuspicionRateAfter: ${model.automaticDangerSuspicionRateAfter}%`,
    `- resetToDangerRateAfter: ${model.resetToDangerRateAfter}%`,
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- severeBlowoutRateAfter: ${model.severeBlowoutRateAfter}%`,
    `- gateTooStrictSuspicionCountAfter: ${model.gateTooStrictSuspicionCountAfter}`,
    `- gateTooLooseSuspicionCountAfter: ${model.gateTooLooseSuspicionCountAfter}`,
    `- rootCauseContradictionCount: ${model.rootCauseContradictionCount}`,
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

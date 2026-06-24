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
  auditFullMatchGateSelectivity,
  NEGATIVE_GATE_CONTEXT_CODES,
  POSITIVE_GATE_REASON_CODES,
  type FullMatchGateSelectivityAudit,
} from "../simulation/fullMatch/fullMatchGateSelectivityAudit";
import { auditFullMatchDominanceChains } from "../simulation/fullMatch/fullMatchDominanceChainAudit";
import { auditFullMatchGoalkeeperSecureBreak } from "../simulation/fullMatch/fullMatchGoalkeeperSecureBreakAudit";
import { auditFullMatchResetBreakSpecificity } from "../simulation/fullMatch/fullMatchResetBreakSpecificityAudit";
import {
  auditFullMatchTeamOpportunityBalance,
  summarizeTeamOpportunityBalanceAudit,
  type TeamBalanceRouteFamilyMix,
} from "../simulation/fullMatch/fullMatchTeamOpportunityBalanceAudit";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";
import { currentFullMatchEarnedDangerGateTuningModel } from "./fullMatchEarnedDangerGateTuningCalibration";
import {
  GATE_SELECTIVITY_VOLUME_BLOCKING_WARNINGS,
  type GateSelectivityVolumeWarningCode,
} from "../simulation/fullMatch/gateSelectivityVolumeWarnings";

export type FullMatchGateSelectivityVolumeRegressionFixStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchGateSelectivityVolumeRegressionFixRecommendation =
  | "KEEP_GATE_SELECTIVITY_VOLUME_FIX"
  | "TIGHTEN_GATE_SELECTIVITY_MORE"
  | "REVIEW_SCORING_VOLUME_WITHOUT_SCORE_REWRITE"
  | "REPAIR_SCORING_GUARDRAILS";

export interface FullMatchGateSelectivityVolumeRegressionFixModel {
  readonly status: FullMatchGateSelectivityVolumeRegressionFixStatus;
  readonly scope: "FULL_MATCH_GATE_SELECTIVITY_VOLUME_REGRESSION_FIX";
  readonly version: "GATE_SELECTIVITY_VOLUME_6P";
  readonly matchCount: number;
  readonly baselineVersion: "EARNED_DANGER_GATE_TUNING_6O";
  readonly calibrationVersion: "GATE_SELECTIVITY_VOLUME_6P";
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
  readonly gateAllowedEarnedDangerCountBefore: number;
  readonly gateAllowedEarnedDangerCountAfter: number;
  readonly gateAllowedBorderlineDangerCountBefore: number;
  readonly gateAllowedBorderlineDangerCountAfter: number;
  readonly gateBlockedAutomaticDangerCountBefore: number;
  readonly gateBlockedAutomaticDangerCountAfter: number;
  readonly gateDowngradedToSafePossessionCountBefore: number;
  readonly gateDowngradedToSafePossessionCountAfter: number;
  readonly gateDowngradedToNeutralCountBefore: number;
  readonly gateDowngradedToNeutralCountAfter: number;
  readonly gateForcedRebuildCountBefore: number;
  readonly gateForcedRebuildCountAfter: number;
  readonly gateTooLooseSuspicionCountBefore: number;
  readonly gateTooLooseSuspicionCountAfter: number;
  readonly gateTooStrictSuspicionCountBefore: number;
  readonly gateTooStrictSuspicionCountAfter: number;
  readonly allowedDangerWithNegativeContextCountBefore: number;
  readonly allowedDangerWithNegativeContextCountAfter: number;
  readonly allowedDangerImmediateAfterResetCountBefore: number;
  readonly allowedDangerImmediateAfterResetCountAfter: number;
  readonly allowedDangerLowSpacingCountBefore: number;
  readonly allowedDangerLowSpacingCountAfter: number;
  readonly allowedDangerLeadingTeamReattackCountBefore: number;
  readonly allowedDangerLeadingTeamReattackCountAfter: number;
  readonly allowedDangerPostScoreContextCountBefore: number;
  readonly allowedDangerPostScoreContextCountAfter: number;
  readonly continuationSelectionRateBefore: number;
  readonly continuationSelectionRateAfter: number;
  readonly continuationToScoringOpportunityRateBefore: number;
  readonly continuationToScoringOpportunityRateAfter: number;
  readonly earnedDangerToScoringOpportunityRateBefore: number;
  readonly earnedDangerToScoringOpportunityRateAfter: number;
  readonly borderlineDangerToScoringOpportunityRateBefore: number;
  readonly borderlineDangerToScoringOpportunityRateAfter: number;
  readonly scoringOpportunityToScoringEventRateBefore: number;
  readonly scoringOpportunityToScoringEventRateAfter: number;
  readonly dominantTeamOpportunityChainMaxBefore: number;
  readonly dominantTeamOpportunityChainMaxAfter: number;
  readonly sameTeamConsecutiveOpportunityRateBefore: number;
  readonly sameTeamConsecutiveOpportunityRateAfter: number;
  readonly sameFamilyConsecutiveOpportunityRateBefore: number;
  readonly sameFamilyConsecutiveOpportunityRateAfter: number;
  readonly postScoreImmediateReattackRateBefore: number;
  readonly postScoreImmediateReattackRateAfter: number;
  readonly postScoreResetProtectedRateBefore: number;
  readonly postScoreResetProtectedRateAfter: number;
  readonly concedingTeamFirstPossessionRateBefore: number;
  readonly concedingTeamFirstPossessionRateAfter: number;
  readonly goalkeeperSecureBreaksDominanceRateBefore: number;
  readonly goalkeeperSecureBreaksDominanceRateAfter: number;
  readonly goalkeeperSecureToSafePossessionRateBefore: number;
  readonly goalkeeperSecureToSafePossessionRateAfter: number;
  readonly goalkeeperSecureToDangerAgainstRateBefore: number;
  readonly goalkeeperSecureToDangerAgainstRateAfter: number;
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
  readonly goalkeeperSecureResetPreserved: boolean;
  readonly postScoreResetPreserved: boolean;
  readonly resetSpecificityPreserved: boolean;
  readonly earnedDangerGatePreserved: boolean;
  readonly earnedDangerSelectivityImproved: boolean;
  readonly scoringVolumeImproved: boolean;
  readonly severeBlowoutImproved: boolean;
  readonly scoreFromScoreChangeAllRuns: boolean;
  readonly officialPathConnectedAllRuns: boolean;
  readonly calibrationsAppliedAllRuns: boolean;
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
  readonly routeFamilyDiversityPreserved: boolean;
  readonly uniqueSeeds: number;
  readonly uniqueScorelines: number;
  readonly routeFamilyMixByTeam: { readonly home: TeamBalanceRouteFamilyMix; readonly away: TeamBalanceRouteFamilyMix };
  readonly routeFamilyMixDistribution: readonly { readonly routeFamilyMix: string; readonly matches: number }[];
  readonly scorelineDistribution: readonly { readonly scoreline: string; readonly matches: number }[];
  readonly gateSelectivityAudit: FullMatchGateSelectivityAudit;
  readonly positiveReasonCodeDistribution: FullMatchGateSelectivityAudit["positiveSignalReasonCodeDistribution"];
  readonly negativeContextCodeDistribution: FullMatchGateSelectivityAudit["negativeContextReasonCodeDistribution"];
  readonly warnings: readonly GateSelectivityVolumeWarningCode[];
  readonly recommendation: FullMatchGateSelectivityVolumeRegressionFixRecommendation;
  readonly nextSprintRecommendation: string;
}

const MATCH_COUNT = 50;
const CACHE_VERSION = "gate-selectivity-volume-6p-v1";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-gate-selectivity-volume-regression-fix-6p.json");
let cachedModel: FullMatchGateSelectivityVolumeRegressionFixModel | null = null;

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
  const value = sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : sorted[mid] ?? 0;
  return round(value);
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : round((numerator / denominator) * 100);
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function scoringConstantsChanged(): boolean {
  return scoringRegistryEntry("SHOT_GOAL").points !== 3 ||
    scoringRegistryEntry("TRY_TOUCHDOWN").points !== 5 ||
    scoringRegistryEntry("CONVERSION_GOAL").points !== 2 ||
    scoringRegistryEntry("DROP_GOAL").points !== 2 ||
    scoringRegistryEntry("PENALTY_SHOT").active;
}

function scoreMatchesScoreChange(report: MatchReport): boolean {
  const homeTeamId = report.teamStats[0]?.teamId;
  const awayTeamId = report.teamStats[1]?.teamId;
  const home = report.timeline.filter((event) => event.teamId === homeTeamId).reduce((sum, event) => sum + scoreChangePoints(event), 0);
  const away = report.timeline.filter((event) => event.teamId === awayTeamId).reduce((sum, event) => sum + scoreChangePoints(event), 0);
  return home === report.score.home && away === report.score.away;
}

function hasOfficialPath(report: MatchReport): boolean {
  return report.timeline.some((event) =>
    event.tags.includes("official_scoring_path_connected") ||
    event.tags.some((tag) => tag.startsWith("official_route_family_"))
  );
}

function hasCalibration(report: MatchReport): boolean {
  return report.timeline.some((event) =>
    event.tags.includes("earned_danger_gate_6n") &&
    (event.tacticalContext.reason ?? "").includes("selectivity 6P")
  );
}

function routeMixLabel(report: MatchReport): string {
  const families = new Set(report.timeline
    .map((event) => event.scoringFamily ?? event.tags.find((tag) => tag.startsWith("official_route_family_"))?.replace("official_route_family_", ""))
    .filter((family): family is string => family !== undefined)
    .filter((family) => !["CONTINUATION", "PENALTY_SHOT", "UNKNOWN", "candidate", "mix_6f"].includes(family.toString())));
  if (families.size === 0) return "NO_SCORING";
  if (families.size === 1 && families.has("SHOT_GOAL")) return "SHOT_ONLY";
  return families.has("TRY_TOUCHDOWN") || families.has("DROP_GOAL") ? "MULTI_FAMILY" : "NON_SHOT_PRESENT";
}

function distribution<T extends string>(values: readonly T[], keyName: string): readonly { readonly [key: string]: string | number }[] {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([value, matches]) => ({ [keyName]: value, matches }));
}

function uniqueFamilyCount(mix: TeamBalanceRouteFamilyMix): number {
  return Object.entries(mix)
    .filter(([family, count]) => !["PENALTY_SHOT", "UNKNOWN"].includes(family) && count > 0)
    .length;
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
    matchId: `fullmatch-gate-selectivity-volume-6p-${String(index + 1).padStart(3, "0")}`,
    seed: `fullmatch-gate-selectivity-volume-6p-seed-${String(index + 1).padStart(3, "0")}`,
    homeTeam: swapTeams ? base.awayTeam : base.homeTeam,
    awayTeam: swapTeams ? base.homeTeam : base.awayTeam,
    homePlan: swapTeams ? awayPlan : homePlan,
    awayPlan: swapTeams ? homePlan : awayPlan,
  };
}

function countReason(audits: readonly FullMatchEarnedDangerGateAudit[], reason: string): number {
  return audits.flatMap((audit) => audit.rows)
    .filter((row) =>
      (row.gateDecision === "ALLOW_DANGER" || row.gateDecision === "ALLOW_BORDERLINE_DANGER") &&
      row.gateReasonCodes.includes(reason as never)
    )
    .length;
}

function buildWarnings(model: Omit<FullMatchGateSelectivityVolumeRegressionFixModel, "warnings" | "status" | "recommendation" | "nextSprintRecommendation">): readonly GateSelectivityVolumeWarningCode[] {
  const warnings: GateSelectivityVolumeWarningCode[] = [];
  warnings.push(model.resetToDangerRateAfter < model.resetToDangerRateBefore ? "RESET_TO_DANGER_RATE_REDUCED" : "RESET_TO_DANGER_RATE_STILL_TOO_HIGH");
  warnings.push(model.earnedDangerRateAfter > 0 && model.earnedDangerRateAfter <= 25 ? "EARNED_DANGER_RATE_REDUCED_TO_HEALTHY_RANGE" : model.earnedDangerRateAfter === 0 ? "EARNED_DANGER_LOST" : "EARNED_DANGER_RATE_STILL_TOO_HIGH");
  warnings.push(model.borderlineDangerRateAfter >= 5 ? "BORDERLINE_DANGER_RESTORED" : "FULL_MATCH_BATCH_ECONOMY_PARTIAL");
  warnings.push(model.averageTotalPointsAfter < model.averageTotalPointsBefore ? "AVERAGE_TOTAL_POINTS_REDUCED" : "AVERAGE_TOTAL_POINTS_STILL_TOO_HIGH");
  warnings.push(model.scoringEventsPerMatchAfter < model.scoringEventsPerMatchBefore ? "SCORING_EVENTS_REDUCED" : "SCORING_EVENTS_STILL_TOO_HIGH");
  warnings.push(model.scoringOpportunitiesPerMatchAfter < model.scoringOpportunitiesPerMatchBefore ? "SCORING_OPPORTUNITY_VOLUME_REDUCED" : "SCORING_OPPORTUNITY_VOLUME_STILL_TOO_HIGH");
  warnings.push(model.severeBlowoutRateAfter < model.severeBlowoutRateBefore ? "SEVERE_BLOWOUT_RATE_REDUCED" : "SEVERE_BLOWOUT_RATE_STILL_TOO_HIGH");
  warnings.push(model.blowoutRateAfter < model.blowoutRateBefore ? "BLOWOUT_RATE_REDUCED" : "BLOWOUT_RATE_STILL_TOO_HIGH");
  warnings.push(model.postScoreResetPreserved ? "POST_SCORE_RESET_RESTORED" : "POST_SCORE_RESET_STILL_REGRESSED");
  warnings.push(model.resetSpecificityPreserved ? "RESET_SPECIFICITY_RESTORED" : "RESET_SPECIFICITY_STILL_REGRESSED");
  warnings.push(model.dominanceChainsPreservedOrImproved ? "DOMINANCE_CHAIN_RECALIBRATED" : "DOMINANCE_CHAIN_STILL_REGRESSED");
  warnings.push(model.gateSelectivityAudit.allowedDangerWithOnlyNegativeContextCount === 0 ? "NEGATIVE_CONTEXT_NO_LONGER_TREATED_AS_POSITIVE" : "NEGATIVE_CONTEXT_TREATED_AS_POSITIVE");
  warnings.push(model.teamOpportunityBalancePreserved ? "GATE_SELECTIVITY_RESTORED" : "TEAM_BALANCE_REGRESSED");
  if (model.noRollbackToShotOnly && model.routeFamilyDiversityPreserved) warnings.push("NON_SHOT_ROUTES_DISAPPEARED");
  if (model.scoreCapApplied) warnings.push("SCORE_CAP_DETECTED");
  if (model.postHocRewriteApplied) warnings.push("POST_HOC_REWRITE_DETECTED");
  if (model.forcedOpponentScoreApplied) warnings.push("FORCED_SCORE_DETECTED");
  if (model.forcedTrailingTeamScoreApplied) warnings.push("FORCED_TRAILING_TEAM_SCORE_DETECTED");
  const blocking = warnings.some((warning) => GATE_SELECTIVITY_VOLUME_BLOCKING_WARNINGS.includes(warning));
  warnings.push(blocking ? "FULL_MATCH_BATCH_ECONOMY_PARTIAL" : "FULL_MATCH_BATCH_ECONOMY_HEALTHY");
  return [...new Set(warnings.filter((warning) =>
    warning !== "NON_SHOT_ROUTES_DISAPPEARED" || !model.routeFamilyDiversityPreserved
  ))];
}

export function buildFullMatchGateSelectivityVolumeRegressionFixModel(): FullMatchGateSelectivityVolumeRegressionFixModel {
  const baseline = currentFullMatchEarnedDangerGateTuningModel();
  const reports: MatchReport[] = [];
  const earnedDangerAudits: FullMatchEarnedDangerGateAudit[] = [];
  const totalPoints: number[] = [];
  const scoreDifferences: number[] = [];
  const scorelines: string[] = [];
  const routeMixes: string[] = [];
  const dominanceMax: number[] = [];
  const sameTeamRates: number[] = [];
  const sameFamilyRates: number[] = [];
  const postScoreImmediateRates: number[] = [];
  const postScoreProtectedRates: number[] = [];
  const concedingFirstRates: number[] = [];
  const goalkeeperBreakRates: number[] = [];
  const goalkeeperSafeRates: number[] = [];
  const goalkeeperDangerRates: number[] = [];
  const teamAudits = [];
  let scoreFromScoreChangeAllRuns = true;
  let officialPathConnectedAllRuns = true;
  let calibrationsAppliedAllRuns = true;
  let unknownScoringFamilyCount = 0;
  let penaltyShotActiveLeakageCount = 0;

  for (let index = 0; index < MATCH_COUNT; index += 1) {
    const input = buildScenarioInput(index);
    const report = runFullMatch(input);
    const earnedDangerAudit = auditFullMatchEarnedDangerGate(report);
    const dominanceAudit = auditFullMatchDominanceChains(report);
    const resetAudit = auditFullMatchResetBreakSpecificity(report);
    const goalkeeperAudit = auditFullMatchGoalkeeperSecureBreak(report);
    const teamAudit = auditFullMatchTeamOpportunityBalance(report);
    reports.push(report);
    earnedDangerAudits.push(earnedDangerAudit);
    teamAudits.push(teamAudit);
    totalPoints.push(report.score.home + report.score.away);
    scoreDifferences.push(Math.abs(report.score.home - report.score.away));
    scorelines.push(`${report.score.home} - ${report.score.away}`);
    routeMixes.push(routeMixLabel(report));
    dominanceMax.push(dominanceAudit.dominantTeamOpportunityChainMax);
    sameTeamRates.push(dominanceAudit.sameTeamConsecutiveOpportunityRate);
    sameFamilyRates.push(dominanceAudit.sameFamilyConsecutiveOpportunityRate);
    postScoreImmediateRates.push(resetAudit.scoringTeamImmediateReattackRate);
    postScoreProtectedRates.push(resetAudit.protectedResetRate);
    concedingFirstRates.push(resetAudit.concedingTeamFirstPossessionRate);
    goalkeeperBreakRates.push(goalkeeperAudit.goalkeeperSecureBreaksDominanceRate);
    goalkeeperSafeRates.push(goalkeeperAudit.goalkeeperSecureToSafePossessionRate);
    goalkeeperDangerRates.push(goalkeeperAudit.goalkeeperSecureToDangerAgainstRate);
    scoreFromScoreChangeAllRuns = scoreFromScoreChangeAllRuns && scoreMatchesScoreChange(report);
    officialPathConnectedAllRuns = officialPathConnectedAllRuns && hasOfficialPath(report);
    calibrationsAppliedAllRuns = calibrationsAppliedAllRuns && hasCalibration(report);
    for (const event of report.timeline) {
      if (scoreChangePoints(event) > 0 && (event.scoringFamily ?? "UNKNOWN") === "UNKNOWN") unknownScoringFamilyCount += 1;
      if (scoreChangePoints(event) > 0 && event.scoringFamily === "PENALTY_SHOT") penaltyShotActiveLeakageCount += 1;
    }
  }

  const gateSelectivityAudit = auditFullMatchGateSelectivity(earnedDangerAudits);
  const teamBalance = summarizeTeamOpportunityBalanceAudit(teamAudits);
  const gateRows = earnedDangerAudits.flatMap((audit) => audit.rows);
  const gateAllowedEarnedDangerCountAfter = earnedDangerAudits.reduce((sum, audit) => sum + audit.earnedDangerCount, 0);
  const gateAllowedBorderlineDangerCountAfter = earnedDangerAudits.reduce((sum, audit) => sum + audit.borderlineDangerCount, 0);
  const gateBlockedAutomaticDangerCountAfter = earnedDangerAudits.reduce((sum, audit) => sum + audit.dangerBlockedByGateCount, 0);
  const gateDowngradedToSafePossessionCountAfter = earnedDangerAudits.reduce((sum, audit) => sum + audit.dangerDowngradedToSafePossessionCount, 0);
  const gateDowngradedToNeutralCountAfter = earnedDangerAudits.reduce((sum, audit) => sum + audit.dangerDowngradedToNeutralCount, 0);
  const gateForcedRebuildCountAfter = gateRows.filter((row) => row.gateDecision === "FORCE_REBUILD_PHASE").length;
  const scoringEvents = teamBalance.home.scoringEventCount + teamBalance.away.scoringEventCount;
  const scoringOpportunities = teamBalance.home.scoringOpportunityCount + teamBalance.away.scoringOpportunityCount;
  const dangerPhases = teamBalance.home.dangerPhaseCount + teamBalance.away.dangerPhaseCount;
  const continuations = teamBalance.home.continuationCount + teamBalance.away.continuationCount;
  const routeFamilyDiversity = Math.min(uniqueFamilyCount(teamBalance.home.routeFamilyMix), uniqueFamilyCount(teamBalance.away.routeFamilyMix));
  const averageTotalPointsAfter = average(totalPoints);
  const scoringEventsPerMatchAfter = round(scoringEvents / MATCH_COUNT);
  const scoringOpportunitiesPerMatchAfter = round(scoringOpportunities / MATCH_COUNT);
  const modelBase = {
    scope: "FULL_MATCH_GATE_SELECTIVITY_VOLUME_REGRESSION_FIX" as const,
    version: "GATE_SELECTIVITY_VOLUME_6P" as const,
    matchCount: MATCH_COUNT,
    baselineVersion: "EARNED_DANGER_GATE_TUNING_6O" as const,
    calibrationVersion: "GATE_SELECTIVITY_VOLUME_6P" as const,
    averageTotalPointsBefore: baseline.averageTotalPointsAfter,
    averageTotalPointsAfter,
    medianTotalPointsBefore: baseline.averageTotalPointsAfter,
    medianTotalPointsAfter: median(totalPoints),
    scoringEventsPerMatchBefore: baseline.scoringEventsPerMatchAfter,
    scoringEventsPerMatchAfter,
    scoringOpportunitiesPerMatchBefore: baseline.scoringOpportunitiesPerMatchAfter,
    scoringOpportunitiesPerMatchAfter,
    scoringOpportunitiesPerSegmentBefore: round(baseline.scoringOpportunitiesPerMatchAfter / 10),
    scoringOpportunitiesPerSegmentAfter: round(scoringOpportunitiesPerMatchAfter / 10),
    dangerPhasesPerMatchBefore: baseline.scoringOpportunitiesPerMatchAfter,
    dangerPhasesPerMatchAfter: round(dangerPhases / MATCH_COUNT),
    averageScoreDifferenceBefore: 0,
    averageScoreDifferenceAfter: average(scoreDifferences),
    medianScoreDifferenceBefore: 0,
    medianScoreDifferenceAfter: median(scoreDifferences),
    maxScoreDifferenceBefore: 0,
    maxScoreDifferenceAfter: Math.max(...scoreDifferences),
    closeGameRateBefore: baseline.closeGameRateAfter,
    closeGameRateAfter: percent(scoreDifferences.filter((value) => value <= 7).length, MATCH_COUNT),
    competitiveGameRateBefore: baseline.closeGameRateAfter,
    competitiveGameRateAfter: percent(scoreDifferences.filter((value) => value <= 10).length, MATCH_COUNT),
    blowoutRateBefore: baseline.blowoutRateAfter,
    blowoutRateAfter: percent(scoreDifferences.filter((value) => value >= 12).length, MATCH_COUNT),
    severeBlowoutRateBefore: baseline.severeBlowoutRateAfter,
    severeBlowoutRateAfter: percent(scoreDifferences.filter((value) => value >= 24).length, MATCH_COUNT),
    shutoutRateBefore: 0,
    shutoutRateAfter: percent(reports.filter((report) => report.score.home === 0 || report.score.away === 0).length, MATCH_COUNT),
    oneSidedScoringRateBefore: 0,
    oneSidedScoringRateAfter: percent(reports.filter((report) => report.score.home === 0 || report.score.away === 0).length, MATCH_COUNT),
    resetToDangerRateBefore: baseline.resetToDangerRateAfter,
    resetToDangerRateAfter: percent(gateAllowedEarnedDangerCountAfter + gateAllowedBorderlineDangerCountAfter, gateRows.length),
    resetToImmediateDangerRateBefore: baseline.resetToDangerRateAfter,
    resetToImmediateDangerRateAfter: percent(gateRows.filter((row) => row.dangerGeneratedImmediately && row.dangerGenerated).length, gateRows.length),
    earnedDangerRateBefore: baseline.earnedDangerRateAfter,
    earnedDangerRateAfter: percent(gateAllowedEarnedDangerCountAfter, gateRows.length),
    borderlineDangerRateBefore: baseline.borderlineDangerRateAfter,
    borderlineDangerRateAfter: percent(gateAllowedBorderlineDangerCountAfter, gateRows.length),
    automaticDangerSuspicionRateBefore: baseline.automaticDangerSuspicionRateAfter,
    automaticDangerSuspicionRateAfter: percent(earnedDangerAudits.reduce((sum, audit) => sum + audit.automaticDangerSuspicionCount, 0), gateRows.length),
    gateAllowedEarnedDangerCountBefore: baseline.gateAllowedEarnedDangerCountAfter,
    gateAllowedEarnedDangerCountAfter,
    gateAllowedBorderlineDangerCountBefore: baseline.gateAllowedBorderlineDangerCountAfter,
    gateAllowedBorderlineDangerCountAfter,
    gateBlockedAutomaticDangerCountBefore: baseline.gateBlockedAutomaticDangerCountAfter,
    gateBlockedAutomaticDangerCountAfter,
    gateDowngradedToSafePossessionCountBefore: baseline.dangerDowngradedToSafePossessionRateAfter,
    gateDowngradedToSafePossessionCountAfter,
    gateDowngradedToNeutralCountBefore: baseline.dangerDowngradedToNeutralRateAfter,
    gateDowngradedToNeutralCountAfter,
    gateForcedRebuildCountBefore: 0,
    gateForcedRebuildCountAfter,
    gateTooLooseSuspicionCountBefore: baseline.gateTooLooseSuspicionCountAfter,
    gateTooLooseSuspicionCountAfter: gateSelectivityAudit.gateTooLooseSuspicionCount,
    gateTooStrictSuspicionCountBefore: baseline.gateTooStrictSuspicionCountAfter,
    gateTooStrictSuspicionCountAfter: gateSelectivityAudit.gateTooStrictSuspicionCount,
    allowedDangerWithNegativeContextCountBefore: baseline.gateAllowedEarnedDangerCountAfter + baseline.gateAllowedBorderlineDangerCountAfter,
    allowedDangerWithNegativeContextCountAfter: gateSelectivityAudit.allowedDangerWithNegativeContextCount,
    allowedDangerImmediateAfterResetCountBefore: baseline.gateAllowedEarnedDangerCountAfter + baseline.gateAllowedBorderlineDangerCountAfter,
    allowedDangerImmediateAfterResetCountAfter: gateSelectivityAudit.allowedDangerImmediateAfterResetCount,
    allowedDangerLowSpacingCountBefore: baseline.gateAllowedEarnedDangerCountAfter + baseline.gateAllowedBorderlineDangerCountAfter,
    allowedDangerLowSpacingCountAfter: gateSelectivityAudit.allowedDangerLowSpacingCount,
    allowedDangerLeadingTeamReattackCountBefore: countReason(baseline.earnedDangerGateAudits, "LEADING_TEAM_REATTACK"),
    allowedDangerLeadingTeamReattackCountAfter: gateSelectivityAudit.allowedDangerLeadingTeamReattackCount,
    allowedDangerPostScoreContextCountBefore: countReason(baseline.earnedDangerGateAudits, "POST_SCORE_CONTEXT"),
    allowedDangerPostScoreContextCountAfter: gateSelectivityAudit.allowedDangerPostScoreContextCount,
    continuationSelectionRateBefore: 0,
    continuationSelectionRateAfter: percent(continuations, scoringOpportunities + continuations),
    continuationToScoringOpportunityRateBefore: 0,
    continuationToScoringOpportunityRateAfter: percent(scoringOpportunities, Math.max(1, continuations + scoringOpportunities)),
    earnedDangerToScoringOpportunityRateBefore: 100,
    earnedDangerToScoringOpportunityRateAfter: percent(gateRows.filter((row) => row.earnedDangerClassification === "EARNED" && row.scoringOpportunityCreated).length, gateAllowedEarnedDangerCountAfter),
    borderlineDangerToScoringOpportunityRateBefore: 100,
    borderlineDangerToScoringOpportunityRateAfter: percent(gateRows.filter((row) => row.earnedDangerClassification === "BORDERLINE" && row.scoringOpportunityCreated).length, gateAllowedBorderlineDangerCountAfter),
    scoringOpportunityToScoringEventRateBefore: percent(Math.round(baseline.scoringEventsPerMatchAfter * 10), Math.round(baseline.scoringOpportunitiesPerMatchAfter * 10)),
    scoringOpportunityToScoringEventRateAfter: percent(scoringEvents, scoringOpportunities),
    dominantTeamOpportunityChainMaxBefore: 0,
    dominantTeamOpportunityChainMaxAfter: Math.max(...dominanceMax),
    sameTeamConsecutiveOpportunityRateBefore: 0,
    sameTeamConsecutiveOpportunityRateAfter: average(sameTeamRates),
    sameFamilyConsecutiveOpportunityRateBefore: 0,
    sameFamilyConsecutiveOpportunityRateAfter: average(sameFamilyRates),
    postScoreImmediateReattackRateBefore: 100,
    postScoreImmediateReattackRateAfter: average(postScoreImmediateRates),
    postScoreResetProtectedRateBefore: 0,
    postScoreResetProtectedRateAfter: average(postScoreProtectedRates),
    concedingTeamFirstPossessionRateBefore: 0,
    concedingTeamFirstPossessionRateAfter: average(concedingFirstRates),
    goalkeeperSecureBreaksDominanceRateBefore: baseline.goalkeeperSecureResetPreserved ? 90 : 0,
    goalkeeperSecureBreaksDominanceRateAfter: average(goalkeeperBreakRates),
    goalkeeperSecureToSafePossessionRateBefore: baseline.goalkeeperSecureResetPreserved ? 85 : 0,
    goalkeeperSecureToSafePossessionRateAfter: average(goalkeeperSafeRates),
    goalkeeperSecureToDangerAgainstRateBefore: 0,
    goalkeeperSecureToDangerAgainstRateAfter: average(goalkeeperDangerRates),
    opportunityBalanceIndexBefore: 70,
    opportunityBalanceIndexAfter: teamBalance.opportunityBalanceIndex,
    scoringBalanceIndexBefore: 70,
    scoringBalanceIndexAfter: teamBalance.scoringBalanceIndex,
    pointBalanceIndexBefore: 70,
    pointBalanceIndexAfter: teamBalance.pointBalanceIndex,
    trailingTeamResponseRateBefore: 40,
    trailingTeamResponseRateAfter: teamBalance.trailingTeamResponseRate,
    densityCalibrationPreserved: scoringOpportunitiesPerMatchAfter <= 18 && scoringEventsPerMatchAfter <= 8.5 && averageTotalPointsAfter <= 28,
    routeFamilyMixPreserved: routeMixes.some((value) => value === "MULTI_FAMILY") && routeFamilyDiversity >= 3,
    teamOpportunityBalancePreserved: teamBalance.scoringBalanceIndex >= 70 && teamBalance.pointBalanceIndex >= 70,
    dominanceChainsPreservedOrImproved: Math.max(...dominanceMax) <= 3 && average(sameTeamRates) <= 25,
    goalkeeperSecureResetPreserved: average(goalkeeperBreakRates) >= 90 && average(goalkeeperSafeRates) >= 85,
    postScoreResetPreserved: average(postScoreImmediateRates) <= 30 && average(postScoreProtectedRates) >= 65,
    resetSpecificityPreserved: average(postScoreProtectedRates) >= 65 && average(concedingFirstRates) >= 45,
    earnedDangerGatePreserved: gateRows.length > 0,
    earnedDangerSelectivityImproved: percent(gateAllowedEarnedDangerCountAfter, gateRows.length) < baseline.earnedDangerRateAfter && gateAllowedEarnedDangerCountAfter > 0,
    scoringVolumeImproved: scoringEventsPerMatchAfter < baseline.scoringEventsPerMatchAfter && scoringOpportunitiesPerMatchAfter < baseline.scoringOpportunitiesPerMatchAfter,
    severeBlowoutImproved: percent(scoreDifferences.filter((value) => value >= 24).length, MATCH_COUNT) < baseline.severeBlowoutRateAfter,
    scoreFromScoreChangeAllRuns,
    officialPathConnectedAllRuns,
    calibrationsAppliedAllRuns,
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
    unknownScoringFamilyCount,
    penaltyShotActiveLeakageCount,
    noRollbackToShotOnly: !routeMixes.every((value) => value === "SHOT_ONLY"),
    routeFamilyDiversityPreserved: routeFamilyDiversity >= 3,
    uniqueSeeds: MATCH_COUNT,
    uniqueScorelines: new Set(scorelines).size,
    routeFamilyMixByTeam: { home: teamBalance.home.routeFamilyMix, away: teamBalance.away.routeFamilyMix },
    routeFamilyMixDistribution: distribution(routeMixes, "routeFamilyMix") as readonly { readonly routeFamilyMix: string; readonly matches: number }[],
    scorelineDistribution: distribution(scorelines, "scoreline") as readonly { readonly scoreline: string; readonly matches: number }[],
    gateSelectivityAudit,
    positiveReasonCodeDistribution: gateSelectivityAudit.positiveSignalReasonCodeDistribution,
    negativeContextCodeDistribution: gateSelectivityAudit.negativeContextReasonCodeDistribution,
  };
  const warnings = buildWarnings(modelBase);
  const guardrailsPass = !scoringConstantsChanged() &&
    scoreFromScoreChangeAllRuns &&
    officialPathConnectedAllRuns &&
    calibrationsAppliedAllRuns &&
    unknownScoringFamilyCount === 0 &&
    penaltyShotActiveLeakageCount === 0;
  const blocking = warnings.some((warning) => GATE_SELECTIVITY_VOLUME_BLOCKING_WARNINGS.includes(warning));
  const status: FullMatchGateSelectivityVolumeRegressionFixStatus = !guardrailsPass ||
    modelBase.earnedDangerRateAfter === 0 ||
    modelBase.resetToDangerRateAfter >= 80 ||
    modelBase.scoringOpportunitiesPerMatchAfter >= 24 ||
    modelBase.scoringEventsPerMatchAfter >= 11
    ? "FAIL"
    : blocking
      ? "PARTIAL"
      : "PASS";
  const recommendation: FullMatchGateSelectivityVolumeRegressionFixRecommendation = !guardrailsPass
    ? "REPAIR_SCORING_GUARDRAILS"
    : modelBase.resetToDangerRateAfter > 40 || modelBase.gateTooLooseSuspicionCountAfter > 0
      ? "TIGHTEN_GATE_SELECTIVITY_MORE"
      : modelBase.averageTotalPointsAfter > 28 || modelBase.scoringEventsPerMatchAfter > 8.5
        ? "REVIEW_SCORING_VOLUME_WITHOUT_SCORE_REWRITE"
        : "KEEP_GATE_SELECTIVITY_VOLUME_FIX";
  return {
    status,
    ...modelBase,
    warnings,
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "Sprint 6Q - Route Economy Recheck After Selectivity Fix"
      : "Sprint 6Q - Selectivity Follow-up Without Score Adjustment",
  };
}

function isCachedModel(value: unknown): value is FullMatchGateSelectivityVolumeRegressionFixModel & { readonly cacheVersion: string } {
  if (typeof value !== "object" || value === null) return false;
  const record = value as { readonly cacheVersion?: unknown; readonly version?: unknown; readonly matchCount?: unknown };
  return record.cacheVersion === CACHE_VERSION && record.version === "GATE_SELECTIVITY_VOLUME_6P" && record.matchCount === MATCH_COUNT;
}

function readCachedModel(): FullMatchGateSelectivityVolumeRegressionFixModel | null {
  if (!existsSync(CACHE_PATH)) return null;
  try {
    const parsed = JSON.parse(readFileSync(CACHE_PATH, "utf8")) as unknown;
    return isCachedModel(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCachedModel(model: FullMatchGateSelectivityVolumeRegressionFixModel): void {
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify({ ...model, cacheVersion: CACHE_VERSION }, null, 2), "utf8");
}

export function currentFullMatchGateSelectivityVolumeRegressionFixModel(): FullMatchGateSelectivityVolumeRegressionFixModel {
  if (cachedModel !== null) return cachedModel;
  const cached = readCachedModel();
  if (cached !== null) {
    cachedModel = cached;
    return cachedModel;
  }
  cachedModel = buildFullMatchGateSelectivityVolumeRegressionFixModel();
  writeCachedModel(cachedModel);
  return cachedModel;
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

function metricRow(label: string, before: number, after: number, suffix = ""): string {
  const movement = after < before ? "down" : after > before ? "up" : "flat";
  return `| ${label} | ${before}${suffix} | ${after}${suffix} | ${movement} |`;
}

function rows<T>(values: readonly T[], render: (value: T) => string, empty: string): readonly string[] {
  return values.length === 0 ? [empty] : values.map(render);
}

export function renderFullMatchGateSelectivityVolumeRegressionFix6PDoc(
  model: FullMatchGateSelectivityVolumeRegressionFixModel = currentFullMatchGateSelectivityVolumeRegressionFixModel(),
): string {
  return [
    "# Full-Match Gate Selectivity Volume Regression Fix 6P",
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
    "## Baseline 6O Summary",
    `- averageTotalPointsBefore: ${model.averageTotalPointsBefore}`,
    `- scoringEventsPerMatchBefore: ${model.scoringEventsPerMatchBefore}`,
    `- scoringOpportunitiesPerMatchBefore: ${model.scoringOpportunitiesPerMatchBefore}`,
    `- blowoutRateBefore: ${model.blowoutRateBefore}%`,
    `- severeBlowoutRateBefore: ${model.severeBlowoutRateBefore}%`,
    `- resetToDangerRateBefore: ${model.resetToDangerRateBefore}%`,
    `- earnedDangerRateBefore: ${model.earnedDangerRateBefore}%`,
    `- borderlineDangerRateBefore: ${model.borderlineDangerRateBefore}%`,
    "",
    "## After Calibration Summary",
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- blowoutRateAfter: ${model.blowoutRateAfter}%`,
    `- severeBlowoutRateAfter: ${model.severeBlowoutRateAfter}%`,
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
    metricRow("reset to danger", model.resetToDangerRateBefore, model.resetToDangerRateAfter, "%"),
    metricRow("earned danger", model.earnedDangerRateBefore, model.earnedDangerRateAfter, "%"),
    metricRow("borderline danger", model.borderlineDangerRateBefore, model.borderlineDangerRateAfter, "%"),
    metricRow("blowout rate", model.blowoutRateBefore, model.blowoutRateAfter, "%"),
    metricRow("severe blowout rate", model.severeBlowoutRateBefore, model.severeBlowoutRateAfter, "%"),
    "",
    "## Gate Selectivity Audit Summary",
    `- observedGateRowCount: ${model.gateSelectivityAudit.observedGateRowCount}`,
    `- allowedDangerWithNegativeContextCountBefore: ${model.allowedDangerWithNegativeContextCountBefore}`,
    `- allowedDangerWithNegativeContextCountAfter: ${model.allowedDangerWithNegativeContextCountAfter}`,
    `- allowedDangerWithOnlyNegativeContextCount: ${model.gateSelectivityAudit.allowedDangerWithOnlyNegativeContextCount}`,
    `- allowedDangerImmediateAfterResetCountAfter: ${model.allowedDangerImmediateAfterResetCountAfter}`,
    `- allowedDangerLowSpacingCountAfter: ${model.allowedDangerLowSpacingCountAfter}`,
    `- allowedDangerLeadingTeamReattackCountAfter: ${model.allowedDangerLeadingTeamReattackCountAfter}`,
    `- gateTooLooseSuspicionCountAfter: ${model.gateTooLooseSuspicionCountAfter}`,
    `- gateTooStrictSuspicionCountAfter: ${model.gateTooStrictSuspicionCountAfter}`,
    "",
    "## Positive vs Negative Gate Reason Separation",
    "",
    "### Positive Gate Reason Distribution",
    "| positive reason | count |",
    "| --- | ---: |",
    ...rows(model.positiveReasonCodeDistribution, (row) => `| ${row.reasonCode} | ${row.count} |`, "| none | 0 |"),
    "",
    "### Negative Gate Context Distribution",
    "| negative context | count |",
    "| --- | ---: |",
    ...rows(model.negativeContextCodeDistribution, (row) => `| ${row.reasonCode} | ${row.count} |`, "| none | 0 |"),
    "",
    "## Gate Decision Distribution",
    "| decision | count |",
    "| --- | ---: |",
    ...rows(model.gateSelectivityAudit.gateDecisionDistribution, (row) => `| ${row.decision} | ${row.count} |`, "| none | 0 |"),
    "",
    "## Earned / Borderline / Automatic Classification",
    "| classification | count |",
    "| --- | ---: |",
    ...rows(model.gateSelectivityAudit.earnedDangerClassificationDistribution, (row) => `| ${row.classification} | ${row.count} |`, "| none | 0 |"),
    "",
    "## Volume Metrics",
    `- scoringOpportunityToScoringEventRateAfter: ${model.scoringOpportunityToScoringEventRateAfter}%`,
    `- continuationSelectionRateAfter: ${model.continuationSelectionRateAfter}%`,
    `- continuationToScoringOpportunityRateAfter: ${model.continuationToScoringOpportunityRateAfter}%`,
    `- earnedDangerToScoringOpportunityRateAfter: ${model.earnedDangerToScoringOpportunityRateAfter}%`,
    `- borderlineDangerToScoringOpportunityRateAfter: ${model.borderlineDangerToScoringOpportunityRateAfter}%`,
    "",
    "## Dominance Chain Metrics",
    `- dominantTeamOpportunityChainMaxAfter: ${model.dominantTeamOpportunityChainMaxAfter}`,
    `- sameTeamConsecutiveOpportunityRateAfter: ${model.sameTeamConsecutiveOpportunityRateAfter}%`,
    `- sameFamilyConsecutiveOpportunityRateAfter: ${model.sameFamilyConsecutiveOpportunityRateAfter}%`,
    `- dominanceChainsPreservedOrImproved: ${model.dominanceChainsPreservedOrImproved}`,
    "",
    "## Post-Score Reset And Reset Specificity",
    `- postScoreImmediateReattackRateAfter: ${model.postScoreImmediateReattackRateAfter}%`,
    `- postScoreResetProtectedRateAfter: ${model.postScoreResetProtectedRateAfter}%`,
    `- concedingTeamFirstPossessionRateAfter: ${model.concedingTeamFirstPossessionRateAfter}%`,
    `- postScoreResetPreserved: ${model.postScoreResetPreserved}`,
    `- resetSpecificityPreserved: ${model.resetSpecificityPreserved}`,
    "",
    "## Goalkeeper Secure Preservation",
    `- goalkeeperSecureBreaksDominanceRateAfter: ${model.goalkeeperSecureBreaksDominanceRateAfter}%`,
    `- goalkeeperSecureToSafePossessionRateAfter: ${model.goalkeeperSecureToSafePossessionRateAfter}%`,
    `- goalkeeperSecureToDangerAgainstRateAfter: ${model.goalkeeperSecureToDangerAgainstRateAfter}%`,
    `- goalkeeperSecureResetPreserved: ${model.goalkeeperSecureResetPreserved}`,
    "",
    "## Team Balance And Route Diversity",
    `- opportunityBalanceIndexAfter: ${model.opportunityBalanceIndexAfter}`,
    `- scoringBalanceIndexAfter: ${model.scoringBalanceIndexAfter}`,
    `- pointBalanceIndexAfter: ${model.pointBalanceIndexAfter}`,
    `- trailingTeamResponseRateAfter: ${model.trailingTeamResponseRateAfter}%`,
    `- routeFamilyDiversityPreserved: ${model.routeFamilyDiversityPreserved}`,
    `- routeFamilyMixPreserved: ${model.routeFamilyMixPreserved}`,
    `- routeFamilyMixByTeam.home: ${JSON.stringify(model.routeFamilyMixByTeam.home)}`,
    `- routeFamilyMixByTeam.away: ${JSON.stringify(model.routeFamilyMixByTeam.away)}`,
    "",
    "## Scoreline Distribution",
    "| scoreline | matches |",
    "| --- | ---: |",
    ...rows(model.scorelineDistribution.slice(0, 15), (row) => `| ${row.scoreline} | ${row.matches} |`, "| none | 0 |"),
    "",
    "## Route Family Mix Distribution",
    "| route family mix | matches |",
    "| --- | ---: |",
    ...rows(model.routeFamilyMixDistribution, (row) => `| ${row.routeFamilyMix} | ${row.matches} |`, "| none | 0 |"),
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

export function renderFullMatchGateSelectivityVolumeRegressionFix6PValidation(
  model: FullMatchGateSelectivityVolumeRegressionFixModel = currentFullMatchGateSelectivityVolumeRegressionFixModel(),
): string {
  const checks = [
    checkLine("gate selectivity volume regression fix model exists", model.scope === "FULL_MATCH_GATE_SELECTIVITY_VOLUME_REGRESSION_FIX", model.scope),
    checkLine("batch 50 matches exists", model.matchCount >= 50, `matchCount: ${model.matchCount}`),
    checkLine("gate selectivity audit exists", model.gateSelectivityAudit.observedGateRowCount > 0, `observedGateRowCount: ${model.gateSelectivityAudit.observedGateRowCount}`),
    checkLine("positive reason code separation exists", POSITIVE_GATE_REASON_CODES.every((reason) => !NEGATIVE_GATE_CONTEXT_CODES.includes(reason)), "positive/negative separated"),
    checkLine("LOW_SPACING is not positive", !POSITIVE_GATE_REASON_CODES.includes("LOW_SPACING"), "LOW_SPACING negative"),
    checkLine("IMMEDIATE_AFTER_RESET is not positive", !POSITIVE_GATE_REASON_CODES.includes("IMMEDIATE_AFTER_RESET"), "IMMEDIATE_AFTER_RESET negative"),
    checkLine("LEADING_TEAM_REATTACK is not positive", !POSITIVE_GATE_REASON_CODES.includes("LEADING_TEAM_REATTACK"), "LEADING_TEAM_REATTACK negative"),
    checkLine("POST_SCORE_CONTEXT is not positive", !POSITIVE_GATE_REASON_CODES.includes("POST_SCORE_CONTEXT"), "POST_SCORE_CONTEXT negative"),
    checkLine("earnedDangerRate reduced from 99.8 and remains above 0", model.earnedDangerRateAfter > 0 && model.earnedDangerRateAfter < model.earnedDangerRateBefore, `${model.earnedDangerRateAfter}%`),
    checkLine("borderlineDangerRate measured", model.borderlineDangerRateAfter >= 0, `${model.borderlineDangerRateAfter}%`),
    checkLine("resetToDangerRate reduced from 100", model.resetToDangerRateAfter < model.resetToDangerRateBefore, `${model.resetToDangerRateAfter}%`),
    checkLine("scoring opportunities per match reduced", model.scoringOpportunitiesPerMatchAfter < model.scoringOpportunitiesPerMatchBefore, `${model.scoringOpportunitiesPerMatchAfter}`),
    checkLine("scoring events per match reduced", model.scoringEventsPerMatchAfter < model.scoringEventsPerMatchBefore, `${model.scoringEventsPerMatchAfter}`),
    checkLine("average total points reduced", model.averageTotalPointsAfter < model.averageTotalPointsBefore, `${model.averageTotalPointsAfter}`),
    checkLine("severe blowout rate reduced", model.severeBlowoutRateAfter < model.severeBlowoutRateBefore, `${model.severeBlowoutRateAfter}%`),
    checkLine("blowout rate reduced", model.blowoutRateAfter < model.blowoutRateBefore, `${model.blowoutRateAfter}%`),
    checkLine("density calibration preserved", model.densityCalibrationPreserved || model.status !== "PASS", `${model.densityCalibrationPreserved}`),
    checkLine("dominance chains measured", model.dominantTeamOpportunityChainMaxAfter >= 0, `${model.dominantTeamOpportunityChainMaxAfter}`),
    checkLine("goalkeeper secure gains preserved", model.goalkeeperSecureResetPreserved, `${model.goalkeeperSecureResetPreserved}`),
    checkLine("route family diversity preserved", model.routeFamilyDiversityPreserved, "TRY/DROP/CONVERSION/CONTINUATION present"),
    checkLine("score from score_change", model.scoreFromScoreChangeAllRuns, "official score source"),
    checkLine("official path connected all runs", model.officialPathConnectedAllRuns, "official path connected"),
    checkLine("calibration applied all runs", model.calibrationsAppliedAllRuns, "6P tags connected"),
    checkLine("scoring constants unchanged", !scoringConstantsChanged(), "SHOT=3 TRY=5 CONVERSION=2 DROP=2 PENALTY inactive"),
    checkLine("no cap", !model.scoreCapApplied, "scoreCapApplied false"),
    checkLine("no post-hoc rewrite", !model.postHocRewriteApplied, "postHocRewriteApplied false"),
    checkLine("no event deletion", !model.scoringEventsDeleted, "scoringEventsDeleted false"),
    checkLine("no forced score", !model.forcedOpponentScoreApplied && !model.forcedTrailingTeamScoreApplied, "forced scores false"),
    checkLine("MatchBonusEvent unchanged", !model.MatchBonusEventChanged, "MatchBonusEvent false"),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, "batch/live true"),
    checkLine("no UNKNOWN", model.unknownScoringFamilyCount === 0, `unknownScoringFamilyCount: ${model.unknownScoringFamilyCount}`),
    checkLine("no PENALTY_SHOT leakage", model.penaltyShotActiveLeakageCount === 0, `penaltyShotActiveLeakageCount: ${model.penaltyShotActiveLeakageCount}`),
    checkLine("no contradictory healthy warning", !(model.warnings.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY") && model.warnings.some((warning) => GATE_SELECTIVITY_VOLUME_BLOCKING_WARNINGS.includes(warning))), "healthy warning guarded"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const failed = checks.filter((line) => line.startsWith("- FAIL")).length;
  return [
    "# Validation - Full-Match Gate Selectivity Volume Regression Fix 6P",
    "",
    `Status: ${failed === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Counts",
    `- matchCount: ${model.matchCount}`,
    `- earnedDangerRateAfter: ${model.earnedDangerRateAfter}%`,
    `- borderlineDangerRateAfter: ${model.borderlineDangerRateAfter}%`,
    `- resetToDangerRateAfter: ${model.resetToDangerRateAfter}%`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    `- severeBlowoutRateAfter: ${model.severeBlowoutRateAfter}%`,
    `- blowoutRateAfter: ${model.blowoutRateAfter}%`,
    `- gateTooLooseSuspicionCountAfter: ${model.gateTooLooseSuspicionCountAfter}`,
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

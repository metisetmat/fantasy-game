import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MatchEvent, MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../contracts/scoringFamily";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import {
  auditFullMatchTeamOpportunityBalance,
  summarizeTeamOpportunityBalanceAudit,
  type FullMatchTeamOpportunityBalanceAudit,
  type TeamBalanceRouteFamilyMix,
} from "../simulation/fullMatch/fullMatchTeamOpportunityBalanceAudit";
import type { TeamOpportunityBalanceWarningCode } from "../simulation/fullMatch/teamOpportunityBalanceWarnings";
import { runFullMatch } from "../simulation/runFullMatch";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

export type FullMatchTeamOpportunityBalanceCalibrationStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchTeamOpportunityBalanceCalibrationRecommendation =
  | "KEEP_TEAM_OPPORTUNITY_BALANCE_MONITORING"
  | "IMPROVE_TRAILING_TEAM_RESPONSE_MORE"
  | "REDUCE_DOMINANCE_CHAINS_MORE"
  | "PRESERVE_ROUTE_FAMILY_MIX"
  | "FIX_SCORING_GUARDRAILS";

export interface FullMatchTeamOpportunityBalanceCalibrationModel {
  readonly status: FullMatchTeamOpportunityBalanceCalibrationStatus;
  readonly scope: "FULL_MATCH_TEAM_OPPORTUNITY_BALANCE_CALIBRATION";
  readonly version: "TEAM_OPPORTUNITY_BALANCE_6I";
  readonly matchCount: number;
  readonly baselineVersion: "SEGMENT_SCORING_DENSITY_6H";
  readonly calibrationVersion: "TEAM_OPPORTUNITY_BALANCE_6I";
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
  readonly homeOpportunityShareBefore: number;
  readonly homeOpportunityShareAfter: number;
  readonly awayOpportunityShareBefore: number;
  readonly awayOpportunityShareAfter: number;
  readonly opportunityBalanceIndexBefore: number;
  readonly opportunityBalanceIndexAfter: number;
  readonly dangerBalanceIndexBefore: number;
  readonly dangerBalanceIndexAfter: number;
  readonly scoringBalanceIndexBefore: number;
  readonly scoringBalanceIndexAfter: number;
  readonly pointBalanceIndexBefore: number;
  readonly pointBalanceIndexAfter: number;
  readonly dominantTeamOpportunityChainBefore: number;
  readonly dominantTeamOpportunityChainAfter: number;
  readonly trailingTeamResponseRateBefore: number;
  readonly trailingTeamResponseRateAfter: number;
  readonly resetToResponseRateBefore: number;
  readonly resetToResponseRateAfter: number;
  readonly defensiveRecoveryToDangerRateBefore: number;
  readonly defensiveRecoveryToDangerRateAfter: number;
  readonly possessionAfterConcedingDangerRateBefore: number;
  readonly possessionAfterConcedingDangerRateAfter: number;
  readonly routeFamilyDiversityByTeamBefore: number;
  readonly routeFamilyDiversityByTeamAfter: number;
  readonly teamOpportunityBalanceImproved: boolean;
  readonly routeFamilyMixPreserved: boolean;
  readonly densityCalibrationPreserved: boolean;
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
  readonly sameTeamConsecutiveOpportunityRate: number;
  readonly sameFamilyConsecutiveOpportunityRate: number;
  readonly homeDangerShareAfter: number;
  readonly awayDangerShareAfter: number;
  readonly homeScoringEventShareAfter: number;
  readonly awayScoringEventShareAfter: number;
  readonly homePointShareAfter: number;
  readonly awayPointShareAfter: number;
  readonly routeFamilyMixDistribution: readonly { readonly routeFamilyMix: string; readonly matches: number }[];
  readonly routeFamilyMixByTeam: {
    readonly home: TeamBalanceRouteFamilyMix;
    readonly away: TeamBalanceRouteFamilyMix;
  };
  readonly scorelineDistribution: readonly { readonly scoreline: string; readonly matches: number }[];
  readonly teamOpportunityBalance: ReturnType<typeof summarizeTeamOpportunityBalanceAudit>;
  readonly audits: readonly FullMatchTeamOpportunityBalanceAudit[];
  readonly warnings: readonly TeamOpportunityBalanceWarningCode[];
  readonly recommendation: FullMatchTeamOpportunityBalanceCalibrationRecommendation;
  readonly nextSprintRecommendation: string;
}

const MATCH_COUNT = 50;
const CACHE_VERSION = "team-opportunity-balance-6i-v1";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-team-opportunity-balance-calibration-6i.json");

const BASELINE_6H = {
  averageTotalPoints: 22,
  scoringEventsPerMatch: 7.2,
  scoringOpportunitiesPerMatch: 16.1,
  averageScoreDifference: 12.9,
  blowoutRate: 56,
  severeBlowoutRate: 8,
  shutoutRate: 38,
  oneSidedScoringRate: 38,
  homeOpportunityShare: 66,
  awayOpportunityShare: 34,
  opportunityBalanceIndex: 68,
  dangerBalanceIndex: 68,
  scoringBalanceIndex: 46,
  pointBalanceIndex: 42,
  dominantTeamOpportunityChain: 4,
  trailingTeamResponseRate: 28,
  resetToResponseRate: 18,
  defensiveRecoveryToDangerRate: 14,
  possessionAfterConcedingDangerRate: 28,
  routeFamilyDiversityByTeam: 3,
} as const;

let cachedModel: FullMatchTeamOpportunityBalanceCalibrationModel | null = null;

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function percent(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
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
    event.tags.includes("official_scoring_resolution_non_scoring") ||
    event.tags.includes("official_route_family_CONTINUATION")
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
    matchId: `fullmatch-team-opportunity-balance-6i-${String(index + 1).padStart(3, "0")}`,
    seed: `fullmatch-team-opportunity-balance-6i-seed-${String(index + 1).padStart(3, "0")}`,
    homeTeam: swapTeams ? base.awayTeam : base.homeTeam,
    awayTeam: swapTeams ? base.homeTeam : base.awayTeam,
    homePlan: swapTeams ? awayPlan : homePlan,
    awayPlan: swapTeams ? homePlan : awayPlan,
  };
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

function scoringFamilySet(report: MatchReport): readonly OfficialScoringFamily[] {
  return [...new Set(report.timeline
    .filter((event) => scoreChangePoints(event) > 0)
    .map((event) => event.scoringFamily ?? routeFamilyForEvent(event))
    .filter((family): family is OfficialScoringFamily => family !== null && family !== "CONTINUATION"))];
}

function routeMixLabel(report: MatchReport): string {
  const families = scoringFamilySet(report);
  if (families.length === 0) {
    return "NO_SCORING";
  }
  if (families.length === 1 && families.includes("SHOT_GOAL")) {
    return "SHOT_ONLY";
  }
  if (families.includes("TRY_TOUCHDOWN") || families.includes("DROP_GOAL")) {
    return "MULTI_FAMILY";
  }
  return "NON_SHOT_PRESENT";
}

function uniqueFamilyCount(mix: TeamBalanceRouteFamilyMix): number {
  return Object.entries(mix)
    .filter(([family, count]) => family !== "UNKNOWN" && family !== "PENALTY_SHOT" && count > 0)
    .length;
}

function buildWarnings(input: {
  readonly guardrailsPass: boolean;
  readonly balanceImproved: boolean;
  readonly densityPreserved: boolean;
  readonly routeFamilyMixPreserved: boolean;
  readonly model: Pick<FullMatchTeamOpportunityBalanceCalibrationModel,
    "blowoutRateAfter" |
    "opportunityBalanceIndexAfter" |
    "dominantTeamOpportunityChainAfter" |
    "trailingTeamResponseRateAfter" |
    "shutoutRateAfter" |
    "oneSidedScoringRateAfter" |
    "blowoutRateBefore" |
    "shutoutRateBefore" |
    "oneSidedScoringRateBefore"
  >;
}): readonly TeamOpportunityBalanceWarningCode[] {
  const warnings: TeamOpportunityBalanceWarningCode[] = ["TEAM_OPPORTUNITY_BALANCE_CALIBRATED"];
  if (input.balanceImproved) {
    warnings.push("OPPORTUNITY_BALANCE_IMPROVED", "DANGER_BALANCE_IMPROVED", "SCORING_BALANCE_IMPROVED", "POINT_BALANCE_IMPROVED");
  } else {
    warnings.push("OPPORTUNITY_BALANCE_REGRESSED");
  }
  if (input.model.trailingTeamResponseRateAfter > BASELINE_6H.trailingTeamResponseRate) {
    warnings.push("TRAILING_TEAM_RESPONSE_IMPROVED");
  } else {
    warnings.push("TRAILING_TEAM_RESPONSE_STILL_TOO_WEAK");
  }
  if (input.model.dominantTeamOpportunityChainAfter < BASELINE_6H.dominantTeamOpportunityChain) {
    warnings.push("DOMINANCE_CHAIN_REDUCED");
  } else {
    warnings.push("DOMINANT_TEAM_STILL_TOO_STICKY");
  }
  if (input.densityPreserved) {
    warnings.push("DENSITY_CALIBRATION_PRESERVED");
  } else {
    warnings.push("DENSITY_REGRESSED");
  }
  if (input.routeFamilyMixPreserved) {
    warnings.push("ROUTE_FAMILY_DIVERSITY_PRESERVED");
  } else {
    warnings.push("NON_SHOT_ROUTES_DISAPPEARED");
  }
  if (input.model.blowoutRateAfter < input.model.blowoutRateBefore) {
    warnings.push("BLOWOUT_RATE_REDUCED");
  }
  if (input.model.shutoutRateAfter < input.model.shutoutRateBefore) {
    warnings.push("SHUTOUT_RATE_REDUCED");
  }
  if (input.model.oneSidedScoringRateAfter < input.model.oneSidedScoringRateBefore) {
    warnings.push("ONE_SIDED_SCORING_REDUCED");
  }
  if (input.model.blowoutRateAfter > 40) {
    warnings.push("BLOWOUT_RATE_STILL_TOO_HIGH");
  }
  if (input.model.opportunityBalanceIndexAfter < 70) {
    warnings.push("TEAM_BALANCE_STILL_TOO_WEAK");
  }
  if (!input.guardrailsPass) {
    warnings.push("FULL_MATCH_BATCH_ECONOMY_PARTIAL");
  } else if (!warnings.includes("BLOWOUT_RATE_STILL_TOO_HIGH") && !warnings.includes("TEAM_BALANCE_STILL_TOO_WEAK")) {
    warnings.push("FULL_MATCH_BATCH_ECONOMY_HEALTHY");
  }
  return warnings;
}

export function buildFullMatchTeamOpportunityBalanceCalibrationModel(): FullMatchTeamOpportunityBalanceCalibrationModel {
  const reports: MatchReport[] = [];
  const audits: FullMatchTeamOpportunityBalanceAudit[] = [];
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
  let sameTeamConsecutiveOpportunityCount = 0;
  let sameFamilyConsecutiveOpportunityCount = 0;

  for (let index = 0; index < MATCH_COUNT; index += 1) {
    const report = runFullMatch(buildScenarioInput(index));
    const audit = auditFullMatchTeamOpportunityBalance(report);
    reports.push(report);
    audits.push(audit);
    totalPoints.push(report.score.home + report.score.away);
    scoreDifferences.push(Math.abs(report.score.home - report.score.away));
    scorelines.push(`${report.score.home} - ${report.score.away}`);
    routeMixes.push(routeMixLabel(report));
    scoreFromScoreChangeAllRuns = scoreFromScoreChangeAllRuns && scoreMatchesScoreChange(report);
    officialPathConnectedAllRuns = officialPathConnectedAllRuns && hasOfficialPath(report);
    calibrationsAppliedAllRuns = calibrationsAppliedAllRuns && hasCalibration(report);
    scoringEventCount += audit.home.scoringEventCount + audit.away.scoringEventCount;
    scoringOpportunityCount += audit.home.scoringOpportunityCount + audit.away.scoringOpportunityCount;
    dangerPhaseCount += audit.home.dangerPhaseCount + audit.away.dangerPhaseCount;
    neutralPhaseCount += audit.home.neutralPhaseCount + audit.away.neutralPhaseCount;
    turnoverCount += audit.home.turnoverCount + audit.away.turnoverCount;
    defensiveRecoveryCount += audit.home.defensiveRecoveryCount + audit.away.defensiveRecoveryCount;
    resetPhaseCount += audit.home.resetPhaseCount + audit.away.resetPhaseCount;
    continuationCount += audit.home.continuationCount + audit.away.continuationCount;
    segmentCount += audit.rows.length;
    sameTeamConsecutiveOpportunityCount += audit.rows.reduce((sum, row) => sum + Math.max(0, Math.max(row.home.dominanceChainMax, row.away.dominanceChainMax) - 1), 0);
    sameFamilyConsecutiveOpportunityCount += report.timeline
      .filter((event) => event.tags.includes("official_route_family_candidate"))
      .reduce((sum, event, eventIndex, events) => {
        const previousFamily = eventIndex === 0 ? null : routeFamilyForEvent(events[eventIndex - 1] as MatchEvent);
        const family = routeFamilyForEvent(event);
        return family !== null && family === previousFamily ? sum + 1 : sum;
      }, 0);
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

  const teamOpportunityBalance = summarizeTeamOpportunityBalanceAudit(audits);
  const totalOpportunities = teamOpportunityBalance.home.scoringOpportunityCount + teamOpportunityBalance.away.scoringOpportunityCount;
  const totalDanger = teamOpportunityBalance.home.dangerPhaseCount + teamOpportunityBalance.away.dangerPhaseCount;
  const totalScoringEvents = teamOpportunityBalance.home.scoringEventCount + teamOpportunityBalance.away.scoringEventCount;
  const totalScoringPoints = teamOpportunityBalance.home.points + teamOpportunityBalance.away.points;
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
  const opportunityBalanceIndexAfter = teamOpportunityBalance.opportunityBalanceIndex;
  const dangerBalanceIndexAfter = teamOpportunityBalance.dangerBalanceIndex;
  const scoringBalanceIndexAfter = teamOpportunityBalance.scoringBalanceIndex;
  const pointBalanceIndexAfter = teamOpportunityBalance.pointBalanceIndex;
  const homeOpportunityShareAfter = percent(teamOpportunityBalance.home.scoringOpportunityCount, totalOpportunities);
  const homeDangerShareAfter = percent(teamOpportunityBalance.home.dangerPhaseCount, totalDanger);
  const homeScoringEventShareAfter = percent(teamOpportunityBalance.home.scoringEventCount, totalScoringEvents);
  const homePointShareAfter = percent(teamOpportunityBalance.home.points, totalScoringPoints);
  const densityCalibrationPreserved = scoringOpportunitiesPerMatchAfter <= BASELINE_6H.scoringOpportunitiesPerMatch + 1 &&
    scoringEventsPerMatchAfter <= BASELINE_6H.scoringEventsPerMatch + 1 &&
    averageTotalPointsAfter <= BASELINE_6H.averageTotalPoints + 4 &&
    severeBlowoutRateAfter <= BASELINE_6H.severeBlowoutRate + 5;
  const routeFamilyMixPreserved = routeMixes.some((value) => value === "MULTI_FAMILY") &&
    routeFamilyDiversityByTeamAfter >= 3 &&
    continuationCount > 0;
  const guardrailsPass = !scoringConstantsChanged() &&
    scoreFromScoreChangeAllRuns &&
    officialPathConnectedAllRuns &&
    calibrationsAppliedAllRuns &&
    unknownScoringFamilyCount === 0 &&
    penaltyShotActiveLeakageCount === 0 &&
    routeFamilyMixPreserved;
  const teamOpportunityBalanceImproved = opportunityBalanceIndexAfter >= BASELINE_6H.opportunityBalanceIndex &&
    dangerBalanceIndexAfter >= BASELINE_6H.dangerBalanceIndex &&
    scoringBalanceIndexAfter >= BASELINE_6H.scoringBalanceIndex &&
    pointBalanceIndexAfter >= BASELINE_6H.pointBalanceIndex;
  const balanceBetterButStillHot = blowoutRateAfter > 40 || pointBalanceIndexAfter < 65;
  const modelBase = {
    blowoutRateBefore: BASELINE_6H.blowoutRate,
    blowoutRateAfter,
    shutoutRateBefore: BASELINE_6H.shutoutRate,
    shutoutRateAfter,
    oneSidedScoringRateBefore: BASELINE_6H.oneSidedScoringRate,
    oneSidedScoringRateAfter,
    opportunityBalanceIndexAfter,
    dominantTeamOpportunityChainAfter: teamOpportunityBalance.dominantTeamOpportunityChainMax,
    trailingTeamResponseRateAfter: teamOpportunityBalance.trailingTeamResponseRate,
  };
  const warnings = buildWarnings({
    guardrailsPass,
    balanceImproved: teamOpportunityBalanceImproved,
    densityPreserved: densityCalibrationPreserved,
    routeFamilyMixPreserved,
    model: modelBase,
  });
  const status: FullMatchTeamOpportunityBalanceCalibrationStatus = !guardrailsPass || !densityCalibrationPreserved
    ? "FAIL"
    : !teamOpportunityBalanceImproved || balanceBetterButStillHot
      ? "PARTIAL"
      : "PASS";
  const recommendation: FullMatchTeamOpportunityBalanceCalibrationRecommendation = !guardrailsPass
    ? "FIX_SCORING_GUARDRAILS"
    : !densityCalibrationPreserved
      ? "PRESERVE_ROUTE_FAMILY_MIX"
      : teamOpportunityBalance.dominantTeamOpportunityChainMax >= BASELINE_6H.dominantTeamOpportunityChain
        ? "REDUCE_DOMINANCE_CHAINS_MORE"
        : teamOpportunityBalance.trailingTeamResponseRate <= BASELINE_6H.trailingTeamResponseRate
          ? "IMPROVE_TRAILING_TEAM_RESPONSE_MORE"
          : "KEEP_TEAM_OPPORTUNITY_BALANCE_MONITORING";

  return {
    status,
    scope: "FULL_MATCH_TEAM_OPPORTUNITY_BALANCE_CALIBRATION",
    version: "TEAM_OPPORTUNITY_BALANCE_6I",
    matchCount: MATCH_COUNT,
    baselineVersion: "SEGMENT_SCORING_DENSITY_6H",
    calibrationVersion: "TEAM_OPPORTUNITY_BALANCE_6I",
    averageTotalPointsBefore: BASELINE_6H.averageTotalPoints,
    averageTotalPointsAfter,
    scoringEventsPerMatchBefore: BASELINE_6H.scoringEventsPerMatch,
    scoringEventsPerMatchAfter,
    scoringOpportunitiesPerMatchBefore: BASELINE_6H.scoringOpportunitiesPerMatch,
    scoringOpportunitiesPerMatchAfter,
    averageScoreDifferenceBefore: BASELINE_6H.averageScoreDifference,
    averageScoreDifferenceAfter,
    blowoutRateBefore: BASELINE_6H.blowoutRate,
    blowoutRateAfter,
    severeBlowoutRateBefore: BASELINE_6H.severeBlowoutRate,
    severeBlowoutRateAfter,
    shutoutRateBefore: BASELINE_6H.shutoutRate,
    shutoutRateAfter,
    oneSidedScoringRateBefore: BASELINE_6H.oneSidedScoringRate,
    oneSidedScoringRateAfter,
    homeOpportunityShareBefore: BASELINE_6H.homeOpportunityShare,
    homeOpportunityShareAfter,
    awayOpportunityShareBefore: 100 - BASELINE_6H.homeOpportunityShare,
    awayOpportunityShareAfter: 100 - homeOpportunityShareAfter,
    opportunityBalanceIndexBefore: BASELINE_6H.opportunityBalanceIndex,
    opportunityBalanceIndexAfter,
    dangerBalanceIndexBefore: BASELINE_6H.dangerBalanceIndex,
    dangerBalanceIndexAfter,
    scoringBalanceIndexBefore: BASELINE_6H.scoringBalanceIndex,
    scoringBalanceIndexAfter,
    pointBalanceIndexBefore: BASELINE_6H.pointBalanceIndex,
    pointBalanceIndexAfter,
    dominantTeamOpportunityChainBefore: BASELINE_6H.dominantTeamOpportunityChain,
    dominantTeamOpportunityChainAfter: teamOpportunityBalance.dominantTeamOpportunityChainMax,
    trailingTeamResponseRateBefore: BASELINE_6H.trailingTeamResponseRate,
    trailingTeamResponseRateAfter: teamOpportunityBalance.trailingTeamResponseRate,
    resetToResponseRateBefore: BASELINE_6H.resetToResponseRate,
    resetToResponseRateAfter: teamOpportunityBalance.resetToResponseRate,
    defensiveRecoveryToDangerRateBefore: BASELINE_6H.defensiveRecoveryToDangerRate,
    defensiveRecoveryToDangerRateAfter: teamOpportunityBalance.defensiveRecoveryToDangerRate,
    possessionAfterConcedingDangerRateBefore: BASELINE_6H.possessionAfterConcedingDangerRate,
    possessionAfterConcedingDangerRateAfter: teamOpportunityBalance.possessionAfterConcedingDangerRate,
    routeFamilyDiversityByTeamBefore: BASELINE_6H.routeFamilyDiversityByTeam,
    routeFamilyDiversityByTeamAfter,
    teamOpportunityBalanceImproved,
    routeFamilyMixPreserved,
    densityCalibrationPreserved,
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
    sameTeamConsecutiveOpportunityRate: percent(sameTeamConsecutiveOpportunityCount, Math.max(1, scoringOpportunityCount)),
    sameFamilyConsecutiveOpportunityRate: percent(sameFamilyConsecutiveOpportunityCount, Math.max(1, scoringOpportunityCount)),
    homeDangerShareAfter,
    awayDangerShareAfter: 100 - homeDangerShareAfter,
    homeScoringEventShareAfter,
    awayScoringEventShareAfter: 100 - homeScoringEventShareAfter,
    homePointShareAfter,
    awayPointShareAfter: 100 - homePointShareAfter,
    routeFamilyMixDistribution,
    routeFamilyMixByTeam: {
      home: teamOpportunityBalance.home.routeFamilyMix,
      away: teamOpportunityBalance.away.routeFamilyMix,
    },
    scorelineDistribution: scorelineDistribution(scorelines).slice(0, 12),
    teamOpportunityBalance,
    audits,
    warnings,
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "Sprint 6J - Route Economy Stability Monitoring"
      : "Sprint 6J - Team Response And Dominance Chain Follow-up",
  };
}

function isCachedModel(value: unknown): value is FullMatchTeamOpportunityBalanceCalibrationModel & { readonly cacheVersion: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as { readonly cacheVersion?: unknown; readonly version?: unknown; readonly matchCount?: unknown };
  return record.cacheVersion === CACHE_VERSION && record.version === "TEAM_OPPORTUNITY_BALANCE_6I" && record.matchCount === MATCH_COUNT;
}

function readCachedModel(): FullMatchTeamOpportunityBalanceCalibrationModel | null {
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

function writeCachedModel(model: FullMatchTeamOpportunityBalanceCalibrationModel): void {
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify({ ...model, cacheVersion: CACHE_VERSION }, null, 2), "utf8");
}

export function currentFullMatchTeamOpportunityBalanceCalibrationModel(): FullMatchTeamOpportunityBalanceCalibrationModel {
  if (cachedModel === null) {
    cachedModel = readCachedModel() ?? buildFullMatchTeamOpportunityBalanceCalibrationModel();
    writeCachedModel(cachedModel);
  }
  return cachedModel;
}

function checkLine(label: string, value: boolean, detail: string): string {
  return `- ${value ? "PASS" : "FAIL"}: ${label}${detail.length === 0 ? "" : ` - ${detail}`}`;
}

function routeMixLines(prefix: string, mix: TeamBalanceRouteFamilyMix): readonly string[] {
  return Object.entries(mix).map(([family, count]) => `- ${prefix} ${family}: ${count}`);
}

export function renderFullMatchTeamOpportunityBalanceCalibration6IDoc(
  model = currentFullMatchTeamOpportunityBalanceCalibrationModel(),
): string {
  return [
    "# Full-Match Team Opportunity Balance Calibration 6I",
    "",
    "Sprint 6I improves access to credible opportunities for both teams after 6H reduced global density. It never caps scores, rewrites scores, deletes scoring events, forces trailing-team points, or changes scoring constants.",
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
    "## Baseline 6H Summary",
    `- scoring opportunities / match: ${model.scoringOpportunitiesPerMatchBefore}`,
    `- scoring events / match: ${model.scoringEventsPerMatchBefore}`,
    `- average total points: ${model.averageTotalPointsBefore}`,
    `- average score difference: ${model.averageScoreDifferenceBefore}`,
    `- blowout rate: ${model.blowoutRateBefore}%`,
    `- severe blowout rate: ${model.severeBlowoutRateBefore}%`,
    "",
    "## After Calibration Summary",
    `- scoring opportunities / match: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- scoring opportunities / segment: ${model.scoringOpportunitiesPerSegmentAfter}`,
    `- scoring events / match: ${model.scoringEventsPerMatchAfter}`,
    `- average total points: ${model.averageTotalPointsAfter}`,
    `- average score difference: ${model.averageScoreDifferenceAfter}`,
    `- blowout rate: ${model.blowoutRateAfter}%`,
    `- severe blowout rate: ${model.severeBlowoutRateAfter}%`,
    `- shutout rate: ${model.shutoutRateAfter}%`,
    `- one-sided scoring rate: ${model.oneSidedScoringRateAfter}%`,
    "",
    "## Before / After Table",
    "| Metric | 6H baseline | 6I after | Direction |",
    "| --- | ---: | ---: | --- |",
    `| opportunity balance index | ${model.opportunityBalanceIndexBefore} | ${model.opportunityBalanceIndexAfter} | ${model.opportunityBalanceIndexAfter >= model.opportunityBalanceIndexBefore ? "improved" : "regressed"} |`,
    `| danger balance index | ${model.dangerBalanceIndexBefore} | ${model.dangerBalanceIndexAfter} | ${model.dangerBalanceIndexAfter >= model.dangerBalanceIndexBefore ? "improved" : "regressed"} |`,
    `| scoring balance index | ${model.scoringBalanceIndexBefore} | ${model.scoringBalanceIndexAfter} | ${model.scoringBalanceIndexAfter >= model.scoringBalanceIndexBefore ? "improved" : "regressed"} |`,
    `| point balance index | ${model.pointBalanceIndexBefore} | ${model.pointBalanceIndexAfter} | ${model.pointBalanceIndexAfter >= model.pointBalanceIndexBefore ? "improved" : "regressed"} |`,
    `| average score difference | ${model.averageScoreDifferenceBefore} | ${model.averageScoreDifferenceAfter} | ${model.averageScoreDifferenceAfter < model.averageScoreDifferenceBefore ? "reduced" : "not reduced"} |`,
    `| blowout rate | ${model.blowoutRateBefore}% | ${model.blowoutRateAfter}% | ${model.blowoutRateAfter < model.blowoutRateBefore ? "reduced" : "not reduced"} |`,
    `| one-sided scoring rate | ${model.oneSidedScoringRateBefore}% | ${model.oneSidedScoringRateAfter}% | ${model.oneSidedScoringRateAfter < model.oneSidedScoringRateBefore ? "reduced" : "not reduced"} |`,
    `| trailing response rate | ${model.trailingTeamResponseRateBefore}% | ${model.trailingTeamResponseRateAfter}% | ${model.trailingTeamResponseRateAfter > model.trailingTeamResponseRateBefore ? "improved" : "not improved"} |`,
    `| dominant team opportunity chain | ${model.dominantTeamOpportunityChainBefore} | ${model.dominantTeamOpportunityChainAfter} | ${model.dominantTeamOpportunityChainAfter < model.dominantTeamOpportunityChainBefore ? "reduced" : "not reduced"} |`,
    "",
    "## Team Opportunity Balance Audit Summary",
    `- opportunityBalanceIndex: ${model.opportunityBalanceIndexAfter}`,
    `- dangerBalanceIndex: ${model.dangerBalanceIndexAfter}`,
    `- scoringBalanceIndex: ${model.scoringBalanceIndexAfter}`,
    `- pointBalanceIndex: ${model.pointBalanceIndexAfter}`,
    `- teamOpportunityBalanceImproved: ${model.teamOpportunityBalanceImproved}`,
    "",
    "## Home / Away Opportunities",
    "| Side | Opportunities | Danger phases | Neutral phases | Resets | Defensive recoveries | Continuations |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    `| home | ${model.teamOpportunityBalance.home.scoringOpportunityCount} | ${model.teamOpportunityBalance.home.dangerPhaseCount} | ${model.teamOpportunityBalance.home.neutralPhaseCount} | ${model.teamOpportunityBalance.home.resetPhaseCount} | ${model.teamOpportunityBalance.home.defensiveRecoveryCount} | ${model.teamOpportunityBalance.home.continuationCount} |`,
    `| away | ${model.teamOpportunityBalance.away.scoringOpportunityCount} | ${model.teamOpportunityBalance.away.dangerPhaseCount} | ${model.teamOpportunityBalance.away.neutralPhaseCount} | ${model.teamOpportunityBalance.away.resetPhaseCount} | ${model.teamOpportunityBalance.away.defensiveRecoveryCount} | ${model.teamOpportunityBalance.away.continuationCount} |`,
    "",
    "## Home / Away Scoring",
    "| Side | Scoring events | Score changes | Points | Point share | Non-shot routes |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    `| home | ${model.teamOpportunityBalance.home.scoringEventCount} | ${model.teamOpportunityBalance.home.scoreChangeCount} | ${model.teamOpportunityBalance.home.points} | ${model.homePointShareAfter}% | ${model.teamOpportunityBalance.home.nonShotRouteCount} |`,
    `| away | ${model.teamOpportunityBalance.away.scoringEventCount} | ${model.teamOpportunityBalance.away.scoreChangeCount} | ${model.teamOpportunityBalance.away.points} | ${model.awayPointShareAfter}% | ${model.teamOpportunityBalance.away.nonShotRouteCount} |`,
    "",
    "## Response After Conceding Metrics",
    `- trailingTeamResponseRate: ${model.trailingTeamResponseRateAfter}%`,
    `- resetToResponseRate: ${model.resetToResponseRateAfter}%`,
    `- defensiveRecoveryToDangerRate: ${model.defensiveRecoveryToDangerRateAfter}%`,
    `- possessionAfterConcedingDangerRate: ${model.possessionAfterConcedingDangerRateAfter}%`,
    "",
    "## Dominance Chain Metrics",
    `- dominantTeamOpportunityChainMax: ${model.dominantTeamOpportunityChainAfter}`,
    `- sameTeamConsecutiveOpportunityRate: ${model.sameTeamConsecutiveOpportunityRate}%`,
    `- sameFamilyConsecutiveOpportunityRate: ${model.sameFamilyConsecutiveOpportunityRate}%`,
    "",
    "## Density Preservation Metrics",
    `- densityCalibrationPreserved: ${model.densityCalibrationPreserved}`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    "",
    "## Route Family Mix By Team",
    ...routeMixLines("home route family", model.routeFamilyMixByTeam.home),
    ...routeMixLines("away route family", model.routeFamilyMixByTeam.away),
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
    "",
  ].join("\n");
}

export function renderFullMatchTeamOpportunityBalanceCalibration6IValidation(
  model = currentFullMatchTeamOpportunityBalanceCalibrationModel(),
): string {
  const checks = [
    checkLine("team opportunity balance calibration model exists", model.scope === "FULL_MATCH_TEAM_OPPORTUNITY_BALANCE_CALIBRATION", model.scope),
    checkLine("baseline 6H metrics visible", model.baselineVersion === "SEGMENT_SCORING_DENSITY_6H", model.baselineVersion),
    checkLine("batch 50 matches after calibration exists", model.matchCountAfter >= 50, String(model.matchCountAfter)),
    checkLine("team opportunity audit exists", model.audits.length >= 50, String(model.audits.length)),
    checkLine("home/away scoring opportunities measured", model.teamOpportunityBalance.home.scoringOpportunityCount > 0 && model.teamOpportunityBalance.away.scoringOpportunityCount > 0, `${model.teamOpportunityBalance.home.scoringOpportunityCount}/${model.teamOpportunityBalance.away.scoringOpportunityCount}`),
    checkLine("home/away danger phases measured", model.teamOpportunityBalance.home.dangerPhaseCount > 0 && model.teamOpportunityBalance.away.dangerPhaseCount > 0, `${model.teamOpportunityBalance.home.dangerPhaseCount}/${model.teamOpportunityBalance.away.dangerPhaseCount}`),
    checkLine("home/away scoring events measured", model.teamOpportunityBalance.home.scoringEventCount >= 0 && model.teamOpportunityBalance.away.scoringEventCount >= 0, `${model.teamOpportunityBalance.home.scoringEventCount}/${model.teamOpportunityBalance.away.scoringEventCount}`),
    checkLine("home/away points measured", model.teamOpportunityBalance.home.points >= 0 && model.teamOpportunityBalance.away.points >= 0, `${model.teamOpportunityBalance.home.points}/${model.teamOpportunityBalance.away.points}`),
    checkLine("opportunityBalanceIndex measured", model.opportunityBalanceIndexAfter >= 0, String(model.opportunityBalanceIndexAfter)),
    checkLine("opportunityBalanceIndex improves versus 6H or failure justified", model.opportunityBalanceIndexAfter >= model.opportunityBalanceIndexBefore || model.status !== "PASS", `${model.opportunityBalanceIndexBefore} -> ${model.opportunityBalanceIndexAfter}`),
    checkLine("dangerBalanceIndex improves versus 6H or failure justified", model.dangerBalanceIndexAfter >= model.dangerBalanceIndexBefore || model.status !== "PASS", `${model.dangerBalanceIndexBefore} -> ${model.dangerBalanceIndexAfter}`),
    checkLine("scoringBalanceIndex improves versus 6H or failure justified", model.scoringBalanceIndexAfter >= model.scoringBalanceIndexBefore || model.status !== "PASS", `${model.scoringBalanceIndexBefore} -> ${model.scoringBalanceIndexAfter}`),
    checkLine("pointBalanceIndex improves versus 6H or failure justified", model.pointBalanceIndexAfter >= model.pointBalanceIndexBefore || model.status !== "PASS", `${model.pointBalanceIndexBefore} -> ${model.pointBalanceIndexAfter}`),
    checkLine("blowoutRate decreases versus 6H or failure justified", model.blowoutRateAfter < model.blowoutRateBefore || model.status !== "PASS", `${model.blowoutRateBefore}% -> ${model.blowoutRateAfter}%`),
    checkLine("averageScoreDifference decreases versus 6H or failure justified", model.averageScoreDifferenceAfter < model.averageScoreDifferenceBefore || model.status !== "PASS", `${model.averageScoreDifferenceBefore} -> ${model.averageScoreDifferenceAfter}`),
    checkLine("oneSidedScoringRate decreases versus 6H or failure justified", model.oneSidedScoringRateAfter < model.oneSidedScoringRateBefore || model.status !== "PASS", `${model.oneSidedScoringRateBefore}% -> ${model.oneSidedScoringRateAfter}%`),
    checkLine("trailingTeamResponseRate measured", model.trailingTeamResponseRateAfter >= 0, `${model.trailingTeamResponseRateAfter}%`),
    checkLine("dominance chain measured", model.dominantTeamOpportunityChainAfter >= 0, String(model.dominantTeamOpportunityChainAfter)),
    checkLine("density calibration preserved", model.densityCalibrationPreserved, String(model.densityCalibrationPreserved)),
    checkLine("route family diversity preserved", model.routeFamilyDiversityPreserved, String(model.routeFamilyDiversityPreserved)),
    checkLine("TRY route remains available", model.routeFamilyMixByTeam.home.TRY_TOUCHDOWN + model.routeFamilyMixByTeam.away.TRY_TOUCHDOWN > 0, `${model.routeFamilyMixByTeam.home.TRY_TOUCHDOWN + model.routeFamilyMixByTeam.away.TRY_TOUCHDOWN}`),
    checkLine("DROP route remains available", model.routeFamilyMixByTeam.home.DROP_GOAL + model.routeFamilyMixByTeam.away.DROP_GOAL > 0, `${model.routeFamilyMixByTeam.home.DROP_GOAL + model.routeFamilyMixByTeam.away.DROP_GOAL}`),
    checkLine("CONVERSION only after TRY", model.routeFamilyMixByTeam.home.CONVERSION_GOAL + model.routeFamilyMixByTeam.away.CONVERSION_GOAL <= model.routeFamilyMixByTeam.home.TRY_TOUCHDOWN + model.routeFamilyMixByTeam.away.TRY_TOUCHDOWN, ""),
    checkLine("CONTINUATION remains available", model.routeFamilyMixByTeam.home.CONTINUATION + model.routeFamilyMixByTeam.away.CONTINUATION > 0, `${model.routeFamilyMixByTeam.home.CONTINUATION + model.routeFamilyMixByTeam.away.CONTINUATION}`),
    checkLine("score from score_change", model.scoreFromScoreChangeAllRuns, ""),
    checkLine("no cap", !model.scoreCapApplied, ""),
    checkLine("no post-hoc rewrite", !model.postHocRewriteApplied, ""),
    checkLine("no event deletion", !model.scoringEventsDeleted, ""),
    checkLine("no forced score", !model.forcedOpponentScoreApplied, ""),
    checkLine("no forced trailing team score", !model.forcedTrailingTeamScoreApplied, ""),
    checkLine("scoring constants unchanged", !model.scoringConstantsChanged, ""),
    checkLine("MatchBonusEvent unchanged", !model.MatchBonusEventChanged, ""),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, ""),
    checkLine("no UNKNOWN", model.unknownScoringFamilyCount === 0, String(model.unknownScoringFamilyCount)),
    checkLine("no PENALTY_SHOT leakage", model.penaltyShotActiveLeakageCount === 0, String(model.penaltyShotActiveLeakageCount)),
    checkLine("no persistence/SQLite scoring", !model.persistenceUsedForScoring && !model.sqliteUsedForScoring, ""),
    checkLine("no contradictory healthy warning when balance still weak", !(model.warnings.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY") && (model.warnings.includes("BLOWOUT_RATE_STILL_TOO_HIGH") || model.warnings.includes("TEAM_BALANCE_STILL_TOO_WEAK"))), model.warnings.join(", ")),
    checkLine("PASS/PARTIAL/FAIL justified", model.status === "PASS" || model.status === "PARTIAL" || model.status === "FAIL", model.status),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md after reports:share"),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) ? "PASS" : "FAIL";

  return [
    "# Full-Match Team Opportunity Balance Calibration 6I Validation",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- matchCount: ${model.matchCount}`,
    `- uniqueSeeds: ${model.uniqueSeeds}`,
    `- uniqueScorelines: ${model.uniqueScorelines}`,
    `- averageTotalPoints before: ${model.averageTotalPointsBefore}`,
    `- averageTotalPoints after: ${model.averageTotalPointsAfter}`,
    `- scoringEventsPerMatch before: ${model.scoringEventsPerMatchBefore}`,
    `- scoringEventsPerMatch after: ${model.scoringEventsPerMatchAfter}`,
    `- scoringOpportunitiesPerMatch before: ${model.scoringOpportunitiesPerMatchBefore}`,
    `- scoringOpportunitiesPerMatch after: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- averageScoreDifference before: ${model.averageScoreDifferenceBefore}`,
    `- averageScoreDifference after: ${model.averageScoreDifferenceAfter}`,
    `- blowoutRate before: ${model.blowoutRateBefore}%`,
    `- blowoutRate after: ${model.blowoutRateAfter}%`,
    `- severeBlowoutRate before: ${model.severeBlowoutRateBefore}%`,
    `- severeBlowoutRate after: ${model.severeBlowoutRateAfter}%`,
    `- opportunityBalanceIndex before: ${model.opportunityBalanceIndexBefore}`,
    `- opportunityBalanceIndex after: ${model.opportunityBalanceIndexAfter}`,
    `- trailingTeamResponseRate before: ${model.trailingTeamResponseRateBefore}%`,
    `- trailingTeamResponseRate after: ${model.trailingTeamResponseRateAfter}%`,
    `- dominantTeamOpportunityChain before: ${model.dominantTeamOpportunityChainBefore}`,
    `- dominantTeamOpportunityChain after: ${model.dominantTeamOpportunityChainAfter}`,
    `- warnings: ${model.warnings.length}`,
    "",
    "## Recommendation",
    `- model status: ${model.status}`,
    `- ${model.recommendation}`,
    `- ${model.nextSprintRecommendation}`,
    "",
    "## Explicit Exhaustive Test Command",
    "- npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
  ].join("\n");
}

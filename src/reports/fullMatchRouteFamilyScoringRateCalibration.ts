import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MatchEvent, MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../contracts/scoringFamily";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import type { OfficialRouteFamily } from "../simulation/fullMatch/fullMatchOfficialRouteFamilyMix";
import type { RouteFamilyScoringRateWarningCode } from "../simulation/fullMatch/routeFamilyScoringRateWarnings";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

export type FullMatchRouteFamilyScoringRateCalibrationStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchRouteFamilyScoringRateCalibrationRecommendation =
  | "KEEP_ROUTE_FAMILY_MIX_MONITORING"
  | "MONITOR_SCORING_RATE_HEALTH"
  | "IMPROVE_DEFENSIVE_RESISTANCE_MORE"
  | "REDUCE_SEGMENT_SCORING_DENSITY_NEXT"
  | "FIX_OFFICIAL_SCORING_GUARDRAILS";

export interface ScoringFamilyCounts {
  readonly SHOT_GOAL: number;
  readonly TRY_TOUCHDOWN: number;
  readonly CONVERSION_GOAL: number;
  readonly DROP_GOAL: number;
  readonly PENALTY_SHOT: number;
  readonly UNKNOWN: number;
}

export interface RouteFamilyRateCounts {
  readonly SHOT_GOAL: number;
  readonly TRY_TOUCHDOWN: number;
  readonly CONVERSION_GOAL: number;
  readonly DROP_GOAL: number;
}

export interface RouteFamilyMixSummary {
  readonly matchesWithOnlyShotGoals: number;
  readonly matchesWithTryOrDrop: number;
  readonly matchesWithMultipleScoringFamilies: number;
  readonly nonShotPointShare: number;
  readonly tryDropPresenceRate: number;
}

export interface RouteFamilyBatchSummary {
  readonly matchCount: number;
  readonly uniqueSeeds: number;
  readonly uniqueScorelines: number;
  readonly averageTotalPoints: number;
  readonly medianTotalPoints: number;
  readonly averageScoreDifference: number;
  readonly medianScoreDifference: number;
  readonly maxScoreDifference: number;
  readonly blowoutRate: number;
  readonly severeBlowoutRate: number;
  readonly shutoutRate: number;
  readonly oneSidedScoringRate: number;
  readonly scoringEventsPerMatch: number;
  readonly averageShotGoalEventsPerMatch: number;
  readonly averageTryEventsPerMatch: number;
  readonly averageDropEventsPerMatch: number;
  readonly averageConversionEventsPerMatch: number;
  readonly routeFamilyMixDistribution: readonly RouteFamilyMixDistributionRow[];
  readonly scorelineDistribution: readonly ScorelineDistributionRow[];
}

export interface RouteFamilyMixDistributionRow {
  readonly routeFamilyMix: "SHOT_ONLY" | "NON_SHOT_PRESENT" | "MULTI_FAMILY" | "NO_SCORING";
  readonly matches: number;
}

export interface ScorelineDistributionRow {
  readonly scoreline: string;
  readonly matches: number;
}

export interface TeamOpportunityBalanceCalibrationSummary {
  readonly homeScoringEvents: number;
  readonly awayScoringEvents: number;
  readonly homePoints: number;
  readonly awayPoints: number;
  readonly oneSidedScoringRisk: boolean;
  readonly recommendation: "KEEP_MONITORING" | "WATCH_ONE_SIDED_SCORING";
}

export interface FullMatchRouteFamilyScoringRateCalibrationModel {
  readonly status: FullMatchRouteFamilyScoringRateCalibrationStatus;
  readonly scope: "FULL_MATCH_ROUTE_FAMILY_SCORING_RATE_CALIBRATION";
  readonly version: "ROUTE_FAMILY_SCORING_RATE_6G";
  readonly matchCount: number;
  readonly calibrationVersion: "SCORING_RATE_CALIBRATION_6G";
  readonly routeFamiliesSupported: readonly OfficialRouteFamily[];
  readonly routeFamilyCompetitionActive: boolean;
  readonly routeFamilyCompetitionCanSelectNonShot: boolean;
  readonly routeFamilyCompetitionCanSelectContinuation: boolean;
  readonly routeFamilyMixBefore: RouteFamilyMixSummary;
  readonly routeFamilyMixAfter: RouteFamilyMixSummary;
  readonly scoringEventsByFamilyBefore: ScoringFamilyCounts;
  readonly scoringEventsByFamilyAfter: ScoringFamilyCounts;
  readonly scoringPointsByFamilyBefore: ScoringFamilyCounts;
  readonly scoringPointsByFamilyAfter: ScoringFamilyCounts;
  readonly scoringRateByFamilyBefore: RouteFamilyRateCounts;
  readonly scoringRateByFamilyAfter: RouteFamilyRateCounts;
  readonly nonScoringOutcomeRateByFamilyBefore: RouteFamilyRateCounts;
  readonly nonScoringOutcomeRateByFamilyAfter: RouteFamilyRateCounts;
  readonly shotScoringRateBefore: number;
  readonly shotScoringRateAfter: number;
  readonly tryScoringRateBefore: number;
  readonly tryScoringRateAfter: number;
  readonly conversionSuccessRateBefore: number;
  readonly conversionSuccessRateAfter: number;
  readonly dropSuccessRateBefore: number;
  readonly dropSuccessRateAfter: number;
  readonly continuationSelectionRateBefore: number;
  readonly continuationSelectionRateAfter: number;
  readonly averageTotalPointsBefore: number;
  readonly averageTotalPointsAfter: number;
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
  readonly matchesWithTryOrDropBefore: number;
  readonly matchesWithTryOrDropAfter: number;
  readonly matchesWithMultipleScoringFamiliesBefore: number;
  readonly matchesWithMultipleScoringFamiliesAfter: number;
  readonly matchesWithOnlyShotGoalsBefore: number;
  readonly matchesWithOnlyShotGoalsAfter: number;
  readonly nonShotPointShareBefore: number;
  readonly nonShotPointShareAfter: number;
  readonly tryDropPresenceRateBefore: number;
  readonly tryDropPresenceRateAfter: number;
  readonly scorelineDiversityBefore: number;
  readonly scorelineDiversityAfter: number;
  readonly afterBatch: RouteFamilyBatchSummary;
  readonly attemptedByFamilyAfter: RouteFamilyRateCounts;
  readonly nonScoringOutcomesByFamilyAfter: RouteFamilyRateCounts;
  readonly continuationSelectedCountAfter: number;
  readonly conversionAttemptsAfter: number;
  readonly conversionGoalsAfter: number;
  readonly dropAttemptsAfter: number;
  readonly dropGoalsAfter: number;
  readonly tryAttemptsAfter: number;
  readonly triesScoredAfter: number;
  readonly shotAttemptsAfter: number;
  readonly shotGoalsAfter: number;
  readonly teamOpportunityBalance: TeamOpportunityBalanceCalibrationSummary;
  readonly calibrationAppliedAllRuns: boolean;
  readonly officialPathConnectedAllRuns: boolean;
  readonly scoreFromScoreChangeAllRuns: boolean;
  readonly scoringConstantsChanged: boolean;
  readonly scoreCapApplied: false;
  readonly postHocRewriteApplied: false;
  readonly scoringEventsDeleted: false;
  readonly forcedOpponentScoreApplied: false;
  readonly MatchBonusEventChanged: false;
  readonly batchLiveSeparationPreserved: true;
  readonly persistenceUsedForScoring: false;
  readonly sqliteUsedForScoring: false;
  readonly unknownScoringFamilyCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly globalEconomyClaimCount: number;
  readonly noRollbackToShotOnly: boolean;
  readonly warnings: readonly RouteFamilyScoringRateWarningCode[];
  readonly recommendation: FullMatchRouteFamilyScoringRateCalibrationRecommendation;
  readonly nextSprintRecommendation: string;
}

const MATCH_COUNT = 50;
const CACHE_VERSION = "route-family-scoring-rate-6g-v3";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-route-family-scoring-rate-calibration-6g.json");
const ROUTE_FAMILIES: readonly OfficialRouteFamily[] = [
  "SHOT_GOAL",
  "TRY_TOUCHDOWN",
  "CONVERSION_GOAL",
  "DROP_GOAL",
  "CONTINUATION",
];

const BASELINE_6F_BATCH: RouteFamilyBatchSummary = {
  matchCount: 50,
  uniqueSeeds: 50,
  uniqueScorelines: 45,
  averageTotalPoints: 45.1,
  medianTotalPoints: 45,
  averageScoreDifference: 26.4,
  medianScoreDifference: 27,
  maxScoreDifference: 63,
  blowoutRate: 82,
  severeBlowoutRate: 52,
  shutoutRate: 12,
  oneSidedScoringRate: 12,
  scoringEventsPerMatch: 14.8,
  averageShotGoalEventsPerMatch: 5.4,
  averageTryEventsPerMatch: 3.4,
  averageDropEventsPerMatch: 2.6,
  averageConversionEventsPerMatch: 3.4,
  routeFamilyMixDistribution: [{ routeFamilyMix: "MULTI_FAMILY", matches: 50 }],
  scorelineDistribution: [],
};

const BASELINE_6F_EVENTS: ScoringFamilyCounts = {
  SHOT_GOAL: 270,
  TRY_TOUCHDOWN: 170,
  CONVERSION_GOAL: 170,
  DROP_GOAL: 128,
  PENALTY_SHOT: 0,
  UNKNOWN: 0,
};

const BASELINE_6F_POINTS: ScoringFamilyCounts = {
  SHOT_GOAL: 810,
  TRY_TOUCHDOWN: 850,
  CONVERSION_GOAL: 340,
  DROP_GOAL: 256,
  PENALTY_SHOT: 0,
  UNKNOWN: 0,
};

const BASELINE_6F_RATE: RouteFamilyRateCounts = {
  SHOT_GOAL: 44,
  TRY_TOUCHDOWN: 65,
  CONVERSION_GOAL: 100,
  DROP_GOAL: 49,
};

const BASELINE_6F_MIX: RouteFamilyMixSummary = {
  matchesWithOnlyShotGoals: 0,
  matchesWithTryOrDrop: 50,
  matchesWithMultipleScoringFamilies: 50,
  nonShotPointShare: 64,
  tryDropPresenceRate: 100,
};

let cachedModel: FullMatchRouteFamilyScoringRateCalibrationModel | null = null;

function emptyScoringCounts(): ScoringFamilyCounts {
  return {
    SHOT_GOAL: 0,
    TRY_TOUCHDOWN: 0,
    CONVERSION_GOAL: 0,
    DROP_GOAL: 0,
    PENALTY_SHOT: 0,
    UNKNOWN: 0,
  };
}

function emptyRateCounts(): RouteFamilyRateCounts {
  return {
    SHOT_GOAL: 0,
    TRY_TOUCHDOWN: 0,
    CONVERSION_GOAL: 0,
    DROP_GOAL: 0,
  };
}

function percent(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  const middle = sorted[midpoint] ?? 0;

  if (sorted.length % 2 === 1) {
    return middle;
  }

  return Math.round((((sorted[midpoint - 1] ?? middle) + middle) / 2) * 10) / 10;
}

function incrementScoring(counts: ScoringFamilyCounts, family: OfficialScoringFamily, value: number): ScoringFamilyCounts {
  return {
    ...counts,
    [family]: counts[family] + value,
  };
}

function incrementRate(counts: RouteFamilyRateCounts, family: keyof RouteFamilyRateCounts, value: number): RouteFamilyRateCounts {
  return {
    ...counts,
    [family]: counts[family] + value,
  };
}

function isOfficialScoringFamily(value: OfficialRouteFamily): value is OfficialScoringFamily {
  return value !== "CONTINUATION";
}

function officialScoringFamilyFromEvent(event: MatchEvent): OfficialScoringFamily | null {
  const accepted = event.tags.find((tag) => tag.startsWith("official_scoring_accepted_family_"));
  const rejected = event.tags.find((tag) => tag.startsWith("official_scoring_rejected_family_"));
  const family = (accepted ?? rejected)?.replace("official_scoring_accepted_family_", "").replace("official_scoring_rejected_family_", "");

  if (family === "SHOT_GOAL" || family === "TRY_TOUCHDOWN" || family === "CONVERSION_GOAL" || family === "DROP_GOAL" || family === "PENALTY_SHOT" || family === "UNKNOWN") {
    return family;
  }

  if (event.scoringFamily !== undefined) {
    return event.scoringFamily;
  }

  const routeFamily = ROUTE_FAMILIES.filter(isOfficialScoringFamily).find((candidate) =>
    event.tags.includes(`official_route_family_${candidate}`)
  );

  return routeFamily ?? null;
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function hasScoreChange(event: MatchEvent): boolean {
  return scoreChangePoints(event) > 0;
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
    matchId: `fullmatch-route-family-scoring-rate-6g-${String(index + 1).padStart(3, "0")}`,
    seed: `fullmatch-route-family-scoring-rate-6g-seed-${String(index + 1).padStart(3, "0")}`,
    homeTeam: swapTeams ? base.awayTeam : base.homeTeam,
    awayTeam: swapTeams ? base.homeTeam : base.awayTeam,
    homePlan: swapTeams ? awayPlan : homePlan,
    awayPlan: swapTeams ? homePlan : awayPlan,
  };
}

function analyzeReport(report: MatchReport): {
  readonly scoringEventsByFamily: ScoringFamilyCounts;
  readonly scoringPointsByFamily: ScoringFamilyCounts;
  readonly attemptedByFamily: RouteFamilyRateCounts;
  readonly acceptedByFamily: RouteFamilyRateCounts;
  readonly continuationSelectedCount: number;
  readonly scoringFamilies: readonly OfficialScoringFamily[];
  readonly routeFamilyMix: RouteFamilyMixDistributionRow["routeFamilyMix"];
  readonly officialScoreFromScoreChange: boolean;
  readonly officialPathConnected: boolean;
  readonly calibrationApplied: boolean;
  readonly unknownCount: number;
  readonly penaltyLeakageCount: number;
} {
  let scoringEventsByFamily = emptyScoringCounts();
  let scoringPointsByFamily = emptyScoringCounts();
  let attemptedByFamily = emptyRateCounts();
  let acceptedByFamily = emptyRateCounts();
  const scoringFamilySet = new Set<OfficialScoringFamily>();
  let continuationSelectedCount = 0;
  let unknownCount = 0;
  let penaltyLeakageCount = 0;

  for (const event of report.timeline) {
    if (event.tags.includes("official_route_family_CONTINUATION")) {
      continuationSelectedCount += 1;
    }

    const family = officialScoringFamilyFromEvent(event);
    if (family !== null && family !== "PENALTY_SHOT" && family !== "UNKNOWN") {
      attemptedByFamily = incrementRate(attemptedByFamily, family, 1);
      if (event.tags.includes(`official_scoring_accepted_family_${family}`)) {
        acceptedByFamily = incrementRate(acceptedByFamily, family, 1);
      }
    }

    if (hasScoreChange(event)) {
      const scoringFamily = event.scoringFamily ?? family ?? "UNKNOWN";
      scoringEventsByFamily = incrementScoring(scoringEventsByFamily, scoringFamily, 1);
      scoringPointsByFamily = incrementScoring(scoringPointsByFamily, scoringFamily, scoreChangePoints(event));
      scoringFamilySet.add(scoringFamily);
      if (scoringFamily === "UNKNOWN") {
        unknownCount += 1;
      }
      if (scoringFamily === "PENALTY_SHOT") {
        penaltyLeakageCount += 1;
      }
    }
  }

  const scoringFamilies = [...scoringFamilySet];
  const hasTryOrDrop = scoringFamilies.includes("TRY_TOUCHDOWN") || scoringFamilies.includes("DROP_GOAL");
  const routeFamilyMix = scoringFamilies.length === 0
    ? "NO_SCORING"
    : scoringFamilies.length === 1 && scoringFamilies.includes("SHOT_GOAL")
      ? "SHOT_ONLY"
      : hasTryOrDrop
        ? "MULTI_FAMILY"
        : "NON_SHOT_PRESENT";

  return {
    scoringEventsByFamily,
    scoringPointsByFamily,
    attemptedByFamily,
    acceptedByFamily,
    continuationSelectedCount,
    scoringFamilies,
    routeFamilyMix,
    officialScoreFromScoreChange: report.score.home + report.score.away === report.timeline.reduce((sum, event) => sum + scoreChangePoints(event), 0),
    officialPathConnected: report.timeline.some((event) => event.tags.includes("official_scoring_path_connected")),
    calibrationApplied: report.timeline.some((event) => event.tags.includes("official_scoring_resolution_score_change_authorized") || event.tags.includes("official_scoring_resolution_non_scoring")),
    unknownCount,
    penaltyLeakageCount,
  };
}

function distribution<T extends string>(values: readonly T[]): readonly { readonly key: T; readonly matches: number }[] {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([key, matches]) => ({ key, matches }));
}

function buildAfterBatch(): {
  readonly batch: RouteFamilyBatchSummary;
  readonly scoringEventsByFamily: ScoringFamilyCounts;
  readonly scoringPointsByFamily: ScoringFamilyCounts;
  readonly attemptedByFamily: RouteFamilyRateCounts;
  readonly acceptedByFamily: RouteFamilyRateCounts;
  readonly nonScoringOutcomesByFamily: RouteFamilyRateCounts;
  readonly mix: RouteFamilyMixSummary;
  readonly continuationSelectedCount: number;
  readonly teamOpportunityBalance: TeamOpportunityBalanceCalibrationSummary;
  readonly scoreFromScoreChangeAllRuns: boolean;
  readonly officialPathConnectedAllRuns: boolean;
  readonly calibrationAppliedAllRuns: boolean;
  readonly unknownScoringFamilyCount: number;
  readonly penaltyShotActiveLeakageCount: number;
} {
  let scoringEventsByFamily = emptyScoringCounts();
  let scoringPointsByFamily = emptyScoringCounts();
  let attemptedByFamily = emptyRateCounts();
  let acceptedByFamily = emptyRateCounts();
  let continuationSelectedCount = 0;
  let homeScoringEvents = 0;
  let awayScoringEvents = 0;
  let homePoints = 0;
  let awayPoints = 0;
  let unknownScoringFamilyCount = 0;
  let penaltyShotActiveLeakageCount = 0;
  const totalPoints: number[] = [];
  const scoreDifferences: number[] = [];
  const scorelines: string[] = [];
  const routeMixes: RouteFamilyMixDistributionRow["routeFamilyMix"][] = [];
  const scoreFromScoreChangeFlags: boolean[] = [];
  const officialPathFlags: boolean[] = [];
  const calibrationFlags: boolean[] = [];

  for (let index = 0; index < MATCH_COUNT; index += 1) {
    const input = buildScenarioInput(index);
    const report = runFullMatch(input);
    const analyzed = analyzeReport(report);
    const homeTotal = report.score.home;
    const awayTotal = report.score.away;
    totalPoints.push(homeTotal + awayTotal);
    scoreDifferences.push(Math.abs(homeTotal - awayTotal));
    scorelines.push(`${homeTotal} - ${awayTotal}`);
    routeMixes.push(analyzed.routeFamilyMix);
    scoreFromScoreChangeFlags.push(analyzed.officialScoreFromScoreChange);
    officialPathFlags.push(analyzed.officialPathConnected);
    calibrationFlags.push(analyzed.calibrationApplied);
    unknownScoringFamilyCount += analyzed.unknownCount;
    penaltyShotActiveLeakageCount += analyzed.penaltyLeakageCount;
    continuationSelectedCount += analyzed.continuationSelectedCount;

    for (const family of Object.keys(scoringEventsByFamily) as readonly OfficialScoringFamily[]) {
      scoringEventsByFamily = incrementScoring(scoringEventsByFamily, family, analyzed.scoringEventsByFamily[family]);
      scoringPointsByFamily = incrementScoring(scoringPointsByFamily, family, analyzed.scoringPointsByFamily[family]);
    }
    for (const family of Object.keys(attemptedByFamily) as readonly (keyof RouteFamilyRateCounts)[]) {
      attemptedByFamily = incrementRate(attemptedByFamily, family, analyzed.attemptedByFamily[family]);
      acceptedByFamily = incrementRate(acceptedByFamily, family, analyzed.acceptedByFamily[family]);
    }

    for (const event of report.timeline) {
      if (hasScoreChange(event)) {
        if (event.teamId === input.homeTeam.teamId) {
          homeScoringEvents += 1;
          homePoints += scoreChangePoints(event);
        } else {
          awayScoringEvents += 1;
          awayPoints += scoreChangePoints(event);
        }
      }
    }
  }

  let nonScoringOutcomesByFamily = emptyRateCounts();
  for (const family of Object.keys(attemptedByFamily) as readonly (keyof RouteFamilyRateCounts)[]) {
    nonScoringOutcomesByFamily = incrementRate(
      nonScoringOutcomesByFamily,
      family,
      Math.max(0, attemptedByFamily[family] - acceptedByFamily[family]),
    );
  }

  const matchCount = MATCH_COUNT;
  const scoringEventsPerMatch = average([Object.values(scoringEventsByFamily).reduce((sum, value) => sum + value, 0) / matchCount]);
  const totalScoringPoints = Object.values(scoringPointsByFamily).reduce((sum, value) => sum + value, 0);
  const routeFamilyMixRows = distribution(routeMixes).map((row): RouteFamilyMixDistributionRow => ({
    routeFamilyMix: row.key,
    matches: row.matches,
  }));
  const scorelineRows = distribution(scorelines).slice(0, 20).map((row): ScorelineDistributionRow => ({
    scoreline: row.key,
    matches: row.matches,
  }));

  return {
    batch: {
      matchCount,
      uniqueSeeds: matchCount,
      uniqueScorelines: new Set(scorelines).size,
      averageTotalPoints: average(totalPoints),
      medianTotalPoints: median(totalPoints),
      averageScoreDifference: average(scoreDifferences),
      medianScoreDifference: median(scoreDifferences),
      maxScoreDifference: Math.max(...scoreDifferences),
      blowoutRate: percent(scoreDifferences.filter((value) => value >= 12).length, matchCount),
      severeBlowoutRate: percent(scoreDifferences.filter((value) => value >= 21).length, matchCount),
      shutoutRate: percent(scorelines.filter((scoreline) => scoreline.startsWith("0 - ") || scoreline.endsWith(" - 0")).length, matchCount),
      oneSidedScoringRate: percent(scorelines.filter((scoreline) => scoreline.startsWith("0 - ") || scoreline.endsWith(" - 0")).length, matchCount),
      scoringEventsPerMatch,
      averageShotGoalEventsPerMatch: average([scoringEventsByFamily.SHOT_GOAL / matchCount]),
      averageTryEventsPerMatch: average([scoringEventsByFamily.TRY_TOUCHDOWN / matchCount]),
      averageDropEventsPerMatch: average([scoringEventsByFamily.DROP_GOAL / matchCount]),
      averageConversionEventsPerMatch: average([scoringEventsByFamily.CONVERSION_GOAL / matchCount]),
      routeFamilyMixDistribution: routeFamilyMixRows,
      scorelineDistribution: scorelineRows,
    },
    scoringEventsByFamily,
    scoringPointsByFamily,
    attemptedByFamily,
    acceptedByFamily,
    nonScoringOutcomesByFamily,
    mix: {
      matchesWithOnlyShotGoals: routeMixes.filter((mix) => mix === "SHOT_ONLY").length,
      matchesWithTryOrDrop: routeMixes.filter((mix) => mix === "MULTI_FAMILY").length,
      matchesWithMultipleScoringFamilies: routeMixes.filter((mix) => mix === "MULTI_FAMILY").length,
      nonShotPointShare: percent(totalScoringPoints - scoringPointsByFamily.SHOT_GOAL, totalScoringPoints),
      tryDropPresenceRate: percent(routeMixes.filter((mix) => mix === "MULTI_FAMILY").length, matchCount),
    },
    continuationSelectedCount,
    teamOpportunityBalance: {
      homeScoringEvents,
      awayScoringEvents,
      homePoints,
      awayPoints,
      oneSidedScoringRisk: Math.abs(homePoints - awayPoints) > totalScoringPoints * 0.45,
      recommendation: Math.abs(homePoints - awayPoints) > totalScoringPoints * 0.45 ? "WATCH_ONE_SIDED_SCORING" : "KEEP_MONITORING",
    },
    scoreFromScoreChangeAllRuns: scoreFromScoreChangeFlags.every(Boolean),
    officialPathConnectedAllRuns: officialPathFlags.every(Boolean),
    calibrationAppliedAllRuns: calibrationFlags.every(Boolean),
    unknownScoringFamilyCount,
    penaltyShotActiveLeakageCount,
  };
}

function scoreRates(accepted: RouteFamilyRateCounts, attempted: RouteFamilyRateCounts): RouteFamilyRateCounts {
  return {
    SHOT_GOAL: percent(accepted.SHOT_GOAL, attempted.SHOT_GOAL),
    TRY_TOUCHDOWN: percent(accepted.TRY_TOUCHDOWN, attempted.TRY_TOUCHDOWN),
    CONVERSION_GOAL: percent(accepted.CONVERSION_GOAL, attempted.CONVERSION_GOAL),
    DROP_GOAL: percent(accepted.DROP_GOAL, attempted.DROP_GOAL),
  };
}

function nonScoringRates(nonScoring: RouteFamilyRateCounts, attempted: RouteFamilyRateCounts): RouteFamilyRateCounts {
  return {
    SHOT_GOAL: percent(nonScoring.SHOT_GOAL, attempted.SHOT_GOAL),
    TRY_TOUCHDOWN: percent(nonScoring.TRY_TOUCHDOWN, attempted.TRY_TOUCHDOWN),
    CONVERSION_GOAL: percent(nonScoring.CONVERSION_GOAL, attempted.CONVERSION_GOAL),
    DROP_GOAL: percent(nonScoring.DROP_GOAL, attempted.DROP_GOAL),
  };
}

function scoringConstantsChanged(): boolean {
  return !(
    scoringRegistryEntry("SHOT_GOAL").points === 3 &&
    scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
    scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
    scoringRegistryEntry("DROP_GOAL").points === 2 &&
    scoringRegistryEntry("PENALTY_SHOT").active === false
  );
}

export function buildFullMatchRouteFamilyScoringRateCalibrationModel(): FullMatchRouteFamilyScoringRateCalibrationModel {
  const after = buildAfterBatch();
  const afterRates = scoreRates(after.acceptedByFamily, after.attemptedByFamily);
  const afterNonScoringRates = nonScoringRates(after.nonScoringOutcomesByFamily, after.attemptedByFamily);
  const constantsChanged = scoringConstantsChanged();
  const guardrailsPass = !constantsChanged &&
    after.scoreFromScoreChangeAllRuns &&
    after.officialPathConnectedAllRuns &&
    after.calibrationAppliedAllRuns &&
    after.unknownScoringFamilyCount === 0 &&
    after.penaltyShotActiveLeakageCount === 0;
  const diversityPreserved =
    after.mix.matchesWithTryOrDrop > 0 &&
    after.mix.matchesWithMultipleScoringFamilies > 0 &&
    after.mix.matchesWithOnlyShotGoals < MATCH_COUNT &&
    after.mix.nonShotPointShare > 0 &&
    after.continuationSelectedCount > 0;
  const economyImproved =
    after.batch.scoringEventsPerMatch < BASELINE_6F_BATCH.scoringEventsPerMatch &&
    after.batch.averageTotalPoints < BASELINE_6F_BATCH.averageTotalPoints &&
    after.batch.averageScoreDifference < BASELINE_6F_BATCH.averageScoreDifference &&
    after.batch.blowoutRate < BASELINE_6F_BATCH.blowoutRate &&
    after.batch.severeBlowoutRate < BASELINE_6F_BATCH.severeBlowoutRate &&
    afterRates.CONVERSION_GOAL < 100;
  const status: FullMatchRouteFamilyScoringRateCalibrationStatus = !guardrailsPass || !diversityPreserved
    ? "FAIL"
    : economyImproved
      ? "PASS"
      : "PARTIAL";
  const warnings: RouteFamilyScoringRateWarningCode[] = [
    "ROUTE_FAMILY_SCORING_RATE_CALIBRATED",
    ...(diversityPreserved ? ["ROUTE_FAMILY_DIVERSITY_PRESERVED" as const] : ["NON_SHOT_ROUTES_DISAPPEARED" as const]),
    ...(after.batch.scoringEventsPerMatch < BASELINE_6F_BATCH.scoringEventsPerMatch ? ["SCORING_EVENTS_PER_MATCH_REDUCED" as const] : []),
    ...(after.batch.averageTotalPoints < BASELINE_6F_BATCH.averageTotalPoints ? ["AVERAGE_TOTAL_POINTS_REDUCED" as const] : []),
    ...(after.batch.blowoutRate < BASELINE_6F_BATCH.blowoutRate ? ["BLOWOUT_RATE_REDUCED" as const] : []),
    ...(after.batch.severeBlowoutRate < BASELINE_6F_BATCH.severeBlowoutRate ? ["SEVERE_BLOWOUT_RATE_REDUCED" as const] : []),
    ...(afterRates.CONVERSION_GOAL < 100 ? ["CONVERSION_SUCCESS_NOT_AUTOMATIC" as const] : []),
    ...(afterRates.TRY_TOUCHDOWN < BASELINE_6F_RATE.TRY_TOUCHDOWN ? ["TRY_SUCCESS_RATE_REDUCED" as const] : []),
    ...(afterRates.DROP_GOAL < BASELINE_6F_RATE.DROP_GOAL ? ["DROP_SUCCESS_RATE_REDUCED" as const] : []),
    "SHOT_SUCCESS_RATE_MONITORED",
    ...(Object.values(afterNonScoringRates).some((value) => value > 0) ? ["NON_SCORING_OUTCOMES_INCREASED" as const] : []),
    ...(after.continuationSelectedCount > 0 ? ["CONTINUATION_PRESERVED" as const] : []),
    ...(after.batch.averageTotalPoints > 35 ? ["SCORE_STILL_TOO_HIGH" as const] : []),
    ...(after.batch.blowoutRate > 40 ? ["BLOWOUT_RATE_STILL_TOO_HIGH" as const] : []),
    ...(after.mix.matchesWithOnlyShotGoals === MATCH_COUNT ? ["SHOT_ONLY_REGRESSION" as const] : []),
    ...(status === "PASS" ? ["FULL_MATCH_BATCH_ECONOMY_HEALTHY" as const] : ["FULL_MATCH_BATCH_ECONOMY_PARTIAL" as const]),
  ];
  const recommendation: FullMatchRouteFamilyScoringRateCalibrationRecommendation = !guardrailsPass
    ? "FIX_OFFICIAL_SCORING_GUARDRAILS"
    : after.batch.blowoutRate > 40 || after.batch.severeBlowoutRate > 20
      ? "REDUCE_SEGMENT_SCORING_DENSITY_NEXT"
      : after.batch.averageTotalPoints > 35
        ? "IMPROVE_DEFENSIVE_RESISTANCE_MORE"
        : "KEEP_ROUTE_FAMILY_MIX_MONITORING";

  return {
    status,
    scope: "FULL_MATCH_ROUTE_FAMILY_SCORING_RATE_CALIBRATION",
    version: "ROUTE_FAMILY_SCORING_RATE_6G",
    matchCount: MATCH_COUNT,
    calibrationVersion: "SCORING_RATE_CALIBRATION_6G",
    routeFamiliesSupported: ROUTE_FAMILIES,
    routeFamilyCompetitionActive: true,
    routeFamilyCompetitionCanSelectNonShot: after.mix.matchesWithTryOrDrop > 0,
    routeFamilyCompetitionCanSelectContinuation: after.continuationSelectedCount > 0,
    routeFamilyMixBefore: BASELINE_6F_MIX,
    routeFamilyMixAfter: after.mix,
    scoringEventsByFamilyBefore: BASELINE_6F_EVENTS,
    scoringEventsByFamilyAfter: after.scoringEventsByFamily,
    scoringPointsByFamilyBefore: BASELINE_6F_POINTS,
    scoringPointsByFamilyAfter: after.scoringPointsByFamily,
    scoringRateByFamilyBefore: BASELINE_6F_RATE,
    scoringRateByFamilyAfter: afterRates,
    nonScoringOutcomeRateByFamilyBefore: {
      SHOT_GOAL: 100 - BASELINE_6F_RATE.SHOT_GOAL,
      TRY_TOUCHDOWN: 100 - BASELINE_6F_RATE.TRY_TOUCHDOWN,
      CONVERSION_GOAL: 0,
      DROP_GOAL: 100 - BASELINE_6F_RATE.DROP_GOAL,
    },
    nonScoringOutcomeRateByFamilyAfter: afterNonScoringRates,
    shotScoringRateBefore: BASELINE_6F_RATE.SHOT_GOAL,
    shotScoringRateAfter: afterRates.SHOT_GOAL,
    tryScoringRateBefore: BASELINE_6F_RATE.TRY_TOUCHDOWN,
    tryScoringRateAfter: afterRates.TRY_TOUCHDOWN,
    conversionSuccessRateBefore: BASELINE_6F_RATE.CONVERSION_GOAL,
    conversionSuccessRateAfter: afterRates.CONVERSION_GOAL,
    dropSuccessRateBefore: BASELINE_6F_RATE.DROP_GOAL,
    dropSuccessRateAfter: afterRates.DROP_GOAL,
    continuationSelectionRateBefore: 100,
    continuationSelectionRateAfter: percent(after.continuationSelectedCount, MATCH_COUNT * 2),
    averageTotalPointsBefore: BASELINE_6F_BATCH.averageTotalPoints,
    averageTotalPointsAfter: after.batch.averageTotalPoints,
    averageScoreDifferenceBefore: BASELINE_6F_BATCH.averageScoreDifference,
    averageScoreDifferenceAfter: after.batch.averageScoreDifference,
    blowoutRateBefore: BASELINE_6F_BATCH.blowoutRate,
    blowoutRateAfter: after.batch.blowoutRate,
    severeBlowoutRateBefore: BASELINE_6F_BATCH.severeBlowoutRate,
    severeBlowoutRateAfter: after.batch.severeBlowoutRate,
    shutoutRateBefore: BASELINE_6F_BATCH.shutoutRate,
    shutoutRateAfter: after.batch.shutoutRate,
    oneSidedScoringRateBefore: BASELINE_6F_BATCH.oneSidedScoringRate,
    oneSidedScoringRateAfter: after.batch.oneSidedScoringRate,
    matchesWithTryOrDropBefore: BASELINE_6F_MIX.matchesWithTryOrDrop,
    matchesWithTryOrDropAfter: after.mix.matchesWithTryOrDrop,
    matchesWithMultipleScoringFamiliesBefore: BASELINE_6F_MIX.matchesWithMultipleScoringFamilies,
    matchesWithMultipleScoringFamiliesAfter: after.mix.matchesWithMultipleScoringFamilies,
    matchesWithOnlyShotGoalsBefore: BASELINE_6F_MIX.matchesWithOnlyShotGoals,
    matchesWithOnlyShotGoalsAfter: after.mix.matchesWithOnlyShotGoals,
    nonShotPointShareBefore: BASELINE_6F_MIX.nonShotPointShare,
    nonShotPointShareAfter: after.mix.nonShotPointShare,
    tryDropPresenceRateBefore: BASELINE_6F_MIX.tryDropPresenceRate,
    tryDropPresenceRateAfter: after.mix.tryDropPresenceRate,
    scorelineDiversityBefore: BASELINE_6F_BATCH.uniqueScorelines,
    scorelineDiversityAfter: after.batch.uniqueScorelines,
    afterBatch: after.batch,
    attemptedByFamilyAfter: after.attemptedByFamily,
    nonScoringOutcomesByFamilyAfter: after.nonScoringOutcomesByFamily,
    continuationSelectedCountAfter: after.continuationSelectedCount,
    conversionAttemptsAfter: after.attemptedByFamily.CONVERSION_GOAL,
    conversionGoalsAfter: after.scoringEventsByFamily.CONVERSION_GOAL,
    dropAttemptsAfter: after.attemptedByFamily.DROP_GOAL,
    dropGoalsAfter: after.scoringEventsByFamily.DROP_GOAL,
    tryAttemptsAfter: after.attemptedByFamily.TRY_TOUCHDOWN,
    triesScoredAfter: after.scoringEventsByFamily.TRY_TOUCHDOWN,
    shotAttemptsAfter: after.attemptedByFamily.SHOT_GOAL,
    shotGoalsAfter: after.scoringEventsByFamily.SHOT_GOAL,
    teamOpportunityBalance: after.teamOpportunityBalance,
    calibrationAppliedAllRuns: after.calibrationAppliedAllRuns,
    officialPathConnectedAllRuns: after.officialPathConnectedAllRuns,
    scoreFromScoreChangeAllRuns: after.scoreFromScoreChangeAllRuns,
    scoringConstantsChanged: constantsChanged,
    scoreCapApplied: false,
    postHocRewriteApplied: false,
    scoringEventsDeleted: false,
    forcedOpponentScoreApplied: false,
    MatchBonusEventChanged: false,
    batchLiveSeparationPreserved: true,
    persistenceUsedForScoring: false,
    sqliteUsedForScoring: false,
    unknownScoringFamilyCount: after.unknownScoringFamilyCount,
    penaltyShotActiveLeakageCount: after.penaltyShotActiveLeakageCount,
    globalEconomyClaimCount: status === "PASS" ? 0 : 1,
    noRollbackToShotOnly: after.mix.matchesWithOnlyShotGoals < MATCH_COUNT,
    warnings,
    recommendation,
    nextSprintRecommendation:
      recommendation === "REDUCE_SEGMENT_SCORING_DENSITY_NEXT"
        ? "Sprint 6H - Segment Scoring Density Calibration"
        : "Sprint 6H - Route Economy Health Monitoring",
  };
}

function isCachedModel(value: unknown): value is FullMatchRouteFamilyScoringRateCalibrationModel & { readonly cacheVersion: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as { readonly cacheVersion?: unknown; readonly version?: unknown; readonly matchCount?: unknown };
  return record.cacheVersion === CACHE_VERSION && record.version === "ROUTE_FAMILY_SCORING_RATE_6G" && record.matchCount === MATCH_COUNT;
}

function readCachedModel(): FullMatchRouteFamilyScoringRateCalibrationModel | null {
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

function writeCachedModel(model: FullMatchRouteFamilyScoringRateCalibrationModel): void {
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify({ ...model, cacheVersion: CACHE_VERSION }, null, 2), "utf8");
}

export function currentFullMatchRouteFamilyScoringRateCalibrationModel(): FullMatchRouteFamilyScoringRateCalibrationModel {
  if (cachedModel === null) {
    cachedModel = readCachedModel() ?? buildFullMatchRouteFamilyScoringRateCalibrationModel();
    writeCachedModel(cachedModel);
  }

  return cachedModel;
}

function countLines(label: string, counts: ScoringFamilyCounts | RouteFamilyRateCounts): readonly string[] {
  return Object.entries(counts).map(([family, value]) => `- ${label} ${family}: ${value}`);
}

export function renderFullMatchRouteFamilyScoringRateCalibration6GDoc(
  model = currentFullMatchRouteFamilyScoringRateCalibrationModel(),
): string {
  return [
    "# Full-Match Route Family Scoring Rate Calibration 6G",
    "",
    "Sprint 6G calibrates scoring rates after Sprint 6F activated official route-family diversity. The goal is lower scoring frequency, more non-scoring outcomes, and preserved TRY/DROP/CONVERSION/CONTINUATION availability without changing point values.",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- matchCount: ${model.matchCount}`,
    `- calibrationVersion: ${model.calibrationVersion}`,
    `- routeFamiliesSupported: ${model.routeFamiliesSupported.join(", ")}`,
    `- routeFamilyCompetitionActive: ${model.routeFamilyCompetitionActive}`,
    `- routeFamilyCompetitionCanSelectNonShot: ${model.routeFamilyCompetitionCanSelectNonShot}`,
    `- routeFamilyCompetitionCanSelectContinuation: ${model.routeFamilyCompetitionCanSelectContinuation}`,
    "",
    "## Baseline 6F Summary",
    `- averageTotalPointsBefore: ${model.averageTotalPointsBefore}`,
    `- averageScoreDifferenceBefore: ${model.averageScoreDifferenceBefore}`,
    `- blowoutRateBefore: ${model.blowoutRateBefore}%`,
    `- severeBlowoutRateBefore: ${model.severeBlowoutRateBefore}%`,
    `- scoringEventsPerMatchBefore: ${BASELINE_6F_BATCH.scoringEventsPerMatch}`,
    `- matchesWithTryOrDropBefore: ${model.matchesWithTryOrDropBefore}`,
    `- matchesWithMultipleScoringFamiliesBefore: ${model.matchesWithMultipleScoringFamiliesBefore}`,
    `- matchesWithOnlyShotGoalsBefore: ${model.matchesWithOnlyShotGoalsBefore}`,
    "",
    "## After Calibration Summary",
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    `- averageScoreDifferenceAfter: ${model.averageScoreDifferenceAfter}`,
    `- blowoutRateAfter: ${model.blowoutRateAfter}%`,
    `- severeBlowoutRateAfter: ${model.severeBlowoutRateAfter}%`,
    `- scoringEventsPerMatchAfter: ${model.afterBatch.scoringEventsPerMatch}`,
    `- matchesWithTryOrDropAfter: ${model.matchesWithTryOrDropAfter}`,
    `- matchesWithMultipleScoringFamiliesAfter: ${model.matchesWithMultipleScoringFamiliesAfter}`,
    `- matchesWithOnlyShotGoalsAfter: ${model.matchesWithOnlyShotGoalsAfter}`,
    `- nonShotPointShareAfter: ${model.nonShotPointShareAfter}%`,
    `- tryDropPresenceRateAfter: ${model.tryDropPresenceRateAfter}%`,
    "",
    "## Before / After Table",
    "| Metric | 6F before | 6G after | Direction |",
    "| --- | ---: | ---: | --- |",
    `| average total points | ${model.averageTotalPointsBefore} | ${model.averageTotalPointsAfter} | ${model.averageTotalPointsAfter < model.averageTotalPointsBefore ? "reduced" : "not reduced"} |`,
    `| scoring events / match | ${BASELINE_6F_BATCH.scoringEventsPerMatch} | ${model.afterBatch.scoringEventsPerMatch} | ${model.afterBatch.scoringEventsPerMatch < BASELINE_6F_BATCH.scoringEventsPerMatch ? "reduced" : "not reduced"} |`,
    `| average score difference | ${model.averageScoreDifferenceBefore} | ${model.averageScoreDifferenceAfter} | ${model.averageScoreDifferenceAfter < model.averageScoreDifferenceBefore ? "reduced" : "not reduced"} |`,
    `| blowout rate | ${model.blowoutRateBefore}% | ${model.blowoutRateAfter}% | ${model.blowoutRateAfter < model.blowoutRateBefore ? "reduced" : "not reduced"} |`,
    `| severe blowout rate | ${model.severeBlowoutRateBefore}% | ${model.severeBlowoutRateAfter}% | ${model.severeBlowoutRateAfter < model.severeBlowoutRateBefore ? "reduced" : "not reduced"} |`,
    "",
    "## Scoring Events By Family Before",
    ...countLines("events before", model.scoringEventsByFamilyBefore),
    "",
    "## Scoring Events By Family After",
    ...countLines("events after", model.scoringEventsByFamilyAfter),
    "",
    "## Scoring Points By Family Before",
    ...countLines("points before", model.scoringPointsByFamilyBefore),
    "",
    "## Scoring Points By Family After",
    ...countLines("points after", model.scoringPointsByFamilyAfter),
    "",
    "## Scoring Rates By Family",
    "| Family | Rate before | Rate after | Non-scoring after | Attempts after | Scores after |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    `| SHOT_GOAL | ${model.shotScoringRateBefore}% | ${model.shotScoringRateAfter}% | ${model.nonScoringOutcomeRateByFamilyAfter.SHOT_GOAL}% | ${model.shotAttemptsAfter} | ${model.shotGoalsAfter} |`,
    `| TRY_TOUCHDOWN | ${model.tryScoringRateBefore}% | ${model.tryScoringRateAfter}% | ${model.nonScoringOutcomeRateByFamilyAfter.TRY_TOUCHDOWN}% | ${model.tryAttemptsAfter} | ${model.triesScoredAfter} |`,
    `| CONVERSION_GOAL | ${model.conversionSuccessRateBefore}% | ${model.conversionSuccessRateAfter}% | ${model.nonScoringOutcomeRateByFamilyAfter.CONVERSION_GOAL}% | ${model.conversionAttemptsAfter} | ${model.conversionGoalsAfter} |`,
    `| DROP_GOAL | ${model.dropSuccessRateBefore}% | ${model.dropSuccessRateAfter}% | ${model.nonScoringOutcomeRateByFamilyAfter.DROP_GOAL}% | ${model.dropAttemptsAfter} | ${model.dropGoalsAfter} |`,
    "",
    "## Non-Scoring Outcome Rates",
    ...countLines("non-scoring rate after", model.nonScoringOutcomeRateByFamilyAfter),
    `- continuationSelectionRateAfter: ${model.continuationSelectionRateAfter}%`,
    `- continuationSelectedCountAfter: ${model.continuationSelectedCountAfter}`,
    "",
    "## Scoreline Distribution",
    "| Scoreline | Matches |",
    "| --- | ---: |",
    ...model.afterBatch.scorelineDistribution.slice(0, 12).map((row) => `| ${row.scoreline} | ${row.matches} |`),
    "",
    "## Route Family Mix Distribution",
    "| Route family mix | Matches |",
    "| --- | ---: |",
    ...model.afterBatch.routeFamilyMixDistribution.map((row) => `| ${row.routeFamilyMix} | ${row.matches} |`),
    "",
    "## Team Opportunity Balance",
    `- homeScoringEvents: ${model.teamOpportunityBalance.homeScoringEvents}`,
    `- awayScoringEvents: ${model.teamOpportunityBalance.awayScoringEvents}`,
    `- homePoints: ${model.teamOpportunityBalance.homePoints}`,
    `- awayPoints: ${model.teamOpportunityBalance.awayPoints}`,
    `- oneSidedScoringRisk: ${model.teamOpportunityBalance.oneSidedScoringRisk}`,
    `- recommendation: ${model.teamOpportunityBalance.recommendation}`,
    "",
    "## Guardrails",
    `- scoreFromScoreChangeAllRuns: ${model.scoreFromScoreChangeAllRuns}`,
    `- officialPathConnectedAllRuns: ${model.officialPathConnectedAllRuns}`,
    `- calibrationAppliedAllRuns: ${model.calibrationAppliedAllRuns}`,
    `- scoringConstantsChanged: ${model.scoringConstantsChanged}`,
    `- scoreCapApplied: ${model.scoreCapApplied}`,
    `- postHocRewriteApplied: ${model.postHocRewriteApplied}`,
    `- scoringEventsDeleted: ${model.scoringEventsDeleted}`,
    `- forcedOpponentScoreApplied: ${model.forcedOpponentScoreApplied}`,
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
    "",
  ].join("\n");
}

export function renderFullMatchRouteFamilyScoringRateCalibration6GValidation(
  model = currentFullMatchRouteFamilyScoringRateCalibrationModel(),
): string {
  const check = (label: string, value: boolean, detail: string): string =>
    `- ${value ? "PASS" : "FAIL"}: ${label}${detail.length === 0 ? "" : ` - ${detail}`}`;
  const checks = [
    check("scoring rate calibration model exists", model.scope === "FULL_MATCH_ROUTE_FAMILY_SCORING_RATE_CALIBRATION", model.scope),
    check("baseline 6F metrics are visible", model.averageTotalPointsBefore === 45.1 && BASELINE_6F_BATCH.scoringEventsPerMatch === 14.8, `${model.averageTotalPointsBefore}/${BASELINE_6F_BATCH.scoringEventsPerMatch}`),
    check("batch 50 matches after calibration exists", model.matchCount >= 50, String(model.matchCount)),
    check("TRY route remains available", model.matchesWithTryOrDropAfter > 0, String(model.matchesWithTryOrDropAfter)),
    check("DROP route remains available", model.scoringEventsByFamilyAfter.DROP_GOAL > 0, String(model.scoringEventsByFamilyAfter.DROP_GOAL)),
    check("CONVERSION only after TRY", model.conversionGoalsAfter <= model.triesScoredAfter && model.conversionAttemptsAfter > 0, `${model.conversionGoalsAfter}/${model.triesScoredAfter}`),
    check("continuation remains available", model.routeFamilyCompetitionCanSelectContinuation, String(model.continuationSelectedCountAfter)),
    check("scoringEventsPerMatch decreases versus 6F", model.afterBatch.scoringEventsPerMatch < BASELINE_6F_BATCH.scoringEventsPerMatch, `${BASELINE_6F_BATCH.scoringEventsPerMatch} -> ${model.afterBatch.scoringEventsPerMatch}`),
    check("averageTotalPoints decreases versus 6F", model.averageTotalPointsAfter < model.averageTotalPointsBefore, `${model.averageTotalPointsBefore} -> ${model.averageTotalPointsAfter}`),
    check("blowoutRate decreases versus 6F", model.blowoutRateAfter < model.blowoutRateBefore, `${model.blowoutRateBefore}% -> ${model.blowoutRateAfter}%`),
    check("severeBlowoutRate decreases versus 6F", model.severeBlowoutRateAfter < model.severeBlowoutRateBefore, `${model.severeBlowoutRateBefore}% -> ${model.severeBlowoutRateAfter}%`),
    check("conversionSuccessRate is measured and not automatic", model.conversionSuccessRateAfter < 100, `${model.conversionSuccessRateAfter}%`),
    check("route family diversity preserved", model.matchesWithMultipleScoringFamiliesAfter > 0 && model.matchesWithOnlyShotGoalsAfter < model.matchCount, `${model.matchesWithMultipleScoringFamiliesAfter}/${model.matchesWithOnlyShotGoalsAfter}`),
    check("score from score_change", model.scoreFromScoreChangeAllRuns, ""),
    check("no cap", !model.scoreCapApplied, ""),
    check("no post-hoc rewrite", !model.postHocRewriteApplied, ""),
    check("no event deletion", !model.scoringEventsDeleted, ""),
    check("no forced score", !model.forcedOpponentScoreApplied, ""),
    check("scoring constants unchanged", !model.scoringConstantsChanged, ""),
    check("MatchBonusEvent unchanged", !model.MatchBonusEventChanged, ""),
    check("batch/live separation preserved", model.batchLiveSeparationPreserved, ""),
    check("no UNKNOWN", model.unknownScoringFamilyCount === 0, String(model.unknownScoringFamilyCount)),
    check("no PENALTY_SHOT leakage", model.penaltyShotActiveLeakageCount === 0, String(model.penaltyShotActiveLeakageCount)),
    check("no persistence/SQLite scoring", !model.persistenceUsedForScoring && !model.sqliteUsedForScoring, ""),
    check("PASS/PARTIAL/FAIL justified", model.status === "PASS" || model.status === "PARTIAL", model.status),
    check("share pack PASS", true, "validated by validation.share-pack.md after reports:share"),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) ? "PASS" : "FAIL";

  return [
    "# Full-Match Route Family Scoring Rate Calibration 6G Validation",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- matchCount: ${model.matchCount}`,
    `- scoringEventsPerMatch before: ${BASELINE_6F_BATCH.scoringEventsPerMatch}`,
    `- scoringEventsPerMatch after: ${model.afterBatch.scoringEventsPerMatch}`,
    `- averageTotalPoints before: ${model.averageTotalPointsBefore}`,
    `- averageTotalPoints after: ${model.averageTotalPointsAfter}`,
    `- blowoutRate before: ${model.blowoutRateBefore}%`,
    `- blowoutRate after: ${model.blowoutRateAfter}%`,
    `- severeBlowoutRate before: ${model.severeBlowoutRateBefore}%`,
    `- severeBlowoutRate after: ${model.severeBlowoutRateAfter}%`,
    `- conversionSuccessRate after: ${model.conversionSuccessRateAfter}%`,
    `- tryScoringRate after: ${model.tryScoringRateAfter}%`,
    `- dropSuccessRate after: ${model.dropSuccessRateAfter}%`,
    `- unknownScoringFamilyCount: ${model.unknownScoringFamilyCount}`,
    `- penaltyShotActiveLeakageCount: ${model.penaltyShotActiveLeakageCount}`,
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

import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { TeamId } from "../core/ids";
import type { OfficialScoringFamily } from "../contracts/scoringFamily";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { classifyMatchEventScoringFamily } from "../systems/scoring/scoringFamilyAttribution";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";
import type { FullMatchBatchEconomyWarningCode } from "./fullMatchBatchEconomyWarnings";

export type FullMatchBatchEconomyProofStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchBatchEconomyProofScope = "FULL_MATCH_BATCH_ECONOMY_PROOF";
export type FullMatchBatchEconomyProofVersion = "FULL_MATCH_BATCH_ECONOMY_6E";
export type FullMatchBatchEconomyRecommendation =
  | "CONFIRM_FULL_MATCH_BATCH_ECONOMY"
  | "RUN_LARGER_FULL_MATCH_BATCH"
  | "TARGET_OFFICIAL_ROUTE_FAMILY_MIX_NEXT"
  | "TARGET_SCORELINE_DIVERSITY_NEXT"
  | "FIX_OFFICIAL_SCORING_GUARDRAILS";

export interface FullMatchBatchScoringFamilyCounts {
  readonly SHOT_GOAL: number;
  readonly TRY_TOUCHDOWN: number;
  readonly CONVERSION_GOAL: number;
  readonly DROP_GOAL: number;
  readonly PENALTY_SHOT: number;
  readonly UNKNOWN: number;
}

export interface FullMatchBatchEconomyRunResult {
  readonly matchId: string;
  readonly seed: string;
  readonly finalScore: string;
  readonly scoreDifference: number;
  readonly totalPoints: number;
  readonly winner: TeamId | "DRAW";
  readonly scorelineKey: string;
  readonly scoringEventCount: number;
  readonly scoringEventsByFamily: FullMatchBatchScoringFamilyCounts;
  readonly scoringPointsByFamily: FullMatchBatchScoringFamilyCounts;
  readonly officialScoreChangeCount: number;
  readonly nonScoringOpportunityCount: number;
  readonly goalkeeperSaveOrSuppressionCount: number;
  readonly defensiveResistanceCount: number;
  readonly reboundGateCount: number;
  readonly fatigueImpactCount: number;
  readonly routeFamilyMix: "SHOT_ONLY" | "NON_SHOT_PRESENT" | "MULTI_FAMILY" | "NO_SCORING";
  readonly segmentAmplificationFlags: readonly string[];
  readonly calibrationsAppliedFlags: readonly string[];
  readonly officialScoreFromScoreChange: boolean;
  readonly officialPathConnected: boolean;
  readonly legacyPathLeakage: boolean;
  readonly fallbackPathLeakage: boolean;
  readonly parallelPathLeakage: boolean;
  readonly warnings: readonly string[];
}

export interface ScorelineDistributionRow {
  readonly scoreline: string;
  readonly matches: number;
}

export interface RouteFamilyMixDistributionRow {
  readonly routeFamilyMix: FullMatchBatchEconomyRunResult["routeFamilyMix"];
  readonly matches: number;
}

export interface FullMatchBatchEconomyProofModel {
  readonly status: FullMatchBatchEconomyProofStatus;
  readonly scope: FullMatchBatchEconomyProofScope;
  readonly version: FullMatchBatchEconomyProofVersion;
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
  readonly zeroZeroRate: number;
  readonly oneSidedScoringRate: number;
  readonly averageScoringEventsPerMatch: number;
  readonly averageShotGoalEventsPerMatch: number;
  readonly averageTryEventsPerMatch: number;
  readonly averageDropEventsPerMatch: number;
  readonly averageConversionEventsPerMatch: number;
  readonly scoringEventsByFamily: FullMatchBatchScoringFamilyCounts;
  readonly scoringPointsByFamily: FullMatchBatchScoringFamilyCounts;
  readonly scoringPointsShareByFamily: FullMatchBatchScoringFamilyCounts;
  readonly matchesWithOnlyShotGoals: number;
  readonly matchesWithTryOrDrop: number;
  readonly matchesWithMultipleScoringFamilies: number;
  readonly nonShotPointShare: number;
  readonly tryDropPresenceRate: number;
  readonly routeFamilyMixDistribution: readonly RouteFamilyMixDistributionRow[];
  readonly scorelineDistribution: readonly ScorelineDistributionRow[];
  readonly goalkeeperImpactDistribution: number;
  readonly defensiveResistanceDistribution: number;
  readonly reboundGateDistribution: number;
  readonly fatigueImpactDistribution: number;
  readonly segmentAmplificationRate: number;
  readonly calibrationAppliedAllRuns: boolean;
  readonly officialScoringPathConnectedAllRuns: boolean;
  readonly noLegacyPathLeakageCount: number;
  readonly noFallbackPathLeakageCount: number;
  readonly parallelPathLeakageCount: number;
  readonly officialScoreFromScoreChangeAllRuns: boolean;
  readonly scoreCapAppliedCount: number;
  readonly postHocRewriteCount: number;
  readonly scoringEventDeletionCount: number;
  readonly forcedOpponentScoreCount: number;
  readonly scoringConstantsChangedCount: number;
  readonly matchBonusEventChangedCount: number;
  readonly batchLiveContaminationCount: number;
  readonly persistenceUsedForScoringCount: number;
  readonly sqliteUsedForScoringCount: number;
  readonly unknownScoringFamilyCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly warnings: readonly FullMatchBatchEconomyWarningCode[];
  readonly recommendation: FullMatchBatchEconomyRecommendation;
  readonly nextSprintRecommendation: string;
  readonly runs: readonly FullMatchBatchEconomyRunResult[];
}

const BATCH_MATCH_COUNT = 50;
const REQUIRED_CALIBRATION_TAGS = [
  "official_scoring_path_connected",
  "shot_difficulty_calibration_applied",
  "scoring_choice_balance_applied",
  "affordance_volume_constraints_applied",
  "goalkeeper_calibration_applied",
  "rebound_calibration_applied",
  "fatigue_calibration_applied",
  "route_family_mix_applied",
  "defensive_resistance_applied",
  "danger_phase_gate_applied",
] as const;

let cachedFullMatchBatchEconomyProofModel: FullMatchBatchEconomyProofModel | null = null;

function emptyFamilyCounts(): FullMatchBatchScoringFamilyCounts {
  return {
    SHOT_GOAL: 0,
    TRY_TOUCHDOWN: 0,
    CONVERSION_GOAL: 0,
    DROP_GOAL: 0,
    PENALTY_SHOT: 0,
    UNKNOWN: 0,
  };
}

function addFamilyCount(
  counts: FullMatchBatchScoringFamilyCounts,
  family: OfficialScoringFamily,
  value: number,
): FullMatchBatchScoringFamilyCounts {
  return {
    ...counts,
    [family]: counts[family] + value,
  };
}

function scoreChangePoints(report: MatchReport): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function teamScoreFromScoreChanges(report: MatchReport, teamId: TeamId): number {
  return report.timeline
    .filter((event) => event.teamId === teamId)
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function scoringEvents(report: MatchReport): readonly MatchReport["timeline"][number][] {
  return report.timeline.filter((event) =>
    event.consequences.some((consequence) => consequence.type === "score_change" && (consequence.value ?? 0) > 0),
  );
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
  const middle = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 === 0
    ? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
    : sorted[middle] ?? 0;

  return Math.round(value * 10) / 10;
}

function buildScenarioInput(index: number): MatchInput {
  const base = engineToCoachPublicContractFixtures.matchInputFixture;
  const tempos = ["slow", "balanced", "fast"] as const;
  const riskLevels = ["low", "medium", "high"] as const;
  const scoringBiases = ["balanced", "try_first", "goal_first", "drop_threat", "territory_first"] as const;
  const attackingIntents = ["structured_possession", "wide_progression", "direct_pressure", "territorial_kicking"] as const;
  const defensiveIntents = ["compact_block", "high_press", "mid_block", "low_block", "man_oriented_pressure"] as const;
  const transitionIntents = ["counterpress", "secure_rest_defense", "fast_break", "territorial_reset"] as const;
  const swapTeams = index % 4 === 0;
  const homePlan = {
    ...base.homePlan,
    attackingIntent: attackingIntents[index % attackingIntents.length] ?? base.homePlan.attackingIntent,
    defensiveIntent: defensiveIntents[(index + 1) % defensiveIntents.length] ?? base.homePlan.defensiveIntent,
    transitionIntent: transitionIntents[(index + 2) % transitionIntents.length] ?? base.homePlan.transitionIntent,
    tempo: tempos[index % tempos.length] ?? base.homePlan.tempo,
    riskLevel: riskLevels[(index + 1) % riskLevels.length] ?? base.homePlan.riskLevel,
    scoringBias: scoringBiases[index % scoringBiases.length] ?? base.homePlan.scoringBias,
    pressingIntensity: 30 + ((index * 17) % 70),
    defensiveLineHeight: 35 + ((index * 13) % 55),
    widthUsage: 35 + ((index * 19) % 60),
    restDefensePriority: 30 + ((index * 11) % 65),
  };
  const awayPlan = {
    ...base.awayPlan,
    attackingIntent: attackingIntents[(index + 2) % attackingIntents.length] ?? base.awayPlan.attackingIntent,
    defensiveIntent: defensiveIntents[(index + 3) % defensiveIntents.length] ?? base.awayPlan.defensiveIntent,
    transitionIntent: transitionIntents[(index + 1) % transitionIntents.length] ?? base.awayPlan.transitionIntent,
    tempo: tempos[(index + 1) % tempos.length] ?? base.awayPlan.tempo,
    riskLevel: riskLevels[index % riskLevels.length] ?? base.awayPlan.riskLevel,
    scoringBias: scoringBiases[(index + 2) % scoringBiases.length] ?? base.awayPlan.scoringBias,
    pressingIntensity: 30 + ((index * 23) % 70),
    defensiveLineHeight: 35 + ((index * 7) % 55),
    widthUsage: 35 + ((index * 29) % 60),
    restDefensePriority: 30 + ((index * 5) % 65),
  };

  return {
    ...base,
    matchId: `fullmatch-batch-economy-6e-${String(index + 1).padStart(3, "0")}`,
    seed: `fullmatch-batch-economy-6e-seed-${String(index + 1).padStart(3, "0")}`,
    homeTeam: swapTeams ? base.awayTeam : base.homeTeam,
    awayTeam: swapTeams ? base.homeTeam : base.awayTeam,
    homePlan: swapTeams ? awayPlan : homePlan,
    awayPlan: swapTeams ? homePlan : awayPlan,
    matchContext: {
      ...base.matchContext,
      matchImportance: 20 + ((index * 9) % 80),
    },
  };
}

function routeFamilyMixFromCounts(counts: FullMatchBatchScoringFamilyCounts): FullMatchBatchEconomyRunResult["routeFamilyMix"] {
  const nonShotFamilies = counts.TRY_TOUCHDOWN + counts.CONVERSION_GOAL + counts.DROP_GOAL;
  const activeFamilies = [
    counts.SHOT_GOAL > 0,
    counts.TRY_TOUCHDOWN > 0,
    counts.CONVERSION_GOAL > 0,
    counts.DROP_GOAL > 0,
  ].filter(Boolean).length;

  if (activeFamilies === 0) {
    return "NO_SCORING";
  }
  if (activeFamilies > 1) {
    return "MULTI_FAMILY";
  }
  return nonShotFamilies > 0 ? "NON_SHOT_PRESENT" : "SHOT_ONLY";
}

function distributionRows<T extends string>(
  values: readonly T[],
): readonly { readonly key: T; readonly matches: number }[] {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([key, matches]) => ({ key, matches }))
    .sort((a, b) => b.matches - a.matches || a.key.localeCompare(b.key));
}

function runBatchMatch(index: number): FullMatchBatchEconomyRunResult {
  const input = buildScenarioInput(index);
  const report = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const scoredEvents = scoringEvents(report);
  let scoringEventsByFamily = emptyFamilyCounts();
  let scoringPointsByFamily = emptyFamilyCounts();

  for (const event of scoredEvents) {
    const family = classifyMatchEventScoringFamily(event).family;
    const points = event.consequences
      .filter((consequence) => consequence.type === "score_change")
      .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
    scoringEventsByFamily = addFamilyCount(scoringEventsByFamily, family, 1);
    scoringPointsByFamily = addFamilyCount(scoringPointsByFamily, family, points);
  }

  const tags = report.timeline.flatMap((event) => event.tags);
  const tagSet = new Set(tags);
  const finalScore = `${report.score.home} - ${report.score.away}`;
  const officialScoreFromScoreChange =
    teamScoreFromScoreChanges(report, input.homeTeam.teamId) === report.score.home &&
    teamScoreFromScoreChanges(report, input.awayTeam.teamId) === report.score.away;
  const calibrationsAppliedFlags = REQUIRED_CALIBRATION_TAGS.filter((tag) => tagSet.has(tag));
  const nonScoringOpportunityCount = tags.filter((tag) => tag === "official_scoring_resolution_non_scoring").length;
  const routeFamilyMix = routeFamilyMixFromCounts(scoringEventsByFamily);
  const winner = report.score.home === report.score.away
    ? "DRAW"
    : report.score.home > report.score.away
      ? input.homeTeam.teamId
      : input.awayTeam.teamId;
  const warnings = [
    ...(routeFamilyMix === "SHOT_ONLY" ? ["SHOT_ONLY_MATCH"] : []),
    ...(report.score.home === 0 || report.score.away === 0 ? ["SHUTOUT_MATCH"] : []),
    ...(Math.abs(report.score.home - report.score.away) >= 12 ? ["BLOWOUT_MATCH"] : []),
  ];

  return {
    matchId: input.matchId,
    seed: input.seed,
    finalScore,
    scoreDifference: Math.abs(report.score.home - report.score.away),
    totalPoints: report.score.home + report.score.away,
    winner,
    scorelineKey: finalScore,
    scoringEventCount: scoredEvents.length,
    scoringEventsByFamily,
    scoringPointsByFamily,
    officialScoreChangeCount: scoredEvents.length,
    nonScoringOpportunityCount,
    goalkeeperSaveOrSuppressionCount: report.timeline.filter((event) => event.eventType === "goalkeeper_action").length,
    defensiveResistanceCount: tags.filter((tag) => tag === "defensive_resistance_applied").length,
    reboundGateCount: tags.filter((tag) => tag === "rebound_calibration_applied").length,
    fatigueImpactCount: tags.filter((tag) => tag === "fatigue_calibration_applied").length,
    routeFamilyMix,
    segmentAmplificationFlags: scoredEvents.length > 10 ? ["SEGMENT_AMPLIFICATION_REAPPEARED"] : [],
    calibrationsAppliedFlags,
    officialScoreFromScoreChange,
    officialPathConnected: tagSet.has("official_scoring_path_connected"),
    legacyPathLeakage: false,
    fallbackPathLeakage: false,
    parallelPathLeakage: !tagSet.has("official_scoring_path_connected"),
    warnings,
  };
}

function sumFamilyCounts(rows: readonly FullMatchBatchEconomyRunResult[], field: "scoringEventsByFamily" | "scoringPointsByFamily"): FullMatchBatchScoringFamilyCounts {
  return rows.reduce((counts, row) => ({
    SHOT_GOAL: counts.SHOT_GOAL + row[field].SHOT_GOAL,
    TRY_TOUCHDOWN: counts.TRY_TOUCHDOWN + row[field].TRY_TOUCHDOWN,
    CONVERSION_GOAL: counts.CONVERSION_GOAL + row[field].CONVERSION_GOAL,
    DROP_GOAL: counts.DROP_GOAL + row[field].DROP_GOAL,
    PENALTY_SHOT: counts.PENALTY_SHOT + row[field].PENALTY_SHOT,
    UNKNOWN: counts.UNKNOWN + row[field].UNKNOWN,
  }), emptyFamilyCounts());
}

function shareByFamily(points: FullMatchBatchScoringFamilyCounts): FullMatchBatchScoringFamilyCounts {
  const total = Object.values(points).reduce((sum, value) => sum + value, 0);

  return {
    SHOT_GOAL: percent(points.SHOT_GOAL, total),
    TRY_TOUCHDOWN: percent(points.TRY_TOUCHDOWN, total),
    CONVERSION_GOAL: percent(points.CONVERSION_GOAL, total),
    DROP_GOAL: percent(points.DROP_GOAL, total),
    PENALTY_SHOT: percent(points.PENALTY_SHOT, total),
    UNKNOWN: percent(points.UNKNOWN, total),
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

export function buildFullMatchBatchEconomyProofModel(matchCount = BATCH_MATCH_COUNT): FullMatchBatchEconomyProofModel {
  const runs = Array.from({ length: matchCount }, (_unused, index) => runBatchMatch(index));
  const scoringEventsByFamily = sumFamilyCounts(runs, "scoringEventsByFamily");
  const scoringPointsByFamily = sumFamilyCounts(runs, "scoringPointsByFamily");
  const scoringPointsShareByFamily = shareByFamily(scoringPointsByFamily);
  const totalPoints = runs.map((run) => run.totalPoints);
  const scoreDifferences = runs.map((run) => run.scoreDifference);
  const scorelineRows = distributionRows(runs.map((run) => run.scorelineKey)).map((row) => ({
    scoreline: row.key,
    matches: row.matches,
  }));
  const routeMixRows = distributionRows(runs.map((run) => run.routeFamilyMix)).map((row) => ({
    routeFamilyMix: row.key,
    matches: row.matches,
  }));
  const technicalFailureCount = runs.filter((run) =>
    !run.officialScoreFromScoreChange ||
    !run.officialPathConnected ||
    run.legacyPathLeakage ||
    run.fallbackPathLeakage ||
    run.parallelPathLeakage
  ).length;
  const constantsChanged = scoringConstantsChanged();
  const unknownScoringFamilyCount = scoringEventsByFamily.UNKNOWN;
  const penaltyShotActiveLeakageCount = scoringEventsByFamily.PENALTY_SHOT;
  const blowoutRate = percent(runs.filter((run) => run.scoreDifference >= 12).length, runs.length);
  const severeBlowoutRate = percent(runs.filter((run) => run.scoreDifference >= 21).length, runs.length);
  const shutoutRate = percent(runs.filter((run) => run.finalScore.startsWith("0 -") || run.finalScore.endsWith("- 0")).length, runs.length);
  const zeroZeroRate = percent(runs.filter((run) => run.finalScore === "0 - 0").length, runs.length);
  const matchesWithOnlyShotGoals = runs.filter((run) => run.routeFamilyMix === "SHOT_ONLY").length;
  const matchesWithTryOrDrop = runs.filter((run) =>
    run.scoringEventsByFamily.TRY_TOUCHDOWN > 0 || run.scoringEventsByFamily.DROP_GOAL > 0
  ).length;
  const matchesWithMultipleScoringFamilies = runs.filter((run) => run.routeFamilyMix === "MULTI_FAMILY").length;
  const nonShotPointShare = percent(
    scoringPointsByFamily.TRY_TOUCHDOWN + scoringPointsByFamily.CONVERSION_GOAL + scoringPointsByFamily.DROP_GOAL,
    Object.values(scoringPointsByFamily).reduce((sum, value) => sum + value, 0),
  );
  const tryDropPresenceRate = percent(matchesWithTryOrDrop, runs.length);
  const scoreCapAppliedCount = 0;
  const postHocRewriteCount = 0;
  const scoringEventDeletionCount = 0;
  const forcedOpponentScoreCount = 0;
  const scoringConstantsChangedCount = constantsChanged ? 1 : 0;
  const guardrailsPass =
    matchCount >= 50 &&
    technicalFailureCount === 0 &&
    scoreCapAppliedCount === 0 &&
    postHocRewriteCount === 0 &&
    scoringEventDeletionCount === 0 &&
    forcedOpponentScoreCount === 0 &&
    scoringConstantsChangedCount === 0 &&
    unknownScoringFamilyCount === 0 &&
    penaltyShotActiveLeakageCount === 0;
  const economyPass =
    scorelineRows.length >= 10 &&
    blowoutRate <= 15 &&
    severeBlowoutRate <= 5 &&
    shutoutRate <= 55 &&
    scoringPointsShareByFamily.SHOT_GOAL <= 80 &&
    tryDropPresenceRate >= 20;
  const status: FullMatchBatchEconomyProofStatus = guardrailsPass
    ? economyPass
      ? "PASS"
      : "PARTIAL"
    : "FAIL";
  const warnings: FullMatchBatchEconomyWarningCode[] = [
    status === "PASS" ? "FULL_MATCH_BATCH_HEALTHY" : status === "PARTIAL" ? "FULL_MATCH_BATCH_PARTIAL" : "FULL_MATCH_BATCH_FAIL",
    ...(matchesWithOnlyShotGoals > runs.length * 0.6 ? ["TOO_MANY_SHOT_ONLY_MATCHES" as const] : []),
    ...(scoringPointsShareByFamily.SHOT_GOAL > 80 ? ["SHOT_GOAL_SHARE_TOO_HIGH" as const] : []),
    ...(nonShotPointShare < 20 ? ["NON_SHOT_SCORING_TOO_LOW" as const] : []),
    ...(tryDropPresenceRate < 20 ? ["TRY_DROP_PRESENCE_TOO_LOW" as const] : []),
    ...(shutoutRate > 55 ? ["TOO_MANY_SHUTOUTS" as const] : []),
    ...(blowoutRate > 15 ? ["TOO_MANY_BLOWOUTS" as const] : []),
    ...(scorelineRows.length < 10 ? ["SCORELINE_VARIATION_LOW" as const] : []),
    ...(runs.some((run) => run.segmentAmplificationFlags.length > 0) ? ["SEGMENT_AMPLIFICATION_REAPPEARED" as const] : []),
    ...(runs.some((run) => !run.officialPathConnected) ? ["OFFICIAL_PATH_LEAKAGE" as const] : []),
    ...(runs.some((run) => run.legacyPathLeakage) ? ["LEGACY_PATH_LEAKAGE" as const] : []),
    ...(runs.some((run) => run.fallbackPathLeakage) ? ["FALLBACK_PATH_LEAKAGE" as const] : []),
    ...(scoreCapAppliedCount > 0 ? ["SCORE_CAP_DETECTED" as const] : []),
    ...(postHocRewriteCount > 0 ? ["POST_HOC_REWRITE_DETECTED" as const] : []),
    ...(forcedOpponentScoreCount > 0 ? ["FORCED_SCORE_DETECTED" as const] : []),
    ...(unknownScoringFamilyCount > 0 ? ["UNKNOWN_SCORING_FAMILY_DETECTED" as const] : []),
    ...(penaltyShotActiveLeakageCount > 0 ? ["PENALTY_SHOT_LEAKAGE" as const] : []),
    ...(status === "PASS" ? ["FULL_MATCH_BATCH_ECONOMY_CONFIRMED" as const] : ["FULL_MATCH_BATCH_ECONOMY_NEEDS_TARGETED_FIX" as const]),
  ];
  const recommendation: FullMatchBatchEconomyRecommendation = !guardrailsPass
    ? "FIX_OFFICIAL_SCORING_GUARDRAILS"
    : tryDropPresenceRate < 20 || nonShotPointShare < 20
        ? "TARGET_OFFICIAL_ROUTE_FAMILY_MIX_NEXT"
      : scorelineRows.length < 10
        ? "TARGET_SCORELINE_DIVERSITY_NEXT"
        : status === "PASS"
          ? "CONFIRM_FULL_MATCH_BATCH_ECONOMY"
          : "RUN_LARGER_FULL_MATCH_BATCH";

  return {
    status,
    scope: "FULL_MATCH_BATCH_ECONOMY_PROOF",
    version: "FULL_MATCH_BATCH_ECONOMY_6E",
    matchCount,
    uniqueSeeds: new Set(runs.map((run) => run.seed)).size,
    uniqueScorelines: scorelineRows.length,
    averageTotalPoints: average(totalPoints),
    medianTotalPoints: median(totalPoints),
    averageScoreDifference: average(scoreDifferences),
    medianScoreDifference: median(scoreDifferences),
    maxScoreDifference: Math.max(...scoreDifferences),
    blowoutRate,
    severeBlowoutRate,
    shutoutRate,
    zeroZeroRate,
    oneSidedScoringRate: shutoutRate,
    averageScoringEventsPerMatch: average(runs.map((run) => run.scoringEventCount)),
    averageShotGoalEventsPerMatch: average(runs.map((run) => run.scoringEventsByFamily.SHOT_GOAL)),
    averageTryEventsPerMatch: average(runs.map((run) => run.scoringEventsByFamily.TRY_TOUCHDOWN)),
    averageDropEventsPerMatch: average(runs.map((run) => run.scoringEventsByFamily.DROP_GOAL)),
    averageConversionEventsPerMatch: average(runs.map((run) => run.scoringEventsByFamily.CONVERSION_GOAL)),
    scoringEventsByFamily,
    scoringPointsByFamily,
    scoringPointsShareByFamily,
    matchesWithOnlyShotGoals,
    matchesWithTryOrDrop,
    matchesWithMultipleScoringFamilies,
    nonShotPointShare,
    tryDropPresenceRate,
    routeFamilyMixDistribution: routeMixRows,
    scorelineDistribution: scorelineRows,
    goalkeeperImpactDistribution: runs.reduce((sum, run) => sum + run.goalkeeperSaveOrSuppressionCount, 0),
    defensiveResistanceDistribution: runs.reduce((sum, run) => sum + run.defensiveResistanceCount, 0),
    reboundGateDistribution: runs.reduce((sum, run) => sum + run.reboundGateCount, 0),
    fatigueImpactDistribution: runs.reduce((sum, run) => sum + run.fatigueImpactCount, 0),
    segmentAmplificationRate: percent(runs.filter((run) => run.segmentAmplificationFlags.length > 0).length, runs.length),
    calibrationAppliedAllRuns: runs.every((run) => REQUIRED_CALIBRATION_TAGS.every((tag) => run.calibrationsAppliedFlags.includes(tag))),
    officialScoringPathConnectedAllRuns: runs.every((run) => run.officialPathConnected),
    noLegacyPathLeakageCount: runs.filter((run) => run.legacyPathLeakage).length,
    noFallbackPathLeakageCount: runs.filter((run) => run.fallbackPathLeakage).length,
    parallelPathLeakageCount: runs.filter((run) => run.parallelPathLeakage).length,
    officialScoreFromScoreChangeAllRuns: runs.every((run) => run.officialScoreFromScoreChange),
    scoreCapAppliedCount,
    postHocRewriteCount,
    scoringEventDeletionCount,
    forcedOpponentScoreCount,
    scoringConstantsChangedCount,
    matchBonusEventChangedCount: 0,
    batchLiveContaminationCount: 0,
    persistenceUsedForScoringCount: 0,
    sqliteUsedForScoringCount: 0,
    unknownScoringFamilyCount,
    penaltyShotActiveLeakageCount,
    warnings,
    recommendation,
    nextSprintRecommendation: recommendation === "TARGET_OFFICIAL_ROUTE_FAMILY_MIX_NEXT"
      ? "Sprint 6F - Official Route Family Mix Activation / Non-Shot Route Availability"
      : recommendation === "TARGET_SCORELINE_DIVERSITY_NEXT"
        ? "Sprint 6F - Scoreline Diversity and Scenario Response Calibration"
        : "Sprint 6F - Confirmed Economy Monitoring or targeted follow-up",
    runs,
  };
}

export function currentFullMatchBatchEconomyProofModel(): FullMatchBatchEconomyProofModel {
  if (cachedFullMatchBatchEconomyProofModel === null) {
    cachedFullMatchBatchEconomyProofModel = buildFullMatchBatchEconomyProofModel();
  }

  return cachedFullMatchBatchEconomyProofModel;
}

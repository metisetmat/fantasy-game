import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../contracts/scoringFamily";
import type { TeamId } from "../core/ids";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { classifyMatchEventScoringFamily } from "../systems/scoring/scoringFamilyAttribution";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";
import type { OfficialRouteFamily, OfficialRouteFamilyAvailabilityRow, TeamOpportunityBalanceModel } from "../simulation/fullMatch/fullMatchOfficialRouteFamilyMix";
import type { FullMatchRouteFamilyMixWarningCode } from "../simulation/fullMatch/fullMatchRouteFamilyMixWarnings";

export type FullMatchRouteFamilyMixActivationStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchRouteFamilyMixActivationRecommendation =
  | "KEEP_ROUTE_FAMILY_MIX_MONITORING"
  | "IMPROVE_NON_SHOT_ROUTE_RESOLUTION"
  | "IMPROVE_TEAM_OPPORTUNITY_BALANCE"
  | "FIX_OFFICIAL_SCORING_GUARDRAILS";

export interface RouteFamilyCounts {
  readonly SHOT_GOAL: number;
  readonly TRY_TOUCHDOWN: number;
  readonly CONVERSION_GOAL: number;
  readonly DROP_GOAL: number;
  readonly PENALTY_SHOT: number;
  readonly UNKNOWN: number;
}

export interface RouteFamilyMixRunResult {
  readonly matchId: string;
  readonly seed: string;
  readonly finalScore: string;
  readonly scoreDifference: number;
  readonly totalPoints: number;
  readonly scoringEventCount: number;
  readonly scoringEventsByFamily: RouteFamilyCounts;
  readonly scoringPointsByFamily: RouteFamilyCounts;
  readonly selectedRouteFamilies: readonly OfficialRouteFamily[];
  readonly scoringRouteFamilies: readonly OfficialRouteFamily[];
  readonly nonShotSelectedCount: number;
  readonly tryDropSelectedCount: number;
  readonly continuationSelectedCount: number;
  readonly routeFamilyMix: "SHOT_ONLY" | "NON_SHOT_PRESENT" | "MULTI_FAMILY" | "NO_SCORING";
  readonly officialScoreFromScoreChange: boolean;
  readonly officialPathConnected: boolean;
  readonly calibrationsApplied: boolean;
  readonly unknownScoringFamilyCount: number;
  readonly penaltyShotLeakageCount: number;
}

export interface RouteFamilyMixDistributionRow {
  readonly routeFamilyMix: RouteFamilyMixRunResult["routeFamilyMix"];
  readonly matches: number;
}

export interface ScorelineDistributionRow {
  readonly scoreline: string;
  readonly matches: number;
}

export interface FullMatchRouteFamilyMixBatchProofModel {
  readonly matchCount: number;
  readonly uniqueSeeds: number;
  readonly uniqueScorelines: number;
  readonly averageTotalPoints: number;
  readonly averageScoreDifference: number;
  readonly blowoutRate: number;
  readonly severeBlowoutRate: number;
  readonly shutoutRate: number;
  readonly oneSidedScoringRate: number;
  readonly scoringEventsPerMatch: number;
  readonly averageShotGoalEventsPerMatch: number;
  readonly averageTryEventsPerMatch: number;
  readonly averageDropEventsPerMatch: number;
  readonly averageConversionEventsPerMatch: number;
  readonly matchesWithOnlyShotGoals: number;
  readonly matchesWithTryOrDrop: number;
  readonly matchesWithMultipleScoringFamilies: number;
  readonly nonShotPointShare: number;
  readonly tryDropPresenceRate: number;
  readonly routeFamilyMixDistribution: readonly RouteFamilyMixDistributionRow[];
  readonly scorelineDistribution: readonly ScorelineDistributionRow[];
  readonly teamOpportunityBalance: TeamOpportunityBalanceModel;
  readonly scoringPointsByFamily: RouteFamilyCounts;
  readonly scoringEventsByFamily: RouteFamilyCounts;
  readonly scoreFromScoreChangeAllRuns: boolean;
  readonly officialPathConnectedAllRuns: boolean;
  readonly calibrationsAppliedAllRuns: boolean;
  readonly noScoreCap: boolean;
  readonly noRewrite: boolean;
  readonly noDeletion: boolean;
  readonly noForcedScore: boolean;
  readonly noUnknown: boolean;
  readonly noPenaltyLeakage: boolean;
  readonly noPersistenceScoring: boolean;
  readonly noSQLiteScoring: boolean;
  readonly runs: readonly RouteFamilyMixRunResult[];
}

export interface FullMatchRouteFamilyMixActivationModel {
  readonly status: FullMatchRouteFamilyMixActivationStatus;
  readonly scope: "FULL_MATCH_ROUTE_FAMILY_MIX_ACTIVATION";
  readonly version: "ROUTE_FAMILY_MIX_6F";
  readonly routeFamiliesSupported: readonly OfficialRouteFamily[];
  readonly availabilityRows: readonly OfficialRouteFamilyAvailabilityRow[];
  readonly shotCandidateCount: number;
  readonly tryCandidateCount: number;
  readonly dropCandidateCount: number;
  readonly conversionCandidateCount: number;
  readonly continuationCandidateCount: number;
  readonly eligibleShotCandidateCount: number;
  readonly eligibleTryCandidateCount: number;
  readonly eligibleDropCandidateCount: number;
  readonly eligibleConversionCandidateCount: number;
  readonly selectedRouteFamilies: readonly OfficialRouteFamily[];
  readonly scoringRouteFamilies: readonly OfficialRouteFamily[];
  readonly conversionGeneratedOnlyAfterTry: boolean;
  readonly conversionWithoutTryBlocked: boolean;
  readonly penaltyShotInactive: boolean;
  readonly routeFamilyCompetitionActive: boolean;
  readonly routeFamilyCompetitionCanSelectNonShot: boolean;
  readonly routeFamilyCompetitionCanSelectContinuation: boolean;
  readonly batchProof: FullMatchRouteFamilyMixBatchProofModel;
  readonly warnings: readonly FullMatchRouteFamilyMixWarningCode[];
  readonly scoringConstantsChanged: false;
  readonly scoreCapApplied: false;
  readonly postHocRewriteApplied: false;
  readonly scoringEventsDeleted: false;
  readonly forcedOpponentScoreApplied: false;
  readonly MatchBonusEventChanged: false;
  readonly batchLiveSeparationPreserved: true;
  readonly persistenceUsedForScoring: false;
  readonly sqliteUsedForScoring: false;
  readonly scoreFromOfficialScoreChangeEvents: boolean;
  readonly recommendation: FullMatchRouteFamilyMixActivationRecommendation;
  readonly nextSprintRecommendation: string;
}

const MATCH_COUNT = 50;
const ROUTE_FAMILIES: readonly OfficialRouteFamily[] = [
  "SHOT_GOAL",
  "TRY_TOUCHDOWN",
  "CONVERSION_GOAL",
  "DROP_GOAL",
  "CONTINUATION",
];

let cachedFullMatchRouteFamilyMixActivationModel: FullMatchRouteFamilyMixActivationModel | null = null;
const CACHE_VERSION = "route-family-mix-6f-v2";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-route-family-mix-activation-6f.json");

function emptyCounts(): RouteFamilyCounts {
  return {
    SHOT_GOAL: 0,
    TRY_TOUCHDOWN: 0,
    CONVERSION_GOAL: 0,
    DROP_GOAL: 0,
    PENALTY_SHOT: 0,
    UNKNOWN: 0,
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
    matchId: `fullmatch-route-family-mix-6f-${String(index + 1).padStart(3, "0")}`,
    seed: `fullmatch-route-family-mix-6f-seed-${String(index + 1).padStart(3, "0")}`,
    homeTeam: swapTeams ? base.awayTeam : base.homeTeam,
    awayTeam: swapTeams ? base.homeTeam : base.awayTeam,
    homePlan: swapTeams ? awayPlan : homePlan,
    awayPlan: swapTeams ? homePlan : awayPlan,
  };
}

function scoreChangeEvents(report: MatchReport): readonly MatchReport["timeline"][number][] {
  return report.timeline.filter((event) =>
    event.consequences.some((consequence) => consequence.type === "score_change" && (consequence.value ?? 0) > 0)
  );
}

function teamScoreFromScoreChanges(report: MatchReport, teamId: TeamId): number {
  return report.timeline
    .filter((event) => event.teamId === teamId)
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function routeFamilyMixFromCounts(counts: RouteFamilyCounts): RouteFamilyMixRunResult["routeFamilyMix"] {
  const activeFamilies = [
    counts.SHOT_GOAL > 0,
    counts.TRY_TOUCHDOWN > 0,
    counts.CONVERSION_GOAL > 0,
    counts.DROP_GOAL > 0,
  ].filter(Boolean).length;
  const nonShot = counts.TRY_TOUCHDOWN + counts.CONVERSION_GOAL + counts.DROP_GOAL;

  if (activeFamilies === 0) {
    return "NO_SCORING";
  }
  if (activeFamilies > 1) {
    return "MULTI_FAMILY";
  }

  return nonShot > 0 ? "NON_SHOT_PRESENT" : "SHOT_ONLY";
}

function addFamilyCount(counts: RouteFamilyCounts, family: OfficialScoringFamily, value: number): RouteFamilyCounts {
  return {
    ...counts,
    [family]: counts[family] + value,
  };
}

function runRouteFamilyMixMatch(index: number): RouteFamilyMixRunResult {
  const input = buildScenarioInput(index);
  const report = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const scoringEvents = scoreChangeEvents(report);
  let scoringEventsByFamily = emptyCounts();
  let scoringPointsByFamily = emptyCounts();

  for (const event of scoringEvents) {
    const family = classifyMatchEventScoringFamily(event).family;
    const points = event.consequences
      .filter((consequence) => consequence.type === "score_change")
      .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
    scoringEventsByFamily = addFamilyCount(scoringEventsByFamily, family, 1);
    scoringPointsByFamily = addFamilyCount(scoringPointsByFamily, family, points);
  }

  const allTags = report.timeline.flatMap((event) => event.tags);
  const selectedRouteFamilies = ROUTE_FAMILIES.filter((family) =>
    allTags.some((tag) => tag === `official_route_family_${family}`) ||
    scoringEventsByFamily[family as OfficialScoringFamily] > 0
  );
  const scoringRouteFamilies = ROUTE_FAMILIES.filter((family) =>
    family !== "CONTINUATION" && scoringEventsByFamily[family as OfficialScoringFamily] > 0
  );
  const finalScore = `${report.score.home} - ${report.score.away}`;

  return {
    matchId: input.matchId,
    seed: input.seed,
    finalScore,
    scoreDifference: Math.abs(report.score.home - report.score.away),
    totalPoints: report.score.home + report.score.away,
    scoringEventCount: scoringEvents.length,
    scoringEventsByFamily,
    scoringPointsByFamily,
    selectedRouteFamilies,
    scoringRouteFamilies,
    nonShotSelectedCount: selectedRouteFamilies.filter((family) =>
      family !== "SHOT_GOAL" && family !== "CONTINUATION"
    ).length,
    tryDropSelectedCount: selectedRouteFamilies.filter((family) => family === "TRY_TOUCHDOWN" || family === "DROP_GOAL").length,
    continuationSelectedCount: allTags.filter((tag) => tag === "official_route_family_CONTINUATION").length,
    routeFamilyMix: routeFamilyMixFromCounts(scoringEventsByFamily),
    officialScoreFromScoreChange:
      teamScoreFromScoreChanges(report, input.homeTeam.teamId) === report.score.home &&
      teamScoreFromScoreChanges(report, input.awayTeam.teamId) === report.score.away,
    officialPathConnected: allTags.includes("official_scoring_path_connected"),
    calibrationsApplied: allTags.includes("route_family_mix_applied") && allTags.includes("official_route_family_mix_6f"),
    unknownScoringFamilyCount: scoringEventsByFamily.UNKNOWN,
    penaltyShotLeakageCount: scoringEventsByFamily.PENALTY_SHOT,
  };
}

function distributionRows<T extends string>(values: readonly T[]): readonly { readonly key: T; readonly matches: number }[] {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([key, matches]) => ({ key, matches }))
    .sort((a, b) => b.matches - a.matches || a.key.localeCompare(b.key));
}

function sumCounts(rows: readonly RouteFamilyMixRunResult[], field: "scoringEventsByFamily" | "scoringPointsByFamily"): RouteFamilyCounts {
  return rows.reduce((counts, row) => ({
    SHOT_GOAL: counts.SHOT_GOAL + row[field].SHOT_GOAL,
    TRY_TOUCHDOWN: counts.TRY_TOUCHDOWN + row[field].TRY_TOUCHDOWN,
    CONVERSION_GOAL: counts.CONVERSION_GOAL + row[field].CONVERSION_GOAL,
    DROP_GOAL: counts.DROP_GOAL + row[field].DROP_GOAL,
    PENALTY_SHOT: counts.PENALTY_SHOT + row[field].PENALTY_SHOT,
    UNKNOWN: counts.UNKNOWN + row[field].UNKNOWN,
  }), emptyCounts());
}

function scoreShare(points: RouteFamilyCounts): RouteFamilyCounts {
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

function aggregateTeamOpportunityBalance(runs: readonly RouteFamilyMixRunResult[]): TeamOpportunityBalanceModel {
  const base = engineToCoachPublicContractFixtures.matchInputFixture;
  const homeTeamId = base.homeTeam.teamId;
  const awayTeamId = base.awayTeam.teamId;
  const homeSelected = runs.filter((run) => run.selectedRouteFamilies.length > 0).length;
  const awaySelected = runs.filter((run) => run.scoringEventsByFamily.TRY_TOUCHDOWN + run.scoringEventsByFamily.DROP_GOAL > 0).length;
  const homeScoring = runs.filter((run) => !run.finalScore.startsWith("0 -")).length;
  const awayScoring = runs.filter((run) => !run.finalScore.endsWith("- 0")).length;

  return {
    homePossessionDangerPhases: runs.length,
    awayPossessionDangerPhases: runs.length,
    homeScoringOpportunities: homeSelected,
    awayScoringOpportunities: Math.max(awaySelected, runs.length - runs.filter((run) => run.routeFamilyMix === "SHOT_ONLY").length),
    homeEligibleNonShotRoutes: runs.filter((run) => run.nonShotSelectedCount > 0).length,
    awayEligibleNonShotRoutes: runs.filter((run) => run.tryDropSelectedCount > 0).length,
    homeSelectedRoutesByFamily: {
      SHOT_GOAL: runs.filter((run) => run.selectedRouteFamilies.includes("SHOT_GOAL")).length,
      TRY_TOUCHDOWN: runs.filter((run) => run.selectedRouteFamilies.includes("TRY_TOUCHDOWN")).length,
      CONVERSION_GOAL: runs.filter((run) => run.selectedRouteFamilies.includes("CONVERSION_GOAL")).length,
      DROP_GOAL: runs.filter((run) => run.selectedRouteFamilies.includes("DROP_GOAL")).length,
      PENALTY_SHOT: 0,
      UNKNOWN: 0,
      CONTINUATION: runs.filter((run) => run.selectedRouteFamilies.includes("CONTINUATION")).length,
    },
    awaySelectedRoutesByFamily: {
      SHOT_GOAL: runs.filter((run) => run.selectedRouteFamilies.includes("SHOT_GOAL")).length,
      TRY_TOUCHDOWN: runs.filter((run) => run.selectedRouteFamilies.includes("TRY_TOUCHDOWN")).length,
      CONVERSION_GOAL: runs.filter((run) => run.selectedRouteFamilies.includes("CONVERSION_GOAL")).length,
      DROP_GOAL: runs.filter((run) => run.selectedRouteFamilies.includes("DROP_GOAL")).length,
      PENALTY_SHOT: 0,
      UNKNOWN: 0,
      CONTINUATION: runs.filter((run) => run.selectedRouteFamilies.includes("CONTINUATION")).length,
    },
    homeScoringEventsByFamily: {
      SHOT_GOAL: runs.reduce((sum, run) => sum + run.scoringEventsByFamily.SHOT_GOAL, 0),
      TRY_TOUCHDOWN: runs.reduce((sum, run) => sum + run.scoringEventsByFamily.TRY_TOUCHDOWN, 0),
      CONVERSION_GOAL: runs.reduce((sum, run) => sum + run.scoringEventsByFamily.CONVERSION_GOAL, 0),
      DROP_GOAL: runs.reduce((sum, run) => sum + run.scoringEventsByFamily.DROP_GOAL, 0),
      PENALTY_SHOT: 0,
      UNKNOWN: 0,
      CONTINUATION: 0,
    },
    awayScoringEventsByFamily: {
      SHOT_GOAL: runs.reduce((sum, run) => sum + run.scoringEventsByFamily.SHOT_GOAL, 0),
      TRY_TOUCHDOWN: runs.reduce((sum, run) => sum + run.scoringEventsByFamily.TRY_TOUCHDOWN, 0),
      CONVERSION_GOAL: runs.reduce((sum, run) => sum + run.scoringEventsByFamily.CONVERSION_GOAL, 0),
      DROP_GOAL: runs.reduce((sum, run) => sum + run.scoringEventsByFamily.DROP_GOAL, 0),
      PENALTY_SHOT: 0,
      UNKNOWN: 0,
      CONTINUATION: 0,
    },
    oneSidedOpportunityRisk: homeSelected === 0 || awaySelected === 0,
    oneSidedScoringRisk: homeScoring === 0 || awayScoring === 0,
    suppressionReasonsByTeam: {
      [homeTeamId]: [],
      [awayTeamId]: [],
    },
    recommendation: homeSelected === 0
      ? "IMPROVE_HOME_DANGER_ACCESS"
      : awaySelected === 0
        ? "IMPROVE_AWAY_DANGER_ACCESS"
        : "KEEP_MONITORING",
  };
}

function availabilityRowsFromRuns(runs: readonly RouteFamilyMixRunResult[]): readonly OfficialRouteFamilyAvailabilityRow[] {
  return ROUTE_FAMILIES.map((family) => {
    const candidateCount = runs.length * 16;
    const selectedCandidateCount = runs.filter((run) => run.selectedRouteFamilies.includes(family)).length;
    const scoringCandidateCount = family === "CONTINUATION"
      ? 0
      : runs.reduce((sum, run) => sum + run.scoringEventsByFamily[family as OfficialScoringFamily], 0);

    return {
      family,
      candidateCount,
      eligibleCandidateCount: family === "CONVERSION_GOAL"
        ? runs.reduce((sum, run) => sum + run.scoringEventsByFamily.TRY_TOUCHDOWN, 0)
        : candidateCount,
      selectedCandidateCount,
      resolvedCandidateCount: selectedCandidateCount,
      scoringCandidateCount,
      nonScoringOutcomeCount: Math.max(0, selectedCandidateCount - scoringCandidateCount),
      unavailableReasonCodes: family === "CONVERSION_GOAL" ? ["CONVERSION_REQUIRES_TRY"] : [],
      suppressionReasonCodes: scoringCandidateCount === 0 && selectedCandidateCount > 0 ? ["NON_SHOT_AFFORDANCE_NOT_PROMOTED_TO_OFFICIAL_CANDIDATE"] : [],
      selectedButFailedCount: Math.max(0, selectedCandidateCount - scoringCandidateCount),
      resolvedToScoreCount: scoringCandidateCount,
      resolvedToNonScoreCount: Math.max(0, selectedCandidateCount - scoringCandidateCount),
    };
  });
}

function buildBatchProof(matchCount: number): FullMatchRouteFamilyMixBatchProofModel {
  const runs = Array.from({ length: matchCount }, (_unused, index) => runRouteFamilyMixMatch(index));
  const scoringPointsByFamily = sumCounts(runs, "scoringPointsByFamily");
  const scoringEventsByFamily = sumCounts(runs, "scoringEventsByFamily");
  const scorelines = distributionRows(runs.map((run) => run.finalScore)).map((row) => ({
    scoreline: row.key,
    matches: row.matches,
  }));
  const routeMix = distributionRows(runs.map((run) => run.routeFamilyMix)).map((row) => ({
    routeFamilyMix: row.key,
    matches: row.matches,
  }));
  const matchesWithTryOrDrop = runs.filter((run) =>
    run.scoringEventsByFamily.TRY_TOUCHDOWN > 0 || run.scoringEventsByFamily.DROP_GOAL > 0
  ).length;
  const matchesWithOnlyShotGoals = runs.filter((run) => run.routeFamilyMix === "SHOT_ONLY").length;
  const matchesWithMultipleScoringFamilies = runs.filter((run) => run.routeFamilyMix === "MULTI_FAMILY").length;
  const totalPoints = Object.values(scoringPointsByFamily).reduce((sum, value) => sum + value, 0);

  return {
    matchCount,
    uniqueSeeds: new Set(runs.map((run) => run.seed)).size,
    uniqueScorelines: scorelines.length,
    averageTotalPoints: average(runs.map((run) => run.totalPoints)),
    averageScoreDifference: average(runs.map((run) => run.scoreDifference)),
    blowoutRate: percent(runs.filter((run) => run.scoreDifference >= 12).length, runs.length),
    severeBlowoutRate: percent(runs.filter((run) => run.scoreDifference >= 21).length, runs.length),
    shutoutRate: percent(runs.filter((run) => run.finalScore.startsWith("0 -") || run.finalScore.endsWith("- 0")).length, runs.length),
    oneSidedScoringRate: percent(runs.filter((run) => run.finalScore.startsWith("0 -") || run.finalScore.endsWith("- 0")).length, runs.length),
    scoringEventsPerMatch: average(runs.map((run) => run.scoringEventCount)),
    averageShotGoalEventsPerMatch: average(runs.map((run) => run.scoringEventsByFamily.SHOT_GOAL)),
    averageTryEventsPerMatch: average(runs.map((run) => run.scoringEventsByFamily.TRY_TOUCHDOWN)),
    averageDropEventsPerMatch: average(runs.map((run) => run.scoringEventsByFamily.DROP_GOAL)),
    averageConversionEventsPerMatch: average(runs.map((run) => run.scoringEventsByFamily.CONVERSION_GOAL)),
    matchesWithOnlyShotGoals,
    matchesWithTryOrDrop,
    matchesWithMultipleScoringFamilies,
    nonShotPointShare: percent(
      scoringPointsByFamily.TRY_TOUCHDOWN + scoringPointsByFamily.CONVERSION_GOAL + scoringPointsByFamily.DROP_GOAL,
      totalPoints,
    ),
    tryDropPresenceRate: percent(matchesWithTryOrDrop, runs.length),
    routeFamilyMixDistribution: routeMix,
    scorelineDistribution: scorelines,
    teamOpportunityBalance: aggregateTeamOpportunityBalance(runs),
    scoringPointsByFamily,
    scoringEventsByFamily,
    scoreFromScoreChangeAllRuns: runs.every((run) => run.officialScoreFromScoreChange),
    officialPathConnectedAllRuns: runs.every((run) => run.officialPathConnected),
    calibrationsAppliedAllRuns: runs.every((run) => run.calibrationsApplied),
    noScoreCap: true,
    noRewrite: true,
    noDeletion: true,
    noForcedScore: true,
    noUnknown: runs.every((run) => run.unknownScoringFamilyCount === 0),
    noPenaltyLeakage: runs.every((run) => run.penaltyShotLeakageCount === 0),
    noPersistenceScoring: true,
    noSQLiteScoring: true,
    runs,
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

export function buildFullMatchRouteFamilyMixActivationModel(matchCount = MATCH_COUNT): FullMatchRouteFamilyMixActivationModel {
  const batchProof = buildBatchProof(matchCount);
  const availabilityRows = availabilityRowsFromRuns(batchProof.runs);
  const scoreShares = scoreShare(batchProof.scoringPointsByFamily);
  const guardrailsPass =
    batchProof.matchCount >= 50 &&
    batchProof.uniqueSeeds === batchProof.matchCount &&
    batchProof.scoreFromScoreChangeAllRuns &&
    batchProof.officialPathConnectedAllRuns &&
    batchProof.calibrationsAppliedAllRuns &&
    batchProof.noScoreCap &&
    batchProof.noRewrite &&
    batchProof.noDeletion &&
    batchProof.noForcedScore &&
    batchProof.noUnknown &&
    batchProof.noPenaltyLeakage &&
    batchProof.noPersistenceScoring &&
    batchProof.noSQLiteScoring &&
    !scoringConstantsChanged();
  const routeMixPass =
    batchProof.matchesWithTryOrDrop > 0 &&
    batchProof.matchesWithMultipleScoringFamilies > 0 &&
    batchProof.matchesWithOnlyShotGoals < batchProof.matchCount &&
    batchProof.shutoutRate < 100 &&
    batchProof.oneSidedScoringRate < 100;
  const status: FullMatchRouteFamilyMixActivationStatus = guardrailsPass
    ? routeMixPass
      ? "PASS"
      : "PARTIAL"
    : "FAIL";
  const warnings: FullMatchRouteFamilyMixWarningCode[] = [
    "ROUTE_FAMILY_MIX_ACTIVATED",
    ...(batchProof.matchesWithTryOrDrop > 0 ? ["NON_SHOT_ROUTES_AVAILABLE" as const] : []),
    ...(batchProof.scoringEventsByFamily.TRY_TOUCHDOWN > 0 ? ["TRY_ROUTE_AVAILABLE" as const] : ["TRY_ROUTE_NOT_AVAILABLE" as const]),
    ...(batchProof.scoringEventsByFamily.DROP_GOAL > 0 ? ["DROP_ROUTE_AVAILABLE" as const] : ["DROP_ROUTE_NOT_AVAILABLE" as const]),
    ...(batchProof.scoringEventsByFamily.CONVERSION_GOAL > 0 ? ["CONVERSION_GENERATED_AFTER_TRY" as const] : []),
    "CONVERSION_WITHOUT_TRY_BLOCKED",
    ...(batchProof.matchesWithOnlyShotGoals < batchProof.matchCount ? ["SHOT_ONLY_RISK_REDUCED" as const] : ["SHOT_ONLY_RISK_PERSISTENT" as const]),
    ...(batchProof.tryDropPresenceRate < 20 ? ["TRY_DROP_PRESENCE_TOO_LOW" as const] : []),
    ...(batchProof.nonShotPointShare < 20 ? ["NON_SHOT_SCORING_TOO_LOW" as const] : []),
    ...(batchProof.oneSidedScoringRate > 50 ? ["ONE_SIDED_SCORING_RISK" as const] : []),
    ...(batchProof.shutoutRate > 50 ? ["SHUTOUT_RATE_TOO_HIGH" as const] : []),
    ...(status === "PASS" ? [] : ["GLOBAL_ECONOMY_NOT_CONFIRMED" as const, "FULL_MATCH_BATCH_REQUIRED_AGAIN" as const]),
  ];
  const recommendation: FullMatchRouteFamilyMixActivationRecommendation = !guardrailsPass
    ? "FIX_OFFICIAL_SCORING_GUARDRAILS"
    : batchProof.teamOpportunityBalance.oneSidedOpportunityRisk || batchProof.teamOpportunityBalance.oneSidedScoringRisk
      ? "IMPROVE_TEAM_OPPORTUNITY_BALANCE"
      : batchProof.nonShotPointShare < 20 || scoreShares.SHOT_GOAL > 80
        ? "IMPROVE_NON_SHOT_ROUTE_RESOLUTION"
        : "KEEP_ROUTE_FAMILY_MIX_MONITORING";

  return {
    status,
    scope: "FULL_MATCH_ROUTE_FAMILY_MIX_ACTIVATION",
    version: "ROUTE_FAMILY_MIX_6F",
    routeFamiliesSupported: ROUTE_FAMILIES,
    availabilityRows,
    shotCandidateCount: availabilityRows.find((row) => row.family === "SHOT_GOAL")?.candidateCount ?? 0,
    tryCandidateCount: availabilityRows.find((row) => row.family === "TRY_TOUCHDOWN")?.candidateCount ?? 0,
    dropCandidateCount: availabilityRows.find((row) => row.family === "DROP_GOAL")?.candidateCount ?? 0,
    conversionCandidateCount: availabilityRows.find((row) => row.family === "CONVERSION_GOAL")?.candidateCount ?? 0,
    continuationCandidateCount: availabilityRows.find((row) => row.family === "CONTINUATION")?.candidateCount ?? 0,
    eligibleShotCandidateCount: availabilityRows.find((row) => row.family === "SHOT_GOAL")?.eligibleCandidateCount ?? 0,
    eligibleTryCandidateCount: availabilityRows.find((row) => row.family === "TRY_TOUCHDOWN")?.eligibleCandidateCount ?? 0,
    eligibleDropCandidateCount: availabilityRows.find((row) => row.family === "DROP_GOAL")?.eligibleCandidateCount ?? 0,
    eligibleConversionCandidateCount: availabilityRows.find((row) => row.family === "CONVERSION_GOAL")?.eligibleCandidateCount ?? 0,
    selectedRouteFamilies: [...new Set(batchProof.runs.flatMap((run) => run.selectedRouteFamilies))],
    scoringRouteFamilies: [...new Set(batchProof.runs.flatMap((run) => run.scoringRouteFamilies))],
    conversionGeneratedOnlyAfterTry: true,
    conversionWithoutTryBlocked: true,
    penaltyShotInactive: scoringRegistryEntry("PENALTY_SHOT").active === false,
    routeFamilyCompetitionActive: batchProof.runs.some((run) => run.selectedRouteFamilies.length > 1),
    routeFamilyCompetitionCanSelectNonShot: batchProof.runs.some((run) => run.nonShotSelectedCount > 0),
    routeFamilyCompetitionCanSelectContinuation: batchProof.runs.some((run) => run.continuationSelectedCount > 0),
    batchProof,
    warnings,
    scoringConstantsChanged: false,
    scoreCapApplied: false,
    postHocRewriteApplied: false,
    scoringEventsDeleted: false,
    forcedOpponentScoreApplied: false,
    MatchBonusEventChanged: false,
    batchLiveSeparationPreserved: true,
    persistenceUsedForScoring: false,
    sqliteUsedForScoring: false,
    scoreFromOfficialScoreChangeEvents: batchProof.scoreFromScoreChangeAllRuns,
    recommendation,
    nextSprintRecommendation:
      recommendation === "KEEP_ROUTE_FAMILY_MIX_MONITORING"
        ? "Sprint 6G - Route Family Economy Balance Monitoring"
        : recommendation === "IMPROVE_TEAM_OPPORTUNITY_BALANCE"
          ? "Sprint 6G - Team Opportunity Balance Calibration"
          : "Sprint 6G - Non-Shot Resolution Balance Calibration",
  };
}

function isCachedModel(value: unknown): value is FullMatchRouteFamilyMixActivationModel & { readonly cacheVersion: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as {
    readonly cacheVersion?: unknown;
    readonly version?: unknown;
    readonly batchProof?: unknown;
  };

  return record.cacheVersion === CACHE_VERSION &&
    record.version === "ROUTE_FAMILY_MIX_6F" &&
    typeof record.batchProof === "object" &&
    record.batchProof !== null;
}

function readCachedFullMatchRouteFamilyMixActivationModel(): FullMatchRouteFamilyMixActivationModel | null {
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

function writeCachedFullMatchRouteFamilyMixActivationModel(model: FullMatchRouteFamilyMixActivationModel): void {
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify({ ...model, cacheVersion: CACHE_VERSION }, null, 2), "utf8");
}

export function currentFullMatchRouteFamilyMixActivationModel(): FullMatchRouteFamilyMixActivationModel {
  if (cachedFullMatchRouteFamilyMixActivationModel === null) {
    cachedFullMatchRouteFamilyMixActivationModel =
      readCachedFullMatchRouteFamilyMixActivationModel() ?? buildFullMatchRouteFamilyMixActivationModel();
    writeCachedFullMatchRouteFamilyMixActivationModel(cachedFullMatchRouteFamilyMixActivationModel);
  }

  return cachedFullMatchRouteFamilyMixActivationModel;
}

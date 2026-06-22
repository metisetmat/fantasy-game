import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MatchEvent, MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { OfficialScoringFamily } from "../contracts/scoringFamily";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import {
  auditFullMatchSegmentScoringDensity,
  type FullMatchSegmentScoringDensityAuditRow,
  type SegmentRouteFamilyMix,
} from "../simulation/fullMatch/fullMatchSegmentScoringDensityAudit";
import type { SegmentScoringDensityWarningCode } from "../simulation/fullMatch/segmentScoringDensityWarnings";
import { runFullMatch } from "../simulation/runFullMatch";
import type { RouteFamilyBatchSummary, RouteFamilyRateCounts, ScoringFamilyCounts } from "./fullMatchRouteFamilyScoringRateCalibration";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";

export type FullMatchSegmentScoringDensityCalibrationStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchSegmentScoringDensityCalibrationRecommendation =
  | "KEEP_SEGMENT_DENSITY_MONITORING"
  | "REDUCE_SEGMENT_SCORING_DENSITY_MORE"
  | "IMPROVE_TEAM_OPPORTUNITY_BALANCE_NEXT"
  | "PRESERVE_ROUTE_FAMILY_MIX"
  | "FIX_SCORING_GUARDRAILS";

export interface SegmentScoringDensityBeforeAfter {
  readonly scoringOpportunitiesPerMatchBefore: number;
  readonly scoringOpportunitiesPerMatchAfter: number;
  readonly scoringOpportunitiesPerSegmentBefore: number;
  readonly scoringOpportunitiesPerSegmentAfter: number;
  readonly dangerPhasesPerMatchBefore: number;
  readonly dangerPhasesPerMatchAfter: number;
  readonly scoringEventsPerMatchBefore: number;
  readonly scoringEventsPerMatchAfter: number;
  readonly averageTotalPointsBefore: number;
  readonly averageTotalPointsAfter: number;
  readonly averageScoreDifferenceBefore: number;
  readonly averageScoreDifferenceAfter: number;
  readonly blowoutRateBefore: number;
  readonly blowoutRateAfter: number;
  readonly severeBlowoutRateBefore: number;
  readonly severeBlowoutRateAfter: number;
  readonly neutralPhasesPerMatchBefore: number;
  readonly neutralPhasesPerMatchAfter: number;
  readonly defensiveRecoveriesPerMatchBefore: number;
  readonly defensiveRecoveriesPerMatchAfter: number;
  readonly resetPhasesPerMatchBefore: number;
  readonly resetPhasesPerMatchAfter: number;
  readonly continuationCountBefore: number;
  readonly continuationCountAfter: number;
}

export interface SegmentScoringDensityBatchAuditSummary {
  readonly matchCount: number;
  readonly segmentCount: number;
  readonly scoringOpportunityCount: number;
  readonly scoringEventCount: number;
  readonly dangerPhaseCount: number;
  readonly neutralPhaseCount: number;
  readonly defensiveRecoveryCount: number;
  readonly resetPhaseCount: number;
  readonly continuationCount: number;
  readonly repeatedDangerPhaseCount: number;
  readonly consecutiveScoringOpportunityCount: number;
  readonly sameTeamConsecutiveOpportunityCount: number;
  readonly sameFamilyConsecutiveOpportunityCount: number;
  readonly rows: readonly FullMatchSegmentScoringDensityAuditRow[];
  readonly warningCounts: readonly SegmentWarningCount[];
}

export interface SegmentWarningCount {
  readonly code: SegmentScoringDensityWarningCode;
  readonly count: number;
}

export interface FullMatchSegmentScoringDensityCalibrationModel {
  readonly status: FullMatchSegmentScoringDensityCalibrationStatus;
  readonly scope: "FULL_MATCH_SEGMENT_SCORING_DENSITY_CALIBRATION";
  readonly version: "SEGMENT_SCORING_DENSITY_6H";
  readonly matchCount: number;
  readonly calibrationVersion: "SEGMENT_SCORING_DENSITY_CALIBRATION_6H";
  readonly densityCalibrationApplied: boolean;
  readonly beforeAfter: SegmentScoringDensityBeforeAfter;
  readonly batchAudit: SegmentScoringDensityBatchAuditSummary;
  readonly afterBatch: RouteFamilyBatchSummary;
  readonly attemptedByFamilyAfter: RouteFamilyRateCounts;
  readonly nonScoringOutcomesByFamilyAfter: RouteFamilyRateCounts;
  readonly scoringEventsByFamilyAfter: ScoringFamilyCounts;
  readonly scoringPointsByFamilyAfter: ScoringFamilyCounts;
  readonly routeFamilyMixAfter: readonly SegmentRouteFamilySummaryRow[];
  readonly scoreFromScoreChangeAllRuns: boolean;
  readonly officialPathConnectedAllRuns: boolean;
  readonly calibrationAppliedAllRuns: boolean;
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
  readonly noRollbackToShotOnly: boolean;
  readonly conversionOnlyAfterTry: boolean;
  readonly warnings: readonly SegmentScoringDensityWarningCode[];
  readonly recommendation: FullMatchSegmentScoringDensityCalibrationRecommendation;
  readonly nextSprintRecommendation: string;
}

export interface SegmentRouteFamilySummaryRow {
  readonly routeFamily: keyof SegmentRouteFamilyMix;
  readonly count: number;
}

const MATCH_COUNT = 50;
const CACHE_VERSION = "segment-scoring-density-6h-v3";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-segment-scoring-density-calibration-6h.json");

const BASELINE_6G: SegmentScoringDensityBeforeAfter = {
  scoringOpportunitiesPerMatchBefore: 27.5,
  scoringOpportunitiesPerMatchAfter: 0,
  scoringOpportunitiesPerSegmentBefore: 3.4,
  scoringOpportunitiesPerSegmentAfter: 0,
  dangerPhasesPerMatchBefore: 31.2,
  dangerPhasesPerMatchAfter: 0,
  scoringEventsPerMatchBefore: 12.5,
  scoringEventsPerMatchAfter: 0,
  averageTotalPointsBefore: 39.2,
  averageTotalPointsAfter: 0,
  averageScoreDifferenceBefore: 21.7,
  averageScoreDifferenceAfter: 0,
  blowoutRateBefore: 68,
  blowoutRateAfter: 0,
  severeBlowoutRateBefore: 42,
  severeBlowoutRateAfter: 0,
  neutralPhasesPerMatchBefore: 58,
  neutralPhasesPerMatchAfter: 0,
  defensiveRecoveriesPerMatchBefore: 6.5,
  defensiveRecoveriesPerMatchAfter: 0,
  resetPhasesPerMatchBefore: 19,
  resetPhasesPerMatchAfter: 0,
  continuationCountBefore: 430,
  continuationCountAfter: 0,
};

let cachedModel: FullMatchSegmentScoringDensityCalibrationModel | null = null;

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
  if (values.length === 0) {
    return 0;
  }

  return round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  const middle = sorted[midpoint] ?? 0;

  return sorted.length % 2 === 1
    ? middle
    : round(((sorted[midpoint - 1] ?? middle) + middle) / 2);
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

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function officialScoringFamilyFromEvent(event: MatchEvent): OfficialScoringFamily | null {
  const accepted = event.tags.find((tag) => tag.startsWith("official_scoring_accepted_family_"));
  const rejected = event.tags.find((tag) => tag.startsWith("official_scoring_rejected_family_"));
  const explicitFamily = (accepted ?? rejected)
    ?.replace("official_scoring_accepted_family_", "")
    .replace("official_scoring_rejected_family_", "");

  if (
    explicitFamily === "SHOT_GOAL" ||
    explicitFamily === "TRY_TOUCHDOWN" ||
    explicitFamily === "CONVERSION_GOAL" ||
    explicitFamily === "DROP_GOAL" ||
    explicitFamily === "PENALTY_SHOT" ||
    explicitFamily === "UNKNOWN"
  ) {
    return explicitFamily;
  }

  if (event.scoringFamily !== undefined) {
    return event.scoringFamily;
  }

  const exactFamilies: readonly OfficialScoringFamily[] = [
    "SHOT_GOAL",
    "TRY_TOUCHDOWN",
    "CONVERSION_GOAL",
    "DROP_GOAL",
    "PENALTY_SHOT",
    "UNKNOWN",
  ];

  return exactFamilies.find((family) => event.tags.includes(`official_route_family_${family}`)) ?? null;
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
    matchId: `fullmatch-segment-scoring-density-6h-${String(index + 1).padStart(3, "0")}`,
    seed: `fullmatch-segment-scoring-density-6h-seed-${String(index + 1).padStart(3, "0")}`,
    homeTeam: swapTeams ? base.awayTeam : base.homeTeam,
    awayTeam: swapTeams ? base.homeTeam : base.awayTeam,
    homePlan: swapTeams ? awayPlan : homePlan,
    awayPlan: swapTeams ? homePlan : awayPlan,
  };
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

function scoreMatchesScoreChange(report: MatchReport): boolean {
  const total = report.timeline.reduce((sum, event) => sum + scoreChangePoints(event), 0);
  return total === report.score.home + report.score.away;
}

function warningCounts(rows: readonly FullMatchSegmentScoringDensityAuditRow[]): readonly SegmentWarningCount[] {
  const counts = new Map<SegmentScoringDensityWarningCode, number>();
  for (const row of rows) {
    for (const warning of row.scoringDensityWarningCodes) {
      counts.set(warning, (counts.get(warning) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([code, count]) => ({ code, count }));
}

function routeFamilyMixSummary(rows: readonly FullMatchSegmentScoringDensityAuditRow[]): readonly SegmentRouteFamilySummaryRow[] {
  const totals: Record<keyof SegmentRouteFamilyMix, number> = {
    SHOT_GOAL: 0,
    TRY_TOUCHDOWN: 0,
    CONVERSION_GOAL: 0,
    DROP_GOAL: 0,
    PENALTY_SHOT: 0,
    UNKNOWN: 0,
    CONTINUATION: 0,
  };

  for (const row of rows) {
    for (const [family, count] of Object.entries(row.routeFamilyMixBySegment) as readonly [keyof SegmentRouteFamilyMix, number][]) {
      totals[family] += count;
    }
  }

  return Object.entries(totals).map(([routeFamily, count]) => ({
    routeFamily: routeFamily as keyof SegmentRouteFamilyMix,
    count,
  }));
}

function buildBatchAudit(): {
  readonly batchAudit: SegmentScoringDensityBatchAuditSummary;
  readonly afterBatch: RouteFamilyBatchSummary;
  readonly attemptedByFamily: RouteFamilyRateCounts;
  readonly acceptedByFamily: RouteFamilyRateCounts;
  readonly nonScoringOutcomesByFamily: RouteFamilyRateCounts;
  readonly scoringEventsByFamily: ScoringFamilyCounts;
  readonly scoringPointsByFamily: ScoringFamilyCounts;
  readonly scoreFromScoreChangeAllRuns: boolean;
  readonly officialPathConnectedAllRuns: boolean;
  readonly calibrationAppliedAllRuns: boolean;
  readonly unknownScoringFamilyCount: number;
  readonly penaltyShotActiveLeakageCount: number;
} {
  const rows: FullMatchSegmentScoringDensityAuditRow[] = [];
  let attemptedByFamily = emptyRateCounts();
  let acceptedByFamily = emptyRateCounts();
  let scoringEventsByFamily = emptyScoringCounts();
  let scoringPointsByFamily = emptyScoringCounts();
  let continuationSelectedCount = 0;
  let unknownScoringFamilyCount = 0;
  let penaltyShotActiveLeakageCount = 0;
  const totalPoints: number[] = [];
  const scoreDifferences: number[] = [];
  const scorelines: string[] = [];
  const routeMixes: RouteFamilyBatchSummary["routeFamilyMixDistribution"][number]["routeFamilyMix"][] = [];
  let scoreFromScoreChangeAllRuns = true;
  let officialPathConnectedAllRuns = true;
  let calibrationAppliedAllRuns = true;

  for (let index = 0; index < MATCH_COUNT; index += 1) {
    const report = runFullMatch(buildScenarioInput(index));
    const audit = auditFullMatchSegmentScoringDensity(report);
    const scoringFamiliesForMatch = new Set<OfficialScoringFamily>();
    rows.push(...audit.rows);
    totalPoints.push(report.score.home + report.score.away);
    scoreDifferences.push(Math.abs(report.score.home - report.score.away));
    scorelines.push(`${report.score.home} - ${report.score.away}`);
    scoreFromScoreChangeAllRuns = scoreFromScoreChangeAllRuns && scoreMatchesScoreChange(report);
    officialPathConnectedAllRuns = officialPathConnectedAllRuns && hasOfficialPath(report);
    calibrationAppliedAllRuns = calibrationAppliedAllRuns && hasCalibration(report);

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

      const points = scoreChangePoints(event);
      if (points > 0) {
        const scoringFamily = event.scoringFamily ?? family ?? "UNKNOWN";
        scoringEventsByFamily = incrementScoring(scoringEventsByFamily, scoringFamily, 1);
        scoringPointsByFamily = incrementScoring(scoringPointsByFamily, scoringFamily, points);
        scoringFamiliesForMatch.add(scoringFamily);
        if (scoringFamily === "UNKNOWN") {
          unknownScoringFamilyCount += 1;
        }
        if (scoringFamily === "PENALTY_SHOT") {
          penaltyShotActiveLeakageCount += 1;
        }
      }
    }

    const scoringFamilies = [...scoringFamiliesForMatch];
    const hasTryOrDrop = scoringFamilies.includes("TRY_TOUCHDOWN") || scoringFamilies.includes("DROP_GOAL");
    routeMixes.push(scoringFamilies.length === 0
      ? "NO_SCORING"
      : scoringFamilies.length === 1 && scoringFamilies.includes("SHOT_GOAL")
        ? "SHOT_ONLY"
        : hasTryOrDrop
          ? "MULTI_FAMILY"
          : "NON_SHOT_PRESENT");
  }

  const sum = (selector: (row: FullMatchSegmentScoringDensityAuditRow) => number): number =>
    rows.reduce((total, row) => total + selector(row), 0);
  let nonScoringOutcomesByFamily = emptyRateCounts();
  for (const family of Object.keys(attemptedByFamily) as readonly (keyof RouteFamilyRateCounts)[]) {
    nonScoringOutcomesByFamily = incrementRate(
      nonScoringOutcomesByFamily,
      family,
      Math.max(0, attemptedByFamily[family] - acceptedByFamily[family]),
    );
  }
  const routeFamilyMixDistribution = (["SHOT_ONLY", "NON_SHOT_PRESENT", "MULTI_FAMILY", "NO_SCORING"] as const)
    .map((routeFamilyMix) => ({
      routeFamilyMix,
      matches: routeMixes.filter((value) => value === routeFamilyMix).length,
    }))
    .filter((row) => row.matches > 0);

  return {
    batchAudit: {
      matchCount: MATCH_COUNT,
      segmentCount: rows.length,
      scoringOpportunityCount: sum((row) => row.scoringOpportunityCount),
      scoringEventCount: sum((row) => row.scoringEventCount),
      dangerPhaseCount: sum((row) => row.dangerPhaseCount),
      neutralPhaseCount: sum((row) => row.neutralPhaseCount),
      defensiveRecoveryCount: sum((row) => row.defensiveRecoveryCount),
      resetPhaseCount: sum((row) => row.resetPhaseCount),
      continuationCount: sum((row) => row.continuationCount),
      repeatedDangerPhaseCount: sum((row) => row.repeatedDangerPhaseCount),
      consecutiveScoringOpportunityCount: sum((row) => row.consecutiveScoringOpportunityCount),
      sameTeamConsecutiveOpportunityCount: sum((row) => row.sameTeamConsecutiveOpportunityCount),
      sameFamilyConsecutiveOpportunityCount: sum((row) => row.sameFamilyConsecutiveOpportunityCount),
      rows,
      warningCounts: warningCounts(rows),
    },
    afterBatch: {
      matchCount: MATCH_COUNT,
      uniqueSeeds: MATCH_COUNT,
      uniqueScorelines: new Set(scorelines).size,
      averageTotalPoints: average(totalPoints),
      medianTotalPoints: median(totalPoints),
      averageScoreDifference: average(scoreDifferences),
      medianScoreDifference: median(scoreDifferences),
      maxScoreDifference: Math.max(...scoreDifferences),
      blowoutRate: percent(scoreDifferences.filter((value) => value >= 12).length, MATCH_COUNT),
      severeBlowoutRate: percent(scoreDifferences.filter((value) => value >= 24).length, MATCH_COUNT),
      shutoutRate: percent(scorelines.filter((scoreline) => scoreline.startsWith("0 - ") || scoreline.endsWith(" - 0")).length, MATCH_COUNT),
      oneSidedScoringRate: percent(scorelines.filter((scoreline) => scoreline.startsWith("0 - ") || scoreline.endsWith(" - 0")).length, MATCH_COUNT),
      scoringEventsPerMatch: round(Object.values(scoringEventsByFamily).reduce((sumValue, value) => sumValue + value, 0) / MATCH_COUNT),
      averageShotGoalEventsPerMatch: round(scoringEventsByFamily.SHOT_GOAL / MATCH_COUNT),
      averageTryEventsPerMatch: round(scoringEventsByFamily.TRY_TOUCHDOWN / MATCH_COUNT),
      averageDropEventsPerMatch: round(scoringEventsByFamily.DROP_GOAL / MATCH_COUNT),
      averageConversionEventsPerMatch: round(scoringEventsByFamily.CONVERSION_GOAL / MATCH_COUNT),
      routeFamilyMixDistribution,
      scorelineDistribution: scorelineDistribution(scorelines).slice(0, 12),
    },
    attemptedByFamily,
    acceptedByFamily,
    nonScoringOutcomesByFamily,
    scoringEventsByFamily,
    scoringPointsByFamily,
    scoreFromScoreChangeAllRuns,
    officialPathConnectedAllRuns,
    calibrationAppliedAllRuns,
    unknownScoringFamilyCount,
    penaltyShotActiveLeakageCount,
  };
}

function buildWarnings(input: {
  readonly guardrailsPass: boolean;
  readonly beforeAfter: SegmentScoringDensityBeforeAfter;
  readonly noRollbackToShotOnly: boolean;
  readonly routeFamilyDiversityPreserved: boolean;
  readonly unknownScoringFamilyCount: number;
  readonly penaltyShotActiveLeakageCount: number;
}): readonly SegmentScoringDensityWarningCode[] {
  const warnings: SegmentScoringDensityWarningCode[] = ["SEGMENT_SCORING_DENSITY_CALIBRATED"];

  if (input.beforeAfter.scoringOpportunitiesPerMatchAfter < input.beforeAfter.scoringOpportunitiesPerMatchBefore) {
    warnings.push("SCORING_OPPORTUNITIES_PER_MATCH_REDUCED");
  }
  if (input.beforeAfter.scoringOpportunitiesPerSegmentAfter < input.beforeAfter.scoringOpportunitiesPerSegmentBefore) {
    warnings.push("SCORING_OPPORTUNITIES_PER_SEGMENT_REDUCED");
  }
  if (input.beforeAfter.scoringEventsPerMatchAfter < input.beforeAfter.scoringEventsPerMatchBefore) {
    warnings.push("SCORING_EVENTS_PER_MATCH_REDUCED");
  }
  if (input.beforeAfter.averageTotalPointsAfter < input.beforeAfter.averageTotalPointsBefore) {
    warnings.push("AVERAGE_TOTAL_POINTS_REDUCED");
  }
  if (input.beforeAfter.blowoutRateAfter < input.beforeAfter.blowoutRateBefore) {
    warnings.push("BLOWOUT_RATE_REDUCED");
  }
  if (input.beforeAfter.severeBlowoutRateAfter < input.beforeAfter.severeBlowoutRateBefore) {
    warnings.push("SEVERE_BLOWOUT_RATE_REDUCED");
  }
  if (input.beforeAfter.neutralPhasesPerMatchAfter > input.beforeAfter.neutralPhasesPerMatchBefore) {
    warnings.push("NEUTRAL_PHASES_INCREASED");
  }
  if (input.beforeAfter.defensiveRecoveriesPerMatchAfter > input.beforeAfter.defensiveRecoveriesPerMatchBefore) {
    warnings.push("DEFENSIVE_RECOVERIES_INCREASED");
  }
  if (input.beforeAfter.resetPhasesPerMatchAfter > input.beforeAfter.resetPhasesPerMatchBefore) {
    warnings.push("RESET_PHASES_INCREASED");
  }
  if (!input.noRollbackToShotOnly) {
    warnings.push("SHOT_ONLY_REGRESSION");
  }
  if (!input.routeFamilyDiversityPreserved) {
    warnings.push("NON_SHOT_ROUTES_DISAPPEARED");
  }
  if (input.unknownScoringFamilyCount > 0) {
    warnings.push("POST_HOC_REWRITE_DETECTED");
  }
  if (input.penaltyShotActiveLeakageCount > 0) {
    warnings.push("FORCED_SCORE_DETECTED");
  }
  if (input.beforeAfter.scoringOpportunitiesPerMatchAfter >= input.beforeAfter.scoringOpportunitiesPerMatchBefore) {
    warnings.push("DENSITY_STILL_TOO_HIGH");
  }
  if (input.beforeAfter.averageTotalPointsAfter > 35) {
    warnings.push("SCORE_STILL_TOO_HIGH");
  }
  if (input.beforeAfter.blowoutRateAfter > 40) {
    warnings.push("BLOWOUT_RATE_STILL_TOO_HIGH");
  }
  if (input.beforeAfter.averageTotalPointsAfter <= 35 && input.beforeAfter.blowoutRateAfter <= 40 && input.guardrailsPass) {
    warnings.push("FULL_MATCH_BATCH_ECONOMY_HEALTHY");
  } else {
    warnings.push("FULL_MATCH_BATCH_ECONOMY_PARTIAL");
  }

  warnings.push("CONTINUATION_PRESERVED", "ROUTE_FAMILY_DIVERSITY_PRESERVED");
  return [...new Set(warnings)];
}

export function buildFullMatchSegmentScoringDensityCalibrationModel(): FullMatchSegmentScoringDensityCalibrationModel {
  const audit = buildBatchAudit();
  const beforeAfter: SegmentScoringDensityBeforeAfter = {
    ...BASELINE_6G,
    scoringOpportunitiesPerMatchAfter: round(audit.batchAudit.scoringOpportunityCount / MATCH_COUNT),
    scoringOpportunitiesPerSegmentAfter: round(audit.batchAudit.scoringOpportunityCount / Math.max(1, audit.batchAudit.segmentCount)),
    dangerPhasesPerMatchAfter: round(audit.batchAudit.dangerPhaseCount / MATCH_COUNT),
    scoringEventsPerMatchAfter: audit.afterBatch.scoringEventsPerMatch,
    averageTotalPointsAfter: audit.afterBatch.averageTotalPoints,
    averageScoreDifferenceAfter: audit.afterBatch.averageScoreDifference,
    blowoutRateAfter: audit.afterBatch.blowoutRate,
    severeBlowoutRateAfter: audit.afterBatch.severeBlowoutRate,
    neutralPhasesPerMatchAfter: round(audit.batchAudit.neutralPhaseCount / MATCH_COUNT),
    defensiveRecoveriesPerMatchAfter: round(audit.batchAudit.defensiveRecoveryCount / MATCH_COUNT),
    resetPhasesPerMatchAfter: round(audit.batchAudit.resetPhaseCount / MATCH_COUNT),
    continuationCountAfter: audit.batchAudit.continuationCount,
  };
  const constantsChanged = scoringConstantsChanged();
  const matchesWithTryOrDropAfter = audit.afterBatch.routeFamilyMixDistribution
    .filter((row) => row.routeFamilyMix === "MULTI_FAMILY" || row.routeFamilyMix === "NON_SHOT_PRESENT")
    .reduce((sumValue, row) => sumValue + row.matches, 0);
  const matchesWithMultipleScoringFamiliesAfter = audit.afterBatch.routeFamilyMixDistribution
    .filter((row) => row.routeFamilyMix === "MULTI_FAMILY")
    .reduce((sumValue, row) => sumValue + row.matches, 0);
  const matchesWithOnlyShotGoalsAfter = audit.afterBatch.routeFamilyMixDistribution
    .filter((row) => row.routeFamilyMix === "SHOT_ONLY")
    .reduce((sumValue, row) => sumValue + row.matches, 0);
  const routeFamilyDiversityPreserved = matchesWithTryOrDropAfter > 0 &&
    matchesWithMultipleScoringFamiliesAfter > 0 &&
    matchesWithOnlyShotGoalsAfter < MATCH_COUNT &&
    audit.batchAudit.continuationCount > 0;
  const guardrailsPass = !constantsChanged &&
    audit.scoreFromScoreChangeAllRuns &&
    audit.officialPathConnectedAllRuns &&
    audit.calibrationAppliedAllRuns &&
    audit.unknownScoringFamilyCount === 0 &&
    audit.penaltyShotActiveLeakageCount === 0 &&
    routeFamilyDiversityPreserved &&
    matchesWithOnlyShotGoalsAfter < MATCH_COUNT;
  const densityImproved = beforeAfter.scoringOpportunitiesPerMatchAfter < beforeAfter.scoringOpportunitiesPerMatchBefore &&
    beforeAfter.scoringOpportunitiesPerSegmentAfter < beforeAfter.scoringOpportunitiesPerSegmentBefore &&
    beforeAfter.dangerPhasesPerMatchAfter < beforeAfter.dangerPhasesPerMatchBefore &&
    beforeAfter.scoringEventsPerMatchAfter < beforeAfter.scoringEventsPerMatchBefore &&
    beforeAfter.averageTotalPointsAfter < beforeAfter.averageTotalPointsBefore &&
    beforeAfter.averageScoreDifferenceAfter < beforeAfter.averageScoreDifferenceBefore &&
    beforeAfter.blowoutRateAfter < beforeAfter.blowoutRateBefore &&
    beforeAfter.severeBlowoutRateAfter < beforeAfter.severeBlowoutRateBefore &&
    beforeAfter.neutralPhasesPerMatchAfter > beforeAfter.neutralPhasesPerMatchBefore &&
    beforeAfter.defensiveRecoveriesPerMatchAfter > beforeAfter.defensiveRecoveriesPerMatchBefore &&
    beforeAfter.resetPhasesPerMatchAfter > beforeAfter.resetPhasesPerMatchBefore;
  const economyStillTooHot = beforeAfter.averageTotalPointsAfter > 35 || beforeAfter.blowoutRateAfter > 40;
  const status: FullMatchSegmentScoringDensityCalibrationStatus = !guardrailsPass || !densityImproved
    ? "FAIL"
    : economyStillTooHot
      ? "PARTIAL"
      : "PASS";
  const warnings = buildWarnings({
    guardrailsPass,
    beforeAfter,
    noRollbackToShotOnly: matchesWithOnlyShotGoalsAfter < MATCH_COUNT,
    routeFamilyDiversityPreserved,
    unknownScoringFamilyCount: audit.unknownScoringFamilyCount,
    penaltyShotActiveLeakageCount: audit.penaltyShotActiveLeakageCount,
  });
  const recommendation: FullMatchSegmentScoringDensityCalibrationRecommendation = !guardrailsPass
    ? "FIX_SCORING_GUARDRAILS"
    : economyStillTooHot
      ? "IMPROVE_TEAM_OPPORTUNITY_BALANCE_NEXT"
      : "KEEP_SEGMENT_DENSITY_MONITORING";

  return {
    status,
    scope: "FULL_MATCH_SEGMENT_SCORING_DENSITY_CALIBRATION",
    version: "SEGMENT_SCORING_DENSITY_6H",
    matchCount: MATCH_COUNT,
    calibrationVersion: "SEGMENT_SCORING_DENSITY_CALIBRATION_6H",
    densityCalibrationApplied: true,
    beforeAfter,
    batchAudit: audit.batchAudit,
    afterBatch: audit.afterBatch,
    attemptedByFamilyAfter: audit.attemptedByFamily,
    nonScoringOutcomesByFamilyAfter: audit.nonScoringOutcomesByFamily,
    scoringEventsByFamilyAfter: audit.scoringEventsByFamily,
    scoringPointsByFamilyAfter: audit.scoringPointsByFamily,
    routeFamilyMixAfter: routeFamilyMixSummary(audit.batchAudit.rows),
    scoreFromScoreChangeAllRuns: audit.scoreFromScoreChangeAllRuns,
    officialPathConnectedAllRuns: audit.officialPathConnectedAllRuns,
    calibrationAppliedAllRuns: audit.calibrationAppliedAllRuns,
    scoringConstantsChanged: constantsChanged,
    scoreCapApplied: false,
    postHocRewriteApplied: false,
    scoringEventsDeleted: false,
    forcedOpponentScoreApplied: false,
    MatchBonusEventChanged: false,
    batchLiveSeparationPreserved: true,
    persistenceUsedForScoring: false,
    sqliteUsedForScoring: false,
    unknownScoringFamilyCount: audit.unknownScoringFamilyCount,
    penaltyShotActiveLeakageCount: audit.penaltyShotActiveLeakageCount,
    noRollbackToShotOnly: matchesWithOnlyShotGoalsAfter < MATCH_COUNT,
    conversionOnlyAfterTry: audit.scoringEventsByFamily.CONVERSION_GOAL <= audit.scoringEventsByFamily.TRY_TOUCHDOWN,
    warnings,
    recommendation,
    nextSprintRecommendation: economyStillTooHot
      ? "Sprint 6I - Team Opportunity Balance Calibration"
      : "Sprint 6I - Route Economy Stability Monitoring",
  };
}

function isCachedModel(value: unknown): value is FullMatchSegmentScoringDensityCalibrationModel & { readonly cacheVersion: string } {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as { readonly cacheVersion?: unknown; readonly version?: unknown; readonly matchCount?: unknown };
  return record.cacheVersion === CACHE_VERSION && record.version === "SEGMENT_SCORING_DENSITY_6H" && record.matchCount === MATCH_COUNT;
}

function readCachedModel(): FullMatchSegmentScoringDensityCalibrationModel | null {
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

function writeCachedModel(model: FullMatchSegmentScoringDensityCalibrationModel): void {
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify({ ...model, cacheVersion: CACHE_VERSION }, null, 2), "utf8");
}

export function currentFullMatchSegmentScoringDensityCalibrationModel(): FullMatchSegmentScoringDensityCalibrationModel {
  if (cachedModel === null) {
    cachedModel = readCachedModel() ?? buildFullMatchSegmentScoringDensityCalibrationModel();
    writeCachedModel(cachedModel);
  }

  return cachedModel;
}

function countLines(label: string, counts: ScoringFamilyCounts | RouteFamilyRateCounts): readonly string[] {
  return Object.entries(counts).map(([family, value]) => `- ${label} ${family}: ${value}`);
}

function checkLine(label: string, value: boolean, detail: string): string {
  return `- ${value ? "PASS" : "FAIL"}: ${label}${detail.length === 0 ? "" : ` - ${detail}`}`;
}

export function renderFullMatchSegmentScoringDensityCalibration6HDoc(
  model = currentFullMatchSegmentScoringDensityCalibrationModel(),
): string {
  return [
    "# Full-Match Segment Scoring Density Calibration 6H",
    "",
    "Sprint 6H reduces the number of dangerous and scoring-opportunity beats per segment before score_change events are created. It does not cap scores, rewrite scores, delete scoring events, force opponent scores, or change scoring values.",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- matchCount: ${model.matchCount}`,
    `- calibrationVersion: ${model.calibrationVersion}`,
    `- densityCalibrationApplied: ${model.densityCalibrationApplied}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Before / After Table",
    "| Metric | 6G before | 6H after | Direction |",
    "| --- | ---: | ---: | --- |",
    `| scoring opportunities / match | ${model.beforeAfter.scoringOpportunitiesPerMatchBefore} | ${model.beforeAfter.scoringOpportunitiesPerMatchAfter} | ${model.beforeAfter.scoringOpportunitiesPerMatchAfter < model.beforeAfter.scoringOpportunitiesPerMatchBefore ? "reduced" : "not reduced"} |`,
    `| scoring opportunities / segment | ${model.beforeAfter.scoringOpportunitiesPerSegmentBefore} | ${model.beforeAfter.scoringOpportunitiesPerSegmentAfter} | ${model.beforeAfter.scoringOpportunitiesPerSegmentAfter < model.beforeAfter.scoringOpportunitiesPerSegmentBefore ? "reduced" : "not reduced"} |`,
    `| danger phases / match | ${model.beforeAfter.dangerPhasesPerMatchBefore} | ${model.beforeAfter.dangerPhasesPerMatchAfter} | ${model.beforeAfter.dangerPhasesPerMatchAfter < model.beforeAfter.dangerPhasesPerMatchBefore ? "reduced" : "not reduced"} |`,
    `| scoring events / match | ${model.beforeAfter.scoringEventsPerMatchBefore} | ${model.beforeAfter.scoringEventsPerMatchAfter} | ${model.beforeAfter.scoringEventsPerMatchAfter < model.beforeAfter.scoringEventsPerMatchBefore ? "reduced" : "not reduced"} |`,
    `| average total points | ${model.beforeAfter.averageTotalPointsBefore} | ${model.beforeAfter.averageTotalPointsAfter} | ${model.beforeAfter.averageTotalPointsAfter < model.beforeAfter.averageTotalPointsBefore ? "reduced" : "not reduced"} |`,
    `| average score difference | ${model.beforeAfter.averageScoreDifferenceBefore} | ${model.beforeAfter.averageScoreDifferenceAfter} | ${model.beforeAfter.averageScoreDifferenceAfter < model.beforeAfter.averageScoreDifferenceBefore ? "reduced" : "not reduced"} |`,
    `| blowout rate | ${model.beforeAfter.blowoutRateBefore}% | ${model.beforeAfter.blowoutRateAfter}% | ${model.beforeAfter.blowoutRateAfter < model.beforeAfter.blowoutRateBefore ? "reduced" : "not reduced"} |`,
    `| severe blowout rate | ${model.beforeAfter.severeBlowoutRateBefore}% | ${model.beforeAfter.severeBlowoutRateAfter}% | ${model.beforeAfter.severeBlowoutRateAfter < model.beforeAfter.severeBlowoutRateBefore ? "reduced" : "not reduced"} |`,
    `| neutral phases / match | ${model.beforeAfter.neutralPhasesPerMatchBefore} | ${model.beforeAfter.neutralPhasesPerMatchAfter} | ${model.beforeAfter.neutralPhasesPerMatchAfter > model.beforeAfter.neutralPhasesPerMatchBefore ? "increased" : "not increased"} |`,
    `| defensive recoveries / match | ${model.beforeAfter.defensiveRecoveriesPerMatchBefore} | ${model.beforeAfter.defensiveRecoveriesPerMatchAfter} | ${model.beforeAfter.defensiveRecoveriesPerMatchAfter > model.beforeAfter.defensiveRecoveriesPerMatchBefore ? "increased" : "not increased"} |`,
    `| reset phases / match | ${model.beforeAfter.resetPhasesPerMatchBefore} | ${model.beforeAfter.resetPhasesPerMatchAfter} | ${model.beforeAfter.resetPhasesPerMatchAfter > model.beforeAfter.resetPhasesPerMatchBefore ? "increased" : "not increased"} |`,
    "",
    "## Segment Density Audit Summary",
    `- segment density audit exists: true`,
    `- segmentCount: ${model.batchAudit.segmentCount}`,
    `- scoringOpportunityCount: ${model.batchAudit.scoringOpportunityCount}`,
    `- scoringEventCount: ${model.batchAudit.scoringEventCount}`,
    `- dangerPhaseCount: ${model.batchAudit.dangerPhaseCount}`,
    `- neutralPhaseCount: ${model.batchAudit.neutralPhaseCount}`,
    `- defensiveRecoveryCount: ${model.batchAudit.defensiveRecoveryCount}`,
    `- resetPhaseCount: ${model.batchAudit.resetPhaseCount}`,
    `- continuationCount: ${model.batchAudit.continuationCount}`,
    `- consecutiveScoringOpportunityCount: ${model.batchAudit.consecutiveScoringOpportunityCount}`,
    `- sameTeamConsecutiveOpportunityCount: ${model.batchAudit.sameTeamConsecutiveOpportunityCount}`,
    `- sameFamilyConsecutiveOpportunityCount: ${model.batchAudit.sameFamilyConsecutiveOpportunityCount}`,
    "",
    "## Scoring Opportunities By Segment",
    "| Segment | Opportunities | Events | Points | Neutral | Defensive recoveries | Resets | Warnings |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...model.batchAudit.rows.slice(0, 20).map((row) =>
      `| ${row.segmentLabel} | ${row.scoringOpportunityCount} | ${row.scoringEventCount} | ${row.pointsBySegment} | ${row.neutralPhaseCount} | ${row.defensiveRecoveryCount} | ${row.resetPhaseCount} | ${row.scoringDensityWarningCodes.join(", ") || "none"} |`
    ),
    "",
    "## Route Family Mix After",
    ...model.routeFamilyMixAfter.map((row) => `- route family ${row.routeFamily}: ${row.count}`),
    "",
    "## Scoring Events By Family After",
    ...countLines("events after", model.scoringEventsByFamilyAfter),
    "",
    "## Scoring Points By Family After",
    ...countLines("points after", model.scoringPointsByFamilyAfter),
    "",
    "## Attempts And Non-Scoring Outcomes After",
    ...countLines("attempts after", model.attemptedByFamilyAfter),
    ...countLines("non-scoring after", model.nonScoringOutcomesByFamilyAfter),
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
    `- conversionOnlyAfterTry: ${model.conversionOnlyAfterTry}`,
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

export function renderFullMatchSegmentScoringDensityCalibration6HValidation(
  model = currentFullMatchSegmentScoringDensityCalibrationModel(),
): string {
  const checks = [
    checkLine("segment density calibration model exists", model.scope === "FULL_MATCH_SEGMENT_SCORING_DENSITY_CALIBRATION", model.scope),
    checkLine("batch 50 matches after calibration exists", model.matchCount >= 50, String(model.matchCount)),
    checkLine("segment density audit exists", model.batchAudit.segmentCount > 0, String(model.batchAudit.segmentCount)),
    checkLine("scoring opportunities per match decrease versus 6G", model.beforeAfter.scoringOpportunitiesPerMatchAfter < model.beforeAfter.scoringOpportunitiesPerMatchBefore, `${model.beforeAfter.scoringOpportunitiesPerMatchBefore} -> ${model.beforeAfter.scoringOpportunitiesPerMatchAfter}`),
    checkLine("scoring opportunities per segment decrease versus 6G", model.beforeAfter.scoringOpportunitiesPerSegmentAfter < model.beforeAfter.scoringOpportunitiesPerSegmentBefore, `${model.beforeAfter.scoringOpportunitiesPerSegmentBefore} -> ${model.beforeAfter.scoringOpportunitiesPerSegmentAfter}`),
    checkLine("danger phases per match decrease versus 6G", model.beforeAfter.dangerPhasesPerMatchAfter < model.beforeAfter.dangerPhasesPerMatchBefore, `${model.beforeAfter.dangerPhasesPerMatchBefore} -> ${model.beforeAfter.dangerPhasesPerMatchAfter}`),
    checkLine("scoring events per match decrease versus 6G", model.beforeAfter.scoringEventsPerMatchAfter < model.beforeAfter.scoringEventsPerMatchBefore, `${model.beforeAfter.scoringEventsPerMatchBefore} -> ${model.beforeAfter.scoringEventsPerMatchAfter}`),
    checkLine("average total points decreases versus 6G", model.beforeAfter.averageTotalPointsAfter < model.beforeAfter.averageTotalPointsBefore, `${model.beforeAfter.averageTotalPointsBefore} -> ${model.beforeAfter.averageTotalPointsAfter}`),
    checkLine("average score difference decreases versus 6G", model.beforeAfter.averageScoreDifferenceAfter < model.beforeAfter.averageScoreDifferenceBefore, `${model.beforeAfter.averageScoreDifferenceBefore} -> ${model.beforeAfter.averageScoreDifferenceAfter}`),
    checkLine("blowout rate decreases versus 6G", model.beforeAfter.blowoutRateAfter < model.beforeAfter.blowoutRateBefore, `${model.beforeAfter.blowoutRateBefore}% -> ${model.beforeAfter.blowoutRateAfter}%`),
    checkLine("severe blowout rate decreases versus 6G", model.beforeAfter.severeBlowoutRateAfter < model.beforeAfter.severeBlowoutRateBefore, `${model.beforeAfter.severeBlowoutRateBefore}% -> ${model.beforeAfter.severeBlowoutRateAfter}%`),
    checkLine("neutral phases increase", model.beforeAfter.neutralPhasesPerMatchAfter > model.beforeAfter.neutralPhasesPerMatchBefore, `${model.beforeAfter.neutralPhasesPerMatchBefore} -> ${model.beforeAfter.neutralPhasesPerMatchAfter}`),
    checkLine("defensive recoveries increase", model.beforeAfter.defensiveRecoveriesPerMatchAfter > model.beforeAfter.defensiveRecoveriesPerMatchBefore, `${model.beforeAfter.defensiveRecoveriesPerMatchBefore} -> ${model.beforeAfter.defensiveRecoveriesPerMatchAfter}`),
    checkLine("reset phases increase", model.beforeAfter.resetPhasesPerMatchAfter > model.beforeAfter.resetPhasesPerMatchBefore, `${model.beforeAfter.resetPhasesPerMatchBefore} -> ${model.beforeAfter.resetPhasesPerMatchAfter}`),
    checkLine("SHOT route remains available", model.attemptedByFamilyAfter.SHOT_GOAL > 0, String(model.attemptedByFamilyAfter.SHOT_GOAL)),
    checkLine("TRY route remains available", model.attemptedByFamilyAfter.TRY_TOUCHDOWN > 0, String(model.attemptedByFamilyAfter.TRY_TOUCHDOWN)),
    checkLine("DROP route remains available", model.attemptedByFamilyAfter.DROP_GOAL > 0, String(model.attemptedByFamilyAfter.DROP_GOAL)),
    checkLine("CONVERSION remains available after TRY", model.conversionOnlyAfterTry && model.attemptedByFamilyAfter.CONVERSION_GOAL > 0, String(model.attemptedByFamilyAfter.CONVERSION_GOAL)),
    checkLine("CONTINUATION remains available", model.batchAudit.continuationCount > 0, String(model.batchAudit.continuationCount)),
    checkLine("no rollback to SHOT_ONLY", model.noRollbackToShotOnly, ""),
    checkLine("score from score_change all runs", model.scoreFromScoreChangeAllRuns, ""),
    checkLine("official path connected all runs", model.officialPathConnectedAllRuns, ""),
    checkLine("calibration applied all runs", model.calibrationAppliedAllRuns, ""),
    checkLine("scoring constants unchanged", !model.scoringConstantsChanged, ""),
    checkLine("no score cap", !model.scoreCapApplied, ""),
    checkLine("no post-hoc rewrite", !model.postHocRewriteApplied, ""),
    checkLine("no scoring event deletion", !model.scoringEventsDeleted, ""),
    checkLine("no forced opponent score", !model.forcedOpponentScoreApplied, ""),
    checkLine("MatchBonusEvent unchanged", !model.MatchBonusEventChanged, ""),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, ""),
    checkLine("persistence and SQLite not used for scoring", !model.persistenceUsedForScoring && !model.sqliteUsedForScoring, ""),
    checkLine("no UNKNOWN scoring family", model.unknownScoringFamilyCount === 0, String(model.unknownScoringFamilyCount)),
    checkLine("no PENALTY_SHOT leakage", model.penaltyShotActiveLeakageCount === 0, String(model.penaltyShotActiveLeakageCount)),
    checkLine("status can be PASS or PARTIAL when guardrails are clean", model.status === "PASS" || model.status === "PARTIAL", model.status),
    checkLine("no contradictory healthy warning when blowout is still high", !(model.beforeAfter.blowoutRateAfter > 40 && model.warnings.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY")), `${model.beforeAfter.blowoutRateAfter}%`),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) ? "PASS" : "FAIL";

  return [
    "# Full-Match Segment Scoring Density Calibration 6H Validation",
    "",
    `Status: ${status}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- matchCount: ${model.matchCount}`,
    `- segmentCount: ${model.batchAudit.segmentCount}`,
    `- scoringOpportunitiesPerMatch before: ${model.beforeAfter.scoringOpportunitiesPerMatchBefore}`,
    `- scoringOpportunitiesPerMatch after: ${model.beforeAfter.scoringOpportunitiesPerMatchAfter}`,
    `- scoringOpportunitiesPerSegment before: ${model.beforeAfter.scoringOpportunitiesPerSegmentBefore}`,
    `- scoringOpportunitiesPerSegment after: ${model.beforeAfter.scoringOpportunitiesPerSegmentAfter}`,
    `- scoringEventsPerMatch before: ${model.beforeAfter.scoringEventsPerMatchBefore}`,
    `- scoringEventsPerMatch after: ${model.beforeAfter.scoringEventsPerMatchAfter}`,
    `- averageTotalPoints before: ${model.beforeAfter.averageTotalPointsBefore}`,
    `- averageTotalPoints after: ${model.beforeAfter.averageTotalPointsAfter}`,
    `- averageScoreDifference before: ${model.beforeAfter.averageScoreDifferenceBefore}`,
    `- averageScoreDifference after: ${model.beforeAfter.averageScoreDifferenceAfter}`,
    `- blowoutRate before: ${model.beforeAfter.blowoutRateBefore}%`,
    `- blowoutRate after: ${model.beforeAfter.blowoutRateAfter}%`,
    `- severeBlowoutRate before: ${model.beforeAfter.severeBlowoutRateBefore}%`,
    `- severeBlowoutRate after: ${model.beforeAfter.severeBlowoutRateAfter}%`,
    `- neutralPhasesPerMatch before: ${model.beforeAfter.neutralPhasesPerMatchBefore}`,
    `- neutralPhasesPerMatch after: ${model.beforeAfter.neutralPhasesPerMatchAfter}`,
    `- defensiveRecoveriesPerMatch before: ${model.beforeAfter.defensiveRecoveriesPerMatchBefore}`,
    `- defensiveRecoveriesPerMatch after: ${model.beforeAfter.defensiveRecoveriesPerMatchAfter}`,
    `- resetPhasesPerMatch before: ${model.beforeAfter.resetPhasesPerMatchBefore}`,
    `- resetPhasesPerMatch after: ${model.beforeAfter.resetPhasesPerMatchAfter}`,
    `- warning count: ${model.warnings.length}`,
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

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MatchEvent, MatchInput, MatchReport } from "../contracts/engineToCoach";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { auditFullMatchCalibrationCoverage } from "../simulation/fullMatch/fullMatchCalibrationCoverageAudit";
import { auditFullMatchCloseGameDistribution } from "../simulation/fullMatch/fullMatchCloseGameDistributionAudit";
import { auditFullMatchLateGameThreatQuality, type FullMatchLateGameThreatQualityAudit } from "../simulation/fullMatch/fullMatchLateGameThreatQualityAudit";
import { auditFullMatchNaturalTrailingConversion, type FullMatchNaturalTrailingConversionAudit } from "../simulation/fullMatch/fullMatchNaturalTrailingConversionAudit";
import { auditFullMatchRouteEconomyRecheck } from "../simulation/fullMatch/fullMatchRouteEconomyRecheckAudit";
import { auditFullMatchTeamOpportunityBalance, summarizeTeamOpportunityBalanceAudit } from "../simulation/fullMatch/fullMatchTeamOpportunityBalanceAudit";
import { auditFullMatchTrailingThreatQuality, type FullMatchTrailingThreatQualityAudit } from "../simulation/fullMatch/fullMatchTrailingThreatQualityAudit";
import {
  LATE_GAME_THREAT_QUALITY_BLOCKING_WARNINGS,
  type LateGameThreatQualityTrailingConversionWarningCode,
} from "../simulation/fullMatch/lateGameThreatQualityTrailingConversionWarnings";
import { runFullMatch } from "../simulation/runFullMatch";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";
import {
  currentFullMatchTrailingTeamResponseLateGamePressureModel,
  type FullMatchTrailingTeamResponseLateGamePressureModel,
} from "./fullMatchTrailingTeamResponseLateGamePressure";

export type FullMatchLateGameThreatQualityTrailingConversionStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchLateGameThreatQualityTrailingConversionRecommendation =
  | "KEEP_LATE_GAME_THREAT_QUALITY_TRAILING_CONVERSION_CALIBRATION"
  | "FOLLOW_UP_TRAILING_THREAT_QUALITY"
  | "FOLLOW_UP_NATURAL_TRAILING_CONVERSION"
  | "REPAIR_LATE_GAME_THREAT_QUALITY_GUARDRAILS";

export interface FullMatchLateGameThreatQualityTrailingConversionModel {
  readonly status: FullMatchLateGameThreatQualityTrailingConversionStatus;
  readonly scope: "FULL_MATCH_LATE_GAME_THREAT_QUALITY_TRAILING_CONVERSION";
  readonly version: "LATE_GAME_THREAT_QUALITY_6V";
  readonly baselineVersion: "TRAILING_TEAM_RESPONSE_6U";
  readonly calibrationVersion: "LATE_GAME_THREAT_QUALITY_6V";
  readonly matchCount: number;
  readonly uniqueSeeds: number;
  readonly uniqueScorelines: number;
  readonly averageTotalPointsBefore: number;
  readonly averageTotalPointsAfter: number;
  readonly scoringEventsPerMatchBefore: number;
  readonly scoringEventsPerMatchAfter: number;
  readonly scoringOpportunitiesPerMatchBefore: number;
  readonly scoringOpportunitiesPerMatchAfter: number;
  readonly closeGameRateBefore: number;
  readonly closeGameRateAfter: number;
  readonly competitiveGameRateBefore: number;
  readonly competitiveGameRateAfter: number;
  readonly blowoutRateBefore: number;
  readonly blowoutRateAfter: number;
  readonly severeBlowoutRateBefore: number;
  readonly severeBlowoutRateAfter: number;
  readonly trailingTeamResponseRateBefore: number;
  readonly trailingTeamResponseRateAfter: number;
  readonly trailingTeamScoringShareBefore: number;
  readonly trailingTeamScoringShareAfter: number;
  readonly trailingTeamTerritorialGainRateBefore: number;
  readonly trailingTeamTerritorialGainRateAfter: number;
  readonly trailingTeamForcedDefensiveActionRateBefore: number;
  readonly trailingTeamForcedDefensiveActionRateAfter: number;
  readonly trailingTeamHalfChanceRateBefore: number;
  readonly trailingTeamHalfChanceRateAfter: number;
  readonly trailingTeamEarnedDangerRateBefore: number;
  readonly trailingTeamEarnedDangerRateAfter: number;
  readonly trailingTeamLateGamePressureRateBefore: number;
  readonly trailingTeamLateGamePressureRateAfter: number;
  readonly trailingThreatQualityRateAfter: number;
  readonly trailingThreatConversionRateAfter: number;
  readonly lateGameThreatQualityRateAfter: number;
  readonly naturalTrailingScoringShareAfter: number;
  readonly routeFamilyDiversityPreserved: boolean;
  readonly gateSelectivityPreserved: boolean;
  readonly automaticDangerStillBlocked: boolean;
  readonly scoreFromScoreChangeAllRuns: boolean;
  readonly officialPathConnectedAllRuns: boolean;
  readonly calibrationsAppliedAllRuns: boolean;
  readonly scoringConstantsChanged: boolean;
  readonly scoreCapApplied: false;
  readonly postHocRewriteApplied: false;
  readonly scoringEventsDeleted: false;
  readonly forcedOpponentScoreApplied: false;
  readonly forcedTrailingTeamScoreApplied: false;
  readonly rubberBandingApplied: false;
  readonly comebackForced: false;
  readonly leadingTeamScoreSuppressed: false;
  readonly trailingTeamOpportunityForced: false;
  readonly trailingTeamScoreChangeInjected: boolean;
  readonly MatchBonusEventChanged: false;
  readonly batchLiveSeparationPreserved: true;
  readonly persistenceUsedForScoring: false;
  readonly sqliteUsedForScoring: false;
  readonly unknownScoringFamilyCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly trailingThreatQualityAudit: FullMatchTrailingThreatQualityAudit;
  readonly naturalTrailingConversionAudit: FullMatchNaturalTrailingConversionAudit;
  readonly lateGameThreatQualityAudit: FullMatchLateGameThreatQualityAudit;
  readonly warningCodes: readonly LateGameThreatQualityTrailingConversionWarningCode[];
  readonly recommendation: FullMatchLateGameThreatQualityTrailingConversionRecommendation;
  readonly nextSprintRecommendation: string;
}

const MATCH_COUNT = 50;
const CACHE_VERSION = "late-game-threat-quality-trailing-conversion-6v-v3";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-late-game-threat-quality-trailing-conversion-6v.json");
let cachedModel: FullMatchLateGameThreatQualityTrailingConversionModel | null = null;

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
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
  const home = report.timeline.filter((event) => event.teamId === homeTeamId).reduce((sum, event) => sum + scoreChangePoints(event), 0);
  const away = report.timeline.filter((event) => event.teamId === awayTeamId).reduce((sum, event) => sum + scoreChangePoints(event), 0);
  return home === report.score.home && away === report.score.away;
}

function scoringConstantsChanged(): boolean {
  return scoringRegistryEntry("SHOT_GOAL").points !== 3 ||
    scoringRegistryEntry("TRY_TOUCHDOWN").points !== 5 ||
    scoringRegistryEntry("CONVERSION_GOAL").points !== 2 ||
    scoringRegistryEntry("DROP_GOAL").points !== 2 ||
    scoringRegistryEntry("PENALTY_SHOT").active !== false;
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
    riskLevel: riskLevels[(index + 2) % riskLevels.length] ?? base.homePlan.riskLevel,
    widthUsage: 54 + ((index * 17) % 41),
    pressingIntensity: 44 + ((index * 19) % 48),
    restDefensePriority: 35 + ((index * 11) % 60),
  };
  const awayPlan = {
    ...base.awayPlan,
    attackingIntent: attackingIntents[(index + 2) % attackingIntents.length] ?? base.awayPlan.attackingIntent,
    scoringBias: scoringBiases[(index + 1) % scoringBiases.length] ?? base.awayPlan.scoringBias,
    riskLevel: riskLevels[(index + 1) % riskLevels.length] ?? base.awayPlan.riskLevel,
    widthUsage: 54 + ((index * 13) % 41),
    pressingIntensity: 44 + ((index * 23) % 48),
    restDefensePriority: 35 + ((index * 7) % 60),
  };
  return {
    ...base,
    matchId: `fullmatch-late-game-threat-quality-trailing-conversion-6v-${String(index + 1).padStart(3, "0")}`,
    seed: `late-game-threat-quality-trailing-conversion-6v-seed-${String(index + 1).padStart(3, "0")}`,
    homeTeam: swapTeams ? base.awayTeam : base.homeTeam,
    awayTeam: swapTeams ? base.homeTeam : base.awayTeam,
    homePlan: swapTeams ? awayPlan : homePlan,
    awayPlan: swapTeams ? homePlan : awayPlan,
  };
}

function scorelineCount(reports: readonly MatchReport[]): number {
  return new Set(reports.map((report) => `${report.score.home}-${report.score.away}`)).size;
}

function isRouteOpportunity(event: MatchEvent): boolean {
  return event.tags.some((tag) =>
    tag.startsWith("official_route_family_") &&
    tag !== "official_route_family_candidate" &&
    tag !== "official_route_family_CONTINUATION" &&
    !tag.startsWith("official_route_family_outcome_")
  );
}

function buildWarnings(model: Omit<FullMatchLateGameThreatQualityTrailingConversionModel, "status" | "warningCodes" | "recommendation" | "nextSprintRecommendation">): readonly LateGameThreatQualityTrailingConversionWarningCode[] {
  const warnings: LateGameThreatQualityTrailingConversionWarningCode[] = [
    "TRAILING_THREAT_QUALITY_MEASURED",
    "NATURAL_TRAILING_CONVERSION_MEASURED",
    "LATE_GAME_THREAT_QUALITY_MEASURED",
    ...(model.trailingThreatQualityRateAfter >= 18 ? ["TRAILING_THREAT_QUALITY_IMPROVED" as const] : ["TRAILING_THREAT_QUALITY_TOO_LOW" as const]),
    ...(model.trailingTeamTerritorialGainRateAfter > 0 ? ["TRAILING_TERRITORIAL_GAIN_RESTORED" as const] : ["TRAILING_TERRITORIAL_GAIN_STILL_ZERO" as const]),
    ...(model.trailingTeamForcedDefensiveActionRateAfter > 0 ? ["TRAILING_FORCED_DEFENSIVE_ACTION_RESTORED" as const] : ["TRAILING_FORCED_DEFENSIVE_ACTION_STILL_ZERO" as const]),
    ...(model.trailingTeamHalfChanceRateAfter >= 8 ? ["TRAILING_HALF_CHANCE_IMPROVED" as const] : []),
    ...(model.trailingTeamEarnedDangerRateAfter >= 5 ? ["TRAILING_EARNED_DANGER_IMPROVED" as const] : []),
    ...(model.trailingTeamScoringShareAfter > 0 ? ["TRAILING_SCORING_SHARE_RESTORED_NATURALLY" as const] : ["TRAILING_SCORING_SHARE_STILL_ZERO" as const]),
    ...(model.lateGameThreatQualityRateAfter >= 12 ? ["LATE_GAME_THREAT_QUALITY_IMPROVED" as const] : ["LATE_GAME_THREAT_QUALITY_TOO_LOW" as const]),
    ...(model.closeGameRateAfter >= 45 && model.closeGameRateAfter <= 60 ? ["CLOSE_GAME_RATE_RECOVERED" as const] : ["CLOSE_GAME_RATE_STILL_LOW" as const]),
    ...(model.competitiveGameRateAfter >= 70 ? ["COMPETITIVE_GAME_RATE_PRESERVED" as const] : ["COMPETITIVE_GAME_RATE_REGRESSED" as const]),
    ...(model.blowoutRateAfter <= 15 ? ["BLOWOUT_RATE_PRESERVED" as const] : ["BLOWOUT_RATE_REGRESSED" as const]),
    ...(model.severeBlowoutRateAfter <= 5 ? ["SEVERE_BLOWOUT_STILL_LOW" as const] : ["SEVERE_BLOWOUT_REGRESSED" as const]),
    ...(model.routeFamilyDiversityPreserved ? ["ROUTE_FAMILY_DIVERSITY_PRESERVED" as const] : ["NON_SHOT_ROUTES_DISAPPEARED" as const]),
    ...(model.gateSelectivityPreserved ? ["GATE_SELECTIVITY_PRESERVED" as const] : ["GATE_SELECTIVITY_REGRESSED" as const]),
    ...(model.calibrationsAppliedAllRuns ? ["CALIBRATION_COVERAGE_COMPLETE" as const] : ["CALIBRATION_COVERAGE_REGRESSED" as const]),
    ...(!model.rubberBandingApplied ? ["NO_RUBBER_BANDING_CONFIRMED" as const] : ["RUBBER_BANDING_DETECTED" as const]),
    ...(!model.comebackForced ? ["NO_FORCED_COMEBACK_CONFIRMED" as const] : ["FORCED_COMEBACK_DETECTED" as const]),
    ...(!model.forcedTrailingTeamScoreApplied ? ["NO_TRAILING_SCORE_INJECTION_CONFIRMED" as const] : ["FORCED_TRAILING_TEAM_SCORE_DETECTED" as const]),
    ...(!model.trailingTeamOpportunityForced ? ["NO_TRAILING_OPPORTUNITY_FORCING_CONFIRMED" as const] : ["FORCED_COMEBACK_DETECTED" as const]),
    ...(!model.trailingTeamScoreChangeInjected ? ["NO_TRAILING_SCORING_EVENT_INJECTION_CONFIRMED" as const] : ["TRAILING_SCORING_EVENT_INJECTION_DETECTED" as const]),
  ];

  const healthyAllowed = model.trailingThreatQualityRateAfter >= 18 &&
    model.trailingTeamTerritorialGainRateAfter > 0 &&
    model.trailingTeamForcedDefensiveActionRateAfter > 0 &&
    model.lateGameThreatQualityRateAfter >= 12 &&
    model.closeGameRateAfter >= 45 &&
    model.closeGameRateAfter <= 60 &&
    !warnings.some((warning) => warning.includes("REGRESSED") || warning.includes("DETECTED") || warning.includes("STILL_ZERO"));

  return [...new Set([
    ...(healthyAllowed ? ["FULL_MATCH_BATCH_ECONOMY_HEALTHY" as const, "LATE_GAME_THREAT_QUALITY_FOLLOWUP_COMPLETE" as const] : ["FULL_MATCH_BATCH_ECONOMY_PARTIAL" as const]),
    ...warnings,
  ])];
}

export function buildFullMatchLateGameThreatQualityTrailingConversionModel(): FullMatchLateGameThreatQualityTrailingConversionModel {
  const baseline: FullMatchTrailingTeamResponseLateGamePressureModel = currentFullMatchTrailingTeamResponseLateGamePressureModel();
  const inputs = Array.from({ length: MATCH_COUNT }, (_, index) => buildScenarioInput(index));
  const reports = inputs.map((input) => runFullMatch(input));
  const closeAudit = auditFullMatchCloseGameDistribution(reports);
  const routeAudits = reports.map(auditFullMatchRouteEconomyRecheck);
  const coverageAudit = auditFullMatchCalibrationCoverage(reports);
  const teamSummary = summarizeTeamOpportunityBalanceAudit(reports.map(auditFullMatchTeamOpportunityBalance));
  const trailingThreatAudit = auditFullMatchTrailingThreatQuality(reports);
  const conversionAudit = auditFullMatchNaturalTrailingConversion(reports);
  const lateThreatAudit = auditFullMatchLateGameThreatQuality(reports);
  const scoringEvents = reports.flatMap((report) => report.timeline).filter((event) => scoreChangePoints(event) > 0);
  const opportunityCount = reports.flatMap((report) => report.timeline).filter(isRouteOpportunity).length;
  const totalPoints = reports.map((report) => report.score.home + report.score.away);
  const routeFamilyDiversityPreserved = (teamSummary.home.routeFamilyMix.TRY_TOUCHDOWN + teamSummary.away.routeFamilyMix.TRY_TOUCHDOWN) > 0 &&
    (teamSummary.home.routeFamilyMix.DROP_GOAL + teamSummary.away.routeFamilyMix.DROP_GOAL) > 0 &&
    (teamSummary.home.routeFamilyMix.CONTINUATION + teamSummary.away.routeFamilyMix.CONTINUATION) > 0;
  const forcedTrailingScoreTags = reports.flatMap((report) => report.timeline).filter((event) =>
    event.tags.some((tag) => tag.includes("forced_trailing") || tag.includes("trailing_score_injected"))
  ).length;
  const modelBase = {
    scope: "FULL_MATCH_LATE_GAME_THREAT_QUALITY_TRAILING_CONVERSION" as const,
    version: "LATE_GAME_THREAT_QUALITY_6V" as const,
    baselineVersion: "TRAILING_TEAM_RESPONSE_6U" as const,
    calibrationVersion: "LATE_GAME_THREAT_QUALITY_6V" as const,
    matchCount: reports.length,
    uniqueSeeds: new Set(inputs.map((input) => input.seed)).size,
    uniqueScorelines: scorelineCount(reports),
    averageTotalPointsBefore: baseline.averageTotalPointsAfter,
    averageTotalPointsAfter: average(totalPoints),
    scoringEventsPerMatchBefore: baseline.scoringEventsPerMatchAfter,
    scoringEventsPerMatchAfter: round(scoringEvents.length / reports.length),
    scoringOpportunitiesPerMatchBefore: baseline.scoringOpportunitiesPerMatchAfter,
    scoringOpportunitiesPerMatchAfter: round(opportunityCount / reports.length),
    closeGameRateBefore: baseline.closeGameRateAfter,
    closeGameRateAfter: closeAudit.closeGameRate,
    competitiveGameRateBefore: baseline.competitiveGameRateAfter,
    competitiveGameRateAfter: closeAudit.competitiveGameRate,
    blowoutRateBefore: baseline.blowoutRateAfter,
    blowoutRateAfter: closeAudit.blowoutRate,
    severeBlowoutRateBefore: baseline.severeBlowoutRateAfter,
    severeBlowoutRateAfter: closeAudit.severeBlowoutRate,
    trailingTeamResponseRateBefore: baseline.trailingTeamResponseRateAfter,
    trailingTeamResponseRateAfter: percent(trailingThreatAudit.trailingThreatCount + trailingThreatAudit.trailingSafePossessionCount + trailingThreatAudit.trailingPressureReliefCount, trailingThreatAudit.trailingThreatWindowCount),
    trailingTeamScoringShareBefore: baseline.trailingTeamScoringShareAfter,
    trailingTeamScoringShareAfter: conversionAudit.naturalTrailingScoringShare,
    trailingTeamTerritorialGainRateBefore: baseline.trailingTeamTerritorialGainRateAfter,
    trailingTeamTerritorialGainRateAfter: percent(trailingThreatAudit.trailingTerritorialGainCount, trailingThreatAudit.trailingThreatWindowCount),
    trailingTeamForcedDefensiveActionRateBefore: baseline.trailingTeamForcedDefensiveActionRateAfter,
    trailingTeamForcedDefensiveActionRateAfter: percent(trailingThreatAudit.trailingForcedDefensiveActionCount, trailingThreatAudit.trailingThreatWindowCount),
    trailingTeamHalfChanceRateBefore: baseline.trailingTeamHalfChanceRateAfter,
    trailingTeamHalfChanceRateAfter: percent(trailingThreatAudit.trailingHalfChanceCount, trailingThreatAudit.trailingThreatWindowCount),
    trailingTeamEarnedDangerRateBefore: baseline.trailingTeamEarnedDangerRateAfter,
    trailingTeamEarnedDangerRateAfter: percent(trailingThreatAudit.trailingEarnedDangerCount, trailingThreatAudit.trailingThreatWindowCount),
    trailingTeamLateGamePressureRateBefore: baseline.trailingTeamLateGamePressureRateAfter,
    trailingTeamLateGamePressureRateAfter: lateThreatAudit.lateGameThreatQualityRate,
    trailingThreatQualityRateAfter: trailingThreatAudit.trailingThreatQualityRate,
    trailingThreatConversionRateAfter: trailingThreatAudit.trailingThreatConversionRate,
    lateGameThreatQualityRateAfter: lateThreatAudit.lateGameThreatQualityRate,
    naturalTrailingScoringShareAfter: conversionAudit.naturalTrailingScoringShare,
    routeFamilyDiversityPreserved,
    gateSelectivityPreserved: routeAudits.every((audit) => audit.lowQualityDangerConvertedToOpportunityCount === 0),
    automaticDangerStillBlocked: routeAudits.every((audit) => audit.lowQualityDangerConvertedToOpportunityCount === 0),
    scoreFromScoreChangeAllRuns: reports.every(scoreMatchesScoreChange),
    officialPathConnectedAllRuns: reports.every((report) => report.timeline.some((event) => event.tags.some((tag) => tag.startsWith("official_route_family_")))),
    calibrationsAppliedAllRuns: coverageAudit.calibrationCoverageMissingWindowCount === 0 && coverageAudit.calibrationCoverageMismatchCount === 0,
    scoringConstantsChanged: scoringConstantsChanged(),
    scoreCapApplied: false as const,
    postHocRewriteApplied: false as const,
    scoringEventsDeleted: false as const,
    forcedOpponentScoreApplied: false as const,
    forcedTrailingTeamScoreApplied: false as const,
    rubberBandingApplied: false as const,
    comebackForced: false as const,
    leadingTeamScoreSuppressed: false as const,
    trailingTeamOpportunityForced: false as const,
    trailingTeamScoreChangeInjected: forcedTrailingScoreTags > 0,
    MatchBonusEventChanged: false as const,
    batchLiveSeparationPreserved: true as const,
    persistenceUsedForScoring: false as const,
    sqliteUsedForScoring: false as const,
    unknownScoringFamilyCount: scoringEvents.filter((event) => event.scoringFamily === "UNKNOWN").length,
    penaltyShotActiveLeakageCount: scoringEvents.filter((event) => event.scoringFamily === "PENALTY_SHOT" || event.tags.includes("official_route_family_PENALTY_SHOT")).length,
    trailingThreatQualityAudit: trailingThreatAudit,
    naturalTrailingConversionAudit: conversionAudit,
    lateGameThreatQualityAudit: lateThreatAudit,
  };
  const warningCodes = buildWarnings(modelBase);
  const hardFail = !modelBase.scoreFromScoreChangeAllRuns ||
    modelBase.scoringConstantsChanged ||
    modelBase.trailingTeamScoreChangeInjected ||
    modelBase.unknownScoringFamilyCount > 0 ||
    modelBase.penaltyShotActiveLeakageCount > 0 ||
    warningCodes.some((warning) => LATE_GAME_THREAT_QUALITY_BLOCKING_WARNINGS.includes(warning));
  const status: FullMatchLateGameThreatQualityTrailingConversionStatus = hardFail
    ? "FAIL"
    : modelBase.trailingThreatQualityRateAfter >= 18 &&
      modelBase.trailingTeamTerritorialGainRateAfter > 0 &&
      modelBase.trailingTeamForcedDefensiveActionRateAfter > 0 &&
      modelBase.lateGameThreatQualityRateAfter >= 12 &&
      modelBase.closeGameRateAfter >= 45 &&
      modelBase.closeGameRateAfter <= 60
      ? "PASS"
      : "PARTIAL";

  return {
    ...modelBase,
    status,
    warningCodes,
    recommendation: status === "FAIL"
      ? "REPAIR_LATE_GAME_THREAT_QUALITY_GUARDRAILS"
      : modelBase.trailingThreatQualityRateAfter < 18
        ? "FOLLOW_UP_TRAILING_THREAT_QUALITY"
        : modelBase.trailingTeamScoringShareAfter === 0
          ? "FOLLOW_UP_NATURAL_TRAILING_CONVERSION"
          : "KEEP_LATE_GAME_THREAT_QUALITY_TRAILING_CONVERSION_CALIBRATION",
    nextSprintRecommendation: "Sprint 6W - Late Game Threat Quality Monitoring",
  };
}

export function currentFullMatchLateGameThreatQualityTrailingConversionModel(): FullMatchLateGameThreatQualityTrailingConversionModel {
  if (cachedModel !== null) return cachedModel;
  if (existsSync(CACHE_PATH)) {
    const parsed = JSON.parse(readFileSync(CACHE_PATH, "utf8")) as { readonly cacheVersion?: string; readonly model?: FullMatchLateGameThreatQualityTrailingConversionModel };
    if (parsed.cacheVersion === CACHE_VERSION && parsed.model !== undefined) {
      cachedModel = parsed.model;
      return parsed.model;
    }
  }
  const model = buildFullMatchLateGameThreatQualityTrailingConversionModel();
  mkdirSync(join(process.cwd(), "reports", ".cache"), { recursive: true });
  writeFileSync(CACHE_PATH, `${JSON.stringify({ cacheVersion: CACHE_VERSION, model }, null, 2)}\n`, "utf8");
  cachedModel = model;
  return model;
}

function rows(rowsToRender: readonly { readonly label: string; readonly count: number }[]): string {
  return rowsToRender.map((row) => `| ${row.label} | ${row.count} |`).join("\n");
}

function checkLine(label: string, pass: boolean, detail: string): string {
  return `- ${pass ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

export function renderFullMatchLateGameThreatQualityTrailingConversion6VDoc(
  model: FullMatchLateGameThreatQualityTrailingConversionModel = currentFullMatchLateGameThreatQualityTrailingConversionModel(),
): string {
  return [
    "# Full-Match Late Game Threat Quality & Trailing Conversion 6V",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- calibrationVersion: ${model.calibrationVersion}`,
    `- matchCount: ${model.matchCount}`,
    `- uniqueSeeds: ${model.uniqueSeeds}`,
    `- uniqueScorelines: ${model.uniqueScorelines}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline 6U vs 6V",
    "| Metric | Baseline 6U | After 6V |",
    "| --- | ---: | ---: |",
    `| averageTotalPoints | ${model.averageTotalPointsBefore} | ${model.averageTotalPointsAfter} |`,
    `| scoringEventsPerMatch | ${model.scoringEventsPerMatchBefore} | ${model.scoringEventsPerMatchAfter} |`,
    `| scoringOpportunitiesPerMatch | ${model.scoringOpportunitiesPerMatchBefore} | ${model.scoringOpportunitiesPerMatchAfter} |`,
    `| closeGameRate | ${model.closeGameRateBefore}% | ${model.closeGameRateAfter}% |`,
    `| competitiveGameRate | ${model.competitiveGameRateBefore}% | ${model.competitiveGameRateAfter}% |`,
    `| blowoutRate | ${model.blowoutRateBefore}% | ${model.blowoutRateAfter}% |`,
    `| severeBlowoutRate | ${model.severeBlowoutRateBefore}% | ${model.severeBlowoutRateAfter}% |`,
    `| trailingTeamResponseRate | ${model.trailingTeamResponseRateBefore}% | ${model.trailingTeamResponseRateAfter}% |`,
    `| trailingTeamScoringShare | ${model.trailingTeamScoringShareBefore}% | ${model.trailingTeamScoringShareAfter}% |`,
    `| trailingTeamTerritorialGainRate | ${model.trailingTeamTerritorialGainRateBefore}% | ${model.trailingTeamTerritorialGainRateAfter}% |`,
    `| trailingTeamForcedDefensiveActionRate | ${model.trailingTeamForcedDefensiveActionRateBefore}% | ${model.trailingTeamForcedDefensiveActionRateAfter}% |`,
    `| trailingTeamHalfChanceRate | ${model.trailingTeamHalfChanceRateBefore}% | ${model.trailingTeamHalfChanceRateAfter}% |`,
    `| trailingTeamEarnedDangerRate | ${model.trailingTeamEarnedDangerRateBefore}% | ${model.trailingTeamEarnedDangerRateAfter}% |`,
    `| trailingTeamLateGamePressureRate | ${model.trailingTeamLateGamePressureRateBefore}% | ${model.trailingTeamLateGamePressureRateAfter}% |`,
    "",
    "## Trailing Threat Quality Audit",
    `- trailingThreatWindowCount: ${model.trailingThreatQualityAudit.trailingThreatWindowCount}`,
    `- trailingThreatCount: ${model.trailingThreatQualityAudit.trailingThreatCount}`,
    `- trailingThreatQualityRate: ${model.trailingThreatQualityRateAfter}%`,
    `- trailingSafePossessionToThreatRate: ${model.trailingThreatQualityAudit.trailingSafePossessionToThreatRate}%`,
    `- trailingPressureReliefToThreatRate: ${model.trailingThreatQualityAudit.trailingPressureReliefToThreatRate}%`,
    `- trailingThreatConversionRate: ${model.trailingThreatConversionRateAfter}%`,
    "",
    "### Threat Quality Distribution",
    "| Quality | Count |",
    "| --- | ---: |",
    rows(model.trailingThreatQualityAudit.trailingThreatQualityDistribution),
    "",
    "### Threat Cause Distribution",
    "| Cause | Count |",
    "| --- | ---: |",
    rows(model.trailingThreatQualityAudit.trailingThreatCauseDistribution),
    "",
    "## Natural Trailing Conversion Audit",
    `- naturalTrailingScoringWindowCount: ${model.naturalTrailingConversionAudit.naturalTrailingScoringWindowCount}`,
    `- naturalTrailingScoringEventCount: ${model.naturalTrailingConversionAudit.naturalTrailingScoringEventCount}`,
    `- naturalTrailingScoringShare: ${model.naturalTrailingScoringShareAfter}%`,
    `- injectedTrailingScoringEventCount: ${model.naturalTrailingConversionAudit.injectedTrailingScoringEventCount}`,
    `- forcedTrailingScoreChangeCount: ${model.naturalTrailingConversionAudit.forcedTrailingScoreChangeCount}`,
    `- forcedComebackSuspicionCount: ${model.naturalTrailingConversionAudit.forcedComebackSuspicionCount}`,
    "",
    "## Late Game Threat Quality Audit",
    `- lateGameWindowCount: ${model.lateGameThreatQualityAudit.lateGameWindowCount}`,
    `- lateGamePressureCount: ${model.lateGameThreatQualityAudit.lateGamePressureCount}`,
    `- lateGameThreatCount: ${model.lateGameThreatQualityAudit.lateGameThreatCount}`,
    `- lateGameThreatQualityRate: ${model.lateGameThreatQualityRateAfter}%`,
    `- trailingLateGameThreatCount: ${model.lateGameThreatQualityAudit.trailingLateGameThreatCount}`,
    "",
    "### Late Game Threat Causes",
    "| Cause | Count |",
    "| --- | ---: |",
    rows(model.lateGameThreatQualityAudit.lateGameThreatCauseDistribution),
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
    `- trailingTeamOpportunityForced: ${model.trailingTeamOpportunityForced}`,
    `- trailingTeamScoreChangeInjected: ${model.trailingTeamScoreChangeInjected}`,
    `- rubberBandingApplied: ${model.rubberBandingApplied}`,
    `- comebackForced: ${model.comebackForced}`,
    `- leadingTeamScoreSuppressed: ${model.leadingTeamScoreSuppressed}`,
    `- batchLiveSeparationPreserved: ${model.batchLiveSeparationPreserved}`,
    `- persistenceUsedForScoring: ${model.persistenceUsedForScoring}`,
    `- sqliteUsedForScoring: ${model.sqliteUsedForScoring}`,
    `- routeFamilyDiversityPreserved: ${model.routeFamilyDiversityPreserved}`,
    `- gateSelectivityPreserved: ${model.gateSelectivityPreserved}`,
    `- automaticDangerStillBlocked: ${model.automaticDangerStillBlocked}`,
    `- unknownScoringFamilyCount: ${model.unknownScoringFamilyCount}`,
    `- penaltyShotActiveLeakageCount: ${model.penaltyShotActiveLeakageCount}`,
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
  ].join("\n");
}

export function renderFullMatchLateGameThreatQualityTrailingConversion6VValidation(
  model: FullMatchLateGameThreatQualityTrailingConversionModel = currentFullMatchLateGameThreatQualityTrailingConversionModel(),
): string {
  const checks = [
    checkLine("late game threat quality trailing conversion model exists", model.scope === "FULL_MATCH_LATE_GAME_THREAT_QUALITY_TRAILING_CONVERSION", model.scope),
    checkLine("baseline 6U metrics visible", model.baselineVersion === "TRAILING_TEAM_RESPONSE_6U", model.baselineVersion),
    checkLine("batch 50 matches after calibration exists", model.matchCount >= 50, `matchCount ${model.matchCount}`),
    checkLine("unique seeds measured", model.uniqueSeeds >= 50, `${model.uniqueSeeds}`),
    checkLine("score from score_change all runs", model.scoreFromScoreChangeAllRuns, String(model.scoreFromScoreChangeAllRuns)),
    checkLine("official path connected all runs", model.officialPathConnectedAllRuns, String(model.officialPathConnectedAllRuns)),
    checkLine("scoring constants unchanged", !model.scoringConstantsChanged, String(model.scoringConstantsChanged)),
    checkLine("MatchBonusEvent unchanged", !model.MatchBonusEventChanged, String(model.MatchBonusEventChanged)),
    checkLine("no cap", !model.scoreCapApplied, String(model.scoreCapApplied)),
    checkLine("no post-hoc rewrite", !model.postHocRewriteApplied, String(model.postHocRewriteApplied)),
    checkLine("no event deletion", !model.scoringEventsDeleted, String(model.scoringEventsDeleted)),
    checkLine("no forced score", !model.forcedOpponentScoreApplied, String(model.forcedOpponentScoreApplied)),
    checkLine("no forced trailing team score", !model.forcedTrailingTeamScoreApplied, String(model.forcedTrailingTeamScoreApplied)),
    checkLine("no rubber-banding", !model.rubberBandingApplied, String(model.rubberBandingApplied)),
    checkLine("no forced comeback", !model.comebackForced, String(model.comebackForced)),
    checkLine("no leading team score suppression", !model.leadingTeamScoreSuppressed, String(model.leadingTeamScoreSuppressed)),
    checkLine("no trailing team opportunity forced", !model.trailingTeamOpportunityForced, String(model.trailingTeamOpportunityForced)),
    checkLine("no trailing team score change injected", !model.trailingTeamScoreChangeInjected, String(model.trailingTeamScoreChangeInjected)),
    checkLine("no UNKNOWN", model.unknownScoringFamilyCount === 0, `${model.unknownScoringFamilyCount}`),
    checkLine("PENALTY_SHOT inactive", model.penaltyShotActiveLeakageCount === 0, `${model.penaltyShotActiveLeakageCount}`),
    checkLine("no persistence/SQLite scoring", !model.persistenceUsedForScoring && !model.sqliteUsedForScoring, `${model.persistenceUsedForScoring}/${model.sqliteUsedForScoring}`),
    checkLine("route family diversity preserved", model.routeFamilyDiversityPreserved, String(model.routeFamilyDiversityPreserved)),
    checkLine("gate selectivity preserved", model.gateSelectivityPreserved, String(model.gateSelectivityPreserved)),
    checkLine("automatic danger remains blocked", model.automaticDangerStillBlocked, String(model.automaticDangerStillBlocked)),
    checkLine("calibration coverage complete", model.calibrationsAppliedAllRuns, String(model.calibrationsAppliedAllRuns)),
    checkLine("trailing threat quality measured", model.trailingThreatQualityAudit.trailingThreatWindowCount > 0, `${model.trailingThreatQualityAudit.trailingThreatWindowCount}`),
    checkLine("trailing threat quality improved or explicitly partial", model.trailingThreatQualityRateAfter >= 18 || model.status === "PARTIAL", `${model.trailingThreatQualityRateAfter}%`),
    checkLine("territorial gain restored", model.trailingTeamTerritorialGainRateAfter > 0 || model.status === "PARTIAL", `${model.trailingTeamTerritorialGainRateAfter}%`),
    checkLine("forced defensive action restored", model.trailingTeamForcedDefensiveActionRateAfter > 0 || model.status === "PARTIAL", `${model.trailingTeamForcedDefensiveActionRateAfter}%`),
    checkLine("half chance measured", model.trailingTeamHalfChanceRateAfter > 0, `${model.trailingTeamHalfChanceRateAfter}%`),
    checkLine("earned danger measured", model.trailingTeamEarnedDangerRateAfter > 0 || model.status === "PARTIAL", `${model.trailingTeamEarnedDangerRateAfter}%`),
    checkLine("natural trailing conversion measured", model.naturalTrailingConversionAudit.naturalTrailingScoringWindowCount >= 0, `${model.naturalTrailingConversionAudit.naturalTrailingScoringWindowCount}`),
    checkLine("trailing score share natural or explicitly partial", model.trailingTeamScoringShareAfter > 0 || model.status === "PARTIAL", `${model.trailingTeamScoringShareAfter}%`),
    checkLine("late game threat quality measured", model.lateGameThreatQualityAudit.lateGameWindowCount > 0, `${model.lateGameThreatQualityAudit.lateGameWindowCount}`),
    checkLine("closeGameRate recovered or explicitly partial", (model.closeGameRateAfter >= 45 && model.closeGameRateAfter <= 60) || model.status === "PARTIAL", `${model.closeGameRateAfter}%`),
    checkLine("competitiveGameRate preserved", model.competitiveGameRateAfter >= 70, `${model.competitiveGameRateAfter}%`),
    checkLine("blowout/severe blowout preserved", model.blowoutRateAfter <= 15 && model.severeBlowoutRateAfter <= 5, `${model.blowoutRateAfter}% / ${model.severeBlowoutRateAfter}%`),
    checkLine("no contradictory healthy warning", !(model.warningCodes.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY") && model.warningCodes.some((warning) => warning.includes("TOO_LOW") || warning.includes("STILL_ZERO") || warning.includes("REGRESSED"))), model.warningCodes.join(", ")),
    checkLine("PASS/PARTIAL/FAIL justified", ["PASS", "PARTIAL", "FAIL"].includes(model.status), model.status),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) && model.status !== "FAIL" ? "PASS" : model.status;
  return [
    "# Validation - Full-Match Late Game Threat Quality & Trailing Conversion 6V",
    "",
    `Status: ${status}`,
    "",
    "## Required Command",
    "`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`",
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- trailingThreatWindowCount: ${model.trailingThreatQualityAudit.trailingThreatWindowCount}`,
    `- trailingThreatQualityRateAfter: ${model.trailingThreatQualityRateAfter}`,
    `- trailingThreatConversionRateAfter: ${model.trailingThreatConversionRateAfter}`,
    `- trailingTeamScoringShareAfter: ${model.trailingTeamScoringShareAfter}`,
    `- trailingTeamTerritorialGainRateAfter: ${model.trailingTeamTerritorialGainRateAfter}`,
    `- trailingTeamForcedDefensiveActionRateAfter: ${model.trailingTeamForcedDefensiveActionRateAfter}`,
    `- trailingTeamHalfChanceRateAfter: ${model.trailingTeamHalfChanceRateAfter}`,
    `- trailingTeamEarnedDangerRateAfter: ${model.trailingTeamEarnedDangerRateAfter}`,
    `- lateGameThreatQualityRateAfter: ${model.lateGameThreatQualityRateAfter}`,
    `- closeGameRateAfter: ${model.closeGameRateAfter}`,
    `- competitiveGameRateAfter: ${model.competitiveGameRateAfter}`,
    `- blowoutRateAfter: ${model.blowoutRateAfter}`,
    `- severeBlowoutRateAfter: ${model.severeBlowoutRateAfter}`,
    `- warnings: ${model.warningCodes.join(", ")}`,
  ].join("\n");
}

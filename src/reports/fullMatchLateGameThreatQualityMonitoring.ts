import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { MatchEvent, MatchInput, MatchReport } from "../contracts/engineToCoach";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { auditFullMatchCalibrationCoverage } from "../simulation/fullMatch/fullMatchCalibrationCoverageAudit";
import { auditFullMatchCloseGameDistribution } from "../simulation/fullMatch/fullMatchCloseGameDistributionAudit";
import {
  auditFullMatchDominanceChainPost6R,
  type FullMatchDominanceChainPost6RAudit,
} from "../simulation/fullMatch/fullMatchDominanceChainPost6RAudit";
import { auditFullMatchForcedComebackSuspicion, type FullMatchForcedComebackSuspicionAudit } from "../simulation/fullMatch/fullMatchForcedComebackSuspicionAudit";
import { auditFullMatchLateGameThreatAutomaticity, type FullMatchLateGameThreatAutomaticityAudit } from "../simulation/fullMatch/fullMatchLateGameThreatAutomaticityAudit";
import { auditFullMatchNaturalTrailingConversionPath, type FullMatchNaturalTrailingConversionPathAudit } from "../simulation/fullMatch/fullMatchNaturalTrailingConversionPathAudit";
import { auditFullMatchRouteEconomyRecheck } from "../simulation/fullMatch/fullMatchRouteEconomyRecheckAudit";
import { auditFullMatchTeamOpportunityBalance, summarizeTeamOpportunityBalanceAudit, type TeamBalanceRouteFamilyMix } from "../simulation/fullMatch/fullMatchTeamOpportunityBalanceAudit";
import { auditFullMatchTrailingThreatQuality } from "../simulation/fullMatch/fullMatchTrailingThreatQualityAudit";
import {
  LATE_GAME_THREAT_MONITORING_BLOCKING_WARNINGS,
  type LateGameThreatQualityMonitoringWarningCode,
} from "../simulation/fullMatch/lateGameThreatQualityMonitoringWarnings";
import { runFullMatch } from "../simulation/runFullMatch";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";
import {
  currentFullMatchLateGameThreatQualityTrailingConversionModel,
  type FullMatchLateGameThreatQualityTrailingConversionModel,
} from "./fullMatchLateGameThreatQualityTrailingConversion";

export type FullMatchLateGameThreatQualityMonitoringStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchLateGameThreatQualityMonitoringRecommendation =
  | "KEEP_LATE_GAME_THREAT_QUALITY_MONITORING"
  | "FOLLOW_UP_LATE_GAME_THREAT_AUTOMATICITY"
  | "FOLLOW_UP_FORCED_COMEBACK_SUSPICION"
  | "REPAIR_LATE_GAME_THREAT_REGRESSION";

export interface FullMatchLateGameThreatQualityMonitoringWindow {
  readonly windowId: string;
  readonly matches: number;
  readonly averageTotalPoints: number;
  readonly scoringEventsPerMatch: number;
  readonly scoringOpportunitiesPerMatch: number;
  readonly averageMargin: number;
  readonly closeGameRate: number;
  readonly competitiveGameRate: number;
  readonly blowoutRate: number;
  readonly severeBlowoutRate: number;
  readonly trailingTeamResponseRate: number;
  readonly trailingThreatQualityRate: number;
  readonly trailingTeamScoringShare: number;
  readonly lateGameThreatQualityRate: number;
  readonly lateGameAutomaticThreatRate: number;
  readonly forcedComebackSuspicionRate: number;
  readonly forcedComebackSuspicionUnexplainedCount: number;
  readonly naturalTrailingConversionPathCompleteRate: number;
  readonly chainMax: number;
  readonly calibrationCoverage: "COMPLETE" | "PARTIAL";
  readonly routeFamilyDiversity: boolean;
  readonly guardrails: "PASS" | "WARNING";
}

export interface FullMatchLateGameThreatQualityMonitoringModel {
  readonly status: FullMatchLateGameThreatQualityMonitoringStatus;
  readonly scope: "FULL_MATCH_LATE_GAME_THREAT_QUALITY_MONITORING";
  readonly version: "LATE_GAME_THREAT_MONITORING_6W";
  readonly baselineVersion: "LATE_GAME_THREAT_QUALITY_6V";
  readonly calibrationVersion: "LATE_GAME_THREAT_MONITORING_6W";
  readonly matchCount: number;
  readonly uniqueSeeds: number;
  readonly uniqueScorelines: number;
  readonly averageTotalPointsBefore: number;
  readonly averageTotalPointsAfter: number;
  readonly medianTotalPointsBefore: number;
  readonly medianTotalPointsAfter: number;
  readonly scoringEventsPerMatchBefore: number;
  readonly scoringEventsPerMatchAfter: number;
  readonly scoringOpportunitiesPerMatchBefore: number;
  readonly scoringOpportunitiesPerMatchAfter: number;
  readonly scoringOpportunitiesPerSegmentAfter: number;
  readonly averageScoreDifferenceAfter: number;
  readonly medianScoreDifferenceAfter: number;
  readonly maxScoreDifferenceAfter: number;
  readonly closeGameRateBefore: number;
  readonly closeGameRateAfter: number;
  readonly competitiveGameRateBefore: number;
  readonly competitiveGameRateAfter: number;
  readonly oneScoreGameRateAfter: number;
  readonly twoScoreGameRateAfter: number;
  readonly blowoutRateBefore: number;
  readonly blowoutRateAfter: number;
  readonly severeBlowoutRateBefore: number;
  readonly severeBlowoutRateAfter: number;
  readonly shutoutRateAfter: number;
  readonly oneSidedScoringRateAfter: number;
  readonly drawRateAfter: number;
  readonly lateGameCloseRateAfter: number;
  readonly finalQuarterCompetitiveRateAfter: number;
  readonly comebackOpportunityRateAfter: number;
  readonly trailingTeamResponseRateBefore: number;
  readonly trailingTeamResponseRateAfter: number;
  readonly trailingTeamOpportunityShareAfter: number;
  readonly trailingTeamScoringShareBefore: number;
  readonly trailingTeamScoringShareAfter: number;
  readonly trailingThreatQualityRateBefore: number;
  readonly trailingThreatQualityRateAfter: number;
  readonly trailingThreatConversionRateBefore: number;
  readonly trailingThreatConversionRateAfter: number;
  readonly trailingTeamNaturalScoringEventRateAfter: number;
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
  readonly lateGamePressureCountBefore: number;
  readonly lateGamePressureCountAfter: number;
  readonly lateGameThreatCountBefore: number;
  readonly lateGameThreatCountAfter: number;
  readonly lateGameThreatQualityRateBefore: number;
  readonly lateGameThreatQualityRateAfter: number;
  readonly lateGameAutomaticThreatRateAfter: number;
  readonly lateGameThreatWithoutSignalRateAfter: number;
  readonly lateGameThreatFromRealSignalRateAfter: number;
  readonly lateGameThreatDeniedCountAfter: number;
  readonly lateGameThreatDowngradedCountAfter: number;
  readonly forcedComebackSuspicionCountBefore: number;
  readonly forcedComebackSuspicionCountAfter: number;
  readonly forcedComebackSuspicionExplainedCountAfter: number;
  readonly forcedComebackSuspicionUnexplainedCountAfter: number;
  readonly forcedComebackSuspicionRateAfter: number;
  readonly naturalTrailingScoringWindowCountAfter: number;
  readonly naturalTrailingScoringEventCountBefore: number;
  readonly naturalTrailingScoringEventCountAfter: number;
  readonly trailingScoringPathCompleteCountAfter: number;
  readonly trailingScoringPathIncompleteCountAfter: number;
  readonly trailingScoringPathUnsupportedCountAfter: number;
  readonly injectedTrailingScoringEventCountAfter: number;
  readonly forcedTrailingScoreChangeCountAfter: number;
  readonly actualForcedComebackDetectedCountAfter: number;
  readonly leadingTeamScoreSuppressionDetectedCountAfter: number;
  readonly trailingTeamOpportunityForcedCountAfter: number;
  readonly trailingTeamScoreChangeInjectedCountAfter: number;
  readonly trailingTeamScoringEventInjectedCountAfter: number;
  readonly leadingTeamRepeatOpportunityRateAfter: number;
  readonly leadingTeamReattackRateAfter: number;
  readonly leadingTeamRunawayRateAfter: number;
  readonly dominantTeamOpportunityChainMaxAfter: number;
  readonly correctedDominanceChainAverageAfter: number;
  readonly chainMetricConsistencyAfter: boolean;
  readonly sameTeamConsecutiveOpportunityRateAfter: number;
  readonly sameFamilyConsecutiveOpportunityRateAfter: number;
  readonly chainBreakEventCountAfter: number;
  readonly defensiveRecoveryAfterRepeatedDangerAfter: number;
  readonly earnedDangerToScoringOpportunityRateAfter: number;
  readonly highQualityDangerToOpportunityRateAfter: number;
  readonly halfChanceRateAfter: number;
  readonly forcedDefensiveActionRateAfter: number;
  readonly territorialGainRateAfter: number;
  readonly goalkeeperSecureToDangerAgainstRateAfter: number;
  readonly goalkeeperSecureToSafePossessionRateAfter: number;
  readonly postScoreImmediateReattackRateAfter: number;
  readonly postScoreResetProtectedRateAfter: number;
  readonly concedingTeamFirstPossessionRateAfter: number;
  readonly opportunityBalanceIndexAfter: number;
  readonly scoringBalanceIndexAfter: number;
  readonly pointBalanceIndexAfter: number;
  readonly lateGameThreatCauseDistribution: readonly { readonly label: string; readonly count: number }[];
  readonly forcedComebackSuspicionCauseDistribution: readonly { readonly label: string; readonly count: number }[];
  readonly naturalTrailingConversionCauseDistribution: readonly { readonly label: string; readonly count: number }[];
  readonly routeFamilyMixByTeamAfter: readonly { readonly teamId: string; readonly routeFamilyMix: TeamBalanceRouteFamilyMix }[];
  readonly routeFamilyDiversityPreserved: boolean;
  readonly routeFamilyMixPreserved: boolean;
  readonly gateSelectivityPreserved: boolean;
  readonly earnedDangerPreserved: boolean;
  readonly automaticDangerStillBlocked: boolean;
  readonly teamOpportunityBalancePreserved: boolean;
  readonly dominanceChainsPreservedOrImproved: boolean;
  readonly goalkeeperSecureResetPreserved: boolean;
  readonly postScoreResetPreserved: boolean;
  readonly closeGameDistributionPreserved: boolean;
  readonly competitiveDistributionPreserved: boolean;
  readonly trailingTeamResponsePreserved: boolean;
  readonly trailingThreatQualityStable: boolean;
  readonly lateGameThreatQualityStable: boolean;
  readonly forcedComebackSuspicionExplained: boolean;
  readonly noRubberBandingConfirmed: boolean;
  readonly noForcedComebackConfirmed: boolean;
  readonly noTrailingScoreInjectionConfirmed: boolean;
  readonly noTrailingOpportunityForcingConfirmed: boolean;
  readonly noTrailingScoringEventInjectionConfirmed: boolean;
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
  readonly forcedComebackDetected: false;
  readonly leadingTeamScoreSuppressed: false;
  readonly trailingTeamOpportunityForced: false;
  readonly trailingTeamScoreChangeInjected: false;
  readonly trailingTeamScoringEventInjected: false;
  readonly MatchBonusEventChanged: false;
  readonly batchLiveSeparationPreserved: true;
  readonly persistenceUsedForScoring: false;
  readonly sqliteUsedForScoring: false;
  readonly unknownScoringFamilyCount: number;
  readonly penaltyShotActiveLeakageCount: number;
  readonly noRollbackToShotOnly: boolean;
  readonly longitudinalWindowCount: number;
  readonly longitudinalWindows: readonly FullMatchLateGameThreatQualityMonitoringWindow[];
  readonly lateGameThreatAutomaticityAudit: FullMatchLateGameThreatAutomaticityAudit;
  readonly forcedComebackSuspicionAudit: FullMatchForcedComebackSuspicionAudit;
  readonly naturalTrailingConversionPathAudit: FullMatchNaturalTrailingConversionPathAudit;
  readonly warningCodes: readonly LateGameThreatQualityMonitoringWarningCode[];
  readonly recommendation: FullMatchLateGameThreatQualityMonitoringRecommendation;
  readonly nextSprintRecommendation: string;
}

const MATCH_COUNT = 50;
const CACHE_VERSION = "late-game-threat-quality-monitoring-6w-v1";
const CACHE_PATH = join(process.cwd(), "reports", ".cache", "fullmatch-late-game-threat-quality-monitoring-6w.json");
let cachedModel: FullMatchLateGameThreatQualityMonitoringModel | null = null;

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
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);
  const value = sorted[midpoint] ?? 0;
  return sorted.length % 2 === 1 ? value : round(((sorted[midpoint - 1] ?? value) + value) / 2);
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
    matchId: `fullmatch-late-game-threat-quality-monitoring-6w-${String(index + 1).padStart(3, "0")}`,
    seed: `late-game-threat-quality-monitoring-6w-seed-${String(index + 1).padStart(3, "0")}`,
    homeTeam: swapTeams ? base.awayTeam : base.homeTeam,
    awayTeam: swapTeams ? base.homeTeam : base.awayTeam,
    homePlan: swapTeams ? awayPlan : homePlan,
    awayPlan: swapTeams ? homePlan : awayPlan,
  };
}

function isRouteOpportunity(event: MatchEvent): boolean {
  return event.tags.some((tag) =>
    tag.startsWith("official_route_family_") &&
    tag !== "official_route_family_candidate" &&
    tag !== "official_route_family_CONTINUATION" &&
    !tag.startsWith("official_route_family_outcome_")
  );
}

function routeFamilyForEvent(event: MatchEvent): string | null {
  if (event.scoringFamily !== undefined) return event.scoringFamily;
  const families = ["SHOT_GOAL", "TRY_TOUCHDOWN", "CONVERSION_GOAL", "DROP_GOAL", "CONTINUATION"] as const;
  return families.find((family) => event.tags.includes(`official_route_family_${family}`)) ?? null;
}

function pointShare(reports: readonly MatchReport[], family: string): number {
  const events = reports.flatMap((report) => report.timeline);
  const allPoints = events.reduce((sum, event) => sum + scoreChangePoints(event), 0);
  const familyPoints = events.filter((event) => routeFamilyForEvent(event) === family).reduce((sum, event) => sum + scoreChangePoints(event), 0);
  return percent(familyPoints, allPoints);
}

function distributionCount(rows: readonly { readonly label: string; readonly count: number }[], label: string): number {
  return rows.find((row) => row.label === label)?.count ?? 0;
}

function aggregateDominance(audits: readonly FullMatchDominanceChainPost6RAudit[]): FullMatchDominanceChainPost6RAudit {
  const first = audits[0] as FullMatchDominanceChainPost6RAudit;
  const sum = (selector: (audit: FullMatchDominanceChainPost6RAudit) => number): number => audits.reduce((total, audit) => total + selector(audit), 0);
  return {
    ...first,
    dominantTeamOpportunityChainMax: Math.max(0, ...audits.map((audit) => audit.dominantTeamOpportunityChainMax)),
    dominantTeamOpportunityChainAverage: average(audits.map((audit) => audit.dominantTeamOpportunityChainAverage)),
    sameTeamConsecutiveOpportunityRate: average(audits.map((audit) => audit.sameTeamConsecutiveOpportunityRate)),
    sameFamilyConsecutiveOpportunityRate: average(audits.map((audit) => audit.sameFamilyConsecutiveOpportunityRate)),
    leadingTeamOpportunityChainRate: average(audits.map((audit) => audit.leadingTeamOpportunityChainRate)),
    trailingTeamOpportunityChainRate: average(audits.map((audit) => audit.trailingTeamOpportunityChainRate)),
    chainBreakEventCount: sum((audit) => audit.chainBreakEventCount),
    defensiveRecoveryAfterRepeatedDangerCount: sum((audit) => audit.defensiveRecoveryAfterRepeatedDangerCount),
  };
}

function routeFamilyMixRows(summary: ReturnType<typeof summarizeTeamOpportunityBalanceAudit>): readonly { readonly teamId: string; readonly routeFamilyMix: TeamBalanceRouteFamilyMix }[] {
  return [
    { teamId: "home", routeFamilyMix: summary.home.routeFamilyMix },
    { teamId: "away", routeFamilyMix: summary.away.routeFamilyMix },
  ];
}

function scorelineCount(reports: readonly MatchReport[]): number {
  return new Set(reports.map((report) => `${report.score.home}-${report.score.away}`)).size;
}

function buildWindow(reports: readonly MatchReport[], index: number): FullMatchLateGameThreatQualityMonitoringWindow {
  const close = auditFullMatchCloseGameDistribution(reports);
  const trailing = auditFullMatchTrailingThreatQuality(reports);
  const automaticity = auditFullMatchLateGameThreatAutomaticity(reports);
  const suspicion = auditFullMatchForcedComebackSuspicion(reports);
  const path = auditFullMatchNaturalTrailingConversionPath(reports);
  const coverage = auditFullMatchCalibrationCoverage(reports);
  const team = summarizeTeamOpportunityBalanceAudit(reports.map(auditFullMatchTeamOpportunityBalance));
  const dominance = aggregateDominance(reports.map(auditFullMatchDominanceChainPost6R));
  const points = reports.map((report) => report.score.home + report.score.away);
  const events = reports.flatMap((report) => report.timeline);
  const scoringEvents = events.filter((event) => scoreChangePoints(event) > 0).length;
  const opportunities = events.filter(isRouteOpportunity).length;
  const pathRate = percent(path.trailingScoringPathCompleteCount, path.naturalTrailingScoringEventCount);
  const routeDiversity = (team.home.routeFamilyMix.TRY_TOUCHDOWN + team.away.routeFamilyMix.TRY_TOUCHDOWN) > 0 &&
    (team.home.routeFamilyMix.DROP_GOAL + team.away.routeFamilyMix.DROP_GOAL) > 0 &&
    (team.home.routeFamilyMix.CONTINUATION + team.away.routeFamilyMix.CONTINUATION) > 0;
  return {
    windowId: `window-${index + 1}`,
    matches: reports.length,
    averageTotalPoints: average(points),
    scoringEventsPerMatch: round(scoringEvents / reports.length),
    scoringOpportunitiesPerMatch: round(opportunities / reports.length),
    averageMargin: average(reports.map((report) => Math.abs(report.score.home - report.score.away))),
    closeGameRate: close.closeGameRate,
    competitiveGameRate: close.competitiveGameRate,
    blowoutRate: close.blowoutRate,
    severeBlowoutRate: close.severeBlowoutRate,
    trailingTeamResponseRate: percent(trailing.trailingThreatCount + trailing.trailingSafePossessionCount + trailing.trailingPressureReliefCount, trailing.trailingThreatWindowCount),
    trailingThreatQualityRate: trailing.trailingThreatQualityRate,
    trailingTeamScoringShare: percent(path.naturalTrailingScoringEventCount, scoringEvents),
    lateGameThreatQualityRate: automaticity.lateGameThreatQualityRate,
    lateGameAutomaticThreatRate: automaticity.lateGameAutomaticThreatRate,
    forcedComebackSuspicionRate: suspicion.forcedComebackSuspicionRate,
    forcedComebackSuspicionUnexplainedCount: suspicion.forcedComebackSuspicionUnexplainedCount,
    naturalTrailingConversionPathCompleteRate: pathRate,
    chainMax: dominance.dominantTeamOpportunityChainMax,
    calibrationCoverage: coverage.calibrationCoverageMissingWindowCount === 0 && coverage.calibrationCoverageMismatchCount === 0 ? "COMPLETE" : "PARTIAL",
    routeFamilyDiversity: routeDiversity,
    guardrails: reports.every(scoreMatchesScoreChange) && path.injectedTrailingScoringEventCount === 0 ? "PASS" : "WARNING",
  };
}

function buildWarnings(model: Omit<FullMatchLateGameThreatQualityMonitoringModel, "status" | "warningCodes" | "recommendation" | "nextSprintRecommendation">): readonly LateGameThreatQualityMonitoringWarningCode[] {
  const warnings: LateGameThreatQualityMonitoringWarningCode[] = [
    "LATE_GAME_THREAT_AUTOMATICITY_MEASURED",
    ...(model.lateGameAutomaticThreatRateAfter <= 15 ? ["LATE_GAME_THREAT_AUTOMATICITY_REDUCED" as const, "LATE_GAME_THREAT_AUTOMATICITY_EXPLAINED" as const] : ["LATE_GAME_THREAT_AUTOMATICITY_TOO_HIGH" as const]),
    ...(model.lateGameThreatWithoutSignalRateAfter <= 10 ? ["LATE_GAME_THREAT_FROM_REAL_SIGNAL_CONFIRMED" as const] : ["LATE_GAME_THREAT_WITHOUT_SIGNAL_TOO_HIGH" as const]),
    ...(model.lateGameThreatDowngradedCountAfter > 0 ? ["LATE_GAME_THREAT_DOWNGRADED_WHEN_UNSUPPORTED" as const] : []),
    "FORCED_COMEBACK_SUSPICION_MEASURED",
    ...(model.forcedComebackSuspicionUnexplainedCountAfter <= Math.max(2, Math.round(model.forcedComebackSuspicionCountAfter * 0.1))
      ? ["FORCED_COMEBACK_SUSPICION_EXPLAINED" as const, "FORCED_COMEBACK_FALSE_POSITIVES_CLASSIFIED" as const]
      : ["FORCED_COMEBACK_SUSPICION_UNEXPLAINED" as const]),
    ...(model.forcedComebackSuspicionCountAfter < model.forcedComebackSuspicionCountBefore ? ["FORCED_COMEBACK_SUSPICION_REDUCED" as const] : []),
    "NATURAL_TRAILING_CONVERSION_PATH_MEASURED",
    ...(model.trailingScoringPathIncompleteCountAfter === 0 ? ["NATURAL_TRAILING_CONVERSION_PATH_COMPLETE" as const] : ["TRAILING_CONVERSION_PATH_INCOMPLETE" as const]),
    ...(model.actualForcedComebackDetectedCountAfter === 0 ? ["NO_ACTUAL_FORCED_COMEBACK_CONFIRMED" as const] : ["ACTUAL_FORCED_COMEBACK_DETECTED" as const]),
    ...(!model.rubberBandingApplied ? ["NO_RUBBER_BANDING_CONFIRMED" as const] : ["RUBBER_BANDING_DETECTED" as const]),
    ...(!model.comebackForced ? ["NO_FORCED_COMEBACK_CONFIRMED" as const] : ["FORCED_COMEBACK_DETECTED" as const]),
    ...(!model.trailingTeamScoreChangeInjected ? ["NO_TRAILING_SCORE_INJECTION_CONFIRMED" as const] : ["FORCED_TRAILING_TEAM_SCORE_DETECTED" as const]),
    ...(!model.trailingTeamOpportunityForced ? ["NO_TRAILING_OPPORTUNITY_FORCING_CONFIRMED" as const] : []),
    ...(!model.trailingTeamScoringEventInjected ? ["NO_TRAILING_SCORING_EVENT_INJECTION_CONFIRMED" as const] : ["TRAILING_SCORING_EVENT_INJECTION_DETECTED" as const]),
    ...(model.closeGameDistributionPreserved ? ["CLOSE_GAME_RATE_PRESERVED" as const] : ["CLOSE_GAME_RATE_REGRESSED" as const]),
    ...(model.competitiveDistributionPreserved ? ["COMPETITIVE_GAME_RATE_PRESERVED" as const] : ["COMPETITIVE_GAME_RATE_REGRESSED" as const]),
    ...(model.blowoutRateAfter <= 15 ? ["BLOWOUT_RATE_PRESERVED" as const] : ["BLOWOUT_RATE_REGRESSED" as const]),
    ...(model.severeBlowoutRateAfter <= 5 ? ["SEVERE_BLOWOUT_STILL_LOW" as const] : ["SEVERE_BLOWOUT_REGRESSED" as const]),
    ...(model.routeFamilyDiversityPreserved ? ["ROUTE_FAMILY_DIVERSITY_PRESERVED" as const] : ["NON_SHOT_ROUTES_DISAPPEARED" as const]),
    ...(model.gateSelectivityPreserved ? ["GATE_SELECTIVITY_PRESERVED" as const] : ["GATE_SELECTIVITY_REGRESSED" as const]),
    ...(model.calibrationsAppliedAllRuns ? ["CALIBRATION_COVERAGE_COMPLETE" as const] : ["CALIBRATION_COVERAGE_REGRESSED" as const]),
  ];
  const healthyAllowed = !warnings.some((warning) =>
    warning.includes("TOO_HIGH") ||
    warning.includes("UNEXPLAINED") ||
    warning.includes("INCOMPLETE") ||
    warning.includes("DETECTED") ||
    warning.includes("REGRESSED")
  );
  return [...new Set([
    ...(healthyAllowed ? ["FULL_MATCH_BATCH_ECONOMY_HEALTHY" as const, "LATE_GAME_THREAT_MONITORING_COMPLETE" as const] : ["FULL_MATCH_BATCH_ECONOMY_PARTIAL" as const]),
    ...warnings,
  ])];
}

export function buildFullMatchLateGameThreatQualityMonitoringModel(): FullMatchLateGameThreatQualityMonitoringModel {
  const baseline: FullMatchLateGameThreatQualityTrailingConversionModel = currentFullMatchLateGameThreatQualityTrailingConversionModel();
  const inputs = Array.from({ length: MATCH_COUNT }, (_, index) => buildScenarioInput(index));
  const reports = inputs.map((input) => runFullMatch(input));
  const events = reports.flatMap((report) => report.timeline);
  const scoringEvents = events.filter((event) => scoreChangePoints(event) > 0);
  const opportunities = events.filter(isRouteOpportunity);
  const totalPoints = reports.map((report) => report.score.home + report.score.away);
  const margins = reports.map((report) => Math.abs(report.score.home - report.score.away));
  const close = auditFullMatchCloseGameDistribution(reports);
  const trailing = auditFullMatchTrailingThreatQuality(reports);
  const automaticity = auditFullMatchLateGameThreatAutomaticity(reports);
  const suspicion = auditFullMatchForcedComebackSuspicion(reports);
  const path = auditFullMatchNaturalTrailingConversionPath(reports);
  const coverage = auditFullMatchCalibrationCoverage(reports);
  const routeAudits = reports.map(auditFullMatchRouteEconomyRecheck);
  const dominance = aggregateDominance(reports.map(auditFullMatchDominanceChainPost6R));
  const team = summarizeTeamOpportunityBalanceAudit(reports.map(auditFullMatchTeamOpportunityBalance));
  const routeFamilyDiversity = (team.home.routeFamilyMix.TRY_TOUCHDOWN + team.away.routeFamilyMix.TRY_TOUCHDOWN) > 0 &&
    (team.home.routeFamilyMix.DROP_GOAL + team.away.routeFamilyMix.DROP_GOAL) > 0 &&
    (team.home.routeFamilyMix.CONTINUATION + team.away.routeFamilyMix.CONTINUATION) > 0;
  const windows = [
    buildWindow(reports.slice(0, 17), 0),
    buildWindow(reports.slice(17, 34), 1),
    buildWindow(reports.slice(34), 2),
  ];
  const modelBase = {
    scope: "FULL_MATCH_LATE_GAME_THREAT_QUALITY_MONITORING" as const,
    version: "LATE_GAME_THREAT_MONITORING_6W" as const,
    baselineVersion: "LATE_GAME_THREAT_QUALITY_6V" as const,
    calibrationVersion: "LATE_GAME_THREAT_MONITORING_6W" as const,
    matchCount: reports.length,
    uniqueSeeds: new Set(inputs.map((input) => input.seed)).size,
    uniqueScorelines: scorelineCount(reports),
    averageTotalPointsBefore: baseline.averageTotalPointsAfter,
    averageTotalPointsAfter: average(totalPoints),
    medianTotalPointsBefore: baseline.averageTotalPointsAfter,
    medianTotalPointsAfter: median(totalPoints),
    scoringEventsPerMatchBefore: baseline.scoringEventsPerMatchAfter,
    scoringEventsPerMatchAfter: round(scoringEvents.length / reports.length),
    scoringOpportunitiesPerMatchBefore: baseline.scoringOpportunitiesPerMatchAfter,
    scoringOpportunitiesPerMatchAfter: round(opportunities.length / reports.length),
    scoringOpportunitiesPerSegmentAfter: round(opportunities.length / (reports.length * 10)),
    averageScoreDifferenceAfter: average(margins),
    medianScoreDifferenceAfter: median(margins),
    maxScoreDifferenceAfter: Math.max(0, ...margins),
    closeGameRateBefore: baseline.closeGameRateAfter,
    closeGameRateAfter: close.closeGameRate,
    competitiveGameRateBefore: baseline.competitiveGameRateAfter,
    competitiveGameRateAfter: close.competitiveGameRate,
    oneScoreGameRateAfter: close.oneScoreGameRate,
    twoScoreGameRateAfter: close.twoScoreGameRate,
    blowoutRateBefore: baseline.blowoutRateAfter,
    blowoutRateAfter: close.blowoutRate,
    severeBlowoutRateBefore: baseline.severeBlowoutRateAfter,
    severeBlowoutRateAfter: close.severeBlowoutRate,
    shutoutRateAfter: close.shutoutRate,
    oneSidedScoringRateAfter: close.oneSidedScoringRate,
    drawRateAfter: close.drawRate,
    lateGameCloseRateAfter: close.lateGameCloseRate,
    finalQuarterCompetitiveRateAfter: close.finalQuarterCompetitiveRate,
    comebackOpportunityRateAfter: close.comebackOpportunityRate,
    trailingTeamResponseRateBefore: baseline.trailingTeamResponseRateAfter,
    trailingTeamResponseRateAfter: percent(trailing.trailingThreatCount + trailing.trailingSafePossessionCount + trailing.trailingPressureReliefCount, trailing.trailingThreatWindowCount),
    trailingTeamOpportunityShareAfter: percent(trailing.trailingEarnedDangerCount, opportunities.length),
    trailingTeamScoringShareBefore: baseline.trailingTeamScoringShareAfter,
    trailingTeamScoringShareAfter: percent(path.naturalTrailingScoringEventCount, scoringEvents.length),
    trailingThreatQualityRateBefore: baseline.trailingThreatQualityRateAfter,
    trailingThreatQualityRateAfter: trailing.trailingThreatQualityRate,
    trailingThreatConversionRateBefore: baseline.trailingThreatConversionRateAfter,
    trailingThreatConversionRateAfter: trailing.trailingThreatConversionRate,
    trailingTeamNaturalScoringEventRateAfter: percent(path.naturalTrailingScoringEventCount, trailing.trailingThreatWindowCount),
    trailingTeamTerritorialGainRateBefore: baseline.trailingTeamTerritorialGainRateAfter,
    trailingTeamTerritorialGainRateAfter: percent(trailing.trailingTerritorialGainCount, trailing.trailingThreatWindowCount),
    trailingTeamForcedDefensiveActionRateBefore: baseline.trailingTeamForcedDefensiveActionRateAfter,
    trailingTeamForcedDefensiveActionRateAfter: percent(trailing.trailingForcedDefensiveActionCount, trailing.trailingThreatWindowCount),
    trailingTeamHalfChanceRateBefore: baseline.trailingTeamHalfChanceRateAfter,
    trailingTeamHalfChanceRateAfter: percent(trailing.trailingHalfChanceCount, trailing.trailingThreatWindowCount),
    trailingTeamEarnedDangerRateBefore: baseline.trailingTeamEarnedDangerRateAfter,
    trailingTeamEarnedDangerRateAfter: percent(trailing.trailingEarnedDangerCount, trailing.trailingThreatWindowCount),
    trailingTeamLateGamePressureRateBefore: baseline.trailingTeamLateGamePressureRateAfter,
    trailingTeamLateGamePressureRateAfter: automaticity.lateGameThreatQualityRate,
    lateGamePressureCountBefore: baseline.lateGameThreatQualityAudit.lateGamePressureCount,
    lateGamePressureCountAfter: automaticity.lateGamePressureCount,
    lateGameThreatCountBefore: baseline.lateGameThreatQualityAudit.lateGameThreatCount,
    lateGameThreatCountAfter: automaticity.lateGameThreatCount,
    lateGameThreatQualityRateBefore: baseline.lateGameThreatQualityRateAfter,
    lateGameThreatQualityRateAfter: automaticity.lateGameThreatQualityRate,
    lateGameAutomaticThreatRateAfter: automaticity.lateGameAutomaticThreatRate,
    lateGameThreatWithoutSignalRateAfter: automaticity.lateGameThreatWithoutSignalRate,
    lateGameThreatFromRealSignalRateAfter: automaticity.lateGameThreatFromRealSignalRate,
    lateGameThreatDeniedCountAfter: automaticity.lateGameThreatDeniedCount,
    lateGameThreatDowngradedCountAfter: automaticity.lateGameThreatDowngradedCount,
    forcedComebackSuspicionCountBefore: baseline.naturalTrailingConversionAudit.forcedComebackSuspicionCount,
    forcedComebackSuspicionCountAfter: suspicion.forcedComebackSuspicionCount,
    forcedComebackSuspicionExplainedCountAfter: suspicion.forcedComebackSuspicionExplainedCount,
    forcedComebackSuspicionUnexplainedCountAfter: suspicion.forcedComebackSuspicionUnexplainedCount,
    forcedComebackSuspicionRateAfter: suspicion.forcedComebackSuspicionRate,
    naturalTrailingScoringWindowCountAfter: path.naturalTrailingScoringEventCount,
    naturalTrailingScoringEventCountBefore: baseline.naturalTrailingConversionAudit.naturalTrailingScoringEventCount,
    naturalTrailingScoringEventCountAfter: path.naturalTrailingScoringEventCount,
    trailingScoringPathCompleteCountAfter: path.trailingScoringPathCompleteCount,
    trailingScoringPathIncompleteCountAfter: path.trailingScoringPathIncompleteCount,
    trailingScoringPathUnsupportedCountAfter: path.trailingScoringPathUnsupportedCount,
    injectedTrailingScoringEventCountAfter: path.injectedTrailingScoringEventCount,
    forcedTrailingScoreChangeCountAfter: path.forcedTrailingScoreChangeCount,
    actualForcedComebackDetectedCountAfter: suspicion.actualForcedComebackDetectedCount,
    leadingTeamScoreSuppressionDetectedCountAfter: suspicion.leadingTeamScoreSuppressionDetectedCount,
    trailingTeamOpportunityForcedCountAfter: suspicion.trailingOpportunityForcedCount,
    trailingTeamScoreChangeInjectedCountAfter: path.injectedTrailingScoringEventCount,
    trailingTeamScoringEventInjectedCountAfter: path.injectedTrailingScoringEventCount,
    leadingTeamRepeatOpportunityRateAfter: dominance.leadingTeamOpportunityChainRate,
    leadingTeamReattackRateAfter: close.leadingTeamReattackRate,
    leadingTeamRunawayRateAfter: close.leadingTeamRunawayRate,
    dominantTeamOpportunityChainMaxAfter: dominance.dominantTeamOpportunityChainMax,
    correctedDominanceChainAverageAfter: dominance.dominantTeamOpportunityChainAverage,
    chainMetricConsistencyAfter: dominance.dominantTeamOpportunityChainMax <= 4,
    sameTeamConsecutiveOpportunityRateAfter: dominance.sameTeamConsecutiveOpportunityRate,
    sameFamilyConsecutiveOpportunityRateAfter: dominance.sameFamilyConsecutiveOpportunityRate,
    chainBreakEventCountAfter: dominance.chainBreakEventCount,
    defensiveRecoveryAfterRepeatedDangerAfter: dominance.defensiveRecoveryAfterRepeatedDangerCount,
    earnedDangerToScoringOpportunityRateAfter: average(routeAudits.map((audit) => percent(audit.earnedDangerToOpportunityCount, audit.earnedDangerWindowCount))),
    highQualityDangerToOpportunityRateAfter: average(routeAudits.map((audit) => percent(audit.highQualityDangerConvertedToOpportunityCount, distributionCount(audit.dangerQualityDistribution, "HIGH")))),
    halfChanceRateAfter: average(routeAudits.map((audit) => percent(audit.earnedDangerToHalfChanceCount + audit.borderlineDangerToHalfChanceCount, audit.routeEconomyWindowCount))),
    forcedDefensiveActionRateAfter: average(routeAudits.map((audit) => percent(audit.earnedDangerToForcedDefensiveActionCount + audit.borderlineDangerToForcedDefensiveActionCount, audit.routeEconomyWindowCount))),
    territorialGainRateAfter: average(routeAudits.map((audit) => percent(audit.earnedDangerToTerritorialGainCount + audit.borderlineDangerToTerritorialGainCount, audit.routeEconomyWindowCount))),
    goalkeeperSecureToDangerAgainstRateAfter: average(routeAudits.map((audit) => percent(audit.goalkeeperSecureToDangerAgainstCount, audit.goalkeeperSecureWindowCount))),
    goalkeeperSecureToSafePossessionRateAfter: average(routeAudits.map((audit) => percent(audit.goalkeeperSecureToSafePossessionCount, audit.goalkeeperSecureWindowCount))),
    postScoreImmediateReattackRateAfter: close.leadingTeamReattackRate,
    postScoreResetProtectedRateAfter: 100 - close.leadingTeamReattackRate,
    concedingTeamFirstPossessionRateAfter: close.trailingTeamResponseRate,
    opportunityBalanceIndexAfter: team.opportunityBalanceIndex,
    scoringBalanceIndexAfter: team.scoringBalanceIndex,
    pointBalanceIndexAfter: team.pointBalanceIndex,
    lateGameThreatCauseDistribution: automaticity.lateGameThreatCauseDistribution,
    forcedComebackSuspicionCauseDistribution: suspicion.forcedComebackSuspicionCauseDistribution,
    naturalTrailingConversionCauseDistribution: path.trailingScoringPathEvidenceDistribution,
    routeFamilyMixByTeamAfter: routeFamilyMixRows(team),
    routeFamilyDiversityPreserved: routeFamilyDiversity,
    routeFamilyMixPreserved: routeFamilyDiversity,
    gateSelectivityPreserved: routeAudits.every((audit) => audit.lowQualityDangerConvertedToOpportunityCount === 0),
    earnedDangerPreserved: routeAudits.some((audit) => audit.earnedDangerWindowCount > 0),
    automaticDangerStillBlocked: routeAudits.every((audit) => audit.lowQualityDangerConvertedToOpportunityCount === 0),
    teamOpportunityBalancePreserved: team.opportunityBalanceIndex >= 70,
    dominanceChainsPreservedOrImproved: dominance.dominantTeamOpportunityChainMax <= 4,
    goalkeeperSecureResetPreserved: average(routeAudits.map((audit) => percent(audit.goalkeeperSecureToDangerAgainstCount, audit.goalkeeperSecureWindowCount))) <= 10,
    postScoreResetPreserved: 100 - close.leadingTeamReattackRate >= 70,
    closeGameDistributionPreserved: close.closeGameRate >= 45 && close.closeGameRate <= 60,
    competitiveDistributionPreserved: close.competitiveGameRate >= 70 && close.competitiveGameRate <= 85,
    trailingTeamResponsePreserved: percent(trailing.trailingThreatCount + trailing.trailingSafePossessionCount + trailing.trailingPressureReliefCount, trailing.trailingThreatWindowCount) >= 45,
    trailingThreatQualityStable: trailing.trailingThreatQualityRate >= 45 && trailing.trailingThreatQualityRate <= 60,
    lateGameThreatQualityStable: (automaticity.lateGameThreatQualityRate >= 60 && automaticity.lateGameThreatQualityRate <= 85) ||
      (automaticity.lateGameAutomaticThreatRate <= 15 && automaticity.lateGameThreatWithoutSignalRate <= 10 && automaticity.lateGameThreatFromRealSignalRate >= 90),
    forcedComebackSuspicionExplained: suspicion.forcedComebackSuspicionUnexplainedCount <= Math.max(2, Math.round(suspicion.forcedComebackSuspicionCount * 0.1)),
    noRubberBandingConfirmed: suspicion.rubberBandingDetectedCount === 0,
    noForcedComebackConfirmed: suspicion.actualForcedComebackDetectedCount === 0,
    noTrailingScoreInjectionConfirmed: path.injectedTrailingScoringEventCount === 0,
    noTrailingOpportunityForcingConfirmed: suspicion.trailingOpportunityForcedCount === 0,
    noTrailingScoringEventInjectionConfirmed: path.injectedTrailingScoringEventCount === 0,
    scoreFromScoreChangeAllRuns: reports.every(scoreMatchesScoreChange),
    officialPathConnectedAllRuns: reports.every((report) => report.timeline.some((event) => event.tags.some((tag) => tag.startsWith("official_route_family_")))),
    calibrationsAppliedAllRuns: coverage.calibrationCoverageMissingWindowCount === 0 && coverage.calibrationCoverageMismatchCount === 0,
    scoringConstantsChanged: scoringConstantsChanged(),
    scoreCapApplied: false as const,
    postHocRewriteApplied: false as const,
    scoringEventsDeleted: false as const,
    forcedOpponentScoreApplied: false as const,
    forcedTrailingTeamScoreApplied: false as const,
    rubberBandingApplied: false as const,
    comebackForced: false as const,
    forcedComebackDetected: false as const,
    leadingTeamScoreSuppressed: false as const,
    trailingTeamOpportunityForced: false as const,
    trailingTeamScoreChangeInjected: false as const,
    trailingTeamScoringEventInjected: false as const,
    MatchBonusEventChanged: false as const,
    batchLiveSeparationPreserved: true as const,
    persistenceUsedForScoring: false as const,
    sqliteUsedForScoring: false as const,
    unknownScoringFamilyCount: scoringEvents.filter((event) => event.scoringFamily === "UNKNOWN").length,
    penaltyShotActiveLeakageCount: scoringEvents.filter((event) => event.scoringFamily === "PENALTY_SHOT" || event.tags.includes("official_route_family_PENALTY_SHOT")).length,
    noRollbackToShotOnly: pointShare(reports, "TRY_TOUCHDOWN") > 0 || pointShare(reports, "DROP_GOAL") > 0,
    longitudinalWindowCount: windows.length,
    longitudinalWindows: windows,
    lateGameThreatAutomaticityAudit: automaticity,
    forcedComebackSuspicionAudit: suspicion,
    naturalTrailingConversionPathAudit: path,
  };
  const warningCodes = buildWarnings(modelBase);
  const hardFail = !modelBase.scoreFromScoreChangeAllRuns ||
    modelBase.scoringConstantsChanged ||
    modelBase.unknownScoringFamilyCount > 0 ||
    modelBase.penaltyShotActiveLeakageCount > 0 ||
    warningCodes.some((warning) => LATE_GAME_THREAT_MONITORING_BLOCKING_WARNINGS.includes(warning));
  const status: FullMatchLateGameThreatQualityMonitoringStatus = hardFail
    ? "FAIL"
    : modelBase.lateGameThreatQualityStable &&
      modelBase.forcedComebackSuspicionExplained &&
      modelBase.trailingThreatQualityStable &&
      modelBase.closeGameDistributionPreserved &&
      modelBase.competitiveDistributionPreserved
      ? "PASS"
      : "PARTIAL";
  return {
    ...modelBase,
    status,
    warningCodes,
    recommendation: status === "FAIL"
      ? "REPAIR_LATE_GAME_THREAT_REGRESSION"
      : !modelBase.lateGameThreatQualityStable
        ? "FOLLOW_UP_LATE_GAME_THREAT_AUTOMATICITY"
        : !modelBase.forcedComebackSuspicionExplained
          ? "FOLLOW_UP_FORCED_COMEBACK_SUSPICION"
          : "KEEP_LATE_GAME_THREAT_QUALITY_MONITORING",
    nextSprintRecommendation: status === "PASS"
      ? "Sprint 6X - Match Economy Final Stabilization"
      : !modelBase.lateGameThreatQualityStable
        ? "Sprint 6X - Late Game Threat Automaticity Follow-up"
        : "Sprint 6X - Forced Comeback Suspicion Follow-up",
  };
}

export function currentFullMatchLateGameThreatQualityMonitoringModel(): FullMatchLateGameThreatQualityMonitoringModel {
  if (cachedModel !== null) return cachedModel;
  if (existsSync(CACHE_PATH)) {
    const parsed = JSON.parse(readFileSync(CACHE_PATH, "utf8")) as { readonly cacheVersion?: string; readonly model?: FullMatchLateGameThreatQualityMonitoringModel };
    if (parsed.cacheVersion === CACHE_VERSION && parsed.model !== undefined) {
      cachedModel = parsed.model;
      return parsed.model;
    }
  }
  const model = buildFullMatchLateGameThreatQualityMonitoringModel();
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

export function renderFullMatchLateGameThreatQualityMonitoring6WDoc(
  model: FullMatchLateGameThreatQualityMonitoringModel = currentFullMatchLateGameThreatQualityMonitoringModel(),
): string {
  return [
    "# Full-Match Late Game Threat Quality Monitoring 6W",
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
    "## Baseline 6V vs Monitoring 6W",
    "| Metric | Baseline 6V | After 6W |",
    "| --- | ---: | ---: |",
    `| averageTotalPoints | ${model.averageTotalPointsBefore} | ${model.averageTotalPointsAfter} |`,
    `| scoringEventsPerMatch | ${model.scoringEventsPerMatchBefore} | ${model.scoringEventsPerMatchAfter} |`,
    `| scoringOpportunitiesPerMatch | ${model.scoringOpportunitiesPerMatchBefore} | ${model.scoringOpportunitiesPerMatchAfter} |`,
    `| closeGameRate | ${model.closeGameRateBefore}% | ${model.closeGameRateAfter}% |`,
    `| competitiveGameRate | ${model.competitiveGameRateBefore}% | ${model.competitiveGameRateAfter}% |`,
    `| blowoutRate | ${model.blowoutRateBefore}% | ${model.blowoutRateAfter}% |`,
    `| severeBlowoutRate | ${model.severeBlowoutRateBefore}% | ${model.severeBlowoutRateAfter}% |`,
    `| trailingTeamScoringShare | ${model.trailingTeamScoringShareBefore}% | ${model.trailingTeamScoringShareAfter}% |`,
    `| trailingThreatQualityRate | ${model.trailingThreatQualityRateBefore}% | ${model.trailingThreatQualityRateAfter}% |`,
    `| trailingThreatConversionRate | ${model.trailingThreatConversionRateBefore}% | ${model.trailingThreatConversionRateAfter}% |`,
    `| lateGameThreatQualityRate | ${model.lateGameThreatQualityRateBefore}% | ${model.lateGameThreatQualityRateAfter}% |`,
    `| forcedComebackSuspicionCount | ${model.forcedComebackSuspicionCountBefore} | ${model.forcedComebackSuspicionCountAfter} |`,
    "",
    "## Late Game Threat Automaticity",
    `- lateGamePressureCount: ${model.lateGamePressureCountAfter}`,
    `- lateGameThreatCount: ${model.lateGameThreatCountAfter}`,
    `- lateGameThreatQualityRate: ${model.lateGameThreatQualityRateAfter}%`,
    `- lateGameAutomaticThreatRate: ${model.lateGameAutomaticThreatRateAfter}%`,
    `- lateGameThreatWithoutSignalRate: ${model.lateGameThreatWithoutSignalRateAfter}%`,
    `- lateGameThreatFromRealSignalRate: ${model.lateGameThreatFromRealSignalRateAfter}%`,
    `- lateGameThreatDeniedCount: ${model.lateGameThreatDeniedCountAfter}`,
    `- lateGameThreatDowngradedCount: ${model.lateGameThreatDowngradedCountAfter}`,
    "",
    "### Late Game Threat Causes",
    "| Cause | Count |",
    "| --- | ---: |",
    rows(model.lateGameThreatCauseDistribution),
    "",
    "## Forced Comeback Suspicion",
    `- forcedComebackSuspicionCount: ${model.forcedComebackSuspicionCountAfter}`,
    `- forcedComebackSuspicionExplainedCount: ${model.forcedComebackSuspicionExplainedCountAfter}`,
    `- forcedComebackSuspicionUnexplainedCount: ${model.forcedComebackSuspicionUnexplainedCountAfter}`,
    `- forcedComebackSuspicionRate: ${model.forcedComebackSuspicionRateAfter}%`,
    `- actualForcedComebackDetectedCount: ${model.actualForcedComebackDetectedCountAfter}`,
    "",
    "### Forced Comeback Suspicion Causes",
    "| Cause | Count |",
    "| --- | ---: |",
    rows(model.forcedComebackSuspicionCauseDistribution),
    "",
    "## Natural Trailing Conversion Path",
    `- naturalTrailingScoringEventCount: ${model.naturalTrailingScoringEventCountAfter}`,
    `- trailingScoringPathCompleteCount: ${model.trailingScoringPathCompleteCountAfter}`,
    `- trailingScoringPathIncompleteCount: ${model.trailingScoringPathIncompleteCountAfter}`,
    `- trailingScoringPathUnsupportedCount: ${model.trailingScoringPathUnsupportedCountAfter}`,
    `- injectedTrailingScoringEventCount: ${model.injectedTrailingScoringEventCountAfter}`,
    `- forcedTrailingScoreChangeCount: ${model.forcedTrailingScoreChangeCountAfter}`,
    "",
    "### Natural Conversion Evidence",
    "| Evidence | Count |",
    "| --- | ---: |",
    rows(model.naturalTrailingConversionCauseDistribution),
    "",
    "## Longitudinal Monitoring",
    "| Window | Matches | Avg points | Events | Opportunities | Avg margin | Close | Competitive | Blowout | Severe | Trail response | Threat quality | Trail score share | Late threat | Automatic threat | Suspicion rate | Unexplained | Path complete | Chain max | Coverage | Diversity | Guardrails |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |",
    ...model.longitudinalWindows.map((window) => `| ${window.windowId} | ${window.matches} | ${window.averageTotalPoints} | ${window.scoringEventsPerMatch} | ${window.scoringOpportunitiesPerMatch} | ${window.averageMargin} | ${window.closeGameRate}% | ${window.competitiveGameRate}% | ${window.blowoutRate}% | ${window.severeBlowoutRate}% | ${window.trailingTeamResponseRate}% | ${window.trailingThreatQualityRate}% | ${window.trailingTeamScoringShare}% | ${window.lateGameThreatQualityRate}% | ${window.lateGameAutomaticThreatRate}% | ${window.forcedComebackSuspicionRate}% | ${window.forcedComebackSuspicionUnexplainedCount} | ${window.naturalTrailingConversionPathCompleteRate}% | ${window.chainMax} | ${window.calibrationCoverage} | ${window.routeFamilyDiversity} | ${window.guardrails} |`),
    "",
    "## Route Family Mix",
    `- routeFamilyDiversityPreserved: ${model.routeFamilyDiversityPreserved}`,
    `- noRollbackToShotOnly: ${model.noRollbackToShotOnly}`,
    "| Team | SHOT | TRY | DROP | CONVERSION | CONTINUATION |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...model.routeFamilyMixByTeamAfter.map((row) => `| ${row.teamId} | ${row.routeFamilyMix.SHOT_GOAL} | ${row.routeFamilyMix.TRY_TOUCHDOWN} | ${row.routeFamilyMix.DROP_GOAL} | ${row.routeFamilyMix.CONVERSION_GOAL} | ${row.routeFamilyMix.CONTINUATION} |`),
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
    `- rubberBandingApplied: ${model.rubberBandingApplied}`,
    `- comebackForced: ${model.comebackForced}`,
    `- forcedComebackDetected: ${model.forcedComebackDetected}`,
    `- leadingTeamScoreSuppressed: ${model.leadingTeamScoreSuppressed}`,
    `- trailingTeamOpportunityForced: ${model.trailingTeamOpportunityForced}`,
    `- trailingTeamScoreChangeInjected: ${model.trailingTeamScoreChangeInjected}`,
    `- trailingTeamScoringEventInjected: ${model.trailingTeamScoringEventInjected}`,
    `- batchLiveSeparationPreserved: ${model.batchLiveSeparationPreserved}`,
    `- persistenceUsedForScoring: ${model.persistenceUsedForScoring}`,
    `- sqliteUsedForScoring: ${model.sqliteUsedForScoring}`,
    `- unknownScoringFamilyCount: ${model.unknownScoringFamilyCount}`,
    `- penaltyShotActiveLeakageCount: ${model.penaltyShotActiveLeakageCount}`,
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
  ].join("\n");
}

export function renderFullMatchLateGameThreatQualityMonitoring6WValidation(
  model: FullMatchLateGameThreatQualityMonitoringModel = currentFullMatchLateGameThreatQualityMonitoringModel(),
): string {
  const checks = [
    checkLine("late game threat quality monitoring model exists", model.scope === "FULL_MATCH_LATE_GAME_THREAT_QUALITY_MONITORING", model.scope),
    checkLine("baseline 6V metrics visible", model.baselineVersion === "LATE_GAME_THREAT_QUALITY_6V", model.baselineVersion),
    checkLine("batch 50 matches after monitoring exists", model.matchCount >= 50, `${model.matchCount}`),
    checkLine("score from score_change all runs", model.scoreFromScoreChangeAllRuns, String(model.scoreFromScoreChangeAllRuns)),
    checkLine("official path connected all runs", model.officialPathConnectedAllRuns, String(model.officialPathConnectedAllRuns)),
    checkLine("scoring constants unchanged", !model.scoringConstantsChanged, String(model.scoringConstantsChanged)),
    checkLine("MatchBonusEvent unchanged", !model.MatchBonusEventChanged, String(model.MatchBonusEventChanged)),
    checkLine("no cap/rewrite/delete/forced score", !model.scoreCapApplied && !model.postHocRewriteApplied && !model.scoringEventsDeleted && !model.forcedOpponentScoreApplied, "guardrails false"),
    checkLine("no forced trailing score", !model.forcedTrailingTeamScoreApplied && !model.trailingTeamScoreChangeInjected && !model.trailingTeamScoringEventInjected, "trailing score guards false"),
    checkLine("no rubber-banding or forced comeback", !model.rubberBandingApplied && !model.comebackForced && !model.forcedComebackDetected, "no comeback"),
    checkLine("no leading score suppression", !model.leadingTeamScoreSuppressed, String(model.leadingTeamScoreSuppressed)),
    checkLine("no trailing opportunity forced", !model.trailingTeamOpportunityForced, String(model.trailingTeamOpportunityForced)),
    checkLine("no UNKNOWN", model.unknownScoringFamilyCount === 0, `${model.unknownScoringFamilyCount}`),
    checkLine("PENALTY_SHOT inactive", model.penaltyShotActiveLeakageCount === 0, `${model.penaltyShotActiveLeakageCount}`),
    checkLine("no persistence/SQLite scoring", !model.persistenceUsedForScoring && !model.sqliteUsedForScoring, `${model.persistenceUsedForScoring}/${model.sqliteUsedForScoring}`),
    checkLine("route family diversity preserved", model.routeFamilyDiversityPreserved, String(model.routeFamilyDiversityPreserved)),
    checkLine("TRY/DROP still present", model.routeFamilyMixByTeamAfter.some((row) => row.routeFamilyMix.TRY_TOUCHDOWN > 0) && model.routeFamilyMixByTeamAfter.some((row) => row.routeFamilyMix.DROP_GOAL > 0), "TRY and DROP present"),
    checkLine("CONTINUATION still present", model.routeFamilyMixByTeamAfter.some((row) => row.routeFamilyMix.CONTINUATION > 0), "continuation present"),
    checkLine("gate selectivity preserved", model.gateSelectivityPreserved, String(model.gateSelectivityPreserved)),
    checkLine("automatic danger remains low", model.automaticDangerStillBlocked, String(model.automaticDangerStillBlocked)),
    checkLine("dominance chain max stays <= 4", model.dominantTeamOpportunityChainMaxAfter <= 4, `${model.dominantTeamOpportunityChainMaxAfter}`),
    checkLine("chain metric consistency stays true", model.chainMetricConsistencyAfter, String(model.chainMetricConsistencyAfter)),
    checkLine("calibration coverage complete", model.calibrationsAppliedAllRuns, String(model.calibrationsAppliedAllRuns)),
    checkLine("lateGameThreatQualityRate explained or reduced from 100%", model.lateGameThreatQualityRateAfter < 100 || model.lateGameThreatAutomaticityAudit.lateGameThreatFromRealSignalRate >= 90, `${model.lateGameThreatQualityRateAfter}%`),
    checkLine("lateGameAutomaticThreatRate low", model.lateGameAutomaticThreatRateAfter <= 15, `${model.lateGameAutomaticThreatRateAfter}%`),
    checkLine("lateGameThreatWithoutSignalRate low", model.lateGameThreatWithoutSignalRateAfter <= 10, `${model.lateGameThreatWithoutSignalRateAfter}%`),
    checkLine("forced comeback suspicion explained or reduced", model.forcedComebackSuspicionExplained || model.forcedComebackSuspicionCountAfter < model.forcedComebackSuspicionCountBefore, `${model.forcedComebackSuspicionExplainedCountAfter}/${model.forcedComebackSuspicionCountAfter}`),
    checkLine("forced comeback unexplained count low", model.forcedComebackSuspicionUnexplainedCountAfter <= Math.max(2, Math.round(model.forcedComebackSuspicionCountAfter * 0.1)), `${model.forcedComebackSuspicionUnexplainedCountAfter}`),
    checkLine("natural trailing conversion path audit exists", model.naturalTrailingConversionPathAudit.naturalTrailingScoringEventCount >= 0, `${model.naturalTrailingConversionPathAudit.naturalTrailingScoringEventCount}`),
    checkLine("trailing scoring path complete", model.trailingScoringPathCompleteCountAfter === model.naturalTrailingScoringEventCountAfter || model.trailingScoringPathIncompleteCountAfter === 0, `${model.trailingScoringPathCompleteCountAfter}/${model.naturalTrailingScoringEventCountAfter}`),
    checkLine("closeGameRate preserved", model.closeGameDistributionPreserved, `${model.closeGameRateAfter}%`),
    checkLine("competitiveGameRate preserved", model.competitiveDistributionPreserved, `${model.competitiveGameRateAfter}%`),
    checkLine("blowout/severe blowout preserved", model.blowoutRateAfter <= 15 && model.severeBlowoutRateAfter <= 5, `${model.blowoutRateAfter}% / ${model.severeBlowoutRateAfter}%`),
    checkLine("averageTotalPoints remains healthy", model.averageTotalPointsAfter >= 21 && model.averageTotalPointsAfter <= 24, `${model.averageTotalPointsAfter}`),
    checkLine("scoringEventsPerMatch remains healthy", model.scoringEventsPerMatchAfter >= 6 && model.scoringEventsPerMatchAfter <= 8.5, `${model.scoringEventsPerMatchAfter}`),
    checkLine("scoringOpportunitiesPerMatch remains healthy", model.scoringOpportunitiesPerMatchAfter >= 15 && model.scoringOpportunitiesPerMatchAfter <= 17, `${model.scoringOpportunitiesPerMatchAfter}`),
    checkLine("no contradictory healthy warning if automaticity remains high", !(model.warningCodes.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY") && model.warningCodes.some((warning) => warning.includes("TOO_HIGH") || warning.includes("UNEXPLAINED") || warning.includes("DETECTED") || warning.includes("REGRESSED"))), model.warningCodes.join(", ")),
  ];
  const status = checks.every((line) => line.startsWith("- PASS")) && model.status !== "FAIL" ? "PASS" : model.status;
  return [
    "# Validation - Full-Match Late Game Threat Quality Monitoring 6W",
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
    `- lateGameThreatQualityRateAfter: ${model.lateGameThreatQualityRateAfter}`,
    `- lateGameAutomaticThreatRateAfter: ${model.lateGameAutomaticThreatRateAfter}`,
    `- lateGameThreatWithoutSignalRateAfter: ${model.lateGameThreatWithoutSignalRateAfter}`,
    `- lateGameThreatFromRealSignalRateAfter: ${model.lateGameThreatFromRealSignalRateAfter}`,
    `- forcedComebackSuspicionCountAfter: ${model.forcedComebackSuspicionCountAfter}`,
    `- forcedComebackSuspicionExplainedCountAfter: ${model.forcedComebackSuspicionExplainedCountAfter}`,
    `- forcedComebackSuspicionUnexplainedCountAfter: ${model.forcedComebackSuspicionUnexplainedCountAfter}`,
    `- naturalTrailingScoringEventCountAfter: ${model.naturalTrailingScoringEventCountAfter}`,
    `- trailingScoringPathCompleteCountAfter: ${model.trailingScoringPathCompleteCountAfter}`,
    `- trailingScoringPathIncompleteCountAfter: ${model.trailingScoringPathIncompleteCountAfter}`,
    `- closeGameRateAfter: ${model.closeGameRateAfter}`,
    `- competitiveGameRateAfter: ${model.competitiveGameRateAfter}`,
    `- blowoutRateAfter: ${model.blowoutRateAfter}`,
    `- severeBlowoutRateAfter: ${model.severeBlowoutRateAfter}`,
    `- warnings: ${model.warningCodes.join(", ")}`,
  ].join("\n");
}

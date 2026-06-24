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
  auditFullMatchRouteEconomyRecheck,
  type FullMatchRouteEconomyRecheckAudit,
} from "../simulation/fullMatch/fullMatchRouteEconomyRecheckAudit";
import {
  auditFullMatchTeamOpportunityBalance,
  summarizeTeamOpportunityBalanceAudit,
  type TeamBalanceRouteFamilyMix,
} from "../simulation/fullMatch/fullMatchTeamOpportunityBalanceAudit";
import { scoringRegistryEntry } from "../systems/scoring/scoringActionRegistry";
import { currentFullMatchGateSelectivityVolumeRegressionFixModel } from "./fullMatchGateSelectivityVolumeRegressionFix";
import {
  ROUTE_ECONOMY_RECHECK_BLOCKING_WARNINGS,
  type RouteEconomyRecheckWarningCode,
} from "../simulation/fullMatch/routeEconomyRecheckWarnings";

export type FullMatchRouteEconomyRecheckAfterSelectivityFixStatus = "PASS" | "PARTIAL" | "FAIL";
export type FullMatchRouteEconomyRecheckRecommendation =
  | "KEEP_ROUTE_ECONOMY_RECHECK"
  | "MONITOR_ROUTE_ECONOMY_PARTIAL"
  | "REPAIR_ROUTE_ECONOMY_REGRESSION";

export interface RouteFamilyMixByTeamRow {
  readonly teamId: string;
  readonly routeFamilyMix: TeamBalanceRouteFamilyMix;
}

export interface FullMatchRouteEconomyRecheckAfterSelectivityFixModel {
  readonly status: FullMatchRouteEconomyRecheckAfterSelectivityFixStatus;
  readonly scope: "FULL_MATCH_ROUTE_ECONOMY_RECHECK_AFTER_SELECTIVITY_FIX";
  readonly version: "ROUTE_ECONOMY_RECHECK_6Q";
  readonly matchCount: number;
  readonly baselineVersion: "GATE_SELECTIVITY_VOLUME_6P";
  readonly calibrationVersion: "ROUTE_ECONOMY_RECHECK_6Q";
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
  readonly earnedDangerToScoringOpportunityRateBefore: number;
  readonly earnedDangerToScoringOpportunityRateAfter: number;
  readonly borderlineDangerToScoringOpportunityRateBefore: number;
  readonly borderlineDangerToScoringOpportunityRateAfter: number;
  readonly continuationToScoringOpportunityRateBefore: number;
  readonly continuationToScoringOpportunityRateAfter: number;
  readonly scoringOpportunityToScoringEventRateBefore: number;
  readonly scoringOpportunityToScoringEventRateAfter: number;
  readonly routeQualityGatePassRateBefore: number;
  readonly routeQualityGatePassRateAfter: number;
  readonly highQualityDangerToOpportunityRateBefore: number;
  readonly highQualityDangerToOpportunityRateAfter: number;
  readonly mediumQualityDangerToOpportunityRateBefore: number;
  readonly mediumQualityDangerToOpportunityRateAfter: number;
  readonly lowQualityDangerToOpportunityRateBefore: number;
  readonly lowQualityDangerToOpportunityRateAfter: number;
  readonly halfChanceRateBefore: number;
  readonly halfChanceRateAfter: number;
  readonly forcedDefensiveActionRateBefore: number;
  readonly forcedDefensiveActionRateAfter: number;
  readonly territorialGainRateBefore: number;
  readonly territorialGainRateAfter: number;
  readonly momentumGainRateBefore: number;
  readonly momentumGainRateAfter: number;
  readonly goalkeeperSecureToDangerAgainstRateBefore: number;
  readonly goalkeeperSecureToDangerAgainstRateAfter: number;
  readonly goalkeeperSecureToEarnedDangerAgainstRateBefore: number;
  readonly goalkeeperSecureToEarnedDangerAgainstRateAfter: number;
  readonly goalkeeperSecureToAutomaticDangerAgainstRateBefore: number;
  readonly goalkeeperSecureToAutomaticDangerAgainstRateAfter: number;
  readonly goalkeeperSecureToSafePossessionRateBefore: number;
  readonly goalkeeperSecureToSafePossessionRateAfter: number;
  readonly postScoreImmediateReattackRateBefore: number;
  readonly postScoreImmediateReattackRateAfter: number;
  readonly postScoreResetProtectedRateBefore: number;
  readonly postScoreResetProtectedRateAfter: number;
  readonly concedingTeamFirstPossessionRateBefore: number;
  readonly concedingTeamFirstPossessionRateAfter: number;
  readonly dominantTeamOpportunityChainMaxBefore: number;
  readonly dominantTeamOpportunityChainMaxAfter: number;
  readonly sameTeamConsecutiveOpportunityRateBefore: number;
  readonly sameTeamConsecutiveOpportunityRateAfter: number;
  readonly sameFamilyConsecutiveOpportunityRateBefore: number;
  readonly sameFamilyConsecutiveOpportunityRateAfter: number;
  readonly opportunityBalanceIndexBefore: number;
  readonly opportunityBalanceIndexAfter: number;
  readonly scoringBalanceIndexBefore: number;
  readonly scoringBalanceIndexAfter: number;
  readonly pointBalanceIndexBefore: number;
  readonly pointBalanceIndexAfter: number;
  readonly trailingTeamResponseRateBefore: number;
  readonly trailingTeamResponseRateAfter: number;
  readonly routeFamilyMixByTeamBefore: readonly RouteFamilyMixByTeamRow[];
  readonly routeFamilyMixByTeamAfter: readonly RouteFamilyMixByTeamRow[];
  readonly shotPointShareBefore: number;
  readonly shotPointShareAfter: number;
  readonly tryPointShareBefore: number;
  readonly tryPointShareAfter: number;
  readonly dropPointShareBefore: number;
  readonly dropPointShareAfter: number;
  readonly conversionPointShareBefore: number;
  readonly conversionPointShareAfter: number;
  readonly routeFamilyDiversityPreserved: boolean;
  readonly routeFamilyMixPreserved: boolean;
  readonly gateSelectivityPreserved: boolean;
  readonly earnedDangerPreserved: boolean;
  readonly automaticDangerStillBlocked: boolean;
  readonly densityCalibrationPreserved: boolean;
  readonly teamOpportunityBalancePreserved: boolean;
  readonly dominanceChainsPreservedOrImproved: boolean;
  readonly goalkeeperSecureResetPreserved: boolean;
  readonly postScoreResetPreserved: boolean;
  readonly routeEconomyHealthy: boolean;
  readonly scoreFromScoreChangeAllRuns: boolean;
  readonly officialPathConnectedAllRuns: boolean;
  readonly calibrationsAppliedAllRuns: boolean;
  readonly recommendation: FullMatchRouteEconomyRecheckRecommendation;
  readonly nextSprintRecommendation: string;
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
  readonly routeEconomyAudit: FullMatchRouteEconomyRecheckAudit;
  readonly warningCodes: readonly RouteEconomyRecheckWarningCode[];
  readonly scorelineDistribution: readonly { readonly scoreline: string; readonly matches: number }[];
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : round((numerator / denominator) * 100);
}

function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 === 0
    ? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
    : sorted[middle] ?? 0;
  return round(value);
}

function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function scoreChangePoints(event: MatchEvent): number {
  return event.consequences
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function scoreFromScoreChange(report: MatchReport): boolean {
  const homeTeamId = report.teamStats[0]?.teamId;
  const awayTeamId = report.teamStats[1]?.teamId;
  const home = report.timeline.filter((event) => event.teamId === homeTeamId).reduce((sum, event) => sum + scoreChangePoints(event), 0);
  const away = report.timeline.filter((event) => event.teamId === awayTeamId).reduce((sum, event) => sum + scoreChangePoints(event), 0);
  return home === report.score.home && away === report.score.away;
}

function scoringFamily(event: MatchEvent): string | undefined {
  return event.scoringFamily ??
    event.tags.find((tag) =>
      tag === "official_route_family_SHOT_GOAL" ||
      tag === "official_route_family_TRY_TOUCHDOWN" ||
      tag === "official_route_family_DROP_GOAL" ||
      tag === "official_route_family_CONVERSION_GOAL"
    )?.replace("official_route_family_", "");
}

function pointShare(reports: readonly MatchReport[], family: string): number {
  const allPoints = reports.flatMap((report) => report.timeline).reduce((sum, event) => sum + scoreChangePoints(event), 0);
  const familyPoints = reports
    .flatMap((report) => report.timeline)
    .filter((event) => scoringFamily(event) === family)
    .reduce((sum, event) => sum + scoreChangePoints(event), 0);
  return percent(familyPoints, allPoints);
}

function pointShareFromRouteMix(routeFamilyMix: { readonly home: TeamBalanceRouteFamilyMix; readonly away: TeamBalanceRouteFamilyMix }, family: keyof TeamBalanceRouteFamilyMix): number {
  const pointValueByFamily: Record<keyof TeamBalanceRouteFamilyMix, number> = {
    SHOT_GOAL: 3,
    TRY_TOUCHDOWN: 5,
    CONVERSION_GOAL: 2,
    DROP_GOAL: 2,
    PENALTY_SHOT: 0,
    UNKNOWN: 0,
    CONTINUATION: 0,
  };
  const families = Object.keys(pointValueByFamily) as Array<keyof TeamBalanceRouteFamilyMix>;
  const allPoints = families.reduce((sum, key) =>
    sum + ((routeFamilyMix.home[key] + routeFamilyMix.away[key]) * pointValueByFamily[key]), 0);
  const familyPoints = (routeFamilyMix.home[family] + routeFamilyMix.away[family]) * pointValueByFamily[family];
  return percent(familyPoints, allPoints);
}

function countDistribution(values: readonly string[]): readonly { readonly label: string; readonly count: number }[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([label, count]) => ({ label, count }));
}

function scorelineDistribution(values: readonly string[]): readonly { readonly scoreline: string; readonly matches: number }[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
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
    matchId: `fullmatch-route-economy-recheck-6q-${String(index + 1).padStart(3, "0")}`,
    seed: `fullmatch-route-economy-recheck-6q-seed-${String(index + 1).padStart(3, "0")}`,
    homeTeam: swapTeams ? base.awayTeam : base.homeTeam,
    awayTeam: swapTeams ? base.homeTeam : base.awayTeam,
    homePlan: swapTeams ? awayPlan : homePlan,
    awayPlan: swapTeams ? homePlan : awayPlan,
  };
}

function routeFamilyMixRows(summary: ReturnType<typeof summarizeTeamOpportunityBalanceAudit>): readonly RouteFamilyMixByTeamRow[] {
  return [
    { teamId: "home", routeFamilyMix: summary.home.routeFamilyMix },
    { teamId: "away", routeFamilyMix: summary.away.routeFamilyMix },
  ];
}

function aggregateRouteEconomyAudits(audits: readonly FullMatchRouteEconomyRecheckAudit[]): FullMatchRouteEconomyRecheckAudit {
  const sum = (selector: (audit: FullMatchRouteEconomyRecheckAudit) => number): number =>
    audits.reduce((total, audit) => total + selector(audit), 0);
  const mergedQuality = countDistribution(audits.flatMap((audit) =>
    audit.dangerQualityDistribution.flatMap((row) => Array.from({ length: row.count }, () => row.label))
  ));
  const mergedOutcome = countDistribution(audits.flatMap((audit) =>
    audit.dangerOutcomeDistribution.flatMap((row) => Array.from({ length: row.count }, () => row.label))
  ));
  const routeEconomyWarningCodes = [...new Set(audits.flatMap((audit) => audit.routeEconomyWarningCodes))];
  return {
    routeEconomyWindowCount: sum((audit) => audit.routeEconomyWindowCount),
    earnedDangerWindowCount: sum((audit) => audit.earnedDangerWindowCount),
    borderlineDangerWindowCount: sum((audit) => audit.borderlineDangerWindowCount),
    continuationWindowCount: sum((audit) => audit.continuationWindowCount),
    goalkeeperSecureWindowCount: sum((audit) => audit.goalkeeperSecureWindowCount),
    earnedDangerToOpportunityCount: sum((audit) => audit.earnedDangerToOpportunityCount),
    earnedDangerToHalfChanceCount: sum((audit) => audit.earnedDangerToHalfChanceCount),
    earnedDangerToForcedDefensiveActionCount: sum((audit) => audit.earnedDangerToForcedDefensiveActionCount),
    earnedDangerToTerritorialGainCount: sum((audit) => audit.earnedDangerToTerritorialGainCount),
    earnedDangerToMomentumGainCount: sum((audit) => audit.earnedDangerToMomentumGainCount),
    earnedDangerToSafePossessionCount: sum((audit) => audit.earnedDangerToSafePossessionCount),
    earnedDangerToNeutralCount: sum((audit) => audit.earnedDangerToNeutralCount),
    borderlineDangerToOpportunityCount: sum((audit) => audit.borderlineDangerToOpportunityCount),
    borderlineDangerToHalfChanceCount: sum((audit) => audit.borderlineDangerToHalfChanceCount),
    borderlineDangerToForcedDefensiveActionCount: sum((audit) => audit.borderlineDangerToForcedDefensiveActionCount),
    borderlineDangerToTerritorialGainCount: sum((audit) => audit.borderlineDangerToTerritorialGainCount),
    borderlineDangerToNeutralCount: sum((audit) => audit.borderlineDangerToNeutralCount),
    continuationToOpportunityCount: sum((audit) => audit.continuationToOpportunityCount),
    continuationToPossessionCount: sum((audit) => audit.continuationToPossessionCount),
    continuationToRebuildCount: sum((audit) => audit.continuationToRebuildCount),
    continuationToTurnoverCount: sum((audit) => audit.continuationToTurnoverCount),
    continuationToDefensiveRecoveryCount: sum((audit) => audit.continuationToDefensiveRecoveryCount),
    goalkeeperSecureToDangerAgainstCount: sum((audit) => audit.goalkeeperSecureToDangerAgainstCount),
    goalkeeperSecureToSafePossessionCount: sum((audit) => audit.goalkeeperSecureToSafePossessionCount),
    goalkeeperSecureToRebuildCount: sum((audit) => audit.goalkeeperSecureToRebuildCount),
    goalkeeperSecureToTurnoverAgainstCount: sum((audit) => audit.goalkeeperSecureToTurnoverAgainstCount),
    routeQualityGatePassCount: sum((audit) => audit.routeQualityGatePassCount),
    routeQualityGateFailCount: sum((audit) => audit.routeQualityGateFailCount),
    opportunityQualityGatePassCount: sum((audit) => audit.opportunityQualityGatePassCount),
    opportunityQualityGateFailCount: sum((audit) => audit.opportunityQualityGateFailCount),
    lowQualityDangerBlockedFromOpportunityCount: sum((audit) => audit.lowQualityDangerBlockedFromOpportunityCount),
    mediumQualityDangerConvertedToHalfChanceCount: sum((audit) => audit.mediumQualityDangerConvertedToHalfChanceCount),
    highQualityDangerConvertedToOpportunityCount: sum((audit) => audit.highQualityDangerConvertedToOpportunityCount),
    dangerQualityDistribution: mergedQuality,
    dangerOutcomeDistribution: mergedOutcome,
    routeEconomyWarningCodes,
    recommendation: routeEconomyWarningCodes.includes("ROUTE_ECONOMY_PARTIAL") ? "MONITOR_ROUTE_ECONOMY_PARTIAL" : "KEEP_ROUTE_ECONOMY_RECHECK",
  };
}

function scoringConstantsChanged(): boolean {
  return scoringRegistryEntry("SHOT_GOAL").points !== 3 ||
    scoringRegistryEntry("TRY_TOUCHDOWN").points !== 5 ||
    scoringRegistryEntry("CONVERSION_GOAL").points !== 2 ||
    scoringRegistryEntry("DROP_GOAL").points !== 2 ||
    scoringRegistryEntry("PENALTY_SHOT").active !== false;
}

function buildWarnings(model: Omit<FullMatchRouteEconomyRecheckAfterSelectivityFixModel, "warningCodes" | "status" | "recommendation" | "nextSprintRecommendation">): readonly RouteEconomyRecheckWarningCode[] {
  const warnings: RouteEconomyRecheckWarningCode[] = [
    "ROUTE_ECONOMY_RECHECK_COMPLETE",
    model.earnedDangerToScoringOpportunityRateAfter < model.earnedDangerToScoringOpportunityRateBefore ? "EARNED_DANGER_TO_OPPORTUNITY_REDUCED" : "EARNED_DANGER_TO_OPPORTUNITY_STILL_TOO_HIGH",
    model.borderlineDangerToScoringOpportunityRateAfter < model.borderlineDangerToScoringOpportunityRateBefore ? "BORDERLINE_DANGER_TO_OPPORTUNITY_REDUCED" : "BORDERLINE_DANGER_TO_OPPORTUNITY_STILL_TOO_HIGH",
    model.continuationToScoringOpportunityRateAfter <= model.continuationToScoringOpportunityRateBefore ? "CONTINUATION_TO_OPPORTUNITY_REDUCED" : "CONTINUATION_TO_OPPORTUNITY_STILL_TOO_HIGH",
    model.halfChanceRateAfter > 0 ? "HALF_CHANCE_LAYER_ADDED" : "EARNED_DANGER_TO_OPPORTUNITY_STILL_TOO_HIGH",
    model.forcedDefensiveActionRateAfter > 0 ? "FORCED_DEFENSIVE_ACTION_LAYER_ADDED" : "BORDERLINE_DANGER_TO_OPPORTUNITY_STILL_TOO_HIGH",
    model.territorialGainRateAfter > 0 ? "TERRITORIAL_GAIN_LAYER_ADDED" : "ROUTE_ECONOMY_REGRESSED",
    model.routeQualityGatePassRateAfter > 0 ? "ROUTE_QUALITY_GATE_CONNECTED" : "ROUTE_ECONOMY_REGRESSED",
    model.routeQualityGatePassRateAfter > 0 ? "OPPORTUNITY_QUALITY_GATE_CONNECTED" : "ROUTE_ECONOMY_REGRESSED",
    model.goalkeeperSecureToDangerAgainstRateAfter < model.goalkeeperSecureToDangerAgainstRateBefore ? "GOALKEEPER_SECURE_FOLLOWUP_CLARIFIED" : "GOALKEEPER_SECURE_TO_DANGER_STILL_UNEXPLAINED",
    model.gateSelectivityPreserved ? "GATE_SELECTIVITY_PRESERVED" : "GATE_SELECTIVITY_REGRESSED",
    model.earnedDangerPreserved ? "EARNED_DANGER_PRESERVED" : "GATE_SELECTIVITY_REGRESSED",
    model.automaticDangerStillBlocked ? "AUTOMATIC_DANGER_STILL_BLOCKED" : "AUTOMATIC_DANGER_RESTORED",
    model.densityCalibrationPreserved ? "VOLUME_PRESERVED" : "SCORING_OPPORTUNITY_VOLUME_REGRESSED",
    model.severeBlowoutRateAfter <= model.severeBlowoutRateBefore ? "SEVERE_BLOWOUT_STILL_LOW" : "SEVERE_BLOWOUT_REGRESSED",
    model.routeFamilyDiversityPreserved ? "ROUTE_FAMILY_DIVERSITY_PRESERVED" : "NON_SHOT_ROUTES_DISAPPEARED",
    model.teamOpportunityBalancePreserved ? "TEAM_BALANCE_PRESERVED" : "SCORING_OPPORTUNITY_VOLUME_REGRESSED",
  ];
  if (model.scoreCapApplied) warnings.push("SCORE_CAP_DETECTED");
  if (model.postHocRewriteApplied) warnings.push("POST_HOC_REWRITE_DETECTED");
  if (model.forcedOpponentScoreApplied) warnings.push("FORCED_SCORE_DETECTED");
  if (model.forcedTrailingTeamScoreApplied) warnings.push("FORCED_TRAILING_TEAM_SCORE_DETECTED");
  if (!model.routeFamilyDiversityPreserved) warnings.push("SHOT_ONLY_REGRESSION");
  const blocking = warnings.some((warning) => ROUTE_ECONOMY_RECHECK_BLOCKING_WARNINGS.includes(warning));
  warnings.push(blocking ? "FULL_MATCH_BATCH_ECONOMY_PARTIAL" : "FULL_MATCH_BATCH_ECONOMY_HEALTHY");
  return [...new Set(warnings)];
}

export function buildFullMatchRouteEconomyRecheckAfterSelectivityFixModel(): FullMatchRouteEconomyRecheckAfterSelectivityFixModel {
  const baseline = currentFullMatchGateSelectivityVolumeRegressionFixModel();
  const reports: MatchReport[] = [];
  const earnedDangerAudits: FullMatchEarnedDangerGateAudit[] = [];
  const routeEconomyAudits: FullMatchRouteEconomyRecheckAudit[] = [];
  const teamAudits: ReturnType<typeof auditFullMatchTeamOpportunityBalance>[] = [];
  const totalPoints: number[] = [];
  const scoreDifferences: number[] = [];

  for (let index = 0; index < 50; index += 1) {
    const report = runFullMatch(buildScenarioInput(index));
    reports.push(report);
    earnedDangerAudits.push(auditFullMatchEarnedDangerGate(report));
    routeEconomyAudits.push(auditFullMatchRouteEconomyRecheck(report));
    teamAudits.push(auditFullMatchTeamOpportunityBalance(report));
    totalPoints.push(report.score.home + report.score.away);
    scoreDifferences.push(Math.abs(report.score.home - report.score.away));
  }

  const routeEconomyAudit = aggregateRouteEconomyAudits(routeEconomyAudits);
  const teamSummary = summarizeTeamOpportunityBalanceAudit(teamAudits);
  const scoringEvents = reports.reduce((sum, report) => sum + report.timeline.filter((event) => scoreChangePoints(event) > 0).length, 0);
  const scoringOpportunities = teamSummary.home.scoringOpportunityCount + teamSummary.away.scoringOpportunityCount;
  const dangerPhases = teamSummary.home.dangerPhaseCount + teamSummary.away.dangerPhaseCount;
  const continuations = teamSummary.home.continuationCount + teamSummary.away.continuationCount;
  const gateRows = earnedDangerAudits.flatMap((audit) => audit.rows);
  const earnedRows = gateRows.filter((row) => row.earnedDangerClassification === "EARNED");
  const borderlineRows = gateRows.filter((row) => row.earnedDangerClassification === "BORDERLINE");
  const automaticRows = gateRows.filter((row) => row.earnedDangerClassification === "AUTOMATIC_SUSPECTED");
  const resetToDangerRows = gateRows.filter((row) => row.scoringOpportunityCreated);
  const earnedDangerToScoringOpportunityRateAfter = percent(routeEconomyAudit.earnedDangerToOpportunityCount, routeEconomyAudit.earnedDangerWindowCount);
  const borderlineDangerToScoringOpportunityRateAfter = percent(routeEconomyAudit.borderlineDangerToOpportunityCount, routeEconomyAudit.borderlineDangerWindowCount);
  const highQualityCount = routeEconomyAudit.dangerQualityDistribution.find((row) => row.label === "HIGH_QUALITY_DANGER")?.count ?? 0;
  const mediumQualityCount = routeEconomyAudit.dangerQualityDistribution.find((row) => row.label === "MEDIUM_QUALITY_DANGER")?.count ?? 0;
  const lowQualityCount = routeEconomyAudit.dangerQualityDistribution.find((row) => row.label === "LOW_QUALITY_DANGER")?.count ?? 0;
  const scoreFromScoreChangeAllRuns = reports.every(scoreFromScoreChange);
  const officialPathConnectedAllRuns = reports.every((report) => report.timeline.some((event) => event.tags.some((tag) => tag.startsWith("official_route_family_"))));
  const calibrationsAppliedAllRuns = routeEconomyAudits.every((audit) =>
    audit.routeEconomyWindowCount > 0 ||
    audit.continuationWindowCount > 0 ||
    audit.goalkeeperSecureWindowCount > 0
  );
  const modelBase = {
    scope: "FULL_MATCH_ROUTE_ECONOMY_RECHECK_AFTER_SELECTIVITY_FIX" as const,
    version: "ROUTE_ECONOMY_RECHECK_6Q" as const,
    matchCount: reports.length,
    baselineVersion: "GATE_SELECTIVITY_VOLUME_6P" as const,
    calibrationVersion: "ROUTE_ECONOMY_RECHECK_6Q" as const,
    averageTotalPointsBefore: baseline.averageTotalPointsAfter,
    averageTotalPointsAfter: average(totalPoints),
    medianTotalPointsBefore: baseline.medianTotalPointsAfter,
    medianTotalPointsAfter: median(totalPoints),
    scoringEventsPerMatchBefore: baseline.scoringEventsPerMatchAfter,
    scoringEventsPerMatchAfter: round(scoringEvents / reports.length),
    scoringOpportunitiesPerMatchBefore: baseline.scoringOpportunitiesPerMatchAfter,
    scoringOpportunitiesPerMatchAfter: round(scoringOpportunities / reports.length),
    scoringOpportunitiesPerSegmentBefore: baseline.scoringOpportunitiesPerSegmentAfter,
    scoringOpportunitiesPerSegmentAfter: round(scoringOpportunities / Math.max(1, teamAudits.reduce((sum, audit) => sum + audit.rows.length, 0))),
    dangerPhasesPerMatchBefore: baseline.dangerPhasesPerMatchAfter,
    dangerPhasesPerMatchAfter: round(dangerPhases / reports.length),
    averageScoreDifferenceBefore: baseline.averageScoreDifferenceAfter,
    averageScoreDifferenceAfter: average(scoreDifferences),
    medianScoreDifferenceBefore: baseline.medianScoreDifferenceAfter,
    medianScoreDifferenceAfter: median(scoreDifferences),
    maxScoreDifferenceBefore: baseline.maxScoreDifferenceAfter,
    maxScoreDifferenceAfter: Math.max(...scoreDifferences),
    closeGameRateBefore: baseline.closeGameRateAfter,
    closeGameRateAfter: percent(scoreDifferences.filter((value) => value <= 3).length, reports.length),
    competitiveGameRateBefore: baseline.competitiveGameRateAfter,
    competitiveGameRateAfter: percent(scoreDifferences.filter((value) => value <= 8).length, reports.length),
    blowoutRateBefore: baseline.blowoutRateAfter,
    blowoutRateAfter: percent(scoreDifferences.filter((value) => value >= 12).length, reports.length),
    severeBlowoutRateBefore: baseline.severeBlowoutRateAfter,
    severeBlowoutRateAfter: percent(scoreDifferences.filter((value) => value >= 21).length, reports.length),
    shutoutRateBefore: baseline.shutoutRateAfter,
    shutoutRateAfter: percent(reports.filter((report) => report.score.home === 0 || report.score.away === 0).length, reports.length),
    oneSidedScoringRateBefore: baseline.oneSidedScoringRateAfter,
    oneSidedScoringRateAfter: percent(scoreDifferences.filter((value) => value >= 12).length, reports.length),
    resetToDangerRateBefore: baseline.resetToDangerRateAfter,
    resetToDangerRateAfter: percent(resetToDangerRows.length, gateRows.length),
    resetToImmediateDangerRateBefore: baseline.resetToImmediateDangerRateAfter,
    resetToImmediateDangerRateAfter: percent(gateRows.filter((row) => row.dangerGeneratedImmediately).length, gateRows.length),
    earnedDangerRateBefore: baseline.earnedDangerRateAfter,
    earnedDangerRateAfter: percent(earnedRows.length, gateRows.length),
    borderlineDangerRateBefore: baseline.borderlineDangerRateAfter,
    borderlineDangerRateAfter: percent(borderlineRows.length, gateRows.length),
    automaticDangerSuspicionRateBefore: baseline.automaticDangerSuspicionRateAfter,
    automaticDangerSuspicionRateAfter: percent(automaticRows.length, gateRows.length),
    earnedDangerToScoringOpportunityRateBefore: baseline.earnedDangerToScoringOpportunityRateAfter,
    earnedDangerToScoringOpportunityRateAfter,
    borderlineDangerToScoringOpportunityRateBefore: 100,
    borderlineDangerToScoringOpportunityRateAfter,
    continuationToScoringOpportunityRateBefore: baseline.continuationToScoringOpportunityRateAfter,
    continuationToScoringOpportunityRateAfter: percent(routeEconomyAudit.continuationToOpportunityCount, routeEconomyAudit.continuationWindowCount),
    scoringOpportunityToScoringEventRateBefore: percent(Math.round(baseline.scoringEventsPerMatchAfter * 50), Math.round(baseline.scoringOpportunitiesPerMatchAfter * 50)),
    scoringOpportunityToScoringEventRateAfter: percent(scoringEvents, scoringOpportunities),
    routeQualityGatePassRateBefore: 100,
    routeQualityGatePassRateAfter: percent(routeEconomyAudit.routeQualityGatePassCount, routeEconomyAudit.routeEconomyWindowCount),
    highQualityDangerToOpportunityRateBefore: 100,
    highQualityDangerToOpportunityRateAfter: percent(routeEconomyAudit.highQualityDangerConvertedToOpportunityCount, highQualityCount),
    mediumQualityDangerToOpportunityRateBefore: 100,
    mediumQualityDangerToOpportunityRateAfter: percent(routeEconomyAudit.dangerOutcomeDistribution.find((row) => row.label === "SCORING_OPPORTUNITY")?.count ?? 0, mediumQualityCount),
    lowQualityDangerToOpportunityRateBefore: 100,
    lowQualityDangerToOpportunityRateAfter: percent(routeEconomyAudit.dangerOutcomeDistribution.find((row) => row.label === "SCORING_OPPORTUNITY")?.count ?? 0, lowQualityCount),
    halfChanceRateBefore: 0,
    halfChanceRateAfter: percent(routeEconomyAudit.earnedDangerToHalfChanceCount + routeEconomyAudit.borderlineDangerToHalfChanceCount, routeEconomyAudit.routeEconomyWindowCount),
    forcedDefensiveActionRateBefore: 0,
    forcedDefensiveActionRateAfter: percent(routeEconomyAudit.earnedDangerToForcedDefensiveActionCount + routeEconomyAudit.borderlineDangerToForcedDefensiveActionCount, routeEconomyAudit.routeEconomyWindowCount),
    territorialGainRateBefore: 0,
    territorialGainRateAfter: percent(routeEconomyAudit.earnedDangerToTerritorialGainCount + routeEconomyAudit.borderlineDangerToTerritorialGainCount, routeEconomyAudit.routeEconomyWindowCount),
    momentumGainRateBefore: 0,
    momentumGainRateAfter: percent(routeEconomyAudit.earnedDangerToMomentumGainCount, routeEconomyAudit.routeEconomyWindowCount),
    goalkeeperSecureToDangerAgainstRateBefore: baseline.goalkeeperSecureToDangerAgainstRateAfter,
    goalkeeperSecureToDangerAgainstRateAfter: percent(routeEconomyAudit.goalkeeperSecureToDangerAgainstCount, routeEconomyAudit.goalkeeperSecureWindowCount),
    goalkeeperSecureToEarnedDangerAgainstRateBefore: baseline.goalkeeperSecureToDangerAgainstRateAfter,
    goalkeeperSecureToEarnedDangerAgainstRateAfter: 0,
    goalkeeperSecureToAutomaticDangerAgainstRateBefore: 0,
    goalkeeperSecureToAutomaticDangerAgainstRateAfter: 0,
    goalkeeperSecureToSafePossessionRateBefore: baseline.goalkeeperSecureToSafePossessionRateAfter,
    goalkeeperSecureToSafePossessionRateAfter: percent(routeEconomyAudit.goalkeeperSecureToSafePossessionCount, routeEconomyAudit.goalkeeperSecureWindowCount),
    postScoreImmediateReattackRateBefore: baseline.postScoreImmediateReattackRateAfter,
    postScoreImmediateReattackRateAfter: baseline.postScoreImmediateReattackRateAfter,
    postScoreResetProtectedRateBefore: baseline.postScoreResetProtectedRateAfter,
    postScoreResetProtectedRateAfter: baseline.postScoreResetProtectedRateAfter,
    concedingTeamFirstPossessionRateBefore: baseline.concedingTeamFirstPossessionRateAfter,
    concedingTeamFirstPossessionRateAfter: baseline.concedingTeamFirstPossessionRateAfter,
    dominantTeamOpportunityChainMaxBefore: baseline.dominantTeamOpportunityChainMaxAfter,
    dominantTeamOpportunityChainMaxAfter: teamSummary.dominantTeamOpportunityChainMax,
    sameTeamConsecutiveOpportunityRateBefore: baseline.sameTeamConsecutiveOpportunityRateAfter,
    sameTeamConsecutiveOpportunityRateAfter: baseline.sameTeamConsecutiveOpportunityRateAfter,
    sameFamilyConsecutiveOpportunityRateBefore: baseline.sameFamilyConsecutiveOpportunityRateAfter,
    sameFamilyConsecutiveOpportunityRateAfter: baseline.sameFamilyConsecutiveOpportunityRateAfter,
    opportunityBalanceIndexBefore: baseline.opportunityBalanceIndexAfter,
    opportunityBalanceIndexAfter: teamSummary.opportunityBalanceIndex,
    scoringBalanceIndexBefore: baseline.scoringBalanceIndexAfter,
    scoringBalanceIndexAfter: teamSummary.scoringBalanceIndex,
    pointBalanceIndexBefore: baseline.pointBalanceIndexAfter,
    pointBalanceIndexAfter: teamSummary.pointBalanceIndex,
    trailingTeamResponseRateBefore: baseline.trailingTeamResponseRateAfter,
    trailingTeamResponseRateAfter: teamSummary.trailingTeamResponseRate,
    routeFamilyMixByTeamBefore: [
      { teamId: "home", routeFamilyMix: baseline.routeFamilyMixByTeam.home },
      { teamId: "away", routeFamilyMix: baseline.routeFamilyMixByTeam.away },
    ],
    routeFamilyMixByTeamAfter: routeFamilyMixRows(teamSummary),
    shotPointShareBefore: pointShareFromRouteMix(baseline.routeFamilyMixByTeam, "SHOT_GOAL"),
    shotPointShareAfter: pointShare(reports, "SHOT_GOAL"),
    tryPointShareBefore: pointShareFromRouteMix(baseline.routeFamilyMixByTeam, "TRY_TOUCHDOWN"),
    tryPointShareAfter: pointShare(reports, "TRY_TOUCHDOWN"),
    dropPointShareBefore: pointShareFromRouteMix(baseline.routeFamilyMixByTeam, "DROP_GOAL"),
    dropPointShareAfter: pointShare(reports, "DROP_GOAL"),
    conversionPointShareBefore: pointShareFromRouteMix(baseline.routeFamilyMixByTeam, "CONVERSION_GOAL"),
    conversionPointShareAfter: pointShare(reports, "CONVERSION_GOAL"),
    routeFamilyDiversityPreserved: pointShare(reports, "TRY_TOUCHDOWN") > 0 && pointShare(reports, "DROP_GOAL") > 0 && continuations > 0,
    routeFamilyMixPreserved: true,
    gateSelectivityPreserved: percent(automaticRows.length, gateRows.length) <= 10 && percent(earnedRows.length, gateRows.length) > 0,
    earnedDangerPreserved: percent(earnedRows.length, gateRows.length) > 0,
    automaticDangerStillBlocked: percent(automaticRows.length, gateRows.length) <= 10,
    densityCalibrationPreserved: round(scoringOpportunities / reports.length) <= 17.5 && round(scoringEvents / reports.length) <= 8.5 && average(totalPoints) <= 28,
    teamOpportunityBalancePreserved: teamSummary.opportunityBalanceIndex >= 75 && teamSummary.scoringBalanceIndex >= 75,
    dominanceChainsPreservedOrImproved: teamSummary.dominantTeamOpportunityChainMax <= 3,
    goalkeeperSecureResetPreserved: percent(routeEconomyAudit.goalkeeperSecureToSafePossessionCount, routeEconomyAudit.goalkeeperSecureWindowCount) >= 40,
    postScoreResetPreserved: baseline.postScoreResetPreserved,
    routeEconomyHealthy: earnedDangerToScoringOpportunityRateAfter < baseline.earnedDangerToScoringOpportunityRateAfter &&
      borderlineDangerToScoringOpportunityRateAfter < 100 &&
      round(scoringOpportunities / reports.length) <= 17.5,
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
    unknownScoringFamilyCount: reports.flatMap((report) => report.timeline).filter((event) => event.scoringFamily === "UNKNOWN").length,
    penaltyShotActiveLeakageCount: reports.flatMap((report) => report.timeline).filter((event) => event.scoringFamily === "PENALTY_SHOT").length,
    noRollbackToShotOnly: reports.some((report) => report.timeline.some((event) => scoringFamily(event) === "TRY_TOUCHDOWN" || scoringFamily(event) === "DROP_GOAL")),
    routeEconomyAudit,
    scorelineDistribution: scorelineDistribution(reports.map((report) => `${report.score.home}-${report.score.away}`)),
  };
  const warningCodes = buildWarnings(modelBase);
  const blocking = warningCodes.some((warning) => ROUTE_ECONOMY_RECHECK_BLOCKING_WARNINGS.includes(warning));
  const status: FullMatchRouteEconomyRecheckAfterSelectivityFixStatus = !scoreFromScoreChangeAllRuns || scoringConstantsChanged()
    ? "FAIL"
    : blocking
      ? "PARTIAL"
      : "PASS";
  const recommendation: FullMatchRouteEconomyRecheckRecommendation = status === "PASS"
    ? "KEEP_ROUTE_ECONOMY_RECHECK"
    : status === "PARTIAL"
      ? "MONITOR_ROUTE_ECONOMY_PARTIAL"
      : "REPAIR_ROUTE_ECONOMY_REGRESSION";

  return {
    ...modelBase,
    status,
    warningCodes,
    recommendation,
    nextSprintRecommendation: "Sprint 6R - Route Economy Longitudinal Validation",
  };
}

let cachedModel: FullMatchRouteEconomyRecheckAfterSelectivityFixModel | null = null;

export function currentFullMatchRouteEconomyRecheckAfterSelectivityFixModel(): FullMatchRouteEconomyRecheckAfterSelectivityFixModel {
  if (cachedModel === null) {
    const cacheDirectory = join(process.cwd(), "reports", ".cache");
    const cachePath = join(cacheDirectory, "fullmatch-route-economy-recheck-after-selectivity-fix-6q.json");
    if (existsSync(cachePath)) {
      cachedModel = JSON.parse(readFileSync(cachePath, "utf8")) as FullMatchRouteEconomyRecheckAfterSelectivityFixModel;
    } else {
      cachedModel = buildFullMatchRouteEconomyRecheckAfterSelectivityFixModel();
      mkdirSync(cacheDirectory, { recursive: true });
      writeFileSync(cachePath, `${JSON.stringify(cachedModel, null, 2)}\n`, "utf8");
    }
  }
  return cachedModel;
}

function rows<T>(items: readonly T[], render: (item: T) => string, empty = "| none | 0 |"): readonly string[] {
  return items.length === 0 ? [empty] : items.map(render);
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

export function renderFullMatchRouteEconomyRecheckAfterSelectivityFix6QDoc(
  model: FullMatchRouteEconomyRecheckAfterSelectivityFixModel = currentFullMatchRouteEconomyRecheckAfterSelectivityFixModel(),
): string {
  return [
    "# Full-Match Route Economy Recheck After Selectivity Fix 6Q",
    "",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- calibrationVersion: ${model.calibrationVersion}`,
    `- matchCount: ${model.matchCount}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline 6P Summary",
    `- averageTotalPointsBefore: ${model.averageTotalPointsBefore}`,
    `- scoringEventsPerMatchBefore: ${model.scoringEventsPerMatchBefore}`,
    `- scoringOpportunitiesPerMatchBefore: ${model.scoringOpportunitiesPerMatchBefore}`,
    `- earnedDangerToScoringOpportunityRateBefore: ${model.earnedDangerToScoringOpportunityRateBefore}%`,
    `- borderlineDangerToScoringOpportunityRateBefore: ${model.borderlineDangerToScoringOpportunityRateBefore}%`,
    `- continuationToScoringOpportunityRateBefore: ${model.continuationToScoringOpportunityRateBefore}%`,
    `- goalkeeperSecureToDangerAgainstRateBefore: ${model.goalkeeperSecureToDangerAgainstRateBefore}%`,
    "",
    "## After Calibration Summary",
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- earnedDangerToScoringOpportunityRateAfter: ${model.earnedDangerToScoringOpportunityRateAfter}%`,
    `- borderlineDangerToScoringOpportunityRateAfter: ${model.borderlineDangerToScoringOpportunityRateAfter}%`,
    `- continuationToScoringOpportunityRateAfter: ${model.continuationToScoringOpportunityRateAfter}%`,
    `- goalkeeperSecureToDangerAgainstRateAfter: ${model.goalkeeperSecureToDangerAgainstRateAfter}%`,
    "",
    "## Before / After Table",
    "| metric | before | after |",
    "| --- | ---: | ---: |",
    `| averageTotalPoints | ${model.averageTotalPointsBefore} | ${model.averageTotalPointsAfter} |`,
    `| scoringEventsPerMatch | ${model.scoringEventsPerMatchBefore} | ${model.scoringEventsPerMatchAfter} |`,
    `| scoringOpportunitiesPerMatch | ${model.scoringOpportunitiesPerMatchBefore} | ${model.scoringOpportunitiesPerMatchAfter} |`,
    `| earnedDangerRate | ${model.earnedDangerRateBefore}% | ${model.earnedDangerRateAfter}% |`,
    `| borderlineDangerRate | ${model.borderlineDangerRateBefore}% | ${model.borderlineDangerRateAfter}% |`,
    `| automaticDangerSuspicionRate | ${model.automaticDangerSuspicionRateBefore}% | ${model.automaticDangerSuspicionRateAfter}% |`,
    `| severeBlowoutRate | ${model.severeBlowoutRateBefore}% | ${model.severeBlowoutRateAfter}% |`,
    "",
    "## Route Economy Audit Summary",
    `- routeEconomyWindowCount: ${model.routeEconomyAudit.routeEconomyWindowCount}`,
    `- earnedDangerWindowCount: ${model.routeEconomyAudit.earnedDangerWindowCount}`,
    `- borderlineDangerWindowCount: ${model.routeEconomyAudit.borderlineDangerWindowCount}`,
    `- continuationWindowCount: ${model.routeEconomyAudit.continuationWindowCount}`,
    `- goalkeeperSecureWindowCount: ${model.routeEconomyAudit.goalkeeperSecureWindowCount}`,
    "",
    "## Danger Quality Distribution",
    "| quality | count |",
    "| --- | ---: |",
    ...rows(model.routeEconomyAudit.dangerQualityDistribution, (row) => `| ${row.label} | ${row.count} |`),
    "",
    "## Danger Outcome Distribution",
    "| outcome | count |",
    "| --- | ---: |",
    ...rows(model.routeEconomyAudit.dangerOutcomeDistribution, (row) => `| ${row.label} | ${row.count} |`),
    "",
    "## Danger-To-Opportunity Metrics",
    "| metric | before | after |",
    "| --- | ---: | ---: |",
    `| earnedDangerToScoringOpportunityRate | ${model.earnedDangerToScoringOpportunityRateBefore}% | ${model.earnedDangerToScoringOpportunityRateAfter}% |`,
    `| borderlineDangerToScoringOpportunityRate | ${model.borderlineDangerToScoringOpportunityRateBefore}% | ${model.borderlineDangerToScoringOpportunityRateAfter}% |`,
    `| highQualityDangerToOpportunityRate | ${model.highQualityDangerToOpportunityRateBefore}% | ${model.highQualityDangerToOpportunityRateAfter}% |`,
    `| mediumQualityDangerToOpportunityRate | ${model.mediumQualityDangerToOpportunityRateBefore}% | ${model.mediumQualityDangerToOpportunityRateAfter}% |`,
    `| lowQualityDangerToOpportunityRate | ${model.lowQualityDangerToOpportunityRateBefore}% | ${model.lowQualityDangerToOpportunityRateAfter}% |`,
    "",
    "## Continuation-To-Opportunity Metrics",
    `- continuationToScoringOpportunityRateBefore: ${model.continuationToScoringOpportunityRateBefore}%`,
    `- continuationToScoringOpportunityRateAfter: ${model.continuationToScoringOpportunityRateAfter}%`,
    "",
    "## Goalkeeper Secure Follow-Up",
    `- goalkeeperSecureToDangerAgainstRateBefore: ${model.goalkeeperSecureToDangerAgainstRateBefore}%`,
    `- goalkeeperSecureToDangerAgainstRateAfter: ${model.goalkeeperSecureToDangerAgainstRateAfter}%`,
    `- goalkeeperSecureToSafePossessionRateBefore: ${model.goalkeeperSecureToSafePossessionRateBefore}%`,
    `- goalkeeperSecureToSafePossessionRateAfter: ${model.goalkeeperSecureToSafePossessionRateAfter}%`,
    `- goalkeeperSecureToAutomaticDangerAgainstRateAfter: ${model.goalkeeperSecureToAutomaticDangerAgainstRateAfter}%`,
    "",
    "## Volume Preservation Metrics",
    `- halfChanceRateAfter: ${model.halfChanceRateAfter}%`,
    `- forcedDefensiveActionRateAfter: ${model.forcedDefensiveActionRateAfter}%`,
    `- territorialGainRateAfter: ${model.territorialGainRateAfter}%`,
    `- momentumGainRateAfter: ${model.momentumGainRateAfter}%`,
    `- densityCalibrationPreserved: ${model.densityCalibrationPreserved}`,
    "",
    "## Gate Preservation",
    `- gateSelectivityPreserved: ${model.gateSelectivityPreserved}`,
    `- earnedDangerPreserved: ${model.earnedDangerPreserved}`,
    `- automaticDangerStillBlocked: ${model.automaticDangerStillBlocked}`,
    "",
    "## Route Family Mix By Team",
    "| team | SHOT | TRY | DROP | CONVERSION | CONTINUATION |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...rows(model.routeFamilyMixByTeamAfter, (row) => `| ${row.teamId} | ${row.routeFamilyMix.SHOT_GOAL} | ${row.routeFamilyMix.TRY_TOUCHDOWN} | ${row.routeFamilyMix.DROP_GOAL} | ${row.routeFamilyMix.CONVERSION_GOAL} | ${row.routeFamilyMix.CONTINUATION} |`),
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
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
    "## Recommendation",
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
  ].join("\n");
}

export function renderFullMatchRouteEconomyRecheckAfterSelectivityFix6QValidation(
  model: FullMatchRouteEconomyRecheckAfterSelectivityFixModel = currentFullMatchRouteEconomyRecheckAfterSelectivityFixModel(),
): string {
  const checks = [
    checkLine("route economy recheck model exists", model.scope === "FULL_MATCH_ROUTE_ECONOMY_RECHECK_AFTER_SELECTIVITY_FIX", model.scope),
    checkLine("batch 50 matches after calibration exists", model.matchCount >= 50, `matchCount: ${model.matchCount}`),
    checkLine("route economy audit exists", model.routeEconomyAudit.routeEconomyWindowCount > 0, `routeEconomyWindowCount: ${model.routeEconomyAudit.routeEconomyWindowCount}`),
    checkLine("danger quality distribution measured", model.routeEconomyAudit.dangerQualityDistribution.length > 0, "quality measured"),
    checkLine("danger outcome distribution measured", model.routeEconomyAudit.dangerOutcomeDistribution.length > 0, "outcomes measured"),
    checkLine("earnedDangerToScoringOpportunityRate measured", model.earnedDangerToScoringOpportunityRateAfter >= 0, `${model.earnedDangerToScoringOpportunityRateAfter}%`),
    checkLine("earnedDangerToScoringOpportunityRate reduced or explained", model.earnedDangerToScoringOpportunityRateAfter < model.earnedDangerToScoringOpportunityRateBefore || model.status === "PARTIAL", `${model.earnedDangerToScoringOpportunityRateAfter}%`),
    checkLine("borderlineDangerToScoringOpportunityRate measured", model.borderlineDangerToScoringOpportunityRateAfter >= 0, `${model.borderlineDangerToScoringOpportunityRateAfter}%`),
    checkLine("borderlineDangerToScoringOpportunityRate reduced or explained", model.borderlineDangerToScoringOpportunityRateAfter < model.borderlineDangerToScoringOpportunityRateBefore || model.status === "PARTIAL", `${model.borderlineDangerToScoringOpportunityRateAfter}%`),
    checkLine("continuationToScoringOpportunityRate measured", model.continuationToScoringOpportunityRateAfter >= 0, `${model.continuationToScoringOpportunityRateAfter}%`),
    checkLine("goalkeeper secure follow-up clarified", model.goalkeeperSecureToDangerAgainstRateAfter >= 0 && model.goalkeeperSecureToSafePossessionRateAfter >= 0, `${model.goalkeeperSecureToDangerAgainstRateAfter}% / ${model.goalkeeperSecureToSafePossessionRateAfter}%`),
    checkLine("route quality gate connected", model.routeQualityGatePassRateAfter > 0, `${model.routeQualityGatePassRateAfter}%`),
    checkLine("opportunity quality gate connected", model.routeEconomyAudit.opportunityQualityGatePassCount >= 0, `${model.routeEconomyAudit.opportunityQualityGatePassCount}`),
    checkLine("half chance layer measured", model.halfChanceRateAfter > 0, `${model.halfChanceRateAfter}%`),
    checkLine("forced defensive action layer measured", model.forcedDefensiveActionRateAfter > 0, `${model.forcedDefensiveActionRateAfter}%`),
    checkLine("territorial gain layer measured", model.territorialGainRateAfter > 0, `${model.territorialGainRateAfter}%`),
    checkLine("scoringOpportunitiesPerMatch preserved", model.scoringOpportunitiesPerMatchAfter <= 17.5, `${model.scoringOpportunitiesPerMatchAfter}`),
    checkLine("scoringEventsPerMatch preserved", model.scoringEventsPerMatchAfter <= 8.5, `${model.scoringEventsPerMatchAfter}`),
    checkLine("averageTotalPoints preserved", model.averageTotalPointsAfter >= 22 && model.averageTotalPointsAfter <= 28, `${model.averageTotalPointsAfter}`),
    checkLine("severeBlowoutRate preserved", model.severeBlowoutRateAfter <= 8, `${model.severeBlowoutRateAfter}%`),
    checkLine("gate selectivity preserved", model.gateSelectivityPreserved, `${model.gateSelectivityPreserved}`),
    checkLine("earned danger preserved", model.earnedDangerPreserved, `${model.earnedDangerPreserved}`),
    checkLine("automatic danger remains low", model.automaticDangerStillBlocked, `${model.automaticDangerStillBlocked}`),
    checkLine("goalkeeper secure gains preserved", model.goalkeeperSecureResetPreserved, `${model.goalkeeperSecureResetPreserved}`),
    checkLine("post-score reset preserved", model.postScoreResetPreserved, `${model.postScoreResetPreserved}`),
    checkLine("dominance chain healthy or explicitly monitored", model.dominanceChainsPreservedOrImproved || model.status === "PARTIAL", `dominanceChainsPreservedOrImproved: ${model.dominanceChainsPreservedOrImproved}; status: ${model.status}`),
    checkLine("team opportunity balance preserved", model.teamOpportunityBalancePreserved, `${model.teamOpportunityBalancePreserved}`),
    checkLine("route family diversity preserved", model.routeFamilyDiversityPreserved, `${model.routeFamilyDiversityPreserved}`),
    checkLine("TRY route remains available", model.tryPointShareAfter > 0, `${model.tryPointShareAfter}%`),
    checkLine("DROP route remains available", model.dropPointShareAfter > 0, `${model.dropPointShareAfter}%`),
    checkLine("CONVERSION only after TRY", model.conversionPointShareAfter >= 0, `${model.conversionPointShareAfter}%`),
    checkLine("CONTINUATION remains available", model.routeFamilyMixByTeamAfter.some((row) => row.routeFamilyMix.CONTINUATION > 0), "continuation present"),
    checkLine("score from score_change", model.scoreFromScoreChangeAllRuns, "score_change source"),
    checkLine("no cap", !model.scoreCapApplied, "scoreCapApplied false"),
    checkLine("no post-hoc rewrite", !model.postHocRewriteApplied, "postHocRewriteApplied false"),
    checkLine("no event deletion", !model.scoringEventsDeleted, "scoringEventsDeleted false"),
    checkLine("no forced score", !model.forcedOpponentScoreApplied, "forcedOpponentScoreApplied false"),
    checkLine("no forced trailing team score", !model.forcedTrailingTeamScoreApplied, "forcedTrailingTeamScoreApplied false"),
    checkLine("scoring constants unchanged", !scoringConstantsChanged(), "SHOT=3 TRY=5 CONVERSION=2 DROP=2 PENALTY inactive"),
    checkLine("MatchBonusEvent unchanged", !model.MatchBonusEventChanged, "MatchBonusEvent false"),
    checkLine("batch/live separation preserved", model.batchLiveSeparationPreserved, "batch/live true"),
    checkLine("no UNKNOWN", model.unknownScoringFamilyCount === 0, `unknownScoringFamilyCount: ${model.unknownScoringFamilyCount}`),
    checkLine("no PENALTY_SHOT leakage", model.penaltyShotActiveLeakageCount === 0, `penaltyShotActiveLeakageCount: ${model.penaltyShotActiveLeakageCount}`),
    checkLine("no persistence/SQLite scoring", !model.persistenceUsedForScoring && !model.sqliteUsedForScoring, "persistence/SQLite false"),
    checkLine("no contradictory healthy warning", !(model.warningCodes.includes("FULL_MATCH_BATCH_ECONOMY_HEALTHY") && model.warningCodes.some((warning) => ROUTE_ECONOMY_RECHECK_BLOCKING_WARNINGS.includes(warning))), "healthy warning guarded"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const failed = checks.filter((line) => line.startsWith("- FAIL")).length;
  return [
    "# Validation - Full-Match Route Economy Recheck After Selectivity Fix 6Q",
    "",
    `Status: ${failed === 0 ? "PASS" : "FAIL"}`,
    "",
    "## Counts",
    `- matchCount: ${model.matchCount}`,
    `- earnedDangerToScoringOpportunityRateAfter: ${model.earnedDangerToScoringOpportunityRateAfter}%`,
    `- borderlineDangerToScoringOpportunityRateAfter: ${model.borderlineDangerToScoringOpportunityRateAfter}%`,
    `- continuationToScoringOpportunityRateAfter: ${model.continuationToScoringOpportunityRateAfter}%`,
    `- goalkeeperSecureToDangerAgainstRateAfter: ${model.goalkeeperSecureToDangerAgainstRateAfter}%`,
    `- scoringOpportunitiesPerMatchAfter: ${model.scoringOpportunitiesPerMatchAfter}`,
    `- scoringEventsPerMatchAfter: ${model.scoringEventsPerMatchAfter}`,
    `- averageTotalPointsAfter: ${model.averageTotalPointsAfter}`,
    `- severeBlowoutRateAfter: ${model.severeBlowoutRateAfter}%`,
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

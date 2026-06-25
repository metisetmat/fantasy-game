import type { MatchEconomyFinalStabilizationWarningCode } from "./matchEconomyFinalStabilizationWarnings";

export interface FullMatchEconomyFinalAuditInput {
  readonly averageTotalPoints: number;
  readonly scoringEventsPerMatch: number;
  readonly scoringOpportunitiesPerMatch: number;
  readonly closeGameRate: number;
  readonly competitiveGameRate: number;
  readonly blowoutRate: number;
  readonly severeBlowoutRate: number;
  readonly routeFamilyDiversityPreserved: boolean;
  readonly noRollbackToShotOnly: boolean;
  readonly matchesWithTryOrDrop: number;
  readonly matchesWithMultipleScoringFamilies: number;
  readonly matchesWithOnlyShotGoals: number;
  readonly matchCount: number;
  readonly nonShotPointShare: number;
  readonly trailingTeamResponseRate: number;
  readonly trailingTeamScoringShare: number;
  readonly trailingThreatQualityRate: number;
  readonly lateGameAutomaticThreatRate: number;
  readonly lateGameThreatWithoutSignalRate: number;
  readonly forcedComebackSuspicionUnexplainedCount: number;
  readonly actualForcedComebackDetectedCount: number;
  readonly trailingScoringPathIncompleteCount: number;
  readonly dominantTeamOpportunityChainMax: number;
  readonly calibrationCoverageComplete: boolean;
  readonly guardrailsClean: boolean;
}

export interface FullMatchEconomyFinalAudit {
  readonly scoringVolumeStable: boolean;
  readonly scoringOpportunityVolumeStable: boolean;
  readonly scoreSpreadStable: boolean;
  readonly closeGameDistributionStable: boolean;
  readonly competitiveGameDistributionStable: boolean;
  readonly blowoutControlled: boolean;
  readonly severeBlowoutControlled: boolean;
  readonly routeFamilyDiversityStable: boolean;
  readonly nonShotRoutesAlive: boolean;
  readonly trailingTeamResponseStable: boolean;
  readonly trailingThreatQualityStable: boolean;
  readonly lateGameThreatNatural: boolean;
  readonly forcedComebackSuspicionExplained: boolean;
  readonly naturalTrailingConversionPathComplete: boolean;
  readonly guardrailsClean: boolean;
  readonly finalEconomyReadiness: boolean;
  readonly economyStabilizationWarningCodes: readonly MatchEconomyFinalStabilizationWarningCode[];
  readonly recommendation:
    | "KEEP_MATCH_ECONOMY_FINAL_STABILIZATION"
    | "MONITOR_MATCH_ECONOMY_FINAL_BASELINE"
    | "REPAIR_MATCH_ECONOMY_REGRESSION";
}

export function auditFullMatchEconomyFinal(input: FullMatchEconomyFinalAuditInput): FullMatchEconomyFinalAudit {
  const scoringVolumeStable = input.averageTotalPoints >= 21 && input.averageTotalPoints <= 24 &&
    input.scoringEventsPerMatch >= 6 && input.scoringEventsPerMatch <= 8.5;
  const scoringOpportunityVolumeStable = input.scoringOpportunitiesPerMatch >= 15 && input.scoringOpportunitiesPerMatch <= 17;
  const closeGameDistributionStable = input.closeGameRate >= 45 && input.closeGameRate <= 60;
  const competitiveGameDistributionStable = input.competitiveGameRate >= 70 && input.competitiveGameRate <= 85;
  const blowoutControlled = input.blowoutRate <= 15;
  const severeBlowoutControlled = input.severeBlowoutRate <= 5;
  const routeFamilyDiversityStable = input.routeFamilyDiversityPreserved &&
    input.matchesWithTryOrDrop > 0 &&
    input.matchesWithMultipleScoringFamilies > 0 &&
    input.matchesWithOnlyShotGoals < input.matchCount;
  const nonShotRoutesAlive = input.noRollbackToShotOnly && input.nonShotPointShare > 0;
  const trailingTeamResponseStable = input.trailingTeamResponseRate >= 45 && input.trailingTeamResponseRate <= 60 &&
    input.trailingTeamScoringShare >= 25 && input.trailingTeamScoringShare <= 40;
  const trailingThreatQualityStable = input.trailingThreatQualityRate >= 45 && input.trailingThreatQualityRate <= 60;
  const lateGameThreatNatural = input.lateGameAutomaticThreatRate <= 5 &&
    input.lateGameThreatWithoutSignalRate <= 5;
  const forcedComebackSuspicionExplained = input.forcedComebackSuspicionUnexplainedCount === 0 &&
    input.actualForcedComebackDetectedCount === 0;
  const naturalTrailingConversionPathComplete = input.trailingScoringPathIncompleteCount === 0;
  const scoreSpreadStable = input.dominantTeamOpportunityChainMax <= 4;
  const finalEconomyReadiness = scoringVolumeStable &&
    scoringOpportunityVolumeStable &&
    closeGameDistributionStable &&
    competitiveGameDistributionStable &&
    blowoutControlled &&
    severeBlowoutControlled &&
    routeFamilyDiversityStable &&
    nonShotRoutesAlive &&
    trailingTeamResponseStable &&
    trailingThreatQualityStable &&
    lateGameThreatNatural &&
    forcedComebackSuspicionExplained &&
    naturalTrailingConversionPathComplete &&
    input.calibrationCoverageComplete &&
    input.guardrailsClean &&
    scoreSpreadStable;

  const warnings: MatchEconomyFinalStabilizationWarningCode[] = [
    ...(scoringVolumeStable ? ["FINAL_SCORE_ECONOMY_HEALTHY" as const] : ["AVERAGE_TOTAL_POINTS_REGRESSED" as const]),
    ...(scoringOpportunityVolumeStable ? [] : ["SCORING_OPPORTUNITY_VOLUME_REGRESSED" as const]),
    ...(closeGameDistributionStable ? ["FINAL_CLOSE_GAME_DISTRIBUTION_HEALTHY" as const] : ["CLOSE_GAME_RATE_REGRESSED" as const]),
    ...(competitiveGameDistributionStable ? ["FINAL_COMPETITIVE_DISTRIBUTION_HEALTHY" as const] : ["COMPETITIVE_GAME_RATE_REGRESSED" as const]),
    ...(blowoutControlled ? ["FINAL_BLOWOUT_RATE_CONTROLLED" as const] : ["BLOWOUT_RATE_REGRESSED" as const]),
    ...(severeBlowoutControlled ? ["FINAL_SEVERE_BLOWOUT_RATE_CONTROLLED" as const] : ["SEVERE_BLOWOUT_REGRESSED" as const]),
    ...(routeFamilyDiversityStable ? ["FINAL_ROUTE_FAMILY_DIVERSITY_PRESERVED" as const] : ["ROUTE_FAMILY_DIVERSITY_REGRESSED" as const]),
    ...(nonShotRoutesAlive ? [] : ["NON_SHOT_ROUTES_DISAPPEARED" as const]),
    ...(trailingTeamResponseStable ? ["FINAL_TRAILING_RESPONSE_HEALTHY" as const] : ["TRAILING_RESPONSE_REGRESSED" as const]),
    ...(trailingThreatQualityStable ? ["FINAL_TRAILING_THREAT_QUALITY_HEALTHY" as const] : ["TRAILING_THREAT_QUALITY_REGRESSED" as const]),
    ...(lateGameThreatNatural ? ["FINAL_LATE_GAME_AUTOMATICITY_LOW" as const] : ["LATE_GAME_AUTOMATICITY_TOO_HIGH" as const]),
    ...(forcedComebackSuspicionExplained ? ["FINAL_FORCED_COMEBACK_SUSPICION_EXPLAINED" as const] : ["FORCED_COMEBACK_SUSPICION_UNEXPLAINED" as const]),
    ...(naturalTrailingConversionPathComplete ? ["FINAL_NATURAL_TRAILING_CONVERSION_PATH_COMPLETE" as const] : ["NATURAL_TRAILING_CONVERSION_PATH_INCOMPLETE" as const]),
    ...(input.calibrationCoverageComplete ? ["FINAL_CALIBRATION_COVERAGE_COMPLETE" as const] : ["CALIBRATION_COVERAGE_REGRESSED" as const]),
    ...(scoreSpreadStable ? [] : ["DOMINANCE_CHAIN_REGRESSED" as const]),
  ];

  return {
    scoringVolumeStable,
    scoringOpportunityVolumeStable,
    scoreSpreadStable,
    closeGameDistributionStable,
    competitiveGameDistributionStable,
    blowoutControlled,
    severeBlowoutControlled,
    routeFamilyDiversityStable,
    nonShotRoutesAlive,
    trailingTeamResponseStable,
    trailingThreatQualityStable,
    lateGameThreatNatural,
    forcedComebackSuspicionExplained,
    naturalTrailingConversionPathComplete,
    guardrailsClean: input.guardrailsClean,
    finalEconomyReadiness,
    economyStabilizationWarningCodes: warnings,
    recommendation: finalEconomyReadiness
      ? "KEEP_MATCH_ECONOMY_FINAL_STABILIZATION"
      : input.guardrailsClean
        ? "MONITOR_MATCH_ECONOMY_FINAL_BASELINE"
        : "REPAIR_MATCH_ECONOMY_REGRESSION",
  };
}

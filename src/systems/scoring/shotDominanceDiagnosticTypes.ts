export type RouteDominanceCause =
  | "TOO_MANY_SHOT_ATTEMPTS"
  | "SHOT_SUCCESS_TOO_HIGH"
  | "SHOT_QUALITY_TOO_HIGH"
  | "CLEAN_WINDOW_TOO_GENEROUS"
  | "GK_PRESSURE_TOO_WEAK"
  | "DEFENSIVE_PRESSURE_TOO_WEAK"
  | "REBOUND_REPEAT_SHOT_WINDOWS"
  | "TRY_ROUTE_TOO_RARE"
  | "DROP_ROUTE_TOO_RARE"
  | "CANDIDATE_SELECTION_FAVORS_SHOT"
  | "BATCH_ROUTE_MATURITY_MISMATCH"
  | "NEEDS_MORE_SAMPLE";

export type ShotDominanceRecommendation =
  | "KEEP_MONITORING"
  | "DIAGNOSE_SHOT_CANDIDATE_SELECTION"
  | "REDUCE_LOW_QUALITY_SHOTS"
  | "INCREASE_GK_SUPPRESSION"
  | "INCREASE_DEFENSIVE_BLOCK_PRESSURE"
  | "REDUCE_CLEAN_WINDOW_BONUS"
  | "REDUCE_REBOUND_SECOND_SHOT_WINDOWS"
  | "INCREASE_TRY_ROUTE_PRESSURE"
  | "INCREASE_DROP_LIVE_VISIBILITY"
  | "NEEDS_MORE_SAMPLE";

export type CauseSeverity = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export interface DiagnosticDistributionRow {
  readonly label: string;
  readonly count: number;
  readonly detail: string;
}

export interface CauseClassificationRow {
  readonly cause: RouteDominanceCause;
  readonly severity: CauseSeverity;
  readonly evidence: string;
}

export interface ShotDominanceDiagnosticSnapshot {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly scoreUnit: "POINTS";
  readonly batchMatchesSimulated: number;
  readonly shotAttempts: number;
  readonly shotGoals: number;
  readonly shotSuccessRate: number;
  readonly shotPoints: number;
  readonly shotPointsShare: number;
  readonly tryOpportunities: number;
  readonly tryAttempts: number;
  readonly triesScored: number;
  readonly tryPoints: number;
  readonly tryPointsShare: number;
  readonly conversionAttempts: number;
  readonly conversionsMade: number;
  readonly conversionPoints: number;
  readonly conversionPointsShare: number;
  readonly dropOpportunities: number;
  readonly dropCandidatesGenerated: number;
  readonly dropAttempts: number;
  readonly dropGoals: number;
  readonly dropPoints: number;
  readonly dropPointsShare: number;
  readonly shotAttemptsPerMatch: number;
  readonly shotGoalsPerMatch: number;
  readonly tryAttemptsPerMatch: number;
  readonly dropAttemptsPerMatch: number;
  readonly shotQualityDistribution: readonly DiagnosticDistributionRow[];
  readonly shotPhaseDistribution: readonly DiagnosticDistributionRow[];
  readonly shotZoneDistribution: readonly DiagnosticDistributionRow[];
  readonly shotPressureDistribution: readonly DiagnosticDistributionRow[];
  readonly shotCleanWindowDistribution: readonly DiagnosticDistributionRow[];
  readonly shotGoalkeeperOutcomeDistribution: readonly DiagnosticDistributionRow[];
  readonly reboundSecondShotWindowCount: number;
  readonly shotCandidateSelectionCount: number;
  readonly shotCandidateRejectionCount: number;
  readonly shotCandidateSelectionRate: number;
  readonly shotBeatsTryCount: number;
  readonly shotBeatsDropCount: number;
  readonly shotBeatsRecycleCount: number;
  readonly shotLosesToTryCount: number;
  readonly shotLosesToDropCount: number;
  readonly shotLosesToRecycleCount: number;
  readonly routeDominanceCause: RouteDominanceCause;
  readonly warningLevel: CauseSeverity;
  readonly recommendation: ShotDominanceRecommendation;
  readonly causeClassifications: readonly CauseClassificationRow[];
}

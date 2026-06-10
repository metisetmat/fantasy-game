export type ScoringAffordanceRoute =
  | "SHOT_AFFORDANCE"
  | "TRY_TOUCHDOWN_AFFORDANCE"
  | "DROP_GOAL_AFFORDANCE"
  | "CONVERSION_AFFORDANCE"
  | "FUTURE_PENALTY_AFFORDANCE_INACTIVE";

export type ScoringAffordanceVolumeRecommendation =
  | "KEEP_MONITORING"
  | "INSTRUMENT_OFFENSIVE_POSSESSIONS"
  | "INSTRUMENT_DANGER_PHASES"
  | "INCREASE_DANGER_PHASE_GENERATION"
  | "INCREASE_SCORING_AFFORDANCE_VOLUME"
  | "INCREASE_NON_SHOT_AFFORDANCES"
  | "DIAGNOSE_CANDIDATE_SELECTION"
  | "DIAGNOSE_LIVE_VS_BATCH_GAP"
  | "NEEDS_MORE_SAMPLE";

export interface ScoringAffordanceFunnelRow {
  readonly route: ScoringAffordanceRoute;
  readonly affordances: number | "unavailable in current instrumentation";
  readonly candidates: number | "unavailable in current instrumentation";
  readonly selectedCandidates: number | "unavailable in current instrumentation";
  readonly attempts: number | "unavailable in current instrumentation";
  readonly scores: number | "unavailable in current instrumentation";
  readonly conversionRateNotes: string;
}

export interface ScoringAffordanceVolumeSnapshot {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly scoreUnit: "POINTS";
  readonly batchMatchesSimulated: number;
  readonly offensivePossessions: number;
  readonly offensivePossessionsPerMatch: number;
  readonly offensivePossessionsPerTeamPerMatch: number;
  readonly dangerPhases: number;
  readonly dangerPhasesPerMatch: number;
  readonly dangerPhasesPerTeamPerMatch: number;
  readonly dangerPhaseToScoringAffordanceRate: number;
  readonly possessionLinkCoverage: number;
  readonly dangerPhaseLinkCoverage: number;
  readonly possessionDangerRecommendation: string;
  readonly totalKnownScoringAffordances: number;
  readonly totalKnownScoringAffordancesIncludingConversion: number;
  readonly knownScoringAffordancesPerMatch: number;
  readonly knownScoringAffordancesPerTeamPerMatch: number;
  readonly knownScoringAffordancesIncludingConversionPerMatch: number;
  readonly shotAffordances: number;
  readonly shotCandidates: number;
  readonly shotSelected: number;
  readonly shotAttempts: number;
  readonly shotGoals: number;
  readonly tryAffordances: number;
  readonly tryCandidates: number;
  readonly trySelected: number;
  readonly tryAttempts: number;
  readonly triesScored: number;
  readonly dropAffordances: number;
  readonly dropCandidates: number;
  readonly dropSelected: number;
  readonly dropAttempts: number;
  readonly dropGoals: number;
  readonly conversionAffordances: number;
  readonly conversionCandidates: number;
  readonly conversionAttempts: number;
  readonly conversionsMade: number;
  readonly candidateSelectionCoverage: number;
  readonly affordanceToCandidateConversionRate: number;
  readonly candidateToAttemptRate: number;
  readonly attemptToScoreRate: number;
  readonly nonShotAffordanceShare: number;
  readonly previousNonShotAffordanceShare: number;
  readonly nonShotSetupAffordances: number;
  readonly shotOnlyDangerPhases: number;
  readonly nonShotAffordanceGenerationRecommendation: string;
  readonly liveShotAttempts: number;
  readonly liveTryAttempts: number;
  readonly liveDropAttempts: number;
  readonly liveConversions: number;
  readonly liveActiveScoringEvents: number;
  readonly scoringAffordanceStarvationWarning: "AFFORDANCE_STARVATION_WARNING" | "STRONG_AFFORDANCE_STARVATION_WARNING" | "none";
  readonly dangerPhaseStarvationWarning: "DANGER_PHASE_INSTRUMENTATION_WARNING";
  readonly nonShotAffordanceStarvationWarning: "NON_SHOT_AFFORDANCE_STARVATION_WARNING" | "none";
  readonly liveAffordanceStarvationWarning: "LIVE_AFFORDANCE_STARVATION_WARNING" | "none";
  readonly recommendation: ScoringAffordanceVolumeRecommendation;
  readonly funnelRows: readonly ScoringAffordanceFunnelRow[];
}

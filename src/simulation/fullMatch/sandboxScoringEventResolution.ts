export type SandboxScoringEventResolutionStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type SandboxScoringEventResolutionScope =
  | "sandbox_scoring_event_resolution"
  | "production_scoring_forbidden";

export type SandboxScoringEventResolutionOrigin =
  | "none"
  | "sandbox_scoring_event_candidate";

export type SandboxScoringResolutionType =
  | "NO_SCORE_ATTEMPT"
  | "SHOT_OFF_TARGET"
  | "SHOT_ON_TARGET"
  | "SHOT_BLOCKED"
  | "SAVED_BY_GK"
  | "SANDBOX_GOAL_CANDIDATE"
  | "TRY_ATTEMPT_WINDOW"
  | "DROP_ATTEMPT_WINDOW"
  | "NO_SCORE";

export type SandboxGoalkeeperResponse =
  | "not_applicable"
  | "not_evaluated"
  | "positioned"
  | "late_reaction"
  | "save_candidate"
  | "save_success"
  | "save_failure_candidate";

export type SandboxScoringResolutionReason =
  | "NO_SCORING_CANDIDATE"
  | "SHOT_CANDIDATE_AVAILABLE"
  | "CONVERSION_PROBABILITY_LOW"
  | "CONVERSION_PROBABILITY_MEDIUM"
  | "TARGET_ZONE_SUPPORTS_SHOT"
  | "DEFENSIVE_PRESSURE_LIMITS_FINISH"
  | "RECEPTION_QUALITY_SUPPORTS_ATTEMPT"
  | "GOALKEEPER_RESPONSE_NOT_READY"
  | "GOALKEEPER_SAVE_CANDIDATE"
  | "SANDBOX_ONLY"
  | "PRODUCTION_SCORING_FORBIDDEN";

export type SandboxScoringEventResolutionPathResult = {
  readonly pathId: "baseline" | "override";
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly sourceScoringCandidateType?: string;
  readonly sourceScoringCandidateFamily?: string;
  readonly sourceScoringCandidateProbability: number;
  readonly sourceConversionProbability: number;
  readonly sourceOpportunityType?: string;
  readonly sourceRouteOutcome?: string;
  readonly resolutionType: SandboxScoringResolutionType;
  readonly shotAttemptCreated: boolean;
  readonly shotQuality: number;
  readonly defensivePressure: number;
  readonly receptionQuality: number;
  readonly goalkeeperResponse: SandboxGoalkeeperResponse;
  readonly sandboxScoringEventCreated: false;
  readonly sandboxScoreDelta: 0;
  readonly isolatedOnly: true;
  readonly canBecomeOfficialMatchEvent: false;
  readonly canMutateOfficialScore: false;
  readonly canCreateOfficialScoringEvent: false;
  readonly canCreateProductionScoringEvent: false;
  readonly reasons: readonly SandboxScoringResolutionReason[];
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export type SandboxScoringEventResolutionModel = {
  readonly status: SandboxScoringEventResolutionStatus;
  readonly scope: SandboxScoringEventResolutionScope;
  readonly origin: SandboxScoringEventResolutionOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly baseline: SandboxScoringEventResolutionPathResult;
  readonly override: SandboxScoringEventResolutionPathResult;
  readonly baselineShotAttemptCreated: boolean;
  readonly overrideShotAttemptCreated: boolean;
  readonly scoringResolutionTypeDivergenceObserved: boolean;
  readonly shotAttemptCreationDivergenceObserved: boolean;
  readonly shotQualityDivergenceObserved: boolean;
  readonly goalkeeperResponseDivergenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly modelAppliedOnlyInSandbox: boolean;
  readonly modelAppliedToNormalLiveSelection: false;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
  readonly diagnosticOnly: boolean;
  readonly canInjectEventsIntoOfficialTimeline: false;
  readonly canMutateOfficialScore: false;
  readonly canMutateOfficialScoringEvents: false;
  readonly canMutateProductionRouteResolution: false;
  readonly canMutateGlobalRouteSuccessRates: false;
  readonly canCreateProductionScoringEvents: false;
  readonly canClaimGlobalEconomy: false;
  readonly explanation?: string;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptySandboxScoringEventResolutionPathResult(
  pathId: "baseline" | "override",
): SandboxScoringEventResolutionPathResult {
  return {
    pathId,
    sourceScoringCandidateProbability: 0,
    sourceConversionProbability: 0,
    resolutionType: "NO_SCORE_ATTEMPT",
    shotAttemptCreated: false,
    shotQuality: 0,
    defensivePressure: 0,
    receptionQuality: 0,
    goalkeeperResponse: "not_applicable",
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    canCreateProductionScoringEvent: false,
    reasons: ["NO_SCORING_CANDIDATE", "SANDBOX_ONLY", "PRODUCTION_SCORING_FORBIDDEN"],
    tags: [],
    warnings: [],
  };
}

export function emptySandboxScoringEventResolutionModel(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): SandboxScoringEventResolutionModel {
  return {
    status: "not_available",
    scope: "production_scoring_forbidden",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    baseline: emptySandboxScoringEventResolutionPathResult("baseline"),
    override: emptySandboxScoringEventResolutionPathResult("override"),
    baselineShotAttemptCreated: false,
    overrideShotAttemptCreated: false,
    scoringResolutionTypeDivergenceObserved: false,
    shotAttemptCreationDivergenceObserved: false,
    shotQualityDivergenceObserved: false,
    goalkeeperResponseDivergenceObserved: false,
    sandboxScoringEventDivergenceObserved: false,
    sandboxScoreDivergenceObserved: false,
    modelAppliedOnlyInSandbox: false,
    modelAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: 0,
    rejectedUnavailableCandidateCount: 0,
    diagnosticOnly: true,
    canInjectEventsIntoOfficialTimeline: false,
    canMutateOfficialScore: false,
    canMutateOfficialScoringEvents: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    tags: [],
    warnings: input.warnings,
  };
}

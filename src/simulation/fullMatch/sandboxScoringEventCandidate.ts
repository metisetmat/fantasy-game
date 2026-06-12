export type SandboxScoringEventCandidateStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type SandboxScoringEventCandidateScope =
  | "sandbox_scoring_event_candidate"
  | "production_scoring_forbidden";

export type SandboxScoringEventCandidateOrigin =
  | "none"
  | "sandbox_scoring_opportunity_model";

export type SandboxScoringCandidateType =
  | "NO_SCORING_EVENT"
  | "SHOT_CANDIDATE"
  | "TRY_CANDIDATE"
  | "DROP_CANDIDATE"
  | "MIXED_CANDIDATE";

export type SandboxScoringCandidateFamily =
  | "none"
  | "shot"
  | "try"
  | "drop"
  | "mixed"
  | "territorial_danger";

export type SandboxScoringCandidateReason =
  | "NO_OPPORTUNITY"
  | "LOW_OPPORTUNITY_PROBABILITY"
  | "HALF_CHANCE_TERRITORIAL_DANGER"
  | "CLEAR_CHANCE"
  | "TRY_WINDOW"
  | "SHOT_WINDOW"
  | "DROP_WINDOW"
  | "TARGET_ZONE_SUPPORTS_SHOT"
  | "TARGET_ZONE_SUPPORTS_TRY"
  | "TARGET_ZONE_SUPPORTS_DROP"
  | "SANDBOX_ONLY"
  | "PRODUCTION_SCORING_FORBIDDEN";

export type SandboxScoringEventCandidatePathResult = {
  readonly pathId: "baseline" | "override";
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly sourceOpportunityType?: string;
  readonly sourceOpportunityFamily?: string;
  readonly sourceOpportunityProbability: number;
  readonly sourceRouteOutcome?: string;
  readonly sourceDangerProbability: number;
  readonly scoringCandidateType: SandboxScoringCandidateType;
  readonly scoringCandidateFamily: SandboxScoringCandidateFamily;
  readonly scoringCandidateCreated: boolean;
  readonly scoringCandidateProbability: number;
  readonly conversionProbability: number;
  readonly sandboxScoringEventCreated: false;
  readonly sandboxScoreDelta: 0;
  readonly isolatedOnly: true;
  readonly canBecomeOfficialMatchEvent: false;
  readonly canMutateOfficialScore: false;
  readonly canCreateOfficialScoringEvent: false;
  readonly canCreateProductionScoringEvent: false;
  readonly reasons: readonly SandboxScoringCandidateReason[];
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export type SandboxScoringEventCandidateModel = {
  readonly status: SandboxScoringEventCandidateStatus;
  readonly scope: SandboxScoringEventCandidateScope;
  readonly origin: SandboxScoringEventCandidateOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly baseline: SandboxScoringEventCandidatePathResult;
  readonly override: SandboxScoringEventCandidatePathResult;
  readonly baselineScoringCandidateCreated: boolean;
  readonly overrideScoringCandidateCreated: boolean;
  readonly scoringCandidateTypeDivergenceObserved: boolean;
  readonly scoringCandidateFamilyDivergenceObserved: boolean;
  readonly scoringCandidateProbabilityDivergenceObserved: boolean;
  readonly scoringCandidateCreationDivergenceObserved: boolean;
  readonly conversionProbabilityDivergenceObserved: boolean;
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

export function emptySandboxScoringEventCandidatePathResult(
  pathId: "baseline" | "override",
): SandboxScoringEventCandidatePathResult {
  return {
    pathId,
    sourceOpportunityProbability: 0,
    sourceDangerProbability: 0,
    scoringCandidateType: "NO_SCORING_EVENT",
    scoringCandidateFamily: "none",
    scoringCandidateCreated: false,
    scoringCandidateProbability: 0,
    conversionProbability: 0,
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    canCreateProductionScoringEvent: false,
    reasons: ["NO_OPPORTUNITY", "SANDBOX_ONLY", "PRODUCTION_SCORING_FORBIDDEN"],
    tags: [],
    warnings: [],
  };
}

export function emptySandboxScoringEventCandidateModel(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): SandboxScoringEventCandidateModel {
  return {
    status: "not_available",
    scope: "production_scoring_forbidden",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    baseline: emptySandboxScoringEventCandidatePathResult("baseline"),
    override: emptySandboxScoringEventCandidatePathResult("override"),
    baselineScoringCandidateCreated: false,
    overrideScoringCandidateCreated: false,
    scoringCandidateTypeDivergenceObserved: false,
    scoringCandidateFamilyDivergenceObserved: false,
    scoringCandidateProbabilityDivergenceObserved: false,
    scoringCandidateCreationDivergenceObserved: false,
    conversionProbabilityDivergenceObserved: false,
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

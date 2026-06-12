export type SandboxScoringOpportunityStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type SandboxScoringOpportunityScope =
  | "sandbox_scoring_opportunity_model"
  | "production_scoring_forbidden";

export type SandboxScoringOpportunityOrigin =
  | "none"
  | "controlled_route_resolution_sandbox";

export type SandboxScoringOpportunityType =
  | "no_opportunity"
  | "half_chance"
  | "clear_chance"
  | "try_window"
  | "shot_window"
  | "drop_window";

export type SandboxScoringOpportunityFamily =
  | "none"
  | "territorial_danger"
  | "shot"
  | "try"
  | "drop"
  | "mixed";

export type SandboxScoringOpportunityPathResult = {
  readonly pathId: "baseline" | "override";
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly routeOutcome?: string;
  readonly sourceDangerProbability: number;
  readonly sourceScoringOpportunityProbability: number;
  readonly turnoverRisk: number;
  readonly receptionQuality: number;
  readonly defensivePressure: number;
  readonly opportunityType: SandboxScoringOpportunityType;
  readonly opportunityFamily: SandboxScoringOpportunityFamily;
  readonly opportunityProbability: number;
  readonly opportunityCreated: boolean;
  readonly sandboxScoringEventCreated: false;
  readonly sandboxScoreDelta: 0;
  readonly isolatedOnly: true;
  readonly canBecomeOfficialMatchEvent: false;
  readonly canMutateOfficialScore: false;
  readonly canCreateOfficialScoringEvent: false;
  readonly canCreateProductionScoringEvent: false;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export type SandboxScoringOpportunityModel = {
  readonly status: SandboxScoringOpportunityStatus;
  readonly scope: SandboxScoringOpportunityScope;
  readonly origin: SandboxScoringOpportunityOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly baseline: SandboxScoringOpportunityPathResult;
  readonly override: SandboxScoringOpportunityPathResult;
  readonly baselineOpportunityCreated: boolean;
  readonly overrideOpportunityCreated: boolean;
  readonly opportunityTypeDivergenceObserved: boolean;
  readonly opportunityFamilyDivergenceObserved: boolean;
  readonly opportunityProbabilityDivergenceObserved: boolean;
  readonly opportunityCreationDivergenceObserved: boolean;
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

export function emptySandboxScoringOpportunityPathResult(
  pathId: "baseline" | "override",
): SandboxScoringOpportunityPathResult {
  return {
    pathId,
    sourceDangerProbability: 0,
    sourceScoringOpportunityProbability: 0,
    turnoverRisk: 100,
    receptionQuality: 0,
    defensivePressure: 0,
    opportunityType: "no_opportunity",
    opportunityFamily: "none",
    opportunityProbability: 0,
    opportunityCreated: false,
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    canCreateProductionScoringEvent: false,
    tags: [],
    warnings: [],
  };
}

export function emptySandboxScoringOpportunityModel(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): SandboxScoringOpportunityModel {
  return {
    status: "not_available",
    scope: "production_scoring_forbidden",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    baseline: emptySandboxScoringOpportunityPathResult("baseline"),
    override: emptySandboxScoringOpportunityPathResult("override"),
    baselineOpportunityCreated: false,
    overrideOpportunityCreated: false,
    opportunityTypeDivergenceObserved: false,
    opportunityFamilyDivergenceObserved: false,
    opportunityProbabilityDivergenceObserved: false,
    opportunityCreationDivergenceObserved: false,
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

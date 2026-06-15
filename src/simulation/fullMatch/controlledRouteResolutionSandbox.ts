export type ControlledRouteResolutionSandboxStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type ControlledRouteResolutionSandboxScope =
  | "controlled_route_resolution_sandbox"
  | "production_resolution_forbidden";

export type ControlledRouteResolutionSandboxOrigin =
  | "none"
  | "real_isolated_segment_replay";

export type ControlledRouteResolutionOutcome =
  | "safe_retention"
  | "progressive_retention"
  | "dangerous_progression"
  | "turnover"
  | "failed_reception"
  | "scoring_opportunity"
  | "sandbox_score";

export type ControlledRouteResolutionPathResult = {
  readonly pathId: "baseline" | "override";
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly candidateLegal: boolean;
  readonly candidateAvailable: boolean;
  readonly routeResolved: boolean;
  readonly outcome: ControlledRouteResolutionOutcome;
  readonly possessionRetained: boolean;
  readonly resultingCarrierId?: string;
  readonly resultingZone?: string;
  readonly defensivePressure: number;
  readonly receptionQuality: number;
  readonly turnoverRisk: number;
  readonly dangerProbability: number;
  readonly scoringOpportunityProbability: number;
  readonly dangerCreated: boolean;
  readonly scoringOpportunityCreated: boolean;
  readonly sandboxScoringEventCreated: boolean;
  readonly sandboxScoreDelta: number;
  readonly isolatedOnly: true;
  readonly canBecomeOfficialMatchEvent: false;
  readonly canMutateOfficialScore: false;
  readonly canCreateOfficialScoringEvent: false;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export type ControlledRouteResolutionSandbox = {
  readonly status: ControlledRouteResolutionSandboxStatus;
  readonly scope: ControlledRouteResolutionSandboxScope;
  readonly origin: ControlledRouteResolutionSandboxOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly baseline: ControlledRouteResolutionPathResult;
  readonly override: ControlledRouteResolutionPathResult;
  readonly baselineResolved: boolean;
  readonly overrideResolved: boolean;
  readonly selectionDivergenceObserved: boolean;
  readonly carrierDivergenceObserved: boolean;
  readonly zoneProgressionDivergenceObserved: boolean;
  readonly dangerCreationDivergenceObserved: boolean;
  readonly scoringOpportunityDivergenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly sandboxAppliedOnlyInIsolatedResolution: boolean;
  readonly sandboxAppliedToNormalLiveSelection: false;
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

export function emptyControlledRouteResolutionPathResult(
  pathId: "baseline" | "override",
): ControlledRouteResolutionPathResult {
  return {
    pathId,
    candidateLegal: false,
    candidateAvailable: false,
    routeResolved: false,
    outcome: "failed_reception",
    possessionRetained: false,
    defensivePressure: 0,
    receptionQuality: 0,
    turnoverRisk: 100,
    dangerProbability: 0,
    scoringOpportunityProbability: 0,
    dangerCreated: false,
    scoringOpportunityCreated: false,
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    tags: [],
    warnings: [],
  };
}

export function emptyControlledRouteResolutionSandbox(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): ControlledRouteResolutionSandbox {
  return {
    status: "not_available",
    scope: "production_resolution_forbidden",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    baseline: emptyControlledRouteResolutionPathResult("baseline"),
    override: emptyControlledRouteResolutionPathResult("override"),
    baselineResolved: false,
    overrideResolved: false,
    selectionDivergenceObserved: false,
    carrierDivergenceObserved: false,
    zoneProgressionDivergenceObserved: false,
    dangerCreationDivergenceObserved: false,
    scoringOpportunityDivergenceObserved: false,
    sandboxScoringEventDivergenceObserved: false,
    sandboxScoreDivergenceObserved: false,
    sandboxAppliedOnlyInIsolatedResolution: false,
    sandboxAppliedToNormalLiveSelection: false,
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

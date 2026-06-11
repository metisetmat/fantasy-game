export type FullMatchControlledSegmentReplayComparisonStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type FullMatchControlledSegmentReplayComparisonScope =
  | "controlled_segment_replay_comparison"
  | "production_resolution_forbidden";

export type FullMatchControlledSegmentReplayComparisonOrigin =
  | "none"
  | "isolated_minimatch_override_experiment";

export type ControlledSegmentReplayPath = {
  readonly pathId: "baseline" | "override";
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly candidateLegal: boolean;
  readonly candidateAvailable: boolean;
  readonly possessionRetained?: boolean;
  readonly resultingCarrierId?: string;
  readonly resultingZone?: string;
  readonly zoneProgressionDelta?: number;
  readonly dangerCreated?: boolean;
  readonly scoringOpportunityCreated?: boolean;
  readonly scoringEventCreated?: boolean;
  readonly scoreDelta?: number;
  readonly timelineSignature?: string;
  readonly scoreSignature?: string;
  readonly scoringEventSignature?: string;
  readonly warnings: readonly string[];
};

export type FullMatchControlledSegmentReplayComparison = {
  readonly status: FullMatchControlledSegmentReplayComparisonStatus;
  readonly scope: FullMatchControlledSegmentReplayComparisonScope;
  readonly origin: FullMatchControlledSegmentReplayComparisonOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly baseline: ControlledSegmentReplayPath;
  readonly override: ControlledSegmentReplayPath;
  readonly selectionDivergenceObserved: boolean;
  readonly possessionContinuityDivergenceObserved: boolean;
  readonly zoneProgressionDivergenceObserved: boolean;
  readonly dangerCreationDivergenceObserved: boolean;
  readonly scoringOpportunityDivergenceObserved: boolean;
  readonly timelineDivergenceObserved: boolean;
  readonly scoringEventDivergenceObserved: boolean;
  readonly scoreDivergenceObserved: boolean;
  readonly replayAppliedOnlyInIsolatedComparison: boolean;
  readonly replayAppliedToNormalLiveSelection: false;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
  readonly diagnosticOnly: boolean;
  readonly canMutateNormalFullMatchScore: false;
  readonly canMutateNormalFullMatchScoringEvents: false;
  readonly canMutateProductionRouteResolution: false;
  readonly canMutateGlobalRouteSuccessRates: false;
  readonly canCreateProductionScoringEvents: false;
  readonly canClaimGlobalEconomy: false;
  readonly explanation?: string;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptyControlledSegmentReplayComparison(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): FullMatchControlledSegmentReplayComparison {
  const emptyPath = (pathId: "baseline" | "override"): ControlledSegmentReplayPath => ({
    pathId,
    candidateLegal: false,
    candidateAvailable: false,
    warnings: [],
  });

  return {
    status: "not_available",
    scope: "production_resolution_forbidden",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    baseline: emptyPath("baseline"),
    override: emptyPath("override"),
    selectionDivergenceObserved: false,
    possessionContinuityDivergenceObserved: false,
    zoneProgressionDivergenceObserved: false,
    dangerCreationDivergenceObserved: false,
    scoringOpportunityDivergenceObserved: false,
    timelineDivergenceObserved: false,
    scoringEventDivergenceObserved: false,
    scoreDivergenceObserved: false,
    replayAppliedOnlyInIsolatedComparison: false,
    replayAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: 0,
    rejectedUnavailableCandidateCount: 0,
    diagnosticOnly: true,
    canMutateNormalFullMatchScore: false,
    canMutateNormalFullMatchScoringEvents: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    tags: [],
    warnings: input.warnings,
  };
}

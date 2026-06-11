import type { IsolatedSegmentReplayEvent } from "./isolatedSegmentReplayEvent";

export type FullMatchRealIsolatedSegmentReplayStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type FullMatchRealIsolatedSegmentReplayScope =
  | "real_isolated_segment_replay"
  | "production_resolution_forbidden";

export type FullMatchRealIsolatedSegmentReplayOrigin =
  | "none"
  | "controlled_segment_replay_comparison";

export type RealIsolatedSegmentReplayPath = {
  readonly pathId: "baseline" | "override";
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly candidateLegal: boolean;
  readonly candidateAvailable: boolean;
  readonly events: readonly IsolatedSegmentReplayEvent[];
  readonly eventCount: number;
  readonly possessionRetained?: boolean;
  readonly resultingCarrierId?: string;
  readonly resultingZone?: string;
  readonly zoneProgressionDelta?: number;
  readonly dangerCreated?: boolean;
  readonly scoringOpportunityCreated?: boolean;
  readonly isolatedScoringEventCreated?: boolean;
  readonly isolatedScoreDelta?: number;
  readonly timelineSignature?: string;
  readonly isolatedScoreSignature?: string;
  readonly isolatedScoringEventSignature?: string;
  readonly warnings: readonly string[];
};

export type FullMatchRealIsolatedSegmentReplay = {
  readonly status: FullMatchRealIsolatedSegmentReplayStatus;
  readonly scope: FullMatchRealIsolatedSegmentReplayScope;
  readonly origin: FullMatchRealIsolatedSegmentReplayOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly baseline: RealIsolatedSegmentReplayPath;
  readonly override: RealIsolatedSegmentReplayPath;
  readonly baselineEventCount: number;
  readonly overrideEventCount: number;
  readonly selectionDivergenceObserved: boolean;
  readonly possessionContinuityDivergenceObserved: boolean;
  readonly carrierDivergenceObserved: boolean;
  readonly zoneProgressionDivergenceObserved: boolean;
  readonly dangerCreationDivergenceObserved: boolean;
  readonly scoringOpportunityDivergenceObserved: boolean;
  readonly isolatedTimelineDivergenceObserved: boolean;
  readonly isolatedScoringEventDivergenceObserved: boolean;
  readonly isolatedScoreDivergenceObserved: boolean;
  readonly replayAppliedOnlyInIsolatedEngine: boolean;
  readonly replayAppliedToNormalLiveSelection: false;
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

export function emptyRealIsolatedSegmentReplay(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): FullMatchRealIsolatedSegmentReplay {
  const emptyPath = (pathId: "baseline" | "override"): RealIsolatedSegmentReplayPath => ({
    pathId,
    candidateLegal: false,
    candidateAvailable: false,
    events: [],
    eventCount: 0,
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
    baselineEventCount: 0,
    overrideEventCount: 0,
    selectionDivergenceObserved: false,
    possessionContinuityDivergenceObserved: false,
    carrierDivergenceObserved: false,
    zoneProgressionDivergenceObserved: false,
    dangerCreationDivergenceObserved: false,
    scoringOpportunityDivergenceObserved: false,
    isolatedTimelineDivergenceObserved: false,
    isolatedScoringEventDivergenceObserved: false,
    isolatedScoreDivergenceObserved: false,
    replayAppliedOnlyInIsolatedEngine: false,
    replayAppliedToNormalLiveSelection: false,
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

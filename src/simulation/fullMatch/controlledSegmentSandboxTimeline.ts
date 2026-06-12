import type {
  SandboxSequenceReplayStatus,
  SandboxSequenceStepSource,
  SandboxSequenceStepType,
  SandboxSequenceTeamCandidate,
} from "./sandboxSequenceReplay";

export type ControlledSegmentSandboxTimelineStatus = SandboxSequenceReplayStatus;

export type ControlledSegmentSandboxTimelineScope =
  | "controlled_segment_sandbox_timeline"
  | "production_scoring_forbidden";

export type ControlledSegmentSandboxTimelineOrigin =
  | "none"
  | "sandbox_sequence_replay";

export type ControlledSegmentSandboxTimelineEventType =
  | "sandbox_sequence_start"
  | "sandbox_baseline_route_reference"
  | "sandbox_route_resolved"
  | "sandbox_no_scoring_opportunity"
  | "sandbox_opportunity_classified"
  | "sandbox_no_scoring_event_candidate"
  | "sandbox_scoring_candidate_created"
  | "sandbox_no_score_attempt"
  | "sandbox_shot_resolved"
  | "sandbox_no_goalkeeper_response"
  | "sandbox_goalkeeper_response"
  | "sandbox_no_rebound"
  | "sandbox_rebound_state"
  | "sandbox_no_continuation"
  | "sandbox_continuation_action"
  | "sandbox_sequence_end";

export type ControlledSegmentSandboxTimelineEvent = {
  readonly sandboxEventId: string;
  readonly sandboxIndex: number;
  readonly sandboxMinuteOffset: number;
  readonly eventType: ControlledSegmentSandboxTimelineEventType;
  readonly sourceStepId: string;
  readonly sourceStepType: SandboxSequenceStepType;
  readonly sourceStepSource: SandboxSequenceStepSource;
  readonly pathId: "baseline" | "override";
  readonly actorId?: string;
  readonly teamCandidate?: SandboxSequenceTeamCandidate;
  readonly targetZone?: string;
  readonly outcome?: string;
  readonly confidence: number;
  readonly createsOfficialMatchEvent: false;
  readonly insertedIntoOfficialTimeline: false;
  readonly mutatesOfficialTimeline: false;
  readonly mutatesOfficialPossession: false;
  readonly mutatesOfficialScore: false;
  readonly mutatesOfficialScoringEvents: false;
  readonly createsProductionScoringEvent: false;
  readonly mutatesProductionRouteResolution: false;
  readonly mutatesGlobalRouteSuccessRates: false;
  readonly reasons: readonly string[];
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export type ControlledSegmentSandboxTimelinePath = {
  readonly pathId: "baseline" | "override";
  readonly status: ControlledSegmentSandboxTimelineStatus;
  readonly events: readonly ControlledSegmentSandboxTimelineEvent[];
  readonly eventCount: number;
  readonly firstEventType?: ControlledSegmentSandboxTimelineEventType;
  readonly finalEventType?: ControlledSegmentSandboxTimelineEventType;
  readonly finalOutcome?: string;
  readonly finalTeamCandidate?: string;
  readonly finalActorCandidate?: string;
  readonly finalZoneCandidate?: string;
  readonly officialTimelineEventCreatedCount: 0;
  readonly officialTimelineMutationCount: 0;
  readonly officialPossessionMutationCount: 0;
  readonly officialScoreMutationCount: 0;
  readonly officialScoringEventMutationCount: 0;
  readonly productionScoringEventCreationCount: 0;
};

export type ControlledSegmentSandboxTimelineModel = {
  readonly status: ControlledSegmentSandboxTimelineStatus;
  readonly scope: ControlledSegmentSandboxTimelineScope;
  readonly origin: ControlledSegmentSandboxTimelineOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly baseline: ControlledSegmentSandboxTimelinePath;
  readonly override: ControlledSegmentSandboxTimelinePath;
  readonly baselineEventCount: number;
  readonly overrideEventCount: number;
  readonly sandboxTimelineCreated: boolean;
  readonly sandboxTimelineSeparateFromOfficialTimeline: boolean;
  readonly sandboxTimelineEventCountDivergenceObserved: boolean;
  readonly sandboxTimelineOutcomeDivergenceObserved: boolean;
  readonly sandboxTimelineFinalTeamDivergenceObserved: boolean;
  readonly sandboxTimelineFinalZoneDivergenceObserved: boolean;
  readonly officialTimelineDivergenceObserved: false;
  readonly officialPossessionDivergenceObserved: false;
  readonly officialScoreDivergenceObserved: false;
  readonly officialScoringEventDivergenceObserved: false;
  readonly modelAppliedOnlyInSandbox: boolean;
  readonly modelAppliedToNormalLiveSelection: false;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
  readonly diagnosticOnly: boolean;
  readonly canInjectEventsIntoOfficialTimeline: false;
  readonly canMutateOfficialScore: false;
  readonly canMutateOfficialScoringEvents: false;
  readonly canMutateOfficialPossession: false;
  readonly canMutateOfficialTimeline: false;
  readonly canMutateProductionRouteResolution: false;
  readonly canMutateGlobalRouteSuccessRates: false;
  readonly canCreateProductionScoringEvents: false;
  readonly canClaimGlobalEconomy: false;
  readonly explanation?: string;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptyControlledSegmentSandboxTimelinePath(pathId: "baseline" | "override"): ControlledSegmentSandboxTimelinePath {
  return {
    pathId,
    status: "not_available",
    events: [],
    eventCount: 0,
    officialTimelineEventCreatedCount: 0,
    officialTimelineMutationCount: 0,
    officialPossessionMutationCount: 0,
    officialScoreMutationCount: 0,
    officialScoringEventMutationCount: 0,
    productionScoringEventCreationCount: 0,
  };
}

export function emptyControlledSegmentSandboxTimelineModel(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): ControlledSegmentSandboxTimelineModel {
  return {
    status: "not_available",
    scope: "production_scoring_forbidden",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    baseline: emptyControlledSegmentSandboxTimelinePath("baseline"),
    override: emptyControlledSegmentSandboxTimelinePath("override"),
    baselineEventCount: 0,
    overrideEventCount: 0,
    sandboxTimelineCreated: false,
    sandboxTimelineSeparateFromOfficialTimeline: true,
    sandboxTimelineEventCountDivergenceObserved: false,
    sandboxTimelineOutcomeDivergenceObserved: false,
    sandboxTimelineFinalTeamDivergenceObserved: false,
    sandboxTimelineFinalZoneDivergenceObserved: false,
    officialTimelineDivergenceObserved: false,
    officialPossessionDivergenceObserved: false,
    officialScoreDivergenceObserved: false,
    officialScoringEventDivergenceObserved: false,
    modelAppliedOnlyInSandbox: false,
    modelAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: 0,
    rejectedUnavailableCandidateCount: 0,
    diagnosticOnly: true,
    canInjectEventsIntoOfficialTimeline: false,
    canMutateOfficialScore: false,
    canMutateOfficialScoringEvents: false,
    canMutateOfficialPossession: false,
    canMutateOfficialTimeline: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    tags: [],
    warnings: input.warnings,
  };
}

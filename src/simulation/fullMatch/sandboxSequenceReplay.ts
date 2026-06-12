export type SandboxSequenceReplayStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type SandboxSequenceReplayScope =
  | "sandbox_sequence_replay"
  | "production_scoring_forbidden";

export type SandboxSequenceReplayOrigin =
  | "none"
  | "multi_action_continuation_sandbox";

export type SandboxSequenceStepType =
  | "SANDBOX_SEQUENCE_START"
  | "BASELINE_ROUTE_REFERENCE"
  | "CONTROLLED_ROUTE_RESOLVED"
  | "SCORING_OPPORTUNITY_CLASSIFIED"
  | "SCORING_EVENT_CANDIDATE_CREATED"
  | "SHOT_RESOLVED"
  | "GOALKEEPER_RESPONSE_RESOLVED"
  | "REBOUND_STATE_RESOLVED"
  | "CONTINUATION_ACTION_RESOLVED"
  | "NO_SCORING_OPPORTUNITY"
  | "NO_SCORING_EVENT_CANDIDATE"
  | "NO_SCORE_ATTEMPT"
  | "NO_GOALKEEPER_RESPONSE"
  | "NO_REBOUND"
  | "NO_CONTINUATION"
  | "SANDBOX_SEQUENCE_END";

export type SandboxSequenceStepSource =
  | "controlled_route_resolution_sandbox"
  | "sandbox_scoring_opportunity_model"
  | "sandbox_scoring_event_candidate_model"
  | "sandbox_scoring_event_resolution_model"
  | "attribute_driven_shot_resolution_sandbox"
  | "goalkeeper_response_model_sandbox"
  | "rebound_second_chance_sandbox"
  | "multi_action_continuation_sandbox"
  | "sequence_replay_synthetic_wrapper";

export type SandboxSequenceTeamCandidate =
  | "none"
  | "control"
  | "blitz"
  | "goalkeeper_team"
  | "attacking_team"
  | "defending_team"
  | "contested";

export type SandboxSequenceStep = {
  readonly stepId: string;
  readonly stepIndex: number;
  readonly stepType: SandboxSequenceStepType;
  readonly source: SandboxSequenceStepSource;
  readonly pathId: "baseline" | "override";
  readonly actorId?: string;
  readonly teamCandidate?: SandboxSequenceTeamCandidate;
  readonly targetZone?: string;
  readonly outcome?: string;
  readonly confidence: number;
  readonly createsSandboxContinuation: boolean;
  readonly createsSandboxMatchEvent: false;
  readonly createsSandboxScoringEvent: false;
  readonly createsOfficialMatchEvent: false;
  readonly mutatesOfficialTimeline: false;
  readonly mutatesOfficialPossession: false;
  readonly mutatesOfficialScore: false;
  readonly mutatesOfficialScoringEvents: false;
  readonly createsProductionScoringEvent: false;
  readonly reasons: readonly string[];
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export type SandboxSequenceReplayPath = {
  readonly pathId: "baseline" | "override";
  readonly status: SandboxSequenceReplayStatus;
  readonly steps: readonly SandboxSequenceStep[];
  readonly stepCount: number;
  readonly firstStepType?: SandboxSequenceStepType;
  readonly finalStepType?: SandboxSequenceStepType;
  readonly finalOutcome?: string;
  readonly finalTeamCandidate?: string;
  readonly finalActorCandidate?: string;
  readonly finalZoneCandidate?: string;
  readonly sandboxContinuationCreated: boolean;
  readonly sandboxMatchEventCreatedCount: 0;
  readonly sandboxScoringEventCreatedCount: 0;
  readonly sandboxScoreDeltaTotal: 0;
  readonly officialPossessionMutationCount: 0;
  readonly officialTimelineMutationCount: 0;
};

export type SandboxSequenceReplayModel = {
  readonly status: SandboxSequenceReplayStatus;
  readonly scope: SandboxSequenceReplayScope;
  readonly origin: SandboxSequenceReplayOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly baseline: SandboxSequenceReplayPath;
  readonly override: SandboxSequenceReplayPath;
  readonly baselineStepCount: number;
  readonly overrideStepCount: number;
  readonly sequenceStepCountDivergenceObserved: boolean;
  readonly sequenceOutcomeDivergenceObserved: boolean;
  readonly sequenceFinalTeamDivergenceObserved: boolean;
  readonly sequenceFinalZoneDivergenceObserved: boolean;
  readonly sandboxMatchEventDivergenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly officialPossessionDivergenceObserved: false;
  readonly officialTimelineDivergenceObserved: false;
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

export function emptySandboxSequenceReplayPath(pathId: "baseline" | "override"): SandboxSequenceReplayPath {
  return {
    pathId,
    status: "not_available",
    steps: [],
    stepCount: 0,
    sandboxContinuationCreated: false,
    sandboxMatchEventCreatedCount: 0,
    sandboxScoringEventCreatedCount: 0,
    sandboxScoreDeltaTotal: 0,
    officialPossessionMutationCount: 0,
    officialTimelineMutationCount: 0,
  };
}

export function emptySandboxSequenceReplayModel(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): SandboxSequenceReplayModel {
  return {
    status: "not_available",
    scope: "production_scoring_forbidden",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    baseline: emptySandboxSequenceReplayPath("baseline"),
    override: emptySandboxSequenceReplayPath("override"),
    baselineStepCount: 0,
    overrideStepCount: 0,
    sequenceStepCountDivergenceObserved: false,
    sequenceOutcomeDivergenceObserved: false,
    sequenceFinalTeamDivergenceObserved: false,
    sequenceFinalZoneDivergenceObserved: false,
    sandboxMatchEventDivergenceObserved: false,
    sandboxScoringEventDivergenceObserved: false,
    sandboxScoreDivergenceObserved: false,
    officialPossessionDivergenceObserved: false,
    officialTimelineDivergenceObserved: false,
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

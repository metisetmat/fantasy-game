import type { MatchEvent } from "../../contracts/engineToCoach";

export type OfficialTimelineDiffStatus = "not_available" | "available" | "blocked" | "partial" | "failed";

export type OfficialTimelineDiffScope =
  | "official_timeline_diff_view"
  | "production_scoring_forbidden";

export type OfficialTimelineDiffOrigin =
  | "none"
  | "controlled_segment_sandbox_timeline";

export type TimelineDiffPathId = "baseline" | "override";

export type TimelineDiffEventClass =
  | "official_only"
  | "sandbox_only"
  | "matched_reference"
  | "metadata_only";

export type OfficialTimelineSnapshot = {
  readonly eventCount: number;
  readonly scoringEventCount: number;
  readonly scoreTotal: number;
  readonly scoreDisplay: string;
  readonly possessionTeamId?: string;
  readonly eventSignature: string;
};

export type TimelineDiffEntry = {
  readonly diffEntryId: string;
  readonly pathId: TimelineDiffPathId;
  readonly eventClass: TimelineDiffEventClass;
  readonly officialEventId?: string;
  readonly officialEventType?: MatchEvent["eventType"];
  readonly officialMinute?: number;
  readonly sandboxEventId?: string;
  readonly sandboxEventType?: string;
  readonly sandboxMinuteOffset?: number;
  readonly actorId?: string;
  readonly teamCandidate?: string;
  readonly targetZone?: string;
  readonly outcome?: string;
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

export type OfficialTimelineDiffPath = {
  readonly pathId: TimelineDiffPathId;
  readonly status: OfficialTimelineDiffStatus;
  readonly officialTimelineEventCountBefore: number;
  readonly officialTimelineEventCountAfter: number;
  readonly officialTimelineEventCountDelta: 0;
  readonly officialScoringEventCountBefore: number;
  readonly officialScoringEventCountAfter: number;
  readonly officialScoringEventCountDelta: 0;
  readonly officialScoreBefore: number;
  readonly officialScoreAfter: number;
  readonly officialScoreDelta: 0;
  readonly officialScoreDisplayBefore: string;
  readonly officialScoreDisplayAfter: string;
  readonly officialPossessionBefore?: string;
  readonly officialPossessionAfter?: string;
  readonly officialPossessionChanged: false;
  readonly officialOnlyEventCount: number;
  readonly sandboxOnlyEventCount: number;
  readonly matchedReferenceEventCount: number;
  readonly metadataOnlyEventCount: number;
  readonly sandboxEventsInsertedIntoOfficialTimelineCount: 0;
  readonly officialTimelineMutationCount: 0;
  readonly officialPossessionMutationCount: 0;
  readonly officialScoreMutationCount: 0;
  readonly officialScoringEventMutationCount: 0;
  readonly productionScoringEventCreationCount: 0;
  readonly productionRouteResolutionMutationCount: 0;
  readonly globalRouteSuccessMutationCount: 0;
  readonly globalEconomyClaimCount: 0;
  readonly finalSandboxOutcome?: string;
  readonly finalSandboxTeamCandidate?: string;
  readonly finalSandboxActorCandidate?: string;
  readonly finalSandboxZoneCandidate?: string;
  readonly officialTimelineDivergenceObserved: false;
  readonly officialPossessionDivergenceObserved: false;
  readonly officialScoreDivergenceObserved: false;
  readonly officialScoringEventDivergenceObserved: false;
  readonly diffEntries: readonly TimelineDiffEntry[];
};

export type OfficialTimelineDiffViewModel = {
  readonly status: OfficialTimelineDiffStatus;
  readonly scope: OfficialTimelineDiffScope;
  readonly origin: OfficialTimelineDiffOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly baseline: OfficialTimelineDiffPath;
  readonly override: OfficialTimelineDiffPath;
  readonly baselineSandboxOnlyEventCount: number;
  readonly overrideSandboxOnlyEventCount: number;
  readonly officialOnlyEventCount: number;
  readonly matchedReferenceEventCount: number;
  readonly officialTimelineEventCountBefore: number;
  readonly officialTimelineEventCountAfter: number;
  readonly officialTimelineEventCountDelta: 0;
  readonly officialScoringEventCountBefore: number;
  readonly officialScoringEventCountAfter: number;
  readonly officialScoringEventCountDelta: 0;
  readonly officialScoreBefore: number;
  readonly officialScoreAfter: number;
  readonly officialScoreDelta: 0;
  readonly officialScoreDisplayBefore: string;
  readonly officialScoreDisplayAfter: string;
  readonly officialPossessionBefore?: string;
  readonly officialPossessionAfter?: string;
  readonly officialPossessionChanged: false;
  readonly sandboxTimelineSeparateFromOfficialTimeline: boolean;
  readonly sandboxOutcomeDivergenceObserved: boolean;
  readonly sandboxFinalTeamDivergenceObserved: boolean;
  readonly sandboxFinalZoneDivergenceObserved: boolean;
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
  readonly globalRouteSuccessMutationCount: 0;
  readonly explanation?: string;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptyOfficialTimelineDiffPath(input: {
  readonly pathId: TimelineDiffPathId;
  readonly status: OfficialTimelineDiffStatus;
  readonly before?: OfficialTimelineSnapshot;
  readonly after?: OfficialTimelineSnapshot;
  readonly warnings?: readonly string[];
}): OfficialTimelineDiffPath {
  const before = input.before;
  const after = input.after ?? before;

  return {
    pathId: input.pathId,
    status: input.status,
    officialTimelineEventCountBefore: before?.eventCount ?? 0,
    officialTimelineEventCountAfter: after?.eventCount ?? 0,
    officialTimelineEventCountDelta: 0,
    officialScoringEventCountBefore: before?.scoringEventCount ?? 0,
    officialScoringEventCountAfter: after?.scoringEventCount ?? 0,
    officialScoringEventCountDelta: 0,
    officialScoreBefore: before?.scoreTotal ?? 0,
    officialScoreAfter: after?.scoreTotal ?? 0,
    officialScoreDelta: 0,
    officialScoreDisplayBefore: before?.scoreDisplay ?? "0-0",
    officialScoreDisplayAfter: after?.scoreDisplay ?? "0-0",
    ...(before?.possessionTeamId === undefined ? {} : { officialPossessionBefore: before.possessionTeamId }),
    ...(after?.possessionTeamId === undefined ? {} : { officialPossessionAfter: after.possessionTeamId }),
    officialPossessionChanged: false,
    officialOnlyEventCount: before?.eventCount ?? 0,
    sandboxOnlyEventCount: 0,
    matchedReferenceEventCount: 0,
    metadataOnlyEventCount: 0,
    sandboxEventsInsertedIntoOfficialTimelineCount: 0,
    officialTimelineMutationCount: 0,
    officialPossessionMutationCount: 0,
    officialScoreMutationCount: 0,
    officialScoringEventMutationCount: 0,
    productionScoringEventCreationCount: 0,
    productionRouteResolutionMutationCount: 0,
    globalRouteSuccessMutationCount: 0,
    globalEconomyClaimCount: 0,
    officialTimelineDivergenceObserved: false,
    officialPossessionDivergenceObserved: false,
    officialScoreDivergenceObserved: false,
    officialScoringEventDivergenceObserved: false,
    diffEntries: [],
  };
}

export function emptyOfficialTimelineDiffViewModel(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): OfficialTimelineDiffViewModel {
  return {
    status: "not_available",
    scope: "production_scoring_forbidden",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    baseline: emptyOfficialTimelineDiffPath({ pathId: "baseline", status: "not_available" }),
    override: emptyOfficialTimelineDiffPath({ pathId: "override", status: "not_available" }),
    baselineSandboxOnlyEventCount: 0,
    overrideSandboxOnlyEventCount: 0,
    officialOnlyEventCount: 0,
    matchedReferenceEventCount: 0,
    officialTimelineEventCountBefore: 0,
    officialTimelineEventCountAfter: 0,
    officialTimelineEventCountDelta: 0,
    officialScoringEventCountBefore: 0,
    officialScoringEventCountAfter: 0,
    officialScoringEventCountDelta: 0,
    officialScoreBefore: 0,
    officialScoreAfter: 0,
    officialScoreDelta: 0,
    officialScoreDisplayBefore: "0-0",
    officialScoreDisplayAfter: "0-0",
    officialPossessionChanged: false,
    sandboxTimelineSeparateFromOfficialTimeline: true,
    sandboxOutcomeDivergenceObserved: false,
    sandboxFinalTeamDivergenceObserved: false,
    sandboxFinalZoneDivergenceObserved: false,
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
    globalRouteSuccessMutationCount: 0,
    tags: [],
    warnings: input.warnings,
  };
}

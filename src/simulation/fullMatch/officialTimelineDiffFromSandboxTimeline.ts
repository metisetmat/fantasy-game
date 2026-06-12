import type { MatchEvent, MatchInput } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";
import type {
  ControlledSegmentSandboxTimelineModel,
  ControlledSegmentSandboxTimelinePath,
} from "./controlledSegmentSandboxTimeline";
import { buildOfficialTimelineDiffEntry } from "./buildOfficialTimelineDiffEntry";
import { compareOfficialTimelineDiffPaths } from "./compareOfficialTimelineDiffPaths";
import { createOfficialTimelineSnapshot } from "./createOfficialTimelineSnapshot";
import {
  emptyOfficialTimelineDiffViewModel,
  type OfficialTimelineDiffPath,
  type OfficialTimelineDiffStatus,
  type OfficialTimelineDiffViewModel,
  type TimelineDiffPathId,
} from "./officialTimelineDiffView";

function statusForControlledTimeline(model: ControlledSegmentSandboxTimelineModel): OfficialTimelineDiffStatus {
  if (model.status === "available") {
    return "available";
  }

  if (model.status === "failed" || model.status === "blocked" || model.status === "partial") {
    return model.status;
  }

  return "not_available";
}

function pathFromSandboxTimeline(input: {
  readonly pathId: TimelineDiffPathId;
  readonly status: OfficialTimelineDiffStatus;
  readonly officialTimeline: readonly MatchEvent[];
  readonly sandboxPath: ControlledSegmentSandboxTimelinePath;
  readonly before: ReturnType<typeof createOfficialTimelineSnapshot>;
  readonly after: ReturnType<typeof createOfficialTimelineSnapshot>;
}): OfficialTimelineDiffPath {
  const metadataEntry = buildOfficialTimelineDiffEntry({
    pathId: input.pathId,
    eventClass: "metadata_only",
    reason: "Official timeline snapshot is represented as metadata only; no official MatchEvent is created by this diff view.",
  });
  const sandboxEntries = input.sandboxPath.events.map((sandboxEvent) =>
    buildOfficialTimelineDiffEntry({
      pathId: input.pathId,
      eventClass: "sandbox_only",
      sandboxEvent,
      reason: "Sandbox timeline event is shown only for comparison and is not inserted into the official MatchReport timeline.",
    })
  );
  const diffEntries = [metadataEntry, ...sandboxEntries];

  return {
    pathId: input.pathId,
    status: input.status,
    officialTimelineEventCountBefore: input.before.eventCount,
    officialTimelineEventCountAfter: input.after.eventCount,
    officialTimelineEventCountDelta: 0,
    officialScoringEventCountBefore: input.before.scoringEventCount,
    officialScoringEventCountAfter: input.after.scoringEventCount,
    officialScoringEventCountDelta: 0,
    officialScoreBefore: input.before.scoreTotal,
    officialScoreAfter: input.after.scoreTotal,
    officialScoreDelta: 0,
    officialScoreDisplayBefore: input.before.scoreDisplay,
    officialScoreDisplayAfter: input.after.scoreDisplay,
    ...(input.before.possessionTeamId === undefined ? {} : { officialPossessionBefore: input.before.possessionTeamId }),
    ...(input.after.possessionTeamId === undefined ? {} : { officialPossessionAfter: input.after.possessionTeamId }),
    officialPossessionChanged: false,
    officialOnlyEventCount: input.officialTimeline.length,
    sandboxOnlyEventCount: input.sandboxPath.eventCount,
    matchedReferenceEventCount: 0,
    metadataOnlyEventCount: 1,
    sandboxEventsInsertedIntoOfficialTimelineCount: 0,
    officialTimelineMutationCount: 0,
    officialPossessionMutationCount: 0,
    officialScoreMutationCount: 0,
    officialScoringEventMutationCount: 0,
    productionScoringEventCreationCount: 0,
    productionRouteResolutionMutationCount: 0,
    globalRouteSuccessMutationCount: 0,
    globalEconomyClaimCount: 0,
    ...(input.sandboxPath.finalOutcome === undefined ? {} : { finalSandboxOutcome: input.sandboxPath.finalOutcome }),
    ...(input.sandboxPath.finalTeamCandidate === undefined ? {} : { finalSandboxTeamCandidate: input.sandboxPath.finalTeamCandidate }),
    ...(input.sandboxPath.finalActorCandidate === undefined ? {} : { finalSandboxActorCandidate: input.sandboxPath.finalActorCandidate }),
    ...(input.sandboxPath.finalZoneCandidate === undefined ? {} : { finalSandboxZoneCandidate: input.sandboxPath.finalZoneCandidate }),
    officialTimelineDivergenceObserved: false,
    officialPossessionDivergenceObserved: false,
    officialScoreDivergenceObserved: false,
    officialScoringEventDivergenceObserved: false,
    diffEntries,
  };
}

export function officialTimelineDiffCannotMutateOfficialFullMatch(model: OfficialTimelineDiffViewModel): boolean {
  const entries = [...model.baseline.diffEntries, ...model.override.diffEntries];

  return (
    !model.canInjectEventsIntoOfficialTimeline &&
    !model.canMutateOfficialScore &&
    !model.canMutateOfficialScoringEvents &&
    !model.canMutateOfficialPossession &&
    !model.canMutateOfficialTimeline &&
    !model.canMutateProductionRouteResolution &&
    !model.canMutateGlobalRouteSuccessRates &&
    !model.canCreateProductionScoringEvents &&
    !model.modelAppliedToNormalLiveSelection &&
    model.officialTimelineEventCountDelta === 0 &&
    model.officialScoringEventCountDelta === 0 &&
    model.officialScoreDelta === 0 &&
    !model.officialPossessionChanged &&
    entries.every((entry) =>
      !entry.createsOfficialMatchEvent &&
      !entry.insertedIntoOfficialTimeline &&
      !entry.mutatesOfficialTimeline &&
      !entry.mutatesOfficialPossession &&
      !entry.mutatesOfficialScore &&
      !entry.mutatesOfficialScoringEvents &&
      !entry.createsProductionScoringEvent &&
      !entry.mutatesProductionRouteResolution &&
      !entry.mutatesGlobalRouteSuccessRates
    )
  );
}

export function officialTimelineDiffCannotClaimGlobalEconomy(model: OfficialTimelineDiffViewModel): boolean {
  return !model.canClaimGlobalEconomy && model.globalRouteSuccessMutationCount === 0;
}

export function validateOfficialTimelineDiffViewModel(model: OfficialTimelineDiffViewModel): readonly string[] {
  const shouldValidate = model.status === "available";

  return [
    ...(shouldValidate && model.origin !== "controlled_segment_sandbox_timeline"
      ? ["OFFICIAL_TIMELINE_DIFF_VIEW_WRONG_ORIGIN"]
      : []),
    ...(shouldValidate && model.baselineSandboxOnlyEventCount !== 9
      ? ["OFFICIAL_TIMELINE_DIFF_VIEW_BASELINE_SANDBOX_ONLY_EVENT_COUNT_NOT_9"]
      : []),
    ...(shouldValidate && model.overrideSandboxOnlyEventCount !== 9
      ? ["OFFICIAL_TIMELINE_DIFF_VIEW_OVERRIDE_SANDBOX_ONLY_EVENT_COUNT_NOT_9"]
      : []),
    ...(shouldValidate && model.officialTimelineEventCountDelta !== 0
      ? ["OFFICIAL_TIMELINE_DIFF_VIEW_OFFICIAL_EVENT_DELTA_NOT_ZERO"]
      : []),
    ...(shouldValidate && model.officialScoringEventCountDelta !== 0
      ? ["OFFICIAL_TIMELINE_DIFF_VIEW_OFFICIAL_SCORING_EVENT_DELTA_NOT_ZERO"]
      : []),
    ...(shouldValidate && model.officialScoreDelta !== 0
      ? ["OFFICIAL_TIMELINE_DIFF_VIEW_OFFICIAL_SCORE_DELTA_NOT_ZERO"]
      : []),
    ...(shouldValidate && model.officialPossessionChanged
      ? ["OFFICIAL_TIMELINE_DIFF_VIEW_OFFICIAL_POSSESSION_CHANGED"]
      : []),
    ...(shouldValidate && model.officialTimelineDivergenceObserved
      ? ["OFFICIAL_TIMELINE_DIFF_VIEW_OFFICIAL_TIMELINE_DIVERGED"]
      : []),
    ...(shouldValidate && !model.sandboxOutcomeDivergenceObserved
      ? ["OFFICIAL_TIMELINE_DIFF_VIEW_SANDBOX_OUTCOME_DIVERGENCE_NOT_VISIBLE"]
      : []),
    ...(shouldValidate && !model.sandboxTimelineSeparateFromOfficialTimeline
      ? ["OFFICIAL_TIMELINE_DIFF_VIEW_SANDBOX_NOT_SEPARATE"]
      : []),
    ...(!officialTimelineDiffCannotMutateOfficialFullMatch(model)
      ? ["OFFICIAL_TIMELINE_DIFF_VIEW_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!officialTimelineDiffCannotClaimGlobalEconomy(model)
      ? ["OFFICIAL_TIMELINE_DIFF_VIEW_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
  ];
}

export function officialTimelineDiffFromSandboxTimeline(input: {
  readonly matchInput: MatchInput;
  readonly officialTimeline: readonly MatchEvent[];
  readonly officialScore: ScoreState;
  readonly controlledSegmentSandboxTimelineModel: ControlledSegmentSandboxTimelineModel;
}): OfficialTimelineDiffViewModel {
  if (input.controlledSegmentSandboxTimelineModel.status === "not_available") {
    return emptyOfficialTimelineDiffViewModel({
      ...(input.controlledSegmentSandboxTimelineModel.segmentLabel === undefined
        ? {}
        : { segmentLabel: input.controlledSegmentSandboxTimelineModel.segmentLabel }),
      ...(input.controlledSegmentSandboxTimelineModel.chainId === undefined
        ? {}
        : { chainId: input.controlledSegmentSandboxTimelineModel.chainId }),
      warnings: input.controlledSegmentSandboxTimelineModel.warnings,
    });
  }

  const status = statusForControlledTimeline(input.controlledSegmentSandboxTimelineModel);
  const before = createOfficialTimelineSnapshot({
    timeline: input.officialTimeline,
    score: input.officialScore,
    homeTeamId: input.matchInput.homeTeam.teamId,
    awayTeamId: input.matchInput.awayTeam.teamId,
  });
  const after = createOfficialTimelineSnapshot({
    timeline: input.officialTimeline,
    score: input.officialScore,
    homeTeamId: input.matchInput.homeTeam.teamId,
    awayTeamId: input.matchInput.awayTeam.teamId,
  });
  const baseline = pathFromSandboxTimeline({
    pathId: "baseline",
    status,
    officialTimeline: input.officialTimeline,
    sandboxPath: input.controlledSegmentSandboxTimelineModel.baseline,
    before,
    after,
  });
  const override = pathFromSandboxTimeline({
    pathId: "override",
    status,
    officialTimeline: input.officialTimeline,
    sandboxPath: input.controlledSegmentSandboxTimelineModel.override,
    before,
    after,
  });
  const comparison = compareOfficialTimelineDiffPaths({ baseline, override });
  const result: OfficialTimelineDiffViewModel = {
    status,
    scope: status === "available" ? "official_timeline_diff_view" : "production_scoring_forbidden",
    origin: "controlled_segment_sandbox_timeline",
    ...(input.controlledSegmentSandboxTimelineModel.segmentLabel === undefined
      ? {}
      : { segmentLabel: input.controlledSegmentSandboxTimelineModel.segmentLabel }),
    ...(input.controlledSegmentSandboxTimelineModel.chainId === undefined
      ? {}
      : { chainId: input.controlledSegmentSandboxTimelineModel.chainId }),
    baseline,
    override,
    baselineSandboxOnlyEventCount: baseline.sandboxOnlyEventCount,
    overrideSandboxOnlyEventCount: override.sandboxOnlyEventCount,
    officialOnlyEventCount: before.eventCount,
    matchedReferenceEventCount: 0,
    officialTimelineEventCountBefore: before.eventCount,
    officialTimelineEventCountAfter: after.eventCount,
    officialTimelineEventCountDelta: 0,
    officialScoringEventCountBefore: before.scoringEventCount,
    officialScoringEventCountAfter: after.scoringEventCount,
    officialScoringEventCountDelta: 0,
    officialScoreBefore: before.scoreTotal,
    officialScoreAfter: after.scoreTotal,
    officialScoreDelta: 0,
    officialScoreDisplayBefore: before.scoreDisplay,
    officialScoreDisplayAfter: after.scoreDisplay,
    ...(before.possessionTeamId === undefined ? {} : { officialPossessionBefore: before.possessionTeamId }),
    ...(after.possessionTeamId === undefined ? {} : { officialPossessionAfter: after.possessionTeamId }),
    officialPossessionChanged: false,
    sandboxTimelineSeparateFromOfficialTimeline: true,
    sandboxOutcomeDivergenceObserved: comparison.sandboxOutcomeDivergenceObserved,
    sandboxFinalTeamDivergenceObserved: comparison.sandboxFinalTeamDivergenceObserved,
    sandboxFinalZoneDivergenceObserved: comparison.sandboxFinalZoneDivergenceObserved,
    officialTimelineDivergenceObserved: false,
    officialPossessionDivergenceObserved: false,
    officialScoreDivergenceObserved: false,
    officialScoringEventDivergenceObserved: false,
    modelAppliedOnlyInSandbox: status === "available",
    modelAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: input.controlledSegmentSandboxTimelineModel.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: input.controlledSegmentSandboxTimelineModel.rejectedUnavailableCandidateCount,
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
    explanation: comparison.explanation,
    tags: [
      "workbench_chain_official_timeline_diff_view",
      "official_timeline_diff_view",
      `official_timeline_diff_view_model_status_${status}`,
      "official_timeline_diff_view_model_origin_controlled_segment_sandbox_timeline",
      `official_timeline_diff_view_segment_${input.controlledSegmentSandboxTimelineModel.segmentLabel ?? "segment-1"}`,
      `official_timeline_diff_event_count_before_${before.eventCount}`,
      `official_timeline_diff_event_count_after_${after.eventCount}`,
      "official_timeline_diff_event_count_delta_0",
      `official_timeline_diff_scoring_event_count_before_${before.scoringEventCount}`,
      `official_timeline_diff_scoring_event_count_after_${after.scoringEventCount}`,
      "official_timeline_diff_scoring_event_count_delta_0",
      `official_timeline_diff_score_before_${before.scoreTotal}`,
      `official_timeline_diff_score_after_${after.scoreTotal}`,
      "official_timeline_diff_score_delta_0",
      `official_timeline_diff_possession_before_${before.possessionTeamId ?? "none"}`,
      `official_timeline_diff_possession_after_${after.possessionTeamId ?? "none"}`,
      "official_timeline_diff_possession_changed_false",
      `official_timeline_diff_baseline_sandbox_only_event_count_${baseline.sandboxOnlyEventCount}`,
      `official_timeline_diff_override_sandbox_only_event_count_${override.sandboxOnlyEventCount}`,
      `official_timeline_diff_official_only_event_count_${before.eventCount}`,
      "official_timeline_diff_matched_reference_event_count_0",
      `official_timeline_diff_baseline_final_outcome_${baseline.finalSandboxOutcome ?? "none"}`,
      `official_timeline_diff_override_final_outcome_${override.finalSandboxOutcome ?? "none"}`,
      `official_timeline_diff_override_final_team_${override.finalSandboxTeamCandidate ?? "none"}`,
      `official_timeline_diff_override_final_actor_${override.finalSandboxActorCandidate ?? "none"}`,
      `official_timeline_diff_override_final_zone_${override.finalSandboxZoneCandidate ?? "none"}`,
      `official_timeline_diff_sandbox_outcome_divergence_${comparison.sandboxOutcomeDivergenceObserved ? "true" : "false"}`,
      `official_timeline_diff_sandbox_final_team_divergence_${comparison.sandboxFinalTeamDivergenceObserved ? "true" : "false"}`,
      `official_timeline_diff_sandbox_final_zone_divergence_${comparison.sandboxFinalZoneDivergenceObserved ? "true" : "false"}`,
      "official_timeline_diff_official_timeline_divergence_false",
      "official_timeline_diff_official_possession_divergence_false",
      "official_timeline_diff_official_score_divergence_false",
      "official_timeline_diff_official_scoring_event_divergence_false",
      "official_timeline_diff_sandbox_events_inserted_into_official_timeline_count_0",
      "official_timeline_diff_official_timeline_mutation_count_0",
      "official_timeline_diff_official_possession_mutation_count_0",
      "official_timeline_diff_official_score_mutation_count_0",
      "official_timeline_diff_official_scoring_event_mutation_count_0",
      "official_timeline_diff_production_scoring_event_creation_count_0",
      "official_timeline_diff_production_route_resolution_mutation_count_0",
      "official_timeline_diff_global_route_success_mutation_count_0",
      "official_timeline_diff_global_economy_claim_count_0",
      `official_timeline_diff_model_applied_only_in_sandbox_${status === "available" ? "true" : "false"}`,
      "official_timeline_diff_model_applied_to_normal_live_false",
      `official_timeline_diff_rejected_closed_count_${input.controlledSegmentSandboxTimelineModel.rejectedClosedCandidateCount}`,
      `official_timeline_diff_rejected_unavailable_count_${input.controlledSegmentSandboxTimelineModel.rejectedUnavailableCandidateCount}`,
      "official_timeline_diff_official_timeline_injection_forbidden",
      "official_timeline_diff_official_score_mutation_forbidden",
      "official_timeline_diff_official_scoring_events_mutation_forbidden",
      "official_timeline_diff_official_possession_mutation_forbidden",
      "official_timeline_diff_production_scoring_event_creation_forbidden",
      "official_timeline_diff_production_route_resolution_mutation_forbidden",
      "official_timeline_diff_global_route_success_mutation_forbidden",
      "official_timeline_diff_global_economy_claim_forbidden",
      ...baseline.diffEntries.flatMap((entry) => entry.tags),
      ...override.diffEntries.flatMap((entry) => entry.tags),
    ],
    warnings: input.controlledSegmentSandboxTimelineModel.warnings,
  };
  const warnings = validateOfficialTimelineDiffViewModel(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}

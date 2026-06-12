import type { MatchInput } from "../../contracts/engineToCoach";
import { buildControlledSegmentSandboxEvent } from "./buildControlledSegmentSandboxEvent";
import { compareControlledSegmentSandboxTimeline } from "./compareControlledSegmentSandboxTimeline";
import {
  emptyControlledSegmentSandboxTimelineModel,
  type ControlledSegmentSandboxTimelineModel,
  type ControlledSegmentSandboxTimelinePath,
  type ControlledSegmentSandboxTimelineStatus,
} from "./controlledSegmentSandboxTimeline";
import type { SandboxSequenceReplayModel, SandboxSequenceReplayPath } from "./sandboxSequenceReplay";
import { sandboxStepToTimelineEvent } from "./sandboxStepToTimelineEvent";

function statusForReplay(replay: SandboxSequenceReplayModel): ControlledSegmentSandboxTimelineStatus {
  if (replay.status === "available") {
    return "available";
  }

  if (replay.status === "failed" || replay.status === "blocked") {
    return replay.status;
  }

  if (replay.status === "partial") {
    return "partial";
  }

  return "not_available";
}

function pathFromReplayPath(input: {
  readonly replayPath: SandboxSequenceReplayPath;
  readonly status: ControlledSegmentSandboxTimelineStatus;
}): ControlledSegmentSandboxTimelinePath {
  const events = input.replayPath.steps.map((step, index) =>
    buildControlledSegmentSandboxEvent({
      step,
      eventType: sandboxStepToTimelineEvent(step.stepType),
      sandboxIndex: index,
      sandboxMinuteOffset: input.replayPath.pathId === "baseline" ? index : index + 100,
    })
  );
  const firstEvent = events[0];
  const finalEvent = events[events.length - 1];

  return {
    pathId: input.replayPath.pathId,
    status: input.status,
    events,
    eventCount: events.length,
    ...(firstEvent === undefined ? {} : { firstEventType: firstEvent.eventType }),
    ...(finalEvent === undefined ? {} : { finalEventType: finalEvent.eventType }),
    ...(input.replayPath.finalOutcome === undefined ? {} : { finalOutcome: input.replayPath.finalOutcome }),
    ...(input.replayPath.finalTeamCandidate === undefined ? {} : { finalTeamCandidate: input.replayPath.finalTeamCandidate }),
    ...(input.replayPath.finalActorCandidate === undefined ? {} : { finalActorCandidate: input.replayPath.finalActorCandidate }),
    ...(input.replayPath.finalZoneCandidate === undefined ? {} : { finalZoneCandidate: input.replayPath.finalZoneCandidate }),
    officialTimelineEventCreatedCount: 0,
    officialTimelineMutationCount: 0,
    officialPossessionMutationCount: 0,
    officialScoreMutationCount: 0,
    officialScoringEventMutationCount: 0,
    productionScoringEventCreationCount: 0,
  };
}

export function controlledSegmentSandboxTimelineCannotMutateOfficialFullMatch(model: ControlledSegmentSandboxTimelineModel): boolean {
  const events = [...model.baseline.events, ...model.override.events];

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
    events.every((event) =>
      !event.createsOfficialMatchEvent &&
      !event.insertedIntoOfficialTimeline &&
      !event.mutatesOfficialTimeline &&
      !event.mutatesOfficialPossession &&
      !event.mutatesOfficialScore &&
      !event.mutatesOfficialScoringEvents &&
      !event.createsProductionScoringEvent &&
      !event.mutatesProductionRouteResolution &&
      !event.mutatesGlobalRouteSuccessRates
    )
  );
}

export function controlledSegmentSandboxTimelineCannotClaimGlobalEconomy(model: ControlledSegmentSandboxTimelineModel): boolean {
  return !model.canClaimGlobalEconomy;
}

export function validateControlledSegmentSandboxTimelineModel(model: ControlledSegmentSandboxTimelineModel): readonly string[] {
  const shouldValidate = model.status === "available";

  return [
    ...(shouldValidate && model.origin !== "sandbox_sequence_replay"
      ? ["CONTROLLED_SEGMENT_SANDBOX_TIMELINE_WRONG_ORIGIN"]
      : []),
    ...(shouldValidate && model.baseline.eventCount !== 9 ? ["CONTROLLED_SEGMENT_SANDBOX_TIMELINE_BASELINE_EVENT_COUNT_NOT_9"] : []),
    ...(shouldValidate && model.override.eventCount !== 9 ? ["CONTROLLED_SEGMENT_SANDBOX_TIMELINE_OVERRIDE_EVENT_COUNT_NOT_9"] : []),
    ...(shouldValidate && model.baseline.finalEventType !== "sandbox_sequence_end"
      ? ["CONTROLLED_SEGMENT_SANDBOX_TIMELINE_BASELINE_FINAL_EVENT_UNEXPECTED"]
      : []),
    ...(shouldValidate && model.override.finalEventType !== "sandbox_sequence_end"
      ? ["CONTROLLED_SEGMENT_SANDBOX_TIMELINE_OVERRIDE_FINAL_EVENT_UNEXPECTED"]
      : []),
    ...(shouldValidate && model.baseline.finalOutcome !== "none"
      ? ["CONTROLLED_SEGMENT_SANDBOX_TIMELINE_BASELINE_FINAL_OUTCOME_NOT_NONE"]
      : []),
    ...(shouldValidate && model.override.finalOutcome !== "secured_by_goalkeeper_team"
      ? ["CONTROLLED_SEGMENT_SANDBOX_TIMELINE_OVERRIDE_FINAL_OUTCOME_UNEXPECTED"]
      : []),
    ...(shouldValidate && model.override.finalTeamCandidate !== "goalkeeper_team"
      ? ["CONTROLLED_SEGMENT_SANDBOX_TIMELINE_OVERRIDE_FINAL_TEAM_UNEXPECTED"]
      : []),
    ...(shouldValidate && model.override.finalActorCandidate !== "blitz-goalkeeper-free-safety"
      ? ["CONTROLLED_SEGMENT_SANDBOX_TIMELINE_OVERRIDE_FINAL_ACTOR_UNEXPECTED"]
      : []),
    ...(shouldValidate && model.override.finalZoneCandidate !== "Z3-HSR"
      ? ["CONTROLLED_SEGMENT_SANDBOX_TIMELINE_OVERRIDE_FINAL_ZONE_UNEXPECTED"]
      : []),
    ...(shouldValidate && !model.sandboxTimelineCreated ? ["CONTROLLED_SEGMENT_SANDBOX_TIMELINE_NOT_CREATED"] : []),
    ...(shouldValidate && !model.sandboxTimelineSeparateFromOfficialTimeline
      ? ["CONTROLLED_SEGMENT_SANDBOX_TIMELINE_NOT_SEPARATE_FROM_OFFICIAL"]
      : []),
    ...(!controlledSegmentSandboxTimelineCannotMutateOfficialFullMatch(model)
      ? ["CONTROLLED_SEGMENT_SANDBOX_TIMELINE_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!controlledSegmentSandboxTimelineCannotClaimGlobalEconomy(model)
      ? ["CONTROLLED_SEGMENT_SANDBOX_TIMELINE_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
  ];
}

export function controlledSegmentSandboxTimelineFromReplay(input: {
  readonly matchInput: MatchInput;
  readonly sandboxSequenceReplayModel: SandboxSequenceReplayModel;
}): ControlledSegmentSandboxTimelineModel {
  if (input.sandboxSequenceReplayModel.status === "not_available") {
    return emptyControlledSegmentSandboxTimelineModel({
      ...(input.sandboxSequenceReplayModel.segmentLabel === undefined ? {} : { segmentLabel: input.sandboxSequenceReplayModel.segmentLabel }),
      ...(input.sandboxSequenceReplayModel.chainId === undefined ? {} : { chainId: input.sandboxSequenceReplayModel.chainId }),
      warnings: input.sandboxSequenceReplayModel.warnings,
    });
  }

  const status = statusForReplay(input.sandboxSequenceReplayModel);
  const baseline = pathFromReplayPath({
    replayPath: input.sandboxSequenceReplayModel.baseline,
    status,
  });
  const override = pathFromReplayPath({
    replayPath: input.sandboxSequenceReplayModel.override,
    status,
  });
  const comparison = compareControlledSegmentSandboxTimeline({ baseline, override });
  const result: ControlledSegmentSandboxTimelineModel = {
    status,
    scope: status === "available" ? "controlled_segment_sandbox_timeline" : "production_scoring_forbidden",
    origin: "sandbox_sequence_replay",
    ...(input.sandboxSequenceReplayModel.segmentLabel === undefined ? {} : { segmentLabel: input.sandboxSequenceReplayModel.segmentLabel }),
    ...(input.sandboxSequenceReplayModel.chainId === undefined ? {} : { chainId: input.sandboxSequenceReplayModel.chainId }),
    baseline,
    override,
    baselineEventCount: baseline.eventCount,
    overrideEventCount: override.eventCount,
    sandboxTimelineCreated: status === "available",
    sandboxTimelineSeparateFromOfficialTimeline: true,
    sandboxTimelineEventCountDivergenceObserved: comparison.sandboxTimelineEventCountDivergenceObserved,
    sandboxTimelineOutcomeDivergenceObserved: comparison.sandboxTimelineOutcomeDivergenceObserved,
    sandboxTimelineFinalTeamDivergenceObserved: comparison.sandboxTimelineFinalTeamDivergenceObserved,
    sandboxTimelineFinalZoneDivergenceObserved: comparison.sandboxTimelineFinalZoneDivergenceObserved,
    officialTimelineDivergenceObserved: false,
    officialPossessionDivergenceObserved: false,
    officialScoreDivergenceObserved: false,
    officialScoringEventDivergenceObserved: false,
    modelAppliedOnlyInSandbox: status === "available",
    modelAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: input.sandboxSequenceReplayModel.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: input.sandboxSequenceReplayModel.rejectedUnavailableCandidateCount,
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
    explanation: comparison.explanation,
    tags: [
      "workbench_chain_controlled_segment_sandbox_timeline",
      "controlled_segment_sandbox_timeline",
      `controlled_segment_sandbox_timeline_model_status_${status}`,
      "controlled_segment_sandbox_timeline_model_origin_sandbox_sequence_replay",
      `controlled_segment_sandbox_timeline_segment_${input.sandboxSequenceReplayModel.segmentLabel ?? "segment-1"}`,
      `controlled_segment_sandbox_timeline_baseline_event_count_${baseline.eventCount}`,
      `controlled_segment_sandbox_timeline_override_event_count_${override.eventCount}`,
      `controlled_segment_sandbox_timeline_baseline_event_types_${baseline.events.map((event) => event.eventType).join("__")}`,
      `controlled_segment_sandbox_timeline_override_event_types_${override.events.map((event) => event.eventType).join("__")}`,
      `controlled_segment_sandbox_timeline_baseline_final_outcome_${baseline.finalOutcome ?? "none"}`,
      `controlled_segment_sandbox_timeline_override_final_outcome_${override.finalOutcome ?? "none"}`,
      `controlled_segment_sandbox_timeline_override_final_team_${override.finalTeamCandidate ?? "none"}`,
      `controlled_segment_sandbox_timeline_override_final_actor_${override.finalActorCandidate ?? "none"}`,
      `controlled_segment_sandbox_timeline_override_final_zone_${override.finalZoneCandidate ?? "none"}`,
      `controlled_segment_sandbox_timeline_created_${status === "available" ? "true" : "false"}`,
      "controlled_segment_sandbox_timeline_separate_from_official_true",
      `controlled_segment_sandbox_timeline_event_count_divergence_${comparison.sandboxTimelineEventCountDivergenceObserved ? "true" : "false"}`,
      `controlled_segment_sandbox_timeline_outcome_divergence_${comparison.sandboxTimelineOutcomeDivergenceObserved ? "true" : "false"}`,
      `controlled_segment_sandbox_timeline_final_team_divergence_${comparison.sandboxTimelineFinalTeamDivergenceObserved ? "true" : "false"}`,
      `controlled_segment_sandbox_timeline_final_zone_divergence_${comparison.sandboxTimelineFinalZoneDivergenceObserved ? "true" : "false"}`,
      "controlled_segment_sandbox_timeline_official_timeline_event_created_count_0",
      "controlled_segment_sandbox_timeline_official_timeline_mutation_count_0",
      "controlled_segment_sandbox_timeline_official_possession_mutation_count_0",
      "controlled_segment_sandbox_timeline_official_score_mutation_count_0",
      "controlled_segment_sandbox_timeline_official_scoring_event_mutation_count_0",
      "controlled_segment_sandbox_timeline_production_scoring_event_creation_count_0",
      "controlled_segment_sandbox_timeline_production_route_resolution_mutation_count_0",
      "controlled_segment_sandbox_timeline_global_route_success_mutation_count_0",
      "controlled_segment_sandbox_timeline_global_economy_claim_count_0",
      `controlled_segment_sandbox_timeline_model_applied_only_in_sandbox_${status === "available" ? "true" : "false"}`,
      "controlled_segment_sandbox_timeline_model_applied_to_normal_live_false",
      `controlled_segment_sandbox_timeline_rejected_closed_count_${input.sandboxSequenceReplayModel.rejectedClosedCandidateCount}`,
      `controlled_segment_sandbox_timeline_rejected_unavailable_count_${input.sandboxSequenceReplayModel.rejectedUnavailableCandidateCount}`,
      "controlled_segment_sandbox_timeline_official_timeline_injection_forbidden",
      "controlled_segment_sandbox_timeline_official_score_mutation_forbidden",
      "controlled_segment_sandbox_timeline_official_scoring_events_mutation_forbidden",
      "controlled_segment_sandbox_timeline_official_possession_mutation_forbidden",
      "controlled_segment_sandbox_timeline_production_scoring_event_creation_forbidden",
      "controlled_segment_sandbox_timeline_production_route_resolution_mutation_forbidden",
      "controlled_segment_sandbox_timeline_global_route_success_mutation_forbidden",
      "controlled_segment_sandbox_timeline_global_economy_claim_forbidden",
      ...baseline.events.flatMap((event) => event.tags),
      ...override.events.flatMap((event) => event.tags),
    ],
    warnings: input.sandboxSequenceReplayModel.warnings,
  };
  const warnings = validateControlledSegmentSandboxTimelineModel(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}

import type { SandboxSequenceStep } from "./sandboxSequenceReplay";
import type {
  ControlledSegmentSandboxTimelineEvent,
  ControlledSegmentSandboxTimelineEventType,
} from "./controlledSegmentSandboxTimeline";

export function buildControlledSegmentSandboxEvent(input: {
  readonly step: SandboxSequenceStep;
  readonly eventType: ControlledSegmentSandboxTimelineEventType;
  readonly sandboxIndex: number;
  readonly sandboxMinuteOffset: number;
}): ControlledSegmentSandboxTimelineEvent {
  const eventId = `controlled-segment-sandbox-${input.step.pathId}-${input.sandboxIndex}-${input.eventType}`;

  return {
    sandboxEventId: eventId,
    sandboxIndex: input.sandboxIndex,
    sandboxMinuteOffset: input.sandboxMinuteOffset,
    eventType: input.eventType,
    sourceStepId: input.step.stepId,
    sourceStepType: input.step.stepType,
    sourceStepSource: input.step.source,
    pathId: input.step.pathId,
    ...(input.step.actorId === undefined ? {} : { actorId: input.step.actorId }),
    ...(input.step.teamCandidate === undefined ? {} : { teamCandidate: input.step.teamCandidate }),
    ...(input.step.targetZone === undefined ? {} : { targetZone: input.step.targetZone }),
    ...(input.step.outcome === undefined ? {} : { outcome: input.step.outcome }),
    confidence: input.step.confidence,
    createsOfficialMatchEvent: false,
    insertedIntoOfficialTimeline: false,
    mutatesOfficialTimeline: false,
    mutatesOfficialPossession: false,
    mutatesOfficialScore: false,
    mutatesOfficialScoringEvents: false,
    createsProductionScoringEvent: false,
    mutatesProductionRouteResolution: false,
    mutatesGlobalRouteSuccessRates: false,
    reasons: input.step.reasons,
    tags: [
      "controlled_segment_sandbox_timeline_event",
      `controlled_segment_sandbox_${input.step.pathId}_event_${input.sandboxIndex}`,
      `controlled_segment_sandbox_${input.step.pathId}_event_type_${input.eventType}`,
      `controlled_segment_sandbox_${input.step.pathId}_event_source_step_${input.step.stepType}`,
      `controlled_segment_sandbox_${input.step.pathId}_event_confidence_${input.step.confidence}`,
      ...(input.step.outcome === undefined ? [] : [`controlled_segment_sandbox_${input.step.pathId}_event_outcome_${input.step.outcome}`]),
      ...(input.step.targetZone === undefined ? [] : [`controlled_segment_sandbox_${input.step.pathId}_event_zone_${input.step.targetZone}`]),
      ...(input.step.actorId === undefined ? [] : [`controlled_segment_sandbox_${input.step.pathId}_event_actor_${input.step.actorId}`]),
      ...(input.step.teamCandidate === undefined ? [] : [`controlled_segment_sandbox_${input.step.pathId}_event_team_${input.step.teamCandidate}`]),
      "controlled_segment_sandbox_event_official_match_event_created_false",
      "controlled_segment_sandbox_event_inserted_official_timeline_false",
      "controlled_segment_sandbox_event_official_timeline_mutation_false",
      "controlled_segment_sandbox_event_official_possession_mutation_false",
      "controlled_segment_sandbox_event_official_score_mutation_false",
      "controlled_segment_sandbox_event_official_scoring_event_mutation_false",
      "controlled_segment_sandbox_event_production_scoring_event_creation_false",
      "controlled_segment_sandbox_event_production_route_resolution_mutation_false",
      "controlled_segment_sandbox_event_global_route_success_mutation_false",
    ],
    warnings: input.step.warnings,
  };
}

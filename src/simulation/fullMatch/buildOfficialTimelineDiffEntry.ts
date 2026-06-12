import type { MatchEvent } from "../../contracts/engineToCoach";
import type { ControlledSegmentSandboxTimelineEvent } from "./controlledSegmentSandboxTimeline";
import type {
  TimelineDiffEntry,
  TimelineDiffEventClass,
  TimelineDiffPathId,
} from "./officialTimelineDiffView";

export function buildOfficialTimelineDiffEntry(input: {
  readonly pathId: TimelineDiffPathId;
  readonly eventClass: TimelineDiffEventClass;
  readonly officialEvent?: MatchEvent;
  readonly sandboxEvent?: ControlledSegmentSandboxTimelineEvent;
  readonly reason: string;
}): TimelineDiffEntry {
  const idSource = input.officialEvent?.eventId ?? input.sandboxEvent?.sandboxEventId ?? "metadata";

  return {
    diffEntryId: `official-timeline-diff-${input.pathId}-${input.eventClass}-${idSource}`,
    pathId: input.pathId,
    eventClass: input.eventClass,
    ...(input.officialEvent === undefined ? {} : {
      officialEventId: input.officialEvent.eventId,
      officialEventType: input.officialEvent.eventType,
      officialMinute: input.officialEvent.timestamp.minute,
    }),
    ...(input.sandboxEvent === undefined ? {} : {
      sandboxEventId: input.sandboxEvent.sandboxEventId,
      sandboxEventType: input.sandboxEvent.eventType,
      sandboxMinuteOffset: input.sandboxEvent.sandboxMinuteOffset,
      ...(input.sandboxEvent.actorId === undefined ? {} : { actorId: input.sandboxEvent.actorId }),
      ...(input.sandboxEvent.teamCandidate === undefined ? {} : { teamCandidate: input.sandboxEvent.teamCandidate }),
      ...(input.sandboxEvent.targetZone === undefined ? {} : { targetZone: input.sandboxEvent.targetZone }),
      ...(input.sandboxEvent.outcome === undefined ? {} : { outcome: input.sandboxEvent.outcome }),
    }),
    createsOfficialMatchEvent: false,
    insertedIntoOfficialTimeline: false,
    mutatesOfficialTimeline: false,
    mutatesOfficialPossession: false,
    mutatesOfficialScore: false,
    mutatesOfficialScoringEvents: false,
    createsProductionScoringEvent: false,
    mutatesProductionRouteResolution: false,
    mutatesGlobalRouteSuccessRates: false,
    reasons: [input.reason],
    tags: [
      "official_timeline_diff_entry",
      `official_timeline_diff_${input.pathId}_entry_class_${input.eventClass}`,
      ...(input.officialEvent === undefined ? [] : [
        `official_timeline_diff_${input.pathId}_official_event_${input.officialEvent.eventType}`,
      ]),
      ...(input.sandboxEvent === undefined ? [] : [
        `official_timeline_diff_${input.pathId}_sandbox_event_${input.sandboxEvent.eventType}`,
        "official_timeline_diff_sandbox_event_official_match_event_created_false",
        "official_timeline_diff_sandbox_event_inserted_official_timeline_false",
        "official_timeline_diff_sandbox_event_official_timeline_mutation_false",
        "official_timeline_diff_sandbox_event_official_possession_mutation_false",
        "official_timeline_diff_sandbox_event_official_score_mutation_false",
        "official_timeline_diff_sandbox_event_official_scoring_event_mutation_false",
        "official_timeline_diff_sandbox_event_production_scoring_event_creation_false",
        "official_timeline_diff_sandbox_event_production_route_resolution_mutation_false",
        "official_timeline_diff_sandbox_event_global_route_success_mutation_false",
      ]),
    ],
    warnings: [],
  };
}

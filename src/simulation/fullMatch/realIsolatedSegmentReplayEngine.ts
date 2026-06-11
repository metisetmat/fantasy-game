import type {
  IsolatedSegmentReplayEvent,
  IsolatedSegmentReplayEventType,
  IsolatedSegmentReplayPathId,
} from "./isolatedSegmentReplayEvent";
import type { RealIsolatedSegmentReplayPath } from "./fullMatchRealIsolatedSegmentReplay";

type ReplayInput = {
  readonly pathId: IsolatedSegmentReplayPathId;
  readonly segmentLabel: string;
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly candidateLegal: boolean;
  readonly candidateAvailable: boolean;
};

function emptyBlockedPath(input: ReplayInput, warning: string): RealIsolatedSegmentReplayPath {
  return {
    pathId: input.pathId,
    ...(input.candidateId === undefined ? {} : { candidateId: input.candidateId }),
    ...(input.actionType === undefined ? {} : { actionType: input.actionType }),
    ...(input.receiverId === undefined ? {} : { receiverId: input.receiverId }),
    ...(input.targetZone === undefined ? {} : { targetZone: input.targetZone }),
    candidateLegal: input.candidateLegal,
    candidateAvailable: input.candidateAvailable,
    events: [],
    eventCount: 0,
    warnings: [warning],
  };
}

function event(input: {
  readonly pathId: IsolatedSegmentReplayPathId;
  readonly segmentLabel: string;
  readonly index: number;
  readonly eventType: IsolatedSegmentReplayEventType;
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly fromZone?: string;
  readonly toZone?: string;
  readonly possessionRetained?: boolean;
  readonly resultingCarrierId?: string;
  readonly resultingZone?: string;
  readonly dangerCreated?: boolean;
  readonly scoringOpportunityCreated?: boolean;
  readonly scoringEventCreated?: boolean;
  readonly isolatedScoreDelta?: number;
  readonly tags: readonly string[];
}): IsolatedSegmentReplayEvent {
  return {
    eventId: `${input.segmentLabel}-${input.pathId}-isolated-${input.index}`,
    pathId: input.pathId,
    segmentLabel: input.segmentLabel,
    eventType: input.eventType,
    ...(input.candidateId === undefined ? {} : { candidateId: input.candidateId }),
    ...(input.actionType === undefined ? {} : { actionType: input.actionType }),
    actorId: "control-playmaker",
    ...(input.receiverId === undefined ? {} : { receiverId: input.receiverId }),
    ...(input.fromZone === undefined ? {} : { fromZone: input.fromZone }),
    ...(input.toZone === undefined ? {} : { toZone: input.toZone }),
    ...(input.possessionRetained === undefined ? {} : { possessionRetained: input.possessionRetained }),
    ...(input.resultingCarrierId === undefined ? {} : { resultingCarrierId: input.resultingCarrierId }),
    ...(input.resultingZone === undefined ? {} : { resultingZone: input.resultingZone }),
    ...(input.dangerCreated === undefined ? {} : { dangerCreated: input.dangerCreated }),
    ...(input.scoringOpportunityCreated === undefined ? {} : { scoringOpportunityCreated: input.scoringOpportunityCreated }),
    ...(input.scoringEventCreated === undefined ? {} : { scoringEventCreated: input.scoringEventCreated }),
    ...(input.isolatedScoreDelta === undefined ? {} : { isolatedScoreDelta: input.isolatedScoreDelta }),
    experimentalOnly: true,
    canMutateOfficialTimeline: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    tags: [
      "real_isolated_segment_replay_event",
      "experimental_only_isolated_replay_event",
      "official_timeline_mutation_forbidden",
      "official_score_mutation_forbidden",
      "official_scoring_event_creation_forbidden",
      ...input.tags,
    ],
    warnings: [],
  };
}

function timelineSignature(events: readonly IsolatedSegmentReplayEvent[]): string {
  return events.map((candidate) => candidate.eventType).join(">");
}

function pathResult(input: ReplayInput, config: {
  readonly resultingCarrierId: string;
  readonly resultingZone: string;
  readonly zoneProgressionDelta: number;
  readonly dangerCreated: boolean;
  readonly eventTypes: readonly IsolatedSegmentReplayEventType[];
}): RealIsolatedSegmentReplayPath {
  const events = config.eventTypes.map((eventType, index) =>
    event({
      pathId: input.pathId,
      segmentLabel: input.segmentLabel,
      index: index + 1,
      eventType,
      ...(input.candidateId === undefined ? {} : { candidateId: input.candidateId }),
      ...(input.actionType === undefined ? {} : { actionType: input.actionType }),
      ...(input.receiverId === undefined ? {} : { receiverId: input.receiverId }),
      fromZone: "Z3-HSL",
      ...(input.targetZone === undefined ? {} : { toZone: input.targetZone }),
      possessionRetained: true,
      resultingCarrierId: config.resultingCarrierId,
      resultingZone: config.resultingZone,
      dangerCreated: config.dangerCreated,
      scoringOpportunityCreated: false,
      scoringEventCreated: false,
      isolatedScoreDelta: 0,
      tags: [`real_isolated_replay_path_${input.pathId}`, `real_isolated_replay_event_type_${eventType}`],
    })
  );

  return {
    pathId: input.pathId,
    ...(input.candidateId === undefined ? {} : { candidateId: input.candidateId }),
    ...(input.actionType === undefined ? {} : { actionType: input.actionType }),
    ...(input.receiverId === undefined ? {} : { receiverId: input.receiverId }),
    ...(input.targetZone === undefined ? {} : { targetZone: input.targetZone }),
    candidateLegal: true,
    candidateAvailable: true,
    events,
    eventCount: events.length,
    possessionRetained: true,
    resultingCarrierId: config.resultingCarrierId,
    resultingZone: config.resultingZone,
    zoneProgressionDelta: config.zoneProgressionDelta,
    dangerCreated: config.dangerCreated,
    scoringOpportunityCreated: false,
    isolatedScoringEventCreated: false,
    isolatedScoreDelta: 0,
    timelineSignature: timelineSignature(events),
    isolatedScoreSignature: "isolated_score_delta_0",
    isolatedScoringEventSignature: "no_isolated_scoring_event",
    warnings: [],
  };
}

export function runRealIsolatedSegmentReplayPath(input: ReplayInput): RealIsolatedSegmentReplayPath {
  if (input.candidateId === undefined) {
    return emptyBlockedPath(input, "REAL_ISOLATED_REPLAY_MISSING_CANDIDATE");
  }

  if (!input.candidateLegal) {
    return emptyBlockedPath(input, "REAL_ISOLATED_REPLAY_ILLEGAL_CANDIDATE");
  }

  if (!input.candidateAvailable) {
    return emptyBlockedPath(input, "REAL_ISOLATED_REPLAY_UNAVAILABLE_CANDIDATE");
  }

  if (input.pathId === "baseline" && input.actionType === "SAFE_RECYCLE") {
    return pathResult(input, {
      resultingCarrierId: input.receiverId ?? "control-pivot",
      resultingZone: input.targetZone ?? "Z2-HSL",
      zoneProgressionDelta: -1,
      dangerCreated: false,
      eventTypes: [
        "isolated_route_selection",
        "isolated_possession_update",
        "isolated_zone_progression",
        "isolated_replay_end",
      ],
    });
  }

  if (input.pathId === "override" && input.actionType === "FORWARD_PROGRESS") {
    return pathResult(input, {
      resultingCarrierId: input.receiverId ?? "control-space-hunter",
      resultingZone: input.targetZone ?? "Z4-HSR",
      zoneProgressionDelta: 2,
      dangerCreated: true,
      eventTypes: [
        "isolated_route_selection",
        "isolated_possession_update",
        "isolated_zone_progression",
        "isolated_danger_signal",
        "isolated_replay_end",
      ],
    });
  }

  return emptyBlockedPath(input, "REAL_ISOLATED_REPLAY_UNSUPPORTED_PATH");
}

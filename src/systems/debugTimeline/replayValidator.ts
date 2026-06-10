import { serializeDebugTimeline } from "./replaySerializer";
import type { DebugTimelineEvent, DebugTimelineReplay } from "./timelineEvent";

export interface DebugTimelineValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

function validateEvent(event: DebugTimelineEvent): readonly string[] {
  const errors: string[] = [];

  if (event.id.trim() === "") {
    errors.push(`timeline event at tick ${event.tick} has no id`);
  }

  if (event.eventId !== event.id) {
    errors.push(`${event.id} eventId does not mirror id`);
  }

  if (event.utilityScores.length === 0) {
    errors.push(`${event.id} has no utility scores`);
  }

  if (event.reportAnchors.length === 0) {
    errors.push(`${event.id} has no report anchors`);
  }

  if (event.reportClaimRefs.length === 0) {
    errors.push(`${event.id} has no report claim refs`);
  }

  if (event.stateBeforeSummary.tick !== event.tick || event.stateAfterSummary.tick !== event.tick) {
    errors.push(`${event.id} state summaries are not attached to event tick`);
  }

  if (event.seedInfo.initialSeed <= 0 || event.seedInfo.eventSeed <= 0) {
    errors.push(`${event.id} has invalid seed info`);
  }

  return errors;
}

export function validateDebugTimelineReplay(replay: DebugTimelineReplay): DebugTimelineValidationResult {
  const eventIds = new Set<string>();
  const errors: string[] = [];

  replay.events.forEach((event) => {
    if (eventIds.has(event.id)) {
      errors.push(`duplicate timeline event id ${event.id}`);
    }

    eventIds.add(event.id);
    errors.push(...validateEvent(event));
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function sameSeedProducesSameTimeline(input: {
  readonly createReplay: () => DebugTimelineReplay;
}): boolean {
  const first = input.createReplay();
  const second = input.createReplay();

  if (first.seed !== second.seed) {
    return false;
  }

  return serializeDebugTimeline(first) === serializeDebugTimeline(second);
}

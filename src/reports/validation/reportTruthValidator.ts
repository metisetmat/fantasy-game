import type { DebugTimelineReplay } from "../../systems/debugTimeline";

export interface ReportTruthValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function validateReportTruth(input: {
  readonly reportMarkdown: string;
  readonly timeline: DebugTimelineReplay;
}): ReportTruthValidationResult {
  const errors: string[] = [];
  const eventIds = new Set(input.timeline.events.map((event) => event.eventId));

  for (const eventId of eventIds) {
    if (!input.reportMarkdown.includes(eventId)) {
      errors.push(`report does not reference timeline event ${eventId}`);
    }
  }

  for (const event of input.timeline.events) {
    if (event.actorModel !== null && event.actorId !== event.actorModel.primaryActorId) {
      errors.push(`${event.eventId} actor id does not match canonical actor model`);
    }

    if (event.actorModel !== null && event.receiverId !== event.actorModel.receiverId) {
      errors.push(`${event.eventId} receiver id does not match canonical actor model`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

import type { DebugTimelineReplay } from "./timelineEvent";

export function serializeDebugTimeline(replay: DebugTimelineReplay): string {
  return `${JSON.stringify(replay, null, 2)}\n`;
}

export function parseDebugTimeline(serialized: string): DebugTimelineReplay {
  const parsed = JSON.parse(serialized) as DebugTimelineReplay;

  return parsed;
}

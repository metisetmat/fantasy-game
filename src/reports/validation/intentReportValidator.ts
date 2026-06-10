import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { DebugTimelineReplay } from "../../systems/debugTimeline";
import type { SnapshotReference } from "../visualization";

export interface IntentReportValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

function hasIntentAgeEvidence(reportMarkdown: string): boolean {
  return /age [1-9][0-9]* ticks/.test(reportMarkdown);
}

function snapshotHasIntentMetadata(input: {
  readonly reportDirectory: string;
  readonly path: string;
}): boolean {
  const svg = readFileSync(join(input.reportDirectory, input.path), "utf8");
  const playerIds = new Set([...svg.matchAll(/data-player-id="([^"]+)"/g)].map((match) => match[1]));
  const primaryIntentCount = [...svg.matchAll(/data-primary-intent="([^"]+)"/g)].length;

  return playerIds.size === 20 && primaryIntentCount === 20;
}

function snapshotHasTrajectoryMetadata(input: {
  readonly reportDirectory: string;
  readonly path: string;
}): boolean {
  const svg = readFileSync(join(input.reportDirectory, input.path), "utf8");
  const playerIds = new Set([...svg.matchAll(/data-player-id="([^"]+)"/g)].map((match) => match[1]));
  const movementTypeCount = [...svg.matchAll(/data-movement-type="([^"]+)"/g)].length;

  return playerIds.size === 20 && movementTypeCount === 20;
}

export function validateIntentReport(input: {
  readonly reportMarkdown: string;
  readonly timeline: DebugTimelineReplay;
  readonly snapshots: readonly SnapshotReference[];
  readonly reportDirectory: string;
}): IntentReportValidationResult {
  const errors: string[] = [];

  if (!input.reportMarkdown.includes("## Intent Engine")) {
    errors.push("report is missing ## Intent Engine");
  }

  if (!input.reportMarkdown.includes("Player Intent Trace")) {
    errors.push("report is missing Player Intent Trace");
  }

  if (!input.reportMarkdown.includes("Intent Continuity")) {
    errors.push("report is missing Intent Continuity");
  }

  if (!input.reportMarkdown.includes("Intent Evolution")) {
    errors.push("report is missing Intent Evolution");
  }

  if (!input.reportMarkdown.includes("Trajectory State")) {
    errors.push("report is missing Trajectory State");
  }

  if (!input.reportMarkdown.includes("Arrival Timing")) {
    errors.push("report is missing Arrival Timing");
  }

  if (!input.reportMarkdown.includes("Space Creation")) {
    errors.push("report is missing Space Creation");
  }

  if (!hasIntentAgeEvidence(input.reportMarkdown)) {
    errors.push("report has no intent age greater than 0 ticks");
  }

  if (!input.timeline.events.some((event) => event.intentChanges.length > 0)) {
    errors.push("timeline contains no intentChanges");
  }

  for (const event of input.timeline.events) {
    if (event.actorPrimaryIntent === null) {
      errors.push(`${event.eventId} is missing actorPrimaryIntent`);
    }
  }

  for (const snapshot of input.snapshots) {
    if (!snapshotHasIntentMetadata({ reportDirectory: input.reportDirectory, path: snapshot.beforePath })) {
      errors.push(`${snapshot.beforePath} is missing complete intent metadata`);
    }

    if (!snapshotHasIntentMetadata({ reportDirectory: input.reportDirectory, path: snapshot.afterPath })) {
      errors.push(`${snapshot.afterPath} is missing complete intent metadata`);
    }

    if (!snapshotHasTrajectoryMetadata({ reportDirectory: input.reportDirectory, path: snapshot.beforePath })) {
      errors.push(`${snapshot.beforePath} is missing complete trajectory metadata`);
    }

    if (!snapshotHasTrajectoryMetadata({ reportDirectory: input.reportDirectory, path: snapshot.afterPath })) {
      errors.push(`${snapshot.afterPath} is missing complete trajectory metadata`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

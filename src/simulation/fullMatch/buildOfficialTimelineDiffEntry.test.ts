import type { ControlledSegmentSandboxTimelineEvent } from "./controlledSegmentSandboxTimeline";
import { buildOfficialTimelineDiffEntry } from "./buildOfficialTimelineDiffEntry";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const sandboxEvent: ControlledSegmentSandboxTimelineEvent = {
  sandboxEventId: "sandbox-event-1",
  sandboxIndex: 1,
  sandboxMinuteOffset: 101,
  eventType: "sandbox_continuation_action",
  sourceStepId: "step-1",
  sourceStepType: "CONTINUATION_ACTION_RESOLVED",
  sourceStepSource: "multi_action_continuation_sandbox",
  pathId: "override",
  actorId: "blitz-goalkeeper-free-safety",
  teamCandidate: "goalkeeper_team",
  targetZone: "Z3-HSR",
  outcome: "secured_by_goalkeeper_team",
  confidence: 77,
  createsOfficialMatchEvent: false,
  insertedIntoOfficialTimeline: false,
  mutatesOfficialTimeline: false,
  mutatesOfficialPossession: false,
  mutatesOfficialScore: false,
  mutatesOfficialScoringEvents: false,
  createsProductionScoringEvent: false,
  mutatesProductionRouteResolution: false,
  mutatesGlobalRouteSuccessRates: false,
  reasons: ["fixture"],
  tags: ["fixture_tag"],
  warnings: [],
};

export function validateBuildOfficialTimelineDiffEntry(): readonly string[] {
  const entry = buildOfficialTimelineDiffEntry({
    pathId: "override",
    eventClass: "sandbox_only",
    sandboxEvent,
    reason: "sandbox-only fixture",
  });

  assertTest(entry.diffEntryId.includes("official-timeline-diff-override-sandbox_only"), "entry id must identify the diff path.");
  assertTest(entry.sandboxEventType === "sandbox_continuation_action", "sandbox event type must be copied.");
  assertTest(entry.actorId === "blitz-goalkeeper-free-safety", "actor must be copied.");
  assertTest(!entry.createsOfficialMatchEvent, "diff entry must not create an official MatchEvent.");
  assertTest(!entry.insertedIntoOfficialTimeline, "diff entry must not be inserted into the official timeline.");
  assertTest(!entry.mutatesOfficialScore, "diff entry must not mutate official score.");
  assertTest(!entry.createsProductionScoringEvent, "diff entry must not create production scoring events.");
  assertTest(entry.tags.includes("official_timeline_diff_sandbox_event_inserted_official_timeline_false"), "entry tags must expose insertion guard.");

  return [
    "sandbox-only diff entry copies sandbox metadata",
    "sandbox-only diff entry cannot create or mutate official match state",
    "sandbox-only diff entry emits guard tags",
  ];
}

if (require.main === module) {
  const checks = validateBuildOfficialTimelineDiffEntry();

  console.log("buildOfficialTimelineDiffEntry tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

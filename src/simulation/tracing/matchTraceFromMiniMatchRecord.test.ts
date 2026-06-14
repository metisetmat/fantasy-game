import { matchTraceFromMiniMatchRecord, type MiniMatchRecordLike } from "./matchTraceFromMiniMatchRecord";
import { matchTraceCannotMutateOfficialState } from "./matchTraceEvent";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateMatchTraceFromMiniMatchRecord(): readonly string[] {
  const record: MiniMatchRecordLike = {
    recordId: "mini-record-1",
    sequenceNumber: 1,
    phase: "offensive_construction",
    zone: "Z3-C",
    targetZone: "Z4-HSR",
    actionType: "FORWARD_PROGRESS",
    outcome: "selected",
    pressureLevel: "medium",
    primaryPlayerId: "control-th",
    secondaryPlayerId: "control-sh",
    tags: ["mini_match_fixture"],
  };
  const trace = matchTraceFromMiniMatchRecord({
    record,
    matchId: "match-1",
    minute: 12,
    sequenceId: "sequence-1",
    teamId: "control",
    opponentTeamId: "blitz",
  });
  const unknownTrace = matchTraceFromMiniMatchRecord({
    record: {},
    teamId: "control",
    opponentTeamId: "blitz",
  });

  assertTest(trace.source === "mini_match_record", "mini-match source must be preserved.");
  assertTest(trace.phase === "PROGRESSION", "phase must be present.");
  assertTest(trace.actionType === "PASS", "action type must be present.");
  assertTest(trace.outcome === "SUCCESS", "outcome must be present.");
  assertTest(trace.zone === "Z3-C", "zone must be present.");
  assertTest(trace.causeTags.length > 0, "cause tags must be present.");
  assertTest(trace.impactTags.length > 0, "impact tags must be present.");
  assertTest(unknownTrace.zone === "UNKNOWN_ZONE", "unknown fields must fall back safely.");
  assertTest(unknownTrace.causeTags.includes("unknown_cause"), "unknown cause must be safe.");
  assertTest(matchTraceCannotMutateOfficialState(trace), "mini-match adapter cannot mutate score or create scoring events.");

  return [
    "mini-match record converts to trace",
    "phase, action, outcome, zone, cause, and impact are present",
    "unknown fields fall back safely",
    "adapter cannot mutate score or create scoring events",
  ];
}

if (require.main === module) {
  const checks = validateMatchTraceFromMiniMatchRecord();

  console.log("matchTraceFromMiniMatchRecord tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

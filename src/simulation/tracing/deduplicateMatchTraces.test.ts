import { matchTraceAggregateFixture } from "./matchTraceAggregateFixture";
import { createMatchTraceEvent } from "./matchTraceEvent";
import { deduplicateMatchTraces } from "./deduplicateMatchTraces";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateDeduplicateMatchTraces(): readonly string[] {
  const traces = matchTraceAggregateFixture();
  const deduplicated = deduplicateMatchTraces({ traces });
  const officialDuplicate = deduplicated.deduplicatedTraces.find((trace) => trace.sourceEventId === "event-1");
  const base = traces[0];

  if (base === undefined) {
    throw new Error("fixture must contain a base trace.");
  }

  const fallbackA = createMatchTraceEvent({
    traceId: "fallback-a",
    source: "mini_match_record",
    minute: base.minute,
    teamId: base.teamId,
    opponentTeamId: base.opponentTeamId,
    phase: base.phase,
    zone: base.zone,
    actionType: base.actionType,
    outcome: base.outcome,
    primaryPlayerId: "fallback-player",
    pressureLevel: base.pressureLevel,
    causeTags: base.causeTags,
    impactTags: base.impactTags,
    coachVisible: base.coachVisible,
    diagnosticWeight: base.diagnosticWeight,
    officialTruth: false,
    tags: base.tags,
    warnings: base.warnings,
  });
  const fallbackB = createMatchTraceEvent({
    traceId: "fallback-b",
    source: "official_match_event",
    minute: base.minute,
    teamId: base.teamId,
    opponentTeamId: base.opponentTeamId,
    phase: base.phase,
    zone: base.zone,
    actionType: base.actionType,
    outcome: base.outcome,
    primaryPlayerId: "fallback-player",
    pressureLevel: base.pressureLevel,
    causeTags: base.causeTags,
    impactTags: base.impactTags,
    coachVisible: base.coachVisible,
    diagnosticWeight: base.diagnosticWeight,
    officialTruth: true,
    tags: base.tags,
    warnings: base.warnings,
  });
  const fallbackDeduplicated = deduplicateMatchTraces({ traces: [fallbackA, fallbackB] });

  assertTest(deduplicated.duplicateCount === 1, "sourceEventId duplicate count must be correct.");
  assertTest(officialDuplicate?.source === "official_match_event", "source priority must keep official trace.");
  assertTest(fallbackDeduplicated.duplicateCount === 1, "fallback key duplicate count must be correct.");
  assertTest(fallbackDeduplicated.deduplicatedTraces[0]?.source === "official_match_event", "fallback priority must keep official.");
  assertTest(deduplicated.deduplicatedTraces.some((trace) => trace.source === "sandbox_event"), "sandbox traces remain separate.");
  assertTest(traces.length === 5, "deduplication must not mutate input traces.");
  assertTest(deduplicated.deduplicatedTraces.every((trace) => !trace.canMutateScore && !trace.canMutateTimeline), "deduplication cannot mutate score or official timeline.");

  return [
    "deduplicates by sourceEventId when available",
    "falls back to sequence/minute/team/action/zone/player key",
    "source priority keeps official over mini-match duplicates",
    "sandbox traces remain separate and never become official",
    "deduplication does not mutate traces, score, or official timeline",
  ];
}

if (require.main === module) {
  const checks = validateDeduplicateMatchTraces();

  console.log("deduplicateMatchTraces tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

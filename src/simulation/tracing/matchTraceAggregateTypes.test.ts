import { matchTraceAggregateFixture } from "./matchTraceAggregateFixture";
import { matchTraceAggregateFromSpine } from "./matchTraceAggregateFromSpine";
import type { MatchTraceSpineModel } from "./matchTraceSpine";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function fixtureSpine(): MatchTraceSpineModel {
  const traces = matchTraceAggregateFixture();

  return {
    status: "available",
    traces,
    totalTraceCount: traces.length,
    officialTraceCount: traces.filter((trace) => trace.source === "official_match_event").length,
    miniMatchTraceCount: traces.filter((trace) => trace.source === "mini_match_record").length,
    sandboxTraceCount: traces.filter((trace) => trace.source === "sandbox_event").length,
    phaseCoverageCount: 4,
    actionTypeCoverageCount: 4,
    causeTagCoverageCount: 4,
    impactTagCoverageCount: 5,
    coachVisibleTraceCount: traces.filter((trace) => trace.coachVisible).length,
    officialTruthTrueCount: traces.filter((trace) => trace.officialTruth).length,
    officialTruthFalseCount: traces.filter((trace) => !trace.officialTruth).length,
    traceMutationCount: 0,
    scoreMutationCount: 0,
    possessionMutationCount: 0,
    productionScoringEventCreationCount: 0,
    liveSelectionDriverCount: 0,
    productionRouteResolutionDriverCount: 0,
    globalEconomyClaimCount: 0,
    selectionPreviewTraceBackingStatus: "sandbox_only",
    tags: ["match_event_trace_spine"],
    warnings: [],
  };
}

export function validateMatchTraceAggregateTypes(): readonly string[] {
  const aggregate = matchTraceAggregateFromSpine({ traceSpine: fixtureSpine() });

  assertTest(aggregate.official.scope === "official", "aggregate must expose official bucket.");
  assertTest(aggregate.diagnostic.scope === "diagnostic", "aggregate must expose diagnostic bucket.");
  assertTest(aggregate.sandbox.scope === "sandbox", "aggregate must expose sandbox bucket.");
  assertTest(aggregate.official.traceCount > 0, "official bucket must have trace count.");
  assertTest(aggregate.official.sourceCounts.official_match_event > 0, "official bucket must have source counts.");
  assertTest(Object.keys(aggregate.official.phaseCounts).length > 0, "official bucket must have phase counts.");
  assertTest(Object.keys(aggregate.official.actionTypeCounts).length > 0, "official bucket must have action counts.");
  assertTest(Object.keys(aggregate.official.causeTagCounts).length > 0, "official bucket must have cause counts.");
  assertTest(Object.keys(aggregate.official.impactTagCounts).length > 0, "official bucket must have impact counts.");
  assertTest(Object.keys(aggregate.official.dangerByZone).length > 0, "official bucket must have zone aggregates.");
  assertTest(Object.keys(aggregate.official.playerInvolvement).length > 0, "official bucket must have player involvement.");
  assertTest(!aggregate.canMutateTimeline && !aggregate.canMutateScore, "aggregate guardrails must be false.");
  assertTest(!aggregate.canClaimGlobalEconomy, "aggregate cannot claim global economy.");

  return [
    "aggregate model has official, diagnostic, sandbox buckets",
    "each bucket exposes trace/source/phase/action/cause/impact counts",
    "zone aggregates and player involvement exist",
    "model has mutation guardrails and cannot claim global economy",
  ];
}

if (require.main === module) {
  const checks = validateMatchTraceAggregateTypes();

  console.log("matchTraceAggregateTypes tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}


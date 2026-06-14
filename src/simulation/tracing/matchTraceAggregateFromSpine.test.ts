import { matchTraceAggregateFixture } from "./matchTraceAggregateFixture";
import { matchTraceAggregateFromSpine } from "./matchTraceAggregateFromSpine";
import type { MatchTraceSpineModel } from "./matchTraceSpine";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function spine(status: MatchTraceSpineModel["status"]): MatchTraceSpineModel {
  const traces = status === "available" ? matchTraceAggregateFixture() : [];

  return {
    status,
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

export function validateMatchTraceAggregateFromSpine(): readonly string[] {
  const unavailable = matchTraceAggregateFromSpine({ traceSpine: spine("not_available") });
  const aggregate = matchTraceAggregateFromSpine({ traceSpine: spine("available") });

  assertTest(unavailable.status === "not_available", "unavailable spine must return not_available aggregate.");
  assertTest(aggregate.status === "available", "available spine must return available aggregate.");
  assertTest(aggregate.official.officialTruthFalseCount === 0, "official bucket contains only official truth traces.");
  assertTest(aggregate.sandbox.officialTruthTrueCount === 0, "sandbox bucket contains only non-official traces.");
  assertTest(aggregate.diagnostic.officialTruthTrueCount === 0, "diagnostic bucket does not become official truth.");
  assertTest(aggregate.totalInputTraceCount === 5, "input trace count must be preserved.");
  assertTest(aggregate.totalDeduplicatedTraceCount > 0, "deduplicated count must be present.");
  assertTest(aggregate.totalDuplicateTraceCount === 1, "duplicate count must be present.");
  assertTest(aggregate.official.dangerByZone["Z5-C"] === 1, "danger by zone must be computed.");
  assertTest(aggregate.official.possessionLossByZone["Z3-HSL"] === 1, "possession loss by zone must be computed.");
  assertTest(aggregate.official.pressureLossByZone["Z3-HSL"] === 1, "pressure loss by zone must be computed.");
  assertTest(aggregate.diagnostic.recoveryByZone["Z3-C"] === 1, "recovery by zone must be computed.");
  assertTest(aggregate.official.playerInvolvement["control-space-hunter"] === 1, "player involvement must be computed.");
  assertTest((aggregate.official.causeTagCounts.good_decision ?? 0) > 0, "cause tag counts must be computed.");
  assertTest((aggregate.official.impactTagCounts.danger_created ?? 0) > 0, "impact tag counts must be computed.");
  assertTest(!aggregate.canMutateTimeline && !aggregate.canDriveLiveSelection, "guardrails must remain false.");

  return [
    "unavailable spine returns not_available",
    "available spine returns available aggregate",
    "official, diagnostic, and sandbox scopes remain separated",
    "input/deduplicated/duplicate counts are present",
    "zone, player, cause, and impact aggregates are computed",
    "guardrails remain false",
  ];
}

if (require.main === module) {
  const checks = validateMatchTraceAggregateFromSpine();

  console.log("matchTraceAggregateFromSpine tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}


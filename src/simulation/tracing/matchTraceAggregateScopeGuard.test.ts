import { matchTraceAggregateFixture } from "./matchTraceAggregateFixture";
import { matchTraceAggregateFromSpine } from "./matchTraceAggregateFromSpine";
import type { MatchTraceSpineModel } from "./matchTraceSpine";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateMatchTraceAggregateScopeGuard(): readonly string[] {
  const traces = matchTraceAggregateFixture();
  const aggregate = matchTraceAggregateFromSpine({
    traceSpine: {
      status: "available",
      traces,
      totalTraceCount: traces.length,
      officialTraceCount: 2,
      miniMatchTraceCount: 2,
      sandboxTraceCount: 1,
      phaseCoverageCount: 4,
      actionTypeCoverageCount: 4,
      causeTagCoverageCount: 4,
      impactTagCoverageCount: 5,
      coachVisibleTraceCount: 4,
      officialTruthTrueCount: 2,
      officialTruthFalseCount: 3,
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
    } satisfies MatchTraceSpineModel,
  });

  assertTest(aggregate.official.sourceCounts.sandbox_event === 0, "official aggregate excludes sandbox traces.");
  assertTest(aggregate.diagnostic.deduplicatedTraceCount === 1, "diagnostic duplicate of official trace must be excluded.");
  assertTest(aggregate.tags.includes("selection_preview_confidence_not_upgraded_by_aggregator"), "sandbox aggregate cannot upgrade selection preview confidence.");
  assertTest(aggregate.sandbox.officialTruthTrueCount === 0, "sandbox aggregate cannot become official truth.");
  assertTest(!aggregate.diagnostic.sourceCounts.official_match_event, "diagnostic aggregate cannot include official traces.");
  assertTest(!aggregate.canClaimGlobalEconomy, "diagnostic aggregate cannot claim global economy.");
  assertTest(!aggregate.canDriveLiveSelection, "aggregate cannot drive live selection.");
  assertTest(!aggregate.canDriveProductionRouteResolution, "aggregate cannot drive production route resolution.");

  return [
    "official aggregate excludes sandbox traces",
    "official aggregate excludes diagnostic-only mini-match duplicates when official trace exists",
    "sandbox aggregate cannot upgrade selection preview confidence or become official truth",
    "diagnostic aggregate cannot claim global economy",
    "aggregate cannot drive live selection or production route resolution",
  ];
}

if (require.main === module) {
  const checks = validateMatchTraceAggregateScopeGuard();

  console.log("matchTraceAggregateScopeGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}


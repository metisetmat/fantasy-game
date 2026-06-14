import { matchTraceAggregateFixture } from "./matchTraceAggregateFixture";
import { matchTraceAggregateFromSpine } from "./matchTraceAggregateFromSpine";
import {
  matchTraceAggregateCannotDriveProduction,
  matchTraceAggregateCannotMutateOfficialState,
} from "./matchTraceAggregateGuards";
import type { MatchTraceSpineModel } from "./matchTraceSpine";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateMatchTraceAggregatorGuard(): readonly string[] {
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

  assertTest(matchTraceAggregateCannotMutateOfficialState(aggregate), "aggregator cannot mutate official state.");
  assertTest(matchTraceAggregateCannotDriveProduction(aggregate), "aggregator cannot drive production.");
  assertTest(!aggregate.canMutateTimeline, "aggregator cannot mutate official timeline.");
  assertTest(!aggregate.canMutateScore, "aggregator cannot mutate official score.");
  assertTest(!aggregate.canMutatePossession, "aggregator cannot mutate official possession.");
  assertTest(!aggregate.canCreateScoringEvent, "aggregator cannot mutate official scoring events or create production events.");
  assertTest(!aggregate.canClaimGlobalEconomy, "aggregator cannot claim global economy.");
  assertTest(!aggregate.canDriveLiveSelection, "aggregator cannot drive live selection.");
  assertTest(!aggregate.canDriveProductionRouteResolution, "aggregator cannot drive production route resolution.");

  return [
    "aggregator cannot mutate official timeline, score, possession, or scoring events",
    "aggregator cannot create production scoring events",
    "aggregator cannot claim global economy",
    "aggregator cannot drive live selection or production route resolution",
  ];
}

if (require.main === module) {
  const checks = validateMatchTraceAggregatorGuard();

  console.log("matchTraceAggregatorGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}


import { matchTraceAggregateFixture } from "../simulation/tracing/matchTraceAggregateFixture";
import { matchTraceAggregateFromSpine } from "../simulation/tracing/matchTraceAggregateFromSpine";
import type { MatchTraceSpineModel } from "../simulation/tracing/matchTraceSpine";
import { buildCoachReportFromTraceAggregates } from "./coachReportFromTraceAggregates";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportTraceAggregateScopeGuard(): readonly string[] {
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
  const report = buildCoachReportFromTraceAggregates({ aggregate });

  assertTest(report.cards.every((card) => !card.usesSandboxAggregatesAsTruth), "official cards cannot use sandbox aggregates as truth.");
  assertTest(report.cards.every((card) => !card.usesDiagnosticAggregatesAsTruth), "official cards cannot use diagnostic aggregates as truth.");
  assertTest(!report.cards.some((card) => card.confidence === "high"), "sandbox evidence cannot raise official confidence to high.");
  assertTest(!report.selectionPreviewConfidenceUpgraded, "diagnostic evidence cannot raise selection preview confidence.");
  assertTest(!report.canClaimGlobalEconomy, "report cannot claim global economy.");
  assertTest(!report.canDriveCoachInstruction, "report cannot drive coach instruction.");
  assertTest(!report.canDriveLiveSelection, "report cannot drive live selection.");
  assertTest(!report.canDriveProductionRouteResolution, "report cannot drive production route resolution.");

  return [
    "official cards cannot use sandbox or diagnostic aggregates as truth",
    "sandbox and diagnostic evidence cannot raise official confidence",
    "report cannot claim global economy",
    "report cannot drive coach instruction, live selection, or production route resolution",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportTraceAggregateScopeGuard();

  console.log("coachReportTraceAggregateScopeGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}


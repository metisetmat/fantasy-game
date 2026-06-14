import { matchTraceAggregateFixture } from "../simulation/tracing/matchTraceAggregateFixture";
import { matchTraceAggregateFromSpine } from "../simulation/tracing/matchTraceAggregateFromSpine";
import type { MatchTraceSpineModel } from "../simulation/tracing/matchTraceSpine";
import { buildCoachReportFromTraceAggregates } from "./coachReportFromTraceAggregates";

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

export function validateCoachReportFromTraceAggregates(): readonly string[] {
  const unavailable = buildCoachReportFromTraceAggregates({
    aggregate: matchTraceAggregateFromSpine({ traceSpine: spine("not_available") }),
  });
  const report = buildCoachReportFromTraceAggregates({
    aggregate: matchTraceAggregateFromSpine({ traceSpine: spine("available") }),
  });

  assertTest(unavailable.status === "not_available", "unavailable aggregate must return not_available.");
  assertTest(report.status === "available", "available aggregate must return available report model.");
  assertTest(report.cardCount >= 4 && report.cardCount <= 6, "report must have 4 to 6 cards.");
  assertTest(report.cards.every((card) => card.sourceScope === "official"), "cards must use official source scope.");
  assertTest(report.cards.every((card) => card.basedOnOfficialAggregates), "cards must be based on official aggregates.");
  assertTest(report.cards.every((card) => !card.usesDiagnosticAggregatesAsTruth), "cards must not use diagnostic aggregates as truth.");
  assertTest(report.cards.every((card) => !card.usesSandboxAggregatesAsTruth), "cards must not use sandbox aggregates as truth.");
  assertTest(report.cardCount === report.cards.length, "card count must be present.");
  assertTest(report.officialAggregateTraceCount > 0, "official aggregate trace count must be present.");
  assertTest(report.diagnosticAggregateTraceCount >= 0 && report.sandboxAggregateTraceCount >= 0, "diagnostic and sandbox counts must remain available.");
  assertTest(report.selectionPreviewStillSandboxOnly, "selection preview must remain sandbox_only.");
  assertTest(!report.selectionPreviewConfidenceUpgraded, "selection preview confidence must not be upgraded.");
  assertTest(!report.canMutateTimeline && !report.canClaimGlobalEconomy, "guardrails must remain false.");

  return [
    "unavailable aggregate returns not_available",
    "available aggregate returns available report model",
    "report has 4 to 6 official cards",
    "diagnostic and sandbox counts remain separate",
    "Selection Preview remains sandbox_only and not upgraded",
    "guardrails remain false",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportFromTraceAggregates();

  console.log("coachReportFromTraceAggregates tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}


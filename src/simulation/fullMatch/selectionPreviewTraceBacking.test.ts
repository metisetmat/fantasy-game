import { sandboxDecisionEvidenceCalibrationFixture } from "./sandboxDecisionBatchConfidenceTestHelpers";
import { sandboxDecisionBatchConfidenceCalibrationFromEvidence } from "./sandboxDecisionBatchConfidenceCalibrationFromEvidence";
import { multiScenarioCoachTestPlanFromBatch } from "./multiScenarioCoachTestPlanFromBatch";
import { selectionPreviewFromCoachTestPlan } from "./selectionPreviewFromCoachTestPlanBuilder";
import {
  selectionPreviewCannotChangeSelection,
  selectionPreviewCannotMutateOfficialFullMatch,
} from "./selectionPreviewFromCoachTestPlan";
import { matchTraceAggregateFixture } from "../tracing/matchTraceAggregateFixture";
import { matchTraceAggregateFromSpine } from "../tracing/matchTraceAggregateFromSpine";
import type { MatchTraceSpineModel } from "../tracing/matchTraceSpine";
import { matchSelectionPreviewToTraceAggregates } from "./matchSelectionPreviewToTraceAggregates";
import {
  selectionPreviewTraceBackingCannotDriveSelection,
  selectionPreviewTraceBackingCannotMutateOfficialState,
} from "./selectionPreviewTraceBacking";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSelectionPreviewTraceBacking(): readonly string[] {
  const batch = sandboxDecisionBatchConfidenceCalibrationFromEvidence({
    calibration: sandboxDecisionEvidenceCalibrationFixture(),
  });
  const plan = multiScenarioCoachTestPlanFromBatch({ batchCalibration: batch });
  const preview = selectionPreviewFromCoachTestPlan({ testPlan: plan });
  const traces = matchTraceAggregateFixture();
  const aggregate = matchTraceAggregateFromSpine({
    traceSpine: {
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
    } satisfies MatchTraceSpineModel,
  });
  const traceBacking = matchSelectionPreviewToTraceAggregates({ preview, aggregate });

  assertTest(preview.status === "available", "selection preview must remain available.");
  assertTest(preview.selectionPreviewTraceBackingStatus === "sandbox_only", "selection preview trace backing must be sandbox_only.");
  assertTest(preview.selectionPreviewRequiresMatchTraceSpine, "selection preview must require match trace spine.");
  assertTest(preview.selectionPreviewFutureTraceConsumer, "selection preview must be marked as future trace consumer.");
  assertTest(preview.tags.includes("selection_preview_trace_backing_status_sandbox_only"), "technical trace backing tag must exist.");
  assertTest(preview.tags.includes("selection_preview_requires_match_trace_spine_true"), "technical trace requirement tag must exist.");
  assertTest(preview.tags.includes("selection_preview_future_trace_consumer_true"), "technical future consumer tag must exist.");
  assertTest(selectionPreviewCannotMutateOfficialFullMatch(preview), "preview must not mutate official full match.");
  assertTest(selectionPreviewCannotChangeSelection(preview), "preview must not change lineup/starters/bench.");
  assertTest(traceBacking.status === "available", "trace backing model must exist.");
  assertTest(traceBacking.previewCount === 3, "trace backing preview count must remain 3.");
  assertTest(traceBacking.supports.every((support) => support.newBackingStatus === "sandbox_only" || support.newBackingStatus === "trace_supported"), "trace backing statuses must be supported.");
  assertTest(traceBacking.officiallyConfirmedCount === 0, "officially_confirmed count must remain 0.");
  assertTest(!traceBacking.selectionPreviewConfidenceUpgraded, "trace backing must not upgrade confidence.");
  assertTest(traceBacking.selectionPreviewStillNonApplied, "trace backing must remain non-applied.");
  assertTest(selectionPreviewTraceBackingCannotMutateOfficialState(traceBacking), "trace backing cannot mutate official state.");
  assertTest(selectionPreviewTraceBackingCannotDriveSelection(traceBacking), "trace backing cannot drive selection.");

  return [
    "selection preview remains available",
    "selection preview trace backing status is sandbox_only",
    "selection preview requires match trace spine",
    "selection preview is marked as future trace consumer",
    "preview still cannot change lineup, starters, or bench",
    "trace backing model exists",
    "trace backing preview count remains 3",
    "officially_confirmed count remains 0",
    "trace backing cannot mutate state or drive selection",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewTraceBacking();

  console.log("selectionPreviewTraceBacking tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

import { sandboxDecisionEvidenceCalibrationFixture } from "./sandboxDecisionBatchConfidenceTestHelpers";
import { sandboxDecisionBatchConfidenceCalibrationFromEvidence } from "./sandboxDecisionBatchConfidenceCalibrationFromEvidence";
import { multiScenarioCoachTestPlanFromBatch } from "./multiScenarioCoachTestPlanFromBatch";
import { selectionPreviewFromCoachTestPlan } from "./selectionPreviewFromCoachTestPlanBuilder";
import {
  selectionPreviewCannotChangeSelection,
  selectionPreviewCannotMutateOfficialFullMatch,
} from "./selectionPreviewFromCoachTestPlan";

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

  assertTest(preview.status === "available", "selection preview must remain available.");
  assertTest(preview.selectionPreviewTraceBackingStatus === "sandbox_only", "selection preview trace backing must be sandbox_only.");
  assertTest(preview.selectionPreviewRequiresMatchTraceSpine, "selection preview must require match trace spine.");
  assertTest(preview.selectionPreviewFutureTraceConsumer, "selection preview must be marked as future trace consumer.");
  assertTest(preview.tags.includes("selection_preview_trace_backing_status_sandbox_only"), "technical trace backing tag must exist.");
  assertTest(preview.tags.includes("selection_preview_requires_match_trace_spine_true"), "technical trace requirement tag must exist.");
  assertTest(preview.tags.includes("selection_preview_future_trace_consumer_true"), "technical future consumer tag must exist.");
  assertTest(selectionPreviewCannotMutateOfficialFullMatch(preview), "preview must not mutate official full match.");
  assertTest(selectionPreviewCannotChangeSelection(preview), "preview must not change lineup/starters/bench.");

  return [
    "selection preview remains available",
    "selection preview trace backing status is sandbox_only",
    "selection preview requires match trace spine",
    "selection preview is marked as future trace consumer",
    "preview still cannot change lineup, starters, or bench",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewTraceBacking();

  console.log("selectionPreviewTraceBacking tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

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

export function validateSelectionPreviewTraceAggregateContinuity(): readonly string[] {
  const batch = sandboxDecisionBatchConfidenceCalibrationFromEvidence({
    calibration: sandboxDecisionEvidenceCalibrationFixture(),
  });
  const plan = multiScenarioCoachTestPlanFromBatch({ batchCalibration: batch });
  const preview = selectionPreviewFromCoachTestPlan({ testPlan: plan });

  assertTest(preview.status === "available", "selection preview must remain available.");
  assertTest(preview.selectionPreviewTraceBackingStatus === "sandbox_only", "selection preview must remain sandbox_only.");
  assertTest(preview.selectionPreviewFutureTraceConsumer, "selection preview must remain future trace consumer.");
  assertTest(!preview.tags.includes("selection_preview_confidence_upgraded_by_trace_aggregates"), "selection preview confidence must not be upgraded by Coach Report V0.");
  assertTest(selectionPreviewCannotChangeSelection(preview), "selection preview cannot change lineup/starters/bench.");
  assertTest(selectionPreviewCannotMutateOfficialFullMatch(preview), "selection preview cannot mutate official full match.");

  return [
    "selection preview remains available",
    "selection preview remains sandbox_only",
    "selection preview remains future trace consumer",
    "selection preview confidence is not upgraded by Coach Report V0",
    "selection preview cannot change lineup/starters/bench",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewTraceAggregateContinuity();

  console.log("selectionPreviewTraceAggregateContinuity tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}


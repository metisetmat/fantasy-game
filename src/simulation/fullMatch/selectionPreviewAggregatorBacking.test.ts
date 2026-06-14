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

export function validateSelectionPreviewAggregatorBacking(): readonly string[] {
  const batch = sandboxDecisionBatchConfidenceCalibrationFromEvidence({
    calibration: sandboxDecisionEvidenceCalibrationFixture(),
  });
  const plan = multiScenarioCoachTestPlanFromBatch({ batchCalibration: batch });
  const preview = selectionPreviewFromCoachTestPlan({ testPlan: plan });

  assertTest(preview.status === "available", "selection preview must remain available.");
  assertTest(preview.selectionPreviewTraceBackingStatus === "sandbox_only", "selection preview must remain sandbox_only.");
  assertTest(preview.selectionPreviewRequiresMatchTraceSpine, "selection preview must require match trace spine.");
  assertTest(preview.selectionPreviewFutureTraceConsumer, "selection preview must remain future trace consumer.");
  assertTest(preview.tags.includes("selection_preview_trace_backing_status_sandbox_only"), "selection preview trace tag must remain.");
  assertTest(!preview.tags.includes("selection_preview_confidence_upgraded_by_aggregator"), "selection preview confidence must not be upgraded by aggregator.");
  assertTest(selectionPreviewCannotChangeSelection(preview), "selection preview cannot change lineup/starters/bench.");
  assertTest(selectionPreviewCannotMutateOfficialFullMatch(preview), "selection preview cannot mutate official full match.");
  assertTest(!preview.canDriveLiveSelection, "selection preview cannot drive live selection.");
  assertTest(!preview.canDriveProductionRouteResolution, "selection preview cannot drive production route resolution.");

  return [
    "selection preview remains available",
    "selection preview remains sandbox_only and requires match trace spine",
    "selection preview is future trace consumer",
    "selection preview confidence is not upgraded by aggregator",
    "selection preview cannot change lineup/starters/bench or drive live selection",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewAggregatorBacking();

  console.log("selectionPreviewAggregatorBacking tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

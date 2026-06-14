import { sandboxDecisionEvidenceCalibrationFixture } from "./sandboxDecisionBatchConfidenceTestHelpers";
import { sandboxDecisionBatchConfidenceCalibrationFromEvidence } from "./sandboxDecisionBatchConfidenceCalibrationFromEvidence";
import { multiScenarioCoachTestPlanFromBatch } from "./multiScenarioCoachTestPlanFromBatch";
import {
  selectionPreviewCannotChangeSelection,
  selectionPreviewCannotClaimGlobalEconomy,
  selectionPreviewCannotMutateOfficialFullMatch,
} from "./selectionPreviewFromCoachTestPlan";
import { selectionPreviewFromCoachTestPlan } from "./selectionPreviewFromCoachTestPlanBuilder";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSelectionPreviewGuard(): readonly string[] {
  const batch = sandboxDecisionBatchConfidenceCalibrationFromEvidence({
    calibration: sandboxDecisionEvidenceCalibrationFixture(),
  });
  const plan = multiScenarioCoachTestPlanFromBatch({ batchCalibration: batch });
  const preview = selectionPreviewFromCoachTestPlan({ testPlan: plan });

  assertTest(preview.status === "available", "selection preview must be available.");
  assertTest(!preview.canChangeLineup, "preview cannot mutate lineup.");
  assertTest(!preview.canChangeStarters, "preview cannot mutate starters.");
  assertTest(!preview.canChangeBench, "preview cannot mutate bench.");
  assertTest(preview.officialTimelineUnchanged, "preview cannot mutate official timeline.");
  assertTest(preview.officialScoreUnchanged, "preview cannot mutate official score.");
  assertTest(preview.officialPossessionUnchanged, "preview cannot mutate official possession.");
  assertTest(preview.officialScoringEventsUnchanged, "preview cannot mutate official scoring events.");
  assertTest(!preview.canCreateProductionScoringEvents, "preview cannot create production scoring events.");
  assertTest(!preview.canClaimGlobalEconomy, "preview cannot claim global economy.");
  assertTest(!preview.canDriveCoachInstruction, "preview cannot become mandatory coach instruction.");
  assertTest(!preview.canDriveLiveSelection, "preview cannot drive live selection.");
  assertTest(!preview.canDriveProductionRouteResolution, "preview cannot drive production route resolution.");
  assertTest(selectionPreviewCannotMutateOfficialFullMatch(preview), "official mutation guard must pass.");
  assertTest(selectionPreviewCannotChangeSelection(preview), "selection-change guard must pass.");
  assertTest(selectionPreviewCannotClaimGlobalEconomy(preview), "global economy guard must pass.");

  return [
    "preview cannot mutate lineup, starters, or bench",
    "preview cannot mutate official timeline, score, possession, or scoring events",
    "preview cannot create production scoring events",
    "preview cannot claim global economy",
    "preview cannot drive live selection or production route resolution",
    "preview cannot become mandatory",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewGuard();

  console.log("selectionPreviewGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

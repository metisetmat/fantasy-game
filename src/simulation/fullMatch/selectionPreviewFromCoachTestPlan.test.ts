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

export function validateSelectionPreviewFromCoachTestPlan(): readonly string[] {
  const unavailableBatch = sandboxDecisionBatchConfidenceCalibrationFromEvidence({
    calibration: {
      ...sandboxDecisionEvidenceCalibrationFixture(),
      status: "not_available",
    },
  });
  const unavailablePlan = multiScenarioCoachTestPlanFromBatch({ batchCalibration: unavailableBatch });
  const unavailablePreview = selectionPreviewFromCoachTestPlan({ testPlan: unavailablePlan });
  const batch = sandboxDecisionBatchConfidenceCalibrationFromEvidence({
    calibration: sandboxDecisionEvidenceCalibrationFixture(),
  });
  const plan = multiScenarioCoachTestPlanFromBatch({ batchCalibration: batch });
  const preview = selectionPreviewFromCoachTestPlan({ testPlan: plan });
  const previewIds = new Set(preview.previews.map((card) => card.previewId));

  assertTest(unavailablePreview.status === "not_available", "not_available test plan must return not_available preview.");
  assertTest(preview.status === "available", "available test plan must return available preview.");
  assertTest(preview.previewCount === 3, "current fixture must have 3 previews.");
  assertTest(previewIds.has("support_near_z4_hsr"), "support near Z4-HSR preview must exist.");
  assertTest(previewIds.has("second_ball_presence"), "second-ball presence preview must exist.");
  assertTest(previewIds.has("strong_goalkeeper_response"), "strong goalkeeper response preview must exist.");
  for (const card of preview.previews) {
    assertTest(card.suggestedProfile.length > 0, "preview card must have suggested profile guidance.");
    assertTest(card.suggestedRoleFamily.length > 0, "preview card must have suggested role family.");
    assertTest(card.usefulAttributes.length > 0, "preview card must have useful attributes.");
    assertTest(card.expectedBenefit.length > 0, "preview card must have expected benefit.");
    assertTest(card.tradeoff.length > 0, "preview card must have trade-off.");
    assertTest(card.observationSignal.length > 0, "preview card must have observation signal.");
    assertTest(card.previewOnly, "preview card must be preview-only.");
    assertTest(!card.officialTruth, "preview card must not be official truth.");
    assertTest(!card.canChangeLineup, "preview card cannot change lineup.");
    assertTest(!card.canChangeStarters, "preview card cannot change starters.");
    assertTest(!card.canChangeBench, "preview card cannot change bench.");
    assertTest(!card.canDriveLiveSelection, "preview card cannot drive live selection.");
    assertTest(!card.canDriveProductionRouteResolution, "preview card cannot drive production route resolution.");
    assertTest(!card.canCreateProductionScoringEvents, "preview card cannot create production scoring events.");
    assertTest(!card.canClaimGlobalEconomy, "preview card cannot claim global economy.");
  }
  assertTest(selectionPreviewCannotMutateOfficialFullMatch(preview), "preview mutation guard must pass.");
  assertTest(selectionPreviewCannotChangeSelection(preview), "preview selection-change guard must pass.");
  assertTest(selectionPreviewCannotClaimGlobalEconomy(preview), "preview global economy guard must pass.");

  return [
    "not_available test plan returns not_available preview",
    "available test plan returns available preview",
    "current fixture has 3 selection preview cards",
    "support, second-ball, and goalkeeper-response previews are present",
    "each preview has role/profile, attributes, benefit, trade-off, and observation signal",
    "previews remain non-applied and cannot drive selection or production",
  ];
}

if (require.main === module) {
  const checks = validateSelectionPreviewFromCoachTestPlan();

  console.log("selectionPreviewFromCoachTestPlan tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

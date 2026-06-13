import { sandboxDecisionEvidenceCalibrationFixture } from "./sandboxDecisionBatchConfidenceTestHelpers";
import { sandboxDecisionBatchConfidenceCalibrationFromEvidence } from "./sandboxDecisionBatchConfidenceCalibrationFromEvidence";
import {
  multiScenarioCoachTestPlanCannotClaimGlobalEconomy,
  multiScenarioCoachTestPlanCannotDriveProduction,
  multiScenarioCoachTestPlanCannotMutateOfficialFullMatch,
} from "./multiScenarioCoachTestPlan";
import { multiScenarioCoachTestPlanFromBatch } from "./multiScenarioCoachTestPlanFromBatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateMultiScenarioCoachTestPlanFromBatch(): readonly string[] {
  const unavailableBatch = sandboxDecisionBatchConfidenceCalibrationFromEvidence({
    calibration: {
      ...sandboxDecisionEvidenceCalibrationFixture(),
      status: "not_available",
    },
  });
  const unavailablePlan = multiScenarioCoachTestPlanFromBatch({ batchCalibration: unavailableBatch });
  const batch = sandboxDecisionBatchConfidenceCalibrationFromEvidence({
    calibration: sandboxDecisionEvidenceCalibrationFixture(),
  });
  const plan = multiScenarioCoachTestPlanFromBatch({ batchCalibration: batch });
  const testIds = new Set(plan.tests.map((test) => test.testId));
  const scenarioIds = new Set(plan.tests.map((test) => test.linkedScenarioId));

  assertTest(unavailablePlan.status === "not_available", "not_available batch must return not_available plan.");
  assertTest(plan.status === "available", "available batch must return available plan.");
  assertTest(plan.testCount >= 2 && plan.testCount <= 3, "plan must have 2 or 3 tests.");
  assertTest(plan.testCount === 3, "current fixture must have 3 tests.");
  assertTest(testIds.has("support_around_z4_hsr"), "support around Z4-HSR test must be present.");
  assertTest(testIds.has("second_ball_occupation"), "second-ball occupation test must be present.");
  assertTest(testIds.has("strong_goalkeeper_fallback"), "strong-goalkeeper fallback test must be present.");
  assertTest(batch.bestScenarioId !== undefined && scenarioIds.has(batch.bestScenarioId), "linked best scenario must be used.");
  assertTest(batch.worstScenarioId !== undefined && scenarioIds.has(batch.worstScenarioId), "linked worst scenario must be used.");
  assertTest(plan.planSuggestionOnly, "plan must be suggestion-only.");
  assertTest(!plan.officialTruth, "plan must not be official truth.");
  assertTest(!plan.canDriveCoachInstruction, "plan cannot drive coach instruction.");
  assertTest(!plan.canDriveLiveSelection, "plan cannot drive live selection.");
  assertTest(!plan.canDriveProductionRouteResolution, "plan cannot drive production route resolution.");
  assertTest(!plan.canCreateProductionScoringEvents, "plan cannot create production scoring events.");
  assertTest(!plan.canClaimGlobalEconomy, "plan cannot claim global economy.");
  assertTest(multiScenarioCoachTestPlanCannotMutateOfficialFullMatch(plan), "plan mutation guard must pass.");
  assertTest(multiScenarioCoachTestPlanCannotDriveProduction(plan), "plan production driver guard must pass.");
  assertTest(multiScenarioCoachTestPlanCannotClaimGlobalEconomy(plan), "plan global economy guard must pass.");

  return [
    "not_available batch returns not_available plan",
    "available batch returns available plan",
    "current fixture has 3 coach tests",
    "support around Z4-HSR, second-ball occupation, and goalkeeper fallback tests are present",
    "best and worst scenarios are linked",
    "plan remains suggestion-only and cannot drive production",
    "plan cannot mutate official match state or claim global economy",
  ];
}

if (require.main === module) {
  const checks = validateMultiScenarioCoachTestPlanFromBatch();

  console.log("multiScenarioCoachTestPlanFromBatch tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

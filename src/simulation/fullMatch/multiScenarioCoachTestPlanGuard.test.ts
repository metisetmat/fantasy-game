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

export function validateMultiScenarioCoachTestPlanGuard(): readonly string[] {
  const batch = sandboxDecisionBatchConfidenceCalibrationFromEvidence({
    calibration: sandboxDecisionEvidenceCalibrationFixture(),
  });
  const plan = multiScenarioCoachTestPlanFromBatch({ batchCalibration: batch });

  assertTest(plan.status === "available", "coach test plan must be available.");
  assertTest(plan.officialTimelineUnchanged, "plan cannot mutate official timeline.");
  assertTest(plan.officialScoreUnchanged, "plan cannot mutate official score.");
  assertTest(plan.officialPossessionUnchanged, "plan cannot mutate official possession.");
  assertTest(plan.officialScoringEventsUnchanged, "plan cannot mutate official scoring events.");
  assertTest(!plan.canCreateProductionScoringEvents, "plan cannot create production scoring events.");
  assertTest(!plan.canClaimGlobalEconomy, "plan cannot claim global economy.");
  assertTest(!plan.canDriveCoachInstruction, "plan cannot become mandatory coach instruction.");
  assertTest(!plan.canDriveLiveSelection, "plan cannot drive live selection.");
  assertTest(!plan.canDriveProductionRouteResolution, "plan cannot drive production route resolution.");
  assertTest(multiScenarioCoachTestPlanCannotMutateOfficialFullMatch(plan), "official mutation guard must pass.");
  assertTest(multiScenarioCoachTestPlanCannotDriveProduction(plan), "production driver guard must pass.");
  assertTest(multiScenarioCoachTestPlanCannotClaimGlobalEconomy(plan), "global economy guard must pass.");

  return [
    "plan cannot mutate official timeline, score, possession, or scoring events",
    "plan cannot create production scoring events",
    "plan cannot claim global economy",
    "plan cannot drive live selection or production route resolution",
    "plan cannot become mandatory coach instruction",
  ];
}

if (require.main === module) {
  const checks = validateMultiScenarioCoachTestPlanGuard();

  console.log("multiScenarioCoachTestPlanGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

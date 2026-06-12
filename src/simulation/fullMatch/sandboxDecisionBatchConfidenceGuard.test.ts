import { sandboxDecisionEvidenceCalibrationFixture } from "./sandboxDecisionBatchConfidenceTestHelpers";
import {
  sandboxDecisionBatchConfidenceCalibrationCannotClaimGlobalEconomy,
  sandboxDecisionBatchConfidenceCalibrationCannotDriveProduction,
  sandboxDecisionBatchConfidenceCalibrationCannotMutateOfficialFullMatch,
  sandboxDecisionBatchConfidenceCalibrationFromEvidence,
} from "./sandboxDecisionBatchConfidenceCalibrationFromEvidence";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSandboxDecisionBatchConfidenceGuard(): readonly string[] {
  const batch = sandboxDecisionBatchConfidenceCalibrationFromEvidence({
    calibration: sandboxDecisionEvidenceCalibrationFixture(),
  });

  assertTest(batch.status === "available", "batch confidence must be available.");
  assertTest(batch.officialTimelineUnchanged, "batch cannot inject events into official timeline.");
  assertTest(batch.officialScoreUnchanged, "batch cannot mutate official score.");
  assertTest(batch.officialPossessionUnchanged, "batch cannot mutate official possession.");
  assertTest(batch.officialScoringEventsUnchanged, "batch cannot mutate official scoring events.");
  assertTest(!batch.canCreateProductionScoringEvents, "batch cannot create production scoring events.");
  assertTest(!batch.canClaimGlobalEconomy, "batch cannot claim global economy.");
  assertTest(!batch.canDriveLiveSelection, "batch cannot drive live selection.");
  assertTest(!batch.canDriveProductionRouteResolution, "batch cannot drive production route resolution.");
  assertTest(batch.batchConfidence !== "medium" || batch.averageEvidenceScore >= 55, "local batch cannot become strong.");
  assertTest(sandboxDecisionBatchConfidenceCalibrationCannotMutateOfficialFullMatch(batch), "mutation guard must pass.");
  assertTest(sandboxDecisionBatchConfidenceCalibrationCannotDriveProduction(batch), "production driver guard must pass.");
  assertTest(sandboxDecisionBatchConfidenceCalibrationCannotClaimGlobalEconomy(batch), "global economy guard must pass.");

  return [
    "batch confidence cannot mutate official timeline, score, possession, or scoring events",
    "batch confidence cannot create production scoring events",
    "batch confidence cannot claim global economy",
    "batch confidence cannot drive live selection or production route resolution",
    "batch confidence cannot become strong from local sandbox-only scenarios",
  ];
}

if (require.main === module) {
  const checks = validateSandboxDecisionBatchConfidenceGuard();

  console.log("sandboxDecisionBatchConfidenceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

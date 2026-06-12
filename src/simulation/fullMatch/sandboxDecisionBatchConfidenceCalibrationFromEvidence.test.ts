import { emptySandboxDecisionEvidenceCalibrationModel } from "./sandboxDecisionEvidenceCalibration";
import { sandboxDecisionEvidenceCalibrationFixture } from "./sandboxDecisionBatchConfidenceTestHelpers";
import { sandboxDecisionBatchConfidenceCalibrationFromEvidence } from "./sandboxDecisionBatchConfidenceCalibrationFromEvidence";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSandboxDecisionBatchConfidenceCalibrationFromEvidence(): readonly string[] {
  const missing = sandboxDecisionBatchConfidenceCalibrationFromEvidence({
    calibration: emptySandboxDecisionEvidenceCalibrationModel({ warnings: [] }),
  });
  const batch = sandboxDecisionBatchConfidenceCalibrationFromEvidence({
    calibration: sandboxDecisionEvidenceCalibrationFixture(),
  });

  assertTest(missing.status === "not_available", "not_available evidence calibration must return not_available batch.");
  assertTest(batch.status === "available", "available evidence calibration must return available batch.");
  assertTest(batch.origin === "sandbox_decision_evidence_calibration", "batch origin must be evidence calibration.");
  assertTest(batch.scenarioCount >= 6, "batch scenario count must be at least 6.");
  assertTest(batch.averageEvidenceScore > 0, "average evidence score must be present.");
  assertTest(batch.minEvidenceScore >= 0, "min evidence score must be present.");
  assertTest(batch.maxEvidenceScore <= 100, "max evidence score must be present.");
  assertTest(["very_low", "low", "low_medium", "medium"].includes(batch.batchConfidence), "batch confidence must be present.");
  assertTest(batch.batchConfidence !== "medium" || batch.averageEvidenceScore >= 55, "medium confidence requires enough average evidence.");
  assertTest(batch.localSandboxBatchOnly, "batch must remain local sandbox only.");
  assertTest(!batch.officialTruth, "batch must not be official truth.");
  assertTest(!batch.canDriveLiveSelection, "batch cannot drive live selection.");
  assertTest(!batch.canDriveProductionRouteResolution, "batch cannot drive production route resolution.");
  assertTest(!batch.canCreateProductionScoringEvents, "batch cannot create production scoring events.");
  assertTest(!batch.canClaimGlobalEconomy, "batch cannot claim global economy.");

  return [
    "not_available evidence calibration returns not_available batch",
    "available evidence calibration returns available batch",
    "scenario count and score statistics are populated",
    "batch confidence remains capped to local confidence values",
    "batch preserves all sandbox-only guardrails",
  ];
}

if (require.main === module) {
  const checks = validateSandboxDecisionBatchConfidenceCalibrationFromEvidence();

  console.log("sandboxDecisionBatchConfidenceCalibrationFromEvidence tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

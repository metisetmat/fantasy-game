import { runFullMatchTraceValidationModel } from "./fullMatchTraceValidationComparisons";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateProfileSignalCalibrationGuard(): readonly string[] {
  const model = runFullMatchTraceValidationModel();

  assertTest(model.mutationCountsAllZero, "calibration cannot mutate official timeline, score, possession, or scoring events.");
  assertTest(model.productionScoringEventCreationCount === 0, "calibration cannot create production scoring events.");
  assertTest(model.globalEconomyClaimCount === 0, "calibration cannot claim global economy.");
  assertTest(model.profiles.every((profile) => !profile.canDriveLiveSelection), "calibration cannot drive live selection.");
  assertTest(model.profiles.every((profile) => !profile.canDriveProductionRouteResolution), "calibration cannot drive production route resolution.");
  assertTest(model.allProfilesKeepOfficialDiagnosticSandboxSeparate, "sandbox and diagnostic data cannot become official truth.");
  assertTest(model.allProfilesKeepSelectionPreviewSandboxOnly, "Selection Preview must remain sandbox_only.");
  assertTest(model.noProfileUpgradesSelectionPreviewConfidence, "Selection Preview confidence cannot be upgraded.");

  return [
    "calibration cannot mutate official timeline",
    "calibration cannot mutate official score",
    "calibration cannot mutate official possession",
    "calibration cannot mutate official scoring events",
    "calibration cannot create production scoring events",
    "calibration cannot claim global economy",
    "calibration cannot drive live selection",
    "calibration cannot drive production route resolution",
    "sandbox cannot become official truth",
    "diagnostic cannot become official truth",
    "Selection Preview cannot be upgraded",
  ];
}

if (require.main === module) {
  const checks = validateProfileSignalCalibrationGuard();

  console.log("profileSignalCalibrationGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

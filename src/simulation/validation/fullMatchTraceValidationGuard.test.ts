import { runFullMatchTraceValidationModel } from "./fullMatchTraceValidationComparisons";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchTraceValidationGuard(): readonly string[] {
  const model = runFullMatchTraceValidationModel();

  assertTest(model.profiles.every((profile) => !profile.canMutateTimeline), "validation cannot mutate official timeline.");
  assertTest(model.profiles.every((profile) => !profile.canMutateScore), "validation cannot mutate official score.");
  assertTest(model.profiles.every((profile) => !profile.canMutatePossession), "validation cannot mutate official possession.");
  assertTest(model.profiles.every((profile) => !profile.canCreateScoringEvent), "validation cannot mutate official scoring events.");
  assertTest(model.productionScoringEventCreationCount === 0, "validation cannot create production scoring events.");
  assertTest(model.profiles.every((profile) => !profile.canDriveLiveSelection), "validation cannot drive live selection.");
  assertTest(model.profiles.every((profile) => !profile.canDriveProductionRouteResolution), "validation cannot drive production route resolution.");
  assertTest(model.globalEconomyClaimCount === 0, "validation cannot claim global economy.");
  assertTest(model.allProfilesKeepOfficialDiagnosticSandboxSeparate, "sandbox cannot become official truth.");
  assertTest(model.allProfilesKeepOfficialDiagnosticSandboxSeparate, "diagnostic cannot become official truth.");
  assertTest(model.allProfilesKeepSelectionPreviewSandboxOnly, "selection preview cannot be upgraded from sandbox_only.");
  assertTest(model.noProfileUpgradesSelectionPreviewConfidence, "selection preview confidence cannot be upgraded.");

  return [
    "validation cannot mutate official timeline",
    "validation cannot mutate official score",
    "validation cannot mutate official possession",
    "validation cannot mutate official scoring events",
    "validation cannot create production scoring events",
    "validation cannot drive live selection",
    "validation cannot drive production route resolution",
    "validation cannot claim global economy",
    "sandbox cannot become official truth",
    "diagnostic cannot become official truth",
    "selection preview cannot be upgraded",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchTraceValidationGuard();

  console.log("fullMatchTraceValidationGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

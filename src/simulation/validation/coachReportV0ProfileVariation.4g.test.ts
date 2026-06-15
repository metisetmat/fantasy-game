import { runFullMatchTraceValidationModel } from "./fullMatchTraceValidationComparisons";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportV0ProfileVariation4G(): readonly string[] {
  const model = runFullMatchTraceValidationModel();
  const changedProfileCount = model.profiles.filter((profile) => profile.reportChangedFromBaseline).length;
  const explicitChangedCards = model.profiles.every((profile) =>
    profile.profileId === model.baselineProfileId || profile.changedCards.length > 0
  );

  assertTest(model.reportVariationDetected, "report variation must remain detected.");
  assertTest(changedProfileCount >= 5, `at least 5 of 6 profiles must change cards compared with baseline, got ${changedProfileCount}.`);
  assertTest(explicitChangedCards, "changed cards must remain explicit for non-baseline profiles.");
  assertTest(model.distinctWatchpointProfiles >= 2, "profile-specific watchpoints must differ for at least 2 profiles.");
  assertTest(model.profiles.every((profile) => Array.isArray(profile.expectedSignalTagsMissing)), "missing expected signals must be explicit.");

  return [
    "report variation remains detected",
    "at least 5 of 6 profiles change cards compared with baseline",
    "changed cards remain explicit",
    "watchpoints differ for at least 2 profiles",
    "missing expected signals are explicit",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV0ProfileVariation4G();

  console.log("coachReportV0ProfileVariation.4g tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

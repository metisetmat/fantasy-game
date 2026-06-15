import { runFullMatchTraceValidationModel } from "./fullMatchTraceValidationComparisons";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function profile(model: ReturnType<typeof runFullMatchTraceValidationModel>, profileId: string) {
  const result = model.profiles.find((candidate) => candidate.profileId === profileId);
  if (result === undefined) {
    throw new Error(`Missing profile result: ${profileId}`);
  }

  return result;
}

export function validateFullMatchTraceValidationComparisons(): readonly string[] {
  const model = runFullMatchTraceValidationModel();
  const changedCount = model.profiles.filter((result) => result.reportChangedFromBaseline).length;
  const highPress = profile(model, "high_press_profile");
  const lowBlock = profile(model, "low_block_profile");
  const fastTransition = profile(model, "fast_transition_profile");
  const powerContact = profile(model, "power_contact_profile");
  const strongGoalkeeper = profile(model, "strong_goalkeeper_profile");
  const lateFatigue = profile(model, "late_fatigue_profile");

  assertTest(changedCount >= 5, "at least 5 of 6 profiles must produce changed Coach Report V0 cards vs baseline.");
  assertTest(lowBlock.cardSignatureByCardId.official_recurring_causes !== highPress.cardSignatureByCardId.official_recurring_causes, "high press must differ from low block.");
  assertTest(fastTransition.cardSignatureByCardId.official_recurring_causes !== powerContact.cardSignatureByCardId.official_recurring_causes, "fast transition must differ from power/contact.");
  assertTest(strongGoalkeeper.reportChangedFromBaseline, "strong goalkeeper must differ from baseline.");
  assertTest(lateFatigue.reportChangedFromBaseline, "late fatigue must differ from baseline.");
  assertTest(model.profiles.every((result) => result.expectedSignalsPresent || result.expectedSignalsMissing.length > 0), "expected signal matching must be reported.");
  assertTest(model.profiles.every((result) => Array.isArray(result.expectedSignalsMissing)), "missing signals must be explicit.");
  assertTest(model.profiles.every((result) => result.signalCalibrationStatus !== "FAIL"), "each profile must have expected or accepted fallback signal evidence.");

  return [
    "at least 5 of 6 profiles produce changed Coach Report V0 cards vs baseline",
    "high press differs from low block",
    "fast transition differs from power/contact",
    "strong goalkeeper differs from baseline",
    "late fatigue differs from baseline",
    "expected signal matching is reported",
    "missing signals are explicit, not hidden",
    "each profile has expected or accepted fallback signal evidence",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchTraceValidationComparisons();

  console.log("fullMatchTraceValidationComparisons tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

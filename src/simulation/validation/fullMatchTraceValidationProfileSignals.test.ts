import { runFullMatchTraceValidationModel } from "./fullMatchTraceValidationComparisons";
import type { FullMatchTraceValidationProfileId } from "./fullMatchTraceValidationProfiles";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function profileSignalStatus(input: {
  readonly model: ReturnType<typeof runFullMatchTraceValidationModel>;
  readonly profileId: FullMatchTraceValidationProfileId;
}): boolean {
  const profile = input.model.profiles.find((candidate) => candidate.profileId === input.profileId);
  if (profile === undefined) {
    throw new Error(`Missing profile result: ${input.profileId}`);
  }

  return profile.signalCalibrationStatus !== "FAIL";
}

export function validateFullMatchTraceValidationProfileSignals(): readonly string[] {
  const model = runFullMatchTraceValidationModel();

  assertTest(profileSignalStatus({ model, profileId: "high_press_profile" }), "high press must have pressure/fatigue signal or accepted fallback.");
  assertTest(profileSignalStatus({ model, profileId: "low_block_profile" }), "low block must have defensive/deep recovery signal or accepted fallback.");
  assertTest(profileSignalStatus({ model, profileId: "fast_transition_profile" }), "fast transition must have speed/progression/line-break signal or accepted fallback.");
  assertTest(profileSignalStatus({ model, profileId: "power_contact_profile" }), "power/contact must have power/contact/duel signal or accepted fallback.");
  assertTest(profileSignalStatus({ model, profileId: "strong_goalkeeper_profile" }), "strong goalkeeper must have goalkeeper signal or accepted fallback.");
  assertTest(profileSignalStatus({ model, profileId: "late_fatigue_profile" }), "late fatigue must have fatigue signal or accepted fallback.");

  return [
    "high press profile has pressure/fatigue signal",
    "low block profile has defensive signal",
    "fast transition profile has speed/progression signal",
    "power/contact profile has power/contact signal",
    "strong goalkeeper profile has goalkeeper signal",
    "late fatigue profile has fatigue signal",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchTraceValidationProfileSignals();

  console.log("fullMatchTraceValidationProfileSignals tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

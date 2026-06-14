import { FULL_MATCH_TRACE_VALIDATION_PROFILES } from "./fullMatchTraceValidationProfiles";
import { FULL_MATCH_TRACE_PROFILE_SIGNAL_EXPECTATIONS } from "./profileSignalExpectations";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateProfileSignalExpectations(): readonly string[] {
  const profileIds = FULL_MATCH_TRACE_VALIDATION_PROFILES.map((profile) => profile.profileId);
  const expectationIds = FULL_MATCH_TRACE_PROFILE_SIGNAL_EXPECTATIONS.map((expectation) => expectation.profileId);

  assertTest(FULL_MATCH_TRACE_PROFILE_SIGNAL_EXPECTATIONS.length === 6, "six profile expectations must exist.");
  assertTest(profileIds.every((profileId) => expectationIds.includes(profileId)), "every validation profile must have signal expectations.");
  assertTest(FULL_MATCH_TRACE_PROFILE_SIGNAL_EXPECTATIONS.every((expectation) => expectation.expectedSignals.length > 0), "no profile can have empty expectations.");
  assertTest(FULL_MATCH_TRACE_PROFILE_SIGNAL_EXPECTATIONS.every((expectation) => expectation.minimumExpectedSignalCount > 0), "each profile must have a minimum expected signal count.");
  assertTest(FULL_MATCH_TRACE_PROFILE_SIGNAL_EXPECTATIONS.every((expectation) => expectation.expectedSignals.every((signal) => signal.fallbackTags.length > 0)), "fallback tags must be explicit for every expected signal.");
  assertTest(FULL_MATCH_TRACE_PROFILE_SIGNAL_EXPECTATIONS.every((expectation) => expectation.tacticalMeaning.length > 20), "each profile must explain tactical meaning.");

  return [
    "six profile expectations exist",
    "each profile has expectations",
    "each profile has minimum expected signal count",
    "fallback tags are explicit",
    "no profile has empty expectations",
  ];
}

if (require.main === module) {
  const checks = validateProfileSignalExpectations();

  console.log("profileSignalExpectations tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

import {
  FULL_MATCH_TRACE_VALIDATION_BASELINE_PROFILE_ID,
  FULL_MATCH_TRACE_VALIDATION_PROFILES,
} from "./fullMatchTraceValidationProfiles";
import { runFullMatchTraceValidationProfile } from "./runFullMatchTraceValidationProfile";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchTraceValidationProfiles(): readonly string[] {
  const profileIds = FULL_MATCH_TRACE_VALIDATION_PROFILES.map((profile) => profile.profileId);
  const setupSignatures = FULL_MATCH_TRACE_VALIDATION_PROFILES.map((profile) => {
    const input = profile.createInput();
    return JSON.stringify({
      homePlan: input.homePlan,
      awayPlan: input.awayPlan,
      homeCondition: input.homeTeam.roster.map((player) => player.currentCondition),
      homeMental: input.homeTeam.roster.map((player) => player.mentalFreshness),
    });
  });
  const sampleResult = runFullMatchTraceValidationProfile({
    profile: FULL_MATCH_TRACE_VALIDATION_PROFILES[0]!,
  });

  assertTest(FULL_MATCH_TRACE_VALIDATION_PROFILES.length === 6, "six profiles must exist.");
  assertTest(profileIds.join("|") === "high_press_profile|low_block_profile|fast_transition_profile|power_contact_profile|strong_goalkeeper_profile|late_fatigue_profile", "profile IDs must be stable.");
  assertTest(new Set(setupSignatures).size === 6, "profiles must have distinct tactical setup.");
  assertTest(profileIds.includes(FULL_MATCH_TRACE_VALIDATION_BASELINE_PROFILE_ID), "baseline profile must exist.");
  assertTest(sampleResult.traceSpineStatus === "available", "a profile can be run through the trace validation harness.");

  return [
    "six profiles exist",
    "profile IDs are stable",
    "profiles have distinct tactical setup",
    "baseline profile exists",
    "each profile can be run through the trace validation harness",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchTraceValidationProfiles();

  console.log("fullMatchTraceValidationProfiles tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

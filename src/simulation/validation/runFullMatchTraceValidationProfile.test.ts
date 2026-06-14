import { FULL_MATCH_TRACE_VALIDATION_PROFILES } from "./fullMatchTraceValidationProfiles";
import { runFullMatchTraceValidationProfile } from "./runFullMatchTraceValidationProfile";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchTraceValidationProfile(): readonly string[] {
  const results = FULL_MATCH_TRACE_VALIDATION_PROFILES.map((profile) =>
    runFullMatchTraceValidationProfile({ profile })
  );

  assertTest(results.every((result) => result.traceSpineStatus === "available"), "running a profile must produce trace spine.");
  assertTest(results.every((result) => result.aggregatorStatus === "available"), "running a profile must produce trace aggregator.");
  assertTest(results.every((result) => result.coachReportV0Status === "available"), "running a profile must produce Coach Report V0.");
  assertTest(results.every((result) => result.officialAggregateTraceCount > 0), "official aggregate trace count must be present.");
  assertTest(results.every((result) => result.cardCount === 6), "card count must be present.");
  assertTest(results.every((result) => result.diagnosticAggregatesKeptSeparate && result.sandboxAggregatesKeptSeparate), "scopes must remain separated.");
  assertTest(results.every((result) => result.selectionPreviewStillSandboxOnly), "selection preview must remain sandbox_only.");
  assertTest(results.every((result) => !result.canMutateTimeline && !result.canMutateScore && !result.canCreateScoringEvent), "no mutation guardrails may be violated.");

  return [
    "running a profile produces trace spine",
    "running a profile produces trace aggregator",
    "running a profile produces Coach Report V0",
    "official aggregate trace count is present",
    "card count is present",
    "scopes remain separated",
    "selection preview remains sandbox_only",
    "no mutation guardrails are violated",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchTraceValidationProfile();

  console.log("runFullMatchTraceValidationProfile tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

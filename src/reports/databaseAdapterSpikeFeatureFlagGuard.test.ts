import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateDatabaseAdapterSpikeFeatureFlagGuard(): readonly string[] {
  const { databaseAdapterSpike } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(!databaseAdapterSpike.defaultFeatureFlagEnabled, "default feature flag remains disabled.");
  assertTest(!databaseAdapterSpike.productActivationAllowed, "product activation is not allowed.");
  assertTest(!databaseAdapterSpike.reportCanUseAsSourceOfTruth, "database cannot become report source of truth.");
  assertTest(databaseAdapterSpike.activeProductHistorySource === "file_backed", "active product history source remains file_backed.");
  assertTest(!databaseAdapterSpike.databaseUsedAsProductTruth, "database is not used as product truth.");

  return [
    "default feature flag disabled",
    "product activation disallowed",
    "report source-of-truth usage disallowed",
    "active product source remains file_backed",
  ];
}

if (require.main === module) {
  const checks = validateDatabaseAdapterSpikeFeatureFlagGuard();
  console.log("databaseAdapterSpikeFeatureFlagGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

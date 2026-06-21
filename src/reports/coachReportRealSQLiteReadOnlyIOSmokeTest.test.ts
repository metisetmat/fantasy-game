import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportRealSQLiteReadOnlyIOSmokeTest(): readonly string[] {
  const context = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const model = context.realSQLiteReadOnlyIOSmokeTest;

  assertTest(model.status === "available", "real SQLite read-only IO smoke test must be available.");
  assertTest(model.modeName === "real_sqlite_readonly_io_smoke_test", "mode name must be real_sqlite_readonly_io_smoke_test.");
  assertTest(model.storageTarget === "sqlite_local", "storage target must be sqlite_local.");
  assertTest(model.schemaVersion === "coach_match_history_v1", "schema version must be coach_match_history_v1.");
  assertTest(model.realSQLiteIoEnabled, "real SQLite IO must be enabled in controlled smoke test mode.");
  assertTest(model.readOnlyMode, "read-only mode must be true.");
  assertTest(!model.writeModeAllowed, "write mode must be false.");
  assertTest(model.writeRejectedPass, "write rejection must pass.");
  assertTest(model.adapterImplemented, "adapter must be implemented.");
  assertTest(!model.adapterProductionReady, "adapter must not be production ready.");
  assertTest(!model.featureFlagEnabled, "feature flag must be disabled.");
  assertTest(!model.defaultFeatureFlagEnabled, "default feature flag must be disabled.");
  assertTest(!model.productActivationAllowed, "product activation must be false.");
  assertTest(model.activeProductHistorySource === "file_backed", "active product history source must remain file_backed.");
  assertTest(!model.databaseUsedAsProductTruth, "database must not become product truth.");
  assertTest(!model.reportCanUseAsSourceOfTruth, "report must not use SQLite as source of truth.");
  assertTest(model.defaultRealDatabaseReadCount === 0, "default real DB read count must remain 0.");
  assertTest(model.controlledRealDatabaseReadCount > 0, "controlled real DB read count must be > 0.");
  assertTest(model.realDatabaseWriteCount === 0, "real DB write count must remain 0.");
  assertTest(model.fixtureRecordCount >= 6, "fixture record count must be >= 6.");
  assertTest(model.readOnlyAdapterRecordCount === model.fixtureRecordCount, "adapter record count must equal fixture count.");
  assertTest(model.queryByTeamPass, "query by team must pass.");
  assertTest(model.queryByPhasePass, "query by phase must pass.");
  assertTest(model.deterministicOrderingPass, "deterministic ordering must pass.");
  assertTest(model.schemaCompatibilityPass, "schema compatibility must pass.");
  assertTest(model.scoringConstantsUnchanged, "scoring constants must remain unchanged.");
  assertTest(model.matchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
  assertTest(model.batchLiveSeparationPreserved, "batch/live separation must remain preserved.");
  assertTest(model.fullMatchBatchEconomyRemainsOnlyGlobalProof, "FULL_MATCH_BATCH_ECONOMY must remain only global proof.");

  return [
    "real SQLite read-only IO smoke test available",
    "controlled read count is > 0 and default read count is 0",
    "SQLite remains non-product truth",
    "file_backed remains active product source",
    "write rejection and schema/query checks pass",
  ];
}

const checks = validateCoachReportRealSQLiteReadOnlyIOSmokeTest();

console.log("coachReportRealSQLiteReadOnlyIOSmokeTest tests passed.");
for (const check of checks) {
  console.log(`- ${check}`);
}

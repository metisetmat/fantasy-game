import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachReportControlledLocalReadOnlyDbMode(): readonly string[] {
  const { controlledLocalReadOnlyDbMode: model } = buildCoachReportMultiMatchPhaseComparisonTestContext();

  assertTest(model.status === "available", "controlled local read-only DB mode must be available.");
  assertTest(model.modeName === "controlled_local_readonly_db", "mode name must be controlled_local_readonly_db.");
  assertTest(model.storageTarget === "sqlite_local", "storage target must be sqlite_local.");
  assertTest(model.schemaVersion === "coach_match_history_v1", "schema version must be coach_match_history_v1.");
  assertTest(model.readOnlyMode, "read-only mode must be true.");
  assertTest(!model.writeModeAllowed, "write mode must be false.");
  assertTest(model.writeRejectedPass, "write rejected pass must be true.");
  assertTest(!model.defaultEnabled, "default enabled must be false.");
  assertTest(!model.featureFlagEnabled, "feature flag enabled must be false.");
  assertTest(!model.productActivationAllowed, "product activation allowed must be false.");
  assertTest(model.activeProductHistorySource === "file_backed", "active product history source must stay file_backed.");
  assertTest(!model.databaseUsedAsProductTruth, "database used as product truth must be false.");
  assertTest(!model.reportCanUseAsSourceOfTruth, "report can use as source of truth must be false.");
  assertTest(model.realDatabaseReadCount === 0, "default real database read count must be 0.");
  assertTest(model.realDatabaseWriteCount === 0, "real database write count must be 0.");
  assertTest(model.controlledReadAttemptCount > 0, "controlled read attempt count must be visible.");
  assertTest(model.readOnlyRecordCount === model.sourceRecordCount, "read-only adapter record count must match source record count.");
  assertTest(model.readOnlyQueryByTeamPass, "query by team must pass.");
  assertTest(model.readOnlyQueryByPhasePass, "query by phase must pass.");
  assertTest(model.deterministicOrderingPass, "deterministic ordering must pass.");
  assertTest(model.schemaCompatibilityPass, "schema compatibility must pass.");
  assertTest(model.explicitControlledModeOnly, "mode must be explicit controlled-only.");
  assertTest(model.trueSqliteIoDeferred, "true SQLite IO must be deferred.");

  return [
    "controlled local read-only DB mode is available",
    "sqlite_local and coach_match_history_v1 are selected",
    "default/product activation remains disabled",
    "file_backed remains active product source",
    "real database read/write counts remain 0",
    "read-only team/phase queries, ordering, schema, and write rejection pass",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportControlledLocalReadOnlyDbMode();
  console.log("coachReportControlledLocalReadOnlyDbMode tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

import { join } from "node:path";
import { createSqliteRealReadOnlyCoachMatchHistoryAdapter } from "./history/sqliteRealReadOnlyCoachMatchHistoryAdapter";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSqliteRealReadOnlyCoachMatchHistoryAdapter(): readonly string[] {
  const adapter = createSqliteRealReadOnlyCoachMatchHistoryAdapter({
    fixturePath: join(process.cwd(), "test-fixtures", "sqlite", "coach-match-history-v1.sqlite"),
    explicitControlledMode: true,
  });
  const records = adapter.listReadOnlyRecords();
  const firstRecord = records[0];
  const descriptionBefore = adapter.describe();

  assertTest(descriptionBefore.modeName === "real_sqlite_readonly_io_smoke_test", "mode name must be real_sqlite_readonly_io_smoke_test.");
  assertTest(descriptionBefore.adapterKind === "sqlite_local_readonly_real_smoke_test", "adapter kind must be sqlite_local_readonly_real_smoke_test.");
  assertTest(descriptionBefore.schemaVersion === "coach_match_history_v1", "schema version must be coach_match_history_v1.");
  assertTest(descriptionBefore.defaultRealDatabaseReadCount === 0, "default real DB read count must remain 0.");
  assertTest(descriptionBefore.controlledRealDatabaseReadCount > 0, "controlled real DB read count must be > 0 after fixture load.");
  assertTest(descriptionBefore.realDatabaseWriteCount === 0, "real DB write count must remain 0.");
  assertTest(descriptionBefore.readOnlyMode, "adapter must be read-only.");
  assertTest(!descriptionBefore.writeModeAllowed, "write mode must be disabled.");
  assertTest(!descriptionBefore.featureFlagEnabled, "feature flag must be disabled.");
  assertTest(!descriptionBefore.defaultFeatureFlagEnabled, "default feature flag must be disabled.");
  assertTest(!descriptionBefore.productActivationAllowed, "product activation must be disallowed.");
  assertTest(!descriptionBefore.databaseUsedAsProductTruth, "database must not be product truth.");
  assertTest(!descriptionBefore.reportCanUseAsSourceOfTruth, "report must not use DB as official source.");
  assertTest(descriptionBefore.fixtureRecordCount >= 6, "fixture must contain at least 6 records.");
  assertTest(records.length === descriptionBefore.fixtureRecordCount, "read-only records must match fixture count.");
  assertTest(descriptionBefore.missingRequiredColumnCount === 0, "required fixture columns must be present.");
  assertTest(descriptionBefore.schemaIncompatibleRecordCount === 0, "fixture records must match durable schema.");
  assertTest(firstRecord !== undefined, "fixture must expose at least one record.");

  if (firstRecord === undefined) {
    throw new Error("fixture must expose at least one record.");
  }

  const teamQuery = adapter.readOnlyQuery({
    teamId: firstRecord.homeTeamId,
    maxRecords: 10,
    includeControlledSamples: true,
    includeProductHistory: true,
  });
  const phase = firstRecord.signals[0]?.phase;
  const phaseQuery = adapter.readOnlyQuery({
    ...(phase === undefined ? {} : { phase }),
    maxRecords: 10,
    includeControlledSamples: true,
    includeProductHistory: true,
  });
  const rejectedWrite = adapter.rejectWrite(firstRecord);
  const descriptionAfter = adapter.describe();

  assertTest(teamQuery.records.some((record) => record.historyRecordId === firstRecord.historyRecordId), "query by team must return the first fixture record.");
  assertTest(phase === undefined || phaseQuery.records.some((record) => record.signals.some((signal) => signal.phase === phase)), "query by phase must return matching records.");
  assertTest(rejectedWrite.recordsAfterSaveCount === rejectedWrite.recordsBeforeSaveCount, "write rejection must not change record count.");
  assertTest(rejectedWrite.writtenToDiskCount === 0, "write rejection must not write to disk.");
  assertTest(rejectedWrite.operation === "rejected_write", "real SQLite read-only write rejection must use rejected_write operation.");
  assertTest(!rejectedWrite.idempotent, "real SQLite read-only write rejection must not be idempotent duplicate.");
  assertTest(rejectedWrite.ignoredDuplicateCount === 0, "real SQLite read-only write rejection must not increment duplicate count.");
  assertTest(rejectedWrite.dedupedRecordCount === 0, "real SQLite read-only write rejection must not report deduped records.");
  assertTest(descriptionAfter.realDatabaseWriteCount === 0, "real DB write count must stay 0 after rejected write.");
  assertTest(descriptionAfter.writeRejectedCount === 1, "write rejection count must be tracked.");
  assertTest(descriptionAfter.controlledRealDatabaseReadCount > descriptionBefore.controlledRealDatabaseReadCount, "controlled reads must be counted.");

  return [
    "real SQLite read-only adapter is implemented",
    "fixture read uses real local SQLite file IO",
    "default product DB reads remain 0",
    "controlled real DB read count is greater than 0",
    "writes are rejected with rejected_write semantics",
    "query by team and phase pass",
  ];
}

const checks = validateSqliteRealReadOnlyCoachMatchHistoryAdapter();

console.log("sqliteRealReadOnlyCoachMatchHistoryAdapter tests passed.");
for (const check of checks) {
  console.log(`- ${check}`);
}

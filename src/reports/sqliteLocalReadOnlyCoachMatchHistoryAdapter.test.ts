import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { createSqliteLocalReadOnlyCoachMatchHistoryAdapter } from "./history/sqliteLocalReadOnlyCoachMatchHistoryAdapter";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateSqliteLocalReadOnlyCoachMatchHistoryAdapter(): readonly string[] {
  const context = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const adapter = createSqliteLocalReadOnlyCoachMatchHistoryAdapter({
    initialRecords: [context.currentRecord],
    featureFlagEnabled: false,
  });
  const descriptionBefore = adapter.describe();

  assertTest(descriptionBefore.modeName === "controlled_local_readonly_db", "mode name must be controlled_local_readonly_db.");
  assertTest(descriptionBefore.adapterKind === "sqlite_local_readonly_controlled", "adapter kind must be sqlite_local_readonly_controlled.");
  assertTest(descriptionBefore.schemaVersion === "coach_match_history_v1", "schema version must be coach_match_history_v1.");
  assertTest(descriptionBefore.readOnlyMode, "adapter must be read-only.");
  assertTest(!descriptionBefore.writeModeAllowed, "write mode must be disabled.");
  assertTest(!descriptionBefore.featureFlagEnabled, "feature flag must be disabled by default.");
  assertTest(!descriptionBefore.productActivationAllowed, "product activation must be forbidden.");
  assertTest(!descriptionBefore.reportCanUseAsSourceOfTruth, "adapter cannot be report source of truth.");
  assertTest(descriptionBefore.realDatabaseReadCount === 0, "real DB read count must stay 0.");
  assertTest(descriptionBefore.realDatabaseWriteCount === 0, "real DB write count must stay 0.");

  const teamQuery = adapter.readOnlyQuery({
    teamId: context.currentRecord.homeTeamId,
    maxRecords: 10,
    includeControlledSamples: true,
    includeProductHistory: true,
  });
  const phase = context.currentRecord.signals[0]?.phase;
  const phaseQuery = adapter.readOnlyQuery({
    ...(phase === undefined ? {} : { phase }),
    maxRecords: 10,
    includeControlledSamples: true,
    includeProductHistory: true,
  });
  const rejectedWrite = adapter.rejectWrite(context.currentRecord);
  const descriptionAfter = adapter.describe();

  assertTest(teamQuery.records.some((record) => record.historyRecordId === context.currentRecord.historyRecordId), "query by team must return the current record.");
  assertTest(phase === undefined || phaseQuery.records.some((record) => record.signals.some((signal) => signal.phase === phase)), "query by phase must return matching signals.");
  assertTest(rejectedWrite.writtenToDiskCount === 0, "rejected write must not write to disk.");
  assertTest(rejectedWrite.recordsAfterSaveCount === rejectedWrite.recordsBeforeSaveCount, "rejected write must not change record count.");
  assertTest(descriptionAfter.controlledReadAttemptCount === 2, "controlled read attempts must be counted.");
  assertTest(descriptionAfter.writeRejectedCount === 1, "write rejections must be counted.");
  assertTest(descriptionAfter.schemaIncompatibleRecordCount === 0, "records must match durable schema.");

  return [
    "controlled local read-only adapter is implemented",
    "feature flag and product activation are disabled",
    "real database IO remains 0",
    "query by team and phase pass",
    "write attempt is rejected without record changes",
    "schema compatibility and counters are exposed",
  ];
}

if (require.main === module) {
  const checks = validateSqliteLocalReadOnlyCoachMatchHistoryAdapter();
  console.log("sqliteLocalReadOnlyCoachMatchHistoryAdapter tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

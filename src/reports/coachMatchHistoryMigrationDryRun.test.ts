import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { buildCoachMatchHistoryMigrationDryRun } from "./history/buildCoachMatchHistoryMigrationDryRun";
import type { CoachMatchHistoryRecord } from "./history/coachMatchHistory";
import { createMockDatabaseCoachMatchHistoryAdapter } from "./history/mockDatabaseCoachMatchHistoryAdapter";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachMatchHistoryMigrationDryRun(): readonly string[] {
  const { persistentHistoryAdapter } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const record = persistentHistoryAdapter.saveResult?.record;
  if (record === undefined) {
    throw new Error("test context must expose a saved history record.");
  }
  const invalidRecord = { ...record, historyRecordId: 42 } as unknown as CoachMatchHistoryRecord;
  const invalidScoreSourceRecord = {
    ...record,
    historyRecordId: `${record.historyRecordId}-bad-score-source`,
    scoreSource: "stale_demo_score",
  } as unknown as CoachMatchHistoryRecord;
  const invalidSignalRecord = {
    ...record,
    historyRecordId: `${record.historyRecordId}-bad-signal`,
    signals: record.signals.map((signal, index) =>
      index === 0 ? { ...signal, stability: "too_confident" } : signal
    ),
  } as unknown as CoachMatchHistoryRecord;
  const unsupportedRecord: CoachMatchHistoryRecord = { ...record, historyRecordId: `${record.historyRecordId}-controlled`, source: "controlled_sample" };
  const dryRun = buildCoachMatchHistoryMigrationDryRun({
    sourceRecords: [record, record, invalidRecord, invalidScoreSourceRecord, invalidSignalRecord, unsupportedRecord],
    targetAdapter: createMockDatabaseCoachMatchHistoryAdapter(),
  });

  assertTest(dryRun.status === "available", "migration dry-run model exists.");
  assertTest(dryRun.dryRunOnly, "dryRunOnly is true.");
  assertTest(dryRun.realDatabaseWriteCount === 0, "realDatabaseWriteCount is 0.");
  assertTest(dryRun.realDatabaseReadCount === 0, "realDatabaseReadCount is 0.");
  assertTest(dryRun.sourceRecordCount === 6, "source record count is present.");
  assertTest(dryRun.migrationPlanCount === 6, "migration plan count is present.");
  assertTest(dryRun.migrableRecordCount === 2, "migrable count is present.");
  assertTest(dryRun.wouldInsertCount === 1, "insert count is present.");
  assertTest(dryRun.wouldIgnoreDuplicateCount === 1, "ignored duplicate count is present.");
  assertTest(dryRun.rejectedInvalidCount === 3, "rejected invalid records are handled safely.");
  assertTest(dryRun.rejectedUnsupportedCount === 1, "rejected unsupported records are handled safely.");
  assertTest(dryRun.preservesSaveResultSemantics, "save-result semantics are preserved.");

  return [
    "migration dry-run model exists",
    "dryRunOnly is true",
    "realDatabaseWriteCount and realDatabaseReadCount are 0",
    "source, plan, migrable, insert, ignored, invalid, and unsupported counts are present",
    "save-result semantics are preserved",
    "rejected invalid and unsupported records are handled safely",
  ];
}

if (require.main === module) {
  const checks = validateCoachMatchHistoryMigrationDryRun();
  console.log("coachMatchHistoryMigrationDryRun tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

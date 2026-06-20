import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { createFileBackedCoachMatchHistoryStore } from "./history/fileBackedCoachMatchHistoryStore";
import { createMockDatabaseCoachMatchHistoryAdapter } from "./history/mockDatabaseCoachMatchHistoryAdapter";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateMockDatabaseCoachMatchHistoryAdapter(): readonly string[] {
  const { persistentHistoryAdapter } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const record = persistentHistoryAdapter.saveResult?.record;
  if (record === undefined) {
    throw new Error("test context must expose a saved history record.");
  }

  const adapter = createMockDatabaseCoachMatchHistoryAdapter();
  const inserted = adapter.dryRunSave(record);
  const duplicate = adapter.dryRunSave(record);
  const changed = { ...record, reportVersion: `${record.reportVersion}-changed` };
  const replaced = adapter.dryRunSave(changed);
  const secondAdapter = createMockDatabaseCoachMatchHistoryAdapter();
  const secondInserted = secondAdapter.dryRunSave(record);
  const fileBacked = createFileBackedCoachMatchHistoryStore({
    filePath: "reports/test-artifacts/mock-db-file-backed-comparison.json",
    allowWrite: false,
  });
  const fileBackedInserted = fileBacked.save(record);
  const query = adapter.dryRunQuery({
    teamId: record.homeTeamId,
    maxRecords: 5,
    includeControlledSamples: true,
    includeProductHistory: true,
  });

  assertTest(inserted.operation === "inserted", "dryRunSave returns inserted for new record.");
  assertTest(replaced.operation === "replaced", "dryRunSave returns replaced for same id different content.");
  assertTest(duplicate.operation === "ignored_duplicate", "dryRunSave returns ignored_duplicate for same id same content.");
  assertTest(inserted.writtenToDiskCount === 0 && replaced.writtenToDiskCount === 0, "dry-run save does not write to real DB.");
  assertTest(query.recordCount >= 1 && query.warnings.some((warning) => warning.includes("dry-run")), "dry-run query does not read from real DB.");
  assertTest(JSON.stringify(adapter.listDryRunRecords()) === JSON.stringify(adapter.listDryRunRecords()), "listDryRunRecords is deterministic.");
  assertTest(inserted.operation === secondInserted.operation, "mock adapter is deterministic.");
  assertTest(fileBackedInserted.operation === inserted.operation, "save-result semantics match file-backed store operation names.");

  return [
    "mock adapter is deterministic",
    "dryRunSave returns inserted for new record",
    "dryRunSave returns replaced for changed same id",
    "dryRunSave returns ignored_duplicate for identical same id",
    "dry-run save does not write to real DB",
    "dry-run query does not read from real DB",
    "listDryRunRecords is deterministic",
    "save-result semantics match file-backed store",
  ];
}

if (require.main === module) {
  const checks = validateMockDatabaseCoachMatchHistoryAdapter();
  console.log("mockDatabaseCoachMatchHistoryAdapter tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

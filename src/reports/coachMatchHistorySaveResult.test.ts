import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { buildCoachMatchHistoryRecord } from "./history/buildCoachMatchHistoryRecord";
import { createInMemoryCoachMatchHistoryStore } from "./history/inMemoryCoachMatchHistoryStore";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCoachMatchHistorySaveResult(): readonly string[] {
  const { report, productHtml, exportHtml, historyView } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const record = buildCoachMatchHistoryRecord({
    matchReport: report,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
    multiMatchHistoryView: historyView,
    source: "product_history_store",
    runId: "save-result",
    generatedAtIso: "2026-06-19T00:00:00.000Z",
  });
  const store = createInMemoryCoachMatchHistoryStore();
  const inserted = store.save(record);
  const ignored = store.save(record);
  const replaced = store.save({ ...record, reportVersion: `${record.reportVersion}-changed` });

  assertTest(inserted.operation === "inserted", "insert operation is exposed.");
  assertTest(ignored.operation === "ignored_duplicate" && ignored.idempotent, "duplicate save is idempotent.");
  assertTest(replaced.operation === "replaced", "changed record is replaced.");
  assertTest(replaced.recordsAfterSaveCount === 1, "replacement keeps one active record.");
  assertTest(inserted.loadedFromDiskCount === 0 && inserted.writtenToDiskCount === 0, "in-memory counters remain zero.");

  return [
    "insert operation is exposed",
    "duplicate save is idempotent",
    "changed record is replaced",
    "replacement keeps one active record",
    "in-memory counters remain zero",
  ];
}

if (require.main === module) {
  const checks = validateCoachMatchHistorySaveResult();
  console.log("coachMatchHistorySaveResult tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { buildCoachMatchHistoryRecord } from "./history/buildCoachMatchHistoryRecord";
import { createInMemoryCoachMatchHistoryStore } from "./history/inMemoryCoachMatchHistoryStore";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateInMemoryCoachMatchHistoryStoreConsistency(): readonly string[] {
  const { report, productHtml, exportHtml, historyView } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const record = buildCoachMatchHistoryRecord({
    matchReport: report,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
    multiMatchHistoryView: historyView,
    source: "product_history_store",
    runId: "memory-consistency",
    generatedAtIso: "2026-06-19T00:00:00.000Z",
  });
  const store = createInMemoryCoachMatchHistoryStore();
  const inserted = store.save(record);
  const duplicate = store.save(record);
  const replaced = store.save({ ...record, reportVersion: `${record.reportVersion}-replacement` });

  assertTest(inserted.operation === "inserted", "insert operation is tracked.");
  assertTest(duplicate.operation === "ignored_duplicate" && duplicate.idempotent, "duplicate operation is idempotent.");
  assertTest(replaced.operation === "replaced" && replaced.replacedRecordCount === 1, "replacement operation is tracked.");
  assertTest(replaced.loadedFromDiskCount === 0 && replaced.writtenToDiskCount === 0, "in-memory consistency keeps disk counters zero.");
  assertTest(store.listAll().length === 1, "memory store keeps one deduped record.");

  return [
    "insert operation is tracked",
    "duplicate operation is idempotent",
    "replacement operation is tracked",
    "in-memory consistency keeps disk counters zero",
    "memory store keeps one deduped record",
  ];
}

if (require.main === module) {
  const checks = validateInMemoryCoachMatchHistoryStoreConsistency();
  console.log("inMemoryCoachMatchHistoryStoreConsistency tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

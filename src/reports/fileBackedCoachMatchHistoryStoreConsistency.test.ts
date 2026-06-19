import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { buildCoachMatchHistoryRecord } from "./history/buildCoachMatchHistoryRecord";
import { createFileBackedCoachMatchHistoryStore } from "./history/fileBackedCoachMatchHistoryStore";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFileBackedCoachMatchHistoryStoreConsistency(): readonly string[] {
  const { report, productHtml, exportHtml, historyView } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const filePath = join(mkdtempSync(join(tmpdir(), "fantasy-game-history-consistency-")), "history.json");
  const record = buildCoachMatchHistoryRecord({
    matchReport: report,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
    multiMatchHistoryView: historyView,
    source: "product_history_store",
    runId: "file-consistency",
    generatedAtIso: "2026-06-19T00:00:00.000Z",
  });
  const store = createFileBackedCoachMatchHistoryStore({ filePath, allowWrite: true });
  const inserted = store.save(record);
  const duplicateBefore = readFileSync(filePath, "utf8");
  const duplicate = store.save(record);
  const duplicateAfter = readFileSync(filePath, "utf8");
  const replaced = store.save({ ...record, reportVersion: `${record.reportVersion}-replacement` });

  assertTest(inserted.operation === "inserted" && inserted.writtenToDiskCount === 1, "insert writes one record.");
  assertTest(duplicate.operation === "ignored_duplicate" && duplicate.idempotent, "duplicate is ignored idempotently.");
  assertTest(duplicateBefore === duplicateAfter, "ignored duplicate does not rewrite serialized content.");
  assertTest(replaced.operation === "replaced" && replaced.replacedRecordCount === 1, "replacement is tracked.");
  assertTest(store.listAll().length === 1, "dedupe keeps one current record.");

  return [
    "insert writes one record",
    "duplicate is ignored idempotently",
    "ignored duplicate does not rewrite serialized content",
    "replacement is tracked",
    "dedupe keeps one current record",
  ];
}

if (require.main === module) {
  const checks = validateFileBackedCoachMatchHistoryStoreConsistency();
  console.log("fileBackedCoachMatchHistoryStoreConsistency tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

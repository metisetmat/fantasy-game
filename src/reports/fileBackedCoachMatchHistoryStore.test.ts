import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { buildCoachMatchHistoryRecord } from "./history/buildCoachMatchHistoryRecord";
import { createFileBackedCoachMatchHistoryStore } from "./history/fileBackedCoachMatchHistoryStore";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFileBackedCoachMatchHistoryStore(): readonly string[] {
  const { report, productHtml, exportHtml, historyView } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const directory = mkdtempSync(join(tmpdir(), "fantasy-game-history-"));
  const filePath = join(directory, "history.json");
  const record = buildCoachMatchHistoryRecord({
    matchReport: report,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
    multiMatchHistoryView: historyView,
    source: "simulated_match_history",
    runId: "file-backed-store",
    generatedAtIso: "2026-06-19T00:00:00.000Z",
  });
  const store = createFileBackedCoachMatchHistoryStore({
    filePath,
    allowWrite: true,
  });
  const saved = store.save(record);
  const duplicate = store.save({
    ...record,
    reportVersion: `${record.reportVersion}-updated`,
  });
  const reloaded = createFileBackedCoachMatchHistoryStore({
    filePath,
    allowWrite: true,
  });
  const byTeam = reloaded.query({
    teamId: record.homeTeamId,
    maxRecords: 5,
    includeControlledSamples: true,
    includeProductHistory: true,
  });
  const byPhase = reloaded.query({
    teamId: record.homeTeamId,
    phase: "with_ball",
    maxRecords: 5,
    includeControlledSamples: true,
    includeProductHistory: true,
  });

  assertTest(existsSync(filePath), "file-backed store creates a file.");
  assertTest(saved.record.historyRecordId === record.historyRecordId, "file-backed store saves records.");
  assertTest(saved.operation === "inserted", "first file-backed save is inserted.");
  assertTest(saved.recordsBeforeSaveCount === 0 && saved.recordsAfterSaveCount === 1, "file-backed save exposes before/after counts.");
  assertTest(saved.writtenToDiskCount === 1, "insert writes deterministic records to disk.");
  assertTest(reloaded.listAll().length === 1, "file-backed store reloads records from disk.");
  assertTest(reloaded.describe().durable, "store description says durable true.");
  assertTest(duplicate.record.reportVersion.endsWith("-updated"), "duplicate historyRecordId is replaced deterministically.");
  assertTest(duplicate.operation === "replaced", "changed duplicate returns replaced operation.");
  assertTest(duplicate.replacedRecordCount === 1, "changed duplicate tracks replacement count.");
  const ignoredDuplicate = reloaded.save(duplicate.record);
  assertTest(ignoredDuplicate.operation === "ignored_duplicate", "same content duplicate is ignored.");
  assertTest(ignoredDuplicate.idempotent, "same content duplicate is idempotent.");
  assertTest(ignoredDuplicate.loadedFromDiskCount === 1, "reloaded store reports loaded from disk count.");
  assertTest(ignoredDuplicate.writtenToDiskCount === 0, "ignored duplicate does not rewrite disk.");
  assertTest(byTeam.recordCount === 1, "query by team works after reload.");
  assertTest(byPhase.recordCount === 1, "query by phase works after reload.");
  assertTest(reloaded.describe().readOnlyForReports, "report queries remain read-only.");
  const firstRecord = reloaded.listAll()[0];
  const outsideMutation = firstRecord === undefined
    ? null
    : {
      ...firstRecord,
      signals: firstRecord.signals.map((signal, index) => index === 0 ? { ...signal, explanation: "changed outside" } : signal),
    };
  assertTest(outsideMutation !== null, "record is available after reload.");
  assertTest(reloaded.listAll()[0]?.signals[0]?.explanation !== "changed outside", "store does not mutate records during query.");

  const malformedPath = join(directory, "malformed-history.json");
  writeFileSync(malformedPath, "{ broken json", "utf8");
  const guardedStore = createFileBackedCoachMatchHistoryStore({
    filePath: malformedPath,
    allowWrite: true,
    initialRecords: [record],
  });
  const malformedBeforeSave = readFileSync(malformedPath, "utf8");
  const guardedSave = guardedStore.save({
    ...record,
    historyRecordId: `${record.historyRecordId}-guarded`,
    runId: "guarded-save",
  });
  const malformedAfterSave = readFileSync(malformedPath, "utf8");
  assertTest(malformedAfterSave === malformedBeforeSave, "parse failure keeps existing history file untouched.");
  assertTest(!guardedStore.describe().durable, "parse failure disables durable writes until the file is repaired.");
  assertTest(guardedSave.writtenToDiskCount === 0, "parse failure save result reports zero durable writes.");
  assertTest(
    guardedStore.describe().warning?.includes("preserved without rewrite") ?? false,
    "parse failure surfaces a read-only warning instead of silently resetting history.",
  );

  return [
    "file-backed store creates a file",
    "file-backed store saves records",
    "first file-backed save is inserted",
    "same content duplicate is ignored",
    "changed duplicate returns replaced operation",
    "file-backed store reloads records from disk",
    "duplicate historyRecordId is deduped or replaced deterministically",
    "query by team works after reload",
    "query by phase works after reload",
    "report queries remain read-only",
    "store description says durable true",
    "store does not mutate records during query",
    "parse failure keeps existing history file untouched",
    "parse failure disables durable writes until the file is repaired",
    "parse failure surfaces a read-only warning instead of silently resetting history",
  ];
}

if (require.main === module) {
  const checks = validateFileBackedCoachMatchHistoryStore();
  console.log("fileBackedCoachMatchHistoryStore tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

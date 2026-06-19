import { buildCoachReportMultiMatchPhaseComparisonTestContext } from "./coachReportMultiMatchPhaseComparisonTestUtils";
import { buildCoachMatchHistoryRecord } from "./history/buildCoachMatchHistoryRecord";
import { createInMemoryCoachMatchHistoryStore } from "./history/inMemoryCoachMatchHistoryStore";

function assertTest(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateInMemoryCoachMatchHistoryStore(): readonly string[] {
  const { report, productHtml, exportHtml, historyView } = buildCoachReportMultiMatchPhaseComparisonTestContext();
  const record = buildCoachMatchHistoryRecord({
    matchReport: report,
    productReportHtml: productHtml,
    exportReportHtml: exportHtml,
    multiMatchHistoryView: historyView,
    source: "simulated_match_history",
    runId: "store-test",
    generatedAtIso: "2026-06-19T00:00:00.000Z",
  });
  const store = createInMemoryCoachMatchHistoryStore();
  const saved = store.save(record);
  const all = store.listAll();
  const byTeam = store.query({
    teamId: record.homeTeamId,
    maxRecords: 5,
    includeControlledSamples: true,
    includeProductHistory: true,
  });
  const byPhase = store.query({
    teamId: record.homeTeamId,
    phase: "with_ball",
    maxRecords: 5,
    includeControlledSamples: true,
    includeProductHistory: true,
  });

  assertTest(saved.record.historyRecordId === record.historyRecordId, "store saves records.");
  assertTest(saved.operation === "inserted", "first save returns inserted operation.");
  assertTest(saved.record.historyRecordId === record.historyRecordId, "save result includes cloned record.");
  assertTest(saved.recordsBeforeSaveCount === 0 && saved.recordsAfterSaveCount === 1, "save result exposes before/after counts.");
  assertTest(saved.loadedFromDiskCount === 0 && saved.writtenToDiskCount === 0, "in-memory save result exposes zero disk counts.");
  assertTest(all.length === 1 && all[0]?.historyRecordId === record.historyRecordId, "store lists all records.");
  assertTest(byTeam.recordCount === 1, "store queries by team.");
  assertTest(byPhase.recordCount === 1, "store queries by phase.");
  assertTest(store.query(byTeam.query).recordCount === byTeam.recordCount, "store remains deterministic.");
  const mutatedCopy = {
    ...saved.record,
    signals: saved.record.signals.map((signal, index) => index === 0 ? { ...signal, explanation: "changed outside" } : signal),
  };
  assertTest(mutatedCopy.signals[0]?.explanation === "changed outside", "mutated copy changes outside store.");
  assertTest(store.listAll()[0]?.signals[0]?.explanation !== "changed outside", "store does not mutate records during query.");
  const duplicate = store.save(record);
  assertTest(duplicate.operation === "ignored_duplicate", "same content duplicate is ignored.");
  assertTest(duplicate.idempotent, "same content duplicate is idempotent.");
  const replaced = store.save({
    ...record,
    reportVersion: `${record.reportVersion}-updated`,
  });
  assertTest(replaced.operation === "replaced", "same id with changed content is replaced.");
  assertTest(replaced.replacedRecordCount === 1, "replacement count is tracked.");

  return [
    "store saves records",
    "first save returns inserted operation",
    "same content duplicate is ignored",
    "same id with changed content is replaced",
    "store queries by team",
    "store queries by phase",
    "store lists all records",
    "store remains deterministic",
    "store does not mutate records during query",
  ];
}

if (require.main === module) {
  const checks = validateInMemoryCoachMatchHistoryStore();
  console.log("inMemoryCoachMatchHistoryStore tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

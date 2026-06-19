import { existsSync, mkdtempSync } from "node:fs";
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
  assertTest(saved.historyRecordId === record.historyRecordId, "file-backed store saves records.");
  assertTest(reloaded.listAll().length === 1, "file-backed store reloads records from disk.");
  assertTest(duplicate.reportVersion.endsWith("-updated"), "duplicate historyRecordId is replaced deterministically.");
  assertTest(byTeam.recordCount === 1, "query by team works after reload.");
  assertTest(byPhase.recordCount === 1, "query by phase works after reload.");
  assertTest(reloaded.describe().readOnlyForReports, "report queries remain read-only.");
  assertTest(reloaded.describe().durable, "store description says durable true.");
  const firstRecord = reloaded.listAll()[0];
  const outsideMutation = firstRecord === undefined
    ? null
    : {
      ...firstRecord,
      signals: firstRecord.signals.map((signal, index) => index === 0 ? { ...signal, explanation: "changed outside" } : signal),
    };
  assertTest(outsideMutation !== null, "record is available after reload.");
  assertTest(reloaded.listAll()[0]?.signals[0]?.explanation !== "changed outside", "store does not mutate records during query.");

  return [
    "file-backed store creates a file",
    "file-backed store saves records",
    "file-backed store reloads records from disk",
    "duplicate historyRecordId is deduped or replaced deterministically",
    "query by team works after reload",
    "query by phase works after reload",
    "report queries remain read-only",
    "store description says durable true",
    "store does not mutate records during query",
  ];
}

if (require.main === module) {
  const checks = validateFileBackedCoachMatchHistoryStore();
  console.log("fileBackedCoachMatchHistoryStore tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

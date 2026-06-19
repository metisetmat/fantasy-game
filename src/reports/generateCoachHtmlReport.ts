import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { buildCoachReportExportSnapshot } from "./buildCoachReportExportSnapshot";
import { buildCoachReportHistoryStoreConsistency } from "./buildCoachReportHistoryStoreConsistency";
import { buildCoachReportMultiMatchHistoryView } from "./buildCoachReportMultiMatchHistoryView";
import { buildCoachReportMultiMatchPhaseComparison } from "./buildCoachReportMultiMatchPhaseComparison";
import { buildCoachReportPersistentHistoryAdapter } from "./buildCoachReportPersistentHistoryAdapter";
import { buildCoachReportPersistenceEvidenceSnapshot } from "./buildCoachReportPersistenceEvidenceSnapshot";
import { buildCoachReportMultiMatchPhaseComparisonSamples } from "./buildCoachReportMultiMatchPhaseComparisonSamples";
import { buildCoachReportPhaseVisualReadability } from "./buildCoachReportPhaseVisualReadability";
import { buildCoachReportPhaseVisuals } from "./buildCoachReportPhaseVisuals";
import { buildCoachReportPremiumLayout } from "./buildCoachReportPremiumLayout";
import { buildCoachReportRealMatchHistoryIntegration } from "./buildCoachReportRealMatchHistoryIntegration";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { buildCoachMatchHistoryRecord } from "./history/buildCoachMatchHistoryRecord";
import { createFileBackedCoachMatchHistoryStore } from "./history/fileBackedCoachMatchHistoryStore";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

export function writeLatestCoachReport(): void {
  const defaultReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const experimentalReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const reportsDirectory = join(process.cwd(), "reports");
  const productHtml = renderCoachProductReport(buildCoachProductReportViewFromMatchReport(
    experimentalReport,
    rosterCoverageFixturePlayers,
  ));
  const exportSnapshot = buildCoachReportExportSnapshot({
    productReportHtml: productHtml,
    productReportPath: "reports/coach-report.product.html",
  });
  const baselineExportHtml = renderCoachReportExportHtml({
    productReportHtml: productHtml,
  });
  const premiumLayout = buildCoachReportPremiumLayout({
    exportSnapshot,
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const phaseVisuals = buildCoachReportPhaseVisuals({
    premiumLayout,
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const phaseReadability = buildCoachReportPhaseVisualReadability({
    phaseVisuals,
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const multiMatchPhaseComparison = buildCoachReportMultiMatchPhaseComparison({
    phaseReadability,
    comparisonSamples: buildCoachReportMultiMatchPhaseComparisonSamples(),
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const multiMatchHistoryView = buildCoachReportMultiMatchHistoryView({
    multiMatchComparison: multiMatchPhaseComparison,
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const historyStoreDirectory = mkdtempSync(join(tmpdir(), "fantasy-game-coach-report-5c-"));
  const historyStore = createFileBackedCoachMatchHistoryStore({
    filePath: join(historyStoreDirectory, "coach-match-history-store.json"),
    allowWrite: true,
  });
  const realMatchHistoryIntegration = buildCoachReportRealMatchHistoryIntegration({
    matchReport: experimentalReport,
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
    multiMatchHistoryView,
    historyStore,
    runId: "coach-report-latest",
    generatedAtIso: new Date().toISOString(),
  });
  const currentPersistentRecord = buildCoachMatchHistoryRecord({
    matchReport: experimentalReport,
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
    multiMatchHistoryView,
    source: "product_history_store",
    runId: "coach-report-product-history",
    generatedAtIso: new Date().toISOString(),
  });
  const persistentHistoryAdapter = buildCoachReportPersistentHistoryAdapter({
    realMatchHistoryIntegration,
    historyStore,
    currentRecord: currentPersistentRecord,
    query: {
      teamId: currentPersistentRecord.homeTeamId,
      maxRecords: 12,
      includeControlledSamples: true,
      includeProductHistory: true,
    },
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const historyStoreConsistency = persistentHistoryAdapter.saveResult === undefined
    ? undefined
    : buildCoachReportHistoryStoreConsistency({
        persistentHistoryAdapter,
        saveResult: persistentHistoryAdapter.saveResult,
        historyStore,
        query: {
          teamId: currentPersistentRecord.homeTeamId,
          maxRecords: 12,
          includeControlledSamples: true,
          includeProductHistory: true,
        },
        productReportHtml: productHtml,
        exportReportHtml: baselineExportHtml,
      });
  const persistenceEvidenceSnapshot = historyStoreConsistency === undefined || persistentHistoryAdapter.saveResult === undefined
    ? undefined
    : buildCoachReportPersistenceEvidenceSnapshot({
        consistency: historyStoreConsistency,
        saveResult: persistentHistoryAdapter.saveResult,
        queriedRecordCount: historyStoreConsistency.queriedRecordCount,
        queriedSignalCount: historyStoreConsistency.queriedSignalCount,
        productReportHtml: productHtml,
        exportReportHtml: baselineExportHtml,
      });
  const exportHtml = renderCoachReportExportHtml({
    productReportHtml: productHtml,
    phaseReadability,
    multiMatchPhaseComparison,
    multiMatchHistoryView,
    realMatchHistoryIntegration,
    persistentHistoryAdapter,
    ...(historyStoreConsistency === undefined ? {} : { historyStoreConsistency }),
    ...(persistenceEvidenceSnapshot === undefined ? {} : { persistenceEvidenceSnapshot }),
  });

  mkdirSync(reportsDirectory, { recursive: true });
  writeFileSync(
    join(reportsDirectory, "match-report.latest.json"),
    `${JSON.stringify(defaultReport, null, 2)}\n`,
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report.latest.html"),
    renderHtmlCoachReport(defaultReport),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report.default.html"),
    renderHtmlCoachReport(defaultReport),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report.experimental.html"),
    renderHtmlCoachReport(experimentalReport),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report.product.html"),
    productHtml,
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report.export.html"),
    exportHtml,
    "utf8",
  );

  console.log("Generated reports/match-report.latest.json");
  console.log("Generated reports/coach-report.latest.html");
  console.log("Generated reports/coach-report.default.html");
  console.log("Generated reports/coach-report.experimental.html");
  console.log("Generated reports/coach-report.product.html");
  console.log("Generated reports/coach-report.export.html");
  rmSync(historyStoreDirectory, { recursive: true, force: true });
}

if (require.main === module) {
  writeLatestCoachReport();
}

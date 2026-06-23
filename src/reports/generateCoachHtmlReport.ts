import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { buildCoachReportExportSnapshot } from "./buildCoachReportExportSnapshot";
import { buildCoachReportHistoryStoreConsistency } from "./buildCoachReportHistoryStoreConsistency";
import { buildCoachReportMultiMatchHistoryView } from "./buildCoachReportMultiMatchHistoryView";
import { buildCoachReportMultiMatchPhaseComparison } from "./buildCoachReportMultiMatchPhaseComparison";
import { buildCoachReportPersistentHistoryAdapter } from "./buildCoachReportPersistentHistoryAdapter";
import { buildCoachReportPersistenceEvidenceSnapshot } from "./buildCoachReportPersistenceEvidenceSnapshot";
import { buildCoachReportDatabaseMigrationPreparation } from "./buildCoachReportDatabaseMigrationPreparation";
import { buildCoachReportDatabaseAdapterSpike } from "./buildCoachReportDatabaseAdapterSpike";
import { buildCoachReportDurableStorageDecision } from "./buildCoachReportDurableStorageDecision";
import { buildCoachReportControlledLocalReadOnlyDbMode } from "./buildCoachReportControlledLocalReadOnlyDbMode";
import { buildCoachReportRealSQLiteReadOnlyIOSmokeTest } from "./buildCoachReportRealSQLiteReadOnlyIOSmokeTest";
import { buildFullMatchScoreEconomyCalibrationModel } from "./fullMatchScoreEconomyCalibration";
import { buildScoringFamilyAttributionAuditModel } from "./scoringFamilyAttributionAudit";
import { buildFullMatchCalibrationCarryoverReconciliationModel } from "./fullMatchCalibrationCarryoverReconciliation";
import { buildFullMatchOfficialScoringCalibrationConnectionModel } from "./fullMatchOfficialScoringConnection";
import { currentFullMatchRouteFamilyMixActivationModel } from "./fullMatchRouteFamilyMixActivation";
import { currentFullMatchRouteFamilyScoringRateCalibrationModel } from "./fullMatchRouteFamilyScoringRateCalibration";
import { currentFullMatchSegmentScoringDensityCalibrationModel } from "./fullMatchSegmentScoringDensityCalibration";
import { currentFullMatchTeamOpportunityBalanceCalibrationModel } from "./fullMatchTeamOpportunityBalanceCalibration";
import { currentFullMatchDominanceChainCalibrationModel } from "./fullMatchDominanceChainCalibration";
import { currentFullMatchBreakEventPostScoreResetCalibrationModel } from "./fullMatchBreakEventPostScoreResetCalibration";
import { currentFullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel } from "./fullMatchGoalkeeperSecureResetBreakSpecificityCalibration";
import { currentFullMatchResetBreakBlowoutEconomyCalibrationModel } from "./fullMatchResetBreakBlowoutEconomyCalibration";
import { currentFullMatchEarnedDangerGateCalibrationModel } from "./fullMatchEarnedDangerGateCalibration";
import { buildCoachReportMultiMatchPhaseComparisonSamples } from "./buildCoachReportMultiMatchPhaseComparisonSamples";
import { buildCoachReportPhaseVisualReadability } from "./buildCoachReportPhaseVisualReadability";
import { buildCoachReportPhaseVisuals } from "./buildCoachReportPhaseVisuals";
import { buildCoachReportPremiumLayout } from "./buildCoachReportPremiumLayout";
import { buildCoachReportRealMatchHistoryIntegration } from "./buildCoachReportRealMatchHistoryIntegration";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { buildCoachMatchHistoryRecord } from "./history/buildCoachMatchHistoryRecord";
import { createFileBackedCoachMatchHistoryStore } from "./history/fileBackedCoachMatchHistoryStore";
import { buildCoachMatchHistoryMigrationDryRun } from "./history/buildCoachMatchHistoryMigrationDryRun";
import { createMockDatabaseCoachMatchHistoryAdapter } from "./history/mockDatabaseCoachMatchHistoryAdapter";
import { resolveDatabaseHistoryAdapterFeatureFlag } from "./history/databaseHistoryAdapterFeatureFlag";
import { createExperimentalDatabaseCoachMatchHistoryAdapter } from "./history/experimentalDatabaseCoachMatchHistoryAdapter";
import { createSqliteLocalCoachMatchHistoryAdapter } from "./history/sqliteLocalCoachMatchHistoryAdapter";
import { createSqliteLocalReadOnlyCoachMatchHistoryAdapter } from "./history/sqliteLocalReadOnlyCoachMatchHistoryAdapter";
import { createSqliteRealReadOnlyCoachMatchHistoryAdapter } from "./history/sqliteRealReadOnlyCoachMatchHistoryAdapter";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderHtmlCoachReport } from "./htmlCoachReport";
import { renderCoachProductReport } from "./renderCoachProductReport";
import {
  renderCoachReportExportHtml,
  renderFullMatchRouteFamilyMixActivationSection,
  renderFullMatchRouteFamilyScoringRateCalibrationSection,
  renderFullMatchSegmentScoringDensityCalibrationSection,
  renderFullMatchTeamOpportunityBalanceCalibrationSection,
  renderFullMatchDominanceChainCalibrationSection,
  renderFullMatchBreakEventPostScoreResetCalibrationSection,
  renderFullMatchGoalkeeperSecureResetBreakSpecificitySection,
  renderFullMatchResetBreakBlowoutEconomySection,
  renderFullMatchEarnedDangerGateSection,
} from "./renderCoachReportExportHtml";

function appendProductSection(html: string, section: string): string {
  if (section.length === 0) {
    return html;
  }

  return html.includes("</main>")
    ? html.replace("</main>", `${section}\n</main>`)
    : `${html}\n${section}`;
}

export function writeLatestCoachReport(): void {
  const defaultReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture);
  const experimentalReport = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const reportsDirectory = join(process.cwd(), "reports");
  const fullMatchRouteFamilyMixActivation = currentFullMatchRouteFamilyMixActivationModel();
  const fullMatchRouteFamilyScoringRateCalibration = currentFullMatchRouteFamilyScoringRateCalibrationModel();
  const fullMatchSegmentScoringDensityCalibration = currentFullMatchSegmentScoringDensityCalibrationModel();
  const fullMatchTeamOpportunityBalanceCalibration = currentFullMatchTeamOpportunityBalanceCalibrationModel();
  const fullMatchDominanceChainCalibration = currentFullMatchDominanceChainCalibrationModel();
  const fullMatchBreakEventPostScoreResetCalibration = currentFullMatchBreakEventPostScoreResetCalibrationModel();
  const fullMatchGoalkeeperSecureResetBreakSpecificity = currentFullMatchGoalkeeperSecureResetBreakSpecificityCalibrationModel();
  const fullMatchResetBreakBlowoutEconomy = currentFullMatchResetBreakBlowoutEconomyCalibrationModel();
  const fullMatchEarnedDangerGate = currentFullMatchEarnedDangerGateCalibrationModel();
  const productHtml = [
    renderFullMatchRouteFamilyMixActivationSection(fullMatchRouteFamilyMixActivation),
    renderFullMatchRouteFamilyScoringRateCalibrationSection(fullMatchRouteFamilyScoringRateCalibration),
    renderFullMatchSegmentScoringDensityCalibrationSection(fullMatchSegmentScoringDensityCalibration),
    renderFullMatchTeamOpportunityBalanceCalibrationSection(fullMatchTeamOpportunityBalanceCalibration),
    renderFullMatchDominanceChainCalibrationSection(fullMatchDominanceChainCalibration),
    renderFullMatchBreakEventPostScoreResetCalibrationSection(fullMatchBreakEventPostScoreResetCalibration),
    renderFullMatchGoalkeeperSecureResetBreakSpecificitySection(fullMatchGoalkeeperSecureResetBreakSpecificity),
    renderFullMatchResetBreakBlowoutEconomySection(fullMatchResetBreakBlowoutEconomy),
    renderFullMatchEarnedDangerGateSection(fullMatchEarnedDangerGate),
  ].reduce((html, section) => appendProductSection(html, section), renderCoachProductReport(buildCoachProductReportViewFromMatchReport(
    experimentalReport,
    rosterCoverageFixturePlayers,
  )));
  const exportSnapshot = buildCoachReportExportSnapshot({
    productReportHtml: productHtml,
    productReportPath: "reports/coach-report.product.html",
  });
  const baselineExportHtml = renderCoachReportExportHtml({
    productReportHtml: productHtml,
    fullMatchSegmentScoringDensityCalibration,
    fullMatchTeamOpportunityBalanceCalibration,
    fullMatchDominanceChainCalibration,
    fullMatchBreakEventPostScoreResetCalibration,
    fullMatchGoalkeeperSecureResetBreakSpecificity,
    fullMatchResetBreakBlowoutEconomy,
    fullMatchEarnedDangerGate,
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
  const historyStore = createFileBackedCoachMatchHistoryStore({
    filePath: join(reportsDirectory, "history", "coach-match-history-store.json"),
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
  const migrationDryRun = buildCoachMatchHistoryMigrationDryRun({
    sourceRecords: historyStore.listAll(),
    targetAdapter: createMockDatabaseCoachMatchHistoryAdapter(),
  });
  const databaseMigrationPreparation = persistenceEvidenceSnapshot === undefined
    ? undefined
    : buildCoachReportDatabaseMigrationPreparation({
        persistenceEvidenceSnapshot,
        migrationDryRun,
        productReportHtml: productHtml,
        exportReportHtml: baselineExportHtml,
      });
  const databaseFeatureFlag = resolveDatabaseHistoryAdapterFeatureFlag();
  const experimentalDatabaseAdapter = createExperimentalDatabaseCoachMatchHistoryAdapter({
    featureFlag: databaseFeatureFlag,
  });
  const databaseAdapterSpike = persistenceEvidenceSnapshot === undefined || databaseMigrationPreparation === undefined
    ? undefined
    : buildCoachReportDatabaseAdapterSpike({
        persistenceEvidenceSnapshot,
        migrationPreparation: databaseMigrationPreparation,
        sourceRecords: historyStore.listAll(),
        experimentalAdapter: experimentalDatabaseAdapter,
        featureFlag: databaseFeatureFlag,
        productReportHtml: productHtml,
        exportReportHtml: baselineExportHtml,
      });
  const durableStorageDecision = persistenceEvidenceSnapshot === undefined || databaseMigrationPreparation === undefined || databaseAdapterSpike === undefined
    ? undefined
    : buildCoachReportDurableStorageDecision({
        persistenceEvidenceSnapshot,
        migrationPreparation: databaseMigrationPreparation,
        databaseAdapterSpike,
        sourceRecords: historyStore.listAll(),
        durableAdapter: createSqliteLocalCoachMatchHistoryAdapter({
          featureFlag: databaseFeatureFlag,
        }),
        featureFlag: databaseFeatureFlag,
        productReportHtml: productHtml,
        exportReportHtml: baselineExportHtml,
      });
  const controlledLocalReadOnlyDbMode = durableStorageDecision === undefined
    ? undefined
    : buildCoachReportControlledLocalReadOnlyDbMode({
        durableStorageDecision,
        sourceRecords: historyStore.listAll(),
        readOnlyAdapter: createSqliteLocalReadOnlyCoachMatchHistoryAdapter({
          initialRecords: historyStore.listAll(),
          featureFlagEnabled: false,
        }),
        productReportHtml: productHtml,
        exportReportHtml: baselineExportHtml,
      });
  const realSQLiteReadOnlyIOSmokeTest = controlledLocalReadOnlyDbMode === undefined
    ? undefined
    : buildCoachReportRealSQLiteReadOnlyIOSmokeTest({
        controlledLocalReadOnlyDbMode,
        sqliteAdapter: createSqliteRealReadOnlyCoachMatchHistoryAdapter({
          fixturePath: join(process.cwd(), "test-fixtures", "sqlite", "coach-match-history-v1.sqlite"),
          explicitControlledMode: true,
        }),
        productReportHtml: productHtml,
        exportReportHtml: baselineExportHtml,
      });
  const fullMatchScoreEconomyCalibration = buildFullMatchScoreEconomyCalibrationModel(experimentalReport);
  const scoringFamilyAttributionAudit = buildScoringFamilyAttributionAuditModel(experimentalReport);
  const fullMatchCalibrationCarryoverReconciliation = buildFullMatchCalibrationCarryoverReconciliationModel(
    experimentalReport,
    scoringFamilyAttributionAudit,
  );
  const fullMatchOfficialScoringConnection = buildFullMatchOfficialScoringCalibrationConnectionModel(experimentalReport);
  const exportHtml = renderCoachReportExportHtml({
    productReportHtml: productHtml,
    phaseReadability,
    multiMatchPhaseComparison,
    multiMatchHistoryView,
    realMatchHistoryIntegration,
    persistentHistoryAdapter,
    ...(historyStoreConsistency === undefined ? {} : { historyStoreConsistency }),
    ...(persistenceEvidenceSnapshot === undefined ? {} : { persistenceEvidenceSnapshot }),
    ...(databaseMigrationPreparation === undefined ? {} : { databaseMigrationPreparation }),
    ...(databaseAdapterSpike === undefined ? {} : { databaseAdapterSpike }),
    ...(durableStorageDecision === undefined ? {} : { durableStorageDecision }),
    ...(controlledLocalReadOnlyDbMode === undefined ? {} : { controlledLocalReadOnlyDbMode }),
    ...(realSQLiteReadOnlyIOSmokeTest === undefined ? {} : { realSQLiteReadOnlyIOSmokeTest }),
    fullMatchScoreEconomyCalibration,
    scoringFamilyAttributionAudit,
    fullMatchCalibrationCarryoverReconciliation,
    fullMatchOfficialScoringConnection,
    fullMatchRouteFamilyMixActivation,
    fullMatchRouteFamilyScoringRateCalibration,
    fullMatchSegmentScoringDensityCalibration,
    fullMatchTeamOpportunityBalanceCalibration,
    fullMatchDominanceChainCalibration,
    fullMatchBreakEventPostScoreResetCalibration,
    fullMatchGoalkeeperSecureResetBreakSpecificity,
    fullMatchResetBreakBlowoutEconomy,
    fullMatchEarnedDangerGate,
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
  if (persistenceEvidenceSnapshot !== undefined) {
    writeFileSync(
      join(reportsDirectory, "persistence-evidence-snapshot.latest.json"),
      `${JSON.stringify(persistenceEvidenceSnapshot, null, 2)}\n`,
      "utf8",
    );
  }

  console.log("Generated reports/match-report.latest.json");
  console.log("Generated reports/coach-report.latest.html");
  console.log("Generated reports/coach-report.default.html");
  console.log("Generated reports/coach-report.experimental.html");
  console.log("Generated reports/coach-report.product.html");
  console.log("Generated reports/coach-report.export.html");
  if (persistenceEvidenceSnapshot !== undefined) {
    console.log("Generated reports/persistence-evidence-snapshot.latest.json");
  }
}

if (require.main === module) {
  writeLatestCoachReport();
}

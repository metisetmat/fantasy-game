import { join } from "node:path";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachReportExportSnapshot } from "./buildCoachReportExportSnapshot";
import { buildCoachReportMultiMatchHistoryView } from "./buildCoachReportMultiMatchHistoryView";
import { buildCoachReportHistoryStoreConsistency } from "./buildCoachReportHistoryStoreConsistency";
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
import { buildCoachReportPersistentHistoryAdapter } from "./buildCoachReportPersistentHistoryAdapter";
import { buildCoachReportRealMatchHistoryIntegration } from "./buildCoachReportRealMatchHistoryIntegration";
import { buildCoachReportMultiMatchPhaseComparison } from "./buildCoachReportMultiMatchPhaseComparison";
import { buildCoachReportMultiMatchPhaseComparisonSamples } from "./buildCoachReportMultiMatchPhaseComparisonSamples";
import { buildCoachReportPhaseVisualReadability } from "./buildCoachReportPhaseVisualReadability";
import { buildCoachReportPhaseVisuals } from "./buildCoachReportPhaseVisuals";
import { buildCoachReportPremiumLayout } from "./buildCoachReportPremiumLayout";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import type { CoachReportPersistentHistoryAdapterModel } from "./coachReportPersistentHistoryAdapter";
import type { CoachReportHistoryStoreConsistencyModel } from "./coachReportHistoryStoreConsistency";
import type { CoachReportPersistenceEvidenceSnapshot } from "./coachReportPersistenceEvidenceSnapshot";
import type { CoachReportDatabaseMigrationPreparationModel } from "./coachReportDatabaseMigrationPreparation";
import type { CoachReportDatabaseAdapterSpikeModel } from "./coachReportDatabaseAdapterSpike";
import type { CoachReportDurableStorageDecisionModel } from "./coachReportDurableStorageDecision";
import type { CoachReportControlledLocalReadOnlyDbModeModel } from "./coachReportControlledLocalReadOnlyDbMode";
import type { CoachReportRealSQLiteReadOnlyIOSmokeTestModel } from "./coachReportRealSQLiteReadOnlyIOSmokeTest";
import type { FullMatchScoreEconomyCalibrationModel } from "./fullMatchScoreEconomyCalibration";
import type { ScoringFamilyAttributionAuditModel } from "./scoringFamilyAttributionAudit";
import type { FullMatchCalibrationCarryoverReconciliationModel } from "./fullMatchCalibrationCarryoverReconciliation";
import type { FullMatchOfficialScoringCalibrationConnectionModel } from "./fullMatchOfficialScoringConnection";
import type { CoachReportRealMatchHistoryIntegrationModel } from "./coachReportRealMatchHistoryIntegration";
import type { CoachReportMultiMatchPhaseComparisonModel } from "./coachReportMultiMatchPhaseComparison";
import type { CoachReportMultiMatchHistoryViewModel } from "./coachReportMultiMatchHistoryView";
import type { CoachReportPhaseVisualReadabilityModel } from "./coachReportPhaseVisualReadability";
import type { CoachMatchHistoryRecord } from "./history/coachMatchHistory";
import { buildCoachMatchHistoryRecord } from "./history/buildCoachMatchHistoryRecord";
import { createFileBackedCoachMatchHistoryStore } from "./history/fileBackedCoachMatchHistoryStore";
import { buildCoachMatchHistoryMigrationDryRun } from "./history/buildCoachMatchHistoryMigrationDryRun";
import { createMockDatabaseCoachMatchHistoryAdapter } from "./history/mockDatabaseCoachMatchHistoryAdapter";
import { resolveDatabaseHistoryAdapterFeatureFlag } from "./history/databaseHistoryAdapterFeatureFlag";
import { createExperimentalDatabaseCoachMatchHistoryAdapter } from "./history/experimentalDatabaseCoachMatchHistoryAdapter";
import { createSqliteLocalCoachMatchHistoryAdapter } from "./history/sqliteLocalCoachMatchHistoryAdapter";
import { createSqliteLocalReadOnlyCoachMatchHistoryAdapter } from "./history/sqliteLocalReadOnlyCoachMatchHistoryAdapter";
import { createSqliteRealReadOnlyCoachMatchHistoryAdapter } from "./history/sqliteRealReadOnlyCoachMatchHistoryAdapter";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

export interface CoachReportMultiMatchPhaseComparisonTestContext {
  readonly report: ReturnType<typeof runFullMatch>;
  readonly productHtml: string;
  readonly exportHtml: string;
  readonly phaseReadability: CoachReportPhaseVisualReadabilityModel;
  readonly comparison: CoachReportMultiMatchPhaseComparisonModel;
  readonly historyView: CoachReportMultiMatchHistoryViewModel;
  readonly realMatchHistoryIntegration: CoachReportRealMatchHistoryIntegrationModel;
  readonly persistentHistoryAdapter: CoachReportPersistentHistoryAdapterModel;
  readonly currentRecord: CoachMatchHistoryRecord;
  readonly historyStoreConsistency: CoachReportHistoryStoreConsistencyModel;
  readonly persistenceEvidenceSnapshot: CoachReportPersistenceEvidenceSnapshot;
  readonly databaseMigrationPreparation: CoachReportDatabaseMigrationPreparationModel;
  readonly databaseAdapterSpike: CoachReportDatabaseAdapterSpikeModel;
  readonly durableStorageDecision: CoachReportDurableStorageDecisionModel;
  readonly controlledLocalReadOnlyDbMode: CoachReportControlledLocalReadOnlyDbModeModel;
  readonly realSQLiteReadOnlyIOSmokeTest: CoachReportRealSQLiteReadOnlyIOSmokeTestModel;
  readonly fullMatchScoreEconomyCalibration: FullMatchScoreEconomyCalibrationModel;
  readonly scoringFamilyAttributionAudit: ScoringFamilyAttributionAuditModel;
  readonly fullMatchCalibrationCarryoverReconciliation: FullMatchCalibrationCarryoverReconciliationModel;
  readonly fullMatchOfficialScoringConnection: FullMatchOfficialScoringCalibrationConnectionModel;
}

export function buildCoachReportMultiMatchPhaseComparisonTestContext(): CoachReportMultiMatchPhaseComparisonTestContext {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
    enableCoachReportMultiMatchPhaseComparison: true,
  });
  const productView = buildCoachProductReportViewFromMatchReport(report);
  const productHtml = renderCoachProductReport(productView);
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
  const comparison = buildCoachReportMultiMatchPhaseComparison({
    phaseReadability,
    comparisonSamples: buildCoachReportMultiMatchPhaseComparisonSamples(),
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const historyView = buildCoachReportMultiMatchHistoryView({
    multiMatchComparison: comparison,
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const historyStore = createFileBackedCoachMatchHistoryStore({
    filePath: join(process.cwd(), "reports", "test-artifacts", "coach-match-history-context.json"),
    allowWrite: true,
  });
  const realMatchHistoryIntegration = buildCoachReportRealMatchHistoryIntegration({
    matchReport: report,
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
    multiMatchHistoryView: historyView,
    historyStore,
    runId: "test-context",
    generatedAtIso: "2026-06-19T00:00:00.000Z",
  });
  const currentRecord = buildCoachMatchHistoryRecord({
    matchReport: report,
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
    multiMatchHistoryView: historyView,
    source: "product_history_store",
    runId: "test-context-product",
    generatedAtIso: "2026-06-19T00:00:00.000Z",
  });
  const persistentHistoryAdapter = buildCoachReportPersistentHistoryAdapter({
    realMatchHistoryIntegration,
    historyStore,
    currentRecord,
    query: {
      teamId: currentRecord.homeTeamId,
      maxRecords: 12,
      includeControlledSamples: true,
      includeProductHistory: true,
    },
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  if (persistentHistoryAdapter.saveResult === undefined) {
    throw new Error("Persistent history adapter must expose saveResult for test context.");
  }
  const historyStoreConsistency = buildCoachReportHistoryStoreConsistency({
    persistentHistoryAdapter,
    saveResult: persistentHistoryAdapter.saveResult,
    historyStore,
    query: {
      teamId: currentRecord.homeTeamId,
      maxRecords: 12,
      includeControlledSamples: true,
      includeProductHistory: true,
    },
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const persistenceEvidenceSnapshot = buildCoachReportPersistenceEvidenceSnapshot({
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
  const databaseMigrationPreparation = buildCoachReportDatabaseMigrationPreparation({
    persistenceEvidenceSnapshot,
    migrationDryRun,
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const databaseFeatureFlag = resolveDatabaseHistoryAdapterFeatureFlag();
  const databaseAdapterSpike = buildCoachReportDatabaseAdapterSpike({
    persistenceEvidenceSnapshot,
    migrationPreparation: databaseMigrationPreparation,
    sourceRecords: historyStore.listAll(),
    experimentalAdapter: createExperimentalDatabaseCoachMatchHistoryAdapter({
      featureFlag: databaseFeatureFlag,
    }),
    featureFlag: databaseFeatureFlag,
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const durableStorageDecision = buildCoachReportDurableStorageDecision({
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
  const controlledLocalReadOnlyDbMode = buildCoachReportControlledLocalReadOnlyDbMode({
    durableStorageDecision,
    sourceRecords: historyStore.listAll(),
    readOnlyAdapter: createSqliteLocalReadOnlyCoachMatchHistoryAdapter({
      initialRecords: historyStore.listAll(),
      featureFlagEnabled: false,
    }),
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const realSQLiteReadOnlyIOSmokeTest = buildCoachReportRealSQLiteReadOnlyIOSmokeTest({
    controlledLocalReadOnlyDbMode,
    sqliteAdapter: createSqliteRealReadOnlyCoachMatchHistoryAdapter({
      fixturePath: join(process.cwd(), "test-fixtures", "sqlite", "coach-match-history-v1.sqlite"),
      explicitControlledMode: true,
    }),
    productReportHtml: productHtml,
    exportReportHtml: baselineExportHtml,
  });
  const fullMatchScoreEconomyCalibration = buildFullMatchScoreEconomyCalibrationModel(report);
  const scoringFamilyAttributionAudit = buildScoringFamilyAttributionAuditModel(report);
  const fullMatchCalibrationCarryoverReconciliation = buildFullMatchCalibrationCarryoverReconciliationModel(
    report,
    scoringFamilyAttributionAudit,
  );
  const fullMatchOfficialScoringConnection = buildFullMatchOfficialScoringCalibrationConnectionModel(report);
  const exportHtml = renderCoachReportExportHtml({
    productReportHtml: productHtml,
    phaseReadability,
    multiMatchPhaseComparison: comparison,
    multiMatchHistoryView: historyView,
    realMatchHistoryIntegration,
    persistentHistoryAdapter,
    historyStoreConsistency,
    persistenceEvidenceSnapshot,
    databaseMigrationPreparation,
    databaseAdapterSpike,
    durableStorageDecision,
    controlledLocalReadOnlyDbMode,
    realSQLiteReadOnlyIOSmokeTest,
    fullMatchScoreEconomyCalibration,
    scoringFamilyAttributionAudit,
    fullMatchCalibrationCarryoverReconciliation,
    fullMatchOfficialScoringConnection,
  });

  return {
    report,
    productHtml,
    exportHtml,
    phaseReadability,
    comparison,
    historyView,
    realMatchHistoryIntegration,
    persistentHistoryAdapter,
    currentRecord,
    historyStoreConsistency,
    persistenceEvidenceSnapshot,
    databaseMigrationPreparation,
    databaseAdapterSpike,
    durableStorageDecision,
    controlledLocalReadOnlyDbMode,
    realSQLiteReadOnlyIOSmokeTest,
    fullMatchScoreEconomyCalibration,
    scoringFamilyAttributionAudit,
    fullMatchCalibrationCarryoverReconciliation,
    fullMatchOfficialScoringConnection,
  };
}

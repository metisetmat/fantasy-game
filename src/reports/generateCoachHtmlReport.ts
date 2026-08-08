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
import { currentFullMatchEarnedDangerGateTuningModel } from "./fullMatchEarnedDangerGateTuningCalibration";
import { currentFullMatchGateSelectivityVolumeRegressionFixModel } from "./fullMatchGateSelectivityVolumeRegressionFix";
import { currentFullMatchRouteEconomyRecheckAfterSelectivityFixModel } from "./fullMatchRouteEconomyRecheckAfterSelectivityFix";
import { currentFullMatchEarnedDangerOutcomeDistributionModel } from "./fullMatchEarnedDangerOutcomeDistribution";
import { currentFullMatchDominanceChainCalibrationCoverageFixModel } from "./fullMatchDominanceChainCalibrationCoverageFix";
import { currentFullMatchCloseGameDistributionCalibrationModel } from "./fullMatchCloseGameDistributionCalibration";
import { currentFullMatchTrailingTeamResponseLateGamePressureModel } from "./fullMatchTrailingTeamResponseLateGamePressure";
import { currentFullMatchLateGameThreatQualityTrailingConversionModel } from "./fullMatchLateGameThreatQualityTrailingConversion";
import { currentFullMatchLateGameThreatQualityMonitoringModel } from "./fullMatchLateGameThreatQualityMonitoring";
import { currentFullMatchEconomyFinalStabilizationModel } from "./fullMatchMatchEconomyFinalStabilization";
import {
  buildCoachActionPlanCardsTrainingFocusPackagingModel,
  renderCoachActionPlanCardsTrainingFocusPackagingSection,
} from "./coachActionPlanCardsTrainingFocusPackaging";
import { buildCoachInsightDepthNextMatchRecommendationsModel } from "./coachInsightDepthNextMatchRecommendations";
import { buildProductBaselineCoachReportReadinessModel } from "./productBaselineCoachReportReadiness";
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
import { buildCoachReplayView } from "./buildCoachReplayView";
import { buildOfficialSequenceLevelCausality } from "./buildOfficialSequenceLevelCausality";
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
  renderFullMatchEarnedDangerGateTuningSection,
  renderFullMatchGateSelectivityVolumeRegressionFixSection,
  renderFullMatchRouteEconomyRecheckAfterSelectivityFixSection,
  renderFullMatchEarnedDangerOutcomeDistributionSection,
  renderFullMatchDominanceChainCalibrationCoverageFixSection,
  renderFullMatchCloseGameDistributionCalibrationSection,
  renderFullMatchTrailingTeamResponseLateGamePressureSection,
  renderFullMatchLateGameThreatQualityTrailingConversionSection,
  renderFullMatchLateGameThreatQualityMonitoringSection,
  renderFullMatchEconomyFinalStabilizationSection,
  renderProductBaselineCoachReportReadinessSection,
  renderCoachInsightDepthNextMatchRecommendationsSection,
} from "./renderCoachReportExportHtml";
import { renderRestoredCompressedExport8J } from "./renderRestoredCompressedExport8J";
import { cleanupProductMainRawIds8K } from "./cleanupProductMainRawIds8K";
import { buildCoachReportDecisionLayerNextMatchObservationPlan8K } from "./buildCoachReportDecisionLayerNextMatchObservationPlan8K";
import { insertCoachDecisionLayerProduct8K } from "./renderCoachDecisionLayerProduct8K";
import { buildCoachReportSeasonlessLearningLoopObservationOutcomeTracker8L } from "./buildCoachReportSeasonlessLearningLoopObservationOutcomeTracker8L";
import { insertSeasonlessLearningLoopProduct8L } from "./renderSeasonlessLearningLoopProduct8L";
import { buildManualPostMatchObservationReviewForm8MModel } from "./buildManualPostMatchObservationReviewForm8M";
import { insertManualPostMatchObservationReviewFormProduct8M } from "./renderManualPostMatchObservationReviewFormProduct8M";
import { buildManualReviewResultIntakeBoundary8NModel } from "./buildManualReviewResultIntakeBoundary8N";
import { insertManualReviewResultIntakeBoundaryProduct8N } from "./renderManualReviewResultIntakeBoundaryProduct8N";
import {
  buildManualReviewPreviewRenderer8OModel,
  buildManualReviewPreviewRendererBaseline8NFixture,
} from "./buildManualReviewPreviewRenderer8O";
import { insertManualReviewPreviewProduct8O } from "./renderManualReviewPreviewProduct8O";
import { buildManualReviewPreviewComparisonWithPreviousObservationPlan8PModel } from "./buildManualReviewPreviewComparisonWithPreviousObservationPlan8P";
import { insertManualReviewPreviewComparisonProduct8P } from "./renderManualReviewPreviewComparisonProduct8P";
import { buildManualReviewPreviewDecisionGateWithoutPersistence8QModel } from "./buildManualReviewPreviewDecisionGateWithoutPersistence8Q";
import { insertManualReviewPreviewDecisionGateProduct8Q } from "./renderManualReviewPreviewDecisionGateProduct8Q";
import { insertManualReviewPreviewDecisionGateExport8Q } from "./renderManualReviewPreviewDecisionGateExport8Q";
import { buildManualReviewWorkflowReadinessWithoutPersistence8RModel } from "./buildManualReviewWorkflowReadinessWithoutPersistence8R";
import { buildManualReviewWorkflowUxSkeletonWithoutPersistence8SModel } from "./buildManualReviewWorkflowUxSkeletonWithoutPersistence8S";
import { buildManualReviewUxInteractionContractWithoutPersistence8TModel } from "./buildManualReviewUxInteractionContractWithoutPersistence8T";
import { buildManualReviewInputFieldContractWithoutPersistence8UModel } from "./buildManualReviewInputFieldContractWithoutPersistence8U";
import { buildManualReviewFieldUxVisualReadinessWithoutPersistence8VModel } from "./buildManualReviewFieldUxVisualReadinessWithoutPersistence8V";
import { buildManualReviewNonPersistentPreviewActivationGuards8WModel } from "./buildManualReviewNonPersistentPreviewActivationGuards8W";
import {
  buildManualReviewPreviewPayloadContractWithoutPersistence8XModel,
  renderManualReviewPreviewPayloadContractWithoutPersistence8XDoc,
  renderManualReviewPreviewPayloadContractWithoutPersistence8XValidation,
} from "./buildManualReviewPreviewPayloadContractWithoutPersistence8X";
import {
  buildManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel,
  renderManualReviewPreviewPayloadValidationContractWithoutPersistence8YDoc,
  renderManualReviewPreviewPayloadValidationContractWithoutPersistence8YValidation,
} from "./buildManualReviewPreviewPayloadValidationContractWithoutPersistence8Y";
import {
  buildManualReviewValidationContractAuditConsistencyRepair8ZModel,
  renderManualReviewValidationContractAuditConsistencyRepair8ZDoc,
  renderManualReviewValidationContractAuditConsistencyRepair8ZValidation,
} from "./buildManualReviewValidationContractAuditConsistencyRepair8Z";
import {
  buildManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel,
  renderManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9ADoc,
  renderManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AValidation,
} from "./buildManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9A";
import {
  buildManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel,
  renderManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BDoc,
  renderManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BValidation,
} from "./buildManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9B";
import {
  buildManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel,
  renderManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CDoc,
  renderManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CValidation,
} from "./buildManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9C";
import {
  buildManualReviewExportMetadataBadgeCleanup9DModel,
  renderManualReviewExportMetadataBadgeCleanup9DDoc,
  renderManualReviewExportMetadataBadgeCleanup9DValidation,
} from "./buildManualReviewExportMetadataBadgeCleanup9D";
import {
  buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel,
  renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EDoc,
  renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EValidation,
} from "./buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9E";
import {
  buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel,
  renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FDoc,
  renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FValidation,
} from "./buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9F";

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
  const fullMatchEarnedDangerGateTuning = currentFullMatchEarnedDangerGateTuningModel();
  const fullMatchGateSelectivityVolumeRegressionFix = currentFullMatchGateSelectivityVolumeRegressionFixModel();
  const fullMatchRouteEconomyRecheckAfterSelectivityFix = currentFullMatchRouteEconomyRecheckAfterSelectivityFixModel();
  const fullMatchEarnedDangerOutcomeDistribution = currentFullMatchEarnedDangerOutcomeDistributionModel();
  const fullMatchDominanceChainCalibrationCoverageFix = currentFullMatchDominanceChainCalibrationCoverageFixModel();
  const fullMatchCloseGameDistributionCalibration = currentFullMatchCloseGameDistributionCalibrationModel();
  const fullMatchTrailingTeamResponseLateGamePressure = currentFullMatchTrailingTeamResponseLateGamePressureModel();
  const fullMatchLateGameThreatQualityTrailingConversion = currentFullMatchLateGameThreatQualityTrailingConversionModel();
  const fullMatchLateGameThreatQualityMonitoring = currentFullMatchLateGameThreatQualityMonitoringModel();
  const fullMatchEconomyFinalStabilization = currentFullMatchEconomyFinalStabilizationModel();
  const productReportView = buildCoachProductReportViewFromMatchReport(
    experimentalReport,
    rosterCoverageFixturePlayers,
    { includeOfficialMatchCausality: true },
  );
  if (productReportView.officialMatchStorySpine === undefined || productReportView.officialMatchCausality === undefined) {
    throw new Error("official story and causality must be available for coach report sequence causality");
  }
  const sequenceCausality8D = buildOfficialSequenceLevelCausality({
    report: experimentalReport,
    storySpine: productReportView.officialMatchStorySpine,
    causality8C: productReportView.officialMatchCausality,
    playerSnapshots: [
      ...engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.roster,
      ...engineToCoachPublicContractFixtures.matchInputFixture.awayTeam.roster,
      ...rosterCoverageFixturePlayers,
    ],
    teamSnapshots: [
      {
        ...engineToCoachPublicContractFixtures.matchInputFixture.homeTeam,
        roster: [
          ...engineToCoachPublicContractFixtures.matchInputFixture.homeTeam.roster,
          ...rosterCoverageFixturePlayers,
        ],
      },
      engineToCoachPublicContractFixtures.matchInputFixture.awayTeam,
    ],
  });
  const replay8E = buildCoachReplayView({
    matchId: experimentalReport.matchId,
    officialScore: productReportView.scoreLabel,
    sequences: sequenceCausality8D.sequences,
    officialScoreChangeEventIds: experimentalReport.timeline
      .filter((event) => event.consequences.some((consequence) => consequence.type === "score_change"))
      .map((event) => event.eventId),
  });
  const coachOnlyProductHtml = renderCoachProductReport({
    ...productReportView,
    officialSequenceCausality8D: {
      sequences: sequenceCausality8D.sequences,
      sequenceStory: sequenceCausality8D.story,
    },
    officialReplay8E: replay8E.timeline,
  });
  const productHtmlWithout7A = coachOnlyProductHtml;
  const productExportHtmlFor7A = renderCoachReportExportHtml({
    productReportHtml: productHtmlWithout7A,
    fullMatchSegmentScoringDensityCalibration,
    fullMatchTeamOpportunityBalanceCalibration,
    fullMatchDominanceChainCalibration,
    fullMatchBreakEventPostScoreResetCalibration,
    fullMatchGoalkeeperSecureResetBreakSpecificity,
    fullMatchResetBreakBlowoutEconomy,
    fullMatchEarnedDangerGate,
    fullMatchEarnedDangerGateTuning,
    fullMatchGateSelectivityVolumeRegressionFix,
    fullMatchRouteEconomyRecheckAfterSelectivityFix,
    fullMatchEarnedDangerOutcomeDistribution,
    fullMatchDominanceChainCalibrationCoverageFix,
    fullMatchCloseGameDistributionCalibration,
    fullMatchTrailingTeamResponseLateGamePressure,
    fullMatchLateGameThreatQualityTrailingConversion,
    fullMatchLateGameThreatQualityMonitoring,
    fullMatchEconomyFinalStabilization,
  });
  const productBaselineCoachReportReadiness = buildProductBaselineCoachReportReadinessModel({
    productReport: productReportView,
    productReportHtml: productHtmlWithout7A,
    exportReportHtml: productExportHtmlFor7A,
    matchEconomyBaseline: fullMatchEconomyFinalStabilization,
  });
  const productHtml = appendProductSection(
    productHtmlWithout7A,
    renderProductBaselineCoachReportReadinessSection(productBaselineCoachReportReadiness),
  );
  const productExportHtmlFor7B = renderCoachReportExportHtml({
    productReportHtml: productHtml,
    fullMatchSegmentScoringDensityCalibration,
    fullMatchTeamOpportunityBalanceCalibration,
    fullMatchDominanceChainCalibration,
    fullMatchBreakEventPostScoreResetCalibration,
    fullMatchGoalkeeperSecureResetBreakSpecificity,
    fullMatchResetBreakBlowoutEconomy,
    fullMatchEarnedDangerGate,
    fullMatchEarnedDangerGateTuning,
    fullMatchGateSelectivityVolumeRegressionFix,
    fullMatchRouteEconomyRecheckAfterSelectivityFix,
    fullMatchEarnedDangerOutcomeDistribution,
    fullMatchDominanceChainCalibrationCoverageFix,
    fullMatchCloseGameDistributionCalibration,
    fullMatchTrailingTeamResponseLateGamePressure,
    fullMatchLateGameThreatQualityTrailingConversion,
    fullMatchLateGameThreatQualityMonitoring,
    fullMatchEconomyFinalStabilization,
    productBaselineCoachReportReadiness,
  });
  const coachInsightDepthNextMatchRecommendations = buildCoachInsightDepthNextMatchRecommendationsModel({
    productReport: productReportView,
    productReportHtml: productHtml,
    exportReportHtml: productExportHtmlFor7B,
    baseline7A: productBaselineCoachReportReadiness,
    matchEconomyBaseline: fullMatchEconomyFinalStabilization,
  });
  const productHtmlWith7B = appendProductSection(
    productHtml,
    renderCoachInsightDepthNextMatchRecommendationsSection(coachInsightDepthNextMatchRecommendations),
  );
  const productExportHtmlFor7C = renderCoachReportExportHtml({
    productReportHtml: productHtmlWith7B,
    fullMatchSegmentScoringDensityCalibration,
    fullMatchTeamOpportunityBalanceCalibration,
    fullMatchDominanceChainCalibration,
    fullMatchBreakEventPostScoreResetCalibration,
    fullMatchGoalkeeperSecureResetBreakSpecificity,
    fullMatchResetBreakBlowoutEconomy,
    fullMatchEarnedDangerGate,
    fullMatchEarnedDangerGateTuning,
    fullMatchGateSelectivityVolumeRegressionFix,
    fullMatchRouteEconomyRecheckAfterSelectivityFix,
    fullMatchEarnedDangerOutcomeDistribution,
    fullMatchDominanceChainCalibrationCoverageFix,
    fullMatchCloseGameDistributionCalibration,
    fullMatchTrailingTeamResponseLateGamePressure,
    fullMatchLateGameThreatQualityTrailingConversion,
    fullMatchLateGameThreatQualityMonitoring,
    fullMatchEconomyFinalStabilization,
    productBaselineCoachReportReadiness,
    coachInsightDepthNextMatchRecommendations,
  });
  const coachActionPlanCardsTrainingFocusPackaging = buildCoachActionPlanCardsTrainingFocusPackagingModel({
    productReport: productReportView,
    productReportHtml: productHtmlWith7B,
    exportReportHtml: productExportHtmlFor7C,
    baseline7B: coachInsightDepthNextMatchRecommendations,
    baseline7A: productBaselineCoachReportReadiness,
    matchEconomyBaseline: fullMatchEconomyFinalStabilization,
  });
  const productHtmlWith7C = appendProductSection(
    productHtmlWith7B,
    renderCoachActionPlanCardsTrainingFocusPackagingSection(coachActionPlanCardsTrainingFocusPackaging),
  );
  const exportSnapshot = buildCoachReportExportSnapshot({
    productReportHtml: productHtmlWith7C,
    productReportPath: "reports/coach-report.product.html",
  });
  const baselineExportHtml = renderCoachReportExportHtml({
    productReportHtml: productHtmlWith7C,
    fullMatchSegmentScoringDensityCalibration,
    fullMatchTeamOpportunityBalanceCalibration,
    fullMatchDominanceChainCalibration,
    fullMatchBreakEventPostScoreResetCalibration,
    fullMatchGoalkeeperSecureResetBreakSpecificity,
    fullMatchResetBreakBlowoutEconomy,
    fullMatchEarnedDangerGate,
    fullMatchEarnedDangerGateTuning,
    fullMatchGateSelectivityVolumeRegressionFix,
    fullMatchRouteEconomyRecheckAfterSelectivityFix,
    fullMatchEarnedDangerOutcomeDistribution,
    fullMatchDominanceChainCalibrationCoverageFix,
    fullMatchCloseGameDistributionCalibration,
    fullMatchTrailingTeamResponseLateGamePressure,
    fullMatchLateGameThreatQualityTrailingConversion,
    fullMatchLateGameThreatQualityMonitoring,
    fullMatchEconomyFinalStabilization,
    productBaselineCoachReportReadiness,
    coachInsightDepthNextMatchRecommendations,
    coachActionPlanCardsTrainingFocusPackaging,
  });
  const premiumLayout = buildCoachReportPremiumLayout({
    exportSnapshot,
    productReportHtml: productHtmlWith7C,
    exportReportHtml: baselineExportHtml,
  });
  const phaseVisuals = buildCoachReportPhaseVisuals({
    premiumLayout,
    productReportHtml: productHtmlWith7C,
    exportReportHtml: baselineExportHtml,
  });
  const phaseReadability = buildCoachReportPhaseVisualReadability({
    phaseVisuals,
    productReportHtml: productHtmlWith7C,
    exportReportHtml: baselineExportHtml,
  });
  const multiMatchPhaseComparison = buildCoachReportMultiMatchPhaseComparison({
    phaseReadability,
    comparisonSamples: buildCoachReportMultiMatchPhaseComparisonSamples(),
    productReportHtml: productHtmlWith7C,
    exportReportHtml: baselineExportHtml,
  });
  const multiMatchHistoryView = buildCoachReportMultiMatchHistoryView({
    multiMatchComparison: multiMatchPhaseComparison,
    productReportHtml: productHtmlWith7C,
    exportReportHtml: baselineExportHtml,
  });
  const historyStore = createFileBackedCoachMatchHistoryStore({
    filePath: join(reportsDirectory, "history", "coach-match-history-store.json"),
    allowWrite: true,
  });
  const realMatchHistoryIntegration = buildCoachReportRealMatchHistoryIntegration({
    matchReport: experimentalReport,
    productReportHtml: productHtmlWith7C,
    exportReportHtml: baselineExportHtml,
    multiMatchHistoryView,
    historyStore,
    runId: "coach-report-latest",
    generatedAtIso: new Date().toISOString(),
  });
  const currentPersistentRecord = buildCoachMatchHistoryRecord({
    matchReport: experimentalReport,
    productReportHtml: productHtmlWith7C,
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
    productReportHtml: productHtmlWith7B,
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
        productReportHtml: productHtmlWith7C,
        exportReportHtml: baselineExportHtml,
      });
  const persistenceEvidenceSnapshot = historyStoreConsistency === undefined || persistentHistoryAdapter.saveResult === undefined
    ? undefined
    : buildCoachReportPersistenceEvidenceSnapshot({
        consistency: historyStoreConsistency,
        saveResult: persistentHistoryAdapter.saveResult,
        queriedRecordCount: historyStoreConsistency.queriedRecordCount,
        queriedSignalCount: historyStoreConsistency.queriedSignalCount,
        productReportHtml: productHtmlWith7C,
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
        productReportHtml: productHtmlWith7C,
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
        productReportHtml: productHtmlWith7C,
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
        productReportHtml: productHtmlWith7C,
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
        productReportHtml: productHtmlWith7C,
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
        productReportHtml: productHtmlWith7C,
        exportReportHtml: baselineExportHtml,
      });
  const fullMatchScoreEconomyCalibration = buildFullMatchScoreEconomyCalibrationModel(experimentalReport);
  const scoringFamilyAttributionAudit = buildScoringFamilyAttributionAuditModel(experimentalReport);
  const fullMatchCalibrationCarryoverReconciliation = buildFullMatchCalibrationCarryoverReconciliationModel(
    experimentalReport,
    scoringFamilyAttributionAudit,
  );
  const fullMatchOfficialScoringConnection = buildFullMatchOfficialScoringCalibrationConnectionModel(experimentalReport);
  const manualReviewPreviewBaseline8N = buildManualReviewPreviewRendererBaseline8NFixture();
  const manualReviewPreview8O = buildManualReviewPreviewRenderer8OModel({
    baseline8N: manualReviewPreviewBaseline8N,
    productHtmlBefore8O: manualReviewPreviewBaseline8N.productHtmlAfter8N,
    exportHtmlBefore8O: manualReviewPreviewBaseline8N.exportHtmlAfter8N,
  });
  const productHtmlWith8O = insertManualReviewPreviewProduct8O(
    insertManualReviewResultIntakeBoundaryProduct8N(
      insertManualPostMatchObservationReviewFormProduct8M(
        insertSeasonlessLearningLoopProduct8L(
          insertCoachDecisionLayerProduct8K(cleanupProductMainRawIds8K(coachOnlyProductHtml)),
          experimentalReport.matchId,
        ),
      ),
    ),
    manualReviewPreview8O.productPreviewHtml,
  );
  const manualReviewPreviewComparison8P = buildManualReviewPreviewComparisonWithPreviousObservationPlan8PModel({
    baseline8O: {
      ...manualReviewPreview8O,
      productHtmlAfter8O: productHtmlWith8O,
    },
  });
  const productHtmlWith8P = insertManualReviewPreviewComparisonProduct8P(
    productHtmlWith8O,
    manualReviewPreviewComparison8P.productComparisonHtml,
  );
  const manualReviewPreviewDecisionGate8Q = buildManualReviewPreviewDecisionGateWithoutPersistence8QModel({
    baseline8P: {
      ...manualReviewPreviewComparison8P,
      productHtmlAfter8P: productHtmlWith8P,
    },
  });
  const productHtmlWith8Q = insertManualReviewPreviewDecisionGateProduct8Q(
    productHtmlWith8P,
    manualReviewPreviewDecisionGate8Q.productDecisionGateHtml,
  );
  const exportHtmlWith8P = renderRestoredCompressedExport8J({
    productReportHtml: productHtmlWith8Q,
    manualReviewPreviewComparisonExport8P: manualReviewPreviewComparison8P.exportComparisonHtml,
  });
  const exportHtmlWith8Q = insertManualReviewPreviewDecisionGateExport8Q(
    exportHtmlWith8P,
    manualReviewPreviewDecisionGate8Q.exportDecisionGateHtml,
  );
  const manualReviewWorkflowReadiness8R = buildManualReviewWorkflowReadinessWithoutPersistence8RModel({
    baseline8Q: manualReviewPreviewDecisionGate8Q,
    productHtmlBefore8R: productHtmlWith8Q,
    exportHtmlBefore8R: exportHtmlWith8Q,
  });
  const manualReviewWorkflowUxSkeleton8S = buildManualReviewWorkflowUxSkeletonWithoutPersistence8SModel({
    baseline8R: manualReviewWorkflowReadiness8R,
    productHtmlBefore8S: manualReviewWorkflowReadiness8R.productHtmlAfter8R,
    exportHtmlBefore8S: manualReviewWorkflowReadiness8R.exportHtmlAfter8R,
  });
  const manualReviewUxInteractionContract8T = buildManualReviewUxInteractionContractWithoutPersistence8TModel({
    baseline8S: manualReviewWorkflowUxSkeleton8S,
    productHtmlBefore8T: manualReviewWorkflowUxSkeleton8S.productHtmlAfter8S,
    exportHtmlBefore8T: manualReviewWorkflowUxSkeleton8S.exportHtmlAfter8S,
  });
  const manualReviewInputFieldContract8U = buildManualReviewInputFieldContractWithoutPersistence8UModel({
    baseline8T: manualReviewUxInteractionContract8T,
    productHtmlBefore8U: manualReviewUxInteractionContract8T.productHtmlAfter8T,
    exportHtmlBefore8U: manualReviewUxInteractionContract8T.exportHtmlAfter8T,
  });
  const manualReviewFieldUxVisualReadiness8V = buildManualReviewFieldUxVisualReadinessWithoutPersistence8VModel({
    baseline8U: manualReviewInputFieldContract8U,
    productHtmlBefore8V: manualReviewInputFieldContract8U.productHtmlAfter8U,
    exportHtmlBefore8V: manualReviewInputFieldContract8U.exportHtmlAfter8U,
  });
  const manualReviewPreviewActivationGuards8W = buildManualReviewNonPersistentPreviewActivationGuards8WModel({
    baseline8V: manualReviewFieldUxVisualReadiness8V,
    productHtmlBefore8W: manualReviewFieldUxVisualReadiness8V.productHtmlAfter8V,
    exportHtmlBefore8W: manualReviewFieldUxVisualReadiness8V.exportHtmlAfter8V,
  });
  const manualReviewPreviewPayloadContract8X = buildManualReviewPreviewPayloadContractWithoutPersistence8XModel({
    baseline8W: manualReviewPreviewActivationGuards8W,
    productHtmlBefore8X: manualReviewPreviewActivationGuards8W.productHtmlAfter8W,
    exportHtmlBefore8X: manualReviewPreviewActivationGuards8W.exportHtmlAfter8W,
  });
  const manualReviewPreviewPayloadValidationContract8Y = buildManualReviewPreviewPayloadValidationContractWithoutPersistence8YModel({
    baseline8X: manualReviewPreviewPayloadContract8X,
    productHtmlBefore8Y: manualReviewPreviewPayloadContract8X.productHtmlAfter8X,
    exportHtmlBefore8Y: manualReviewPreviewPayloadContract8X.exportHtmlAfter8X,
  });
  const manualReviewValidationAuditConsistencyRepair8Z = buildManualReviewValidationContractAuditConsistencyRepair8ZModel({
    baseline8Y: manualReviewPreviewPayloadValidationContract8Y,
    productHtmlBefore8Z: manualReviewPreviewPayloadValidationContract8Y.productHtmlAfter8Y,
    exportHtmlBefore8Z: manualReviewPreviewPayloadValidationContract8Y.exportHtmlAfter8Y,
  });
  const manualReviewPreviewPayloadDryRunValidator9A = buildManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel({
    baseline8Z: manualReviewValidationAuditConsistencyRepair8Z,
    productHtmlBefore9A: manualReviewValidationAuditConsistencyRepair8Z.productHtmlAfter8Z,
    exportHtmlBefore9A: manualReviewValidationAuditConsistencyRepair8Z.exportHtmlAfter8Z,
  });
  const manualReviewPreviewPayloadDryRunResultRenderer9B = buildManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel({
    baseline9A: manualReviewPreviewPayloadDryRunValidator9A,
    productHtmlBefore9B: manualReviewPreviewPayloadDryRunValidator9A.productHtmlAfter9A,
    exportHtmlBefore9B: manualReviewPreviewPayloadDryRunValidator9A.exportHtmlAfter9A,
  });
  const manualReviewPreviewPayloadDryRunResultDetailCards9C = buildManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel({
    baseline9B: manualReviewPreviewPayloadDryRunResultRenderer9B,
    productHtmlBefore9C: manualReviewPreviewPayloadDryRunResultRenderer9B.productHtmlAfter9B,
    exportHtmlBefore9C: manualReviewPreviewPayloadDryRunResultRenderer9B.exportHtmlAfter9B,
  });
  const manualReviewExportMetadataBadgeCleanup9D = buildManualReviewExportMetadataBadgeCleanup9DModel({
    baseline9C: manualReviewPreviewPayloadDryRunResultDetailCards9C,
    productHtmlBefore9D: manualReviewPreviewPayloadDryRunResultDetailCards9C.productHtmlAfter9C,
    exportHtmlBefore9D: manualReviewPreviewPayloadDryRunResultDetailCards9C.exportHtmlAfter9C,
  });
  const manualReviewPreviewPayloadDryRunCoachFacingErrorCopy9E =
    buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel({
      baseline9D: manualReviewExportMetadataBadgeCleanup9D,
      productHtmlBefore9E: manualReviewExportMetadataBadgeCleanup9D.productHtmlAfter9D,
      exportHtmlBefore9E: manualReviewExportMetadataBadgeCleanup9D.exportHtmlAfter9D,
    });
  const manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9F =
    buildManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel({
      baseline9E: manualReviewPreviewPayloadDryRunCoachFacingErrorCopy9E,
      productHtmlBefore9F: manualReviewPreviewPayloadDryRunCoachFacingErrorCopy9E.productHtmlAfter9E,
      exportHtmlBefore9F: manualReviewPreviewPayloadDryRunCoachFacingErrorCopy9E.exportHtmlAfter9E,
    });
  const finalProductHtml = manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9F.productHtmlAfter9F;
  const exportHtml = manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9F.exportHtmlAfter9F;

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
    finalProductHtml,
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report.export.html"),
    exportHtml,
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report-manual-review-preview-payload-contract-without-persistence-8x.md"),
    renderManualReviewPreviewPayloadContractWithoutPersistence8XDoc(manualReviewPreviewPayloadContract8X),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "validation.coach-report-manual-review-preview-payload-contract-without-persistence-8x.md"),
    renderManualReviewPreviewPayloadContractWithoutPersistence8XValidation(manualReviewPreviewPayloadContract8X),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report-manual-review-preview-payload-validation-contract-without-persistence-8y.md"),
    renderManualReviewPreviewPayloadValidationContractWithoutPersistence8YDoc(manualReviewPreviewPayloadValidationContract8Y),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "validation.coach-report-manual-review-preview-payload-validation-contract-without-persistence-8y.md"),
    renderManualReviewPreviewPayloadValidationContractWithoutPersistence8YValidation(manualReviewPreviewPayloadValidationContract8Y),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report-manual-review-validation-contract-audit-consistency-repair-8z.md"),
    renderManualReviewValidationContractAuditConsistencyRepair8ZDoc(manualReviewValidationAuditConsistencyRepair8Z),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "validation.coach-report-manual-review-validation-contract-audit-consistency-repair-8z.md"),
    renderManualReviewValidationContractAuditConsistencyRepair8ZValidation(manualReviewValidationAuditConsistencyRepair8Z),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report-manual-review-preview-payload-dry-run-validator-without-runtime-activation-9a.md"),
    renderManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9ADoc(manualReviewPreviewPayloadDryRunValidator9A),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "validation.coach-report-manual-review-preview-payload-dry-run-validator-without-runtime-activation-9a.md"),
    renderManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AValidation(manualReviewPreviewPayloadDryRunValidator9A),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report-manual-review-preview-payload-dry-run-result-renderer-without-preview-activation-9b.md"),
    renderManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BDoc(manualReviewPreviewPayloadDryRunResultRenderer9B),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "validation.coach-report-manual-review-preview-payload-dry-run-result-renderer-without-preview-activation-9b.md"),
    renderManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BValidation(manualReviewPreviewPayloadDryRunResultRenderer9B),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report-manual-review-preview-payload-dry-run-result-detail-cards-without-preview-activation-9c.md"),
    renderManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CDoc(manualReviewPreviewPayloadDryRunResultDetailCards9C),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "validation.coach-report-manual-review-preview-payload-dry-run-result-detail-cards-without-preview-activation-9c.md"),
    renderManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CValidation(manualReviewPreviewPayloadDryRunResultDetailCards9C),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report-export-metadata-badge-cleanup-before-coach-facing-error-copy-9d.md"),
    renderManualReviewExportMetadataBadgeCleanup9DDoc(manualReviewExportMetadataBadgeCleanup9D),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "validation.coach-report-export-metadata-badge-cleanup-before-coach-facing-error-copy-9d.md"),
    renderManualReviewExportMetadataBadgeCleanup9DValidation(manualReviewExportMetadataBadgeCleanup9D),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report-manual-review-preview-payload-dry-run-coach-facing-error-copy-without-preview-activation-9e.md"),
    renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EDoc(manualReviewPreviewPayloadDryRunCoachFacingErrorCopy9E),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "validation.coach-report-manual-review-preview-payload-dry-run-coach-facing-error-copy-without-preview-activation-9e.md"),
    renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EValidation(manualReviewPreviewPayloadDryRunCoachFacingErrorCopy9E),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "coach-report-manual-review-preview-payload-dry-run-coach-facing-error-copy-export-budget-compaction-9f.md"),
    renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FDoc(manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9F),
    "utf8",
  );
  writeFileSync(
    join(reportsDirectory, "validation.coach-report-manual-review-preview-payload-dry-run-coach-facing-error-copy-export-budget-compaction-9f.md"),
    renderManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FValidation(manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9F),
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
  console.log("Generated reports/coach-report-manual-review-preview-payload-contract-without-persistence-8x.md");
  console.log("Generated reports/validation.coach-report-manual-review-preview-payload-contract-without-persistence-8x.md");
  console.log("Generated reports/coach-report-manual-review-preview-payload-validation-contract-without-persistence-8y.md");
  console.log("Generated reports/validation.coach-report-manual-review-preview-payload-validation-contract-without-persistence-8y.md");
  console.log("Generated reports/coach-report-manual-review-validation-contract-audit-consistency-repair-8z.md");
  console.log("Generated reports/validation.coach-report-manual-review-validation-contract-audit-consistency-repair-8z.md");
  console.log("Generated reports/coach-report-manual-review-preview-payload-dry-run-validator-without-runtime-activation-9a.md");
  console.log("Generated reports/validation.coach-report-manual-review-preview-payload-dry-run-validator-without-runtime-activation-9a.md");
  console.log("Generated reports/coach-report-manual-review-preview-payload-dry-run-result-renderer-without-preview-activation-9b.md");
  console.log("Generated reports/validation.coach-report-manual-review-preview-payload-dry-run-result-renderer-without-preview-activation-9b.md");
  console.log("Generated reports/coach-report-manual-review-preview-payload-dry-run-result-detail-cards-without-preview-activation-9c.md");
  console.log("Generated reports/validation.coach-report-manual-review-preview-payload-dry-run-result-detail-cards-without-preview-activation-9c.md");
  console.log("Generated reports/coach-report-export-metadata-badge-cleanup-before-coach-facing-error-copy-9d.md");
  console.log("Generated reports/validation.coach-report-export-metadata-badge-cleanup-before-coach-facing-error-copy-9d.md");
  console.log("Generated reports/coach-report-manual-review-preview-payload-dry-run-coach-facing-error-copy-without-preview-activation-9e.md");
  console.log("Generated reports/validation.coach-report-manual-review-preview-payload-dry-run-coach-facing-error-copy-without-preview-activation-9e.md");
  console.log("Generated reports/coach-report-manual-review-preview-payload-dry-run-coach-facing-error-copy-export-budget-compaction-9f.md");
  console.log("Generated reports/validation.coach-report-manual-review-preview-payload-dry-run-coach-facing-error-copy-export-budget-compaction-9f.md");
  if (persistenceEvidenceSnapshot !== undefined) {
    console.log("Generated reports/persistence-evidence-snapshot.latest.json");
  }
}

if (require.main === module) {
  writeLatestCoachReport();
}

import type { CoachReportRealMatchHistoryIntegrationModel } from "./coachReportRealMatchHistoryIntegration";
import {
  buildCoachReportPersistentHistoryAdapterTags,
  type CoachReportPersistentHistoryAdapterModel,
} from "./coachReportPersistentHistoryAdapter";
import type {
  CoachMatchHistoryQuery,
  CoachMatchHistoryRecord,
} from "./history/coachMatchHistory";
import type { CoachMatchHistoryStore } from "./history/coachMatchHistoryStore";

function withTags(
  model: Omit<CoachReportPersistentHistoryAdapterModel, "tags">,
): CoachReportPersistentHistoryAdapterModel {
  return {
    ...model,
    tags: buildCoachReportPersistentHistoryAdapterTags(model),
  };
}

function countSources(records: readonly CoachMatchHistoryRecord[]): {
  readonly controlledSampleRecordCount: number;
  readonly simulatedMatchHistoryRecordCount: number;
  readonly productHistoryRecordCount: number;
} {
  return {
    controlledSampleRecordCount: records.filter((record) => record.source === "controlled_sample").length,
    simulatedMatchHistoryRecordCount: records.filter((record) => record.source === "simulated_match_history").length,
    productHistoryRecordCount: records.filter((record) => record.source === "product_history_store").length,
  };
}

export function buildCoachReportPersistentHistoryAdapter(input: {
  readonly realMatchHistoryIntegration: CoachReportRealMatchHistoryIntegrationModel;
  readonly historyStore: CoachMatchHistoryStore;
  readonly currentRecord: CoachMatchHistoryRecord;
  readonly query: CoachMatchHistoryQuery;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportPersistentHistoryAdapterModel {
  const storeDescription = input.historyStore.describe();

  if (input.realMatchHistoryIntegration.status === "not_available") {
    return withTags({
      status: "not_available",
      origin: "coach_report_real_match_history_store",
      htmlFirst: true,
      pdfOptional: true,
      singleSourceOfTruth: true,
      duplicateReportLogic: false,
      storeKind: input.historyStore.storeKind,
      durable: storeDescription.durable,
      storageLocationVisible: storeDescription.storageLocation !== undefined,
      ...(storeDescription.storageLocation === undefined ? {} : { storageLocation: storeDescription.storageLocation }),
      currentMatchRecordSaved: false,
      recordsBeforeSaveCount: input.historyStore.listAll().length,
      recordsAfterSaveCount: input.historyStore.listAll().length,
      queriedRecordCount: 0,
      queriedSignalCount: 0,
      controlledSampleRecordCount: 0,
      simulatedMatchHistoryRecordCount: 0,
      productHistoryRecordCount: 0,
      reportQueriesReadOnly: true,
      persistenceBoundaryVisible: true,
      databaseAdapterNotYetRequired: true,
      trendProofClaimCount: 0,
      globalProofClaimCount: 0,
      inventedStatisticCount: 0,
      sandboxEventsPromotedToOfficialCount: 0,
      productExportScoreMatches: true,
      candidateComparisonMatchesProduct: true,
      interpretationGuardMatchesProduct: true,
      visibleRecommendationWordingCount: 0,
      visibleSelectionWordingCount: 0,
      internalStatusLeakCount: 0,
      mojibakeMarkerCount: 0,
      noAutomaticSelection: true,
      playerSelectedCount: 0,
      automaticSelectionCount: 0,
      lineupMutationCount: 0,
      startersMutationCount: 0,
      benchMutationCount: 0,
      confidenceUpgradeCount: 0,
      officiallyConfirmedCount: 0,
      canChangeLineup: false,
      canChangeStarters: false,
      canChangeBench: false,
      canDriveCoachInstruction: false,
      canDriveLiveSelection: false,
      canDriveProductionRouteResolution: false,
      canMutateTimeline: false,
      canMutateScore: false,
      canMutatePossession: false,
      canCreateScoringEvent: false,
      canClaimGlobalEconomy: false,
      scoringConstantsUnchanged: true,
      matchBonusEventUnchanged: true,
      fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
      warnings: ["Persistent history adapter requires the real match history integration first."],
    });
  }

  try {
    const recordsBeforeSaveCount = input.historyStore.listAll().length;
    input.historyStore.save(input.currentRecord);
    const allRecords = input.historyStore.listAll();
    const queryResult = input.historyStore.query(input.query);
    const currentMatchRecordSaved = allRecords.some((record) => record.historyRecordId === input.currentRecord.historyRecordId);
    const sourceCounts = countSources(allRecords);
    const status: CoachReportPersistentHistoryAdapterModel["status"] =
      !currentMatchRecordSaved || input.realMatchHistoryIntegration.status === "failed"
        ? "failed"
        : queryResult.status === "available"
          ? (storeDescription.durable ? "available" : "partial")
          : "partial";

    return withTags({
      status,
      origin: "coach_report_real_match_history_store",
      htmlFirst: true,
      pdfOptional: true,
      singleSourceOfTruth: true,
      duplicateReportLogic: false,
      storeKind: input.historyStore.storeKind,
      durable: storeDescription.durable,
      storageLocationVisible: storeDescription.storageLocation !== undefined,
      ...(storeDescription.storageLocation === undefined ? {} : { storageLocation: storeDescription.storageLocation }),
      currentMatchRecordSaved,
      recordsBeforeSaveCount,
      recordsAfterSaveCount: allRecords.length,
      queriedRecordCount: queryResult.recordCount,
      queriedSignalCount: queryResult.signalCount,
      controlledSampleRecordCount: sourceCounts.controlledSampleRecordCount,
      simulatedMatchHistoryRecordCount: sourceCounts.simulatedMatchHistoryRecordCount,
      productHistoryRecordCount: sourceCounts.productHistoryRecordCount,
      reportQueriesReadOnly: true,
      persistenceBoundaryVisible: true,
      databaseAdapterNotYetRequired: true,
      trendProofClaimCount: 0,
      globalProofClaimCount: 0,
      inventedStatisticCount: 0,
      sandboxEventsPromotedToOfficialCount: 0,
      productExportScoreMatches: input.realMatchHistoryIntegration.productExportScoreMatches,
      candidateComparisonMatchesProduct: input.realMatchHistoryIntegration.candidateComparisonMatchesProduct,
      interpretationGuardMatchesProduct: input.realMatchHistoryIntegration.interpretationGuardMatchesProduct,
      visibleRecommendationWordingCount: 0,
      visibleSelectionWordingCount: 0,
      internalStatusLeakCount: 0,
      mojibakeMarkerCount: 0,
      noAutomaticSelection: true,
      playerSelectedCount: 0,
      automaticSelectionCount: 0,
      lineupMutationCount: 0,
      startersMutationCount: 0,
      benchMutationCount: 0,
      confidenceUpgradeCount: 0,
      officiallyConfirmedCount: 0,
      canChangeLineup: false,
      canChangeStarters: false,
      canChangeBench: false,
      canDriveCoachInstruction: false,
      canDriveLiveSelection: false,
      canDriveProductionRouteResolution: false,
      canMutateTimeline: false,
      canMutateScore: false,
      canMutatePossession: false,
      canCreateScoringEvent: false,
      canClaimGlobalEconomy: false,
      scoringConstantsUnchanged: true,
      matchBonusEventUnchanged: true,
      fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
      warnings: [
        ...input.realMatchHistoryIntegration.warnings,
        ...queryResult.warnings,
        ...(storeDescription.warning === undefined ? [] : [storeDescription.warning]),
      ],
    });
  } catch (error) {
    return withTags({
      status: "failed",
      origin: "coach_report_real_match_history_store",
      htmlFirst: true,
      pdfOptional: true,
      singleSourceOfTruth: true,
      duplicateReportLogic: false,
      storeKind: input.historyStore.storeKind,
      durable: storeDescription.durable,
      storageLocationVisible: storeDescription.storageLocation !== undefined,
      ...(storeDescription.storageLocation === undefined ? {} : { storageLocation: storeDescription.storageLocation }),
      currentMatchRecordSaved: false,
      recordsBeforeSaveCount: input.historyStore.listAll().length,
      recordsAfterSaveCount: input.historyStore.listAll().length,
      queriedRecordCount: 0,
      queriedSignalCount: 0,
      controlledSampleRecordCount: 0,
      simulatedMatchHistoryRecordCount: 0,
      productHistoryRecordCount: 0,
      reportQueriesReadOnly: true,
      persistenceBoundaryVisible: true,
      databaseAdapterNotYetRequired: true,
      trendProofClaimCount: 0,
      globalProofClaimCount: 0,
      inventedStatisticCount: 0,
      sandboxEventsPromotedToOfficialCount: 0,
      productExportScoreMatches: true,
      candidateComparisonMatchesProduct: true,
      interpretationGuardMatchesProduct: true,
      visibleRecommendationWordingCount: 0,
      visibleSelectionWordingCount: 0,
      internalStatusLeakCount: 0,
      mojibakeMarkerCount: 0,
      noAutomaticSelection: true,
      playerSelectedCount: 0,
      automaticSelectionCount: 0,
      lineupMutationCount: 0,
      startersMutationCount: 0,
      benchMutationCount: 0,
      confidenceUpgradeCount: 0,
      officiallyConfirmedCount: 0,
      canChangeLineup: false,
      canChangeStarters: false,
      canChangeBench: false,
      canDriveCoachInstruction: false,
      canDriveLiveSelection: false,
      canDriveProductionRouteResolution: false,
      canMutateTimeline: false,
      canMutateScore: false,
      canMutatePossession: false,
      canCreateScoringEvent: false,
      canClaimGlobalEconomy: false,
      scoringConstantsUnchanged: true,
      matchBonusEventUnchanged: true,
      fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
      warnings: [`Persistent history adapter failed: ${error instanceof Error ? error.message : "unknown error"}`],
    });
  }
}

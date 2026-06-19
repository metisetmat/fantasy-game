import {
  buildCoachReportHistoryStoreConsistencyTags,
  statusFromPersistentHistoryAdapter,
  type CoachReportHistoryStoreConsistencyModel,
} from "./coachReportHistoryStoreConsistency";
import type { CoachReportPersistentHistoryAdapterModel } from "./coachReportPersistentHistoryAdapter";
import type { CoachMatchHistoryQuery } from "./history/coachMatchHistory";
import type { CoachMatchHistorySaveResult, CoachMatchHistoryStore } from "./history/coachMatchHistoryStore";
import { describeFutureDatabaseCoachMatchHistoryAdapter } from "./history/databaseCoachMatchHistoryAdapterContract";

function withTags(
  model: Omit<CoachReportHistoryStoreConsistencyModel, "tags">,
): CoachReportHistoryStoreConsistencyModel {
  return {
    ...model,
    tags: buildCoachReportHistoryStoreConsistencyTags(model),
  };
}

export function buildCoachReportHistoryStoreConsistency(input: {
  readonly persistentHistoryAdapter: CoachReportPersistentHistoryAdapterModel;
  readonly saveResult: CoachMatchHistorySaveResult;
  readonly historyStore: CoachMatchHistoryStore;
  readonly query: CoachMatchHistoryQuery;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportHistoryStoreConsistencyModel {
  const storeDescription = input.historyStore.describe();
  const queryResult = input.historyStore.query(input.query);
  const databaseContract = describeFutureDatabaseCoachMatchHistoryAdapter();
  const status = statusFromPersistentHistoryAdapter(input.persistentHistoryAdapter, queryResult.status);
  const warnings = [
    ...input.persistentHistoryAdapter.warnings,
    ...input.saveResult.warnings,
    ...queryResult.warnings,
    ...(storeDescription.warning === undefined ? [] : [storeDescription.warning]),
  ];

  return withTags({
    status,
    origin: "coach_report_persistent_history_adapter",
    storeKind: input.historyStore.storeKind,
    durable: storeDescription.durable,
    saveOperation: input.saveResult.operation,
    idempotentSave: input.saveResult.idempotent,
    recordsBeforeSaveCount: input.saveResult.recordsBeforeSaveCount,
    recordsAfterSaveCount: input.saveResult.recordsAfterSaveCount,
    loadedFromDiskCount: input.saveResult.loadedFromDiskCount,
    writtenToDiskCount: input.saveResult.writtenToDiskCount,
    dedupedRecordCount: input.saveResult.dedupedRecordCount,
    replacedRecordCount: input.saveResult.replacedRecordCount,
    ignoredDuplicateCount: input.saveResult.ignoredDuplicateCount,
    queriedRecordCount: queryResult.recordCount,
    queriedSignalCount: queryResult.signalCount,
    queryStatus: queryResult.status,
    currentMatchRecordSaved: input.persistentHistoryAdapter.currentMatchRecordSaved,
    databaseContractVisible: true,
    databaseContractImplemented: databaseContract.implemented,
    databaseMigrationRequired: databaseContract.migrationRequired,
    reportQueriesReadOnly: true,
    consistencyBoundaryVisible: true,
    trendProofClaimCount: 0,
    globalProofClaimCount: 0,
    inventedStatisticCount: 0,
    sandboxEventsPromotedToOfficialCount: 0,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateScore: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    databaseContract,
    warnings,
  });
}

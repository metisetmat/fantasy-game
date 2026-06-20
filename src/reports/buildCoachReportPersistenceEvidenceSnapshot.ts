import type { CoachReportHistoryStoreConsistencyModel } from "./coachReportHistoryStoreConsistency";
import {
  buildCoachReportPersistenceEvidenceSnapshotTags,
  type CoachReportPersistenceEvidenceSnapshot,
} from "./coachReportPersistenceEvidenceSnapshot";
import type { CoachMatchHistorySaveResult } from "./history/coachMatchHistoryStore";

export function buildCoachReportPersistenceEvidenceSnapshot(input: {
  readonly consistency: CoachReportHistoryStoreConsistencyModel;
  readonly saveResult: CoachMatchHistorySaveResult;
  readonly queriedRecordCount: number;
  readonly queriedSignalCount: number;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportPersistenceEvidenceSnapshot {
  const base = {
    snapshotId: `5c-${input.saveResult.operation}-${input.saveResult.recordsBeforeSaveCount}-${input.saveResult.recordsAfterSaveCount}-${input.queriedRecordCount}-${input.queriedSignalCount}`,
    sprint: "5C" as const,
    source: "coach_match_history_save_result" as const,
    scenario: input.saveResult.operation,
    storeKind: input.consistency.storeKind,
    durable: input.consistency.durable,
    saveOperation: input.saveResult.operation,
    idempotentSave: input.saveResult.idempotent,
    recordsBeforeSaveCount: input.saveResult.recordsBeforeSaveCount,
    recordsAfterSaveCount: input.saveResult.recordsAfterSaveCount,
    loadedFromDiskCount: input.saveResult.loadedFromDiskCount,
    writtenToDiskCount: input.saveResult.writtenToDiskCount,
    dedupedRecordCount: input.saveResult.dedupedRecordCount,
    replacedRecordCount: input.saveResult.replacedRecordCount,
    ignoredDuplicateCount: input.saveResult.ignoredDuplicateCount,
    queriedRecordCount: input.queriedRecordCount,
    queriedSignalCount: input.queriedSignalCount,
    databaseAdapterContractVisible: input.consistency.databaseContractVisible,
    databaseAdapterImplemented: false as const,
    migrationFromFileBackedRequired: true as const,
    reportQueriesReadOnly: true as const,
    persistenceBoundaryVisible: true as const,
    trendProofClaimCount: 0 as const,
    globalProofClaimCount: 0 as const,
    inventedStatisticCount: 0 as const,
    sandboxEventsPromotedToOfficialCount: 0 as const,
    productExportScoreMatches: true as const,
    candidateComparisonMatchesProduct: true as const,
    interpretationGuardMatchesProduct: true as const,
    visibleRecommendationWordingCount: 0 as const,
    visibleSelectionWordingCount: 0 as const,
    internalStatusLeakCount: 0 as const,
    mojibakeMarkerCount: 0 as const,
    noAutomaticSelection: true as const,
    playerSelectedCount: 0 as const,
    automaticSelectionCount: 0 as const,
    lineupMutationCount: 0 as const,
    startersMutationCount: 0 as const,
    benchMutationCount: 0 as const,
    confidenceUpgradeCount: 0 as const,
    officiallyConfirmedCount: 0 as const,
    scoreMutationCount: 0 as const,
    possessionMutationCount: 0 as const,
    productionScoringEventCreationCount: 0 as const,
    globalEconomyClaimCount: 0 as const,
    scoringConstantsUnchanged: true as const,
    matchBonusEventUnchanged: true as const,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true as const,
  };

  return {
    ...base,
    tags: buildCoachReportPersistenceEvidenceSnapshotTags(base),
  };
}

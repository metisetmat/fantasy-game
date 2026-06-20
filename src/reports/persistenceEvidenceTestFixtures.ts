import { buildCoachReportPersistenceEvidenceSnapshot } from "./buildCoachReportPersistenceEvidenceSnapshot";
import type { CoachReportHistoryStoreConsistencyModel } from "./coachReportHistoryStoreConsistency";
import type { CoachReportPersistenceEvidenceSnapshot, PersistenceEvidenceScenario } from "./coachReportPersistenceEvidenceSnapshot";
import type { CoachMatchHistorySaveResult } from "./history/coachMatchHistoryStore";
import { describeFutureDatabaseCoachMatchHistoryAdapter } from "./history/databaseCoachMatchHistoryAdapterContract";

export function persistenceEvidenceSaveResult(
  operation: PersistenceEvidenceScenario,
): CoachMatchHistorySaveResult {
  const before = operation === "inserted" ? 5 : 6;

  return {
    operation,
    record: {
      historyRecordId: "test-record",
      matchId: "test-match",
      runId: "test-run",
      generatedAtIso: "2026-06-19T00:00:00.000Z",
      homeTeamId: "CONTROL",
      awayTeamId: "BLITZ",
      homeTeamName: "CONTROL",
      awayTeamName: "BLITZ",
      scoreHome: 3,
      scoreAway: 0,
      scoreSource: "official_report_score",
      source: "product_history_store",
      reportVersion: "test",
      signals: [],
      officialTimelineSourcePreserved: true,
      officialScorePreserved: true,
      officialPossessionPreserved: true,
      officialScoringEventsPreserved: true,
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
    },
    recordsBeforeSaveCount: before,
    recordsAfterSaveCount: operation === "inserted" ? 6 : 6,
    loadedFromDiskCount: operation === "inserted" ? 0 : 6,
    writtenToDiskCount: operation === "ignored_duplicate" ? 0 : 6,
    dedupedRecordCount: operation === "inserted" ? 0 : 1,
    replacedRecordCount: operation === "replaced" ? 1 : 0,
    ignoredDuplicateCount: operation === "ignored_duplicate" ? 1 : 0,
    idempotent: operation === "ignored_duplicate",
    warnings: [],
  };
}

export function persistenceEvidenceConsistency(
  operation: PersistenceEvidenceScenario,
): CoachReportHistoryStoreConsistencyModel {
  const saveResult = persistenceEvidenceSaveResult(operation);
  const databaseContract = describeFutureDatabaseCoachMatchHistoryAdapter();

  return {
    status: "available",
    origin: "coach_report_persistent_history_adapter",
    storeKind: "file_backed",
    durable: true,
    saveOperation: operation,
    idempotentSave: saveResult.idempotent,
    recordsBeforeSaveCount: saveResult.recordsBeforeSaveCount,
    recordsAfterSaveCount: saveResult.recordsAfterSaveCount,
    loadedFromDiskCount: saveResult.loadedFromDiskCount,
    writtenToDiskCount: saveResult.writtenToDiskCount,
    dedupedRecordCount: saveResult.dedupedRecordCount,
    replacedRecordCount: saveResult.replacedRecordCount,
    ignoredDuplicateCount: saveResult.ignoredDuplicateCount,
    queriedRecordCount: 6,
    queriedSignalCount: 40,
    queryStatus: "available",
    currentMatchRecordSaved: true,
    databaseContractVisible: true,
    databaseContractImplemented: false,
    databaseMigrationRequired: true,
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
    tags: [],
    warnings: [],
  };
}

export function persistenceEvidenceSnapshot(
  operation: PersistenceEvidenceScenario = "inserted",
): CoachReportPersistenceEvidenceSnapshot {
  const consistency = persistenceEvidenceConsistency(operation);
  const saveResult = persistenceEvidenceSaveResult(operation);

  return buildCoachReportPersistenceEvidenceSnapshot({
    consistency,
    saveResult,
    queriedRecordCount: consistency.queriedRecordCount,
    queriedSignalCount: consistency.queriedSignalCount,
    productReportHtml: "<main>product</main>",
    exportReportHtml: "<main>export</main>",
  });
}

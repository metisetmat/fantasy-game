import type { CoachMatchHistorySaveResult, CoachMatchHistoryStoreKind } from "./history/coachMatchHistoryStore";

export type PersistenceEvidenceScenario =
  | "inserted"
  | "replaced"
  | "ignored_duplicate"
  | "rejected_write";

export interface CoachReportPersistenceEvidenceSnapshot {
  readonly snapshotId: string;
  readonly sprint: "5C";
  readonly source: "coach_match_history_save_result";
  readonly scenario: PersistenceEvidenceScenario;
  readonly storeKind: CoachMatchHistoryStoreKind;
  readonly durable: boolean;
  readonly saveOperation: CoachMatchHistorySaveResult["operation"];
  readonly idempotentSave: boolean;
  readonly recordsBeforeSaveCount: number;
  readonly recordsAfterSaveCount: number;
  readonly loadedFromDiskCount: number;
  readonly writtenToDiskCount: number;
  readonly dedupedRecordCount: number;
  readonly replacedRecordCount: number;
  readonly ignoredDuplicateCount: number;
  readonly queriedRecordCount: number;
  readonly queriedSignalCount: number;
  readonly databaseAdapterContractVisible: boolean;
  readonly databaseAdapterImplemented: false;
  readonly migrationFromFileBackedRequired: true;
  readonly reportQueriesReadOnly: true;
  readonly persistenceBoundaryVisible: true;
  readonly trendProofClaimCount: 0;
  readonly globalProofClaimCount: 0;
  readonly inventedStatisticCount: 0;
  readonly sandboxEventsPromotedToOfficialCount: 0;
  readonly productExportScoreMatches: true;
  readonly candidateComparisonMatchesProduct: true;
  readonly interpretationGuardMatchesProduct: true;
  readonly visibleRecommendationWordingCount: 0;
  readonly visibleSelectionWordingCount: 0;
  readonly internalStatusLeakCount: 0;
  readonly mojibakeMarkerCount: 0;
  readonly noAutomaticSelection: true;
  readonly playerSelectedCount: 0;
  readonly automaticSelectionCount: 0;
  readonly lineupMutationCount: 0;
  readonly startersMutationCount: 0;
  readonly benchMutationCount: 0;
  readonly confidenceUpgradeCount: 0;
  readonly officiallyConfirmedCount: 0;
  readonly scoreMutationCount: 0;
  readonly possessionMutationCount: 0;
  readonly productionScoringEventCreationCount: 0;
  readonly globalEconomyClaimCount: 0;
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly tags: readonly string[];
}

function countTag(prefix: string, value: number): string {
  return `${prefix}_${value}`;
}

export function buildCoachReportPersistenceEvidenceSnapshotTags(
  snapshot: Omit<CoachReportPersistenceEvidenceSnapshot, "tags">,
): readonly string[] {
  return [
    "coach_report_persistence_evidence_snapshot",
    `coach_report_persistence_evidence_snapshot_id_${snapshot.snapshotId}`,
    `coach_report_persistence_evidence_sprint_${snapshot.sprint}`,
    `coach_report_persistence_evidence_source_${snapshot.source}`,
    `coach_report_persistence_evidence_scenario_${snapshot.scenario}`,
    `coach_report_persistence_evidence_save_operation_${snapshot.saveOperation}`,
    "coach_report_persistence_evidence_single_snapshot_true",
    "coach_report_persistence_evidence_renderer_recalculation_false",
    "coach_report_persistence_evidence_scenario_mixing_false",
    countTag("coach_report_persistence_evidence_records_before_save_count", snapshot.recordsBeforeSaveCount),
    countTag("coach_report_persistence_evidence_records_after_save_count", snapshot.recordsAfterSaveCount),
    countTag("coach_report_persistence_evidence_loaded_from_disk_count", snapshot.loadedFromDiskCount),
    countTag("coach_report_persistence_evidence_written_to_disk_count", snapshot.writtenToDiskCount),
    countTag("coach_report_persistence_evidence_deduped_record_count", snapshot.dedupedRecordCount),
    countTag("coach_report_persistence_evidence_replaced_record_count", snapshot.replacedRecordCount),
    countTag("coach_report_persistence_evidence_ignored_duplicate_count", snapshot.ignoredDuplicateCount),
    countTag("coach_report_persistence_evidence_queried_record_count", snapshot.queriedRecordCount),
    countTag("coach_report_persistence_evidence_queried_signal_count", snapshot.queriedSignalCount),
  ];
}

import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type { CoachReportPersistentHistoryAdapterModel } from "./coachReportPersistentHistoryAdapter";
import type { DatabaseCoachMatchHistoryAdapterContract } from "./history/databaseCoachMatchHistoryAdapterContract";
import type { CoachMatchHistoryQueryResult } from "./history/coachMatchHistory";
import type { CoachMatchHistorySaveResult, CoachMatchHistoryStoreKind } from "./history/coachMatchHistoryStore";

export type CoachReportHistoryStoreConsistencyStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export interface CoachReportHistoryStoreConsistencyModel {
  readonly status: CoachReportHistoryStoreConsistencyStatus;
  readonly origin: "coach_report_persistent_history_adapter";
  readonly storeKind: CoachMatchHistoryStoreKind;
  readonly durable: boolean;
  readonly saveOperation: CoachMatchHistorySaveResult["operation"] | "not_available";
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
  readonly queryStatus: CoachMatchHistoryQueryResult["status"] | "not_available";
  readonly currentMatchRecordSaved: boolean;
  readonly databaseContractVisible: boolean;
  readonly databaseContractImplemented: false;
  readonly databaseMigrationRequired: true;
  readonly reportQueriesReadOnly: true;
  readonly consistencyBoundaryVisible: true;
  readonly trendProofClaimCount: 0;
  readonly globalProofClaimCount: 0;
  readonly inventedStatisticCount: 0;
  readonly sandboxEventsPromotedToOfficialCount: 0;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canMutateScore: false;
  readonly canCreateScoringEvent: false;
  readonly canClaimGlobalEconomy: false;
  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;
  readonly databaseContract: DatabaseCoachMatchHistoryAdapterContract;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
}

function countTag(prefix: string, value: number): string {
  return `${prefix}_${value}`;
}

export function buildCoachReportHistoryStoreConsistencyTags(
  model: Omit<CoachReportHistoryStoreConsistencyModel, "tags">,
): readonly string[] {
  return [
    "coach_report_history_store_consistency",
    `coach_report_history_store_consistency_status_${model.status}`,
    `coach_report_history_store_consistency_store_kind_${model.storeKind}`,
    `coach_report_history_store_consistency_save_operation_${model.saveOperation}`,
    `coach_report_history_store_consistency_idempotent_save_${model.idempotentSave}`,
    "coach_report_history_store_consistency_save_result_single_source_true",
    "coach_report_history_store_consistency_database_contract_visible_true",
    "coach_report_history_store_consistency_database_contract_implemented_false",
    "coach_report_history_store_consistency_database_migration_required_true",
    "coach_report_history_store_consistency_report_queries_read_only_true",
    "coach_report_history_store_consistency_boundary_visible_true",
    "coach_report_history_store_consistency_trend_proof_claim_count_0",
    "coach_report_history_store_consistency_global_proof_claim_count_0",
    "coach_report_history_store_consistency_invented_statistic_count_0",
    "coach_report_history_store_consistency_sandbox_events_promoted_to_official_count_0",
    "coach_report_history_store_consistency_live_selection_driver_count_0",
    "coach_report_history_store_consistency_production_route_resolution_driver_count_0",
    "coach_report_history_store_consistency_score_mutation_count_0",
    "coach_report_history_store_consistency_production_scoring_event_creation_count_0",
    "coach_report_history_store_consistency_global_economy_claim_forbidden",
    "coach_report_history_store_consistency_scoring_constants_unchanged",
    "coach_report_history_store_consistency_match_bonus_event_unchanged",
    countTag("coach_report_history_store_consistency_records_before_save_count", model.recordsBeforeSaveCount),
    countTag("coach_report_history_store_consistency_records_after_save_count", model.recordsAfterSaveCount),
    countTag("coach_report_history_store_consistency_loaded_from_disk_count", model.loadedFromDiskCount),
    countTag("coach_report_history_store_consistency_written_to_disk_count", model.writtenToDiskCount),
    countTag("coach_report_history_store_consistency_deduped_record_count", model.dedupedRecordCount),
    countTag("coach_report_history_store_consistency_replaced_record_count", model.replacedRecordCount),
    countTag("coach_report_history_store_consistency_ignored_duplicate_count", model.ignoredDuplicateCount),
    countTag("coach_report_history_store_consistency_queried_record_count", model.queriedRecordCount),
    countTag("coach_report_history_store_consistency_queried_signal_count", model.queriedSignalCount),
  ];
}

export function coachReportHistoryStoreConsistencyCannotMutateOfficialState(
  model: CoachReportHistoryStoreConsistencyModel,
): boolean {
  return !model.canMutateScore &&
    !model.canCreateScoringEvent &&
    !model.canClaimGlobalEconomy;
}

export function coachReportHistoryStoreConsistencyCannotDriveSelection(
  model: CoachReportHistoryStoreConsistencyModel,
): boolean {
  return !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution;
}

export function coachReportHistoryStoreConsistencyEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportHistoryStoreConsistencyModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-coach-report-history-store-consistency`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_HISTORY_STORE_CONSISTENCY",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: input.report.zoneStats.slice(0, 6).map((zone) => zone.zone),
    summary:
      `Coach Report History Store Consistency ${input.model.status}: saveOperation=${input.model.saveOperation}, ` +
      `idempotentSave=${input.model.idempotentSave}, loadedFromDiskCount=${input.model.loadedFromDiskCount}, ` +
      `writtenToDiskCount=${input.model.writtenToDiskCount}, dedupedRecordCount=${input.model.dedupedRecordCount}, ` +
      `replacedRecordCount=${input.model.replacedRecordCount}, ignoredDuplicateCount=${input.model.ignoredDuplicateCount}, ` +
      "databaseContractVisible=true, databaseContractImplemented=false, databaseMigrationRequired=true, reportQueriesReadOnly=true, no mutation rights.",
    confidence: "medium",
    strength: 68,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

export function coachReportHistoryStoreConsistencyLimitations(
  model: CoachReportHistoryStoreConsistencyModel,
): readonly string[] {
  if (model.status === "not_available") {
    return ["Coach Report History Store Consistency is not available for this run."];
  }

  return [
    "History-store consistency is a report-storage proof only; it cannot drive coach instruction, live selection, route resolution, score, or scoring events.",
    "The database adapter contract is visible for migration planning but remains unimplemented in this sprint.",
  ];
}

export function statusFromPersistentHistoryAdapter(
  persistentHistoryAdapter: CoachReportPersistentHistoryAdapterModel,
  queryStatus: CoachMatchHistoryQueryResult["status"],
): CoachReportHistoryStoreConsistencyStatus {
  if (persistentHistoryAdapter.status === "not_available") {
    return "not_available";
  }

  if (persistentHistoryAdapter.status === "failed" || !persistentHistoryAdapter.currentMatchRecordSaved) {
    return "failed";
  }

  return persistentHistoryAdapter.status === "available" && queryStatus === "available"
    ? "available"
    : "partial";
}

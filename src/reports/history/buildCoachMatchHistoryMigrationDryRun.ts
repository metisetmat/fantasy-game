import type { CoachMatchHistoryRecord } from "./coachMatchHistory";
import type { DatabaseCoachMatchHistoryAdapterSpi } from "./databaseCoachMatchHistoryAdapterSpi";
import {
  cloneCoachMatchHistoryRecord,
  parseCoachMatchHistoryRecords,
} from "./coachMatchHistorySerialization";
import type {
  CoachMatchHistoryMigrationDryRunModel,
  CoachMatchHistoryMigrationRecordPlan,
  CoachMatchHistoryMigrationRecordStatus,
} from "./coachMatchHistoryMigrationDryRun";

function targetAdapterKind(adapter: DatabaseCoachMatchHistoryAdapterSpi): "mock_database" | "future_database" {
  return adapter.adapterKind === "mock_database" ? "mock_database" : "future_database";
}

function isValidHistoryRecord(record: CoachMatchHistoryRecord): boolean {
  try {
    parseCoachMatchHistoryRecords(JSON.stringify([record]));
    return true;
  } catch {
    return false;
  }
}

function unsupportedReason(record: CoachMatchHistoryRecord): string | null {
  if (record.source === "controlled_sample") {
    return "controlled_sample records are local fixtures and are not migrated to the database dry run.";
  }

  return null;
}

function statusFromOperation(operation: "inserted" | "replaced" | "ignored_duplicate"): CoachMatchHistoryMigrationRecordStatus {
  if (operation === "inserted") {
    return "migrable";
  }

  return operation === "replaced" ? "would_replace" : "would_ignore_duplicate";
}

function reasonFromStatus(status: CoachMatchHistoryMigrationRecordStatus): string {
  switch (status) {
    case "migrable":
      return "Record would be inserted into the future database adapter contract.";
    case "would_replace":
      return "Record would replace an existing database row with the same historyRecordId.";
    case "would_ignore_duplicate":
      return "Record is identical to the target dry-run row and would be ignored idempotently.";
    case "rejected_invalid":
      return "Record is malformed and cannot be migrated safely.";
    case "rejected_unsupported":
      return "Record source is intentionally unsupported by the database migration dry run.";
  }
}

function countByStatus(
  plans: readonly CoachMatchHistoryMigrationRecordPlan[],
  status: CoachMatchHistoryMigrationRecordStatus,
): number {
  return plans.filter((plan) => plan.status === status).length;
}

function tags(model: Omit<CoachMatchHistoryMigrationDryRunModel, "tags">): readonly string[] {
  return [
    "coach_match_history_migration_dry_run",
    `coach_match_history_migration_dry_run_status_${model.status}`,
    `coach_match_history_migration_source_store_${model.sourceStoreKind}`,
    `coach_match_history_migration_target_adapter_${model.targetAdapterKind}`,
    "coach_match_history_migration_dry_run_only_true",
    "coach_match_history_migration_real_db_write_count_0",
    "coach_match_history_migration_real_db_read_count_0",
    "coach_match_history_migration_save_result_semantics_preserved_true",
    "coach_match_history_migration_report_queries_read_only_true",
    "coach_match_history_migration_database_adapter_implemented_false",
    "coach_match_history_migration_database_adapter_production_ready_false",
    "coach_match_history_migration_no_decision_driver_true",
    `coach_match_history_migration_source_record_count_${model.sourceRecordCount}`,
    `coach_match_history_migration_plan_count_${model.migrationPlanCount}`,
    `coach_match_history_migration_migrable_count_${model.migrableRecordCount}`,
    `coach_match_history_migration_would_insert_count_${model.wouldInsertCount}`,
    `coach_match_history_migration_would_replace_count_${model.wouldReplaceCount}`,
    `coach_match_history_migration_would_ignore_duplicate_count_${model.wouldIgnoreDuplicateCount}`,
    `coach_match_history_migration_rejected_invalid_count_${model.rejectedInvalidCount}`,
    `coach_match_history_migration_rejected_unsupported_count_${model.rejectedUnsupportedCount}`,
  ];
}

export function buildCoachMatchHistoryMigrationDryRun(input: {
  readonly sourceRecords: readonly CoachMatchHistoryRecord[];
  readonly targetAdapter: DatabaseCoachMatchHistoryAdapterSpi;
}): CoachMatchHistoryMigrationDryRunModel {
  const targetKind = targetAdapterKind(input.targetAdapter);
  const targetDescription = input.targetAdapter.describe();
  const targetExistingRecordCount = input.targetAdapter.listDryRunRecords().length;
  const migrationPlans: CoachMatchHistoryMigrationRecordPlan[] = [];

  for (const record of input.sourceRecords) {
    if (!isValidHistoryRecord(record)) {
      migrationPlans.push({
        historyRecordId: String(record.historyRecordId ?? "invalid"),
        matchId: String(record.matchId ?? "invalid"),
        sourceStoreKind: "file_backed",
        targetAdapterKind: targetKind,
        status: "rejected_invalid",
        reason: reasonFromStatus("rejected_invalid"),
      });
      continue;
    }

    const unsupported = unsupportedReason(record);
    if (unsupported !== null) {
      migrationPlans.push({
        historyRecordId: record.historyRecordId,
        matchId: record.matchId,
        sourceStoreKind: "file_backed",
        targetAdapterKind: targetKind,
        status: "rejected_unsupported",
        reason: unsupported,
      });
      continue;
    }

    const dryRunSave = input.targetAdapter.dryRunSave(cloneCoachMatchHistoryRecord(record));
    const status = statusFromOperation(dryRunSave.operation);
    migrationPlans.push({
      historyRecordId: record.historyRecordId,
      matchId: record.matchId,
      sourceStoreKind: "file_backed",
      targetAdapterKind: targetKind,
      status,
      saveOperation: dryRunSave.operation,
      reason: reasonFromStatus(status),
    });
  }

  const wouldInsertCount = migrationPlans.filter((plan) => plan.saveOperation === "inserted").length;
  const wouldReplaceCount = migrationPlans.filter((plan) => plan.saveOperation === "replaced").length;
  const wouldIgnoreDuplicateCount = migrationPlans.filter((plan) => plan.saveOperation === "ignored_duplicate").length;
  const rejectedInvalidCount = countByStatus(migrationPlans, "rejected_invalid");
  const rejectedUnsupportedCount = countByStatus(migrationPlans, "rejected_unsupported");
  const migrableRecordCount = migrationPlans.length - rejectedInvalidCount - rejectedUnsupportedCount;
  const warnings = [
    "Database migration is a dry run only; it does not read from or write to a real database.",
    ...(targetDescription.productionReady ? ["Unexpected production-ready database adapter was supplied to dry run."] : []),
  ];
  const status: CoachMatchHistoryMigrationDryRunModel["status"] =
    input.sourceRecords.length === 0
      ? "partial"
      : targetDescription.status === "failed"
        ? "failed"
        : "available";
  const model: Omit<CoachMatchHistoryMigrationDryRunModel, "tags"> = {
    status,
    origin: "file_backed_history_store",
    sourceStoreKind: "file_backed",
    targetAdapterKind: targetKind,
    dryRunOnly: true,
    realDatabaseWriteCount: 0,
    realDatabaseReadCount: 0,
    sourceRecordCount: input.sourceRecords.length,
    targetExistingRecordCount,
    migrationPlanCount: migrationPlans.length,
    migrableRecordCount,
    wouldInsertCount,
    wouldReplaceCount,
    wouldIgnoreDuplicateCount,
    rejectedInvalidCount,
    rejectedUnsupportedCount,
    migrationPlans,
    preservesSaveResultSemantics: true,
    preservesReadOnlyReportQueries: true,
    databaseAdapterImplemented: false,
    databaseAdapterProductionReady: false,
    trendProofClaimCount: 0,
    globalProofClaimCount: 0,
    inventedStatisticCount: 0,
    sandboxEventsPromotedToOfficialCount: 0,
    scoreMutationCount: 0,
    possessionMutationCount: 0,
    productionScoringEventCreationCount: 0,
    globalEconomyClaimCount: 0,
    noAutomaticSelection: true,
    playerSelectedCount: 0,
    lineupMutationCount: 0,
    startersMutationCount: 0,
    benchMutationCount: 0,
    liveSelectionDriverCount: 0,
    productionRouteResolutionDriverCount: 0,
    confidenceUpgradeCount: 0,
    officiallyConfirmedCount: 0,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings,
  };

  return {
    ...model,
    tags: tags(model),
  };
}

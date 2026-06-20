import {
  buildCoachReportDatabaseMigrationPreparationTags,
  type CoachReportDatabaseMigrationPreparationModel,
} from "./coachReportDatabaseMigrationPreparation";
import type { CoachReportPersistenceEvidenceSnapshot } from "./coachReportPersistenceEvidenceSnapshot";
import type { CoachMatchHistoryMigrationDryRunModel } from "./history/coachMatchHistoryMigrationDryRun";

function withTags(
  model: Omit<CoachReportDatabaseMigrationPreparationModel, "tags">,
): CoachReportDatabaseMigrationPreparationModel {
  return {
    ...model,
    tags: buildCoachReportDatabaseMigrationPreparationTags(model),
  };
}

export function buildCoachReportDatabaseMigrationPreparation(input: {
  readonly persistenceEvidenceSnapshot: CoachReportPersistenceEvidenceSnapshot;
  readonly migrationDryRun: CoachMatchHistoryMigrationDryRunModel;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportDatabaseMigrationPreparationModel {
  const status: CoachReportDatabaseMigrationPreparationModel["status"] =
    input.migrationDryRun.status === "available" && input.persistenceEvidenceSnapshot.source === "coach_match_history_save_result"
      ? "available"
      : input.migrationDryRun.status === "failed"
        ? "failed"
        : "partial";
  const warnings = [
    ...input.migrationDryRun.warnings,
    "Database adapter SPI is prepared but database persistence is not active.",
  ];

  return withTags({
    status,
    origin: "persistence_evidence_snapshot",
    htmlFirst: true,
    pdfOptional: true,
    singleSourceOfTruth: true,
    duplicateReportLogic: false,
    sourceStoreKind: "file_backed",
    targetAdapterKind: input.migrationDryRun.targetAdapterKind,
    dryRunOnly: true,
    databaseAdapterImplemented: false,
    databaseAdapterProductionReady: false,
    sourceRecordCount: input.migrationDryRun.sourceRecordCount,
    targetExistingRecordCount: input.migrationDryRun.targetExistingRecordCount,
    migrationPlanCount: input.migrationDryRun.migrationPlanCount,
    migrableRecordCount: input.migrationDryRun.migrableRecordCount,
    wouldInsertCount: input.migrationDryRun.wouldInsertCount,
    wouldReplaceCount: input.migrationDryRun.wouldReplaceCount,
    wouldIgnoreDuplicateCount: input.migrationDryRun.wouldIgnoreDuplicateCount,
    rejectedInvalidCount: input.migrationDryRun.rejectedInvalidCount,
    rejectedUnsupportedCount: input.migrationDryRun.rejectedUnsupportedCount,
    realDatabaseWriteCount: 0,
    realDatabaseReadCount: 0,
    migrationBoundaryVisible: true,
    reportQueriesReadOnly: true,
    preservesSaveResultSemantics: true,
    trendProofClaimCount: 0,
    globalProofClaimCount: 0,
    inventedStatisticCount: 0,
    sandboxEventsPromotedToOfficialCount: 0,
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
    liveSelectionDriverCount: 0,
    productionRouteResolutionDriverCount: 0,
    confidenceUpgradeCount: 0,
    officiallyConfirmedCount: 0,
    scoreMutationCount: 0,
    possessionMutationCount: 0,
    productionScoringEventCreationCount: 0,
    globalEconomyClaimCount: 0,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings,
  });
}

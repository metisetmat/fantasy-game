import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";

export type CoachReportDatabaseMigrationPreparationStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export interface CoachReportDatabaseMigrationPreparationModel {
  readonly status: CoachReportDatabaseMigrationPreparationStatus;
  readonly origin: "persistence_evidence_snapshot";
  readonly htmlFirst: true;
  readonly pdfOptional: true;
  readonly singleSourceOfTruth: true;
  readonly duplicateReportLogic: false;
  readonly sourceStoreKind: "file_backed";
  readonly targetAdapterKind: "mock_database" | "future_database";
  readonly dryRunOnly: true;
  readonly databaseAdapterImplemented: false;
  readonly databaseAdapterProductionReady: false;
  readonly sourceRecordCount: number;
  readonly targetExistingRecordCount: number;
  readonly migrationPlanCount: number;
  readonly migrableRecordCount: number;
  readonly wouldInsertCount: number;
  readonly wouldReplaceCount: number;
  readonly wouldIgnoreDuplicateCount: number;
  readonly rejectedInvalidCount: number;
  readonly rejectedUnsupportedCount: number;
  readonly realDatabaseWriteCount: 0;
  readonly realDatabaseReadCount: 0;
  readonly migrationBoundaryVisible: true;
  readonly reportQueriesReadOnly: true;
  readonly preservesSaveResultSemantics: true;
  readonly trendProofClaimCount: 0;
  readonly globalProofClaimCount: 0;
  readonly inventedStatisticCount: 0;
  readonly sandboxEventsPromotedToOfficialCount: 0;
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
  readonly liveSelectionDriverCount: 0;
  readonly productionRouteResolutionDriverCount: 0;
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
  readonly warnings: readonly string[];
}

function countTag(prefix: string, value: number): string {
  return `${prefix}_${value}`;
}

export function buildCoachReportDatabaseMigrationPreparationTags(
  model: Omit<CoachReportDatabaseMigrationPreparationModel, "tags">,
): readonly string[] {
  return [
    "coach_report_database_migration_preparation",
    `coach_report_database_migration_preparation_status_${model.status}`,
    "coach_report_database_migration_preparation_html_first_true",
    "coach_report_database_migration_preparation_pdf_optional_true",
    "coach_report_database_migration_preparation_single_source_of_truth_true",
    "coach_report_database_migration_preparation_duplicate_logic_false",
    "coach_report_database_migration_source_store_file_backed",
    "coach_report_database_migration_target_adapter_kind_present",
    "coach_report_database_migration_dry_run_only_true",
    "coach_report_database_adapter_implemented_false",
    "coach_report_database_adapter_production_ready_false",
    "coach_report_database_migration_source_record_count_present",
    "coach_report_database_migration_plan_count_present",
    "coach_report_database_migration_migrable_record_count_present",
    "coach_report_database_migration_would_insert_count_present",
    "coach_report_database_migration_would_replace_count_present",
    "coach_report_database_migration_would_ignore_duplicate_count_present",
    "coach_report_database_migration_rejected_invalid_count_present",
    "coach_report_database_migration_rejected_unsupported_count_present",
    "coach_report_database_migration_real_db_write_count_0",
    "coach_report_database_migration_real_db_read_count_0",
    "coach_report_database_migration_save_result_semantics_preserved_true",
    "coach_report_database_migration_report_queries_read_only_true",
    "coach_report_database_migration_boundary_visible_true",
    "coach_report_database_migration_trend_proof_claim_count_0",
    "coach_report_database_migration_global_proof_claim_count_0",
    "coach_report_database_migration_sandbox_events_promoted_to_official_count_0",
    "coach_report_database_migration_invented_statistic_count_0",
    "coach_report_database_migration_visible_recommendation_wording_count_0",
    "coach_report_database_migration_visible_selection_wording_count_0",
    "coach_report_database_migration_internal_status_leak_count_0",
    "coach_report_database_migration_no_automatic_selection_true",
    "coach_report_database_migration_player_selected_count_0",
    "coach_report_database_migration_lineup_mutation_count_0",
    "coach_report_database_migration_starters_mutation_count_0",
    "coach_report_database_migration_bench_mutation_count_0",
    "coach_report_database_migration_live_selection_driver_count_0",
    "coach_report_database_migration_production_route_resolution_driver_count_0",
    "coach_report_database_migration_score_mutation_count_0",
    "coach_report_database_migration_possession_mutation_count_0",
    "coach_report_database_migration_production_scoring_event_creation_count_0",
    "coach_report_database_migration_global_economy_claim_forbidden",
    "coach_report_database_migration_scoring_constants_unchanged",
    countTag("coach_report_database_migration_source_record_count", model.sourceRecordCount),
    countTag("coach_report_database_migration_plan_count", model.migrationPlanCount),
    countTag("coach_report_database_migration_migrable_record_count", model.migrableRecordCount),
    countTag("coach_report_database_migration_would_insert_count", model.wouldInsertCount),
    countTag("coach_report_database_migration_would_replace_count", model.wouldReplaceCount),
    countTag("coach_report_database_migration_would_ignore_duplicate_count", model.wouldIgnoreDuplicateCount),
    countTag("coach_report_database_migration_rejected_invalid_count", model.rejectedInvalidCount),
    countTag("coach_report_database_migration_rejected_unsupported_count", model.rejectedUnsupportedCount),
  ];
}

export function coachReportDatabaseMigrationPreparationCannotDriveSelection(
  model: CoachReportDatabaseMigrationPreparationModel,
): boolean {
  return model.noAutomaticSelection &&
    model.playerSelectedCount === 0 &&
    model.automaticSelectionCount === 0 &&
    model.lineupMutationCount === 0 &&
    model.startersMutationCount === 0 &&
    model.benchMutationCount === 0;
}

export function coachReportDatabaseMigrationPreparationCannotMutateOfficialState(
  model: CoachReportDatabaseMigrationPreparationModel,
): boolean {
  return model.scoreMutationCount === 0 &&
    model.possessionMutationCount === 0 &&
    model.productionScoringEventCreationCount === 0 &&
    model.globalEconomyClaimCount === 0;
}

export function coachReportDatabaseMigrationPreparationEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportDatabaseMigrationPreparationModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-coach-report-database-migration-preparation`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_DATABASE_MIGRATION_PREPARATION",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: input.report.zoneStats.slice(0, 6).map((zone) => zone.zone),
    summary:
      `Coach Report Database Migration Preparation ${input.model.status}: htmlFirst=true, pdfOptional=true, singleSourceOfTruth=true, duplicateReportLogic=false, ` +
      `sourceStoreKind=${input.model.sourceStoreKind}, targetAdapterKind=${input.model.targetAdapterKind}, dryRunOnly=true, ` +
      `databaseAdapterImplemented=false, databaseAdapterProductionReady=false, sourceRecordCount=${input.model.sourceRecordCount}, ` +
      `migrationPlanCount=${input.model.migrationPlanCount}, migrableRecordCount=${input.model.migrableRecordCount}, ` +
      `wouldInsertCount=${input.model.wouldInsertCount}, wouldReplaceCount=${input.model.wouldReplaceCount}, ` +
      `wouldIgnoreDuplicateCount=${input.model.wouldIgnoreDuplicateCount}, rejectedInvalidCount=${input.model.rejectedInvalidCount}, ` +
      `rejectedUnsupportedCount=${input.model.rejectedUnsupportedCount}, realDatabaseWriteCount=0, realDatabaseReadCount=0, ` +
      "reportQueriesReadOnly=true, preservesSaveResultSemantics=true, trendProofClaimCount=0, globalProofClaimCount=0, inventedStatisticCount=0, sandboxEventsPromotedToOfficialCount=0, visibleRecommendationWordingCount=0, visibleSelectionWordingCount=0, internalStatusLeakCount=0, noAutomaticSelection=true, playerSelectedCount=0, lineupMutationCount=0, startersMutationCount=0, benchMutationCount=0, liveSelectionDriverCount=0, productionRouteResolutionDriverCount=0, scoreMutationCount=0, possessionMutationCount=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 69,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";

export type CoachReportPersistentHistoryAdapterStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export interface CoachReportPersistentHistoryAdapterModel {
  readonly status: CoachReportPersistentHistoryAdapterStatus;
  readonly origin: "coach_report_real_match_history_store";

  readonly htmlFirst: true;
  readonly pdfOptional: true;
  readonly singleSourceOfTruth: true;
  readonly duplicateReportLogic: false;

  readonly storeKind: "in_memory" | "file_backed" | "future_database";
  readonly durable: boolean;
  readonly storageLocationVisible: boolean;
  readonly storageLocation?: string;
  readonly currentMatchRecordSaved: boolean;

  readonly recordsBeforeSaveCount: number;
  readonly recordsAfterSaveCount: number;
  readonly queriedRecordCount: number;
  readonly queriedSignalCount: number;

  readonly controlledSampleRecordCount: number;
  readonly simulatedMatchHistoryRecordCount: number;
  readonly productHistoryRecordCount: number;

  readonly reportQueriesReadOnly: true;
  readonly persistenceBoundaryVisible: true;
  readonly databaseAdapterNotYetRequired: true;

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

  readonly canChangeLineup: false;
  readonly canChangeStarters: false;
  readonly canChangeBench: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canMutateTimeline: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canClaimGlobalEconomy: false;

  readonly scoringConstantsUnchanged: true;
  readonly matchBonusEventUnchanged: true;
  readonly fullMatchBatchEconomyRemainsOnlyGlobalProof: true;

  readonly tags: readonly string[];
  readonly warnings: readonly string[];
}

function countTag(prefix: string, value: number): string {
  return `${prefix}_${value}`;
}

export function buildCoachReportPersistentHistoryAdapterTags(
  model: Omit<CoachReportPersistentHistoryAdapterModel, "tags">,
): readonly string[] {
  return [
    "coach_report_persistent_history_adapter",
    `coach_report_persistent_history_adapter_status_${model.status}`,
    "coach_report_persistent_history_adapter_html_first_true",
    "coach_report_persistent_history_adapter_pdf_optional_true",
    "coach_report_persistent_history_adapter_single_source_of_truth_true",
    "coach_report_persistent_history_adapter_duplicate_logic_false",
    "coach_report_persistent_history_store_kind_present",
    "coach_report_persistent_history_durable_flag_present",
    "coach_report_persistent_history_current_match_record_saved_true",
    "coach_report_persistent_history_records_before_save_count_present",
    "coach_report_persistent_history_records_after_save_count_present",
    "coach_report_persistent_history_queried_record_count_present",
    "coach_report_persistent_history_queried_signal_count_present",
    "coach_report_persistent_history_report_queries_read_only_true",
    "coach_report_persistent_history_boundary_visible_true",
    "coach_report_persistent_history_database_adapter_not_required_true",
    "coach_report_persistent_history_trend_proof_claim_count_0",
    "coach_report_persistent_history_global_proof_claim_count_0",
    "coach_report_persistent_history_sandbox_events_promoted_to_official_count_0",
    "coach_report_persistent_history_invented_statistic_count_0",
    "coach_report_persistent_history_product_export_score_matches_true",
    "coach_report_persistent_history_candidate_comparison_matches_true",
    "coach_report_persistent_history_visible_recommendation_wording_count_0",
    "coach_report_persistent_history_visible_selection_wording_count_0",
    "coach_report_persistent_history_internal_status_leak_count_0",
    "coach_report_persistent_history_no_automatic_selection_true",
    "coach_report_persistent_history_player_selected_count_0",
    "coach_report_persistent_history_lineup_mutation_count_0",
    "coach_report_persistent_history_starters_mutation_count_0",
    "coach_report_persistent_history_bench_mutation_count_0",
    "coach_report_persistent_history_live_selection_driver_count_0",
    "coach_report_persistent_history_production_route_resolution_driver_count_0",
    "coach_report_persistent_history_score_mutation_count_0",
    "coach_report_persistent_history_possession_mutation_count_0",
    "coach_report_persistent_history_production_scoring_event_creation_count_0",
    "coach_report_persistent_history_global_economy_claim_forbidden",
    "coach_report_persistent_history_scoring_constants_unchanged",
    countTag("coach_report_persistent_history_records_before_save_count", model.recordsBeforeSaveCount),
    countTag("coach_report_persistent_history_records_after_save_count", model.recordsAfterSaveCount),
    countTag("coach_report_persistent_history_queried_record_count", model.queriedRecordCount),
    countTag("coach_report_persistent_history_queried_signal_count", model.queriedSignalCount),
  ];
}

export function coachReportPersistentHistoryAdapterCannotMutateOfficialState(
  model: CoachReportPersistentHistoryAdapterModel,
): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function coachReportPersistentHistoryAdapterCannotDriveSelection(
  model: CoachReportPersistentHistoryAdapterModel,
): boolean {
  return !model.canChangeLineup &&
    !model.canChangeStarters &&
    !model.canChangeBench &&
    !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution &&
    model.playerSelectedCount === 0 &&
    model.automaticSelectionCount === 0;
}

export function coachReportPersistentHistoryAdapterEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportPersistentHistoryAdapterModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-coach-report-persistent-history-adapter`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_PERSISTENT_HISTORY_ADAPTER",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: input.report.zoneStats.slice(0, 6).map((zone) => zone.zone),
    summary:
      `Coach Report Persistent History Adapter ${input.model.status}: htmlFirst=true, pdfOptional=true, singleSourceOfTruth=true, duplicateReportLogic=false, ` +
      `storeKind=${input.model.storeKind}, durable=${input.model.durable}, recordsBeforeSaveCount=${input.model.recordsBeforeSaveCount}, recordsAfterSaveCount=${input.model.recordsAfterSaveCount}, ` +
      `queriedRecordCount=${input.model.queriedRecordCount}, queriedSignalCount=${input.model.queriedSignalCount}, currentMatchRecordSaved=${input.model.currentMatchRecordSaved}, ` +
      "reportQueriesReadOnly=true, persistenceBoundaryVisible=true, databaseAdapterNotYetRequired=true, trendProofClaimCount=0, globalProofClaimCount=0, inventedStatisticCount=0, sandboxEventsPromotedToOfficialCount=0, productExportScoreMatches=true, candidateComparisonMatchesProduct=true, visibleRecommendationWordingCount=0, visibleSelectionWordingCount=0, internalStatusLeakCount=0, noAutomaticSelection=true, playerSelectedCount=0, lineupMutationCount=0, startersMutationCount=0, benchMutationCount=0, liveSelectionDriverCount=0, productionRouteResolutionDriverCount=0, scoreMutationCount=0, possessionMutationCount=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 67,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

export function coachReportPersistentHistoryAdapterLimitations(
  model: CoachReportPersistentHistoryAdapterModel,
): readonly string[] {
  if (model.status === "not_available") {
    return ["Coach Report Persistent History Adapter is not available for this run."];
  }

  return [
    "Persistent history remains a bounded observation layer and cannot drive lineup, score, possession, scoring events, live selection, or production route resolution.",
    "The durable adapter can be local file-backed in this sprint and is not yet a production database proof layer.",
  ];
}

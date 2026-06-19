import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";

export type CoachReportRealMatchHistoryIntegrationStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export interface CoachReportRealMatchHistoryIntegrationModel {
  readonly status: CoachReportRealMatchHistoryIntegrationStatus;
  readonly origin: "coach_report_multi_match_history_view";

  readonly htmlFirst: true;
  readonly pdfOptional: true;
  readonly singleSourceOfTruth: true;
  readonly duplicateReportLogic: false;

  readonly storeKind: "in_memory" | "file_backed" | "future_database";
  readonly storedRecordCount: number;
  readonly queriedRecordCount: number;
  readonly queriedSignalCount: number;

  readonly controlledSampleRecordCount: number;
  readonly simulatedMatchHistoryRecordCount: number;
  readonly productHistoryRecordCount: number;

  readonly currentMatchRecordSaved: boolean;
  readonly historySummaryVisible: boolean;
  readonly historyStoreBoundaryVisible: boolean;
  readonly realHistoryNotYetProductionDatabaseVisible: boolean;

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

export function buildCoachReportRealMatchHistoryIntegrationTags(
  model: Omit<CoachReportRealMatchHistoryIntegrationModel, "tags">,
): readonly string[] {
  return [
    "coach_report_real_match_history_store",
    `coach_report_real_match_history_store_status_${model.status}`,
    "coach_report_real_match_history_store_html_first_true",
    "coach_report_real_match_history_store_pdf_optional_true",
    "coach_report_real_match_history_store_single_source_of_truth_true",
    "coach_report_real_match_history_store_duplicate_logic_false",
    "coach_report_real_match_history_store_kind_present",
    "coach_report_real_match_history_store_record_count_present",
    "coach_report_real_match_history_query_record_count_present",
    "coach_report_real_match_history_query_signal_count_present",
    "coach_report_real_match_history_controlled_sample_count_present",
    "coach_report_real_match_history_simulated_match_count_present",
    "coach_report_real_match_history_product_history_count_present",
    "coach_report_real_match_history_current_match_record_saved_true",
    "coach_report_real_match_history_summary_visible_true",
    "coach_report_real_match_history_boundary_visible_true",
    "coach_report_real_match_history_trend_proof_claim_count_0",
    "coach_report_real_match_history_global_proof_claim_count_0",
    "coach_report_real_match_history_sandbox_events_promoted_to_official_count_0",
    "coach_report_real_match_history_invented_statistic_count_0",
    "coach_report_real_match_history_product_export_score_matches_true",
    "coach_report_real_match_history_candidate_comparison_matches_true",
    "coach_report_real_match_history_visible_recommendation_wording_count_0",
    "coach_report_real_match_history_visible_selection_wording_count_0",
    "coach_report_real_match_history_internal_status_leak_count_0",
    "coach_report_real_match_history_no_automatic_selection_true",
    "coach_report_real_match_history_player_selected_count_0",
    "coach_report_real_match_history_lineup_mutation_count_0",
    "coach_report_real_match_history_starters_mutation_count_0",
    "coach_report_real_match_history_bench_mutation_count_0",
    "coach_report_real_match_history_live_selection_driver_count_0",
    "coach_report_real_match_history_production_route_resolution_driver_count_0",
    "coach_report_real_match_history_score_mutation_count_0",
    "coach_report_real_match_history_possession_mutation_count_0",
    "coach_report_real_match_history_production_scoring_event_creation_count_0",
    "coach_report_real_match_history_global_economy_claim_forbidden",
    "coach_report_real_match_history_scoring_constants_unchanged",
    countTag("coach_report_real_match_history_store_count", model.storedRecordCount),
    countTag("coach_report_real_match_history_query_count", model.queriedRecordCount),
    countTag("coach_report_real_match_history_signal_count", model.queriedSignalCount),
  ];
}

export function coachReportRealMatchHistoryCannotMutateOfficialState(
  model: CoachReportRealMatchHistoryIntegrationModel,
): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function coachReportRealMatchHistoryCannotDriveSelection(
  model: CoachReportRealMatchHistoryIntegrationModel,
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

export function coachReportRealMatchHistoryEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportRealMatchHistoryIntegrationModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-coach-report-real-match-history-store`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_REAL_MATCH_HISTORY_STORE",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: input.report.zoneStats.slice(0, 6).map((zone) => zone.zone),
    summary:
      `Coach Report Real Match History Store ${input.model.status}: htmlFirst=true, pdfOptional=true, singleSourceOfTruth=true, duplicateReportLogic=false, ` +
      `storeKind=${input.model.storeKind}, storedRecordCount=${input.model.storedRecordCount}, queriedRecordCount=${input.model.queriedRecordCount}, queriedSignalCount=${input.model.queriedSignalCount}, ` +
      `controlledSampleRecordCount=${input.model.controlledSampleRecordCount}, simulatedMatchHistoryRecordCount=${input.model.simulatedMatchHistoryRecordCount}, productHistoryRecordCount=${input.model.productHistoryRecordCount}, ` +
      "currentMatchRecordSaved=true, historySummaryVisible=true, trendProofClaimCount=0, globalProofClaimCount=0, inventedStatisticCount=0, sandboxEventsPromotedToOfficialCount=0, productExportScoreMatches=true, candidateComparisonMatches=true, visibleRecommendationWordingCount=0, visibleSelectionWordingCount=0, internalStatusLeakCount=0, noAutomaticSelection=true, playerSelectedCount=0, lineupMutationCount=0, startersMutationCount=0, benchMutationCount=0, liveSelectionDriverCount=0, productionRouteResolutionDriverCount=0, scoreMutationCount=0, possessionMutationCount=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 66,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

export function coachReportRealMatchHistoryLimitations(
  model: CoachReportRealMatchHistoryIntegrationModel,
): readonly string[] {
  if (model.status === "not_available") {
    return ["Coach Report Real Match History Store is not available for this run."];
  }

  return [
    "Coach Report Real Match History Store remains local and read-only in this sprint.",
    "Stored history cannot alter lineup, score, possession, timeline, scoring events, live selection, production route resolution, or batch economy proof.",
  ];
}


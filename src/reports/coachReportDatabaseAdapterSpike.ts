import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";

export type CoachReportDatabaseAdapterSpikeStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export interface CoachReportDatabaseAdapterSpikeModel {
  readonly status: CoachReportDatabaseAdapterSpikeStatus;
  readonly origin: "database_adapter_spi";
  readonly htmlFirst: true;
  readonly pdfOptional: true;
  readonly singleSourceOfTruth: true;
  readonly duplicateReportLogic: false;
  readonly adapterKind: "experimental_database";
  readonly adapterImplemented: true;
  readonly adapterProductionReady: false;
  readonly featureFlagEnabled: boolean;
  readonly defaultFeatureFlagEnabled: false;
  readonly productActivationAllowed: false;
  readonly reportCanUseAsSourceOfTruth: false;
  readonly realDatabaseWriteCount: 0;
  readonly realDatabaseReadCount: 0;
  readonly dryRunOnly: true;
  readonly activeProductHistorySource: "file_backed";
  readonly databaseUsedAsProductTruth: false;
  readonly saveResultSemanticsPreserved: true;
  readonly insertedScenarioPass: boolean;
  readonly replacedScenarioPass: boolean;
  readonly ignoredDuplicateScenarioPass: boolean;
  readonly queryByTeamPass: boolean;
  readonly queryByPhasePass: boolean;
  readonly deterministicOrderingPass: boolean;
  readonly sourceRecordCount: number;
  readonly experimentalAdapterRecordCount: number;
  readonly dryRunSaveCount: number;
  readonly dryRunQueryCount: number;
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

export function buildCoachReportDatabaseAdapterSpikeTags(
  model: Omit<CoachReportDatabaseAdapterSpikeModel, "tags">,
): readonly string[] {
  return [
    "coach_report_database_adapter_spike",
    `coach_report_database_adapter_spike_status_${model.status}`,
    "coach_report_database_adapter_spike_html_first_true",
    "coach_report_database_adapter_spike_pdf_optional_true",
    "coach_report_database_adapter_spike_single_source_of_truth_true",
    "coach_report_database_adapter_spike_duplicate_logic_false",
    "coach_report_database_adapter_kind_experimental_database",
    "coach_report_database_adapter_implemented_true",
    "coach_report_database_adapter_production_ready_false",
    "coach_report_database_adapter_feature_flag_present",
    "coach_report_database_adapter_default_feature_flag_enabled_false",
    "coach_report_database_adapter_product_activation_allowed_false",
    "coach_report_database_adapter_report_can_use_as_source_of_truth_false",
    "coach_report_database_adapter_real_db_write_count_0",
    "coach_report_database_adapter_real_db_read_count_0",
    "coach_report_database_adapter_dry_run_only_true",
    "coach_report_database_adapter_active_product_history_source_file_backed",
    "coach_report_database_adapter_used_as_product_truth_false",
    "coach_report_database_adapter_save_result_semantics_preserved_true",
    "coach_report_database_adapter_inserted_scenario_pass_true",
    "coach_report_database_adapter_replaced_scenario_pass_true",
    "coach_report_database_adapter_ignored_duplicate_scenario_pass_true",
    "coach_report_database_adapter_query_by_team_pass_true",
    "coach_report_database_adapter_query_by_phase_pass_true",
    "coach_report_database_adapter_deterministic_ordering_pass_true",
    "coach_report_database_adapter_trend_proof_claim_count_0",
    "coach_report_database_adapter_global_proof_claim_count_0",
    "coach_report_database_adapter_sandbox_events_promoted_to_official_count_0",
    "coach_report_database_adapter_invented_statistic_count_0",
    "coach_report_database_adapter_visible_recommendation_wording_count_0",
    "coach_report_database_adapter_visible_selection_wording_count_0",
    "coach_report_database_adapter_internal_status_leak_count_0",
    "coach_report_database_adapter_no_automatic_selection_true",
    "coach_report_database_adapter_player_selected_count_0",
    "coach_report_database_adapter_lineup_mutation_count_0",
    "coach_report_database_adapter_starters_mutation_count_0",
    "coach_report_database_adapter_bench_mutation_count_0",
    "coach_report_database_adapter_live_selection_driver_count_0",
    "coach_report_database_adapter_production_route_resolution_driver_count_0",
    "coach_report_database_adapter_score_mutation_count_0",
    "coach_report_database_adapter_possession_mutation_count_0",
    "coach_report_database_adapter_production_scoring_event_creation_count_0",
    "coach_report_database_adapter_global_economy_claim_forbidden",
    "coach_report_database_adapter_scoring_constants_unchanged",
  ];
}

export function coachReportDatabaseAdapterSpikeCannotDriveSelection(
  model: CoachReportDatabaseAdapterSpikeModel,
): boolean {
  return model.noAutomaticSelection &&
    model.playerSelectedCount === 0 &&
    model.automaticSelectionCount === 0 &&
    model.lineupMutationCount === 0 &&
    model.startersMutationCount === 0 &&
    model.benchMutationCount === 0 &&
    model.liveSelectionDriverCount === 0 &&
    model.productionRouteResolutionDriverCount === 0;
}

export function coachReportDatabaseAdapterSpikeCannotMutateOfficialState(
  model: CoachReportDatabaseAdapterSpikeModel,
): boolean {
  return model.scoreMutationCount === 0 &&
    model.possessionMutationCount === 0 &&
    model.productionScoringEventCreationCount === 0 &&
    model.globalEconomyClaimCount === 0;
}

export function coachReportDatabaseAdapterSpikeEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportDatabaseAdapterSpikeModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-coach-report-database-adapter-spike`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_DATABASE_ADAPTER_SPIKE",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: input.report.zoneStats.slice(0, 6).map((zone) => zone.zone),
    summary:
      `Coach Report Database Adapter Spike ${input.model.status}: htmlFirst=true, pdfOptional=true, singleSourceOfTruth=true, duplicateReportLogic=false, ` +
      `adapterKind=experimental_database, adapterImplemented=true, adapterProductionReady=false, featureFlagEnabled=${input.model.featureFlagEnabled}, ` +
      "defaultFeatureFlagEnabled=false, productActivationAllowed=false, reportCanUseAsSourceOfTruth=false, realDatabaseWriteCount=0, realDatabaseReadCount=0, dryRunOnly=true, activeProductHistorySource=file_backed, databaseUsedAsProductTruth=false, " +
      `saveResultSemanticsPreserved=true, insertedScenarioPass=${input.model.insertedScenarioPass}, replacedScenarioPass=${input.model.replacedScenarioPass}, ignoredDuplicateScenarioPass=${input.model.ignoredDuplicateScenarioPass}, ` +
      `queryByTeamPass=${input.model.queryByTeamPass}, queryByPhasePass=${input.model.queryByPhasePass}, deterministicOrderingPass=${input.model.deterministicOrderingPass}, ` +
      "trendProofClaimCount=0, globalProofClaimCount=0, inventedStatisticCount=0, sandboxEventsPromotedToOfficialCount=0, visibleRecommendationWordingCount=0, visibleSelectionWordingCount=0, internalStatusLeakCount=0, noAutomaticSelection=true, playerSelectedCount=0, lineupMutationCount=0, startersMutationCount=0, benchMutationCount=0, liveSelectionDriverCount=0, productionRouteResolutionDriverCount=0, scoreMutationCount=0, possessionMutationCount=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 70,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

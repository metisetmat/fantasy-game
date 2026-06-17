import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type {
  CoachReportMultiMatchPhaseComparisonModel,
  MultiMatchPhaseSignalSample,
} from "./coachReportMultiMatchPhaseComparison";

export type CoachReportMultiMatchHistoryViewStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type SampleSignalPresence =
  | "present"
  | "absent"
  | "unstable"
  | "insufficient_data";

export type TrendDrilldownStrength =
  | "local_repeated"
  | "local_visible_once"
  | "local_unstable"
  | "insufficient_data";

export interface MultiMatchHistorySample extends MultiMatchPhaseSignalSample {}

export interface MultiMatchSignalDrilldown {
  readonly signalId: string;
  readonly phase: "with_ball" | "without_ball" | "goalkeeper";
  readonly label: string;
  readonly primaryZone?: string;
  readonly sampleCount: number;
  readonly presentCount: number;
  readonly absentCount: number;
  readonly unstableCount: number;
  readonly insufficientDataCount: number;
  readonly zoneVariationCount: number;
  readonly strength: TrendDrilldownStrength;
  readonly samples: readonly MultiMatchHistorySample[];
  readonly coachReading: string;
  readonly whyStillCautious: string;
  readonly whatToVerifyNext: string;
}

export interface CoachReportMultiMatchHistoryViewModel {
  readonly status: CoachReportMultiMatchHistoryViewStatus;
  readonly origin: "coach_report_multi_match_phase_comparison";
  readonly htmlFirst: true;
  readonly pdfOptional: true;
  readonly singleSourceOfTruth: true;
  readonly duplicateReportLogic: false;
  readonly sampleCount: number;
  readonly drilldownCount: number;
  readonly historySampleRowCount: number;
  readonly localRepeatedDrilldownCount: number;
  readonly localVisibleOnceDrilldownCount: number;
  readonly localUnstableDrilldownCount: number;
  readonly insufficientDataDrilldownCount: number;
  readonly drilldowns: readonly MultiMatchSignalDrilldown[];
  readonly historyTableVisible: boolean;
  readonly drilldownVisible: boolean;
  readonly cautionCopyVisible: boolean;
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
  readonly mojibakeMarkerCount: number;
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

export function buildCoachReportMultiMatchHistoryViewTags(
  model: Omit<CoachReportMultiMatchHistoryViewModel, "tags">,
): readonly string[] {
  return [
    "coach_report_multi_match_history_view",
    `coach_report_multi_match_history_view_status_${model.status}`,
    "coach_report_multi_match_history_view_html_first_true",
    "coach_report_multi_match_history_view_pdf_optional_true",
    "coach_report_multi_match_history_view_single_source_of_truth_true",
    "coach_report_multi_match_history_view_duplicate_logic_false",
    "coach_report_multi_match_history_view_sample_count_present",
    "coach_report_multi_match_history_view_drilldown_count_present",
    "coach_report_multi_match_history_view_history_sample_row_count_present",
    "coach_report_multi_match_history_view_local_repeated_count_present",
    "coach_report_multi_match_history_view_visible_once_count_present",
    "coach_report_multi_match_history_view_unstable_count_present",
    "coach_report_multi_match_history_view_insufficient_count_present",
    "coach_report_multi_match_history_view_trend_proof_claim_count_0",
    "coach_report_multi_match_history_view_global_proof_claim_count_0",
    "coach_report_multi_match_history_view_sandbox_events_promoted_to_official_count_0",
    "coach_report_multi_match_history_view_invented_statistic_count_0",
    "coach_report_multi_match_history_view_product_export_score_matches_true",
    "coach_report_multi_match_history_view_candidate_comparison_matches_true",
    "coach_report_multi_match_history_view_visible_recommendation_wording_count_0",
    "coach_report_multi_match_history_view_visible_selection_wording_count_0",
    "coach_report_multi_match_history_view_internal_status_leak_count_0",
    "coach_report_multi_match_history_view_no_automatic_selection_true",
    "coach_report_multi_match_history_view_player_selected_count_0",
    "coach_report_multi_match_history_view_lineup_mutation_count_0",
    "coach_report_multi_match_history_view_starters_mutation_count_0",
    "coach_report_multi_match_history_view_bench_mutation_count_0",
    "coach_report_multi_match_history_view_live_selection_driver_count_0",
    "coach_report_multi_match_history_view_production_route_resolution_driver_count_0",
    "coach_report_multi_match_history_view_score_mutation_count_0",
    "coach_report_multi_match_history_view_possession_mutation_count_0",
    "coach_report_multi_match_history_view_production_scoring_event_creation_count_0",
    "coach_report_multi_match_history_view_global_economy_claim_forbidden",
    "coach_report_multi_match_history_view_scoring_constants_unchanged",
    countTag("coach_report_multi_match_history_view_mojibake_marker_count", model.mojibakeMarkerCount),
  ];
}

export function coachReportMultiMatchHistoryViewCannotMutateOfficialState(
  model: CoachReportMultiMatchHistoryViewModel,
): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function coachReportMultiMatchHistoryViewCannotDriveSelection(
  model: CoachReportMultiMatchHistoryViewModel,
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

export function coachReportMultiMatchHistoryViewEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportMultiMatchHistoryViewModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-coach-report-multi-match-history-view`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_MULTI_MATCH_HISTORY_VIEW",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: input.model.drilldowns
      .map((drilldown) => drilldown.primaryZone)
      .filter((zone): zone is string => zone !== undefined)
      .slice(0, 6),
    summary:
      `Coach Report Multi-Match History View ${input.model.status}: htmlFirst=true, pdfOptional=true, singleSourceOfTruth=true, duplicateReportLogic=false, ` +
      `sampleCount=${input.model.sampleCount}, drilldownCount=${input.model.drilldownCount}, historySampleRowCount=${input.model.historySampleRowCount}, ` +
      `localRepeatedDrilldownCount=${input.model.localRepeatedDrilldownCount}, localVisibleOnceDrilldownCount=${input.model.localVisibleOnceDrilldownCount}, localUnstableDrilldownCount=${input.model.localUnstableDrilldownCount}, insufficientDataDrilldownCount=${input.model.insufficientDataDrilldownCount}, ` +
      "trendProofClaimCount=0, globalProofClaimCount=0, inventedStatisticCount=0, sandboxEventsPromotedToOfficialCount=0, productExportScoreMatches=true, candidateComparisonMatches=true, interpretationGuardMatchesProduct=true, visibleRecommendationWordingCount=0, visibleSelectionWordingCount=0, internalStatusLeakCount=0, noAutomaticSelection=true, playerSelectedCount=0, lineupMutationCount=0, startersMutationCount=0, benchMutationCount=0, liveSelectionDriverCount=0, productionRouteResolutionDriverCount=0, scoreMutationCount=0, possessionMutationCount=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 65,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

export function coachReportMultiMatchHistoryViewLimitations(
  model: CoachReportMultiMatchHistoryViewModel,
): readonly string[] {
  if (model.status === "not_available") {
    return ["Coach Report Multi-Match History View is not available for this run."];
  }

  return [
    "Coach Report Multi-Match History View remains a local watchpoint layer built from the existing comparison model only.",
    "Multi-match history view cannot alter lineup, score, possession, timeline, scoring events, live selection, production route resolution, or batch economy proof.",
  ];
}

export function comparisonSupportsHistoryView(
  model: CoachReportMultiMatchPhaseComparisonModel,
): boolean {
  return model.status === "available" || model.status === "partial";
}

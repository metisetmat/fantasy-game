import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";

export type CoachReportMultiMatchPhaseComparisonStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type PhaseSignalStability =
  | "repeated"
  | "visible_once"
  | "unstable"
  | "insufficient_data";

export interface MultiMatchPhaseZoneSignal {
  readonly phase: "with_ball" | "without_ball" | "goalkeeper";
  readonly zone: string;
  readonly label: string;
  readonly occurrenceCount: number;
  readonly sampleCount: number;
  readonly stability: PhaseSignalStability;
  readonly source: "official_aggregates" | "product_report" | "controlled_sample";
  readonly explanation: string;
}

export interface MultiMatchPhaseComparisonPanel {
  readonly phase: "with_ball" | "without_ball" | "goalkeeper";
  readonly title: string;
  readonly sampleCount: number;
  readonly comparedSignalCount: number;
  readonly repeatedSignalCount: number;
  readonly visibleOnceSignalCount: number;
  readonly unstableSignalCount: number;
  readonly insufficientDataCount: number;
  readonly primaryRepeatedZone?: string;
  readonly zoneSignals: readonly MultiMatchPhaseZoneSignal[];
  readonly coachReading: string;
  readonly whatToVerifyNext: string;
}

export interface CoachReportMultiMatchPhaseComparisonModel {
  readonly status: CoachReportMultiMatchPhaseComparisonStatus;
  readonly origin: "coach_report_phase_visual_readability";
  readonly htmlFirst: true;
  readonly pdfOptional: true;
  readonly singleSourceOfTruth: true;
  readonly duplicateReportLogic: false;
  readonly sampleCount: number;
  readonly panelCount: number;
  readonly comparedSignalCount: number;
  readonly repeatedSignalCount: number;
  readonly visibleOnceSignalCount: number;
  readonly unstableSignalCount: number;
  readonly insufficientDataCount: number;
  readonly panels: readonly MultiMatchPhaseComparisonPanel[];
  readonly repeatedSignalLabelVisible: boolean;
  readonly visibleOnceLabelVisible: boolean;
  readonly unstableLabelVisible: boolean;
  readonly insufficientDataLabelVisible: boolean;
  readonly localComparisonOnly: true;
  readonly globalProofClaimCount: 0;
  readonly inventedStatisticCount: 0;
  readonly sandboxEventsPromotedToOfficialCount: 0;
  readonly productExportScoreMatches: boolean;
  readonly candidateComparisonMatchesProduct: boolean;
  readonly interpretationGuardMatchesProduct: boolean;
  readonly visibleRecommendationWordingCount: number;
  readonly visibleSelectionWordingCount: number;
  readonly internalStatusLeakCount: number;
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

function boolTag(prefix: string, value: boolean): string {
  return `${prefix}_${value ? "true" : "false"}`;
}

export function buildCoachReportMultiMatchPhaseComparisonTags(
  model: Omit<CoachReportMultiMatchPhaseComparisonModel, "tags">,
): readonly string[] {
  return [
    "coach_report_multi_match_phase_comparison",
    `coach_report_multi_match_phase_comparison_status_${model.status}`,
    "coach_report_multi_match_phase_comparison_html_first_true",
    "coach_report_multi_match_phase_comparison_pdf_optional_true",
    "coach_report_multi_match_phase_comparison_single_source_of_truth_true",
    "coach_report_multi_match_phase_comparison_duplicate_logic_false",
    "coach_report_multi_match_phase_comparison_sample_count_present",
    "coach_report_multi_match_phase_comparison_panel_count_present",
    "coach_report_multi_match_phase_comparison_compared_signal_count_present",
    "coach_report_multi_match_phase_comparison_repeated_signal_count_present",
    "coach_report_multi_match_phase_comparison_visible_once_signal_count_present",
    "coach_report_multi_match_phase_comparison_unstable_signal_count_present",
    "coach_report_multi_match_phase_comparison_insufficient_data_count_present",
    "coach_report_multi_match_phase_comparison_local_only_true",
    "coach_report_multi_match_phase_comparison_global_proof_claim_count_0",
    "coach_report_multi_match_phase_comparison_sandbox_events_promoted_to_official_count_0",
    "coach_report_multi_match_phase_comparison_invented_statistic_count_0",
    boolTag("coach_report_multi_match_phase_comparison_product_export_score_matches", model.productExportScoreMatches),
    boolTag("coach_report_multi_match_phase_comparison_candidate_comparison_matches", model.candidateComparisonMatchesProduct),
    countTag("coach_report_multi_match_phase_comparison_visible_recommendation_wording_count", model.visibleRecommendationWordingCount),
    countTag("coach_report_multi_match_phase_comparison_visible_selection_wording_count", model.visibleSelectionWordingCount),
    countTag("coach_report_multi_match_phase_comparison_internal_status_leak_count", model.internalStatusLeakCount),
    "coach_report_multi_match_phase_comparison_no_automatic_selection_true",
    "coach_report_multi_match_phase_comparison_player_selected_count_0",
    "coach_report_multi_match_phase_comparison_lineup_mutation_count_0",
    "coach_report_multi_match_phase_comparison_starters_mutation_count_0",
    "coach_report_multi_match_phase_comparison_bench_mutation_count_0",
    "coach_report_multi_match_phase_comparison_live_selection_driver_count_0",
    "coach_report_multi_match_phase_comparison_production_route_resolution_driver_count_0",
    "coach_report_multi_match_phase_comparison_score_mutation_count_0",
    "coach_report_multi_match_phase_comparison_possession_mutation_count_0",
    "coach_report_multi_match_phase_comparison_production_scoring_event_creation_count_0",
    "coach_report_multi_match_phase_comparison_global_economy_claim_forbidden",
    "coach_report_multi_match_phase_comparison_scoring_constants_unchanged",
  ];
}

export function coachReportMultiMatchPhaseComparisonCannotMutateOfficialState(
  model: CoachReportMultiMatchPhaseComparisonModel,
): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function coachReportMultiMatchPhaseComparisonCannotDriveSelection(
  model: CoachReportMultiMatchPhaseComparisonModel,
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

export function coachReportMultiMatchPhaseComparisonEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportMultiMatchPhaseComparisonModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-coach-report-multi-match-phase-comparison`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_MULTI_MATCH_PHASE_COMPARISON",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: input.model.panels.flatMap((panel) => panel.zoneSignals.map((signal) => signal.zone)).slice(0, 6),
    summary:
      `Coach Report Multi-Match Phase Comparison ${input.model.status}: htmlFirst=true, pdfOptional=true, singleSourceOfTruth=true, duplicateReportLogic=false, ` +
      `sampleCount=${input.model.sampleCount}, panelCount=${input.model.panelCount}, comparedSignalCount=${input.model.comparedSignalCount}, repeatedSignalCount=${input.model.repeatedSignalCount}, visibleOnceSignalCount=${input.model.visibleOnceSignalCount}, unstableSignalCount=${input.model.unstableSignalCount}, insufficientDataCount=${input.model.insufficientDataCount}, ` +
      `localComparisonOnly=true, inventedStatisticCount=0, sandboxEventsPromotedToOfficialCount=0, productExportScoreMatches=${String(input.model.productExportScoreMatches)}, candidateComparisonMatches=${String(input.model.candidateComparisonMatchesProduct)}, interpretationGuardMatchesProduct=${String(input.model.interpretationGuardMatchesProduct)}, ` +
      "visibleRecommendationWordingCount=0, visibleSelectionWordingCount=0, internalStatusLeakCount=0, noAutomaticSelection=true, playerSelectedCount=0, lineupMutationCount=0, startersMutationCount=0, benchMutationCount=0, liveSelectionDriverCount=0, productionRouteResolutionDriverCount=0, scoreMutationCount=0, possessionMutationCount=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 65,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

export function coachReportMultiMatchPhaseComparisonLimitations(
  model: CoachReportMultiMatchPhaseComparisonModel,
): readonly string[] {
  if (model.status === "not_available") {
    return ["Coach Report Multi-Match Phase Comparison is not available for this run."];
  }

  return [
    "Coach Report Multi-Match Phase Comparison stays local to the current controlled samples and never becomes global proof.",
    "Multi-match phase comparison cannot alter lineup, score, possession, timeline, scoring events, live selection, production route resolution, or batch economy proof.",
  ];
}

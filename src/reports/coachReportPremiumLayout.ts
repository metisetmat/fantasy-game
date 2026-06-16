import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";

export type CoachReportPremiumLayoutStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type CoachReportPremiumSectionKind =
  | "cover"
  | "executive_summary"
  | "match_story"
  | "key_statistics"
  | "with_ball"
  | "without_ball"
  | "goalkeeper"
  | "profiles_and_players"
  | "next_match"
  | "interpretation_guard"
  | "appendices";

export interface CoachReportPremiumSection {
  readonly kind: CoachReportPremiumSectionKind;
  readonly title: string;
  readonly subtitle?: string;
  readonly available: boolean;
  readonly source: "product_report" | "official_aggregates" | "controlled_empty_state";
  readonly cardCount: number;
  readonly visualBlockCount: number;
  readonly tableCount: number;
  readonly emptyStateUsed: boolean;
}

export interface CoachReportPremiumLayoutModel {
  readonly status: CoachReportPremiumLayoutStatus;
  readonly origin: "coach_report_export_snapshot";
  readonly exportHtmlPath: "reports/coach-report.export.html";
  readonly productHtmlPath: "reports/coach-report.product.html";
  readonly htmlFirst: true;
  readonly pdfOptional: true;
  readonly singleSourceOfTruth: true;
  readonly duplicateReportLogic: false;
  readonly sectionCount: number;
  readonly sections: readonly CoachReportPremiumSection[];
  readonly coverPresent: boolean;
  readonly executiveSummaryPresent: boolean;
  readonly matchStoryPresent: boolean;
  readonly keyStatisticsPresent: boolean;
  readonly withBallSectionPresent: boolean;
  readonly withoutBallSectionPresent: boolean;
  readonly goalkeeperSectionPresent: boolean;
  readonly profilesAndPlayersSectionPresent: boolean;
  readonly nextMatchSectionPresent: boolean;
  readonly interpretationGuardPresent: boolean;
  readonly appendicesPresent: boolean;
  readonly premiumHeaderPresent: boolean;
  readonly sectionDividerCount: number;
  readonly kpiCardCount: number;
  readonly pitchVisualPlaceholderCount: number;
  readonly controlledEmptyStateCount: number;
  readonly appendixCollapsedByDefault: boolean;
  readonly productExportScoreMatches: boolean;
  readonly productExportCandidateComparisonMatches: boolean;
  readonly interpretationGuardMatchesProduct: boolean;
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

function boolTag(prefix: string, value: boolean): string {
  return `${prefix}_${value ? "true" : "false"}`;
}

function countTag(prefix: string, value: number): string {
  return `${prefix}_${value}`;
}

export function buildCoachReportPremiumLayoutTags(
  model: Omit<CoachReportPremiumLayoutModel, "tags">,
): readonly string[] {
  return [
    "coach_report_premium_html_layout",
    `coach_report_premium_html_layout_status_${model.status}`,
    "coach_report_premium_html_first_true",
    "coach_report_premium_pdf_optional_true",
    "coach_report_premium_single_source_of_truth_true",
    "coach_report_premium_duplicate_logic_false",
    boolTag("coach_report_premium_cover_present", model.coverPresent),
    boolTag("coach_report_premium_executive_summary_present", model.executiveSummaryPresent),
    boolTag("coach_report_premium_key_statistics_present", model.keyStatisticsPresent),
    boolTag("coach_report_premium_with_ball_section_present", model.withBallSectionPresent),
    boolTag("coach_report_premium_without_ball_section_present", model.withoutBallSectionPresent),
    boolTag("coach_report_premium_goalkeeper_section_present", model.goalkeeperSectionPresent),
    boolTag("coach_report_premium_profiles_players_section_present", model.profilesAndPlayersSectionPresent),
    boolTag("coach_report_premium_next_match_section_present", model.nextMatchSectionPresent),
    boolTag("coach_report_premium_appendices_present", model.appendicesPresent),
    "coach_report_premium_kpi_card_count_present",
    "coach_report_premium_pitch_placeholder_count_present",
    "coach_report_premium_controlled_empty_state_count_present",
    boolTag("coach_report_premium_product_export_score_matches", model.productExportScoreMatches),
    boolTag("coach_report_premium_candidate_comparison_matches", model.productExportCandidateComparisonMatches),
    countTag("coach_report_premium_kpi_card_count", model.kpiCardCount),
    countTag("coach_report_premium_pitch_placeholder_count", model.pitchVisualPlaceholderCount),
    countTag("coach_report_premium_controlled_empty_state_count", model.controlledEmptyStateCount),
    countTag("coach_report_premium_visible_recommendation_wording_count", model.visibleRecommendationWordingCount),
    countTag("coach_report_premium_visible_selection_wording_count", model.visibleSelectionWordingCount),
    countTag("coach_report_premium_internal_status_leak_count", model.internalStatusLeakCount),
    "coach_report_premium_no_automatic_selection_true",
    countTag("coach_report_premium_player_selected_count", model.playerSelectedCount),
    countTag("coach_report_premium_lineup_mutation_count", model.lineupMutationCount),
    countTag("coach_report_premium_starters_mutation_count", model.startersMutationCount),
    countTag("coach_report_premium_bench_mutation_count", model.benchMutationCount),
    countTag("coach_report_premium_live_selection_driver_count", model.canDriveLiveSelection ? 1 : 0),
    countTag("coach_report_premium_production_route_resolution_driver_count", model.canDriveProductionRouteResolution ? 1 : 0),
    countTag("coach_report_premium_score_mutation_count", model.canMutateScore ? 1 : 0),
    countTag("coach_report_premium_possession_mutation_count", model.canMutatePossession ? 1 : 0),
    countTag("coach_report_premium_production_scoring_event_creation_count", model.canCreateScoringEvent ? 1 : 0),
    "coach_report_premium_global_economy_claim_forbidden",
    "coach_report_premium_scoring_constants_unchanged",
  ];
}

export function coachReportPremiumLayoutCannotMutateOfficialState(
  model: CoachReportPremiumLayoutModel,
): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function coachReportPremiumLayoutCannotDriveSelection(
  model: CoachReportPremiumLayoutModel,
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

export function coachReportPremiumLayoutEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportPremiumLayoutModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-coach-report-premium-html-layout`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_PREMIUM_HTML_LAYOUT",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: [],
    summary:
      `Coach Report Premium HTML Layout ${input.model.status}: htmlFirst=true, pdfOptional=true, ` +
      `singleSourceOfTruth=true, duplicateReportLogic=false, sectionCount=${input.model.sectionCount}, ` +
      `cover=${String(input.model.coverPresent)}, executiveSummary=${String(input.model.executiveSummaryPresent)}, ` +
      `keyStatistics=${String(input.model.keyStatisticsPresent)}, withBall=${String(input.model.withBallSectionPresent)}, ` +
      `withoutBall=${String(input.model.withoutBallSectionPresent)}, goalkeeper=${String(input.model.goalkeeperSectionPresent)}, ` +
      `profilesPlayers=${String(input.model.profilesAndPlayersSectionPresent)}, nextMatch=${String(input.model.nextMatchSectionPresent)}, ` +
      `appendices=${String(input.model.appendicesPresent)}, kpiCards=${input.model.kpiCardCount}, ` +
      `pitchPlaceholders=${input.model.pitchVisualPlaceholderCount}, controlledEmptyStates=${input.model.controlledEmptyStateCount}, ` +
      "recommendationCount=0, selectionCount=0, internalStatusLeakCount=0, playerSelectedCount=0, automaticSelectionCount=0, " +
      "lineupMutationCount=0, startersMutationCount=0, benchMutationCount=0, liveSelectionDriverCount=0, productionRouteResolutionDriverCount=0, " +
      "scoreMutationCount=0, possessionMutationCount=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 62,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

export function coachReportPremiumLayoutLimitations(
  model: CoachReportPremiumLayoutModel,
): readonly string[] {
  if (model.status === "not_available") {
    return ["Coach Report Premium HTML Layout is not available for this run."];
  }

  return [
    "Coach Report Premium HTML Layout is presentation-only and remains derived from coach-report.product.html.",
    "Premium layout polish cannot alter lineup, score, possession, timeline, scoring events, live selection, or route resolution.",
  ];
}

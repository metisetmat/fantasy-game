import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";

export type CoachReportPhaseVisualReadabilityStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type PhaseVisualLegendItemKind =
  | "danger"
  | "recovery"
  | "pressure_instability"
  | "goalkeeper"
  | "controlled_empty_state";

export interface PhaseVisualLegendItem {
  readonly kind: PhaseVisualLegendItemKind;
  readonly label: string;
  readonly explanation: string;
  readonly cssClass: string;
}

export interface PhaseVisualZoneHierarchy {
  readonly phase: "with_ball" | "without_ball" | "goalkeeper";
  readonly primaryZone?: string;
  readonly primaryZoneLabel?: string;
  readonly primaryZoneValue?: number;
  readonly secondaryZones: readonly string[];
  readonly hierarchyExplanation: string;
  readonly controlledEmptyStateUsed: boolean;
}

export interface PhaseVisualCoachCopyBlock {
  readonly phase: "with_ball" | "without_ball" | "goalkeeper";
  readonly whatItShows: string;
  readonly whyItMatters: string;
  readonly whatToVerifyNext: string;
  readonly limitation: string;
}

export interface CoachReportPhaseVisualReadabilityModel {
  readonly status: CoachReportPhaseVisualReadabilityStatus;
  readonly origin: "coach_report_phase_visuals";
  readonly htmlFirst: true;
  readonly pdfOptional: true;
  readonly singleSourceOfTruth: true;
  readonly duplicateReportLogic: false;
  readonly legendItemCount: number;
  readonly legendItems: readonly PhaseVisualLegendItem[];
  readonly panelCount: number;
  readonly readablePanelCount: number;
  readonly panelsWithPrimaryZoneCount: number;
  readonly panelsWithSecondaryZonesCount: number;
  readonly controlledEmptyStateCount: number;
  readonly zoneHierarchies: readonly PhaseVisualZoneHierarchy[];
  readonly coachCopyBlocks: readonly PhaseVisualCoachCopyBlock[];
  readonly phaseSpecificGuardVisible: true;
  readonly legendVisible: true;
  readonly primaryZoneVisualEmphasisPresent: true;
  readonly secondaryZoneVisualEmphasisPresent: true;
  readonly controlledEmptyStateReadable: true;
  readonly productExportScoreMatches: boolean;
  readonly productExportCandidateComparisonMatches: boolean;
  readonly interpretationGuardMatchesProduct: boolean;
  readonly sandboxEventsPromotedToOfficialCount: 0;
  readonly inventedStatisticCount: 0;
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

export const COACH_REPORT_PHASE_VISUAL_READABILITY_GUARD =
  "La couleur et l'intensit&eacute; des zones servent &agrave; lire le signal disponible, pas &agrave; recommander une composition ou une consigne automatique.";

function countTag(prefix: string, value: number): string {
  return `${prefix}_${value}`;
}

function boolTag(prefix: string, value: boolean): string {
  return `${prefix}_${value ? "true" : "false"}`;
}

export function buildCoachReportPhaseVisualReadabilityTags(
  model: Omit<CoachReportPhaseVisualReadabilityModel, "tags">,
): readonly string[] {
  return [
    "coach_report_phase_visual_readability",
    `coach_report_phase_visual_readability_status_${model.status}`,
    "coach_report_phase_visual_readability_html_first_true",
    "coach_report_phase_visual_readability_pdf_optional_true",
    "coach_report_phase_visual_readability_single_source_of_truth_true",
    "coach_report_phase_visual_readability_duplicate_logic_false",
    "coach_report_phase_visual_readability_legend_visible_true",
    "coach_report_phase_visual_readability_legend_item_count_5",
    "coach_report_phase_visual_readability_panel_count_present",
    "coach_report_phase_visual_readability_readable_panel_count_present",
    "coach_report_phase_visual_readability_primary_zone_emphasis_present_true",
    "coach_report_phase_visual_readability_secondary_zone_emphasis_present_true",
    "coach_report_phase_visual_readability_controlled_empty_state_count_present",
    "coach_report_phase_visual_readability_sandbox_events_promoted_to_official_count_0",
    "coach_report_phase_visual_readability_invented_statistic_count_0",
    boolTag("coach_report_phase_visual_readability_product_export_score_matches", model.productExportScoreMatches),
    boolTag("coach_report_phase_visual_readability_candidate_comparison_matches", model.productExportCandidateComparisonMatches),
    countTag("coach_report_phase_visual_readability_visible_recommendation_wording_count", model.visibleRecommendationWordingCount),
    countTag("coach_report_phase_visual_readability_visible_selection_wording_count", model.visibleSelectionWordingCount),
    countTag("coach_report_phase_visual_readability_internal_status_leak_count", model.internalStatusLeakCount),
    "coach_report_phase_visual_readability_no_automatic_selection_true",
    "coach_report_phase_visual_readability_player_selected_count_0",
    "coach_report_phase_visual_readability_lineup_mutation_count_0",
    "coach_report_phase_visual_readability_starters_mutation_count_0",
    "coach_report_phase_visual_readability_bench_mutation_count_0",
    "coach_report_phase_visual_readability_live_selection_driver_count_0",
    "coach_report_phase_visual_readability_production_route_resolution_driver_count_0",
    "coach_report_phase_visual_readability_score_mutation_count_0",
    "coach_report_phase_visual_readability_possession_mutation_count_0",
    "coach_report_phase_visual_readability_production_scoring_event_creation_count_0",
    "coach_report_phase_visual_readability_global_economy_claim_forbidden",
    "coach_report_phase_visual_readability_scoring_constants_unchanged",
  ];
}

export function coachReportPhaseVisualReadabilityCannotMutateOfficialState(
  model: CoachReportPhaseVisualReadabilityModel,
): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function coachReportPhaseVisualReadabilityCannotDriveSelection(
  model: CoachReportPhaseVisualReadabilityModel,
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

export function coachReportPhaseVisualReadabilityEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportPhaseVisualReadabilityModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-coach-report-phase-visual-readability`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_PHASE_VISUAL_READABILITY",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: input.model.zoneHierarchies.flatMap((hierarchy) =>
      hierarchy.primaryZone === undefined ? hierarchy.secondaryZones : [hierarchy.primaryZone, ...hierarchy.secondaryZones]
    ).slice(0, 6),
    summary:
      `Coach Report Phase Visual Readability ${input.model.status}: htmlFirst=true, pdfOptional=true, singleSourceOfTruth=true, duplicateReportLogic=false, ` +
      `legendItemCount=${input.model.legendItemCount}, panelCount=${input.model.panelCount}, readablePanelCount=${input.model.readablePanelCount}, panelsWithPrimaryZoneCount=${input.model.panelsWithPrimaryZoneCount}, panelsWithSecondaryZonesCount=${input.model.panelsWithSecondaryZonesCount}, controlledEmptyStateCount=${input.model.controlledEmptyStateCount}, ` +
      `phaseSpecificGuardVisible=true, legendVisible=true, inventedStatisticCount=0, sandboxEventsPromotedToOfficialCount=0, productExportScoreMatches=${String(input.model.productExportScoreMatches)}, candidateComparisonMatches=${String(input.model.productExportCandidateComparisonMatches)}, ` +
      "visibleRecommendationWordingCount=0, visibleSelectionWordingCount=0, internalStatusLeakCount=0, noAutomaticSelection=true, playerSelectedCount=0, lineupMutationCount=0, startersMutationCount=0, benchMutationCount=0, liveSelectionDriverCount=0, productionRouteResolutionDriverCount=0, scoreMutationCount=0, possessionMutationCount=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 64,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

export function coachReportPhaseVisualReadabilityLimitations(
  model: CoachReportPhaseVisualReadabilityModel,
): readonly string[] {
  if (model.status === "not_available") {
    return ["Coach Report Phase Visual Readability is not available for this run."];
  }

  return [
    "Coach Report Phase Visual Readability stays presentation-only and remains derived from the existing phase visuals plus the generated export copy.",
    "Readability changes cannot alter lineup, score, possession, timeline, scoring events, live selection, production route resolution, or global economy proof.",
  ];
}

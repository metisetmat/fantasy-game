import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type { MatchTraceAggregateModel } from "../simulation/tracing/matchTraceAggregateTypes";
import type { CoachReportPremiumLayoutModel } from "./coachReportPremiumLayout";

export type CoachReportPhaseVisualsStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type CoachReportPhaseKind =
  | "with_ball"
  | "without_ball"
  | "goalkeeper";

export type TacticalPitchSignalKind =
  | "danger_zone"
  | "recovery_zone"
  | "pressure_instability_zone"
  | "progression_zone"
  | "goalkeeper_response_zone"
  | "controlled_empty_state";

export interface TacticalPitchZoneSignal {
  readonly zone: string;
  readonly label: string;
  readonly value: number;
  readonly kind: TacticalPitchSignalKind;
  readonly source: "official_aggregates" | "product_report" | "controlled_empty_state";
  readonly confidence: "low" | "medium" | "high";
  readonly explanation: string;
}

export interface TacticalPitchPanelModel {
  readonly phase: CoachReportPhaseKind;
  readonly title: string;
  readonly subtitle: string;
  readonly coachReading: string;
  readonly nextMatchCheck: string;
  readonly available: boolean;
  readonly source: "official_aggregates" | "product_report" | "controlled_empty_state";
  readonly zoneSignals: readonly TacticalPitchZoneSignal[];
  readonly primarySignal?: TacticalPitchZoneSignal;
  readonly secondarySignals: readonly TacticalPitchZoneSignal[];
  readonly pitchSvgAvailable: boolean;
  readonly controlledEmptyStateUsed: boolean;
  readonly emptyStateReason?: string;
  readonly visualTruthOnly: true;
  readonly sandboxEventsPromotedToOfficial: false;
  readonly inventedStatisticCount: 0;
}

export interface CoachReportPhaseVisualsModel {
  readonly status: CoachReportPhaseVisualsStatus;
  readonly origin: "coach_report_premium_html_layout";
  readonly htmlFirst: true;
  readonly pdfOptional: true;
  readonly singleSourceOfTruth: true;
  readonly duplicateReportLogic: false;
  readonly panelCount: number;
  readonly withBallPanelAvailable: boolean;
  readonly withoutBallPanelAvailable: boolean;
  readonly goalkeeperPanelAvailable: boolean;
  readonly pitchSvgCount: number;
  readonly zoneSignalCount: number;
  readonly controlledEmptyStateCount: number;
  readonly panels: readonly TacticalPitchPanelModel[];
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

export interface CoachReportPhaseVisualSeedPanel {
  readonly phase: CoachReportPhaseKind;
  readonly source: "official_aggregates" | "controlled_empty_state";
  readonly signals: readonly TacticalPitchZoneSignal[];
  readonly emptyStateReason?: string;
}

export interface CoachReportPhaseVisualSeed {
  readonly withBall: CoachReportPhaseVisualSeedPanel;
  readonly withoutBall: CoachReportPhaseVisualSeedPanel;
  readonly goalkeeper: CoachReportPhaseVisualSeedPanel;
}

export const COACH_REPORT_PHASE_VISUALS_SCRIPT_ID = "coach-report-phase-visuals-data";
export const COACH_REPORT_PHASE_VISUALS_GUARD =
  "Les cartes terrain affichent uniquement les signaux stabilis&eacute;s disponibles dans ce run. Une absence de carte ne signifie pas une absence de ph&eacute;nom&egrave;ne, mais une donn&eacute;e insuffisante pour l'afficher proprement.";
export const COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE =
  "Donn&eacute;es insuffisantes dans ce run pour stabiliser cette lecture.";

function countTag(prefix: string, value: number): string {
  return `${prefix}_${value}`;
}

function boolTag(prefix: string, value: boolean): string {
  return `${prefix}_${value ? "true" : "false"}`;
}

function zoneConfidence(value: number): "low" | "medium" | "high" {
  if (value >= 5) {
    return "high";
  }
  if (value >= 2) {
    return "medium";
  }

  return "low";
}

function normalizeZoneSignal(input: {
  readonly zone: string;
  readonly value: number;
  readonly kind: TacticalPitchSignalKind;
  readonly label: string;
  readonly explanation: string;
}): TacticalPitchZoneSignal {
  return {
    zone: input.zone,
    label: input.label,
    value: input.value,
    kind: input.kind,
    source: "official_aggregates",
    confidence: zoneConfidence(input.value),
    explanation: input.explanation,
  };
}

function topZoneEntries(
  bucket: Readonly<Record<string, number>>,
  limit: number,
): readonly { readonly zone: string; readonly value: number }[] {
  return Object.entries(bucket)
    .filter((entry) => entry[0].length > 0 && entry[1] > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr-FR"))
    .slice(0, limit)
    .map(([zone, value]) => ({ zone, value }));
}

function mergeSignals(
  primary: readonly TacticalPitchZoneSignal[],
  secondary: readonly TacticalPitchZoneSignal[],
  limit: number,
): readonly TacticalPitchZoneSignal[] {
  const merged = new Map<string, TacticalPitchZoneSignal>();

  for (const signal of [...primary, ...secondary]) {
    if (!merged.has(signal.zone)) {
      merged.set(signal.zone, signal);
    }
  }

  return [...merged.values()].slice(0, limit);
}

function phaseSeedPanel(input: {
  readonly phase: CoachReportPhaseKind;
  readonly signals: readonly TacticalPitchZoneSignal[];
  readonly emptyStateReason: string;
}): CoachReportPhaseVisualSeedPanel {
  if (input.signals.length === 0) {
    return {
      phase: input.phase,
      source: "controlled_empty_state",
      signals: [],
      emptyStateReason: input.emptyStateReason,
    };
  }

  return {
    phase: input.phase,
    source: "official_aggregates",
    signals: input.signals,
  };
}

export function buildCoachReportPhaseVisualSeedFromAggregate(input: {
  readonly aggregate: MatchTraceAggregateModel;
}): CoachReportPhaseVisualSeed {
  const withBallDangerSignals = topZoneEntries(input.aggregate.official.dangerByZone, 2).map((entry) =>
    normalizeZoneSignal({
      zone: entry.zone,
      value: entry.value,
      kind: "danger_zone",
      label: "Danger officiel",
      explanation: `${entry.zone} concentre une part visible du danger officiel dans les agr&eacute;gats du run.`,
    })
  );
  const withBallProgressionSignals = topZoneEntries(input.aggregate.official.shotCreatedByZone, 2).map((entry) =>
    normalizeZoneSignal({
      zone: entry.zone,
      value: entry.value,
      kind: "progression_zone",
      label: "Progression vers la finition",
      explanation: `${entry.zone} soutient une progression ou une pr&eacute;paration de tir visible dans les agr&eacute;gats officiels.`,
    })
  );
  const withoutBallRecoverySignals = topZoneEntries(input.aggregate.official.recoveryByZone, 2).map((entry) =>
    normalizeZoneSignal({
      zone: entry.zone,
      value: entry.value,
      kind: "recovery_zone",
      label: "R&eacute;cup&eacute;ration utile",
      explanation: `${entry.zone} ressort comme zone de r&eacute;cup&eacute;ration officielle dans ce run.`,
    })
  );
  const withoutBallPressureSignals = topZoneEntries(input.aggregate.official.pressureLossByZone, 2).map((entry) =>
    normalizeZoneSignal({
      zone: entry.zone,
      value: entry.value,
      kind: "pressure_instability_zone",
      label: "Pression / instabilit&eacute;",
      explanation: `${entry.zone} porte un signal officiel de pression ou d'instabilit&eacute; &agrave; surveiller.`,
    })
  );
  const goalkeeperSignals = topZoneEntries(input.aggregate.official.goalkeeperActionByZone, 2).map((entry) =>
    normalizeZoneSignal({
      zone: entry.zone,
      value: entry.value,
      kind: "goalkeeper_response_zone",
      label: "R&eacute;ponse gardien / dernier rempart",
      explanation: `${entry.zone} montre une implication visible du dernier rempart dans les agr&eacute;gats officiels.`,
    })
  );

  return {
    withBall: phaseSeedPanel({
      phase: "with_ball",
      signals: mergeSignals(withBallDangerSignals, withBallProgressionSignals, 3),
      emptyStateReason: COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE,
    }),
    withoutBall: phaseSeedPanel({
      phase: "without_ball",
      signals: mergeSignals(withoutBallRecoverySignals, withoutBallPressureSignals, 3),
      emptyStateReason: COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE,
    }),
    goalkeeper: phaseSeedPanel({
      phase: "goalkeeper",
      signals: goalkeeperSignals.slice(0, 3),
      emptyStateReason: "Ce run ne contient pas encore assez de donn&eacute;es officielles stabilis&eacute;es pour cartographier pr&eacute;cis&eacute;ment le dernier rempart.",
    }),
  };
}

export function buildCoachReportPhaseVisualSeedFromMatchReport(input: {
  readonly report: MatchReport;
}): CoachReportPhaseVisualSeed {
  const zoneStats = [...input.report.zoneStats];
  const topProgressions = zoneStats
    .filter((stats) => stats.successfulProgressions > 0 || stats.scoringEvents !== undefined && stats.scoringEvents > 0)
    .sort((a, b) =>
      (b.scoringEvents ?? 0) - (a.scoringEvents ?? 0) ||
      b.successfulProgressions - a.successfulProgressions ||
      b.entries - a.entries
    )
    .slice(0, 3)
    .map((stats) =>
      normalizeZoneSignal({
        zone: stats.zone,
        value: (stats.scoringEvents ?? 0) > 0 ? (stats.scoringEvents ?? 0) : stats.successfulProgressions,
        kind: (stats.scoringEvents ?? 0) > 0 ? "danger_zone" : "progression_zone",
        label: (stats.scoringEvents ?? 0) > 0 ? "Danger officiel" : "Progression utile",
        explanation: `${stats.zone} ressort dans les statistiques officielles du run par ses progressions ou ses situations de danger.`,
      })
    );
  const topRecoveries = zoneStats
    .filter((stats) => stats.defensiveStops > 0 || stats.pressureEvents !== undefined && stats.pressureEvents > 0)
    .sort((a, b) =>
      b.defensiveStops - a.defensiveStops ||
      (b.pressureEvents ?? 0) - (a.pressureEvents ?? 0) ||
      a.zone.localeCompare(b.zone, "fr-FR")
    )
    .slice(0, 3)
    .map((stats) =>
      normalizeZoneSignal({
        zone: stats.zone,
        value: stats.defensiveStops > 0 ? stats.defensiveStops : (stats.pressureEvents ?? 0),
        kind: stats.defensiveStops > 0 ? "recovery_zone" : "pressure_instability_zone",
        label: stats.defensiveStops > 0 ? "R&eacute;cup&eacute;ration utile" : "Pression / instabilit&eacute;",
        explanation: `${stats.zone} ressort dans les statistiques officielles par ses arr&ecirc;ts d&eacute;fensifs ou sa pression.`,
      })
    );

  return {
    withBall: phaseSeedPanel({
      phase: "with_ball",
      signals: topProgressions,
      emptyStateReason: COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE,
    }),
    withoutBall: phaseSeedPanel({
      phase: "without_ball",
      signals: topRecoveries,
      emptyStateReason: COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE,
    }),
    goalkeeper: phaseSeedPanel({
      phase: "goalkeeper",
      signals: [],
      emptyStateReason: "Ce run ne contient pas encore assez de donn&eacute;es officielles stabilis&eacute;es pour cartographier pr&eacute;cis&eacute;ment le dernier rempart.",
    }),
  };
}

export function serializeCoachReportPhaseVisualSeed(seed: CoachReportPhaseVisualSeed): string {
  return JSON.stringify(seed).replace(/</gu, "\\u003c");
}

function isSignalKind(value: string): value is TacticalPitchSignalKind {
  return value === "danger_zone" ||
    value === "recovery_zone" ||
    value === "pressure_instability_zone" ||
    value === "progression_zone" ||
    value === "goalkeeper_response_zone" ||
    value === "controlled_empty_state";
}

function isPhase(value: string): value is CoachReportPhaseKind {
  return value === "with_ball" || value === "without_ball" || value === "goalkeeper";
}

function sanitizeSignal(value: unknown): TacticalPitchZoneSignal | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Partial<TacticalPitchZoneSignal>;

  if (typeof candidate.zone !== "string" ||
    typeof candidate.label !== "string" ||
    typeof candidate.value !== "number" ||
    typeof candidate.kind !== "string" ||
    !isSignalKind(candidate.kind) ||
    typeof candidate.explanation !== "string") {
    return null;
  }

  return {
    zone: candidate.zone,
    label: candidate.label,
    value: candidate.value,
    kind: candidate.kind,
    source: candidate.source === "product_report" || candidate.source === "controlled_empty_state"
      ? candidate.source
      : "official_aggregates",
    confidence: candidate.confidence === "high" || candidate.confidence === "medium" ? candidate.confidence : "low",
    explanation: candidate.explanation,
  };
}

function sanitizePanel(value: unknown, phase: CoachReportPhaseKind): CoachReportPhaseVisualSeedPanel {
  if (typeof value !== "object" || value === null) {
    return {
      phase,
      source: "controlled_empty_state",
      signals: [],
      emptyStateReason: COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE,
    };
  }

  const candidate = value as Partial<CoachReportPhaseVisualSeedPanel>;
  const source = candidate.source === "official_aggregates" ? "official_aggregates" : "controlled_empty_state";
  const signals = Array.isArray(candidate.signals)
    ? candidate.signals.map(sanitizeSignal).filter((signal): signal is TacticalPitchZoneSignal => signal !== null)
    : [];

  return {
    phase: typeof candidate.phase === "string" && isPhase(candidate.phase) ? candidate.phase : phase,
    source: signals.length === 0 ? "controlled_empty_state" : source,
    signals,
    ...(typeof candidate.emptyStateReason === "string" ? { emptyStateReason: candidate.emptyStateReason } : {}),
  };
}

export function extractCoachReportPhaseVisualSeed(productReportHtml: string): CoachReportPhaseVisualSeed | null {
  const matcher = new RegExp(
    `<script type="application/json" id="${COACH_REPORT_PHASE_VISUALS_SCRIPT_ID}">([\\s\\S]*?)<\\/script>`,
    "u",
  );
  const match = productReportHtml.match(matcher);

  if (match?.[1] === undefined) {
    return null;
  }

  try {
    const parsed = JSON.parse(match[1]) as Partial<CoachReportPhaseVisualSeed>;

    return {
      withBall: sanitizePanel(parsed.withBall, "with_ball"),
      withoutBall: sanitizePanel(parsed.withoutBall, "without_ball"),
      goalkeeper: sanitizePanel(parsed.goalkeeper, "goalkeeper"),
    };
  } catch {
    return null;
  }
}

export function buildCoachReportPhaseVisualsTags(
  model: Omit<CoachReportPhaseVisualsModel, "tags">,
): readonly string[] {
  return [
    "coach_report_phase_visuals",
    `coach_report_phase_visuals_status_${model.status}`,
    "coach_report_phase_visuals_html_first_true",
    "coach_report_phase_visuals_pdf_optional_true",
    "coach_report_phase_visuals_single_source_of_truth_true",
    "coach_report_phase_visuals_duplicate_logic_false",
    "coach_report_phase_visuals_panel_count_present",
    "coach_report_phase_visuals_pitch_svg_count_present",
    "coach_report_phase_visuals_zone_signal_count_present",
    "coach_report_phase_visuals_controlled_empty_state_count_present",
    boolTag("coach_report_phase_visuals_with_ball_panel_available", model.withBallPanelAvailable),
    boolTag("coach_report_phase_visuals_without_ball_panel_available", model.withoutBallPanelAvailable),
    boolTag("coach_report_phase_visuals_goalkeeper_panel_available", model.goalkeeperPanelAvailable),
    "coach_report_phase_visuals_sandbox_events_promoted_to_official_count_0",
    "coach_report_phase_visuals_invented_statistic_count_0",
    boolTag("coach_report_phase_visuals_product_export_score_matches", model.productExportScoreMatches),
    boolTag("coach_report_phase_visuals_candidate_comparison_matches", model.productExportCandidateComparisonMatches),
    countTag("coach_report_phase_visuals_visible_recommendation_wording_count", model.visibleRecommendationWordingCount),
    countTag("coach_report_phase_visuals_visible_selection_wording_count", model.visibleSelectionWordingCount),
    countTag("coach_report_phase_visuals_internal_status_leak_count", model.internalStatusLeakCount),
    "coach_report_phase_visuals_no_automatic_selection_true",
    "coach_report_phase_visuals_player_selected_count_0",
    "coach_report_phase_visuals_lineup_mutation_count_0",
    "coach_report_phase_visuals_starters_mutation_count_0",
    "coach_report_phase_visuals_bench_mutation_count_0",
    "coach_report_phase_visuals_live_selection_driver_count_0",
    "coach_report_phase_visuals_production_route_resolution_driver_count_0",
    "coach_report_phase_visuals_score_mutation_count_0",
    "coach_report_phase_visuals_possession_mutation_count_0",
    "coach_report_phase_visuals_production_scoring_event_creation_count_0",
    "coach_report_phase_visuals_global_economy_claim_forbidden",
    "coach_report_phase_visuals_scoring_constants_unchanged",
  ];
}

export function coachReportPhaseVisualsCannotMutateOfficialState(
  model: CoachReportPhaseVisualsModel,
): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function coachReportPhaseVisualsCannotDriveSelection(
  model: CoachReportPhaseVisualsModel,
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

export function coachReportPhaseVisualsEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachReportPhaseVisualsModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-coach-report-phase-visuals`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_REPORT_PHASE_VISUALS",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: input.model.panels.flatMap((panel) => panel.zoneSignals.map((signal) => signal.zone)).slice(0, 6),
    summary:
      `Coach Report Phase Visuals ${input.model.status}: htmlFirst=true, pdfOptional=true, singleSourceOfTruth=true, duplicateReportLogic=false, ` +
      `panelCount=${input.model.panelCount}, pitchSvgCount=${input.model.pitchSvgCount}, zoneSignalCount=${input.model.zoneSignalCount}, controlledEmptyStateCount=${input.model.controlledEmptyStateCount}, ` +
      `withBallPanelAvailable=${String(input.model.withBallPanelAvailable)}, withoutBallPanelAvailable=${String(input.model.withoutBallPanelAvailable)}, goalkeeperPanelAvailable=${String(input.model.goalkeeperPanelAvailable)}, ` +
      `sandboxEventsPromotedToOfficialCount=0, inventedStatisticCount=0, productExportScoreMatches=${String(input.model.productExportScoreMatches)}, candidateComparisonMatches=${String(input.model.productExportCandidateComparisonMatches)}, ` +
      "visibleRecommendationWordingCount=0, visibleSelectionWordingCount=0, internalStatusLeakCount=0, noAutomaticSelection=true, playerSelectedCount=0, lineupMutationCount=0, startersMutationCount=0, benchMutationCount=0, liveSelectionDriverCount=0, productionRouteResolutionDriverCount=0, scoreMutationCount=0, possessionMutationCount=0, productionScoringEventCreationCount=0, globalEconomyClaimCount=0, scoringConstantsUnchanged=true.",
    confidence: "medium",
    strength: 63,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

export function coachReportPhaseVisualsLimitations(
  model: CoachReportPhaseVisualsModel,
): readonly string[] {
  if (model.status === "not_available") {
    return ["Coach Report Phase Visuals are not available for this run."];
  }

  return [
    "Coach Report Phase Visuals stay presentation-only and remain derived from the product report plus official aggregates already stabilized in the run.",
    "Phase visuals cannot alter lineup, score, possession, timeline, scoring events, live selection, production route resolution, or global economy proof.",
  ];
}

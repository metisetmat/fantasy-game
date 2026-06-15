import type { MatchReportEvidenceFact } from "../../contracts/matchReportEvidence";
import type { MatchInput } from "../../contracts/engineToCoach";
import type {
  SelectionPreviewCard,
  SelectionPreviewModel,
  SelectionPreviewTraceBackingStatus,
} from "./selectionPreviewFromCoachTestPlan";

export type SelectionPreviewTraceSupportStrength =
  | "none"
  | "weak"
  | "medium"
  | "strong";

export type SelectionPreviewTraceSupportReason =
  | "danger_zone_support"
  | "recovery_zone_support"
  | "pressure_signal_support"
  | "player_involvement_support"
  | "cause_tag_support"
  | "impact_tag_support"
  | "fatigue_signal_support"
  | "goalkeeper_signal_support"
  | "second_ball_signal_support";

export interface SelectionPreviewTraceSupport {
  readonly previewId: SelectionPreviewCard["previewId"];
  readonly linkedCoachTestId: string;
  readonly previousBackingStatus: SelectionPreviewTraceBackingStatus;
  readonly newBackingStatus: SelectionPreviewTraceBackingStatus;
  readonly supportStrength: SelectionPreviewTraceSupportStrength;
  readonly supportReasons: readonly SelectionPreviewTraceSupportReason[];
  readonly officialAggregateTraceCount: number;
  readonly matchedDangerZones: readonly string[];
  readonly matchedRecoveryZones: readonly string[];
  readonly matchedCauseLabels: readonly string[];
  readonly matchedImpactLabels: readonly string[];
  readonly matchedPlayerIds: readonly string[];
  readonly traceSupported: boolean;
  readonly officiallyConfirmed: false;
  readonly previewStillNonApplied: true;
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
  readonly confidenceUpgradeAllowed: false;
  readonly warnings: readonly string[];
}

export interface SelectionPreviewTraceBackingModel {
  readonly status: "not_available" | "available" | "partial" | "failed";
  readonly origin: "selection_preview_from_coach_test_plan_and_trace_aggregates";
  readonly previewCount: number;
  readonly sandboxOnlyCount: number;
  readonly traceSupportedCount: number;
  readonly officiallyConfirmedCount: 0;
  readonly supports: readonly SelectionPreviewTraceSupport[];
  readonly selectionPreviewStillNonApplied: true;
  readonly selectionPreviewStillSandboxAware: true;
  readonly selectionPreviewConfidenceUpgraded: false;
  readonly diagnosticAggregatesKeptSeparate: true;
  readonly sandboxAggregatesKeptSeparate: true;
  readonly officialAggregatesUsedAsSupportOnly: true;
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

function joinTagValues(values: readonly string[]): string {
  return values.length === 0 ? "none" : values.join("|").replaceAll(" ", "_");
}

function statusFromSupports(supports: readonly SelectionPreviewTraceSupport[]): SelectionPreviewTraceBackingModel["status"] {
  if (supports.length === 0) {
    return "not_available";
  }

  return supports.length === 3 ? "available" : "partial";
}

function tagsForSupport(support: SelectionPreviewTraceSupport): readonly string[] {
  const prefix = `selection_preview_trace_backing_${support.previewId}`;

  return [
    `${prefix}_status_${support.newBackingStatus}`,
    `${prefix}_strength_${support.supportStrength}`,
    `${prefix}_reasons_${joinTagValues(support.supportReasons)}`,
    `${prefix}_danger_zones_${joinTagValues(support.matchedDangerZones)}`,
    `${prefix}_recovery_zones_${joinTagValues(support.matchedRecoveryZones)}`,
    `${prefix}_cause_labels_${joinTagValues(support.matchedCauseLabels)}`,
    `${prefix}_impact_labels_${joinTagValues(support.matchedImpactLabels)}`,
    `${prefix}_player_ids_${joinTagValues(support.matchedPlayerIds)}`,
    `${prefix}_official_trace_count_${support.officialAggregateTraceCount}`,
  ];
}

function buildTags(model: Omit<SelectionPreviewTraceBackingModel, "tags">): readonly string[] {
  return [
    "selection_preview_trace_backing",
    `selection_preview_trace_backing_status_${model.status}`,
    `selection_preview_trace_backing_preview_count_${model.previewCount}`,
    `selection_preview_trace_backing_trace_supported_count_${model.traceSupportedCount}`,
    `selection_preview_trace_backing_sandbox_only_count_${model.sandboxOnlyCount}`,
    "selection_preview_trace_backing_officially_confirmed_count_0",
    "selection_preview_trace_backing_confidence_not_upgraded",
    "selection_preview_trace_backing_preview_non_applied",
    "selection_preview_trace_backing_official_aggregates_support_only",
    "selection_preview_trace_backing_diagnostic_kept_separate",
    "selection_preview_trace_backing_sandbox_kept_separate",
    "selection_preview_trace_backing_can_change_lineup_false",
    "selection_preview_trace_backing_can_drive_live_selection_false",
    "selection_preview_trace_backing_can_drive_production_route_resolution_false",
    "selection_preview_trace_backing_score_mutation_count_0",
    "selection_preview_trace_backing_possession_mutation_count_0",
    "selection_preview_trace_backing_production_scoring_event_creation_count_0",
    "selection_preview_trace_backing_global_economy_claim_forbidden",
    ...model.supports.flatMap(tagsForSupport),
  ];
}

export function buildSelectionPreviewTraceBackingModel(input: {
  readonly preview: SelectionPreviewModel;
  readonly supports: readonly SelectionPreviewTraceSupport[];
  readonly warnings?: readonly string[];
}): SelectionPreviewTraceBackingModel {
  const traceSupportedCount = input.supports.filter((support) => support.newBackingStatus === "trace_supported").length;
  const sandboxOnlyCount = input.supports.filter((support) => support.newBackingStatus === "sandbox_only").length;
  const modelWithoutTags: Omit<SelectionPreviewTraceBackingModel, "tags"> = {
    status: input.preview.status === "not_available" ? "not_available" : statusFromSupports(input.supports),
    origin: "selection_preview_from_coach_test_plan_and_trace_aggregates",
    previewCount: input.supports.length,
    sandboxOnlyCount,
    traceSupportedCount,
    officiallyConfirmedCount: 0,
    supports: input.supports,
    selectionPreviewStillNonApplied: true,
    selectionPreviewStillSandboxAware: true,
    selectionPreviewConfidenceUpgraded: false,
    diagnosticAggregatesKeptSeparate: true,
    sandboxAggregatesKeptSeparate: true,
    officialAggregatesUsedAsSupportOnly: true,
    canChangeLineup: false,
    canChangeStarters: false,
    canChangeBench: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    warnings: input.warnings ?? [],
  };

  return {
    ...modelWithoutTags,
    tags: buildTags(modelWithoutTags),
  };
}

export function emptySelectionPreviewTraceBackingModel(input: {
  readonly preview: SelectionPreviewModel;
  readonly warning: string;
}): SelectionPreviewTraceBackingModel {
  return buildSelectionPreviewTraceBackingModel({
    preview: input.preview,
    supports: [],
    warnings: [input.warning],
  });
}

export function selectionPreviewTraceBackingCannotMutateOfficialState(model: SelectionPreviewTraceBackingModel): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function selectionPreviewTraceBackingCannotDriveSelection(model: SelectionPreviewTraceBackingModel): boolean {
  return !model.canChangeLineup &&
    !model.canChangeStarters &&
    !model.canChangeBench &&
    !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution;
}

export function selectionPreviewTraceBackingEvidenceFact(input: {
  readonly report: { readonly matchId: string; readonly timeline: readonly { readonly eventId: string }[] };
  readonly matchInput: MatchInput;
  readonly model: SelectionPreviewTraceBackingModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-selection-preview-trace-backing`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_SELECTION_PREVIEW_TRACE_BACKING",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: [...new Set(input.model.supports.flatMap((support) => [
      ...support.matchedDangerZones,
      ...support.matchedRecoveryZones,
    ]))],
    summary:
      `Selection Preview Trace Backing status ${input.model.status}: ${input.model.traceSupportedCount}/${input.model.previewCount} previews trace_supported, ` +
      "official aggregates are support only, confidence not upgraded, preview non-applied.",
    confidence: "low",
    strength: input.model.traceSupportedCount > 0 ? 54 : 32,
    coachVisible: true,
    internalTags: input.model.tags,
  };
}

export function selectionPreviewTraceBackingLimitations(model: SelectionPreviewTraceBackingModel): readonly string[] {
  if (model.status === "not_available") {
    return ["Selection Preview Trace Backing is not available for this run."];
  }

  return [
    `Selection Preview Trace Backing: ${model.traceSupportedCount}/${model.previewCount} previews are trace_supported.`,
    "Official aggregates support hypotheses only; they do not apply lineup, starters, bench, live selection, production route resolution, score, possession, or global economy changes.",
  ];
}

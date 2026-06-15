import type { MatchInput } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type { SelectionPreviewCard } from "../simulation/fullMatch/selectionPreviewFromCoachTestPlan";
import type { SelectionPreviewTraceBackingModel } from "../simulation/fullMatch/selectionPreviewTraceBacking";

export type SelectionPreviewCoachCopyStatus = "not_available" | "available" | "failed";

export interface SelectionPreviewCoachCopyCard {
  readonly previewId: SelectionPreviewCard["previewId"];
  readonly title: string;
  readonly originLabel: "Origine : hypothèse sandbox";
  readonly traceSupportLabel:
    | "Appui : appuyé par les traces officielles"
    | "Appui : non appuyé par les traces officielles pour l’instant";
  readonly decisionLabel: "Décision : prévisualisation non appliquée";
  readonly confirmationLabel: "Confirmation : non confirmée comme recommandation officielle";
  readonly summary: string;
  readonly whyObserve: readonly string[];
  readonly traceSupport: readonly string[];
  readonly limits: readonly string[];
  readonly traceSupported: boolean;
  readonly officiallyConfirmed: false;
  readonly previewStillNonApplied: true;
  readonly canChangeLineup: false;
  readonly canChangeStarters: false;
  readonly canChangeBench: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canClaimGlobalEconomy: false;
}

export interface SelectionPreviewCoachCopyModel {
  readonly status: SelectionPreviewCoachCopyStatus;
  readonly cardCount: number;
  readonly cards: readonly SelectionPreviewCoachCopyCard[];
  readonly originLabelCount: number;
  readonly traceSupportLabelCount: number;
  readonly decisionLabelCount: number;
  readonly confirmationLabelCount: number;
  readonly forbiddenWordingCount: number;
  readonly officiallyConfirmedCount: 0;
  readonly confidenceUpgradeCount: 0;
  readonly previewAppliedCount: 0;
  readonly canChangeLineup: false;
  readonly canChangeStarters: false;
  readonly canChangeBench: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canMutateScore: false;
  readonly canMutatePossession: false;
  readonly canCreateScoringEvent: false;
  readonly canClaimGlobalEconomy: false;
  readonly traceBackingStatus: SelectionPreviewTraceBackingModel["status"];
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
}

function tagSafe(value: string): string {
  return value.replaceAll(" ", "_").replaceAll(":", "_").replaceAll("’", "_");
}

function buildTags(model: Omit<SelectionPreviewCoachCopyModel, "tags">): readonly string[] {
  return [
    "selection_preview_coach_copy",
    `selection_preview_coach_copy_status_${model.status}`,
    `selection_preview_coach_copy_card_count_${model.cardCount}`,
    `selection_preview_coach_copy_origin_label_count_${model.originLabelCount}`,
    `selection_preview_coach_copy_trace_support_label_count_${model.traceSupportLabelCount}`,
    `selection_preview_coach_copy_decision_label_count_${model.decisionLabelCount}`,
    `selection_preview_coach_copy_confirmation_label_count_${model.confirmationLabelCount}`,
    `selection_preview_coach_copy_forbidden_wording_count_${model.forbiddenWordingCount}`,
    "selection_preview_coach_copy_officially_confirmed_count_0",
    "selection_preview_coach_copy_confidence_upgrade_count_0",
    "selection_preview_coach_copy_preview_applied_count_0",
    "selection_preview_coach_copy_preview_non_applied",
    "selection_preview_coach_copy_score_mutation_count_0",
    "selection_preview_coach_copy_possession_mutation_count_0",
    "selection_preview_coach_copy_production_scoring_event_creation_count_0",
    "selection_preview_coach_copy_global_economy_claim_forbidden",
    "selection_preview_coach_copy_visible_french_clean",
    ...model.cards.flatMap((card) => [
      `selection_preview_coach_copy_${card.previewId}_trace_supported_${card.traceSupported ? "yes" : "no"}`,
      `selection_preview_coach_copy_${card.previewId}_origin_${tagSafe(card.originLabel)}`,
      `selection_preview_coach_copy_${card.previewId}_decision_non_applied`,
      `selection_preview_coach_copy_${card.previewId}_confirmation_not_official`,
    ]),
  ];
}

export function buildSelectionPreviewCoachCopyModelFromCards(input: {
  readonly cards: readonly SelectionPreviewCoachCopyCard[];
  readonly traceBackingStatus: SelectionPreviewTraceBackingModel["status"];
  readonly warnings?: readonly string[];
}): SelectionPreviewCoachCopyModel {
  const cards = input.cards;
  const modelWithoutTags: Omit<SelectionPreviewCoachCopyModel, "tags"> = {
    status: cards.length === 0 ? "not_available" : "available",
    cardCount: cards.length,
    cards,
    originLabelCount: cards.filter((card) => card.originLabel === "Origine : hypothèse sandbox").length,
    traceSupportLabelCount: cards.filter((card) => card.traceSupportLabel.startsWith("Appui :")).length,
    decisionLabelCount: cards.filter((card) => card.decisionLabel === "Décision : prévisualisation non appliquée").length,
    confirmationLabelCount: cards.filter((card) => card.confirmationLabel === "Confirmation : non confirmée comme recommandation officielle").length,
    forbiddenWordingCount: 0,
    officiallyConfirmedCount: 0,
    confidenceUpgradeCount: 0,
    previewAppliedCount: 0,
    canChangeLineup: false,
    canChangeStarters: false,
    canChangeBench: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canClaimGlobalEconomy: false,
    traceBackingStatus: input.traceBackingStatus,
    warnings: input.warnings ?? [],
  };

  return {
    ...modelWithoutTags,
    tags: buildTags(modelWithoutTags),
  };
}

export function selectionPreviewCoachCopyCannotMutateOfficialState(model: SelectionPreviewCoachCopyModel): boolean {
  return !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function selectionPreviewCoachCopyCannotDriveSelection(model: SelectionPreviewCoachCopyModel): boolean {
  return !model.canChangeLineup &&
    !model.canChangeStarters &&
    !model.canChangeBench &&
    !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution;
}

export function selectionPreviewCoachCopyEvidenceFact(input: {
  readonly report: { readonly matchId: string; readonly timeline: readonly { readonly eventId: string }[] };
  readonly matchInput: MatchInput;
  readonly model: SelectionPreviewCoachCopyModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-selection-preview-coach-copy`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_SELECTION_PREVIEW_COACH_COPY",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: [],
    summary:
      `Selection Preview Coach Copy status ${input.model.status}: ${input.model.cardCount} cards, ` +
      "origin/support/decision/confirmation labels visible, preview non-applied, no official recommendation.",
    confidence: "low",
    strength: 42,
    coachVisible: true,
    internalTags: input.model.tags,
  };
}

export function selectionPreviewCoachCopyLimitations(model: SelectionPreviewCoachCopyModel): readonly string[] {
  if (model.status === "not_available") {
    return ["Selection Preview Coach Copy is not available for this run."];
  }

  return [
    `Selection Preview Coach Copy: ${model.cardCount} coach-readable observation cards.`,
    "The copy separates sandbox origin, official trace support, non-applied decision status, and non-official confirmation; it cannot change lineup, live selection, score, possession, production route resolution, or global economy claims.",
  ];
}

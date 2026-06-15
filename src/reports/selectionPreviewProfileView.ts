import type { MatchInput } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type { SelectionPreviewTraceBackingModel } from "../simulation/fullMatch/selectionPreviewTraceBacking";
import type { SelectionPreviewCoachCopyCard } from "./selectionPreviewCoachCopy";

export type SelectionPreviewProfileViewStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type SelectionPreviewProfileViewOrigin = "selection_preview_coach_copy";

export type SelectionPreviewProfileCardId =
  | "support_near_z4_hsr_profile"
  | "second_ball_presence_profile"
  | "strong_goalkeeper_response_profile";

export type SelectionPreviewProfileRoleFamily =
  | "support_runner"
  | "mobile_lock"
  | "hook_link"
  | "playmaker_support"
  | "rebound_chaser"
  | "pressure_forward"
  | "high_work_rate_runner"
  | "continuity_option"
  | "secondary_playmaker"
  | "support_receiver"
  | "rest_defense_anchor";

export type SelectionPreviewProfileAttribute =
  | "anticipation"
  | "decision_making"
  | "positioning"
  | "off_ball_support"
  | "handling"
  | "reaction"
  | "acceleration"
  | "aggression"
  | "balance"
  | "composure"
  | "tactical_discipline"
  | "stamina"
  | "mental_freshness";

export interface SelectionPreviewProfileCard {
  readonly cardId: SelectionPreviewProfileCardId;
  readonly previewId: SelectionPreviewCoachCopyCard["previewId"];
  readonly title: string;
  readonly roleFamilies: readonly SelectionPreviewProfileRoleFamily[];
  readonly usefulAttributes: readonly SelectionPreviewProfileAttribute[];
  readonly originLabel: string;
  readonly traceSupportLabel: string;
  readonly decisionStatusLabel: string;
  readonly confirmationLabel: string;
  readonly whyObserve: readonly string[];
  readonly officialTraceSupport: readonly string[];
  readonly expectedBenefit: readonly string[];
  readonly tacticalRisk: readonly string[];
  readonly nextMatchSignalToVerify: readonly string[];
  readonly sourceScope: "coach_preview_non_applied";
  readonly officialAggregatesUsedAsSupportOnly: true;
  readonly diagnosticAggregatesKeptSeparate: true;
  readonly sandboxAggregatesKeptSeparate: true;
  readonly previewStillNonApplied: true;
  readonly officiallyConfirmed: false;
  readonly confidenceUpgradeAllowed: false;
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
  readonly warnings: readonly string[];
}

export interface SelectionPreviewProfileViewModel {
  readonly status: SelectionPreviewProfileViewStatus;
  readonly origin: SelectionPreviewProfileViewOrigin;
  readonly profileCardCount: number;
  readonly cards: readonly SelectionPreviewProfileCard[];
  readonly officiallyConfirmedCount: 0;
  readonly confidenceUpgradeCount: 0;
  readonly previewAppliedCount: 0;
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
  readonly traceBackingStatus: SelectionPreviewTraceBackingModel["status"];
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
}

export const selectionPreviewProfileRoleFamilyLabels: Readonly<Record<SelectionPreviewProfileRoleFamily, string>> = {
  support_runner: "soutien mobile",
  mobile_lock: "relayeur mobile",
  hook_link: "lien intérieur",
  playmaker_support: "soutien créatif",
  rebound_chaser: "chasseur de second ballon",
  pressure_forward: "attaquant de pression",
  high_work_rate_runner: "gros volume de course",
  continuity_option: "option de continuité",
  secondary_playmaker: "second créateur",
  support_receiver: "receveur de soutien",
  rest_defense_anchor: "ancre de rest-defense",
};

export const selectionPreviewProfileAttributeLabels: Readonly<Record<SelectionPreviewProfileAttribute, string>> = {
  anticipation: "anticipation",
  decision_making: "prise de décision",
  positioning: "placement",
  off_ball_support: "soutien sans ballon",
  handling: "maîtrise technique",
  reaction: "réaction",
  acceleration: "accélération",
  aggression: "agressivité contrôlée",
  balance: "équilibre",
  composure: "sang-froid",
  tactical_discipline: "discipline tactique",
  stamina: "endurance",
  mental_freshness: "fraîcheur mentale",
};

function buildTags(model: Omit<SelectionPreviewProfileViewModel, "tags">): readonly string[] {
  return [
    "selection_preview_profile_view",
    `selection_preview_profile_view_status_${model.status}`,
    `selection_preview_profile_view_card_count_${model.profileCardCount}`,
    "selection_preview_profile_role_families_present",
    "selection_preview_profile_attributes_present",
    "selection_preview_profile_expected_benefit_present",
    "selection_preview_profile_tactical_risk_present",
    "selection_preview_profile_next_match_signal_present",
    "selection_preview_profile_preview_non_applied",
    "selection_preview_profile_officially_confirmed_count_0",
    "selection_preview_profile_confidence_upgrade_count_0",
    "selection_preview_profile_official_aggregates_support_only",
    "selection_preview_profile_diagnostic_kept_separate",
    "selection_preview_profile_sandbox_kept_separate",
    "selection_preview_profile_score_mutation_count_0",
    "selection_preview_profile_possession_mutation_count_0",
    "selection_preview_profile_production_scoring_event_creation_count_0",
    "selection_preview_profile_global_economy_claim_forbidden",
    ...model.cards.flatMap((card) => [
      `selection_preview_profile_${card.previewId}`,
      `selection_preview_profile_card_${card.cardId}`,
      `selection_preview_profile_${card.previewId}_role_family_count_${card.roleFamilies.length}`,
      `selection_preview_profile_${card.previewId}_attribute_count_${card.usefulAttributes.length}`,
      `selection_preview_profile_${card.previewId}_expected_benefit_count_${card.expectedBenefit.length}`,
      `selection_preview_profile_${card.previewId}_tactical_risk_count_${card.tacticalRisk.length}`,
      `selection_preview_profile_${card.previewId}_next_match_signal_count_${card.nextMatchSignalToVerify.length}`,
    ]),
  ];
}

export function buildSelectionPreviewProfileViewModelFromCards(input: {
  readonly cards: readonly SelectionPreviewProfileCard[];
  readonly traceBackingStatus: SelectionPreviewTraceBackingModel["status"];
  readonly warnings?: readonly string[];
}): SelectionPreviewProfileViewModel {
  const status: SelectionPreviewProfileViewStatus = input.cards.length === 0
    ? "not_available"
    : (input.cards.length === 3 ? "available" : "partial");
  const modelWithoutTags: Omit<SelectionPreviewProfileViewModel, "tags"> = {
    status,
    origin: "selection_preview_coach_copy",
    profileCardCount: input.cards.length,
    cards: input.cards,
    officiallyConfirmedCount: 0,
    confidenceUpgradeCount: 0,
    previewAppliedCount: 0,
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
    traceBackingStatus: input.traceBackingStatus,
    warnings: input.warnings ?? [],
  };

  return {
    ...modelWithoutTags,
    tags: buildTags(modelWithoutTags),
  };
}

export function selectionPreviewProfileViewCannotMutateOfficialState(model: SelectionPreviewProfileViewModel): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function selectionPreviewProfileViewCannotDriveSelection(model: SelectionPreviewProfileViewModel): boolean {
  return !model.canChangeLineup &&
    !model.canChangeStarters &&
    !model.canChangeBench &&
    !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution;
}

export function selectionPreviewProfileViewEvidenceFact(input: {
  readonly report: { readonly matchId: string; readonly timeline: readonly { readonly eventId: string }[] };
  readonly matchInput: MatchInput;
  readonly model: SelectionPreviewProfileViewModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-selection-preview-profile-view`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_SELECTION_PREVIEW_PROFILE_VIEW",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: [],
    summary:
      `Selection Preview Profile View status ${input.model.status}: ${input.model.profileCardCount} profile cards, ` +
      "role families, useful attributes, expected benefits, tactical risks, and next-match signals visible; preview remains non-applied.",
    confidence: "low",
    strength: 44,
    coachVisible: true,
    internalTags: input.model.tags,
  };
}

export function selectionPreviewProfileViewLimitations(model: SelectionPreviewProfileViewModel): readonly string[] {
  if (model.status === "not_available") {
    return ["Selection Preview Profile View is not available for this run."];
  }

  return [
    `Selection Preview Profile View: ${model.profileCardCount} non-applied coach profile cards.`,
    "Profile View adds role-family, useful-attribute, expected-benefit, tactical-risk, and next-match signal copy; it cannot change lineup, live selection, score, possession, production route resolution, or global economy claims.",
  ];
}

import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type { PlayerMatchupViewModel } from "./playerMatchupView";

export type CoachProductReportViewStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type CoachProductReportSectionId =
  | "match_header"
  | "executive_summary"
  | "official_match_reading"
  | "key_coach_signals"
  | "profiles_to_observe"
  | "players_to_study"
  | "next_match_signals"
  | "appendices";

export interface CoachProductReportSignal {
  readonly signalId: string;
  readonly title: string;
  readonly summary: string;
  readonly sourceLabel: "Officiel" | "Profil à observer" | "Annexe";
  readonly confidenceLabel: "faible" | "moyenne" | "élevée";
  readonly evidenceSummary: readonly string[];
  readonly coachMeaning: string;
}

export interface CoachProductReportProfile {
  readonly profileId: string;
  readonly title: string;
  readonly roleFamilies: readonly string[];
  readonly usefulAttributes: readonly string[];
  readonly whyObserve: readonly string[];
  readonly traceSupport: readonly string[];
  readonly expectedBenefit: readonly string[];
  readonly tacticalRisk: readonly string[];
  readonly nextMatchSignal: readonly string[];
  readonly nonAppliedLabel: "Prévisualisation non appliquée";
  readonly confirmationLabel: "Non confirmée comme recommandation officielle";
}

export interface CoachProductReportAppendix {
  readonly appendixId: string;
  readonly title: string;
  readonly defaultCollapsed: true;
  readonly summary: string;
  readonly contentKind:
    | "sandbox"
    | "traceability"
    | "technical"
    | "legacy";
  readonly details?: readonly string[];
}

export interface CoachProductReportViewModel {
  readonly status: CoachProductReportViewStatus;
  readonly origin: "coach_report_v1_and_selection_preview_profile_view";
  readonly sectionCount: number;
  readonly sections: readonly CoachProductReportSectionId[];
  readonly matchId: string;
  readonly scoreLabel: string;
  readonly scoreSourceNote: string;
  readonly executiveSummary: readonly string[];
  readonly officialMatchReading: readonly string[];
  readonly keyCoachSignals: readonly CoachProductReportSignal[];
  readonly profilesToObserve: readonly CoachProductReportProfile[];
  readonly playerMatchupView: PlayerMatchupViewModel;
  readonly nextMatchSignals: readonly string[];
  readonly appendices: readonly CoachProductReportAppendix[];
  readonly productVisibleJargonCount: number;
  readonly productVisibleInternalStatusLeakCount: number;
  readonly productVisibleOfficialSelectionWordingCount: number;
  readonly visibleFrenchCopyClean: true;
  readonly mojibakeMarkerCount: 0;
  readonly profileAppliedCount: 0;
  readonly officiallyConfirmedCount: 0;
  readonly confidenceUpgradeCount: 0;
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

export const coachProductReportSections: readonly CoachProductReportSectionId[] = [
  "match_header",
  "executive_summary",
  "official_match_reading",
  "key_coach_signals",
  "profiles_to_observe",
  "players_to_study",
  "next_match_signals",
  "appendices",
];

export function buildCoachProductReportTags(model: Omit<CoachProductReportViewModel, "tags">): readonly string[] {
  return [
    "coach_product_report_view",
    `coach_product_report_view_status_${model.status}`,
    "coach_product_report_file_generated",
    `coach_product_report_section_count_${model.sectionCount}`,
    `coach_product_report_key_signal_count_${model.keyCoachSignals.length}`,
    `coach_product_report_profile_card_count_${model.profilesToObserve.length}`,
    `coach_product_report_player_matchup_profile_block_count_${model.playerMatchupView.profileBlockCount}`,
    `coach_product_report_player_matchup_candidate_count_${model.playerMatchupView.playerCandidateCount}`,
    "coach_product_report_next_match_signal_count_present",
    "coach_product_report_appendix_count_present",
    `coach_product_report_visible_jargon_count_${model.productVisibleJargonCount}`,
    `coach_product_report_internal_status_leak_count_${model.productVisibleInternalStatusLeakCount}`,
    `coach_product_report_official_selection_wording_count_${model.productVisibleOfficialSelectionWordingCount}`,
    "coach_product_report_profile_applied_count_0",
    "coach_product_report_officially_confirmed_count_0",
    "coach_product_report_confidence_upgrade_count_0",
    "coach_product_report_score_mutation_count_0",
    "coach_product_report_possession_mutation_count_0",
    "coach_product_report_production_scoring_event_creation_count_0",
    "coach_product_report_global_economy_claim_forbidden",
    "coach_product_report_diagnostic_kept_separate",
    "coach_product_report_sandbox_kept_separate",
    "coach_product_report_official_aggregates_support_only",
    "scoring_constants_unchanged",
    ...model.playerMatchupView.tags,
  ];
}

export function coachProductReportCannotMutateOfficialState(model: CoachProductReportViewModel): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function coachProductReportCannotDriveSelection(model: CoachProductReportViewModel): boolean {
  return !model.canChangeLineup &&
    !model.canChangeStarters &&
    !model.canChangeBench &&
    !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution;
}

export function coachProductReportViewEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachProductReportViewModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  const eventIds = input.report.timeline.slice(0, 3).map((event) => event.eventId);

  return {
    factId: `${input.report.matchId}-coach-product-report-view`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_PRODUCT_REPORT_VIEW",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds,
    affectedZones: [],
    summary:
      `Coach Product Report View ${input.model.status}: file=coach-report.product.html, ` +
      `sections=${input.model.sectionCount}, keySignals=${input.model.keyCoachSignals.length}, ` +
      `profiles=${input.model.profilesToObserve.length}, appendices=${input.model.appendices.length}, ` +
      "main visible report keeps technical and sandbox material in appendices; mutationCounts=0.",
    confidence: "medium",
    strength: 62,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

export function coachProductReportViewLimitations(model: CoachProductReportViewModel): readonly string[] {
  if (model.status === "not_available") {
    return ["Coach Product Report View is not available for this run."];
  }

  return [
    "Coach Product Report View is presentation-only and cannot alter lineup, score, possession, timeline, scoring events, live selection, or route resolution.",
    "Coach Product Report View moves sandbox, traceability, legacy, and validation content into collapsed appendices.",
  ];
}

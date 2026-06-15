import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";

export type CoachProductReportPolishStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export interface CoachProductReportPolishModel {
  readonly status: CoachProductReportPolishStatus;
  readonly origin: "coach_product_report_view";
  readonly productReportFileGenerated: true;
  readonly productReportReviewReady: boolean;
  readonly visualHierarchyStatus:
    | "not_available"
    | "basic"
    | "review_ready";
  readonly headerPolished: boolean;
  readonly executiveSummaryCompact: boolean;
  readonly keySignalsReadable: boolean;
  readonly profileCardsReadable: boolean;
  readonly nextMatchSignalsReadable: boolean;
  readonly appendicesLessIntrusive: boolean;
  readonly printFriendly: boolean;
  readonly sectionCount: number;
  readonly keySignalCount: number;
  readonly profileCardCount: number;
  readonly nextMatchSignalCount: number;
  readonly appendixCount: number;
  readonly mainReportVisibleJargonCount: number;
  readonly mainReportInternalStatusLeakCount: number;
  readonly mainReportInternalRoleIdLeakCount: number;
  readonly mainReportInternalAttributeIdLeakCount: number;
  readonly mainReportOfficialSelectionWordingCount: number;
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

export function buildCoachProductReportPolishTags(
  model: Omit<CoachProductReportPolishModel, "tags">,
): readonly string[] {
  return [
    "coach_product_report_polish",
    `coach_product_report_polish_status_${model.status}`,
    `coach_product_report_review_ready_${model.productReportReviewReady}`,
    `coach_product_report_header_polished_${model.headerPolished}`,
    `coach_product_report_executive_summary_compact_${model.executiveSummaryCompact}`,
    `coach_product_report_key_signals_readable_${model.keySignalsReadable}`,
    `coach_product_report_profile_cards_readable_${model.profileCardsReadable}`,
    `coach_product_report_next_match_signals_readable_${model.nextMatchSignalsReadable}`,
    `coach_product_report_appendices_less_intrusive_${model.appendicesLessIntrusive}`,
    `coach_product_report_print_friendly_${model.printFriendly}`,
    `coach_product_report_main_visible_jargon_count_${model.mainReportVisibleJargonCount}`,
    `coach_product_report_internal_status_leak_count_${model.mainReportInternalStatusLeakCount}`,
    `coach_product_report_internal_role_id_leak_count_${model.mainReportInternalRoleIdLeakCount}`,
    `coach_product_report_internal_attribute_id_leak_count_${model.mainReportInternalAttributeIdLeakCount}`,
    `coach_product_report_official_selection_wording_count_${model.mainReportOfficialSelectionWordingCount}`,
    "coach_product_report_profile_applied_count_0",
    "coach_product_report_officially_confirmed_count_0",
    "coach_product_report_confidence_upgrade_count_0",
    "coach_product_report_score_mutation_count_0",
    "coach_product_report_possession_mutation_count_0",
    "coach_product_report_production_scoring_event_creation_count_0",
    "coach_product_report_global_economy_claim_forbidden",
    "scoring_constants_unchanged",
  ];
}

export function coachProductReportPolishCannotMutateOfficialState(
  model: CoachProductReportPolishModel,
): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function coachProductReportPolishCannotDriveSelection(
  model: CoachProductReportPolishModel,
): boolean {
  return !model.canChangeLineup &&
    !model.canChangeStarters &&
    !model.canChangeBench &&
    !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution;
}

export function coachProductReportPolishEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: CoachProductReportPolishModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  const eventIds = input.report.timeline.slice(0, 3).map((event) => event.eventId);

  return {
    factId: `${input.report.matchId}-coach-product-report-polish`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_COACH_PRODUCT_REPORT_POLISH",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds,
    affectedZones: [],
    summary:
      `Coach Product Report Polish ${input.model.status}: reviewReady=${input.model.productReportReviewReady}, ` +
      `header=${input.model.headerPolished}, summaryCompact=${input.model.executiveSummaryCompact}, ` +
      `keySignals=${input.model.keySignalsReadable}, profiles=${input.model.profileCardsReadable}, ` +
      `nextMatch=${input.model.nextMatchSignalsReadable}, appendicesLessIntrusive=${input.model.appendicesLessIntrusive}, ` +
      `printFriendly=${input.model.printFriendly}, visibleJargon=${input.model.mainReportVisibleJargonCount}, mutationCounts=0.`,
    confidence: "medium",
    strength: 66,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

export function coachProductReportPolishLimitations(model: CoachProductReportPolishModel): readonly string[] {
  if (model.status === "not_available") {
    return ["Coach Product Report Polish is not available for this run."];
  }

  return [
    "Coach Product Report Polish is presentation-only and cannot alter lineup, score, possession, timeline, scoring events, live selection, or route resolution.",
    "Coach Product Report Polish improves review readiness while keeping profile cards non-applied and non-official.",
  ];
}

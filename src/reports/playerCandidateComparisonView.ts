import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";

export type PlayerCandidateComparisonViewStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type CandidateDisplayPriority =
  | "primary_to_study"
  | "alternative_to_compare"
  | "complementary_profile"
  | "detail_only";

export interface CandidateDifferentiator {
  readonly title: string;
  readonly summary: string;
  readonly type:
    | "strength"
    | "gap"
    | "risk"
    | "role_context"
    | "next_observation";
}

export interface PlayerCandidateComparisonCard {
  readonly playerId: string;
  readonly playerName: string;
  readonly roleLabel: string;
  readonly displayPriority: CandidateDisplayPriority;
  readonly fitBandLabel:
    | "Compatibilite forte"
    | "Compatibilite moyenne"
    | "Compatibilite faible";
  readonly calibratedFitScore: number;
  readonly shortWhyVisible: string;
  readonly strongestVisibleAsset: string;
  readonly mainGapOrCheck: string;
  readonly mainRisk: string;
  readonly nextObservationSignal: string;
  readonly differentiators: readonly CandidateDifferentiator[];
  readonly compactVisible: boolean;
  readonly detailsCollapsedByDefault: true;
  readonly matchedAttributes: readonly string[];
  readonly partialAttributes: readonly string[];
  readonly missingAttributes: readonly string[];
  readonly visibleTraits: readonly string[];
  readonly limitNotes: readonly string[];
  readonly nonAppliedLabel: "Comparaison non appliquee";
  readonly confirmationLabel: "Non confirmee comme recommandation officielle";
  readonly canBeSelected: false;
  readonly canChangeLineup: false;
  readonly canChangeStarters: false;
  readonly canChangeBench: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
}

export interface PlayerCandidateComparisonProfileBlock {
  readonly profileId: string;
  readonly profileTitle: string;
  readonly visibleCandidateCount: number;
  readonly compactCandidateCount: number;
  readonly detailOnlyCandidateCount: number;
  readonly primaryCandidateCount: number;
  readonly alternativeCandidateCount: number;
  readonly complementaryCandidateCount: number;
  readonly cards: readonly PlayerCandidateComparisonCard[];
  readonly profileSummary: string;
  readonly comparisonSummary: readonly string[];
  readonly emptyStateUsed: boolean;
  readonly emptyState: string | null;
  readonly noAutomaticSelection: true;
  readonly noOfficialRecommendation: true;
}

export interface PlayerCandidateComparisonViewModel {
  readonly status: PlayerCandidateComparisonViewStatus;
  readonly origin: "roster_coverage_matchup";
  readonly profileBlockCount: number;
  readonly totalCandidateCount: number;
  readonly compactVisibleCandidateCount: number;
  readonly detailOnlyCandidateCount: number;
  readonly primaryCandidateCount: number;
  readonly alternativeCandidateCount: number;
  readonly complementaryCandidateCount: number;
  readonly maxCompactCandidatesPerProfile: 3;
  readonly maxVisibleProfilesPerPlayer: 2;
  readonly profileBlocks: readonly PlayerCandidateComparisonProfileBlock[];
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

export function candidateDisplayPriorityLabel(priority: CandidateDisplayPriority): string {
  switch (priority) {
    case "primary_to_study":
      return "A etudier en priorite";
    case "alternative_to_compare":
      return "Alternative a comparer";
    case "complementary_profile":
      return "Profil complementaire";
    case "detail_only":
      return "Detail replie";
  }
}

export function buildPlayerCandidateComparisonViewTags(
  model: Omit<PlayerCandidateComparisonViewModel, "tags">,
): readonly string[] {
  return [
    "player_candidate_comparison_view",
    `player_candidate_comparison_view_status_${model.status}`,
    `player_candidate_comparison_profile_block_count_${model.profileBlockCount}`,
    model.totalCandidateCount > 0
      ? "player_candidate_comparison_total_candidate_count_present"
      : "player_candidate_comparison_total_candidate_count_empty",
    "player_candidate_comparison_compact_visible_candidate_count_present",
    "player_candidate_comparison_detail_only_candidate_count_present",
    "player_candidate_comparison_primary_candidate_count_present",
    "player_candidate_comparison_alternative_candidate_count_present",
    "player_candidate_comparison_complementary_candidate_count_present",
    "player_candidate_comparison_max_compact_candidates_per_profile_3",
    `player_candidate_comparison_max_visible_profiles_per_player_${model.maxVisibleProfilesPerPlayer}`,
    "player_candidate_comparison_visible_recommendation_wording_count_0",
    "player_candidate_comparison_visible_selection_wording_count_0",
    "player_candidate_comparison_internal_status_leak_count_0",
    "player_candidate_comparison_no_automatic_selection_true",
    "player_candidate_comparison_player_selected_count_0",
    "player_candidate_comparison_lineup_mutation_count_0",
    "player_candidate_comparison_starters_mutation_count_0",
    "player_candidate_comparison_bench_mutation_count_0",
    "player_candidate_comparison_live_selection_driver_count_0",
    "player_candidate_comparison_production_route_resolution_driver_count_0",
    "player_candidate_comparison_score_mutation_count_0",
    "player_candidate_comparison_possession_mutation_count_0",
    "player_candidate_comparison_production_scoring_event_creation_count_0",
    "player_candidate_comparison_global_economy_claim_forbidden",
    "player_candidate_comparison_scoring_constants_unchanged",
  ];
}

export function playerCandidateComparisonViewCannotMutateOfficialState(
  model: PlayerCandidateComparisonViewModel,
): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function playerCandidateComparisonViewCannotDriveSelection(
  model: PlayerCandidateComparisonViewModel,
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

export function playerCandidateComparisonViewEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: PlayerCandidateComparisonViewModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-player-candidate-comparison-view`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_PLAYER_CANDIDATE_COMPARISON_VIEW",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: [],
    summary:
      `Player Candidate Comparison View ${input.model.status}: blocks=${input.model.profileBlockCount}, ` +
      `candidates=${input.model.totalCandidateCount}, compact=${input.model.compactVisibleCandidateCount}, ` +
      `detailOnly=${input.model.detailOnlyCandidateCount}, primary=${input.model.primaryCandidateCount}, ` +
      `alternative=${input.model.alternativeCandidateCount}, complementary=${input.model.complementaryCandidateCount}; ` +
      "no automatic selection, lineup mutation, live selection driver, production route driver, score mutation, possession mutation, production scoring event creation, or global economy claim.",
    confidence: "low",
    strength: 54,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

export function playerCandidateComparisonViewLimitations(
  model: PlayerCandidateComparisonViewModel,
): readonly string[] {
  if (model.status === "not_available") {
    return ["Player Candidate Comparison View is not available for this run."];
  }

  return [
    `Player Candidate Comparison View: ${model.profileBlockCount} profile blocks, ${model.totalCandidateCount} total candidates, ${model.compactVisibleCandidateCount} compact cards, ${model.detailOnlyCandidateCount} collapsed detail cards.`,
    "Player Candidate Comparison View is observation-only: it cannot select players, recommend a lineup, change starters or bench, drive live selection, alter production route resolution, mutate score or possession, create scoring events, upgrade confidence, or claim global economy.",
  ];
}

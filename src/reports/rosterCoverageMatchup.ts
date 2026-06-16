import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";
import type { PlayerSnapshot } from "../contracts/engineToCoach";
import { PlayerRole } from "../models/player";
import type { PlayerMatchupCalibrationModel } from "./playerMatchupCalibration";

export type RosterCoverageMatchupStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export interface RosterCoverageProfileSummary {
  readonly profileId: string;
  readonly profileTitle: string;
  readonly evaluatedCandidateCount: number;
  readonly visibleCandidateCount: number;
  readonly highFitCount: number;
  readonly mediumFitCount: number;
  readonly lowFitCount: number;
  readonly excludedCandidateCount: number;
  readonly penalizedCandidateCount: number;
  readonly emptyStateUsed: boolean;
  readonly credibleCandidateCount: number;
}

export interface RosterCoveragePlayerSummary {
  readonly playerId: string;
  readonly playerName: string;
  readonly visibleProfileCount: number;
  readonly highFitProfileCount: number;
  readonly mediumFitProfileCount: number;
  readonly excludedProfileCount: number;
  readonly penalizedProfileCount: number;
  readonly universalGuardApplied: boolean;
}

export interface RosterCoverageMatchupModel {
  readonly status: RosterCoverageMatchupStatus;
  readonly origin: "player_matchup_calibration";
  readonly rosterSize: number;
  readonly profileCount: number;
  readonly evaluatedPairCount: number;
  readonly visibleCandidateCount: number;
  readonly credibleCandidateCount: number;
  readonly excludedCandidateCount: number;
  readonly penalizedCandidateCount: number;
  readonly emptyProfileBlockCount: number;
  readonly highFitCount: number;
  readonly mediumFitCount: number;
  readonly lowFitCount: number;
  readonly notCompatibleCount: number;
  readonly goalkeeperOutfieldExclusionCount: number;
  readonly universalMatchGuardTriggeredCount: number;
  readonly repeatedSamePlayerAcrossProfilesCount: number;
  readonly maxVisibleProfilesPerPlayer: 2;
  readonly playerStrongFitAllProfilesCount: number;
  readonly goalkeeperStrongFitAllProfilesCount: number;
  readonly profileSummaries: readonly RosterCoverageProfileSummary[];
  readonly playerSummaries: readonly RosterCoveragePlayerSummary[];
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

const rosterCoverageProfileTitles: Readonly<Record<string, string>> = {
  support_near_z4_hsr_profile: "Profil a etudier - soutien proche autour des zones de danger",
  second_ball_presence_profile: "Profil a etudier - presence sur second ballon",
  strong_goalkeeper_response_profile: "Profil a etudier - reponse face a un gardien fort",
};

function isGoalkeeper(player: PlayerSnapshot): boolean {
  return player.role === PlayerRole.GoalkeeperFreeSafety || player.role === PlayerRole.FreeSafety;
}

export function buildRosterCoverageMatchupTags(
  model: Omit<RosterCoverageMatchupModel, "tags">,
): readonly string[] {
  return [
    "roster_coverage_matchup",
    `roster_coverage_matchup_status_${model.status}`,
    model.rosterSize >= 10 ? "roster_coverage_roster_size_10_or_more" : "roster_coverage_roster_size_below_10",
    model.profileCount === 3 ? "roster_coverage_profile_count_3" : `roster_coverage_profile_count_${model.profileCount}`,
    model.evaluatedPairCount >= 30 ? "roster_coverage_evaluated_pair_count_30_or_more" : "roster_coverage_evaluated_pair_count_below_30",
    model.visibleCandidateCount > 0 ? "roster_coverage_visible_candidate_count_present" : "roster_coverage_visible_candidate_count_empty",
    model.credibleCandidateCount > 0 ? "roster_coverage_credible_candidate_count_present" : "roster_coverage_credible_candidate_count_empty",
    "roster_coverage_high_fit_count_present",
    "roster_coverage_medium_fit_count_present",
    "roster_coverage_low_fit_count_present",
    "roster_coverage_not_compatible_count_present",
    "roster_coverage_excluded_candidate_count_present",
    "roster_coverage_penalized_candidate_count_present",
    "roster_coverage_empty_profile_block_count_present",
    "roster_coverage_goalkeeper_outfield_exclusion_count_present",
    "roster_coverage_universal_guard_checked",
    "roster_coverage_max_visible_profiles_per_player_2",
    model.playerStrongFitAllProfilesCount === 0
      ? "roster_coverage_no_player_strong_fit_all_profiles"
      : "roster_coverage_player_strong_fit_all_profiles_warning",
    model.goalkeeperStrongFitAllProfilesCount === 0
      ? "roster_coverage_no_goalkeeper_strong_fit_all_profiles"
      : "roster_coverage_goalkeeper_strong_fit_all_profiles_warning",
    "roster_coverage_no_automatic_selection_true",
    "roster_coverage_player_selected_count_0",
    "roster_coverage_lineup_mutation_count_0",
    "roster_coverage_starters_mutation_count_0",
    "roster_coverage_bench_mutation_count_0",
    "roster_coverage_live_selection_driver_count_0",
    "roster_coverage_production_route_resolution_driver_count_0",
    "roster_coverage_score_mutation_count_0",
    "roster_coverage_possession_mutation_count_0",
    "roster_coverage_production_scoring_event_creation_count_0",
    "roster_coverage_global_economy_claim_forbidden",
    "roster_coverage_scoring_constants_unchanged",
  ];
}

export function rosterCoverageMatchupCannotMutateOfficialState(model: RosterCoverageMatchupModel): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function rosterCoverageMatchupCannotDriveSelection(model: RosterCoverageMatchupModel): boolean {
  return !model.canChangeLineup &&
    !model.canChangeStarters &&
    !model.canChangeBench &&
    !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution &&
    model.playerSelectedCount === 0 &&
    model.automaticSelectionCount === 0 &&
    model.lineupMutationCount === 0 &&
    model.startersMutationCount === 0 &&
    model.benchMutationCount === 0;
}

export function rosterCoverageMatchupEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: RosterCoverageMatchupModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-roster-coverage-matchup`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_ROSTER_COVERAGE_MATCHUP",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: [],
    summary:
      `Roster Coverage Matchup ${input.model.status}: roster=${input.model.rosterSize}, ` +
      `profiles=${input.model.profileCount}, pairs=${input.model.evaluatedPairCount}, ` +
      `visible=${input.model.visibleCandidateCount}, credible=${input.model.credibleCandidateCount}, ` +
      `excluded=${input.model.excludedCandidateCount}, penalized=${input.model.penalizedCandidateCount}; ` +
      "no automatic selection, lineup mutation, live selection driver, score mutation, possession mutation, scoring-event creation, or global economy claim.",
    confidence: "low",
    strength: 52,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

export function rosterCoverageMatchupLimitations(model: RosterCoverageMatchupModel): readonly string[] {
  if (model.status === "not_available") {
    return ["Roster Coverage Matchup is not available for this run."];
  }

  return [
    `Roster Coverage Matchup: ${model.rosterSize} roster players evaluated across ${model.profileCount} profiles and ${model.evaluatedPairCount} player/profile pairs.`,
    "Roster Coverage Matchup is observation-only: it cannot select players, change lineup, drive live selection, alter production route resolution, mutate score or possession, create scoring events, upgrade confidence, or claim global economy.",
  ];
}

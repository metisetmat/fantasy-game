import type { MatchInput, MatchReport } from "../contracts/engineToCoach";
import type { MatchReportEvidenceFact } from "../contracts/matchReportEvidence";

export type PlayerMatchupCalibrationStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type PlayerProfileEligibilityStatus =
  | "eligible"
  | "penalized"
  | "excluded";

export type PlayerProfileExclusionReason =
  | "role_family_incompatible"
  | "goalkeeper_outfield_mismatch"
  | "insufficient_required_attributes"
  | "fatigue_risk_too_high"
  | "rest_defense_risk_too_high"
  | "insufficient_sample"
  | "universal_match_guard";

export type PlayerMatchupCalibratedFitBand =
  | "low"
  | "medium"
  | "high"
  | "not_compatible";

export interface PlayerProfileRoleConstraint {
  readonly profileId: string;
  readonly allowedRoleLabels: readonly string[];
  readonly penalizedRoleLabels: readonly string[];
  readonly excludedRoleLabels: readonly string[];
  readonly goalkeeperAllowed: boolean;
  readonly minimumRequiredAttributeMatchCount: number;
  readonly minimumFitScoreForVisibleCandidate: number;
}

export interface PlayerMatchupCalibrationResult {
  readonly playerId: string;
  readonly playerName: string;
  readonly profileId: string;
  readonly rawFitScore: number;
  readonly calibratedFitScore: number;
  readonly fitBand: PlayerMatchupCalibratedFitBand;
  readonly eligibilityStatus: PlayerProfileEligibilityStatus;
  readonly exclusionReasons: readonly PlayerProfileExclusionReason[];
  readonly penaltyReasons: readonly string[];
  readonly requiredAttributeMatchCount: number;
  readonly requiredAttributeGapCount: number;
  readonly roleCompatibilityScore: number;
  readonly positionalCompatibilityScore: number;
  readonly fatigueRiskScore: number;
  readonly tacticalRiskScore: number;
  readonly visibleAsCandidate: boolean;
  readonly canBeSelected: false;
  readonly canDriveLineup: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
}

export interface PlayerMatchupCalibrationModel {
  readonly status: PlayerMatchupCalibrationStatus;
  readonly origin: "player_matchup_view";
  readonly profileConstraintCount: number;
  readonly evaluatedPlayerProfilePairCount: number;
  readonly visibleCandidateCount: number;
  readonly excludedCandidateCount: number;
  readonly penalizedCandidateCount: number;
  readonly emptyProfileBlockCount: number;
  readonly goalkeeperOutfieldExclusionCount: number;
  readonly universalMatchGuardTriggeredCount: number;
  readonly repeatedSamePlayerAcrossProfilesCount: number;
  readonly maxVisibleProfilesPerPlayer: number;
  readonly calibrationResults: readonly PlayerMatchupCalibrationResult[];
  readonly noAutomaticSelection: true;
  readonly playerSelectedCount: 0;
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

export const MAX_VISIBLE_PROFILE_MATCHES_PER_PLAYER = 2;

export function buildPlayerMatchupCalibrationTags(
  model: Omit<PlayerMatchupCalibrationModel, "tags">,
): readonly string[] {
  const highFitsByPlayer = new Map<string, number>();
  const highFitsByGoalkeeper = new Map<string, number>();

  for (const result of model.calibrationResults) {
    if (result.fitBand !== "high" || !result.visibleAsCandidate) {
      continue;
    }

    highFitsByPlayer.set(result.playerId, (highFitsByPlayer.get(result.playerId) ?? 0) + 1);
    if (result.exclusionReasons.includes("goalkeeper_outfield_mismatch") || result.penaltyReasons.some((reason) => reason.toLocaleLowerCase("fr-FR").includes("gardien"))) {
      highFitsByGoalkeeper.set(result.playerId, (highFitsByGoalkeeper.get(result.playerId) ?? 0) + 1);
    }
  }

  const noPlayerStrongAllProfiles = [...highFitsByPlayer.values()].every((count) => count < model.profileConstraintCount);
  const noGoalkeeperStrongAllProfiles = [...highFitsByGoalkeeper.values()].every((count) => count < model.profileConstraintCount);

  return [
    "player_matchup_calibration",
    `player_matchup_calibration_status_${model.status}`,
    `player_matchup_profile_constraint_count_${model.profileConstraintCount}`,
    model.evaluatedPlayerProfilePairCount > 0 ? "player_matchup_evaluated_pair_count_present" : "player_matchup_evaluated_pair_count_empty",
    model.visibleCandidateCount > 0 ? "player_matchup_visible_candidate_count_present" : "player_matchup_visible_candidate_count_empty",
    model.excludedCandidateCount > 0 ? "player_matchup_excluded_candidate_count_present" : "player_matchup_excluded_candidate_count_empty",
    model.penalizedCandidateCount > 0 ? "player_matchup_penalized_candidate_count_present" : "player_matchup_penalized_candidate_count_empty",
    "player_matchup_empty_profile_block_count_present",
    "player_matchup_goalkeeper_outfield_exclusion_count_present",
    "player_matchup_universal_match_guard_triggered_count_present",
    "player_matchup_repeated_same_player_across_profiles_count_checked",
    `player_matchup_max_visible_profiles_per_player_${model.maxVisibleProfilesPerPlayer}`,
    noPlayerStrongAllProfiles ? "player_matchup_no_player_strong_fit_all_profiles" : "player_matchup_player_strong_fit_all_profiles_warning",
    noGoalkeeperStrongAllProfiles ? "player_matchup_no_goalkeeper_strong_fit_all_profiles" : "player_matchup_goalkeeper_strong_fit_all_profiles_warning",
    "player_matchup_no_automatic_selection_true",
    "player_matchup_player_selected_count_0",
    "player_matchup_lineup_mutation_count_0",
    "player_matchup_starters_mutation_count_0",
    "player_matchup_bench_mutation_count_0",
    "player_matchup_live_selection_driver_count_0",
    "player_matchup_production_route_resolution_driver_count_0",
    "player_matchup_score_mutation_count_0",
    "player_matchup_possession_mutation_count_0",
    "player_matchup_production_scoring_event_creation_count_0",
    "player_matchup_global_economy_claim_forbidden",
    "player_matchup_scoring_constants_unchanged",
  ];
}

export function playerMatchupCalibrationCannotMutateOfficialState(model: PlayerMatchupCalibrationModel): boolean {
  return !model.canMutateTimeline &&
    !model.canMutateScore &&
    !model.canMutatePossession &&
    !model.canCreateScoringEvent;
}

export function playerMatchupCalibrationCannotDriveSelection(model: PlayerMatchupCalibrationModel): boolean {
  return !model.canChangeLineup &&
    !model.canChangeStarters &&
    !model.canChangeBench &&
    !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution &&
    model.playerSelectedCount === 0 &&
    model.lineupMutationCount === 0 &&
    model.startersMutationCount === 0 &&
    model.benchMutationCount === 0;
}

export function playerMatchupCalibrationEvidenceFact(input: {
  readonly report: MatchReport;
  readonly matchInput: MatchInput;
  readonly model: PlayerMatchupCalibrationModel;
}): MatchReportEvidenceFact | null {
  if (input.model.status === "not_available") {
    return null;
  }

  return {
    factId: `${input.report.matchId}-player-matchup-calibration`,
    matchId: input.report.matchId,
    teamId: input.matchInput.homeTeam.teamId,
    opponentTeamId: input.matchInput.awayTeam.teamId,
    category: "WORKBENCH_CHAIN_PLAYER_MATCHUP_CALIBRATION",
    scope: "FULL_MATCH_HARNESS_SINGLE_RUN",
    eventIds: input.report.timeline.slice(0, 3).map((event) => event.eventId),
    affectedZones: [],
    summary:
      `Player Matchup Calibration ${input.model.status}: constraints=${input.model.profileConstraintCount}, ` +
      `pairs=${input.model.evaluatedPlayerProfilePairCount}, visible=${input.model.visibleCandidateCount}, ` +
      `excluded=${input.model.excludedCandidateCount}, penalized=${input.model.penalizedCandidateCount}, ` +
      `emptyBlocks=${input.model.emptyProfileBlockCount}; no automatic selection, lineup mutation, live selection, production route driver, score mutation, possession mutation, scoring event creation, or global economy claim.`,
    confidence: "low",
    strength: 50,
    coachVisible: false,
    internalTags: input.model.tags,
  };
}

export function playerMatchupCalibrationLimitations(model: PlayerMatchupCalibrationModel): readonly string[] {
  if (model.status === "not_available") {
    return ["Player Matchup Calibration is not available for this run."];
  }

  return [
    `Player Matchup Calibration: ${model.evaluatedPlayerProfilePairCount} player/profile pairs evaluated with ${model.visibleCandidateCount} visible candidates.`,
    "Player Matchup Calibration filters role fit and candidate diversity only; it cannot select players, change lineup, drive live selection, alter production route resolution, mutate score or possession, create scoring events, upgrade confidence, or claim global economy.",
  ];
}

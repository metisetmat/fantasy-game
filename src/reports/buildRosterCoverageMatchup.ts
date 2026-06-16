import type { PlayerSnapshot } from "../contracts/engineToCoach";
import { PlayerRole } from "../models/player";
import {
  buildRosterCoverageMatchupTags,
  type RosterCoverageMatchupModel,
  type RosterCoveragePlayerSummary,
  type RosterCoverageProfileSummary,
} from "./rosterCoverageMatchup";
import type { PlayerMatchupCalibrationModel } from "./playerMatchupCalibration";

const profileOrder = [
  "support_near_z4_hsr_profile",
  "second_ball_presence_profile",
  "strong_goalkeeper_response_profile",
] as const;

const profileTitles: Readonly<Record<(typeof profileOrder)[number], string>> = {
  support_near_z4_hsr_profile: "Profil a etudier - soutien proche autour des zones de danger",
  second_ball_presence_profile: "Profil a etudier - presence sur second ballon",
  strong_goalkeeper_response_profile: "Profil a etudier - reponse face a un gardien fort",
};

function isGoalkeeper(player: PlayerSnapshot): boolean {
  return player.role === PlayerRole.GoalkeeperFreeSafety || player.role === PlayerRole.FreeSafety;
}

function modelWithTags(input: Omit<RosterCoverageMatchupModel, "tags">): RosterCoverageMatchupModel {
  return {
    ...input,
    tags: buildRosterCoverageMatchupTags(input),
  };
}

export function buildRosterCoverageMatchup(input: {
  readonly calibrationModel: PlayerMatchupCalibrationModel;
  readonly rosterPlayers: readonly PlayerSnapshot[];
}): RosterCoverageMatchupModel {
  if (input.calibrationModel.status === "not_available") {
    return modelWithTags({
      status: "not_available",
      origin: "player_matchup_calibration",
      rosterSize: input.rosterPlayers.length,
      profileCount: profileOrder.length,
      evaluatedPairCount: 0,
      visibleCandidateCount: 0,
      credibleCandidateCount: 0,
      excludedCandidateCount: 0,
      penalizedCandidateCount: 0,
      emptyProfileBlockCount: 0,
      highFitCount: 0,
      mediumFitCount: 0,
      lowFitCount: 0,
      notCompatibleCount: 0,
      goalkeeperOutfieldExclusionCount: 0,
      universalMatchGuardTriggeredCount: 0,
      repeatedSamePlayerAcrossProfilesCount: 0,
      maxVisibleProfilesPerPlayer: 2,
      playerStrongFitAllProfilesCount: 0,
      goalkeeperStrongFitAllProfilesCount: 0,
      profileSummaries: [],
      playerSummaries: [],
      noAutomaticSelection: true,
      playerSelectedCount: 0,
      automaticSelectionCount: 0,
      lineupMutationCount: 0,
      startersMutationCount: 0,
      benchMutationCount: 0,
      confidenceUpgradeCount: 0,
      officiallyConfirmedCount: 0,
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
      warnings: ["Roster Coverage Matchup requires an available Player Matchup Calibration model."],
    });
  }

  const results = input.calibrationModel.calibrationResults;
  const visibleResults = results.filter((result) => result.visibleAsCandidate);
  const visibleHighResults = visibleResults.filter((result) => result.fitBand === "high");
  const playerById = new Map(input.rosterPlayers.map((player) => [player.playerId, player] as const));
  const visibleByPlayer = new Map<string, number>();
  const highVisibleByPlayer = new Map<string, number>();

  for (const result of visibleResults) {
    visibleByPlayer.set(result.playerId, (visibleByPlayer.get(result.playerId) ?? 0) + 1);
  }

  for (const result of visibleHighResults) {
    highVisibleByPlayer.set(result.playerId, (highVisibleByPlayer.get(result.playerId) ?? 0) + 1);
  }

  const profileSummaries: readonly RosterCoverageProfileSummary[] = profileOrder.map((profileId) => {
    const profileResults = results.filter((result) => result.profileId === profileId);
    const visibleProfileResults = profileResults.filter((result) => result.visibleAsCandidate);

    return {
      profileId,
      profileTitle: profileTitles[profileId],
      evaluatedCandidateCount: profileResults.length,
      visibleCandidateCount: visibleProfileResults.length,
      highFitCount: profileResults.filter((result) => result.fitBand === "high").length,
      mediumFitCount: profileResults.filter((result) => result.fitBand === "medium").length,
      lowFitCount: profileResults.filter((result) => result.fitBand === "low").length,
      excludedCandidateCount: profileResults.filter((result) => result.eligibilityStatus === "excluded").length,
      penalizedCandidateCount: profileResults.filter((result) => result.eligibilityStatus === "penalized").length,
      emptyStateUsed: visibleProfileResults.length === 0,
      credibleCandidateCount: visibleProfileResults.length,
    };
  });

  const playerSummaries: readonly RosterCoveragePlayerSummary[] = input.rosterPlayers.map((player) => {
    const playerResults = results.filter((result) => result.playerId === player.playerId);

    return {
      playerId: player.playerId,
      playerName: player.name,
      visibleProfileCount: playerResults.filter((result) => result.visibleAsCandidate).length,
      highFitProfileCount: playerResults.filter((result) => result.visibleAsCandidate && result.fitBand === "high").length,
      mediumFitProfileCount: playerResults.filter((result) => result.visibleAsCandidate && result.fitBand === "medium").length,
      excludedProfileCount: playerResults.filter((result) => result.eligibilityStatus === "excluded").length,
      penalizedProfileCount: playerResults.filter((result) => result.eligibilityStatus === "penalized").length,
      universalGuardApplied: playerResults.some((result) => result.exclusionReasons.includes("universal_match_guard")),
    };
  });

  const playerStrongFitAllProfilesCount = input.rosterPlayers.filter((player) =>
    !isGoalkeeper(player) && (highVisibleByPlayer.get(player.playerId) ?? 0) >= profileOrder.length
  ).length;
  const goalkeeperStrongFitAllProfilesCount = input.rosterPlayers.filter((player) =>
    isGoalkeeper(player) && (highVisibleByPlayer.get(player.playerId) ?? 0) >= profileOrder.length
  ).length;

  const warnings: string[] = [];
  if (input.rosterPlayers.length < 10) {
    warnings.push("ROSTER_COVERAGE_ROSTER_BELOW_TARGET");
  }
  if (results.length < 30) {
    warnings.push("ROSTER_COVERAGE_EVALUATED_PAIR_COUNT_BELOW_TARGET");
  }

  return modelWithTags({
    status: input.rosterPlayers.length >= 10 && results.length >= 30 ? "available" : "partial",
    origin: "player_matchup_calibration",
    rosterSize: input.rosterPlayers.length,
    profileCount: profileOrder.length,
    evaluatedPairCount: results.length,
    visibleCandidateCount: visibleResults.length,
    credibleCandidateCount: visibleResults.length,
    excludedCandidateCount: results.filter((result) => result.eligibilityStatus === "excluded").length,
    penalizedCandidateCount: results.filter((result) => result.eligibilityStatus === "penalized").length,
    emptyProfileBlockCount: profileSummaries.filter((summary) => summary.emptyStateUsed).length,
    highFitCount: results.filter((result) => result.fitBand === "high").length,
    mediumFitCount: results.filter((result) => result.fitBand === "medium").length,
    lowFitCount: results.filter((result) => result.fitBand === "low").length,
    notCompatibleCount: results.filter((result) => result.fitBand === "not_compatible").length,
    goalkeeperOutfieldExclusionCount: results.filter((result) => result.exclusionReasons.includes("goalkeeper_outfield_mismatch")).length,
    universalMatchGuardTriggeredCount: results.filter((result) => result.exclusionReasons.includes("universal_match_guard")).length,
    repeatedSamePlayerAcrossProfilesCount: [...visibleByPlayer.values()].filter((count) => count > 1).length,
    maxVisibleProfilesPerPlayer: 2,
    playerStrongFitAllProfilesCount,
    goalkeeperStrongFitAllProfilesCount,
    profileSummaries,
    playerSummaries,
    noAutomaticSelection: true,
    playerSelectedCount: 0,
    automaticSelectionCount: 0,
    lineupMutationCount: 0,
    startersMutationCount: 0,
    benchMutationCount: 0,
    confidenceUpgradeCount: 0,
    officiallyConfirmedCount: 0,
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
    warnings,
  });
}

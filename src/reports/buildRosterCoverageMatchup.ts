import type { PlayerSnapshot } from "../contracts/engineToCoach";
import { PlayerRole } from "../models/player";
import type { PlayerMatchupViewModel } from "./playerMatchupView";
import {
  buildRosterCoverageMatchupTags,
  type RosterCoverageMatchupModel,
  type RosterCoveragePlayerSummary,
  type RosterCoverageProfileSummary,
  type RosterCoverageVisibleCandidate,
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

const roleLabels: Readonly<Record<PlayerRole, string>> = {
  [PlayerRole.LeftAnchor]: "Left Anchor",
  [PlayerRole.RightAnchor]: "Right Anchor",
  [PlayerRole.HookLink]: "Hook Link",
  [PlayerRole.MobileLock]: "Mobile Lock",
  [PlayerRole.ForwardLeader]: "Forward Leader",
  [PlayerRole.TempoHalf]: "Tempo Half",
  [PlayerRole.Playmaker]: "Playmaker",
  [PlayerRole.PowerRunner]: "Power Runner",
  [PlayerRole.SpaceHunter]: "Space Hunter",
  [PlayerRole.FreeSafety]: "Free Safety",
  [PlayerRole.GoalkeeperFreeSafety]: "Goalkeeper / Free Safety",
  [PlayerRole.Pivot]: "Pivot",
  [PlayerRole.LeftPiston]: "Left Piston",
  [PlayerRole.RightPiston]: "Right Piston",
};

function isGoalkeeper(player: PlayerSnapshot): boolean {
  return player.role === PlayerRole.GoalkeeperFreeSafety || player.role === PlayerRole.FreeSafety;
}

function fallbackVisibleCandidate(input: {
  readonly player: PlayerSnapshot | undefined;
  readonly profileId: string;
  readonly profileTitle: string;
  readonly result: PlayerMatchupCalibrationModel["calibrationResults"][number];
}): RosterCoverageVisibleCandidate {
  const playerName = input.player?.name ?? input.result.playerName;
  const currentRoleLabel = input.player === undefined ? "Role non disponible" : roleLabels[input.player.role];
  const visibleTraits = input.player?.traits.map((trait) => trait.replaceAll("_", " ")) ?? [];

  const candidate: RosterCoverageVisibleCandidate = {
    profileId: input.profileId,
    profileTitle: input.profileTitle,
    playerId: input.result.playerId,
    playerName,
    currentRoleLabel,
    fitBand: input.result.fitBand === "high" ? "high" : (input.result.fitBand === "medium" ? "medium" : "low"),
    fitScore: input.result.calibratedFitScore,
    matchedAttributes: [],
    partialAttributes: [],
    missingAttributes: input.result.requiredAttributeGapCount > 0
      ? [`${input.result.requiredAttributeGapCount} attribut(s) requis a confirmer`]
      : [],
    whyVisible: [
      `${playerName} reste visible apres calibration role-attributs pour ce profil.`,
      `Score calibre : ${input.result.calibratedFitScore}/100.`,
    ],
    riskNotes: [
      input.result.tacticalRiskScore >= 45
        ? `Risque tactique calibre : ${input.result.tacticalRiskScore}/100.`
        : "Le risque principal reste de confirmer ce signal sur plusieurs matchs.",
    ],
    limitNotes: input.result.penaltyReasons.length > 0
      ? input.result.penaltyReasons
      : ["Comparaison non appliquee, a confirmer sur plusieurs matchs."],
    nextObservationSignals: [
      "Verifier si le signal reste visible sans changer la composition.",
    ],
    visibleTraits,
  };

  return {
    ...candidate,
    ...(input.result.rawFitScore === undefined ? {} : { rawFitScore: input.result.rawFitScore }),
    ...(input.result.calibratedFitScore === undefined ? {} : { calibratedFitScore: input.result.calibratedFitScore }),
  };
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
  readonly playerMatchupView?: PlayerMatchupViewModel;
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
  const matchupCandidateByProfileAndPlayer = new Map(
    (input.playerMatchupView?.blocks ?? []).flatMap((block) =>
      block.candidates.map((candidate) => [
        `${block.profileId}::${candidate.playerId}`,
        {
          profileId: block.profileId,
          profileTitle: block.profileTitle,
          playerId: candidate.playerId,
          playerName: candidate.playerName,
          currentRoleLabel: candidate.currentRoleLabel,
          fitBand: candidate.fitBand,
          fitScore: candidate.fitScore,
          matchedAttributes: candidate.matchedAttributes,
          partialAttributes: candidate.partialAttributes,
          missingAttributes: candidate.missingAttributes,
          whyVisible: candidate.calibrationWhyVisible ?? candidate.whyStudy,
          riskNotes: candidate.riskIfUsed,
          limitNotes: candidate.calibrationLimits ?? [],
          nextObservationSignals: candidate.nextObservationSignal,
          visibleTraits: (playerById.get(candidate.playerId)?.traits ?? []).map((trait) => trait.replaceAll("_", " ")),
          ...(candidate.rawFitScore === undefined ? {} : { rawFitScore: candidate.rawFitScore }),
          ...(candidate.calibratedFitScore === undefined ? {} : { calibratedFitScore: candidate.calibratedFitScore }),
        } satisfies RosterCoverageVisibleCandidate,
      ] as const),
    ),
  );
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
    const visibleCandidates = visibleProfileResults.map((result) =>
      matchupCandidateByProfileAndPlayer.get(`${profileId}::${result.playerId}`) ?? fallbackVisibleCandidate({
        player: playerById.get(result.playerId),
        profileId,
        profileTitle: profileTitles[profileId],
        result,
      })
    );

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
      visibleCandidates,
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

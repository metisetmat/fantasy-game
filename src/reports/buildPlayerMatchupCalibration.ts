import type { PlayerSnapshot } from "../contracts/engineToCoach";
import { PlayerRole } from "../models/player";
import type {
  PlayerMatchupCandidate,
  PlayerMatchupProfileBlock,
  PlayerMatchupViewModel,
} from "./playerMatchupView";
import {
  buildPlayerMatchupCalibrationTags,
  MAX_VISIBLE_PROFILE_MATCHES_PER_PLAYER,
  type PlayerMatchupCalibratedFitBand,
  type PlayerMatchupCalibrationModel,
  type PlayerMatchupCalibrationResult,
  type PlayerProfileEligibilityStatus,
  type PlayerProfileExclusionReason,
  type PlayerProfileRoleConstraint,
} from "./playerMatchupCalibration";

type CandidateContext = {
  readonly block: PlayerMatchupProfileBlock;
  readonly candidate: PlayerMatchupCandidate;
  readonly player: PlayerSnapshot | null;
};

const goalkeeperRoles: readonly PlayerRole[] = [
  PlayerRole.GoalkeeperFreeSafety,
  PlayerRole.FreeSafety,
];

export const playerMatchupProfileConstraints: readonly PlayerProfileRoleConstraint[] = [
  {
    profileId: "support_near_z4_hsr_profile",
    allowedRoleLabels: ["relayeur mobile", "lien intÃ©rieur", "soutien crÃ©atif", "soutien mobile", "porteur de continuitÃ©", "joueur de liaison"],
    penalizedRoleLabels: ["finisseur pur", "dÃ©fenseur trÃ¨s bas", "ancre dÃ©fensive", "gardien / libero dÃ©fensif"],
    excludedRoleLabels: ["goalkeeper", "pure goalkeeper", "isolated shot-stopper"],
    goalkeeperAllowed: false,
    minimumRequiredAttributeMatchCount: 3,
    minimumFitScoreForVisibleCandidate: 55,
  },
  {
    profileId: "second_ball_presence_profile",
    allowedRoleLabels: ["chasseur de second ballon", "attaquant de pression", "gros volume de course", "relayeur intense", "dÃ©fenseur agressif", "rÃ©cupÃ©rateur mobile"],
    penalizedRoleLabels: ["meneur statique", "gardien", "dÃ©fenseur trop bas", "joueur Ã  faible endurance"],
    excludedRoleLabels: ["pure goalkeeper", "stationary goalkeeper"],
    goalkeeperAllowed: false,
    minimumRequiredAttributeMatchCount: 4,
    minimumFitScoreForVisibleCandidate: 60,
  },
  {
    profileId: "strong_goalkeeper_response_profile",
    allowedRoleLabels: ["option de continuitÃ©", "second crÃ©ateur", "receveur de soutien", "ancre de rest-defense", "joueur de soutien prudent", "organisateur"],
    penalizedRoleLabels: ["pur finisseur", "chasseur de second ballon trop agressif", "joueur peu disciplinÃ©"],
    excludedRoleLabels: [],
    goalkeeperAllowed: true,
    minimumRequiredAttributeMatchCount: 3,
    minimumFitScoreForVisibleCandidate: 55,
  },
];

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function constraintFor(profileId: string): PlayerProfileRoleConstraint {
  return playerMatchupProfileConstraints.find((constraint) => constraint.profileId === profileId) ??
    playerMatchupProfileConstraints[0]!;
}

function isGoalkeeper(player: PlayerSnapshot | null, candidate: PlayerMatchupCandidate): boolean {
  return player === null
    ? candidate.currentRoleLabel.toLocaleLowerCase("fr-FR").includes("goalkeeper")
    : goalkeeperRoles.includes(player.role);
}

function hasRoleFamily(block: PlayerMatchupProfileBlock, labels: readonly string[]): boolean {
  const lowerLabels = new Set(labels.map((label) => label.toLocaleLowerCase("fr-FR")));

  return block.roleFamilies.some((role) => lowerLabels.has(role.toLocaleLowerCase("fr-FR")));
}

function roleCompatibilityScore(input: {
  readonly block: PlayerMatchupProfileBlock;
  readonly constraint: PlayerProfileRoleConstraint;
  readonly goalkeeper: boolean;
}): number {
  if (input.goalkeeper && !input.constraint.goalkeeperAllowed) {
    return 5;
  }

  if (hasRoleFamily(input.block, input.constraint.allowedRoleLabels)) {
    return input.goalkeeper ? 68 : 82;
  }

  if (hasRoleFamily(input.block, input.constraint.penalizedRoleLabels)) {
    return 44;
  }

  return 58;
}

function calibratedBand(score: number): PlayerMatchupCalibratedFitBand {
  if (score >= 78) {
    return "high";
  }

  if (score >= 58) {
    return "medium";
  }

  if (score >= 45) {
    return "low";
  }

  return "not_compatible";
}

function capBand(
  band: PlayerMatchupCalibratedFitBand,
  maximum: PlayerMatchupCalibratedFitBand,
): PlayerMatchupCalibratedFitBand {
  const order: readonly PlayerMatchupCalibratedFitBand[] = ["not_compatible", "low", "medium", "high"];
  const current = order.indexOf(band);
  const max = order.indexOf(maximum);

  return order[Math.min(current, max)] ?? "not_compatible";
}

function resultForContext(context: CandidateContext): PlayerMatchupCalibrationResult {
  const constraint = constraintFor(context.block.profileId);
  const goalkeeper = isGoalkeeper(context.player, context.candidate);
  const missingCriticalCount = context.candidate.missingAttributes.length;
  const matchedCount = context.candidate.matchedAttributes.length;
  const exclusionReasons: PlayerProfileExclusionReason[] = [];
  const penaltyReasons: string[] = [];
  const fatigueRiskScore = context.player === null
    ? 35
    : clampScore(100 - Math.min(context.player.currentCondition, context.player.mentalFreshness));
  const roleScore = roleCompatibilityScore({
    block: context.block,
    constraint,
    goalkeeper,
  });
  const positionalCompatibilityScore = goalkeeper && !constraint.goalkeeperAllowed ? 10 : (goalkeeper ? 62 : 78);
  const tacticalRiskScore = clampScore((100 - roleScore) + fatigueRiskScore / 2 + missingCriticalCount * 8);

  if (goalkeeper && !constraint.goalkeeperAllowed) {
    exclusionReasons.push("goalkeeper_outfield_mismatch");
  }

  if (hasRoleFamily(context.block, constraint.excludedRoleLabels)) {
    exclusionReasons.push("role_family_incompatible");
  }

  if (matchedCount < constraint.minimumRequiredAttributeMatchCount) {
    exclusionReasons.push("insufficient_required_attributes");
  }

  if (fatigueRiskScore >= 62) {
    exclusionReasons.push("fatigue_risk_too_high");
  }

  if (hasRoleFamily(context.block, constraint.penalizedRoleLabels)) {
    penaltyReasons.push("Famille de rÃ´le Ã  manier avec prudence pour ce profil.");
  }

  if (goalkeeper && constraint.goalkeeperAllowed) {
    penaltyReasons.push("Gardien visible uniquement comme stabilisation dÃ©fensive, pas comme soutien offensif.");
  }

  if (context.block.profileId === "second_ball_presence_profile") {
    const lacksAcceleration = context.candidate.missingAttributes.includes("accÃ©lÃ©ration");
    const lacksEndurance = context.candidate.missingAttributes.includes("endurance");

    if (lacksAcceleration || lacksEndurance) {
      penaltyReasons.push("AccÃ©lÃ©ration ou endurance Ã  confirmer pour attaquer les seconds ballons.");
    }

    if (lacksAcceleration && lacksEndurance) {
      exclusionReasons.push("insufficient_required_attributes");
    }
  }

  const rawFitScore = context.candidate.fitScore;
  const calibratedFitScore = exclusionReasons.length > 0
    ? clampScore(rawFitScore - 42)
    : clampScore(rawFitScore * 0.72 + roleScore * 0.2 + positionalCompatibilityScore * 0.08 - fatigueRiskScore * 0.18 - missingCriticalCount * 5);
  const eligibilityStatus: PlayerProfileEligibilityStatus = exclusionReasons.length > 0
    ? "excluded"
    : (penaltyReasons.length > 0 ? "penalized" : "eligible");
  const cappedBand = eligibilityStatus === "excluded"
    ? "not_compatible"
    : capBand(
        missingCriticalCount >= 2
          ? capBand(calibratedBand(calibratedFitScore), "low")
          : (missingCriticalCount >= 1 || eligibilityStatus === "penalized"
              ? capBand(calibratedBand(calibratedFitScore), "medium")
              : calibratedBand(calibratedFitScore)),
        "high",
      );
  const visibleAsCandidate = eligibilityStatus !== "excluded" &&
    cappedBand !== "low" &&
    cappedBand !== "not_compatible" &&
    calibratedFitScore >= constraint.minimumFitScoreForVisibleCandidate;

  return {
    playerId: context.candidate.playerId,
    playerName: context.candidate.playerName,
    profileId: context.block.profileId,
    rawFitScore,
    calibratedFitScore,
    fitBand: cappedBand,
    eligibilityStatus,
    exclusionReasons,
    penaltyReasons,
    requiredAttributeMatchCount: matchedCount,
    requiredAttributeGapCount: missingCriticalCount,
    roleCompatibilityScore: roleScore,
    positionalCompatibilityScore,
    fatigueRiskScore,
    tacticalRiskScore,
    visibleAsCandidate,
    canBeSelected: false,
    canDriveLineup: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
  };
}

function applyUniversalGuard(results: readonly PlayerMatchupCalibrationResult[]): readonly PlayerMatchupCalibrationResult[] {
  const visibleByPlayer = new Map<string, readonly PlayerMatchupCalibrationResult[]>();

  for (const result of results.filter((item) => item.visibleAsCandidate)) {
    visibleByPlayer.set(result.playerId, [...(visibleByPlayer.get(result.playerId) ?? []), result]);
  }

  const guardedIds = new Set<string>();
  for (const [playerId, playerResults] of visibleByPlayer) {
    const sorted = [...playerResults].sort((a, b) => b.calibratedFitScore - a.calibratedFitScore || a.profileId.localeCompare(b.profileId));

    sorted.slice(MAX_VISIBLE_PROFILE_MATCHES_PER_PLAYER).forEach((result) => guardedIds.add(`${playerId}:${result.profileId}`));
  }

  if (guardedIds.size === 0) {
    return results;
  }

  return results.map((result) => {
    if (!guardedIds.has(`${result.playerId}:${result.profileId}`)) {
      return result;
    }

    return {
      ...result,
      fitBand: capBand(result.fitBand, "medium"),
      visibleAsCandidate: false,
      eligibilityStatus: "excluded",
      exclusionReasons: [...result.exclusionReasons, "universal_match_guard"],
      penaltyReasons: [...result.penaltyReasons, "Garde anti-joueur-universel : le joueur ne doit pas ressortir partout."],
    };
  });
}

function buildModel(input: Omit<PlayerMatchupCalibrationModel, "tags">): PlayerMatchupCalibrationModel {
  return {
    ...input,
    tags: buildPlayerMatchupCalibrationTags(input),
  };
}

export function buildPlayerMatchupCalibration(input: {
  readonly matchupView: PlayerMatchupViewModel;
  readonly rosterPlayers: readonly PlayerSnapshot[];
}): PlayerMatchupCalibrationModel {
  if (input.matchupView.status === "not_available") {
    return buildModel({
      status: "not_available",
      origin: "player_matchup_view",
      profileConstraintCount: playerMatchupProfileConstraints.length,
      evaluatedPlayerProfilePairCount: 0,
      visibleCandidateCount: 0,
      excludedCandidateCount: 0,
      penalizedCandidateCount: 0,
      emptyProfileBlockCount: 0,
      goalkeeperOutfieldExclusionCount: 0,
      universalMatchGuardTriggeredCount: 0,
      repeatedSamePlayerAcrossProfilesCount: 0,
      maxVisibleProfilesPerPlayer: MAX_VISIBLE_PROFILE_MATCHES_PER_PLAYER,
      calibrationResults: [],
      noAutomaticSelection: true,
      playerSelectedCount: 0,
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
      warnings: ["Player Matchup Calibration requires an available Player Matchup View."],
    });
  }

  const playerById = new Map(input.rosterPlayers.map((player) => [player.playerId, player] as const));
  const contexts = input.matchupView.blocks.flatMap((block) =>
    block.candidates.map((candidate): CandidateContext => ({
      block,
      candidate,
      player: playerById.get(candidate.playerId) ?? null,
    }))
  );
  const calibrationResults = applyUniversalGuard(contexts.map(resultForContext));
  const visibleResults = calibrationResults.filter((result) => result.visibleAsCandidate);
  const visibleProfileIds = new Set(visibleResults.map((result) => result.profileId));
  const visibleProfileCountByPlayer = new Map<string, number>();

  for (const result of visibleResults) {
    visibleProfileCountByPlayer.set(result.playerId, (visibleProfileCountByPlayer.get(result.playerId) ?? 0) + 1);
  }

  return buildModel({
    status: input.rosterPlayers.length === 0 ? "partial" : "available",
    origin: "player_matchup_view",
    profileConstraintCount: playerMatchupProfileConstraints.length,
    evaluatedPlayerProfilePairCount: calibrationResults.length,
    visibleCandidateCount: visibleResults.length,
    excludedCandidateCount: calibrationResults.filter((result) => result.eligibilityStatus === "excluded").length,
    penalizedCandidateCount: calibrationResults.filter((result) => result.eligibilityStatus === "penalized").length,
    emptyProfileBlockCount: input.matchupView.blocks.filter((block) => !visibleProfileIds.has(block.profileId)).length,
    goalkeeperOutfieldExclusionCount: calibrationResults.filter((result) => result.exclusionReasons.includes("goalkeeper_outfield_mismatch")).length,
    universalMatchGuardTriggeredCount: calibrationResults.filter((result) => result.exclusionReasons.includes("universal_match_guard")).length,
    repeatedSamePlayerAcrossProfilesCount: [...visibleProfileCountByPlayer.values()].filter((count) => count > 1).length,
    maxVisibleProfilesPerPlayer: MAX_VISIBLE_PROFILE_MATCHES_PER_PLAYER,
    calibrationResults,
    noAutomaticSelection: true,
    playerSelectedCount: 0,
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
    warnings: [],
  });
}

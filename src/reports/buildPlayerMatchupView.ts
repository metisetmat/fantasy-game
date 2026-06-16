import type { PlayerSnapshot } from "../contracts/engineToCoach";
import { PlayerRole, type PlayerAttributes } from "../models/player";
import { buildPlayerMatchupCalibration } from "./buildPlayerMatchupCalibration";
import {
  buildPlayerMatchupViewTags,
  type PlayerMatchupAttributeComparison,
  type PlayerMatchupAttributeSignal,
  type PlayerMatchupCandidate,
  type PlayerMatchupFitBand,
  type PlayerMatchupProfileBlock,
  type PlayerMatchupViewModel,
} from "./playerMatchupView";
import type {
  PlayerMatchupCalibrationModel,
  PlayerMatchupCalibrationResult,
} from "./playerMatchupCalibration";
import {
  selectionPreviewProfileAttributeLabels,
  selectionPreviewProfileRoleFamilyLabels,
  type SelectionPreviewProfileAttribute,
  type SelectionPreviewProfileCard,
  type SelectionPreviewProfileRoleFamily,
  type SelectionPreviewProfileViewModel,
} from "./selectionPreviewProfileView";

type AttributeScoreInput = {
  readonly attributes: PlayerAttributes;
  readonly currentCondition: number;
  readonly mentalFreshness: number;
};

const EXPECTED_PROFILE_VALUE_LABEL = "attendu profil 70+";

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

const roleFamilyRoleFit: Readonly<Record<SelectionPreviewProfileRoleFamily, readonly PlayerRole[]>> = {
  support_runner: [PlayerRole.HookLink, PlayerRole.LeftPiston, PlayerRole.RightPiston, PlayerRole.TempoHalf],
  mobile_lock: [PlayerRole.MobileLock, PlayerRole.ForwardLeader, PlayerRole.Pivot],
  hook_link: [PlayerRole.HookLink, PlayerRole.TempoHalf, PlayerRole.Playmaker],
  playmaker_support: [PlayerRole.Playmaker, PlayerRole.TempoHalf, PlayerRole.HookLink],
  rebound_chaser: [PlayerRole.MobileLock, PlayerRole.SpaceHunter, PlayerRole.PowerRunner, PlayerRole.LeftPiston, PlayerRole.RightPiston],
  pressure_forward: [PlayerRole.ForwardLeader, PlayerRole.SpaceHunter, PlayerRole.PowerRunner],
  high_work_rate_runner: [PlayerRole.LeftPiston, PlayerRole.RightPiston, PlayerRole.SpaceHunter, PlayerRole.MobileLock],
  continuity_option: [PlayerRole.TempoHalf, PlayerRole.Playmaker, PlayerRole.HookLink, PlayerRole.Pivot],
  secondary_playmaker: [PlayerRole.Playmaker, PlayerRole.TempoHalf, PlayerRole.HookLink],
  support_receiver: [PlayerRole.HookLink, PlayerRole.LeftPiston, PlayerRole.RightPiston, PlayerRole.Pivot],
  rest_defense_anchor: [PlayerRole.Pivot, PlayerRole.MobileLock, PlayerRole.ForwardLeader, PlayerRole.GoalkeeperFreeSafety],
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

function attributeScore(attribute: SelectionPreviewProfileAttribute, input: AttributeScoreInput): number {
  const a = input.attributes;

  switch (attribute) {
    case "anticipation":
      return clampScore(average([a.intelligence, a.mental]));
    case "decision_making":
      return clampScore(average([a.intelligence, a.mental, a.footPlayPassingShooting]));
    case "positioning":
      return clampScore(average([a.intelligence, a.mental, input.currentCondition]));
    case "off_ball_support":
      return clampScore(average([a.intelligence, a.endurance, a.agility]));
    case "handling":
      return clampScore(average([a.handPlay, a.footPlayDribble, a.footPlayPassingShooting]));
    case "reaction":
      return clampScore(average([a.agility, a.speed, a.mental]));
    case "acceleration":
      return clampScore(average([a.speed, a.agility]));
    case "aggression":
      return clampScore(average([a.power, a.mental]));
    case "balance":
      return clampScore(average([a.agility, a.power, a.endurance]));
    case "composure":
      return clampScore(average([a.mental, input.mentalFreshness]));
    case "tactical_discipline":
      return clampScore(average([a.intelligence, a.mental, input.mentalFreshness]));
    case "stamina":
      return clampScore(average([a.endurance, input.currentCondition]));
    case "mental_freshness":
      return clampScore(average([input.mentalFreshness, a.mental]));
  }
}

function signalForScore(score: number): PlayerMatchupAttributeSignal {
  if (score >= 72) {
    return "match";
  }

  if (score >= 58) {
    return "partial";
  }

  return "gap";
}

function fitBand(score: number): PlayerMatchupFitBand {
  if (score >= 75) {
    return "high";
  }

  if (score >= 50) {
    return "medium";
  }

  return "low";
}

function visibleFitBandFromCalibration(result: PlayerMatchupCalibrationResult): PlayerMatchupFitBand {
  return result.fitBand === "high" ? "high" : "medium";
}

function roleFitBonus(card: SelectionPreviewProfileCard, player: PlayerSnapshot): number {
  const matchingFamilies = card.roleFamilies.filter((family) => roleFamilyRoleFit[family].includes(player.role));

  return Math.min(10, matchingFamilies.length * 4);
}

function comparisonForAttribute(
  attribute: SelectionPreviewProfileAttribute,
  player: PlayerSnapshot,
): PlayerMatchupAttributeComparison {
  const score = attributeScore(attribute, {
    attributes: player.attributes,
    currentCondition: player.currentCondition,
    mentalFreshness: player.mentalFreshness,
  });
  const signal = signalForScore(score);
  const label = selectionPreviewProfileAttributeLabels[attribute];

  return {
    attributeLabel: label,
    playerValueLabel: `${score}/100`,
    expectedProfileValueLabel: EXPECTED_PROFILE_VALUE_LABEL,
    signal,
    explanation: signal === "match"
      ? `${label} ressort comme un atout visible pour ce profil.`
      : (signal === "partial"
          ? `${label} semble exploitable, mais doit être confirmé dans le contexte du rôle.`
          : `${label} reste un point à vérifier avant d'utiliser ce joueur dans ce profil.`),
  };
}

function candidateForPlayer(card: SelectionPreviewProfileCard, player: PlayerSnapshot): PlayerMatchupCandidate {
  const comparisons = card.usefulAttributes.map((attribute) => comparisonForAttribute(attribute, player));
  const matchedAttributes = comparisons.filter((comparison) => comparison.signal === "match").map((comparison) => comparison.attributeLabel);
  const partialAttributes = comparisons.filter((comparison) => comparison.signal === "partial").map((comparison) => comparison.attributeLabel);
  const missingAttributes = comparisons.filter((comparison) => comparison.signal === "gap").map((comparison) => comparison.attributeLabel);
  const baseScore = average(comparisons.map((comparison) => Number.parseInt(comparison.playerValueLabel, 10)));
  const fitScore = clampScore(baseScore + roleFitBonus(card, player));

  return {
    playerId: player.playerId,
    playerName: player.name,
    currentRoleLabel: roleLabels[player.role],
    fitBand: fitBand(fitScore),
    fitScore,
    matchedAttributes,
    partialAttributes,
    missingAttributes,
    attributeComparisons: comparisons,
    whyStudy: [
      `À étudier pour le profil : ${card.title.replace("Profil à observer — ", "").toLocaleLowerCase("fr-FR")}.`,
      matchedAttributes.length > 0
        ? `Atouts visibles : ${matchedAttributes.slice(0, 3).join(", ")}.`
        : "Le profil peut être observé, mais aucun atout net ne ressort encore.",
    ],
    whatIsMissing: missingAttributes.length > 0
      ? missingAttributes.slice(0, 3).map((attribute) => `${attribute} à confirmer.`)
      : ["Aucun manque majeur dans cette comparaison, mais le signal reste à confirmer sur plusieurs matchs."],
    riskIfUsed: [
      "Risque de sur-interpréter une compatibilité de profil sans répétition sur plusieurs matchs.",
      partialAttributes.length > 0
        ? `Les signaux partiels (${partialAttributes.slice(0, 2).join(", ")}) peuvent rendre le rôle instable sous pression.`
        : "Le risque principal reste le changement de contexte tactique.",
    ],
    nextObservationSignal: [
      card.nextMatchSignalToVerify[0] ?? "Vérifier si le joueur reproduit ce signal au prochain match.",
      missingAttributes[0] === undefined
        ? "Observer si la compatibilité reste visible sans changer la composition."
        : `Observer si ${missingAttributes[0]} progresse dans le contexte du profil.`,
    ],
    nonAppliedLabel: "Comparaison non appliquée",
    confirmationLabel: "Non confirmée comme recommandation officielle",
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
  };
}

function blockFromProfile(card: SelectionPreviewProfileCard, rosterPlayers: readonly PlayerSnapshot[]): PlayerMatchupProfileBlock {
  const candidates = rosterPlayers
    .map((player) => candidateForPlayer(card, player))
    .sort((a, b) => b.fitScore - a.fitScore || a.playerName.localeCompare(b.playerName))
    .slice(0, Math.max(4, rosterPlayers.length));
  const highFitCount = candidates.filter((candidate) => candidate.fitBand === "high").length;
  const mediumFitCount = candidates.filter((candidate) => candidate.fitBand === "medium").length;
  const lowFitCount = candidates.filter((candidate) => candidate.fitBand === "low").length;

  return {
    profileId: card.cardId,
    profileTitle: card.title,
    roleFamilies: card.roleFamilies.map((role) => selectionPreviewProfileRoleFamilyLabels[role]),
    usefulAttributes: card.usefulAttributes.map((attribute) => selectionPreviewProfileAttributeLabels[attribute]),
    candidates,
    emptyState: candidates.length === 0
      ? "Aucun joueur ne ressort clairement pour ce profil dans ce run. Le profil reste à observer, sans joueur associé."
      : null,
    candidateCount: candidates.length,
    highFitCount,
    mediumFitCount,
    lowFitCount,
    noAutomaticSelection: true,
    profileStillNonApplied: true,
    officiallyConfirmed: false,
  };
}

function calibratedWhyVisible(result: PlayerMatchupCalibrationResult, candidate: PlayerMatchupCandidate): readonly string[] {
  const strongest = candidate.matchedAttributes.slice(0, 3);
  const profileLabel = result.profileId === "strong_goalkeeper_response_profile" && candidate.currentRoleLabel.includes("Goalkeeper")
    ? "Profil dÃ©fensif Ã  Ã©tudier pour stabiliser la suite de l'action."
    : "Pourquoi ce joueur est visible aprÃ¨s filtrage par rÃ´le, attributs et contexte.";

  return [
    profileLabel,
    strongest.length > 0
      ? `Atouts visibles aprÃ¨s calibration : ${strongest.join(", ")}.`
      : "Le joueur reste visible par compatibilitÃ© contextuelle, mais les atouts doivent Ãªtre confirmÃ©s.",
    `Score calibrÃ© : ${result.calibratedFitScore}/100; compatibilitÃ© de rÃ´le : ${result.roleCompatibilityScore}/100.`,
  ];
}

function calibratedMissing(candidate: PlayerMatchupCandidate): readonly string[] {
  if (candidate.missingAttributes.length === 0) {
    return [
      "VÃ©rifier que les atouts visibles restent prÃ©sents dans un autre contexte de match.",
      "Confirmer que le rÃ´le ne dÃ©forme pas l'Ã©quilibre collectif.",
    ];
  }

  return candidate.missingAttributes.slice(0, 3).map((attribute) => `${attribute} Ã  confirmer avant d'Ã©tendre l'observation.`);
}

function calibratedRisks(result: PlayerMatchupCalibrationResult): readonly string[] {
  const risks = [
    ...result.penaltyReasons,
    result.requiredAttributeGapCount > 0
      ? `${result.requiredAttributeGapCount} attribut(s) requis restent Ã  confirmer.`
      : "Risque principal : sur-interprÃ©ter un signal isolÃ© sans rÃ©pÃ©tition.",
    result.tacticalRiskScore >= 45
      ? `Risque tactique calibrÃ© : ${result.tacticalRiskScore}/100.`
      : "Le risque tactique reste modÃ©rÃ© dans cette comparaison non appliquÃ©e.",
  ];

  return risks.slice(0, 3);
}

function calibratedLimits(result: PlayerMatchupCalibrationResult, candidate: PlayerMatchupCandidate): readonly string[] {
  return [
    result.eligibilityStatus === "penalized"
      ? "CompatibilitÃ© plafonnÃ©e par le contexte de rÃ´le."
      : "CompatibilitÃ© non prescriptive : elle ne transforme pas le joueur en choix de composition.",
    result.fatigueRiskScore > 35
      ? `Risque fatigue Ã  surveiller : ${result.fatigueRiskScore}/100.`
      : "Fatigue non bloquante dans ce run.",
    candidate.partialAttributes.length > 0
      ? `Signaux partiels : ${candidate.partialAttributes.slice(0, 2).join(", ")}.`
      : "Les signaux restent Ã  confirmer par plusieurs matchs.",
  ];
}

function applyCalibrationToBlock(
  block: PlayerMatchupProfileBlock,
  calibration: PlayerMatchupCalibrationModel,
): PlayerMatchupProfileBlock {
  const resultByPlayer = new Map(
    calibration.calibrationResults
      .filter((result) => result.profileId === block.profileId)
      .map((result) => [result.playerId, result] as const),
  );
  const visibleCandidates = block.candidates
    .reduce<PlayerMatchupCandidate[]>((candidates, candidate) => {
      const result = resultByPlayer.get(candidate.playerId);

      if (result === undefined || !result.visibleAsCandidate || result.fitBand === "low" || result.fitBand === "not_compatible") {
        return candidates;
      }

      const whyVisible = calibratedWhyVisible(result, candidate);

      candidates.push({
        ...candidate,
        fitBand: visibleFitBandFromCalibration(result),
        fitScore: result.calibratedFitScore,
        rawFitScore: result.rawFitScore,
        calibratedFitScore: result.calibratedFitScore,
        calibrationWhyVisible: whyVisible,
        calibrationLimits: calibratedLimits(result, candidate),
        whyStudy: whyVisible,
        whatIsMissing: calibratedMissing(candidate),
        riskIfUsed: calibratedRisks(result),
        nextObservationSignal: [
          block.profileId === "strong_goalkeeper_response_profile" && candidate.currentRoleLabel.includes("Goalkeeper")
            ? "Observer si la stabilisation dÃ©fensive aprÃ¨s action neutralisÃ©e reste propre."
            : candidate.nextObservationSignal[0],
          "Confirmer le signal sans changer automatiquement la composition.",
        ].filter((signal): signal is string => signal !== undefined),
      });

      return candidates;
    }, [])
    .sort((a, b) => b.fitScore - a.fitScore || a.playerName.localeCompare(b.playerName))
    .slice(0, 3);
  const highFitCount = visibleCandidates.filter((candidate) => candidate.fitBand === "high").length;
  const mediumFitCount = visibleCandidates.filter((candidate) => candidate.fitBand === "medium").length;
  const lowFitCount = visibleCandidates.filter((candidate) => candidate.fitBand === "low").length;

  return {
    ...block,
    candidates: visibleCandidates,
    emptyState: visibleCandidates.length === 0
      ? "Aucun joueur ne ressort clairement pour ce profil dans ce run. Le profil reste Ã  observer, sans joueur associÃ©."
      : null,
    candidateCount: visibleCandidates.length,
    highFitCount,
    mediumFitCount,
    lowFitCount,
  };
}

function modelWithTags(input: Omit<PlayerMatchupViewModel, "tags">): PlayerMatchupViewModel {
  return {
    ...input,
    tags: buildPlayerMatchupViewTags(input),
  };
}

export function buildPlayerMatchupView(input: {
  readonly profileView: SelectionPreviewProfileViewModel;
  readonly rosterPlayers: readonly PlayerSnapshot[];
}): PlayerMatchupViewModel {
  if (input.profileView.status === "not_available") {
    const unavailable = modelWithTags({
      status: "not_available",
      origin: "selection_preview_profile_view",
      profileBlockCount: 0,
      playerCandidateCount: 0,
      highFitCount: 0,
      mediumFitCount: 0,
      lowFitCount: 0,
      blocks: [],
      noAutomaticSelection: true,
      profileAppliedCount: 0,
      playerSelectedCount: 0,
      lineupMutationCount: 0,
      startersMutationCount: 0,
      benchMutationCount: 0,
      officiallyConfirmedCount: 0,
      confidenceUpgradeCount: 0,
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
      warnings: ["Player Matchup View requires an available Selection Preview Profile View."],
    });

    const calibration = buildPlayerMatchupCalibration({
      matchupView: unavailable,
      rosterPlayers: input.rosterPlayers,
    });

    return modelWithTags({
      ...unavailable,
      calibration,
    });
  }

  const rawBlocks = input.profileView.cards.map((card) => blockFromProfile(card, input.rosterPlayers));
  const rawPlayerCandidateCount = rawBlocks.reduce((sum, block) => sum + block.candidateCount, 0);
  const rawModel = modelWithTags({
    status: input.rosterPlayers.length === 0 ? "partial" : "available",
    origin: "selection_preview_profile_view",
    profileBlockCount: rawBlocks.length,
    playerCandidateCount: rawPlayerCandidateCount,
    highFitCount: rawBlocks.reduce((sum, block) => sum + block.highFitCount, 0),
    mediumFitCount: rawBlocks.reduce((sum, block) => sum + block.mediumFitCount, 0),
    lowFitCount: rawBlocks.reduce((sum, block) => sum + block.lowFitCount, 0),
    blocks: rawBlocks,
    noAutomaticSelection: true,
    profileAppliedCount: 0,
    playerSelectedCount: 0,
    lineupMutationCount: 0,
    startersMutationCount: 0,
    benchMutationCount: 0,
    officiallyConfirmedCount: 0,
    confidenceUpgradeCount: 0,
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
    warnings: input.rosterPlayers.length === 0 ? ["PLAYER_MATCHUP_ROSTER_EMPTY"] : [],
  });
  const calibration = buildPlayerMatchupCalibration({
    matchupView: rawModel,
    rosterPlayers: input.rosterPlayers,
  });
  const blocks = rawBlocks.map((block) => applyCalibrationToBlock(block, calibration));
  const playerCandidateCount = blocks.reduce((sum, block) => sum + block.candidateCount, 0);
  const highFitCount = blocks.reduce((sum, block) => sum + block.highFitCount, 0);
  const mediumFitCount = blocks.reduce((sum, block) => sum + block.mediumFitCount, 0);
  const lowFitCount = blocks.reduce((sum, block) => sum + block.lowFitCount, 0);

  return modelWithTags({
    status: input.rosterPlayers.length === 0 ? "partial" : "available",
    origin: "selection_preview_profile_view",
    profileBlockCount: blocks.length,
    playerCandidateCount,
    highFitCount,
    mediumFitCount,
    lowFitCount,
    blocks,
    calibration,
    noAutomaticSelection: true,
    profileAppliedCount: 0,
    playerSelectedCount: 0,
    lineupMutationCount: 0,
    startersMutationCount: 0,
    benchMutationCount: 0,
    officiallyConfirmedCount: 0,
    confidenceUpgradeCount: 0,
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
    warnings: input.rosterPlayers.length === 0 ? ["PLAYER_MATCHUP_ROSTER_EMPTY"] : [],
  });
}

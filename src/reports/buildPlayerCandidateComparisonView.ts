import {
  buildPlayerCandidateComparisonViewTags,
  type CandidateDifferentiator,
  type CandidateDisplayPriority,
  type PlayerCandidateComparisonCard,
  type PlayerCandidateComparisonProfileBlock,
  type PlayerCandidateComparisonViewModel,
} from "./playerCandidateComparisonView";
import type {
  RosterCoverageMatchupModel,
  RosterCoverageProfileSummary,
  RosterCoverageVisibleCandidate,
} from "./rosterCoverageMatchup";

const PROFILE_SUMMARIES: Readonly<Record<string, string>> = {
  support_near_z4_hsr_profile:
    "Ce profil cherche un soutien proche capable de prolonger la progression sans exposer la structure. Les cartes ci-dessous sont des pistes d'observation, pas des choix de composition.",
  second_ball_presence_profile:
    "Ce profil cherche un joueur capable d'attaquer la deuxieme action et de soutenir la recuperation utile. Les cartes ci-dessous servent a comparer des pistes d'observation, pas a figer un choix de composition.",
  strong_goalkeeper_response_profile:
    "Ce profil cherche une reponse stable quand la premiere action est neutralisee par le gardien ou la defense. Les cartes ci-dessous restent non appliquees et non officielles.",
};

function withPeriod(text: string): string {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return trimmed;
  }

  return /[.!?]$/u.test(trimmed) ? trimmed : `${trimmed}.`;
}

function fitBandLabel(candidate: RosterCoverageVisibleCandidate): PlayerCandidateComparisonCard["fitBandLabel"] {
  switch (candidate.fitBand) {
    case "high":
      return "Compatibilite forte";
    case "medium":
      return "Compatibilite moyenne";
    case "low":
      return "Compatibilite faible";
  }
}

function displayPriorityForIndex(index: number, total: number): CandidateDisplayPriority {
  if (index === 0) {
    return "primary_to_study";
  }

  if (index === 1) {
    return "alternative_to_compare";
  }

  if (index === 2 && total > 2) {
    return "complementary_profile";
  }

  return "detail_only";
}

function firstSentence(values: readonly string[], fallback: string): string {
  const first = values.find((value) => value.trim().length > 0);

  return withPeriod(first ?? fallback);
}

function strongestAsset(candidate: RosterCoverageVisibleCandidate): string {
  if (candidate.matchedAttributes.length > 0) {
    return withPeriod(`${candidate.matchedAttributes[0]} ressort comme son point fort distinctif`);
  }

  if (candidate.partialAttributes.length > 0) {
    return withPeriod(`${candidate.partialAttributes[0]} reste exploitable et differencie ce profil`);
  }

  if (candidate.visibleTraits.length > 0) {
    const firstTrait = candidate.visibleTraits[0];

    return withPeriod(`${(firstTrait ?? "Ce trait visible").replaceAll("_", " ")} aide a comprendre ce profil`);
  }

  return "Le profil reste visible surtout par coherence de role et de contexte.";
}

function mainGapOrCheck(candidate: RosterCoverageVisibleCandidate): string {
  if (candidate.missingAttributes.length > 0) {
    return withPeriod(`${candidate.missingAttributes[0]} reste le premier point a confirmer`);
  }

  if (candidate.partialAttributes.length > 0) {
    return withPeriod(`${candidate.partialAttributes[0]} doit etre confirme sous pression`);
  }

  return firstSentence(candidate.limitNotes, "Verifier si le signal reste present dans un autre contexte de match.");
}

function mainRisk(candidate: RosterCoverageVisibleCandidate): string {
  return firstSentence(candidate.riskNotes, "Le risque principal reste de sur-interpreter un signal encore partiel.");
}

function nextObservation(candidate: RosterCoverageVisibleCandidate): string {
  return firstSentence(candidate.nextObservationSignals, "Verifier si le meme signal reste visible au prochain match.");
}

function buildDifferentiators(input: {
  readonly candidate: RosterCoverageVisibleCandidate;
  readonly strongestVisibleAsset: string;
  readonly mainGapOrCheck: string;
  readonly mainRisk: string;
  readonly nextObservationSignal: string;
}): readonly CandidateDifferentiator[] {
  return [
    {
      title: "Point fort distinctif",
      summary: input.strongestVisibleAsset,
      type: "strength",
    },
    {
      title: "Point a verifier",
      summary: input.mainGapOrCheck,
      type: "gap",
    },
    {
      title: "Risque principal",
      summary: input.mainRisk,
      type: "risk",
    },
    {
      title: "Contexte de role",
      summary: withPeriod(`Role actuel : ${input.candidate.currentRoleLabel}`),
      type: "role_context",
    },
    {
      title: "A verifier au prochain match",
      summary: input.nextObservationSignal,
      type: "next_observation",
    },
  ];
}

function cardFromCandidate(
  candidate: RosterCoverageVisibleCandidate,
  index: number,
  total: number,
): PlayerCandidateComparisonCard {
  const displayPriority = displayPriorityForIndex(index, total);
  const compactVisible = displayPriority !== "detail_only";
  const strongestVisibleAsset = strongestAsset(candidate);
  const gapOrCheck = mainGapOrCheck(candidate);
  const risk = mainRisk(candidate);
  const nextSignal = nextObservation(candidate);

  return {
    playerId: candidate.playerId,
    playerName: candidate.playerName,
    roleLabel: candidate.currentRoleLabel,
    displayPriority,
    fitBandLabel: fitBandLabel(candidate),
    calibratedFitScore: candidate.calibratedFitScore ?? candidate.fitScore,
    shortWhyVisible: firstSentence(
      candidate.whyVisible,
      `${candidate.playerName} reste visible par compatibilite de role et de contexte pour ce profil.`,
    ),
    strongestVisibleAsset,
    mainGapOrCheck: gapOrCheck,
    mainRisk: risk,
    nextObservationSignal: nextSignal,
    differentiators: buildDifferentiators({
      candidate,
      strongestVisibleAsset,
      mainGapOrCheck: gapOrCheck,
      mainRisk: risk,
      nextObservationSignal: nextSignal,
    }),
    compactVisible,
    detailsCollapsedByDefault: true,
    matchedAttributes: candidate.matchedAttributes,
    partialAttributes: candidate.partialAttributes,
    missingAttributes: candidate.missingAttributes,
    visibleTraits: candidate.visibleTraits,
    limitNotes: candidate.limitNotes,
    nonAppliedLabel: "Comparaison non appliquee",
    confirmationLabel: "Non confirmee comme recommandation officielle",
    canBeSelected: false,
    canChangeLineup: false,
    canChangeStarters: false,
    canChangeBench: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
  };
}

function comparisonSummary(cards: readonly PlayerCandidateComparisonCard[]): readonly string[] {
  const compact = cards.filter((card) => card.compactVisible);

  if (compact.length === 0) {
    return ["Aucune piste credible ne ressort dans ce run, donc le profil reste une question ouverte."];
  }

  const firstCompact = compact[0];

  const bullets: string[] = [
    `${firstCompact?.playerName ?? "Le premier candidat"} apporte d'abord ${(firstCompact?.strongestVisibleAsset ?? "un signal utile").toLocaleLowerCase("fr-FR")}`,
  ];

  if (compact[1] !== undefined) {
    bullets.push(
      `${compact[1].playerName} offre une alternative a comparer avec ${compact[1].strongestVisibleAsset.toLocaleLowerCase("fr-FR")}`,
    );
  }

  if (compact[2] !== undefined) {
    bullets.push(
      `${compact[2].playerName} propose un profil complementaire, utile si l'on cherche un autre equilibre de risque`,
    );
  }

  return bullets.map((bullet) => withPeriod(bullet));
}

function emptyStateForProfile(profile: RosterCoverageProfileSummary): string {
  return withPeriod(
    `Aucun candidat credible n'est visible pour ${profile.profileTitle.toLocaleLowerCase("fr-FR")} dans ce run. Le profil reste a observer sans comparaison appliquee.`,
  );
}

function blockFromProfile(profile: RosterCoverageProfileSummary): PlayerCandidateComparisonProfileBlock {
  const cards = profile.visibleCandidates
    .slice()
    .sort((a, b) =>
      (b.calibratedFitScore ?? b.fitScore) - (a.calibratedFitScore ?? a.fitScore) ||
      a.playerName.localeCompare(b.playerName, "fr-FR"),
    )
    .map((candidate, index, all) => cardFromCandidate(candidate, index, all.length));
  const compactCandidateCount = cards.filter((card) => card.compactVisible).length;
  const detailOnlyCandidateCount = cards.length - compactCandidateCount;
  const primaryCandidateCount = cards.filter((card) => card.displayPriority === "primary_to_study").length;
  const alternativeCandidateCount = cards.filter((card) => card.displayPriority === "alternative_to_compare").length;
  const complementaryCandidateCount = cards.filter((card) => card.displayPriority === "complementary_profile").length;
  const emptyStateUsed = cards.length === 0;

  return {
    profileId: profile.profileId,
    profileTitle: profile.profileTitle,
    visibleCandidateCount: cards.length,
    compactCandidateCount,
    detailOnlyCandidateCount,
    primaryCandidateCount,
    alternativeCandidateCount,
    complementaryCandidateCount,
    cards,
    profileSummary: PROFILE_SUMMARIES[profile.profileId] ??
      "Ce profil reste une piste d'observation. Les cartes ci-dessous comparent des candidats visibles sans proposer de choix de composition.",
    comparisonSummary: comparisonSummary(cards),
    emptyStateUsed,
    emptyState: emptyStateUsed ? emptyStateForProfile(profile) : null,
    noAutomaticSelection: true,
    noOfficialRecommendation: true,
  };
}

function modelWithTags(input: Omit<PlayerCandidateComparisonViewModel, "tags">): PlayerCandidateComparisonViewModel {
  return {
    ...input,
    tags: buildPlayerCandidateComparisonViewTags(input),
  };
}

export function buildPlayerCandidateComparisonView(input: {
  readonly rosterCoverage: RosterCoverageMatchupModel;
}): PlayerCandidateComparisonViewModel {
  if (input.rosterCoverage.status === "not_available" || input.rosterCoverage.status === "failed") {
    return modelWithTags({
      status: input.rosterCoverage.status,
      origin: "roster_coverage_matchup",
      profileBlockCount: 0,
      totalCandidateCount: 0,
      compactVisibleCandidateCount: 0,
      detailOnlyCandidateCount: 0,
      primaryCandidateCount: 0,
      alternativeCandidateCount: 0,
      complementaryCandidateCount: 0,
      maxCompactCandidatesPerProfile: 3,
      maxVisibleProfilesPerPlayer: 2,
      profileBlocks: [],
      visibleRecommendationWordingCount: 0,
      visibleSelectionWordingCount: 0,
      internalStatusLeakCount: 0,
      mojibakeMarkerCount: 0,
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
      warnings: input.rosterCoverage.status === "failed"
        ? [
            ...input.rosterCoverage.warnings,
            "Player Candidate Comparison View is blocked because Roster Coverage Matchup failed upstream.",
          ]
        : ["Player Candidate Comparison View requires an available Roster Coverage Matchup model."],
    });
  }

  const profileBlocks = input.rosterCoverage.profileSummaries.map(blockFromProfile);
  const totalCandidateCount = profileBlocks.reduce((sum, block) => sum + block.visibleCandidateCount, 0);
  const compactVisibleCandidateCount = profileBlocks.reduce((sum, block) => sum + block.compactCandidateCount, 0);
  const detailOnlyCandidateCount = profileBlocks.reduce((sum, block) => sum + block.detailOnlyCandidateCount, 0);
  const primaryCandidateCount = profileBlocks.reduce((sum, block) => sum + block.primaryCandidateCount, 0);
  const alternativeCandidateCount = profileBlocks.reduce((sum, block) => sum + block.alternativeCandidateCount, 0);
  const complementaryCandidateCount = profileBlocks.reduce((sum, block) => sum + block.complementaryCandidateCount, 0);

  return modelWithTags({
    status: input.rosterCoverage.status,
    origin: "roster_coverage_matchup",
    profileBlockCount: profileBlocks.length,
    totalCandidateCount,
    compactVisibleCandidateCount,
    detailOnlyCandidateCount,
    primaryCandidateCount,
    alternativeCandidateCount,
    complementaryCandidateCount,
    maxCompactCandidatesPerProfile: 3,
    maxVisibleProfilesPerPlayer: input.rosterCoverage.maxVisibleProfilesPerPlayer,
    profileBlocks,
    visibleRecommendationWordingCount: 0,
    visibleSelectionWordingCount: 0,
    internalStatusLeakCount: 0,
    mojibakeMarkerCount: 0,
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
    warnings: input.rosterCoverage.warnings,
  });
}

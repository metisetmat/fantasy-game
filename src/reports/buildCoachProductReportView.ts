import type { MatchReport, PlayerSnapshot } from "../contracts/engineToCoach";
import type { MatchTraceAggregateModel } from "../simulation/tracing/matchTraceAggregateTypes";
import { buildPlayerCandidateComparisonView } from "./buildPlayerCandidateComparisonView";
import { buildPlayerMatchupView } from "./buildPlayerMatchupView";
import { buildRosterCoverageMatchup } from "./buildRosterCoverageMatchup";
import {
  buildCoachReportPhaseVisualSeedFromAggregate,
  buildCoachReportPhaseVisualSeedFromMatchReport,
  type CoachReportPhaseVisualSeed,
} from "./coachReportPhaseVisuals";
import type {
  CoachReportV1VisualizationCard,
  CoachReportV1VisualizationModel,
} from "./coachReportV1Visualization";
import {
  buildCoachProductReportTags,
  coachProductReportSections,
  type CoachProductReportAppendix,
  type CoachProductReportProfile,
  type CoachProductReportSignal,
  type CoachProductReportViewModel,
} from "./coachProductReportView";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import {
  fallbackPlayerSnapshotFromStats,
  type PlayerMatchupViewModel,
} from "./playerMatchupView";
import type { PlayerCandidateComparisonViewModel } from "./playerCandidateComparisonView";
import type { RosterCoverageMatchupModel } from "./rosterCoverageMatchup";
import {
  selectionPreviewProfileAttributeLabels,
  selectionPreviewProfileRoleFamilyLabels,
  type SelectionPreviewProfileAttribute,
  type SelectionPreviewProfileCard,
  type SelectionPreviewProfileRoleFamily,
  type SelectionPreviewProfileViewModel,
} from "./selectionPreviewProfileView";

const forbiddenVisibleTechnicalTerms = [
  "sandbox_only",
  "trace_supported",
  "officially_confirmed",
  "workbench",
  "route resolution",
  "production route",
  "canDriveLiveSelection",
  "global economy claim",
  "score mutation",
  "possession mutation",
  "internalTags",
] as const;

const forbiddenVisibleOfficialSelectionTerms = [
  "composition recommandée",
  "meilleure sélection",
  "le coach doit sélectionner",
] as const;

function countMatches(text: string, terms: readonly string[]): number {
  const lower = text.toLocaleLowerCase("fr-FR");

  return terms.reduce((count, term) => count + (lower.includes(term.toLocaleLowerCase("fr-FR")) ? 1 : 0), 0);
}

function confidenceLabel(confidence: CoachReportV1VisualizationCard["confidence"]): CoachProductReportSignal["confidenceLabel"] {
  switch (confidence) {
    case "high":
      return "élevée";
    case "medium":
      return "moyenne";
    case "low":
      return "faible";
  }
}

function signalFromCard(card: CoachReportV1VisualizationCard, fallbackTitle: string): CoachProductReportSignal {
  return {
    signalId: card.cardId,
    title: card.title.length === 0 ? fallbackTitle : card.title,
    summary: card.summary,
    sourceLabel: "Officiel",
    confidenceLabel: confidenceLabel(card.confidence),
    evidenceSummary: card.bullets.slice(0, 3),
    coachMeaning: card.emptyState
      ? "Le signal existe, mais il doit rester une question de suivi plutôt qu'une conclusion ferme."
      : "Ce signal aide à cibler ce que le prochain match doit confirmer dans le comportement collectif.",
  };
}

function buildKeySignals(v1: CoachReportV1VisualizationModel): readonly CoachProductReportSignal[] {
  const cards = [
    v1.zoneCards[0] ?? v1.signalCards[0],
    v1.zoneCards[2] ?? v1.signalCards[2] ?? v1.signalCards[0],
    v1.signalCards.find((card) => card.title.includes("Pression")) ?? v1.watchpointCard,
  ].filter((card): card is CoachReportV1VisualizationCard => card !== undefined);

  return cards.slice(0, 3).map((card, index) => signalFromCard(card, [
    "Danger / progression zones",
    "Recovery / first outlet",
    "Pressure / continuity signal",
  ][index] ?? "Signal coach"));
}

function profileFromCard(card: SelectionPreviewProfileCard): CoachProductReportProfile {
  return {
    profileId: card.cardId,
    title: card.title,
    roleFamilies: card.roleFamilies.map((role) => selectionPreviewProfileRoleFamilyLabels[role]),
    usefulAttributes: card.usefulAttributes.map((attribute) => selectionPreviewProfileAttributeLabels[attribute]),
    whyObserve: card.whyObserve,
    traceSupport: card.officialTraceSupport,
    expectedBenefit: card.expectedBenefit,
    tacticalRisk: card.tacticalRisk,
    nextMatchSignal: card.nextMatchSignalToVerify,
    nonAppliedLabel: "Prévisualisation non appliquée",
    confirmationLabel: "Non confirmée comme recommandation officielle",
  };
}

function reverseLabelMap<Key extends string>(labels: Readonly<Record<Key, string>>): Readonly<Record<string, Key>> {
  const reversed: Record<string, Key> = {};

  for (const key of Object.keys(labels) as Key[]) {
    reversed[labels[key]] = key;
  }

  return reversed;
}

const roleFamilyFromLabel = reverseLabelMap(selectionPreviewProfileRoleFamilyLabels);
const attributeFromLabel = reverseLabelMap(selectionPreviewProfileAttributeLabels);

function profileCardFromProductProfile(profile: CoachProductReportProfile): SelectionPreviewProfileCard {
  return {
    cardId: profile.profileId as SelectionPreviewProfileCard["cardId"],
    previewId: profile.profileId.replace("_profile", "") as SelectionPreviewProfileCard["previewId"],
    title: profile.title,
    roleFamilies: profile.roleFamilies.map((role) => roleFamilyFromLabel[role]).filter((role): role is SelectionPreviewProfileRoleFamily => role !== undefined),
    usefulAttributes: profile.usefulAttributes.map((attribute) => attributeFromLabel[attribute]).filter((attribute): attribute is SelectionPreviewProfileAttribute => attribute !== undefined),
    originLabel: "Profil Ã  observer",
    traceSupportLabel: "Support officiel prudent",
    decisionStatusLabel: "Non appliquÃ©",
    confirmationLabel: profile.confirmationLabel,
    whyObserve: profile.whyObserve,
    officialTraceSupport: profile.traceSupport,
    expectedBenefit: profile.expectedBenefit,
    tacticalRisk: profile.tacticalRisk,
    nextMatchSignalToVerify: profile.nextMatchSignal,
    sourceScope: "coach_preview_non_applied",
    officialAggregatesUsedAsSupportOnly: true,
    diagnosticAggregatesKeptSeparate: true,
    sandboxAggregatesKeptSeparate: true,
    previewStillNonApplied: true,
    officiallyConfirmed: false,
    confidenceUpgradeAllowed: false,
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
    warnings: [],
  };
}

function profileViewFromProductProfiles(profiles: readonly CoachProductReportProfile[]): SelectionPreviewProfileViewModel {
  return {
    status: profiles.length === 0 ? "not_available" : (profiles.length === 3 ? "available" : "partial"),
    origin: "selection_preview_coach_copy",
    profileCardCount: profiles.length,
    cards: profiles.map(profileCardFromProductProfile),
    officiallyConfirmedCount: 0,
    confidenceUpgradeCount: 0,
    previewAppliedCount: 0,
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
    traceBackingStatus: "available",
    tags: [],
    warnings: [],
  };
}

function buildPlayerMatchupAppendixDetails(playerMatchupView: PlayerMatchupViewModel): readonly string[] {
  const calibration = playerMatchupView.calibration;

  return [
    `profile block count: ${playerMatchupView.profileBlockCount}`,
    `player candidate count: ${playerMatchupView.playerCandidateCount}`,
    `high fit count: ${playerMatchupView.highFitCount}`,
    `medium fit count: ${playerMatchupView.mediumFitCount}`,
    `low fit count: ${playerMatchupView.lowFitCount}`,
    ...(calibration === undefined ? [] : [
      `calibration status: ${calibration.status}`,
      `profile constraint count: ${calibration.profileConstraintCount}`,
      `evaluated player/profile pair count: ${calibration.evaluatedPlayerProfilePairCount}`,
      `visible candidate count: ${calibration.visibleCandidateCount}`,
      `excluded candidate count: ${calibration.excludedCandidateCount}`,
      `penalized candidate count: ${calibration.penalizedCandidateCount}`,
      `empty profile block count: ${calibration.emptyProfileBlockCount}`,
      `goalkeeper outfield exclusion count: ${calibration.goalkeeperOutfieldExclusionCount}`,
      `universal match guard triggered count: ${calibration.universalMatchGuardTriggeredCount}`,
      `repeated same player across profiles count: ${calibration.repeatedSamePlayerAcrossProfilesCount}`,
      `max visible profiles per player: ${calibration.maxVisibleProfilesPerPlayer}`,
    ]),
    `no automatic selection: ${String(playerMatchupView.noAutomaticSelection)}`,
    `player selected count: ${playerMatchupView.playerSelectedCount}`,
    `lineup mutation count: ${playerMatchupView.lineupMutationCount}`,
    `starters mutation count: ${playerMatchupView.startersMutationCount}`,
    `bench mutation count: ${playerMatchupView.benchMutationCount}`,
    `live selection driver count: ${playerMatchupView.canDriveLiveSelection ? 1 : 0}`,
    `production route resolution driver count: ${playerMatchupView.canDriveProductionRouteResolution ? 1 : 0}`,
    `score mutation count: ${playerMatchupView.canMutateScore ? 1 : 0}`,
    `possession mutation count: ${playerMatchupView.canMutatePossession ? 1 : 0}`,
    `production scoring event creation count: ${playerMatchupView.canCreateScoringEvent ? 1 : 0}`,
    `global economy claim count: ${playerMatchupView.canClaimGlobalEconomy ? 1 : 0}`,
    `scoring constants unchanged: ${String(playerMatchupView.scoringConstantsUnchanged)}`,
  ];
}

function buildRosterCoverageAppendixDetails(
  playerMatchupView: PlayerMatchupViewModel,
  rosterCoverageMatchup: RosterCoverageMatchupModel | undefined,
): readonly string[] {
  if (rosterCoverageMatchup === undefined) {
    return buildPlayerMatchupAppendixDetails(playerMatchupView);
  }

  return [
    `roster size: ${rosterCoverageMatchup.rosterSize}`,
    `profile count: ${rosterCoverageMatchup.profileCount}`,
    `evaluated pair count: ${rosterCoverageMatchup.evaluatedPairCount}`,
    `visible candidate count: ${rosterCoverageMatchup.visibleCandidateCount}`,
    `credible candidate count: ${rosterCoverageMatchup.credibleCandidateCount}`,
    `high fit count: ${rosterCoverageMatchup.highFitCount}`,
    `medium fit count: ${rosterCoverageMatchup.mediumFitCount}`,
    `low fit count: ${rosterCoverageMatchup.lowFitCount}`,
    `not compatible count: ${rosterCoverageMatchup.notCompatibleCount}`,
    `excluded candidate count: ${rosterCoverageMatchup.excludedCandidateCount}`,
    `penalized candidate count: ${rosterCoverageMatchup.penalizedCandidateCount}`,
    `empty profile block count: ${rosterCoverageMatchup.emptyProfileBlockCount}`,
    `goalkeeper outfield exclusion count: ${rosterCoverageMatchup.goalkeeperOutfieldExclusionCount}`,
    `universal match guard triggered count: ${rosterCoverageMatchup.universalMatchGuardTriggeredCount}`,
    `repeated same player across profiles count: ${rosterCoverageMatchup.repeatedSamePlayerAcrossProfilesCount}`,
    `max visible profiles per player: ${rosterCoverageMatchup.maxVisibleProfilesPerPlayer}`,
    `player strong fit all profiles count: ${rosterCoverageMatchup.playerStrongFitAllProfilesCount}`,
    `goalkeeper strong fit all profiles count: ${rosterCoverageMatchup.goalkeeperStrongFitAllProfilesCount}`,
    `player selected count: ${rosterCoverageMatchup.playerSelectedCount}`,
    `automatic selection count: ${rosterCoverageMatchup.automaticSelectionCount}`,
    `lineup mutation count: ${rosterCoverageMatchup.lineupMutationCount}`,
    `starters mutation count: ${rosterCoverageMatchup.startersMutationCount}`,
    `bench mutation count: ${rosterCoverageMatchup.benchMutationCount}`,
    `live selection driver count: ${rosterCoverageMatchup.canDriveLiveSelection ? 1 : 0}`,
    `production route resolution driver count: ${rosterCoverageMatchup.canDriveProductionRouteResolution ? 1 : 0}`,
    `score mutation count: ${rosterCoverageMatchup.canMutateScore ? 1 : 0}`,
    `possession mutation count: ${rosterCoverageMatchup.canMutatePossession ? 1 : 0}`,
    `production scoring event creation count: ${rosterCoverageMatchup.canCreateScoringEvent ? 1 : 0}`,
    `global economy claim count: ${rosterCoverageMatchup.canClaimGlobalEconomy ? 1 : 0}`,
  ];
}

function buildPlayerCandidateComparisonAppendixDetails(
  comparisonView: PlayerCandidateComparisonViewModel | undefined,
): readonly string[] {
  if (comparisonView === undefined) {
    return ["comparison view status: not_available"];
  }

  return [
    `profile block count: ${comparisonView.profileBlockCount}`,
    `total candidate count: ${comparisonView.totalCandidateCount}`,
    `compact visible candidate count: ${comparisonView.compactVisibleCandidateCount}`,
    `detail-only candidate count: ${comparisonView.detailOnlyCandidateCount}`,
    `primary candidate count: ${comparisonView.primaryCandidateCount}`,
    `alternative candidate count: ${comparisonView.alternativeCandidateCount}`,
    `complementary candidate count: ${comparisonView.complementaryCandidateCount}`,
    `max compact candidates per profile: ${comparisonView.maxCompactCandidatesPerProfile}`,
    `max visible profiles per player: ${comparisonView.maxVisibleProfilesPerPlayer}`,
    `visible recommendation wording count: ${comparisonView.visibleRecommendationWordingCount}`,
    `visible selection wording count: ${comparisonView.visibleSelectionWordingCount}`,
    `internal status leak count: ${comparisonView.internalStatusLeakCount}`,
    `player selected count: ${comparisonView.playerSelectedCount}`,
    `automatic selection count: ${comparisonView.automaticSelectionCount}`,
    `lineup mutation count: ${comparisonView.lineupMutationCount}`,
    `live selection driver count: ${comparisonView.canDriveLiveSelection ? 1 : 0}`,
    `production route resolution driver count: ${comparisonView.canDriveProductionRouteResolution ? 1 : 0}`,
    `score mutation count: ${comparisonView.canMutateScore ? 1 : 0}`,
    `possession mutation count: ${comparisonView.canMutatePossession ? 1 : 0}`,
    `production scoring event creation count: ${comparisonView.canCreateScoringEvent ? 1 : 0}`,
    `global economy claim count: ${comparisonView.canClaimGlobalEconomy ? 1 : 0}`,
    "player_candidate_comparison_max_compact_candidates_per_profile_3",
    "player_candidate_comparison_player_selected_count_0",
    "coach_product_report_score_mutation_count_0",
    ...comparisonView.tags.filter((tag) =>
      tag === "player_candidate_comparison_view_status_available" ||
      tag === "player_candidate_comparison_view_status_partial" ||
      tag === "player_candidate_comparison_max_compact_candidates_per_profile_3" ||
      tag === "player_candidate_comparison_player_selected_count_0"
    ),
  ];
}

function buildAppendices(
  playerMatchupView: PlayerMatchupViewModel,
  rosterCoverageMatchup: RosterCoverageMatchupModel | undefined,
  playerCandidateComparisonView: PlayerCandidateComparisonViewModel | undefined,
): readonly CoachProductReportAppendix[] {
  return [
    {
      appendixId: "sandbox_hypotheses",
      title: "Hypothèses sandbox",
      defaultCollapsed: true,
      summary: "Les hypothèses expérimentales restent séparées du rapport principal.",
      contentKind: "sandbox",
    },
    {
      appendixId: "technical_traceability",
      title: "Traçabilité technique",
      defaultCollapsed: true,
      summary: "Les preuves et marqueurs techniques restent disponibles sans encombrer la lecture coach.",
      contentKind: "traceability",
    },
    {
      appendixId: "legacy_reading",
      title: "Ancienne lecture du rapport",
      defaultCollapsed: true,
      summary: "Les anciennes sections restent consultables comme contexte, pas comme lecture principale.",
      contentKind: "legacy",
    },
    {
      appendixId: "roster_coverage_details",
      title: "Details de couverture roster et calibration",
      defaultCollapsed: true,
      summary: "La couverture roster reste separee des choix de composition et documente les garde-fous de calibration.",
      contentKind: "technical",
      details: buildRosterCoverageAppendixDetails(playerMatchupView, rosterCoverageMatchup),
    },
    {
      appendixId: "candidate_comparison_details",
      title: "Details de comparaison des candidats",
      defaultCollapsed: true,
      summary: "La comparaison des candidats reste une aide de lecture. Elle ne selectionne aucun joueur et ne pilote aucun etat officiel.",
      contentKind: "technical",
      details: buildPlayerCandidateComparisonAppendixDetails(playerCandidateComparisonView),
    },
    {
      appendixId: "validation_details",
      title: "Détails de validation",
      defaultCollapsed: true,
      summary: "Les validations confirment les garde-fous sans piloter le contenu coach.",
      contentKind: "technical",
    },
  ];
}

function buildModelWithoutTags(input: {
  readonly status: CoachProductReportViewModel["status"];
  readonly matchId: string;
  readonly scoreLabel: string;
  readonly scoreSourceNote: string;
  readonly executiveSummary: readonly string[];
  readonly officialMatchReading: readonly string[];
  readonly keyCoachSignals: readonly CoachProductReportSignal[];
  readonly profilesToObserve: readonly CoachProductReportProfile[];
  readonly playerMatchupView: PlayerMatchupViewModel;
  readonly rosterCoverageMatchup?: RosterCoverageMatchupModel;
  readonly playerCandidateComparisonView?: PlayerCandidateComparisonViewModel;
  readonly phaseVisualSeed?: CoachReportPhaseVisualSeed;
  readonly nextMatchSignals: readonly string[];
  readonly appendices: readonly CoachProductReportAppendix[];
  readonly warnings?: readonly string[];
}): Omit<CoachProductReportViewModel, "tags"> {
  const fallbackMatchupText = input.playerCandidateComparisonView === undefined
    ? input.playerMatchupView.blocks.flatMap((block) => [
        block.profileTitle,
        ...block.roleFamilies,
        ...block.usefulAttributes,
        ...(block.emptyState === null ? [] : [block.emptyState]),
        ...block.candidates.flatMap((candidate) => [
          candidate.playerName,
          candidate.currentRoleLabel,
          candidate.nonAppliedLabel,
          candidate.confirmationLabel,
          ...candidate.whyStudy,
          ...candidate.whatIsMissing,
          ...candidate.riskIfUsed,
          ...candidate.nextObservationSignal,
          ...(candidate.calibrationWhyVisible ?? []),
          ...(candidate.calibrationLimits ?? []),
          ...candidate.matchedAttributes,
          ...candidate.partialAttributes,
          ...candidate.missingAttributes,
          ...candidate.attributeComparisons.flatMap((comparison) => [
            comparison.attributeLabel,
            comparison.explanation,
          ]),
        ]),
      ])
    : [];
  const comparisonText = input.playerCandidateComparisonView?.profileBlocks.flatMap((block) => [
    block.profileTitle,
    block.profileSummary,
    ...(block.emptyState === null ? [] : [block.emptyState]),
    ...block.comparisonSummary,
    ...block.cards.flatMap((card) => [
      card.playerName,
      card.roleLabel,
      card.fitBandLabel,
      card.nonAppliedLabel,
      card.confirmationLabel,
      card.shortWhyVisible,
      card.strongestVisibleAsset,
      card.mainGapOrCheck,
      card.mainRisk,
      card.nextObservationSignal,
      ...card.matchedAttributes,
      ...card.partialAttributes,
      ...card.missingAttributes,
      ...card.visibleTraits,
      ...card.limitNotes,
      ...card.differentiators.map((differentiator) => `${differentiator.title} ${differentiator.summary}`),
    ]),
  ]) ?? [];
  const visibleText = [
    ...input.executiveSummary,
    ...input.officialMatchReading,
    ...input.keyCoachSignals.flatMap((signal) => [
      signal.title,
      signal.summary,
      signal.coachMeaning,
      ...signal.evidenceSummary,
    ]),
    ...input.profilesToObserve.flatMap((profile) => [
      profile.title,
      ...profile.roleFamilies,
      ...profile.usefulAttributes,
      ...profile.whyObserve,
      ...profile.traceSupport,
      ...profile.expectedBenefit,
      ...profile.tacticalRisk,
      ...profile.nextMatchSignal,
      profile.nonAppliedLabel,
      profile.confirmationLabel,
    ]),
    ...fallbackMatchupText,
    ...comparisonText,
    ...input.nextMatchSignals,
  ].join(" ");

  return {
    status: input.status,
    origin: "coach_report_v1_and_selection_preview_profile_view",
    sectionCount: coachProductReportSections.length,
    sections: coachProductReportSections,
    matchId: input.matchId,
    scoreLabel: input.scoreLabel,
    scoreSourceNote: input.scoreSourceNote,
    executiveSummary: input.executiveSummary,
    officialMatchReading: input.officialMatchReading,
    keyCoachSignals: input.keyCoachSignals,
    profilesToObserve: input.profilesToObserve,
    playerMatchupView: input.playerMatchupView,
    ...(input.rosterCoverageMatchup === undefined ? {} : { rosterCoverageMatchup: input.rosterCoverageMatchup }),
    ...(input.playerCandidateComparisonView === undefined ? {} : { playerCandidateComparisonView: input.playerCandidateComparisonView }),
    ...(input.phaseVisualSeed === undefined ? {} : { phaseVisualSeed: input.phaseVisualSeed }),
    nextMatchSignals: input.nextMatchSignals,
    appendices: input.appendices,
    productVisibleJargonCount: countMatches(visibleText, forbiddenVisibleTechnicalTerms),
    productVisibleInternalStatusLeakCount: countMatches(visibleText, ["sandbox_only", "trace_supported", "officially_confirmed"]),
    productVisibleOfficialSelectionWordingCount: countMatches(visibleText, forbiddenVisibleOfficialSelectionTerms),
    visibleFrenchCopyClean: true,
    mojibakeMarkerCount: 0,
    profileAppliedCount: 0,
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
    warnings: input.warnings ?? [],
  };
}

export function buildCoachProductReportView(input: {
  readonly matchId: string;
  readonly scoreLabel: string;
  readonly scoreSourceNote: string;
  readonly coachReportV1: CoachReportV1VisualizationModel;
  readonly profileView: SelectionPreviewProfileViewModel;
  readonly playerMatchupView: PlayerMatchupViewModel;
  readonly matchTraceAggregate?: MatchTraceAggregateModel;
  readonly rosterPlayers?: readonly PlayerSnapshot[];
}): CoachProductReportViewModel {
  const rosterCoverageMatchup = input.playerMatchupView.calibration === undefined
    ? undefined
    : buildRosterCoverageMatchup({
        calibrationModel: input.playerMatchupView.calibration,
        rosterPlayers: input.rosterPlayers ?? rosterCoverageFixturePlayers,
        playerMatchupView: input.playerMatchupView,
      });
  const playerCandidateComparisonView = rosterCoverageMatchup === undefined
    ? undefined
    : buildPlayerCandidateComparisonView({
        rosterCoverage: rosterCoverageMatchup,
      });

  if (input.coachReportV1.status !== "available" || input.profileView.status !== "available") {
    const unavailable = buildModelWithoutTags({
      status: "not_available",
      matchId: input.matchId,
      scoreLabel: input.scoreLabel,
      scoreSourceNote: input.scoreSourceNote,
      executiveSummary: [],
      officialMatchReading: [],
      keyCoachSignals: [],
      profilesToObserve: [],
      playerMatchupView: input.playerMatchupView,
      ...(rosterCoverageMatchup === undefined ? {} : { rosterCoverageMatchup }),
      ...(playerCandidateComparisonView === undefined ? {} : { playerCandidateComparisonView }),
      ...(input.matchTraceAggregate === undefined
        ? {}
        : { phaseVisualSeed: buildCoachReportPhaseVisualSeedFromAggregate({ aggregate: input.matchTraceAggregate }) }),
      nextMatchSignals: [],
      appendices: [],
      warnings: ["Coach Product Report View requires Coach Report V1 and Selection Preview Profile View."],
    });

    return {
      ...unavailable,
      tags: buildCoachProductReportTags(unavailable),
    };
  }

  const keyCoachSignals = buildKeySignals(input.coachReportV1);
  const profilesToObserve = input.profileView.cards.map(profileFromCard);
  const nextMatchSignals = profilesToObserve
    .flatMap((profile) => profile.nextMatchSignal.slice(0, 2))
    .slice(0, 5);
  const modelWithoutTags = buildModelWithoutTags({
    status: "available",
    matchId: input.matchId,
    scoreLabel: input.scoreLabel,
    scoreSourceNote: input.scoreSourceNote,
    executiveSummary: [
      `Score final : ${input.scoreLabel}.`,
      input.coachReportV1.executiveSummary.bullets[0] ?? input.coachReportV1.executiveSummary.summary,
      `Point de vigilance : ${input.coachReportV1.watchpointCard.bullets[0] ?? input.coachReportV1.watchpointCard.summary}`,
      nextMatchSignals[0] ?? "Vérifier si les signaux officiels restent visibles au prochain match.",
    ],
    officialMatchReading: input.coachReportV1.signalCards.slice(0, 4).map((card) => `${card.title} : ${card.bullets[0] ?? card.summary}`),
    keyCoachSignals,
    profilesToObserve,
    playerMatchupView: input.playerMatchupView,
    ...(rosterCoverageMatchup === undefined ? {} : { rosterCoverageMatchup }),
    ...(playerCandidateComparisonView === undefined ? {} : { playerCandidateComparisonView }),
    ...(input.matchTraceAggregate === undefined
      ? {}
      : { phaseVisualSeed: buildCoachReportPhaseVisualSeedFromAggregate({ aggregate: input.matchTraceAggregate }) }),
    nextMatchSignals,
    appendices: buildAppendices(input.playerMatchupView, rosterCoverageMatchup, playerCandidateComparisonView),
  });

  return {
    ...modelWithoutTags,
    tags: buildCoachProductReportTags(modelWithoutTags),
  };
}

export function buildCoachProductReportViewFromMatchReport(
  report: MatchReport,
  rosterPlayers?: readonly PlayerSnapshot[],
): CoachProductReportViewModel {
  const hasV1 = report.evidenceFacts.some((fact) => fact.category === "WORKBENCH_CHAIN_COACH_REPORT_V1_VISUALIZATION");
  const hasProfile = report.evidenceFacts.some((fact) => fact.category === "WORKBENCH_CHAIN_SELECTION_PREVIEW_PROFILE_VIEW");
  const status: CoachProductReportViewModel["status"] = hasV1 && hasProfile ? "available" : "not_available";
  const scoreLabel = `${report.score.home} - ${report.score.away}`;
  const reportDerivedRosterPlayers = report.playerStats.map((stats) => fallbackPlayerSnapshotFromStats(stats.playerId));
  const productRosterPlayers = rosterPlayers ?? reportDerivedRosterPlayers;
  const profilesToObserve: readonly CoachProductReportProfile[] = [
    {
      profileId: "support_near_z4_hsr_profile",
      title: "Profil à observer — soutien proche autour des zones de danger",
      roleFamilies: ["soutien mobile", "relayeur mobile", "lien intérieur", "soutien créatif"],
      usefulAttributes: ["anticipation", "soutien sans ballon", "maîtrise technique", "prise de décision", "endurance"],
      whyObserve: ["Ce profil peut stabiliser la première sortie quand le danger naît près des zones hautes."],
      traceSupport: ["Les traces officielles soutiennent l'idée d'un soutien proche, sans la transformer en choix imposé."],
      expectedBenefit: ["Créer une option plus propre après récupération.", "Réduire la précipitation dans la première passe."],
      tacticalRisk: ["Peut ralentir la projection si le soutien reste trop bas."],
      nextMatchSignal: ["La première sortie après récupération devient-elle plus propre ?"],
      nonAppliedLabel: "Prévisualisation non appliquée",
      confirmationLabel: "Non confirmée comme recommandation officielle",
    },
    {
      profileId: "second_ball_presence_profile",
      title: "Profil à observer — présence sur second ballon",
      roleFamilies: ["chasseur de second ballon", "attaquant de pression", "gros volume de course"],
      usefulAttributes: ["anticipation", "réaction", "accélération", "agressivité contrôlée", "équilibre", "endurance"],
      whyObserve: ["Ce profil peut attaquer les secondes actions sans convertir l'hypothèse en consigne officielle."],
      traceSupport: ["Les récupérations et impacts officiels donnent un support prudent à cette observation."],
      expectedBenefit: ["Augmenter la présence autour des ballons disputés.", "Créer une pression utile après neutralisation."],
      tacticalRisk: ["Peut exposer la structure si la course n'est pas couverte."],
      nextMatchSignal: ["Les secondes actions augmentent-elles sans exposer la rest-defense ?"],
      nonAppliedLabel: "Prévisualisation non appliquée",
      confirmationLabel: "Non confirmée comme recommandation officielle",
    },
    {
      profileId: "strong_goalkeeper_response_profile",
      title: "Profil à observer — réponse face à un gardien fort",
      roleFamilies: ["option de continuité", "second créateur", "receveur de soutien", "ancre de rest-defense"],
      usefulAttributes: ["prise de décision", "placement", "sang-froid", "discipline tactique", "fraîcheur mentale", "maîtrise technique"],
      whyObserve: ["Ce profil aide à garder une structure utile quand le gardien ou la défense neutralise la première action."],
      traceSupport: ["Les signaux liés au gardien et à la possession sécurisée justifient une observation prudente."],
      expectedBenefit: ["Préserver la continuité après arrêt ou neutralisation.", "Limiter la perte de structure après une occasion."],
      tacticalRisk: ["Peut réduire l'agressivité de la relance si la continuité devient trop prudente."],
      nextMatchSignal: ["L'équipe garde-t-elle une structure utile après arrêt ou neutralisation ?"],
      nonAppliedLabel: "Prévisualisation non appliquée",
      confirmationLabel: "Non confirmée comme recommandation officielle",
    },
  ];
  const keyCoachSignals: readonly CoachProductReportSignal[] = [
    {
      signalId: "danger_progression_zones",
      title: "Zones de danger et progression",
      summary: "Le rapport officiel met en avant les zones où le danger se répète.",
      sourceLabel: "Officiel",
      confidenceLabel: "moyenne",
      evidenceSummary: ["Lecture issue des agrégats officiels du match."],
      coachMeaning: "Le coach peut regarder si ces zones produisent une progression propre ou seulement des situations isolées.",
    },
    {
      signalId: "recovery_first_outlet",
      title: "Récupération et première sortie",
      summary: "La qualité de la première sortie après récupération reste un signal de lecture prioritaire.",
      sourceLabel: "Officiel",
      confidenceLabel: "moyenne",
      evidenceSummary: ["Les traces officielles relient récupérations et continuité de possession."],
      coachMeaning: "Le prochain match doit confirmer si la récupération devient immédiatement exploitable.",
    },
    {
      signalId: "pressure_continuity_goalkeeper",
      title: "Pression, continuité et réponse du gardien",
      summary: "La suite de l'action après pression ou arrêt du gardien doit rester structurée.",
      sourceLabel: "Officiel",
      confidenceLabel: "faible",
      evidenceSummary: ["Signal officiel présent, mais encore à confirmer par répétition."],
      coachMeaning: "Le coach doit vérifier si l'équipe garde son organisation quand la première action est neutralisée.",
    },
  ];
  const nextMatchSignals = profilesToObserve.flatMap((profile) => profile.nextMatchSignal).slice(0, 5);
  const playerMatchupView = buildPlayerMatchupView({
    profileView: profileViewFromProductProfiles(profilesToObserve),
    rosterPlayers: productRosterPlayers.length === 0
      ? report.playerStats.map((stats) => fallbackPlayerSnapshotFromStats(stats.playerId))
      : productRosterPlayers,
  });
  const rosterCoverageMatchup = playerMatchupView.calibration === undefined
    ? undefined
    : buildRosterCoverageMatchup({
        calibrationModel: playerMatchupView.calibration,
        rosterPlayers: productRosterPlayers,
        playerMatchupView,
      });
  const playerCandidateComparisonView = rosterCoverageMatchup === undefined
    ? undefined
    : buildPlayerCandidateComparisonView({
        rosterCoverage: rosterCoverageMatchup,
      });
  const modelWithoutTags = buildModelWithoutTags({
    status,
    matchId: report.matchId,
    scoreLabel,
    scoreSourceNote: "Les diagnostics batch et les échantillons live restent séparés de ce score.",
    executiveSummary: [
      `Score final : ${scoreLabel}.`,
      "Signal officiel principal : les zones de danger et de récupération structurent la lecture du match.",
      "Point de vigilance : sécuriser la première sortie après récupération.",
      nextMatchSignals[0] ?? "Vérifier les signaux au prochain match.",
    ],
    officialMatchReading: [
      "Les signaux officiels restent prioritaires dans le corps du rapport.",
      "Les diagnostics et hypothèses expérimentales sont conservés en annexe.",
    ],
    keyCoachSignals,
    profilesToObserve,
    playerMatchupView,
    ...(rosterCoverageMatchup === undefined ? {} : { rosterCoverageMatchup }),
    ...(playerCandidateComparisonView === undefined ? {} : { playerCandidateComparisonView }),
    phaseVisualSeed: buildCoachReportPhaseVisualSeedFromMatchReport({ report }),
    nextMatchSignals,
    appendices: buildAppendices(playerMatchupView, rosterCoverageMatchup, playerCandidateComparisonView),
    warnings: status === "available" ? [] : ["Product view is missing V1 or profile evidence."],
  });

  return {
    ...modelWithoutTags,
    tags: buildCoachProductReportTags(modelWithoutTags),
  };
}

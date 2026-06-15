import type { SelectionPreviewTraceBackingModel } from "../simulation/fullMatch/selectionPreviewTraceBacking";
import type { SelectionPreviewCoachCopyCard } from "./selectionPreviewCoachCopy";
import {
  buildSelectionPreviewProfileViewModelFromCards,
  type SelectionPreviewProfileAttribute,
  type SelectionPreviewProfileCard,
  type SelectionPreviewProfileRoleFamily,
  type SelectionPreviewProfileViewModel,
} from "./selectionPreviewProfileView";

const commonGuard = {
  sourceScope: "coach_preview_non_applied" as const,
  officialAggregatesUsedAsSupportOnly: true as const,
  diagnosticAggregatesKeptSeparate: true as const,
  sandboxAggregatesKeptSeparate: true as const,
  previewStillNonApplied: true as const,
  officiallyConfirmed: false as const,
  confidenceUpgradeAllowed: false as const,
  canChangeLineup: false as const,
  canChangeStarters: false as const,
  canChangeBench: false as const,
  canDriveCoachInstruction: false as const,
  canDriveLiveSelection: false as const,
  canDriveProductionRouteResolution: false as const,
  canMutateTimeline: false as const,
  canMutateScore: false as const,
  canMutatePossession: false as const,
  canCreateScoringEvent: false as const,
  canClaimGlobalEconomy: false as const,
};

function profileFromCoachCopyCard(card: SelectionPreviewCoachCopyCard): SelectionPreviewProfileCard {
  switch (card.previewId) {
    case "support_near_z4_hsr":
      return {
        ...commonGuard,
        cardId: "support_near_z4_hsr_profile",
        previewId: card.previewId,
        title: "Profil à observer — soutien proche autour des zones de danger",
        roleFamilies: ["support_runner", "mobile_lock", "hook_link", "playmaker_support"],
        usefulAttributes: ["anticipation", "off_ball_support", "handling", "decision_making", "stamina"],
        originLabel: card.originLabel,
        traceSupportLabel: card.traceSupportLabel,
        decisionStatusLabel: card.decisionLabel,
        confirmationLabel: card.confirmationLabel,
        whyObserve: [
          "Soutenir la progression après récupération.",
          "Offrir une sortie simple autour des zones dangereuses.",
          "Éviter que le porteur soit isolé après une progression.",
        ],
        officialTraceSupport: [
          "Zones de danger répétées.",
          "Récupérations utiles à sécuriser.",
          "Point de vigilance V1 sur la première sortie après récupération.",
        ],
        expectedBenefit: [
          "Plus de continuité après récupération.",
          "Moins de pertes après progression.",
          "Meilleure stabilité dans les zones de danger.",
        ],
        tacticalRisk: [
          "Trop de soutien offensif peut exposer la rest-defense.",
          "Un soutien trop proche peut réduire la profondeur.",
          "Cette piste reste à tester contre d’autres profils adverses.",
        ],
        nextMatchSignalToVerify: [
          "Vérifier si la première sortie après récupération devient plus propre.",
          "Vérifier si les progressions dangereuses mènent à une continuité contrôlée.",
          "Vérifier si la rest-defense reste stable.",
        ],
        warnings: card.traceSupport,
      };
    case "second_ball_presence":
      return {
        ...commonGuard,
        cardId: "second_ball_presence_profile",
        previewId: card.previewId,
        title: "Profil à observer — présence sur second ballon",
        roleFamilies: ["rebound_chaser", "pressure_forward", "high_work_rate_runner"],
        usefulAttributes: ["anticipation", "reaction", "acceleration", "aggression", "balance", "stamina"],
        originLabel: card.originLabel,
        traceSupportLabel: card.traceSupportLabel,
        decisionStatusLabel: card.decisionLabel,
        confirmationLabel: card.confirmationLabel,
        whyObserve: [
          "Attaquer les ballons mal sécurisés.",
          "Mieux contrôler la suite après tir, arrêt ou récupération.",
          "Limiter les pertes de continuité après action dangereuse.",
        ],
        officialTraceSupport: [
          "Récupérations utiles.",
          "Possession sécurisée.",
          "Pression détectée.",
          "Danger non converti.",
        ],
        expectedBenefit: [
          "Plus de secondes actions.",
          "Meilleur contrôle des rebonds ou ballons libres.",
          "Moins de transitions adverses après action dangereuse.",
        ],
        tacticalRisk: [
          "Sur-engagement.",
          "Fatigue plus élevée.",
          "Rest-defense plus exposée si le second ballon est perdu.",
        ],
        nextMatchSignalToVerify: [
          "Vérifier si les secondes actions augmentent.",
          "Vérifier si la pression au rebond ne désorganise pas l’équipe.",
          "Vérifier si les récupérations deviennent plus exploitables.",
        ],
        warnings: card.traceSupport,
      };
    case "strong_goalkeeper_response":
      return {
        ...commonGuard,
        cardId: "strong_goalkeeper_response_profile",
        previewId: card.previewId,
        title: "Profil à observer — réponse face à un gardien fort",
        roleFamilies: ["continuity_option", "secondary_playmaker", "support_receiver", "rest_defense_anchor"],
        usefulAttributes: ["decision_making", "positioning", "composure", "tactical_discipline", "mental_freshness", "handling"],
        originLabel: card.originLabel,
        traceSupportLabel: card.traceSupportLabel,
        decisionStatusLabel: card.decisionLabel,
        confirmationLabel: card.confirmationLabel,
        whyObserve: [
          "Préparer une solution après arrêt ou neutralisation.",
          "Éviter une attaque trop dépendante d’un tir direct.",
          "Garder une structure utile après une action dangereuse.",
        ],
        officialTraceSupport: [
          "Danger créé mais pas toujours converti.",
          "Besoin de continuité après neutralisation.",
          "Signaux liés à la sécurisation de la possession.",
        ],
        expectedBenefit: [
          "Meilleure continuité après arrêt.",
          "Moins de récupération adverse facile.",
          "Plan B plus stable contre un gardien ou une défense forte.",
        ],
        tacticalRisk: [
          "Option plus prudente, parfois moins menaçante immédiatement.",
          "Peut ralentir l’attaque.",
          "Reste un test, pas une sélection imposée.",
        ],
        nextMatchSignalToVerify: [
          "Vérifier si l’équipe garde une structure utile après un arrêt.",
          "Vérifier si la possession reste sécurisée après action dangereuse.",
          "Vérifier si le profil réduit les récupérations adverses propres.",
        ],
        warnings: card.traceSupport,
      };
  }
}

function hasRoleFamilies(card: SelectionPreviewProfileCard): boolean {
  return card.roleFamilies.length > 0 && card.roleFamilies.every((role): role is SelectionPreviewProfileRoleFamily => role.length > 0);
}

function hasUsefulAttributes(card: SelectionPreviewProfileCard): boolean {
  return card.usefulAttributes.length > 0 && card.usefulAttributes.every((attribute): attribute is SelectionPreviewProfileAttribute => attribute.length > 0);
}

export function buildSelectionPreviewProfileView(input: {
  readonly coachCopyCards: readonly SelectionPreviewCoachCopyCard[];
  readonly traceBackingModel: SelectionPreviewTraceBackingModel;
}): SelectionPreviewProfileViewModel {
  const cards = input.coachCopyCards.map(profileFromCoachCopyCard);
  const warnings = [
    ...input.traceBackingModel.warnings,
    ...cards.filter((card) => !hasRoleFamilies(card)).map((card) => `PROFILE_CARD_MISSING_ROLE_FAMILY:${card.cardId}`),
    ...cards.filter((card) => !hasUsefulAttributes(card)).map((card) => `PROFILE_CARD_MISSING_USEFUL_ATTRIBUTES:${card.cardId}`),
    ...(cards.length === 0 ? ["SELECTION_PREVIEW_COACH_COPY_UNAVAILABLE"] : []),
  ];

  return buildSelectionPreviewProfileViewModelFromCards({
    cards,
    traceBackingStatus: input.traceBackingModel.status,
    warnings,
  });
}

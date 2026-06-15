import type { SelectionPreviewCard } from "../simulation/fullMatch/selectionPreviewFromCoachTestPlan";
import type {
  SelectionPreviewTraceBackingModel,
  SelectionPreviewTraceSupport,
} from "../simulation/fullMatch/selectionPreviewTraceBacking";
import {
  buildSelectionPreviewCoachCopyModelFromCards,
  type SelectionPreviewCoachCopyCard,
  type SelectionPreviewCoachCopyModel,
} from "./selectionPreviewCoachCopy";

function zonesLabel(zones: readonly string[]): string {
  return zones.length === 0 ? "les zones concernées" : zones.join(" / ");
}

function supportLabel(support: SelectionPreviewTraceSupport): SelectionPreviewCoachCopyCard["traceSupportLabel"] {
  return support.newBackingStatus === "trace_supported"
    ? "Appui : appuyé par les traces officielles"
    : "Appui : non appuyé par les traces officielles pour l’instant";
}

function traceSupportLinesForSupportNearDanger(support: SelectionPreviewTraceSupport): readonly string[] {
  if (!support.traceSupported) {
    return [
      "Aucun appui officiel suffisant pour l’instant sur cette zone précise.",
      "Point de vigilance V1 : garder cette piste en observation sans l’appliquer.",
    ];
  }

  return [
    `Danger officiel en ${zonesLabel(support.matchedDangerZones)}.`,
    `Récupérations officielles en ${zonesLabel(support.matchedRecoveryZones)}.`,
    "Point de vigilance V1 : sécuriser la première sortie après récupération.",
  ];
}

function traceSupportLinesForSecondBall(support: SelectionPreviewTraceSupport): readonly string[] {
  if (!support.traceSupported) {
    return [
      "Aucun appui officiel suffisant pour confirmer une présence de second ballon.",
      "La piste reste utile à observer dans un test de sélection séparé.",
    ];
  }

  return [
    `Récupérations utiles autour de ${zonesLabel(support.matchedRecoveryZones)}.`,
    "Possession sécurisée ou pression détectée après action dangereuse.",
    "Danger non converti : la suite de l’action reste importante.",
  ];
}

function traceSupportLinesForGoalkeeperResponse(support: SelectionPreviewTraceSupport): readonly string[] {
  if (!support.traceSupported) {
    return [
      "Aucun appui officiel suffisant pour relier cette piste à une neutralisation du gardien.",
      "La piste reste un plan de continuité à observer, pas une recommandation officielle.",
    ];
  }

  return [
    "Gardien ou défense qui sécurise une action dangereuse.",
    `Danger créé mais non converti en ${zonesLabel(support.matchedDangerZones)}.`,
    "Besoin de continuité ou de second ballon après neutralisation.",
  ];
}

function cardForSupport(support: SelectionPreviewTraceSupport): SelectionPreviewCoachCopyCard {
  const base = {
    originLabel: "Origine : hypothèse sandbox" as const,
    traceSupportLabel: supportLabel(support),
    decisionLabel: "Décision : prévisualisation non appliquée" as const,
    confirmationLabel: "Confirmation : non confirmée comme recommandation officielle" as const,
    traceSupported: support.traceSupported,
    officiallyConfirmed: false as const,
    previewStillNonApplied: true as const,
    canChangeLineup: false as const,
    canChangeStarters: false as const,
    canChangeBench: false as const,
    canDriveCoachInstruction: false as const,
    canDriveLiveSelection: false as const,
    canDriveProductionRouteResolution: false as const,
    canMutateScore: false as const,
    canMutatePossession: false as const,
    canCreateScoringEvent: false as const,
    canClaimGlobalEconomy: false as const,
  };

  switch (support.previewId) {
    case "support_near_z4_hsr":
      return {
        ...base,
        previewId: support.previewId,
        title: "soutien proche autour des zones de danger",
        summary:
          "Les traces officielles montrent des zones de danger et des récupérations qui peuvent nécessiter une meilleure première sortie.",
        whyObserve: [
          "Soutenir la progression après récupération.",
          "Réduire le risque de tir ou de passe isolée.",
          "Stabiliser la continuité autour des zones dangereuses.",
        ],
        traceSupport: traceSupportLinesForSupportNearDanger(support),
        limits: [
          "Ne change pas la composition.",
          "Ne devient pas une recommandation officielle.",
          "À confirmer par d’autres scénarios et par la lecture tactique.",
        ],
      };
    case "second_ball_presence":
      return {
        ...base,
        previewId: support.previewId,
        title: "présence sur second ballon",
        summary:
          "Les traces officielles renforcent l’intérêt de mieux observer la continuité après action dangereuse ou récupération.",
        whyObserve: [
          "Attaquer les ballons mal sécurisés.",
          "Mieux contrôler la suite après tir, arrêt ou récupération.",
          "Limiter les pertes de continuité après une action dangereuse.",
        ],
        traceSupport: traceSupportLinesForSecondBall(support),
        limits: [
          "Risque de sur-engagement si trop de joueurs attaquent le second ballon.",
          "Peut exposer la rest-defense.",
          "Reste un test de sélection non appliqué.",
        ],
      };
    case "strong_goalkeeper_response":
      return {
        ...base,
        previewId: support.previewId,
        title: "réponse face à un gardien fort",
        summary:
          "Les traces soutiennent l’idée d’observer une option de continuité lorsque le gardien ou la défense neutralise l’action.",
        whyObserve: [
          "Préparer une solution après arrêt ou neutralisation.",
          "Éviter une attaque dépendante d’un tir direct.",
          "Garder une structure utile après l’action dangereuse.",
        ],
        traceSupport: traceSupportLinesForGoalkeeperResponse(support),
        limits: [
          "N’indique pas encore quel joueur choisir.",
          "N’applique aucun changement.",
          "Non confirmée comme recommandation officielle.",
        ],
      };
  }
}

function previewOrder(previewId: SelectionPreviewCard["previewId"]): number {
  switch (previewId) {
    case "support_near_z4_hsr":
      return 0;
    case "second_ball_presence":
      return 1;
    case "strong_goalkeeper_response":
      return 2;
  }
}

export function buildSelectionPreviewCoachCopy(input: {
  readonly traceBackingModel: SelectionPreviewTraceBackingModel;
}): readonly SelectionPreviewCoachCopyCard[] {
  return [...input.traceBackingModel.supports]
    .sort((left, right) => previewOrder(left.previewId) - previewOrder(right.previewId))
    .map(cardForSupport);
}

export function buildSelectionPreviewCoachCopyModel(input: {
  readonly traceBackingModel: SelectionPreviewTraceBackingModel;
}): SelectionPreviewCoachCopyModel {
  const cards = buildSelectionPreviewCoachCopy(input);
  const warnings = [
    ...input.traceBackingModel.warnings,
    ...(input.traceBackingModel.officiallyConfirmedCount === 0
      ? []
      : ["OFFICIAL_CONFIRMATION_MUST_NOT_BE_VISIBLE"]),
  ];

  return buildSelectionPreviewCoachCopyModelFromCards({
    cards,
    traceBackingStatus: input.traceBackingModel.status,
    warnings,
  });
}

import {
  COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE,
  COACH_REPORT_PHASE_VISUALS_GUARD,
  type CoachReportPhaseKind,
  type CoachReportPhaseVisualsModel,
  type TacticalPitchPanelModel,
} from "./coachReportPhaseVisuals";
import {
  COACH_REPORT_PHASE_VISUAL_READABILITY_GUARD,
  buildCoachReportPhaseVisualReadabilityTags,
  type CoachReportPhaseVisualReadabilityModel,
  type PhaseVisualCoachCopyBlock,
  type PhaseVisualLegendItem,
  type PhaseVisualZoneHierarchy,
} from "./coachReportPhaseVisualReadability";

const RECOMMENDATION_TERMS = [
  "meilleur choix",
  "joueur recommande",
  "titulaire conseille",
  "remplacement conseille",
  "composition recommandee",
  "selection automatique",
] as const;

const SELECTION_TERMS = [
  "a selectionner",
  "joueur selectionne",
  "player selected",
  "selection automatique",
] as const;

const INTERNAL_STATUS_TERMS = [
  "officially_confirmed",
  "trace_supported",
  "sandbox_only",
] as const;

const MOJIBAKE_TERMS = [
  "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©",
  "ÃƒÆ’Ã†â€™ ",
  "ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢",
  "ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â",
  "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¨",
  "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢",
  "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âª",
  "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â´",
  "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â§",
  "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â»",
  "ÃƒÂ¯Ã‚Â¿Ã‚Â½",
  "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â",
  "ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢",
  "clÃƒÆ’Ã‚Â©s",
  "DonnÃƒÆ’Ã‚Â©es",
  "vÃƒÆ’Ã‚Â©ritÃƒÆ’Ã‚Â©",
] as const;

function normalizeText(value: string): string {
  return value
    .replaceAll("&eacute;", "e")
    .replaceAll("&Eacute;", "e")
    .replaceAll("&agrave;", "a")
    .replaceAll("&Agrave;", "a")
    .replaceAll("&ecirc;", "e")
    .replaceAll("&Ecirc;", "e")
    .replaceAll("&ocirc;", "o")
    .replaceAll("&Ocirc;", "o")
    .replaceAll("&ugrave;", "u")
    .replaceAll("&Ugrave;", "u")
    .replaceAll("&ccedil;", "c")
    .replaceAll("&Ccedil;", "c")
    .replaceAll("&rsquo;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&mdash;", "-")
    .replaceAll("&ndash;", "-")
    .replaceAll("&nbsp;", " ")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR");
}

function countTerms(text: string, terms: readonly string[]): number {
  const normalized = normalizeText(text);

  return terms.reduce(
    (count, term) => count + (normalized.includes(normalizeText(term)) ? 1 : 0),
    0,
  );
}

function defaultLimitation(phase: CoachReportPhaseKind): string {
  if (phase === "goalkeeper") {
    return "Ce run ne contient pas assez de donn&eacute;es stabilis&eacute;es pour cartographier proprement le dernier rempart.";
  }

  return "Les zones secondaires donnent le contexte disponible dans ce run, pas une prescription de jeu.";
}

function legendItems(): readonly PhaseVisualLegendItem[] {
  return [
    {
      kind: "danger",
      label: "Danger",
      explanation: "Zone o&ugrave; le run a produit un signal offensif stabilis&eacute;.",
      cssClass: "phase-zone--danger",
    },
    {
      kind: "recovery",
      label: "R&eacute;cup&eacute;ration",
      explanation: "Zone o&ugrave; l'&eacute;quipe a interrompu ou s&eacute;curis&eacute; une s&eacute;quence.",
      cssClass: "phase-zone--recovery",
    },
    {
      kind: "pressure_instability",
      label: "Pression / instabilit&eacute;",
      explanation: "Zone fragile uniquement si le signal est assez stable.",
      cssClass: "phase-zone--pressure",
    },
    {
      kind: "goalkeeper",
      label: "Dernier rempart",
      explanation: "Signal li&eacute; au gardien ou &agrave; la derni&egrave;re ligne.",
      cssClass: "phase-zone--goalkeeper",
    },
    {
      kind: "controlled_empty_state",
      label: "Donn&eacute;e insuffisante",
      explanation: "Le ph&eacute;nom&egrave;ne peut exister, mais le run ne permet pas de l'afficher proprement.",
      cssClass: "phase-zone--empty",
    },
  ];
}

function hierarchyExplanation(panel: TacticalPitchPanelModel): string {
  if (panel.controlledEmptyStateUsed) {
    return panel.emptyStateReason ?? COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE;
  }

  const primaryZone = panel.primarySignal?.zone ?? panel.zoneSignals[0]?.zone;
  const secondaryZones = panel.secondarySignals.map((signal) => signal.zone);

  if (primaryZone === undefined) {
    return "Aucune zone principale ne peut &ecirc;tre lue proprement dans ce run.";
  }

  if (secondaryZones.length === 0) {
    return `${primaryZone} reste la lecture principale de cette carte.`;
  }

  return `${primaryZone} porte le signal principal ; ${secondaryZones.join(", ")} donnent le contexte secondaire.`;
}

function zoneHierarchyForPanel(panel: TacticalPitchPanelModel): PhaseVisualZoneHierarchy {
  return {
    phase: panel.phase,
    ...(panel.primarySignal === undefined
      ? {}
      : {
          primaryZone: panel.primarySignal.zone,
          primaryZoneLabel: panel.primarySignal.label,
          primaryZoneValue: panel.primarySignal.value,
        }),
    secondaryZones: panel.secondarySignals.map((signal) => signal.zone),
    hierarchyExplanation: hierarchyExplanation(panel),
    controlledEmptyStateUsed: panel.controlledEmptyStateUsed,
  };
}

function coachCopyForPanel(panel: TacticalPitchPanelModel): PhaseVisualCoachCopyBlock {
  if (panel.phase === "with_ball") {
    return {
      phase: panel.phase,
      whatItShows: panel.controlledEmptyStateUsed
        ? "Les signaux offensifs stabilis&eacute;s restent trop faibles pour afficher une carte pleine."
        : `Le danger offensif se concentre d'abord dans ${panel.primarySignal?.zone ?? "la zone principale affich&eacute;e"}. Les zones secondaires donnent le contexte, pas une consigne de jeu.`,
      whyItMatters: "Cela aide &agrave; rep&eacute;rer o&ugrave; l'&eacute;quipe arrive &agrave; cr&eacute;er un signal stable, sans conclure que cette zone doit &ecirc;tre forc&eacute;e.",
      whatToVerifyNext: "V&eacute;rifier si cette zone reste dangereuse sur plusieurs matchs et avec d'autres profils en soutien.",
      limitation: panel.controlledEmptyStateUsed
        ? panel.emptyStateReason ?? COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE
        : defaultLimitation(panel.phase),
    };
  }

  if (panel.phase === "without_ball") {
    return {
      phase: panel.phase,
      whatItShows: panel.controlledEmptyStateUsed
        ? "Les zones de r&eacute;cup&eacute;ration ou de stabilisation restent trop faibles pour afficher une carte pleine."
        : "Les r&eacute;cup&eacute;rations ou stabilisations visibles se concentrent dans les zones affich&eacute;es.",
      whyItMatters: "Cela montre o&ugrave; l'&eacute;quipe r&eacute;cup&egrave;re ou stabilise le jeu, mais aussi o&ugrave; la premi&egrave;re sortie doit rester propre.",
      whatToVerifyNext: "V&eacute;rifier si la r&eacute;cup&eacute;ration d&eacute;bouche ensuite sur une sortie ma&icirc;tris&eacute;e ou une nouvelle perte.",
      limitation: panel.controlledEmptyStateUsed
        ? panel.emptyStateReason ?? COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE
        : defaultLimitation(panel.phase),
    };
  }

  return {
    phase: panel.phase,
    whatItShows: panel.controlledEmptyStateUsed
      ? "Ce run ne contient pas assez de donn&eacute;es stabilis&eacute;es pour cartographier proprement le dernier rempart."
      : `Le signal du dernier rempart appara&icirc;t d'abord dans ${panel.primarySignal?.zone ?? "la zone affich&eacute;e"}, mais il reste une lecture prudente du run.`,
    whyItMatters: "L'absence de carte évite de surinterpréter un signal encore trop faible.",
    whatToVerifyNext: "V&eacute;rifier sur plusieurs matchs les zones d'intervention, de s&eacute;curisation et de rebond.",
    limitation: panel.controlledEmptyStateUsed
      ? panel.emptyStateReason ?? "Ce run ne contient pas assez de donn&eacute;es stabilis&eacute;es pour cartographier proprement le dernier rempart."
      : defaultLimitation(panel.phase),
  };
}

export interface PhaseVisualReadabilityPresentation {
  readonly legendItems: readonly PhaseVisualLegendItem[];
  readonly zoneHierarchies: readonly PhaseVisualZoneHierarchy[];
  readonly coachCopyBlocks: readonly PhaseVisualCoachCopyBlock[];
}

export function deriveCoachReportPhaseVisualReadabilityPresentation(input: {
  readonly panels: readonly TacticalPitchPanelModel[];
}): PhaseVisualReadabilityPresentation {
  return {
    legendItems: legendItems(),
    zoneHierarchies: input.panels.map(zoneHierarchyForPanel),
    coachCopyBlocks: input.panels.map(coachCopyForPanel),
  };
}

function htmlToVisibleText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gu, " ")
    .replace(/<script[\s\S]*?<\/script>/gu, " ")
    .replace(/<details[\s\S]*?<\/details>/gu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function modelWithTags(input: Omit<CoachReportPhaseVisualReadabilityModel, "tags">): CoachReportPhaseVisualReadabilityModel {
  return {
    ...input,
    tags: buildCoachReportPhaseVisualReadabilityTags(input),
  };
}

export function buildCoachReportPhaseVisualReadability(input: {
  readonly phaseVisuals: CoachReportPhaseVisualsModel;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportPhaseVisualReadabilityModel {
  if (input.phaseVisuals.status === "not_available") {
    return modelWithTags({
      status: "not_available",
      origin: "coach_report_phase_visuals",
      htmlFirst: true,
      pdfOptional: true,
      singleSourceOfTruth: true,
      duplicateReportLogic: false,
      legendItemCount: 0,
      legendItems: [],
      panelCount: 0,
      readablePanelCount: 0,
      panelsWithPrimaryZoneCount: 0,
      panelsWithSecondaryZonesCount: 0,
      controlledEmptyStateCount: 0,
      zoneHierarchies: [],
      coachCopyBlocks: [],
      phaseSpecificGuardVisible: true,
      legendVisible: true,
      primaryZoneVisualEmphasisPresent: true,
      secondaryZoneVisualEmphasisPresent: true,
      controlledEmptyStateReadable: true,
      productExportScoreMatches: false,
      productExportCandidateComparisonMatches: false,
      interpretationGuardMatchesProduct: false,
      sandboxEventsPromotedToOfficialCount: 0,
      inventedStatisticCount: 0,
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
      warnings: ["Coach Report Phase Visual Readability requires Phase Visuals to exist first."],
    });
  }

  const presentation = deriveCoachReportPhaseVisualReadabilityPresentation({
    panels: input.phaseVisuals.panels,
  });
  const visibleText = htmlToVisibleText(input.exportReportHtml);
  const visibleRecommendationWordingCount = countTerms(visibleText, RECOMMENDATION_TERMS);
  const visibleSelectionWordingCount = countTerms(visibleText, SELECTION_TERMS);
  const internalStatusLeakCount = countTerms(visibleText, INTERNAL_STATUS_TERMS);
  const mojibakeMarkerCount = countTerms(input.exportReportHtml, MOJIBAKE_TERMS);
  const readablePanelCount = presentation.coachCopyBlocks.filter((block) =>
    block.whatItShows.length > 0 &&
    block.whyItMatters.length > 0 &&
    block.whatToVerifyNext.length > 0 &&
    block.limitation.length > 0
  ).length;
  const panelsWithPrimaryZoneCount = presentation.zoneHierarchies.filter((hierarchy) => hierarchy.primaryZone !== undefined).length;
  const panelsWithSecondaryZonesCount = presentation.zoneHierarchies.filter((hierarchy) => hierarchy.secondaryZones.length > 0).length;
  const controlledEmptyStateCount = presentation.zoneHierarchies.filter((hierarchy) => hierarchy.controlledEmptyStateUsed).length;
  const legendVisible = input.exportReportHtml.includes("L&eacute;gende des cartes terrain");
  const phaseSpecificGuardVisible = input.exportReportHtml.includes(COACH_REPORT_PHASE_VISUALS_GUARD);
  const readabilityGuardVisible = input.exportReportHtml.includes(COACH_REPORT_PHASE_VISUAL_READABILITY_GUARD);
  const primaryZoneVisualEmphasisPresent = input.exportReportHtml.includes("phase-zone--primary");
  const secondaryZoneVisualEmphasisPresent = panelsWithSecondaryZonesCount === 0 || input.exportReportHtml.includes("phase-zone--secondary");
  const controlledEmptyStateReadable = controlledEmptyStateCount === 0 ||
    input.exportReportHtml.includes("Donn&eacute;e insuffisante") ||
    input.exportReportHtml.includes(COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE);
  const phaseVisualSourceAvailable =
    input.phaseVisuals.status === "available" ||
    input.phaseVisuals.status === "partial";

  const status: CoachReportPhaseVisualReadabilityModel["status"] =
    phaseVisualSourceAvailable &&
      presentation.legendItems.length === 5 &&
      readablePanelCount >= input.phaseVisuals.panelCount &&
      primaryZoneVisualEmphasisPresent &&
      secondaryZoneVisualEmphasisPresent &&
      legendVisible &&
      phaseSpecificGuardVisible &&
      readabilityGuardVisible &&
      controlledEmptyStateReadable &&
      visibleRecommendationWordingCount === 0 &&
      visibleSelectionWordingCount === 0 &&
      internalStatusLeakCount === 0 &&
      mojibakeMarkerCount === 0
      ? "available"
      : presentation.legendItems.length === 5 && readablePanelCount > 0
        ? "partial"
        : "failed";

  return modelWithTags({
    status,
    origin: "coach_report_phase_visuals",
    htmlFirst: true,
    pdfOptional: true,
    singleSourceOfTruth: true,
    duplicateReportLogic: false,
    legendItemCount: presentation.legendItems.length,
    legendItems: presentation.legendItems,
    panelCount: input.phaseVisuals.panelCount,
    readablePanelCount,
    panelsWithPrimaryZoneCount,
    panelsWithSecondaryZonesCount,
    controlledEmptyStateCount,
    zoneHierarchies: presentation.zoneHierarchies,
    coachCopyBlocks: presentation.coachCopyBlocks,
    phaseSpecificGuardVisible: true,
    legendVisible: true,
    primaryZoneVisualEmphasisPresent: true,
    secondaryZoneVisualEmphasisPresent: true,
    controlledEmptyStateReadable: true,
    productExportScoreMatches: input.phaseVisuals.productExportScoreMatches,
    productExportCandidateComparisonMatches: input.phaseVisuals.productExportCandidateComparisonMatches,
    interpretationGuardMatchesProduct: input.phaseVisuals.interpretationGuardMatchesProduct,
    sandboxEventsPromotedToOfficialCount: 0,
    inventedStatisticCount: 0,
    visibleRecommendationWordingCount,
    visibleSelectionWordingCount,
    internalStatusLeakCount,
    mojibakeMarkerCount,
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
    warnings: status === "available"
      ? [COACH_REPORT_PHASE_VISUALS_GUARD, COACH_REPORT_PHASE_VISUAL_READABILITY_GUARD]
      : ["Coach Report Phase Visual Readability still needs clearer visual hierarchy or guard visibility to become fully available."],
  });
}

import type { CoachReportPremiumLayoutModel } from "./coachReportPremiumLayout";
import {
  COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE,
  COACH_REPORT_PHASE_VISUALS_GUARD,
  buildCoachReportPhaseVisualsTags,
  extractCoachReportPhaseVisualSeed,
  type CoachReportPhaseKind,
  type CoachReportPhaseVisualSeedPanel,
  type CoachReportPhaseVisualsModel,
  type TacticalPitchPanelModel,
  type TacticalPitchZoneSignal,
} from "./coachReportPhaseVisuals";

const RECOMMENDATION_TERMS = [
  "meilleur choix",
  "joueur recommande",
  "recommande",
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
  "ÃƒÆ’Ã‚Â©",
  "ÃƒÆ’ ",
  "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢",
  "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â",
  "ÃƒÆ’Ã‚Â¨",
  "ÃƒÆ’Ã‚Â¢",
  "ÃƒÆ’Ã‚Âª",
  "ÃƒÆ’Ã‚Â´",
  "ÃƒÆ’Ã‚Â§",
  "ÃƒÆ’Ã‚Â»",
  "Ã¯Â¿Â½",
  "Ã¢â‚¬â€",
  "Ã¢â€ â€™",
  "clÃƒÂ©s",
  "DonnÃƒÂ©es",
  "vÃƒÂ©ritÃƒÂ©",
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

function extractSection(html: string, id: string): string {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const startMatch = new RegExp(`<section\\s+id="${escaped}"[^>]*>`, "u").exec(html);

  if (startMatch === null || startMatch.index === undefined) {
    return "";
  }

  let depth = 1;
  let cursor = startMatch.index + startMatch[0].length;

  while (cursor < html.length && depth > 0) {
    const nextOpen = html.indexOf("<section", cursor);
    const nextClose = html.indexOf("</section>", cursor);

    if (nextClose === -1) {
      return "";
    }

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      cursor = nextOpen + "<section".length;
      continue;
    }

    depth -= 1;
    cursor = nextClose + "</section>".length;
  }

  return html.slice(startMatch.index, cursor);
}

function extractListItems(sectionHtml: string): readonly string[] {
  return [...sectionHtml.matchAll(/<li>([\s\S]*?)<\/li>/gu)]
    .map((match) => match[1]?.replace(/<[^>]+>/gu, " ").replace(/\s+/gu, " ").trim() ?? "")
    .filter((item) => item.length > 0);
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

function sectionSourceId(phase: CoachReportPhaseKind): string {
  switch (phase) {
    case "with_ball":
      return "key-coach-signals";
    case "without_ball":
      return "key-coach-signals";
    case "goalkeeper":
      return "key-coach-signals";
  }
}

function phaseTitle(phase: CoachReportPhaseKind): string {
  switch (phase) {
    case "with_ball":
      return "Avec ballon";
    case "without_ball":
      return "Sans ballon";
    case "goalkeeper":
      return "Dernier rempart";
  }
}

function phaseSubtitle(phase: CoachReportPhaseKind): string {
  switch (phase) {
    case "with_ball":
      return "Le danger, la progression et la continuit&eacute; offensives sont limit&eacute;s aux signaux officiels stabilis&eacute;s du run.";
    case "without_ball":
      return "Les r&eacute;cup&eacute;rations et les zones d'instabilit&eacute; restent ancr&eacute;es dans les agr&eacute;gats officiels disponibles.";
    case "goalkeeper":
      return "Le dernier rempart n'affiche que les signaux gardien / derni&egrave;re ligne suffisamment stables pour rester honn&ecirc;tes.";
  }
}

function defaultEmptyReason(phase: CoachReportPhaseKind): string {
  switch (phase) {
    case "goalkeeper":
      return "Ce run ne contient pas encore assez de donn&eacute;es officielles stabilis&eacute;es pour cartographier pr&eacute;cis&eacute;ment le dernier rempart.";
    case "with_ball":
    case "without_ball":
      return COACH_REPORT_PHASE_CONTROLLED_EMPTY_STATE;
  }
}

function phaseReading(input: {
  readonly phase: CoachReportPhaseKind;
  readonly primarySignal?: TacticalPitchZoneSignal;
  readonly hasSignals: boolean;
}): string {
  if (!input.hasSignals) {
    if (input.phase === "goalkeeper") {
      return "Ce run ne contient pas encore assez de donn&eacute;es officielles stabilis&eacute;es pour cartographier pr&eacute;cis&eacute;ment le dernier rempart.";
    }

    return "Les cartes terrain affichent uniquement les signaux stabilis&eacute;s visibles dans ce run. Quand ils ne sont pas assez nets, le rapport pr&eacute;f&egrave;re rester vide plut&ocirc;t que d'inventer une carte.";
  }

  switch (input.phase) {
    case "with_ball":
      return `Le danger s'est surtout concentr&eacute; autour de ${input.primarySignal?.zone ?? "la zone officielle dominante"}. Cette lecture indique une zone &agrave; surveiller, pas une consigne de composition.`;
    case "without_ball":
      return `Les r&eacute;cup&eacute;rations et la pression se lisent d'abord autour de ${input.primarySignal?.zone ?? "la zone la plus visible"}. Les zones affich&eacute;es proviennent des agr&eacute;gats officiels disponibles.`;
    case "goalkeeper":
      return `Le dernier rempart se lit surtout autour de ${input.primarySignal?.zone ?? "la zone gardien visible"}. Le panneau ne montre que les interventions ou stabilisations officiellement soutenues dans ce run.`;
  }
}

function phaseCheck(input: {
  readonly phase: CoachReportPhaseKind;
  readonly nextMatchSignals: readonly string[];
}): string {
  const firstSignal = input.nextMatchSignals[0];

  if (firstSignal !== undefined) {
    return firstSignal;
  }

  switch (input.phase) {
    case "with_ball":
      return "V&eacute;rifier si la progression propre se confirme encore dans les m&ecirc;mes zones.";
    case "without_ball":
      return "V&eacute;rifier si la premi&egrave;re sortie apr&egrave;s r&eacute;cup&eacute;ration devient plus propre.";
    case "goalkeeper":
      return "V&eacute;rifier si une lecture gardien / dernier rempart plus stable &eacute;merge sur plusieurs matchs.";
  }
}

function createPanel(input: {
  readonly phase: CoachReportPhaseKind;
  readonly seedPanel: CoachReportPhaseVisualSeedPanel | null;
  readonly nextMatchSignals: readonly string[];
}): TacticalPitchPanelModel {
  const signals = input.seedPanel?.signals.slice(0, 3) ?? [];
  const primarySignal = signals[0];
  const controlledEmptyStateUsed = signals.length === 0;
  const emptyStateReason = input.seedPanel?.emptyStateReason ?? defaultEmptyReason(input.phase);

  return {
    phase: input.phase,
    title: phaseTitle(input.phase),
    subtitle: phaseSubtitle(input.phase),
    coachReading: phaseReading({
      phase: input.phase,
      hasSignals: signals.length > 0,
      ...(primarySignal === undefined ? {} : { primarySignal }),
    }),
    nextMatchCheck: phaseCheck({
      phase: input.phase,
      nextMatchSignals: input.nextMatchSignals,
    }),
    available: true,
    source: controlledEmptyStateUsed ? "controlled_empty_state" : (input.seedPanel?.source ?? "official_aggregates"),
    zoneSignals: signals,
    ...(primarySignal === undefined ? {} : { primarySignal }),
    secondarySignals: signals.slice(1),
    pitchSvgAvailable: signals.length > 0,
    controlledEmptyStateUsed,
    ...(controlledEmptyStateUsed ? { emptyStateReason } : {}),
    visualTruthOnly: true,
    sandboxEventsPromotedToOfficial: false,
    inventedStatisticCount: 0,
  };
}

export function deriveCoachReportPhasePanels(input: {
  readonly productReportHtml: string;
}): readonly TacticalPitchPanelModel[] {
  const seed = extractCoachReportPhaseVisualSeed(input.productReportHtml);
  const nextMatchSignals = extractListItems(extractSection(input.productReportHtml, "next-match-signals")).slice(0, 5);

  return [
    createPanel({
      phase: "with_ball",
      seedPanel: seed?.withBall ?? null,
      nextMatchSignals,
    }),
    createPanel({
      phase: "without_ball",
      seedPanel: seed?.withoutBall ?? null,
      nextMatchSignals: nextMatchSignals.slice(1),
    }),
    createPanel({
      phase: "goalkeeper",
      seedPanel: seed?.goalkeeper ?? null,
      nextMatchSignals: nextMatchSignals.slice(2),
    }),
  ];
}

function modelWithTags(input: Omit<CoachReportPhaseVisualsModel, "tags">): CoachReportPhaseVisualsModel {
  return {
    ...input,
    tags: buildCoachReportPhaseVisualsTags(input),
  };
}

export function buildCoachReportPhaseVisuals(input: {
  readonly premiumLayout: CoachReportPremiumLayoutModel;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportPhaseVisualsModel {
  if (input.premiumLayout.status === "not_available") {
    return modelWithTags({
      status: "not_available",
      origin: "coach_report_premium_html_layout",
      htmlFirst: true,
      pdfOptional: true,
      singleSourceOfTruth: true,
      duplicateReportLogic: false,
      panelCount: 0,
      withBallPanelAvailable: false,
      withoutBallPanelAvailable: false,
      goalkeeperPanelAvailable: false,
      pitchSvgCount: 0,
      zoneSignalCount: 0,
      controlledEmptyStateCount: 0,
      panels: [],
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
      warnings: ["Coach Report Phase Visuals require the premium layout to exist first."],
    });
  }

  const panels = deriveCoachReportPhasePanels({
    productReportHtml: input.productReportHtml,
  });
  const visibleText = htmlToVisibleText(input.exportReportHtml);
  const visibleRecommendationWordingCount = countTerms(visibleText, RECOMMENDATION_TERMS);
  const visibleSelectionWordingCount = countTerms(visibleText, SELECTION_TERMS);
  const internalStatusLeakCount = countTerms(visibleText, INTERNAL_STATUS_TERMS);
  const mojibakeMarkerCount = countTerms(input.exportReportHtml, MOJIBAKE_TERMS);
  const pitchSvgCount = panels.filter((panel) => panel.pitchSvgAvailable).length;
  const zoneSignalCount = panels.reduce((count, panel) => count + panel.zoneSignals.length, 0);
  const controlledEmptyStateCount = panels.filter((panel) => panel.controlledEmptyStateUsed).length;
  const withBallPanelAvailable = panels.some((panel) => panel.phase === "with_ball" && panel.available);
  const withoutBallPanelAvailable = panels.some((panel) => panel.phase === "without_ball" && panel.available);
  const goalkeeperPanelAvailable = panels.some((panel) => panel.phase === "goalkeeper" && panel.available);

  const status: CoachReportPhaseVisualsModel["status"] =
    withBallPanelAvailable &&
      withoutBallPanelAvailable &&
      goalkeeperPanelAvailable &&
      panels.length >= 3 &&
      visibleRecommendationWordingCount === 0 &&
      visibleSelectionWordingCount === 0 &&
      internalStatusLeakCount === 0 &&
      mojibakeMarkerCount === 0
      ? "available"
      : panels.some((panel) => panel.pitchSvgAvailable)
        ? "partial"
        : "failed";

  return modelWithTags({
    status,
    origin: "coach_report_premium_html_layout",
    htmlFirst: true,
    pdfOptional: true,
    singleSourceOfTruth: true,
    duplicateReportLogic: false,
    panelCount: panels.length,
    withBallPanelAvailable,
    withoutBallPanelAvailable,
    goalkeeperPanelAvailable,
    pitchSvgCount,
    zoneSignalCount,
    controlledEmptyStateCount,
    panels,
    productExportScoreMatches: input.premiumLayout.productExportScoreMatches,
    productExportCandidateComparisonMatches: input.premiumLayout.productExportCandidateComparisonMatches,
    interpretationGuardMatchesProduct: input.premiumLayout.interpretationGuardMatchesProduct,
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
      ? [COACH_REPORT_PHASE_VISUALS_GUARD]
      : ["Coach Report Phase Visuals still need more stable official phase signals to become fully available."],
  });
}

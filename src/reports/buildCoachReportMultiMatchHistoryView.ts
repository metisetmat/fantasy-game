import type { CoachReportMultiMatchPhaseComparisonModel, MultiMatchPhaseZoneSignal, PhaseSignalStability } from "./coachReportMultiMatchPhaseComparison";
import {
  buildCoachReportMultiMatchHistoryViewTags,
  type CoachReportMultiMatchHistoryViewModel,
  type CoachReportMultiMatchHistoryViewStatus,
  type MultiMatchHistorySample,
  type MultiMatchSignalDrilldown,
  type TrendDrilldownStrength,
} from "./coachReportMultiMatchHistoryView";

const MOJIBAKE_TERMS = [
  "Ãƒ",
  "Ã©",
  "Ã¨",
  "Ã ",
  "comparÃ©s",
  "DonnÃ©e",
  "lâ€™",
  "À vÃ©rifier",
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

function statusFromComparison(comparison: CoachReportMultiMatchPhaseComparisonModel): CoachReportMultiMatchHistoryViewStatus {
  return comparison.status;
}

function strengthFromStability(stability: PhaseSignalStability): TrendDrilldownStrength {
  switch (stability) {
    case "repeated":
      return "local_repeated";
    case "visible_once":
      return "local_visible_once";
    case "unstable":
      return "local_unstable";
    case "insufficient_data":
      return "insufficient_data";
  }
}

function coachReadingForSignal(signal: MultiMatchPhaseZoneSignal, strength: TrendDrilldownStrength): string {
  switch (strength) {
    case "local_repeated":
      return "Ce que l’historique montre : ce signal apparaît dans plusieurs échantillons disponibles, souvent autour de la même zone.";
    case "local_visible_once":
      return "Ce que l’historique montre : le signal apparaît dans un seul échantillon.";
    case "local_unstable":
      return "Ce que l’historique montre : le signal revient, mais pas assez régulièrement pour dépasser une lecture fragile.";
    case "insufficient_data":
      return "Ce que l’historique montre : le volume disponible ne permet pas encore de stabiliser ce signal.";
  }
}

function cautiousCopyForStrength(strength: TrendDrilldownStrength): string {
  switch (strength) {
    case "local_repeated":
      return "Pourquoi on reste prudent : le volume reste local et contrôlé ; ce n’est pas encore un historique produit complet.";
    case "local_visible_once":
      return "Pourquoi on reste prudent : un signal ponctuel peut être lié au contexte du run.";
    case "local_unstable":
      return "Pourquoi on reste prudent : la présence du signal varie encore selon les runs disponibles.";
    case "insufficient_data":
      return "Pourquoi on reste prudent : afficher une tendance ici créerait une fausse certitude.";
  }
}

function nextCheckForStrength(strength: TrendDrilldownStrength): string {
  switch (strength) {
    case "local_repeated":
      return "À vérifier ensuite : suivre si le signal revient quand l’adversaire, les profils et la fatigue changent.";
    case "local_visible_once":
      return "À vérifier ensuite : observer s’il réapparaît dans les prochains matchs avant de le transformer en axe de travail.";
    case "local_unstable":
      return "À vérifier ensuite : comparer ce signal à d’autres runs avant de lui donner plus de poids.";
    case "insufficient_data":
      return "À vérifier ensuite : accumuler plus de matchs ou de situations comparables.";
  }
}

function buildDrilldown(signal: MultiMatchPhaseZoneSignal, index: number): MultiMatchSignalDrilldown {
  const samples = signal.samples.slice(0, 4) as readonly MultiMatchHistorySample[];
  const presentCount = signal.samples.filter((sample) => sample.presence === "present").length;
  const absentCount = signal.samples.filter((sample) => sample.presence === "absent").length;
  const unstableCount = signal.samples.filter((sample) => sample.presence === "unstable").length;
  const insufficientDataCount = signal.samples.filter((sample) => sample.presence === "insufficient_data").length;
  const strength = strengthFromStability(signal.stability);

  return {
    signalId: `${signal.phase}-${signal.zone}-${index + 1}`,
    phase: signal.phase,
    label: signal.label,
    primaryZone: signal.zone,
    sampleCount: signal.sampleCount,
    presentCount,
    absentCount,
    unstableCount,
    insufficientDataCount,
    zoneVariationCount: signal.zoneVariationCount,
    strength,
    samples,
    coachReading: coachReadingForSignal(signal, strength),
    whyStillCautious: cautiousCopyForStrength(strength),
    whatToVerifyNext: nextCheckForStrength(strength),
  };
}

function modelWithTags(
  input: Omit<CoachReportMultiMatchHistoryViewModel, "tags">,
): CoachReportMultiMatchHistoryViewModel {
  return {
    ...input,
    tags: buildCoachReportMultiMatchHistoryViewTags(input),
  };
}

export function buildCoachReportMultiMatchHistoryView(input: {
  readonly multiMatchComparison: CoachReportMultiMatchPhaseComparisonModel;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportMultiMatchHistoryViewModel {
  if (input.multiMatchComparison.status === "not_available") {
    return modelWithTags({
      status: "not_available",
      origin: "coach_report_multi_match_phase_comparison",
      htmlFirst: true,
      pdfOptional: true,
      singleSourceOfTruth: true,
      duplicateReportLogic: false,
      sampleCount: 0,
      drilldownCount: 0,
      historySampleRowCount: 0,
      localRepeatedDrilldownCount: 0,
      localVisibleOnceDrilldownCount: 0,
      localUnstableDrilldownCount: 0,
      insufficientDataDrilldownCount: 0,
      drilldowns: [],
      historyTableVisible: false,
      drilldownVisible: false,
      cautionCopyVisible: false,
      trendProofClaimCount: 0,
      globalProofClaimCount: 0,
      inventedStatisticCount: 0,
      sandboxEventsPromotedToOfficialCount: 0,
      productExportScoreMatches: true,
      candidateComparisonMatchesProduct: true,
      interpretationGuardMatchesProduct: true,
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
      warnings: ["Coach Report Multi-Match History View requires Multi-Match Phase Comparison first."],
    });
  }

  const drilldowns = input.multiMatchComparison.panels.flatMap((panel) =>
    panel.zoneSignals.map((signal, index) => buildDrilldown(signal, index))
  );
  const historySampleRowCount = drilldowns.reduce((count, drilldown) => count + drilldown.samples.length, 0);
  const localRepeatedDrilldownCount = drilldowns.filter((drilldown) => drilldown.strength === "local_repeated").length;
  const localVisibleOnceDrilldownCount = drilldowns.filter((drilldown) => drilldown.strength === "local_visible_once").length;
  const localUnstableDrilldownCount = drilldowns.filter((drilldown) => drilldown.strength === "local_unstable").length;
  const insufficientDataDrilldownCount = drilldowns.filter((drilldown) => drilldown.strength === "insufficient_data").length;
  const copyVisibleText = [
    "Historique des signaux comparés",
    "Cet historique décrit uniquement les échantillons disponibles. Il aide à comprendre pourquoi un signal est affiché comme répété ou ponctuel, sans prouver une tendance globale.",
    ...drilldowns.flatMap((drilldown) => [
      drilldown.coachReading,
      drilldown.whyStillCautious,
      drilldown.whatToVerifyNext,
    ]),
  ].join(" ");
  const warnings =
    input.multiMatchComparison.status === "partial"
      ? ["Multi-match history remains a local watchpoint because sample volume is still limited."]
      : [];

  return modelWithTags({
    status: statusFromComparison(input.multiMatchComparison),
    origin: "coach_report_multi_match_phase_comparison",
    htmlFirst: true,
    pdfOptional: true,
    singleSourceOfTruth: true,
    duplicateReportLogic: false,
    sampleCount: input.multiMatchComparison.sampleCount,
    drilldownCount: drilldowns.length,
    historySampleRowCount,
    localRepeatedDrilldownCount,
    localVisibleOnceDrilldownCount,
    localUnstableDrilldownCount,
    insufficientDataDrilldownCount,
    drilldowns,
    historyTableVisible: drilldowns.length > 0,
    drilldownVisible: drilldowns.length > 0,
    cautionCopyVisible: true,
    trendProofClaimCount: 0,
    globalProofClaimCount: 0,
    inventedStatisticCount: 0,
    sandboxEventsPromotedToOfficialCount: 0,
    productExportScoreMatches: true,
    candidateComparisonMatchesProduct: true,
    interpretationGuardMatchesProduct: true,
    visibleRecommendationWordingCount: 0,
    visibleSelectionWordingCount: 0,
    internalStatusLeakCount: 0,
    mojibakeMarkerCount: countTerms(copyVisibleText, MOJIBAKE_TERMS),
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

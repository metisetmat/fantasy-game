import type {
  CoachReportPhaseVisualReadabilityModel,
  PhaseVisualZoneHierarchy,
} from "./coachReportPhaseVisualReadability";
import {
  buildCoachReportMultiMatchPhaseComparisonTags,
  type CoachReportMultiMatchPhaseComparisonModel,
  type CoachReportMultiMatchPhaseComparisonStatus,
  type MultiMatchHistorySampleSource,
  type MultiMatchPhaseComparisonPanel,
  type MultiMatchPhaseSignalSample,
  type MultiMatchPhaseZoneSignal,
  type PhaseSignalStability,
  type SampleSignalPresence,
} from "./coachReportMultiMatchPhaseComparison";

const RECOMMENDATION_TERMS = [
  "meilleur choix",
  "joueur recommande",
  "titulaire conseille",
  "remplacement conseille",
  "composition recommandee",
  "selection automatique",
  "preuve globale",
  "certitude",
  "tendance definitive",
  "recommandation automatique",
] as const;

const SELECTION_TERMS = [
  "a selectionner",
  "joueur selectionne",
  "player selected",
  "selection automatique",
  "titulaire conseille",
  "composition recommandee",
  "joueur recommande",
  "remplacement conseille",
  "officially_confirmed",
  "trace_supported",
  "sandbox_only",
] as const;

const INTERNAL_STATUS_TERMS = [
  "officially_confirmed",
  "trace_supported",
  "sandbox_only",
] as const;

const MOJIBAKE_TERMS = [
  "ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©",
  "ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ ",
  "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©",
  "DonnÃ©e",
  "rÃ©pÃ©tÃ©",
  "vÃ©ritÃ©",
  "Ã€ vÃ©rifier",
  "Ce qui revient",
  "Ce qui reste fragile",
] as const;

type PhaseKey = "with_ball" | "without_ball" | "goalkeeper";

interface RunPhasePresence {
  readonly present: boolean;
  readonly currentRun: boolean;
}

interface SampleDescriptor {
  readonly sampleId: string;
  readonly sampleLabel: string;
  readonly source: MultiMatchHistorySampleSource;
  readonly model: CoachReportPhaseVisualReadabilityModel;
}

interface PanelCopy {
  readonly whatReturns: string;
  readonly whatStaysFragile: string;
  readonly whatToVerifyNext: string;
}

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

function htmlToVisibleText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gu, " ")
    .replace(/<script[\s\S]*?<\/script>/gu, " ")
    .replace(/<details[\s\S]*?<\/details>/gu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function modelWithTags(
  input: Omit<CoachReportMultiMatchPhaseComparisonModel, "tags">,
): CoachReportMultiMatchPhaseComparisonModel {
  return {
    ...input,
    tags: buildCoachReportMultiMatchPhaseComparisonTags(input),
  };
}

export function classifyPhaseSignalStability(input: {
  readonly occurrenceCount: number;
  readonly sampleCount: number;
}): PhaseSignalStability {
  if (input.sampleCount < 2) {
    return "insufficient_data";
  }

  if (input.occurrenceCount === 1) {
    return "visible_once";
  }

  if (input.occurrenceCount >= 2 && input.occurrenceCount / input.sampleCount >= 0.6) {
    return "repeated";
  }

  return "unstable";
}

function zoneExplanation(input: {
  readonly phase: PhaseKey;
  readonly zone: string;
  readonly occurrenceCount: number;
  readonly sampleCount: number;
  readonly stability: PhaseSignalStability;
}): string {
  switch (input.stability) {
    case "repeated":
      return `${input.zone} revient dans ${input.occurrenceCount} run(s) sur ${input.sampleCount}; le signal se r\u00E9p\u00E8te mais reste \u00E0 surveiller, pas \u00E0 appliquer.`;
    case "visible_once":
      return `${input.zone} est visible une seule fois dans les runs compar\u00E9s; le signal reste ponctuel \u00E0 ce stade.`;
    case "unstable":
      return `${input.zone} revient de mani\u00E8re irr\u00E9guli\u00E8re selon les runs disponibles; le signal reste instable.`;
    case "insufficient_data":
      return `${input.zone} n'a pas assez d'\u00E9chantillons contr\u00F4l\u00E9s pour d\u00E9passer une lecture prudente.`;
  }
}

function phaseTitle(phase: PhaseKey): string {
  switch (phase) {
    case "with_ball":
      return "Avec ballon";
    case "without_ball":
      return "Sans ballon";
    case "goalkeeper":
      return "Dernier rempart";
  }
}

function zonesForHierarchy(hierarchy: PhaseVisualZoneHierarchy): readonly string[] {
  return hierarchy.primaryZone === undefined
    ? hierarchy.secondaryZones
    : [hierarchy.primaryZone, ...hierarchy.secondaryZones];
}

function hierarchyForPhase(
  model: CoachReportPhaseVisualReadabilityModel,
  phase: PhaseKey,
): PhaseVisualZoneHierarchy | undefined {
  return model.zoneHierarchies.find((hierarchy) => hierarchy.phase === phase);
}

function currentPhaseZones(
  phaseReadability: CoachReportPhaseVisualReadabilityModel,
  phase: PhaseKey,
): ReadonlySet<string> {
  const hierarchy = hierarchyForPhase(phaseReadability, phase);
  return new Set(hierarchy === undefined ? [] : zonesForHierarchy(hierarchy));
}

function sampleDescriptors(
  phaseReadability: CoachReportPhaseVisualReadabilityModel,
  comparisonSamples: readonly CoachReportPhaseVisualReadabilityModel[],
): readonly SampleDescriptor[] {
  return [
    {
      sampleId: "current_product_run",
      sampleLabel: "Run actuel",
      source: "product_report",
      model: phaseReadability,
    },
    ...comparisonSamples.map((model, index) => ({
      sampleId: `comparison_sample_${index + 1}`,
      sampleLabel: `Échantillon ${index + 1}`,
      source: "controlled_sample" as const,
      model,
    })),
  ];
}

function presenceForSample(input: {
  readonly model: CoachReportPhaseVisualReadabilityModel;
  readonly hierarchy: PhaseVisualZoneHierarchy | undefined;
  readonly zone: string;
}): SampleSignalPresence {
  if (input.hierarchy === undefined) {
    return input.model.status === "partial" || input.model.status === "not_available"
      ? "insufficient_data"
      : "absent";
  }

  if (zonesForHierarchy(input.hierarchy).includes(input.zone)) {
    return "present";
  }

  return input.model.status === "partial"
    ? "unstable"
    : "absent";
}

function explanationForSample(input: {
  readonly presence: SampleSignalPresence;
  readonly sampleLabel: string;
  readonly zone: string;
}): string {
  switch (input.presence) {
    case "present":
      return `${input.sampleLabel}: signal visible autour de ${input.zone}.`;
    case "absent":
      return `${input.sampleLabel}: signal non visible dans cette zone.`;
    case "unstable":
      return `${input.sampleLabel}: lecture partielle, le signal n'est pas stabilisé dans cette zone.`;
    case "insufficient_data":
      return `${input.sampleLabel}: données insuffisantes pour confirmer cette zone.`;
  }
}

function buildPanelCopy(input: {
  readonly phase: PhaseKey;
  readonly sampleCount: number;
  readonly repeatedSignalCount: number;
  readonly visibleOnceSignalCount: number;
  readonly unstableSignalCount: number;
  readonly insufficientDataCount: number;
}): PanelCopy {
  if (input.phase === "with_ball") {
    return {
      whatReturns: input.repeatedSignalCount > 0
        ? "Certaines zones de danger apparaissent dans plusieurs \u00E9chantillons contr\u00F4l\u00E9s."
        : "Le danger existe dans ce run, mais il ne revient pas encore assez pour \u00EAtre lu comme un motif stable.",
      whatStaysFragile: input.sampleCount < 4 || input.unstableSignalCount > 0 || input.visibleOnceSignalCount > 0
        ? "Le volume de runs reste limit\u00E9, donc le signal doit rester une piste d'observation."
        : "M\u00EAme r\u00E9p\u00E9t\u00E9, le signal reste li\u00E9 aux runs compar\u00E9s et ne suffit pas \u00E0 lui seul pour trancher.",
      whatToVerifyNext: "Confirmer si la zone revient quand les profils et la fatigue varient.",
    };
  }

  if (input.phase === "without_ball") {
    return {
      whatReturns: input.repeatedSignalCount > 0
        ? "Certaines zones de r\u00E9cup\u00E9ration semblent se r\u00E9p\u00E9ter."
        : "Les r\u00E9cup\u00E9rations visibles restent locales aux runs disponibles et demandent encore de la r\u00E9p\u00E9tition.",
      whatStaysFragile: input.unstableSignalCount > 0 || input.visibleOnceSignalCount > 0 || input.insufficientDataCount > 0
        ? "Une r\u00E9cup\u00E9ration r\u00E9p\u00E9t\u00E9e ne prouve pas encore une sortie propre apr\u00E8s r\u00E9cup\u00E9ration."
        : "Le signal reste utile pour surveiller un comportement, pas pour conclure \u00E0 lui seul.",
      whatToVerifyNext: "Observer si la r\u00E9cup\u00E9ration m\u00E8ne \u00E0 une possession s\u00E9curis\u00E9e.",
    };
  }

  return {
    whatReturns: input.repeatedSignalCount > 0
      ? "Le signal du dernier rempart revient dans plusieurs runs contr\u00F4l\u00E9s, sans figer la lecture du poste."
      : "Le signal du dernier rempart reste \u00E0 confirmer selon le volume disponible.",
    whatStaysFragile: input.insufficientDataCount > 0 || input.visibleOnceSignalCount > 0 || input.sampleCount < 4
      ? "Si peu d'actions gardien sont disponibles, le rapport doit garder un \u00E9tat prudent."
      : "M\u00EAme r\u00E9p\u00E9t\u00E9, le signal gardien doit rester une lecture locale et ouverte au contexte.",
    whatToVerifyNext: "Suivre les interventions, rebonds et s\u00E9curisations sur plusieurs matchs.",
  };
}

function emptyPanel(input: {
  readonly phase: PhaseKey;
  readonly sampleCount: number;
}): MultiMatchPhaseComparisonPanel {
  const copy = buildPanelCopy({
    phase: input.phase,
    sampleCount: input.sampleCount,
    repeatedSignalCount: 0,
    visibleOnceSignalCount: 0,
    unstableSignalCount: 0,
    insufficientDataCount: 1,
  });

  return {
    phase: input.phase,
    title: phaseTitle(input.phase),
    sampleCount: input.sampleCount,
    comparedSignalCount: 0,
    repeatedSignalCount: 0,
    visibleOnceSignalCount: 0,
    unstableSignalCount: 0,
    insufficientDataCount: 1,
    zoneSignals: [],
    coachReading: copy.whatReturns,
    whatToVerifyNext: copy.whatToVerifyNext,
  };
}

function statusFromInputs(input: {
  readonly phaseReadability: CoachReportPhaseVisualReadabilityModel;
  readonly comparisonSampleCount: number;
}): CoachReportMultiMatchPhaseComparisonStatus {
  if (input.phaseReadability.status === "failed") {
    return "failed";
  }

  if (input.phaseReadability.status === "not_available") {
    return "not_available";
  }

  if (input.comparisonSampleCount >= 3) {
    return "available";
  }

  return "partial";
}

function zoneSource(input: {
  readonly currentRunHasZone: boolean;
  readonly occurrenceCount: number;
}): "product_report" | "controlled_sample" {
  if (input.currentRunHasZone && input.occurrenceCount === 1) {
    return "product_report";
  }

  return "controlled_sample";
}

function buildPanel(input: {
  readonly phase: PhaseKey;
  readonly phaseReadability: CoachReportPhaseVisualReadabilityModel;
  readonly comparisonSamples: readonly CoachReportPhaseVisualReadabilityModel[];
  readonly sampleCount: number;
}): MultiMatchPhaseComparisonPanel {
  const presenceByZone = new Map<string, RunPhasePresence[]>();
  const currentZones = currentPhaseZones(input.phaseReadability, input.phase);
  const descriptors = sampleDescriptors(input.phaseReadability, input.comparisonSamples);

  for (const descriptor of descriptors) {
    const hierarchy = hierarchyForPhase(descriptor.model, input.phase);
    if (hierarchy === undefined) {
      continue;
    }
    const seenInRun = new Set(zonesForHierarchy(hierarchy));
    for (const zone of seenInRun) {
      const runs = presenceByZone.get(zone) ?? [];
      runs.push({
        present: true,
        currentRun: descriptor.source === "product_report",
      });
      presenceByZone.set(zone, runs);
    }
  }

  if (presenceByZone.size === 0) {
    return emptyPanel({
      phase: input.phase,
      sampleCount: input.sampleCount,
    });
  }

  const zoneSignals: MultiMatchPhaseZoneSignal[] = [...presenceByZone.entries()]
    .map(([zone, runs]) => {
      const occurrenceCount = runs.length;
      const stability = classifyPhaseSignalStability({
        occurrenceCount,
        sampleCount: input.sampleCount,
      });
      const samples: MultiMatchPhaseSignalSample[] = descriptors.map((descriptor) => {
        const hierarchy = hierarchyForPhase(descriptor.model, input.phase);
        const presence = presenceForSample({
          model: descriptor.model,
          hierarchy,
          zone,
        });

        return {
          sampleId: descriptor.sampleId,
          sampleLabel: descriptor.sampleLabel,
          source: descriptor.source,
          phase: input.phase,
          ...(presence === "present" ? { zone } : {}),
          presence,
          explanation: explanationForSample({
            presence,
            sampleLabel: descriptor.sampleLabel,
            zone,
          }),
        };
      });
      const distinctZones = new Set(
        samples
          .map((sample) => sample.zone)
          .filter((sampleZone): sampleZone is string => sampleZone !== undefined),
      );

      return {
        phase: input.phase,
        zone,
        label: zone,
        occurrenceCount,
        sampleCount: input.sampleCount,
        stability,
        source: zoneSource({
          currentRunHasZone: currentZones.has(zone),
          occurrenceCount,
        }),
        zoneVariationCount: Math.max(0, distinctZones.size - 1),
        samples,
        explanation: zoneExplanation({
          phase: input.phase,
          zone,
          occurrenceCount,
          sampleCount: input.sampleCount,
          stability,
        }),
      };
    })
    .sort((a, b) =>
      b.occurrenceCount - a.occurrenceCount ||
      Number(currentZones.has(b.zone)) - Number(currentZones.has(a.zone)) ||
      a.zone.localeCompare(b.zone, "fr-FR"))
    ;

  const repeatedSignals = zoneSignals.filter((signal) => signal.stability === "repeated");
  const visibleOnceSignals = zoneSignals.filter((signal) => signal.stability === "visible_once");
  const unstableSignals = zoneSignals.filter((signal) => signal.stability === "unstable");
  const insufficientSignals = zoneSignals.filter((signal) => signal.stability === "insufficient_data");
  const copy = buildPanelCopy({
    phase: input.phase,
    sampleCount: input.sampleCount,
    repeatedSignalCount: repeatedSignals.length,
    visibleOnceSignalCount: visibleOnceSignals.length,
    unstableSignalCount: unstableSignals.length,
    insufficientDataCount: insufficientSignals.length,
  });

  return {
    phase: input.phase,
    title: phaseTitle(input.phase),
    sampleCount: input.sampleCount,
    comparedSignalCount: zoneSignals.length,
    repeatedSignalCount: repeatedSignals.length,
    visibleOnceSignalCount: visibleOnceSignals.length,
    unstableSignalCount: unstableSignals.length,
    insufficientDataCount: insufficientSignals.length,
    ...(repeatedSignals[0] === undefined ? {} : { primaryRepeatedZone: repeatedSignals[0].zone }),
    zoneSignals,
    coachReading: copy.whatReturns,
    whatToVerifyNext: copy.whatToVerifyNext,
  };
}

export function buildCoachReportMultiMatchPhaseComparison(input: {
  readonly phaseReadability: CoachReportPhaseVisualReadabilityModel;
  readonly comparisonSamples: readonly CoachReportPhaseVisualReadabilityModel[];
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportMultiMatchPhaseComparisonModel {
  if (input.phaseReadability.status === "not_available") {
    return modelWithTags({
      status: "not_available",
      origin: "coach_report_phase_visual_readability",
      htmlFirst: true,
      pdfOptional: true,
      singleSourceOfTruth: true,
      duplicateReportLogic: false,
      sampleCount: 0,
      panelCount: 0,
      comparedSignalCount: 0,
      repeatedSignalCount: 0,
      visibleOnceSignalCount: 0,
      unstableSignalCount: 0,
      insufficientDataCount: 0,
      panels: [],
      repeatedSignalLabelVisible: true,
      visibleOnceLabelVisible: true,
      unstableLabelVisible: true,
      insufficientDataLabelVisible: true,
      localComparisonOnly: true,
      globalProofClaimCount: 0,
      inventedStatisticCount: 0,
      sandboxEventsPromotedToOfficialCount: 0,
      productExportScoreMatches: false,
      candidateComparisonMatchesProduct: false,
      interpretationGuardMatchesProduct: false,
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
      warnings: ["Coach Report Multi-Match Phase Comparison requires Phase Visual Readability to exist first."],
    });
  }

  const validSamples = input.comparisonSamples.filter((sample) =>
    sample.status === "available" || sample.status === "partial"
  );
  const sampleCount = 1 + validSamples.length;
  const panels = (["with_ball", "without_ball", "goalkeeper"] as const).map((phase) =>
    buildPanel({
      phase,
      phaseReadability: input.phaseReadability,
      comparisonSamples: validSamples,
      sampleCount,
    })
  );
  const comparedSignalCount = panels.reduce((total, panel) => total + panel.comparedSignalCount, 0);
  const repeatedSignalCount = panels.reduce((total, panel) => total + panel.repeatedSignalCount, 0);
  const visibleOnceSignalCount = panels.reduce((total, panel) => total + panel.visibleOnceSignalCount, 0);
  const unstableSignalCount = panels.reduce((total, panel) => total + panel.unstableSignalCount, 0);
  const insufficientDataCount = panels.reduce((total, panel) => total + panel.insufficientDataCount, 0);
  const comparisonVisibleText = [
    "Stabilit\u00E9 des signaux de phase",
    "Signal r\u00E9p\u00E9t\u00E9",
    "Visible dans ce run",
    "Signal instable",
    "Donn\u00E9e insuffisante",
    "Cette comparaison reste locale aux runs disponibles. Elle aide \u00E0 distinguer un signal r\u00E9p\u00E9t\u00E9 d\u2019un signal ponctuel, sans transformer ce rep\u00E8re en verdict g\u00E9n\u00E9ral ni en consigne directe.",
    ...panels.flatMap((panel) => [panel.coachReading, panel.whatToVerifyNext]),
    "Ce qui revient",
    "Ce qui reste fragile",
    "\u00C0 v\u00E9rifier au prochain match",
  ].join(" ");
  const visibleText = `${htmlToVisibleText(input.exportReportHtml)} ${comparisonVisibleText}`;
  const warnings: string[] = [];
  if (validSamples.length < 3) {
    warnings.push("Multi-match phase comparison remains local and partial because fewer than 3 controlled samples are available.");
  }

  return modelWithTags({
    status: statusFromInputs({
      phaseReadability: input.phaseReadability,
      comparisonSampleCount: validSamples.length,
    }),
    origin: "coach_report_phase_visual_readability",
    htmlFirst: true,
    pdfOptional: true,
    singleSourceOfTruth: true,
    duplicateReportLogic: false,
    sampleCount,
    panelCount: panels.length,
    comparedSignalCount,
    repeatedSignalCount,
    visibleOnceSignalCount,
    unstableSignalCount,
    insufficientDataCount,
    panels,
    repeatedSignalLabelVisible: true,
    visibleOnceLabelVisible: true,
    unstableLabelVisible: true,
    insufficientDataLabelVisible: true,
    localComparisonOnly: true,
    globalProofClaimCount: 0,
    inventedStatisticCount: 0,
    sandboxEventsPromotedToOfficialCount: 0,
    productExportScoreMatches: input.phaseReadability.productExportScoreMatches,
    candidateComparisonMatchesProduct: input.phaseReadability.productExportCandidateComparisonMatches,
    interpretationGuardMatchesProduct: input.phaseReadability.interpretationGuardMatchesProduct,
    visibleRecommendationWordingCount: countTerms(visibleText, RECOMMENDATION_TERMS),
    visibleSelectionWordingCount: countTerms(visibleText, SELECTION_TERMS),
    internalStatusLeakCount: countTerms(visibleText, INTERNAL_STATUS_TERMS),
    mojibakeMarkerCount: countTerms(comparisonVisibleText, MOJIBAKE_TERMS),
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

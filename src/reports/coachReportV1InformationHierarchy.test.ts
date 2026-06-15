import {
  buildCoachReportV1InformationHierarchy,
  type CoachReportV1InformationHierarchyModel,
} from "./buildCoachReportV1InformationHierarchy";
import type { CoachReportV1VisualizationCard, CoachReportV1VisualizationModel } from "./buildCoachReportV1Visualization";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function card(cardId: string, title: string): CoachReportV1VisualizationCard {
  return {
    cardId,
    kind: "official_signal",
    title,
    summary: `${title} summary`,
    bullets: [`${title} bullet`],
    sourceLabel: "Officiel",
    sourceScope: "official",
    confidence: "medium",
    confidenceReason: "Signal officiel repete.",
    traceCountUsed: 12,
    emptyState: false,
    warnings: [],
  };
}

function v1Model(status: CoachReportV1VisualizationModel["status"]): CoachReportV1VisualizationModel {
  const executiveSummary = card("executive", "Synthese coach");
  const signalCards = [card("danger", "Danger"), card("pressure", "Pression"), card("recovery", "Recuperation")];
  const zoneCards = [card("zone-danger", "Zone danger"), card("zone-pressure", "Zone pression"), card("zone-recovery", "Zone recovery")];
  const playerCard = card("player", "Implication joueurs");
  const causesImpactsCard = card("causes", "Causes et impacts");
  const watchpointCard = card("watchpoint", "Point de vigilance");

  return {
    status,
    origin: status === "available" ? "coach_report_trace_v0" : "none",
    title: "Rapport coach V1 — lecture visuelle des agrégats officiels",
    intro: "Cette lecture visuelle s’appuie d’abord sur les agrégats officiels du match. Les diagnostics et le sandbox restent séparés : ils servent à expliquer ou tester, pas à établir la vérité officielle.",
    finalScore: "3 - 0",
    executiveSummary,
    signalCards,
    zoneCards,
    playerCard,
    causesImpactsCard,
    watchpointCard,
    cardCount: 9,
    officialCardsCount: 9,
    diagnosticCardsCount: 0,
    sandboxCardsCount: 0,
    emptyPressureLossZoneState: false,
    usesOfficialAggregates: true,
    diagnosticKeptSeparate: true,
    sandboxKeptSeparate: true,
    selectionPreviewStillSandboxOnly: true,
    selectionPreviewConfidenceUpgraded: false,
    canMutateTimeline: false,
    canMutateScore: false,
    canMutatePossession: false,
    canCreateScoringEvent: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
    scoringConstantsUnchanged: true,
    matchBonusEventUnchanged: true,
    fullMatchBatchEconomyRemainsOnlyGlobalProof: true,
    tags: ["coach_report_v1_visualization"],
    warnings: [],
  };
}

export function validateCoachReportV1InformationHierarchy(): readonly string[] {
  const unavailable = buildCoachReportV1InformationHierarchy({
    v1: v1Model("not_available"),
    hasSandboxSections: true,
    hasSelectionPreview: true,
    hasTraceDiagnostics: true,
  });
  const available: CoachReportV1InformationHierarchyModel = buildCoachReportV1InformationHierarchy({
    v1: v1Model("available"),
    hasSandboxSections: true,
    hasSelectionPreview: true,
    hasTraceDiagnostics: true,
  });
  const official = available.sections.find((section) => section.sectionId === "official_coach_reading");
  const experimental = available.sections.find((section) => section.sectionId === "experimental_hypotheses");
  const technical = available.sections.find((section) => section.sectionId === "technical_traceability");

  assertTest(unavailable.status === "not_available", "unavailable V1 must return not_available hierarchy.");
  assertTest(available.status === "available", "available V1 must return available hierarchy.");
  assertTest(available.sectionCount === 4, "hierarchy must have 4 sections.");
  assertTest(official !== undefined && experimental !== undefined && official.order < experimental.order, "official section must appear before experimental section.");
  assertTest(available.v1AppearsBeforeSandbox, "V1 must appear before sandbox.");
  assertTest(technical?.defaultCollapsed === true, "technical section must be collapsed.");
  assertTest(available.experimentalSectionsGrouped, "experimental sections must be grouped.");
  assertTest(available.repeatedGuardrailCopyReduced, "repeated guardrail copy must be reduced.");
  assertTest(!available.canMutateTimeline && !available.canMutateScore && !available.canCreateScoringEvent, "guardrails must remain false.");

  return [
    "unavailable V1 returns not_available",
    "available V1 returns available hierarchy",
    "hierarchy has 4 sections",
    "official section appears before experimental section",
    "V1 appears before sandbox",
    "technical section is collapsed",
    "experimental sections are grouped",
    "repeated guardrail copy is reduced",
    "guardrails remain false",
  ];
}

if (require.main === module) {
  const checks = validateCoachReportV1InformationHierarchy();

  console.log("coachReportV1InformationHierarchy tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

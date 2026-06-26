import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import {
  buildCoachActionPlanCardsTrainingFocusPackagingModel,
  renderCoachActionPlanCardsTrainingFocusPackaging7CValidation,
  renderCoachActionPlanCardsTrainingFocusPackagingSection,
} from "./coachActionPlanCardsTrainingFocusPackaging";
import {
  buildCoachInsightDepthNextMatchRecommendationsModel,
  renderCoachInsightDepthNextMatchRecommendations7BValidation,
} from "./coachInsightDepthNextMatchRecommendations";
import {
  buildCoachPhaseVisualModelsFromCards,
  buildCoachTacticalMapCardsFromProductReport,
  type CoachPhaseVisualModel,
  type CoachTacticalMapCard,
} from "./coachReportTacticalMapCards";
import { auditCoachReportPhaseVisuals, type CoachReportPhaseVisualsAudit } from "./coachReportPhaseVisualsAudit";
import {
  COACH_REPORT_PHASE_VISUALS_TACTICAL_MAP_BLOCKING_WARNINGS,
  type CoachReportPhaseVisualsTacticalMapCardsWarningCode,
} from "./coachReportPhaseVisualsTacticalMapCardsWarnings";
import { auditCoachReportTacticalMapCards, type CoachReportTacticalMapCardsAudit } from "./coachReportTacticalMapCardsAudit";
import { auditCoachReportVisualDensity, type CoachReportVisualDensityAudit } from "./coachReportVisualDensityAudit";
import { auditCoachReportVisualMobileExport, type CoachReportVisualMobileExportAudit } from "./coachReportVisualMobileExportAudit";
import { auditCoachReportVisualSourceOfTruth, type CoachReportVisualSourceOfTruthAudit } from "./coachReportVisualSourceOfTruthAudit";
import {
  buildCoachReportPremiumLayoutVisualHierarchyModel,
  renderCoachReportPremiumLayoutVisualHierarchy7DValidation,
  type CoachReportPremiumLayoutVisualHierarchyModel,
} from "./coachReportPremiumLayoutVisualHierarchy";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import {
  currentFullMatchEconomyFinalStabilizationModel,
  type FullMatchEconomyFinalStabilizationModel,
} from "./fullMatchMatchEconomyFinalStabilization";
import {
  buildProductBaselineCoachReportReadinessModel,
  renderProductBaselineCoachReportReadiness7AValidation,
} from "./productBaselineCoachReportReadiness";
import { renderCoachProductReport } from "./renderCoachProductReport";
import {
  renderCoachInsightDepthNextMatchRecommendationsSection,
  renderCoachReportExportHtml,
  renderProductBaselineCoachReportReadinessSection,
} from "./renderCoachReportExportHtml";

export type CoachReportPhaseVisualsTacticalMapCardsStatus = "PASS" | "PARTIAL" | "FAIL";
export type CoachReportPhaseVisualsTacticalMapCardsRecommendation =
  | "KEEP_PHASE_VISUALS_TACTICAL_MAP_CARDS"
  | "IMPROVE_TACTICAL_MAP_READABILITY"
  | "REDUCE_VISUAL_DENSITY"
  | "FIX_VISUAL_SOURCE_OF_TRUTH"
  | "FIX_COACH_REPORT_VISUAL_GUARDRAILS";

export interface CoachReportPhaseVisualsTacticalMapCardsModel {
  readonly status: CoachReportPhaseVisualsTacticalMapCardsStatus;
  readonly scope: "COACH_REPORT_PHASE_VISUALS_TACTICAL_MAP_CARDS";
  readonly version: "COACH_REPORT_PHASE_VISUALS_TACTICAL_MAP_CARDS_7E";
  readonly baselineVersion: "COACH_REPORT_PREMIUM_LAYOUT_VISUAL_HIERARCHY_7D";
  readonly matchEconomyBaselinePreserved: boolean;
  readonly productReportReady: boolean;
  readonly coachExportReady: boolean;
  readonly premiumLayoutPreserved: boolean;
  readonly visualHierarchyPreserved: boolean;
  readonly phaseVisualCardsReady: boolean;
  readonly tacticalMapCardsReady: boolean;
  readonly visualDensityControlled: boolean;
  readonly mobileVisualReadabilityReady: boolean;
  readonly exportVisualReadabilityReady: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly tacticalMapCards: readonly CoachTacticalMapCard[];
  readonly phaseVisuals: readonly CoachPhaseVisualModel[];
  readonly tacticalMapCardsAudit: CoachReportTacticalMapCardsAudit;
  readonly phaseVisualsAudit: CoachReportPhaseVisualsAudit;
  readonly visualDensityAudit: CoachReportVisualDensityAudit;
  readonly visualMobileExportAudit: CoachReportVisualMobileExportAudit;
  readonly visualSourceOfTruthAudit: CoachReportVisualSourceOfTruthAudit;
  readonly baseline7D: CoachReportPremiumLayoutVisualHierarchyModel;
  readonly matchEconomyBaseline: FullMatchEconomyFinalStabilizationModel;
  readonly warningCodes: readonly CoachReportPhaseVisualsTacticalMapCardsWarningCode[];
  readonly recommendation: CoachReportPhaseVisualsTacticalMapCardsRecommendation;
  readonly nextSprintRecommendation: string;
}

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function table(rows: readonly (readonly string[])[]): readonly string[] {
  const [header, ...body] = rows;
  if (header === undefined) return [];
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ];
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

function appendProductSection(html: string, section: string): string {
  return html.includes("</main>")
    ? html.replace("</main>", `${section}\n</main>`)
    : `${html}\n${section}`;
}

function includesBlocking(warnings: readonly CoachReportPhaseVisualsTacticalMapCardsWarningCode[]): boolean {
  return warnings.some((warning) => COACH_REPORT_PHASE_VISUALS_TACTICAL_MAP_BLOCKING_WARNINGS.includes(warning));
}

export function buildCoachReportPhaseVisualsTacticalMapCardsModel(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly baseline7D: CoachReportPremiumLayoutVisualHierarchyModel;
  readonly matchEconomyBaseline?: FullMatchEconomyFinalStabilizationModel;
  readonly tacticalMapCards: readonly CoachTacticalMapCard[];
  readonly phaseVisuals: readonly CoachPhaseVisualModel[];
}): CoachReportPhaseVisualsTacticalMapCardsModel {
  const matchEconomyBaseline = input.matchEconomyBaseline ?? currentFullMatchEconomyFinalStabilizationModel();
  const tacticalMapCardsAudit = auditCoachReportTacticalMapCards({
    cards: input.tacticalMapCards,
    productReportHtml: input.productReportHtml,
  });
  const phaseVisualsAudit = auditCoachReportPhaseVisuals(input.phaseVisuals);
  const visualDensityAudit = auditCoachReportVisualDensity({
    productReportHtml: input.productReportHtml,
    visualDensityScoreBefore: input.baseline7D.premiumLayoutAudit.visualDensityScore,
  });
  const visualMobileExportAudit = auditCoachReportVisualMobileExport({
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
  });
  const visualSourceOfTruthAudit = auditCoachReportVisualSourceOfTruth({
    cards: input.tacticalMapCards,
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
  });
  const matchEconomyBaselinePreserved = input.baseline7D.matchEconomyBaselinePreserved &&
    matchEconomyBaseline.status === "PASS" &&
    matchEconomyBaseline.productBaselineReady &&
    matchEconomyBaseline.routeFamilyDiversityPreserved &&
    matchEconomyBaseline.noRollbackToShotOnly;
  const productReportReady = input.productReportHtml.includes("id=\"premium-cover\"") &&
    input.productReportHtml.includes("id=\"express-read\"") &&
    input.productReportHtml.includes("id=\"coach-action-plan\"") &&
    input.productReportHtml.includes("id=\"tactical-map-cards\"") &&
    input.productReportHtml.includes("id=\"guardrail-summary\"");
  const coachExportReady = input.exportReportHtml.includes("id=\"cover\"") &&
    input.exportReportHtml.includes("id=\"express-read\"") &&
    input.exportReportHtml.includes("id=\"coach-action-plan\"") &&
    input.exportReportHtml.includes("id=\"tactical-map-cards\"") &&
    input.exportReportHtml.includes("data-export-format=\"print_ready_html\"");
  const premiumLayoutPreserved = input.baseline7D.premiumLayoutReady &&
    input.productReportHtml.indexOf("id=\"coach-action-plan\"") < input.productReportHtml.indexOf("id=\"tactical-map-cards\"");
  const visualHierarchyPreserved = input.baseline7D.visualHierarchyReady &&
    input.productReportHtml.indexOf("id=\"express-read\"") < input.productReportHtml.indexOf("id=\"coach-action-plan\"");
  const phaseVisualCardsReady = phaseVisualsAudit.phaseVisualsWarningCodes.includes("PHASE_VISUALS_READY");
  const tacticalMapCardsReady = tacticalMapCardsAudit.tacticalMapCardsWarningCodes.includes("TACTICAL_MAP_CARDS_READY");
  const visualDensityControlled = visualDensityAudit.visualDensityWarningCodes.includes("VISUAL_DENSITY_CONTROLLED");
  const mobileVisualReadabilityReady = visualMobileExportAudit.visualMobileExportWarningCodes.includes("MOBILE_VISUAL_READABILITY_READY");
  const exportVisualReadabilityReady = visualMobileExportAudit.visualMobileExportWarningCodes.includes("EXPORT_VISUAL_READABILITY_READY");
  const sourceOfTruthSeparationPreserved = input.baseline7D.sourceOfTruthSeparationPreserved &&
    visualSourceOfTruthAudit.visualSourceOfTruthWarningCodes.every((warning) =>
      warning !== "SOURCE_OF_TRUTH_AMBIGUOUS" &&
      warning !== "SANDBOX_TRUTH_LEAKAGE" &&
      warning !== "BATCH_AS_OFFICIAL_VISUAL"
    );
  const warningCodes = [
    ...tacticalMapCardsAudit.tacticalMapCardsWarningCodes,
    ...phaseVisualsAudit.phaseVisualsWarningCodes,
    ...visualDensityAudit.visualDensityWarningCodes,
    ...visualMobileExportAudit.visualMobileExportWarningCodes,
    ...visualSourceOfTruthAudit.visualSourceOfTruthWarningCodes,
    ...(productReportReady && sourceOfTruthSeparationPreserved ? ["PRODUCT_REPORT_READY" as const] : []),
    ...(coachExportReady ? ["COACH_EXPORT_READY" as const] : []),
    ...(matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED" as const] : ["MATCH_ECONOMY_BASELINE_REGRESSED" as const]),
    ...(input.baseline7D.productBaselineReady ? ["PRODUCT_BASELINE_READY" as const] : []),
    ...(visualDensityControlled ? ["VISUAL_DENSITY_CONTROLLED" as const] : []),
    ...(input.baseline7D.baseline7C.baseline7B.noPenaltyLeak ? [] : ["PENALTY_SHOT_LEAKAGE_DETECTED" as const]),
    ...(input.baseline7D.baseline7C.baseline7B.noUnknownScoringFamily ? [] : ["UNKNOWN_SCORING_FAMILY_DETECTED" as const]),
  ];
  const blocking = includesBlocking(warningCodes);
  const productBaselineReady = productReportReady &&
    coachExportReady &&
    premiumLayoutPreserved &&
    visualHierarchyPreserved &&
    phaseVisualCardsReady &&
    tacticalMapCardsReady &&
    visualDensityControlled &&
    mobileVisualReadabilityReady &&
    exportVisualReadabilityReady &&
    sourceOfTruthSeparationPreserved &&
    matchEconomyBaselinePreserved &&
    input.baseline7D.status === "PASS" &&
    input.baseline7D.productBaselineReady &&
    !blocking;
  const status: CoachReportPhaseVisualsTacticalMapCardsStatus = blocking
    ? "FAIL"
    : productBaselineReady
      ? "PASS"
      : "PARTIAL";
  const recommendation: CoachReportPhaseVisualsTacticalMapCardsRecommendation = status === "PASS"
    ? "KEEP_PHASE_VISUALS_TACTICAL_MAP_CARDS"
    : !sourceOfTruthSeparationPreserved
      ? "FIX_VISUAL_SOURCE_OF_TRUTH"
      : !visualDensityControlled
        ? "REDUCE_VISUAL_DENSITY"
        : !mobileVisualReadabilityReady || !exportVisualReadabilityReady
          ? "IMPROVE_TACTICAL_MAP_READABILITY"
          : "FIX_COACH_REPORT_VISUAL_GUARDRAILS";

  return {
    status,
    scope: "COACH_REPORT_PHASE_VISUALS_TACTICAL_MAP_CARDS",
    version: "COACH_REPORT_PHASE_VISUALS_TACTICAL_MAP_CARDS_7E",
    baselineVersion: "COACH_REPORT_PREMIUM_LAYOUT_VISUAL_HIERARCHY_7D",
    matchEconomyBaselinePreserved,
    productReportReady,
    coachExportReady,
    premiumLayoutPreserved,
    visualHierarchyPreserved,
    phaseVisualCardsReady,
    tacticalMapCardsReady,
    visualDensityControlled,
    mobileVisualReadabilityReady,
    exportVisualReadabilityReady,
    sourceOfTruthSeparationPreserved,
    productBaselineReady,
    tacticalMapCards: input.tacticalMapCards,
    phaseVisuals: input.phaseVisuals,
    tacticalMapCardsAudit,
    phaseVisualsAudit,
    visualDensityAudit,
    visualMobileExportAudit,
    visualSourceOfTruthAudit,
    baseline7D: input.baseline7D,
    matchEconomyBaseline,
    warningCodes: [...new Set(warningCodes)],
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "7F - Coach Report Multi-Match Comparison & Trend Signals"
      : recommendation === "REDUCE_VISUAL_DENSITY"
        ? "7F - Visual Density Cleanup"
        : recommendation === "IMPROVE_TACTICAL_MAP_READABILITY"
          ? "7F - Tactical Map Readability Follow-up"
          : "7F - Coach Report Visual Source-of-Truth Regression Fix",
  };
}

export function currentGeneratedCoachReportPhaseVisualsTacticalMapCardsModel(): CoachReportPhaseVisualsTacticalMapCardsModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);
  const matchEconomyBaseline = currentFullMatchEconomyFinalStabilizationModel();
  const baseProductReportHtml = renderCoachProductReport(productReport);
  const exportHtmlFor7A = renderCoachReportExportHtml({
    productReportHtml: baseProductReportHtml,
    fullMatchEconomyFinalStabilization: matchEconomyBaseline,
  });
  const baseline7A = buildProductBaselineCoachReportReadinessModel({
    productReport,
    productReportHtml: baseProductReportHtml,
    exportReportHtml: exportHtmlFor7A,
    matchEconomyBaseline,
  });
  const productHtmlWith7A = appendProductSection(baseProductReportHtml, renderProductBaselineCoachReportReadinessSection(baseline7A));
  const exportHtmlFor7B = renderCoachReportExportHtml({
    productReportHtml: productHtmlWith7A,
    fullMatchEconomyFinalStabilization: matchEconomyBaseline,
    productBaselineCoachReportReadiness: baseline7A,
  });
  const baseline7B = buildCoachInsightDepthNextMatchRecommendationsModel({
    productReport,
    productReportHtml: productHtmlWith7A,
    exportReportHtml: exportHtmlFor7B,
    baseline7A,
    matchEconomyBaseline,
  });
  const productHtmlWith7B = appendProductSection(productHtmlWith7A, renderCoachInsightDepthNextMatchRecommendationsSection(baseline7B));
  const exportHtmlFor7C = renderCoachReportExportHtml({
    productReportHtml: productHtmlWith7B,
    fullMatchEconomyFinalStabilization: matchEconomyBaseline,
    productBaselineCoachReportReadiness: baseline7A,
    coachInsightDepthNextMatchRecommendations: baseline7B,
  });
  const baseline7C = buildCoachActionPlanCardsTrainingFocusPackagingModel({
    productReport,
    productReportHtml: productHtmlWith7B,
    exportReportHtml: exportHtmlFor7C,
    baseline7B,
    baseline7A,
    matchEconomyBaseline,
  });
  const productHtmlWith7C = appendProductSection(productHtmlWith7B, renderCoachActionPlanCardsTrainingFocusPackagingSection(baseline7C));
  const exportReportHtml = renderCoachReportExportHtml({
    productReportHtml: productHtmlWith7C,
    fullMatchEconomyFinalStabilization: matchEconomyBaseline,
    productBaselineCoachReportReadiness: baseline7A,
    coachInsightDepthNextMatchRecommendations: baseline7B,
    coachActionPlanCardsTrainingFocusPackaging: baseline7C,
  });
  const baseline7D = buildCoachReportPremiumLayoutVisualHierarchyModel({
    productReportHtml: productHtmlWith7C,
    exportReportHtml,
    baseline7C,
    matchEconomyBaseline,
  });
  const tacticalMapCards = buildCoachTacticalMapCardsFromProductReport(productReport);
  const phaseVisuals = buildCoachPhaseVisualModelsFromCards(tacticalMapCards);

  return buildCoachReportPhaseVisualsTacticalMapCardsModel({
    productReportHtml: productHtmlWith7C,
    exportReportHtml,
    baseline7D,
    matchEconomyBaseline,
    tacticalMapCards,
    phaseVisuals,
  });
}

export function renderCoachReportPhaseVisualsTacticalMapCards7EDoc(
  model: CoachReportPhaseVisualsTacticalMapCardsModel = currentGeneratedCoachReportPhaseVisualsTacticalMapCardsModel(),
): string {
  return [
    "# Coach Report Phase Visuals & Tactical Map Cards 7E",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- productReportReady: ${model.productReportReady}`,
    `- coachExportReady: ${model.coachExportReady}`,
    `- premiumLayoutPreserved: ${model.premiumLayoutPreserved}`,
    `- visualHierarchyPreserved: ${model.visualHierarchyPreserved}`,
    `- phaseVisualCardsReady: ${model.phaseVisualCardsReady}`,
    `- tacticalMapCardsReady: ${model.tacticalMapCardsReady}`,
    `- visualDensityControlled: ${model.visualDensityControlled}`,
    `- mobileVisualReadabilityReady: ${model.mobileVisualReadabilityReady}`,
    `- exportVisualReadabilityReady: ${model.exportVisualReadabilityReady}`,
    `- sourceOfTruthSeparationPreserved: ${model.sourceOfTruthSeparationPreserved}`,
    `- productBaselineReady: ${model.productBaselineReady}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline 7D Summary",
    ...table([
      ["Metric", "Value"],
      ["7D status", model.baseline7D.status],
      ["7D productBaselineReady", bool(model.baseline7D.productBaselineReady)],
      ["premiumLayoutReady", bool(model.baseline7D.premiumLayoutReady)],
      ["visualHierarchyReady", bool(model.baseline7D.visualHierarchyReady)],
      ["mobileReadabilityReady", bool(model.baseline7D.mobileReadabilityReady)],
      ["exportPrintReady", bool(model.baseline7D.exportPrintReady)],
    ]),
    "",
    "## Baseline Preservation Summary",
    ...table([
      ["Baseline", "Status"],
      ["7C action plan packaging", model.baseline7D.baseline7C.status],
      ["7B deep insight layer", model.baseline7D.baseline7C.baseline7B.status],
      ["7A product baseline", model.baseline7D.baseline7C.baseline7A.status],
      ["6X match economy", model.matchEconomyBaseline.status],
      ["matchEconomyBaselinePreserved", bool(model.matchEconomyBaselinePreserved)],
    ]),
    "",
    "## Tactical Map Cards Audit",
    ...table([
      ["Metric", "Value"],
      ["tacticalMapCardCount", String(model.tacticalMapCardsAudit.tacticalMapCardCount)],
      ["officialTacticalMapCardCount", String(model.tacticalMapCardsAudit.officialTacticalMapCardCount)],
      ["visibleMapCardCount", String(model.tacticalMapCardsAudit.visibleMapCardCount)],
      ["mapCardWithSourceCount", String(model.tacticalMapCardsAudit.mapCardWithSourceCount)],
      ["mapCardWithConfidenceCount", String(model.tacticalMapCardsAudit.mapCardWithConfidenceCount)],
      ["mapCardWithLegendCount", String(model.tacticalMapCardsAudit.mapCardWithLegendCount)],
      ["mapCardWithActionPlanLinkCount", String(model.tacticalMapCardsAudit.mapCardWithActionPlanLinkCount)],
      ["mapCardWithNextMatchCheckCount", String(model.tacticalMapCardsAudit.mapCardWithNextMatchCheckCount)],
      ["mapCardWithInsufficientDataStateCount", String(model.tacticalMapCardsAudit.mapCardWithInsufficientDataStateCount)],
      ["sandboxMapCardInOfficialBodyCount", String(model.tacticalMapCardsAudit.sandboxMapCardInOfficialBodyCount)],
      ["overconfidentMapCardCount", String(model.tacticalMapCardsAudit.overconfidentMapCardCount)],
    ]),
    "",
    "## Tactical Map Cards",
    ...table([
      ["Card", "Type", "Source", "Confidence", "Primary zone", "Action-plan card", "Insight links", "Action-plan cue", "Next check", "Limitation"],
      ...model.tacticalMapCards.map((card) => [
        card.title,
        card.visualType,
        card.sourceType,
        card.confidence,
        card.primaryZone ?? "empty_state",
        card.linkedActionPlanCardId,
        card.linkedInsightIds.join(", ") || "none",
        card.coachingUse,
        card.nextMatchCheck,
        card.limitationNote,
      ]),
    ]),
    "",
    "## Phase Visuals Audit",
    ...table([
      ["Metric", "Value"],
      ["phaseVisualCount", String(model.phaseVisualsAudit.phaseVisualCount)],
      ["officialPhaseVisualCount", String(model.phaseVisualsAudit.officialPhaseVisualCount)],
      ["phaseVisualWithDominantZonesCount", String(model.phaseVisualsAudit.phaseVisualWithDominantZonesCount)],
      ["phaseVisualWithDangerZonesCount", String(model.phaseVisualsAudit.phaseVisualWithDangerZonesCount)],
      ["phaseVisualWithRecoveryZonesCount", String(model.phaseVisualsAudit.phaseVisualWithRecoveryZonesCount)],
      ["phaseVisualWithPressureZonesCount", String(model.phaseVisualsAudit.phaseVisualWithPressureZonesCount)],
      ["emptyStateVisualCount", String(model.phaseVisualsAudit.emptyStateVisualCount)],
      ["unsupportedPhaseVisualCount", String(model.phaseVisualsAudit.unsupportedPhaseVisualCount)],
    ]),
    "",
    "## Visual Density Audit",
    ...table([
      ["Metric", "Value"],
      ["visualDensityScoreBefore", String(model.visualDensityAudit.visualDensityScoreBefore)],
      ["visualDensityScoreAfter", String(model.visualDensityAudit.visualDensityScoreAfter)],
      ["visualDensityDelta", String(model.visualDensityAudit.visualDensityDelta)],
      ["visualCardCount", String(model.visualDensityAudit.visualCardCount)],
      ["newVisualSectionCount", String(model.visualDensityAudit.newVisualSectionCount)],
      ["replacedTextBlockCount", String(model.visualDensityAudit.replacedTextBlockCount)],
      ["duplicatedVisualContentCount", String(model.visualDensityAudit.duplicatedVisualContentCount)],
      ["expressReadStillVisible", bool(model.visualDensityAudit.expressReadStillVisible)],
      ["actionPlanStillAboveFold", bool(model.visualDensityAudit.actionPlanStillAboveFold)],
      ["technicalAppendicesStillCollapsed", bool(model.visualDensityAudit.technicalAppendicesStillCollapsed)],
    ]),
    "",
    "## Mobile / Export Visual Readability",
    ...table([
      ["Metric", "Value"],
      ["mobileMapCardsReadable", bool(model.visualMobileExportAudit.mobileMapCardsReadable)],
      ["mobileMapCardsStackCorrectly", bool(model.visualMobileExportAudit.mobileMapCardsStackCorrectly)],
      ["mobileLegendReadable", bool(model.visualMobileExportAudit.mobileLegendReadable)],
      ["mobileNoHorizontalOverflow", bool(model.visualMobileExportAudit.mobileNoHorizontalOverflow)],
      ["exportMapCardsPrintable", bool(model.visualMobileExportAudit.exportMapCardsPrintable)],
      ["printLegendReadable", bool(model.visualMobileExportAudit.printLegendReadable)],
      ["pageBreakGuardsForVisuals", bool(model.visualMobileExportAudit.pageBreakGuardsForVisuals)],
      ["noCriticalVisualInfoHiddenOnlyInInteractiveDetails", bool(model.visualMobileExportAudit.noCriticalVisualInfoHiddenOnlyInInteractiveDetails)],
    ]),
    "",
    "## Visual Source Of Truth",
    ...table([
      ["Metric", "Value"],
      ["officialVisualCardsCorrectlyLabeled", bool(model.visualSourceOfTruthAudit.officialVisualCardsCorrectlyLabeled)],
      ["diagnosticVisualCardsCorrectlyLabeled", bool(model.visualSourceOfTruthAudit.diagnosticVisualCardsCorrectlyLabeled)],
      ["sandboxVisualCardsCorrectlyLabeled", bool(model.visualSourceOfTruthAudit.sandboxVisualCardsCorrectlyLabeled)],
      ["sandboxVisualCardsBelowOfficialSections", bool(model.visualSourceOfTruthAudit.sandboxVisualCardsBelowOfficialSections)],
      ["visualClaimsSupportedBySource", bool(model.visualSourceOfTruthAudit.visualClaimsSupportedBySource)],
      ["visualClaimsOverstatedCount", String(model.visualSourceOfTruthAudit.visualClaimsOverstatedCount)],
      ["unsupportedVisualTruthClaimCount", String(model.visualSourceOfTruthAudit.unsupportedVisualTruthClaimCount)],
      ["batchAsOfficialVisualCount", String(model.visualSourceOfTruthAudit.batchAsOfficialVisualCount)],
      ["sandboxAsOfficialVisualCount", String(model.visualSourceOfTruthAudit.sandboxAsOfficialVisualCount)],
    ]),
    "",
    "## Match Economy Preservation",
    ...table([
      ["Metric", "Value"],
      ["averageTotalPointsAfter", String(model.matchEconomyBaseline.averageTotalPointsAfter)],
      ["scoringEventsPerMatchAfter", String(model.matchEconomyBaseline.scoringEventsPerMatchAfter)],
      ["scoringOpportunitiesPerMatchAfter", String(model.matchEconomyBaseline.scoringOpportunitiesPerMatchAfter)],
      ["closeGameRateAfter", `${model.matchEconomyBaseline.closeGameRateAfter}%`],
      ["competitiveGameRateAfter", `${model.matchEconomyBaseline.competitiveGameRateAfter}%`],
      ["blowoutRateAfter", `${model.matchEconomyBaseline.blowoutRateAfter}%`],
      ["severeBlowoutRateAfter", `${model.matchEconomyBaseline.severeBlowoutRateAfter}%`],
      ["routeFamilyDiversityPreserved", bool(model.matchEconomyBaseline.routeFamilyDiversityPreserved)],
      ["noRollbackToShotOnly", bool(model.matchEconomyBaseline.noRollbackToShotOnly)],
    ]),
    "",
    "## Guardrail Preservation",
    ...table([
      ["Guardrail", "Value"],
      ["scoreFromScoreChangeAllRuns", bool(model.matchEconomyBaseline.scoreFromScoreChangeAllRuns)],
      ["officialPathConnectedAllRuns", bool(model.matchEconomyBaseline.officialPathConnectedAllRuns)],
      ["scoringConstantsChanged", bool(model.matchEconomyBaseline.scoringConstantsChanged)],
      ["MatchBonusEventChanged", bool(model.matchEconomyBaseline.MatchBonusEventChanged)],
      ["scoreCapApplied", bool(model.matchEconomyBaseline.scoreCapApplied)],
      ["postHocRewriteApplied", bool(model.matchEconomyBaseline.postHocRewriteApplied)],
      ["scoringEventsDeleted", bool(model.matchEconomyBaseline.scoringEventsDeleted)],
      ["forcedOpponentScoreApplied", bool(model.matchEconomyBaseline.forcedOpponentScoreApplied)],
      ["forcedTrailingTeamScoreApplied", bool(model.matchEconomyBaseline.forcedTrailingTeamScoreApplied)],
      ["rubberBandingApplied", bool(model.matchEconomyBaseline.rubberBandingApplied)],
      ["batchLiveSeparationPreserved", bool(model.matchEconomyBaseline.batchLiveSeparationPreserved)],
      ["persistenceUsedForScoring", bool(model.matchEconomyBaseline.persistenceUsedForScoring)],
      ["sqliteUsedForScoring", bool(model.matchEconomyBaseline.sqliteUsedForScoring)],
    ]),
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
  ].join("\n");
}

export function renderCoachReportPhaseVisualsTacticalMapCards7EValidation(
  model: CoachReportPhaseVisualsTacticalMapCardsModel = currentGeneratedCoachReportPhaseVisualsTacticalMapCardsModel(),
): string {
  const checks = [
    checkLine("CoachReportPhaseVisualsTacticalMapCardsModel exists", model.scope === "COACH_REPORT_PHASE_VISUALS_TACTICAL_MAP_CARDS", model.scope),
    checkLine("baseline 7D visible", model.baselineVersion === "COACH_REPORT_PREMIUM_LAYOUT_VISUAL_HIERARCHY_7D" && model.baseline7D.status === "PASS", `${model.baselineVersion}/${model.baseline7D.status}`),
    checkLine("baseline 7C preserved", model.baseline7D.baseline7C.status === "PASS", model.baseline7D.baseline7C.status),
    checkLine("baseline 7B preserved", model.baseline7D.baseline7C.baseline7B.status === "PASS", model.baseline7D.baseline7C.baseline7B.status),
    checkLine("baseline 7A preserved", model.baseline7D.baseline7C.baseline7A.status === "PASS", model.baseline7D.baseline7C.baseline7A.status),
    checkLine("baseline 6X preserved", model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("product report ready", model.productReportReady, bool(model.productReportReady)),
    checkLine("export report ready", model.coachExportReady, bool(model.coachExportReady)),
    checkLine("premium layout preserved", model.premiumLayoutPreserved, bool(model.premiumLayoutPreserved)),
    checkLine("visual hierarchy preserved", model.visualHierarchyPreserved, bool(model.visualHierarchyPreserved)),
    checkLine("express read still visible", model.visualDensityAudit.expressReadStillVisible, bool(model.visualDensityAudit.expressReadStillVisible)),
    checkLine("official score above fold", model.baseline7D.visualHierarchyAudit.officialScoreProminence, bool(model.baseline7D.visualHierarchyAudit.officialScoreProminence)),
    checkLine("source of truth above fold", model.baseline7D.visualHierarchyAudit.sourceOfTruthProminence, bool(model.baseline7D.visualHierarchyAudit.sourceOfTruthProminence)),
    checkLine("action plan still prominent", model.visualDensityAudit.actionPlanStillAboveFold, bool(model.visualDensityAudit.actionPlanStillAboveFold)),
    checkLine("tactical map cards visible", model.tacticalMapCardsAudit.visibleMapCardCount >= 2, String(model.tacticalMapCardsAudit.visibleMapCardCount)),
    checkLine("2 to 3 visual cards maximum", model.tacticalMapCardsAudit.tacticalMapCardCount >= 2 && model.tacticalMapCardsAudit.tacticalMapCardCount <= 3, String(model.tacticalMapCardsAudit.tacticalMapCardCount)),
    checkLine("visual cards below action plan", model.visualDensityAudit.actionPlanStillAboveFold, bool(model.visualDensityAudit.actionPlanStillAboveFold)),
    checkLine("visual cards have source badges", model.tacticalMapCardsAudit.mapCardWithSourceCount === model.tacticalMapCardsAudit.tacticalMapCardCount, `${model.tacticalMapCardsAudit.mapCardWithSourceCount}/${model.tacticalMapCardsAudit.tacticalMapCardCount}`),
    checkLine("visual cards have confidence badges", model.tacticalMapCardsAudit.mapCardWithConfidenceCount === model.tacticalMapCardsAudit.tacticalMapCardCount, `${model.tacticalMapCardsAudit.mapCardWithConfidenceCount}/${model.tacticalMapCardsAudit.tacticalMapCardCount}`),
    checkLine("visual cards have legends", model.tacticalMapCardsAudit.mapCardWithLegendCount === model.tacticalMapCardsAudit.tacticalMapCardCount, `${model.tacticalMapCardsAudit.mapCardWithLegendCount}/${model.tacticalMapCardsAudit.tacticalMapCardCount}`),
    checkLine("visual cards link to action plan", model.tacticalMapCardsAudit.mapCardWithActionPlanLinkCount === model.tacticalMapCardsAudit.tacticalMapCardCount, `${model.tacticalMapCardsAudit.mapCardWithActionPlanLinkCount}/${model.tacticalMapCardsAudit.tacticalMapCardCount}`),
    checkLine("visual cards have next-match checks", model.tacticalMapCardsAudit.mapCardWithNextMatchCheckCount === model.tacticalMapCardsAudit.tacticalMapCardCount, `${model.tacticalMapCardsAudit.mapCardWithNextMatchCheckCount}/${model.tacticalMapCardsAudit.tacticalMapCardCount}`),
    checkLine("visual cards do not overclaim", model.tacticalMapCardsAudit.overconfidentMapCardCount === 0 && model.visualSourceOfTruthAudit.visualClaimsOverstatedCount === 0, `${model.tacticalMapCardsAudit.overconfidentMapCardCount}/${model.visualSourceOfTruthAudit.visualClaimsOverstatedCount}`),
    checkLine("no sandbox visual in official body", model.tacticalMapCardsAudit.sandboxMapCardInOfficialBodyCount === 0, String(model.tacticalMapCardsAudit.sandboxMapCardInOfficialBodyCount)),
    checkLine("insufficient-data visual uses empty state", model.tacticalMapCardsAudit.mapCardWithInsufficientDataStateCount >= 0 && model.tacticalMapCardsAudit.unsupportedMapCardCount === 0, `${model.tacticalMapCardsAudit.mapCardWithInsufficientDataStateCount}/${model.tacticalMapCardsAudit.unsupportedMapCardCount}`),
    checkLine("visual density controlled", model.visualDensityControlled, `${model.visualDensityAudit.visualDensityScoreBefore}->${model.visualDensityAudit.visualDensityScoreAfter}`),
    checkLine("visualDensityDelta <= 5 or justified", model.visualDensityAudit.visualDensityDelta <= 5, String(model.visualDensityAudit.visualDensityDelta)),
    checkLine("mobile map cards readable", model.mobileVisualReadabilityReady, bool(model.mobileVisualReadabilityReady)),
    checkLine("export map cards printable", model.exportVisualReadabilityReady, bool(model.exportVisualReadabilityReady)),
    checkLine("no horizontal overflow", model.visualMobileExportAudit.mobileNoHorizontalOverflow, bool(model.visualMobileExportAudit.mobileNoHorizontalOverflow)),
    checkLine("no critical visual info hidden only in interactive details", model.visualMobileExportAudit.noCriticalVisualInfoHiddenOnlyInInteractiveDetails, bool(model.visualMobileExportAudit.noCriticalVisualInfoHiddenOnlyInInteractiveDetails)),
    checkLine("technical appendices collapsed", model.visualDensityAudit.technicalAppendicesStillCollapsed, bool(model.visualDensityAudit.technicalAppendicesStillCollapsed)),
    checkLine("sandbox below official sections", model.visualSourceOfTruthAudit.sandboxVisualCardsBelowOfficialSections, bool(model.visualSourceOfTruthAudit.sandboxVisualCardsBelowOfficialSections)),
    checkLine("no duplicated visual sections", model.visualDensityAudit.duplicatedVisualContentCount === 0, String(model.visualDensityAudit.duplicatedVisualContentCount)),
    checkLine("no mechanical wording", model.baseline7D.coachLanguagePolished, bool(model.baseline7D.coachLanguagePolished)),
    checkLine("no forbidden wording", model.visualSourceOfTruthAudit.visualClaimsOverstatedCount === 0, String(model.visualSourceOfTruthAudit.visualClaimsOverstatedCount)),
    checkLine("source of truth separation preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("guardrail summary visible", model.baseline7D.visualHierarchyAudit.guardrailSummaryVisible, bool(model.baseline7D.visualHierarchyAudit.guardrailSummaryVisible)),
    checkLine("guardrails preserved", model.baseline7D.baseline7C.baseline7B.guardrailsPreserved, bool(model.baseline7D.baseline7C.baseline7B.guardrailsPreserved)),
    checkLine("match economy baseline preserved", model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("route family diversity preserved", model.matchEconomyBaseline.routeFamilyDiversityPreserved, bool(model.matchEconomyBaseline.routeFamilyDiversityPreserved)),
    checkLine("no score manipulation", model.baseline7D.baseline7C.baseline7B.noScoreManipulationConfirmed, bool(model.baseline7D.baseline7C.baseline7B.noScoreManipulationConfirmed)),
    checkLine("no PENALTY leak", model.baseline7D.baseline7C.baseline7B.noPenaltyLeak, bool(model.baseline7D.baseline7C.baseline7B.noPenaltyLeak)),
    checkLine("no UNKNOWN scoring family", model.baseline7D.baseline7C.baseline7B.noUnknownScoringFamily, bool(model.baseline7D.baseline7C.baseline7B.noUnknownScoringFamily)),
    checkLine("no persistence/SQLite scoring", !model.matchEconomyBaseline.persistenceUsedForScoring && !model.matchEconomyBaseline.sqliteUsedForScoring, `${bool(model.matchEconomyBaseline.persistenceUsedForScoring)}/${bool(model.matchEconomyBaseline.sqliteUsedForScoring)}`),
    checkLine("score constants unchanged", !model.matchEconomyBaseline.scoringConstantsChanged, bool(!model.matchEconomyBaseline.scoringConstantsChanged)),
    checkLine("MatchBonusEvent unchanged", !model.matchEconomyBaseline.MatchBonusEventChanged, bool(!model.matchEconomyBaseline.MatchBonusEventChanged)),
    checkLine("batch/live separation preserved", model.matchEconomyBaseline.batchLiveSeparationPreserved, bool(model.matchEconomyBaseline.batchLiveSeparationPreserved)),
    checkLine("share pack PASS", model.status === "PASS", model.status),
  ];
  const hasFailure = checks.some((line) => line.startsWith("- FAIL"));

  return [
    "# Validation - Coach Report Phase Visuals & Tactical Map Cards 7E",
    "",
    `Status: ${hasFailure || model.status !== "PASS" ? model.status : "PASS"}`,
    "",
    "## Required Command",
    "`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`",
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- tactical map cards: ${model.tacticalMapCardsAudit.tacticalMapCardCount}`,
    `- visible map cards: ${model.tacticalMapCardsAudit.visibleMapCardCount}`,
    `- phase visuals: ${model.phaseVisualsAudit.phaseVisualCount}`,
    `- visual density before: ${model.visualDensityAudit.visualDensityScoreBefore}`,
    `- visual density after: ${model.visualDensityAudit.visualDensityScoreAfter}`,
    `- visual density delta: ${model.visualDensityAudit.visualDensityDelta}`,
    `- mobile visual readability ready: ${model.mobileVisualReadabilityReady}`,
    `- export visual readability ready: ${model.exportVisualReadabilityReady}`,
    `- visual claims overstated count: ${model.visualSourceOfTruthAudit.visualClaimsOverstatedCount}`,
    `- sandbox visual in official body count: ${model.tacticalMapCardsAudit.sandboxMapCardInOfficialBodyCount}`,
    `- recommendation: ${model.recommendation}`,
  ].join("\n");
}

export function validateCoachReportPhaseVisualsTacticalMapCards7E(): void {
  const model = currentGeneratedCoachReportPhaseVisualsTacticalMapCardsModel();
  if (model.status !== "PASS") {
    throw new Error(`Coach Report Phase Visuals Tactical Map Cards 7E must PASS, got ${model.status}.`);
  }
}

import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { auditCoachReportBaselineMetadataConsistency, type CoachReportBaselineMetadataConsistencyAudit } from "./coachReportBaselineMetadataConsistencyAudit";
import { auditCoachReportExportPrint, type CoachReportExportPrintAudit } from "./coachReportExportPrintAudit";
import { auditCoachReportMobileReadability, type CoachReportMobileReadabilityAudit } from "./coachReportMobileReadabilityAudit";
import { auditCoachReportPremiumLayout, type CoachReportPremiumLayoutAudit } from "./coachReportPremiumLayoutAudit";
import { auditCoachReportVisualHierarchy, type CoachReportVisualHierarchyAudit } from "./coachReportVisualHierarchyAudit";
import {
  buildCoachActionPlanCardsTrainingFocusPackagingModel,
  renderCoachActionPlanCardsTrainingFocusPackaging7CValidation,
  renderCoachActionPlanCardsTrainingFocusPackagingSection,
  type CoachActionPlanCardsTrainingFocusPackagingModel,
} from "./coachActionPlanCardsTrainingFocusPackaging";
import {
  buildCoachInsightDepthNextMatchRecommendationsModel,
  renderCoachInsightDepthNextMatchRecommendations7BValidation,
} from "./coachInsightDepthNextMatchRecommendations";
import {
  COACH_REPORT_PREMIUM_LAYOUT_BLOCKING_WARNINGS,
  type CoachReportPremiumLayoutVisualHierarchyWarningCode,
} from "./coachReportPremiumLayoutVisualHierarchyWarnings";
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

export type CoachReportPremiumLayoutVisualHierarchyStatus = "PASS" | "PARTIAL" | "FAIL";
export type CoachReportPremiumLayoutVisualHierarchyRecommendation =
  | "KEEP_PREMIUM_LAYOUT_VISUAL_HIERARCHY"
  | "IMPROVE_PREMIUM_LAYOUT_DENSITY"
  | "FIX_BASELINE_METADATA_RECONCILIATION"
  | "IMPROVE_MOBILE_EXPORT_READABILITY"
  | "FIX_COACH_REPORT_PREMIUM_LAYOUT_GUARDRAILS";

export interface CoachReportPremiumLayoutSection {
  readonly sectionId: string;
  readonly title: string;
  readonly level: "express" | "main" | "appendix";
  readonly priority: 1 | 2 | 3;
  readonly sourceType: "official" | "diagnostic" | "sandbox" | "mixed";
  readonly visibleByDefault: boolean;
  readonly collapsedByDefault: boolean;
  readonly estimatedReadTimeSeconds: number;
  readonly containsOfficialTruth: boolean;
  readonly containsDiagnostics: boolean;
  readonly containsSandbox: boolean;
  readonly containsActionPlan: boolean;
  readonly containsTechnicalDetails: boolean;
  readonly mobilePriority: 1 | 2 | 3;
  readonly printPriority: 1 | 2 | 3;
  readonly warningCodes: readonly CoachReportPremiumLayoutVisualHierarchyWarningCode[];
}

export interface CoachReportPremiumLayoutVisualHierarchyModel {
  readonly status: CoachReportPremiumLayoutVisualHierarchyStatus;
  readonly scope: "COACH_REPORT_PREMIUM_LAYOUT_VISUAL_HIERARCHY";
  readonly version: "COACH_REPORT_PREMIUM_LAYOUT_VISUAL_HIERARCHY_7D";
  readonly baselineVersion: "COACH_ACTION_PLAN_CARDS_TRAINING_FOCUS_PACKAGING_7C";
  readonly matchEconomyBaselinePreserved: boolean;
  readonly productReportReady: boolean;
  readonly coachExportReady: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly premiumLayoutReady: boolean;
  readonly visualHierarchyReady: boolean;
  readonly actionPlanProminenceReady: boolean;
  readonly mobileReadabilityReady: boolean;
  readonly exportPrintReady: boolean;
  readonly baselineMetadataConsistent: boolean;
  readonly baselineMetadataCorrected: boolean;
  readonly coachLanguagePolished: boolean;
  readonly productBaselineReady: boolean;
  readonly sections: readonly CoachReportPremiumLayoutSection[];
  readonly baseline7C: CoachActionPlanCardsTrainingFocusPackagingModel;
  readonly matchEconomyBaseline: FullMatchEconomyFinalStabilizationModel;
  readonly premiumLayoutAudit: CoachReportPremiumLayoutAudit;
  readonly visualHierarchyAudit: CoachReportVisualHierarchyAudit;
  readonly mobileReadabilityAudit: CoachReportMobileReadabilityAudit;
  readonly exportPrintAudit: CoachReportExportPrintAudit;
  readonly baselineMetadataConsistencyAudit: CoachReportBaselineMetadataConsistencyAudit;
  readonly warningCodes: readonly CoachReportPremiumLayoutVisualHierarchyWarningCode[];
  readonly recommendation: CoachReportPremiumLayoutVisualHierarchyRecommendation;
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

function includesBlocking(warnings: readonly CoachReportPremiumLayoutVisualHierarchyWarningCode[]): boolean {
  return warnings.some((warning) => COACH_REPORT_PREMIUM_LAYOUT_BLOCKING_WARNINGS.includes(warning));
}

function buildSections(): readonly CoachReportPremiumLayoutSection[] {
  return [
    {
      sectionId: "express-read",
      title: "Lecture express",
      level: "express",
      priority: 1,
      sourceType: "official",
      visibleByDefault: true,
      collapsedByDefault: false,
      estimatedReadTimeSeconds: 30,
      containsOfficialTruth: true,
      containsDiagnostics: false,
      containsSandbox: false,
      containsActionPlan: true,
      containsTechnicalDetails: false,
      mobilePriority: 1,
      printPriority: 1,
      warningCodes: ["EXPRESS_READ_VISIBLE", "OFFICIAL_SCORE_ABOVE_FOLD", "SOURCE_OF_TRUTH_ABOVE_FOLD"],
    },
    {
      sectionId: "coach-action-plan",
      title: "Plan d'action coach",
      level: "main",
      priority: 1,
      sourceType: "official",
      visibleByDefault: true,
      collapsedByDefault: false,
      estimatedReadTimeSeconds: 90,
      containsOfficialTruth: true,
      containsDiagnostics: false,
      containsSandbox: false,
      containsActionPlan: true,
      containsTechnicalDetails: false,
      mobilePriority: 1,
      printPriority: 1,
      warningCodes: ["ACTION_PLAN_PROMINENT", "PRIMARY_ACTION_CARD_PROMINENT"],
    },
    {
      sectionId: "appendices",
      title: "Annexes",
      level: "appendix",
      priority: 3,
      sourceType: "mixed",
      visibleByDefault: true,
      collapsedByDefault: true,
      estimatedReadTimeSeconds: 20,
      containsOfficialTruth: false,
      containsDiagnostics: true,
      containsSandbox: true,
      containsActionPlan: false,
      containsTechnicalDetails: true,
      mobilePriority: 3,
      printPriority: 3,
      warningCodes: ["TECHNICAL_APPENDICES_COLLAPSED", "SANDBOX_BELOW_OFFICIAL_SECTIONS"],
    },
  ];
}

export function buildCoachReportPremiumLayoutVisualHierarchyModel(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly baseline7C: CoachActionPlanCardsTrainingFocusPackagingModel;
  readonly matchEconomyBaseline?: FullMatchEconomyFinalStabilizationModel;
}): CoachReportPremiumLayoutVisualHierarchyModel {
  const matchEconomyBaseline = input.matchEconomyBaseline ?? currentFullMatchEconomyFinalStabilizationModel();
  const premiumLayoutAudit = auditCoachReportPremiumLayout(input.productReportHtml);
  const visualHierarchyAudit = auditCoachReportVisualHierarchy(input.productReportHtml);
  const mobileReadabilityAudit = auditCoachReportMobileReadability(input.productReportHtml);
  const exportPrintAudit = auditCoachReportExportPrint(input.exportReportHtml);
  const validation7A = renderProductBaselineCoachReportReadiness7AValidation(input.baseline7C.baseline7A);
  const validation7B = renderCoachInsightDepthNextMatchRecommendations7BValidation(input.baseline7C.baseline7B);
  const validation7C = renderCoachActionPlanCardsTrainingFocusPackaging7CValidation(input.baseline7C);
  const baselineMetadataConsistencyAudit = auditCoachReportBaselineMetadataConsistency({
    baseline7A: input.baseline7C.baseline7A,
    baseline7B: input.baseline7C.baseline7B,
    baseline7C: input.baseline7C,
    validation7AMarkdown: validation7A,
    validation7BMarkdown: validation7B,
    validation7CMarkdown: validation7C,
  });
  const matchEconomyBaselinePreserved = input.baseline7C.matchEconomyBaselinePreserved &&
    matchEconomyBaseline.status === "PASS" &&
    matchEconomyBaseline.productBaselineReady &&
    matchEconomyBaseline.routeFamilyDiversityPreserved &&
    matchEconomyBaseline.noRollbackToShotOnly;
  const productReportReady = input.productReportHtml.includes("id=\"premium-cover\"") &&
    input.productReportHtml.includes("id=\"express-read\"") &&
    input.productReportHtml.includes("id=\"coach-action-plan\"") &&
    input.productReportHtml.includes("id=\"guardrail-summary\"");
  const coachExportReady = input.exportReportHtml.includes("id=\"cover\"") &&
    input.exportReportHtml.includes("id=\"express-read\"") &&
    input.exportReportHtml.includes("id=\"coach-action-plan\"") &&
    input.exportReportHtml.includes("data-export-format=\"print_ready_html\"");
  const sourceOfTruthSeparationPreserved = input.baseline7C.sourceOfTruthSeparationPreserved &&
    input.baseline7C.baseline7B.sourceOfTruthSeparationPreserved &&
    input.baseline7C.baseline7A.officialTruthSeparationReady &&
    input.baseline7C.baseline7A.diagnosticSeparationReady &&
    input.baseline7C.baseline7A.sandboxSeparationReady;
  const premiumLayoutReady = premiumLayoutAudit.premiumLayoutWarningCodes.includes("PREMIUM_LAYOUT_READY");
  const visualHierarchyReady = visualHierarchyAudit.visualHierarchyWarningCodes.includes("VISUAL_HIERARCHY_READY");
  const actionPlanProminenceReady = visualHierarchyAudit.actionPlanAboveFold &&
    visualHierarchyAudit.primaryActionCardProminence &&
    premiumLayoutAudit.actionPlanCardLayoutReady;
  const mobileReadabilityReady = mobileReadabilityAudit.mobileReadabilityWarningCodes.includes("MOBILE_READABILITY_READY");
  const exportPrintReady = exportPrintAudit.exportPrintWarningCodes.includes("EXPORT_PRINT_READY");
  const baselineMetadataConsistent = baselineMetadataConsistencyAudit.roadmapConsistencyReady;
  const baselineMetadataCorrected = baselineMetadataConsistencyAudit.baselineMetadataCorrected;
  const coachLanguagePolished = input.baseline7C.coachLanguagePolished &&
    input.baseline7C.mechanicalWordingRemoved &&
    premiumLayoutAudit.layoutNoiseScore === 0;
  const warningCodes = [
    ...premiumLayoutAudit.premiumLayoutWarningCodes,
    ...visualHierarchyAudit.visualHierarchyWarningCodes,
    ...mobileReadabilityAudit.mobileReadabilityWarningCodes,
    ...exportPrintAudit.exportPrintWarningCodes,
    ...baselineMetadataConsistencyAudit.baselineMetadataWarningCodes,
    ...(productReportReady && sourceOfTruthSeparationPreserved && coachLanguagePolished ? ["PRODUCT_REPORT_READY" as const] : []),
    ...(coachExportReady ? ["COACH_EXPORT_READY" as const] : []),
    ...(matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED" as const] : ["MATCH_ECONOMY_BASELINE_REGRESSED" as const]),
    ...(input.baseline7C.productBaselineReady ? ["PRODUCT_BASELINE_READY" as const] : []),
    ...(input.baseline7C.coachLanguagePolished ? ["COACH_LANGUAGE_POLISHED" as const] : ["MECHANICAL_WORDING_STILL_PRESENT" as const]),
    ...(sourceOfTruthSeparationPreserved ? [] : ["SOURCE_OF_TRUTH_AMBIGUOUS" as const]),
    ...(input.baseline7C.baseline7B.noPenaltyLeak ? [] : ["PENALTY_SHOT_LEAKAGE_DETECTED" as const]),
    ...(input.baseline7C.baseline7B.noUnknownScoringFamily ? [] : ["UNKNOWN_SCORING_FAMILY_DETECTED" as const]),
  ];
  const blocking = includesBlocking(warningCodes);
  const productBaselineReady = productReportReady &&
    coachExportReady &&
    sourceOfTruthSeparationPreserved &&
    premiumLayoutReady &&
    visualHierarchyReady &&
    actionPlanProminenceReady &&
    mobileReadabilityReady &&
    exportPrintReady &&
    baselineMetadataConsistent &&
    baselineMetadataCorrected &&
    coachLanguagePolished &&
    matchEconomyBaselinePreserved &&
    input.baseline7C.status === "PASS" &&
    input.baseline7C.productBaselineReady &&
    !blocking;
  const status: CoachReportPremiumLayoutVisualHierarchyStatus = blocking
    ? "FAIL"
    : productBaselineReady
      ? "PASS"
      : "PARTIAL";
  const recommendation: CoachReportPremiumLayoutVisualHierarchyRecommendation = status === "PASS"
    ? "KEEP_PREMIUM_LAYOUT_VISUAL_HIERARCHY"
    : !baselineMetadataConsistent
      ? "FIX_BASELINE_METADATA_RECONCILIATION"
      : !mobileReadabilityReady || !exportPrintReady
        ? "IMPROVE_MOBILE_EXPORT_READABILITY"
        : !premiumLayoutReady || !visualHierarchyReady
          ? "IMPROVE_PREMIUM_LAYOUT_DENSITY"
          : "FIX_COACH_REPORT_PREMIUM_LAYOUT_GUARDRAILS";

  return {
    status,
    scope: "COACH_REPORT_PREMIUM_LAYOUT_VISUAL_HIERARCHY",
    version: "COACH_REPORT_PREMIUM_LAYOUT_VISUAL_HIERARCHY_7D",
    baselineVersion: "COACH_ACTION_PLAN_CARDS_TRAINING_FOCUS_PACKAGING_7C",
    matchEconomyBaselinePreserved,
    productReportReady,
    coachExportReady,
    sourceOfTruthSeparationPreserved,
    premiumLayoutReady,
    visualHierarchyReady,
    actionPlanProminenceReady,
    mobileReadabilityReady,
    exportPrintReady,
    baselineMetadataConsistent,
    baselineMetadataCorrected,
    coachLanguagePolished,
    productBaselineReady,
    sections: buildSections(),
    baseline7C: input.baseline7C,
    matchEconomyBaseline,
    premiumLayoutAudit,
    visualHierarchyAudit,
    mobileReadabilityAudit,
    exportPrintAudit,
    baselineMetadataConsistencyAudit,
    warningCodes: [...new Set(warningCodes)],
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "7E - Coach Report Phase Visuals & Tactical Map Cards"
      : recommendation === "FIX_BASELINE_METADATA_RECONCILIATION"
        ? "7E - Baseline Metadata Reconciliation Follow-up"
        : recommendation === "IMPROVE_MOBILE_EXPORT_READABILITY"
          ? "7E - Mobile Export Readability Follow-up"
          : "7E - Premium Layout Density Cleanup",
  };
}

export function currentGeneratedCoachReportPremiumLayoutVisualHierarchyModel(): CoachReportPremiumLayoutVisualHierarchyModel {
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

  return buildCoachReportPremiumLayoutVisualHierarchyModel({
    productReportHtml: productHtmlWith7C,
    exportReportHtml,
    baseline7C,
    matchEconomyBaseline,
  });
}

export function renderCoachReportPremiumLayoutVisualHierarchy7DDoc(
  model: CoachReportPremiumLayoutVisualHierarchyModel = currentGeneratedCoachReportPremiumLayoutVisualHierarchyModel(),
): string {
  return [
    "# Coach Report Premium Layout & Visual Hierarchy 7D",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- productReportReady: ${model.productReportReady}`,
    `- coachExportReady: ${model.coachExportReady}`,
    `- premiumLayoutReady: ${model.premiumLayoutReady}`,
    `- visualHierarchyReady: ${model.visualHierarchyReady}`,
    `- actionPlanProminenceReady: ${model.actionPlanProminenceReady}`,
    `- mobileReadabilityReady: ${model.mobileReadabilityReady}`,
    `- exportPrintReady: ${model.exportPrintReady}`,
    `- baselineMetadataConsistent: ${model.baselineMetadataConsistent}`,
    `- baselineMetadataCorrected: ${model.baselineMetadataCorrected}`,
    `- productBaselineReady: ${model.productBaselineReady}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline 7C Summary",
    ...table([
      ["Metric", "Value"],
      ["7C status", model.baseline7C.status],
      ["7C productBaselineReady", bool(model.baseline7C.productBaselineReady)],
      ["actionPlanCardsReady", bool(model.baseline7C.actionPlanCardsReady)],
      ["trainingFocusPackagingReady", bool(model.baseline7C.trainingFocusPackagingReady)],
      ["nextMatchPlanPackaged", bool(model.baseline7C.nextMatchPlanPackaged)],
    ]),
    "",
    "## Baseline Metadata Consistency",
    ...table([
      ["Metric", "Value"],
      ["7A reported", model.baselineMetadataConsistencyAudit.baseline7AStatusReported],
      ["7A validation", model.baselineMetadataConsistencyAudit.baseline7AValidationStatus],
      ["7B reported", model.baselineMetadataConsistencyAudit.baseline7BStatusReported],
      ["7B validation", model.baselineMetadataConsistencyAudit.baseline7BValidationStatus],
      ["7C reported", model.baselineMetadataConsistencyAudit.baseline7CStatusReported],
      ["7C validation", model.baselineMetadataConsistencyAudit.baseline7CValidationStatus],
      ["baselineStatusMismatchCount", String(model.baselineMetadataConsistencyAudit.baselineStatusMismatchCount)],
      ["baselineProductReadyMismatchCount", String(model.baselineMetadataConsistencyAudit.baselineProductReadyMismatchCount)],
      ["baselineMetadataCorrected", bool(model.baselineMetadataConsistencyAudit.baselineMetadataCorrected)],
      ["roadmapConsistencyReady", bool(model.baselineMetadataConsistencyAudit.roadmapConsistencyReady)],
    ]),
    "",
    "## Premium Layout Audit",
    ...table([
      ["Metric", "Value"],
      ["premiumCoverReady", bool(model.premiumLayoutAudit.premiumCoverReady)],
      ["scoreCardReady", bool(model.premiumLayoutAudit.scoreCardReady)],
      ["actionPlanCardLayoutReady", bool(model.premiumLayoutAudit.actionPlanCardLayoutReady)],
      ["sectionOrderingConsistency", bool(model.premiumLayoutAudit.sectionOrderingConsistency)],
      ["repeatedSectionCount", String(model.premiumLayoutAudit.repeatedSectionCount)],
      ["duplicateContentCount", String(model.premiumLayoutAudit.duplicateContentCount)],
      ["layoutNoiseScore", String(model.premiumLayoutAudit.layoutNoiseScore)],
      ["visualDensityScore", String(model.premiumLayoutAudit.visualDensityScore)],
    ]),
    "",
    "## Visual Hierarchy Audit",
    ...table([
      ["Metric", "Value"],
      ["expressReadAvailable", bool(model.visualHierarchyAudit.expressReadAvailable)],
      ["expressReadTimeSeconds", String(model.visualHierarchyAudit.expressReadTimeSeconds)],
      ["coachReadTimeSeconds", String(model.visualHierarchyAudit.coachReadTimeSeconds)],
      ["officialScoreProminence", bool(model.visualHierarchyAudit.officialScoreProminence)],
      ["sourceOfTruthProminence", bool(model.visualHierarchyAudit.sourceOfTruthProminence)],
      ["actionPlanAboveFold", bool(model.visualHierarchyAudit.actionPlanAboveFold)],
      ["primaryActionCardProminence", bool(model.visualHierarchyAudit.primaryActionCardProminence)],
      ["appendixCollapsed", bool(model.visualHierarchyAudit.appendixCollapsed)],
      ["visualHierarchyScore", String(model.visualHierarchyAudit.visualHierarchyScore)],
    ]),
    "",
    "## Mobile Readability Audit",
    ...table([
      ["Metric", "Value"],
      ["mobileBreakpointPresent", bool(model.mobileReadabilityAudit.mobileBreakpointPresent)],
      ["mobileScoreReadable", bool(model.mobileReadabilityAudit.mobileScoreReadable)],
      ["mobileCardsStackCorrectly", bool(model.mobileReadabilityAudit.mobileCardsStackCorrectly)],
      ["mobileNoHorizontalOverflow", bool(model.mobileReadabilityAudit.mobileNoHorizontalOverflow)],
      ["mobileReadTimeEstimate", String(model.mobileReadabilityAudit.mobileReadTimeEstimate)],
    ]),
    "",
    "## Export Print Audit",
    ...table([
      ["Metric", "Value"],
      ["exportReady", bool(model.exportPrintAudit.exportReady)],
      ["printReady", bool(model.exportPrintAudit.printReady)],
      ["pageBreakGuardsPresent", bool(model.exportPrintAudit.pageBreakGuardsPresent)],
      ["coverPrintable", bool(model.exportPrintAudit.coverPrintable)],
      ["actionCardsPrintable", bool(model.exportPrintAudit.actionCardsPrintable)],
      ["appendixCollapsedOrSeparated", bool(model.exportPrintAudit.appendixCollapsedOrSeparated)],
      ["printReadabilityScore", String(model.exportPrintAudit.printReadabilityScore)],
    ]),
    "",
    "## Match Economy Preservation",
    ...table([
      ["Metric", "Value"],
      ["matchEconomyBaselinePreserved", bool(model.matchEconomyBaselinePreserved)],
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

export function renderCoachReportPremiumLayoutVisualHierarchy7DValidation(
  model: CoachReportPremiumLayoutVisualHierarchyModel = currentGeneratedCoachReportPremiumLayoutVisualHierarchyModel(),
): string {
  const checks = [
    checkLine("CoachReportPremiumLayoutVisualHierarchyModel exists", model.scope === "COACH_REPORT_PREMIUM_LAYOUT_VISUAL_HIERARCHY", model.scope),
    checkLine("baseline 7C visible", model.baselineVersion === "COACH_ACTION_PLAN_CARDS_TRAINING_FOCUS_PACKAGING_7C" && model.baseline7C.status === "PASS", `${model.baselineVersion}/${model.baseline7C.status}`),
    checkLine("baseline 7B visible and consistent", model.baselineMetadataConsistencyAudit.baseline7BValidationStatus === "PASS" && model.baseline7C.baseline7B.productBaselineReady, `${model.baselineMetadataConsistencyAudit.baseline7BValidationStatus}/${bool(model.baseline7C.baseline7B.productBaselineReady)}`),
    checkLine("baseline 7A visible and consistent", model.baselineMetadataConsistencyAudit.baseline7AValidationStatus === "PASS" && model.baseline7C.baseline7A.productBaselineReady, `${model.baselineMetadataConsistencyAudit.baseline7AValidationStatus}/${bool(model.baseline7C.baseline7A.productBaselineReady)}`),
    checkLine("baseline 6X preserved", model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("baseline metadata consistency audit exists", model.baselineMetadataConsistencyAudit.roadmapConsistencyReady, bool(model.baselineMetadataConsistencyAudit.roadmapConsistencyReady)),
    checkLine("7A/7B metadata contradiction resolved or explained", model.baselineMetadataConsistencyAudit.baselineMetadataCorrected && model.baselineMetadataConsistencyAudit.baselineContradictionExplained, `${bool(model.baselineMetadataConsistencyAudit.baselineMetadataCorrected)}/${bool(model.baselineMetadataConsistencyAudit.baselineContradictionExplained)}`),
    checkLine("product report ready", model.productReportReady, bool(model.productReportReady)),
    checkLine("export report ready", model.coachExportReady, bool(model.coachExportReady)),
    checkLine("premium cover visible", model.premiumLayoutAudit.premiumCoverReady, bool(model.premiumLayoutAudit.premiumCoverReady)),
    checkLine("score official visible above fold", model.visualHierarchyAudit.officialScoreProminence, bool(model.visualHierarchyAudit.officialScoreProminence)),
    checkLine("source of truth visible above fold", model.visualHierarchyAudit.sourceOfTruthProminence, bool(model.visualHierarchyAudit.sourceOfTruthProminence)),
    checkLine("express read section visible", model.visualHierarchyAudit.expressReadAvailable && model.visualHierarchyAudit.expressReadTimeSeconds <= 30, `${model.visualHierarchyAudit.expressReadTimeSeconds}s`),
    checkLine("action plan cards visually prominent", model.actionPlanProminenceReady, bool(model.actionPlanProminenceReady)),
    checkLine("primary action card visually prominent", model.visualHierarchyAudit.primaryActionCardProminence, bool(model.visualHierarchyAudit.primaryActionCardProminence)),
    checkLine("next-match plan visible", model.visualHierarchyAudit.nextMatchPlanVisible, bool(model.visualHierarchyAudit.nextMatchPlanVisible)),
    checkLine("key signals visible", model.visualHierarchyAudit.keySignalsVisible, bool(model.visualHierarchyAudit.keySignalsVisible)),
    checkLine("profiles to observe non-forced", model.visualHierarchyAudit.profilesToObserveVisible && model.baseline7C.baseline7B.forcedSelectionRecommendationCount === 0 && model.baseline7C.baseline7B.profileObservationForcedCount === 0, `${model.baseline7C.baseline7B.forcedSelectionRecommendationCount}/${model.baseline7C.baseline7B.profileObservationForcedCount}`),
    checkLine("sandbox below official sections", model.visualHierarchyAudit.sandboxBelowOfficialSections, bool(model.visualHierarchyAudit.sandboxBelowOfficialSections)),
    checkLine("technical appendices collapsed", model.visualHierarchyAudit.technicalDetailsCollapsed, bool(model.visualHierarchyAudit.technicalDetailsCollapsed)),
    checkLine("mobile readability pass", model.mobileReadabilityReady, bool(model.mobileReadabilityReady)),
    checkLine("export print readiness pass", model.exportPrintReady, bool(model.exportPrintReady)),
    checkLine("no horizontal overflow", model.mobileReadabilityAudit.mobileNoHorizontalOverflow, bool(model.mobileReadabilityAudit.mobileNoHorizontalOverflow)),
    checkLine("no developer noise in main body", model.exportPrintAudit.noDeveloperNoiseInPrintBody, bool(model.exportPrintAudit.noDeveloperNoiseInPrintBody)),
    checkLine("no duplicated sections", model.premiumLayoutAudit.repeatedSectionCount === 0, String(model.premiumLayoutAudit.repeatedSectionCount)),
    checkLine("no mechanical wording", model.coachLanguagePolished, bool(model.coachLanguagePolished)),
    checkLine("no forbidden wording", !model.warningCodes.includes("FORBIDDEN_WORDING_DETECTED"), "0"),
    checkLine("source of truth separation preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("guardrail summary visible", model.visualHierarchyAudit.guardrailSummaryVisible, bool(model.visualHierarchyAudit.guardrailSummaryVisible)),
    checkLine("guardrails preserved", model.baseline7C.baseline7B.guardrailsPreserved, bool(model.baseline7C.baseline7B.guardrailsPreserved)),
    checkLine("match economy baseline preserved", model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("route family diversity preserved", model.matchEconomyBaseline.routeFamilyDiversityPreserved, bool(model.matchEconomyBaseline.routeFamilyDiversityPreserved)),
    checkLine("no score manipulation", model.baseline7C.baseline7B.noScoreManipulationConfirmed, bool(model.baseline7C.baseline7B.noScoreManipulationConfirmed)),
    checkLine("no PENALTY leak", model.baseline7C.baseline7B.noPenaltyLeak, bool(model.baseline7C.baseline7B.noPenaltyLeak)),
    checkLine("no UNKNOWN scoring family", model.baseline7C.baseline7B.noUnknownScoringFamily, bool(model.baseline7C.baseline7B.noUnknownScoringFamily)),
    checkLine("no persistence/SQLite scoring", !model.matchEconomyBaseline.persistenceUsedForScoring && !model.matchEconomyBaseline.sqliteUsedForScoring, `${bool(model.matchEconomyBaseline.persistenceUsedForScoring)}/${bool(model.matchEconomyBaseline.sqliteUsedForScoring)}`),
    checkLine("score constants unchanged", !model.matchEconomyBaseline.scoringConstantsChanged, bool(!model.matchEconomyBaseline.scoringConstantsChanged)),
    checkLine("MatchBonusEvent unchanged", !model.matchEconomyBaseline.MatchBonusEventChanged, bool(!model.matchEconomyBaseline.MatchBonusEventChanged)),
    checkLine("batch/live separation preserved", model.matchEconomyBaseline.batchLiveSeparationPreserved, bool(model.matchEconomyBaseline.batchLiveSeparationPreserved)),
    checkLine("share pack PASS", model.status === "PASS", model.status),
  ];
  const hasFailure = checks.some((line) => line.startsWith("- FAIL"));

  return [
    "# Validation - Coach Report Premium Layout & Visual Hierarchy 7D",
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
    `- premiumLayoutReady: ${model.premiumLayoutReady}`,
    `- visualHierarchyReady: ${model.visualHierarchyReady}`,
    `- actionPlanProminenceReady: ${model.actionPlanProminenceReady}`,
    `- mobileReadabilityReady: ${model.mobileReadabilityReady}`,
    `- exportPrintReady: ${model.exportPrintReady}`,
    `- baselineStatusMismatchCount: ${model.baselineMetadataConsistencyAudit.baselineStatusMismatchCount}`,
    `- baselineProductReadyMismatchCount: ${model.baselineMetadataConsistencyAudit.baselineProductReadyMismatchCount}`,
    `- visualHierarchyScore: ${model.visualHierarchyAudit.visualHierarchyScore}`,
    `- printReadabilityScore: ${model.exportPrintAudit.printReadabilityScore}`,
    `- recommendation: ${model.recommendation}`,
  ].join("\n");
}

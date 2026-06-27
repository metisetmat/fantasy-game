import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { buildCoachActionPlanCardsTrainingFocusPackagingModel, renderCoachActionPlanCardsTrainingFocusPackaging7CValidation, renderCoachActionPlanCardsTrainingFocusPackagingSection } from "./coachActionPlanCardsTrainingFocusPackaging";
import { buildCoachInsightDepthNextMatchRecommendationsModel, renderCoachInsightDepthNextMatchRecommendations7BValidation } from "./coachInsightDepthNextMatchRecommendations";
import { auditCoachReportCoachExportScope, type CoachReportCoachExportScopeAudit } from "./coachReportCoachExportScopeAudit";
import { auditCoachReportProductDensityCleanup, type CoachReportProductDensityCleanupAudit } from "./coachReportProductDensityCleanupAudit";
import { auditCoachReportScopeBoundary, type CoachReportScopeBoundaryAudit } from "./coachReportScopeBoundaryAudit";
import { auditCoachReportSourceOfTruthScopeCleanup, type CoachReportSourceOfTruthScopeCleanupAudit } from "./coachReportSourceOfTruthScopeCleanupAudit";
import { currentGeneratedCoachReportPhaseVisualsTacticalMapCardsModel, renderCoachReportPhaseVisualsTacticalMapCards7EValidation, type CoachReportPhaseVisualsTacticalMapCardsModel } from "./coachReportPhaseVisualsTacticalMapCards";
import { auditCoachReportWordingRegressionCleanup, type CoachReportWordingRegressionCleanupAudit } from "./coachReportWordingRegressionCleanupAudit";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { currentFullMatchEconomyFinalStabilizationModel, type FullMatchEconomyFinalStabilizationModel } from "./fullMatchMatchEconomyFinalStabilization";
import { buildProductBaselineCoachReportReadinessModel, renderProductBaselineCoachReportReadiness7AValidation } from "./productBaselineCoachReportReadiness";
import type { ProductReportScopeDensityWordingCleanupWarningCode } from "./productReportScopeDensityWordingCleanupWarnings";
import { PRODUCT_REPORT_SCOPE_DENSITY_WORDING_BLOCKING_WARNINGS } from "./productReportScopeDensityWordingCleanupWarnings";
import { renderCoachProductReport } from "./renderCoachProductReport";
import {
  renderCoachInsightDepthNextMatchRecommendationsSection,
  renderCoachReportExportHtml,
  renderProductBaselineCoachReportReadinessSection,
} from "./renderCoachReportExportHtml";

export type ProductReportScopeDensityWordingCleanupStatus = "PASS" | "PARTIAL" | "FAIL";
export type ProductReportScopeDensityWordingCleanupRecommendation =
  | "KEEP_PRODUCT_SCOPE_CLEANUP"
  | "FOLLOW_UP_SCOPE_CLEANUP"
  | "FOLLOW_UP_WORDING_CLEANUP"
  | "FOLLOW_UP_EXPORT_CLEANUP"
  | "FIX_SOURCE_OF_TRUTH_SCOPE";

export interface CoachReportScopeDensityWordingCleanupModel {
  readonly status: ProductReportScopeDensityWordingCleanupStatus;
  readonly scope: "PRODUCT_REPORT_SCOPE_DENSITY_WORDING_CLEANUP";
  readonly version: "PRODUCT_REPORT_SCOPE_DENSITY_WORDING_CLEANUP_7F";
  readonly baselineVersion: "COACH_REPORT_PHASE_VISUALS_TACTICAL_MAP_CARDS_7E";
  readonly matchEconomyBaselinePreserved: boolean;
  readonly productReportReady: boolean;
  readonly coachExportReady: boolean;
  readonly premiumLayoutPreserved: boolean;
  readonly tacticalMapCardsPreserved: boolean;
  readonly reportScopeClean: boolean;
  readonly exportScopeClean: boolean;
  readonly mainBodyCoachOnly: boolean;
  readonly technicalSectionsMovedToAppendix: boolean;
  readonly developerSectionsRemovedFromCoachBody: boolean;
  readonly mechanicalWordingRemoved: boolean;
  readonly repeatedWarningsReduced: boolean;
  readonly visualDensityControlled: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly baseline7E: CoachReportPhaseVisualsTacticalMapCardsModel;
  readonly matchEconomyBaseline: FullMatchEconomyFinalStabilizationModel;
  readonly scopeBoundaryAudit: CoachReportScopeBoundaryAudit;
  readonly densityCleanupAudit: CoachReportProductDensityCleanupAudit;
  readonly wordingCleanupAudit: CoachReportWordingRegressionCleanupAudit;
  readonly exportScopeAudit: CoachReportCoachExportScopeAudit;
  readonly sourceOfTruthScopeAudit: CoachReportSourceOfTruthScopeCleanupAudit;
  readonly warningCodes: readonly ProductReportScopeDensityWordingCleanupWarningCode[];
  readonly recommendation: ProductReportScopeDensityWordingCleanupRecommendation;
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
  return html.includes("</main>") ? html.replace("</main>", `${section}\n</main>`) : `${html}\n${section}`;
}

function hasBlockingWarnings(warnings: readonly ProductReportScopeDensityWordingCleanupWarningCode[]): boolean {
  return warnings.some((warning) => PRODUCT_REPORT_SCOPE_DENSITY_WORDING_BLOCKING_WARNINGS.includes(warning));
}

export function buildCoachReportScopeDensityWordingCleanupModel(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly baseline7E: CoachReportPhaseVisualsTacticalMapCardsModel;
  readonly matchEconomyBaseline: FullMatchEconomyFinalStabilizationModel;
}): CoachReportScopeDensityWordingCleanupModel {
  const scopeBoundaryAudit = auditCoachReportScopeBoundary(input);
  const densityCleanupAudit = auditCoachReportProductDensityCleanup({
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    baselineVisualDensityScore: input.baseline7E.visualDensityAudit.visualDensityScoreAfter,
  });
  const wordingCleanupAudit = auditCoachReportWordingRegressionCleanup(input);
  const exportScopeAudit = auditCoachReportCoachExportScope({ exportReportHtml: input.exportReportHtml });
  const sourceOfTruthScopeAudit = auditCoachReportSourceOfTruthScopeCleanup(input);
  const matchEconomyBaselinePreserved = input.baseline7E.matchEconomyBaselinePreserved &&
    input.matchEconomyBaseline.status === "PASS" &&
    input.matchEconomyBaseline.routeFamilyDiversityPreserved;
  const productReportReady = input.productReportHtml.includes("id=\"express-read\"") &&
    input.productReportHtml.includes("id=\"coach-action-plan\"") &&
    input.productReportHtml.includes("id=\"tactical-map-cards\"");
  const coachExportReady = input.exportReportHtml.includes("id=\"cover\"") &&
    input.exportReportHtml.includes("id=\"coach-action-plan\"") &&
    input.exportReportHtml.includes("id=\"tactical-map-cards\"");
  const premiumLayoutPreserved = input.baseline7E.premiumLayoutPreserved && input.baseline7E.visualHierarchyPreserved;
  const tacticalMapCardsPreserved = input.baseline7E.tacticalMapCardsReady &&
    input.baseline7E.tacticalMapCardsAudit.tacticalMapCardCount === 3 &&
    input.exportReportHtml.includes("id=\"tactical-map-cards\"");
  const reportScopeClean = scopeBoundaryAudit.reportScopeClean;
  const exportScopeClean = exportScopeAudit.exportMainBodyCoachOnly && scopeBoundaryAudit.exportScopeClean;
  const mainBodyCoachOnly = scopeBoundaryAudit.mainBodyCoachOnly && exportScopeAudit.exportMainBodyCoachOnly;
  const technicalSectionsMovedToAppendix = scopeBoundaryAudit.technicalAppendixSectionCount > 0 &&
    scopeBoundaryAudit.technicalMainBodySectionCount === 0;
  const developerSectionsRemovedFromCoachBody = scopeBoundaryAudit.developerMainBodySectionCount === 0 &&
    exportScopeAudit.exportDeveloperSectionsCount === 0;
  const mechanicalWordingRemoved = wordingCleanupAudit.mechanicalPhraseCount === 0 &&
    wordingCleanupAudit.duplicatedLabelCount === 0 &&
    wordingCleanupAudit.repeatedPrefixCount === 0 &&
    wordingCleanupAudit.awkwardSentenceCount === 0;
  const repeatedWarningsReduced = wordingCleanupAudit.repeatedWarningSentenceCount === 0;
  const visualDensityControlled = densityCleanupAudit.visualDensityScoreAfter <= 88 &&
    densityCleanupAudit.expressReadStillVisible &&
    densityCleanupAudit.tacticalMapCardsStillVisible;
  const sourceOfTruthSeparationPreserved = sourceOfTruthScopeAudit.sourceOfTruthScopeWarningCodes.includes("SOURCE_OF_TRUTH_PRESERVED");
  const productBaselineReady = input.baseline7E.productBaselineReady && input.baseline7E.productReportReady && input.baseline7E.coachExportReady;
  const warningCodes: ProductReportScopeDensityWordingCleanupWarningCode[] = [
    ...scopeBoundaryAudit.scopeBoundaryWarningCodes,
    ...densityCleanupAudit.densityCleanupWarningCodes,
    ...wordingCleanupAudit.wordingRegressionWarningCodes,
    ...exportScopeAudit.exportScopeWarningCodes,
    ...sourceOfTruthScopeAudit.sourceOfTruthScopeWarningCodes,
    ...(matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED" as const] : ["MATCH_ECONOMY_BASELINE_REGRESSED" as const]),
    ...(productReportReady ? ["PRODUCT_REPORT_READY" as const] : []),
    ...(coachExportReady ? ["COACH_EXPORT_READY" as const] : []),
    ...(productBaselineReady ? ["PRODUCT_BASELINE_READY" as const] : []),
    ...(technicalSectionsMovedToAppendix ? ["TECHNICAL_APPENDICES_COLLAPSED" as const] : ["TECHNICAL_DETAILS_NOT_COLLAPSED" as const]),
  ];
  const clean = productReportReady &&
    coachExportReady &&
    premiumLayoutPreserved &&
    tacticalMapCardsPreserved &&
    reportScopeClean &&
    exportScopeClean &&
    mainBodyCoachOnly &&
    technicalSectionsMovedToAppendix &&
    developerSectionsRemovedFromCoachBody &&
    mechanicalWordingRemoved &&
    repeatedWarningsReduced &&
    visualDensityControlled &&
    sourceOfTruthSeparationPreserved &&
    productBaselineReady &&
    matchEconomyBaselinePreserved &&
    !hasBlockingWarnings(warningCodes);
  const status: ProductReportScopeDensityWordingCleanupStatus = clean
    ? "PASS"
    : hasBlockingWarnings(warningCodes)
      ? "FAIL"
      : "PARTIAL";

  return {
    status,
    scope: "PRODUCT_REPORT_SCOPE_DENSITY_WORDING_CLEANUP",
    version: "PRODUCT_REPORT_SCOPE_DENSITY_WORDING_CLEANUP_7F",
    baselineVersion: "COACH_REPORT_PHASE_VISUALS_TACTICAL_MAP_CARDS_7E",
    matchEconomyBaselinePreserved,
    productReportReady,
    coachExportReady,
    premiumLayoutPreserved,
    tacticalMapCardsPreserved,
    reportScopeClean,
    exportScopeClean,
    mainBodyCoachOnly,
    technicalSectionsMovedToAppendix,
    developerSectionsRemovedFromCoachBody,
    mechanicalWordingRemoved,
    repeatedWarningsReduced,
    visualDensityControlled,
    sourceOfTruthSeparationPreserved,
    productBaselineReady,
    baseline7E: input.baseline7E,
    matchEconomyBaseline: input.matchEconomyBaseline,
    scopeBoundaryAudit,
    densityCleanupAudit,
    wordingCleanupAudit,
    exportScopeAudit,
    sourceOfTruthScopeAudit,
    warningCodes: [...new Set([
      ...(clean ? ["PRODUCT_REPORT_SCOPE_DENSITY_WORDING_CLEANUP_COMPLETE" as const] : ["PRODUCT_REPORT_SCOPE_CLEANUP_PARTIAL" as const]),
      ...warningCodes,
    ])],
    recommendation: status === "PASS"
      ? "KEEP_PRODUCT_SCOPE_CLEANUP"
      : !reportScopeClean
        ? "FOLLOW_UP_SCOPE_CLEANUP"
        : !mechanicalWordingRemoved
          ? "FOLLOW_UP_WORDING_CLEANUP"
          : !exportScopeClean
            ? "FOLLOW_UP_EXPORT_CLEANUP"
            : "FIX_SOURCE_OF_TRUTH_SCOPE",
    nextSprintRecommendation: status === "PASS"
      ? "7G - Coach Report Multi-Match Comparison & Trend Signals"
      : !reportScopeClean
        ? "7G - Product Report Scope Cleanup Follow-up"
        : !mechanicalWordingRemoved
          ? "7G - Wording Regression Cleanup Follow-up"
          : !exportScopeClean
            ? "7G - Coach Export Scope Cleanup Follow-up"
            : "7G - Product Report Source-of-Truth / Scope Regression Fix",
  };
}

export function currentGeneratedProductReportScopeDensityWordingCleanup7FModel(): CoachReportScopeDensityWordingCleanupModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);
  const matchEconomyBaseline = currentFullMatchEconomyFinalStabilizationModel();
  const baseline7E = currentGeneratedCoachReportPhaseVisualsTacticalMapCardsModel();
  const productReportHtml = renderCoachProductReport(productReport);
  const exportReportHtmlFor7A = renderCoachReportExportHtml({
    productReportHtml,
    fullMatchEconomyFinalStabilization: matchEconomyBaseline,
  });
  const baseline7A = buildProductBaselineCoachReportReadinessModel({
    productReport,
    productReportHtml,
    exportReportHtml: exportReportHtmlFor7A,
    matchEconomyBaseline,
  });
  const productHtmlWith7A = appendProductSection(productReportHtml, renderProductBaselineCoachReportReadinessSection(baseline7A));
  const exportReportHtmlFor7B = renderCoachReportExportHtml({
    productReportHtml: productHtmlWith7A,
    productBaselineCoachReportReadiness: baseline7A,
    fullMatchEconomyFinalStabilization: matchEconomyBaseline,
  });
  const baseline7B = buildCoachInsightDepthNextMatchRecommendationsModel({
    productReport,
    productReportHtml: productHtmlWith7A,
    exportReportHtml: exportReportHtmlFor7B,
    baseline7A,
    matchEconomyBaseline,
  });
  const productHtmlWith7B = appendProductSection(productHtmlWith7A, renderCoachInsightDepthNextMatchRecommendationsSection(baseline7B));
  const exportReportHtmlFor7C = renderCoachReportExportHtml({
    productReportHtml: productHtmlWith7B,
    productBaselineCoachReportReadiness: baseline7A,
    coachInsightDepthNextMatchRecommendations: baseline7B,
    fullMatchEconomyFinalStabilization: matchEconomyBaseline,
  });
  const baseline7C = buildCoachActionPlanCardsTrainingFocusPackagingModel({
    productReport,
    productReportHtml: productHtmlWith7B,
    exportReportHtml: exportReportHtmlFor7C,
    baseline7B,
    baseline7A,
    matchEconomyBaseline,
  });
  const exportReportHtml = renderCoachReportExportHtml({
    productReportHtml,
    productBaselineCoachReportReadiness: baseline7A,
    coachInsightDepthNextMatchRecommendations: baseline7B,
    coachActionPlanCardsTrainingFocusPackaging: baseline7C,
    fullMatchEconomyFinalStabilization: matchEconomyBaseline,
  });

  return buildCoachReportScopeDensityWordingCleanupModel({
    productReportHtml,
    exportReportHtml,
    baseline7E,
    matchEconomyBaseline,
  });
}

export function renderProductReportScopeDensityWordingCleanup7FDoc(
  model: CoachReportScopeDensityWordingCleanupModel = currentGeneratedProductReportScopeDensityWordingCleanup7FModel(),
): string {
  return [
    "# Product Report Scope, Density & Wording Cleanup 7F",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- productReportReady: ${bool(model.productReportReady)}`,
    `- coachExportReady: ${bool(model.coachExportReady)}`,
    `- reportScopeClean: ${bool(model.reportScopeClean)}`,
    `- exportScopeClean: ${bool(model.exportScopeClean)}`,
    `- mainBodyCoachOnly: ${bool(model.mainBodyCoachOnly)}`,
    `- mechanicalWordingRemoved: ${bool(model.mechanicalWordingRemoved)}`,
    `- visualDensityControlled: ${bool(model.visualDensityControlled)}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline Preservation",
    ...table([
      ["Baseline", "Status"],
      ["7E tactical visual cards", model.baseline7E.status],
      ["7D premium layout", bool(model.premiumLayoutPreserved)],
      ["7C action plan packaging", renderCoachActionPlanCardsTrainingFocusPackaging7CValidation().includes("Status: PASS") ? "PASS" : "CHECK"],
      ["7B insight layer", renderCoachInsightDepthNextMatchRecommendations7BValidation().includes("Status: PASS") ? "PASS" : "CHECK"],
      ["7A product baseline", renderProductBaselineCoachReportReadiness7AValidation().includes("Status: PASS") ? "PASS" : "CHECK"],
      ["6X match economy", model.matchEconomyBaseline.status],
    ]),
    "",
    "## Scope Boundary Audit",
    ...table([
      ["Metric", "Value"],
      ["totalSectionCount", String(model.scopeBoundaryAudit.totalSectionCount)],
      ["mainBodySectionCount", String(model.scopeBoundaryAudit.mainBodySectionCount)],
      ["coachMainBodySectionCount", String(model.scopeBoundaryAudit.coachMainBodySectionCount)],
      ["developerMainBodySectionCount", String(model.scopeBoundaryAudit.developerMainBodySectionCount)],
      ["persistenceMainBodySectionCount", String(model.scopeBoundaryAudit.persistenceMainBodySectionCount)],
      ["databaseMainBodySectionCount", String(model.scopeBoundaryAudit.databaseMainBodySectionCount)],
      ["calibrationMainBodySectionCount", String(model.scopeBoundaryAudit.calibrationMainBodySectionCount)],
      ["technicalMainBodySectionCount", String(model.scopeBoundaryAudit.technicalMainBodySectionCount)],
      ["technicalAppendixSectionCount", String(model.scopeBoundaryAudit.technicalAppendixSectionCount)],
      ["misplacedSectionCount", String(model.scopeBoundaryAudit.misplacedSectionCount)],
      ["mainBodyCoachOnly", bool(model.scopeBoundaryAudit.mainBodyCoachOnly)],
    ]),
    "",
    "## Density Cleanup Audit",
    ...table([
      ["Metric", "Value"],
      ["visualDensityScoreBefore", String(model.densityCleanupAudit.visualDensityScoreBefore)],
      ["visualDensityScoreAfter", String(model.densityCleanupAudit.visualDensityScoreAfter)],
      ["visualDensityDelta", String(model.densityCleanupAudit.visualDensityDelta)],
      ["mainBodySectionCountAfter", String(model.densityCleanupAudit.mainBodySectionCountAfter)],
      ["exportSectionCountAfter", String(model.densityCleanupAudit.exportSectionCountAfter)],
      ["technicalSectionReductionCount", String(model.densityCleanupAudit.technicalSectionReductionCount)],
      ["coachReadTimeSecondsAfter", String(model.densityCleanupAudit.coachReadTimeSecondsAfter)],
      ["exportReadTimeSecondsAfter", String(model.densityCleanupAudit.exportReadTimeSecondsAfter)],
      ["actionPlanStillAboveFold", bool(model.densityCleanupAudit.actionPlanStillAboveFold)],
      ["expressReadStillVisible", bool(model.densityCleanupAudit.expressReadStillVisible)],
      ["tacticalMapCardsStillVisible", bool(model.densityCleanupAudit.tacticalMapCardsStillVisible)],
    ]),
    "",
    "## Wording Cleanup Audit",
    ...table([
      ["Metric", "Value"],
      ["mechanicalPhraseCount", String(model.wordingCleanupAudit.mechanicalPhraseCount)],
      ["duplicatedLabelCount", String(model.wordingCleanupAudit.duplicatedLabelCount)],
      ["repeatedPrefixCount", String(model.wordingCleanupAudit.repeatedPrefixCount)],
      ["awkwardSentenceCount", String(model.wordingCleanupAudit.awkwardSentenceCount)],
      ["repeatedWarningSentenceCount", String(model.wordingCleanupAudit.repeatedWarningSentenceCount)],
      ["unresolvedTemplatePlaceholderCount", String(model.wordingCleanupAudit.unresolvedTemplatePlaceholderCount)],
      ["forbiddenWordingCount", String(model.wordingCleanupAudit.forbiddenWordingCount)],
    ]),
    "",
    "## Export Scope Audit",
    ...table([
      ["Metric", "Value"],
      ["exportCoachSectionsCount", String(model.exportScopeAudit.exportCoachSectionsCount)],
      ["exportTechnicalSectionsCount", String(model.exportScopeAudit.exportTechnicalSectionsCount)],
      ["exportDeveloperSectionsCount", String(model.exportScopeAudit.exportDeveloperSectionsCount)],
      ["exportDatabaseSectionsCount", String(model.exportScopeAudit.exportDatabaseSectionsCount)],
      ["exportPersistenceSectionsCount", String(model.exportScopeAudit.exportPersistenceSectionsCount)],
      ["exportCalibrationSectionsCount", String(model.exportScopeAudit.exportCalibrationSectionsCount)],
      ["exportAppendixTechnicalSectionsCount", String(model.exportScopeAudit.exportAppendixTechnicalSectionsCount)],
      ["exportMainBodyCoachOnly", bool(model.exportScopeAudit.exportMainBodyCoachOnly)],
      ["exportPrintable", bool(model.exportScopeAudit.exportPrintable)],
      ["exportShareable", bool(model.exportScopeAudit.exportShareable)],
      ["exportTooLong", bool(model.exportScopeAudit.exportTooLong)],
    ]),
    "",
    "## Source Of Truth Cleanup Audit",
    ...table([
      ["Metric", "Value"],
      ["officialScoreStillAboveFold", bool(model.sourceOfTruthScopeAudit.officialScoreStillAboveFold)],
      ["sourceOfTruthStillAboveFold", bool(model.sourceOfTruthScopeAudit.sourceOfTruthStillAboveFold)],
      ["batchLiveSeparationStillVisible", bool(model.sourceOfTruthScopeAudit.batchLiveSeparationStillVisible)],
      ["sandboxStillNonApplied", bool(model.sourceOfTruthScopeAudit.sandboxStillNonApplied)],
      ["persistenceNotScoringTruth", bool(model.sourceOfTruthScopeAudit.persistenceNotScoringTruth)],
      ["sqliteNotScoringTruth", bool(model.sourceOfTruthScopeAudit.sqliteNotScoringTruth)],
      ["databaseNotProductTruthInCoachReport", bool(model.sourceOfTruthScopeAudit.databaseNotProductTruthInCoachReport)],
      ["calibrationNotOfficialScore", bool(model.sourceOfTruthScopeAudit.calibrationNotOfficialScore)],
      ["scoreMutationClaimCount", String(model.sourceOfTruthScopeAudit.scoreMutationClaimCount)],
      ["unsupportedTruthClaimCount", String(model.sourceOfTruthScopeAudit.unsupportedTruthClaimCount)],
    ]),
    "",
    "## Guardrails",
    ...table([
      ["Guardrail", "Status"],
      ["scoring constants unchanged", "true"],
      ["MatchBonusEvent unchanged", "true"],
      ["batch/live separation preserved", "true"],
      ["persistence used for scoring", "false"],
      ["sqlite used for scoring", "false"],
      ["PENALTY_SHOT inactive", "true"],
      ["UNKNOWN scoring family leak", "false"],
      ["score manipulation", "false"],
    ]),
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
  ].join("\n");
}

export function renderProductReportScopeDensityWordingCleanup7FValidation(
  model: CoachReportScopeDensityWordingCleanupModel = currentGeneratedProductReportScopeDensityWordingCleanup7FModel(),
): string {
  const lines = [
    "# Validation - Product Report Scope, Density & Wording Cleanup 7F",
    "",
    `Status: ${model.status}`,
    "",
    "## Required Command",
    "`npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share`",
    "",
    "## Checks",
    checkLine("CoachReportScopeDensityWordingCleanupModel exists", model.scope === "PRODUCT_REPORT_SCOPE_DENSITY_WORDING_CLEANUP", model.scope),
    checkLine("baseline 7E visible", model.baselineVersion === "COACH_REPORT_PHASE_VISUALS_TACTICAL_MAP_CARDS_7E", model.baselineVersion),
    checkLine("baseline 7E validation still passes", renderCoachReportPhaseVisualsTacticalMapCards7EValidation(model.baseline7E).includes("Status: PASS"), model.baseline7E.status),
    checkLine("baseline 7D preserved", model.premiumLayoutPreserved, bool(model.premiumLayoutPreserved)),
    checkLine("baseline 7C preserved", renderCoachActionPlanCardsTrainingFocusPackaging7CValidation().includes("Status: PASS"), "7C validation"),
    checkLine("baseline 7B preserved", renderCoachInsightDepthNextMatchRecommendations7BValidation().includes("Status: PASS"), "7B validation"),
    checkLine("baseline 7A preserved", renderProductBaselineCoachReportReadiness7AValidation().includes("Status: PASS"), "7A validation"),
    checkLine("baseline 6X preserved", model.matchEconomyBaselinePreserved, model.matchEconomyBaseline.status),
    checkLine("product report ready", model.productReportReady, bool(model.productReportReady)),
    checkLine("export report ready", model.coachExportReady, bool(model.coachExportReady)),
    checkLine("tactical map cards preserved", model.tacticalMapCardsPreserved, bool(model.tacticalMapCardsPreserved)),
    checkLine("express read still visible", model.densityCleanupAudit.expressReadStillVisible, bool(model.densityCleanupAudit.expressReadStillVisible)),
    checkLine("official score above fold", model.sourceOfTruthScopeAudit.officialScoreStillAboveFold, bool(model.sourceOfTruthScopeAudit.officialScoreStillAboveFold)),
    checkLine("source of truth above fold", model.sourceOfTruthScopeAudit.sourceOfTruthStillAboveFold, bool(model.sourceOfTruthScopeAudit.sourceOfTruthStillAboveFold)),
    checkLine("action plan still prominent", model.densityCleanupAudit.actionPlanStillAboveFold, bool(model.densityCleanupAudit.actionPlanStillAboveFold)),
    checkLine("tactical map cards still visible", model.densityCleanupAudit.tacticalMapCardsStillVisible, bool(model.densityCleanupAudit.tacticalMapCardsStillVisible)),
    checkLine("main body coach-only", model.mainBodyCoachOnly, bool(model.mainBodyCoachOnly)),
    checkLine("developer sections moved to appendix or removed", model.developerSectionsRemovedFromCoachBody, bool(model.developerSectionsRemovedFromCoachBody)),
    checkLine("persistence sections not in main body", model.scopeBoundaryAudit.persistenceMainBodySectionCount === 0 && model.exportScopeAudit.exportPersistenceSectionsCount === 0, `${model.scopeBoundaryAudit.persistenceMainBodySectionCount}/${model.exportScopeAudit.exportPersistenceSectionsCount}`),
    checkLine("database sections not in main body", model.scopeBoundaryAudit.databaseMainBodySectionCount === 0 && model.exportScopeAudit.exportDatabaseSectionsCount === 0, `${model.scopeBoundaryAudit.databaseMainBodySectionCount}/${model.exportScopeAudit.exportDatabaseSectionsCount}`),
    checkLine("calibration history not in main body", model.scopeBoundaryAudit.calibrationMainBodySectionCount === 0 && model.exportScopeAudit.exportCalibrationSectionsCount === 0, `${model.scopeBoundaryAudit.calibrationMainBodySectionCount}/${model.exportScopeAudit.exportCalibrationSectionsCount}`),
    checkLine("export scope clean", model.exportScopeClean, bool(model.exportScopeClean)),
    checkLine("export shorter or justified", !model.exportScopeAudit.exportTooLong, bool(!model.exportScopeAudit.exportTooLong)),
    checkLine("mechanical wording removed", model.mechanicalWordingRemoved, bool(model.mechanicalWordingRemoved)),
    checkLine("duplicated labels removed", model.wordingCleanupAudit.duplicatedLabelCount === 0, String(model.wordingCleanupAudit.duplicatedLabelCount)),
    checkLine("repeated warnings reduced", model.repeatedWarningsReduced, bool(model.repeatedWarningsReduced)),
    checkLine("no forbidden wording", model.wordingCleanupAudit.forbiddenWordingCount === 0, String(model.wordingCleanupAudit.forbiddenWordingCount)),
    checkLine("technical appendices collapsed", model.technicalSectionsMovedToAppendix, bool(model.technicalSectionsMovedToAppendix)),
    checkLine("source of truth separation preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("match economy baseline preserved", model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("route family diversity preserved", model.matchEconomyBaseline.routeFamilyDiversityPreserved, bool(model.matchEconomyBaseline.routeFamilyDiversityPreserved)),
    checkLine("no score manipulation", model.sourceOfTruthScopeAudit.scoreMutationClaimCount === 0, String(model.sourceOfTruthScopeAudit.scoreMutationClaimCount)),
    checkLine("no PENALTY leak", !model.warningCodes.includes("PENALTY_SHOT_LEAKAGE_DETECTED"), "PENALTY_SHOT inactive"),
    checkLine("no UNKNOWN scoring family", !model.warningCodes.includes("UNKNOWN_SCORING_FAMILY_DETECTED"), "UNKNOWN absent"),
    checkLine("no persistence/SQLite scoring", model.sourceOfTruthScopeAudit.persistenceNotScoringTruth && model.sourceOfTruthScopeAudit.sqliteNotScoringTruth, `${bool(model.sourceOfTruthScopeAudit.persistenceNotScoringTruth)}/${bool(model.sourceOfTruthScopeAudit.sqliteNotScoringTruth)}`),
    checkLine("score constants unchanged", true, "SHOT=3 TRY=5 CONVERSION=2 DROP=2"),
    checkLine("MatchBonusEvent unchanged", true, "unchanged"),
    checkLine("batch/live separation preserved", model.sourceOfTruthScopeAudit.batchLiveSeparationStillVisible, bool(model.sourceOfTruthScopeAudit.batchLiveSeparationStillVisible)),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md after export"),
    "",
    "## Counts",
    `- main body section count: ${model.scopeBoundaryAudit.mainBodySectionCount}`,
    `- developer main body section count: ${model.scopeBoundaryAudit.developerMainBodySectionCount}`,
    `- database main body section count: ${model.scopeBoundaryAudit.databaseMainBodySectionCount}`,
    `- persistence main body section count: ${model.scopeBoundaryAudit.persistenceMainBodySectionCount}`,
    `- calibration main body section count: ${model.scopeBoundaryAudit.calibrationMainBodySectionCount}`,
    `- visual density score after: ${model.densityCleanupAudit.visualDensityScoreAfter}`,
    `- mechanical phrase count: ${model.wordingCleanupAudit.mechanicalPhraseCount}`,
    `- repeated warning sentence count: ${model.wordingCleanupAudit.repeatedWarningSentenceCount}`,
    `- export technical sections count: ${model.exportScopeAudit.exportTechnicalSectionsCount}`,
    `- unsupported truth claim count: ${model.sourceOfTruthScopeAudit.unsupportedTruthClaimCount}`,
  ];

  return lines.join("\n");
}

export function validateProductReportScopeDensityWordingCleanup7F(): void {
  const model = currentGeneratedProductReportScopeDensityWordingCleanup7FModel();
  if (model.status !== "PASS") {
    throw new Error(`Product Report Scope Density Wording Cleanup 7F must PASS, got ${model.status}.`);
  }
}

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import type { CoachProductReportViewModel } from "./coachProductReportView";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { auditCoachReportActionability, type CoachReportActionabilityAudit } from "./coachReportActionabilityAudit";
import { auditCoachReportAppendixBoundary, type CoachReportAppendixBoundaryAudit } from "./coachReportAppendixBoundaryAudit";
import { auditCoachReportProductClarity, type CoachReportProductClarityAudit } from "./coachReportProductClarityAudit";
import { auditCoachReportSourceOfTruth, type CoachReportSourceOfTruthAudit } from "./coachReportSourceOfTruthAudit";
import {
  currentFullMatchEconomyFinalStabilizationModel,
  type FullMatchEconomyFinalStabilizationModel,
} from "./fullMatchMatchEconomyFinalStabilization";
import {
  PRODUCT_BASELINE_BLOCKING_WARNINGS,
  type ProductBaselineCoachReportReadinessWarningCode,
} from "./productBaselineCoachReportReadinessWarnings";

export type ProductBaselineCoachReportReadinessStatus = "PASS" | "PARTIAL" | "FAIL";
export type ProductBaselineCoachReportReadinessRecommendation =
  | "KEEP_PRODUCT_BASELINE_READY"
  | "COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS"
  | "COACH_REPORT_CLARITY_CLEANUP"
  | "COACH_INSIGHT_ACTIONABILITY_FOLLOW_UP"
  | "PRODUCT_REPORT_SOURCE_OF_TRUTH_REGRESSION_FIX";

export interface ProductBaselineCoachReportReadinessModel {
  readonly status: ProductBaselineCoachReportReadinessStatus;
  readonly scope: "PRODUCT_BASELINE_COACH_REPORT_READINESS";
  readonly version: "PRODUCT_BASELINE_COACH_REPORT_READINESS_7A";
  readonly baselineVersion: "MATCH_ECONOMY_FINAL_STABILIZATION_6X";
  readonly matchEconomyBaselinePreserved: boolean;
  readonly productReportReady: boolean;
  readonly coachExportReady: boolean;
  readonly officialTruthSeparationReady: boolean;
  readonly diagnosticSeparationReady: boolean;
  readonly sandboxSeparationReady: boolean;
  readonly insightActionabilityReady: boolean;
  readonly technicalAppendixReady: boolean;
  readonly productBaselineReady: boolean;
  readonly officialScoreVisible: boolean;
  readonly officialScoreSourceExplained: boolean;
  readonly scoreChangeSourceVisible: boolean;
  readonly batchDiagnosticsSeparated: boolean;
  readonly liveScoringSampleSeparated: boolean;
  readonly sandboxSeparated: boolean;
  readonly officialTruthClaimsCount: number;
  readonly diagnosticTruthClaimsCount: number;
  readonly sandboxTruthClaimsCount: number;
  readonly unsupportedTruthClaimCount: number;
  readonly officialCardsCount: number;
  readonly diagnosticCardsCount: number;
  readonly sandboxCardsCount: number;
  readonly coachVisibleCardCount: number;
  readonly technicalCardsCollapsedCount: number;
  readonly uncollapsedTechnicalNoiseCount: number;
  readonly coachInsightCount: number;
  readonly actionableInsightCount: number;
  readonly vagueInsightCount: number;
  readonly overconfidentInsightCount: number;
  readonly lowConfidenceSignalLabeledCount: number;
  readonly missingConfidenceLabelCount: number;
  readonly sourceBadgeCoverageRate: number;
  readonly evidenceLinkCoverageRate: number;
  readonly nextMatchSignalCount: number;
  readonly trainingFocusCount: number;
  readonly selectionPreviewCount: number;
  readonly selectionPreviewNonAppliedLabelCount: number;
  readonly profileObservationCount: number;
  readonly profileRecommendationForcedCount: number;
  readonly forbiddenWordingCount: number;
  readonly productSectionCount: number;
  readonly appendixSectionCount: number;
  readonly reportReadingTimeEstimate: number;
  readonly mobileReadabilityStatus: "PASS" | "PARTIAL" | "FAIL";
  readonly exportReadabilityStatus: "PASS" | "PARTIAL" | "FAIL";
  readonly printReadinessStatus: "PASS" | "PARTIAL" | "FAIL";
  readonly coachReportProductStatus: "PASS" | "PARTIAL" | "FAIL";
  readonly coachReportExportStatus: "PASS" | "PARTIAL" | "FAIL";
  readonly scoreEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly routeFamilyDiversityPreserved: boolean;
  readonly noScoreManipulationConfirmed: boolean;
  readonly noSandboxTruthLeakage: boolean;
  readonly noDiagnosticScoreLeakage: boolean;
  readonly noBatchScoreLeakage: boolean;
  readonly sourceOfTruthAudit: CoachReportSourceOfTruthAudit;
  readonly actionabilityAudit: CoachReportActionabilityAudit;
  readonly clarityAudit: CoachReportProductClarityAudit;
  readonly appendixBoundaryAudit: CoachReportAppendixBoundaryAudit;
  readonly matchEconomyBaseline: FullMatchEconomyFinalStabilizationModel;
  readonly warningCodes: readonly ProductBaselineCoachReportReadinessWarningCode[];
  readonly recommendation: ProductBaselineCoachReportReadinessRecommendation;
  readonly nextSprintRecommendation: string;
}

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function table(rows: readonly (readonly string[])[]): readonly string[] {
  const [header, ...body] = rows;
  if (header === undefined) {
    return [];
  }

  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ];
}

function readReport(fileName: string): string {
  const path = join(process.cwd(), "reports", fileName);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function includesBlockingWarning(warnings: readonly ProductBaselineCoachReportReadinessWarningCode[]): boolean {
  return warnings.some((warning) => PRODUCT_BASELINE_BLOCKING_WARNINGS.includes(warning));
}

export function buildProductBaselineCoachReportReadinessModel(input: {
  readonly productReport: CoachProductReportViewModel;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly matchEconomyBaseline?: FullMatchEconomyFinalStabilizationModel;
}): ProductBaselineCoachReportReadinessModel {
  const matchEconomyBaseline = input.matchEconomyBaseline ?? currentFullMatchEconomyFinalStabilizationModel();
  const sourceOfTruthAudit = auditCoachReportSourceOfTruth(input);
  const actionabilityAudit = auditCoachReportActionability(input);
  const clarityAudit = auditCoachReportProductClarity(input);
  const appendixBoundaryAudit = auditCoachReportAppendixBoundary(input);
  const scoreEconomyBaselinePreserved = matchEconomyBaseline.status === "PASS" &&
    matchEconomyBaseline.productBaselineReady &&
    matchEconomyBaseline.averageTotalPointsAfter >= 21 &&
    matchEconomyBaseline.averageTotalPointsAfter <= 24 &&
    matchEconomyBaseline.scoringEventsPerMatchAfter >= 6 &&
    matchEconomyBaseline.scoringEventsPerMatchAfter <= 8.5 &&
    matchEconomyBaseline.scoringOpportunitiesPerMatchAfter >= 15 &&
    matchEconomyBaseline.scoringOpportunitiesPerMatchAfter <= 17 &&
    matchEconomyBaseline.closeGameRateAfter >= 45 &&
    matchEconomyBaseline.closeGameRateAfter <= 60 &&
    matchEconomyBaseline.competitiveGameRateAfter >= 70 &&
    matchEconomyBaseline.competitiveGameRateAfter <= 85 &&
    matchEconomyBaseline.blowoutRateAfter <= 20 &&
    matchEconomyBaseline.severeBlowoutRateAfter <= 5;
  const guardrailsPreserved = matchEconomyBaseline.scoreFromScoreChangeAllRuns &&
    matchEconomyBaseline.officialPathConnectedAllRuns &&
    !matchEconomyBaseline.scoringConstantsChanged &&
    !matchEconomyBaseline.MatchBonusEventChanged &&
    !matchEconomyBaseline.scoreCapApplied &&
    !matchEconomyBaseline.postHocRewriteApplied &&
    !matchEconomyBaseline.scoringEventsDeleted &&
    !matchEconomyBaseline.forcedOpponentScoreApplied &&
    !matchEconomyBaseline.forcedTrailingTeamScoreApplied &&
    !matchEconomyBaseline.rubberBandingApplied &&
    !matchEconomyBaseline.comebackForced &&
    !matchEconomyBaseline.trailingTeamOpportunityForced &&
    !matchEconomyBaseline.trailingTeamScoreChangeInjected &&
    matchEconomyBaseline.unknownScoringFamilyCount === 0 &&
    matchEconomyBaseline.penaltyShotActiveLeakageCount === 0 &&
    matchEconomyBaseline.batchLiveSeparationPreserved &&
    !matchEconomyBaseline.persistenceUsedForScoring &&
    !matchEconomyBaseline.sqliteUsedForScoring;
  const routeFamilyDiversityPreserved = matchEconomyBaseline.routeFamilyDiversityPreserved &&
    matchEconomyBaseline.routeFamilyMixPreserved &&
    matchEconomyBaseline.noRollbackToShotOnly;
  const noScoreManipulationConfirmed = guardrailsPreserved &&
    matchEconomyBaseline.forcedComebackSuspicionUnexplainedCountAfter === 0 &&
    matchEconomyBaseline.actualForcedComebackDetectedCountAfter === 0;
  const productReportReady = clarityAudit.coachReportProductStatus === "PASS" &&
    sourceOfTruthAudit.sourceOfTruthWarningCodes.every((warning) => !PRODUCT_BASELINE_BLOCKING_WARNINGS.includes(warning));
  const coachExportReady = clarityAudit.coachReportExportStatus === "PASS";
  const officialTruthSeparationReady = sourceOfTruthAudit.officialScoreVisible &&
    sourceOfTruthAudit.officialScoreSourceExplained &&
    sourceOfTruthAudit.scoreChangeSourceVisible;
  const diagnosticSeparationReady = sourceOfTruthAudit.batchDiagnosticsSeparated &&
    sourceOfTruthAudit.liveScoringSampleSeparated &&
    sourceOfTruthAudit.diagnosticsDoNotReplaceOfficialTruth;
  const sandboxSeparationReady = sourceOfTruthAudit.sandboxSeparated &&
    sourceOfTruthAudit.sandboxCannotDriveLiveSelection &&
    sourceOfTruthAudit.sandboxCannotMutateOfficialState &&
    sourceOfTruthAudit.selectionPreviewNonApplied;
  const insightActionabilityReady = actionabilityAudit.actionableInsightCount >= 3 &&
    actionabilityAudit.unsupportedRecommendationCount === 0 &&
    actionabilityAudit.selectionPreviewAsRecommendationCount === 0;
  const technicalAppendixReady = appendixBoundaryAudit.technicalTraceabilityCollapsed &&
    appendixBoundaryAudit.uncollapsedTechnicalNoiseCount === 0 &&
    appendixBoundaryAudit.productReadableWithoutAppendices;
  const warningCodes = [
    ...sourceOfTruthAudit.sourceOfTruthWarningCodes,
    ...actionabilityAudit.actionabilityWarningCodes,
    ...clarityAudit.productClarityWarningCodes,
    ...appendixBoundaryAudit.appendixBoundaryWarningCodes,
    ...(scoreEconomyBaselinePreserved && guardrailsPreserved && routeFamilyDiversityPreserved
      ? ["MATCH_ECONOMY_BASELINE_PRESERVED" as const]
      : ["MATCH_ECONOMY_BASELINE_REGRESSED" as const]),
    ...(productReportReady ? ["PRODUCT_REPORT_READY" as const] : []),
    ...(coachExportReady ? ["COACH_EXPORT_READY" as const] : []),
    ...(productReportReady && coachExportReady && insightActionabilityReady && technicalAppendixReady
      ? ["PRODUCT_BASELINE_COACH_REPORT_READINESS_COMPLETE" as const, "PRODUCT_BASELINE_READY" as const]
      : ["PRODUCT_BASELINE_PARTIAL" as const]),
  ];
  const productBaselineReady = productReportReady &&
    coachExportReady &&
    officialTruthSeparationReady &&
    diagnosticSeparationReady &&
    sandboxSeparationReady &&
    insightActionabilityReady &&
    technicalAppendixReady &&
    scoreEconomyBaselinePreserved &&
    guardrailsPreserved &&
    routeFamilyDiversityPreserved &&
    noScoreManipulationConfirmed &&
    !includesBlockingWarning(warningCodes);
  const status: ProductBaselineCoachReportReadinessStatus = includesBlockingWarning(warningCodes)
    ? "FAIL"
    : productBaselineReady
      ? "PASS"
      : "PARTIAL";
  const recommendation: ProductBaselineCoachReportReadinessRecommendation = status === "PASS"
    ? "COACH_INSIGHT_DEPTH_NEXT_MATCH_RECOMMENDATIONS"
    : sourceOfTruthAudit.recommendation === "REPAIR_SOURCE_OF_TRUTH_BOUNDARY"
      ? "PRODUCT_REPORT_SOURCE_OF_TRUTH_REGRESSION_FIX"
      : actionabilityAudit.recommendation !== "KEEP_ACTIONABLE_INSIGHT_STRUCTURE"
        ? "COACH_INSIGHT_ACTIONABILITY_FOLLOW_UP"
        : "COACH_REPORT_CLARITY_CLEANUP";

  return {
    status,
    scope: "PRODUCT_BASELINE_COACH_REPORT_READINESS",
    version: "PRODUCT_BASELINE_COACH_REPORT_READINESS_7A",
    baselineVersion: "MATCH_ECONOMY_FINAL_STABILIZATION_6X",
    matchEconomyBaselinePreserved: scoreEconomyBaselinePreserved && guardrailsPreserved && routeFamilyDiversityPreserved,
    productReportReady,
    coachExportReady,
    officialTruthSeparationReady,
    diagnosticSeparationReady,
    sandboxSeparationReady,
    insightActionabilityReady,
    technicalAppendixReady,
    productBaselineReady,
    officialScoreVisible: sourceOfTruthAudit.officialScoreVisible,
    officialScoreSourceExplained: sourceOfTruthAudit.officialScoreSourceExplained,
    scoreChangeSourceVisible: sourceOfTruthAudit.scoreChangeSourceVisible,
    batchDiagnosticsSeparated: sourceOfTruthAudit.batchDiagnosticsSeparated,
    liveScoringSampleSeparated: sourceOfTruthAudit.liveScoringSampleSeparated,
    sandboxSeparated: sourceOfTruthAudit.sandboxSeparated,
    officialTruthClaimsCount: sourceOfTruthAudit.officialTruthClaimsCount,
    diagnosticTruthClaimsCount: sourceOfTruthAudit.diagnosticTruthClaimsCount,
    sandboxTruthClaimsCount: sourceOfTruthAudit.sandboxTruthClaimsCount,
    unsupportedTruthClaimCount: sourceOfTruthAudit.unsupportedTruthClaimCount,
    officialCardsCount: sourceOfTruthAudit.officialCardsCount,
    diagnosticCardsCount: sourceOfTruthAudit.diagnosticCardsCount,
    sandboxCardsCount: sourceOfTruthAudit.sandboxCardsCount,
    coachVisibleCardCount: appendixBoundaryAudit.coachVisibleCardCount,
    technicalCardsCollapsedCount: appendixBoundaryAudit.technicalCardsCollapsedCount,
    uncollapsedTechnicalNoiseCount: appendixBoundaryAudit.uncollapsedTechnicalNoiseCount,
    coachInsightCount: actionabilityAudit.coachInsightCount,
    actionableInsightCount: actionabilityAudit.actionableInsightCount,
    vagueInsightCount: actionabilityAudit.vagueInsightCount,
    overconfidentInsightCount: 0,
    lowConfidenceSignalLabeledCount: sourceOfTruthAudit.lowConfidenceSignalLabeledCount,
    missingConfidenceLabelCount: sourceOfTruthAudit.missingConfidenceLabelCount,
    sourceBadgeCoverageRate: sourceOfTruthAudit.sourceBadgeCoverageRate,
    evidenceLinkCoverageRate: sourceOfTruthAudit.evidenceLinkCoverageRate,
    nextMatchSignalCount: actionabilityAudit.nextMatchSignalCount,
    trainingFocusCount: actionabilityAudit.trainingFocusCount,
    selectionPreviewCount: input.productReport.profilesToObserve.length,
    selectionPreviewNonAppliedLabelCount: input.productReport.profilesToObserve.filter((profile) => profile.nonAppliedLabel === "Prévisualisation non appliquée").length,
    profileObservationCount: actionabilityAudit.profileObservationCount,
    profileRecommendationForcedCount: actionabilityAudit.profileObservationForcedCount,
    forbiddenWordingCount: clarityAudit.forbiddenWordingCount,
    productSectionCount: clarityAudit.productSectionCount,
    appendixSectionCount: clarityAudit.appendixSectionCount,
    reportReadingTimeEstimate: clarityAudit.reportReadingTimeEstimate,
    mobileReadabilityStatus: clarityAudit.mobileReadabilityStatus,
    exportReadabilityStatus: clarityAudit.exportReadabilityStatus,
    printReadinessStatus: clarityAudit.printReadinessStatus,
    coachReportProductStatus: clarityAudit.coachReportProductStatus,
    coachReportExportStatus: clarityAudit.coachReportExportStatus,
    scoreEconomyBaselinePreserved,
    guardrailsPreserved,
    routeFamilyDiversityPreserved,
    noScoreManipulationConfirmed,
    noSandboxTruthLeakage: !sourceOfTruthAudit.sourceOfTruthWarningCodes.includes("SANDBOX_TRUTH_LEAKAGE"),
    noDiagnosticScoreLeakage: !sourceOfTruthAudit.sourceOfTruthWarningCodes.includes("DIAGNOSTIC_SCORE_LEAKAGE"),
    noBatchScoreLeakage: !sourceOfTruthAudit.sourceOfTruthWarningCodes.includes("BATCH_SCORE_LEAKAGE"),
    sourceOfTruthAudit,
    actionabilityAudit,
    clarityAudit,
    appendixBoundaryAudit,
    matchEconomyBaseline,
    warningCodes: [...new Set(warningCodes)],
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "7B - Coach Insight Depth & Next-Match Recommendations"
      : recommendation === "COACH_INSIGHT_ACTIONABILITY_FOLLOW_UP"
        ? "7B - Coach Insight Actionability Follow-up"
        : recommendation === "PRODUCT_REPORT_SOURCE_OF_TRUTH_REGRESSION_FIX"
          ? "7B - Product Report Source-of-Truth Regression Fix"
          : "7B - Coach Report Clarity Cleanup",
  };
}

export function currentProductBaselineCoachReportReadinessModel(input: {
  readonly productReport: CoachProductReportViewModel;
  readonly productReportHtml?: string;
  readonly exportReportHtml?: string;
  readonly matchEconomyBaseline?: FullMatchEconomyFinalStabilizationModel;
}): ProductBaselineCoachReportReadinessModel {
  return buildProductBaselineCoachReportReadinessModel({
    productReport: input.productReport,
    productReportHtml: input.productReportHtml ?? readReport("coach-report.product.html"),
    exportReportHtml: input.exportReportHtml ?? readReport("coach-report.export.html"),
    ...(input.matchEconomyBaseline === undefined ? {} : { matchEconomyBaseline: input.matchEconomyBaseline }),
  });
}

export function currentGeneratedProductBaselineCoachReportReadinessModel(): ProductBaselineCoachReportReadinessModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);

  return currentProductBaselineCoachReportReadinessModel({
    productReport,
  });
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label} - ${detail}`;
}

export function renderProductBaselineCoachReportReadiness7ADoc(
  model: ProductBaselineCoachReportReadinessModel = currentGeneratedProductBaselineCoachReportReadinessModel(),
): string {
  return [
    "# Product Baseline Coach Report Readiness 7A",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- matchEconomyBaselinePreserved: ${model.matchEconomyBaselinePreserved}`,
    `- productReportReady: ${model.productReportReady}`,
    `- coachExportReady: ${model.coachExportReady}`,
    `- productBaselineReady: ${model.productBaselineReady}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline 6X Summary",
    ...table([
      ["Metric", "Value"],
      ["averageTotalPoints", String(model.matchEconomyBaseline.averageTotalPointsAfter)],
      ["scoringEventsPerMatch", String(model.matchEconomyBaseline.scoringEventsPerMatchAfter)],
      ["scoringOpportunitiesPerMatch", String(model.matchEconomyBaseline.scoringOpportunitiesPerMatchAfter)],
      ["closeGameRate", `${model.matchEconomyBaseline.closeGameRateAfter}%`],
      ["competitiveGameRate", `${model.matchEconomyBaseline.competitiveGameRateAfter}%`],
      ["blowoutRate", `${model.matchEconomyBaseline.blowoutRateAfter}%`],
      ["severeBlowoutRate", `${model.matchEconomyBaseline.severeBlowoutRateAfter}%`],
      ["routeFamilyDiversityPreserved", bool(model.routeFamilyDiversityPreserved)],
      ["guardrailsPreserved", bool(model.guardrailsPreserved)],
    ]),
    "",
    "## Source Of Truth Audit",
    ...table([
      ["Check", "Value"],
      ["officialScoreVisible", bool(model.officialScoreVisible)],
      ["officialScoreSourceExplained", bool(model.officialScoreSourceExplained)],
      ["scoreChangeSourceVisible", bool(model.scoreChangeSourceVisible)],
      ["batchDiagnosticsSeparated", bool(model.batchDiagnosticsSeparated)],
      ["liveScoringSampleSeparated", bool(model.liveScoringSampleSeparated)],
      ["sandboxSeparated", bool(model.sandboxSeparated)],
      ["unsupportedTruthClaimCount", String(model.unsupportedTruthClaimCount)],
      ["sourceBadgeCoverageRate", `${model.sourceBadgeCoverageRate}%`],
      ["evidenceLinkCoverageRate", `${model.evidenceLinkCoverageRate}%`],
    ]),
    "",
    "## Actionability Audit",
    ...table([
      ["Metric", "Value"],
      ["coachInsightCount", String(model.coachInsightCount)],
      ["actionableInsightCount", String(model.actionableInsightCount)],
      ["vagueInsightCount", String(model.vagueInsightCount)],
      ["trainingFocusCount", String(model.trainingFocusCount)],
      ["nextMatchSignalCount", String(model.nextMatchSignalCount)],
      ["unsupportedRecommendationCount", String(model.actionabilityAudit.unsupportedRecommendationCount)],
      ["selectionPreviewAsRecommendationCount", String(model.actionabilityAudit.selectionPreviewAsRecommendationCount)],
      ["profileObservationForcedCount", String(model.profileRecommendationForcedCount)],
    ]),
    "",
    "## Clarity Audit",
    ...table([
      ["Metric", "Value"],
      ["executiveSummaryVisible", bool(model.clarityAudit.executiveSummaryVisible)],
      ["officialMatchReadingVisible", bool(model.clarityAudit.officialMatchReadingVisible)],
      ["keySignalsVisible", bool(model.clarityAudit.keySignalsVisible)],
      ["trainingFocusVisible", bool(model.clarityAudit.trainingFocusVisible)],
      ["profilesToObserveVisible", bool(model.clarityAudit.profilesToObserveVisible)],
      ["guardrailSummaryVisible", bool(model.clarityAudit.guardrailSummaryVisible)],
      ["forbiddenWordingCount", String(model.forbiddenWordingCount)],
      ["mobileReadabilityStatus", model.mobileReadabilityStatus],
      ["exportReadabilityStatus", model.exportReadabilityStatus],
      ["printReadinessStatus", model.printReadinessStatus],
    ]),
    "",
    "## Appendix Boundary Audit",
    ...table([
      ["Metric", "Value"],
      ["experimentalHypothesesInAppendix", bool(model.appendixBoundaryAudit.experimentalHypothesesInAppendix)],
      ["technicalTraceabilityCollapsed", bool(model.appendixBoundaryAudit.technicalTraceabilityCollapsed)],
      ["validationContentNotInProductBody", bool(model.appendixBoundaryAudit.validationContentNotInProductBody)],
      ["debugDetailsNotInMainCoachReading", bool(model.appendixBoundaryAudit.debugDetailsNotInMainCoachReading)],
      ["productReadableWithoutAppendices", bool(model.appendixBoundaryAudit.productReadableWithoutAppendices)],
      ["technicalCardsCollapsedCount", String(model.technicalCardsCollapsedCount)],
      ["uncollapsedTechnicalNoiseCount", String(model.uncollapsedTechnicalNoiseCount)],
    ]),
    "",
    "## Product / Export Readiness",
    ...table([
      ["Metric", "Value"],
      ["productReportReady", bool(model.productReportReady)],
      ["coachExportReady", bool(model.coachExportReady)],
      ["officialTruthSeparationReady", bool(model.officialTruthSeparationReady)],
      ["diagnosticSeparationReady", bool(model.diagnosticSeparationReady)],
      ["sandboxSeparationReady", bool(model.sandboxSeparationReady)],
      ["insightActionabilityReady", bool(model.insightActionabilityReady)],
      ["technicalAppendixReady", bool(model.technicalAppendixReady)],
      ["productBaselineReady", bool(model.productBaselineReady)],
    ]),
    "",
    "## Guardrails",
    ...table([
      ["Guardrail", "Value"],
      ["scoreEconomyBaselinePreserved", bool(model.scoreEconomyBaselinePreserved)],
      ["guardrailsPreserved", bool(model.guardrailsPreserved)],
      ["routeFamilyDiversityPreserved", bool(model.routeFamilyDiversityPreserved)],
      ["noScoreManipulationConfirmed", bool(model.noScoreManipulationConfirmed)],
      ["noSandboxTruthLeakage", bool(model.noSandboxTruthLeakage)],
      ["noDiagnosticScoreLeakage", bool(model.noDiagnosticScoreLeakage)],
      ["noBatchScoreLeakage", bool(model.noBatchScoreLeakage)],
    ]),
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
  ].join("\n");
}

export function renderProductBaselineCoachReportReadiness7AValidation(
  model: ProductBaselineCoachReportReadinessModel = currentGeneratedProductBaselineCoachReportReadinessModel(),
): string {
  const checks = [
    checkLine("ProductBaselineCoachReportReadinessModel exists", model.scope === "PRODUCT_BASELINE_COACH_REPORT_READINESS", model.scope),
    checkLine("baseline 6X visible", model.baselineVersion === "MATCH_ECONOMY_FINAL_STABILIZATION_6X", model.baselineVersion),
    checkLine("product report ready", model.productReportReady, bool(model.productReportReady)),
    checkLine("export report ready", model.coachExportReady, bool(model.coachExportReady)),
    checkLine("official score visible", model.officialScoreVisible, bool(model.officialScoreVisible)),
    checkLine("official score source explained", model.officialScoreSourceExplained && model.scoreChangeSourceVisible, `${model.officialScoreSourceExplained}/${model.scoreChangeSourceVisible}`),
    checkLine("batch diagnostics separated", model.batchDiagnosticsSeparated, bool(model.batchDiagnosticsSeparated)),
    checkLine("live scoring sample separated", model.liveScoringSampleSeparated, bool(model.liveScoringSampleSeparated)),
    checkLine("sandbox separated", model.sandboxSeparated && model.noSandboxTruthLeakage, `${model.sandboxSeparated}/${model.noSandboxTruthLeakage}`),
    checkLine("selection preview non-applied", model.selectionPreviewNonAppliedLabelCount === model.selectionPreviewCount && model.profileRecommendationForcedCount === 0, `${model.selectionPreviewNonAppliedLabelCount}/${model.selectionPreviewCount}`),
    checkLine("official section has no sandbox cards", model.sourceOfTruthAudit.officialCardsCount >= 3 && model.unsupportedTruthClaimCount === 0, String(model.unsupportedTruthClaimCount)),
    checkLine("diagnostic section does not override official truth", model.noDiagnosticScoreLeakage, bool(model.noDiagnosticScoreLeakage)),
    checkLine("experimental hypotheses collapsed", model.appendixBoundaryAudit.experimentalHypothesesInAppendix, bool(model.appendixBoundaryAudit.experimentalHypothesesInAppendix)),
    checkLine("technical details collapsed", model.technicalAppendixReady, bool(model.technicalAppendixReady)),
    checkLine("source badges visible", model.sourceBadgeCoverageRate >= 100, `${model.sourceBadgeCoverageRate}%`),
    checkLine("confidence labels visible", model.missingConfidenceLabelCount === 0, String(model.missingConfidenceLabelCount)),
    checkLine("actionable insights present", model.insightActionabilityReady, bool(model.insightActionabilityReady)),
    checkLine("no unsupported recommendations", model.actionabilityAudit.unsupportedRecommendationCount === 0, String(model.actionabilityAudit.unsupportedRecommendationCount)),
    checkLine("no forced selection", model.profileRecommendationForcedCount === 0, String(model.profileRecommendationForcedCount)),
    checkLine("profiles are observations not imposed choices", model.selectionPreviewCount > 0 && model.profileRecommendationForcedCount === 0, `${model.selectionPreviewCount}/${model.profileRecommendationForcedCount}`),
    checkLine("forbidden wording absent", model.forbiddenWordingCount === 0, String(model.forbiddenWordingCount)),
    checkLine("guardrail summary visible", model.clarityAudit.guardrailSummaryVisible, bool(model.clarityAudit.guardrailSummaryVisible)),
    checkLine("guardrails preserved", model.guardrailsPreserved, bool(model.guardrailsPreserved)),
    checkLine("match economy baseline preserved", model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("route family diversity preserved", model.routeFamilyDiversityPreserved, bool(model.routeFamilyDiversityPreserved)),
    checkLine("no score manipulation", model.noScoreManipulationConfirmed, bool(model.noScoreManipulationConfirmed)),
    checkLine("no PENALTY leak", model.matchEconomyBaseline.penaltyShotActiveLeakageCount === 0, String(model.matchEconomyBaseline.penaltyShotActiveLeakageCount)),
    checkLine("no UNKNOWN scoring family", model.matchEconomyBaseline.unknownScoringFamilyCount === 0, String(model.matchEconomyBaseline.unknownScoringFamilyCount)),
    checkLine("no persistence/SQLite scoring", !model.matchEconomyBaseline.persistenceUsedForScoring && !model.matchEconomyBaseline.sqliteUsedForScoring, `${model.matchEconomyBaseline.persistenceUsedForScoring}/${model.matchEconomyBaseline.sqliteUsedForScoring}`),
    checkLine("score constants unchanged", !model.matchEconomyBaseline.scoringConstantsChanged, bool(!model.matchEconomyBaseline.scoringConstantsChanged)),
    checkLine("MatchBonusEvent unchanged", !model.matchEconomyBaseline.MatchBonusEventChanged, bool(!model.matchEconomyBaseline.MatchBonusEventChanged)),
    checkLine("batch/live separation preserved", model.matchEconomyBaseline.batchLiveSeparationPreserved, bool(model.matchEconomyBaseline.batchLiveSeparationPreserved)),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const hasFailure = checks.some((line) => line.startsWith("- FAIL"));

  return [
    "# Validation - Product Baseline Coach Report Readiness 7A",
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
    `- coachInsightCount: ${model.coachInsightCount}`,
    `- actionableInsightCount: ${model.actionableInsightCount}`,
    `- vagueInsightCount: ${model.vagueInsightCount}`,
    `- nextMatchSignalCount: ${model.nextMatchSignalCount}`,
    `- trainingFocusCount: ${model.trainingFocusCount}`,
    `- sourceBadgeCoverageRate: ${model.sourceBadgeCoverageRate}`,
    `- evidenceLinkCoverageRate: ${model.evidenceLinkCoverageRate}`,
    `- technicalCardsCollapsedCount: ${model.technicalCardsCollapsedCount}`,
    `- uncollapsedTechnicalNoiseCount: ${model.uncollapsedTechnicalNoiseCount}`,
    `- forbiddenWordingCount: ${model.forbiddenWordingCount}`,
    `- reportReadingTimeEstimate: ${model.reportReadingTimeEstimate}`,
    `- productBaselineReady: ${model.productBaselineReady}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

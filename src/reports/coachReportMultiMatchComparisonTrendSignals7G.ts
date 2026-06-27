import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { renderCoachActionPlanCardsTrainingFocusPackaging7CValidation } from "./coachActionPlanCardsTrainingFocusPackaging";
import { renderCoachInsightDepthNextMatchRecommendations7BValidation } from "./coachInsightDepthNextMatchRecommendations";
import { auditCoachReport7GDensityRegression, type CoachReport7GDensityRegressionAudit } from "./coachReport7GDensityRegressionAudit";
import { auditCoachReport7GBaselineMetadataRepair, type CoachReport7GBaselineMetadataRepairAudit } from "./coachReport7GBaselineMetadataRepairAudit";
import { auditCoachReportHistoryScope, type CoachReportHistoryScopeAudit } from "./coachReportHistoryScopeAudit";
import {
  buildCoachMultiMatchTrendSummary,
  buildCoachTrendSignalCardsFromProductReport,
  type CoachMultiMatchTrendSummary,
  type CoachTrendSignalCard,
} from "./coachReportMultiMatchTrendSignals";
import { auditCoachReportMultiMatchTrendSignals, type CoachReportMultiMatchTrendSignalsAudit } from "./coachReportMultiMatchTrendSignalsAudit";
import { auditCoachReportMultiMatchSourceOfTruth, type CoachReportMultiMatchSourceOfTruthAudit } from "./coachReportMultiMatchSourceOfTruthAudit";
import { renderCoachReportPhaseVisualsTacticalMapCards7EValidation } from "./coachReportPhaseVisualsTacticalMapCards";
import { renderCoachReportPremiumLayoutVisualHierarchy7DValidation } from "./coachReportPremiumLayoutVisualHierarchy";
import { auditCoachReportTemplatePlaceholderCleanup, type CoachReportTemplatePlaceholderCleanupAudit } from "./coachReportTemplatePlaceholderCleanupAudit";
import { auditCoachReportTrendPrudence, type CoachReportTrendPrudenceAudit } from "./coachReportTrendPrudenceAudit";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { currentFullMatchEconomyFinalStabilizationModel, type FullMatchEconomyFinalStabilizationModel } from "./fullMatchMatchEconomyFinalStabilization";
import { buildProductBaselineCoachReportReadinessModel, renderProductBaselineCoachReportReadiness7AValidation } from "./productBaselineCoachReportReadiness";
import {
  currentGeneratedProductReportScopeDensityWordingCleanup7FModel,
  type CoachReportScopeDensityWordingCleanupModel,
} from "./productReportScopeDensityWordingCleanup7F";
import {
  COACH_REPORT_MULTI_MATCH_TREND_BLOCKING_WARNINGS,
  type CoachReportMultiMatchComparisonTrendSignalsWarningCode,
} from "./coachReportMultiMatchComparisonTrendSignalsWarnings";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

export type CoachReportMultiMatchComparisonTrendSignalsStatus = "PASS" | "PARTIAL" | "FAIL";
export type CoachReportMultiMatchComparisonTrendSignalsRecommendation =
  | "KEEP_MULTI_MATCH_TRENDS_PRUDENT"
  | "REPAIR_BASELINE_METADATA"
  | "REMOVE_TEMPLATE_PLACEHOLDERS"
  | "REDUCE_TREND_SIGNAL_DENSITY"
  | "FIX_HISTORY_SCOPE_BOUNDARY"
  | "FIX_MULTI_MATCH_SOURCE_OF_TRUTH";

export interface CoachReportMultiMatchComparisonTrendSignalsModel {
  readonly status: CoachReportMultiMatchComparisonTrendSignalsStatus;
  readonly scope: "COACH_REPORT_MULTI_MATCH_COMPARISON_TREND_SIGNALS";
  readonly version: "COACH_REPORT_MULTI_MATCH_COMPARISON_TREND_SIGNALS_7G";
  readonly baselineVersion: "PRODUCT_REPORT_SCOPE_DENSITY_WORDING_CLEANUP_7F";
  readonly matchEconomyBaselinePreserved: boolean;
  readonly productReportReady: boolean;
  readonly coachExportReady: boolean;
  readonly reportScopeCleanPreserved: boolean;
  readonly exportScopeCleanPreserved: boolean;
  readonly mainBodyCoachOnlyPreserved: boolean;
  readonly tacticalMapCardsPreserved: boolean;
  readonly trendSignalsReady: boolean;
  readonly multiMatchComparisonReady: boolean;
  readonly trendPrudenceReady: boolean;
  readonly historyScopeClean: boolean;
  readonly baselineMetadataConsistent: boolean;
  readonly unresolvedTemplatePlaceholdersRemoved: boolean;
  readonly visualDensityControlled: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly baseline7F: CoachReportScopeDensityWordingCleanupModel;
  readonly matchEconomyBaseline: FullMatchEconomyFinalStabilizationModel;
  readonly trendSummary: CoachMultiMatchTrendSummary;
  readonly trendCards: readonly CoachTrendSignalCard[];
  readonly baselineMetadataAudit: CoachReport7GBaselineMetadataRepairAudit;
  readonly placeholderCleanupAudit: CoachReportTemplatePlaceholderCleanupAudit;
  readonly trendSignalsAudit: CoachReportMultiMatchTrendSignalsAudit;
  readonly trendPrudenceAudit: CoachReportTrendPrudenceAudit;
  readonly historyScopeAudit: CoachReportHistoryScopeAudit;
  readonly densityRegressionAudit: CoachReport7GDensityRegressionAudit;
  readonly sourceOfTruthAudit: CoachReportMultiMatchSourceOfTruthAudit;
  readonly warningCodes: readonly CoachReportMultiMatchComparisonTrendSignalsWarningCode[];
  readonly recommendation: CoachReportMultiMatchComparisonTrendSignalsRecommendation;
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

function hasBlockingWarnings(warnings: readonly CoachReportMultiMatchComparisonTrendSignalsWarningCode[]): boolean {
  return warnings.some((warning) => COACH_REPORT_MULTI_MATCH_TREND_BLOCKING_WARNINGS.includes(warning));
}

function economyGuardrailsPreserved(model: FullMatchEconomyFinalStabilizationModel): boolean {
  return model.scoreFromScoreChangeAllRuns &&
    model.officialPathConnectedAllRuns &&
    model.batchLiveSeparationPreserved &&
    !model.persistenceUsedForScoring &&
    !model.sqliteUsedForScoring &&
    !model.scoringConstantsChanged &&
    !model.scoreCapApplied &&
    !model.postHocRewriteApplied &&
    !model.scoringEventsDeleted &&
    !model.forcedOpponentScoreApplied &&
    !model.forcedTrailingTeamScoreApplied &&
    !model.rubberBandingApplied &&
    !model.comebackForced &&
    !model.trailingTeamOpportunityForced &&
    !model.trailingTeamScoreChangeInjected &&
    !model.trailingTeamScoringEventInjected &&
    !model.MatchBonusEventChanged &&
    model.noRollbackToShotOnly;
}

export function buildCoachReportMultiMatchComparisonTrendSignalsModel(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly baseline7F: CoachReportScopeDensityWordingCleanupModel;
  readonly matchEconomyBaseline: FullMatchEconomyFinalStabilizationModel;
  readonly trendCards: readonly CoachTrendSignalCard[];
  readonly trendSummary: CoachMultiMatchTrendSummary;
  readonly baseline7AValidationText: string;
  readonly baseline7BValidationText: string;
  readonly baseline7CValidationText: string;
  readonly baseline7DValidationText: string;
  readonly baseline7EValidationText: string;
}): CoachReportMultiMatchComparisonTrendSignalsModel {
  const baselineMetadataAudit = auditCoachReport7GBaselineMetadataRepair({
    baseline6XStatus: input.matchEconomyBaseline.status,
    baseline7AValidationText: input.baseline7AValidationText,
    baseline7BValidationText: input.baseline7BValidationText,
    baseline7CValidationText: input.baseline7CValidationText,
    baseline7DValidationText: input.baseline7DValidationText,
    baseline7EStatus: input.baseline7EValidationText.includes("Status: PASS") ? "PASS" : input.baseline7F.baseline7E.status === "PASS" ? "PASS" : "CHECK_EXPLAINED",
    baseline7FStatus: input.baseline7F.status,
    passReportText: input.baseline7F.status === "PASS" ? input.baseline7AValidationText : "",
  });
  const placeholderCleanupAudit = auditCoachReportTemplatePlaceholderCleanup({
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    beforeCount: Math.max(1, input.baseline7F.wordingCleanupAudit.unresolvedTemplatePlaceholderCount),
  });
  const trendSignalsAudit = auditCoachReportMultiMatchTrendSignals({
    trendCards: input.trendCards,
    productReportHtml: input.productReportHtml,
  });
  const trendPrudenceAudit = auditCoachReportTrendPrudence(input);
  const historyScopeAudit = auditCoachReportHistoryScope(input);
  const densityRegressionAudit = auditCoachReport7GDensityRegression({
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtml,
    visualDensityScore7F: input.baseline7F.densityCleanupAudit.visualDensityScoreAfter,
    mainBodySectionCount7F: input.baseline7F.densityCleanupAudit.mainBodySectionCountAfter,
    exportSectionCount7F: input.baseline7F.densityCleanupAudit.exportSectionCountAfter,
    coachReadTimeSeconds7F: input.baseline7F.densityCleanupAudit.coachReadTimeSecondsAfter,
    exportReadTimeSeconds7F: input.baseline7F.densityCleanupAudit.exportReadTimeSecondsAfter,
  });
  const sourceOfTruthAudit = auditCoachReportMultiMatchSourceOfTruth(input);
  const matchEconomyBaselinePreserved = input.baseline7F.matchEconomyBaselinePreserved &&
    input.matchEconomyBaseline.status === "PASS" &&
    input.matchEconomyBaseline.routeFamilyDiversityPreserved;
  const productReportReady = input.productReportHtml.includes("id=\"express-read\"") &&
    input.productReportHtml.includes("id=\"coach-action-plan\"") &&
    input.productReportHtml.includes("id=\"tactical-map-cards\"") &&
    input.productReportHtml.includes("id=\"multi-match-trend-signals\"");
  const coachExportReady = input.exportReportHtml.includes("id=\"cover\"") &&
    input.exportReportHtml.includes("id=\"coach-action-plan\"") &&
    input.exportReportHtml.includes("id=\"tactical-map-cards\"") &&
    input.exportReportHtml.includes("id=\"multi-match-trend-signals\"");
  const reportScopeCleanPreserved = historyScopeAudit.historyScopeClean && sourceOfTruthAudit.databaseNotProductTruthInCoachReport;
  const exportScopeCleanPreserved = input.baseline7F.exportScopeClean && !input.exportReportHtml.includes("adapter spike");
  const mainBodyCoachOnlyPreserved = historyScopeAudit.historyTechnicalMainBodySectionCount === 0;
  const tacticalMapCardsPreserved = input.baseline7F.tacticalMapCardsPreserved &&
    input.productReportHtml.includes("id=\"tactical-map-cards\"") &&
    input.exportReportHtml.includes("id=\"tactical-map-cards\"");
  const trendSignalsReady = trendSignalsAudit.trendSignalsWarningCodes.includes("TREND_SIGNALS_READY");
  const multiMatchComparisonReady = trendSignalsAudit.trendSignalsWarningCodes.includes("MULTI_MATCH_COMPARISON_READY");
  const trendPrudenceReady = trendPrudenceAudit.trendPrudenceWarningCodes.includes("TREND_PRUDENCE_READY");
  const unresolvedTemplatePlaceholdersRemoved = placeholderCleanupAudit.unresolvedTemplatePlaceholderCountAfter === 0;
  const sourceOfTruthSeparationPreserved = sourceOfTruthAudit.sourceOfTruthWarningCodes.includes("SOURCE_OF_TRUTH_PRESERVED");
  const productBaselineReady = baselineMetadataAudit.baselineMetadataConsistent &&
    (baselineMetadataAudit.baseline7AReportedStatus === "PASS" || baselineMetadataAudit.baseline7AReportedStatus.endsWith("_EXPLAINED"));
  const warningCodes: CoachReportMultiMatchComparisonTrendSignalsWarningCode[] = [
    ...baselineMetadataAudit.baselineMetadataRepairWarningCodes,
    ...placeholderCleanupAudit.placeholderCleanupWarningCodes,
    ...trendSignalsAudit.trendSignalsWarningCodes,
    ...trendPrudenceAudit.trendPrudenceWarningCodes,
    ...historyScopeAudit.historyScopeWarningCodes,
    ...densityRegressionAudit.densityRegressionWarningCodes,
    ...sourceOfTruthAudit.sourceOfTruthWarningCodes,
    ...(matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED" as const] : ["MATCH_ECONOMY_BASELINE_REGRESSED" as const]),
    ...(reportScopeCleanPreserved ? ["REPORT_SCOPE_CLEAN_PRESERVED" as const] : []),
    ...(exportScopeCleanPreserved ? ["EXPORT_SCOPE_CLEAN_PRESERVED" as const] : []),
    ...(mainBodyCoachOnlyPreserved ? ["MAIN_BODY_COACH_ONLY_PRESERVED" as const] : []),
    ...(tacticalMapCardsPreserved ? ["TACTICAL_MAP_CARDS_PRESERVED" as const] : ["TACTICAL_MAP_CARDS_REGRESSED" as const]),
    ...(productReportReady ? ["PRODUCT_REPORT_READY" as const] : []),
    ...(coachExportReady ? ["COACH_EXPORT_READY" as const] : []),
    ...(productBaselineReady ? ["PRODUCT_BASELINE_READY" as const] : []),
  ];
  const clean = matchEconomyBaselinePreserved &&
    productReportReady &&
    coachExportReady &&
    reportScopeCleanPreserved &&
    exportScopeCleanPreserved &&
    mainBodyCoachOnlyPreserved &&
    tacticalMapCardsPreserved &&
    trendSignalsReady &&
    multiMatchComparisonReady &&
    trendPrudenceReady &&
    historyScopeAudit.historyScopeClean &&
    baselineMetadataAudit.baselineMetadataConsistent &&
    unresolvedTemplatePlaceholdersRemoved &&
    densityRegressionAudit.densityRegressionWarningCodes.includes("VISUAL_DENSITY_CONTROLLED") &&
    sourceOfTruthSeparationPreserved &&
    productBaselineReady &&
    !hasBlockingWarnings(warningCodes);
  const status: CoachReportMultiMatchComparisonTrendSignalsStatus = clean ? "PASS" : hasBlockingWarnings(warningCodes) ? "FAIL" : "PARTIAL";
  const recommendation: CoachReportMultiMatchComparisonTrendSignalsRecommendation = clean
    ? "KEEP_MULTI_MATCH_TRENDS_PRUDENT"
    : !baselineMetadataAudit.baselineMetadataConsistent
      ? "REPAIR_BASELINE_METADATA"
      : !unresolvedTemplatePlaceholdersRemoved
        ? "REMOVE_TEMPLATE_PLACEHOLDERS"
        : !historyScopeAudit.historyScopeClean
          ? "FIX_HISTORY_SCOPE_BOUNDARY"
          : !sourceOfTruthSeparationPreserved
            ? "FIX_MULTI_MATCH_SOURCE_OF_TRUTH"
            : "REDUCE_TREND_SIGNAL_DENSITY";

  return {
    status,
    scope: "COACH_REPORT_MULTI_MATCH_COMPARISON_TREND_SIGNALS",
    version: "COACH_REPORT_MULTI_MATCH_COMPARISON_TREND_SIGNALS_7G",
    baselineVersion: "PRODUCT_REPORT_SCOPE_DENSITY_WORDING_CLEANUP_7F",
    matchEconomyBaselinePreserved,
    productReportReady,
    coachExportReady,
    reportScopeCleanPreserved,
    exportScopeCleanPreserved,
    mainBodyCoachOnlyPreserved,
    tacticalMapCardsPreserved,
    trendSignalsReady,
    multiMatchComparisonReady,
    trendPrudenceReady,
    historyScopeClean: historyScopeAudit.historyScopeClean,
    baselineMetadataConsistent: baselineMetadataAudit.baselineMetadataConsistent,
    unresolvedTemplatePlaceholdersRemoved,
    visualDensityControlled: densityRegressionAudit.densityRegressionWarningCodes.includes("VISUAL_DENSITY_CONTROLLED"),
    sourceOfTruthSeparationPreserved,
    productBaselineReady,
    baseline7F: input.baseline7F,
    matchEconomyBaseline: input.matchEconomyBaseline,
    trendSummary: input.trendSummary,
    trendCards: input.trendCards,
    baselineMetadataAudit,
    placeholderCleanupAudit,
    trendSignalsAudit,
    trendPrudenceAudit,
    historyScopeAudit,
    densityRegressionAudit,
    sourceOfTruthAudit,
    warningCodes: [...new Set([
      ...(status === "PASS" ? ["COACH_REPORT_MULTI_MATCH_COMPARISON_TREND_SIGNALS_COMPLETE" as const] : status === "PARTIAL" ? ["COACH_REPORT_MULTI_MATCH_TRENDS_PARTIAL" as const] : ["COACH_REPORT_MULTI_MATCH_TRENDS_FAIL" as const]),
      ...warningCodes,
    ])],
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "7H - Coach Report Team Style Memory & Season Narrative"
      : recommendation === "REPAIR_BASELINE_METADATA"
        ? "7H - Baseline Metadata Repair Follow-up"
        : recommendation === "REDUCE_TREND_SIGNAL_DENSITY"
          ? "7H - Trend Signal Density Cleanup"
          : recommendation === "FIX_HISTORY_SCOPE_BOUNDARY"
            ? "7H - History Scope Boundary Follow-up"
            : "7H - Multi-Match Source-of-Truth Regression Fix",
  };
}

export function currentGeneratedCoachReportMultiMatchComparisonTrendSignals7GModel(): CoachReportMultiMatchComparisonTrendSignalsModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);
  const matchEconomyBaseline = currentFullMatchEconomyFinalStabilizationModel();
  const baseline7F = currentGeneratedProductReportScopeDensityWordingCleanup7FModel();
  const productReportHtml = renderCoachProductReport(productReport);
  const baseline7AExportHtml = renderCoachReportExportHtml({
    productReportHtml,
    fullMatchEconomyFinalStabilization: matchEconomyBaseline,
  });
  const baseline7A = buildProductBaselineCoachReportReadinessModel({
    productReport,
    productReportHtml,
    exportReportHtml: baseline7AExportHtml,
    matchEconomyBaseline,
  });
  const exportReportHtml = renderCoachReportExportHtml({
    productReportHtml,
    productBaselineCoachReportReadiness: baseline7A,
    fullMatchEconomyFinalStabilization: matchEconomyBaseline,
  });
  const trendCards = buildCoachTrendSignalCardsFromProductReport(productReport);
  const trendSummary = buildCoachMultiMatchTrendSummary(trendCards);

  return buildCoachReportMultiMatchComparisonTrendSignalsModel({
    productReportHtml,
    exportReportHtml,
    baseline7F,
    matchEconomyBaseline,
    trendCards,
    trendSummary,
    baseline7AValidationText: renderProductBaselineCoachReportReadiness7AValidation(baseline7A),
    baseline7BValidationText: renderCoachInsightDepthNextMatchRecommendations7BValidation(),
    baseline7CValidationText: renderCoachActionPlanCardsTrainingFocusPackaging7CValidation(),
    baseline7DValidationText: renderCoachReportPremiumLayoutVisualHierarchy7DValidation(),
    baseline7EValidationText: renderCoachReportPhaseVisualsTacticalMapCards7EValidation(baseline7F.baseline7E),
  });
}

export function renderCoachReportMultiMatchComparisonTrendSignals7GDoc(
  model: CoachReportMultiMatchComparisonTrendSignalsModel = currentGeneratedCoachReportMultiMatchComparisonTrendSignals7GModel(),
): string {
  return [
    "# Coach Report Multi-Match Comparison & Trend Signals 7G",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- productReportReady: ${bool(model.productReportReady)}`,
    `- coachExportReady: ${bool(model.coachExportReady)}`,
    `- trendSignalsReady: ${bool(model.trendSignalsReady)}`,
    `- historyScopeClean: ${bool(model.historyScopeClean)}`,
    `- baselineMetadataConsistent: ${bool(model.baselineMetadataConsistent)}`,
    `- unresolvedTemplatePlaceholdersRemoved: ${bool(model.unresolvedTemplatePlaceholdersRemoved)}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline Preservation",
    ...table([
      ["Baseline", "Status"],
      ["7F scope/density/wording", model.baseline7F.status],
      ["7E tactical map cards", model.baselineMetadataAudit.baseline7EStatus],
      ["7D premium layout", model.baselineMetadataAudit.baseline7DStatus],
      ["7C action plan packaging", model.baselineMetadataAudit.baseline7CStatus],
      ["7B insight depth", model.baselineMetadataAudit.baseline7BStatus],
      ["7A product baseline", model.baselineMetadataAudit.baseline7AReportedStatus],
      ["6X match economy", model.baselineMetadataAudit.baseline6XStatus],
    ]),
    "",
    "## Baseline 7A Metadata Repair",
    ...table([
      ["Metric", "Value"],
      ["baseline7AReportedStatus", model.baselineMetadataAudit.baseline7AReportedStatus],
      ["baseline7AValidationStatus", model.baselineMetadataAudit.baseline7AValidationStatus],
      ["baseline7AFailCount", String(model.baselineMetadataAudit.baseline7AFailCount)],
      ["baseline7ACheckCount", String(model.baselineMetadataAudit.baseline7ACheckCount)],
      ["baselineStatusMismatchCount", String(model.baselineMetadataAudit.baselineStatusMismatchCount)],
      ["unexplainedFailInPassReportCount", String(model.baselineMetadataAudit.unexplainedFailInPassReportCount)],
      ["baselineMetadataConsistent", bool(model.baselineMetadataAudit.baselineMetadataConsistent)],
    ]),
    "",
    "## Placeholder Cleanup Audit",
    ...table([
      ["Metric", "Value"],
      ["unresolvedTemplatePlaceholderCountBefore", String(model.placeholderCleanupAudit.unresolvedTemplatePlaceholderCountBefore)],
      ["unresolvedTemplatePlaceholderCountAfter", String(model.placeholderCleanupAudit.unresolvedTemplatePlaceholderCountAfter)],
      ["visiblePlaceholderCount", String(model.placeholderCleanupAudit.visiblePlaceholderCount)],
      ["mainBodyPlaceholderCount", String(model.placeholderCleanupAudit.mainBodyPlaceholderCount)],
      ["exportPlaceholderCount", String(model.placeholderCleanupAudit.exportPlaceholderCount)],
      ["technicalAppendixPlaceholderCount", String(model.placeholderCleanupAudit.technicalAppendixPlaceholderCount)],
    ]),
    "",
    "## Trend Signals",
    ...table([
      ["Metric", "Value"],
      ["trendSignalCardCount", String(model.trendSignalsAudit.trendSignalCardCount)],
      ["repeatedTrendSignalCount", String(model.trendSignalsAudit.repeatedTrendSignalCount)],
      ["visibleOnceTrendSignalCount", String(model.trendSignalsAudit.visibleOnceTrendSignalCount)],
      ["unstableTrendSignalCount", String(model.trendSignalsAudit.unstableTrendSignalCount)],
      ["insufficientDataTrendSignalCount", String(model.trendSignalsAudit.insufficientDataTrendSignalCount)],
      ["officialTrendSignalCount", String(model.trendSignalsAudit.officialTrendSignalCount)],
      ["sandboxTrendInOfficialBodyCount", String(model.trendSignalsAudit.sandboxTrendInOfficialBodyCount)],
      ["forcedSelectionTrendCount", String(model.trendSignalsAudit.forcedSelectionTrendCount)],
      ["forcedTacticalPlanTrendCount", String(model.trendSignalsAudit.forcedTacticalPlanTrendCount)],
      ["overconfidentTrendClaimCount", String(model.trendSignalsAudit.overconfidentTrendClaimCount)],
    ]),
    "",
    "## Trend Cards",
    ...table([
      ["Trend", "Type", "Source", "Confidence", "Samples", "Next check", "Limitation"],
      ...model.trendCards.slice(0, 3).map((card) => [
        card.title,
        card.trendType,
        card.sourceType,
        card.confidence,
        `${card.presentCount}/${card.sampleCount}`,
        card.nextMatchCheck,
        card.limitationNote,
      ]),
    ]),
    "",
    "## Trend Prudence Audit",
    ...table([
      ["Metric", "Value"],
      ["localSampleLanguagePresent", bool(model.trendPrudenceAudit.localSampleLanguagePresent)],
      ["globalProofClaimCount", String(model.trendPrudenceAudit.globalProofClaimCount)],
      ["definitiveTrendClaimCount", String(model.trendPrudenceAudit.definitiveTrendClaimCount)],
      ["trendAsInstructionCount", String(model.trendPrudenceAudit.trendAsInstructionCount)],
      ["trendAsSelectionCount", String(model.trendPrudenceAudit.trendAsSelectionCount)],
      ["trendAsOfficialScoreTruthCount", String(model.trendPrudenceAudit.trendAsOfficialScoreTruthCount)],
      ["confidenceLabelsPresent", bool(model.trendPrudenceAudit.confidenceLabelsPresent)],
      ["limitationNotesPresent", bool(model.trendPrudenceAudit.limitationNotesPresent)],
      ["nextMatchChecksPresent", bool(model.trendPrudenceAudit.nextMatchChecksPresent)],
    ]),
    "",
    "## History Scope Audit",
    ...table([
      ["Metric", "Value"],
      ["historyMainBodySectionCount", String(model.historyScopeAudit.historyMainBodySectionCount)],
      ["historyTechnicalMainBodySectionCount", String(model.historyScopeAudit.historyTechnicalMainBodySectionCount)],
      ["persistenceMainBodySectionCount", String(model.historyScopeAudit.persistenceMainBodySectionCount)],
      ["databaseMainBodySectionCount", String(model.historyScopeAudit.databaseMainBodySectionCount)],
      ["calibrationMainBodySectionCount", String(model.historyScopeAudit.calibrationMainBodySectionCount)],
      ["multiMatchCoachSectionCount", String(model.historyScopeAudit.multiMatchCoachSectionCount)],
      ["recordDumpVisibleCount", String(model.historyScopeAudit.recordDumpVisibleCount)],
      ["historyScopeClean", bool(model.historyScopeAudit.historyScopeClean)],
    ]),
    "",
    "## Density Regression Audit",
    ...table([
      ["Metric", "Value"],
      ["visualDensityScore7F", String(model.densityRegressionAudit.visualDensityScore7F)],
      ["visualDensityScore7G", String(model.densityRegressionAudit.visualDensityScore7G)],
      ["visualDensityDelta", String(model.densityRegressionAudit.visualDensityDelta)],
      ["mainBodySectionCount7F", String(model.densityRegressionAudit.mainBodySectionCount7F)],
      ["mainBodySectionCount7G", String(model.densityRegressionAudit.mainBodySectionCount7G)],
      ["exportSectionCount7F", String(model.densityRegressionAudit.exportSectionCount7F)],
      ["exportSectionCount7G", String(model.densityRegressionAudit.exportSectionCount7G)],
      ["trendSectionAddedCount", String(model.densityRegressionAudit.trendSectionAddedCount)],
      ["coachReadTimeSeconds7G", String(model.densityRegressionAudit.coachReadTimeSeconds7G)],
      ["exportReadTimeSeconds7G", String(model.densityRegressionAudit.exportReadTimeSeconds7G)],
    ]),
    "",
    "## Source-of-Truth Multi-Match Audit",
    ...table([
      ["Metric", "Value"],
      ["currentMatchOfficialScoreStillAboveFold", bool(model.sourceOfTruthAudit.currentMatchOfficialScoreStillAboveFold)],
      ["currentMatchSourceOfTruthStillAboveFold", bool(model.sourceOfTruthAudit.currentMatchSourceOfTruthStillAboveFold)],
      ["trendsSeparatedFromCurrentMatchTruth", bool(model.sourceOfTruthAudit.trendsSeparatedFromCurrentMatchTruth)],
      ["historyNotOfficialScoreTruth", bool(model.sourceOfTruthAudit.historyNotOfficialScoreTruth)],
      ["historyNotSelectionTruth", bool(model.sourceOfTruthAudit.historyNotSelectionTruth)],
      ["persistenceNotScoringTruth", bool(model.sourceOfTruthAudit.persistenceNotScoringTruth)],
      ["sqliteNotScoringTruth", bool(model.sourceOfTruthAudit.sqliteNotScoringTruth)],
      ["trendTruthLeakageCount", String(model.sourceOfTruthAudit.trendTruthLeakageCount)],
      ["unsupportedTruthClaimCount", String(model.sourceOfTruthAudit.unsupportedTruthClaimCount)],
    ]),
    "",
    "## Product / Export Readiness",
    ...table([
      ["Metric", "Value"],
      ["productReportReady", bool(model.productReportReady)],
      ["coachExportReady", bool(model.coachExportReady)],
      ["reportScopeCleanPreserved", bool(model.reportScopeCleanPreserved)],
      ["exportScopeCleanPreserved", bool(model.exportScopeCleanPreserved)],
      ["mainBodyCoachOnlyPreserved", bool(model.mainBodyCoachOnlyPreserved)],
      ["tacticalMapCardsPreserved", bool(model.tacticalMapCardsPreserved)],
      ["visualDensityControlled", bool(model.visualDensityControlled)],
      ["sourceOfTruthSeparationPreserved", bool(model.sourceOfTruthSeparationPreserved)],
    ]),
    "",
    "## Match Economy Preservation",
    ...table([
      ["Metric", "Value"],
      ["status", model.matchEconomyBaseline.status],
      ["routeFamilyDiversityPreserved", bool(model.matchEconomyBaseline.routeFamilyDiversityPreserved)],
      ["guardrailsPreserved", bool(economyGuardrailsPreserved(model.matchEconomyBaseline))],
      ["matchEconomyBaselinePreserved", bool(model.matchEconomyBaselinePreserved)],
    ]),
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
    "## Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- next: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function renderCoachReportMultiMatchComparisonTrendSignals7GValidation(
  model: CoachReportMultiMatchComparisonTrendSignalsModel = currentGeneratedCoachReportMultiMatchComparisonTrendSignals7GModel(),
): string {
  const exportReadTimeLimit = Math.max(900, model.densityRegressionAudit.exportReadTimeSeconds7F + 180);
  const checks = [
    checkLine("CoachReportMultiMatchComparisonTrendSignalsModel exists", model.scope === "COACH_REPORT_MULTI_MATCH_COMPARISON_TREND_SIGNALS", model.version),
    checkLine("baseline 7F visible", model.baselineVersion === "PRODUCT_REPORT_SCOPE_DENSITY_WORDING_CLEANUP_7F", model.baseline7F.status),
    checkLine("baseline 7E preserved or explained", model.baselineMetadataAudit.baseline7EStatus === "PASS" || model.baselineMetadataAudit.baseline7EStatus.endsWith("_EXPLAINED"), model.baselineMetadataAudit.baseline7EStatus),
    checkLine("baseline 7D preserved", model.baselineMetadataAudit.baseline7DStatus === "PASS", model.baselineMetadataAudit.baseline7DStatus),
    checkLine("baseline 7C preserved", model.baselineMetadataAudit.baseline7CStatus === "PASS", model.baselineMetadataAudit.baseline7CStatus),
    checkLine("baseline 7B preserved", model.baselineMetadataAudit.baseline7BStatus === "PASS", model.baselineMetadataAudit.baseline7BStatus),
    checkLine("baseline 7A repaired or explained", model.baselineMetadataAudit.baseline7AReportedStatus === "PASS" || model.baselineMetadataAudit.baseline7AReportedStatus.endsWith("_EXPLAINED"), model.baselineMetadataAudit.baseline7AReportedStatus),
    checkLine("baseline 6X preserved", model.matchEconomyBaselinePreserved, model.matchEconomyBaseline.status),
    checkLine("no unexplained FAIL in PASS report", model.baselineMetadataAudit.unexplainedFailInPassReportCount === 0, String(model.baselineMetadataAudit.unexplainedFailInPassReportCount)),
    checkLine("unresolvedTemplatePlaceholderCount = 0", model.placeholderCleanupAudit.unresolvedTemplatePlaceholderCountAfter === 0, String(model.placeholderCleanupAudit.unresolvedTemplatePlaceholderCountAfter)),
    checkLine("product report ready", model.productReportReady, bool(model.productReportReady)),
    checkLine("export report ready", model.coachExportReady, bool(model.coachExportReady)),
    checkLine("report scope clean preserved", model.reportScopeCleanPreserved, bool(model.reportScopeCleanPreserved)),
    checkLine("export scope clean preserved", model.exportScopeCleanPreserved, bool(model.exportScopeCleanPreserved)),
    checkLine("main body coach-only preserved", model.mainBodyCoachOnlyPreserved, bool(model.mainBodyCoachOnlyPreserved)),
    checkLine("tactical map cards preserved", model.tacticalMapCardsPreserved, bool(model.tacticalMapCardsPreserved)),
    checkLine("express read still visible", model.densityRegressionAudit.expressReadStillVisible, bool(model.densityRegressionAudit.expressReadStillVisible)),
    checkLine("official score above fold", model.sourceOfTruthAudit.currentMatchOfficialScoreStillAboveFold, bool(model.sourceOfTruthAudit.currentMatchOfficialScoreStillAboveFold)),
    checkLine("source of truth above fold", model.sourceOfTruthAudit.currentMatchSourceOfTruthStillAboveFold, bool(model.sourceOfTruthAudit.currentMatchSourceOfTruthStillAboveFold)),
    checkLine("action plan still prominent", model.densityRegressionAudit.actionPlanStillAboveFold, bool(model.densityRegressionAudit.actionPlanStillAboveFold)),
    checkLine("trends section visible", model.trendSignalsAudit.trendSignalCardCount >= 1, String(model.trendSignalsAudit.trendSignalCardCount)),
    checkLine("1 to 3 trend cards maximum", model.trendSignalsAudit.trendSignalCardCount >= 1 && model.trendSignalsAudit.trendSignalCardCount <= 3, String(model.trendSignalsAudit.trendSignalCardCount)),
    checkLine("trend cards have source badges", model.trendSignalsAudit.officialTrendSignalCount >= 1, String(model.trendSignalsAudit.officialTrendSignalCount)),
    checkLine("trend cards have confidence labels", model.trendPrudenceAudit.confidenceLabelsPresent, bool(model.trendPrudenceAudit.confidenceLabelsPresent)),
    checkLine("trend cards have sample/presence count or insufficient-data state", model.trendSignalsAudit.trendSignalWithSampleCount === model.trendCards.length, String(model.trendSignalsAudit.trendSignalWithSampleCount)),
    checkLine("trend cards have next-match checks", model.trendSignalsAudit.trendSignalWithNextMatchCheckCount === model.trendCards.length, String(model.trendSignalsAudit.trendSignalWithNextMatchCheckCount)),
    checkLine("trend cards have limitation notes", model.trendSignalsAudit.trendSignalWithLimitationCount === model.trendCards.length, String(model.trendSignalsAudit.trendSignalWithLimitationCount)),
    checkLine("trend cards do not overclaim", model.trendSignalsAudit.overconfidentTrendClaimCount === 0 && model.trendPrudenceAudit.globalProofClaimCount === 0, "0"),
    checkLine("trend cards do not force selection", model.trendSignalsAudit.forcedSelectionTrendCount === 0, String(model.trendSignalsAudit.forcedSelectionTrendCount)),
    checkLine("trend cards do not force tactical plan", model.trendSignalsAudit.forcedTacticalPlanTrendCount === 0, String(model.trendSignalsAudit.forcedTacticalPlanTrendCount)),
    checkLine("no sandbox trend in official body", model.trendSignalsAudit.sandboxTrendInOfficialBodyCount === 0, String(model.trendSignalsAudit.sandboxTrendInOfficialBodyCount)),
    checkLine("history not used as official truth", model.sourceOfTruthAudit.historyNotOfficialScoreTruth, bool(model.sourceOfTruthAudit.historyNotOfficialScoreTruth)),
    checkLine("database/persistence not in main body", model.historyScopeAudit.databaseMainBodySectionCount === 0 && model.historyScopeAudit.persistenceMainBodySectionCount === 0, `${model.historyScopeAudit.databaseMainBodySectionCount}/${model.historyScopeAudit.persistenceMainBodySectionCount}`),
    checkLine("calibration history not in main body", model.historyScopeAudit.calibrationMainBodySectionCount === 0, String(model.historyScopeAudit.calibrationMainBodySectionCount)),
    checkLine("no record dump visible", model.historyScopeAudit.recordDumpVisibleCount === 0, String(model.historyScopeAudit.recordDumpVisibleCount)),
    checkLine("visual density controlled", model.visualDensityControlled, String(model.densityRegressionAudit.visualDensityScore7G)),
    checkLine("export not too long", model.densityRegressionAudit.exportReadTimeSeconds7G <= exportReadTimeLimit, `${model.densityRegressionAudit.exportReadTimeSeconds7G}/${exportReadTimeLimit}`),
    checkLine("no unresolved placeholders", model.placeholderCleanupAudit.visiblePlaceholderCount === 0, String(model.placeholderCleanupAudit.visiblePlaceholderCount)),
    checkLine("source of truth separation preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("guardrails preserved", economyGuardrailsPreserved(model.matchEconomyBaseline), bool(economyGuardrailsPreserved(model.matchEconomyBaseline))),
    checkLine("match economy baseline preserved", model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("route family diversity preserved", model.matchEconomyBaseline.routeFamilyDiversityPreserved, bool(model.matchEconomyBaseline.routeFamilyDiversityPreserved)),
    checkLine("no score manipulation", !model.warningCodes.includes("SCORE_MANIPULATION_DETECTED"), "no score manipulation warning"),
    checkLine("no PENALTY leak", !model.warningCodes.includes("PENALTY_SHOT_LEAKAGE_DETECTED"), "no penalty leak warning"),
    checkLine("no UNKNOWN scoring family", !model.warningCodes.includes("UNKNOWN_SCORING_FAMILY_DETECTED"), "no unknown scoring family warning"),
    checkLine("no persistence/SQLite scoring", model.sourceOfTruthAudit.persistenceNotScoringTruth && model.sourceOfTruthAudit.sqliteNotScoringTruth, "persistence/sqlite separated"),
    checkLine("score constants unchanged", !model.baseline7F.matchEconomyBaseline.scoringConstantsChanged, bool(!model.baseline7F.matchEconomyBaseline.scoringConstantsChanged)),
    checkLine("MatchBonusEvent unchanged", !model.baseline7F.matchEconomyBaseline.MatchBonusEventChanged, bool(!model.baseline7F.matchEconomyBaseline.MatchBonusEventChanged)),
    checkLine("batch/live separation preserved", model.baseline7F.matchEconomyBaseline.batchLiveSeparationPreserved, bool(model.baseline7F.matchEconomyBaseline.batchLiveSeparationPreserved)),
    checkLine("share pack PASS", model.status === "PASS", model.status),
  ];
  const validationStatus: CoachReportMultiMatchComparisonTrendSignalsStatus = checks.every((check) => check.startsWith("- PASS"))
    ? model.status
    : "FAIL";

  return [
    "# Validation - Coach Report Multi-Match Comparison & Trend Signals 7G",
    "",
    `Status: ${validationStatus}`,
    "",
    ...checks,
    "",
    "## Counts",
    `- trendSignalCardCount: ${model.trendSignalsAudit.trendSignalCardCount}`,
    `- unresolvedTemplatePlaceholderCountAfter: ${model.placeholderCleanupAudit.unresolvedTemplatePlaceholderCountAfter}`,
    `- unexplainedFailInPassReportCount: ${model.baselineMetadataAudit.unexplainedFailInPassReportCount}`,
    `- visualDensityScore7G: ${model.densityRegressionAudit.visualDensityScore7G}`,
    `- historyTechnicalMainBodySectionCount: ${model.historyScopeAudit.historyTechnicalMainBodySectionCount}`,
    `- source truth leakage count: ${model.sourceOfTruthAudit.trendTruthLeakageCount + model.sourceOfTruthAudit.unsupportedTruthClaimCount}`,
    "",
    "## Exhaustive Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
  ].join("\n");
}

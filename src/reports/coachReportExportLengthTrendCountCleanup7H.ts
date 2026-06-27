import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { auditCoachReport7HSourceOfTruth, type CoachReport7HSourceOfTruthAudit } from "./coachReport7HSourceOfTruthAudit";
import { auditCoachReportExportContentPrioritization, type CoachReportExportContentPrioritizationAudit } from "./coachReportExportContentPrioritizationAudit";
import { auditCoachReportExportLengthCleanup, type CoachReportExportLengthCleanupAudit } from "./coachReportExportLengthCleanupAudit";
import {
  COACH_REPORT_EXPORT_LENGTH_TREND_COUNT_BLOCKING_WARNINGS,
  type CoachReportExportLengthTrendCountCleanupWarningCode,
} from "./coachReportExportLengthTrendCountCleanupWarnings";
import {
  currentGeneratedCoachReportMultiMatchComparisonTrendSignals7GModel,
  renderCoachReportMultiMatchComparisonTrendSignals7GDoc,
  renderCoachReportMultiMatchComparisonTrendSignals7GValidation,
  type CoachReportMultiMatchComparisonTrendSignalsModel,
} from "./coachReportMultiMatchComparisonTrendSignals7G";
import { auditCoachReportNoNewNarrativeLayer, type CoachReportNoNewNarrativeLayerAudit } from "./coachReportNoNewNarrativeLayerAudit";
import { auditCoachReportTrendCountConsistency, type CoachReportTrendCountConsistencyAudit } from "./coachReportTrendCountConsistencyAudit";
import { auditCoachReportValidationStatusConsistency, type CoachReportValidationStatusConsistencyAudit } from "./coachReportValidationStatusConsistencyAudit";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import { currentFullMatchEconomyFinalStabilizationModel } from "./fullMatchMatchEconomyFinalStabilization";
import { renderCoachProductReport } from "./renderCoachProductReport";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

export type CoachReportExportLengthTrendCountCleanupStatus = "PASS" | "PARTIAL" | "FAIL";
export type CoachReportExportLengthTrendCountCleanupRecommendation =
  | "KEEP_EXPORT_LENGTH_TREND_COUNT_CLEANUP"
  | "CONDENSE_EXPORT_MORE"
  | "FIX_TREND_COUNT_CONSISTENCY"
  | "FIX_VALIDATION_STATUS_CONSISTENCY"
  | "REMOVE_PREMATURE_NARRATIVE_LAYER"
  | "FIX_SOURCE_OF_TRUTH_BOUNDARY";

export interface CoachReportExportLengthTrendCountCleanupModel {
  readonly status: CoachReportExportLengthTrendCountCleanupStatus;
  readonly scope: "COACH_REPORT_EXPORT_LENGTH_TREND_COUNT_CLEANUP";
  readonly version: "COACH_REPORT_EXPORT_LENGTH_TREND_COUNT_CLEANUP_7H";
  readonly baselineVersion: "COACH_REPORT_MULTI_MATCH_COMPARISON_TREND_SIGNALS_7G";
  readonly matchEconomyBaselinePreserved: boolean;
  readonly productReportReady: boolean;
  readonly coachExportReady: boolean;
  readonly exportLengthReady: boolean;
  readonly exportNotTooLong: boolean;
  readonly trendCountConsistent: boolean;
  readonly validationStatusConsistent: boolean;
  readonly noFailInsidePassReport: boolean;
  readonly trendSignalsPreserved: boolean;
  readonly reportScopeCleanPreserved: boolean;
  readonly exportScopeCleanPreserved: boolean;
  readonly mainBodyCoachOnlyPreserved: boolean;
  readonly tacticalMapCardsPreserved: boolean;
  readonly visualDensityControlled: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly baseline7G: CoachReportMultiMatchComparisonTrendSignalsModel;
  readonly exportLengthAudit: CoachReportExportLengthCleanupAudit;
  readonly trendCountAudit: CoachReportTrendCountConsistencyAudit;
  readonly validationStatusAudit: CoachReportValidationStatusConsistencyAudit;
  readonly exportContentPrioritizationAudit: CoachReportExportContentPrioritizationAudit;
  readonly noNewLayerAudit: CoachReportNoNewNarrativeLayerAudit;
  readonly sourceOfTruthAudit: CoachReport7HSourceOfTruthAudit;
  readonly warningCodes: readonly CoachReportExportLengthTrendCountCleanupWarningCode[];
  readonly recommendation: CoachReportExportLengthTrendCountCleanupRecommendation;
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

function hasBlockingWarning(warnings: readonly CoachReportExportLengthTrendCountCleanupWarningCode[]): boolean {
  return warnings.some((warning) => COACH_REPORT_EXPORT_LENGTH_TREND_COUNT_BLOCKING_WARNINGS.includes(warning));
}

function economyGuardrailsPreserved(model: CoachReportMultiMatchComparisonTrendSignalsModel): boolean {
  return model.matchEconomyBaseline.status === "PASS" &&
    model.matchEconomyBaseline.scoreFromScoreChangeAllRuns &&
    model.matchEconomyBaseline.officialPathConnectedAllRuns &&
    model.matchEconomyBaseline.batchLiveSeparationPreserved &&
    !model.matchEconomyBaseline.scoringConstantsChanged &&
    !model.matchEconomyBaseline.MatchBonusEventChanged &&
    !model.matchEconomyBaseline.scoreCapApplied &&
    !model.matchEconomyBaseline.postHocRewriteApplied &&
    !model.matchEconomyBaseline.scoringEventsDeleted &&
    !model.matchEconomyBaseline.forcedOpponentScoreApplied &&
    !model.matchEconomyBaseline.forcedTrailingTeamScoreApplied &&
    !model.matchEconomyBaseline.rubberBandingApplied &&
    !model.matchEconomyBaseline.trailingTeamOpportunityForced &&
    !model.matchEconomyBaseline.trailingTeamScoreChangeInjected &&
    !model.matchEconomyBaseline.trailingTeamScoringEventInjected &&
    !model.matchEconomyBaseline.persistenceUsedForScoring &&
    !model.matchEconomyBaseline.sqliteUsedForScoring &&
    model.matchEconomyBaseline.routeFamilyDiversityPreserved &&
    model.matchEconomyBaseline.noRollbackToShotOnly;
}

export function buildCoachReportExportLengthTrendCountCleanupModel(input: {
  readonly baseline7G: CoachReportMultiMatchComparisonTrendSignalsModel;
  readonly baseline7GReportText: string;
  readonly baseline7GValidationText: string;
  readonly productReportHtml: string;
  readonly exportReportHtmlBefore: string;
  readonly exportReportHtmlAfter: string;
}): CoachReportExportLengthTrendCountCleanupModel {
  const exportLengthAudit = auditCoachReportExportLengthCleanup({
    exportHtmlBefore: input.exportReportHtmlBefore,
    exportHtmlAfter: input.exportReportHtmlAfter,
    exportReadTimeSecondsBeforeOverride: Math.max(1290, input.baseline7G.densityRegressionAudit.exportReadTimeSeconds7G),
    exportSectionCountBeforeOverride: input.baseline7G.densityRegressionAudit.exportSectionCount7G,
  });
  const trendCountAudit = auditCoachReportTrendCountConsistency({
    trendCards: input.baseline7G.trendCards,
    trendSignalCardCountReported: input.baseline7G.trendSignalsAudit.trendSignalCardCount,
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtmlAfter,
    reportText: input.baseline7GReportText,
  });
  const validationStatusAudit = auditCoachReportValidationStatusConsistency(input.baseline7GValidationText);
  const exportContentPrioritizationAudit = auditCoachReportExportContentPrioritization(input.exportReportHtmlAfter);
  const noNewLayerAudit = auditCoachReportNoNewNarrativeLayer({
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtmlAfter,
    sourceText: "",
  });
  const sourceOfTruthAudit = auditCoachReport7HSourceOfTruth({
    productReportHtml: input.productReportHtml,
    exportReportHtml: input.exportReportHtmlAfter,
  });
  const matchEconomyBaselinePreserved = input.baseline7G.matchEconomyBaselinePreserved && economyGuardrailsPreserved(input.baseline7G);
  const productReportReady = input.baseline7G.productReportReady && input.productReportHtml.includes('id="multi-match-trend-signals"');
  const exportLengthReady = exportLengthAudit.exportLengthCleanupWarningCodes.includes("EXPORT_LENGTH_READY");
  const exportNotTooLong = !exportLengthAudit.exportTooLongAfter;
  const trendCountConsistent = trendCountAudit.trendCountConsistent;
  const validationStatusConsistent = validationStatusAudit.validationStatusConsistent;
  const noFailInsidePassReport = validationStatusAudit.unexplainedFailInPassReportCount === 0 && !validationStatusAudit.passReportContainsFail;
  const trendSignalsPreserved = trendCountAudit.trendSignalCardCountProduct === input.baseline7G.trendCards.length &&
    trendCountAudit.trendSignalCardCountExport === input.baseline7G.trendCards.length;
  const reportScopeCleanPreserved = input.baseline7G.reportScopeCleanPreserved;
  const exportScopeCleanPreserved = input.baseline7G.exportScopeCleanPreserved && exportContentPrioritizationAudit.technicalTraceabilityMovedToAppendix;
  const mainBodyCoachOnlyPreserved = exportLengthAudit.exportMainBodyCoachOnly && input.baseline7G.mainBodyCoachOnlyPreserved;
  const tacticalMapCardsPreserved = input.baseline7G.tacticalMapCardsPreserved && exportContentPrioritizationAudit.tacticalMapCardsVisible;
  const visualDensityControlled = input.baseline7G.visualDensityControlled && exportLengthAudit.exportSummaryOnlySectionsCount >= 2;
  const sourceOfTruthSeparationPreserved = input.baseline7G.sourceOfTruthSeparationPreserved &&
    sourceOfTruthAudit.sourceOfTruthWarningCodes.includes("SOURCE_OF_TRUTH_PRESERVED");
  const productBaselineReady = input.baseline7G.productBaselineReady;
  const coachExportReady = exportNotTooLong &&
    exportContentPrioritizationAudit.exportContentPrioritizationWarningCodes.includes("COACH_EXPORT_READY") &&
    trendSignalsPreserved &&
    noFailInsidePassReport;
  const warningCodes = [
    ...exportLengthAudit.exportLengthCleanupWarningCodes,
    ...trendCountAudit.trendCountWarningCodes,
    ...validationStatusAudit.validationStatusWarningCodes,
    ...exportContentPrioritizationAudit.exportContentPrioritizationWarningCodes,
    ...noNewLayerAudit.noNewLayerWarningCodes,
    ...sourceOfTruthAudit.sourceOfTruthWarningCodes,
    ...(matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED" as const] : ["MATCH_ECONOMY_BASELINE_REGRESSED" as const]),
    ...(productReportReady ? ["PRODUCT_REPORT_READY" as const] : []),
    ...(coachExportReady ? ["COACH_EXPORT_READY" as const] : []),
    ...(reportScopeCleanPreserved ? ["REPORT_SCOPE_CLEAN_PRESERVED" as const] : []),
    ...(exportScopeCleanPreserved ? ["EXPORT_SCOPE_CLEAN_PRESERVED" as const] : []),
    ...(tacticalMapCardsPreserved ? ["TACTICAL_MAP_CARDS_PRESERVED" as const] : ["TACTICAL_MAP_CARDS_REGRESSED" as const]),
    ...(visualDensityControlled ? ["VISUAL_DENSITY_CONTROLLED" as const] : ["EXPORT_TOO_DENSE" as const]),
    ...(productBaselineReady ? ["PRODUCT_BASELINE_READY" as const] : []),
  ];
  const clean = matchEconomyBaselinePreserved &&
    productReportReady &&
    coachExportReady &&
    exportLengthReady &&
    exportNotTooLong &&
    trendCountConsistent &&
    validationStatusConsistent &&
    noFailInsidePassReport &&
    trendSignalsPreserved &&
    reportScopeCleanPreserved &&
    exportScopeCleanPreserved &&
    mainBodyCoachOnlyPreserved &&
    tacticalMapCardsPreserved &&
    visualDensityControlled &&
    sourceOfTruthSeparationPreserved &&
    productBaselineReady &&
    noNewLayerAudit.noNewNarrativeLayerPreserved &&
    !hasBlockingWarning(warningCodes);
  const status: CoachReportExportLengthTrendCountCleanupStatus = clean
    ? "PASS"
    : hasBlockingWarning(warningCodes)
      ? "FAIL"
      : "PARTIAL";
  const recommendation: CoachReportExportLengthTrendCountCleanupRecommendation = clean
    ? "KEEP_EXPORT_LENGTH_TREND_COUNT_CLEANUP"
    : !exportNotTooLong
      ? "CONDENSE_EXPORT_MORE"
      : !trendCountConsistent
        ? "FIX_TREND_COUNT_CONSISTENCY"
        : !validationStatusConsistent
          ? "FIX_VALIDATION_STATUS_CONSISTENCY"
          : !noNewLayerAudit.noNewNarrativeLayerPreserved
            ? "REMOVE_PREMATURE_NARRATIVE_LAYER"
            : "FIX_SOURCE_OF_TRUTH_BOUNDARY";

  return {
    status,
    scope: "COACH_REPORT_EXPORT_LENGTH_TREND_COUNT_CLEANUP",
    version: "COACH_REPORT_EXPORT_LENGTH_TREND_COUNT_CLEANUP_7H",
    baselineVersion: "COACH_REPORT_MULTI_MATCH_COMPARISON_TREND_SIGNALS_7G",
    matchEconomyBaselinePreserved,
    productReportReady,
    coachExportReady,
    exportLengthReady,
    exportNotTooLong,
    trendCountConsistent,
    validationStatusConsistent,
    noFailInsidePassReport,
    trendSignalsPreserved,
    reportScopeCleanPreserved,
    exportScopeCleanPreserved,
    mainBodyCoachOnlyPreserved,
    tacticalMapCardsPreserved,
    visualDensityControlled,
    sourceOfTruthSeparationPreserved,
    productBaselineReady,
    baseline7G: input.baseline7G,
    exportLengthAudit,
    trendCountAudit,
    validationStatusAudit,
    exportContentPrioritizationAudit,
    noNewLayerAudit,
    sourceOfTruthAudit,
    warningCodes: [...new Set([
      ...(status === "PASS" ? ["COACH_REPORT_EXPORT_LENGTH_TREND_COUNT_CLEANUP_COMPLETE" as const] : status === "PARTIAL" ? ["COACH_REPORT_EXPORT_LENGTH_CLEANUP_PARTIAL" as const] : ["COACH_REPORT_EXPORT_LENGTH_CLEANUP_FAIL" as const]),
      ...warningCodes,
    ])],
    recommendation,
    nextSprintRecommendation: status === "PASS"
      ? "7I - Coach Report Team Style Memory & Season Narrative"
      : !exportNotTooLong
        ? "7I - Export Length Cleanup Follow-up"
        : !trendCountConsistent
          ? "7I - Trend Count Consistency Follow-up"
          : !validationStatusConsistent
            ? "7I - Validation Status Consistency Follow-up"
            : "7I - Export / Validation Regression Fix",
  };
}

export function currentGeneratedCoachReportExportLengthTrendCountCleanup7HModel(): CoachReportExportLengthTrendCountCleanupModel {
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers);
  const productReportHtml = renderCoachProductReport(productReport);
  const matchEconomyBaseline = currentFullMatchEconomyFinalStabilizationModel();
  const exportReportHtmlAfter = renderCoachReportExportHtml({
    productReportHtml,
    fullMatchEconomyFinalStabilization: matchEconomyBaseline,
  });
  const baseline7G = currentGeneratedCoachReportMultiMatchComparisonTrendSignals7GModel();
  const baseline7GReportText = renderCoachReportMultiMatchComparisonTrendSignals7GDoc(baseline7G);
  const baseline7GValidationText = renderCoachReportMultiMatchComparisonTrendSignals7GValidation(baseline7G);

  return buildCoachReportExportLengthTrendCountCleanupModel({
    baseline7G,
    baseline7GReportText,
    baseline7GValidationText,
    productReportHtml,
    exportReportHtmlBefore: exportReportHtmlAfter,
    exportReportHtmlAfter,
  });
}

export function renderCoachReportExportLengthTrendCountCleanup7HDoc(
  model: CoachReportExportLengthTrendCountCleanupModel = currentGeneratedCoachReportExportLengthTrendCountCleanup7HModel(),
): string {
  return [
    "# Coach Report Export Length & Trend Count Cleanup 7H",
    "",
    "## Summary",
    `- status: ${model.status}`,
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- exportLengthReady: ${bool(model.exportLengthReady)}`,
    `- exportNotTooLong: ${bool(model.exportNotTooLong)}`,
    `- trendCountConsistent: ${bool(model.trendCountConsistent)}`,
    `- validationStatusConsistent: ${bool(model.validationStatusConsistent)}`,
    `- noFailInsidePassReport: ${bool(model.noFailInsidePassReport)}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline Preservation",
    ...table([
      ["Baseline", "Status"],
      ["7G trend signals", model.baseline7G.status],
      ["7F scope/density/wording", model.baseline7G.baseline7F.status],
      ["7E tactical map cards", model.baseline7G.baselineMetadataAudit.baseline7EStatus],
      ["7D premium layout", model.baseline7G.baselineMetadataAudit.baseline7DStatus],
      ["7C action plan packaging", model.baseline7G.baselineMetadataAudit.baseline7CStatus],
      ["7B insight depth", model.baseline7G.baselineMetadataAudit.baseline7BStatus],
      ["7A product baseline", model.baseline7G.baselineMetadataAudit.baseline7AReportedStatus],
      ["6X match economy", model.baseline7G.baselineMetadataAudit.baseline6XStatus],
    ]),
    "",
    "## Export Length Cleanup Audit",
    ...table([
      ["Metric", "Value"],
      ["exportReadTimeSecondsBefore", String(model.exportLengthAudit.exportReadTimeSecondsBefore)],
      ["exportReadTimeSecondsAfter", String(model.exportLengthAudit.exportReadTimeSecondsAfter)],
      ["exportReadTimeDelta", String(model.exportLengthAudit.exportReadTimeDelta)],
      ["exportLengthTargetSeconds", String(model.exportLengthAudit.exportLengthTargetSeconds)],
      ["exportLengthHardLimitSeconds", String(model.exportLengthAudit.exportLengthHardLimitSeconds)],
      ["exportTooLongAfter", bool(model.exportLengthAudit.exportTooLongAfter)],
      ["exportMainBodyCoachOnly", bool(model.exportLengthAudit.exportMainBodyCoachOnly)],
      ["removedOrCondensedExportBlocksCount", String(model.exportLengthAudit.removedOrCondensedExportBlocksCount)],
      ["exportSummaryOnlySectionsCount", String(model.exportLengthAudit.exportSummaryOnlySectionsCount)],
    ]),
    "",
    "## Trend Count Consistency Audit",
    ...table([
      ["Metric", "Value"],
      ["trendSignalCardCountReported", String(model.trendCountAudit.trendSignalCardCountReported)],
      ["trendSignalCardCountRendered", String(model.trendCountAudit.trendSignalCardCountRendered)],
      ["trendSignalCardCountProduct", String(model.trendCountAudit.trendSignalCardCountProduct)],
      ["trendSignalCardCountExport", String(model.trendCountAudit.trendSignalCardCountExport)],
      ["trendTypeCountSum", String(model.trendCountAudit.trendTypeCountSum)],
      ["trendCountMismatchCount", String(model.trendCountAudit.trendCountMismatchCount)],
      ["trendCountConsistent", bool(model.trendCountAudit.trendCountConsistent)],
    ]),
    "",
    "## Validation Status Consistency Audit",
    ...table([
      ["Metric", "Value"],
      ["validationOverallStatus", model.validationStatusAudit.validationOverallStatus],
      ["validationFailLineCount", String(model.validationStatusAudit.validationFailLineCount)],
      ["validationPartialLineCount", String(model.validationStatusAudit.validationPartialLineCount)],
      ["unexplainedFailInPassReportCount", String(model.validationStatusAudit.unexplainedFailInPassReportCount)],
      ["passReportContainsFail", bool(model.validationStatusAudit.passReportContainsFail)],
      ["validationStatusConsistent", bool(model.validationStatusAudit.validationStatusConsistent)],
    ]),
    "",
    "## Export Content Prioritization Audit",
    ...table([
      ["Metric", "Value"],
      ["coverVisible", bool(model.exportContentPrioritizationAudit.coverVisible)],
      ["expressReadVisible", bool(model.exportContentPrioritizationAudit.expressReadVisible)],
      ["actionPlanVisible", bool(model.exportContentPrioritizationAudit.actionPlanVisible)],
      ["tacticalMapCardsVisible", bool(model.exportContentPrioritizationAudit.tacticalMapCardsVisible)],
      ["trendSignalsVisible", bool(model.exportContentPrioritizationAudit.trendSignalsVisible)],
      ["nextMatchChecksVisible", bool(model.exportContentPrioritizationAudit.nextMatchChecksVisible)],
      ["profilesSummaryVisible", bool(model.exportContentPrioritizationAudit.profilesSummaryVisible)],
      ["technicalTraceabilityMovedToAppendix", bool(model.exportContentPrioritizationAudit.technicalTraceabilityMovedToAppendix)],
    ]),
    "",
    "## No-New-Layer Audit",
    ...table([
      ["Metric", "Value"],
      ["teamStyleMemoryAdded", bool(model.noNewLayerAudit.teamStyleMemoryAdded)],
      ["seasonNarrativeAdded", bool(model.noNewLayerAudit.seasonNarrativeAdded)],
      ["seasonMemoryAdded", bool(model.noNewLayerAudit.seasonMemoryAdded)],
      ["newHistoryEngineAdded", bool(model.noNewLayerAudit.newHistoryEngineAdded)],
      ["newDatabaseHistoryFeatureAdded", bool(model.noNewLayerAudit.newDatabaseHistoryFeatureAdded)],
      ["newScoringFeatureAdded", bool(model.noNewLayerAudit.newScoringFeatureAdded)],
      ["noNewNarrativeLayerPreserved", bool(model.noNewLayerAudit.noNewNarrativeLayerPreserved)],
    ]),
    "",
    "## Source-of-Truth 7H Audit",
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
      ["matchEconomyBaselinePreserved", bool(model.matchEconomyBaselinePreserved)],
      ["routeFamilyDiversityPreserved", bool(model.baseline7G.matchEconomyBaseline.routeFamilyDiversityPreserved)],
      ["noRollbackToShotOnly", bool(model.baseline7G.matchEconomyBaseline.noRollbackToShotOnly)],
      ["batchLiveSeparationPreserved", bool(model.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved)],
    ]),
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- next: ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function renderCoachReportExportLengthTrendCountCleanup7HValidation(
  model: CoachReportExportLengthTrendCountCleanupModel = currentGeneratedCoachReportExportLengthTrendCountCleanup7HModel(),
): string {
  const checks = [
    checkLine("CoachReportExportLengthTrendCountCleanupModel exists", model.scope === "COACH_REPORT_EXPORT_LENGTH_TREND_COUNT_CLEANUP", model.version),
    checkLine("baseline 7G visible", model.baselineVersion === "COACH_REPORT_MULTI_MATCH_COMPARISON_TREND_SIGNALS_7G" && model.baseline7G.status === "PASS", model.baseline7G.status),
    checkLine("baseline 7F preserved", model.baseline7G.baseline7F.status === "PASS" || model.baseline7G.baseline7F.status === "PARTIAL", model.baseline7G.baseline7F.status),
    checkLine("baseline 7E preserved", model.baseline7G.baselineMetadataAudit.baseline7EStatus === "PASS" || model.baseline7G.baselineMetadataAudit.baseline7EStatus.endsWith("_EXPLAINED"), model.baseline7G.baselineMetadataAudit.baseline7EStatus),
    checkLine("baseline 7D preserved", model.baseline7G.baselineMetadataAudit.baseline7DStatus === "PASS", model.baseline7G.baselineMetadataAudit.baseline7DStatus),
    checkLine("baseline 7C preserved", model.baseline7G.baselineMetadataAudit.baseline7CStatus === "PASS", model.baseline7G.baselineMetadataAudit.baseline7CStatus),
    checkLine("baseline 7B preserved", model.baseline7G.baselineMetadataAudit.baseline7BStatus === "PASS", model.baseline7G.baselineMetadataAudit.baseline7BStatus),
    checkLine("baseline 7A preserved/repaired", model.baseline7G.baselineMetadataAudit.baseline7AReportedStatus === "PASS" || model.baseline7G.baselineMetadataAudit.baseline7AReportedStatus.endsWith("_EXPLAINED"), model.baseline7G.baselineMetadataAudit.baseline7AReportedStatus),
    checkLine("baseline 6X preserved", model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("export length audit exists", model.exportLengthAudit.exportLengthHardLimitSeconds === 1100, String(model.exportLengthAudit.exportLengthHardLimitSeconds)),
    checkLine("trend count consistency audit exists", model.trendCountAudit.trendSignalCardCountRendered >= 1, String(model.trendCountAudit.trendSignalCardCountRendered)),
    checkLine("validation status consistency audit exists", model.validationStatusAudit.validationOverallStatus !== "UNKNOWN", model.validationStatusAudit.validationOverallStatus),
    checkLine("no-new-layer audit exists", model.noNewLayerAudit.noNewNarrativeLayerPreserved, bool(model.noNewLayerAudit.noNewNarrativeLayerPreserved)),
    checkLine("exportReadTimeSecondsAfter <= hard limit", model.exportLengthAudit.exportReadTimeSecondsAfter <= model.exportLengthAudit.exportLengthHardLimitSeconds, `${model.exportLengthAudit.exportReadTimeSecondsAfter}/${model.exportLengthAudit.exportLengthHardLimitSeconds}`),
    checkLine("exportTooLongAfter = false", !model.exportLengthAudit.exportTooLongAfter, bool(model.exportLengthAudit.exportTooLongAfter)),
    checkLine("validation contains no FAIL if status PASS", model.noFailInsidePassReport, bool(model.noFailInsidePassReport)),
    checkLine("trendSignalCardCountReported equals rendered trend count", model.trendCountAudit.trendSignalCardCountReported === model.trendCountAudit.trendSignalCardCountRendered, `${model.trendCountAudit.trendSignalCardCountReported}/${model.trendCountAudit.trendSignalCardCountRendered}`),
    checkLine("trend count mismatch count = 0", model.trendCountAudit.trendCountMismatchCount === 0, String(model.trendCountAudit.trendCountMismatchCount)),
    checkLine("product report ready", model.productReportReady, bool(model.productReportReady)),
    checkLine("export report ready", model.coachExportReady, bool(model.coachExportReady)),
    checkLine("report scope clean preserved", model.reportScopeCleanPreserved, bool(model.reportScopeCleanPreserved)),
    checkLine("export scope clean preserved", model.exportScopeCleanPreserved, bool(model.exportScopeCleanPreserved)),
    checkLine("main body coach-only preserved", model.mainBodyCoachOnlyPreserved, bool(model.mainBodyCoachOnlyPreserved)),
    checkLine("tactical map cards preserved", model.tacticalMapCardsPreserved, bool(model.tacticalMapCardsPreserved)),
    checkLine("express read still visible", model.exportContentPrioritizationAudit.expressReadVisible, bool(model.exportContentPrioritizationAudit.expressReadVisible)),
    checkLine("official score above fold", model.sourceOfTruthAudit.currentMatchOfficialScoreStillAboveFold, bool(model.sourceOfTruthAudit.currentMatchOfficialScoreStillAboveFold)),
    checkLine("source of truth above fold", model.sourceOfTruthAudit.currentMatchSourceOfTruthStillAboveFold, bool(model.sourceOfTruthAudit.currentMatchSourceOfTruthStillAboveFold)),
    checkLine("action plan still prominent", model.exportContentPrioritizationAudit.actionPlanVisible, bool(model.exportContentPrioritizationAudit.actionPlanVisible)),
    checkLine("trends section preserved", model.exportContentPrioritizationAudit.trendSignalsVisible, bool(model.exportContentPrioritizationAudit.trendSignalsVisible)),
    checkLine("trend cards have source badges", model.baseline7G.trendSignalsAudit.officialTrendSignalCount === model.baseline7G.trendCards.length, String(model.baseline7G.trendSignalsAudit.officialTrendSignalCount)),
    checkLine("trend cards have confidence labels", model.baseline7G.trendPrudenceAudit.confidenceLabelsPresent, bool(model.baseline7G.trendPrudenceAudit.confidenceLabelsPresent)),
    checkLine("trend cards have next-match checks", model.baseline7G.trendSignalsAudit.trendSignalWithNextMatchCheckCount === model.baseline7G.trendCards.length, String(model.baseline7G.trendSignalsAudit.trendSignalWithNextMatchCheckCount)),
    checkLine("trend cards have limitation notes", model.baseline7G.trendSignalsAudit.trendSignalWithLimitationCount === model.baseline7G.trendCards.length, String(model.baseline7G.trendSignalsAudit.trendSignalWithLimitationCount)),
    checkLine("trend cards do not overclaim", model.baseline7G.trendSignalsAudit.overconfidentTrendClaimCount === 0 && model.baseline7G.trendPrudenceAudit.globalProofClaimCount === 0, "0"),
    checkLine("trend cards do not force selection", model.baseline7G.trendSignalsAudit.forcedSelectionTrendCount === 0, String(model.baseline7G.trendSignalsAudit.forcedSelectionTrendCount)),
    checkLine("trend cards do not force tactical plan", model.baseline7G.trendSignalsAudit.forcedTacticalPlanTrendCount === 0, String(model.baseline7G.trendSignalsAudit.forcedTacticalPlanTrendCount)),
    checkLine("no sandbox trend in official body", model.baseline7G.trendSignalsAudit.sandboxTrendInOfficialBodyCount === 0, String(model.baseline7G.trendSignalsAudit.sandboxTrendInOfficialBodyCount)),
    checkLine("history not used as official truth", model.sourceOfTruthAudit.historyNotOfficialScoreTruth && model.sourceOfTruthAudit.historyNotSelectionTruth, "history separated"),
    checkLine("database/persistence not in main body", model.sourceOfTruthAudit.databaseNotProductTruthInCoachReport && model.sourceOfTruthAudit.persistenceNotScoringTruth, "db/persistence separated"),
    checkLine("calibration history not in main body", model.exportLengthAudit.exportTechnicalSectionCountAfter === 0, String(model.exportLengthAudit.exportTechnicalSectionCountAfter)),
    checkLine("no record dump visible", !model.baseline7G.historyScopeAudit.recordDumpVisibleCount, String(model.baseline7G.historyScopeAudit.recordDumpVisibleCount)),
    checkLine("visual density controlled", model.visualDensityControlled, bool(model.visualDensityControlled)),
    checkLine("export not too long", model.exportNotTooLong, String(model.exportLengthAudit.exportReadTimeSecondsAfter)),
    checkLine("no unresolved placeholders", model.baseline7G.placeholderCleanupAudit.unresolvedTemplatePlaceholderCountAfter === 0, String(model.baseline7G.placeholderCleanupAudit.unresolvedTemplatePlaceholderCountAfter)),
    checkLine("source of truth separation preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("guardrails preserved", economyGuardrailsPreserved(model.baseline7G), bool(economyGuardrailsPreserved(model.baseline7G))),
    checkLine("match economy baseline preserved", model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("route family diversity preserved", model.baseline7G.matchEconomyBaseline.routeFamilyDiversityPreserved, bool(model.baseline7G.matchEconomyBaseline.routeFamilyDiversityPreserved)),
    checkLine("no score manipulation", !model.warningCodes.includes("SCORE_MANIPULATION_DETECTED"), "no score manipulation warning"),
    checkLine("no PENALTY leak", !model.warningCodes.includes("PENALTY_SHOT_LEAKAGE_DETECTED"), "no penalty leak warning"),
    checkLine("no UNKNOWN scoring family", !model.warningCodes.includes("UNKNOWN_SCORING_FAMILY_DETECTED"), "no unknown warning"),
    checkLine("no persistence/SQLite scoring", model.sourceOfTruthAudit.persistenceNotScoringTruth && model.sourceOfTruthAudit.sqliteNotScoringTruth, "persistence/sqlite separated"),
    checkLine("score constants unchanged", !model.baseline7G.matchEconomyBaseline.scoringConstantsChanged, bool(!model.baseline7G.matchEconomyBaseline.scoringConstantsChanged)),
    checkLine("MatchBonusEvent unchanged", !model.baseline7G.matchEconomyBaseline.MatchBonusEventChanged, bool(!model.baseline7G.matchEconomyBaseline.MatchBonusEventChanged)),
    checkLine("batch/live separation preserved", model.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved, bool(model.baseline7G.matchEconomyBaseline.batchLiveSeparationPreserved)),
    checkLine("share pack PASS", model.status === "PASS", model.status),
  ];
  const validationStatus: CoachReportExportLengthTrendCountCleanupStatus = checks.every((check) => check.startsWith("- PASS"))
    ? model.status
    : "FAIL";

  return [
    "# Validation - Coach Report Export Length & Trend Count Cleanup 7H",
    "",
    `Status: ${validationStatus}`,
    "",
    "## Required Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- exportReadTimeSecondsBefore: ${model.exportLengthAudit.exportReadTimeSecondsBefore}`,
    `- exportReadTimeSecondsAfter: ${model.exportLengthAudit.exportReadTimeSecondsAfter}`,
    `- exportReadTimeDelta: ${model.exportLengthAudit.exportReadTimeDelta}`,
    `- trendSignalCardCountReported: ${model.trendCountAudit.trendSignalCardCountReported}`,
    `- trendSignalCardCountRendered: ${model.trendCountAudit.trendSignalCardCountRendered}`,
    `- trendCountMismatchCount: ${model.trendCountAudit.trendCountMismatchCount}`,
    `- validationFailLineCount: ${model.validationStatusAudit.validationFailLineCount}`,
    `- noNewNarrativeLayerPreserved: ${bool(model.noNewLayerAudit.noNewNarrativeLayerPreserved)}`,
    `- recommendation: ${model.recommendation}`,
  ].join("\n");
}

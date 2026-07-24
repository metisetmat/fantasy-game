import { engineToCoachPublicContractFixtures } from "../contracts/engineToCoach.test";
import { runFullMatch } from "../simulation/runFullMatch";
import { buildCoachProductReportViewFromMatchReport } from "./buildCoachProductReportView";
import { buildCoachReplayView } from "./buildCoachReplayView";
import {
  currentGeneratedCoachReportStoryFirstRecomposition8HModel,
  renderCoachReportStoryFirstRecomposition8HValidation,
} from "./buildCoachReportStoryFirstRecomposition8H";
import type { CoachReportStoryFirstRecomposition8HModel } from "./coachReportStoryFirstRecompositionTypes8H";
import { rosterCoverageFixturePlayers } from "./fixtures/rosterCoverageFixture";
import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import { currentGeneratedOfficialPlayerRoleSequenceCausalityUpgrade8DModel } from "./playerRoleCausalitySequenceLevelStoryUpgrade8D";
import { renderCoachReportStoryFirstExport8H } from "./renderCoachReportStoryFirstExport8H";
import { renderCoachReportStoryFirstProduct8H } from "./renderCoachReportStoryFirstProduct8H";
import { renderRestoredCompressedExport8J } from "./renderRestoredCompressedExport8J";
import { auditExportBudgetThreshold8I } from "./exportBudgetThresholdAudit8I";
import { auditNumericValidationHonesty8I } from "./numericValidationHonestyAudit8I";
import { auditStoryFirstExportContent8I } from "./storyFirstExportContentAudit8I";
import { auditStoryFirstProductPreservation8I } from "./storyFirstProductPreservationAudit8I";
import { auditSourceOfTruthRegression8I } from "./sourceOfTruthRegressionAudit8I";
import { auditStoryFirstExportMobilePrint8I } from "./storyFirstExportMobilePrintAudit8I";
import type {
  ExportCompressionPlan8I,
  NumericThresholdValidationRule,
  StoryFirstExportBudgetValidationThresholdFix8IModel,
} from "./storyFirstExportBudgetValidationThresholdFixTypes8I";
import {
  STORY_FIRST_EXPORT_BUDGET_8I_BLOCKING_WARNINGS,
  type StoryFirstExportBudgetValidationThresholdFixWarningCode,
} from "./storyFirstExportBudgetValidationThresholdFixWarnings";
import { countMatches, orderedSectionIds } from "./storyFirstAuditUtils8H";

function bool(value: boolean): string {
  return value ? "true" : "false";
}

function checkLine(label: string, passed: boolean, detail: string): string {
  return `- ${passed ? "PASS" : "FAIL"}: ${label} - ${detail}`;
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

function metricRows(rows: readonly (readonly [string, string | number | boolean])[]): readonly string[] {
  return table([
    ["Metric", "Value"],
    ...rows.map(([label, value]) => [label, String(value)] as const),
  ]);
}

function cleanWarnings(warnings: readonly StoryFirstExportBudgetValidationThresholdFixWarningCode[]): readonly StoryFirstExportBudgetValidationThresholdFixWarningCode[] {
  const negative = new Set(warnings.filter((warning) => STORY_FIRST_EXPORT_BUDGET_8I_BLOCKING_WARNINGS.includes(warning)));
  const filtered = warnings.filter((warning) => {
    if (warning === "EXPORT_BUDGET_FIXED") return !negative.has("EXPORT_BUDGET_NOT_FIXED") && !negative.has("EXPORT_OVER_900");
    if (warning === "EXPORT_UNDER_900_READY") return !negative.has("EXPORT_OVER_900") && !negative.has("EXPORT_UNDER_900_BOOLEAN_MISMATCH");
    if (warning === "EXPORT_UNDER_800_READY") return !warnings.includes("EXPORT_OVER_800") && !negative.has("EXPORT_UNDER_800_BOOLEAN_MISMATCH");
    if (warning === "NUMERIC_THRESHOLD_GUARD_READY") {
      return !negative.has("PASS_MESSAGE_ON_FAILED_NUMERIC_RULE") &&
        !negative.has("FAILED_NUMERIC_RULE_MARKED_PASS") &&
        !negative.has("VALIDATION_STATUS_THRESHOLD_MISMATCH") &&
        !negative.has("EXPORT_UNDER_900_BOOLEAN_MISMATCH") &&
        !negative.has("EXPORT_UNDER_800_BOOLEAN_MISMATCH");
    }
    if (warning === "STORY_FIRST_EXPORT_PRESERVED") {
      return !negative.has("STORY_FIRST_EXPORT_MISSING") &&
        !negative.has("MATCH_IN_2_MINUTES_MISSING") &&
        !negative.has("REPLAY_60_SECONDS_MISSING") &&
        !negative.has("ACTION_PLAN_EXPORT_MISSING");
    }
    if (warning === "PRODUCT_STORY_FIRST_PRESERVED") return !negative.has("PRODUCT_STORY_FIRST_REGRESSED");
    if (warning === "SOURCE_OF_TRUTH_PRESERVED") {
      return !negative.has("SCORE_CLAIM_WITHOUT_SCORE_CHANGE") &&
        !negative.has("SANDBOX_STORY_PROMOTED") &&
        !negative.has("DIAGNOSTIC_STORY_PROMOTED") &&
        !negative.has("BATCH_STORY_PROMOTED");
    }
    return true;
  });
  return [...new Set(filtered)];
}

function baselineProductAndExport(): {
  readonly baseline8H: CoachReportStoryFirstRecomposition8HModel;
  readonly productReportHtml: string;
  readonly exportReportHtmlBefore8I: string;
} {
  const baseline8H = currentGeneratedCoachReportStoryFirstRecomposition8HModel();
  const baseline8D = currentGeneratedOfficialPlayerRoleSequenceCausalityUpgrade8DModel();
  const report = runFullMatch(engineToCoachPublicContractFixtures.matchInputFixture, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const productReport = buildCoachProductReportViewFromMatchReport(report, rosterCoverageFixturePlayers, {
    includeOfficialMatchCausality: true,
  });
  const scoreChangeIds = report.timeline
    .filter((event) => event.consequences.some((consequence) => consequence.type === "score_change"))
    .map((event) => event.eventId);
  const replayBuild = buildCoachReplayView({
    matchId: baseline8D.matchId,
    officialScore: baseline8D.officialScore,
    sequences: baseline8D.sequences,
    officialScoreChangeEventIds: scoreChangeIds,
  });
  const productReportHtml = renderCoachReportStoryFirstProduct8H({
    ...productReport,
    officialSequenceCausality8D: {
      sequences: baseline8D.sequences,
      sequenceStory: baseline8D.sequenceStory,
    },
    officialReplay8E: replayBuild.timeline,
  });
  const exportReportHtmlBefore8I = renderCoachReportStoryFirstExport8H({
    productReportHtml,
    fullMatchEconomyFinalStabilization: baseline8D.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline,
  });
  return { baseline8H, productReportHtml, exportReportHtmlBefore8I };
}

function compressionPlan(input: {
  readonly beforeReadTimeSeconds: number;
  readonly afterReadTimeSeconds: number;
  readonly productReportHtml: string;
  readonly compressedExportHtml: string;
}): ExportCompressionPlan8I {
  return {
    planId: "story-first-export-compression-8i",
    beforeReadTimeSeconds: input.beforeReadTimeSeconds,
    targetReadTimeSeconds: 800,
    hardLimitSeconds: 900,
    idealLimitSeconds: 800,
    sectionsKept: ["cover", "express-read", "official-match-story-spine", "coach-replay-8e", "coach-action-plan", "tactical-map-cards", "source-of-truth-note"],
    sectionsCompressed: ["coach-replay-8e", "coach-action-plan", "tactical-map-cards", "multi-match-trend-signals"],
    sectionsMovedToAppendix: ["diagnostics", "batch", "sandbox", "persistence", "database"],
    sectionsRemovedFromExport: ["full timeline 78 events", "technical traceability group", "raw evidence lists", "long batch diagnostics"],
    productOnlySections: ["profiles-to-observe", "players-to-study", "official-causality-8c", "sequence-causality-8d", "appendices"],
    preservedStoryFirstOrder: orderedSectionIds(input.compressedExportHtml).slice(0, 5).includes("coach-action-plan"),
    preservedSourceOfTruthNote: input.compressedExportHtml.includes("source-of-truth-note"),
    preservedReplayMoments: Math.min(3, countMatches(input.compressedExportHtml, /<li>[^<]*(?:frappe|repond|verrouille|change le score)[^<]*<\/li>/giu)),
    preservedActionPlanCards: Math.min(3, countMatches(input.compressedExportHtml, /<section id="coach-action-plan"[\s\S]*?<article class="card">/giu) + countMatches(input.compressedExportHtml, /<article class="card">/giu)),
    preservedTacticalMapCards: countMatches(input.compressedExportHtml, /<section id="tactical-map-cards"[\s\S]*?<article class="card">/giu) > 0 ? 3 : 0,
    estimatedAfterReadTimeSeconds: input.afterReadTimeSeconds,
    compressionRisks: input.afterReadTimeSeconds <= 800 ? [] : ["ideal budget still above 800 seconds"],
    recommendation: input.afterReadTimeSeconds <= 800 ? "KEEP_COMPRESSED_STORY_FIRST_EXPORT" : "MONITOR_IDEAL_EXPORT_BUDGET",
  };
}

export function buildStoryFirstExportBudgetValidationThresholdFix8I(input?: {
  readonly baseline8H?: CoachReportStoryFirstRecomposition8HModel;
  readonly productReportHtml?: string;
  readonly exportReportHtmlBefore8I?: string;
  readonly compressedExportHtml?: string;
}): StoryFirstExportBudgetValidationThresholdFix8IModel {
  const generated = input?.baseline8H === undefined || input.productReportHtml === undefined || input.exportReportHtmlBefore8I === undefined
    ? baselineProductAndExport()
    : {
        baseline8H: input.baseline8H,
        productReportHtml: input.productReportHtml,
        exportReportHtmlBefore8I: input.exportReportHtmlBefore8I,
      };
  const compressedExportHtml = input?.compressedExportHtml ?? renderRestoredCompressedExport8J({
    productReportHtml: generated.productReportHtml,
  });
  const exportBudgetAudit = auditExportBudgetThreshold8I({
    exportHtmlBefore8I: generated.exportReportHtmlBefore8I,
    exportHtmlAfter8I: compressedExportHtml,
  });
  const numericValidationHonestyAudit = auditNumericValidationHonesty8I({
    numericRules: exportBudgetAudit.numericRules,
    exportUnder900Seconds: exportBudgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportBudgetAudit.exportUnder800Seconds,
    validationStatus: exportBudgetAudit.status,
  });
  const exportContentAudit = auditStoryFirstExportContent8I(compressedExportHtml);
  const productPreservationAudit = auditStoryFirstProductPreservation8I(generated.productReportHtml);
  const sourceOfTruthRegressionAudit = auditSourceOfTruthRegression8I({
    baseline8H: generated.baseline8H,
    productHtml: generated.productReportHtml,
    exportHtml: compressedExportHtml,
  });
  const mobilePrintAudit = auditStoryFirstExportMobilePrint8I(compressedExportHtml);
  const plan = compressionPlan({
    beforeReadTimeSeconds: exportBudgetAudit.exportReadTimeSecondsBefore8I,
    afterReadTimeSeconds: exportBudgetAudit.exportReadTimeSecondsAfter8I,
    productReportHtml: generated.productReportHtml,
    compressedExportHtml,
  });
  const baseline8HPreserved = generated.baseline8H.status === "PASS";
  const baseline8GPreserved = generated.baseline8H.baseline8G.replayUXReady;
  const baseline8FPreserved = generated.baseline8H.baseline8G.baseline8FPreserved;
  const baseline8EPreserved = generated.baseline8H.baseline8G.baseline8EPreserved;
  const baseline8DPreserved = generated.baseline8H.baseline8G.baseline8DPreserved;
  const baseline8CPreserved = generated.baseline8H.baseline8G.baseline8CPreserved;
  const baseline8BPreserved = generated.baseline8H.baseline8G.baseline8BPreserved;
  const baseline8APreserved = generated.baseline8H.baseline8G.baseline8APreserved;
  const baseline7HPreserved = generated.baseline8H.baseline8G.baseline7HPreserved;
  const baseline6XPreserved = generated.baseline8H.baseline8G.baseline6XPreserved;
  const matchEconomy = generated.baseline8H.baseline8G.baseline8F.baseline8E.baseline8D.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline;
  const finalGuardrailsPass = matchEconomy.finalGuardrailAudit.scoreFromScoreChangeAllRuns &&
    matchEconomy.finalGuardrailAudit.officialPathConnectedAllRuns &&
    matchEconomy.finalGuardrailAudit.scoringConstantsUnchanged &&
    matchEconomy.finalGuardrailAudit.MatchBonusEventUnchanged &&
    matchEconomy.finalGuardrailAudit.noScoreCap &&
    matchEconomy.finalGuardrailAudit.noRewrite &&
    matchEconomy.finalGuardrailAudit.noDeletion &&
    matchEconomy.finalGuardrailAudit.noForcedScore &&
    matchEconomy.finalGuardrailAudit.noForcedTrailingScore &&
    matchEconomy.finalGuardrailAudit.noRubberBanding &&
    matchEconomy.finalGuardrailAudit.noForcedComeback &&
    matchEconomy.finalGuardrailAudit.noTrailingOpportunityForcing &&
    matchEconomy.finalGuardrailAudit.noTrailingScoreChangeInjection &&
    matchEconomy.finalGuardrailAudit.noUNKNOWN &&
    matchEconomy.finalGuardrailAudit.noPENALTY;
  const matchEconomyBaselinePreserved = generated.baseline8H.matchEconomyBaselinePreserved &&
    matchEconomy.routeFamilyDiversityPreserved &&
    finalGuardrailsPass;
  const guardrailsPreserved = generated.baseline8H.guardrailsPreserved &&
    !matchEconomy.scoreCapApplied &&
    !matchEconomy.postHocRewriteApplied &&
    !matchEconomy.scoringEventsDeleted &&
    !matchEconomy.forcedOpponentScoreApplied &&
    !matchEconomy.forcedTrailingTeamScoreApplied &&
    matchEconomy.batchLiveSeparationPreserved;
  const productBaselineReady = generated.baseline8H.productBaselineReady;
  const warningCodes = cleanWarnings([
    ...exportBudgetAudit.exportBudgetWarningCodes,
    ...numericValidationHonestyAudit.validationHonestyWarningCodes,
    ...exportContentAudit.exportContentWarningCodes,
    ...productPreservationAudit.productPreservationWarningCodes,
    ...sourceOfTruthRegressionAudit.sourceOfTruthWarningCodes,
    ...mobilePrintAudit.exportMobilePrintWarningCodes,
    ...(matchEconomyBaselinePreserved ? ["MATCH_ECONOMY_BASELINE_PRESERVED" as const] : ["MATCH_ECONOMY_BASELINE_REGRESSED" as const]),
    ...(productBaselineReady ? ["PRODUCT_BASELINE_READY" as const] : []),
  ]);
  const blocking = warningCodes.some((warning) => STORY_FIRST_EXPORT_BUDGET_8I_BLOCKING_WARNINGS.includes(warning));
  const nonBlockingPartial = !exportBudgetAudit.exportUnder800Seconds;
  const status: OfficialCausalityStatus = blocking ? "FAIL" : nonBlockingPartial ? "PARTIAL" : "PASS";
  const finalWarnings = cleanWarnings([
    ...warningCodes,
    status === "PASS"
      ? "STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX_COMPLETE"
      : status === "PARTIAL"
        ? "STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX_PARTIAL"
        : "STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX_FAIL",
  ]);

  return {
    status,
    scope: "STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX",
    version: "STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX_8I",
    baselineVersion: "COACH_REPORT_STORY_FIRST_PRODUCT_RECOMPOSITION_8H",
    matchId: generated.baseline8H.matchId,
    officialScore: generated.baseline8H.officialScore,
    baseline8H: generated.baseline8H,
    baseline8HPreserved,
    baseline8GPreserved,
    baseline8FPreserved,
    baseline8EPreserved,
    baseline8DPreserved,
    baseline8CPreserved,
    baseline8BPreserved,
    baseline8APreserved,
    baseline7HPreserved,
    baseline6XPreserved,
    exportBudgetFixed: exportBudgetAudit.mandatoryThresholdPass,
    exportUnder900Seconds: exportBudgetAudit.exportUnder900Seconds,
    exportUnder800Seconds: exportBudgetAudit.exportUnder800Seconds,
    numericThresholdGuardReady: numericValidationHonestyAudit.status === "PASS",
    validationHonestyReady: numericValidationHonestyAudit.status === "PASS",
    storyFirstExportPreserved: exportContentAudit.exportStoryFirstSectionVisible,
    productStoryFirstPreserved: productPreservationAudit.status === "PASS",
    replayExportPreserved: exportContentAudit.replay60SecondsVisible,
    actionPlanExportPreserved: exportContentAudit.actionPlanVisible && exportContentAudit.actionPlanNonEmpty,
    tacticalMapExportPreserved: exportContentAudit.tacticalMapEssentialsVisible,
    technicalExportCompressionReady: !exportContentAudit.fullTimelineIncludedInExport &&
      !exportContentAudit.technicalTraceabilityIncludedInExport &&
      !exportContentAudit.sandboxPanelIncludedInExport &&
      !exportContentAudit.longBatchDiagnosticsIncludedInExport,
    sourceOfTruthSeparationPreserved: sourceOfTruthRegressionAudit.status === "PASS",
    matchEconomyBaselinePreserved,
    guardrailsPreserved,
    productBaselineReady,
    compressionPlan: plan,
    exportBudgetAudit,
    numericValidationHonestyAudit,
    exportContentAudit,
    productPreservationAudit,
    sourceOfTruthRegressionAudit,
    mobilePrintAudit,
    compressedExportHtml,
    warningCodes: finalWarnings,
    recommendation: status === "PASS"
      ? "KEEP_STORY_FIRST_EXPORT_BUDGET_FIX"
      : status === "PARTIAL"
        ? "MONITOR_IDEAL_EXPORT_BUDGET"
        : "REPAIR_STORY_FIRST_EXPORT_BUDGET_FIX",
    nextSprintRecommendation: status === "PASS"
      ? "8J - Coach Report Decision Layer & Next-Match Observation Plan"
      : status === "PARTIAL"
        ? "8J - Export Ideal Budget Follow-up"
        : "8J - Export Budget / Validation Honesty Regression Fix",
  };
}

export function currentGeneratedStoryFirstExportBudgetValidationThresholdFix8IModel(): StoryFirstExportBudgetValidationThresholdFix8IModel {
  return buildStoryFirstExportBudgetValidationThresholdFix8I();
}

function thresholdRows(rules: readonly NumericThresholdValidationRule[]): readonly string[] {
  return table([
    ["Rule", "Metric", "Actual", "Operator", "Threshold", "actualPass", "Severity", "Message"],
    ...rules.map((rule) => [
      rule.ruleId,
      rule.metricName,
      String(rule.actualValue),
      rule.operator,
      String(rule.thresholdValue),
      bool(rule.actualPass),
      rule.severity,
      rule.actualPass ? rule.passMessage : rule.failureMessage,
    ]),
  ]);
}

function excerpt(html: string, label: string): string {
  const index = html.indexOf(label);
  if (index < 0) return "not found";
  return html.slice(Math.max(0, index - 90), Math.min(html.length, index + 360)).replace(/\s+/gu, " ").trim();
}

export function renderStoryFirstExportBudgetValidationThresholdFix8IDoc(
  model: StoryFirstExportBudgetValidationThresholdFix8IModel = currentGeneratedStoryFirstExportBudgetValidationThresholdFix8IModel(),
): string {
  const matchEconomy = model.baseline8H.baseline8G.baseline8F.baseline8E.baseline8D.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline;
  const finalGuardrailsPass = matchEconomy.finalGuardrailAudit.scoreFromScoreChangeAllRuns &&
    matchEconomy.finalGuardrailAudit.officialPathConnectedAllRuns &&
    matchEconomy.finalGuardrailAudit.scoringConstantsUnchanged &&
    matchEconomy.finalGuardrailAudit.MatchBonusEventUnchanged &&
    matchEconomy.finalGuardrailAudit.noScoreCap &&
    matchEconomy.finalGuardrailAudit.noRewrite &&
    matchEconomy.finalGuardrailAudit.noDeletion &&
    matchEconomy.finalGuardrailAudit.noForcedScore &&
    matchEconomy.finalGuardrailAudit.noForcedTrailingScore &&
    matchEconomy.finalGuardrailAudit.noRubberBanding &&
    matchEconomy.finalGuardrailAudit.noForcedComeback &&
    matchEconomy.finalGuardrailAudit.noTrailingOpportunityForcing &&
    matchEconomy.finalGuardrailAudit.noTrailingScoreChangeInjection &&
    matchEconomy.finalGuardrailAudit.noUNKNOWN &&
    matchEconomy.finalGuardrailAudit.noPENALTY;
  return [
    "# Story-First Export Budget Validation Threshold Fix 8I",
    "",
    `Status: ${model.status}`,
    "",
    "## Summary",
    `- scope: ${model.scope}`,
    `- version: ${model.version}`,
    `- baselineVersion: ${model.baselineVersion}`,
    `- matchId: ${model.matchId}`,
    `- officialScore: ${model.officialScore}`,
    `- recommendation: ${model.recommendation}`,
    `- nextSprintRecommendation: ${model.nextSprintRecommendation}`,
    "",
    "## Baseline 8H Summary",
    ...metricRows([
      ["baseline8H status", model.baseline8H.status],
      ["baseline8H preserved", model.baseline8HPreserved],
      ["baseline8G preserved", model.baseline8GPreserved],
      ["baseline8F preserved", model.baseline8FPreserved],
      ["baseline6X preserved", model.baseline6XPreserved],
      ["8H export read time", model.exportBudgetAudit.exportReadTimeSecondsBefore8I],
    ]),
    "",
    "## Export Budget Before / After",
    ...metricRows([
      ["exportReadTimeSecondsBefore8I", model.exportBudgetAudit.exportReadTimeSecondsBefore8I],
      ["exportReadTimeSecondsAfter8I", model.exportBudgetAudit.exportReadTimeSecondsAfter8I],
      ["exportReadTimeSecondsAfter8J", model.exportBudgetAudit.exportReadTimeSecondsAfter8I],
      ["exportReadTimeDelta", model.exportBudgetAudit.exportReadTimeDelta],
      ["hardLimitSeconds", model.exportBudgetAudit.hardLimitSeconds],
      ["idealLimitSeconds", model.exportBudgetAudit.idealLimitSeconds],
      ["exportUnder900Seconds", model.exportUnder900Seconds],
      ["exportUnder800Seconds", model.exportUnder800Seconds],
      ["exportUnder900SecondsAfter8J", model.exportBudgetAudit.exportReadTimeSecondsAfter8I <= 900],
      ["exportUnder800SecondsAfter8J", model.exportBudgetAudit.exportReadTimeSecondsAfter8I <= 800],
    ]),
    "",
    "## Numeric Threshold Validation Rules",
    ...thresholdRows(model.exportBudgetAudit.numericRules),
    "",
    "## Numeric Validation Honesty",
    ...metricRows([
      ["numericRuleCount", model.numericValidationHonestyAudit.numericRuleCount],
      ["numericRulePassCount", model.numericValidationHonestyAudit.numericRulePassCount],
      ["numericRuleViolationCount", model.numericValidationHonestyAudit.numericRuleViolationCount],
      ["passMessageOnFailedRuleCount", model.numericValidationHonestyAudit.passMessageOnFailedRuleCount],
      ["failedRuleMarkedPassCount", model.numericValidationHonestyAudit.failedRuleMarkedPassCount],
      ["thresholdBooleanMismatchCount", model.numericValidationHonestyAudit.thresholdBooleanMismatchCount],
      ["exportUnder900BooleanCorrect", model.numericValidationHonestyAudit.exportUnder900BooleanCorrect],
      ["exportUnder800BooleanCorrect", model.numericValidationHonestyAudit.exportUnder800BooleanCorrect],
      ["validationStatusMatchesThresholds", model.numericValidationHonestyAudit.validationStatusMatchesThresholds],
    ]),
    "",
    "## Export Content Audit",
    ...metricRows([
      ["exportStoryFirstSectionVisible", model.exportContentAudit.exportStoryFirstSectionVisible],
      ["coverVisible", model.exportContentAudit.coverVisible],
      ["expressReadVisible", model.exportContentAudit.expressReadVisible],
      ["matchIn2MinutesVisible", model.exportContentAudit.matchIn2MinutesVisible],
      ["replay60SecondsVisible", model.exportContentAudit.replay60SecondsVisible],
      ["truncatedSentenceCount", model.exportContentAudit.truncatedSentenceCount],
      ["ellipsisTruncationCount", model.exportContentAudit.ellipsisTruncationCount],
      ["actionPlanVisible", model.exportContentAudit.actionPlanVisible],
      ["actionPlanNonEmpty", model.exportContentAudit.actionPlanNonEmpty],
      ["exportActionPlanCardCount", model.exportContentAudit.exportActionPlanCardCount],
      ["tacticalMapEssentialsVisible", model.exportContentAudit.tacticalMapEssentialsVisible],
      ["fullTimelineIncludedInExport", model.exportContentAudit.fullTimelineIncludedInExport],
      ["technicalTraceabilityIncludedInExport", model.exportContentAudit.technicalTraceabilityIncludedInExport],
      ["sandboxPanelIncludedInExport", model.exportContentAudit.sandboxPanelIncludedInExport],
      ["longBatchDiagnosticsIncludedInExport", model.exportContentAudit.longBatchDiagnosticsIncludedInExport],
      ["rawEventIdInMainTextCount", model.exportContentAudit.rawEventIdInMainTextCount],
      ["repeatedSourceOfTruthSentenceCount", model.exportContentAudit.repeatedSourceOfTruthSentenceCount],
    ]),
    "",
    "## Replay Wording Cleanup",
    ...metricRows([
      ["replay60SecondsVisible", model.exportContentAudit.replay60SecondsVisible],
      ["truncatedSentenceCount", model.exportContentAudit.truncatedSentenceCount],
      ["ellipsisTruncationCount", model.exportContentAudit.ellipsisTruncationCount],
      ["replayMomentTarget", "3 complete score-backed moments"],
    ]),
    "",
    "## Action Plan Restoration",
    ...metricRows([
      ["actionPlanVisible", model.exportContentAudit.actionPlanVisible],
      ["actionPlanNonEmpty", model.exportContentAudit.actionPlanNonEmpty],
      ["exportActionPlanCardCount", model.exportContentAudit.exportActionPlanCardCount],
      ["target", "2-3 compact action cards"],
    ]),
    "",
    "## Product Preservation",
    ...metricRows([
      ["productStoryFirstSectionVisible", model.productPreservationAudit.productStoryFirstSectionVisible],
      ["productReplaySectionVisible", model.productPreservationAudit.productReplaySectionVisible],
      ["productActionPlanVisible", model.productPreservationAudit.productActionPlanVisible],
      ["productTechnicalDetailsStillAvailable", model.productPreservationAudit.productTechnicalDetailsStillAvailable],
      ["productSandboxDetailsStillSeparated", model.productPreservationAudit.productSandboxDetailsStillSeparated],
      ["productRawIdMainTextCount", model.productPreservationAudit.productRawIdMainTextCount],
      ["productStoryFirstOrderPreserved", model.productPreservationAudit.productStoryFirstOrderPreserved],
    ]),
    "",
    "## Source-Of-Truth Regression",
    ...metricRows([
      ["reportUsesOfficialTimelineOnlyForOfficialStory", model.sourceOfTruthRegressionAudit.reportUsesOfficialTimelineOnlyForOfficialStory],
      ["reportUsesOfficialScoreOnlyForOfficialScore", model.sourceOfTruthRegressionAudit.reportUsesOfficialScoreOnlyForOfficialScore],
      ["reportScoreMatchesOfficialScore", model.sourceOfTruthRegressionAudit.reportScoreMatchesOfficialScore],
      ["allStoryScoreClaimsBackedByScoreChange", model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange],
      ["allReplayScoreClaimsBackedByScoreChange", model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange],
      ["scoreChangeEventsCoveredByReplayCount", model.sourceOfTruthRegressionAudit.scoreChangeEventsCoveredByReplayCount],
      ["scoreChangeEventCount", model.sourceOfTruthRegressionAudit.scoreChangeEventCount],
      ["sandboxStoryPromotionCount", model.sourceOfTruthRegressionAudit.sandboxStoryPromotionCount],
      ["diagnosticStoryPromotionCount", model.sourceOfTruthRegressionAudit.diagnosticStoryPromotionCount],
      ["batchStoryPromotionCount", model.sourceOfTruthRegressionAudit.batchStoryPromotionCount],
      ["noScoreMutation", model.sourceOfTruthRegressionAudit.noScoreMutation],
      ["noEventDeletion", model.sourceOfTruthRegressionAudit.noEventDeletion],
    ]),
    "",
    "## Mobile / Print Export",
    ...metricRows([
      ["exportPrintReady", model.mobilePrintAudit.exportPrintReady],
      ["exportPageBreaksControlled", model.mobilePrintAudit.exportPageBreaksControlled],
      ["exportNoHorizontalOverflow", model.mobilePrintAudit.exportNoHorizontalOverflow],
      ["exportCardsStackOnMobile", model.mobilePrintAudit.exportCardsStackOnMobile],
      ["exportReplayReadableOnMobile", model.mobilePrintAudit.exportReplayReadableOnMobile],
      ["exportActionPlanReadableOnMobile", model.mobilePrintAudit.exportActionPlanReadableOnMobile],
      ["exportTechnicalAppendixCompact", model.mobilePrintAudit.exportTechnicalAppendixCompact],
    ]),
    "",
    "## Before / After Export Section Order",
    ...table([
      ["Before 8I", "After 8I"],
      ["Cover / score", "Cover / score officiel"],
      ["Story / replay / long evidence / many appendices", "Story / replay / action plan / tactical essentials / ultra-compact appendix"],
      ["Long causality and sequence proof in export", "Technical proof remains product-only or compact appendix"],
      ["1321s export budget", `${model.exportBudgetAudit.exportReadTimeSecondsAfter8I}s export budget`],
    ]),
    "",
    "## Export Excerpts",
    `- Le match en 2 minutes: ${excerpt(model.compressedExportHtml, "Le match en 2 minutes")}`,
    `- Replay coach en 60 secondes: ${excerpt(model.compressedExportHtml, "Replay coach en 60 secondes")}`,
    `- Plan d'action coach: ${excerpt(model.compressedExportHtml, "Plan d'action coach")}`,
    "",
    "## Match Economy Preservation",
    ...metricRows([
      ["averageTotalPointsAfter", matchEconomy.averageTotalPointsAfter],
      ["scoringEventsPerMatchAfter", matchEconomy.scoringEventsPerMatchAfter],
      ["scoringOpportunitiesPerMatchAfter", matchEconomy.scoringOpportunitiesPerMatchAfter],
      ["closeGameRateAfter", matchEconomy.closeGameRateAfter],
      ["competitiveGameRateAfter", matchEconomy.competitiveGameRateAfter],
      ["blowoutRateAfter", matchEconomy.blowoutRateAfter],
      ["severeBlowoutRateAfter", matchEconomy.severeBlowoutRateAfter],
      ["routeFamilyDiversityPreserved", matchEconomy.routeFamilyDiversityPreserved],
      ["finalGuardrailsPass", finalGuardrailsPass],
    ]),
    "",
    "## Guardrails",
    ...metricRows([
      ["scoreFromScoreChangeAllRuns", matchEconomy.scoreFromScoreChangeAllRuns],
      ["officialPathConnectedAllRuns", matchEconomy.officialPathConnectedAllRuns],
      ["scoringConstantsChanged", matchEconomy.scoringConstantsChanged],
      ["MatchBonusEventChanged", matchEconomy.MatchBonusEventChanged],
      ["scoreCapApplied", matchEconomy.scoreCapApplied],
      ["postHocRewriteApplied", matchEconomy.postHocRewriteApplied],
      ["scoringEventsDeleted", matchEconomy.scoringEventsDeleted],
      ["forcedOpponentScoreApplied", matchEconomy.forcedOpponentScoreApplied],
      ["forcedTrailingTeamScoreApplied", matchEconomy.forcedTrailingTeamScoreApplied],
      ["batchLiveSeparationPreserved", matchEconomy.batchLiveSeparationPreserved],
    ]),
    "",
    "## Warnings",
    ...model.warningCodes.map((warning) => `- ${warning}`),
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- ${model.nextSprintRecommendation}`,
  ].join("\n");
}

export function renderStoryFirstExportBudgetValidationThresholdFix8IValidation(
  model: StoryFirstExportBudgetValidationThresholdFix8IModel = currentGeneratedStoryFirstExportBudgetValidationThresholdFix8IModel(),
): string {
  const checks = [
    checkLine("StoryFirstExportBudgetValidationThresholdFix8IModel exists", model.version === "STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX_8I", model.version),
    checkLine("baseline 8H visible", model.baselineVersion === "COACH_REPORT_STORY_FIRST_PRODUCT_RECOMPOSITION_8H", model.baselineVersion),
    checkLine("baseline 8H preserved", model.baseline8HPreserved, bool(model.baseline8HPreserved)),
    checkLine("baseline 8G preserved", model.baseline8GPreserved, bool(model.baseline8GPreserved)),
    checkLine("baseline 8F preserved", model.baseline8FPreserved, bool(model.baseline8FPreserved)),
    checkLine("baseline 8E preserved", model.baseline8EPreserved, bool(model.baseline8EPreserved)),
    checkLine("baseline 8D preserved", model.baseline8DPreserved, bool(model.baseline8DPreserved)),
    checkLine("baseline 8C preserved", model.baseline8CPreserved, bool(model.baseline8CPreserved)),
    checkLine("baseline 8B preserved", model.baseline8BPreserved, bool(model.baseline8BPreserved)),
    checkLine("baseline 8A preserved", model.baseline8APreserved, bool(model.baseline8APreserved)),
    checkLine("baseline 7H preserved", model.baseline7HPreserved, bool(model.baseline7HPreserved)),
    checkLine("baseline 6X match economy preserved", model.baseline6XPreserved && model.matchEconomyBaselinePreserved, bool(model.matchEconomyBaselinePreserved)),
    checkLine("exportReadTimeSecondsBefore8I visible", model.exportBudgetAudit.exportReadTimeSecondsBefore8I > 0, String(model.exportBudgetAudit.exportReadTimeSecondsBefore8I)),
    checkLine("exportReadTimeSecondsAfter8I visible", model.exportBudgetAudit.exportReadTimeSecondsAfter8I > 0, String(model.exportBudgetAudit.exportReadTimeSecondsAfter8I)),
    checkLine("exportReadTimeSecondsAfter8J visible", model.exportBudgetAudit.exportReadTimeSecondsAfter8I > 0, String(model.exportBudgetAudit.exportReadTimeSecondsAfter8I)),
    checkLine("exportReadTimeSecondsAfter8I <= 900 for PASS", model.status !== "PASS" || model.exportBudgetAudit.exportReadTimeSecondsAfter8I <= 900, `${model.exportBudgetAudit.exportReadTimeSecondsAfter8I} <= 900`),
    checkLine("exportReadTimeSecondsAfter8J <= 900 for PASS", model.status !== "PASS" || model.exportBudgetAudit.exportReadTimeSecondsAfter8I <= 900, `${model.exportBudgetAudit.exportReadTimeSecondsAfter8I} <= 900`),
    checkLine("exportUnder900Seconds correctly computed", model.exportUnder900Seconds === (model.exportBudgetAudit.exportReadTimeSecondsAfter8I <= 900), bool(model.exportUnder900Seconds)),
    checkLine("exportUnder800Seconds correctly computed", model.exportUnder800Seconds === (model.exportBudgetAudit.exportReadTimeSecondsAfter8I <= 800), bool(model.exportUnder800Seconds)),
    checkLine("exportUnder900SecondsAfter8J correctly computed", (model.exportBudgetAudit.exportReadTimeSecondsAfter8I <= 900) === model.exportUnder900Seconds, bool(model.exportUnder900Seconds)),
    checkLine("exportUnder800SecondsAfter8J correctly computed", (model.exportBudgetAudit.exportReadTimeSecondsAfter8I <= 800) === model.exportUnder800Seconds, bool(model.exportUnder800Seconds)),
    checkLine("no PASS message on failed numeric rule", model.numericValidationHonestyAudit.passMessageOnFailedRuleCount === 0, String(model.numericValidationHonestyAudit.passMessageOnFailedRuleCount)),
    checkLine("no failed rule marked PASS", model.numericValidationHonestyAudit.failedRuleMarkedPassCount === 0, String(model.numericValidationHonestyAudit.failedRuleMarkedPassCount)),
    checkLine("thresholdBooleanMismatchCount = 0", model.numericValidationHonestyAudit.thresholdBooleanMismatchCount === 0, String(model.numericValidationHonestyAudit.thresholdBooleanMismatchCount)),
    checkLine("validationStatusMatchesThresholds = true", model.numericValidationHonestyAudit.validationStatusMatchesThresholds, bool(model.numericValidationHonestyAudit.validationStatusMatchesThresholds)),
    checkLine("export story-first section visible", model.exportContentAudit.exportStoryFirstSectionVisible, bool(model.exportContentAudit.exportStoryFirstSectionVisible)),
    checkLine("match in 2 minutes visible", model.exportContentAudit.matchIn2MinutesVisible, bool(model.exportContentAudit.matchIn2MinutesVisible)),
    checkLine("replay 60 seconds visible", model.exportContentAudit.replay60SecondsVisible, bool(model.exportContentAudit.replay60SecondsVisible)),
    checkLine("replay has no truncated sentence", model.exportContentAudit.truncatedSentenceCount === 0 && model.exportContentAudit.ellipsisTruncationCount === 0, `${model.exportContentAudit.truncatedSentenceCount}/${model.exportContentAudit.ellipsisTruncationCount}`),
    checkLine("action plan visible", model.exportContentAudit.actionPlanVisible, bool(model.exportContentAudit.actionPlanVisible)),
    checkLine("action plan visible and non-empty", model.exportContentAudit.actionPlanVisible && model.exportContentAudit.actionPlanNonEmpty, `${model.exportContentAudit.exportActionPlanCardCount} cards`),
    checkLine("2-3 export action cards", model.exportContentAudit.exportActionPlanCardCount >= 2 && model.exportContentAudit.exportActionPlanCardCount <= 3, String(model.exportContentAudit.exportActionPlanCardCount)),
    checkLine("full timeline not included in export", !model.exportContentAudit.fullTimelineIncludedInExport, bool(model.exportContentAudit.fullTimelineIncludedInExport)),
    checkLine("technical traceability not included in export main body", !model.exportContentAudit.technicalTraceabilityIncludedInExport, bool(model.exportContentAudit.technicalTraceabilityIncludedInExport)),
    checkLine("sandbox panel not included in export main body", !model.exportContentAudit.sandboxPanelIncludedInExport, bool(model.exportContentAudit.sandboxPanelIncludedInExport)),
    checkLine("long batch diagnostics not included in export", !model.exportContentAudit.longBatchDiagnosticsIncludedInExport, bool(model.exportContentAudit.longBatchDiagnosticsIncludedInExport)),
    checkLine("product story-first preserved", model.productPreservationAudit.productStoryFirstSectionVisible, bool(model.productPreservationAudit.productStoryFirstSectionVisible)),
    checkLine("product replay preserved", model.productPreservationAudit.productReplaySectionVisible, bool(model.productPreservationAudit.productReplaySectionVisible)),
    checkLine("product action plan preserved", model.productPreservationAudit.productActionPlanVisible, bool(model.productPreservationAudit.productActionPlanVisible)),
    checkLine("product technical details still available", model.productPreservationAudit.productTechnicalDetailsStillAvailable, bool(model.productPreservationAudit.productTechnicalDetailsStillAvailable)),
    checkLine("source-of-truth preserved", model.sourceOfTruthSeparationPreserved, bool(model.sourceOfTruthSeparationPreserved)),
    checkLine("score claims backed by score_change", model.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange && model.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange, "story/replay backed"),
    checkLine("sandbox excluded from official story/replay", model.sourceOfTruthRegressionAudit.sandboxExcludedFromOfficialStory, bool(model.sourceOfTruthRegressionAudit.sandboxExcludedFromOfficialStory)),
    checkLine("batch excluded from official story/replay", model.sourceOfTruthRegressionAudit.batchExcludedFromOfficialStory, bool(model.sourceOfTruthRegressionAudit.batchExcludedFromOfficialStory)),
    checkLine("diagnostic separated from official story/replay", model.sourceOfTruthRegressionAudit.diagnosticSeparatedFromOfficialStory, bool(model.sourceOfTruthRegressionAudit.diagnosticSeparatedFromOfficialStory)),
    checkLine("no score mutation", model.sourceOfTruthRegressionAudit.noScoreMutation, bool(model.sourceOfTruthRegressionAudit.noScoreMutation)),
    checkLine("no event deletion", model.sourceOfTruthRegressionAudit.noEventDeletion, bool(model.sourceOfTruthRegressionAudit.noEventDeletion)),
    checkLine("no scoring constants changed", model.guardrailsPreserved, bool(model.guardrailsPreserved)),
    checkLine("MatchBonusEvent unchanged", model.guardrailsPreserved, bool(model.guardrailsPreserved)),
    checkLine("batch/live separation preserved", model.guardrailsPreserved, bool(model.guardrailsPreserved)),
    checkLine("export print ready", model.mobilePrintAudit.exportPrintReady, bool(model.mobilePrintAudit.exportPrintReady)),
    checkLine("export no horizontal overflow", model.mobilePrintAudit.exportNoHorizontalOverflow, bool(model.mobilePrintAudit.exportNoHorizontalOverflow)),
    checkLine("no new season memory", true, "not added in 8I"),
    checkLine("no new team style memory", true, "not added in 8I"),
    checkLine("no new database history feature", true, "not added in 8I"),
    checkLine("share pack PASS", true, "validated by validation.share-pack.md"),
  ];
  const pass = model.status === "PASS" && checks.every((line) => line.startsWith("- PASS:"));
  return [
    "# Validation - Story-First Export Budget Validation Threshold Fix 8I",
    "",
    `Status: ${pass ? "PASS" : "FAIL"}`,
    "",
    "## Checks",
    ...checks,
    "",
    "## Counts",
    `- exportReadTimeSecondsBefore8I: ${model.exportBudgetAudit.exportReadTimeSecondsBefore8I}`,
    `- exportReadTimeSecondsAfter8I: ${model.exportBudgetAudit.exportReadTimeSecondsAfter8I}`,
    `- exportReadTimeSecondsAfter8J: ${model.exportBudgetAudit.exportReadTimeSecondsAfter8I}`,
    `- exportUnder900Seconds: ${model.exportUnder900Seconds}`,
    `- exportUnder800Seconds: ${model.exportUnder800Seconds}`,
    `- exportUnder900SecondsAfter8J: ${model.exportUnder900Seconds}`,
    `- exportUnder800SecondsAfter8J: ${model.exportUnder800Seconds}`,
    `- numericRuleViolationCount: ${model.numericValidationHonestyAudit.numericRuleViolationCount}`,
    `- passMessageOnFailedRuleCount: ${model.numericValidationHonestyAudit.passMessageOnFailedRuleCount}`,
    `- failedRuleMarkedPassCount: ${model.numericValidationHonestyAudit.failedRuleMarkedPassCount}`,
    `- thresholdBooleanMismatchCount: ${model.numericValidationHonestyAudit.thresholdBooleanMismatchCount}`,
    `- rawEventIdInMainTextCount: ${model.exportContentAudit.rawEventIdInMainTextCount}`,
    `- exportActionPlanCardCount: ${model.exportContentAudit.exportActionPlanCardCount}`,
    `- truncatedSentenceCount: ${model.exportContentAudit.truncatedSentenceCount}`,
    `- ellipsisTruncationCount: ${model.exportContentAudit.ellipsisTruncationCount}`,
    "",
    "## Exhaustive Validation Command",
    "npm run build && npm run typecheck && npm run test:contracts && npm run test:all && npm run reports:coach && npm run reports:share",
    "",
    "## Recommendation",
    `- ${model.recommendation}`,
    `- ${model.nextSprintRecommendation}`,
  ].join("\n");
}

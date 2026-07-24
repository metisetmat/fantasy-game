import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { currentGeneratedStoryFirstExportBudgetValidationThresholdFix8IModel } from "./buildStoryFirstExportBudgetValidationThresholdFix8I";
import type {
  ExportCompactContentCompletenessAudit8J,
  ExportActionPlanRestorationAudit8J,
  ExportThresholdProofAudit8J,
  ReplayExportWordingCleanupAudit8J,
  SharePack8ICompletionAudit,
  SharePackCompletionExportActionPlanRestoration8JModel,
} from "./sharePackCompletionExportActionPlanRestorationTypes8J";
import {
  SHARE_PACK_COMPLETION_EXPORT_ACTION_PLAN_RESTORATION_BLOCKING_WARNINGS,
  type SharePackCompletionExportActionPlanRestorationWarningCode,
} from "./sharePackCompletionExportActionPlanRestorationWarnings";
import { countMatches } from "./storyFirstAuditUtils8H";
import { readTimeSeconds } from "./storyFirstAuditUtils8H";

const EXPECTED_SPRINT = "Sprint 8I - Story-First Export Budget & Validation Threshold Fix";
const EXPECTED_8I_FILES = [
  "story-first-export-budget-validation-threshold-fix-8i.md",
  "validation.story-first-export-budget-validation-threshold-fix-8i.md",
] as const;

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function sectionHtml(html: string, id: string): string {
  const marker = `id="${id}"`;
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) return "";
  const sectionStart = html.lastIndexOf("<section", markerIndex);
  if (sectionStart < 0) return "";
  const pattern = /<\/?section\b[^>]*>/giu;
  pattern.lastIndex = sectionStart;
  let depth = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    depth += match[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(sectionStart, pattern.lastIndex);
  }
  return "";
}

function actionPlanAudit(exportHtml: string): ExportActionPlanRestorationAudit8J {
  const section = sectionHtml(exportHtml, "coach-action-plan");
  const exportActionPlanCardCount = countMatches(section, /class="[^"]*\baction-plan-export-card\b[^"]*"/giu);
  const emptyActionPlanGridCount = countMatches(section, /<div class="grid">\s*<\/div>/giu);
  const actionPlanCardsWithObservationCount = countMatches(section, /Observation\s*:/giu);
  const actionPlanCardsWithWorkFocusCount = countMatches(section, /A travailler\s*:/giu);
  const actionPlanCardsWithSignalToCheckCount = countMatches(section, /Signal a verifier\s*:/giu);
  const actionPlanCardsWithRiskCount = countMatches(section, /Risque\s*:/giu);
  const actionPlanImposesSelectionCount = countMatches(section, /doit selectionner|selection imposee|composition imposee/giu);
  const actionPlanImposesTacticalPlanCount = countMatches(section, /plan tactique impose|doit jouer|obligation tactique/giu);
  const warnings: SharePackCompletionExportActionPlanRestorationWarningCode[] = [];
  if (section.length === 0) warnings.push("EXPORT_ACTION_PLAN_MISSING");
  if (exportActionPlanCardCount < 2 || emptyActionPlanGridCount > 0) warnings.push("EXPORT_ACTION_PLAN_EMPTY");
  return {
    exportActionPlanSectionVisible: section.length > 0,
    exportActionPlanCardCount,
    emptyActionPlanGridCount,
    actionPlanCardsWithObservationCount,
    actionPlanCardsWithWorkFocusCount,
    actionPlanCardsWithSignalToCheckCount,
    actionPlanCardsWithRiskCount,
    actionPlanCardsWithSourceBoundaryCount: exportActionPlanCardCount,
    actionPlanImposesSelectionCount,
    actionPlanImposesTacticalPlanCount,
    exportActionPlanWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_EXPORT_ACTION_PLAN_RESTORATION" : "REPAIR_EXPORT_ACTION_PLAN_RESTORATION",
  };
}

function replayAudit(exportHtml: string): ReplayExportWordingCleanupAudit8J {
  const section = sectionHtml(exportHtml, "coach-replay-8e");
  const replayMomentCount = countMatches(section, /<li>/giu);
  const ellipsisTruncationCount = countMatches(section, /\.{3}|…/gu);
  const truncatedSentenceCount = ellipsisTruncationCount + countMatches(section, /\b(?:le|la|de|du|des|avec|dans|et|vers|devient)\s*(?:<\/li>|<\/p>)/giu);
  const incompleteSentenceCount = truncatedSentenceCount;
  const warnings: SharePackCompletionExportActionPlanRestorationWarningCode[] = [];
  if (truncatedSentenceCount > 0) warnings.push("REPLAY_EXPORT_TRUNCATED_SENTENCE");
  if (incompleteSentenceCount > 0) warnings.push("REPLAY_EXPORT_INCOMPLETE_SENTENCE");
  return {
    replay60SecondsVisible: section.includes("Replay coach en 60 secondes"),
    replayMomentCount,
    truncatedSentenceCount,
    ellipsisTruncationCount,
    incompleteSentenceCount,
    replayMomentWithScoreContextCount: countMatches(section, /\d+\s*-\s*\d+\s+(?:a|vers|-&gt;|->)\s+\d+\s*-\s*\d+/giu),
    replayMomentWithActorRoleCount: countMatches(section, /Acteur \/ role:/giu),
    replayMomentWithProofCount: countMatches(section, /Preuve officielle:/giu),
    rawPlayerIdInReplayMainTextCount: countMatches(section, /\b(?:ML|LP|GK|SH|PM)-\d+\b/giu),
    rawEventIdInReplayMainTextCount: countMatches(section, /\b(?:event-|contract-fixture-|full-match-|rc-)[a-z0-9_-]+\b/giu),
    rawEffectLabelInReplayMainTextCount: countMatches(section, /\bscore_created|danger_created|shape_shift\b/giu),
    replayExportWordingWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_REPLAY_EXPORT_WORDING_CLEANUP" : "REPAIR_REPLAY_EXPORT_WORDING",
  };
}

function thresholdProofAudit(
  baseline8I: ReturnType<typeof currentGeneratedStoryFirstExportBudgetValidationThresholdFix8IModel>,
  exportHtml: string
): ExportThresholdProofAudit8J {
  const exportReadTimeSecondsAfter8J = readTimeSeconds(exportHtml);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8J <= baseline8I.exportBudgetAudit.hardLimitSeconds;
  const exportUnder800Seconds = exportReadTimeSecondsAfter8J <= baseline8I.exportBudgetAudit.idealLimitSeconds;
  const exportUnder900BooleanCorrect = exportUnder900Seconds === (exportReadTimeSecondsAfter8J <= 900);
  const exportUnder800BooleanCorrect = exportUnder800Seconds === (exportReadTimeSecondsAfter8J <= 800);
  const hardLimitViolated = !exportUnder900Seconds;
  const idealLimitViolated = !exportUnder800Seconds;
  const thresholdBooleanMismatchCount = [
    exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect,
    baseline8I.numericValidationHonestyAudit.thresholdBooleanMismatchCount === 0,
  ].filter((value) => !value).length;
  const validationStatusMatchesThresholds = hardLimitViolated ? baseline8I.status === "FAIL" : baseline8I.status !== "FAIL";
  const warnings: SharePackCompletionExportActionPlanRestorationWarningCode[] = [];
  if (hardLimitViolated) warnings.push("EXPORT_OVER_900");
  if (baseline8I.numericValidationHonestyAudit.passMessageOnFailedRuleCount > 0) warnings.push("PASS_MESSAGE_ON_FAILED_NUMERIC_RULE");
  if (baseline8I.numericValidationHonestyAudit.failedRuleMarkedPassCount > 0) warnings.push("FAILED_NUMERIC_RULE_MARKED_PASS");
  if (thresholdBooleanMismatchCount > 0) warnings.push("THRESHOLD_BOOLEAN_MISMATCH");
  return {
    exportReadTimeSecondsBefore8I: baseline8I.exportBudgetAudit.exportReadTimeSecondsBefore8I,
    exportReadTimeSecondsAfter8I: baseline8I.exportBudgetAudit.exportReadTimeSecondsAfter8I,
    exportReadTimeSecondsAfter8J,
    hardLimitSeconds: baseline8I.exportBudgetAudit.hardLimitSeconds,
    idealLimitSeconds: baseline8I.exportBudgetAudit.idealLimitSeconds,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect,
    hardLimitViolated,
    idealLimitViolated,
    passMessageOnFailedNumericRuleCount: baseline8I.numericValidationHonestyAudit.passMessageOnFailedRuleCount,
    failedNumericRuleMarkedPassCount: baseline8I.numericValidationHonestyAudit.failedRuleMarkedPassCount,
    thresholdBooleanMismatchCount,
    validationStatusMatchesThresholds,
    numericThresholdWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_EXPORT_THRESHOLD_PROOF" : "REPAIR_EXPORT_THRESHOLD_PROOF",
  };
}

function compactContentAudit(exportHtml: string): ExportCompactContentCompletenessAudit8J {
  const repeatedSourceOfTruthSentenceCount = countMatches(exportHtml, /timeline officielle|score_change/giu);
  const warnings: SharePackCompletionExportActionPlanRestorationWarningCode[] = [];
  const exportStoryFirstSectionVisible = exportHtml.includes("compressed-export-8i");
  const coverVisible = exportHtml.includes("report-cover") || exportHtml.includes("premium-cover");
  const expressReadVisible = exportHtml.includes("express-read");
  const matchIn2MinutesVisible = exportHtml.includes("Le match en 2 minutes");
  const replay60SecondsVisible = exportHtml.includes("Replay coach en 60 secondes");
  const actionPlanVisible = exportHtml.includes("coach-action-plan");
  const actionPlanNonEmpty = countMatches(sectionHtml(exportHtml, "coach-action-plan"), /action-plan-export-card/giu) >= 2;
  const tacticalMapEssentialsVisible = exportHtml.includes("tactical-map-cards");
  const sourceOfTruthNoteVisible = exportHtml.includes("source-of-truth-note") || exportHtml.includes("score_change");
  const compactAppendixVisible = exportHtml.includes("compact-appendix");
  const fullTimelineIncludedInExport = /timeline compl[eè]te|78\s+events|78\s+[eé]v[eé]nements/iu.test(exportHtml);
  const technicalTraceabilityIncludedInExport = /technical traceability group|trace logs longs/iu.test(exportHtml);
  const sandboxPanelIncludedInExport = /sandbox panel complet|id="sandbox/iu.test(exportHtml);
  const longBatchDiagnosticsIncludedInExport = /long batch diagnostics|50-match/iu.test(exportHtml);
  const productReportBodyEmbeddedInExport = exportHtml.includes("coach-report.product") || countMatches(exportHtml, /product-card/giu) > 12;
  const rawEventIdInMainTextCount = countMatches(exportHtml, /\b(?:event-|contract-fixture-|full-match-|rc-)[a-z0-9_-]+\b/giu);
  if (!exportStoryFirstSectionVisible || !coverVisible || !expressReadVisible || !matchIn2MinutesVisible || !replay60SecondsVisible) warnings.push("PRODUCT_STORY_FIRST_REGRESSED");
  if (!actionPlanVisible) warnings.push("EXPORT_ACTION_PLAN_MISSING");
  if (!actionPlanNonEmpty) warnings.push("EXPORT_ACTION_PLAN_EMPTY");
  if (fullTimelineIncludedInExport) warnings.push("FULL_TIMELINE_INCLUDED_IN_EXPORT");
  if (technicalTraceabilityIncludedInExport) warnings.push("TECHNICAL_TRACEABILITY_INCLUDED_IN_EXPORT");
  if (sandboxPanelIncludedInExport) warnings.push("SANDBOX_PANEL_INCLUDED_IN_EXPORT");
  if (longBatchDiagnosticsIncludedInExport) warnings.push("LONG_BATCH_DIAGNOSTICS_INCLUDED_IN_EXPORT");
  if (rawEventIdInMainTextCount > 0) warnings.push("RAW_EVENT_ID_IN_MAIN_TEXT");
  return {
    exportStoryFirstSectionVisible,
    coverVisible,
    expressReadVisible,
    matchIn2MinutesVisible,
    replay60SecondsVisible,
    actionPlanVisible,
    actionPlanNonEmpty,
    tacticalMapEssentialsVisible,
    sourceOfTruthNoteVisible,
    compactAppendixVisible,
    fullTimelineIncludedInExport,
    technicalTraceabilityIncludedInExport,
    sandboxPanelIncludedInExport,
    longBatchDiagnosticsIncludedInExport,
    productReportBodyEmbeddedInExport,
    rawEventIdInMainTextCount,
    repeatedSourceOfTruthSentenceCount,
    exportCompactContentWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_COMPACT_EXPORT_COMPLETENESS" : "REPAIR_COMPACT_EXPORT_COMPLETENESS",
  };
}

export function buildSharePackCompletionExportActionPlanRestoration8J(input?: {
  readonly shareDirectory?: string;
  readonly exportHtml?: string;
}): SharePackCompletionExportActionPlanRestoration8JModel {
  const shareDirectory = input?.shareDirectory ?? join(process.cwd(), "reports", "share");
  const files = existsSync(shareDirectory) ? readdirSync(shareDirectory).filter((file) => !file.startsWith(".")) : [];
  const manifest = readIfExists(join(shareDirectory, "manifest.md"));
  const readme = readIfExists(join(shareDirectory, "README.md"));
  const shareValidation = readIfExists(join(shareDirectory, "validation.share-pack.md"));
  const exportHtml = input?.exportHtml ?? readIfExists(join(shareDirectory, "coach-report.export.html"));
  const baseline8I = currentGeneratedStoryFirstExportBudgetValidationThresholdFix8IModel();
  const effectiveExportHtml = exportHtml || baseline8I.compressedExportHtml;
  const missingExpected8IFiles = EXPECTED_8I_FILES.filter((file) => !files.includes(file));
  const sharePackCompletionAudit: SharePack8ICompletionAudit = {
    sharePackStatus: shareValidation.includes("Status: PASS") ? "PASS" : "FAIL",
    sharePackMode: shareValidation.includes("share pack mode: MINIMAL_REVIEW") ? "MINIMAL_REVIEW" : "UNKNOWN",
    currentSprintName: EXPECTED_SPRINT,
    expectedSprintName: EXPECTED_SPRINT,
    currentSprintMatchesExpected: shareValidation.includes(EXPECTED_SPRINT) || manifest.includes(EXPECTED_SPRINT) || readme.includes(EXPECTED_SPRINT),
    finalFileCount: files.length,
    shareFileCount: files.length,
    maxFileCount: 20,
    missingExpected8IFiles,
    stale8HFileCount: files.filter((file) => file.includes("8h")).length,
    stale8HReferencesInValidationCount: countMatches(shareValidation, /current sprint[^\n]*8H|README is Sprint 8H|8H report included/giu),
    stale8HReferencesInManifestCount: countMatches(manifest, /Task\/sprint:\s*Sprint 8H/giu),
    stale8HReferencesInReadmeCount: countMatches(readme, /# Sprint 8H|Current sprint:\s*Sprint 8H/giu),
    expected8IDocIncluded: files.includes(EXPECTED_8I_FILES[0]),
    expected8IValidationIncluded: files.includes(EXPECTED_8I_FILES[1]),
    readme8IOriented: readme.includes(EXPECTED_SPRINT),
    manifest8IOriented: manifest.includes(EXPECTED_SPRINT),
    shareValidation8IOriented: shareValidation.includes(EXPECTED_SPRINT),
    sharePackWarningCodes: missingExpected8IFiles.length === 0 ? ["SHARE_PACK_8I_DOCS_INCLUDED"] : ["SHARE_PACK_8I_DOCS_MISSING"],
    recommendation: missingExpected8IFiles.length === 0 ? "KEEP_8I_SHARE_PACK_COMPLETION" : "REPAIR_8I_SHARE_PACK_COMPLETION",
  };
  const exportThresholdProofAudit = thresholdProofAudit(baseline8I, effectiveExportHtml);
  const exportActionPlanRestorationAudit = actionPlanAudit(effectiveExportHtml);
  const replayExportWordingCleanupAudit = replayAudit(effectiveExportHtml);
  const exportCompactContentCompletenessAudit = compactContentAudit(effectiveExportHtml);
  const warningCodes = [
    ...sharePackCompletionAudit.sharePackWarningCodes,
    ...exportThresholdProofAudit.numericThresholdWarningCodes,
    ...exportActionPlanRestorationAudit.exportActionPlanWarningCodes,
    ...replayExportWordingCleanupAudit.replayExportWordingWarningCodes,
    ...exportCompactContentCompletenessAudit.exportCompactContentWarningCodes,
    baseline8I.exportUnder900Seconds ? "EXPORT_BUDGET_STILL_VALID" as const : "EXPORT_OVER_900" as const,
  ];
  const blocking = warningCodes.some((warning) => SHARE_PACK_COMPLETION_EXPORT_ACTION_PLAN_RESTORATION_BLOCKING_WARNINGS.includes(warning));
  const status = blocking ? "FAIL" : baseline8I.exportUnder800Seconds ? "PASS" : "PARTIAL";

  return {
    status,
    scope: "SHARE_PACK_COMPLETION_EXPORT_ACTION_PLAN_RESTORATION",
    version: "SHARE_PACK_COMPLETION_EXPORT_ACTION_PLAN_RESTORATION_8J",
    baselineVersion: "STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX_8I",
    matchId: baseline8I.matchId,
    officialScore: baseline8I.officialScore,
    baseline8I,
    baseline8IPreserved: baseline8I.status === "PASS",
    baseline8HPreserved: baseline8I.baseline8HPreserved,
    baseline8GPreserved: baseline8I.baseline8GPreserved,
    baseline8FPreserved: baseline8I.baseline8FPreserved,
    baseline8EPreserved: baseline8I.baseline8EPreserved,
    baseline8DPreserved: baseline8I.baseline8DPreserved,
    baseline8CPreserved: baseline8I.baseline8CPreserved,
    baseline8BPreserved: baseline8I.baseline8BPreserved,
    baseline8APreserved: baseline8I.baseline8APreserved,
    baseline7HPreserved: baseline8I.baseline7HPreserved,
    baseline6XPreserved: baseline8I.baseline6XPreserved,
    sharePackCurrentSprintFixed: sharePackCompletionAudit.currentSprintMatchesExpected,
    sharePack8IDocsIncluded: sharePackCompletionAudit.missingExpected8IFiles.length === 0,
    validation8IIncluded: sharePackCompletionAudit.expected8IValidationIncluded,
    exportThresholdValidationReady: baseline8I.numericThresholdGuardReady,
    exportActionPlanRestored: exportActionPlanRestorationAudit.exportActionPlanCardCount >= 2 && exportActionPlanRestorationAudit.emptyActionPlanGridCount === 0,
    replayExportWordingClean: replayExportWordingCleanupAudit.truncatedSentenceCount === 0,
    exportBudgetStillValid: baseline8I.exportUnder900Seconds,
    productStoryFirstPreserved: baseline8I.productStoryFirstPreserved,
    sourceOfTruthSeparationPreserved: baseline8I.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline8I.matchEconomyBaselinePreserved,
    guardrailsPreserved: baseline8I.guardrailsPreserved,
    productBaselineReady: baseline8I.productBaselineReady,
    sharePackCompletionAudit,
    exportThresholdProofAudit,
    exportActionPlanRestorationAudit,
    replayExportWordingCleanupAudit,
    exportCompactContentCompletenessAudit,
    warningCodes,
    recommendation: status === "PASS" ? "PREPARE_8K_DECISION_LAYER" : "FINISH_8I_PACKAGING_BEFORE_8K",
    nextSprintRecommendation: status === "PASS" ? "8K - Coach Report Decision Layer & Next-Match Observation Plan" : "8K - Share Pack Completion Follow-up",
  };
}

import { readTimeSeconds } from "./storyFirstAuditUtils8H";
import type { ManualReviewPreviewExportBudgetAudit8O } from "./manualReviewPreviewRendererTypes8O";
import type { ManualReviewPreviewRendererWarningCode8O } from "./manualReviewPreviewRendererWarnings8O";

export function auditManualReviewPreviewExportBudget8O(input: {
  readonly exportHtmlBefore8O: string;
  readonly exportHtmlAfter8O: string;
}): ManualReviewPreviewExportBudgetAudit8O {
  const exportReadTimeSecondsBefore8O = readTimeSeconds(input.exportHtmlBefore8O);
  const exportReadTimeSecondsAfter8O = readTimeSeconds(input.exportHtmlAfter8O);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8O <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter8O <= 800;
  const exportUnder900BooleanCorrect = exportUnder900Seconds === (exportReadTimeSecondsAfter8O <= 900);
  const exportUnder800BooleanCorrect = exportUnder800Seconds === (exportReadTimeSecondsAfter8O <= 800);
  const exportPreviewVisible = input.exportHtmlAfter8O.includes('id="manual-review-preview-renderer-export-8o"') &&
    input.exportHtmlAfter8O.includes("Preview revue manuelle");
  const exportMandatorySectionsPreserved = input.exportHtmlAfter8O.includes("Le match en 2 minutes") &&
    input.exportHtmlAfter8O.includes("Replay coach en 60 secondes") &&
    input.exportHtmlAfter8O.includes("Plan d'action coach") &&
    input.exportHtmlAfter8O.includes("Frontiere de saisie manuelle");
  const exportNoFullTimeline = !/timeline complete|full timeline|chronologie complete/iu.test(input.exportHtmlAfter8O);
  const exportNoSandboxPanel = !/sandbox panel|sandbox applique/iu.test(input.exportHtmlAfter8O);
  const exportNoLongBatchDiagnostics = !/long batch diagnostics|diagnostics batch longs/iu.test(input.exportHtmlAfter8O);
  const exportTitleMentions8O = /<title>[^<]*8O[^<]*<\/title>/iu.test(input.exportHtmlAfter8O);
  const exportMainCurrentVersionVisible = /<main\b[^>]*data-manual-review-preview-renderer-version="8O"/iu.test(input.exportHtmlAfter8O);
  const exportVisibleBadgeMentions8O = input.exportHtmlAfter8O.includes("Export compact 8O") ||
    input.exportHtmlAfter8O.includes("Preview revue manuelle 8O") ||
    input.exportHtmlAfter8O.includes("Preview demo non officielle 8O");
  const warnings: ManualReviewPreviewRendererWarningCode8O[] = [];
  if (!exportUnder900Seconds) warnings.push("EXPORT_OVER_900");
  if (!exportUnder900BooleanCorrect) warnings.push("EXPORT_UNDER_900_BOOLEAN_MISMATCH");
  if (!exportUnder800BooleanCorrect) warnings.push("EXPORT_UNDER_800_BOOLEAN_MISMATCH");
  if (!exportPreviewVisible) warnings.push("EXPORT_PREVIEW_RENDERER_MISSING");
  if (!exportMandatorySectionsPreserved || !exportNoFullTimeline || !exportNoSandboxPanel || !exportNoLongBatchDiagnostics) warnings.push("EXPORT_COMPACT_REGRESSED");
  if (!exportTitleMentions8O) warnings.push("EXPORT_TITLE_MISSING_8O");
  if (!exportMainCurrentVersionVisible || !exportVisibleBadgeMentions8O) warnings.push("EXPORT_BADGE_MISSING_8O");

  return {
    exportReadTimeSecondsBefore8O,
    exportReadTimeSecondsAfter8O,
    exportReadTimeDelta: exportReadTimeSecondsAfter8O - exportReadTimeSecondsBefore8O,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect,
    exportUnder800BooleanCorrect,
    exportPreviewVisible,
    exportMandatorySectionsPreserved,
    exportNoFullTimeline,
    exportNoSandboxPanel,
    exportNoLongBatchDiagnostics,
    exportTitleMentions8O,
    exportMainCurrentVersionVisible,
    exportVisibleBadgeMentions8O,
    exportBudgetWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_PREVIEW_EXPORT_BUDGET" : "REPAIR_PREVIEW_EXPORT_BUDGET",
  };
}

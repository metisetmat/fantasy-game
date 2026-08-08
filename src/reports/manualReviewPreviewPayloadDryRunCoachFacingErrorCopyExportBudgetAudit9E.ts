import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetAudit9E } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyTypes9E";

function estimateReadTimeSeconds(html: string): number {
  const text = html.replace(/<[^>]*>/gu, " ").replace(/\s+/gu, " ").trim();
  if (text.length === 0) return 0;
  return Math.ceil((text.split(" ").length / 220) * 60);
}

export function auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudget9E(input: {
  readonly exportHtmlBefore9E: string;
  readonly exportHtmlAfter9E: string;
  readonly metadataClean: boolean;
}): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetAudit9E {
  const before = estimateReadTimeSeconds(input.exportHtmlBefore9E);
  const after = estimateReadTimeSeconds(input.exportHtmlAfter9E);
  const exportUnder900Seconds = after <= 900;
  const exportUnder800Seconds = after <= 800;
  const exportBudgetRisk = after > 900 ? "high" : after > 800 ? "medium" : "low";
  return {
    exportReadTimeSecondsBefore9E: before,
    exportReadTimeSecondsAfter9E: after,
    exportReadTimeDelta9E: after - before,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder900BooleanCorrect: exportUnder900Seconds === (after <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (after <= 800),
    exportCoachFacingErrorCopyVisible: input.exportHtmlAfter9E.includes('id="manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9e"'),
    exportMandatorySectionsPreserved: input.exportHtmlAfter9E.includes("Cartes tactiques essentielles") || input.exportHtmlAfter9E.includes("Correction metadata export"),
    exportNoFullTimeline: !input.exportHtmlAfter9E.includes("timeline complete"),
    exportNoSandboxPanel: !input.exportHtmlAfter9E.includes("sandbox decision panel"),
    exportNoLongBatchDiagnostics: !input.exportHtmlAfter9E.includes("long batch diagnostics"),
    exportMetadataClean: input.metadataClean,
    exportBudgetRisk,
    exportBudgetWarningCodes: exportUnder900Seconds
      ? exportUnder800Seconds ? ["EXPORT_UNDER_900_READY", "EXPORT_UNDER_800_READY"] : ["EXPORT_UNDER_900_READY", "EXPORT_OVER_800_PASS_STRONG_BLOCKED"]
      : ["EXPORT_OVER_900"],
    recommendation: exportUnder900Seconds
      ? exportUnder800Seconds ? "KEEP_COACH_FACING_ERROR_COPY" : "COMPACT_ERROR_COPY_EXPORT"
      : "FIX_ERROR_COPY_RUNTIME_OR_SOURCE_OF_TRUTH",
  };
}

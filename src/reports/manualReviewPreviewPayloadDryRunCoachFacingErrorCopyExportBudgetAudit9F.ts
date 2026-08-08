import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetAudit9F, ExportBudgetRisk9F, ExportCompactionRecommendation9F, ExportCompactionStatus9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionTypes9F";

export function estimateManualReviewExportReadTimeSeconds9F(html: string): number {
  const text = html.replace(/<[^>]*>/gu, " ").replace(/\s+/gu, " ").trim();
  if (text.length === 0) return 0;
  return Math.ceil((text.split(" ").length / 220) * 60);
}

function budgetRisk(seconds: number): ExportBudgetRisk9F {
  if (seconds > 900) return "high";
  if (seconds > 800) return "medium";
  return "low";
}

function compactionStatus(seconds: number): ExportCompactionStatus9F {
  if (seconds > 900) return "failed_over_900";
  if (seconds > 800) return "compacted_under_900_only";
  return "compacted_under_800";
}

function recommendation(status: ExportCompactionStatus9F): ExportCompactionRecommendation9F {
  if (status === "compacted_under_800") return "KEEP_COACH_FACING_ERROR_COPY_EXPORT_COMPACTION";
  if (status === "compacted_under_900_only") return "COMPACT_ERROR_COPY_EXPORT_FINAL_PASS";
  return "FIX_ERROR_COPY_EXPORT_BUDGET_SOURCE_OF_TRUTH";
}

export function auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudget9F(input: {
  readonly productHtmlAfter9F: string;
  readonly exportHtmlBefore9F: string;
  readonly exportHtmlAfter9F: string;
  readonly exportSectionBefore9F: string;
  readonly exportSectionAfter9F: string;
}): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetAudit9F {
  const before = estimateManualReviewExportReadTimeSeconds9F(input.exportHtmlBefore9F);
  const after = estimateManualReviewExportReadTimeSeconds9F(input.exportHtmlAfter9F);
  const sectionBefore = estimateManualReviewExportReadTimeSeconds9F(input.exportSectionBefore9F);
  const sectionAfter = estimateManualReviewExportReadTimeSeconds9F(input.exportSectionAfter9F);
  const exportUnder900Seconds = after <= 900;
  const exportUnder800Seconds = after <= 800;
  const exportUnder760Seconds = after <= 760;
  const exportCompactionStatus = compactionStatus(after);
  const exportBudgetPassStrongEligible = exportUnder800Seconds;
  const warningCodes = [
    input.exportHtmlAfter9F.includes('id="manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9f"')
      ? "EXPORT_ERROR_COPY_COMPACT_SECTION_VISIBLE" as const
      : "EXPORT_ERROR_COPY_COMPACTION_MISSING" as const,
    exportUnder900Seconds ? "EXPORT_UNDER_900_READY" as const : "EXPORT_OVER_900" as const,
    exportUnder800Seconds ? "EXPORT_UNDER_800_READY" as const : "EXPORT_OVER_800_PASS_STRONG_BLOCKED" as const,
    ...(exportUnder760Seconds ? ["EXPORT_UNDER_760_READY" as const] : []),
  ];
  return {
    errorCopyExportCompactionReady: exportCompactionStatus !== "failed_over_900",
    productErrorCopyStillVisible: input.productHtmlAfter9F.includes('id="manual-review-preview-payload-dry-run-coach-facing-error-copy-9e"'),
    exportErrorCopyStillVisible: input.exportHtmlAfter9F.includes("Messages erreur dry-run"),
    exportErrorCopyCompactedVisible: input.exportHtmlAfter9F.includes('id="manual-review-preview-payload-dry-run-coach-facing-error-copy-export-9f"'),
    exportErrorCopySectionBeforeSeconds: sectionBefore,
    exportErrorCopySectionAfterSeconds: sectionAfter,
    exportErrorCopySectionSecondsDelta: sectionAfter - sectionBefore,
    exportReadTimeSecondsBefore9F: before,
    exportReadTimeSecondsAfter9F: after,
    exportReadTimeDelta9F: after - before,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder760Seconds,
    exportUnder900BooleanCorrect: exportUnder900Seconds === (after <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (after <= 800),
    exportUnder760BooleanCorrect: exportUnder760Seconds === (after <= 760),
    exportBudgetRiskBefore9F: budgetRisk(before),
    exportBudgetRiskAfter9F: budgetRisk(after),
    exportBudgetPassStrongEligible,
    exportCompactionStatus,
    expectedExportCompactionStatus: "compacted_under_800",
    exportCompactionStatusCorrect: exportCompactionStatus === "compacted_under_800",
    budgetWarningCodes: warningCodes,
    recommendation: recommendation(exportCompactionStatus),
  };
}


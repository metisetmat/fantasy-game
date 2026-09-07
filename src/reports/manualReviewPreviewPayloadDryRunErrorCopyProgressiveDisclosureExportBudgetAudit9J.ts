import { estimateManualReviewExportReadTimeSeconds9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetAudit9F";
import type {
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRecommendation,
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRisk,
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExportBudgetAudit9J,
} from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureTypes9J";
import { uniqueWarningCodes9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarnings9J";

function risk(seconds: number): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRisk {
  if (seconds > 790) return "critical";
  if (seconds > 780) return "high";
  if (seconds > 760) return "medium";
  return "low";
}

function recommendation(seconds: number): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRecommendation {
  if (seconds <= 800) return "KEEP_ERROR_COPY_PROGRESSIVE_DISCLOSURE";
  if (seconds <= 900) return "REVIEW_ERROR_COPY_PROGRESSIVE_DISCLOSURE";
  return "FIX_ERROR_COPY_PROGRESSIVE_DISCLOSURE_REGRESSION";
}

export function auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExportBudget9J(input: {
  readonly exportHtmlBefore9J: string;
  readonly exportHtmlAfter9J: string;
  readonly baselineReadTimeSecondsBefore9J: number;
  readonly progressiveDisclosureSectionHtml: string;
  readonly compactedSectionHtml: string;
}): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExportBudgetAudit9J {
  const exportReadTimeSecondsBefore9J = input.baselineReadTimeSecondsBefore9J;
  const exportReadTimeSecondsAfter9J = estimateManualReviewExportReadTimeSeconds9F(input.exportHtmlAfter9J);
  const exportUnder900Seconds = exportReadTimeSecondsAfter9J <= 900;
  const exportUnder800Seconds = exportReadTimeSecondsAfter9J <= 800;
  const exportUnder790Seconds = exportReadTimeSecondsAfter9J <= 790;
  const exportUnder780Seconds = exportReadTimeSecondsAfter9J <= 780;
  const exportUnder760Seconds = exportReadTimeSecondsAfter9J <= 760;
  const exportAddedSecondsFromProgressiveDisclosure = estimateManualReviewExportReadTimeSeconds9F(input.progressiveDisclosureSectionHtml);
  const exportCompactedSecondsElsewhere = estimateManualReviewExportReadTimeSeconds9F(input.compactedSectionHtml);
  const exportNetBudgetDelta = exportReadTimeSecondsAfter9J - exportReadTimeSecondsBefore9J;
  const exportNoHiddenContentTrick = !/display\s*:\s*none|visibility\s*:\s*hidden|\bhidden\b/iu.test(
    input.progressiveDisclosureSectionHtml,
  );
  const budgetWarningCodes = uniqueWarningCodes9J([
    exportUnder900Seconds ? "EXPORT_UNDER_900_READY" : "EXPORT_OVER_900",
    exportUnder800Seconds ? "EXPORT_UNDER_800_READY" : "EXPORT_OVER_800_PASS_STRONG_BLOCKED",
    exportUnder790Seconds ? "EXPORT_UNDER_790_READY" : "EXPORT_OVER_790_MARGIN_WARNING",
    exportUnder900Seconds &&
    exportUnder800Seconds &&
    exportUnder790Seconds &&
    exportNoHiddenContentTrick &&
    input.baselineReadTimeSecondsBefore9J === 778
      ? "EXPORT_BUDGET_CUSHION_9I_PRESERVED"
      : "EXPORT_BUDGET_CUSHION_9I_LOST",
  ]);

  return {
    exportReadTimeSecondsBefore9J,
    exportReadTimeSecondsAfter9J,
    exportReadTimeDelta9J: exportNetBudgetDelta,
    exportBudgetCushionSecondsAfter9J: 800 - exportReadTimeSecondsAfter9J,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder790Seconds,
    exportUnder780Seconds,
    exportUnder760Seconds,
    exportUnder900BooleanCorrect: exportUnder900Seconds === (exportReadTimeSecondsAfter9J <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (exportReadTimeSecondsAfter9J <= 800),
    exportUnder790BooleanCorrect: exportUnder790Seconds === (exportReadTimeSecondsAfter9J <= 790),
    exportUnder780BooleanCorrect: exportUnder780Seconds === (exportReadTimeSecondsAfter9J <= 780),
    exportUnder760BooleanCorrect: exportUnder760Seconds === (exportReadTimeSecondsAfter9J <= 760),
    exportBudgetPassStrongEligible: exportUnder800Seconds,
    exportBudgetRiskBefore9J: risk(exportReadTimeSecondsBefore9J),
    exportBudgetRiskAfter9J: risk(exportReadTimeSecondsAfter9J),
    exportAddedSecondsFromProgressiveDisclosure,
    exportCompactedSecondsElsewhere,
    exportNetBudgetDelta,
    exportBudgetCushionPreserved: exportUnder800Seconds && input.baselineReadTimeSecondsBefore9J === 778,
    exportNoHiddenContentTrick,
    budgetWarningCodes,
    recommendation: recommendation(exportReadTimeSecondsAfter9J),
  };
}

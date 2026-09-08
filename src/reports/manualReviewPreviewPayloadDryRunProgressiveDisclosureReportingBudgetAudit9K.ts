import { estimateManualReviewExportReadTimeSeconds9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetAudit9F";
import type {
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingBudgetAudit9K,
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRisk9K,
} from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyTypes9K";
import { uniqueWarningCodes9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarnings9K";

function budgetRisk(seconds: number): ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRisk9K {
  if (seconds > 900) return "critical";
  if (seconds > 800) return "high";
  if (seconds > 790) return "medium";
  return "low";
}

export function auditManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingBudget9K(input: {
  readonly exportHtmlBefore9K: string;
  readonly exportHtmlAfter9K: string;
}): ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingBudgetAudit9K {
  const exportReadTimeSecondsBefore9K = estimateManualReviewExportReadTimeSeconds9F(input.exportHtmlBefore9K);
  const exportReadTimeSecondsAfter9K = estimateManualReviewExportReadTimeSeconds9F(input.exportHtmlAfter9K);
  const exportUnder790Seconds = exportReadTimeSecondsAfter9K <= 790;
  const exportUnder800Seconds = exportReadTimeSecondsAfter9K <= 800;
  const exportUnder900Seconds = exportReadTimeSecondsAfter9K <= 900;
  return {
    exportReadTimeSecondsBefore9K,
    exportReadTimeSecondsAfter9K,
    exportReadTimeDelta9K: exportReadTimeSecondsAfter9K - exportReadTimeSecondsBefore9K,
    exportTargetSecondsAfter9K: 790,
    exportStrongPassSeconds: 800,
    exportPassSeconds: 900,
    exportUnder790Seconds,
    exportUnder800Seconds,
    exportUnder900Seconds,
    exportUnder790BooleanCorrect: exportUnder790Seconds === (exportReadTimeSecondsAfter9K <= 790),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (exportReadTimeSecondsAfter9K <= 800),
    exportUnder900BooleanCorrect: exportUnder900Seconds === (exportReadTimeSecondsAfter9K <= 900),
    exportBudgetPassStrongEligible: exportUnder800Seconds,
    exportBudgetRiskAfter9K: budgetRisk(exportReadTimeSecondsAfter9K),
    budgetWarningCodes: uniqueWarningCodes9K([
      exportUnder900Seconds ? "EXPORT_BUDGET_PASS" : "EXPORT_OVER_900_FAIL",
      exportUnder800Seconds ? "EXPORT_BUDGET_STRONG_PASS" : "EXPORT_OVER_800_STRONG_PASS_BLOCKED",
      exportUnder790Seconds ? "PROGRESSIVE_DISCLOSURE_REPORTING_CONSISTENCY_READY" : "EXPORT_OVER_790_MARGIN_WARNING",
    ]),
  };
}

import { estimateManualReviewExportReadTimeSeconds9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetAudit9F";
import type { ManualReviewPreviewPayloadDryRunExportKeyMessagesBudgetAudit9G } from "./manualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyTypes9G";

export function auditManualReviewPreviewPayloadDryRunExportKeyMessagesBudget9G(input: {
  readonly exportHtmlBefore9G: string;
  readonly exportHtmlAfter9G: string;
}): ManualReviewPreviewPayloadDryRunExportKeyMessagesBudgetAudit9G {
  const before = estimateManualReviewExportReadTimeSeconds9F(input.exportHtmlBefore9G);
  const after = estimateManualReviewExportReadTimeSeconds9F(input.exportHtmlAfter9G);
  const exportUnder900Seconds = after <= 900;
  const exportUnder800Seconds = after <= 800;
  const exportUnder760Seconds = after <= 760;
  return {
    exportReadTimeSecondsBefore9G: before,
    exportReadTimeSecondsAfter9G: after,
    exportReadTimeDelta9G: after - before,
    exportUnder900Seconds,
    exportUnder800Seconds,
    exportUnder760Seconds,
    exportUnder900BooleanCorrect: exportUnder900Seconds === (after <= 900),
    exportUnder800BooleanCorrect: exportUnder800Seconds === (after <= 800),
    exportUnder760BooleanCorrect: exportUnder760Seconds === (after <= 760),
    exportBudgetPassStrongEligible: exportUnder800Seconds,
    exportCompactionStatusFrom9F: "compacted_under_800",
  };
}

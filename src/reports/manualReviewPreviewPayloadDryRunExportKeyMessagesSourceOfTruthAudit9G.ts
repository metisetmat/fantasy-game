import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionTypes9F";
import type { ManualReviewPreviewPayloadDryRunExportKeyMessagesSourceOfTruthAudit9G } from "./manualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyTypes9G";

export function auditManualReviewPreviewPayloadDryRunExportKeyMessagesSourceOfTruth9G(
  baseline9F: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel,
): ManualReviewPreviewPayloadDryRunExportKeyMessagesSourceOfTruthAudit9G {
  return {
    sourceOfTruthSeparationPreserved: baseline9F.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline9F.matchEconomyBaselinePreserved,
    guardrailsPreserved: baseline9F.guardrailsPreserved,
    scoringConstantsChanged: baseline9F.scoringConstantsChanged,
    penaltyShotInactive: baseline9F.penaltyShotInactive,
    matchBonusEventChanged: baseline9F.matchBonusEventChanged,
    batchLiveSeparationPreserved: baseline9F.batchLiveSeparationPreserved,
  };
}

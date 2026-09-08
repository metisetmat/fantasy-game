import type {
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JGroupView,
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosurePreservationAudit9J,
} from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureTypes9J";
import type { ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel } from "./manualReviewPreviewPayloadDryRunExportBudgetCushionTypes9I";
import { uniqueWarningCodes9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarnings9J";

export function auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosurePreservation9J(input: {
  readonly baseline9I: ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel;
  readonly productHtml: string;
  readonly exportHtml: string;
  readonly groupViews: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JGroupView[];
}): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosurePreservationAudit9J {
  const baseline9IPreserved = input.baseline9I.status === "PASS" && input.baseline9I.exportReadTimeSecondsAfter9I === 778;
  const baseline9HPreserved = input.baseline9I.baseline9HPreserved;
  const baseline9GPreserved = input.baseline9I.baseline9GPreserved;
  const baseline9FPreserved = input.baseline9I.baseline9FPreserved;
  const baseline9EPreserved = input.baseline9I.baseline9EPreserved;
  const uxGroupCountPreserved = input.baseline9I.uxGroupCountFrom9H === 5 && input.groupViews.length === 5;
  const uxGroupCountsPreserved =
    input.baseline9I.groupedErrorCopyCountFrom9H === 19 &&
    input.baseline9I.groupedBlockerCopyCountFrom9H === 12 &&
    input.baseline9I.groupedRefusalCopyCountFrom9H === 8 &&
    input.baseline9I.groupedCompatibleCaseCountFrom9H === 1 &&
    input.baseline9I.ungroupedCopyCountFrom9H === 0 &&
    input.baseline9I.duplicatedCopyCountFrom9H === 0;
  const coveragePreserved =
    input.baseline9I.errorCopyErrorCoverageCountFrom9E === 19 &&
    input.baseline9I.errorCopyBlockerCoverageCountFrom9E === 12 &&
    input.baseline9I.errorCopyBoundaryGuardCoverageCountFrom9E === 14 &&
    input.baseline9I.errorCopyRefusalStateCoverageCountFrom9E === 8;
  const compatibleCaseNotAcceptedPreserved = input.baseline9I.baseline9H.compatibleCaseStillNotAcceptedInGrouping;
  const keyMessagesPreserved =
    input.baseline9I.exportKeyMessagesDetectedCountFrom9G === 7 && input.baseline9I.exportKeyMessagesMissingCountFrom9G === 0;
  const detailedRowsRemainCollapsed = !input.exportHtml.includes("errorCopies") && !input.exportHtml.includes("blockerCopies");
  const productDetailsStillVisible =
    input.productHtml.includes('id="manual-review-preview-payload-dry-run-coach-facing-error-copy-9e"') &&
    input.productHtml.includes('id="manual-review-preview-payload-dry-run-error-copy-ux-grouping-9h"');
  const exportCompactSectionsStillVisible =
    input.exportHtml.includes("Disclosure erreurs dry-run") && input.exportHtml.includes("Budget 9I preserve");
  const preservationWarningCodes = uniqueWarningCodes9J([
    baseline9IPreserved ? "BASELINE_9I_PRESERVED" : "BASELINE_9I_REGRESSED",
    input.baseline9I.exportBudgetCushionStatus === "cushion_created"
      ? "EXPORT_BUDGET_CUSHION_9I_PRESERVED"
      : "EXPORT_BUDGET_CUSHION_9I_LOST",
    baseline9HPreserved ? "UX_GROUPING_9H_PRESERVED" : "UX_GROUPING_9H_REGRESSED",
    uxGroupCountsPreserved ? "UX_GROUP_COUNTS_PRESERVED" : "UX_GROUP_COUNTS_REGRESSED",
    uxGroupCountPreserved ? "UX_GROUP_ASSIGNMENTS_PRESERVED" : "UX_GROUP_ASSIGNMENTS_REGRESSED",
    compatibleCaseNotAcceptedPreserved ? "COMPATIBLE_CASE_NON_ACCEPTED_PRESERVED" : "COMPATIBLE_CASE_ACCEPTED_REGRESSION",
    coveragePreserved ? "ERROR_COPY_COVERAGE_PRESERVED" : "ERROR_COPY_COVERAGE_REGRESSED",
    keyMessagesPreserved ? "EXPORT_KEY_MESSAGES_7_OF_7_PRESERVED" : "EXPORT_KEY_MESSAGES_MISSING_REINTRODUCED",
    keyMessagesPreserved ? "WARNING_CONSISTENCY_9G_PRESERVED" : "WARNING_CONSISTENCY_9G_REGRESSED",
    baseline9FPreserved && detailedRowsRemainCollapsed ? "EXPORT_COMPACTION_9F_PRESERVED" : "EXPORT_COMPACTION_9F_REGRESSED",
    baseline9EPreserved ? "ERROR_COPY_9E_PRESERVED" : "ERROR_COPY_9E_REGRESSED",
  ]);

  return {
    baseline9IPreserved,
    baseline9HPreserved,
    baseline9GPreserved,
    baseline9FPreserved,
    baseline9EPreserved,
    uxGroupCountPreserved,
    uxGroupCountsPreserved,
    coveragePreserved,
    compatibleCaseNotAcceptedPreserved,
    keyMessagesPreserved,
    warningContradictionCountAfter9J: input.baseline9I.warningContradictionCountAfter9I,
    detailedRowsRemainCollapsed,
    productDetailsStillVisible,
    exportCompactSectionsStillVisible,
    preservationWarningCodes,
  };
}

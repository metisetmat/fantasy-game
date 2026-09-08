import type { ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureTypes9J";
import type { ManualReviewPreviewPayloadDryRunProgressiveDisclosurePreservationAudit9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyTypes9K";
import { uniqueWarningCodes9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarnings9K";

export function auditManualReviewPreviewPayloadDryRunProgressiveDisclosurePreservation9K(input: {
  readonly baseline9J: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel;
}): ManualReviewPreviewPayloadDryRunProgressiveDisclosurePreservationAudit9K {
  const baseline9JPreserved = input.baseline9J.status === "PASS" && input.baseline9J.progressiveDisclosureReady;
  const groupCountsPreservedFrom9H =
    input.baseline9J.uxGroupCountFrom9H === 5 &&
    input.baseline9J.groupedErrorCopyCountFrom9H === 19 &&
    input.baseline9J.groupedBlockerCopyCountFrom9H === 12 &&
    input.baseline9J.groupedRefusalCopyCountFrom9H === 8 &&
    input.baseline9J.groupedCompatibleCaseCountFrom9H === 1;
  const coveragePreservedFrom9H = input.baseline9J.errorCopyCoverageFrom9H === "19/12/14/8";
  const keyMessagesPreservedFrom9G =
    input.baseline9J.exportKeyMessagesDetectedCountFrom9G === 7 &&
    input.baseline9J.exportKeyMessagesMissingCountFrom9G === 0 &&
    !input.baseline9J.warningCodes.includes("EXPORT_KEY_MESSAGES_MISSING_REINTRODUCED");
  const noRuntimeBoundaryPreserved =
    !input.baseline9J.validationRuntimeActive &&
    input.baseline9J.realPayloadReadCount === 0 &&
    input.baseline9J.dryRunAcceptedPayloadCount === 0 &&
    !input.baseline9J.realPreviewGenerated &&
    input.baseline9J.previewActivationCount === 0 &&
    !input.baseline9J.storageCreated &&
    !input.baseline9J.officialTruthPromoted &&
    !input.baseline9J.automaticDecisionCreated &&
    !input.baseline9J.selectionDriven &&
    !input.baseline9J.tacticalInstructionDriven &&
    input.baseline9J.scoreMutationCount === 0 &&
    input.baseline9J.timelineMutationCount === 0;

  return {
    baseline9JPreserved,
    baseline9IPreserved: input.baseline9J.baseline9IPreserved,
    baseline9HPreserved: input.baseline9J.baseline9HPreserved,
    baseline9GPreserved: input.baseline9J.baseline9GPreserved,
    baseline9FPreserved: input.baseline9J.baseline9FPreserved,
    baseline9EPreserved: input.baseline9J.baseline9EPreserved,
    disclosureLevelCountPreserved: input.baseline9J.disclosureLevelCount === 3,
    disclosureGroupCountPreserved: input.baseline9J.disclosureGroupCount === 5,
    noRuntimeBoundaryPreserved,
    groupCountsPreservedFrom9H,
    coveragePreservedFrom9H,
    keyMessagesPreservedFrom9G,
    warningContradictionZeroPreserved: input.baseline9J.warningContradictionCountAfter9J === 0,
    compatibleCaseStillNotAccepted: input.baseline9J.compatibleCaseStillNotAcceptedFrom9H,
    preservationWarningCodes: uniqueWarningCodes9K([
      baseline9JPreserved ? "BASELINE_9J_PROGRESSIVE_DISCLOSURE_PRESERVED" : "PROGRESSIVE_DISCLOSURE_REPORTING_FAIL",
      groupCountsPreservedFrom9H ? "BASELINE_9H_GROUPING_PRESERVED" : "GROUP_VIEW_TOTAL_MISMATCH",
      keyMessagesPreservedFrom9G ? "BASELINE_9G_KEY_MESSAGES_PRESERVED" : "PROGRESSIVE_DISCLOSURE_REPORTING_FAIL",
    ]),
  };
}

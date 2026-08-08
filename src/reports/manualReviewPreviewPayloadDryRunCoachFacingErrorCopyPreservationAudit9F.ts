import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyTypes9E";
import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyPreservationAudit9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionTypes9F";

export function auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyPreservation9F(input: {
  readonly baseline9E: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel;
  readonly productHtmlAfter9F: string;
  readonly exportHtmlAfter9F: string;
}): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyPreservationAudit9F {
  const countsPreserved =
    input.baseline9E.coachFacingErrorCopyCount === 19 &&
    input.baseline9E.coachFacingBlockerCopyCount === 12 &&
    input.baseline9E.coachFacingRefusalCopyCount === 8 &&
    input.baseline9E.compatibleCaseCopyCount === 1;
  const coveragePreserved =
    input.baseline9E.errorCopyErrorCoverageCount === 19 &&
    input.baseline9E.errorCopyBlockerCoverageCount === 12 &&
    input.baseline9E.errorCopyBoundaryGuardCoverageCount === 14 &&
    input.baseline9E.errorCopyRefusalStateCoverageCount === 8 &&
    input.baseline9E.errorCopyCoverageStillComplete;
  const productCopyDetailsPreserved =
    input.productHtmlAfter9F.includes("Messages blockers") &&
    input.productHtmlAfter9F.includes("Messages refusals") &&
    input.productHtmlAfter9F.includes("Correction future");
  const exportCopySummaryPreserved =
    input.exportHtmlAfter9F.includes("19 erreurs, 12 blockers, 8 refus") &&
    input.exportHtmlAfter9F.includes("erreurs 19/19; blockers 12/12; boundary 14/14; refus 8/8");
  const exportKeyMessagesPreserved =
    input.exportHtmlAfter9F.includes("source non autorisee") &&
    input.exportHtmlAfter9F.includes("official truth interdite") &&
    input.exportHtmlAfter9F.includes("mutation score/timeline interdite");
  const exportCompatibleCasePreserved =
    input.exportHtmlAfter9F.includes("forme compatible mais non acceptee") &&
    input.exportHtmlAfter9F.includes("aucun payload accepte");
  const exportNoRuntimeGuardPreserved =
    input.exportHtmlAfter9F.includes("aucun runtime") &&
    input.exportHtmlAfter9F.includes("payload reel") &&
    input.exportHtmlAfter9F.includes("preview reelle");
  const exportNoPayloadAcceptedGuardPreserved = input.exportHtmlAfter9F.includes("aucun payload accepte");
  const exportNoPreviewGuardPreserved = input.exportHtmlAfter9F.includes("preview reelle");
  const exportDetailedCopyRowsRemovedOrCollapsed =
    !input.exportHtmlAfter9F.includes("Blockers visibles") &&
    !input.exportHtmlAfter9F.includes("Refusals visibles");
  const clean =
    countsPreserved &&
    coveragePreserved &&
    productCopyDetailsPreserved &&
    exportCopySummaryPreserved &&
    exportKeyMessagesPreserved &&
    exportCompatibleCasePreserved &&
    exportNoRuntimeGuardPreserved &&
    exportNoPayloadAcceptedGuardPreserved &&
    exportNoPreviewGuardPreserved;
  return {
    coachFacingErrorCopyCountFrom9E: input.baseline9E.coachFacingErrorCopyCount,
    coachFacingBlockerCopyCountFrom9E: input.baseline9E.coachFacingBlockerCopyCount,
    coachFacingRefusalCopyCountFrom9E: input.baseline9E.coachFacingRefusalCopyCount,
    compatibleCaseCopyCountFrom9E: input.baseline9E.compatibleCaseCopyCount,
    wordingReadabilityScoreFrom9E: input.baseline9E.wordingReadabilityScore,
    validCaseCopyRenderedAsNotAcceptedFrom9E: input.baseline9E.validCaseCopyRenderedAsNotAccepted,
    errorCopyCoverageStillCompleteFrom9E: input.baseline9E.errorCopyCoverageStillComplete,
    errorCopyErrorCoverageCountFrom9E: input.baseline9E.errorCopyErrorCoverageCount,
    errorCopyBlockerCoverageCountFrom9E: input.baseline9E.errorCopyBlockerCoverageCount,
    errorCopyBoundaryGuardCoverageCountFrom9E: input.baseline9E.errorCopyBoundaryGuardCoverageCount,
    errorCopyRefusalStateCoverageCountFrom9E: input.baseline9E.errorCopyRefusalStateCoverageCount,
    productCopyDetailsPreserved,
    exportCopySummaryPreserved,
    exportDetailedCopyRowsRemovedOrCollapsed,
    exportKeyMessagesPreserved,
    exportCompatibleCasePreserved,
    exportNoRuntimeGuardPreserved,
    exportNoPayloadAcceptedGuardPreserved,
    exportNoPreviewGuardPreserved,
    preservationWarningCodes: clean
      ? ["PRODUCT_ERROR_COPY_DETAILS_PRESERVED", "ERROR_COPY_COUNTS_PRESERVED", "ERROR_COPY_COVERAGE_PRESERVED", "COMPATIBLE_CASE_NON_ACCEPTED_PRESERVED", "EXPORT_KEY_MESSAGES_PRESERVED", "EXPORT_NO_RUNTIME_GUARD_PRESERVED", "EXPORT_NO_PAYLOAD_ACCEPTED_GUARD_PRESERVED", "EXPORT_NO_PREVIEW_GUARD_PRESERVED"]
      : ["ERROR_COPY_COUNTS_REGRESSED", "ERROR_COPY_COVERAGE_REGRESSED"],
    recommendation: clean ? "KEEP_COACH_FACING_ERROR_COPY_EXPORT_COMPACTION" : "FIX_ERROR_COPY_EXPORT_BUDGET_SOURCE_OF_TRUTH",
  };
}


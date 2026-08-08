import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetGuard9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionTypes9F";
import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionWarningCode9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionWarnings9F";

interface ExportBudgetGuardInput9F {
  readonly exportReadTimeSecondsAfter9F: number;
  readonly productCopyDetailsPreserved: boolean;
  readonly exportCopySummaryPreserved: boolean;
  readonly exportCompatibleCasePreserved: boolean;
  readonly exportNoRuntimeGuardPreserved: boolean;
  readonly exportNoPayloadAcceptedGuardPreserved: boolean;
  readonly exportNoPreviewGuardPreserved: boolean;
  readonly coachFacingErrorCopyCountFrom9E: number;
  readonly coachFacingBlockerCopyCountFrom9E: number;
  readonly coachFacingRefusalCopyCountFrom9E: number;
  readonly scoringConstantsChanged: boolean;
  readonly matchBonusEventChanged: boolean;
  readonly exportTitleMentions9F: boolean;
  readonly exportMainIdIs9F: boolean;
  readonly exportCoverBadgeCorrect: boolean;
  readonly metadataFalsePositiveCountAfter9F: number;
}

export function evaluateManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetGuard9F(
  model: ExportBudgetGuardInput9F,
): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetGuard9F {
  const violations: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionWarningCode9F[] = [];
  if (model.exportReadTimeSecondsAfter9F > 900) violations.push("EXPORT_OVER_900");
  if (!model.productCopyDetailsPreserved) violations.push("PRODUCT_ERROR_COPY_DETAILS_LOST");
  if (!model.exportCopySummaryPreserved) violations.push("EXPORT_ERROR_COPY_SUMMARY_MISSING");
  if (!model.exportCompatibleCasePreserved) violations.push("COMPATIBLE_CASE_NON_ACCEPTED_LOST");
  if (!model.exportNoRuntimeGuardPreserved) violations.push("EXPORT_NO_RUNTIME_GUARD_MISSING");
  if (!model.exportNoPayloadAcceptedGuardPreserved) violations.push("EXPORT_NO_PAYLOAD_ACCEPTED_GUARD_MISSING");
  if (!model.exportNoPreviewGuardPreserved) violations.push("EXPORT_NO_PREVIEW_GUARD_MISSING");
  if (model.coachFacingErrorCopyCountFrom9E !== 19 || model.coachFacingBlockerCopyCountFrom9E !== 12 || model.coachFacingRefusalCopyCountFrom9E !== 8) {
    violations.push("ERROR_COPY_COUNTS_REGRESSED");
  }
  if (model.scoringConstantsChanged) violations.push("SCORE_MANIPULATION_DETECTED");
  if (model.matchBonusEventChanged) violations.push("SCORE_MANIPULATION_DETECTED");
  const fail = violations.some((violation) => violation !== "EXPORT_KEY_MESSAGES_MISSING");
  return {
    compactionAllowed: violations.length === 0,
    exportBudgetPassed: model.exportReadTimeSecondsAfter9F <= 900,
    exportBudgetPassStrongEligible: model.exportReadTimeSecondsAfter9F <= 800 && violations.length === 0,
    productDetailsPreserved: model.productCopyDetailsPreserved,
    exportSummaryPreserved: model.exportCopySummaryPreserved,
    noRuntimePreserved: model.exportNoRuntimeGuardPreserved && model.exportNoPayloadAcceptedGuardPreserved && model.exportNoPreviewGuardPreserved,
    metadataCurrentVersionClean: model.exportTitleMentions9F && model.exportMainIdIs9F && model.exportCoverBadgeCorrect && model.metadataFalsePositiveCountAfter9F === 0,
    violations,
    statusRecommendation: fail ? "FAIL" : model.exportReadTimeSecondsAfter9F <= 800 ? "PASS" : "PARTIAL",
  };
}

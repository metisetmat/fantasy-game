import type {
  ManualReviewPreviewPayloadDryRunExportKeyMessagesRecommendation9G,
  ManualReviewPreviewPayloadDryRunWarningConsistencyAudit9G,
  WarningStatusConsistencyStatus9G,
} from "./manualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyTypes9G";
import type { ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarningCode9G } from "./manualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarnings9G";

export function auditManualReviewPreviewPayloadDryRunWarningConsistency9G(input: {
  readonly warningCodesBefore9G: readonly string[];
  readonly warningCodesAfter9G: readonly ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarningCode9G[];
  readonly exportKeyMessagesMissingCount: number;
  readonly expectedWarningStatusConsistencyStatus: "clean";
}): ManualReviewPreviewPayloadDryRunWarningConsistencyAudit9G {
  const beforeHasPositive = input.warningCodesBefore9G.includes("EXPORT_KEY_MESSAGES_PRESERVED");
  const beforeHasNegative = input.warningCodesBefore9G.includes("EXPORT_KEY_MESSAGES_MISSING");
  const afterHasPositive = input.warningCodesAfter9G.includes("EXPORT_KEY_MESSAGES_PRESERVED");
  const afterHasNegative = input.warningCodesAfter9G.includes("EXPORT_KEY_MESSAGES_MISSING");
  const preservedAndMissingSimultaneousCount = afterHasPositive && afterHasNegative ? 1 : 0;
  const warningContradictionCountBefore9G = beforeHasPositive && beforeHasNegative ? 1 : 0;
  const warningContradictionCountAfter9G = preservedAndMissingSimultaneousCount;
  const warningRegistryConflictCount =
    (afterHasPositive && afterHasNegative ? 1 : 0) +
    (input.warningCodesAfter9G.includes("WARNING_STATUS_CONSISTENCY_CLEAN") &&
    (input.warningCodesAfter9G.includes("WARNING_STATUS_CONSISTENCY_PARTIAL") || input.warningCodesAfter9G.includes("WARNING_STATUS_CONSISTENCY_FAIL"))
      ? 1
      : 0);
  const warningAggregationConflictCount =
    (input.exportKeyMessagesMissingCount === 0 && afterHasNegative ? 1 : 0) +
    (input.exportKeyMessagesMissingCount > 0 && afterHasPositive ? 1 : 0);
  const warningStatusConsistencyStatus: WarningStatusConsistencyStatus9G =
    warningRegistryConflictCount > 0 || warningAggregationConflictCount > 0
      ? "fail"
      : input.exportKeyMessagesMissingCount > 0
        ? "partial"
        : "clean";
  const recommendation: ManualReviewPreviewPayloadDryRunExportKeyMessagesRecommendation9G =
    warningStatusConsistencyStatus === "clean"
      ? "KEEP_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR"
      : warningStatusConsistencyStatus === "partial"
        ? "REVIEW_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY"
        : "FIX_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_SOURCE_OF_TRUTH";

  return {
    positiveWarningEmitted: afterHasPositive,
    negativeWarningEmitted: afterHasNegative,
    preservedAndMissingSimultaneousCount,
    warningContradictionCountBefore9G,
    warningContradictionCountAfter9G,
    warningRegistryConflictCount,
    warningAggregationConflictCount,
    warningStatusConsistencyStatus,
    warningStatusConsistencyCorrect: warningStatusConsistencyStatus === input.expectedWarningStatusConsistencyStatus,
    recommendation,
  };
}

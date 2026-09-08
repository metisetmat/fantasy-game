import type {
  ManualReviewPreviewPayloadDryRunProgressiveDisclosurePreservationAudit9K,
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingBudgetAudit9K,
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyAudit9K,
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGuard9K,
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingMetadataAudit9K,
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingNoRuntimeAudit9K,
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingSourceOfTruthAudit9K,
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureWordingPublicationAudit9K,
} from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyTypes9K";
import {
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_PROGRESSIVE_DISCLOSURE_REPORTING_9K_BLOCKING_WARNINGS,
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_PROGRESSIVE_DISCLOSURE_REPORTING_9K_NEGATIVE_WARNINGS,
  uniqueWarningCodes9K,
} from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarnings9K";

export function evaluateManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGuard9K(input: {
  readonly reporting: ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyAudit9K;
  readonly wording: ManualReviewPreviewPayloadDryRunProgressiveDisclosureWordingPublicationAudit9K;
  readonly preservation: ManualReviewPreviewPayloadDryRunProgressiveDisclosurePreservationAudit9K;
  readonly metadata: ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingMetadataAudit9K;
  readonly budget: ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingBudgetAudit9K;
  readonly noRuntime: ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingNoRuntimeAudit9K;
  readonly sourceOfTruth: ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingSourceOfTruthAudit9K;
}): ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGuard9K {
  const reportingConsistencyReady =
    input.reporting.groupViewsCorrected &&
    input.reporting.groupViewTotalsMatchGlobalCounts &&
    input.reporting.zeroCountGroupRowsAfter9K === 0 &&
    input.reporting.misleadingGroupViewRowsAfter9K === 0;
  const wordingPublicationReady =
    input.wording.wordingReadabilityScorePublished &&
    input.wording.wordingReadabilityScore >= input.wording.wordingPassStrongThreshold &&
    input.wording.wordingThresholdStatusCorrect;
  const preservationReady =
    input.preservation.baseline9JPreserved &&
    input.preservation.groupCountsPreservedFrom9H &&
    input.preservation.coveragePreservedFrom9H &&
    input.preservation.keyMessagesPreservedFrom9G &&
    input.preservation.warningContradictionZeroPreserved;
  const noRuntimeReady =
    input.noRuntime.disclosureUsesNoJavaScript &&
    input.noRuntime.disclosureCreatesNoActiveControls &&
    !input.noRuntime.validationRuntimeActive &&
    input.noRuntime.realPayloadReadCount === 0 &&
    !input.noRuntime.payloadCreated &&
    input.noRuntime.dryRunAcceptedPayloadCount === 0 &&
    !input.noRuntime.realPreviewGenerated &&
    !input.noRuntime.storageCreated &&
    !input.noRuntime.officialTruthPromoted &&
    !input.noRuntime.automaticDecisionCreated &&
    !input.noRuntime.selectionDriven &&
    !input.noRuntime.tacticalInstructionDriven &&
    input.noRuntime.scoreMutationCount === 0 &&
    input.noRuntime.timelineMutationCount === 0 &&
    input.noRuntime.eventMutationCount === 0;
  const sourceOfTruthReady =
    !input.sourceOfTruth.scoringConstantsChanged &&
    input.sourceOfTruth.penaltyShotInactive &&
    !input.sourceOfTruth.matchBonusEventChanged &&
    input.sourceOfTruth.batchLiveSeparationPreserved &&
    input.sourceOfTruth.sourceOfTruthSeparationPreserved;
  const exportBudgetReady = input.budget.exportUnder900Seconds;
  const violations = uniqueWarningCodes9K([
    ...input.reporting.reportingConsistencyWarningCodes,
    ...input.wording.wordingWarningCodes,
    ...input.preservation.preservationWarningCodes,
    ...input.metadata.metadataWarningCodes,
    ...input.budget.budgetWarningCodes,
    ...input.noRuntime.noRuntimeWarningCodes,
    ...input.sourceOfTruth.sourceOfTruthWarningCodes,
    reportingConsistencyReady ? "PROGRESSIVE_DISCLOSURE_REPORTING_CONSISTENCY_READY" : "GROUP_VIEW_TOTAL_MISMATCH",
    wordingPublicationReady ? "WORDING_READABILITY_SCORE_PUBLISHED" : "WORDING_READABILITY_SCORE_MISSING",
    preservationReady ? "BASELINE_9J_PROGRESSIVE_DISCLOSURE_PRESERVED" : "PROGRESSIVE_DISCLOSURE_REPORTING_FAIL",
    noRuntimeReady ? "NO_RUNTIME_ACTIVATION" : "PROGRESSIVE_DISCLOSURE_REPORTING_FAIL",
    sourceOfTruthReady ? "SCORING_CONSTANTS_UNCHANGED" : "PROGRESSIVE_DISCLOSURE_REPORTING_FAIL",
    exportBudgetReady ? "EXPORT_BUDGET_PASS" : "EXPORT_OVER_900_FAIL",
  ]);
  const hasBlocking = violations.some((warning) =>
    MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_PROGRESSIVE_DISCLOSURE_REPORTING_9K_BLOCKING_WARNINGS.includes(warning),
  );
  const hasNegative = violations.some((warning) =>
    MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_PROGRESSIVE_DISCLOSURE_REPORTING_9K_NEGATIVE_WARNINGS.includes(warning),
  );
  return {
    reportingConsistencyReady,
    wordingPublicationReady,
    preservationReady,
    noRuntimeReady,
    sourceOfTruthReady,
    exportBudgetReady,
    violations,
    statusRecommendation: hasBlocking ? "FAIL" : hasNegative ? "PARTIAL" : "PASS",
  };
}

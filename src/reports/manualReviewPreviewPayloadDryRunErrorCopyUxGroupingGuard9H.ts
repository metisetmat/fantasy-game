import type {
  ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingGuard9H,
  ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel,
} from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingTypes9H";
import type { ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWarningCode9H } from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingWarnings9H";
import {
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_9H_BLOCKING_WARNINGS,
  uniqueWarningCodes9H,
} from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingWarnings9H";

export function evaluateManualReviewPreviewPayloadDryRunErrorCopyUxGroupingBoundary9H(
  model: Pick<
    ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel,
    | "uxGroupCount"
    | "groupedErrorCopyCount"
    | "groupedBlockerCopyCount"
    | "groupedRefusalCopyCount"
    | "groupedCompatibleCaseCount"
    | "ungroupedCopyCount"
    | "duplicatedCopyCount"
    | "compatibleCaseStillNotAcceptedInGrouping"
    | "warningContradictionCountAfter9H"
    | "exportKeyMessagesMissingCountFrom9G"
    | "exportKeyMessagesNegativeWarningEmitted"
    | "validationRuntimeActive"
    | "realPayloadReadCount"
    | "payloadCreated"
    | "dryRunAcceptedPayloadCount"
    | "realPreviewGenerated"
    | "previewActivationCount"
    | "submitCreated"
    | "apiCreated"
    | "backendCreated"
    | "storageCreated"
    | "memoryCreated"
    | "draftCreated"
    | "historyCreated"
    | "officialTruthPromoted"
    | "automaticDecisionCreated"
    | "selectionDriven"
    | "tacticalInstructionDriven"
    | "scoreMutationCount"
    | "timelineMutationCount"
    | "scoreChangeCreationCount"
    | "eventMutationCount"
    | "exportReadTimeSecondsAfter9H"
    | "wordingReadabilityScore"
    | "exportTitleMentions9H"
    | "exportMainIdIs9H"
    | "exportCoverBadgeCorrect"
    | "metadataFalsePositiveCountAfter9H"
    | "scoringConstantsChanged"
    | "matchBonusEventChanged"
  >,
): ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingGuard9H {
  const violations: ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWarningCode9H[] = [];
  if (model.uxGroupCount !== 5) violations.push("UX_GROUP_COUNT_MISMATCH_9H");
  if (model.groupedErrorCopyCount !== 19) violations.push("ERROR_COPY_GROUPING_COUNT_MISMATCH_9H");
  if (model.groupedBlockerCopyCount !== 12) violations.push("BLOCKER_COPY_GROUPING_COUNT_MISMATCH_9H");
  if (model.groupedRefusalCopyCount !== 8) violations.push("REFUSAL_COPY_GROUPING_COUNT_MISMATCH_9H");
  if (model.groupedCompatibleCaseCount !== 1) violations.push("COMPATIBLE_CASE_GROUPING_MISMATCH_9H");
  if (model.ungroupedCopyCount > 0) violations.push("UNGROUPED_COPY_ASSIGNMENTS_9H");
  if (model.duplicatedCopyCount > 0) violations.push("DUPLICATED_COPY_ASSIGNMENTS_9H");
  if (!model.compatibleCaseStillNotAcceptedInGrouping) violations.push("COMPATIBLE_CASE_GROUPING_MISMATCH_9H");
  if (model.warningContradictionCountAfter9H > 0) violations.push("WARNING_CONTRADICTION_REINTRODUCED_9H");
  if (model.exportKeyMessagesMissingCountFrom9G === 0 && model.exportKeyMessagesNegativeWarningEmitted) {
    violations.push("EXPORT_KEY_MESSAGES_9G_REGRESSED_9H");
  }
  if (model.validationRuntimeActive) violations.push("VALIDATION_RUNTIME_ACTIVE_DETECTED_9H");
  if (model.realPayloadReadCount > 0) violations.push("REAL_PAYLOAD_READ_DETECTED_9H");
  if (model.payloadCreated) violations.push("PAYLOAD_CREATION_DETECTED_9H");
  if (model.dryRunAcceptedPayloadCount > 0) violations.push("PAYLOAD_ACCEPTANCE_DETECTED_9H");
  if (model.realPreviewGenerated || model.previewActivationCount > 0) violations.push("REAL_PREVIEW_GENERATION_DETECTED_9H");
  if (model.submitCreated || model.apiCreated || model.backendCreated || model.storageCreated || model.memoryCreated || model.draftCreated || model.historyCreated) {
    violations.push("PERSISTENCE_DETECTED_9H");
  }
  if (model.officialTruthPromoted) violations.push("OFFICIAL_TRUTH_PROMOTION_DETECTED_9H");
  if (model.automaticDecisionCreated || model.selectionDriven || model.tacticalInstructionDriven) {
    violations.push("DECISION_SELECTION_OR_TACTIC_DETECTED_9H");
  }
  if (
    model.scoreMutationCount > 0 ||
    model.timelineMutationCount > 0 ||
    model.scoreChangeCreationCount > 0 ||
    model.eventMutationCount > 0
  ) {
    violations.push("SCORE_OR_TIMELINE_MUTATION_DETECTED_9H");
  }
  if (model.exportReadTimeSecondsAfter9H > 900) violations.push("EXPORT_OVER_900_9H");
  if (!model.exportTitleMentions9H || !model.exportMainIdIs9H || !model.exportCoverBadgeCorrect || model.metadataFalsePositiveCountAfter9H > 0) {
    violations.push("EXPORT_METADATA_9H_MISSING");
  }
  if (model.scoringConstantsChanged) violations.push("SCORE_MANIPULATION_DETECTED_9H");
  if (model.matchBonusEventChanged) violations.push("MATCH_BONUS_EVENT_CHANGED_9H");
  if (model.wordingReadabilityScore < 90) violations.push("WORDING_SCORE_BELOW_PASS_THRESHOLD_9H");
  if (model.wordingReadabilityScore < 95) violations.push("WORDING_SCORE_BELOW_PASS_STRONG_THRESHOLD_9H");

  const uniqueViolations = uniqueWarningCodes9H(violations);
  const hasBlocking = uniqueViolations.some((warning) =>
    MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_9H_BLOCKING_WARNINGS.includes(warning),
  );
  const exportBudgetPassed = model.exportReadTimeSecondsAfter9H <= 900;
  const exportBudgetPassStrongEligible = model.exportReadTimeSecondsAfter9H <= 800;
  const groupingComplete =
    model.uxGroupCount === 5 &&
    model.groupedErrorCopyCount === 19 &&
    model.groupedBlockerCopyCount === 12 &&
    model.groupedRefusalCopyCount === 8 &&
    model.groupedCompatibleCaseCount === 1 &&
    model.ungroupedCopyCount === 0 &&
    model.duplicatedCopyCount === 0 &&
    model.compatibleCaseStillNotAcceptedInGrouping;

  return {
    groupingAllowed: !hasBlocking,
    groupingComplete,
    groupingDoesNotActivateRuntime: !model.validationRuntimeActive && model.realPayloadReadCount === 0,
    groupingDoesNotAcceptPayload: !model.payloadCreated && model.dryRunAcceptedPayloadCount === 0,
    groupingDoesNotGeneratePreview: !model.realPreviewGenerated && model.previewActivationCount === 0,
    groupingDoesNotPersist: !model.submitCreated && !model.apiCreated && !model.backendCreated && !model.storageCreated && !model.memoryCreated && !model.draftCreated && !model.historyCreated,
    groupingDoesNotPromoteOfficialTruth: !model.officialTruthPromoted,
    groupingDoesNotDriveDecision: !model.automaticDecisionCreated,
    groupingDoesNotDriveSelectionTactic: !model.selectionDriven && !model.tacticalInstructionDriven,
    groupingDoesNotMutateMatch:
      model.scoreMutationCount === 0 &&
      model.timelineMutationCount === 0 &&
      model.scoreChangeCreationCount === 0 &&
      model.eventMutationCount === 0,
    exportBudgetPassed,
    exportBudgetPassStrongEligible,
    warningConsistencyPreserved: model.warningContradictionCountAfter9H === 0 && !model.exportKeyMessagesNegativeWarningEmitted,
    violations: uniqueViolations,
    statusRecommendation: hasBlocking ? "FAIL" : uniqueViolations.length > 0 || !exportBudgetPassStrongEligible ? "PARTIAL" : "PASS",
  };
}

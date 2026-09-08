import type {
  ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel,
  ManualReviewPreviewPayloadDryRunExportBudgetGuard9I,
} from "./manualReviewPreviewPayloadDryRunExportBudgetCushionTypes9I";
import type { ManualReviewPreviewPayloadDryRunExportBudgetCushionWarningCode9I } from "./manualReviewPreviewPayloadDryRunExportBudgetCushionWarnings9I";
import {
  MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_BUDGET_CUSHION_9I_BLOCKING_WARNINGS,
  uniqueWarningCodes9I,
} from "./manualReviewPreviewPayloadDryRunExportBudgetCushionWarnings9I";

export function evaluateManualReviewPreviewPayloadDryRunExportBudgetCushionBoundary9I(
  model: Pick<
    ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel,
    | "baseline9HPreserved"
    | "baseline9GPreserved"
    | "baseline9FPreserved"
    | "baseline9EPreserved"
    | "productBudgetCushionSectionVisible"
    | "exportBudgetCushionSectionVisible"
    | "exportDetailsPreservedInProduct"
    | "exportReadTimeSecondsAfter9I"
    | "exportUnder900BooleanCorrect"
    | "exportUnder800BooleanCorrect"
    | "exportUnder790BooleanCorrect"
    | "exportUnder780BooleanCorrect"
    | "exportTitleMentions9I"
    | "exportMainIdIs9I"
    | "exportCurrentDataAttributeVisible"
    | "exportCoverBadgeCorrect"
    | "metadataFalsePositiveCountAfter9I"
    | "historical9HPreserved"
    | "historical9GPreserved"
    | "historical9FPreserved"
    | "historical9EPreserved"
    | "historical9DPreserved"
    | "historical9CPreserved"
    | "historical9BPreserved"
    | "historical9APreserved"
    | "historical8Z8Y8X8WPreserved"
    | "uxGroupCountFrom9H"
    | "groupedErrorCopyCountFrom9H"
    | "groupedBlockerCopyCountFrom9H"
    | "groupedRefusalCopyCountFrom9H"
    | "groupedCompatibleCaseCountFrom9H"
    | "ungroupedCopyCountFrom9H"
    | "duplicatedCopyCountFrom9H"
    | "exportKeyMessagesDetectedCountFrom9G"
    | "exportKeyMessagesMissingCountFrom9G"
    | "warningContradictionCountAfter9I"
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
    | "sourceOfTruthSeparationPreserved"
    | "matchEconomyBaselinePreserved"
    | "guardrailsPreserved"
    | "scoringConstantsChanged"
    | "matchBonusEventChanged"
  >,
): ManualReviewPreviewPayloadDryRunExportBudgetGuard9I {
  const violations: ManualReviewPreviewPayloadDryRunExportBudgetCushionWarningCode9I[] = [];
  if (!model.baseline9HPreserved) violations.push("BASELINE_9H_REGRESSED");
  if (!model.baseline9GPreserved) violations.push("BASELINE_9G_REGRESSED");
  if (!model.baseline9FPreserved) violations.push("BASELINE_9F_REGRESSED");
  if (!model.baseline9EPreserved) violations.push("BASELINE_9E_REGRESSED");
  if (!model.productBudgetCushionSectionVisible || !model.exportBudgetCushionSectionVisible || !model.exportDetailsPreservedInProduct) {
    violations.push("EXPORT_CUSHION_NOT_CREATED_9I");
  }
  if (model.exportReadTimeSecondsAfter9I > 900) violations.push("EXPORT_OVER_900_9I");
  if (model.exportReadTimeSecondsAfter9I > 800) violations.push("EXPORT_OVER_800_PASS_STRONG_BLOCKED_9I");
  if (model.exportReadTimeSecondsAfter9I > 790) violations.push("EXPORT_OVER_790_CRITICAL_MARGIN_9I");
  if (model.exportReadTimeSecondsAfter9I > 780) violations.push("EXPORT_OVER_780_MARGIN_WARNING_9I");
  if (
    !model.exportUnder900BooleanCorrect ||
    !model.exportUnder800BooleanCorrect ||
    !model.exportUnder790BooleanCorrect ||
    !model.exportUnder780BooleanCorrect
  ) {
    violations.push("EXPORT_READ_TIME_BOOLEAN_MISMATCH_9I");
  }
  if (
    !model.exportTitleMentions9I ||
    !model.exportMainIdIs9I ||
    !model.exportCurrentDataAttributeVisible ||
    !model.exportCoverBadgeCorrect ||
    model.metadataFalsePositiveCountAfter9I > 0 ||
    !model.historical9HPreserved ||
    !model.historical9GPreserved ||
    !model.historical9FPreserved ||
    !model.historical9EPreserved ||
    !model.historical9DPreserved ||
    !model.historical9CPreserved ||
    !model.historical9BPreserved ||
    !model.historical9APreserved ||
    !model.historical8Z8Y8X8WPreserved
  ) {
    violations.push("EXPORT_METADATA_9I_MISSING");
  }
  if (
    model.uxGroupCountFrom9H !== 5 ||
    model.groupedErrorCopyCountFrom9H !== 19 ||
    model.groupedBlockerCopyCountFrom9H !== 12 ||
    model.groupedRefusalCopyCountFrom9H !== 8 ||
    model.groupedCompatibleCaseCountFrom9H !== 1 ||
    model.ungroupedCopyCountFrom9H !== 0 ||
    model.duplicatedCopyCountFrom9H !== 0
  ) {
    violations.push("EXPORT_9H_GROUPING_REGRESSED_9I");
  }
  if (model.exportKeyMessagesDetectedCountFrom9G !== 7 || model.exportKeyMessagesMissingCountFrom9G !== 0) {
    violations.push("EXPORT_KEY_MESSAGES_9G_REGRESSED_9I");
  }
  if (model.warningContradictionCountAfter9I > 0) violations.push("WARNING_CONTRADICTION_REINTRODUCED_9I");
  if (model.validationRuntimeActive) violations.push("VALIDATION_RUNTIME_ACTIVE_DETECTED_9I");
  if (model.realPayloadReadCount > 0) violations.push("REAL_PAYLOAD_READ_DETECTED_9I");
  if (model.payloadCreated) violations.push("PAYLOAD_CREATION_DETECTED_9I");
  if (model.dryRunAcceptedPayloadCount > 0) violations.push("PAYLOAD_ACCEPTANCE_DETECTED_9I");
  if (model.realPreviewGenerated || model.previewActivationCount > 0) violations.push("REAL_PREVIEW_GENERATION_DETECTED_9I");
  if (model.submitCreated || model.apiCreated || model.backendCreated || model.storageCreated || model.memoryCreated || model.draftCreated || model.historyCreated) {
    violations.push("PERSISTENCE_DETECTED_9I");
  }
  if (model.officialTruthPromoted) violations.push("OFFICIAL_TRUTH_PROMOTION_DETECTED_9I");
  if (model.automaticDecisionCreated || model.selectionDriven || model.tacticalInstructionDriven) {
    violations.push("DECISION_SELECTION_OR_TACTIC_DETECTED_9I");
  }
  if (
    model.scoreMutationCount > 0 ||
    model.timelineMutationCount > 0 ||
    model.scoreChangeCreationCount > 0 ||
    model.eventMutationCount > 0
  ) {
    violations.push("SCORE_OR_TIMELINE_MUTATION_DETECTED_9I");
  }
  if (!model.sourceOfTruthSeparationPreserved || !model.matchEconomyBaselinePreserved || !model.guardrailsPreserved) {
    violations.push("SOURCE_OF_TRUTH_REGRESSED_9I");
  }
  if (model.scoringConstantsChanged) violations.push("SCORE_MANIPULATION_DETECTED_9I");
  if (model.matchBonusEventChanged) violations.push("MATCH_BONUS_EVENT_CHANGED_9I");

  const uniqueViolations = uniqueWarningCodes9I(violations);
  const hasBlocking = uniqueViolations.some((warning) =>
    MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_BUDGET_CUSHION_9I_BLOCKING_WARNINGS.includes(warning),
  );

  return {
    exportBudgetPassed: model.exportReadTimeSecondsAfter9I <= 900,
    exportBudgetPassStrongEligible: model.exportReadTimeSecondsAfter9I <= 800,
    exportBudgetCushionCreated: model.exportReadTimeSecondsAfter9I <= 780,
    preservationPassed:
      model.baseline9HPreserved &&
      model.baseline9GPreserved &&
      model.baseline9FPreserved &&
      model.baseline9EPreserved &&
      model.uxGroupCountFrom9H === 5 &&
      model.groupedErrorCopyCountFrom9H === 19 &&
      model.groupedBlockerCopyCountFrom9H === 12 &&
      model.groupedRefusalCopyCountFrom9H === 8,
    noRuntimePassed:
      !model.validationRuntimeActive &&
      model.realPayloadReadCount === 0 &&
      !model.payloadCreated &&
      model.dryRunAcceptedPayloadCount === 0 &&
      !model.realPreviewGenerated &&
      model.previewActivationCount === 0 &&
      !model.storageCreated &&
      !model.memoryCreated,
    sourceOfTruthPassed:
      model.sourceOfTruthSeparationPreserved &&
      model.matchEconomyBaselinePreserved &&
      model.guardrailsPreserved &&
      !model.scoringConstantsChanged &&
      !model.matchBonusEventChanged,
    metadataPassed: !uniqueViolations.includes("EXPORT_METADATA_9I_MISSING"),
    violations: uniqueViolations,
    statusRecommendation: hasBlocking ? "FAIL" : uniqueViolations.length > 0 ? "PARTIAL" : "PASS",
  };
}

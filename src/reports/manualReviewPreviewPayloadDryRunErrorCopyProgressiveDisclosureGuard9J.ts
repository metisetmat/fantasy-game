import type {
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureGuard9J,
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel,
} from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureTypes9J";
import { uniqueWarningCodes9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarnings9J";

type GuardInput = Pick<
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel,
  | "progressiveDisclosureReady"
  | "productProgressiveDisclosureVisible"
  | "exportProgressiveDisclosureVisible"
  | "disclosureLevelCount"
  | "disclosureGroupCount"
  | "summaryLevelVisible"
  | "coachDetailLevelVisible"
  | "technicalReferenceLevelVisible"
  | "technicalReferenceLevelCollapsed"
  | "disclosureUsesNoJavaScript"
  | "disclosureCreatesNoActiveControls"
  | "disclosureHasNoSubmitButton"
  | "disclosureHasNoEnabledInputs"
  | "baseline9IPreserved"
  | "exportBudgetCushionStatusFrom9I"
  | "uxGroupCountFrom9H"
  | "groupedErrorCopyCountFrom9H"
  | "groupedBlockerCopyCountFrom9H"
  | "groupedRefusalCopyCountFrom9H"
  | "groupedCompatibleCaseCountFrom9H"
  | "ungroupedCopyCountFrom9H"
  | "duplicatedCopyCountFrom9H"
  | "compatibleCaseStillNotAcceptedFrom9H"
  | "exportKeyMessagesMissingCountFrom9G"
  | "warningContradictionCountAfter9J"
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
  | "historyCreated"
  | "draftCreated"
  | "officialTruthPromoted"
  | "automaticDecisionCreated"
  | "selectionDriven"
  | "tacticalInstructionDriven"
  | "scoreMutationCount"
  | "timelineMutationCount"
  | "scoreChangeCreationCount"
  | "eventMutationCount"
  | "exportUnder900Seconds"
  | "exportUnder800Seconds"
  | "exportBudgetCushionPreserved"
  | "metadataFalsePositiveCountAfter9J"
  | "scoringConstantsChanged"
  | "penaltyShotInactive"
  | "matchBonusEventChanged"
  | "batchLiveSeparationPreserved"
  | "wordingReadabilityScore"
  | "warningMutualExclusionGuardPassed"
>;

export function evaluateManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureBoundary9J(
  model: GuardInput,
): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureGuard9J {
  const violations = uniqueWarningCodes9J([
    !model.progressiveDisclosureReady ? "ERROR_COPY_PROGRESSIVE_DISCLOSURE_MISSING" : "ERROR_COPY_PROGRESSIVE_DISCLOSURE_COMPLETE",
    !model.productProgressiveDisclosureVisible ? "PRODUCT_PROGRESSIVE_DISCLOSURE_MISSING" : "PRODUCT_PROGRESSIVE_DISCLOSURE_VISIBLE",
    !model.exportProgressiveDisclosureVisible ? "EXPORT_PROGRESSIVE_DISCLOSURE_MISSING" : "EXPORT_PROGRESSIVE_DISCLOSURE_VISIBLE",
    model.disclosureLevelCount !== 3 ? "DISCLOSURE_LEVEL_COUNT_INVALID" : "DISCLOSURE_LEVELS_READY",
    model.disclosureGroupCount !== 5 ? "DISCLOSURE_GROUP_COUNT_INVALID" : "DISCLOSURE_GROUPS_READY",
    !model.summaryLevelVisible ? "SUMMARY_LEVEL_MISSING" : "SUMMARY_LEVEL_VISIBLE",
    !model.coachDetailLevelVisible ? "COACH_DETAIL_LEVEL_MISSING" : "COACH_DETAIL_LEVEL_VISIBLE",
    !model.technicalReferenceLevelCollapsed ? "TECHNICAL_REFERENCES_NOT_COLLAPSED" : "TECHNICAL_REFERENCES_COLLAPSED",
    !model.disclosureUsesNoJavaScript ? "DISCLOSURE_JAVASCRIPT_REQUIRED" : "DISCLOSURE_NO_JAVASCRIPT_REQUIRED",
    !model.disclosureCreatesNoActiveControls ? "ACTIVE_CONTROLS_DETECTED" : "DISCLOSURE_NO_ACTIVE_CONTROLS",
    !model.disclosureHasNoSubmitButton ? "SUBMIT_BUTTON_DETECTED" : "DISCLOSURE_NO_SUBMIT_BUTTON",
    !model.disclosureHasNoEnabledInputs ? "ENABLED_INPUTS_DETECTED" : "DISCLOSURE_NO_ENABLED_INPUTS",
    !model.baseline9IPreserved ? "BASELINE_9I_REGRESSED" : "BASELINE_9I_PRESERVED",
    model.exportBudgetCushionStatusFrom9I !== "cushion_created"
      ? "EXPORT_BUDGET_CUSHION_9I_LOST"
      : "EXPORT_BUDGET_CUSHION_9I_PRESERVED",
    model.uxGroupCountFrom9H !== 5 ? "UX_GROUPING_9H_REGRESSED" : "UX_GROUPING_9H_PRESERVED",
    model.groupedErrorCopyCountFrom9H !== 19 ||
    model.groupedBlockerCopyCountFrom9H !== 12 ||
    model.groupedRefusalCopyCountFrom9H !== 8 ||
    model.groupedCompatibleCaseCountFrom9H !== 1 ||
    model.ungroupedCopyCountFrom9H !== 0 ||
    model.duplicatedCopyCountFrom9H !== 0
      ? "UX_GROUP_COUNTS_REGRESSED"
      : "UX_GROUP_COUNTS_PRESERVED",
    !model.compatibleCaseStillNotAcceptedFrom9H ? "COMPATIBLE_CASE_ACCEPTED_REGRESSION" : "COMPATIBLE_CASE_NON_ACCEPTED_PRESERVED",
    model.exportKeyMessagesMissingCountFrom9G !== 0 ? "EXPORT_KEY_MESSAGES_MISSING_REINTRODUCED" : "EXPORT_KEY_MESSAGES_MISSING_ABSENT",
    model.warningContradictionCountAfter9J !== 0 ? "EXPORT_KEY_MESSAGES_CONTRADICTION_REINTRODUCED" : "WARNING_CONSISTENCY_9G_PRESERVED",
    model.validationRuntimeActive ? "VALIDATION_RUNTIME_ACTIVE_DETECTED" : "NO_RUNTIME_VALIDATION",
    model.realPayloadReadCount > 0 ? "REAL_PAYLOAD_READ_DETECTED" : "NO_PAYLOAD_READ",
    model.payloadCreated ? "PAYLOAD_CREATION_DETECTED" : "NO_PAYLOAD_CREATED",
    model.dryRunAcceptedPayloadCount > 0 ? "PAYLOAD_ACCEPTANCE_DETECTED" : "NO_PAYLOAD_ACCEPTED",
    model.realPreviewGenerated || model.previewActivationCount > 0 ? "REAL_PREVIEW_GENERATION_DETECTED" : "NO_PREVIEW_GENERATED",
    model.submitCreated || model.apiCreated || model.backendCreated ? "BACKEND_ACTION_DETECTED" : "DISCLOSURE_READ_ONLY_READY",
    model.storageCreated || model.memoryCreated || model.historyCreated || model.draftCreated ? "PERSISTENCE_DETECTED" : "NO_PERSISTENCE",
    model.officialTruthPromoted ? "OFFICIAL_TRUTH_PROMOTION_DETECTED" : "NO_OFFICIAL_TRUTH",
    model.automaticDecisionCreated ? "AUTOMATIC_DECISION_DETECTED" : "DISCLOSURE_READ_ONLY_READY",
    model.selectionDriven || model.tacticalInstructionDriven ? "SELECTION_IMPOSITION_DETECTED" : "NO_SELECTION_OR_TACTIC",
    model.scoreMutationCount > 0 ||
    model.timelineMutationCount > 0 ||
    model.scoreChangeCreationCount > 0 ||
    model.eventMutationCount > 0
      ? "SCORE_OR_TIMELINE_MUTATION_DETECTED"
      : "NO_SCORE_TIMELINE_MUTATION",
    !model.exportUnder900Seconds ? "EXPORT_OVER_900" : "EXPORT_UNDER_900_READY",
    !model.exportUnder800Seconds ? "EXPORT_OVER_800_PASS_STRONG_BLOCKED" : "EXPORT_UNDER_800_READY",
    !model.exportBudgetCushionPreserved ? "EXPORT_BUDGET_CUSHION_9I_LOST" : "EXPORT_BUDGET_CUSHION_9I_PRESERVED",
    model.metadataFalsePositiveCountAfter9J !== 0 ? "METADATA_FALSE_POSITIVE_DETECTED" : "EXPORT_METADATA_9J_VISIBLE",
    model.scoringConstantsChanged ? "SCORE_MANIPULATION_DETECTED" : "SCORING_CONSTANTS_UNCHANGED",
    !model.penaltyShotInactive ? "PENALTY_SHOT_LEAKAGE_DETECTED" : "SCORING_CONSTANTS_UNCHANGED",
    model.matchBonusEventChanged ? "SCORE_MANIPULATION_DETECTED" : "MATCH_BONUS_EVENT_UNCHANGED",
  ]);
  const blocking = violations.some((violation) =>
    [
      "DISCLOSURE_LEVEL_COUNT_INVALID",
      "DISCLOSURE_GROUP_COUNT_INVALID",
      "ACTIVE_CONTROLS_DETECTED",
      "SUBMIT_BUTTON_DETECTED",
      "ENABLED_INPUTS_DETECTED",
      "BASELINE_9I_REGRESSED",
      "EXPORT_BUDGET_CUSHION_9I_LOST",
      "UX_GROUPING_9H_REGRESSED",
      "UX_GROUP_COUNTS_REGRESSED",
      "COMPATIBLE_CASE_ACCEPTED_REGRESSION",
      "EXPORT_KEY_MESSAGES_MISSING_REINTRODUCED",
      "EXPORT_KEY_MESSAGES_CONTRADICTION_REINTRODUCED",
      "VALIDATION_RUNTIME_ACTIVE_DETECTED",
      "REAL_PAYLOAD_READ_DETECTED",
      "PAYLOAD_CREATION_DETECTED",
      "PAYLOAD_ACCEPTANCE_DETECTED",
      "REAL_PREVIEW_GENERATION_DETECTED",
      "BACKEND_ACTION_DETECTED",
      "PERSISTENCE_DETECTED",
      "OFFICIAL_TRUTH_PROMOTION_DETECTED",
      "AUTOMATIC_DECISION_DETECTED",
      "SELECTION_IMPOSITION_DETECTED",
      "SCORE_OR_TIMELINE_MUTATION_DETECTED",
      "EXPORT_OVER_900",
      "METADATA_FALSE_POSITIVE_DETECTED",
      "SCORE_MANIPULATION_DETECTED",
      "PENALTY_SHOT_LEAKAGE_DETECTED",
    ].includes(violation),
  );
  const partial =
    !model.summaryLevelVisible ||
    !model.coachDetailLevelVisible ||
    !model.technicalReferenceLevelVisible ||
    !model.technicalReferenceLevelCollapsed ||
    !model.disclosureUsesNoJavaScript ||
    !model.exportUnder800Seconds ||
    model.wordingReadabilityScore < 95 ||
    !model.warningMutualExclusionGuardPassed;

  return {
    disclosureAllowed: !blocking,
    disclosureComplete: model.progressiveDisclosureReady && model.disclosureLevelCount === 3 && model.disclosureGroupCount === 5,
    disclosureReadOnly: model.disclosureCreatesNoActiveControls && model.disclosureHasNoSubmitButton && model.disclosureHasNoEnabledInputs,
    disclosureDoesNotActivateRuntime: !model.validationRuntimeActive,
    disclosureDoesNotAcceptPayload: model.dryRunAcceptedPayloadCount === 0,
    disclosureDoesNotGeneratePreview: !model.realPreviewGenerated && model.previewActivationCount === 0,
    disclosureDoesNotPersist: !model.storageCreated && !model.memoryCreated && !model.historyCreated && !model.draftCreated,
    disclosureDoesNotPromoteOfficialTruth: !model.officialTruthPromoted,
    disclosureDoesNotDriveDecision: !model.automaticDecisionCreated,
    disclosureDoesNotDriveSelectionTactic: !model.selectionDriven && !model.tacticalInstructionDriven,
    disclosureDoesNotMutateMatch:
      model.scoreMutationCount === 0 &&
      model.timelineMutationCount === 0 &&
      model.scoreChangeCreationCount === 0 &&
      model.eventMutationCount === 0,
    exportBudgetPassed: model.exportUnder900Seconds,
    exportBudgetPassStrongEligible: model.exportUnder800Seconds && model.wordingReadabilityScore >= 95,
    warningConsistencyPreserved: model.warningContradictionCountAfter9J === 0 && model.warningMutualExclusionGuardPassed,
    budgetCushionPreserved: model.exportBudgetCushionPreserved,
    violations,
    statusRecommendation: blocking ? "FAIL" : partial ? "PARTIAL" : "PASS",
  };
}

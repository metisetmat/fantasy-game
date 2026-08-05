import { scoringRegistryEntry } from "../systems/scoring";
import {
  buildManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel,
  renderManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AValidation,
} from "./buildManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9A";

function assertTest(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const model = buildManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel();
const validation = renderManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AValidation(model);

function caseById(caseId: string) {
  const dryRunCase = model.dryRunCases.find((candidate) => candidate.dryRunCaseId === caseId);
  if (dryRunCase === undefined) throw new Error(`Missing dry-run case ${caseId}.`);
  return dryRunCase;
}

assertTest(model.status === "PASS", `9A model must pass, got ${model.status}: ${model.warningCodes.join(", ")}`);
assertTest(validation.includes("Status: PASS"), "9A validation must show Status: PASS.");
assertTest(model.baseline8ZPreserved, "9A must preserve 8Z.");
assertTest(model.baseline8YPreserved, "9A must preserve 8Y.");
assertTest(model.baseline8XPreserved, "9A must preserve 8X.");
assertTest(model.baseline8WPreserved, "9A must preserve 8W.");
assertTest(model.baseline8VPreserved, "9A must preserve 8V.");
assertTest(model.baseline8UPreserved, "9A must preserve 8U.");
assertTest(model.dryRunStatus === "documented_dry_run_only", "9A dry-run status must be documented_dry_run_only.");
assertTest(model.expectedDryRunStatus === "documented_dry_run_only", "9A expected dry-run status must be documented_dry_run_only.");
assertTest(model.dryRunStatusCorrect, "9A dry-run status must be correct.");
assertTest(model.dryRunCaseCount === 16, "9A must define 16 dry-run cases.");
assertTest(model.dryRunResultCount === 16, "9A must define 16 expected results.");
assertTest(model.dryRunPassCaseCount >= 1, "9A must have at least one would-pass case.");
assertTest(model.dryRunFailCaseCount >= 15, "9A must have at least 15 fail/block cases.");
assertTest(model.dryRunBlockingCaseCount >= 12, "9A must have at least 12 blocking cases.");
assertTest(caseById("valid_preview_only_payload_shape_9a").expectedResult === "would_pass_future_validation_but_not_accepted", "valid case must not be accepted.");
assertTest(model.dryRunExpectedResults.every((result) => !result.canAcceptPayloadIn9A && result.statusLabel !== "accepted payload"), "no result can accept payload.");
assertTest(caseById("invalid_source_payload_9a").expectedErrorStateIds.includes("INVALID_PAYLOAD_SOURCE_8Y"), "invalid source must map INVALID_PAYLOAD_SOURCE_8Y.");
assertTest(caseById("invalid_source_payload_9a").expectedBlockerIds.includes("BLOCK_INVALID_SOURCE_OR_SCOPE_8Y"), "invalid source must block source/scope.");
assertTest(caseById("invalid_scope_payload_9a").expectedErrorStateIds.includes("INVALID_PAYLOAD_SCOPE_8Y"), "invalid scope must map INVALID_PAYLOAD_SCOPE_8Y.");
assertTest(caseById("official_truth_flag_true_9a").expectedErrorStateIds.includes("OFFICIAL_TRUTH_FLAG_FORBIDDEN_8Y"), "official truth flag must be forbidden.");
assertTest(caseById("persisted_or_applied_flag_true_9a").expectedErrorStateIds.includes("PERSISTED_FLAG_FORBIDDEN_8Y"), "persisted flag must be forbidden.");
assertTest(caseById("persisted_or_applied_flag_true_9a").expectedErrorStateIds.includes("APPLIED_FLAG_FORBIDDEN_8Y"), "applied flag must be forbidden.");
assertTest(caseById("invalid_entry_count_9a").expectedErrorStateIds.includes("ENTRY_COUNT_INVALID_8Y"), "invalid entry count must be mapped.");
assertTest(caseById("unknown_entry_link_9a").expectedErrorStateIds.includes("ENTRY_LINK_UNKNOWN_8Y"), "unknown entry link must be mapped.");
assertTest(caseById("invalid_outcome_value_9a").expectedErrorStateIds.includes("INVALID_OUTCOME_VALUE_8Y"), "invalid outcome must be mapped.");
assertTest(caseById("invalid_counter_value_9a").expectedErrorStateIds.includes("INVALID_COUNTER_VALUE_8Y"), "invalid counter must be mapped.");
assertTest(caseById("signal_count_exceeds_comparable_count_9a").expectedErrorStateIds.includes("SIGNAL_COUNT_EXCEEDS_COMPARABLE_COUNT_8Y"), "signal count inconsistency must be mapped.");
assertTest(caseById("invalid_context_comparability_9a").expectedErrorStateIds.includes("INVALID_CONTEXT_COMPARABILITY_8Y"), "invalid context must be mapped.");
assertTest(caseById("note_too_long_9a").expectedErrorStateIds.includes("NOTE_TOO_LONG_8Y"), "note too long must be mapped.");
assertTest(caseById("missing_required_entry_field_9a").expectedErrorStateIds.includes("REQUIRED_ENTRY_FIELD_MISSING_8Y"), "missing required field must be mapped.");
assertTest(caseById("forbidden_top_level_field_9a").expectedErrorStateIds.includes("FORBIDDEN_TOP_LEVEL_FIELD_8Y"), "forbidden top-level field must be mapped.");
assertTest(caseById("score_timeline_mutation_attempt_9a").expectedErrorStateIds.includes("SCORE_TIMELINE_MUTATION_FIELD_8Y"), "score/timeline mutation must be mapped.");
assertTest(caseById("automation_storage_engine_learning_attempt_9a").expectedErrorStateIds.includes("AUTOMATION_FIELD_FORBIDDEN_8Y"), "automation field must be mapped.");
assertTest(caseById("automation_storage_engine_learning_attempt_9a").expectedErrorStateIds.includes("STORAGE_FIELD_FORBIDDEN_8Y"), "storage field must be mapped.");
assertTest(caseById("automation_storage_engine_learning_attempt_9a").expectedErrorStateIds.includes("ENGINE_LEARNING_FIELD_FORBIDDEN_8Y"), "engine learning field must be mapped.");
assertTest(model.dryRunRuleCoverageCount === 20, "rule coverage must be 20.");
assertTest(model.dryRunErrorCoverageCount === 19, "error coverage must be 19.");
assertTest(model.dryRunBlockerCoverageCount === 12, "blocker coverage must be 12.");
assertTest(model.dryRunBoundaryGuardCoverageCount === 14, "boundary guard coverage must be 14.");
assertTest(model.dryRunRefusalStateCoverageCount === 8, "refusal state coverage must be 8.");
assertTest(model.dryRunCoverage.uncoveredRuleIds.length === 0, "uncovered rule ids must be empty.");
assertTest(model.dryRunCoverage.uncoveredErrorStateIds.length === 0, "uncovered error ids must be empty.");
assertTest(model.dryRunCoverage.uncoveredBlockerIds.length === 0, "uncovered blocker ids must be empty.");
assertTest(model.dryRunCoverage.uncoveredBoundaryGuardIds.length === 0, "uncovered boundary guard ids must be empty.");
assertTest(model.dryRunCoverage.uncoveredRefusalStateIds.length === 0, "uncovered refusal state ids must be empty.");
assertTest(!model.validationRuntimeActive, "validation runtime must be inactive.");
assertTest(!model.payloadValidationRuntimeDetected, "payload validation runtime must be inactive.");
assertTest(model.validationExecutionCount === 0, "validation execution count must be 0.");
assertTest(model.realPayloadReadCount === 0, "real payload read count must be 0.");
assertTest(!model.payloadCreated, "payload must not be created.");
assertTest(model.realPayloadInstanceCount === 0, "real payload instance count must be 0.");
assertTest(model.dryRunAcceptedPayloadCount === 0, "accepted payload count must be 0.");
assertTest(!model.realInputActivated, "real input must not be activated.");
assertTest(!model.realPreviewGenerated, "real preview must not be generated.");
assertTest(!model.submitCreated && !model.backendCreated && !model.apiCreated, "submit/backend/api must not be created.");
assertTest(!model.storageCreated && !model.memoryCreated && !model.draftCreated && !model.historyCreated, "no storage/draft/history/memory.");
assertTest(!model.officialTruthPromoted, "official truth must not be promoted.");
assertTest(!model.automaticDecisionCreated, "automatic decision must not be created.");
assertTest(!model.selectionDriven && !model.tacticalInstructionDriven, "selection/tactic must not be driven.");
assertTest(model.scoreMutationCount === 0 && model.timelineMutationCount === 0 && model.scoreChangeCreationCount === 0 && model.eventMutationCount === 0, "match mutation counts must be zero.");
assertTest(model.validationContractStatusFrom8Y === "documented_but_not_executable", "8Y validation status must be preserved.");
assertTest(model.payloadContractStatusFrom8X === "documented_but_not_instantiated", "8X payload status must be preserved.");
assertTest(model.previewActivationStatusFrom8W === "documented_but_blocked", "8W activation status must be preserved.");
assertTest(model.workflowReadinessStatusFrom8R === "ready_for_non_persistent_preview", "8R workflow readiness must be preserved.");
assertTest(model.reviewGateStatusFrom8Q === "needs_completion", "8Q gate must be preserved.");
assertTest(model.auditConsistencyStatusFrom8Z === "PASS_STRONG", "8Z audit consistency status must be PASS_STRONG.");
assertTest(model.productHtmlAfter9A.includes('id="manual-review-preview-payload-dry-run-validator-9a"'), "product must contain 9A section.");
assertTest(model.exportHtmlAfter9A.includes('id="manual-review-preview-payload-dry-run-validator-export-9a"'), "export must contain 9A section.");
assertTest(model.exportHtmlAfter9A.includes("Rapport coach export compact 9A"), "export title must mention 9A.");
assertTest(model.exportHtmlAfter9A.includes("Export compact 9A") || model.exportHtmlAfter9A.includes("Dry-run payload 9A"), "visible export badge must mention 9A.");
assertTest(model.exportHtmlAfter9A.includes('id="compressed-export-9a"'), "export main id must be compressed-export-9a.");
assertTest(!model.exportHtmlAfter9A.includes('id="compressed-export-8z"'), "export main id must no longer be compressed-export-8z.");
assertTest(model.exportReadTimeSecondsAfter9A <= 900, "export must be under 900 seconds.");
assertTest(model.exportUnder900BooleanCorrect && model.exportUnder800BooleanCorrect, "export threshold booleans must be correct.");
assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
assertTest(model.baseline8Z.baseline8Y.sourceOfTruthAudit.MatchBonusEventUnchanged, "MatchBonusEvent must remain unchanged.");
assertTest(model.sharePackPass, "share pack flag must pass.");

assertTest(
  (() => {
    try {
      buildManualReviewPreviewPayloadDryRunValidatorWithoutRuntimeActivation9AModel({
        baseline8Z: {
          ...model.baseline8Z,
          statusAfterConsistencyRepair: "PARTIAL",
        },
      });
      return false;
    } catch {
      return true;
    }
  })(),
  "9A must block incoherent 8Z baselines.",
);

console.log("PASS manualReviewPreviewPayloadDryRunValidator9A");

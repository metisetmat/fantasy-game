import type { ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureNoRuntimeAudit9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureTypes9J";
import type { ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel } from "./manualReviewPreviewPayloadDryRunExportBudgetCushionTypes9I";
import { uniqueWarningCodes9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarnings9J";

function enabledInputCount(html: string): number {
  return [...html.matchAll(/<(input|select|textarea)\b(?![^>]*(?:disabled|readonly))[^>]*>/giu)].length;
}

function enabledSubmitButtonCount(html: string): number {
  return [...html.matchAll(/<button\b(?![^>]*disabled)[^>]*>|type=["']submit["']/giu)].length;
}

export function auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureNoRuntime9J(input: {
  readonly baseline9I: ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureNoRuntimeAudit9J {
  const sectionHtml = [
    input.productHtml.match(/id="manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-9j"[\s\S]*?<\/section>/u)?.[0] ?? "",
    input.exportHtml.match(/id="manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-export-9j"[\s\S]*?<\/section>/u)?.[0] ?? "",
  ].join("\n");
  const inputs = enabledInputCount(sectionHtml);
  const submits = enabledSubmitButtonCount(sectionHtml);
  const warningCodes = uniqueWarningCodes9J([
    !input.baseline9I.validationRuntimeActive ? "NO_RUNTIME_VALIDATION" : "VALIDATION_RUNTIME_ACTIVE_DETECTED",
    input.baseline9I.realPayloadReadCount === 0 ? "NO_PAYLOAD_READ" : "REAL_PAYLOAD_READ_DETECTED",
    !input.baseline9I.payloadCreated ? "NO_PAYLOAD_CREATED" : "PAYLOAD_CREATION_DETECTED",
    input.baseline9I.dryRunAcceptedPayloadCount === 0 ? "NO_PAYLOAD_ACCEPTED" : "PAYLOAD_ACCEPTANCE_DETECTED",
    !input.baseline9I.realPreviewGenerated && input.baseline9I.previewActivationCount === 0
      ? "NO_PREVIEW_GENERATED"
      : "REAL_PREVIEW_GENERATION_DETECTED",
    !input.baseline9I.storageCreated && !input.baseline9I.memoryCreated && !input.baseline9I.historyCreated && !input.baseline9I.draftCreated
      ? "NO_PERSISTENCE"
      : "PERSISTENCE_DETECTED",
    !input.baseline9I.officialTruthPromoted ? "NO_OFFICIAL_TRUTH" : "OFFICIAL_TRUTH_PROMOTION_DETECTED",
    !input.baseline9I.automaticDecisionCreated && !input.baseline9I.selectionDriven && !input.baseline9I.tacticalInstructionDriven
      ? "NO_SELECTION_OR_TACTIC"
      : "SELECTION_IMPOSITION_DETECTED",
    input.baseline9I.scoreMutationCount === 0 &&
    input.baseline9I.timelineMutationCount === 0 &&
    input.baseline9I.scoreChangeCreationCount === 0 &&
    input.baseline9I.eventMutationCount === 0
      ? "NO_SCORE_TIMELINE_MUTATION"
      : "SCORE_OR_TIMELINE_MUTATION_DETECTED",
    inputs === 0 ? "DISCLOSURE_NO_ENABLED_INPUTS" : "ENABLED_INPUTS_DETECTED",
    submits === 0 ? "DISCLOSURE_NO_SUBMIT_BUTTON" : "SUBMIT_BUTTON_DETECTED",
  ]);

  return {
    validationRuntimeActive: input.baseline9I.validationRuntimeActive,
    payloadValidationRuntimeDetected: input.baseline9I.payloadValidationRuntimeDetected,
    validationExecutionCount: input.baseline9I.validationExecutionCount,
    realPayloadReadCount: input.baseline9I.realPayloadReadCount,
    payloadCreated: input.baseline9I.payloadCreated,
    realPayloadInstanceCount: input.baseline9I.realPayloadInstanceCount,
    dryRunAcceptedPayloadCount: input.baseline9I.dryRunAcceptedPayloadCount,
    realInputActivated: input.baseline9I.realInputActivated,
    enabledInputCount: inputs,
    realPreviewGenerated: input.baseline9I.realPreviewGenerated,
    previewActivationCount: input.baseline9I.previewActivationCount,
    submitCreated: input.baseline9I.submitCreated,
    submitButtonEnabledCount: submits,
    apiCreated: input.baseline9I.apiCreated,
    backendCreated: input.baseline9I.backendCreated,
    storageCreated: input.baseline9I.storageCreated,
    memoryCreated: input.baseline9I.memoryCreated,
    draftCreated: input.baseline9I.draftCreated,
    historyCreated: input.baseline9I.historyCreated,
    officialTruthPromoted: input.baseline9I.officialTruthPromoted,
    automaticDecisionCreated: input.baseline9I.automaticDecisionCreated,
    selectionDriven: input.baseline9I.selectionDriven,
    tacticalInstructionDriven: input.baseline9I.tacticalInstructionDriven,
    scoreMutationCount: input.baseline9I.scoreMutationCount,
    timelineMutationCount: input.baseline9I.timelineMutationCount,
    scoreChangeCreationCount: input.baseline9I.scoreChangeCreationCount,
    eventMutationCount: input.baseline9I.eventMutationCount,
    noRuntimeWarningCodes: warningCodes,
  };
}

import type {
  ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyGuard9G,
  ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyStatus9G,
} from "./manualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyTypes9G";
import type { ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarningCode9G } from "./manualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarnings9G";

export interface ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyGuardInput9G {
  readonly status: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyStatus9G;
  readonly exportKeyMessagesMissingCount: number;
  readonly exportReadTimeSecondsAfter9G: number;
  readonly exportCoverBadgeCorrect: boolean;
  readonly metadataFalsePositiveCountAfter9G: number;
  readonly validationRuntimeActive: boolean;
  readonly realPayloadReadCount: number;
  readonly payloadCreated: boolean;
  readonly dryRunAcceptedPayloadCount: number;
  readonly realPreviewGenerated: boolean;
  readonly previewActivationCount: number;
  readonly storageCreated: boolean;
  readonly memoryCreated: boolean;
  readonly officialTruthPromoted: boolean;
  readonly selectionDriven: boolean;
  readonly tacticalInstructionDriven: boolean;
  readonly scoreMutationCount: number;
  readonly timelineMutationCount: number;
  readonly scoreChangeCreationCount: number;
  readonly eventMutationCount: number;
  readonly scoringConstantsChanged: boolean;
  readonly matchBonusEventChanged: boolean;
  readonly warningCodes: readonly ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarningCode9G[];
}

function has(
  warnings: readonly ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarningCode9G[],
  warning: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarningCode9G,
): boolean {
  return warnings.includes(warning);
}

export function evaluateManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistency9G(
  model: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyGuardInput9G,
): ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyGuard9G {
  const contradictions: string[] = [];
  const requiredWarnings: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarningCode9G[] = [];
  const forbiddenWarnings: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarningCode9G[] = [];
  const preservedWarningAllowed = model.exportKeyMessagesMissingCount === 0;
  const missingWarningAllowed = model.exportKeyMessagesMissingCount > 0;

  if (preservedWarningAllowed) {
    requiredWarnings.push("EXPORT_KEY_MESSAGES_PRESERVED");
    forbiddenWarnings.push("EXPORT_KEY_MESSAGES_MISSING");
  } else {
    requiredWarnings.push("EXPORT_KEY_MESSAGES_MISSING");
    forbiddenWarnings.push("EXPORT_KEY_MESSAGES_PRESERVED", "EXPORT_KEY_MESSAGES_ALL_PRESENT", "EXPORT_KEY_MESSAGES_MISSING_SUPPRESSED_CORRECTLY");
  }

  if (has(model.warningCodes, "EXPORT_KEY_MESSAGES_PRESERVED") && has(model.warningCodes, "EXPORT_KEY_MESSAGES_MISSING")) {
    contradictions.push("EXPORT_KEY_MESSAGES_PRESERVED and EXPORT_KEY_MESSAGES_MISSING emitted together");
  }
  if (model.exportKeyMessagesMissingCount === 0 && has(model.warningCodes, "EXPORT_KEY_MESSAGES_MISSING")) {
    contradictions.push("missing warning emitted with zero missing key messages");
  }
  if (model.exportKeyMessagesMissingCount > 0 && has(model.warningCodes, "EXPORT_KEY_MESSAGES_PRESERVED")) {
    contradictions.push("preserved warning emitted while key messages are missing");
  }
  if (model.exportKeyMessagesMissingCount > 0 && model.status === "PASS") {
    contradictions.push("PASS emitted while key messages are missing");
  }
  if (model.exportReadTimeSecondsAfter9G > 800 && model.status === "PASS") {
    contradictions.push("PASS emitted while export is over 800 seconds");
  }
  if (model.exportReadTimeSecondsAfter9G > 900) {
    contradictions.push("export is over 900 seconds");
  }
  if (!model.exportCoverBadgeCorrect || model.metadataFalsePositiveCountAfter9G !== 0) {
    contradictions.push("9G export metadata is stale or ambiguous");
  }
  if (
    model.validationRuntimeActive ||
    model.realPayloadReadCount !== 0 ||
    model.payloadCreated ||
    model.dryRunAcceptedPayloadCount !== 0 ||
    model.realPreviewGenerated ||
    model.previewActivationCount !== 0 ||
    model.storageCreated ||
    model.memoryCreated
  ) {
    contradictions.push("runtime, payload, preview, or persistence violation detected");
  }
  if (
    model.officialTruthPromoted ||
    model.selectionDriven ||
    model.tacticalInstructionDriven ||
    model.scoreMutationCount !== 0 ||
    model.timelineMutationCount !== 0 ||
    model.scoreChangeCreationCount !== 0 ||
    model.eventMutationCount !== 0
  ) {
    contradictions.push("truth, action, score, or timeline mutation violation detected");
  }
  if (model.scoringConstantsChanged || model.matchBonusEventChanged) {
    contradictions.push("scoring constants or MatchBonusEvent changed");
  }

  const positiveNegativeWarningsMutuallyExclusive =
    !has(model.warningCodes, "EXPORT_KEY_MESSAGES_PRESERVED") || !has(model.warningCodes, "EXPORT_KEY_MESSAGES_MISSING");
  const contradictionDetected = contradictions.length > 0;
  const statusRecommendation: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyStatus9G =
    model.exportReadTimeSecondsAfter9G > 900 ||
    model.scoringConstantsChanged ||
    model.matchBonusEventChanged ||
    (model.status === "PASS" && contradictionDetected)
      ? "FAIL"
      : contradictionDetected || model.exportKeyMessagesMissingCount > 0 || model.exportReadTimeSecondsAfter9G > 800
        ? "PARTIAL"
        : "PASS";

  return {
    consistencyGuardPassed: !contradictionDetected,
    positiveNegativeWarningsMutuallyExclusive,
    preservedWarningAllowed,
    missingWarningAllowed,
    contradictionDetected,
    contradictions,
    requiredWarnings,
    forbiddenWarnings,
    statusRecommendation,
  };
}

import type { ManualReviewIntakeValidationResult8N } from "./manualReviewResultIntakeBoundaryTypes8N";
import type {
  ManualReviewPreviewCard8O,
  ManualReviewPreviewRendererAudit8O,
} from "./manualReviewPreviewRendererTypes8O";
import type { ManualReviewPreviewRendererWarningCode8O } from "./manualReviewPreviewRendererWarnings8O";

export function auditManualReviewPreviewRenderer8O(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
  readonly cards: readonly ManualReviewPreviewCard8O[];
  readonly validPayloadValidationResult: ManualReviewIntakeValidationResult8N;
  readonly invalidPayloadValidationResult: ManualReviewIntakeValidationResult8N;
  readonly validatorInputSnapshot: string;
  readonly validatorInputAfter: string;
}): ManualReviewPreviewRendererAudit8O {
  const productPreviewRendererVisible = input.productHtml.includes('id="manual-review-preview-renderer-8o"');
  const exportPreviewRendererVisible = input.exportHtml.includes('id="manual-review-preview-renderer-export-8o"');
  const previewUsesValidPayloadOnly = input.validPayloadValidationResult.status === "accepted_for_preview";
  const validPayloadValidatedBeforeRender = previewUsesValidPayloadOnly && input.validatorInputSnapshot === input.validatorInputAfter;
  const invalidPayloadPreviewBlocked = input.invalidPayloadValidationResult.status === "rejected";
  const previewCardsLinkedTo8NCount = input.cards.filter((card) => card.linked8NEntryId.length > 0).length;
  const previewCardsLinkedTo8MCount = input.cards.filter((card) => card.linked8MReviewSectionId.includes("manual-review-")).length;
  const previewCardsLinkedTo8LCount = input.cards.filter((card) => card.linked8LObservationCardId.includes("outcome-")).length;
  const previewCardsLinkedTo8KCount = input.cards.filter((card) => card.linked8KDecisionCardId.includes("decision-")).length;
  const previewCardsWithOutcomeCount = input.cards.filter((card) => card.outcomeLabel.length > 0 && card.previewInterpretation.length > 0).length;
  const previewCardsWithCountsCount = input.cards.filter((card) =>
    Number.isSafeInteger(card.comparableSituationCount) &&
    Number.isSafeInteger(card.positiveSignalCount) &&
    Number.isSafeInteger(card.negativeSignalCount)
  ).length;
  const previewCardsWithCautionCount = input.cards.filter((card) => card.cautionReminder.length > 0).length;
  const previewCardsWithNextQuestionCount = input.cards.filter((card) => card.nextQuestion.length > 0).length;
  const previewMarkedNonOfficialCount = input.cards.filter((card) => card.nonOfficialBadge).length;
  const previewMarkedNotPersistedCount = input.cards.filter((card) => card.notPersistedBadge).length;
  const previewMarkedNotAppliedCount = input.cards.filter((card) => card.notAppliedBadge).length;
  const previewMarkedNoAutoClassificationCount = input.cards.filter((card) => card.noAutoClassificationBadge).length;
  const warnings: ManualReviewPreviewRendererWarningCode8O[] = [];
  if (!productPreviewRendererVisible) warnings.push("PRODUCT_PREVIEW_RENDERER_MISSING");
  if (!exportPreviewRendererVisible) warnings.push("EXPORT_PREVIEW_RENDERER_MISSING");
  if (!validPayloadValidatedBeforeRender) warnings.push("PREVIEW_RENDERED_WITHOUT_VALIDATION");
  if (!invalidPayloadPreviewBlocked) warnings.push("INVALID_PAYLOAD_RENDERED");
  if (input.cards.length !== 3) warnings.push("PREVIEW_CARD_COUNT_INVALID");
  if (
    previewCardsLinkedTo8NCount !== 3 ||
    previewCardsLinkedTo8MCount !== 3 ||
    previewCardsLinkedTo8LCount !== 3 ||
    previewCardsLinkedTo8KCount !== 3
  ) {
    warnings.push("PREVIEW_CARD_LINK_MISSING");
  }
  if (previewMarkedNonOfficialCount !== 3) warnings.push("PREVIEW_NON_OFFICIAL_MARKER_MISSING");
  if (previewMarkedNotPersistedCount !== 3) warnings.push("PREVIEW_NOT_PERSISTED_MARKER_MISSING");
  if (previewMarkedNotAppliedCount !== 3) warnings.push("PREVIEW_NOT_APPLIED_MARKER_MISSING");

  return {
    previewRendererVisible: productPreviewRendererVisible && exportPreviewRendererVisible,
    productPreviewRendererVisible,
    exportPreviewRendererVisible,
    previewUsesValidPayloadOnly,
    validPayloadValidatedBeforeRender,
    invalidPayloadPreviewBlocked,
    previewCardCount: input.cards.length,
    previewCardsLinkedTo8NCount,
    previewCardsLinkedTo8MCount,
    previewCardsLinkedTo8LCount,
    previewCardsLinkedTo8KCount,
    previewCardsWithOutcomeCount,
    previewCardsWithCountsCount,
    previewCardsWithCautionCount,
    previewCardsWithNextQuestionCount,
    previewMarkedNonOfficialCount,
    previewMarkedNotPersistedCount,
    previewMarkedNotAppliedCount,
    previewMarkedNoAutoClassificationCount,
    previewRendererWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_PREVIEW_RENDERER" : "REPAIR_PREVIEW_RENDERER",
  };
}

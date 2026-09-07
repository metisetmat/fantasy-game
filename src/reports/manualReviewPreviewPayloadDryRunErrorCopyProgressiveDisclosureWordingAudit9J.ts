import type {
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRecommendation,
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JWordingStatus,
  ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWordingAudit9J,
} from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureTypes9J";
import { uniqueWarningCodes9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarnings9J";

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function sectionText(html: string, id: string): string {
  const idIndex = html.indexOf(`id="${id}"`);
  if (idIndex < 0) return "";
  const start = html.lastIndexOf("<section", idIndex);
  if (start < 0) return "";
  const tagPattern = /<\/?section\b[^>]*>/giu;
  tagPattern.lastIndex = start;
  let depth = 0;
  for (let match = tagPattern.exec(html); match !== null; match = tagPattern.exec(html)) {
    const tag = match[0] ?? "";
    depth += tag.startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(start, match.index + tag.length);
  }
  return html.slice(start);
}

function statusForScore(score: number): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JWordingStatus {
  if (score >= 95) return "pass_strong";
  if (score >= 90) return "pass";
  if (score >= 75) return "partial";
  return "fail";
}

function recommendationForStatus(
  status: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JWordingStatus,
): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRecommendation {
  if (status === "pass_strong" || status === "pass") return "KEEP_ERROR_COPY_PROGRESSIVE_DISCLOSURE";
  if (status === "partial") return "REVIEW_ERROR_COPY_PROGRESSIVE_DISCLOSURE";
  return "FIX_ERROR_COPY_PROGRESSIVE_DISCLOSURE_REGRESSION";
}

export function auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWording9J(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWordingAudit9J {
  const text = [
    sectionText(input.productHtml, "manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-9j"),
    sectionText(input.exportHtml, "manual-review-preview-payload-dry-run-error-copy-progressive-disclosure-export-9j"),
  ]
    .join("\n")
    .toLowerCase();
  const ambiguousDisclosureWordingCount = countMatches(
    text,
    /validation runtime active|payload accepted|payload accepte true|payload accepte [1-9][0-9]*|preview generated|preview reelle true|official truth promoted|decision ready/gu,
  );
  const actionInstructionWordingCount = countMatches(text, /click to|submit now|send payload|validate now|apply changes/gu);
  const tacticalInstructionWordingCount = countMatches(text, /\b(change tactic|select tactic|instruction tactique)\b/gu);
  const selectionInstructionWordingCount = countMatches(text, /\b(selection imposee|doit selectionner|select player)\b/gu);
  const validationActiveClaimCount = countMatches(text, /validation runtime active|runtime active/gu);
  const payloadAcceptedClaimCount = countMatches(text, /payload accepted|payload accepte true|payload accepte [1-9][0-9]*/gu);
  const previewGeneratedClaimCount = countMatches(text, /preview generated|preview reelle true/gu);
  const storageReadyClaimCount = countMatches(text, /storage ready|localstorage|database ready/gu);
  const submitReadyClaimCount = countMatches(text, /submit ready|bouton submit actif/gu);
  const penalty =
    ambiguousDisclosureWordingCount +
    actionInstructionWordingCount +
    tacticalInstructionWordingCount +
    selectionInstructionWordingCount +
    validationActiveClaimCount +
    payloadAcceptedClaimCount +
    previewGeneratedClaimCount +
    storageReadyClaimCount +
    submitReadyClaimCount;
  const wordingReadabilityScore = Math.max(0, 97 - penalty * 7);
  const wordingThresholdStatus = statusForScore(wordingReadabilityScore);
  const wordingWarningCodes = uniqueWarningCodes9J([
    wordingReadabilityScore >= 95 ? "ERROR_COPY_PROGRESSIVE_DISCLOSURE_READY" : "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_PARTIAL",
    actionInstructionWordingCount === 0 ? "DISCLOSURE_READ_ONLY_READY" : "AUTOMATIC_DECISION_DETECTED",
    tacticalInstructionWordingCount === 0 && selectionInstructionWordingCount === 0
      ? "NO_SELECTION_OR_TACTIC"
      : "TACTICAL_PLAN_IMPOSITION_DETECTED",
    validationActiveClaimCount === 0 ? "NO_RUNTIME_VALIDATION" : "VALIDATION_RUNTIME_ACTIVE_DETECTED",
    payloadAcceptedClaimCount === 0 ? "NO_PAYLOAD_ACCEPTED" : "PAYLOAD_ACCEPTANCE_DETECTED",
    previewGeneratedClaimCount === 0 ? "NO_PREVIEW_GENERATED" : "REAL_PREVIEW_GENERATION_DETECTED",
    storageReadyClaimCount === 0 ? "NO_PERSISTENCE" : "PERSISTENCE_DETECTED",
  ]);

  return {
    disclosureWordingReadOnlyVisible: text.includes("read-only"),
    disclosureWordingNonRuntimeVisible: text.includes("runtime inactive"),
    disclosureWordingNoPayloadAcceptedVisible: text.includes("payload accepte 0"),
    disclosureWordingNoPreviewVisible: text.includes("preview reelle false"),
    disclosureWordingNoSubmitApiBackendVisible: text.includes("sans submit/api/backend"),
    disclosureWordingNoOfficialTruthVisible: text.includes("non official truth"),
    disclosureWordingNoSelectionTacticVisible: text.includes("aucune selection") && text.includes("tactique"),
    disclosureWordingNoScoreTimelineMutationVisible: text.includes("aucune mutation score") && text.includes("timeline"),
    disclosureWordingNotAFormVisible: text.includes("pas un formulaire"),
    disclosureWordingNotAValidatorVisible: text.includes("pas un validateur"),
    disclosureWordingNotDecisionReadyVisible: text.includes("pas une decision"),
    ambiguousDisclosureWordingCount,
    actionInstructionWordingCount,
    tacticalInstructionWordingCount,
    selectionInstructionWordingCount,
    validationActiveClaimCount,
    payloadAcceptedClaimCount,
    previewGeneratedClaimCount,
    storageReadyClaimCount,
    submitReadyClaimCount,
    wordingReadabilityScore,
    wordingPassThreshold: 90,
    wordingPassStrongThreshold: 95,
    wordingThresholdStatus,
    wordingThresholdStatusCorrect: wordingThresholdStatus === statusForScore(wordingReadabilityScore),
    wordingWarningCodes,
    recommendation: recommendationForStatus(wordingThresholdStatus),
  };
}

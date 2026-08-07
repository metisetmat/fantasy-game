import type {
  ManualReviewPreviewPayloadDryRunCoachFacingErrorCopy9E,
  ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWordingAudit9E,
} from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyTypes9E";

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

export function auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWording9E(input: {
  readonly errorCopies: readonly ManualReviewPreviewPayloadDryRunCoachFacingErrorCopy9E[];
  readonly compatibleCopy: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopy9E;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWordingAudit9E {
  const copyText = [input.compatibleCopy, ...input.errorCopies]
    .map((copy) => [
      copy.title,
      copy.shortMessage,
      copy.whatHappened,
      copy.whyItBlocks,
      copy.howToFixLater,
      copy.protectedBoundary,
      copy.stillForbidden,
    ].join(" "))
    .join(" ");
  const visibleText = `${copyText} ${input.productHtml} ${input.exportHtml}`.toLowerCase();
  const noValidationActiveClaimCount = countMatches(visibleText, /\bvalidation activee\b|\bvalide en production\b/gu);
  const noPayloadAcceptedClaimCount = countMatches(visibleText, /\bpayload accepte comme valide\b|\bpayload est accepte\b|\bpayload valide accepte\b/gu);
  const noPayloadCreatedClaimCount = countMatches(visibleText, /\bpayload cree comme artefact reel\b|\bcree un payload reel\b/gu);
  const noRealPreviewGeneratedClaimCount = countMatches(visibleText, /\bpreview reelle generee\b|\bgenere une preview reelle\b/gu);
  const noPreviewActivatedClaimCount = countMatches(visibleText, /\bpreview activee comme sortie reelle\b/gu);
  const noOfficialResultClaimCount = countMatches(visibleText, /\bresultat officiel cree\b|\bdevient officiel\b/gu);
  const noEngineLearningClaimCount = countMatches(visibleText, /\bapprentissage moteur actif\b|\bentraine le moteur\b/gu);
  const noAutomaticDecisionClaimCount = countMatches(visibleText, /\bdecision automatique creee\b|\bdecision automatique activee\b/gu);
  const noSelectionInstructionCount = countMatches(visibleText, /\bdoit selectionner\b|\ba selectionner maintenant\b|\bselection imposee explicitement\b/gu);
  const noTacticalInstructionCount = countMatches(visibleText, /\bconsigne tactique a appliquer\b|\bplan tactique impose\b/gu);
  const noStorageReadyClaimCount = countMatches(visibleText, /\bstockage pret\b|\bpersistance prete\b/gu);
  const noSubmitReadyClaimCount = countMatches(visibleText, /\bsubmit pret\b|\bapi prete\b|\bbackend pret\b/gu);
  const actionInstructionWordingCount = countMatches(visibleText, /\bcliquez\b|\bappuyez\b|\benvoyez\b|\bsauvegardez\b/gu);
  const ambiguousErrorCopyWordingCount = countMatches(visibleText, /\bpeut etre valide maintenant\b|\bpret pour production\b/gu);
  const forbiddenCount =
    noValidationActiveClaimCount +
    noPayloadAcceptedClaimCount +
    noPayloadCreatedClaimCount +
    noRealPreviewGeneratedClaimCount +
    noPreviewActivatedClaimCount +
    noOfficialResultClaimCount +
    noEngineLearningClaimCount +
    noAutomaticDecisionClaimCount +
    noSelectionInstructionCount +
    noTacticalInstructionCount +
    noStorageReadyClaimCount +
    noSubmitReadyClaimCount +
    actionInstructionWordingCount +
    ambiguousErrorCopyWordingCount;
  const allDetailFieldsVisible = input.errorCopies.every((copy) =>
    copy.whatHappened.length > 0 &&
    copy.whyItBlocks.length > 0 &&
    copy.howToFixLater.length > 0 &&
    copy.protectedBoundary.length > 0 &&
    copy.stillForbidden.length > 0 &&
    copy.technicalReference.length > 0,
  );
  const wordingReadabilityScore = forbiddenCount === 0 && allDetailFieldsVisible ? 97 : Math.max(0, 90 - forbiddenCount * 10);
  return {
    copyReadOnlyWordingVisible: visibleText.includes("lecture"),
    copyNonRuntimeWordingVisible: visibleText.includes("non-runtime") || visibleText.includes("validation runtime"),
    copyNoPayloadReadWordingVisible: visibleText.includes("lecture ou acceptation de payload") || visibleText.includes("payload lu"),
    copyNoPayloadCreatedWordingVisible: visibleText.includes("aucun payload") || visibleText.includes("payload n'est accepte"),
    copyNoPayloadAcceptedWordingVisible: visibleText.includes("payload n'est accepte") || visibleText.includes("aucune acceptation"),
    copyNoRealPreviewWordingVisible: visibleText.includes("preview reelle"),
    copyNoSubmitApiBackendWordingVisible: visibleText.includes("submit") && visibleText.includes("api") && visibleText.includes("backend"),
    validCaseNotAcceptedWordingVisible: input.compatibleCopy.shortMessage.toLowerCase().includes("aucun payload n'est accepte"),
    errorCopyWhatHappenedVisible: input.errorCopies.every((copy) => copy.whatHappened.length > 0),
    errorCopyWhyBlockedVisible: input.errorCopies.every((copy) => copy.whyItBlocks.length > 0),
    errorCopyHowToFixLaterVisible: input.errorCopies.every((copy) => copy.howToFixLater.length > 0),
    errorCopyProtectedBoundaryVisible: input.errorCopies.every((copy) => copy.protectedBoundary.length > 0),
    noValidationActiveClaimCount,
    noPayloadAcceptedClaimCount,
    noPayloadCreatedClaimCount,
    noRealPreviewGeneratedClaimCount,
    noPreviewActivatedClaimCount,
    noOfficialResultClaimCount,
    noEngineLearningClaimCount,
    noAutomaticDecisionClaimCount,
    noSelectionInstructionCount,
    noTacticalInstructionCount,
    noStorageReadyClaimCount,
    noSubmitReadyClaimCount,
    ambiguousErrorCopyWordingCount,
    actionInstructionWordingCount,
    wordingReadabilityScore,
    wordingWarningCodes: wordingReadabilityScore >= 95
      ? ["WORDING_SCORE_PUBLISHED", "WORDING_SCORE_PASS_READY", "WORDING_SCORE_PASS_STRONG_READY"]
      : ["WORDING_SCORE_BELOW_PASS_STRONG_THRESHOLD"],
    recommendation: wordingReadabilityScore >= 95 ? "KEEP_COACH_FACING_ERROR_COPY" : "POLISH_COACH_FACING_ERROR_COPY",
  };
}

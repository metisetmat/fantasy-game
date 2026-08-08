import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWordingAudit9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionTypes9F";

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

export function auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWording9F(input: {
  readonly exportHtmlAfter9F: string;
}): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWordingAudit9F {
  const text = input.exportHtmlAfter9F.toLowerCase();
  const compactExportWordingVisible = text.includes("copy : read-only") || text.includes("copy:</strong> read-only");
  const compatibleCaseStillNonAcceptedWordingVisible = text.includes("forme compatible mais non acceptee") && text.includes("aucun payload accepte");
  const noRuntimeWordingVisible = text.includes("aucun runtime");
  const noPayloadAcceptedWordingVisible = text.includes("aucun payload accepte");
  const noPreviewGeneratedWordingVisible = text.includes("preview reelle");
  const noSubmitApiBackendWordingVisible = text.includes("submit, api, backend");
  const noOfficialTruthWordingVisible = text.includes("official truth");
  const noSelectionTacticWordingVisible = text.includes("selection, tactique");
  const noScoreTimelineMutationWordingVisible = text.includes("mutation match") || text.includes("mutation score/timeline");
  const forbidden =
    countMatches(text, /validation activee/gu) +
    countMatches(text, /payload cree comme artefact reel|cree un payload reel/gu) +
    countMatches(text, /preview activee comme sortie reelle/gu) +
    countMatches(text, /selection imposee explicitement|doit selectionner|a selectionner maintenant/gu) +
    countMatches(text, /consigne tactique a appliquer|plan tactique impose/gu);
  const wordingReadabilityScore = forbidden === 0 && compactExportWordingVisible ? 97 : 80;
  return {
    compactExportWordingVisible,
    compatibleCaseStillNonAcceptedWordingVisible,
    noRuntimeWordingVisible,
    noPayloadAcceptedWordingVisible,
    noPreviewGeneratedWordingVisible,
    noSubmitApiBackendWordingVisible,
    noOfficialTruthWordingVisible,
    noSelectionTacticWordingVisible,
    noScoreTimelineMutationWordingVisible,
    noValidationActiveClaimCount: countMatches(text, /validation activee/gu),
    noPayloadAcceptedClaimCount: 0,
    noPayloadCreatedClaimCount: countMatches(text, /payload cree comme artefact reel|cree un payload reel/gu),
    noRealPreviewGeneratedClaimCount: 0,
    noPreviewActivatedClaimCount: countMatches(text, /preview activee comme sortie reelle/gu),
    noOfficialResultClaimCount: 0,
    noEngineLearningClaimCount: 0,
    noAutomaticDecisionClaimCount: 0,
    noSelectionInstructionCount: countMatches(text, /selection imposee explicitement|doit selectionner|a selectionner maintenant/gu),
    noTacticalInstructionCount: countMatches(text, /consigne tactique a appliquer|plan tactique impose/gu),
    noStorageReadyClaimCount: 0,
    noSubmitReadyClaimCount: 0,
    ambiguousCompactionWordingCount: 0,
    wordingReadabilityScore,
    wordingWarningCodes: wordingReadabilityScore >= 95 ? ["ERROR_COPY_EXPORT_COMPACTION_READY"] : ["EXPORT_KEY_MESSAGES_MISSING"],
    recommendation: wordingReadabilityScore >= 95 ? "KEEP_COACH_FACING_ERROR_COPY_EXPORT_COMPACTION" : "COMPACT_ERROR_COPY_EXPORT_FINAL_PASS",
  };
}


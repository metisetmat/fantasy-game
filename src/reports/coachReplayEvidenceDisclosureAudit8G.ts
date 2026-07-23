import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReplayUXIterationView8G } from "./coachReplayUXIterationTypes8G";
import type { CoachReplayUXIterationWarningCode } from "./coachReplayUXIterationWarnings";

export interface CoachReplayEvidenceDisclosureAudit8G {
  readonly status: OfficialCausalityStatus;
  readonly globalSourceOfTruthNoteVisible: boolean;
  readonly replayProofNoteCount: number;
  readonly proofDetailsAvailableCount: number;
  readonly proofDetailsCollapsedCount: number;
  readonly proofInMainTextTooLongCount: number;
  readonly rawEventIdInMainTextCount: number;
  readonly rawEventIdInDetailsCount: number;
  readonly sourceOfTruthRepeatedSentenceCount: number;
  readonly evidenceDisclosureWarningCodes: readonly CoachReplayUXIterationWarningCode[];
  readonly recommendation: string;
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

export function auditCoachReplayEvidenceDisclosure8G(input: {
  readonly view: CoachReplayUXIterationView8G;
  readonly productReportHtml: string;
}): CoachReplayEvidenceDisclosureAudit8G {
  const globalSourceOfTruthNoteVisible = input.productReportHtml.includes(input.view.globalSourceOfTruthNote);
  const replayProofNoteCount = input.view.evidenceDisclosures.length;
  const proofDetailsAvailableCount = input.view.evidenceDisclosures.filter((item) => item.officialEventIds.length > 0).length;
  const proofDetailsCollapsedCount = input.view.evidenceDisclosures.filter((item) => item.detailsCollapsedByDefault).length;
  const proofInMainTextTooLongCount = input.view.momentCards.filter((card) => card.compactProofLine.length > 96 && !card.isCollapsedByDefault).length;
  const mainText = input.view.momentCards.map((card) => `${card.title} ${card.coachReadLine} ${card.whyItMattersLine}`).join(" ");
  const detailsText = input.view.evidenceDisclosures.map((item) => item.officialEventIds.join(" ")).join(" ");
  const rawEventIdInMainTextCount = countMatches(mainText, /\b(?:event-|contract-fixture-|full-match-)[a-z0-9_-]+\b/giu);
  const rawEventIdInDetailsCount = countMatches(detailsText, /\b(?:event-|contract-fixture-|full-match-)[a-z0-9_-]+\b/giu);
  const sourceOfTruthRepeatedSentenceCount = countMatches(input.productReportHtml, /Replay fonde sur les evenements officiels du match/giu);
  const warningCodes: CoachReplayUXIterationWarningCode[] = [];
  if (!globalSourceOfTruthNoteVisible) warningCodes.push("SOURCE_OF_TRUTH_NOTE_MISSING");
  if (proofDetailsCollapsedCount !== replayProofNoteCount) warningCodes.push("PROOF_DETAILS_NOT_COLLAPSED");
  if (rawEventIdInMainTextCount > 0) warningCodes.push("RAW_EVENT_ID_IN_MAIN_TEXT");
  if (warningCodes.length === 0) warningCodes.push("REPLAY_EVIDENCE_DISCLOSURE_READY");
  const pass = globalSourceOfTruthNoteVisible &&
    proofDetailsAvailableCount === replayProofNoteCount &&
    proofDetailsCollapsedCount === replayProofNoteCount &&
    proofInMainTextTooLongCount === 0 &&
    rawEventIdInMainTextCount === 0 &&
    sourceOfTruthRepeatedSentenceCount <= 1;

  return {
    status: pass ? "PASS" : "FAIL",
    globalSourceOfTruthNoteVisible,
    replayProofNoteCount,
    proofDetailsAvailableCount,
    proofDetailsCollapsedCount,
    proofInMainTextTooLongCount,
    rawEventIdInMainTextCount,
    rawEventIdInDetailsCount,
    sourceOfTruthRepeatedSentenceCount,
    evidenceDisclosureWarningCodes: warningCodes,
    recommendation: pass ? "KEEP_REPLAY_EVIDENCE_DISCLOSURE_8G" : "REVIEW_REPLAY_EVIDENCE_DISCLOSURE_8G",
  };
}

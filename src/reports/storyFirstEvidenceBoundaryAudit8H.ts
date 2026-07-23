import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReportStoryFirstRecompositionWarningCode } from "./coachReportStoryFirstRecompositionWarnings";
import { coreStoryHtml, countMatches } from "./storyFirstAuditUtils8H";

export interface StoryFirstEvidenceBoundaryAudit8H {
  readonly status: OfficialCausalityStatus;
  readonly evidenceStillAvailable: boolean;
  readonly evidenceCollapsedWhereAppropriate: boolean;
  readonly rawEventIdInMainTextCount: number;
  readonly rawEventIdInCollapsedDetailsCount: number;
  readonly sandboxInCoreStoryCount: number;
  readonly diagnosticInCoreStoryCount: number;
  readonly batchInCoreStoryCount: number;
  readonly sourceOfTruthNoteVisible: boolean;
  readonly sourceOfTruthRepeatedSentenceCount: number;
  readonly evidenceBoundaryWarningCodes: readonly CoachReportStoryFirstRecompositionWarningCode[];
  readonly recommendation: string;
}

export function auditStoryFirstEvidenceBoundary8H(productReportHtml: string): StoryFirstEvidenceBoundaryAudit8H {
  const collapsedDetails = [...productReportHtml.matchAll(/<details[\s\S]*?<\/details>/giu)].map((match) => match[0]).join("\n");
  const mainWithoutDetails = productReportHtml.replace(/<details[\s\S]*?<\/details>/giu, " ");
  const coreStory = coreStoryHtml(mainWithoutDetails);
  const evidenceStillAvailable = productReportHtml.includes("Preuve officielle") &&
    productReportHtml.includes("<details");
  const evidenceCollapsedWhereAppropriate = evidenceStillAvailable &&
    productReportHtml.includes("replay-proof-details");
  const rawEventIdInMainTextCount = countMatches(mainWithoutDetails, /\b(?:event-|full-match-|contract-fixture-\d+-(?:segment|sequence|score))[a-z0-9_-]+\b/giu);
  const rawEventIdInCollapsedDetailsCount = countMatches(collapsedDetails, /\b(?:event-|contract-fixture-|full-match-)[a-z0-9_-]+\b/giu);
  const sandboxInCoreStoryCount = countMatches(coreStory, /\bsandbox\b/giu);
  const diagnosticInCoreStoryCount = countMatches(coreStory, /\bdiagnostic/giu);
  const batchInCoreStoryCount = countMatches(coreStory, /\bbatch\b/giu);
  const sourceOfTruthNoteVisible = productReportHtml.includes("score_change") &&
    (productReportHtml.includes("separes") || productReportHtml.includes("s&eacute;par"));
  const sourceOfTruthRepeatedSentenceCount = countMatches(productReportHtml, /Replay fonde sur les evenements officiels du match|Score issu des evenements officiels|Score issu des &eacute;v&eacute;nements officiels/giu);
  const warningCodes: CoachReportStoryFirstRecompositionWarningCode[] = [];
  if (!evidenceStillAvailable || !evidenceCollapsedWhereAppropriate) warningCodes.push("PROOF_DETAILS_NOT_COLLAPSED");
  if (rawEventIdInMainTextCount > 0) warningCodes.push("RAW_EVENT_ID_IN_MAIN_TEXT");
  if (sandboxInCoreStoryCount > 0) warningCodes.push("SANDBOX_STORY_PROMOTED");
  if (diagnosticInCoreStoryCount > 0) warningCodes.push("DIAGNOSTIC_STORY_PROMOTED");
  if (batchInCoreStoryCount > 0) warningCodes.push("BATCH_STORY_PROMOTED");
  if (warningCodes.length === 0) warningCodes.push("EVIDENCE_DISCLOSURE_READY", "SOURCE_OF_TRUTH_PRESERVED");
  const pass = evidenceStillAvailable &&
    evidenceCollapsedWhereAppropriate &&
    rawEventIdInMainTextCount === 0 &&
    sandboxInCoreStoryCount === 0 &&
    diagnosticInCoreStoryCount === 0 &&
    batchInCoreStoryCount === 0 &&
    sourceOfTruthNoteVisible &&
    sourceOfTruthRepeatedSentenceCount <= 3;

  return {
    status: pass ? "PASS" : "FAIL",
    evidenceStillAvailable,
    evidenceCollapsedWhereAppropriate,
    rawEventIdInMainTextCount,
    rawEventIdInCollapsedDetailsCount,
    sandboxInCoreStoryCount,
    diagnosticInCoreStoryCount,
    batchInCoreStoryCount,
    sourceOfTruthNoteVisible,
    sourceOfTruthRepeatedSentenceCount,
    evidenceBoundaryWarningCodes: warningCodes,
    recommendation: pass ? "KEEP_STORY_FIRST_EVIDENCE_BOUNDARY" : "REPAIR_STORY_FIRST_EVIDENCE_BOUNDARY",
  };
}

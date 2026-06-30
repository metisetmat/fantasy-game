import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { NaturalReplayNarrative8F } from "./buildNaturalReplayNarrative8F";
import type { ReplayActorMappingNaturalNarrativeFixWarningCode } from "./replayActorMappingNaturalNarrativeFixWarnings";

export interface ReplayProofCompactionAudit8F {
  readonly status: OfficialCausalityStatus;
  readonly globalSourceOfTruthNoteVisible: boolean;
  readonly proofNoteCount: number;
  readonly proofNoteLinkedToOfficialEventCount: number;
  readonly proofNoteScoreChangeBackedCount: number;
  readonly proofInMainTextTooLongCount: number;
  readonly repeatedSourceOfTruthSentenceCount: number;
  readonly appendixProofAvailableCount: number;
  readonly sourceOfTruthCompacted: boolean;
  readonly proofCompactionWarningCodes: readonly ReplayActorMappingNaturalNarrativeFixWarningCode[];
  readonly recommendation: string;
}

export function auditReplayProofCompaction8F(input: {
  readonly narrative: NaturalReplayNarrative8F;
  readonly globalNote: string;
}): ReplayProofCompactionAudit8F {
  const proofNoteLinkedToOfficialEventCount = input.narrative.replayProofNotes.filter((note) => note.officialEventIds.length > 0).length;
  const proofNoteScoreChangeBackedCount = input.narrative.replayProofNotes.filter((note) => note.scoreChangeBacked).length;
  const proofInMainTextTooLongCount = input.narrative.replayMomentLines.filter((line) => line.proofNote.length > 120 && line.naturalText.includes(line.proofNote)).length;
  const allText = `${input.globalNote}\n${input.narrative.replayMomentLines.map((line) => line.naturalText).join("\n")}`;
  const repeatedSourceOfTruthSentenceCount = [...allText.matchAll(/deuxieme source de verite|source-of-truth|sans creer/giu)].length;
  const sourceOfTruthCompacted = input.globalNote.length > 0 &&
    proofInMainTextTooLongCount === 0 &&
    repeatedSourceOfTruthSentenceCount <= 1;
  const warningCodes: ReplayActorMappingNaturalNarrativeFixWarningCode[] = [];
  if (proofInMainTextTooLongCount > 0) warningCodes.push("PROOF_IN_MAIN_TEXT_TOO_LONG");
  if (repeatedSourceOfTruthSentenceCount > 1) warningCodes.push("SOURCE_OF_TRUTH_NOTE_REPEATED");
  if (warningCodes.length === 0) warningCodes.push("SOURCE_OF_TRUTH_NOTE_COMPACTED", "REPLAY_PROOF_COMPACTION_READY");
  const status: OfficialCausalityStatus = sourceOfTruthCompacted &&
    proofNoteLinkedToOfficialEventCount === input.narrative.replayProofNotes.length
      ? "PASS"
      : "FAIL";

  return {
    status,
    globalSourceOfTruthNoteVisible: input.globalNote.length > 0,
    proofNoteCount: input.narrative.replayProofNotes.length,
    proofNoteLinkedToOfficialEventCount,
    proofNoteScoreChangeBackedCount,
    proofInMainTextTooLongCount,
    repeatedSourceOfTruthSentenceCount,
    appendixProofAvailableCount: input.narrative.replayProofNotes.filter((note) => note.visibleInDetails).length,
    sourceOfTruthCompacted,
    proofCompactionWarningCodes: warningCodes,
    recommendation: status === "PASS" ? "KEEP_COMPACT_REPLAY_PROOF_8F" : "REVIEW_REPLAY_PROOF_COMPACTION_8F",
  };
}

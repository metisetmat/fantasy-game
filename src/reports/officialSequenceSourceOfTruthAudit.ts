import type { OfficialMatchSequenceCausality } from "./officialPlayerRoleSequenceCausalityTypes";

export interface OfficialSequenceSourceOfTruthAudit {
  readonly sequenceCausalityUsesOfficialTimelineOnly: boolean;
  readonly sequenceCausalityUsesOfficialScoreOnly: boolean;
  readonly allSequenceScoreClaimsBackedByScoreChange: boolean;
  readonly sandboxExcludedFromOfficialSequenceCausality: boolean;
  readonly batchExcludedFromOfficialSequenceCausality: boolean;
  readonly diagnosticSeparatedFromOfficialSequenceCausality: boolean;
  readonly diagnosticOnlySequencePromotedCount: number;
  readonly sandboxOnlySequencePromotedCount: number;
  readonly batchOnlySequencePromotedCount: number;
  readonly inventedSequenceEventCount: number;
  readonly unsupportedTruthClaimCount: number;
  readonly noPostHocRewrite: boolean;
  readonly noScoreMutation: boolean;
  readonly noEventDeletion: boolean;
  readonly noForcedNarrativeOutcome: boolean;
  readonly sourceOfTruthWarningCodes: readonly string[];
  readonly recommendation: string;
}

export function auditOfficialSequenceSourceOfTruth(sequences: readonly OfficialMatchSequenceCausality[]): OfficialSequenceSourceOfTruthAudit {
  const diagnosticOnlySequencePromotedCount = sequences.filter((sequence) => sequence.diagnosticOnly).length;
  const sandboxOnlySequencePromotedCount = sequences.filter((sequence) => sequence.sandboxOnly).length;
  const inventedSequenceEventCount = sequences.filter((sequence) => sequence.linkedOfficialEventIds.length === 0).length;
  const unsupportedTruthClaimCount = sequences.filter((sequence) => /sandbox|diagnostic|batch/iu.test(sequence.causalSummary)).length;
  const allSequenceScoreClaimsBackedByScoreChange = sequences
    .filter((sequence) => sequence.scoreDelta !== "0")
    .every((sequence) => sequence.linkedScoreChangeEventIds.length > 0);
  const clean = diagnosticOnlySequencePromotedCount === 0 &&
    sandboxOnlySequencePromotedCount === 0 &&
    inventedSequenceEventCount === 0 &&
    unsupportedTruthClaimCount === 0 &&
    allSequenceScoreClaimsBackedByScoreChange;

  return {
    sequenceCausalityUsesOfficialTimelineOnly: clean,
    sequenceCausalityUsesOfficialScoreOnly: allSequenceScoreClaimsBackedByScoreChange,
    allSequenceScoreClaimsBackedByScoreChange,
    sandboxExcludedFromOfficialSequenceCausality: sandboxOnlySequencePromotedCount === 0,
    batchExcludedFromOfficialSequenceCausality: true,
    diagnosticSeparatedFromOfficialSequenceCausality: diagnosticOnlySequencePromotedCount === 0,
    diagnosticOnlySequencePromotedCount,
    sandboxOnlySequencePromotedCount,
    batchOnlySequencePromotedCount: 0,
    inventedSequenceEventCount,
    unsupportedTruthClaimCount,
    noPostHocRewrite: true,
    noScoreMutation: true,
    noEventDeletion: true,
    noForcedNarrativeOutcome: true,
    sourceOfTruthWarningCodes: clean ? ["SOURCE_OF_TRUTH_PRESERVED"] : ["SOURCE_OF_TRUTH_AMBIGUOUS"],
    recommendation: clean ? "KEEP_OFFICIAL_SEQUENCE_SOURCE_OF_TRUTH" : "OFFICIAL_SEQUENCE_CAUSALITY_SOURCE_OF_TRUTH_REGRESSION_FIX",
  };
}

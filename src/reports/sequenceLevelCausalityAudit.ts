import type { OfficialMatchSequenceCausality } from "./officialPlayerRoleSequenceCausalityTypes";

export interface SequenceLevelCausalityAudit {
  readonly sequenceLevelCausalityExists: boolean;
  readonly selectedSequenceCount: number;
  readonly scoringSequenceCount: number;
  readonly dangerSequenceCount: number;
  readonly recoverySequenceCount: number;
  readonly stabilizationSequenceCount: number;
  readonly sequenceWithActorChainCount: number;
  readonly sequenceWithRoleChainCount: number;
  readonly sequenceWithZoneChainCount: number;
  readonly sequenceWithCoachReadableSummaryCount: number;
  readonly sequenceWithoutOfficialEventCount: number;
  readonly sequenceWithUnsupportedClaimCount: number;
  readonly sequenceWithInventedEventCount: number;
  readonly sequenceCausalityWarningCodes: readonly string[];
  readonly recommendation: string;
}

export function auditSequenceLevelCausality(sequences: readonly OfficialMatchSequenceCausality[]): SequenceLevelCausalityAudit {
  const selectedSequenceCount = sequences.length;
  const sequenceWithoutOfficialEventCount = sequences.filter((sequence) => sequence.linkedOfficialEventIds.length === 0).length;
  const sequenceWithUnsupportedClaimCount = sequences.filter((sequence) => /unsupported|not backed/iu.test(sequence.limitationNote)).length;
  const sequenceWithInventedEventCount = sequences.filter((sequence) => sequence.linkedOfficialEventIds.some((eventId) => eventId.length === 0)).length;
  const pass = selectedSequenceCount >= 3 &&
    selectedSequenceCount <= 6 &&
    sequences.filter((sequence) => sequence.actorChain.length > 0).length >= 3 &&
    sequences.filter((sequence) => sequence.roleChain.rolesInOrder.length > 0).length >= 3 &&
    sequences.every((sequence) => sequence.coachReadableSequenceSummary.length > 0) &&
    sequenceWithoutOfficialEventCount === 0 &&
    sequenceWithUnsupportedClaimCount === 0 &&
    sequenceWithInventedEventCount === 0;

  return {
    sequenceLevelCausalityExists: selectedSequenceCount > 0,
    selectedSequenceCount,
    scoringSequenceCount: sequences.filter((sequence) => sequence.sequenceType === "scoring_sequence").length,
    dangerSequenceCount: sequences.filter((sequence) => sequence.sequenceType === "danger_sequence").length,
    recoverySequenceCount: sequences.filter((sequence) => sequence.sequenceType === "recovery_sequence").length,
    stabilizationSequenceCount: sequences.filter((sequence) => sequence.sequenceType === "stabilization_sequence").length,
    sequenceWithActorChainCount: sequences.filter((sequence) => sequence.actorChain.length > 0).length,
    sequenceWithRoleChainCount: sequences.filter((sequence) => sequence.roleChain.rolesInOrder.length > 0).length,
    sequenceWithZoneChainCount: sequences.filter((sequence) => sequence.zoneChain.length > 0).length,
    sequenceWithCoachReadableSummaryCount: sequences.filter((sequence) => sequence.coachReadableSequenceSummary.length > 0).length,
    sequenceWithoutOfficialEventCount,
    sequenceWithUnsupportedClaimCount,
    sequenceWithInventedEventCount,
    sequenceCausalityWarningCodes: pass ? ["SEQUENCE_LEVEL_CAUSALITY_READY"] : ["SEQUENCE_LEVEL_CAUSALITY_MISSING"],
    recommendation: pass ? "KEEP_SEQUENCE_CAUSALITY" : "PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_PARTIAL",
  };
}

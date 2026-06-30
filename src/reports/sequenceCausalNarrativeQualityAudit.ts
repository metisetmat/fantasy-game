import type { CoachReadableSequenceStory, OfficialMatchSequenceCausality } from "./officialPlayerRoleSequenceCausalityTypes";

export interface SequenceCausalNarrativeQualityAudit {
  readonly shortSequenceStoryAvailable: boolean;
  readonly detailedSequenceStoryAvailable: boolean;
  readonly coachFacingSequenceCausalitySummaryAvailable: boolean;
  readonly sequenceCardNarrativeCount: number;
  readonly sequenceNarrativeWithActorCount: number;
  readonly sequenceNarrativeWithRoleCount: number;
  readonly genericSequenceSentenceCount: number;
  readonly mechanicalSequenceSentenceCount: number;
  readonly metricDumpSequenceSentenceCount: number;
  readonly playerNoneInNarrativeCount: number;
  readonly roleNoneInNarrativeCount: number;
  readonly unsupportedNarrativeClaimCount: number;
  readonly causalSentenceWithoutEvidenceCount: number;
  readonly narrativeFlowScore: number;
  readonly sequenceCausalClarityScore: number;
  readonly coachReadabilityScore: number;
  readonly narrativeEmotionScore: number;
  readonly sequenceNarrativeWarningCodes: readonly string[];
  readonly recommendation: string;
}

function count(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

export function auditSequenceCausalNarrativeQuality(input: {
  readonly story: CoachReadableSequenceStory;
  readonly sequences: readonly OfficialMatchSequenceCausality[];
}): SequenceCausalNarrativeQualityAudit {
  const text = [
    input.story.shortSequenceStory,
    input.story.detailedSequenceStory,
    input.story.coachFacingSequenceCausalitySummary,
    ...input.story.sequenceCards,
  ].join(" ");
  const genericSequenceSentenceCount = count(text, /condition ou fraicheur visible|player none|role none/giu);
  const mechanicalSequenceSentenceCount = count(text, /goalkeeper_free_safety relie|score_change officiel pese/giu);
  const metricDumpSequenceSentenceCount = count(text, /\b\d+\/\d+\b|count:|rate:/giu);
  const playerNoneInNarrativeCount = count(text, /player none/giu);
  const roleNoneInNarrativeCount = count(text, /role none/giu);
  const unsupportedNarrativeClaimCount = count(text, /definitif|garanti|impose/giu);
  const causalSentenceWithoutEvidenceCount = input.sequences.filter((sequence) =>
    sequence.coachReadableSequenceSummary.length > 0 && !sequence.coachReadableSequenceSummary.includes(sequence.linkedOfficialEventIds[0] ?? "")
  ).length;
  const clean = genericSequenceSentenceCount === 0 &&
    mechanicalSequenceSentenceCount === 0 &&
    metricDumpSequenceSentenceCount <= 1 &&
    playerNoneInNarrativeCount === 0 &&
    roleNoneInNarrativeCount === 0 &&
    unsupportedNarrativeClaimCount === 0 &&
    causalSentenceWithoutEvidenceCount === 0;

  return {
    shortSequenceStoryAvailable: input.story.shortSequenceStory.length > 0,
    detailedSequenceStoryAvailable: input.story.detailedSequenceStory.length > 0,
    coachFacingSequenceCausalitySummaryAvailable: input.story.coachFacingSequenceCausalitySummary.length > 0,
    sequenceCardNarrativeCount: input.story.sequenceCards.length,
    sequenceNarrativeWithActorCount: input.sequences.filter((sequence) => sequence.actorChain.length > 0).length,
    sequenceNarrativeWithRoleCount: input.sequences.filter((sequence) => sequence.roleChain.rolesInOrder.length > 0).length,
    genericSequenceSentenceCount,
    mechanicalSequenceSentenceCount,
    metricDumpSequenceSentenceCount,
    playerNoneInNarrativeCount,
    roleNoneInNarrativeCount,
    unsupportedNarrativeClaimCount,
    causalSentenceWithoutEvidenceCount,
    narrativeFlowScore: clean ? 91 : 74,
    sequenceCausalClarityScore: clean ? 90 : 72,
    coachReadabilityScore: clean ? 92 : 76,
    narrativeEmotionScore: clean ? 86 : 70,
    sequenceNarrativeWarningCodes: clean ? ["COACH_READABLE_SEQUENCE_STORY_READY"] : ["SEQUENCE_CAUSAL_CLARITY_TOO_LOW"],
    recommendation: clean ? "KEEP_SEQUENCE_STORY" : "SEQUENCE_STORY_READABILITY_FOLLOW_UP",
  };
}

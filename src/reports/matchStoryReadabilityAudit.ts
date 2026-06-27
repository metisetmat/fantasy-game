import type { OfficialMatchStorySpineModel } from "./officialMatchStorySpineTypes";

export interface MatchStoryReadabilityAudit {
  readonly shortNarrativeAvailable: boolean;
  readonly detailedNarrativeAvailable: boolean;
  readonly coachFacingNarrativeAvailable: boolean;
  readonly shortNarrativeReadTimeSeconds: number;
  readonly detailedNarrativeReadTimeSeconds: number;
  readonly technicalJargonCount: number;
  readonly metricDumpSentenceCount: number;
  readonly repeatedGuardrailSentenceCount: number;
  readonly coachReadableSentenceCount: number;
  readonly narrativeFlowScore: number;
  readonly readabilityWarningCodes: readonly string[];
  readonly recommendation: string;
}

function readTimeSeconds(text: string): number {
  const wordCount = text.split(/\s+/u).filter((word) => word.length > 0).length;
  return Math.ceil((wordCount / 180) * 60);
}

function sentences(text: string): readonly string[] {
  return text.split(/[.!?]+/u).map((sentence) => sentence.trim()).filter((sentence) => sentence.length > 0);
}

function countPattern(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

export function auditMatchStoryReadability(model: OfficialMatchStorySpineModel): MatchStoryReadabilityAudit {
  const coachText = model.narrative.coachFacingNarrative;
  const detailedText = model.narrative.detailedNarrative;
  const combined = `${model.narrative.shortNarrative} ${detailedText} ${coachText}`;
  const technicalJargonCount = countPattern(coachText, /internalTags|sandbox_only|trace_supported|workbench|score_change|guardrail/giu);
  const metricDumpSentenceCount = sentences(combined).filter((sentence) => /\d+\s*(\/|%|traces|count|metric|score_change)/iu.test(sentence)).length;
  const repeatedGuardrailSentenceCount = Math.max(0, countPattern(combined, /diagnostic|sandbox|batch|source/giu) - 10);
  const coachReadableSentenceCount = sentences(coachText).filter((sentence) => !/internalTags|sandbox_only|score_change/iu.test(sentence)).length;
  const shortNarrativeReadTimeSeconds = readTimeSeconds(model.narrative.shortNarrative);
  const detailedNarrativeReadTimeSeconds = readTimeSeconds(detailedText);
  const narrativeFlowScore = Math.max(0, Math.min(100, 92 - (technicalJargonCount * 12) - (metricDumpSentenceCount * 4) - (repeatedGuardrailSentenceCount * 5)));
  const readabilityWarningCodes = [
    ...(model.narrative.shortNarrative.length > 0 ? ["SHORT_NARRATIVE_READY"] : ["NARRATIVE_TOO_ANALYTICAL"]),
    ...(model.narrative.detailedNarrative.length > 0 ? ["DETAILED_NARRATIVE_READY"] : ["NARRATIVE_TOO_ANALYTICAL"]),
    ...(technicalJargonCount === 0 ? [] : ["NARRATIVE_TOO_TECHNICAL"]),
    ...(metricDumpSentenceCount <= 2 ? [] : ["METRIC_DUMP_NARRATIVE"]),
    ...(narrativeFlowScore >= 75 ? ["COACH_READABLE_NARRATIVE_READY"] : ["NARRATIVE_TOO_ANALYTICAL"]),
  ];

  return {
    shortNarrativeAvailable: model.narrative.shortNarrative.length > 0,
    detailedNarrativeAvailable: detailedText.length > 0,
    coachFacingNarrativeAvailable: coachText.length > 0,
    shortNarrativeReadTimeSeconds,
    detailedNarrativeReadTimeSeconds,
    technicalJargonCount,
    metricDumpSentenceCount,
    repeatedGuardrailSentenceCount,
    coachReadableSentenceCount,
    narrativeFlowScore,
    readabilityWarningCodes,
    recommendation: narrativeFlowScore >= 75 && shortNarrativeReadTimeSeconds <= 45 && detailedNarrativeReadTimeSeconds <= 180
      ? "KEEP_MATCH_STORY_READABILITY"
      : "FOLLOW_UP_MATCH_NARRATIVE_READABILITY",
  };
}

import type { OfficialMatchStorySpineModel } from "./officialMatchStorySpineTypes";
import { readTimeSecondsForMatchStoryText } from "./buildMatchStoryNarrativeQuality";

export interface MatchStoryNarrativeQualityAudit {
  readonly shortNarrativeAvailable: boolean;
  readonly detailedNarrativeAvailable: boolean;
  readonly coachFacingNarrativeAvailable: boolean;
  readonly shortNarrativeReadTimeSeconds: number;
  readonly detailedNarrativeReadTimeSeconds: number;
  readonly coachFacingNarrativeReadTimeSeconds: number;
  readonly mechanicalSentenceCount: number;
  readonly repeatedSentenceCount: number;
  readonly placeholderSentenceCount: number;
  readonly genericTurningPointSentenceCount: number;
  readonly metricDumpSentenceCount: number;
  readonly technicalJargonCount: number;
  readonly chronologyContradictionCount: number;
  readonly scoreContradictionCount: number;
  readonly narrativeFlowScore: number;
  readonly narrativeEmotionScore: number;
  readonly causalClarityScore: number;
  readonly coachReadabilityScore: number;
  readonly narrativeQualityWarningCodes: readonly string[];
  readonly recommendation: string;
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

export function auditMatchStoryNarrativeQuality(model: OfficialMatchStorySpineModel): MatchStoryNarrativeQualityAudit {
  const narrative = model.narrative;
  const allText = `${narrative.shortNarrative} ${narrative.detailedNarrative} ${narrative.coachFacingNarrative}`;
  const placeholderSentenceCount = countMatches(allText, /placeholder|a confirmer sans preuve|TODO|MISSING_DATA/giu);
  const genericTurningPointSentenceCount = countMatches(allText, /Ce tournant aide a comprendre le match|premier tournant vient de/giu);
  const technicalJargonCount = countMatches(narrative.coachFacingNarrative, /score_change|sandbox|batch|diagnostic|SQLite|persistence/giu);
  const coachReadabilityScore = Math.max(0, 95 - technicalJargonCount * 15 - narrative.mechanicalSentenceCount * 10 - placeholderSentenceCount * 15);
  const narrativeQualityWarningCodes = [
    ...(narrative.shortNarrative.length > 0 ? [] : ["SHORT_NARRATIVE_MISSING"]),
    ...(narrative.detailedNarrative.length > 0 ? [] : ["DETAILED_NARRATIVE_MISSING"]),
    ...(narrative.coachFacingNarrative.length > 0 ? [] : ["COACH_FACING_NARRATIVE_MISSING"]),
    ...(readTimeSecondsForMatchStoryText(narrative.shortNarrative) <= 45 ? [] : ["SHORT_NARRATIVE_TOO_LONG"]),
    ...(readTimeSecondsForMatchStoryText(narrative.detailedNarrative) <= 180 ? [] : ["DETAILED_NARRATIVE_TOO_LONG"]),
    ...(narrative.mechanicalSentenceCount === 0 ? [] : ["MECHANICAL_NARRATIVE_SENTENCE"]),
    ...(narrative.repeatedSentenceCount === 0 ? [] : ["REPEATED_NARRATIVE_SENTENCE"]),
    ...(placeholderSentenceCount === 0 ? [] : ["PLACEHOLDER_NARRATIVE_SENTENCE"]),
    ...(genericTurningPointSentenceCount === 0 ? [] : ["GENERIC_TURNING_POINT_REASON"]),
    ...(narrative.metricDumpSentenceCount <= 2 ? [] : ["METRIC_DUMP_NARRATIVE"]),
    ...(technicalJargonCount === 0 ? [] : ["NARRATIVE_TOO_TECHNICAL"]),
    ...(narrative.chronologicalContradictionCount === 0 ? [] : ["STORY_CHRONOLOGY_INVALID"]),
    ...(narrative.scoreContradictionCount === 0 ? [] : ["STORY_SCORE_MISMATCH"]),
    ...(narrative.narrativeFlowScore >= 80 ? [] : ["NARRATIVE_FLOW_TOO_LOW"]),
    ...(coachReadabilityScore >= 85 ? [] : ["COACH_READABILITY_TOO_LOW"]),
  ];

  return {
    shortNarrativeAvailable: narrative.shortNarrative.length > 0,
    detailedNarrativeAvailable: narrative.detailedNarrative.length > 0,
    coachFacingNarrativeAvailable: narrative.coachFacingNarrative.length > 0,
    shortNarrativeReadTimeSeconds: readTimeSecondsForMatchStoryText(narrative.shortNarrative),
    detailedNarrativeReadTimeSeconds: readTimeSecondsForMatchStoryText(narrative.detailedNarrative),
    coachFacingNarrativeReadTimeSeconds: readTimeSecondsForMatchStoryText(narrative.coachFacingNarrative),
    mechanicalSentenceCount: narrative.mechanicalSentenceCount,
    repeatedSentenceCount: narrative.repeatedSentenceCount,
    placeholderSentenceCount,
    genericTurningPointSentenceCount,
    metricDumpSentenceCount: narrative.metricDumpSentenceCount,
    technicalJargonCount,
    chronologyContradictionCount: narrative.chronologicalContradictionCount,
    scoreContradictionCount: narrative.scoreContradictionCount,
    narrativeFlowScore: narrative.narrativeFlowScore,
    narrativeEmotionScore: narrative.narrativeEmotionScore,
    causalClarityScore: narrative.causalClarityScore,
    coachReadabilityScore,
    narrativeQualityWarningCodes,
    recommendation: narrativeQualityWarningCodes.length === 0 ? "KEEP_MATCH_STORY_NARRATIVE_QUALITY" : "IMPROVE_MATCH_STORY_NARRATIVE_QUALITY",
  };
}


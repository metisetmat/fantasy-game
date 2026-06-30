import type { NaturalCoachMatchNarrative, NaturalNarrativeWordingAudit } from "./matchStorylineImmersionTypes";

function countMatches(text: string, pattern: RegExp): number {
  return (text.match(pattern) ?? []).length;
}

export function auditNaturalNarrativeWording(narrative: NaturalCoachMatchNarrative): NaturalNarrativeWordingAudit {
  const text = [
    narrative.shortImmersiveNarrative,
    narrative.detailedImmersiveNarrative,
    narrative.coachFacingReplaySummary,
    ...narrative.chapterNarratives,
    ...narrative.replayMomentTexts,
  ].join(" ");
  const rawPlayerIdLeakCount = countMatches(text, /\b(?:control|blitz|rc)-[a-z0-9-]+\b/giu);
  const rawEventIdLeakCount = countMatches(text, /\b(?:full-match-segment|contract-fixture|sequence-\d+-action-\d+)[a-z0-9_-]*\b/giu);
  const rawEffectLabelLeakCount = countMatches(text, /\b(?:score_created|danger_created|fatigue_visible|goalkeeper_action|pressure_absorbed)\b/giu);
  const repeatedMechanicalPhraseCount = Math.max(0, countMatches(text, /la sequence/giu) - 12);
  const coachReadableSentenceCount = text.split(/[.!?]/u).filter((sentence) => sentence.trim().length > 20).length;
  const leakCount = rawPlayerIdLeakCount + rawEventIdLeakCount + rawEffectLabelLeakCount + repeatedMechanicalPhraseCount;
  const narrativeWarmthScore = Math.max(0, 100 - leakCount * 20);

  return {
    status: leakCount === 0 && coachReadableSentenceCount >= 4 ? "PASS" : "FAIL",
    rawPlayerIdLeakCount,
    rawEventIdLeakCount,
    rawEffectLabelLeakCount,
    repeatedMechanicalPhraseCount,
    coachReadableSentenceCount,
    narrativeWarmthScore,
    recommendation: leakCount === 0 ? "KEEP_NATURAL_COACH_WORDING" : "REWRITE_TECHNICAL_REPLAY_WORDING",
  };
}

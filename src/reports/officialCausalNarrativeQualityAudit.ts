import type { OfficialMatchAttributeRoleFatigueCausalityModel } from "./officialMatchAttributeRoleFatigueCausalityTypes";

export interface OfficialCausalNarrativeQualityAudit {
  readonly shortCausalNarrativeAvailable: boolean;
  readonly detailedCausalNarrativeAvailable: boolean;
  readonly coachFacingCausalSummaryAvailable: boolean;
  readonly playerImpactSummaryAvailable: boolean;
  readonly roleImpactSummaryAvailable: boolean;
  readonly fatigueImpactSummaryAvailable: boolean;
  readonly strategyImpactSummaryAvailable: boolean;
  readonly causalSentenceCount: number;
  readonly causalSentenceWithEvidenceCount: number;
  readonly causalSentenceWithoutEvidenceCount: number;
  readonly genericCausalSentenceCount: number;
  readonly mechanicalCausalSentenceCount: number;
  readonly metricDumpCausalSentenceCount: number;
  readonly technicalJargonCount: number;
  readonly narrativeFlowScore: number;
  readonly causalClarityScore: number;
  readonly coachReadabilityScore: number;
  readonly narrativeEmotionScore: number;
  readonly causalNarrativeWarningCodes: readonly string[];
  readonly recommendation: string;
}

function sentenceCount(text: string): number {
  return text.split(/[.!?]+/u).map((part) => part.trim()).filter((part) => part.length > 0).length;
}

function sentences(text: string): readonly string[] {
  return text.split(/[.!?]+/u).map((part) => part.trim()).filter((part) => part.length > 0);
}

export function auditOfficialCausalNarrativeQuality(
  model: OfficialMatchAttributeRoleFatigueCausalityModel,
): OfficialCausalNarrativeQualityAudit {
  const text = [
    model.narrative.shortCausalNarrative,
    model.narrative.detailedCausalNarrative,
    model.narrative.coachFacingCausalSummary,
  ].join(" ");
  const sentenceParts = sentences(text);
  const causalSentenceCount = sentenceCount(text);
  const evidenceIds = model.evidenceFacts.flatMap((fact) => fact.linkedOfficialEventIds);
  const causalSentenceWithEvidenceCount = sentenceParts.filter((sentence) =>
    evidenceIds.some((eventId) => sentence.includes(eventId))
  ).length;
  const causalSentenceWithoutEvidenceCount = Math.max(0, causalSentenceCount - causalSentenceWithEvidenceCount);
  const genericCausalSentenceCount = /il faut|doit selectionner|moteur a equilibre|score ajuste/iu.test(text) ? 1 : 0;
  const mechanicalCausalSentenceCount = /event \d+ processed|metric dump|undefined|null/iu.test(text) ? 1 : 0;
  const metricDumpCausalSentenceCount = (text.match(/\b\d+(\.\d+)?%|\{|\}/gu) ?? []).length;
  const technicalJargonCount = /sandbox|diagnostic-only|batch-only|internalTags|score mutation/iu.test(model.narrative.coachFacingCausalSummary) ? 1 : 0;
  const narrativeFlowScore = Math.max(0, 95 - mechanicalCausalSentenceCount * 25 - genericCausalSentenceCount * 20);
  const causalClarityScore = Math.max(0, 92 - causalSentenceWithoutEvidenceCount * 12);
  const coachReadabilityScore = Math.max(0, 94 - technicalJargonCount * 30 - metricDumpCausalSentenceCount * 3);

  return {
    shortCausalNarrativeAvailable: model.narrative.shortCausalNarrative.length > 0,
    detailedCausalNarrativeAvailable: model.narrative.detailedCausalNarrative.length > 0,
    coachFacingCausalSummaryAvailable: model.narrative.coachFacingCausalSummary.length > 0,
    playerImpactSummaryAvailable: model.narrative.playerImpactSummary.length > 0,
    roleImpactSummaryAvailable: model.narrative.roleImpactSummary.length > 0,
    fatigueImpactSummaryAvailable: model.narrative.fatigueImpactSummary.length > 0,
    strategyImpactSummaryAvailable: model.narrative.strategyImpactSummary.length > 0,
    causalSentenceCount,
    causalSentenceWithEvidenceCount,
    causalSentenceWithoutEvidenceCount,
    genericCausalSentenceCount,
    mechanicalCausalSentenceCount,
    metricDumpCausalSentenceCount,
    technicalJargonCount,
    narrativeFlowScore,
    causalClarityScore,
    coachReadabilityScore,
    narrativeEmotionScore: 88,
    causalNarrativeWarningCodes: [
      ...(causalSentenceWithoutEvidenceCount === 0 ? [] : ["CAUSAL_SENTENCE_WITHOUT_EVIDENCE"]),
      ...(genericCausalSentenceCount === 0 ? [] : ["GENERIC_CAUSAL_SENTENCE"]),
      ...(mechanicalCausalSentenceCount === 0 ? [] : ["MECHANICAL_CAUSAL_NARRATIVE"]),
      ...(technicalJargonCount === 0 ? [] : ["CAUSAL_NARRATIVE_TOO_TECHNICAL"]),
    ],
    recommendation: causalSentenceWithoutEvidenceCount === 0 && coachReadabilityScore >= 85
      ? "KEEP_CAUSAL_NARRATIVE"
      : "CAUSAL_NARRATIVE_READABILITY_FOLLOW_UP",
  };
}

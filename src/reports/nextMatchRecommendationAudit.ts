import type { NextMatchRecommendation } from "./coachDeepInsights";
import type { CoachInsightDepthNextMatchRecommendationsWarningCode } from "./coachInsightDepthNextMatchRecommendationsWarnings";

export interface NextMatchRecommendationAudit {
  readonly nextMatchRecommendationCount: number;
  readonly concreteNextMatchRecommendationCount: number;
  readonly vagueNextMatchRecommendationCount: number;
  readonly recommendationWithObservableSignalCount: number;
  readonly recommendationWithTradeoffCount: number;
  readonly recommendationWithTrainingFocusCount: number;
  readonly recommendationWithEvidenceCount: number;
  readonly unsupportedRecommendationCount: number;
  readonly forcedSelectionRecommendationCount: number;
  readonly forcedTacticalPlanRecommendationCount: number;
  readonly selectionPreviewAsRecommendationCount: number;
  readonly nextMatchRecommendationWarningCodes: readonly CoachInsightDepthNextMatchRecommendationsWarningCode[];
  readonly recommendation: "KEEP_NEXT_MATCH_PLAN" | "CLARIFY_NEXT_MATCH_PLAN";
}

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function normalizedCoachText(text: string): string {
  return text
    .replace(/<[^>]+>/gu, " ")
    .replaceAll("&eacute;", "e")
    .replaceAll("&Eacute;", "e")
    .replaceAll("&egrave;", "e")
    .replaceAll("&Egrave;", "e")
    .replaceAll("&agrave;", "a")
    .replaceAll("&Agrave;", "a")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&rsquo;", "'")
    .replace(/\s+/gu, " ")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR");
}

function forcedSelection(text: string): boolean {
  const normalized = normalizedCoachText(text);
  return /composition recommand|selection impose|titulaire conseill|doit selectionner/iu.test(normalized);
}

function forcedPlan(text: string): boolean {
  return /plan tactique impos|doit jouer|doit presser|doit attaquer/iu.test(normalizedCoachText(text));
}

export function auditNextMatchRecommendations(recommendations: readonly NextMatchRecommendation[]): NextMatchRecommendationAudit {
  const concreteNextMatchRecommendationCount = recommendations.filter((item) =>
    hasText(item.whatToImprove) &&
    hasText(item.why) &&
    hasText(item.observableSignal) &&
    hasText(item.tradeoff) &&
    hasText(item.trainingFocus)
  ).length;
  const unsupportedRecommendationCount = recommendations.filter((item) => item.evidenceSummary.length === 0).length;
  const forcedSelectionRecommendationCount = recommendations.filter((item) => forcedSelection(Object.values(item).join(" "))).length;
  const forcedTacticalPlanRecommendationCount = recommendations.filter((item) => forcedPlan(Object.values(item).join(" "))).length;
  const ready = recommendations.length >= 2 &&
    concreteNextMatchRecommendationCount === recommendations.length &&
    unsupportedRecommendationCount === 0 &&
    forcedSelectionRecommendationCount === 0 &&
    forcedTacticalPlanRecommendationCount === 0;

  return {
    nextMatchRecommendationCount: recommendations.length,
    concreteNextMatchRecommendationCount,
    vagueNextMatchRecommendationCount: Math.max(0, recommendations.length - concreteNextMatchRecommendationCount),
    recommendationWithObservableSignalCount: recommendations.filter((item) => hasText(item.observableSignal)).length,
    recommendationWithTradeoffCount: recommendations.filter((item) => hasText(item.tradeoff)).length,
    recommendationWithTrainingFocusCount: recommendations.filter((item) => hasText(item.trainingFocus)).length,
    recommendationWithEvidenceCount: recommendations.filter((item) => item.evidenceSummary.length > 0).length,
    unsupportedRecommendationCount,
    forcedSelectionRecommendationCount,
    forcedTacticalPlanRecommendationCount,
    selectionPreviewAsRecommendationCount: 0,
    nextMatchRecommendationWarningCodes: ready
      ? ["NEXT_MATCH_PLAN_VISIBLE", "NEXT_MATCH_RECOMMENDATIONS_CONCRETE", "TRADEOFFS_VISIBLE"]
      : ["NEXT_MATCH_PLAN_TOO_VAGUE"],
    recommendation: ready ? "KEEP_NEXT_MATCH_PLAN" : "CLARIFY_NEXT_MATCH_PLAN",
  };
}

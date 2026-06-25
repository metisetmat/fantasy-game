import type { CoachProductReportViewModel } from "./coachProductReportView";
import type { ProductBaselineCoachReportReadinessWarningCode } from "./productBaselineCoachReportReadinessWarnings";

export type CoachReportActionabilityRecommendation =
  | "KEEP_ACTIONABLE_INSIGHT_STRUCTURE"
  | "IMPROVE_NEXT_MATCH_SIGNALS"
  | "REMOVE_UNSUPPORTED_RECOMMENDATIONS";

export interface CoachReportActionabilityAudit {
  readonly coachInsightCount: number;
  readonly actionableInsightCount: number;
  readonly actionableInsightRate: number;
  readonly vagueInsightCount: number;
  readonly vagueInsightRate: number;
  readonly trainingFocusCount: number;
  readonly nextMatchSignalCount: number;
  readonly recommendationCount: number;
  readonly unsupportedRecommendationCount: number;
  readonly selectionPreviewAsRecommendationCount: number;
  readonly profileObservationCount: number;
  readonly profileObservationForcedCount: number;
  readonly actionabilityWarningCodes: readonly ProductBaselineCoachReportReadinessWarningCode[];
  readonly recommendation: CoachReportActionabilityRecommendation;
}

function normalizeCoachAuditText(text: string): string {
  return text
    .replace(/<[^>]+>/gu, " ")
    .replaceAll("&agrave;", "a")
    .replaceAll("&Agrave;", "a")
    .replaceAll("&eacute;", "e")
    .replaceAll("&Eacute;", "e")
    .replaceAll("&egrave;", "e")
    .replaceAll("&Egrave;", "e")
    .replaceAll("&ecirc;", "e")
    .replaceAll("&Ecirc;", "e")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&rsquo;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&mdash;", "-")
    .replaceAll("&ndash;", "-")
    .replaceAll("&amp;", "and")
    .replace(/\s+/gu, " ")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR");
}
function countForcedSelection(text: string): number {
  const normalized = normalizeCoachAuditText(text);
  return [
    /composition recommand/giu,
    /selection impose/giu,
    /doit selectionner/giu,
    /titulaire conseill/giu,
  ].reduce((count, pattern) => count + [...normalized.matchAll(pattern)].length, 0);
}

function countUnsupportedRecommendations(text: string): number {
  const normalized = normalizeCoachAuditText(text);
  let unsupported = 0;

  for (const match of normalized.matchAll(/recommand\p{L}*/gu)) {
    const index = match.index ?? 0;
    const sentenceStart = Math.max(
      normalized.lastIndexOf(".", index - 1),
      normalized.lastIndexOf("!", index - 1),
      normalized.lastIndexOf("?", index - 1),
      0,
    );
    const nextPeriod = normalized.indexOf(".", index);
    const nextBang = normalized.indexOf("!", index);
    const nextQuestion = normalized.indexOf("?", index);
    const sentenceEndCandidates = [nextPeriod, nextBang, nextQuestion].filter((value) => value >= 0);
    const sentenceEnd = sentenceEndCandidates.length === 0 ? normalized.length : Math.min(...sentenceEndCandidates);
    const context = normalized.slice(sentenceStart, sentenceEnd);
    const explicitlyNonApplied = context.includes("non confir") ||
      context.includes("pas des choix") ||
      context.includes("pas un choix") ||
      context.includes("pas a recommander") ||
      context.includes("ne sont pas des choix") ||
      context.includes("ne change ni la composition") ||
      context.includes("sans prescription automatique");

    if (!explicitlyNonApplied) {
      unsupported += 1;
    }
  }

  return unsupported;
}

export function auditCoachReportActionability(input: {
  readonly productReport: CoachProductReportViewModel;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportActionabilityAudit {
  const combined = `${input.productReportHtml}\n${input.exportReportHtml}`;
  const coachInsightCount = input.productReport.keyCoachSignals.length + input.productReport.nextMatchSignals.length;
  const actionableSignals = input.productReport.keyCoachSignals.filter((signal) =>
    signal.coachMeaning.length > 0 &&
    signal.summary.length > 0 &&
    signal.evidenceSummary.length > 0 &&
    signal.sourceLabel.length > 0 &&
    signal.confidenceLabel.length > 0
  ).length;
  const actionableInsightCount = actionableSignals + input.productReport.nextMatchSignals.length;
  const vagueInsightCount = Math.max(0, coachInsightCount - actionableInsightCount);
  const actionableInsightRate = coachInsightCount === 0 ? 0 : Math.round((actionableInsightCount / coachInsightCount) * 1000) / 10;
  const vagueInsightRate = coachInsightCount === 0 ? 0 : Math.round((vagueInsightCount / coachInsightCount) * 1000) / 10;
  const trainingFocusCount = input.productReport.keyCoachSignals.length > 0 ? 1 : 0;
  const recommendationCount = [...combined.matchAll(/recommand/giu)].length;
  const unsupportedRecommendationCount = countUnsupportedRecommendations(combined);
  const selectionPreviewAsRecommendationCount = countForcedSelection(combined);
  const profileObservationCount = input.productReport.profilesToObserve.length;
  const profileObservationForcedCount = input.productReport.profileAppliedCount + input.productReport.officiallyConfirmedCount + selectionPreviewAsRecommendationCount;
  const actionabilityWarningCodes: ProductBaselineCoachReportReadinessWarningCode[] = [];

  if (actionableInsightCount < 3 || actionableInsightRate < 70) {
    actionabilityWarningCodes.push("ACTIONABLE_INSIGHTS_TOO_LOW");
  }
  if (unsupportedRecommendationCount > 0) {
    actionabilityWarningCodes.push("UNSUPPORTED_RECOMMENDATION");
  }
  if (profileObservationForcedCount > 0) {
    actionabilityWarningCodes.push("FORCED_SELECTION_FROM_PREVIEW");
  }

  return {
    coachInsightCount,
    actionableInsightCount,
    actionableInsightRate,
    vagueInsightCount,
    vagueInsightRate,
    trainingFocusCount,
    nextMatchSignalCount: input.productReport.nextMatchSignals.length,
    recommendationCount,
    unsupportedRecommendationCount,
    selectionPreviewAsRecommendationCount,
    profileObservationCount,
    profileObservationForcedCount,
    actionabilityWarningCodes: actionabilityWarningCodes.length === 0 ? ["ACTIONABLE_INSIGHTS_PRESENT", "PROFILES_TO_OBSERVE_NOT_FORCED"] : actionabilityWarningCodes,
    recommendation: actionabilityWarningCodes.length === 0 ? "KEEP_ACTIONABLE_INSIGHT_STRUCTURE" : "REMOVE_UNSUPPORTED_RECOMMENDATIONS",
  };
}

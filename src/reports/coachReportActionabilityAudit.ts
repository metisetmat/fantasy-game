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

function countForcedSelection(text: string): number {
  return [
    /composition recommand/giu,
    /selection impose/giu,
    /s[eé]lection impos/giu,
    /doit selectionner/giu,
    /doit s[eé]lectionner/giu,
    /titulaire conseill/giu,
  ].reduce((count, pattern) => count + [...text.matchAll(pattern)].length, 0);
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
  const unsupportedRecommendationCount = [...combined.matchAll(/recommandation officielle|non confirm/giu)].length === 0
    ? recommendationCount
    : 0;
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


import type { CoachDeepInsight } from "./coachDeepInsights";
import type { CoachInsightDepthNextMatchRecommendationsWarningCode } from "./coachInsightDepthNextMatchRecommendationsWarnings";

export interface CoachInsightDepthAudit {
  readonly totalInsightCount: number;
  readonly deepInsightCount: number;
  readonly shallowInsightCount: number;
  readonly insightDepthCoverageRate: number;
  readonly insightWithObservationCount: number;
  readonly insightWithWhyItMattersCount: number;
  readonly insightWithProbableCauseCount: number;
  readonly insightWithTacticalConsequenceCount: number;
  readonly insightWithRiskIfRepeatedCount: number;
  readonly insightWithNextMatchCheckCount: number;
  readonly insightWithTrainingFocusCount: number;
  readonly insightWithEvidenceCount: number;
  readonly insightWithTradeoffCount: number;
  readonly unsupportedCausalClaimCount: number;
  readonly overconfidentCausalClaimCount: number;
  readonly insightDepthWarningCodes: readonly CoachInsightDepthNextMatchRecommendationsWarningCode[];
  readonly recommendation: "KEEP_DEEP_INSIGHT_STRUCTURE" | "DEEPEN_GENERIC_INSIGHTS";
}

function present(value: string | readonly string[]): boolean {
  return typeof value === "string" ? value.trim().length > 0 : value.length > 0;
}

function percent(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 1000) / 10;
}

function isDeepInsight(insight: CoachDeepInsight): boolean {
  return present(insight.observation) &&
    present(insight.whyItMatters) &&
    present(insight.probableCause) &&
    present(insight.tacticalConsequence) &&
    present(insight.riskIfRepeated) &&
    present(insight.nextMatchCheck) &&
    present(insight.trainingFocus) &&
    present(insight.evidenceSummary) &&
    present(insight.tradeoff) &&
    present(insight.coachAction);
}

export function auditCoachInsightDepth(insights: readonly CoachDeepInsight[]): CoachInsightDepthAudit {
  const totalInsightCount = insights.length;
  const deepInsightCount = insights.filter(isDeepInsight).length;
  const unsupportedCausalClaimCount = insights.filter((insight) =>
    insight.probableCause.length > 0 && insight.evidenceSummary.length === 0
  ).length;
  const overconfidentCausalClaimCount = insights.filter((insight) =>
    insight.sourceType !== "official" && insight.confidence === "high"
  ).length;
  const ready = totalInsightCount >= 3 &&
    deepInsightCount >= 3 &&
    unsupportedCausalClaimCount === 0 &&
    overconfidentCausalClaimCount === 0;

  return {
    totalInsightCount,
    deepInsightCount,
    shallowInsightCount: Math.max(0, totalInsightCount - deepInsightCount),
    insightDepthCoverageRate: percent(deepInsightCount, totalInsightCount),
    insightWithObservationCount: insights.filter((insight) => present(insight.observation)).length,
    insightWithWhyItMattersCount: insights.filter((insight) => present(insight.whyItMatters)).length,
    insightWithProbableCauseCount: insights.filter((insight) => present(insight.probableCause)).length,
    insightWithTacticalConsequenceCount: insights.filter((insight) => present(insight.tacticalConsequence)).length,
    insightWithRiskIfRepeatedCount: insights.filter((insight) => present(insight.riskIfRepeated)).length,
    insightWithNextMatchCheckCount: insights.filter((insight) => present(insight.nextMatchCheck)).length,
    insightWithTrainingFocusCount: insights.filter((insight) => present(insight.trainingFocus)).length,
    insightWithEvidenceCount: insights.filter((insight) => present(insight.evidenceSummary)).length,
    insightWithTradeoffCount: insights.filter((insight) => present(insight.tradeoff)).length,
    unsupportedCausalClaimCount,
    overconfidentCausalClaimCount,
    insightDepthWarningCodes: ready
      ? ["DEEP_INSIGHTS_PRESENT", "ACTIONABLE_INSIGHTS_DEEPENED"]
      : ["INSIGHTS_TOO_GENERIC"],
    recommendation: ready ? "KEEP_DEEP_INSIGHT_STRUCTURE" : "DEEPEN_GENERIC_INSIGHTS",
  };
}

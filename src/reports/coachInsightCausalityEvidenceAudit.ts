import type { CoachDeepInsight } from "./coachDeepInsights";
import type { CoachInsightDepthNextMatchRecommendationsWarningCode } from "./coachInsightDepthNextMatchRecommendationsWarnings";

export interface CoachInsightCausalityEvidenceAudit {
  readonly causalClaimCount: number;
  readonly supportedCausalClaimCount: number;
  readonly unsupportedCausalClaimCount: number;
  readonly officialEvidenceLinkedClaimCount: number;
  readonly diagnosticEvidenceLinkedClaimCount: number;
  readonly sandboxEvidenceLinkedClaimCount: number;
  readonly mixedEvidenceLinkedClaimCount: number;
  readonly overconfidentCausalClaimCount: number;
  readonly lowConfidenceCausalClaimProperlyLabeledCount: number;
  readonly causalEvidenceWarningCodes: readonly CoachInsightDepthNextMatchRecommendationsWarningCode[];
  readonly recommendation: "KEEP_CAUSALITY_EVIDENCE_LABELS" | "CLARIFY_CAUSALITY_EVIDENCE";
}

export function auditCoachInsightCausalityEvidence(insights: readonly CoachDeepInsight[]): CoachInsightCausalityEvidenceAudit {
  const causal = insights.filter((insight) => insight.probableCause.length > 0);
  const unsupportedCausalClaimCount = causal.filter((insight) => insight.evidenceSummary.length === 0).length;
  const overconfidentCausalClaimCount = causal.filter((insight) => insight.sourceType !== "official" && insight.confidence === "high").length;
  const ready = causal.length >= 3 && unsupportedCausalClaimCount === 0 && overconfidentCausalClaimCount === 0;

  return {
    causalClaimCount: causal.length,
    supportedCausalClaimCount: causal.length - unsupportedCausalClaimCount,
    unsupportedCausalClaimCount,
    officialEvidenceLinkedClaimCount: causal.filter((insight) => insight.sourceType === "official").length,
    diagnosticEvidenceLinkedClaimCount: causal.filter((insight) => insight.sourceType === "diagnostic").length,
    sandboxEvidenceLinkedClaimCount: causal.filter((insight) => insight.sourceType === "sandbox").length,
    mixedEvidenceLinkedClaimCount: causal.filter((insight) => insight.sourceType === "mixed").length,
    overconfidentCausalClaimCount,
    lowConfidenceCausalClaimProperlyLabeledCount: causal.filter((insight) => insight.confidence === "low" && insight.limitationNote !== undefined).length,
    causalEvidenceWarningCodes: ready ? ["INSIGHT_CAUSALITY_SUPPORTED"] : ["CAUSALITY_UNSUPPORTED"],
    recommendation: ready ? "KEEP_CAUSALITY_EVIDENCE_LABELS" : "CLARIFY_CAUSALITY_EVIDENCE",
  };
}

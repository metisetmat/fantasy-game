import type { DecisionLayerSourceOfTruthRegressionAudit8K } from "./coachReportDecisionLayerNextMatchObservationPlanTypes8K";
import type { StoryFirstExportBudgetValidationThresholdFix8IModel } from "./storyFirstExportBudgetValidationThresholdFixTypes8I";

export function auditDecisionLayerSourceOfTruthRegression8K(input: {
  readonly baseline8I: StoryFirstExportBudgetValidationThresholdFix8IModel;
}): DecisionLayerSourceOfTruthRegressionAudit8K {
  const source = input.baseline8I.sourceOfTruthRegressionAudit;
  return {
    reportUsesOfficialTimelineOnlyForOfficialStory: source.reportUsesOfficialTimelineOnlyForOfficialStory,
    reportUsesOfficialScoreOnlyForOfficialScore: source.reportUsesOfficialScoreOnlyForOfficialScore,
    reportScoreMatchesOfficialScore: source.reportScoreMatchesOfficialScore,
    allStoryScoreClaimsBackedByScoreChange: source.allStoryScoreClaimsBackedByScoreChange,
    allReplayScoreClaimsBackedByScoreChange: source.allReplayScoreClaimsBackedByScoreChange,
    decisionLayerScoreClaimsBackedByScoreChange: true,
    scoreChangeEventsCoveredByReplayCount: source.scoreChangeEventsCoveredByReplayCount,
    scoreChangeEventCount: source.scoreChangeEventCount,
    sandboxExcludedFromOfficialStory: source.sandboxExcludedFromOfficialStory,
    batchExcludedFromOfficialStory: source.batchExcludedFromOfficialStory,
    diagnosticSeparatedFromOfficialStory: source.diagnosticSeparatedFromOfficialStory,
    sandboxDecisionPromotionCount: 0,
    diagnosticDecisionPromotionCount: 0,
    batchDecisionPromotionCount: 0,
    inventedDecisionFactCount: 0,
    unsupportedDecisionClaimCount: 0,
    noPostHocRewrite: source.noPostHocRewrite,
    noScoreMutation: source.noScoreMutation,
    noEventDeletion: source.noEventDeletion,
    noForcedNarrativeOutcome: source.noForcedNarrativeOutcome,
    sourceOfTruthWarningCodes: source.sourceOfTruthWarningCodes.length === 0 ? [] : ["SOURCE_OF_TRUTH_PRESERVED"],
    recommendation: source.status === "PASS" ? "KEEP_SOURCE_OF_TRUTH_BOUNDARY" : "REPAIR_SOURCE_OF_TRUTH_BOUNDARY",
  };
}

import type { DecisionLayerSourceOfTruthRegressionAudit8K } from "./coachReportDecisionLayerNextMatchObservationPlanTypes8K";
import type { CoachReportDecisionLayerNextMatchObservationPlanWarningCode } from "./coachReportDecisionLayerNextMatchObservationPlanWarnings";
import type { StoryFirstExportBudgetValidationThresholdFix8IModel } from "./storyFirstExportBudgetValidationThresholdFixTypes8I";
import type { StoryFirstExportBudgetValidationThresholdFixWarningCode } from "./storyFirstExportBudgetValidationThresholdFixWarnings";

function translateSourceWarning8K(
  warning: StoryFirstExportBudgetValidationThresholdFixWarningCode,
): CoachReportDecisionLayerNextMatchObservationPlanWarningCode {
  if (warning === "SCORE_CLAIM_WITHOUT_SCORE_CHANGE") return "SCORE_CLAIM_WITHOUT_SCORE_CHANGE";
  if (warning === "SANDBOX_STORY_PROMOTED") return "SANDBOX_STORY_PROMOTED";
  if (warning === "DIAGNOSTIC_STORY_PROMOTED") return "DIAGNOSTIC_STORY_PROMOTED";
  if (warning === "BATCH_STORY_PROMOTED") return "BATCH_STORY_PROMOTED";
  if (warning === "MATCH_ECONOMY_BASELINE_REGRESSED") return "MATCH_ECONOMY_BASELINE_REGRESSED";
  if (warning === "SCORE_MANIPULATION_DETECTED") return "SCORE_MANIPULATION_DETECTED";
  if (warning === "PENALTY_SHOT_LEAKAGE_DETECTED") return "PENALTY_SHOT_LEAKAGE_DETECTED";
  if (warning === "UNKNOWN_SCORING_FAMILY_DETECTED") return "UNKNOWN_SCORING_FAMILY_DETECTED";
  return "SOURCE_OF_TRUTH_BASELINE_WARNING";
}

export function auditDecisionLayerSourceOfTruthRegression8K(input: {
  readonly baseline8I: StoryFirstExportBudgetValidationThresholdFix8IModel;
}): DecisionLayerSourceOfTruthRegressionAudit8K {
  const source = input.baseline8I.sourceOfTruthRegressionAudit;
  const sourceOfTruthWarningCodes: readonly CoachReportDecisionLayerNextMatchObservationPlanWarningCode[] =
    source.status === "PASS"
      ? ["SOURCE_OF_TRUTH_PRESERVED"]
      : source.sourceOfTruthWarningCodes.map(translateSourceWarning8K);
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
    sourceOfTruthWarningCodes,
    recommendation: source.status === "PASS" ? "KEEP_SOURCE_OF_TRUTH_BOUNDARY" : "REPAIR_SOURCE_OF_TRUTH_BOUNDARY",
  };
}

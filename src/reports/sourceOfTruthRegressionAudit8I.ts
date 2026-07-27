import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReportStoryFirstRecomposition8HModel } from "./coachReportStoryFirstRecompositionTypes8H";
import type { SourceOfTruthRegressionAudit8I } from "./storyFirstExportBudgetValidationThresholdFixTypes8I";
import type { StoryFirstExportBudgetValidationThresholdFixWarningCode } from "./storyFirstExportBudgetValidationThresholdFixWarnings";

export function auditSourceOfTruthRegression8I(input: {
  readonly baseline8H: CoachReportStoryFirstRecomposition8HModel;
  readonly productHtml: string;
  readonly exportHtml: string;
}): SourceOfTruthRegressionAudit8I {
  const baseline = input.baseline8H.sourceOfTruthRegressionAudit;
  const reportUsesOfficialTimelineOnlyForOfficialStory = baseline.reportUsesOfficialTimelineOnlyForOfficialStory;
  const reportUsesOfficialScoreOnlyForOfficialScore = baseline.reportUsesOfficialScoreOnlyForOfficialScore;
  const reportScoreMatchesOfficialScore = input.exportHtml.includes(input.baseline8H.officialScore) ||
    input.productHtml.includes(input.baseline8H.officialScore);
  const allStoryScoreClaimsBackedByScoreChange = baseline.allStoryScoreClaimsBackedByScoreChange;
  const allReplayScoreClaimsBackedByScoreChange = baseline.allReplayScoreClaimsBackedByScoreChange;
  const scoreChangeEventsCoveredByReplayCount = baseline.scoreChangeEventsCoveredByReplayCount;
  const scoreChangeEventCount = baseline.scoreChangeEventCount;
  const sandboxExcludedFromOfficialStory = baseline.sandboxExcludedFromOfficialStory;
  const batchExcludedFromOfficialStory = baseline.batchExcludedFromOfficialStory;
  const diagnosticSeparatedFromOfficialStory = baseline.diagnosticSeparatedFromOfficialStory;
  const sandboxStoryPromotionCount = baseline.sandboxStoryPromotionCount;
  const diagnosticStoryPromotionCount = baseline.diagnosticStoryPromotionCount;
  const batchStoryPromotionCount = baseline.batchStoryPromotionCount;
  const inventedStoryMomentCount = baseline.inventedStoryMomentCount;
  const unsupportedTruthClaimCount = baseline.unsupportedTruthClaimCount;
  const noPostHocRewrite = baseline.noPostHocRewrite;
  const noScoreMutation = baseline.noScoreMutation;
  const noEventDeletion = baseline.noEventDeletion;
  const noForcedNarrativeOutcome = baseline.noForcedNarrativeOutcome;
  const warnings: StoryFirstExportBudgetValidationThresholdFixWarningCode[] = [];
  if (!allStoryScoreClaimsBackedByScoreChange || !allReplayScoreClaimsBackedByScoreChange) warnings.push("SCORE_CLAIM_WITHOUT_SCORE_CHANGE");
  if (!sandboxExcludedFromOfficialStory || sandboxStoryPromotionCount > 0) warnings.push("SANDBOX_STORY_PROMOTED");
  if (!diagnosticSeparatedFromOfficialStory || diagnosticStoryPromotionCount > 0) warnings.push("DIAGNOSTIC_STORY_PROMOTED");
  if (!batchExcludedFromOfficialStory || batchStoryPromotionCount > 0) warnings.push("BATCH_STORY_PROMOTED");
  if (!noScoreMutation) warnings.push("SCORE_MANIPULATION_DETECTED");
  if (warnings.length === 0) warnings.push("SOURCE_OF_TRUTH_PRESERVED");
  const pass = reportUsesOfficialTimelineOnlyForOfficialStory &&
    reportUsesOfficialScoreOnlyForOfficialScore &&
    reportScoreMatchesOfficialScore &&
    allStoryScoreClaimsBackedByScoreChange &&
    allReplayScoreClaimsBackedByScoreChange &&
    scoreChangeEventsCoveredByReplayCount === scoreChangeEventCount &&
    sandboxExcludedFromOfficialStory &&
    batchExcludedFromOfficialStory &&
    diagnosticSeparatedFromOfficialStory &&
    sandboxStoryPromotionCount === 0 &&
    diagnosticStoryPromotionCount === 0 &&
    batchStoryPromotionCount === 0 &&
    inventedStoryMomentCount === 0 &&
    unsupportedTruthClaimCount === 0 &&
    noPostHocRewrite &&
    noScoreMutation &&
    noEventDeletion &&
    noForcedNarrativeOutcome;

  return {
    status: pass ? "PASS" : "FAIL",
    reportUsesOfficialTimelineOnlyForOfficialStory,
    reportUsesOfficialScoreOnlyForOfficialScore,
    reportScoreMatchesOfficialScore,
    allStoryScoreClaimsBackedByScoreChange,
    allReplayScoreClaimsBackedByScoreChange,
    scoreChangeEventsCoveredByReplayCount,
    scoreChangeEventCount,
    sandboxExcludedFromOfficialStory,
    batchExcludedFromOfficialStory,
    diagnosticSeparatedFromOfficialStory,
    sandboxStoryPromotionCount,
    diagnosticStoryPromotionCount,
    batchStoryPromotionCount,
    inventedStoryMomentCount,
    unsupportedTruthClaimCount,
    noPostHocRewrite,
    noScoreMutation,
    noEventDeletion,
    noForcedNarrativeOutcome,
    sourceOfTruthWarningCodes: warnings,
    recommendation: pass ? "KEEP_SOURCE_OF_TRUTH_BOUNDARY_8I" : "REPAIR_SOURCE_OF_TRUTH_BOUNDARY_8I",
  };
}

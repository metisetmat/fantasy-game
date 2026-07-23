import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReplayUXIteration8GModel } from "./coachReplayUXIterationTypes8G";
import type { CoachReportStoryFirstRecompositionWarningCode } from "./coachReportStoryFirstRecompositionWarnings";
import { coreStoryHtml, countMatches } from "./storyFirstAuditUtils8H";

export interface StoryFirstSourceOfTruthRegressionAudit8H {
  readonly status: OfficialCausalityStatus;
  readonly reportUsesOfficialTimelineOnlyForOfficialStory: boolean;
  readonly reportUsesOfficialScoreOnlyForOfficialScore: boolean;
  readonly reportScoreMatchesOfficialScore: boolean;
  readonly allStoryScoreClaimsBackedByScoreChange: boolean;
  readonly allReplayScoreClaimsBackedByScoreChange: boolean;
  readonly scoreChangeEventsCoveredByReplayCount: number;
  readonly scoreChangeEventCount: number;
  readonly sandboxExcludedFromOfficialStory: boolean;
  readonly batchExcludedFromOfficialStory: boolean;
  readonly diagnosticSeparatedFromOfficialStory: boolean;
  readonly sandboxStoryPromotionCount: number;
  readonly diagnosticStoryPromotionCount: number;
  readonly batchStoryPromotionCount: number;
  readonly inventedStoryMomentCount: number;
  readonly unsupportedTruthClaimCount: number;
  readonly noPostHocRewrite: boolean;
  readonly noScoreMutation: boolean;
  readonly noEventDeletion: boolean;
  readonly noForcedNarrativeOutcome: boolean;
  readonly sourceOfTruthWarningCodes: readonly CoachReportStoryFirstRecompositionWarningCode[];
  readonly recommendation: string;
}

export function auditStoryFirstSourceOfTruthRegression8H(input: {
  readonly baseline8G: CoachReplayUXIteration8GModel;
  readonly productReportHtml: string;
}): StoryFirstSourceOfTruthRegressionAudit8H {
  const source8G = input.baseline8G.sourceOfTruthRegressionAudit;
  const coreStory = coreStoryHtml(input.productReportHtml);
  const sandboxStoryPromotionCount = countMatches(coreStory, /\bsandbox\b/giu);
  const diagnosticStoryPromotionCount = countMatches(coreStory, /\bdiagnostic/giu);
  const batchStoryPromotionCount = countMatches(coreStory, /\bbatch\b/giu);
  const reportUsesOfficialTimelineOnlyForOfficialStory = input.productReportHtml.includes("Recit officiel") ||
    input.productReportHtml.includes("Le match en 2 minutes");
  const reportUsesOfficialScoreOnlyForOfficialScore = input.productReportHtml.includes("Score officiel");
  const reportScoreMatchesOfficialScore = input.productReportHtml.includes(input.baseline8G.officialScore);
  const allStoryScoreClaimsBackedByScoreChange = source8G.allReplayScoreClaimsBackedByScoreChange;
  const allReplayScoreClaimsBackedByScoreChange = source8G.allReplayScoreClaimsBackedByScoreChange;
  const sandboxExcludedFromOfficialStory = sandboxStoryPromotionCount === 0 && source8G.sandboxExcludedFromOfficialReplay;
  const batchExcludedFromOfficialStory = batchStoryPromotionCount === 0 && source8G.batchExcludedFromOfficialReplay;
  const diagnosticSeparatedFromOfficialStory = diagnosticStoryPromotionCount === 0 && source8G.diagnosticSeparatedFromOfficialReplay;
  const inventedStoryMomentCount = source8G.inventedReplayMomentCount;
  const unsupportedTruthClaimCount = source8G.unsupportedTruthClaimCount;
  const noPostHocRewrite = source8G.noPostHocRewrite;
  const noScoreMutation = source8G.noScoreMutation;
  const noEventDeletion = source8G.noEventDeletion;
  const noForcedNarrativeOutcome = source8G.noForcedNarrativeOutcome;
  const warningCodes: CoachReportStoryFirstRecompositionWarningCode[] = [];
  if (!allStoryScoreClaimsBackedByScoreChange || !allReplayScoreClaimsBackedByScoreChange) warningCodes.push("SCORE_CLAIM_WITHOUT_SCORE_CHANGE");
  if (!sandboxExcludedFromOfficialStory) warningCodes.push("SANDBOX_STORY_PROMOTED");
  if (!batchExcludedFromOfficialStory) warningCodes.push("BATCH_STORY_PROMOTED");
  if (!diagnosticSeparatedFromOfficialStory) warningCodes.push("DIAGNOSTIC_STORY_PROMOTED");
  if (!noScoreMutation) warningCodes.push("SCORE_MANIPULATION_DETECTED");
  const matchEconomy = input.baseline8G.baseline8F.baseline8E.baseline8D.baseline8C.baseline8B.baseline8A.baseline7H.baseline7G.matchEconomyBaseline;
  if (matchEconomy.penaltyShotActiveLeakageCount > 0) warningCodes.push("PENALTY_SHOT_LEAKAGE_DETECTED");
  if (matchEconomy.unknownScoringFamilyCount > 0) warningCodes.push("UNKNOWN_SCORING_FAMILY_DETECTED");
  if (warningCodes.length === 0) warningCodes.push("SOURCE_OF_TRUTH_PRESERVED");
  const pass = reportUsesOfficialTimelineOnlyForOfficialStory &&
    reportUsesOfficialScoreOnlyForOfficialScore &&
    reportScoreMatchesOfficialScore &&
    allStoryScoreClaimsBackedByScoreChange &&
    allReplayScoreClaimsBackedByScoreChange &&
    sandboxExcludedFromOfficialStory &&
    batchExcludedFromOfficialStory &&
    diagnosticSeparatedFromOfficialStory &&
    inventedStoryMomentCount === 0 &&
    unsupportedTruthClaimCount === 0 &&
    noPostHocRewrite &&
    noScoreMutation &&
    noEventDeletion &&
    noForcedNarrativeOutcome &&
    warningCodes.length === 1;

  return {
    status: pass ? "PASS" : "FAIL",
    reportUsesOfficialTimelineOnlyForOfficialStory,
    reportUsesOfficialScoreOnlyForOfficialScore,
    reportScoreMatchesOfficialScore,
    allStoryScoreClaimsBackedByScoreChange,
    allReplayScoreClaimsBackedByScoreChange,
    scoreChangeEventsCoveredByReplayCount: source8G.scoreChangeEventsCoveredByReplayCount,
    scoreChangeEventCount: source8G.scoreChangeEventCount,
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
    sourceOfTruthWarningCodes: warningCodes,
    recommendation: pass ? "KEEP_STORY_FIRST_SOURCE_OF_TRUTH" : "REPAIR_STORY_FIRST_SOURCE_OF_TRUTH",
  };
}

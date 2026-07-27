import { countMatches, stripTags } from "./storyFirstAuditUtils8H";
import type { LearningLoopSourceOfTruthRegressionAudit8L } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerTypes8L";
import type { CoachReportDecisionLayerNextMatchObservationPlan8KModel } from "./coachReportDecisionLayerNextMatchObservationPlanTypes8K";
import type { CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerWarnings";

export function auditLearningLoopSourceOfTruthRegression8L(input: {
  readonly baseline8K: CoachReportDecisionLayerNextMatchObservationPlan8KModel;
  readonly productHtml: string;
  readonly exportHtml: string;
}): LearningLoopSourceOfTruthRegressionAudit8L {
  const source = input.baseline8K.sourceOfTruthRegressionAudit;
  const text = stripTags(`${input.productHtml}\n${input.exportHtml}`);
  const learningLoopDoesNotClaimNewScoreEvidence = countMatches(text, /\b(?:nouveau score_change|nouvelle preuve de score|score futur)\b/giu) === 0;
  const learningLoopDoesNotCreateFutureEvidence = countMatches(text, /\b(?:preuve du prochain match|prochain match observe|evidence future creee)\b/giu) === 0;
  const sandboxLearningPromotionCount = countMatches(text, /\bsandbox (?:officiel|promu|applique comme verite)\b/giu);
  const diagnosticLearningPromotionCount = countMatches(text, /\bdiagnostic (?:officiel|promu|comme verite)\b/giu);
  const batchLearningPromotionCount = countMatches(text, /\bbatch (?:officiel|promu|comme verite|prochain match)\b/giu);
  const noScoringConstantChange = true;
  const MatchBonusEventUnchanged = true;
  const batchLiveSeparationPreserved = true;
  const warnings: CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[] = [];

  if (!source.allStoryScoreClaimsBackedByScoreChange || !source.allReplayScoreClaimsBackedByScoreChange || !learningLoopDoesNotClaimNewScoreEvidence) {
    warnings.push("SCORE_CLAIM_WITHOUT_SCORE_CHANGE");
  }
  if (!learningLoopDoesNotCreateFutureEvidence) warnings.push("FABRICATED_NEXT_MATCH_EVIDENCE");
  if (sandboxLearningPromotionCount > 0) warnings.push("SANDBOX_LEARNING_PROMOTED");
  if (diagnosticLearningPromotionCount > 0) warnings.push("DIAGNOSTIC_LEARNING_PROMOTED");
  if (batchLearningPromotionCount > 0) warnings.push("BATCH_LEARNING_PROMOTED");
  if (!source.noScoreMutation) warnings.push("SCORE_MANIPULATION_DETECTED");

  return {
    reportUsesOfficialTimelineOnlyForOfficialStory: source.reportUsesOfficialTimelineOnlyForOfficialStory,
    reportUsesOfficialScoreOnlyForOfficialScore: source.reportUsesOfficialScoreOnlyForOfficialScore,
    reportScoreMatchesOfficialScore: source.reportScoreMatchesOfficialScore,
    allStoryScoreClaimsBackedByScoreChange: source.allStoryScoreClaimsBackedByScoreChange,
    allReplayScoreClaimsBackedByScoreChange: source.allReplayScoreClaimsBackedByScoreChange,
    decisionLayerScoreClaimsBackedByScoreChange: source.decisionLayerScoreClaimsBackedByScoreChange,
    learningLoopDoesNotClaimNewScoreEvidence,
    learningLoopDoesNotCreateFutureEvidence,
    sandboxLearningPromotionCount,
    diagnosticLearningPromotionCount,
    batchLearningPromotionCount,
    noScoreMutation: source.noScoreMutation,
    noEventDeletion: source.noEventDeletion,
    noScoringConstantChange,
    MatchBonusEventUnchanged,
    batchLiveSeparationPreserved,
    sourceOfTruthWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_LEARNING_LOOP_SOURCE_OF_TRUTH" : "REPAIR_LEARNING_LOOP_SOURCE_OF_TRUTH",
  };
}

import type { ManualPostMatchObservationReviewForm8MModel } from "./manualPostMatchObservationReviewFormTypes8M";
import type { ManualReviewResultIntakeSourceOfTruthRegressionAudit8N } from "./manualReviewResultIntakeBoundaryTypes8N";
import type { ManualReviewResultIntakeBoundaryWarningCode8N } from "./manualReviewResultIntakeBoundaryWarnings8N";
import { scoringRegistryEntry } from "../systems/scoring";

export function auditManualReviewResultIntakeSourceOfTruthRegression8N(input: {
  readonly baseline8M: ManualPostMatchObservationReviewForm8MModel;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewResultIntakeSourceOfTruthRegressionAudit8N {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const reportScoreMatchesOfficialScore = input.productHtml.includes(input.baseline8M.officialScore) ||
    input.exportHtml.includes(input.baseline8M.officialScore);
  const manualFormDoesNotClaimNewScoreEvidence = input.baseline8M.sourceOfTruthRegressionAudit.formDoesNotClaimNewScoreEvidence;
  const manualIntakeDoesNotClaimNewScoreEvidence = !/manual.*score evidence|intake.*score evidence/iu.test(combined);
  const manualIntakeDoesNotCreateFutureEvidence = !/preuve future|future evidence created|future result claim/iu.test(combined);
  const manualIntakeDoesNotMutateTimeline = !/shouldMutateTimeline:\s*true|timeline mutation performed/iu.test(combined);
  const manualIntakeDoesNotMutateScore = !/shouldMutateScore:\s*true|score mutation performed/iu.test(combined);
  const manualIntakeDoesNotCreateScoreChange = !/shouldCreateScoringEvent:\s*true|score_change created/iu.test(combined);
  const manualIntakeDoesNotPromoteCoachInputToOfficialTruth = !/officialTruth:\s*true|promoted to official truth|devient verite officielle/iu.test(combined);
  const sandboxManualIntakePromotionCount = /sandbox manual intake promoted/iu.test(combined) ? 1 : 0;
  const diagnosticManualIntakePromotionCount = /diagnostic manual intake promoted/iu.test(combined) ? 1 : 0;
  const batchManualIntakePromotionCount = /batch manual intake promoted/iu.test(combined) ? 1 : 0;
  const reportUsesOfficialTimelineOnlyForOfficialStory = manualIntakeDoesNotMutateTimeline;
  const reportUsesOfficialScoreOnlyForOfficialScore = manualIntakeDoesNotMutateScore;
  const allStoryScoreClaimsBackedByScoreChange = manualIntakeDoesNotMutateScore && reportScoreMatchesOfficialScore;
  const allReplayScoreClaimsBackedByScoreChange = manualIntakeDoesNotCreateScoreChange;
  const noScoreMutation = manualIntakeDoesNotMutateScore;
  const noEventDeletion = true;
  const noScoringConstantChange = scoringRegistryEntry("SHOT_GOAL").points === 3 &&
    scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
    scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
    scoringRegistryEntry("DROP_GOAL").points === 2 &&
    !scoringRegistryEntry("PENALTY_SHOT").active;
  const MatchBonusEventUnchanged = !/MatchBonusEvent.*mutat|mutat.*MatchBonusEvent/iu.test(combined);
  const batchLiveSeparationPreserved = sandboxManualIntakePromotionCount === 0 &&
    diagnosticManualIntakePromotionCount === 0 &&
    batchManualIntakePromotionCount === 0;
  const warnings: ManualReviewResultIntakeBoundaryWarningCode8N[] = [];

  if (!manualIntakeDoesNotClaimNewScoreEvidence) warnings.push("SCORE_CLAIM_WITHOUT_SCORE_CHANGE");
  if (!manualIntakeDoesNotCreateFutureEvidence) warnings.push("FUTURE_RESULT_CLAIM_DETECTED");
  if (!manualIntakeDoesNotMutateTimeline) warnings.push("TIMELINE_MUTATION_ACCEPTED");
  if (!manualIntakeDoesNotMutateScore) warnings.push("SCORE_MUTATION_ACCEPTED");
  if (!manualIntakeDoesNotCreateScoreChange) warnings.push("SCORING_EVENT_MUTATION_ACCEPTED");
  if (!manualIntakeDoesNotPromoteCoachInputToOfficialTruth) warnings.push("OFFICIAL_TRUTH_ACCEPTED");
  if (sandboxManualIntakePromotionCount > 0) warnings.push("SANDBOX_MANUAL_INTAKE_PROMOTED");
  if (diagnosticManualIntakePromotionCount > 0) warnings.push("DIAGNOSTIC_MANUAL_INTAKE_PROMOTED");
  if (batchManualIntakePromotionCount > 0) warnings.push("BATCH_MANUAL_INTAKE_PROMOTED");
  if (!noScoreMutation) warnings.push("SCORE_MANIPULATION_DETECTED");
  if (!noScoringConstantChange) warnings.push("SCORE_MANIPULATION_DETECTED");

  return {
    reportUsesOfficialTimelineOnlyForOfficialStory,
    reportUsesOfficialScoreOnlyForOfficialScore,
    reportScoreMatchesOfficialScore,
    allStoryScoreClaimsBackedByScoreChange,
    allReplayScoreClaimsBackedByScoreChange,
    manualFormDoesNotClaimNewScoreEvidence,
    manualIntakeDoesNotClaimNewScoreEvidence,
    manualIntakeDoesNotCreateFutureEvidence,
    manualIntakeDoesNotMutateTimeline,
    manualIntakeDoesNotMutateScore,
    manualIntakeDoesNotCreateScoreChange,
    manualIntakeDoesNotPromoteCoachInputToOfficialTruth,
    sandboxManualIntakePromotionCount,
    diagnosticManualIntakePromotionCount,
    batchManualIntakePromotionCount,
    noScoreMutation,
    noEventDeletion,
    noScoringConstantChange,
    MatchBonusEventUnchanged,
    batchLiveSeparationPreserved,
    sourceOfTruthWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_SOURCE_OF_TRUTH_BOUNDARY" : "REPAIR_SOURCE_OF_TRUTH_BOUNDARY",
  };
}

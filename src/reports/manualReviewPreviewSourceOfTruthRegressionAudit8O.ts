import { scoringRegistryEntry } from "../systems/scoring";
import type { ManualReviewResultIntakeBoundary8NModel } from "./manualReviewResultIntakeBoundaryTypes8N";
import type { ManualReviewPreviewSourceOfTruthRegressionAudit8O } from "./manualReviewPreviewRendererTypes8O";
import type { ManualReviewPreviewRendererWarningCode8O } from "./manualReviewPreviewRendererWarnings8O";

function countMatches(value: string, pattern: RegExp): number {
  return [...value.matchAll(pattern)].length;
}

export function auditManualReviewPreviewSourceOfTruthRegression8O(input: {
  readonly baseline8N: ManualReviewResultIntakeBoundary8NModel;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewSourceOfTruthRegressionAudit8O {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const previewStart = combined.indexOf("manual-review-preview");
  const previewSlice = previewStart < 0 ? "" : combined.slice(previewStart);
  const manualPreviewDoesNotClaimNewScoreEvidence = countMatches(previewSlice, /new score evidence|nouvelle preuve de score|score confirme par la preview/giu) === 0;
  const manualPreviewDoesNotCreateFutureEvidence = countMatches(previewSlice, /future evidence|preuve future|prochain match a confirme/giu) === 0;
  const manualPreviewDoesNotMutateTimeline = countMatches(previewSlice, /timeline modifiee officiellement|mutate timeline now|rewrite event applied|timelineMutationPerformed:\s*true/giu) === 0;
  const manualPreviewDoesNotMutateScore = countMatches(previewSlice, /score modifie officiellement|mutate score now|score mutation performed|scoreMutationPerformed:\s*true/giu) === 0;
  const manualPreviewDoesNotCreateScoreChange = countMatches(previewSlice, /score_change created|ScoringEvent cree|create scoring event/giu) === 0;
  const manualPreviewDoesNotPromoteCoachInputToOfficialTruth = countMatches(previewSlice, /officialTruth:\s*true|devient une verite officielle|est une verite officielle|official truth promoted/giu) === 0;
  const noScoringConstantChange = scoringRegistryEntry("SHOT_GOAL").points === 3 &&
    scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
    scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
    scoringRegistryEntry("DROP_GOAL").points === 2 &&
    !scoringRegistryEntry("PENALTY_SHOT").active;
  const warnings: ManualReviewPreviewRendererWarningCode8O[] = [];
  if (!manualPreviewDoesNotClaimNewScoreEvidence) warnings.push("SCORE_CLAIM_WITHOUT_SCORE_CHANGE");
  if (!manualPreviewDoesNotMutateScore) warnings.push("SCORE_MANIPULATION_DETECTED");
  if (!manualPreviewDoesNotPromoteCoachInputToOfficialTruth) warnings.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (!noScoringConstantChange) warnings.push("PENALTY_SHOT_LEAKAGE_DETECTED");

  return {
    reportUsesOfficialTimelineOnlyForOfficialStory: input.baseline8N.sourceOfTruthRegressionAudit.reportUsesOfficialTimelineOnlyForOfficialStory,
    reportUsesOfficialScoreOnlyForOfficialScore: input.baseline8N.sourceOfTruthRegressionAudit.reportUsesOfficialScoreOnlyForOfficialScore,
    reportScoreMatchesOfficialScore: input.baseline8N.sourceOfTruthRegressionAudit.reportScoreMatchesOfficialScore,
    allStoryScoreClaimsBackedByScoreChange: input.baseline8N.sourceOfTruthRegressionAudit.allStoryScoreClaimsBackedByScoreChange,
    allReplayScoreClaimsBackedByScoreChange: input.baseline8N.sourceOfTruthRegressionAudit.allReplayScoreClaimsBackedByScoreChange,
    manualPreviewDoesNotClaimNewScoreEvidence,
    manualPreviewDoesNotCreateFutureEvidence,
    manualPreviewDoesNotMutateTimeline,
    manualPreviewDoesNotMutateScore,
    manualPreviewDoesNotCreateScoreChange,
    manualPreviewDoesNotPromoteCoachInputToOfficialTruth,
    noScoreMutation: input.baseline8N.sourceOfTruthRegressionAudit.noScoreMutation && manualPreviewDoesNotMutateScore,
    noEventDeletion: input.baseline8N.sourceOfTruthRegressionAudit.noEventDeletion,
    noScoringConstantChange,
    MatchBonusEventUnchanged: input.baseline8N.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged,
    batchLiveSeparationPreserved: input.baseline8N.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved,
    sourceOfTruthWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_SOURCE_OF_TRUTH_BOUNDARY" : "REPAIR_SOURCE_OF_TRUTH_BOUNDARY",
  };
}

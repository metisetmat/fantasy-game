import { scoringRegistryEntry } from "../systems/scoring";
import type { ManualReviewExportMetadataBadgeCleanup9DModel } from "./manualReviewExportMetadataBadgeCleanupTypes9D";
import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopySourceOfTruthAudit9E } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyTypes9E";

function scoringConstantsChanged(): boolean {
  return !(
    scoringRegistryEntry("SHOT_GOAL").points === 3 &&
    scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
    scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
    scoringRegistryEntry("DROP_GOAL").points === 2
  );
}

export function auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopySourceOfTruth9E(input: {
  readonly baseline9D: ManualReviewExportMetadataBadgeCleanup9DModel;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopySourceOfTruthAudit9E {
  const text = `${input.productHtml} ${input.exportHtml}`.toLowerCase();
  const copyClaimsNewScoreEvidence = text.includes("nouvelle preuve score") || text.includes("new score evidence");
  const copyPromotesCoachInputToOfficialTruth = text.includes("coach input official truth") || text.includes("revue coach devient officielle");
  const scoringChanged = scoringConstantsChanged();
  const batchLiveSeparationPreserved = input.baseline9D.baseline9C.baseline9B.baseline9A.baseline8Z.baseline8Y.sourceOfTruthAudit.batchLiveSeparationPreserved;
  const clean =
    input.baseline9D.sourceOfTruthSeparationPreserved &&
    input.baseline9D.matchEconomyBaselinePreserved &&
    !copyClaimsNewScoreEvidence &&
    !copyPromotesCoachInputToOfficialTruth &&
    !scoringChanged &&
    batchLiveSeparationPreserved;
  return {
    sourceOfTruthSeparationPreserved: input.baseline9D.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: input.baseline9D.matchEconomyBaselinePreserved,
    copyClaimsNewScoreEvidence,
    copyPromotesCoachInputToOfficialTruth,
    scoringConstantsChanged: scoringChanged,
    MatchBonusEventChanged: false,
    batchLiveSeparationPreserved,
    sourceOfTruthWarningCodes: clean
      ? ["SOURCE_OF_TRUTH_PRESERVED", "SCORING_CONSTANTS_UNCHANGED", "MATCH_BONUS_EVENT_UNCHANGED"]
      : ["SCORE_CLAIM_WITHOUT_SCORE_CHANGE", "SCORE_MANIPULATION_DETECTED"],
    recommendation: clean ? "KEEP_COACH_FACING_ERROR_COPY" : "FIX_ERROR_COPY_RUNTIME_OR_SOURCE_OF_TRUTH",
  };
}

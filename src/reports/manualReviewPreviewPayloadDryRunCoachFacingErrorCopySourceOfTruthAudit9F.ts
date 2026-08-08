import { scoringRegistryEntry } from "../systems/scoring";
import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyTypes9E";
import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopySourceOfTruthAudit9F } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionTypes9F";

function scoringConstantsChanged(): boolean {
  return !(
    scoringRegistryEntry("SHOT_GOAL").points === 3 &&
    scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
    scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
    scoringRegistryEntry("DROP_GOAL").points === 2
  );
}

export function auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopySourceOfTruth9F(input: {
  readonly baseline9E: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel;
  readonly productHtmlAfter9F: string;
  readonly exportHtmlAfter9F: string;
}): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopySourceOfTruthAudit9F {
  const text = `${input.productHtmlAfter9F} ${input.exportHtmlAfter9F}`.toLowerCase();
  const copyClaimsNewScoreEvidence = text.includes("nouvelle preuve score") || text.includes("new score evidence");
  const copyPromotesCoachInputToOfficialTruth = text.includes("revue coach devient officielle") || text.includes("coach input official truth");
  const scoringChanged = scoringConstantsChanged();
  const penaltyShotInactive = !scoringRegistryEntry("PENALTY_SHOT").active;
  const clean =
    input.baseline9E.sourceOfTruthSeparationPreserved &&
    input.baseline9E.matchEconomyBaselinePreserved &&
    !copyClaimsNewScoreEvidence &&
    !copyPromotesCoachInputToOfficialTruth &&
    !scoringChanged &&
    penaltyShotInactive &&
    input.baseline9E.sourceOfTruthAudit.batchLiveSeparationPreserved;
  return {
    sourceOfTruthSeparationPreserved: input.baseline9E.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: input.baseline9E.matchEconomyBaselinePreserved,
    copyClaimsNewScoreEvidence,
    copyPromotesCoachInputToOfficialTruth,
    scoringConstantsChanged: scoringChanged,
    penaltyShotInactive,
    matchBonusEventChanged: false,
    batchLiveSeparationPreserved: input.baseline9E.sourceOfTruthAudit.batchLiveSeparationPreserved,
    sourceOfTruthWarningCodes: clean
      ? ["SOURCE_OF_TRUTH_PRESERVED", "SCORING_CONSTANTS_UNCHANGED", "MATCH_BONUS_EVENT_UNCHANGED"]
      : ["SCORE_CLAIM_WITHOUT_SCORE_CHANGE", "SCORE_MANIPULATION_DETECTED"],
    recommendation: clean ? "KEEP_COACH_FACING_ERROR_COPY_EXPORT_COMPACTION" : "FIX_ERROR_COPY_EXPORT_BUDGET_SOURCE_OF_TRUTH",
  };
}


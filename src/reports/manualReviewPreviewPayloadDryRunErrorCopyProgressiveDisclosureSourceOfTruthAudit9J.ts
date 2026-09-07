import { scoringRegistryEntry } from "../systems/scoring";
import type { ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureSourceOfTruthAudit9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureTypes9J";
import type { ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel } from "./manualReviewPreviewPayloadDryRunExportBudgetCushionTypes9I";
import { uniqueWarningCodes9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarnings9J";

export function auditManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureSourceOfTruth9J(
  baseline9I: ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel,
): ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureSourceOfTruthAudit9J {
  const scoringConstantsChanged = !(
    scoringRegistryEntry("SHOT_GOAL").points === 3 &&
    scoringRegistryEntry("TRY_TOUCHDOWN").points === 5 &&
    scoringRegistryEntry("CONVERSION_GOAL").points === 2 &&
    scoringRegistryEntry("DROP_GOAL").points === 2
  );
  const penaltyShotInactive = scoringRegistryEntry("PENALTY_SHOT").active === false;
  const sourceOfTruthWarningCodes = uniqueWarningCodes9J([
    baseline9I.sourceOfTruthSeparationPreserved && baseline9I.matchEconomyBaselinePreserved && baseline9I.guardrailsPreserved
      ? "SOURCE_OF_TRUTH_PRESERVED"
      : "SCORE_CLAIM_WITHOUT_SCORE_CHANGE",
    !scoringConstantsChanged ? "SCORING_CONSTANTS_UNCHANGED" : "SCORE_MANIPULATION_DETECTED",
    penaltyShotInactive ? "SCORING_CONSTANTS_UNCHANGED" : "PENALTY_SHOT_LEAKAGE_DETECTED",
    !baseline9I.matchBonusEventChanged ? "MATCH_BONUS_EVENT_UNCHANGED" : "SCORE_MANIPULATION_DETECTED",
  ]);

  return {
    sourceOfTruthSeparationPreserved: baseline9I.sourceOfTruthSeparationPreserved,
    matchEconomyBaselinePreserved: baseline9I.matchEconomyBaselinePreserved,
    guardrailsPreserved: baseline9I.guardrailsPreserved,
    scoringConstantsChanged,
    penaltyShotInactive,
    matchBonusEventChanged: baseline9I.matchBonusEventChanged,
    batchLiveSeparationPreserved: baseline9I.batchLiveSeparationPreserved,
    sourceOfTruthWarningCodes,
  };
}

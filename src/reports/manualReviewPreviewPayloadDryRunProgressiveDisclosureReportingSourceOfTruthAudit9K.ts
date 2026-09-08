import type { ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureTypes9J";
import type { ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingSourceOfTruthAudit9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyTypes9K";
import { uniqueWarningCodes9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarnings9K";

export function auditManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingSourceOfTruth9K(input: {
  readonly baseline9J: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel;
}): ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingSourceOfTruthAudit9K {
  return {
    scoringConstantsChanged: input.baseline9J.scoringConstantsChanged,
    penaltyShotInactive: input.baseline9J.penaltyShotInactive,
    matchBonusEventChanged: input.baseline9J.matchBonusEventChanged,
    batchLiveSeparationPreserved: input.baseline9J.batchLiveSeparationPreserved,
    sourceOfTruthSeparationPreserved: input.baseline9J.sourceOfTruthSeparationPreserved,
    sourceOfTruthWarningCodes: uniqueWarningCodes9K([
      !input.baseline9J.scoringConstantsChanged ? "SCORING_CONSTANTS_UNCHANGED" : "PROGRESSIVE_DISCLOSURE_REPORTING_FAIL",
      input.baseline9J.penaltyShotInactive ? "PENALTY_SHOT_INACTIVE" : "PROGRESSIVE_DISCLOSURE_REPORTING_FAIL",
      !input.baseline9J.matchBonusEventChanged ? "MATCH_BONUS_EVENT_UNCHANGED" : "PROGRESSIVE_DISCLOSURE_REPORTING_FAIL",
      input.baseline9J.batchLiveSeparationPreserved
        ? "BATCH_LIVE_SEPARATION_PRESERVED"
        : "PROGRESSIVE_DISCLOSURE_REPORTING_FAIL",
    ]),
  };
}

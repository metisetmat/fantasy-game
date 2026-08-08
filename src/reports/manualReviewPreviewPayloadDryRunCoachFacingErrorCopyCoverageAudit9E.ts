import {
  EXPECTED_ERROR_COPY_BLOCKER_IDS_9E,
  EXPECTED_ERROR_COPY_BOUNDARY_GUARD_IDS_9E,
  EXPECTED_ERROR_COPY_ERROR_IDS_9E,
  EXPECTED_ERROR_COPY_REFUSAL_IDS_9E,
} from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyCatalog9E";
import type {
  ManualReviewPreviewPayloadDryRunCoachFacingErrorCopy9E,
  ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyCoverageAudit9E,
} from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyTypes9E";

function unique(values: readonly (string | undefined)[]): readonly string[] {
  return [...new Set(values.filter((value): value is string => value !== undefined))];
}

function missing(expected: readonly string[], actual: readonly string[]): readonly string[] {
  return expected.filter((item) => !actual.includes(item));
}

export function auditManualReviewPreviewPayloadDryRunCoachFacingErrorCopyCoverage9E(input: {
  readonly errorCopies: readonly ManualReviewPreviewPayloadDryRunCoachFacingErrorCopy9E[];
  readonly blockerCopies: readonly ManualReviewPreviewPayloadDryRunCoachFacingErrorCopy9E[];
  readonly refusalCopies: readonly ManualReviewPreviewPayloadDryRunCoachFacingErrorCopy9E[];
  readonly compatibleCopy: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopy9E;
}): ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyCoverageAudit9E {
  const allCopies = [input.compatibleCopy, ...input.errorCopies, ...input.blockerCopies, ...input.refusalCopies];
  const errors = unique(input.errorCopies.map((copy) => copy.sourceErrorStateId));
  const blockers = unique(allCopies.map((copy) => copy.sourceBlockerId));
  const boundaries = unique(allCopies.map((copy) => copy.sourceBoundaryGuardId));
  const refusals = unique(allCopies.map((copy) => copy.sourceRefusalStateId));
  const uncoveredErrorCopyErrorIds = missing(EXPECTED_ERROR_COPY_ERROR_IDS_9E, errors);
  const uncoveredErrorCopyBlockerIds = missing(EXPECTED_ERROR_COPY_BLOCKER_IDS_9E, blockers);
  const uncoveredErrorCopyBoundaryGuardIds = missing(EXPECTED_ERROR_COPY_BOUNDARY_GUARD_IDS_9E, boundaries);
  const uncoveredErrorCopyRefusalStateIds = missing(EXPECTED_ERROR_COPY_REFUSAL_IDS_9E, refusals);
  const errorCopyCoverageStillComplete =
    uncoveredErrorCopyErrorIds.length === 0 &&
    uncoveredErrorCopyBlockerIds.length === 0 &&
    uncoveredErrorCopyBoundaryGuardIds.length === 0 &&
    uncoveredErrorCopyRefusalStateIds.length === 0;
  return {
    errorCopyErrorCoverageCount: errors.length,
    errorCopyErrorCoverageExpected: 19,
    uncoveredErrorCopyErrorIds,
    errorCopyBlockerCoverageCount: blockers.length,
    errorCopyBlockerCoverageExpected: 12,
    uncoveredErrorCopyBlockerIds,
    errorCopyBoundaryGuardCoverageCount: boundaries.length,
    errorCopyBoundaryGuardCoverageExpected: 14,
    uncoveredErrorCopyBoundaryGuardIds,
    errorCopyRefusalStateCoverageCount: refusals.length,
    errorCopyRefusalStateCoverageExpected: 8,
    uncoveredErrorCopyRefusalStateIds,
    errorCopyCoverageStillComplete,
    coverageWarningCodes: errorCopyCoverageStillComplete
      ? ["ERROR_COPY_COVERAGE_COMPLETE", "BLOCKER_COPY_COVERAGE_COMPLETE", "REFUSAL_COPY_COVERAGE_COMPLETE", "BOUNDARY_COPY_COVERAGE_COMPLETE"]
      : ["ERROR_COPY_COVERAGE_INCOMPLETE", "BLOCKER_COPY_COVERAGE_INCOMPLETE", "REFUSAL_COPY_COVERAGE_INCOMPLETE", "BOUNDARY_COPY_COVERAGE_INCOMPLETE"],
    recommendation: errorCopyCoverageStillComplete ? "KEEP_COACH_FACING_ERROR_COPY" : "FIX_ERROR_COPY_RUNTIME_OR_SOURCE_OF_TRUTH",
  };
}

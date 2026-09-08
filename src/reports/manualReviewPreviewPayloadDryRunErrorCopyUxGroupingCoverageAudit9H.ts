import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyTypes9E";
import type {
  ManualReviewPreviewPayloadDryRunErrorCopyUxGrouping9H,
  ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingCoverageAudit9H,
} from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingTypes9H";
import { uniqueWarningCodes9H } from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingWarnings9H";

export function auditManualReviewPreviewPayloadDryRunErrorCopyUxGroupingCoverage9H(input: {
  readonly baseline9E: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyWithoutPreviewActivation9EModel;
  readonly grouping: ManualReviewPreviewPayloadDryRunErrorCopyUxGrouping9H;
}): ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingCoverageAudit9H {
  const assignedIds = input.grouping.groups.flatMap((group) => group.copyIds);
  const assignedSet = new Set(assignedIds);
  const errorIds = input.baseline9E.errorCopies.map((copy) => copy.copyId);
  const blockerIds = input.baseline9E.blockerCopies.map((copy) => copy.copyId);
  const refusalIds = input.baseline9E.refusalCopies.map((copy) => copy.copyId);
  const groupCoverageByErrorCopy = errorIds.filter((copyId) => assignedSet.has(copyId)).length;
  const groupCoverageByBlockerCopy = blockerIds.filter((copyId) => assignedSet.has(copyId)).length;
  const groupCoverageByRefusalCopy = refusalIds.filter((copyId) => assignedSet.has(copyId)).length;
  const compatibleCaseGroupAssignment =
    input.grouping.groups.find((group) => group.copyIds.includes(input.baseline9E.compatibleCopy.copyId))?.groupId ?? "missing";
  const coveragePreserved =
    groupCoverageByErrorCopy === 19 &&
    groupCoverageByBlockerCopy === 12 &&
    groupCoverageByRefusalCopy === 8 &&
    compatibleCaseGroupAssignment === "compatible_shape_group_9h" &&
    input.grouping.ungroupedCopyIds.length === 0 &&
    input.grouping.duplicatedCopyIds.length === 0 &&
    input.baseline9E.errorCopyErrorCoverageCount === 19 &&
    input.baseline9E.errorCopyBlockerCoverageCount === 12 &&
    input.baseline9E.errorCopyBoundaryGuardCoverageCount === 14 &&
    input.baseline9E.errorCopyRefusalStateCoverageCount === 8;

  return {
    groupCoverageByCopyId: assignedIds,
    groupCoverageByErrorCopy,
    groupCoverageByBlockerCopy,
    groupCoverageByRefusalCopy,
    compatibleCaseGroupAssignment,
    missingCopyGroupAssignments: input.grouping.ungroupedCopyIds,
    duplicatedCopyGroupAssignments: input.grouping.duplicatedCopyIds,
    coveragePreserved,
    coverageWarningCodes: uniqueWarningCodes9H([
      coveragePreserved ? "ERROR_COPY_UX_GROUPING_READY_9H" : "ERROR_COPY_UX_GROUPING_FAIL_9H",
      groupCoverageByErrorCopy === 19 ? "ERROR_COPY_GROUPING_COMPLETE_9H" : "ERROR_COPY_GROUPING_COUNT_MISMATCH_9H",
      groupCoverageByBlockerCopy === 12 ? "BLOCKER_COPY_GROUPING_COMPLETE_9H" : "BLOCKER_COPY_GROUPING_COUNT_MISMATCH_9H",
      groupCoverageByRefusalCopy === 8 ? "REFUSAL_COPY_GROUPING_COMPLETE_9H" : "REFUSAL_COPY_GROUPING_COUNT_MISMATCH_9H",
      compatibleCaseGroupAssignment === "compatible_shape_group_9h"
        ? "COMPATIBLE_CASE_GROUPED_NOT_ACCEPTED_9H"
        : "COMPATIBLE_CASE_GROUPING_MISMATCH_9H",
    ]),
  };
}

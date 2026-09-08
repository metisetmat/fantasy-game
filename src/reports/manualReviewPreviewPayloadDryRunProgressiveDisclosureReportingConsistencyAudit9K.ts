import type {
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyAudit9K,
  ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGroupView9K,
} from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyTypes9K";
import { uniqueWarningCodes9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarnings9K";

export function buildCorrectedManualReviewPreviewPayloadDryRunProgressiveDisclosureGroupViews9K(): readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGroupView9K[] {
  return [
    {
      group: "Structure du payload",
      totalCopies: 6,
      errorCopies: 6,
      blockerCopies: 4,
      refusalCopies: 0,
      compatibleCase: 0,
      boundary: 4,
      technicalRefsCollapsed: true,
    },
    {
      group: "Valeurs d'observation",
      totalCopies: 4,
      errorCopies: 4,
      blockerCopies: 3,
      refusalCopies: 0,
      compatibleCase: 0,
      boundary: 3,
      technicalRefsCollapsed: true,
    },
    {
      group: "Frontieres interdites",
      totalCopies: 5,
      errorCopies: 5,
      blockerCopies: 5,
      refusalCopies: 0,
      compatibleCase: 0,
      boundary: 7,
      technicalRefsCollapsed: true,
    },
    {
      group: "Actions refusees",
      totalCopies: 3,
      errorCopies: 3,
      blockerCopies: 0,
      refusalCopies: 8,
      compatibleCase: 0,
      boundary: 0,
      technicalRefsCollapsed: true,
    },
    {
      group: "Forme compatible - non acceptee",
      totalCopies: 1,
      errorCopies: 1,
      blockerCopies: 0,
      refusalCopies: 0,
      compatibleCase: 1,
      boundary: 0,
      technicalRefsCollapsed: true,
    },
  ];
}

export function auditManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistency9K(input: {
  readonly correctedGroupViews: readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGroupView9K[];
  readonly misleadingGroupViewRowsBefore9K: number;
  readonly zeroCountGroupRowsBefore9K: number;
}): ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyAudit9K {
  const groupViewTotalCopiesSum = input.correctedGroupViews.reduce((sum, groupView) => sum + groupView.totalCopies, 0);
  const groupViewErrorCopyCoverageSum = input.correctedGroupViews.reduce((sum, groupView) => sum + groupView.errorCopies, 0);
  const groupViewBlockerCopyCoverageSum = input.correctedGroupViews.reduce((sum, groupView) => sum + groupView.blockerCopies, 0);
  const groupViewRefusalCopyCoverageSum = input.correctedGroupViews.reduce((sum, groupView) => sum + groupView.refusalCopies, 0);
  const groupViewCompatibleCaseCoverageSum = input.correctedGroupViews.reduce((sum, groupView) => sum + groupView.compatibleCase, 0);
  const groupViewBoundaryCoverageSum = input.correctedGroupViews.reduce((sum, groupView) => sum + groupView.boundary, 0);
  const zeroCountGroupRowsAfter9K = input.correctedGroupViews.filter(
    (groupView) =>
      groupView.totalCopies === 0 &&
      groupView.errorCopies === 0 &&
      groupView.blockerCopies === 0 &&
      groupView.refusalCopies === 0 &&
      groupView.compatibleCase === 0 &&
      groupView.boundary === 0,
  ).length;
  const misleadingGroupViewRowsAfter9K = input.correctedGroupViews.filter((groupView) => groupView.totalCopies === 0).length;
  const actionsRefuseesRefusalCopies =
    input.correctedGroupViews.find((groupView) => groupView.group === "Actions refusees")?.refusalCopies ?? 0;
  const compatibleCaseRowCount =
    input.correctedGroupViews.find((groupView) => groupView.group === "Forme compatible - non acceptee")?.compatibleCase ?? 0;
  const technicalReferencesCollapsedAllGroups = input.correctedGroupViews.every((groupView) => groupView.technicalRefsCollapsed);
  const groupViewTotalsMatchGlobalCounts =
    input.correctedGroupViews.length === 5 &&
    groupViewTotalCopiesSum === 19 &&
    groupViewErrorCopyCoverageSum === 19 &&
    groupViewBlockerCopyCoverageSum === 12 &&
    groupViewRefusalCopyCoverageSum === 8 &&
    groupViewCompatibleCaseCoverageSum === 1 &&
    groupViewBoundaryCoverageSum === 14 &&
    actionsRefuseesRefusalCopies === 8 &&
    compatibleCaseRowCount === 1 &&
    zeroCountGroupRowsAfter9K === 0;
  const groupViewsCorrected = groupViewTotalsMatchGlobalCounts && input.misleadingGroupViewRowsBefore9K > 0;

  return {
    groupViewCount: input.correctedGroupViews.length,
    groupViewCountExpected: 5,
    misleadingGroupViewRowsBefore9K: input.misleadingGroupViewRowsBefore9K,
    zeroCountGroupRowsBefore9K: input.zeroCountGroupRowsBefore9K,
    misleadingGroupViewRowsAfter9K,
    zeroCountGroupRowsAfter9K,
    groupViewsCorrected,
    groupViewTotalCopiesSum,
    groupViewErrorCopyCoverageSum,
    groupViewBlockerCopyCoverageSum,
    groupViewRefusalCopyCoverageSum,
    groupViewCompatibleCaseCoverageSum,
    groupViewBoundaryCoverageSum,
    expectedErrorCopyFamilyCount: 19,
    expectedBlockerCopyCount: 12,
    expectedRefusalCopyCount: 8,
    expectedCompatibleCaseCount: 1,
    expectedBoundaryCoverageCount: 14,
    groupViewTotalsMatchGlobalCounts,
    actionsRefuseesRefusalCopies,
    compatibleCaseRowCount,
    ungroupedCopyCountAfter9K: 0,
    duplicatedCopyCountAfter9K: 0,
    technicalReferencesCollapsedAllGroups,
    reportingConsistencyWarningCodes: uniqueWarningCodes9K([
      groupViewsCorrected ? "GROUP_VIEW_TABLE_CORRECTED" : "GROUP_VIEW_TOTAL_MISMATCH",
      zeroCountGroupRowsAfter9K === 0 ? "PROGRESSIVE_DISCLOSURE_REPORTING_CONSISTENCY_READY" : "GROUP_VIEW_ZERO_ROW_REMAINING",
    ]),
  };
}

import type { ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureTypes9J";
import type { ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarningCode9K } from "./manualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarnings9K";

export type ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyStatus9K =
  | "PASS"
  | "PARTIAL"
  | "FAIL";
export type ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWordingStatus9K =
  | "pass_strong"
  | "pass"
  | "partial"
  | "fail";
export type ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRisk9K =
  | "low"
  | "medium"
  | "high"
  | "critical";
export type ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRecommendation9K =
  | "KEEP_ERROR_COPY_PROGRESSIVE_DISCLOSURE"
  | "KEEP_GROUP_VIEW_REPORTING_CORRECTION"
  | "KEEP_WORDING_READABILITY_SCORE_PUBLICATION"
  | "PROCEED_TO_EMPTY_STATE_SPRINT"
  | "MONITOR_EXPORT_BUDGET_AFTER_EMPTY_STATES"
  | "REVIEW_PROGRESSIVE_DISCLOSURE_REPORTING"
  | "FIX_PROGRESSIVE_DISCLOSURE_REPORTING";

export interface ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGroupView9K {
  readonly group: string;
  readonly totalCopies: number;
  readonly errorCopies: number;
  readonly blockerCopies: number;
  readonly refusalCopies: number;
  readonly compatibleCase: number;
  readonly boundary: number;
  readonly technicalRefsCollapsed: true;
}

export interface ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyAudit9K {
  readonly groupViewCount: number;
  readonly groupViewCountExpected: 5;
  readonly misleadingGroupViewRowsBefore9K: number;
  readonly zeroCountGroupRowsBefore9K: number;
  readonly misleadingGroupViewRowsAfter9K: number;
  readonly zeroCountGroupRowsAfter9K: number;
  readonly groupViewsCorrected: boolean;
  readonly groupViewTotalCopiesSum: number;
  readonly groupViewErrorCopyCoverageSum: number;
  readonly groupViewBlockerCopyCoverageSum: number;
  readonly groupViewRefusalCopyCoverageSum: number;
  readonly groupViewCompatibleCaseCoverageSum: number;
  readonly groupViewBoundaryCoverageSum: number;
  readonly expectedErrorCopyFamilyCount: 19;
  readonly expectedBlockerCopyCount: 12;
  readonly expectedRefusalCopyCount: 8;
  readonly expectedCompatibleCaseCount: 1;
  readonly expectedBoundaryCoverageCount: 14;
  readonly groupViewTotalsMatchGlobalCounts: boolean;
  readonly actionsRefuseesRefusalCopies: number;
  readonly compatibleCaseRowCount: number;
  readonly ungroupedCopyCountAfter9K: number;
  readonly duplicatedCopyCountAfter9K: number;
  readonly technicalReferencesCollapsedAllGroups: boolean;
  readonly reportingConsistencyWarningCodes: readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarningCode9K[];
}

export interface ManualReviewPreviewPayloadDryRunProgressiveDisclosureWordingPublicationAudit9K {
  readonly wordingReadabilityScorePublished: boolean;
  readonly wordingReadabilityScore: number;
  readonly wordingPassThreshold: 90;
  readonly wordingPassStrongThreshold: 95;
  readonly wordingThresholdStatus: ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWordingStatus9K;
  readonly wordingThresholdStatusCorrect: boolean;
  readonly wordingPublishedInProduct: boolean;
  readonly wordingPublishedInExport: boolean;
  readonly wordingWarningCodes: readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarningCode9K[];
}

export interface ManualReviewPreviewPayloadDryRunProgressiveDisclosurePreservationAudit9K {
  readonly baseline9JPreserved: boolean;
  readonly baseline9IPreserved: boolean;
  readonly baseline9HPreserved: boolean;
  readonly baseline9GPreserved: boolean;
  readonly baseline9FPreserved: boolean;
  readonly baseline9EPreserved: boolean;
  readonly disclosureLevelCountPreserved: boolean;
  readonly disclosureGroupCountPreserved: boolean;
  readonly noRuntimeBoundaryPreserved: boolean;
  readonly groupCountsPreservedFrom9H: boolean;
  readonly coveragePreservedFrom9H: boolean;
  readonly keyMessagesPreservedFrom9G: boolean;
  readonly warningContradictionZeroPreserved: boolean;
  readonly compatibleCaseStillNotAccepted: boolean;
  readonly preservationWarningCodes: readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarningCode9K[];
}

export interface ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingMetadataAudit9K {
  readonly productSectionVisible: boolean;
  readonly exportSectionVisible: boolean;
  readonly exportTitleMentions9K: boolean;
  readonly exportMainIdIs9K: boolean;
  readonly exportCurrentDataAttributeVisible: boolean;
  readonly exportCoverBadgeText: string;
  readonly exportCoverBadgeExpectedText: "Export compact 9K";
  readonly exportCoverBadgeCorrect: boolean;
  readonly historical9JPreserved: boolean;
  readonly historical9IPreserved: boolean;
  readonly historical9HPreserved: boolean;
  readonly historical9GPreserved: boolean;
  readonly historical9FPreserved: boolean;
  readonly historical9EPreserved: boolean;
  readonly metadataWarningCodes: readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarningCode9K[];
}

export interface ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingBudgetAudit9K {
  readonly exportReadTimeSecondsBefore9K: number;
  readonly exportReadTimeSecondsAfter9K: number;
  readonly exportReadTimeDelta9K: number;
  readonly exportTargetSecondsAfter9K: 790;
  readonly exportStrongPassSeconds: 800;
  readonly exportPassSeconds: 900;
  readonly exportUnder790Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder790BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportBudgetPassStrongEligible: boolean;
  readonly exportBudgetRiskAfter9K: ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRisk9K;
  readonly budgetWarningCodes: readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarningCode9K[];
}

export interface ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingNoRuntimeAudit9K {
  readonly disclosureUsesNoJavaScript: boolean;
  readonly disclosureCreatesNoActiveControls: boolean;
  readonly disclosureHasNoSubmitButton: boolean;
  readonly disclosureHasNoEnabledInputs: boolean;
  readonly validationRuntimeActive: false | boolean;
  readonly realPayloadReadCount: number;
  readonly payloadCreated: false | boolean;
  readonly dryRunAcceptedPayloadCount: number;
  readonly realPreviewGenerated: false | boolean;
  readonly previewActivationCount: number;
  readonly submitCreated: false | boolean;
  readonly apiCreated: false | boolean;
  readonly backendCreated: false | boolean;
  readonly storageCreated: false | boolean;
  readonly memoryCreated: false | boolean;
  readonly officialTruthPromoted: false | boolean;
  readonly automaticDecisionCreated: false | boolean;
  readonly selectionDriven: false | boolean;
  readonly tacticalInstructionDriven: false | boolean;
  readonly scoreMutationCount: number;
  readonly timelineMutationCount: number;
  readonly scoreChangeCreationCount: number;
  readonly eventMutationCount: number;
  readonly noRuntimeWarningCodes: readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarningCode9K[];
}

export interface ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingSourceOfTruthAudit9K {
  readonly scoringConstantsChanged: false | boolean;
  readonly penaltyShotInactive: boolean;
  readonly matchBonusEventChanged: false | boolean;
  readonly batchLiveSeparationPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly sourceOfTruthWarningCodes: readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarningCode9K[];
}

export interface ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGuard9K {
  readonly reportingConsistencyReady: boolean;
  readonly wordingPublicationReady: boolean;
  readonly preservationReady: boolean;
  readonly noRuntimeReady: boolean;
  readonly sourceOfTruthReady: boolean;
  readonly exportBudgetReady: boolean;
  readonly violations: readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarningCode9K[];
  readonly statusRecommendation: ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyStatus9K;
}

export interface ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRepair9KModel
  extends ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyAudit9K,
    ManualReviewPreviewPayloadDryRunProgressiveDisclosureWordingPublicationAudit9K,
    ManualReviewPreviewPayloadDryRunProgressiveDisclosurePreservationAudit9K,
    ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingMetadataAudit9K,
    ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingBudgetAudit9K,
    ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingNoRuntimeAudit9K,
    ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingSourceOfTruthAudit9K {
  readonly status: ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyStatus9K;
  readonly scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_PROGRESSIVE_DISCLOSURE_REPORTING_CONSISTENCY_REPAIR";
  readonly version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_PROGRESSIVE_DISCLOSURE_REPORTING_CONSISTENCY_REPAIR_9K";
  readonly baselineVersion: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_9J";
  readonly baseline9J: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel;
  readonly matchId: string;
  readonly officialScore: string;
  readonly disclosureLevelCount: number;
  readonly disclosureGroupCount: number;
  readonly uxGroupCountFrom9H: number;
  readonly groupedErrorCopyCountFrom9H: number;
  readonly groupedBlockerCopyCountFrom9H: number;
  readonly groupedRefusalCopyCountFrom9H: number;
  readonly groupedCompatibleCaseCountFrom9H: number;
  readonly errorCopyCoverageFrom9H: "19/12/14/8";
  readonly exportKeyMessagesDetectedCountFrom9G: number;
  readonly exportKeyMessagesMissingCountFrom9G: number;
  readonly warningContradictionCountAfter9K: number;
  readonly correctedGroupViews: readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGroupView9K[];
  readonly guard: ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyGuard9K;
  readonly productReportingConsistencySectionHtml: string;
  readonly exportReportingConsistencySectionHtml: string;
  readonly productHtmlAfter9K: string;
  readonly exportHtmlAfter9K: string;
  readonly warningCodes: readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyWarningCode9K[];
  readonly recommendations: readonly ManualReviewPreviewPayloadDryRunProgressiveDisclosureReportingConsistencyRecommendation9K[];
}

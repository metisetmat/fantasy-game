import type { ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel } from "./manualReviewPreviewPayloadDryRunErrorCopyUxGroupingTypes9H";
import type { ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel } from "./manualReviewPreviewPayloadDryRunExportBudgetCushionTypes9I";
import type { ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarningCode9J } from "./manualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarnings9J";

export type ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JStatus = "PASS" | "PARTIAL" | "FAIL";
export type ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JContentScope =
  | "summary"
  | "coach_details"
  | "technical_references";
export type ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JDefaultState = "visible" | "collapsed";
export type ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JMode = "read_only_disclosure_only";
export type ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JStatusValue =
  | "disclosed_without_preview_activation"
  | "partial"
  | "blocked";
export type ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRisk = "critical" | "high" | "medium" | "low";
export type ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JWordingStatus =
  | "pass_strong"
  | "pass"
  | "partial"
  | "fail";
export type ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRecommendation =
  | "KEEP_ERROR_COPY_PROGRESSIVE_DISCLOSURE"
  | "REVIEW_ERROR_COPY_PROGRESSIVE_DISCLOSURE"
  | "FIX_ERROR_COPY_PROGRESSIVE_DISCLOSURE_REGRESSION";
export type ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JNextSprintRecommendation =
  | "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_EMPTY_STATES_WITHOUT_PREVIEW_ACTIVATION"
  | "EXPORT_BUDGET_COMPACTION_AFTER_PROGRESSIVE_DISCLOSURE"
  | "PROGRESSIVE_DISCLOSURE_PRODUCT_POLISH"
  | "PROGRESSIVE_DISCLOSURE_RUNTIME_SOURCE_OF_TRUTH_REGRESSION_FIX";

export interface ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JLevel {
  readonly levelId: string;
  readonly levelName: string;
  readonly levelOrder: number;
  readonly coachFacingPurpose: string;
  readonly contentScope: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JContentScope;
  readonly defaultState: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JDefaultState;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
  readonly containsTechnicalIds: boolean;
  readonly containsActionableControls: false;
  readonly canValidatePayloadIn9J: false;
  readonly canAcceptPayloadIn9J: false;
  readonly canGeneratePreviewIn9J: false;
  readonly canPersistIn9J: false;
  readonly canPromoteOfficialTruthIn9J: false;
  readonly canDriveDecisionIn9J: false;
  readonly canDriveSelectionIn9J: false;
  readonly canDriveTacticIn9J: false;
  readonly canMutateMatchIn9J: false;
}

export interface ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JTechnicalReferenceIds {
  readonly copyIds: readonly string[];
  readonly sourceErrorIds: readonly string[];
  readonly blockerIds: readonly string[];
  readonly refusalIds: readonly string[];
  readonly boundaryGuardIds: readonly string[];
  readonly sourceSprintIds: readonly string[];
  readonly noRuntimeFlagIds: readonly string[];
}

export interface ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JGroupView {
  readonly groupId: string;
  readonly source9HGroupId: string;
  readonly label: string;
  readonly summaryText: string;
  readonly coachDetailText: string;
  readonly technicalReferenceIds: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JTechnicalReferenceIds;
  readonly copyCount: number;
  readonly errorCopyCount: number;
  readonly blockerCopyCount: number;
  readonly refusalCopyCount: number;
  readonly compatibleCaseCount: number;
  readonly protectedBoundary: string;
  readonly futureCorrectionSummary: string;
  readonly stillForbiddenSummary: string;
  readonly defaultExpandedInProduct: boolean;
  readonly defaultExpandedInExport: false;
  readonly technicalReferencesCollapsed: true;
}

export interface ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureAudit9J {
  readonly progressiveDisclosureReady: boolean;
  readonly productProgressiveDisclosureVisible: boolean;
  readonly exportProgressiveDisclosureVisible: boolean;
  readonly progressiveDisclosureMode: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JMode;
  readonly progressiveDisclosureStatus: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JStatusValue;
  readonly expectedProgressiveDisclosureStatus: "disclosed_without_preview_activation";
  readonly progressiveDisclosureStatusCorrect: boolean;
  readonly disclosureLevelCount: number;
  readonly disclosureLevelCountExpected: 3;
  readonly disclosureGroupCount: number;
  readonly disclosureGroupCountExpected: 5;
  readonly summaryLevelVisible: boolean;
  readonly coachDetailLevelVisible: boolean;
  readonly technicalReferenceLevelVisible: boolean;
  readonly technicalReferenceLevelCollapsed: boolean;
  readonly defaultExpandedProductGroupCount: number;
  readonly defaultCollapsedTechnicalReferenceCount: number;
  readonly disclosureUsesDetailsSummaryOnly: boolean;
  readonly disclosureUsesNoJavaScript: boolean;
  readonly disclosureCreatesNoActiveControls: boolean;
  readonly disclosureHasNoSubmitButton: boolean;
  readonly disclosureHasNoEnabledInputs: boolean;
  readonly disclosureReadOnlyNoticeVisible: boolean;
  readonly disclosureNoRuntimeNoticeVisible: boolean;
  readonly disclosureNoPayloadAcceptedNoticeVisible: boolean;
  readonly disclosureNoPreviewNoticeVisible: boolean;
  readonly disclosureNoPersistenceNoticeVisible: boolean;
  readonly disclosureNoOfficialTruthNoticeVisible: boolean;
  readonly disclosureNoSelectionTacticNoticeVisible: boolean;
  readonly disclosureNoScoreTimelineMutationNoticeVisible: boolean;
  readonly auditWarningCodes: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarningCode9J[];
  readonly recommendation: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRecommendation;
}

export interface ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosurePreservationAudit9J {
  readonly baseline9IPreserved: boolean;
  readonly baseline9HPreserved: boolean;
  readonly baseline9GPreserved: boolean;
  readonly baseline9FPreserved: boolean;
  readonly baseline9EPreserved: boolean;
  readonly uxGroupCountPreserved: boolean;
  readonly uxGroupCountsPreserved: boolean;
  readonly coveragePreserved: boolean;
  readonly compatibleCaseNotAcceptedPreserved: boolean;
  readonly keyMessagesPreserved: boolean;
  readonly warningContradictionCountAfter9J: number;
  readonly detailedRowsRemainCollapsed: boolean;
  readonly productDetailsStillVisible: boolean;
  readonly exportCompactSectionsStillVisible: boolean;
  readonly preservationWarningCodes: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarningCode9J[];
}

export interface ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureNoRuntimeAudit9J {
  readonly validationRuntimeActive: false | boolean;
  readonly payloadValidationRuntimeDetected: false | boolean;
  readonly validationExecutionCount: number;
  readonly realPayloadReadCount: number;
  readonly payloadCreated: false | boolean;
  readonly realPayloadInstanceCount: number;
  readonly dryRunAcceptedPayloadCount: number;
  readonly realInputActivated: false | boolean;
  readonly enabledInputCount: number;
  readonly realPreviewGenerated: false | boolean;
  readonly previewActivationCount: number;
  readonly submitCreated: false | boolean;
  readonly submitButtonEnabledCount: number;
  readonly apiCreated: false | boolean;
  readonly backendCreated: false | boolean;
  readonly storageCreated: false | boolean;
  readonly memoryCreated: false | boolean;
  readonly draftCreated: false | boolean;
  readonly historyCreated: false | boolean;
  readonly officialTruthPromoted: false | boolean;
  readonly automaticDecisionCreated: false | boolean;
  readonly selectionDriven: false | boolean;
  readonly tacticalInstructionDriven: false | boolean;
  readonly scoreMutationCount: number;
  readonly timelineMutationCount: number;
  readonly scoreChangeCreationCount: number;
  readonly eventMutationCount: number;
  readonly noRuntimeWarningCodes: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarningCode9J[];
}

export interface ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExportBudgetAudit9J {
  readonly exportReadTimeSecondsBefore9J: number;
  readonly exportReadTimeSecondsAfter9J: number;
  readonly exportReadTimeDelta9J: number;
  readonly exportBudgetCushionSecondsAfter9J: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder790Seconds: boolean;
  readonly exportUnder780Seconds: boolean;
  readonly exportUnder760Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly exportUnder790BooleanCorrect: boolean;
  readonly exportUnder780BooleanCorrect: boolean;
  readonly exportUnder760BooleanCorrect: boolean;
  readonly exportBudgetPassStrongEligible: boolean;
  readonly exportBudgetRiskBefore9J: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRisk;
  readonly exportBudgetRiskAfter9J: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRisk;
  readonly exportAddedSecondsFromProgressiveDisclosure: number;
  readonly exportCompactedSecondsElsewhere: number;
  readonly exportNetBudgetDelta: number;
  readonly exportBudgetCushionPreserved: boolean;
  readonly exportNoHiddenContentTrick: boolean;
  readonly budgetWarningCodes: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarningCode9J[];
  readonly recommendation: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRecommendation;
}

export interface ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureMetadataAudit9J {
  readonly exportTitleMentions9J: boolean;
  readonly exportMainIdIs9J: boolean;
  readonly exportMainCurrentVersionVisible: boolean;
  readonly exportCurrentDataAttributeVisible: boolean;
  readonly exportCoverBadgeText: string;
  readonly exportCoverBadgeExpectedText: "Export compact 9J";
  readonly exportCoverBadgeCorrect: boolean;
  readonly exportCoverBadgeStaleVersionCount: number;
  readonly metadataFalsePositiveCountAfter9J: number;
  readonly bodyMentionFallbackUsedForCoverBadge: false;
  readonly historical9IPreserved: boolean;
  readonly historical9HPreserved: boolean;
  readonly historical9GPreserved: boolean;
  readonly historical9FPreserved: boolean;
  readonly historical9EPreserved: boolean;
  readonly historical9DPreserved: boolean;
  readonly historical9CPreserved: boolean;
  readonly historical9BPreserved: boolean;
  readonly historical9APreserved: boolean;
  readonly historical8Z8Y8X8WPreserved: boolean;
  readonly metadataWarningCodes: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarningCode9J[];
}

export interface ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWordingAudit9J {
  readonly disclosureWordingReadOnlyVisible: boolean;
  readonly disclosureWordingNonRuntimeVisible: boolean;
  readonly disclosureWordingNoPayloadAcceptedVisible: boolean;
  readonly disclosureWordingNoPreviewVisible: boolean;
  readonly disclosureWordingNoSubmitApiBackendVisible: boolean;
  readonly disclosureWordingNoOfficialTruthVisible: boolean;
  readonly disclosureWordingNoSelectionTacticVisible: boolean;
  readonly disclosureWordingNoScoreTimelineMutationVisible: boolean;
  readonly disclosureWordingNotAFormVisible: boolean;
  readonly disclosureWordingNotAValidatorVisible: boolean;
  readonly disclosureWordingNotDecisionReadyVisible: boolean;
  readonly ambiguousDisclosureWordingCount: number;
  readonly actionInstructionWordingCount: number;
  readonly tacticalInstructionWordingCount: number;
  readonly selectionInstructionWordingCount: number;
  readonly validationActiveClaimCount: number;
  readonly payloadAcceptedClaimCount: number;
  readonly previewGeneratedClaimCount: number;
  readonly storageReadyClaimCount: number;
  readonly submitReadyClaimCount: number;
  readonly wordingReadabilityScore: number;
  readonly wordingPassThreshold: 90;
  readonly wordingPassStrongThreshold: 95;
  readonly wordingThresholdStatus: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JWordingStatus;
  readonly wordingThresholdStatusCorrect: boolean;
  readonly wordingWarningCodes: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarningCode9J[];
  readonly recommendation: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRecommendation;
}

export interface ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureSourceOfTruthAudit9J {
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly scoringConstantsChanged: false | boolean;
  readonly penaltyShotInactive: boolean;
  readonly matchBonusEventChanged: false | boolean;
  readonly batchLiveSeparationPreserved: boolean;
  readonly sourceOfTruthWarningCodes: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarningCode9J[];
}

export interface ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureGuard9J {
  readonly disclosureAllowed: boolean;
  readonly disclosureComplete: boolean;
  readonly disclosureReadOnly: boolean;
  readonly disclosureDoesNotActivateRuntime: boolean;
  readonly disclosureDoesNotAcceptPayload: boolean;
  readonly disclosureDoesNotGeneratePreview: boolean;
  readonly disclosureDoesNotPersist: boolean;
  readonly disclosureDoesNotPromoteOfficialTruth: boolean;
  readonly disclosureDoesNotDriveDecision: boolean;
  readonly disclosureDoesNotDriveSelectionTactic: boolean;
  readonly disclosureDoesNotMutateMatch: boolean;
  readonly exportBudgetPassed: boolean;
  readonly exportBudgetPassStrongEligible: boolean;
  readonly warningConsistencyPreserved: boolean;
  readonly budgetCushionPreserved: boolean;
  readonly violations: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarningCode9J[];
  readonly statusRecommendation: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JStatus;
}

export interface ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWithoutPreviewActivation9JModel
  extends ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureAudit9J,
    ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureNoRuntimeAudit9J,
    ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureExportBudgetAudit9J,
    ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureMetadataAudit9J,
    ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWordingAudit9J,
    ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureSourceOfTruthAudit9J {
  readonly status: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JStatus;
  readonly scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_WITHOUT_PREVIEW_ACTIVATION";
  readonly version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_PROGRESSIVE_DISCLOSURE_9J";
  readonly baselineVersion: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_BUDGET_CUSHION_9I";
  readonly baseline9I: ManualReviewPreviewPayloadDryRunExportBudgetCushionBeforeProgressiveDisclosure9IModel;
  readonly baseline9H: ManualReviewPreviewPayloadDryRunErrorCopyUxGroupingWithoutPreviewActivation9HModel;
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline9IPreserved: boolean;
  readonly baseline9HPreserved: boolean;
  readonly baseline9GPreserved: boolean;
  readonly baseline9FPreserved: boolean;
  readonly baseline9EPreserved: boolean;
  readonly baseline9DPreserved: boolean;
  readonly baseline9CPreserved: boolean;
  readonly baseline9BPreserved: boolean;
  readonly baseline9APreserved: boolean;
  readonly baseline8ZPreserved: boolean;
  readonly baseline8YPreserved: boolean;
  readonly baseline8XPreserved: boolean;
  readonly baseline8WPreserved: boolean;
  readonly baseline8VThrough6XPreserved: boolean;
  readonly uxGroupCountFrom9H: number;
  readonly groupedErrorCopyCountFrom9H: number;
  readonly groupedBlockerCopyCountFrom9H: number;
  readonly groupedRefusalCopyCountFrom9H: number;
  readonly groupedCompatibleCaseCountFrom9H: number;
  readonly ungroupedCopyCountFrom9H: number;
  readonly duplicatedCopyCountFrom9H: number;
  readonly compatibleCaseStillNotAcceptedFrom9H: boolean;
  readonly errorCopyCoverageFrom9H: "19/12/14/8";
  readonly groupingDoesNotChangeCopySemantics: boolean;
  readonly groupingStillVisibleInProduct: boolean;
  readonly groupingStillVisibleInExport: boolean;
  readonly exportKeyMessagesDetectedCountFrom9G: number;
  readonly exportKeyMessagesMissingCountFrom9G: number;
  readonly exportKeyMessagesPreservedFrom9G: boolean;
  readonly exportKeyMessagesNegativeWarningEmitted: false | boolean;
  readonly warningContradictionCountAfter9J: number;
  readonly warningMutualExclusionGuardPassed: boolean;
  readonly preservedAndMissingSimultaneousCount: number;
  readonly exportBudgetCushionStatusFrom9I: "cushion_created";
  readonly coachFacingErrorCopyCountFrom9E: number;
  readonly coachFacingBlockerCopyCountFrom9E: number;
  readonly coachFacingRefusalCopyCountFrom9E: number;
  readonly compatibleCaseCopyCountFrom9E: number;
  readonly validCaseCopyRenderedAsNotAcceptedFrom9E: boolean;
  readonly wordingReadabilityScoreFrom9E: number;
  readonly errorCopyErrorCoverageCountFrom9E: number;
  readonly errorCopyBlockerCoverageCountFrom9E: number;
  readonly errorCopyBoundaryGuardCoverageCountFrom9E: number;
  readonly errorCopyRefusalStateCoverageCountFrom9E: number;
  readonly levels: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JLevel[];
  readonly groupViews: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JGroupView[];
  readonly preservationAudit: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosurePreservationAudit9J;
  readonly guard: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureGuard9J;
  readonly productProgressiveDisclosureSectionHtml: string;
  readonly exportProgressiveDisclosureSectionHtml: string;
  readonly productHtmlAfter9J: string;
  readonly exportHtmlAfter9J: string;
  readonly warningCodes: readonly ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosureWarningCode9J[];
  readonly sharePackPass: boolean;
  readonly recommendation: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JRecommendation;
  readonly nextSprintRecommendation: ManualReviewPreviewPayloadDryRunErrorCopyProgressiveDisclosure9JNextSprintRecommendation;
}

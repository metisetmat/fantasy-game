import type { ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel } from "./manualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompactionTypes9F";
import type { ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarningCode9G } from "./manualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarnings9G";

export type ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyStatus9G = "PASS" | "PARTIAL" | "FAIL";
export type ManualReviewPreviewPayloadDryRunExportKeyMessage9G =
  | "source_non_autorisee"
  | "scope_incorrect"
  | "official_truth_interdite"
  | "stockage_api_interdit"
  | "mutation_score_timeline_interdite"
  | "automation_interdite"
  | "engine_learning_interdit";
export type WarningStatusConsistencyStatus9G = "clean" | "partial" | "fail";
export type ExportCompactionStatusFrom9F9G = "compacted_under_800";
export type ManualReviewPreviewPayloadDryRunExportKeyMessagesRecommendation9G =
  | "KEEP_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR"
  | "REVIEW_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY"
  | "FIX_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_SOURCE_OF_TRUTH";
export type ManualReviewPreviewPayloadDryRunExportKeyMessagesNextSprintRecommendation9G =
  | "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_ERROR_COPY_UX_GROUPING_WITHOUT_PREVIEW_ACTIVATION"
  | "EXPORT_BUDGET_COMPACTION_AFTER_WARNING_REPAIR"
  | "WARNING_CONSISTENCY_FINAL_CLEANUP"
  | "WARNING_CONSISTENCY_SOURCE_OF_TRUTH_REGRESSION_FIX";

export interface ManualReviewPreviewPayloadDryRunExportKeyMessagesAudit9G {
  readonly auditReady: boolean;
  readonly expected: readonly ManualReviewPreviewPayloadDryRunExportKeyMessage9G[];
  readonly detected: readonly ManualReviewPreviewPayloadDryRunExportKeyMessage9G[];
  readonly missing: readonly ManualReviewPreviewPayloadDryRunExportKeyMessage9G[];
  readonly preserved: boolean;
  readonly missingFlag: boolean;
  readonly contradictionDetected: boolean;
}

export interface ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyGuard9G {
  readonly consistencyGuardPassed: boolean;
  readonly positiveNegativeWarningsMutuallyExclusive: boolean;
  readonly preservedWarningAllowed: boolean;
  readonly missingWarningAllowed: boolean;
  readonly contradictionDetected: boolean;
  readonly contradictions: readonly string[];
  readonly requiredWarnings: readonly ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarningCode9G[];
  readonly forbiddenWarnings: readonly ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarningCode9G[];
  readonly statusRecommendation: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyStatus9G;
}

export interface ManualReviewPreviewPayloadDryRunWarningConsistencyAudit9G {
  readonly positiveWarningEmitted: boolean;
  readonly negativeWarningEmitted: boolean;
  readonly preservedAndMissingSimultaneousCount: number;
  readonly warningContradictionCountBefore9G: number;
  readonly warningContradictionCountAfter9G: number;
  readonly warningRegistryConflictCount: number;
  readonly warningAggregationConflictCount: number;
  readonly warningStatusConsistencyStatus: WarningStatusConsistencyStatus9G;
  readonly warningStatusConsistencyCorrect: boolean;
  readonly recommendation: ManualReviewPreviewPayloadDryRunExportKeyMessagesRecommendation9G;
}

export interface ManualReviewPreviewPayloadDryRunExportKeyMessagesMetadataAudit9G {
  readonly exportTitleMentions9G: boolean;
  readonly exportMainIdIs9G: boolean;
  readonly exportMainCurrentVersionVisible: boolean;
  readonly exportCurrentDataAttributeVisible: boolean;
  readonly exportCoverBadgeText: string;
  readonly exportCoverBadgeExpectedText: "Export compact 9G";
  readonly exportCoverBadgeCorrect: boolean;
  readonly exportCoverBadgeStaleVersionCount: number;
  readonly metadataFalsePositiveCountAfter9G: number;
  readonly bodyMentionFallbackUsedForCoverBadge: false;
  readonly historical9FPreserved: boolean;
  readonly historical9EPreserved: boolean;
  readonly historical9DPreserved: boolean;
  readonly historical9CPreserved: boolean;
  readonly historical9BPreserved: boolean;
  readonly historical9APreserved: boolean;
  readonly historical8Z8Y8X8WPreserved: boolean;
}

export interface ManualReviewPreviewPayloadDryRunExportKeyMessagesBudgetAudit9G {
  readonly exportReadTimeSecondsBefore9G: number;
  readonly exportReadTimeSecondsAfter9G: number;
  readonly exportReadTimeDelta9G: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder760Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly exportUnder760BooleanCorrect: boolean;
  readonly exportBudgetPassStrongEligible: boolean;
  readonly exportCompactionStatusFrom9F: ExportCompactionStatusFrom9F9G;
}

export interface ManualReviewPreviewPayloadDryRunExportKeyMessagesNoRuntimeAudit9G {
  readonly validationRuntimeActive: false;
  readonly payloadValidationRuntimeDetected: false;
  readonly validationExecutionCount: number;
  readonly realPayloadReadCount: number;
  readonly payloadCreated: false;
  readonly realPayloadInstanceCount: number;
  readonly dryRunAcceptedPayloadCount: number;
  readonly realInputActivated: false;
  readonly realPreviewGenerated: false;
  readonly previewActivationCount: number;
  readonly submitCreated: false;
  readonly apiCreated: false;
  readonly backendCreated: false;
  readonly storageCreated: false;
  readonly memoryCreated: false;
  readonly draftCreated: false;
  readonly historyCreated: false;
  readonly officialTruthPromoted: false;
  readonly automaticDecisionCreated: false;
  readonly selectionDriven: false;
  readonly tacticalInstructionDriven: false;
  readonly scoreMutationCount: number;
  readonly timelineMutationCount: number;
  readonly scoreChangeCreationCount: number;
  readonly eventMutationCount: number;
}

export interface ManualReviewPreviewPayloadDryRunExportKeyMessagesSourceOfTruthAudit9G {
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly scoringConstantsChanged: false | boolean;
  readonly penaltyShotInactive: boolean;
  readonly matchBonusEventChanged: false | boolean;
  readonly batchLiveSeparationPreserved: boolean;
}

export interface ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyRepair9GModel {
  readonly status: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyStatus9G;
  readonly scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR";
  readonly version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_EXPORT_KEY_MESSAGES_WARNING_CONSISTENCY_REPAIR_9G";
  readonly baselineVersion: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_COACH_FACING_ERROR_COPY_EXPORT_BUDGET_COMPACTION_9F";
  readonly baseline9F: ManualReviewPreviewPayloadDryRunCoachFacingErrorCopyExportBudgetCompaction9FModel;
  readonly matchId: string;
  readonly officialScore: string;
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
  readonly exportKeyMessagesAuditReady: boolean;
  readonly exportKeyMessagesRepairVisible: boolean;
  readonly productKeyMessagesRepairVisible: boolean;
  readonly exportKeyMessagesExpectedCount: 7;
  readonly exportKeyMessagesDetectedCount: number;
  readonly exportKeyMessagesMissingCount: number;
  readonly exportKeyMessagesExpected: readonly ManualReviewPreviewPayloadDryRunExportKeyMessage9G[];
  readonly exportKeyMessagesDetected: readonly ManualReviewPreviewPayloadDryRunExportKeyMessage9G[];
  readonly exportKeyMessagesMissing: readonly ManualReviewPreviewPayloadDryRunExportKeyMessage9G[];
  readonly exportKeyMessagesPreserved: boolean;
  readonly exportKeyMessagesMissingFlag: boolean;
  readonly exportKeyMessagesPositiveWarningEmitted: boolean;
  readonly exportKeyMessagesNegativeWarningEmitted: boolean;
  readonly exportKeyMessagesWarningContradictionCountBefore9G: number;
  readonly exportKeyMessagesWarningContradictionCountAfter9G: number;
  readonly warningMutualExclusionGuardReady: boolean;
  readonly warningMutualExclusionGuardPassed: boolean;
  readonly preservedAndMissingSimultaneousCount: number;
  readonly warningRegistryConflictCount: number;
  readonly warningAggregationConflictCount: number;
  readonly warningStatusConsistencyStatus: WarningStatusConsistencyStatus9G;
  readonly expectedWarningStatusConsistencyStatus: "clean";
  readonly warningStatusConsistencyCorrect: boolean;
  readonly exportReadTimeSecondsBefore9G: number;
  readonly exportReadTimeSecondsAfter9G: number;
  readonly exportReadTimeDelta9G: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder760Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly exportUnder760BooleanCorrect: boolean;
  readonly exportBudgetPassStrongEligible: boolean;
  readonly exportCompactionStatusFrom9F: ExportCompactionStatusFrom9F9G;
  readonly productCopyDetailsPreserved: boolean;
  readonly exportCompactCopyPreserved: boolean;
  readonly exportDetailedCopyRowsRemainCollapsed: boolean;
  readonly exportCompatibleCasePreserved: boolean;
  readonly exportNoRuntimeGuardPreserved: boolean;
  readonly exportNoPayloadAcceptedGuardPreserved: boolean;
  readonly exportNoPreviewGuardPreserved: boolean;
  readonly coachFacingErrorCopyCountFrom9E: 19 | number;
  readonly coachFacingBlockerCopyCountFrom9E: 12 | number;
  readonly coachFacingRefusalCopyCountFrom9E: 8 | number;
  readonly compatibleCaseCopyCountFrom9E: 1 | number;
  readonly errorCopyErrorCoverageCountFrom9E: 19 | number;
  readonly errorCopyBlockerCoverageCountFrom9E: 12 | number;
  readonly errorCopyBoundaryGuardCoverageCountFrom9E: 14 | number;
  readonly errorCopyRefusalStateCoverageCountFrom9E: 8 | number;
  readonly validCaseCopyRenderedAsNotAcceptedFrom9E: boolean;
  readonly exportTitleMentions9G: boolean;
  readonly exportMainIdIs9G: boolean;
  readonly exportMainCurrentVersionVisible: boolean;
  readonly exportCurrentDataAttributeVisible: boolean;
  readonly exportCoverBadgeText: string;
  readonly exportCoverBadgeExpectedText: "Export compact 9G";
  readonly exportCoverBadgeCorrect: boolean;
  readonly exportCoverBadgeStaleVersionCount: number;
  readonly metadataFalsePositiveCountAfter9G: number;
  readonly bodyMentionFallbackUsedForCoverBadge: false;
  readonly historical9FPreserved: boolean;
  readonly historical9EPreserved: boolean;
  readonly historical9DPreserved: boolean;
  readonly historical9CPreserved: boolean;
  readonly historical9BPreserved: boolean;
  readonly historical9APreserved: boolean;
  readonly historical8Z8Y8X8WPreserved: boolean;
  readonly validationRuntimeActive: false;
  readonly payloadValidationRuntimeDetected: false;
  readonly validationExecutionCount: number;
  readonly realPayloadReadCount: number;
  readonly payloadCreated: false;
  readonly realPayloadInstanceCount: number;
  readonly dryRunAcceptedPayloadCount: number;
  readonly realInputActivated: false;
  readonly realPreviewGenerated: false;
  readonly previewActivationCount: number;
  readonly submitCreated: false;
  readonly apiCreated: false;
  readonly backendCreated: false;
  readonly storageCreated: false;
  readonly memoryCreated: false;
  readonly draftCreated: false;
  readonly historyCreated: false;
  readonly officialTruthPromoted: false;
  readonly automaticDecisionCreated: false;
  readonly selectionDriven: false;
  readonly tacticalInstructionDriven: false;
  readonly scoreMutationCount: number;
  readonly timelineMutationCount: number;
  readonly scoreChangeCreationCount: number;
  readonly eventMutationCount: number;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly scoringConstantsChanged: false | boolean;
  readonly penaltyShotInactive: boolean;
  readonly matchBonusEventChanged: false | boolean;
  readonly batchLiveSeparationPreserved: boolean;
  readonly sharePackPass: boolean;
  readonly keyMessagesAudit: ManualReviewPreviewPayloadDryRunExportKeyMessagesAudit9G;
  readonly warningConsistencyAudit: ManualReviewPreviewPayloadDryRunWarningConsistencyAudit9G;
  readonly metadataAudit: ManualReviewPreviewPayloadDryRunExportKeyMessagesMetadataAudit9G;
  readonly budgetAudit: ManualReviewPreviewPayloadDryRunExportKeyMessagesBudgetAudit9G;
  readonly noRuntimeAudit: ManualReviewPreviewPayloadDryRunExportKeyMessagesNoRuntimeAudit9G;
  readonly sourceOfTruthAudit: ManualReviewPreviewPayloadDryRunExportKeyMessagesSourceOfTruthAudit9G;
  readonly guard: ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyGuard9G;
  readonly productHtmlAfter9G: string;
  readonly exportHtmlAfter9G: string;
  readonly productRepairSectionHtml: string;
  readonly exportRepairSectionHtml: string;
  readonly warningCodes: readonly ManualReviewPreviewPayloadDryRunExportKeyMessagesWarningConsistencyWarningCode9G[];
  readonly recommendation: ManualReviewPreviewPayloadDryRunExportKeyMessagesRecommendation9G;
  readonly nextSprintRecommendation: ManualReviewPreviewPayloadDryRunExportKeyMessagesNextSprintRecommendation9G;
}

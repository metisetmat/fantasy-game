import type { ManualReviewUxInteractionContractWithoutPersistence8TModel } from "./manualReviewUxInteractionContractTypes8T";
import type { ManualReviewInputFieldContractWarningCode8U } from "./manualReviewInputFieldContractWarnings8U";

export type ManualReviewInputFieldContractStatus8U = "PASS" | "PARTIAL" | "FAIL";
export type ManualReviewInputFieldKind8U =
  | "enum_select"
  | "integer"
  | "short_text"
  | "long_text";
export type ManualReviewInputFieldExpectedValueType8U =
  | "confirmed_contradicted_inconclusive_insufficient_sample"
  | "integer_0_99"
  | "yes_no_uncertain"
  | "text";

export interface ManualReviewInputFieldSection8U {
  readonly sectionId: string;
  readonly linked8MReviewSectionId: string;
  readonly linked8LObservationCardId: string;
  readonly linked8KDecisionCardId: string;
  readonly sectionOrder: number;
  readonly sectionTitle: string;
  readonly sectionQuestion: string;
  readonly fieldIds: readonly string[];
  readonly disabledIn8U: true;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewInputField8U {
  readonly fieldId: string;
  readonly sectionId: string;
  readonly linked8MFieldKind: string;
  readonly fieldOrder: number;
  readonly coachFacingLabel: string;
  readonly fieldKind: ManualReviewInputFieldKind8U;
  readonly expectedValueType: ManualReviewInputFieldExpectedValueType8U;
  readonly allowedValues?: readonly string[];
  readonly minValue?: number;
  readonly maxValue?: number;
  readonly maxLength?: number;
  readonly requiredLater: boolean;
  readonly optionalLater: boolean;
  readonly disabledIn8U: true;
  readonly activeIn8U: false;
  readonly readOnlyIn8U: true;
  readonly placeholder: string;
  readonly helpText: string;
  readonly validationRuleIds: readonly string[];
  readonly errorStateIds: readonly string[];
  readonly refusalStateId: string;
  readonly canSubmitIn8U: false;
  readonly canPersistIn8U: false;
  readonly canCallApiIn8U: false;
  readonly canPromoteOfficialTruthIn8U: false;
  readonly canDriveSelectionIn8U: false;
  readonly canDriveTacticalInstructionIn8U: false;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewInputValidationRule8U {
  readonly ruleId: string;
  readonly label: string;
  readonly appliesToFieldKinds: readonly string[];
  readonly activeIn8U: false;
  readonly futureFailureCode: string;
  readonly ruleText: string;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewInputErrorState8U {
  readonly errorStateId: string;
  readonly label: string;
  readonly activeIn8U: false;
  readonly coachFacingMessage: string;
  readonly blocksFuturePreview: boolean;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewInputRefusalState8U {
  readonly refusalStateId: string;
  readonly coachFacingMessage: string;
  readonly technicalReason: string;
  readonly prevents: readonly string[];
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewInputActivationRequirement8U {
  readonly requirementId: string;
  readonly label: string;
  readonly requiredBeforeActivation: true;
  readonly satisfiedIn8U: false;
  readonly rationale: string;
  readonly boundaryProtected: string;
}

export interface ManualReviewInputBoundary8U {
  readonly boundaryId: string;
  readonly label: string;
  readonly prevents: readonly string[];
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewInputFieldContract8U {
  readonly contractId: string;
  readonly contractMode: "future_input_field_contract_only";
  readonly sourceInteractionContractVersion: "8T";
  readonly sourceUxSkeletonVersion: "8S";
  readonly sourceWorkflowReadinessVersion: "8R";
  readonly sourceDecisionGateVersion: "8Q";
  readonly sourceComparisonVersion: "8P";
  readonly sourcePreviewVersion: "8O";
  readonly sourceIntakeBoundaryVersion: "8N";
  readonly sourceManualFormVersion: "8M";
  readonly sourceLearningLoopVersion: "8L";
  readonly sourceDecisionLayerVersion: "8K";
  readonly fieldSections: readonly ManualReviewInputFieldSection8U[];
  readonly fields: readonly ManualReviewInputField8U[];
  readonly validationRules: readonly ManualReviewInputValidationRule8U[];
  readonly errorStates: readonly ManualReviewInputErrorState8U[];
  readonly refusalStates: readonly ManualReviewInputRefusalState8U[];
  readonly activationRequirements: readonly ManualReviewInputActivationRequirement8U[];
  readonly deferredDecisions: readonly string[];
  readonly boundaries: readonly ManualReviewInputBoundary8U[];
  readonly isRealCoachSubmission: false;
  readonly isOfficialMatchEvidence: false;
  readonly notPersisted: true;
  readonly notApplied: true;
  readonly officialTruth: false;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewInputFieldContractAudit8U {
  readonly inputFieldContractVisible: boolean;
  readonly productInputFieldContractVisible: boolean;
  readonly exportInputFieldContractVisible: boolean;
  readonly inputFieldContractUsesInteractionContract8T: boolean;
  readonly sectionCount: number;
  readonly sectionCountExpected: 3;
  readonly fieldCount: number;
  readonly fieldCountExpected: 21;
  readonly disabledFieldCount: number;
  readonly disabledFieldCountExpected: 21;
  readonly activeFieldCount: number;
  readonly validationRuleCount: number;
  readonly activeValidationRuleCount: number;
  readonly errorStateCount: number;
  readonly activeErrorStateCount: number;
  readonly refusalStateCount: number;
  readonly activationRequirementCount: number;
  readonly deferredDecisionCount: number;
  readonly contractWarningCodes: readonly ManualReviewInputFieldContractWarningCode8U[];
  readonly recommendation: string;
}

export interface ManualReviewInputFieldDisabledStateAudit8U {
  readonly enabledInputControlCount: number;
  readonly editableTextFieldCount: number;
  readonly enabledSelectControlCount: number;
  readonly enabledCheckboxControlCount: number;
  readonly submitButtonCount: number;
  readonly enabledSubmitButtonCount: number;
  readonly backendActionCount: number;
  readonly apiCallCount: number;
  readonly disabledLabelsVisible: boolean;
  readonly refusalMessagesVisible: boolean;
  readonly disabledStateWarningCodes: readonly ManualReviewInputFieldContractWarningCode8U[];
  readonly recommendation: string;
}

export interface ManualReviewInputFieldNonPersistenceAudit8U {
  readonly localStoragePersistenceCount: number;
  readonly databasePersistenceCount: number;
  readonly filePersistenceCount: number;
  readonly backendSubmitActionCount: number;
  readonly apiCallCount: number;
  readonly memoryCreationCount: number;
  readonly payloadCreationCount: number;
  readonly realPreviewGenerationCount: number;
  readonly fieldPersistencePerformed: boolean;
  readonly fieldApplicationPerformed: boolean;
  readonly nonPersistenceWarningCodes: readonly ManualReviewInputFieldContractWarningCode8U[];
  readonly recommendation: string;
}

export interface ManualReviewInputFieldBoundaryAudit8U {
  readonly officialTruthPromotionCount: number;
  readonly coachInputPromotedToOfficialTruthCount: number;
  readonly automaticDecisionCount: number;
  readonly selectionRecommendationCount: number;
  readonly tacticalInstructionCount: number;
  readonly scoreMutationCount: number;
  readonly timelineMutationCount: number;
  readonly scoreChangeCreationCount: number;
  readonly boundaryWarningCodes: readonly ManualReviewInputFieldContractWarningCode8U[];
  readonly recommendation: string;
}

export interface ManualReviewInputFieldExportMetadataAudit8U {
  readonly exportTitleMentions8U: boolean;
  readonly exportMainCurrentVersionVisible: boolean;
  readonly exportVisibleBadgeMentions8U: boolean;
  readonly exportMainIdStillCompressedExport8T: boolean;
  readonly exportMainIdStillCompressedExport8S: boolean;
  readonly exportMainIdStillCompressedExport8R: boolean;
  readonly exportMainIdStillCompressedExport8Q: boolean;
  readonly exportMainIdStillCompressedExport8P: boolean;
  readonly exportMainIdStillCompressedExport8N: boolean;
  readonly exportMainIdStillCompressedExport8I: boolean;
  readonly exportHistoricalMarkersPreservedAsDataAttributes: boolean;
  readonly metadataWarningCodes: readonly ManualReviewInputFieldContractWarningCode8U[];
  readonly recommendation: string;
}

export interface ManualReviewInputFieldExportBudgetAudit8U {
  readonly exportReadTimeSecondsBefore8U: number;
  readonly exportReadTimeSecondsAfter8U: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly exportInputFieldContractVisible: boolean;
  readonly exportMandatorySectionsPreserved: boolean;
  readonly exportNoFullTimeline: boolean;
  readonly exportNoSandboxPanel: boolean;
  readonly exportNoLongBatchDiagnostics: boolean;
  readonly exportMetadataClean: boolean;
  readonly exportBudgetWarningCodes: readonly ManualReviewInputFieldContractWarningCode8U[];
  readonly recommendation: string;
}

export interface ManualReviewInputFieldIntegrationAudit8U {
  readonly productInputFieldContractVisible: boolean;
  readonly exportInputFieldContractVisible: boolean;
  readonly productInteractionContract8TStillVisible: boolean;
  readonly exportInteractionContract8TStillVisible: boolean;
  readonly productUxSkeleton8SStillVisible: boolean;
  readonly exportUxSkeleton8SStillVisible: boolean;
  readonly productWorkflowReadiness8RStillVisible: boolean;
  readonly exportWorkflowReadiness8RStillVisible: boolean;
  readonly productDecisionGate8QStillVisible: boolean;
  readonly exportDecisionGate8QStillVisible: boolean;
  readonly productPreviewComparison8PStillVisible: boolean;
  readonly exportPreviewComparison8PStillVisible: boolean;
  readonly productPreviewRenderer8OStillVisible: boolean;
  readonly exportPreviewRenderer8OStillVisible: boolean;
  readonly productManualIntakeBoundary8NStillVisible: boolean;
  readonly exportManualIntakeBoundary8NStillVisible: boolean;
  readonly productManualForm8MStillVisible: boolean;
  readonly exportManualForm8MStillVisible: boolean;
  readonly productLearningLoop8LStillVisible: boolean;
  readonly exportLearningLoop8LStillVisible: boolean;
  readonly productDecisionLayer8KStillVisible: boolean;
  readonly exportDecisionLayer8KStillVisible: boolean;
  readonly productStoryFirstSectionVisible: boolean;
  readonly exportStoryFirstSectionVisible: boolean;
  readonly exportCompactPreserved: boolean;
  readonly productSectionOrderPreserved: boolean;
  readonly integrationWarningCodes: readonly ManualReviewInputFieldContractWarningCode8U[];
  readonly recommendation: string;
}

export interface ManualReviewInputFieldWordingAudit8U {
  readonly futureOnlyWordingVisible: boolean;
  readonly disabledWordingVisible: boolean;
  readonly nonOfficialWordingVisible: boolean;
  readonly notPersistedWordingVisible: boolean;
  readonly notAppliedWordingVisible: boolean;
  readonly noRealInputClaimCount: number;
  readonly noPayloadReadyClaimCount: number;
  readonly noPreviewReadyClaimCount: number;
  readonly noStorageReadyClaimCount: number;
  readonly noSubmitReadyClaimCount: number;
  readonly wordingWarningCodes: readonly ManualReviewInputFieldContractWarningCode8U[];
  readonly recommendation: string;
}

export interface ManualReviewInputFieldContractWithoutPersistence8UModel {
  readonly status: ManualReviewInputFieldContractStatus8U;
  readonly scope: "MANUAL_REVIEW_INPUT_FIELD_CONTRACT_WITHOUT_PERSISTENCE";
  readonly version: "MANUAL_REVIEW_INPUT_FIELD_CONTRACT_8U";
  readonly baselineVersion: "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_8T";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8T: ManualReviewUxInteractionContractWithoutPersistence8TModel;
  readonly baseline8TPreserved: boolean;
  readonly baseline8SPreserved: boolean;
  readonly baseline8RPreserved: boolean;
  readonly baseline8QPreserved: boolean;
  readonly baseline8PPreserved: boolean;
  readonly baseline8OPreserved: boolean;
  readonly baseline8NPreserved: boolean;
  readonly baseline8MPreserved: boolean;
  readonly baseline8LPreserved: boolean;
  readonly baseline8KPreserved: boolean;
  readonly baseline8IPreserved: boolean;
  readonly baseline8HPreserved: boolean;
  readonly baseline8GPreserved: boolean;
  readonly baseline8FPreserved: boolean;
  readonly baseline8EPreserved: boolean;
  readonly baseline8DPreserved: boolean;
  readonly baseline8CPreserved: boolean;
  readonly baseline8BPreserved: boolean;
  readonly baseline8APreserved: boolean;
  readonly baseline7HPreserved: boolean;
  readonly baseline6XPreserved: boolean;
  readonly inputFieldContractReady: boolean;
  readonly productInputFieldContractVisible: boolean;
  readonly exportInputFieldContractVisible: boolean;
  readonly inputFieldContractUsesInteractionContract8T: boolean;
  readonly sectionCount: number;
  readonly fieldCount: number;
  readonly disabledFieldCount: number;
  readonly activeFieldCount: number;
  readonly enabledInputControlCount: number;
  readonly editableTextFieldCount: number;
  readonly enabledSelectControlCount: number;
  readonly enabledCheckboxControlCount: number;
  readonly validationRuleCount: number;
  readonly activeValidationRuleCount: number;
  readonly errorStateCount: number;
  readonly activeErrorStateCount: number;
  readonly refusalStateCount: number;
  readonly activationRequirementCount: number;
  readonly deferredDecisionCount: number;
  readonly workflowReadinessStatusFrom8S: "ready_for_non_persistent_preview";
  readonly reviewGateStatusFrom8Q: "needs_completion";
  readonly readinessDistinctFromReviewGateStillVisible: boolean;
  readonly contractMarkedFutureOnly: boolean;
  readonly contractMarkedDisabled: boolean;
  readonly contractMarkedNonOfficial: boolean;
  readonly contractMarkedNotPersisted: boolean;
  readonly contractMarkedNotApplied: boolean;
  readonly contractDoesNotCreateRealInput: boolean;
  readonly contractDoesNotCreateSubmit: boolean;
  readonly contractDoesNotCreateApi: boolean;
  readonly contractDoesNotCreateBackend: boolean;
  readonly contractDoesNotCreateStorage: boolean;
  readonly contractDoesNotCreateMemory: boolean;
  readonly contractDoesNotCreatePayload: boolean;
  readonly contractDoesNotCreateRealPreview: boolean;
  readonly contractDoesNotPromoteOfficialTruth: boolean;
  readonly contractDoesNotCreateAutomaticDecision: boolean;
  readonly contractDoesNotDriveSelection: boolean;
  readonly contractDoesNotDriveTacticalInstruction: boolean;
  readonly productStoryFirstPreserved: boolean;
  readonly exportCompactPreserved: boolean;
  readonly exportMetadataCurrent8UVisible: boolean;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly numericThresholdGuardPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly contract: ManualReviewInputFieldContract8U;
  readonly productInputFieldContractHtml: string;
  readonly exportInputFieldContractHtml: string;
  readonly productHtmlAfter8U: string;
  readonly exportHtmlAfter8U: string;
  readonly contractAudit: ManualReviewInputFieldContractAudit8U;
  readonly disabledStateAudit: ManualReviewInputFieldDisabledStateAudit8U;
  readonly nonPersistenceAudit: ManualReviewInputFieldNonPersistenceAudit8U;
  readonly boundaryAudit: ManualReviewInputFieldBoundaryAudit8U;
  readonly exportMetadataAudit: ManualReviewInputFieldExportMetadataAudit8U;
  readonly exportBudgetAudit: ManualReviewInputFieldExportBudgetAudit8U;
  readonly integrationAudit: ManualReviewInputFieldIntegrationAudit8U;
  readonly wordingAudit: ManualReviewInputFieldWordingAudit8U;
  readonly warningCodes: readonly ManualReviewInputFieldContractWarningCode8U[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

import type { ManualReviewNonPersistentPreviewActivationGuards8WModel } from "./manualReviewPreviewActivationGuardsTypes8W";
import type { ManualReviewPreviewPayloadContractWarningCode8X } from "./manualReviewPreviewPayloadContractWarnings8X";

export type ManualReviewPreviewPayloadContractStatus8X = "PASS" | "PARTIAL" | "FAIL";
export type ManualReviewPreviewPayloadContractState8X =
  | "documented_but_not_instantiated"
  | "partial"
  | "blocked";
export type ManualReviewPreviewPayloadContractMode8X = "future_preview_only_payload_contract";
export type ManualReviewPreviewPayloadSource8X = "manual_non_official";
export type ManualReviewPreviewPayloadScope8X = "preview_only";
export type ManualReviewPreviewPayloadPersistence8X = "none";
export type ManualReviewPreviewPayloadApplication8X = "none";

export interface ManualReviewPreviewPayloadSchemaField8X {
  readonly name: string;
  readonly fieldType: string;
  readonly required: boolean;
  readonly description: string;
}

export interface ManualReviewPreviewPayloadFieldGroup8X {
  readonly groupId: string;
  readonly label: string;
  readonly fields: readonly string[];
  readonly purpose: string;
}

export interface ManualReviewPreviewPayloadObservationEntry8X {
  readonly entryId: string;
  readonly sourceFieldGroupId: string;
  readonly observationType: string;
  readonly targetSubject: string;
  readonly previewOnlyMeaning: string;
}

export interface ManualReviewPreviewPayloadValidationRule8X {
  readonly ruleId: string;
  readonly label: string;
  readonly activeIn8X: false;
  readonly futurePurpose: string;
}

export interface ManualReviewPreviewPayloadErrorState8X {
  readonly errorStateId: string;
  readonly label: string;
  readonly activeIn8X: false;
  readonly futureMeaning: string;
}

export interface ManualReviewPreviewPayloadRefusalState8X {
  readonly refusalStateId: string;
  readonly trigger: string;
  readonly message: string;
  readonly blocks: string;
}

export interface ManualReviewPreviewPayloadBoundaryGuard8X {
  readonly guardId: string;
  readonly label: string;
  readonly blocks: string;
  readonly activeIn8X: true;
}

export interface ManualReviewPreviewPayloadReadinessSummary8X {
  readonly payloadContractStatus: ManualReviewPreviewPayloadContractState8X;
  readonly reason: string;
  readonly readyFor: readonly string[];
  readonly stillBlocked: readonly string[];
}

export interface ManualReviewPreviewPayloadContract8X {
  readonly contractId: string;
  readonly payloadVersion: "8X";
  readonly payloadContractMode: ManualReviewPreviewPayloadContractMode8X;
  readonly payloadContractStatus: "documented_but_not_instantiated";
  readonly payloadSource: ManualReviewPreviewPayloadSource8X;
  readonly payloadScope: ManualReviewPreviewPayloadScope8X;
  readonly payloadOfficialTruth: false;
  readonly payloadPersistence: ManualReviewPreviewPayloadPersistence8X;
  readonly payloadApplication: ManualReviewPreviewPayloadApplication8X;
  readonly sourceObservationPlanVersion: "8U";
  readonly sourceFieldContractVersion: "8V";
  readonly sourceActivationGuardVersion: "8W";
  readonly allowedTopLevelFields: readonly ManualReviewPreviewPayloadSchemaField8X[];
  readonly forbiddenTopLevelFields: readonly string[];
  readonly fieldGroups: readonly ManualReviewPreviewPayloadFieldGroup8X[];
  readonly observationEntries: readonly ManualReviewPreviewPayloadObservationEntry8X[];
  readonly validationRules: readonly ManualReviewPreviewPayloadValidationRule8X[];
  readonly errorStates: readonly ManualReviewPreviewPayloadErrorState8X[];
  readonly refusalStates: readonly ManualReviewPreviewPayloadRefusalState8X[];
  readonly boundaryGuards: readonly ManualReviewPreviewPayloadBoundaryGuard8X[];
  readonly readinessSummary: ManualReviewPreviewPayloadReadinessSummary8X;
  readonly visibleInProduct: true;
  readonly visibleInExport: true;
}

export interface ManualReviewPreviewPayloadContractAudit8X {
  readonly productVisible: boolean;
  readonly exportVisible: boolean;
  readonly usesActivationGuards8W: boolean;
  readonly usesFieldVisualReadiness8V: boolean;
  readonly usesInputFieldContract8U: boolean;
  readonly schemaDefined: boolean;
  readonly allowedTopLevelFieldCount: number;
  readonly forbiddenTopLevelFieldCount: number;
  readonly fieldGroupCount: number;
  readonly observationEntryCount: number;
  readonly validationRuleCount: number;
  readonly activeValidationRuleCount: number;
  readonly errorStateCount: number;
  readonly activeErrorStateCount: number;
  readonly refusalStateCount: number;
  readonly boundaryGuardCount: number;
  readonly payloadContractStatusCorrect: boolean;
  readonly payloadCreated: boolean;
  readonly realPayloadInstanceCount: number;
  readonly fieldToPayloadRuntimeDetected: boolean;
  readonly payloadValidationRuntimeDetected: boolean;
  readonly realInputActivated: boolean;
  readonly activeFieldCount: number;
  readonly enabledInputControlCount: number;
  readonly realPreviewGenerated: boolean;
  readonly submitCreated: boolean;
  readonly apiCreated: boolean;
  readonly backendCreated: boolean;
  readonly storageCreated: boolean;
  readonly memoryCreated: boolean;
  readonly draftCreated: boolean;
  readonly historyCreated: boolean;
  readonly officialTruthPromoted: boolean;
  readonly automaticDecisionCreated: boolean;
  readonly realNextMatchClaimCount: number;
  readonly engineLearningClaimCount: number;
  readonly seasonTrendClaimCount: number;
  readonly selectionDriven: boolean;
  readonly tacticalInstructionDriven: boolean;
  readonly scoreMutationCount: number;
  readonly timelineMutationCount: number;
  readonly eventMutationCount: number;
  readonly scoreChangeMutationCount: number;
  readonly scoreClaimWithoutScoreChangeCount: number;
  readonly penaltyShotLeakageCount: number;
  readonly unknownScoringFamilyCount: number;
  readonly warningCodes: readonly ManualReviewPreviewPayloadContractWarningCode8X[];
}

export interface ManualReviewPreviewPayloadContractExportAudit8X {
  readonly exportReadTimeSecondsBefore8X: number;
  readonly exportReadTimeSecondsAfter8X: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly exportTitleMentions8X: boolean;
  readonly exportVisibleBadgeMentions8X: boolean;
  readonly exportMainCurrentVersionVisible: boolean;
  readonly exportMainIdStillCompressedExport8W: boolean;
  readonly exportMainIdStillCompressedExport8V: boolean;
  readonly exportMainIdStillCompressedExport8U: boolean;
  readonly exportMainIdStillCompressedExport8T: boolean;
  readonly exportMainIdStillCompressedExport8S: boolean;
  readonly exportMainIdStillCompressedExport8R: boolean;
  readonly exportMainIdStillCompressedExport8Q: boolean;
  readonly exportMainIdStillCompressedExport8P: boolean;
  readonly exportMainIdStillCompressedExport8N: boolean;
  readonly exportMainIdStillCompressedExport8I: boolean;
  readonly warningCodes: readonly ManualReviewPreviewPayloadContractWarningCode8X[];
}

export interface ManualReviewPreviewPayloadContractWithoutPersistence8XModel {
  readonly status: ManualReviewPreviewPayloadContractStatus8X;
  readonly scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_CONTRACT_WITHOUT_PERSISTENCE";
  readonly version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_CONTRACT_WITHOUT_PERSISTENCE_8X";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8W: ManualReviewNonPersistentPreviewActivationGuards8WModel;
  readonly baseline8WPreserved: boolean;
  readonly baseline8VPreserved: boolean;
  readonly baseline8UPreserved: boolean;
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
  readonly previewPayloadContractReady: boolean;
  readonly productPreviewPayloadContractVisible: boolean;
  readonly exportPreviewPayloadContractVisible: boolean;
  readonly previewPayloadContractUsesActivationGuards8W: boolean;
  readonly previewPayloadContractUsesFieldVisualReadiness8V: boolean;
  readonly previewPayloadContractUsesInputFieldContract8U: boolean;
  readonly payloadContractMode: ManualReviewPreviewPayloadContractMode8X;
  readonly payloadContractStatus: "documented_but_not_instantiated";
  readonly payloadSource: ManualReviewPreviewPayloadSource8X;
  readonly payloadScope: ManualReviewPreviewPayloadScope8X;
  readonly payloadOfficialTruth: false;
  readonly payloadPersistence: ManualReviewPreviewPayloadPersistence8X;
  readonly payloadApplication: ManualReviewPreviewPayloadApplication8X;
  readonly allowedTopLevelFieldCount: number;
  readonly allowedTopLevelFieldCountExpected: 12;
  readonly forbiddenTopLevelFieldCount: number;
  readonly forbiddenTopLevelFieldCountExpected: 16;
  readonly fieldGroupCount: number;
  readonly fieldGroupCountExpected: 5;
  readonly observationEntryCount: number;
  readonly observationEntryCountExpected: 3;
  readonly validationRuleCount: number;
  readonly validationRuleCountExpected: 20;
  readonly activeValidationRuleCount: number;
  readonly errorStateCount: number;
  readonly errorStateCountExpected: 19;
  readonly activeErrorStateCount: number;
  readonly refusalStateCount: number;
  readonly refusalStateCountExpected: 7;
  readonly boundaryGuardCount: number;
  readonly boundaryGuardCountExpected: 14;
  readonly payloadCreated: boolean;
  readonly realPayloadInstanceCount: number;
  readonly fieldToPayloadRuntimeDetected: boolean;
  readonly payloadValidationRuntimeDetected: boolean;
  readonly realInputActivated: boolean;
  readonly activeFieldCount: number;
  readonly enabledInputControlCount: number;
  readonly realPreviewGenerated: boolean;
  readonly submitCreated: boolean;
  readonly apiCreated: boolean;
  readonly backendCreated: boolean;
  readonly storageCreated: boolean;
  readonly memoryCreated: boolean;
  readonly draftCreated: boolean;
  readonly historyCreated: boolean;
  readonly officialTruthPromoted: boolean;
  readonly automaticDecisionCreated: boolean;
  readonly selectionDriven: boolean;
  readonly tacticalInstructionDriven: boolean;
  readonly scoreMutationCount: number;
  readonly timelineMutationCount: number;
  readonly eventMutationCount: number;
  readonly scoreChangeMutationCount: number;
  readonly workflowReadinessStatusFrom8R: "ready_for_non_persistent_preview";
  readonly reviewGateStatusFrom8Q: "needs_completion";
  readonly previewActivationStatusFrom8W: "documented_but_blocked";
  readonly fieldVisualReadinessStatusFrom8V: "ready_for_static_visual_review";
  readonly productStoryFirstPreserved: boolean;
  readonly exportCompactPreserved: boolean;
  readonly exportMetadataCurrent8XVisible: boolean;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly numericThresholdGuardPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly contract: ManualReviewPreviewPayloadContract8X;
  readonly productPreviewPayloadContractHtml: string;
  readonly exportPreviewPayloadContractHtml: string;
  readonly productHtmlAfter8X: string;
  readonly exportHtmlAfter8X: string;
  readonly payloadAudit: ManualReviewPreviewPayloadContractAudit8X;
  readonly exportAudit: ManualReviewPreviewPayloadContractExportAudit8X;
  readonly warningCodes: readonly ManualReviewPreviewPayloadContractWarningCode8X[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

import type { ManualReviewFieldUxVisualReadinessWithoutPersistence8VModel } from "./manualReviewFieldUxVisualReadinessTypes8V";
import type { ManualReviewPreviewActivationGuardsWarningCode8W } from "./manualReviewPreviewActivationGuardsWarnings8W";

export type ManualReviewPreviewActivationGuardsStatus8W = "PASS" | "PARTIAL" | "FAIL";
export type ManualReviewPreviewActivationStatus8W = "documented_but_blocked" | "partial" | "blocked";
export type ManualReviewPreviewActivationGuardSeverity8W = "info" | "warning" | "blocking";
export type ManualReviewPreviewActivationConditionAppliesTo8W =
  | "fields"
  | "validation"
  | "payload"
  | "preview"
  | "source_of_truth"
  | "non_persistence"
  | "permissions"
  | "accessibility"
  | "error_recovery";
export type ManualReviewPreviewActivationBlockedSurface8W =
  | "preview_activation"
  | "payload_creation"
  | "real_input_processing"
  | "input_processing"
  | "submit"
  | "api_call"
  | "backend_action"
  | "persistence"
  | "official_truth_promotion"
  | "automatic_decision"
  | "selection_automation"
  | "tactical_instruction"
  | "score_mutation"
  | "timeline_mutation"
  | "score_change_creation"
  | "event_mutation"
  | "preview_generation"
  | "season_memory_creation"
  | "team_style_memory_creation"
  | "automatic_real_match_classification"
  | "real_next_match_claim"
  | "engine_learning_claim"
  | "season_trend_claim"
  | "sandbox_promotion"
  | "diagnostic_promotion"
  | "batch_promotion";

export interface ManualReviewPreviewActivationCondition8W {
  readonly conditionId: string;
  readonly label: string;
  readonly description: string;
  readonly appliesTo: ManualReviewPreviewActivationConditionAppliesTo8W;
  readonly requiredBeforeActivation: true;
  readonly satisfiedIn8W: boolean;
  readonly mustBeTrueBeforeFutureActivation: string;
  readonly blockedReasonIn8W: string;
  readonly failureWarningCode: ManualReviewPreviewActivationGuardsWarningCode8W;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewPreviewBlockingGuard8W {
  readonly blockingGuardId: string;
  readonly label: string;
  readonly trigger: string;
  readonly blocks: readonly ManualReviewPreviewActivationBlockedSurface8W[];
  readonly severity: ManualReviewPreviewActivationGuardSeverity8W;
  readonly coachFacingMessage: string;
  readonly technicalMessage: string;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewPreviewActivationRefusalState8W {
  readonly refusalStateId: string;
  readonly triggeredBy: string;
  readonly title: string;
  readonly coachFacingMessage: string;
  readonly technicalReason: string;
  readonly requiredFutureDecision: string;
  readonly severity: ManualReviewPreviewActivationGuardSeverity8W;
  readonly prevents: readonly ManualReviewPreviewActivationBlockedSurface8W[];
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewPreviewActivationReadinessSummary8W {
  readonly summaryId: string;
  readonly previewActivationStatus: ManualReviewPreviewActivationStatus8W;
  readonly expectedPreviewActivationStatus: "documented_but_blocked";
  readonly statusReason: string;
  readonly activationConditionCount: number;
  readonly satisfiedActivationConditionCount: number;
  readonly unsatisfiedActivationConditionCount: number;
  readonly blockingGuardCount: number;
  readonly refusalStateCount: number;
  readonly whatIsReady: readonly string[];
  readonly whatIsBlocked: readonly string[];
  readonly whatFutureSprintCanDo: readonly string[];
  readonly coachFacingReadout: string;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewPreviewOnlyBoundary8W {
  readonly boundaryId: string;
  readonly label: string;
  readonly text: string;
  readonly futureAllowedOnlyIf: readonly string[];
  readonly alwaysForbiddenIn8W: readonly string[];
  readonly prevents: readonly ManualReviewPreviewActivationBlockedSurface8W[];
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewPreviewActivationGuard8W {
  readonly guardId: string;
  readonly guardMode: "future_preview_activation_guard_only";
  readonly sourceFieldVisualReadinessVersion: "8V";
  readonly sourceInputFieldContractVersion: "8U";
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
  readonly activationConditions: readonly ManualReviewPreviewActivationCondition8W[];
  readonly blockingGuards: readonly ManualReviewPreviewBlockingGuard8W[];
  readonly refusalStates: readonly ManualReviewPreviewActivationRefusalState8W[];
  readonly activationReadinessSummary: ManualReviewPreviewActivationReadinessSummary8W;
  readonly futurePreviewOnlyBoundary: ManualReviewPreviewOnlyBoundary8W;
  readonly deferredDecisions: readonly string[];
  readonly isRealCoachSubmission: false;
  readonly isOfficialMatchEvidence: false;
  readonly notPersisted: true;
  readonly notApplied: true;
  readonly officialTruth: false;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewPreviewActivationGuardsAudit8W {
  readonly productVisible: boolean;
  readonly exportVisible: boolean;
  readonly usesFieldVisualReadiness8V: boolean;
  readonly usesInputFieldContract8U: boolean;
  readonly activationConditionCount: number;
  readonly satisfiedActivationConditionCount: number;
  readonly unsatisfiedActivationConditionCount: number;
  readonly blockingGuardCount: number;
  readonly refusalStateCount: number;
  readonly previewActivationStatusCorrect: boolean;
  readonly nonPersistentPreviewModeDefined: boolean;
  readonly nonPersistentPreviewModeActivated: false;
  readonly realInputActivated: false;
  readonly payloadCreated: false;
  readonly realPreviewGenerated: false;
  readonly microWordingDebt8VFixed: boolean;
  readonly export8VWorkflowLabelCorrected: boolean;
  readonly export8SLabelStillSkeletonOnly: boolean;
  readonly fieldVisualDistinctFromPreviewActivation: boolean;
  readonly readinessDistinctFromReviewGateStillVisible: boolean;
  readonly warningCodes: readonly ManualReviewPreviewActivationGuardsWarningCode8W[];
}

export interface ManualReviewPreviewActivationExportAudit8W {
  readonly exportReadTimeSecondsBefore8W: number;
  readonly exportReadTimeSecondsAfter8W: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly exportTitleMentions8W: boolean;
  readonly exportVisibleBadgeMentions8W: boolean;
  readonly exportMainCurrentVersionVisible: boolean;
  readonly exportMainIdStillCompressedExport8V: boolean;
  readonly exportMainIdStillCompressedExport8U: boolean;
  readonly exportMainIdStillCompressedExport8T: boolean;
  readonly exportMainIdStillCompressedExport8S: boolean;
  readonly exportMainIdStillCompressedExport8R: boolean;
  readonly exportMainIdStillCompressedExport8Q: boolean;
  readonly exportMainIdStillCompressedExport8P: boolean;
  readonly exportMainIdStillCompressedExport8N: boolean;
  readonly exportMainIdStillCompressedExport8I: boolean;
  readonly exportPrintReady: boolean;
  readonly exportNoHorizontalOverflow: boolean;
  readonly warningCodes: readonly ManualReviewPreviewActivationGuardsWarningCode8W[];
}

export interface ManualReviewNonPersistentPreviewActivationGuards8WModel {
  readonly status: ManualReviewPreviewActivationGuardsStatus8W;
  readonly scope: "MANUAL_REVIEW_NON_PERSISTENT_PREVIEW_ACTIVATION_GUARDS";
  readonly version: "MANUAL_REVIEW_NON_PERSISTENT_PREVIEW_ACTIVATION_GUARDS_8W";
  readonly baselineVersion: "MANUAL_REVIEW_FIELD_UX_VISUAL_READINESS_8V";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8V: ManualReviewFieldUxVisualReadinessWithoutPersistence8VModel;
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
  readonly previewActivationGuardReady: boolean;
  readonly productPreviewActivationGuardVisible: boolean;
  readonly exportPreviewActivationGuardVisible: boolean;
  readonly previewActivationUsesFieldVisualReadiness8V: boolean;
  readonly previewActivationUsesInputFieldContract8U: boolean;
  readonly activationConditionCount: number;
  readonly activationConditionCountExpected: 20;
  readonly satisfiedActivationConditionCount: number;
  readonly unsatisfiedActivationConditionCount: number;
  readonly blockingGuardCount: number;
  readonly blockingGuardCountExpected: 12;
  readonly refusalStateCount: number;
  readonly refusalStateCountExpected: 6;
  readonly previewActivationStatus: ManualReviewPreviewActivationStatus8W;
  readonly expectedPreviewActivationStatus: "documented_but_blocked";
  readonly previewActivationStatusCorrect: boolean;
  readonly nonPersistentPreviewModeDefined: boolean;
  readonly nonPersistentPreviewModeActivated: false;
  readonly realInputActivated: false;
  readonly payloadCreated: false;
  readonly realPreviewGenerated: false;
  readonly submitCreated: false;
  readonly apiCreated: false;
  readonly backendCreated: false;
  readonly storageCreated: false;
  readonly memoryCreated: false;
  readonly officialTruthPromoted: false;
  readonly automaticDecisionCreated: false;
  readonly selectionDriven: false;
  readonly tacticalInstructionDriven: false;
  readonly workflowReadinessStatusFrom8R: "ready_for_non_persistent_preview";
  readonly reviewGateStatusFrom8Q: "needs_completion";
  readonly readinessDistinctFromReviewGateStillVisible: boolean;
  readonly fieldVisualReadinessStatusFrom8V: "ready_for_static_visual_review";
  readonly fieldVisualDistinctFromPreviewActivation: boolean;
  readonly microWordingDebt8VFixed: boolean;
  readonly export8VWorkflowLabelCorrected: boolean;
  readonly export8SLabelStillSkeletonOnly: boolean;
  readonly productStoryFirstPreserved: boolean;
  readonly exportCompactPreserved: boolean;
  readonly exportMetadataCurrent8WVisible: boolean;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly numericThresholdGuardPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly guard: ManualReviewPreviewActivationGuard8W;
  readonly productPreviewActivationGuardHtml: string;
  readonly exportPreviewActivationGuardHtml: string;
  readonly productHtmlAfter8W: string;
  readonly exportHtmlAfter8W: string;
  readonly activationAudit: ManualReviewPreviewActivationGuardsAudit8W;
  readonly safetyAudit: ManualReviewFieldUxVisualReadinessWithoutPersistence8VModel["safetyAudit"];
  readonly exportAudit: ManualReviewPreviewActivationExportAudit8W;
  readonly warningCodes: readonly ManualReviewPreviewActivationGuardsWarningCode8W[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

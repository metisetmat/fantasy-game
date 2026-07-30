import type { ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel } from "./manualReviewWorkflowUxSkeletonTypes8S";
import type { ManualReviewUxInteractionContractWarningCode8T } from "./manualReviewUxInteractionContractWarnings8T";

export type ManualReviewUxInteractionContractStatus8T = "PASS" | "PARTIAL" | "FAIL";
export type ManualReviewUxInteractionStepSourceVersion8T = "8M" | "8N" | "8O" | "8P" | "8Q" | "8R";
export type ManualReviewUxInteractionFutureIntent8T =
  | "real_manual_review_input"
  | "validate_manual_review_payload"
  | "render_preview_from_valid_input"
  | "compare_preview_to_observation_plan"
  | "compute_readability_gate"
  | "persist_or_history_review";
export type ManualReviewUxInteractionTreatment8T = "disabled_control" | "read_only_panel" | "placeholder_copy";
export type ManualReviewUxRefusalSeverity8T = "info" | "warning" | "blocking";

export interface ManualReviewUxInteractionStep8T {
  readonly stepContractId: string;
  readonly sourceUxStepId8S: string;
  readonly sourceVersion: ManualReviewUxInteractionStepSourceVersion8T;
  readonly stepOrder: number;
  readonly coachFacingLabel: string;
  readonly current8SState: string;
  readonly allowedFutureIntent: ManualReviewUxInteractionFutureIntent8T;
  readonly blockedIn8T: true;
  readonly blockedReason: string;
  readonly activationRequires: readonly string[];
  readonly refusalStateId: string;
  readonly canBeActivatedIn8T: false;
  readonly canSubmitIn8T: false;
  readonly canPersistIn8T: false;
  readonly canCallApiIn8T: false;
  readonly canPromoteOfficialTruthIn8T: false;
  readonly canDriveSelectionIn8T: false;
  readonly canDriveTacticalInstructionIn8T: false;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewUxFutureInteraction8T {
  readonly interactionId: string;
  readonly label: string;
  readonly sourceStepVersion: ManualReviewUxInteractionStepSourceVersion8T;
  readonly futureIntent: ManualReviewUxInteractionFutureIntent8T;
  readonly statusIn8T: "documented_but_blocked";
  readonly currentUiTreatment: ManualReviewUxInteractionTreatment8T;
  readonly blockedReason: string;
  readonly requiredBeforeActivation: readonly string[];
  readonly allowedLaterOnlyIf: readonly string[];
  readonly mustNeverDo: readonly string[];
  readonly refusalStateId: string;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewUxRefusalState8T {
  readonly refusalStateId: string;
  readonly triggeredByInteractionId: string;
  readonly title: string;
  readonly coachFacingMessage: string;
  readonly technicalReason: string;
  readonly requiredFutureDecision: string;
  readonly severity: ManualReviewUxRefusalSeverity8T;
  readonly prevents: readonly string[];
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewUxActivationRequirement8T {
  readonly requirementId: string;
  readonly label: string;
  readonly appliesToInteractionIds: readonly string[];
  readonly requiredBeforeActivation: true;
  readonly satisfiedIn8T: false;
  readonly futureSprintCandidate: string;
  readonly rationale: string;
  readonly boundaryProtected: string;
}

export interface ManualReviewUxInteractionBoundary8T {
  readonly boundaryId: string;
  readonly label: string;
  readonly text: string;
  readonly prevents: readonly string[];
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewUxInteractionContract8T {
  readonly contractId: string;
  readonly contractMode: "future_interaction_contract_only";
  readonly sourceUxSkeletonVersion: "8S";
  readonly sourceWorkflowReadinessVersion: "8R";
  readonly sourceDecisionGateVersion: "8Q";
  readonly sourceComparisonVersion: "8P";
  readonly sourcePreviewVersion: "8O";
  readonly sourceIntakeBoundaryVersion: "8N";
  readonly sourceManualFormVersion: "8M";
  readonly sourceLearningLoopVersion: "8L";
  readonly sourceDecisionLayerVersion: "8K";
  readonly interactionSteps: readonly ManualReviewUxInteractionStep8T[];
  readonly futureInteractions: readonly ManualReviewUxFutureInteraction8T[];
  readonly refusalStates: readonly ManualReviewUxRefusalState8T[];
  readonly activationRequirements: readonly ManualReviewUxActivationRequirement8T[];
  readonly deferredDecisions: readonly string[];
  readonly boundaries: readonly ManualReviewUxInteractionBoundary8T[];
  readonly isRealCoachSubmission: false;
  readonly isOfficialMatchEvidence: false;
  readonly notPersisted: true;
  readonly notApplied: true;
  readonly officialTruth: false;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewUxInteractionContractAudit8T {
  readonly interactionContractVisible: boolean;
  readonly productInteractionContractVisible: boolean;
  readonly exportInteractionContractVisible: boolean;
  readonly interactionContractUsesUxSkeleton8S: boolean;
  readonly interactionContractStepCount: number;
  readonly interactionContractStepCountExpected: 6;
  readonly futureInteractionCount: number;
  readonly futureInteractionCountExpected: 6;
  readonly blockedInteractionCount: number;
  readonly blockedInteractionCountExpected: 6;
  readonly enabledInteractionCount: number;
  readonly refusalStateCount: number;
  readonly refusalStateCountExpected: 6;
  readonly activationRequirementCount: number;
  readonly interactionActivationRequirementVisible: boolean;
  readonly storageDecisionDeferredVisible: boolean;
  readonly permissionsDecisionDeferredVisible: boolean;
  readonly officializationDecisionDeferredVisible: boolean;
  readonly interactionContractWarningCodes: readonly ManualReviewUxInteractionContractWarningCode8T[];
  readonly recommendation: string;
}

export interface ManualReviewUxInteractionDisabledStateAudit8T {
  readonly documentedButBlockedInteractionCount: number;
  readonly enabledCtaCount: number;
  readonly submitButtonCount: number;
  readonly enabledSubmitButtonCount: number;
  readonly backendActionCount: number;
  readonly apiCallCount: number;
  readonly interactiveControlCount: number;
  readonly clickableSubmitLikeTextCount: number;
  readonly disabledInteractionLabelsVisible: boolean;
  readonly disabledReasonsVisible: boolean;
  readonly futureRequirementsVisible: boolean;
  readonly disabledStateWarningCodes: readonly ManualReviewUxInteractionContractWarningCode8T[];
  readonly recommendation: string;
}

export interface ManualReviewUxInteractionNonPersistenceAudit8T {
  readonly localStoragePersistenceCount: number;
  readonly databasePersistenceCount: number;
  readonly filePersistenceCount: number;
  readonly backendSubmitActionCount: number;
  readonly formSubmitButtonCount: number;
  readonly apiCallCount: number;
  readonly memoryCreationCount: number;
  readonly seasonMemoryCreationCount: number;
  readonly teamStyleMemoryCreationCount: number;
  readonly interactionPersistencePerformed: boolean;
  readonly interactionApplicationPerformed: boolean;
  readonly storageDecisionImplementedCount: number;
  readonly nonPersistenceWarningCodes: readonly ManualReviewUxInteractionContractWarningCode8T[];
  readonly recommendation: string;
}

export interface ManualReviewUxInteractionBoundaryAudit8T {
  readonly officialTruthPromotionCount: number;
  readonly coachInputPromotedToOfficialTruthCount: number;
  readonly interactionClaimedAsRealNextMatchCount: number;
  readonly interactionClaimedAsEngineResultCount: number;
  readonly interactionClaimedAsSeasonTrendCount: number;
  readonly interactionClaimedAsTeamMemoryCount: number;
  readonly automaticDecisionCount: number;
  readonly automaticClassificationRealMatchCount: number;
  readonly selectionRecommendationCount: number;
  readonly tacticalInstructionCount: number;
  readonly sandboxPromotionCount: number;
  readonly diagnosticPromotionCount: number;
  readonly batchPromotionCount: number;
  readonly boundaryWarningCodes: readonly ManualReviewUxInteractionContractWarningCode8T[];
  readonly recommendation: string;
}

export interface ManualReviewUxInteractionSourceOfTruthRegressionAudit8T {
  readonly reportUsesOfficialTimelineOnlyForOfficialStory: boolean;
  readonly reportUsesOfficialScoreOnlyForOfficialScore: boolean;
  readonly reportScoreMatchesOfficialScore: boolean;
  readonly allStoryScoreClaimsBackedByScoreChange: boolean;
  readonly allReplayScoreClaimsBackedByScoreChange: boolean;
  readonly manualInteractionDoesNotClaimNewScoreEvidence: boolean;
  readonly manualInteractionDoesNotCreateFutureEvidence: boolean;
  readonly manualInteractionDoesNotMutateTimeline: boolean;
  readonly manualInteractionDoesNotMutateScore: boolean;
  readonly manualInteractionDoesNotCreateScoreChange: boolean;
  readonly manualInteractionDoesNotPromoteCoachInputToOfficialTruth: boolean;
  readonly noScoreMutation: boolean;
  readonly noEventDeletion: boolean;
  readonly noScoringConstantChange: boolean;
  readonly MatchBonusEventUnchanged: boolean;
  readonly batchLiveSeparationPreserved: boolean;
  readonly sourceOfTruthWarningCodes: readonly ManualReviewUxInteractionContractWarningCode8T[];
  readonly recommendation: string;
}

export interface ManualReviewUxInteractionExportMetadataAudit8T {
  readonly exportTitleMentions8T: boolean;
  readonly exportMainCurrentVersionVisible: boolean;
  readonly exportVisibleBadgeMentions8T: boolean;
  readonly exportMainIdStillCompressedExport8S: boolean;
  readonly exportMainIdStillCompressedExport8R: boolean;
  readonly exportMainIdStillCompressedExport8Q: boolean;
  readonly exportMainIdStillCompressedExport8P: boolean;
  readonly exportMainIdStillCompressedExport8N: boolean;
  readonly exportMainIdStillCompressedExport8I: boolean;
  readonly exportHistoricalMarkersPreservedAsDataAttributes: boolean;
  readonly metadataWarningCodes: readonly ManualReviewUxInteractionContractWarningCode8T[];
  readonly recommendation: string;
}

export interface ManualReviewUxInteractionExportBudgetAudit8T {
  readonly exportReadTimeSecondsBefore8T: number;
  readonly exportReadTimeSecondsAfter8T: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly exportInteractionContractVisible: boolean;
  readonly exportMandatorySectionsPreserved: boolean;
  readonly exportNoFullTimeline: boolean;
  readonly exportNoSandboxPanel: boolean;
  readonly exportNoLongBatchDiagnostics: boolean;
  readonly exportMetadataClean: boolean;
  readonly exportBudgetWarningCodes: readonly ManualReviewUxInteractionContractWarningCode8T[];
  readonly recommendation: string;
}

export interface ManualReviewUxInteractionIntegrationBudgetAudit8T {
  readonly productInteractionContractVisible: boolean;
  readonly exportInteractionContractVisible: boolean;
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
  readonly productReplaySectionVisible: boolean;
  readonly exportReplaySectionVisible: boolean;
  readonly productActionPlanVisible: boolean;
  readonly exportActionPlanVisible: boolean;
  readonly tacticalMapCardsStillVisible: boolean;
  readonly sourceOfTruthNoteVisible: boolean;
  readonly productSectionOrderPreserved: boolean;
  readonly exportCompactPreserved: boolean;
  readonly integrationWarningCodes: readonly ManualReviewUxInteractionContractWarningCode8T[];
  readonly recommendation: string;
}

export interface ManualReviewUxInteractionWordingAudit8T {
  readonly interactionContractFutureOnlyWordingVisible: boolean;
  readonly interactionContractNonInteractiveWordingVisible: boolean;
  readonly interactionContractNonOfficialWordingVisible: boolean;
  readonly interactionContractNotPersistedWordingVisible: boolean;
  readonly interactionContractNotAppliedWordingVisible: boolean;
  readonly refusalStateWordingVisible: boolean;
  readonly deferredDecisionWordingVisible: boolean;
  readonly workflowReadinessDistinctFromReviewGateWordingVisible: boolean;
  readonly noRealNextMatchClaimCount: number;
  readonly noOfficialResultClaimCount: number;
  readonly noEngineLearningClaimCount: number;
  readonly noSeasonTrendClaimCount: number;
  readonly noAutomaticDecisionClaimCount: number;
  readonly noSelectionInstructionCount: number;
  readonly noTacticalInstructionCount: number;
  readonly noStorageReadyClaimCount: number;
  readonly noSubmitReadyClaimCount: number;
  readonly ambiguousInteractionWordingCount: number;
  readonly wordingReadabilityScore: number;
  readonly wordingWarningCodes: readonly ManualReviewUxInteractionContractWarningCode8T[];
  readonly recommendation: string;
}

export interface ManualReviewUxInteractionContractWithoutPersistence8TModel {
  readonly status: ManualReviewUxInteractionContractStatus8T;
  readonly scope: "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_WITHOUT_PERSISTENCE";
  readonly version: "MANUAL_REVIEW_UX_INTERACTION_CONTRACT_8T";
  readonly baselineVersion: "MANUAL_REVIEW_WORKFLOW_UX_SKELETON_8S";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8S: ManualReviewWorkflowUxSkeletonWithoutPersistence8SModel;
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
  readonly interactionContractReady: boolean;
  readonly productInteractionContractVisible: boolean;
  readonly exportInteractionContractVisible: boolean;
  readonly interactionContractUsesUxSkeleton8S: boolean;
  readonly interactionContractStepCount: number;
  readonly interactionContractStepCountExpected: 6;
  readonly futureInteractionCount: number;
  readonly futureInteractionCountExpected: 6;
  readonly blockedInteractionCount: number;
  readonly blockedInteractionCountExpected: 6;
  readonly enabledInteractionCount: number;
  readonly interactionPreconditionCount: number;
  readonly refusalStateCount: number;
  readonly refusalStateCountExpected: 6;
  readonly interactionActivationRequirementVisible: boolean;
  readonly storageDecisionDeferredVisible: boolean;
  readonly permissionsDecisionDeferredVisible: boolean;
  readonly officializationDecisionDeferredVisible: boolean;
  readonly workflowReadinessStatusFrom8S: "ready_for_non_persistent_preview";
  readonly reviewGateStatusFrom8Q: "needs_completion";
  readonly readinessDistinctFromReviewGateStillVisible: boolean;
  readonly contractMarkedFutureOnly: boolean;
  readonly contractMarkedNonInteractive: boolean;
  readonly contractMarkedNonOfficial: boolean;
  readonly contractMarkedNotPersisted: boolean;
  readonly contractMarkedNotApplied: boolean;
  readonly contractDoesNotCreateSubmit: boolean;
  readonly contractDoesNotCreateApi: boolean;
  readonly contractDoesNotCreateBackend: boolean;
  readonly contractDoesNotCreateStorage: boolean;
  readonly contractDoesNotCreateMemory: boolean;
  readonly contractDoesNotPromoteOfficialTruth: boolean;
  readonly contractDoesNotCreateAutomaticDecision: boolean;
  readonly contractDoesNotDriveSelection: boolean;
  readonly contractDoesNotDriveTacticalInstruction: boolean;
  readonly productStoryFirstPreserved: boolean;
  readonly exportCompactPreserved: boolean;
  readonly exportMetadataCurrent8TVisible: boolean;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly numericThresholdGuardPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly contract: ManualReviewUxInteractionContract8T;
  readonly productInteractionContractHtml: string;
  readonly exportInteractionContractHtml: string;
  readonly productHtmlAfter8T: string;
  readonly exportHtmlAfter8T: string;
  readonly contractAudit: ManualReviewUxInteractionContractAudit8T;
  readonly disabledStateAudit: ManualReviewUxInteractionDisabledStateAudit8T;
  readonly nonPersistenceAudit: ManualReviewUxInteractionNonPersistenceAudit8T;
  readonly boundaryAudit: ManualReviewUxInteractionBoundaryAudit8T;
  readonly sourceOfTruthRegressionAudit: ManualReviewUxInteractionSourceOfTruthRegressionAudit8T;
  readonly exportMetadataAudit: ManualReviewUxInteractionExportMetadataAudit8T;
  readonly exportBudgetAudit: ManualReviewUxInteractionExportBudgetAudit8T;
  readonly integrationBudgetAudit: ManualReviewUxInteractionIntegrationBudgetAudit8T;
  readonly wordingAudit: ManualReviewUxInteractionWordingAudit8T;
  readonly warningCodes: readonly ManualReviewUxInteractionContractWarningCode8T[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

import type { ManualReviewPreviewDecisionGateWithoutPersistence8QModel } from "./manualReviewPreviewDecisionGateTypes8Q";
import type { ManualReviewWorkflowReadinessWarningCode8R } from "./manualReviewWorkflowReadinessWarnings8R";

export type ManualReviewWorkflowReadinessStatus8R = "ready_for_non_persistent_preview" | "partial" | "blocked";
export type ManualReviewWorkflowReviewGateStatus8R = "readable" | "needs_completion" | "insufficient";
export type ManualReviewWorkflowStageVersion8R = "8M" | "8N" | "8O" | "8P" | "8Q";

export interface ManualReviewWorkflowStage8R {
  readonly stageId: string;
  readonly stageOrder: number;
  readonly stageVersion: ManualReviewWorkflowStageVersion8R;
  readonly stageTitle: string;
  readonly stagePurpose: string;
  readonly input: string;
  readonly output: string;
  readonly ready: boolean;
  readonly linkedPreviousStageId?: string;
  readonly linkedNextStageId?: string;
  readonly guardrails: readonly string[];
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewWorkflowBoundary8R {
  readonly boundaryId: string;
  readonly label: string;
  readonly text: string;
  readonly prevents: readonly string[];
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewWorkflowReadinessSummary8R {
  readonly summaryId: string;
  readonly workflowReadinessStatus: ManualReviewWorkflowReadinessStatus8R;
  readonly reviewGateStatusFrom8Q: "needs_completion";
  readonly workflowStageCount: number;
  readonly readyStageCount: number;
  readonly blockedStageCount: number;
  readonly missingCriticalStageCount: number;
  readonly workflowCanBeDemoed: boolean;
  readonly workflowCanBeUsedForRealDecision: false;
  readonly workflowCanPersistReview: false;
  readonly workflowCanCreateOfficialTruth: false;
  readonly workflowCanDriveSelection: false;
  readonly workflowCanDriveTacticalInstruction: false;
  readonly coachFacingReadout: string;
  readonly whatIsReady: readonly string[];
  readonly whatStillNeedsWork: readonly string[];
  readonly nextQuestion: string;
}

export interface ManualReviewWorkflowReadiness8R {
  readonly workflowId: string;
  readonly workflowMode: "demo_preview_workflow_only";
  readonly sourceDecisionGateVersion: "8Q";
  readonly sourceComparisonVersion: "8P";
  readonly sourcePreviewVersion: "8O";
  readonly sourceIntakeBoundaryVersion: "8N";
  readonly sourceManualFormVersion: "8M";
  readonly sourceLearningLoopVersion: "8L";
  readonly sourceDecisionLayerVersion: "8K";
  readonly stages: readonly ManualReviewWorkflowStage8R[];
  readonly readinessSummary: ManualReviewWorkflowReadinessSummary8R;
  readonly missingInformation: readonly string[];
  readonly boundaries: readonly ManualReviewWorkflowBoundary8R[];
  readonly isRealCoachSubmission: false;
  readonly isOfficialMatchEvidence: false;
  readonly notPersisted: true;
  readonly notApplied: true;
  readonly officialTruth: false;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewWorkflowReadinessAudit8R {
  readonly workflowReadinessVisible: boolean;
  readonly productWorkflowReadinessVisible: boolean;
  readonly exportWorkflowReadinessVisible: boolean;
  readonly workflowStageCount: number;
  readonly workflowStageCountExpected: 5;
  readonly readyStageCount: number;
  readonly blockedStageCount: number;
  readonly missingCriticalStageCount: number;
  readonly workflowUsesManualForm8M: boolean;
  readonly workflowUsesIntakeBoundary8N: boolean;
  readonly workflowUsesPreviewRenderer8O: boolean;
  readonly workflowUsesPreviewComparison8P: boolean;
  readonly workflowUsesDecisionGate8Q: boolean;
  readonly workflowStagesLinkedCount: number;
  readonly workflowReadinessStatus: ManualReviewWorkflowReadinessStatus8R;
  readonly reviewGateStatusFrom8Q: ManualReviewWorkflowReviewGateStatus8R;
  readonly workflowReadinessDistinctFromReviewGate: boolean;
  readonly readinessWarningCodes: readonly ManualReviewWorkflowReadinessWarningCode8R[];
  readonly recommendation: string;
}

export interface ManualReviewWorkflowChainAudit8R {
  readonly stage8MPresent: boolean;
  readonly stage8NPresent: boolean;
  readonly stage8OPresent: boolean;
  readonly stage8PPresent: boolean;
  readonly stage8QPresent: boolean;
  readonly stage8MOutputFeeds8NInput: boolean;
  readonly stage8NOutputFeeds8OInput: boolean;
  readonly stage8OOutputFeeds8PInput: boolean;
  readonly stage8POutputFeeds8QInput: boolean;
  readonly stage8QOutputFeeds8RReadiness: boolean;
  readonly allStagesHavePurpose: boolean;
  readonly allStagesHaveInput: boolean;
  readonly allStagesHaveOutput: boolean;
  readonly allStagesHaveGuardrails: boolean;
  readonly chainWarningCodes: readonly ManualReviewWorkflowReadinessWarningCode8R[];
  readonly recommendation: string;
}

export interface ManualReviewWorkflowReadinessLogicAudit8R {
  readonly workflowReadinessStatus: ManualReviewWorkflowReadinessStatus8R;
  readonly workflowReadinessExpectedStatus: "ready_for_non_persistent_preview";
  readonly workflowReadinessStatusCorrect: boolean;
  readonly reviewGateStatusFrom8Q: ManualReviewWorkflowReviewGateStatus8R;
  readonly reviewGateStillNeedsCompletion: boolean;
  readonly workflowReadyDespiteIncompleteReview: boolean;
  readonly workflowDoesNotClaimReviewReadyForRealUse: boolean;
  readonly missingInformationVisible: boolean;
  readonly realUseBlockersVisible: boolean;
  readonly storageDecisionDeferredVisible: boolean;
  readonly logicWarningCodes: readonly ManualReviewWorkflowReadinessWarningCode8R[];
  readonly recommendation: string;
}

export interface ManualReviewWorkflowNonPersistenceAudit8R {
  readonly localStoragePersistenceCount: number;
  readonly databasePersistenceCount: number;
  readonly filePersistenceCount: number;
  readonly backendSubmitActionCount: number;
  readonly formSubmitButtonCount: number;
  readonly apiCallCount: number;
  readonly memoryCreationCount: number;
  readonly seasonMemoryCreationCount: number;
  readonly teamStyleMemoryCreationCount: number;
  readonly workflowPersistencePerformed: boolean;
  readonly workflowApplicationPerformed: boolean;
  readonly storageDecisionImplementedCount: number;
  readonly nonPersistenceWarningCodes: readonly ManualReviewWorkflowReadinessWarningCode8R[];
  readonly recommendation: string;
}

export interface ManualReviewWorkflowBoundaryAudit8R {
  readonly officialTruthPromotionCount: number;
  readonly coachInputPromotedToOfficialTruthCount: number;
  readonly workflowClaimedAsRealNextMatchCount: number;
  readonly workflowClaimedAsEngineResultCount: number;
  readonly workflowClaimedAsSeasonTrendCount: number;
  readonly workflowClaimedAsTeamMemoryCount: number;
  readonly automaticDecisionCount: number;
  readonly automaticClassificationRealMatchCount: number;
  readonly selectionRecommendationCount: number;
  readonly tacticalInstructionCount: number;
  readonly sandboxPromotionCount: number;
  readonly diagnosticPromotionCount: number;
  readonly batchPromotionCount: number;
  readonly boundaryWarningCodes: readonly ManualReviewWorkflowReadinessWarningCode8R[];
  readonly recommendation: string;
}

export interface ManualReviewWorkflowSourceOfTruthRegressionAudit8R {
  readonly reportUsesOfficialTimelineOnlyForOfficialStory: boolean;
  readonly reportUsesOfficialScoreOnlyForOfficialScore: boolean;
  readonly reportScoreMatchesOfficialScore: boolean;
  readonly allStoryScoreClaimsBackedByScoreChange: boolean;
  readonly allReplayScoreClaimsBackedByScoreChange: boolean;
  readonly manualWorkflowDoesNotClaimNewScoreEvidence: boolean;
  readonly manualWorkflowDoesNotCreateFutureEvidence: boolean;
  readonly manualWorkflowDoesNotMutateTimeline: boolean;
  readonly manualWorkflowDoesNotMutateScore: boolean;
  readonly manualWorkflowDoesNotCreateScoreChange: boolean;
  readonly manualWorkflowDoesNotPromoteCoachInputToOfficialTruth: boolean;
  readonly noScoreMutation: boolean;
  readonly noEventDeletion: boolean;
  readonly noScoringConstantChange: boolean;
  readonly MatchBonusEventUnchanged: boolean;
  readonly batchLiveSeparationPreserved: boolean;
  readonly sourceOfTruthWarningCodes: readonly ManualReviewWorkflowReadinessWarningCode8R[];
  readonly recommendation: string;
}

export interface ManualReviewWorkflowExportMetadataAudit8R {
  readonly exportTitleMentions8R: boolean;
  readonly exportMainCurrentVersionVisible: boolean;
  readonly exportVisibleBadgeMentions8R: boolean;
  readonly exportMainIdStillCompressedExport8Q: boolean;
  readonly exportMainIdStillCompressedExport8P: boolean;
  readonly exportMainIdStillCompressedExport8N: boolean;
  readonly exportMainIdStillCompressedExport8I: boolean;
  readonly export8PEyebrowCorrected: boolean;
  readonly export8QEyebrowPreserved: boolean;
  readonly exportHistoricalMarkersPreservedAsDataAttributes: boolean;
  readonly metadataWarningCodes: readonly ManualReviewWorkflowReadinessWarningCode8R[];
  readonly recommendation: string;
}

export interface ManualReviewWorkflowExportBudgetAudit8R {
  readonly exportReadTimeSecondsBefore8R: number;
  readonly exportReadTimeSecondsAfter8R: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly exportWorkflowReadinessVisible: boolean;
  readonly exportMandatorySectionsPreserved: boolean;
  readonly exportNoFullTimeline: boolean;
  readonly exportNoSandboxPanel: boolean;
  readonly exportNoLongBatchDiagnostics: boolean;
  readonly exportMetadataClean: boolean;
  readonly exportBudgetWarningCodes: readonly ManualReviewWorkflowReadinessWarningCode8R[];
  readonly recommendation: string;
}

export interface ManualReviewWorkflowIntegrationBudgetAudit8R {
  readonly productWorkflowReadinessVisible: boolean;
  readonly exportWorkflowReadinessVisible: boolean;
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
  readonly integrationWarningCodes: readonly ManualReviewWorkflowReadinessWarningCode8R[];
  readonly recommendation: string;
}

export interface ManualReviewWorkflowWordingAudit8R {
  readonly workflowDemoOnlyWordingVisible: boolean;
  readonly workflowNonOfficialWordingVisible: boolean;
  readonly workflowNotPersistedWordingVisible: boolean;
  readonly workflowNotAppliedWordingVisible: boolean;
  readonly workflowReadinessDistinctFromReviewGateWordingVisible: boolean;
  readonly noRealNextMatchClaimCount: number;
  readonly noOfficialResultClaimCount: number;
  readonly noEngineLearningClaimCount: number;
  readonly noSeasonTrendClaimCount: number;
  readonly noAutomaticDecisionClaimCount: number;
  readonly noSelectionInstructionCount: number;
  readonly noTacticalInstructionCount: number;
  readonly noStorageReadyClaimCount: number;
  readonly ambiguousWorkflowWordingCount: number;
  readonly wordingReadabilityScore: number;
  readonly wordingWarningCodes: readonly ManualReviewWorkflowReadinessWarningCode8R[];
  readonly recommendation: string;
}

export interface ManualReviewWorkflowReadinessWithoutPersistence8RModel {
  readonly status: "PASS" | "PARTIAL" | "FAIL";
  readonly scope: "MANUAL_REVIEW_WORKFLOW_READINESS_WITHOUT_PERSISTENCE";
  readonly version: "MANUAL_REVIEW_WORKFLOW_READINESS_8R";
  readonly baselineVersion: "MANUAL_REVIEW_PREVIEW_DECISION_GATE_8Q";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8Q: ManualReviewPreviewDecisionGateWithoutPersistence8QModel;
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
  readonly workflowReadinessReady: boolean;
  readonly productWorkflowReadinessVisible: boolean;
  readonly exportWorkflowReadinessVisible: boolean;
  readonly workflowStageCount: number;
  readonly workflowStageCountExpected: 5;
  readonly workflowStagesLinkedCount: number;
  readonly workflowUsesManualForm8M: boolean;
  readonly workflowUsesIntakeBoundary8N: boolean;
  readonly workflowUsesPreviewRenderer8O: boolean;
  readonly workflowUsesPreviewComparison8P: boolean;
  readonly workflowUsesDecisionGate8Q: boolean;
  readonly workflowReadinessStatus: ManualReviewWorkflowReadinessStatus8R;
  readonly reviewGateStatusFrom8Q: ManualReviewWorkflowReviewGateStatus8R;
  readonly workflowReadinessDistinctFromReviewGate: boolean;
  readonly globalGateStatusStillNeedsCompletion: boolean;
  readonly microWordingDebtFixed: boolean;
  readonly export8PEyebrowCorrected: boolean;
  readonly export8QEyebrowPreserved: boolean;
  readonly workflowMarkedDemoOnly: boolean;
  readonly workflowMarkedNonOfficial: boolean;
  readonly workflowMarkedNotPersisted: boolean;
  readonly workflowMarkedNotApplied: boolean;
  readonly workflowDoesNotCreateAutomaticDecision: boolean;
  readonly workflowDoesNotAutoClassifyRealMatch: boolean;
  readonly workflowDoesNotDriveSelection: boolean;
  readonly workflowDoesNotDriveTacticalInstruction: boolean;
  readonly workflowDoesNotCreateMemory: boolean;
  readonly workflowDoesNotPromoteOfficialTruth: boolean;
  readonly workflowDoesNotMutateScore: boolean;
  readonly workflowDoesNotMutateTimeline: boolean;
  readonly workflowDoesNotCreateScoreChange: boolean;
  readonly productStoryFirstPreserved: boolean;
  readonly exportCompactPreserved: boolean;
  readonly exportMetadataCurrent8RVisible: boolean;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly numericThresholdGuardPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly workflow: ManualReviewWorkflowReadiness8R;
  readonly productWorkflowReadinessHtml: string;
  readonly exportWorkflowReadinessHtml: string;
  readonly productHtmlAfter8R: string;
  readonly exportHtmlAfter8R: string;
  readonly readinessAudit: ManualReviewWorkflowReadinessAudit8R;
  readonly chainAudit: ManualReviewWorkflowChainAudit8R;
  readonly logicAudit: ManualReviewWorkflowReadinessLogicAudit8R;
  readonly nonPersistenceAudit: ManualReviewWorkflowNonPersistenceAudit8R;
  readonly boundaryAudit: ManualReviewWorkflowBoundaryAudit8R;
  readonly sourceOfTruthRegressionAudit: ManualReviewWorkflowSourceOfTruthRegressionAudit8R;
  readonly exportMetadataAudit: ManualReviewWorkflowExportMetadataAudit8R;
  readonly exportBudgetAudit: ManualReviewWorkflowExportBudgetAudit8R;
  readonly integrationBudgetAudit: ManualReviewWorkflowIntegrationBudgetAudit8R;
  readonly wordingAudit: ManualReviewWorkflowWordingAudit8R;
  readonly warningCodes: readonly ManualReviewWorkflowReadinessWarningCode8R[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

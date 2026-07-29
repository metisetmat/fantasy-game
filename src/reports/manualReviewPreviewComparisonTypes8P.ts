import type { ManualReviewPreviewComparisonWarningCode8P } from "./manualReviewPreviewComparisonWarnings8P";
import type { ManualReviewPreviewRenderer8OModel } from "./manualReviewPreviewRendererTypes8O";

export type ManualReviewPreviewComparisonAnswerStatus8P =
  | "answers_question"
  | "partially_answers_question"
  | "insufficient_to_answer";

export interface ManualReviewPreviewComparisonCard8P {
  readonly comparisonCardId: string;
  readonly linked8OPreviewCardId: string;
  readonly linked8NEntryId: string;
  readonly linked8MReviewSectionId: string;
  readonly linked8LObservationCardId: string;
  readonly linked8KDecisionCardId: string;
  readonly observationTitle: string;
  readonly originalObservationQuestion: string;
  readonly originalConfirmationCriteria: string;
  readonly originalDisconfirmationCriteria: string;
  readonly originalInsufficientEvidenceCriteria: string;
  readonly previewOutcome: string;
  readonly previewCounts: string;
  readonly previewContextComparable: string;
  readonly previewCoachNotes: string;
  readonly answerStatus: ManualReviewPreviewComparisonAnswerStatus8P;
  readonly comparisonReadout: string;
  readonly whatMatchesThePlan: string;
  readonly whatDoesNotAnswerYet: string;
  readonly gapToReview: string;
  readonly nextCoachQuestion: string;
  readonly cautionNote: string;
  readonly demoOnly: true;
  readonly nonOfficial: true;
  readonly notPersisted: true;
  readonly notApplied: true;
  readonly noAutoClassification: true;
  readonly noSelectionRecommendation: true;
  readonly noTacticalInstruction: true;
  readonly officialTruth: false;
}

export interface ManualReviewPreviewComparisonSummary8P {
  readonly summaryId: string;
  readonly totalComparisonCards: number;
  readonly answersQuestionCount: number;
  readonly partiallyAnswersQuestionCount: number;
  readonly insufficientToAnswerCount: number;
  readonly confirmedCount: number;
  readonly contradictedCount: number;
  readonly inconclusiveCount: number;
  readonly insufficientSampleCount: number;
  readonly comparisonReadout: string;
  readonly planCoverageReadout: string;
  readonly cautionReadout: string;
  readonly nextCoachQuestion: string;
  readonly notASeasonTrend: true;
  readonly notOfficialTruth: true;
  readonly notPersisted: true;
  readonly notApplied: true;
}

export interface ManualReviewPreviewComparisonBoundary8P {
  readonly boundaryId: string;
  readonly label: string;
  readonly text: string;
  readonly prevents: readonly string[];
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewPreviewComparison8P {
  readonly comparisonId: string;
  readonly sourcePreviewVersion: "8O";
  readonly sourceIntakeBoundaryVersion: "8N";
  readonly sourceManualFormVersion: "8M";
  readonly sourceLearningLoopVersion: "8L";
  readonly sourceDecisionLayerVersion: "8K";
  readonly sourcePreviewFixtureId: string;
  readonly comparisonMode: "demo_preview_comparison_only";
  readonly isRealCoachSubmission: false;
  readonly isOfficialMatchEvidence: false;
  readonly notPersisted: true;
  readonly notApplied: true;
  readonly officialTruth: false;
  readonly comparisonCards: readonly ManualReviewPreviewComparisonCard8P[];
  readonly comparisonSummary: ManualReviewPreviewComparisonSummary8P;
  readonly boundaryNotes: readonly ManualReviewPreviewComparisonBoundary8P[];
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewPreviewComparisonAudit8P {
  readonly previewComparisonVisible: boolean;
  readonly productPreviewComparisonVisible: boolean;
  readonly exportPreviewComparisonVisible: boolean;
  readonly comparisonUses8OValidatedPreviewOnly: boolean;
  readonly invalidPreviewComparisonBlocked: boolean;
  readonly comparisonUses8K8LObservationPlan: boolean;
  readonly comparisonCardCount: number;
  readonly comparisonCardsLinkedTo8OCount: number;
  readonly comparisonCardsLinkedTo8NCount: number;
  readonly comparisonCardsLinkedTo8MCount: number;
  readonly comparisonCardsLinkedTo8LCount: number;
  readonly comparisonCardsLinkedTo8KCount: number;
  readonly comparisonCardsWithOriginalQuestionCount: number;
  readonly comparisonCardsWithOriginalCriteriaCount: number;
  readonly comparisonCardsWithPreviewOutcomeCount: number;
  readonly comparisonCardsWithAnswerStatusCount: number;
  readonly comparisonCardsWithGapToReviewCount: number;
  readonly comparisonMarkedDemoOnlyCount: number;
  readonly comparisonMarkedNonOfficialCount: number;
  readonly comparisonMarkedNotPersistedCount: number;
  readonly comparisonMarkedNotAppliedCount: number;
  readonly comparisonAuditWarningCodes: readonly ManualReviewPreviewComparisonWarningCode8P[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewPlanCoverageAudit8P {
  readonly answersQuestionCount: number;
  readonly partiallyAnswersQuestionCount: number;
  readonly insufficientToAnswerCount: number;
  readonly confirmedCount: number;
  readonly contradictedCount: number;
  readonly inconclusiveCount: number;
  readonly insufficientSampleCount: number;
  readonly comparisonGapCount: number;
  readonly firstExitAnswerStatus: ManualReviewPreviewComparisonAnswerStatus8P;
  readonly dangerContinuityAnswerStatus: ManualReviewPreviewComparisonAnswerStatus8P;
  readonly structureAfterNeutralizedActionAnswerStatus: ManualReviewPreviewComparisonAnswerStatus8P;
  readonly planCoverageWarningCodes: readonly ManualReviewPreviewComparisonWarningCode8P[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewComparisonNonPersistenceAudit8P {
  readonly localStoragePersistenceCount: number;
  readonly databasePersistenceCount: number;
  readonly filePersistenceCount: number;
  readonly backendSubmitActionCount: number;
  readonly formSubmitButtonCount: number;
  readonly apiCallCount: number;
  readonly memoryCreationCount: number;
  readonly seasonMemoryCreationCount: number;
  readonly teamStyleMemoryCreationCount: number;
  readonly comparisonPersistencePerformed: boolean;
  readonly comparisonApplicationPerformed: boolean;
  readonly nonPersistenceWarningCodes: readonly ManualReviewPreviewComparisonWarningCode8P[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewComparisonOfficialTruthBoundaryAudit8P {
  readonly officialTruthPromotionCount: number;
  readonly coachInputPromotedToOfficialTruthCount: number;
  readonly comparisonClaimedAsRealNextMatchCount: number;
  readonly comparisonClaimedAsEngineResultCount: number;
  readonly comparisonClaimedAsSeasonTrendCount: number;
  readonly automaticClassificationCount: number;
  readonly automaticDecisionCount: number;
  readonly selectionRecommendationCount: number;
  readonly tacticalInstructionCount: number;
  readonly sandboxPromotionCount: number;
  readonly diagnosticPromotionCount: number;
  readonly batchPromotionCount: number;
  readonly officialTruthBoundaryWarningCodes: readonly ManualReviewPreviewComparisonWarningCode8P[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewComparisonExportMetadataAudit8P {
  readonly exportTitleMentions8P: boolean;
  readonly exportMainComparisonVersionVisible: boolean;
  readonly exportVisibleBadgeMentions8P: boolean;
  readonly exportMainIdNoLonger8NOnly: boolean;
  readonly exportMainIdNoLonger8IOnly: boolean;
  readonly exportMetadataWarningCodes: readonly ManualReviewPreviewComparisonWarningCode8P[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewComparisonExportBudgetAudit8P {
  readonly exportReadTimeSecondsBefore8P: number;
  readonly exportReadTimeSecondsAfter8P: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly exportComparisonVisible: boolean;
  readonly exportMandatorySectionsPreserved: boolean;
  readonly exportNoFullTimeline: boolean;
  readonly exportNoSandboxPanel: boolean;
  readonly exportNoLongBatchDiagnostics: boolean;
  readonly exportBudgetWarningCodes: readonly ManualReviewPreviewComparisonWarningCode8P[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewComparisonIntegrationBudgetAudit8P {
  readonly productPreviewComparisonVisible: boolean;
  readonly exportPreviewComparisonVisible: boolean;
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
  readonly integrationWarningCodes: readonly ManualReviewPreviewComparisonWarningCode8P[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewComparisonWordingAudit8P {
  readonly comparisonDemoOnlyWordingVisible: boolean;
  readonly comparisonNonOfficialWordingVisible: boolean;
  readonly comparisonNotPersistedWordingVisible: boolean;
  readonly comparisonNotAppliedWordingVisible: boolean;
  readonly noRealNextMatchClaimCount: number;
  readonly noOfficialResultClaimCount: number;
  readonly noEngineLearningClaimCount: number;
  readonly noSeasonTrendClaimCount: number;
  readonly noAutomaticDecisionClaimCount: number;
  readonly noSelectionInstructionCount: number;
  readonly noTacticalInstructionCount: number;
  readonly ambiguousComparisonWordingCount: number;
  readonly wordingReadabilityScore: number;
  readonly wordingWarningCodes: readonly ManualReviewPreviewComparisonWarningCode8P[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewComparisonWithPreviousObservationPlan8PModel {
  readonly status: "PASS" | "PARTIAL" | "FAIL";
  readonly scope: "MANUAL_REVIEW_PREVIEW_COMPARISON_WITH_PREVIOUS_OBSERVATION_PLAN";
  readonly version: "MANUAL_REVIEW_PREVIEW_COMPARISON_8P";
  readonly baselineVersion: "MANUAL_REVIEW_PREVIEW_RENDERER_8O";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8O: ManualReviewPreviewRenderer8OModel;
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
  readonly previewComparisonReady: boolean;
  readonly previewComparisonVisibleInProduct: boolean;
  readonly previewComparisonVisibleInExport: boolean;
  readonly comparisonUses8OValidatedPreviewOnly: boolean;
  readonly comparisonUses8K8LObservationPlan: boolean;
  readonly comparisonCardCount: number;
  readonly comparisonCardsLinkedTo8OCount: number;
  readonly comparisonCardsLinkedTo8NCount: number;
  readonly comparisonCardsLinkedTo8MCount: number;
  readonly comparisonCardsLinkedTo8LCount: number;
  readonly comparisonCardsLinkedTo8KCount: number;
  readonly comparisonAnswersObservationQuestionCount: number;
  readonly comparisonPartialAnswerCount: number;
  readonly comparisonInsufficientAnswerCount: number;
  readonly comparisonGapCount: number;
  readonly comparisonMarkedDemoOnly: boolean;
  readonly comparisonMarkedNonOfficial: boolean;
  readonly comparisonMarkedNotPersisted: boolean;
  readonly comparisonMarkedNotApplied: boolean;
  readonly comparisonDoesNotAutoClassify: boolean;
  readonly comparisonDoesNotDriveSelection: boolean;
  readonly comparisonDoesNotDriveTacticalInstruction: boolean;
  readonly comparisonDoesNotCreateMemory: boolean;
  readonly comparisonDoesNotPromoteOfficialTruth: boolean;
  readonly comparisonDoesNotMutateScore: boolean;
  readonly comparisonDoesNotMutateTimeline: boolean;
  readonly comparisonDoesNotCreateScoreChange: boolean;
  readonly manualPreview8OPreserved: boolean;
  readonly manualIntakeContract8NPreserved: boolean;
  readonly manualForm8MPreserved: boolean;
  readonly learningLoop8LPreserved: boolean;
  readonly decisionLayer8KPreserved: boolean;
  readonly productStoryFirstPreserved: boolean;
  readonly exportCompactPreserved: boolean;
  readonly exportMetadataCurrent8PVisible: boolean;
  readonly exportIdNoLonger8NOnly: boolean;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly numericThresholdGuardPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly comparison: ManualReviewPreviewComparison8P;
  readonly productComparisonHtml: string;
  readonly exportComparisonHtml: string;
  readonly productHtmlAfter8P: string;
  readonly exportHtmlAfter8P: string;
  readonly comparisonAudit: ManualReviewPreviewComparisonAudit8P;
  readonly planCoverageAudit: ManualReviewPreviewPlanCoverageAudit8P;
  readonly nonPersistenceAudit: ManualReviewPreviewComparisonNonPersistenceAudit8P;
  readonly officialTruthBoundaryAudit: ManualReviewPreviewComparisonOfficialTruthBoundaryAudit8P;
  readonly exportMetadataAudit: ManualReviewPreviewComparisonExportMetadataAudit8P;
  readonly exportBudgetAudit: ManualReviewPreviewComparisonExportBudgetAudit8P;
  readonly integrationBudgetAudit: ManualReviewPreviewComparisonIntegrationBudgetAudit8P;
  readonly wordingAudit: ManualReviewPreviewComparisonWordingAudit8P;
  readonly warningCodes: readonly ManualReviewPreviewComparisonWarningCode8P[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

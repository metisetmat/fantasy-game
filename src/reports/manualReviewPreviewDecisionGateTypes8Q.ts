import type { ManualReviewPreviewComparisonWithPreviousObservationPlan8PModel } from "./manualReviewPreviewComparisonTypes8P";
import type { ManualReviewPreviewDecisionGateWarningCode8Q } from "./manualReviewPreviewDecisionGateWarnings8Q";

export type ManualReviewPreviewDecisionGateCardStatus8Q = "readable" | "needs_completion" | "insufficient";
export type ManualReviewPreviewDecisionGateCardLabel8Q = "Lisible" | "A completer" | "Insuffisant";

export interface ManualReviewPreviewDecisionGateCard8Q {
  readonly gateCardId: string;
  readonly linked8PComparisonCardId: string;
  readonly linked8OPreviewCardId: string;
  readonly linked8NEntryId: string;
  readonly linked8MReviewSectionId: string;
  readonly linked8LObservationCardId: string;
  readonly linked8KDecisionCardId: string;
  readonly observationTitle: string;
  readonly answerStatusFrom8P: "answers_question" | "partially_answers_question" | "insufficient_to_answer";
  readonly gateStatus: ManualReviewPreviewDecisionGateCardStatus8Q;
  readonly gateLabel: ManualReviewPreviewDecisionGateCardLabel8Q;
  readonly gateReason: string;
  readonly requiredBeforeRealUse: string;
  readonly coachReviewQuestion: string;
  readonly cautionNote: string;
  readonly demoOnly: true;
  readonly nonOfficial: true;
  readonly notPersisted: true;
  readonly notApplied: true;
  readonly noAutomaticDecision: true;
  readonly noSelectionRecommendation: true;
  readonly noTacticalInstruction: true;
  readonly officialTruth: false;
}

export interface ManualReviewPreviewGlobalDecisionGate8Q {
  readonly globalGateId: string;
  readonly gateStatus: ManualReviewPreviewDecisionGateCardStatus8Q;
  readonly gateLabel: ManualReviewPreviewDecisionGateCardLabel8Q;
  readonly readableCardCount: number;
  readonly needsCompletionCardCount: number;
  readonly insufficientCardCount: number;
  readonly totalGateCardCount: number;
  readonly globalGateReason: string;
  readonly coachFacingReadout: string;
  readonly requiredBeforeRealUse: string;
  readonly whatCanBeDiscussed: readonly string[];
  readonly whatCannotBeConcluded: readonly string[];
  readonly nextCoachQuestion: string;
  readonly notASeasonTrend: true;
  readonly notOfficialTruth: true;
  readonly notPersisted: true;
  readonly notApplied: true;
  readonly noAutomaticDecision: true;
}

export interface ManualReviewPreviewDecisionGateBoundary8Q {
  readonly boundaryId: string;
  readonly label: string;
  readonly text: string;
  readonly prevents: readonly string[];
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewPreviewDecisionGate8Q {
  readonly gateId: string;
  readonly sourceComparisonVersion: "8P";
  readonly sourcePreviewVersion: "8O";
  readonly sourceIntakeBoundaryVersion: "8N";
  readonly sourceManualFormVersion: "8M";
  readonly sourceLearningLoopVersion: "8L";
  readonly sourceDecisionLayerVersion: "8K";
  readonly sourceComparisonId: string;
  readonly gateMode: "demo_preview_decision_gate_only";
  readonly isRealCoachSubmission: false;
  readonly isOfficialMatchEvidence: false;
  readonly notPersisted: true;
  readonly notApplied: true;
  readonly officialTruth: false;
  readonly gateCards: readonly ManualReviewPreviewDecisionGateCard8Q[];
  readonly globalGate: ManualReviewPreviewGlobalDecisionGate8Q;
  readonly missingInformation: readonly string[];
  readonly boundaryNotes: readonly ManualReviewPreviewDecisionGateBoundary8Q[];
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewPreviewDecisionGateAudit8Q {
  readonly decisionGateVisible: boolean;
  readonly productDecisionGateVisible: boolean;
  readonly exportDecisionGateVisible: boolean;
  readonly gateUses8PComparisonOnly: boolean;
  readonly invalidComparisonGateBlocked: boolean;
  readonly gateCardCount: number;
  readonly gateCardsLinkedTo8PCount: number;
  readonly gateCardsLinkedTo8OCount: number;
  readonly gateCardsLinkedTo8NCount: number;
  readonly gateCardsLinkedTo8MCount: number;
  readonly gateCardsLinkedTo8LCount: number;
  readonly gateCardsLinkedTo8KCount: number;
  readonly gateCardsWithStatusCount: number;
  readonly gateCardsWithReasonCount: number;
  readonly gateCardsWithRequiredBeforeRealUseCount: number;
  readonly gateCardsWithNextCoachQuestionCount: number;
  readonly gateMarkedDemoOnlyCount: number;
  readonly gateMarkedNonOfficialCount: number;
  readonly gateMarkedNotPersistedCount: number;
  readonly gateMarkedNotAppliedCount: number;
  readonly decisionGateWarningCodes: readonly ManualReviewPreviewDecisionGateWarningCode8Q[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewDecisionGateLogicAudit8Q {
  readonly readableCardCount: number;
  readonly needsCompletionCardCount: number;
  readonly insufficientCardCount: number;
  readonly globalGateStatus: ManualReviewPreviewDecisionGateCardStatus8Q;
  readonly globalGateExpectedStatus: "needs_completion";
  readonly globalGateStatusCorrect: boolean;
  readonly firstExitGateStatus: ManualReviewPreviewDecisionGateCardStatus8Q;
  readonly dangerContinuityGateStatus: ManualReviewPreviewDecisionGateCardStatus8Q;
  readonly structureAfterNeutralizedActionGateStatus: ManualReviewPreviewDecisionGateCardStatus8Q;
  readonly globalGateReasonVisible: boolean;
  readonly missingInformationVisible: boolean;
  readonly requiredBeforeRealUseVisible: boolean;
  readonly logicWarningCodes: readonly ManualReviewPreviewDecisionGateWarningCode8Q[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewDecisionGateNonPersistenceAudit8Q {
  readonly localStoragePersistenceCount: number;
  readonly databasePersistenceCount: number;
  readonly filePersistenceCount: number;
  readonly backendSubmitActionCount: number;
  readonly formSubmitButtonCount: number;
  readonly apiCallCount: number;
  readonly memoryCreationCount: number;
  readonly seasonMemoryCreationCount: number;
  readonly teamStyleMemoryCreationCount: number;
  readonly gatePersistencePerformed: boolean;
  readonly gateApplicationPerformed: boolean;
  readonly nonPersistenceWarningCodes: readonly ManualReviewPreviewDecisionGateWarningCode8Q[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewDecisionGateBoundaryAudit8Q {
  readonly officialTruthPromotionCount: number;
  readonly coachInputPromotedToOfficialTruthCount: number;
  readonly gateClaimedAsRealNextMatchCount: number;
  readonly gateClaimedAsEngineResultCount: number;
  readonly gateClaimedAsSeasonTrendCount: number;
  readonly gateClaimedAsTeamMemoryCount: number;
  readonly automaticDecisionCount: number;
  readonly automaticClassificationRealMatchCount: number;
  readonly selectionRecommendationCount: number;
  readonly tacticalInstructionCount: number;
  readonly sandboxPromotionCount: number;
  readonly diagnosticPromotionCount: number;
  readonly batchPromotionCount: number;
  readonly boundaryWarningCodes: readonly ManualReviewPreviewDecisionGateWarningCode8Q[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewDecisionGateSourceOfTruthRegressionAudit8Q {
  readonly reportUsesOfficialTimelineOnlyForOfficialStory: boolean;
  readonly reportUsesOfficialScoreOnlyForOfficialScore: boolean;
  readonly reportScoreMatchesOfficialScore: boolean;
  readonly allStoryScoreClaimsBackedByScoreChange: boolean;
  readonly allReplayScoreClaimsBackedByScoreChange: boolean;
  readonly manualGateDoesNotClaimNewScoreEvidence: boolean;
  readonly manualGateDoesNotCreateFutureEvidence: boolean;
  readonly manualGateDoesNotMutateTimeline: boolean;
  readonly manualGateDoesNotMutateScore: boolean;
  readonly manualGateDoesNotCreateScoreChange: boolean;
  readonly manualGateDoesNotPromoteCoachInputToOfficialTruth: boolean;
  readonly noScoreMutation: boolean;
  readonly noEventDeletion: boolean;
  readonly noScoringConstantChange: boolean;
  readonly MatchBonusEventUnchanged: boolean;
  readonly batchLiveSeparationPreserved: boolean;
  readonly sourceOfTruthWarningCodes: readonly ManualReviewPreviewDecisionGateWarningCode8Q[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewDecisionGateExportMetadataAudit8Q {
  readonly exportTitleMentions8Q: boolean;
  readonly exportMainCurrentVersionVisible: boolean;
  readonly exportVisibleBadgeMentions8Q: boolean;
  readonly exportMainIdStillCompressedExport8P: boolean;
  readonly exportMainIdStillCompressedExport8N: boolean;
  readonly exportMainIdStillCompressedExport8I: boolean;
  readonly exportHistoricalMarkersPreservedAsDataAttributes: boolean;
  readonly metadataWarningCodes: readonly ManualReviewPreviewDecisionGateWarningCode8Q[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewDecisionGateExportBudgetAudit8Q {
  readonly exportReadTimeSecondsBefore8Q: number;
  readonly exportReadTimeSecondsAfter8Q: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly exportDecisionGateVisible: boolean;
  readonly exportMandatorySectionsPreserved: boolean;
  readonly exportNoFullTimeline: boolean;
  readonly exportNoSandboxPanel: boolean;
  readonly exportNoLongBatchDiagnostics: boolean;
  readonly exportMetadataClean: boolean;
  readonly exportBudgetWarningCodes: readonly ManualReviewPreviewDecisionGateWarningCode8Q[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewDecisionGateIntegrationBudgetAudit8Q {
  readonly productDecisionGateVisible: boolean;
  readonly exportDecisionGateVisible: boolean;
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
  readonly integrationWarningCodes: readonly ManualReviewPreviewDecisionGateWarningCode8Q[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewDecisionGateWordingAudit8Q {
  readonly gateDemoOnlyWordingVisible: boolean;
  readonly gateNonOfficialWordingVisible: boolean;
  readonly gateNotPersistedWordingVisible: boolean;
  readonly gateNotAppliedWordingVisible: boolean;
  readonly noRealNextMatchClaimCount: number;
  readonly noOfficialResultClaimCount: number;
  readonly noEngineLearningClaimCount: number;
  readonly noSeasonTrendClaimCount: number;
  readonly noAutomaticDecisionClaimCount: number;
  readonly noSelectionInstructionCount: number;
  readonly noTacticalInstructionCount: number;
  readonly ambiguousGateWordingCount: number;
  readonly wordingReadabilityScore: number;
  readonly wordingWarningCodes: readonly ManualReviewPreviewDecisionGateWarningCode8Q[];
  readonly recommendation: string;
}

export interface ManualReviewPreviewDecisionGateWithoutPersistence8QModel {
  readonly status: "PASS" | "PARTIAL" | "FAIL";
  readonly scope: "MANUAL_REVIEW_PREVIEW_DECISION_GATE_WITHOUT_PERSISTENCE";
  readonly version: "MANUAL_REVIEW_PREVIEW_DECISION_GATE_8Q";
  readonly baselineVersion: "MANUAL_REVIEW_PREVIEW_COMPARISON_8P";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8P: ManualReviewPreviewComparisonWithPreviousObservationPlan8PModel;
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
  readonly decisionGateReady: boolean;
  readonly productDecisionGateVisible: boolean;
  readonly exportDecisionGateVisible: boolean;
  readonly gateUses8PComparisonOnly: boolean;
  readonly invalidComparisonGateBlocked: boolean;
  readonly gateCardCount: number;
  readonly gateCardsLinkedTo8PCount: number;
  readonly gateCardsLinkedTo8OCount: number;
  readonly gateCardsLinkedTo8NCount: number;
  readonly gateCardsLinkedTo8MCount: number;
  readonly gateCardsLinkedTo8LCount: number;
  readonly gateCardsLinkedTo8KCount: number;
  readonly gateReadableCount: number;
  readonly gateNeedsCompletionCount: number;
  readonly gateInsufficientCount: number;
  readonly globalGateStatus: ManualReviewPreviewDecisionGateCardStatus8Q;
  readonly globalGateExpectedStatus: "needs_completion";
  readonly globalGateReason: string;
  readonly gateMarkedDemoOnly: boolean;
  readonly gateMarkedNonOfficial: boolean;
  readonly gateMarkedNotPersisted: boolean;
  readonly gateMarkedNotApplied: boolean;
  readonly gateDoesNotAutoClassifyRealMatch: boolean;
  readonly gateDoesNotCreateAutomaticDecision: boolean;
  readonly gateDoesNotDriveSelection: boolean;
  readonly gateDoesNotDriveTacticalInstruction: boolean;
  readonly gateDoesNotCreateMemory: boolean;
  readonly gateDoesNotPromoteOfficialTruth: boolean;
  readonly gateDoesNotMutateScore: boolean;
  readonly gateDoesNotMutateTimeline: boolean;
  readonly gateDoesNotCreateScoreChange: boolean;
  readonly previewComparison8PPreserved: boolean;
  readonly manualPreview8OPreserved: boolean;
  readonly manualIntakeContract8NPreserved: boolean;
  readonly manualForm8MPreserved: boolean;
  readonly learningLoop8LPreserved: boolean;
  readonly decisionLayer8KPreserved: boolean;
  readonly productStoryFirstPreserved: boolean;
  readonly exportCompactPreserved: boolean;
  readonly exportMetadataCurrent8QVisible: boolean;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly numericThresholdGuardPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly decisionGate: ManualReviewPreviewDecisionGate8Q;
  readonly productDecisionGateHtml: string;
  readonly exportDecisionGateHtml: string;
  readonly productHtmlAfter8Q: string;
  readonly exportHtmlAfter8Q: string;
  readonly decisionGateAudit: ManualReviewPreviewDecisionGateAudit8Q;
  readonly logicAudit: ManualReviewPreviewDecisionGateLogicAudit8Q;
  readonly nonPersistenceAudit: ManualReviewPreviewDecisionGateNonPersistenceAudit8Q;
  readonly boundaryAudit: ManualReviewPreviewDecisionGateBoundaryAudit8Q;
  readonly sourceOfTruthRegressionAudit: ManualReviewPreviewDecisionGateSourceOfTruthRegressionAudit8Q;
  readonly exportMetadataAudit: ManualReviewPreviewDecisionGateExportMetadataAudit8Q;
  readonly exportBudgetAudit: ManualReviewPreviewDecisionGateExportBudgetAudit8Q;
  readonly integrationBudgetAudit: ManualReviewPreviewDecisionGateIntegrationBudgetAudit8Q;
  readonly wordingAudit: ManualReviewPreviewDecisionGateWordingAudit8Q;
  readonly warningCodes: readonly ManualReviewPreviewDecisionGateWarningCode8Q[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

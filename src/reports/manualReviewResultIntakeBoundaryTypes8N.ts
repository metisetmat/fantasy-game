import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { ManualPostMatchObservationReviewForm8MModel } from "./manualPostMatchObservationReviewFormTypes8M";
import type { ManualReviewResultIntakeBoundaryWarningCode8N } from "./manualReviewResultIntakeBoundaryWarnings8N";

export type ManualReviewOutcomeValue8N = "confirmed" | "contradicted" | "inconclusive" | "insufficient_sample";
export type ManualReviewContextComparable8N = "yes" | "no" | "uncertain";
export type ManualReviewApplicationMode8N = "validate_only" | "preview_only";
export type ManualReviewCreatedBy8N = "manual_coach_input";
export type ManualReviewPersistenceIntent8N = "none";
export type ManualReviewOfficialTruthStatus8N = "non_official_coach_review";
export type ManualReviewIntakeStatus8N = "accepted_for_preview" | "rejected";
export type ManualReviewIntakePrevention8N =
  | "intake_acceptance"
  | "official_truth_promotion"
  | "persistence"
  | "auto_classification";

export interface ManualReviewResultEntry8N {
  readonly entryId: string;
  readonly linked8MReviewSectionId: string;
  readonly linked8LObservationCardId: string;
  readonly linked8KDecisionCardId: string;
  readonly observationTitle: string;
  readonly selectedOutcome: ManualReviewOutcomeValue8N;
  readonly comparableSituationCount: number;
  readonly positiveSignalCount: number;
  readonly negativeSignalCount: number;
  readonly contextComparable: ManualReviewContextComparable8N;
  readonly coachNotes: string;
  readonly exampleToReview: string;
  readonly cautionAcknowledged: boolean;
  readonly manualOnly: true;
  readonly autoClassified: false;
  readonly officialTruth: false;
  readonly canDriveSelection: false;
  readonly canDriveTacticalInstruction: false;
  readonly canCreateMemory: false;
}

export interface ManualReviewBoundaryAcknowledgement8N {
  readonly noAutomaticClassificationAcknowledged: boolean;
  readonly noPersistenceAcknowledged: boolean;
  readonly noOfficialTruthAcknowledged: boolean;
  readonly noSelectionInstructionAcknowledged: boolean;
  readonly noTacticalInstructionAcknowledged: boolean;
  readonly noFutureEvidenceAcknowledged: boolean;
  readonly noScoreMutationAcknowledged: boolean;
  readonly noTimelineMutationAcknowledged: boolean;
}

export interface ManualReviewResultIntakePayload8N {
  readonly intakeId: string;
  readonly sourceFormVersion: "8M";
  readonly sourceTrackerVersion: "8L";
  readonly sourceDecisionLayerVersion: "8K";
  readonly sourceMatchId: string;
  readonly reviewedMatchId?: string;
  readonly reviewDate?: string;
  readonly coachReviewerLabel?: string;
  readonly entries: readonly ManualReviewResultEntry8N[];
  readonly boundaryAcknowledgement: ManualReviewBoundaryAcknowledgement8N;
  readonly createdBy: ManualReviewCreatedBy8N;
  readonly persistenceIntent: ManualReviewPersistenceIntent8N;
  readonly applicationMode: ManualReviewApplicationMode8N;
  readonly officialTruthStatus: ManualReviewOfficialTruthStatus8N;
  readonly shouldMutateOfficialReport: false;
  readonly shouldMutateScore: false;
  readonly shouldMutateTimeline: false;
  readonly shouldCreateScoringEvent: false;
  readonly shouldCreateSeasonMemory: false;
  readonly shouldCreateTeamStyleMemory: false;
}

export interface ManualReviewIntakeError8N {
  readonly errorCode: string;
  readonly fieldPath: string;
  readonly message: string;
  readonly severity: "blocking" | "warning";
  readonly prevents: readonly ManualReviewIntakePrevention8N[];
}

export interface ManualReviewIntakeValidationResult8N {
  readonly status: ManualReviewIntakeStatus8N;
  readonly acceptedEntryCount: number;
  readonly rejectedEntryCount: number;
  readonly warningCodes: readonly ManualReviewResultIntakeBoundaryWarningCode8N[];
  readonly errors: readonly ManualReviewIntakeError8N[];
  readonly normalizedPayload?: ManualReviewResultIntakePayload8N;
  readonly rejectionReasons: readonly string[];
  readonly sourceBoundaryNotes: readonly string[];
  readonly officialTruthStatus: ManualReviewOfficialTruthStatus8N;
  readonly persistencePerformed: false;
  readonly officialMutationPerformed: false;
  readonly scoreMutationPerformed: false;
  readonly timelineMutationPerformed: false;
  readonly automaticClassificationPerformed: false;
}

export interface ManualReviewResultIntakeContractAudit8N {
  readonly manualIntakeContractVisible: boolean;
  readonly productManualIntakeBoundaryVisible: boolean;
  readonly exportManualIntakeBoundaryVisible: boolean;
  readonly payloadContractDefined: boolean;
  readonly entryContractDefined: boolean;
  readonly boundaryAcknowledgementDefined: boolean;
  readonly validationResultDefined: boolean;
  readonly acceptedOutcomeValuesCount: number;
  readonly rejectedOutcomeFixturesCount: number;
  readonly validPayloadAcceptedCount: number;
  readonly invalidRejectionCount: number;
  readonly unknownOutcomeRejected: boolean;
  readonly invalidEntryCountRejected: boolean;
  readonly unknownLinkedSectionRejected: boolean;
  readonly autoClassifiedRejected: boolean;
  readonly officialTruthRejected: boolean;
  readonly persistenceIntentRejected: boolean;
  readonly scoreMutationRejected: boolean;
  readonly timelineMutationRejected: boolean;
  readonly scoringEventMutationRejected: boolean;
  readonly seasonMemoryRejected: boolean;
  readonly teamStyleMemoryRejected: boolean;
  readonly selectionAutomationRejected: boolean;
  readonly tacticalInstructionRejected: boolean;
  readonly missingAcknowledgementRejected: boolean;
  readonly linked8MIdsRequired: boolean;
  readonly linked8LIdsRequired: boolean;
  readonly linked8KIdsRequired: boolean;
  readonly manualOnlyRequired: boolean;
  readonly officialTruthFalseRequired: boolean;
  readonly autoClassifiedFalseRequired: boolean;
  readonly noPersistenceRequired: boolean;
  readonly noMutationRequired: boolean;
  readonly validatorPureFunction: boolean;
  readonly validatorMutationCount: number;
  readonly validatorPersistenceCount: number;
  readonly manualIntakeContractWarningCodes: readonly ManualReviewResultIntakeBoundaryWarningCode8N[];
  readonly recommendation: string;
}

export interface ManualReviewResultIntakeBoundaryAudit8N {
  readonly seasonMemoryCreationCount: number;
  readonly teamStyleMemoryCreationCount: number;
  readonly databasePersistenceCreationCount: number;
  readonly filePersistenceCreationCount: number;
  readonly localStoragePersistenceCount: number;
  readonly backendSubmitActionCount: number;
  readonly formSubmitButtonCount: number;
  readonly automaticSelectionRecommendationCount: number;
  readonly tacticalPlanImpositionCount: number;
  readonly futureResultClaimCount: number;
  readonly fabricatedNextMatchEvidenceCount: number;
  readonly officialTruthPromotionCount: number;
  readonly scoreMutationRequestAcceptedCount: number;
  readonly timelineMutationRequestAcceptedCount: number;
  readonly scoringEventCreationAcceptedCount: number;
  readonly sandboxPromotionCount: number;
  readonly diagnosticPromotionCount: number;
  readonly batchPromotionCount: number;
  readonly boundaryNotesVisible: boolean;
  readonly boundaryWarningCodes: readonly ManualReviewResultIntakeBoundaryWarningCode8N[];
  readonly recommendation: string;
}

export interface ManualReviewResultIntakeExportMetadataAudit8N {
  readonly exportTitleMentions8N: boolean;
  readonly exportTitleStillOnly8I: boolean;
  readonly exportTitleStillOnly8M: boolean;
  readonly exportMainCurrentVersionVisible: boolean;
  readonly exportMainIdStillCompressedExport8I: boolean;
  readonly exportVisibleBadgeStillOnly8I: boolean;
  readonly exportVisibleBadgeMentionsCurrentSprint: boolean;
  readonly exportHistoricalMarkersPreservedAsDataAttributes: boolean;
  readonly metadataWarningCodes: readonly ManualReviewResultIntakeBoundaryWarningCode8N[];
  readonly recommendation: string;
}

export interface ManualReviewResultIntakeSourceOfTruthRegressionAudit8N {
  readonly reportUsesOfficialTimelineOnlyForOfficialStory: boolean;
  readonly reportUsesOfficialScoreOnlyForOfficialScore: boolean;
  readonly reportScoreMatchesOfficialScore: boolean;
  readonly allStoryScoreClaimsBackedByScoreChange: boolean;
  readonly allReplayScoreClaimsBackedByScoreChange: boolean;
  readonly manualFormDoesNotClaimNewScoreEvidence: boolean;
  readonly manualIntakeDoesNotClaimNewScoreEvidence: boolean;
  readonly manualIntakeDoesNotCreateFutureEvidence: boolean;
  readonly manualIntakeDoesNotMutateTimeline: boolean;
  readonly manualIntakeDoesNotMutateScore: boolean;
  readonly manualIntakeDoesNotCreateScoreChange: boolean;
  readonly manualIntakeDoesNotPromoteCoachInputToOfficialTruth: boolean;
  readonly sandboxManualIntakePromotionCount: number;
  readonly diagnosticManualIntakePromotionCount: number;
  readonly batchManualIntakePromotionCount: number;
  readonly noScoreMutation: boolean;
  readonly noEventDeletion: boolean;
  readonly noScoringConstantChange: boolean;
  readonly MatchBonusEventUnchanged: boolean;
  readonly batchLiveSeparationPreserved: boolean;
  readonly sourceOfTruthWarningCodes: readonly ManualReviewResultIntakeBoundaryWarningCode8N[];
  readonly recommendation: string;
}

export interface ManualReviewResultIntakeExportBudgetAudit8N {
  readonly exportReadTimeSecondsBefore8N: number;
  readonly exportReadTimeSecondsAfter8N: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly exportManualIntakeBoundaryVisible: boolean;
  readonly exportMandatorySectionsPreserved: boolean;
  readonly exportNoFullTimeline: boolean;
  readonly exportNoSandboxPanel: boolean;
  readonly exportNoLongBatchDiagnostics: boolean;
  readonly exportMetadataClean: boolean;
  readonly exportBudgetWarningCodes: readonly ManualReviewResultIntakeBoundaryWarningCode8N[];
  readonly recommendation: string;
}

export interface ManualReviewResultIntakeIntegrationBudgetAudit8N {
  readonly productManualIntakeBoundaryVisible: boolean;
  readonly exportManualIntakeBoundaryVisible: boolean;
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
  readonly integrationWarningCodes: readonly ManualReviewResultIntakeBoundaryWarningCode8N[];
  readonly recommendation: string;
}

export interface ManualReviewResultIntakeBoundary8NModel {
  readonly status: OfficialCausalityStatus;
  readonly scope: "MANUAL_REVIEW_RESULT_INTAKE_BOUNDARY";
  readonly version: "MANUAL_REVIEW_RESULT_INTAKE_BOUNDARY_8N";
  readonly baselineVersion: "MANUAL_POST_MATCH_OBSERVATION_REVIEW_FORM_8M";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8M: ManualPostMatchObservationReviewForm8MModel;
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
  readonly manualIntakeContractReady: boolean;
  readonly manualIntakeValidatorReady: boolean;
  readonly manualIntakeBoundaryVisibleInProduct: boolean;
  readonly manualIntakeBoundaryVisibleInExport: boolean;
  readonly acceptedOutcomeValuesReady: boolean;
  readonly rejectedOutcomeValuesReady: boolean;
  readonly linkedObservationIdsRequired: boolean;
  readonly evidenceCountsManualOnly: boolean;
  readonly noAutoClassification: boolean;
  readonly noPersistenceCreated: boolean;
  readonly noSubmitFlowCreated: boolean;
  readonly noFutureEvidenceCreated: boolean;
  readonly noOfficialTruthMutation: boolean;
  readonly noScoreMutation: boolean;
  readonly noTimelineMutation: boolean;
  readonly noScoringEventMutation: boolean;
  readonly exportMetadataCleaned: boolean;
  readonly productManualForm8MPreserved: boolean;
  readonly exportManualForm8MPreserved: boolean;
  readonly exportCompactPreserved: boolean;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly numericThresholdGuardPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly contractPayloadFixture: ManualReviewResultIntakePayload8N;
  readonly invalidFixtureResults: readonly ManualReviewIntakeValidationResult8N[];
  readonly validFixtureResult: ManualReviewIntakeValidationResult8N;
  readonly productHtmlAfter8N: string;
  readonly exportHtmlAfter8N: string;
  readonly productIntakeBoundaryHtml: string;
  readonly exportIntakeBoundaryHtml: string;
  readonly contractAudit: ManualReviewResultIntakeContractAudit8N;
  readonly boundaryAudit: ManualReviewResultIntakeBoundaryAudit8N;
  readonly exportMetadataAudit: ManualReviewResultIntakeExportMetadataAudit8N;
  readonly sourceOfTruthRegressionAudit: ManualReviewResultIntakeSourceOfTruthRegressionAudit8N;
  readonly exportBudgetAudit: ManualReviewResultIntakeExportBudgetAudit8N;
  readonly integrationBudgetAudit: ManualReviewResultIntakeIntegrationBudgetAudit8N;
  readonly warningCodes: readonly ManualReviewResultIntakeBoundaryWarningCode8N[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

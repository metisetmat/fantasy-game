import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReportDecisionLayerNextMatchObservationPlan8KModel } from "./coachReportDecisionLayerNextMatchObservationPlanTypes8K";
import type { CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerWarnings";

export type ObservationOutcomeTrackerState8L = "pending" | "ready_for_next_match_review";
export type ObservationOutcomeCardStatus8L = "pending" | "not_evaluated";
export type PostMatchOutcomeLabel8L = "Confirme" | "Infirme" | "Inconclusif" | "Echantillon insuffisant";

export interface PostMatchOutcomeOption8L {
  readonly outcomeId: "confirmed" | "contradicted" | "inconclusive" | "insufficient_sample";
  readonly label: PostMatchOutcomeLabel8L;
  readonly meaning: string;
  readonly whenToUse: string;
  readonly forbiddenUse: string;
  readonly nextCoachQuestion: string;
}

export interface ObservationOutcomeCard8L {
  readonly observationCardId: string;
  readonly linked8KDecisionCardId: string;
  readonly title: string;
  readonly currentStatus: ObservationOutcomeCardStatus8L;
  readonly whatToCheckNextMatch: string;
  readonly confirmationCriteria: string;
  readonly disconfirmationCriteria: string;
  readonly insufficientEvidenceCriteria: string;
  readonly minimumEvidenceNeeded: string;
  readonly observationWindow: "next_match_manual_review";
  readonly manualReviewQuestion: string;
  readonly postMatchOutcomeOptions: readonly PostMatchOutcomeOption8L[];
  readonly cautionNote: string;
  readonly sourceBoundary: string;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
  readonly noSelectionRecommendation: boolean;
  readonly noTacticalInstruction: boolean;
}

export interface SeasonlessLearningBoundary8L {
  readonly boundaryId: string;
  readonly label: string;
  readonly text: string;
  readonly prevents: readonly (
    | "season_memory_creation"
    | "team_style_memory_creation"
    | "database_persistence"
    | "automatic_selection"
    | "tactical_instruction"
    | "future_result_claim"
    | "sandbox_promotion"
    | "overclaiming"
  )[];
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ObservationOutcomeTracker8L {
  readonly trackerId: string;
  readonly sourceMatchId: string;
  readonly sourceSprint: "8K";
  readonly targetScope: "next_match_manual_review";
  readonly trackerState: ObservationOutcomeTrackerState8L;
  readonly observationCards: readonly ObservationOutcomeCard8L[];
  readonly outcomeMatrix: readonly PostMatchOutcomeOption8L[];
  readonly minimumEvidenceRules: readonly string[];
  readonly cautionRules: readonly string[];
  readonly notPersisted: boolean;
  readonly noSeasonMemory: boolean;
  readonly noTeamStyleMemory: boolean;
  readonly noDatabaseStorage: boolean;
  readonly noAutomaticDecision: boolean;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface SeasonlessLearningLoopAudit8L {
  readonly seasonlessLearningLoopVisible: boolean;
  readonly trackerVisible: boolean;
  readonly trackerCardCount: number;
  readonly trackerCardsPendingCount: number;
  readonly trackerCardsWithConfirmationCriteriaCount: number;
  readonly trackerCardsWithDisconfirmationCriteriaCount: number;
  readonly trackerCardsWithInsufficientEvidenceCriteriaCount: number;
  readonly trackerCardsWithMinimumEvidenceCount: number;
  readonly trackerCardsWithCautionNoteCount: number;
  readonly noFutureOutcomeClaim: boolean;
  readonly noSeasonMemoryCreated: boolean;
  readonly noTeamStyleMemoryCreated: boolean;
  readonly noDatabasePersistenceCreated: boolean;
  readonly noAutomaticDecisionCreated: boolean;
  readonly seasonlessLearningWarningCodes: readonly CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[];
  readonly recommendation: string;
}

export interface ObservationOutcomeTrackerAudit8L {
  readonly observationOutcomeTrackerReady: boolean;
  readonly observationCardCount: number;
  readonly observationCardsLinkedTo8KCount: number;
  readonly postMatchOutcomeOptionsVisible: boolean;
  readonly confirmedOptionDefined: boolean;
  readonly contradictedOptionDefined: boolean;
  readonly inconclusiveOptionDefined: boolean;
  readonly insufficientSampleOptionDefined: boolean;
  readonly manualReviewInstructionsVisible: boolean;
  readonly automaticOutcomeClassificationCount: number;
  readonly fabricatedNextMatchEvidenceCount: number;
  readonly observationOutcomeTrackerWarningCodes: readonly CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[];
  readonly recommendation: string;
}

export interface FutureClaimGuardAudit8L {
  readonly futureMatchOutcomeClaimCount: number;
  readonly fakeNextMatchEvidenceCount: number;
  readonly predictionPresentedAsFactCount: number;
  readonly seasonTrendClaimCount: number;
  readonly teamStyleMemoryClaimCount: number;
  readonly historicalLearningClaimCount: number;
  readonly persistentMemoryClaimCount: number;
  readonly unsupportedConfirmationCount: number;
  readonly unsupportedDisconfirmationCount: number;
  readonly futureClaimWarningCodes: readonly CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[];
  readonly recommendation: string;
}

export interface SeasonlessBoundaryAudit8L {
  readonly seasonMemoryCreationCount: number;
  readonly teamStyleMemoryCreationCount: number;
  readonly databasePersistenceCreationCount: number;
  readonly filePersistenceCreationCount: number;
  readonly automaticSelectionRecommendationCount: number;
  readonly tacticalPlanImpositionCount: number;
  readonly sandboxPromotionCount: number;
  readonly diagnosticPromotionCount: number;
  readonly batchPromotionCount: number;
  readonly boundaryNotesVisible: boolean;
  readonly boundaryWarningCodes: readonly CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[];
  readonly recommendation: string;
}

export interface LearningLoopExportBudgetAudit8L {
  readonly exportReadTimeSecondsBefore8L: number;
  readonly exportReadTimeSecondsAfter8L: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly exportTrackerVisible: boolean;
  readonly exportTrackerCardCount: number;
  readonly exportMandatorySectionsPreserved: boolean;
  readonly exportNoFullTimeline: boolean;
  readonly exportNoSandboxPanel: boolean;
  readonly exportNoLongBatchDiagnostics: boolean;
  readonly exportBudgetWarningCodes: readonly CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[];
  readonly recommendation: string;
}

export interface LearningLoopSourceOfTruthRegressionAudit8L {
  readonly reportUsesOfficialTimelineOnlyForOfficialStory: boolean;
  readonly reportUsesOfficialScoreOnlyForOfficialScore: boolean;
  readonly reportScoreMatchesOfficialScore: boolean;
  readonly allStoryScoreClaimsBackedByScoreChange: boolean;
  readonly allReplayScoreClaimsBackedByScoreChange: boolean;
  readonly decisionLayerScoreClaimsBackedByScoreChange: boolean;
  readonly learningLoopDoesNotClaimNewScoreEvidence: boolean;
  readonly learningLoopDoesNotCreateFutureEvidence: boolean;
  readonly sandboxLearningPromotionCount: number;
  readonly diagnosticLearningPromotionCount: number;
  readonly batchLearningPromotionCount: number;
  readonly noScoreMutation: boolean;
  readonly noEventDeletion: boolean;
  readonly noScoringConstantChange: boolean;
  readonly MatchBonusEventUnchanged: boolean;
  readonly batchLiveSeparationPreserved: boolean;
  readonly sourceOfTruthWarningCodes: readonly CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[];
  readonly recommendation: string;
}

export interface LearningLoopIntegrationBudgetAudit8L {
  readonly productLearningLoopVisible: boolean;
  readonly exportLearningLoopVisible: boolean;
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
  readonly integrationWarningCodes: readonly CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[];
  readonly recommendation: string;
}

export interface CoachReportSeasonlessLearningLoopObservationOutcomeTracker8LModel {
  readonly status: OfficialCausalityStatus;
  readonly scope: "COACH_REPORT_SEASONLESS_LEARNING_LOOP_OBSERVATION_OUTCOME_TRACKER";
  readonly version: "COACH_REPORT_SEASONLESS_LEARNING_LOOP_OBSERVATION_OUTCOME_TRACKER_8L";
  readonly baselineVersion: "COACH_REPORT_DECISION_LAYER_NEXT_MATCH_OBSERVATION_PLAN_8K";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8K: CoachReportDecisionLayerNextMatchObservationPlan8KModel;
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
  readonly tracker: ObservationOutcomeTracker8L;
  readonly boundaries: readonly SeasonlessLearningBoundary8L[];
  readonly seasonlessLearningLoopReady: boolean;
  readonly observationOutcomeTrackerReady: boolean;
  readonly trackerInitialStatePending: boolean;
  readonly noFutureOutcomeClaim: boolean;
  readonly noSeasonMemoryCreated: boolean;
  readonly noTeamStyleMemoryCreated: boolean;
  readonly noDatabasePersistenceCreated: boolean;
  readonly noAutomaticDecisionCreated: boolean;
  readonly decisionLayer8KPreserved: boolean;
  readonly nextMatchObservationPlan8KPreserved: boolean;
  readonly confirmationCriteriaPreserved: boolean;
  readonly disconfirmationCriteriaPreserved: boolean;
  readonly insufficientEvidenceCriteriaReady: boolean;
  readonly manualPostMatchUseReady: boolean;
  readonly productTrackerVisible: boolean;
  readonly exportTrackerVisible: boolean;
  readonly exportCompactPreserved: boolean;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly numericThresholdGuardPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly seasonlessLearningLoopAudit: SeasonlessLearningLoopAudit8L;
  readonly observationOutcomeTrackerAudit: ObservationOutcomeTrackerAudit8L;
  readonly futureClaimGuardAudit: FutureClaimGuardAudit8L;
  readonly seasonlessBoundaryAudit: SeasonlessBoundaryAudit8L;
  readonly exportBudgetAudit: LearningLoopExportBudgetAudit8L;
  readonly sourceOfTruthRegressionAudit: LearningLoopSourceOfTruthRegressionAudit8L;
  readonly integrationBudgetAudit: LearningLoopIntegrationBudgetAudit8L;
  readonly productLearningLoopHtml: string;
  readonly exportLearningLoopHtml: string;
  readonly productHtmlAfter8L: string;
  readonly exportHtmlAfter8L: string;
  readonly warningCodes: readonly CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

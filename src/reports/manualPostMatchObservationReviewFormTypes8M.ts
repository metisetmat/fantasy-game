import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReportSeasonlessLearningLoopObservationOutcomeTracker8LModel } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerTypes8L";
import type { ManualPostMatchObservationReviewFormWarningCode8M } from "./manualPostMatchObservationReviewFormWarnings";

export type ManualPostMatchReviewState8M = "pending_blank_manual_only";
export type ManualObservationReviewSectionStatus8M = "pending" | "blank" | "not_evaluated";
export type ManualOutcomeOptionId8M = "confirmed" | "contradicted" | "inconclusive" | "insufficient_sample";

export interface ManualOutcomeOption8M {
  readonly outcomeId: ManualOutcomeOptionId8M;
  readonly label: "Confirme" | "Infirme" | "Inconclusif" | "Echantillon insuffisant";
  readonly coachMeaning: string;
  readonly manualOnlyBoundary: string;
}

export interface ManualEvidenceCountField8M {
  readonly fieldId: string;
  readonly label: string;
  readonly expectedFormat: string;
  readonly blankValue: "";
  readonly minimumComparableCount: number;
}

export interface ManualContextComparableField8M {
  readonly fieldId: string;
  readonly label: string;
  readonly comparableQuestion: string;
  readonly blankValue: "";
}

export interface ManualCoachNotesField8M {
  readonly fieldId: string;
  readonly label: string;
  readonly prompt: string;
  readonly blankValue: "";
  readonly maxLines: number;
}

export interface ManualObservationReviewSection8M {
  readonly sectionId: string;
  readonly linked8LObservationCardId: string;
  readonly linked8KDecisionCardId: string;
  readonly title: string;
  readonly status: ManualObservationReviewSectionStatus8M;
  readonly sourceObservation: string;
  readonly reviewPrompt: string;
  readonly outcomeOptions: readonly ManualOutcomeOption8M[];
  readonly evidenceCountFields: readonly ManualEvidenceCountField8M[];
  readonly contextComparableFields: readonly ManualContextComparableField8M[];
  readonly coachNotesFields: readonly ManualCoachNotesField8M[];
  readonly caution: string;
  readonly noDefaultCheckedOutcome: boolean;
  readonly noAutomaticOutcome: boolean;
}

export interface ManualPostMatchReviewBoundary8M {
  readonly boundaryId: string;
  readonly label: string;
  readonly text: string;
  readonly blocks: readonly (
    | "auto_classification"
    | "persistence"
    | "season_memory"
    | "future_evidence_claim"
    | "selection_instruction"
    | "tactical_instruction"
    | "sandbox_promotion"
  )[];
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualPostMatchObservationReviewForm8M {
  readonly formId: string;
  readonly version: "MANUAL_POST_MATCH_OBSERVATION_REVIEW_FORM_8M";
  readonly sourceSprint: "8L";
  readonly source8LTrackerId: string;
  readonly state: ManualPostMatchReviewState8M;
  readonly sections: readonly ManualObservationReviewSection8M[];
  readonly boundaries: readonly ManualPostMatchReviewBoundary8M[];
  readonly notPersisted: boolean;
  readonly noSubmitAction: boolean;
  readonly noAutomaticClassification: boolean;
}

export interface ManualPostMatchReviewFormAudit8M {
  readonly productFormVisible: boolean;
  readonly exportFormVisible: boolean;
  readonly reviewSectionCount: number;
  readonly linked8LSectionCount: number;
  readonly pendingSectionCount: number;
  readonly blankSectionCount: number;
  readonly notEvaluatedSectionCount: number;
  readonly evidenceCountFieldCount: number;
  readonly contextComparableFieldCount: number;
  readonly coachNotesFieldCount: number;
  readonly cautionFieldCount: number;
  readonly formAuditWarningCodes: readonly ManualPostMatchObservationReviewFormWarningCode8M[];
  readonly recommendation: string;
}

export interface ManualOutcomeOptionAudit8M {
  readonly outcomeOptionCount: number;
  readonly sectionsWithFourOptionsCount: number;
  readonly checkedDefaultCount: number;
  readonly automaticOutcomeCount: number;
  readonly outcomeOptionAuditWarningCodes: readonly ManualPostMatchObservationReviewFormWarningCode8M[];
  readonly recommendation: string;
}

export interface ManualPostMatchBoundaryAudit8M {
  readonly submitButtonCount: number;
  readonly backendActionCount: number;
  readonly localStorageCount: number;
  readonly databasePersistenceCount: number;
  readonly filePersistenceCount: number;
  readonly automaticClassificationCount: number;
  readonly futureEvidenceClaimCount: number;
  readonly fabricatedEvidenceCount: number;
  readonly seasonMemoryCount: number;
  readonly selectionInstructionCount: number;
  readonly tacticalInstructionCount: number;
  readonly sandboxPromotionCount: number;
  readonly diagnosticPromotionCount: number;
  readonly batchPromotionCount: number;
  readonly boundaryNotesVisible: boolean;
  readonly boundaryAuditWarningCodes: readonly ManualPostMatchObservationReviewFormWarningCode8M[];
  readonly recommendation: string;
}

export interface ManualReviewFormSourceOfTruthRegressionAudit8M {
  readonly baseline8LStatusPass: boolean;
  readonly baseline8KPreserved: boolean;
  readonly baseline8IPreserved: boolean;
  readonly baseline8LPreserved: boolean;
  readonly noScoreMutation: boolean;
  readonly noEventDeletion: boolean;
  readonly noScoringConstantChange: boolean;
  readonly MatchBonusEventUnchanged: boolean;
  readonly batchLiveSeparationPreserved: boolean;
  readonly formDoesNotClaimNewScoreEvidence: boolean;
  readonly formDoesNotCreateFutureEvidence: boolean;
  readonly sourceOfTruthWarningCodes: readonly ManualPostMatchObservationReviewFormWarningCode8M[];
  readonly recommendation: string;
}

export interface ManualReviewFormExportBudgetAudit8M {
  readonly exportReadTimeSecondsBefore8M: number;
  readonly exportReadTimeSecondsAfter8M: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly exportFormVisible: boolean;
  readonly exportMiniCardCount: number;
  readonly exportMetadataVersionVisible: boolean;
  readonly exportTitleMentions8M: boolean;
  readonly exportTitleNotOnly8I: boolean;
  readonly exportBudgetWarningCodes: readonly ManualPostMatchObservationReviewFormWarningCode8M[];
  readonly recommendation: string;
}

export interface ManualReviewFormIntegrationBudgetAudit8M {
  readonly productManualFormVisible: boolean;
  readonly exportManualFormVisible: boolean;
  readonly product8LStillVisible: boolean;
  readonly export8LStillVisible: boolean;
  readonly product8KStillVisible: boolean;
  readonly export8KStillVisible: boolean;
  readonly productStoryFirstStillVisible: boolean;
  readonly exportCompactPreserved: boolean;
  readonly productSectionOrderPreserved: boolean;
  readonly integrationWarningCodes: readonly ManualPostMatchObservationReviewFormWarningCode8M[];
  readonly recommendation: string;
}

export interface ManualReviewFormCoachUsabilityAudit8M {
  readonly manualInstructionsVisible: boolean;
  readonly coachCanFillAfterMatch: boolean;
  readonly fieldLabelsClearCount: number;
  readonly readonlyTextAreaCount: number;
  readonly staticCheckboxCount: number;
  readonly visibleCautionCount: number;
  readonly noSubmitFlowVisible: boolean;
  readonly usabilityWarningCodes: readonly ManualPostMatchObservationReviewFormWarningCode8M[];
  readonly recommendation: string;
}

export interface ManualPostMatchObservationReviewForm8MModel {
  readonly status: OfficialCausalityStatus;
  readonly scope: "MANUAL_POST_MATCH_OBSERVATION_REVIEW_FORM";
  readonly version: "MANUAL_POST_MATCH_OBSERVATION_REVIEW_FORM_8M";
  readonly baselineVersion: "COACH_REPORT_SEASONLESS_LEARNING_LOOP_OBSERVATION_OUTCOME_TRACKER_8L";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8L: CoachReportSeasonlessLearningLoopObservationOutcomeTracker8LModel;
  readonly baseline8LPreserved: boolean;
  readonly baseline8KPreserved: boolean;
  readonly baseline8IPreserved: boolean;
  readonly form: ManualPostMatchObservationReviewForm8M;
  readonly productFormHtml: string;
  readonly exportFormHtml: string;
  readonly productHtmlBefore8MClean: boolean;
  readonly exportHtmlBefore8MClean: boolean;
  readonly productHtmlAfter8M: string;
  readonly exportHtmlAfter8M: string;
  readonly productFormVisible: boolean;
  readonly exportFormVisible: boolean;
  readonly threeReviewSectionsVisible: boolean;
  readonly allSectionsLinkedTo8L: boolean;
  readonly allSectionsPendingBlankNotEvaluated: boolean;
  readonly fourOutcomeOptionsPerSection: boolean;
  readonly noDefaultCheckedOutcome: boolean;
  readonly noAutomaticOutcome: boolean;
  readonly evidenceFieldsVisible: boolean;
  readonly contextComparableFieldsVisible: boolean;
  readonly coachNotesFieldsVisible: boolean;
  readonly cautionFieldsVisible: boolean;
  readonly noPersistenceCreated: boolean;
  readonly noSubmitBackendCreated: boolean;
  readonly noFutureEvidenceClaim: boolean;
  readonly noSeasonMemoryCreated: boolean;
  readonly noSelectionOrTacticImposition: boolean;
  readonly noSandboxBatchPromotion: boolean;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportMetadataCurrentVersionVisible: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly formAudit: ManualPostMatchReviewFormAudit8M;
  readonly outcomeOptionAudit: ManualOutcomeOptionAudit8M;
  readonly boundaryAudit: ManualPostMatchBoundaryAudit8M;
  readonly sourceOfTruthRegressionAudit: ManualReviewFormSourceOfTruthRegressionAudit8M;
  readonly exportBudgetAudit: ManualReviewFormExportBudgetAudit8M;
  readonly integrationBudgetAudit: ManualReviewFormIntegrationBudgetAudit8M;
  readonly coachUsabilityAudit: ManualReviewFormCoachUsabilityAudit8M;
  readonly warningCodes: readonly ManualPostMatchObservationReviewFormWarningCode8M[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

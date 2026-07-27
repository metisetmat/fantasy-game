import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { StoryFirstExportBudgetValidationThresholdFix8IModel } from "./storyFirstExportBudgetValidationThresholdFixTypes8I";
import type { SharePackCompletionExportActionPlanRestoration8JModel } from "./sharePackCompletionExportActionPlanRestorationTypes8J";
import type { CoachReportDecisionLayerNextMatchObservationPlanWarningCode } from "./coachReportDecisionLayerNextMatchObservationPlanWarnings";

export type CoachDecisionPriorityLevel8K = "primary" | "secondary" | "watch";
export type CoachDecisionConfidence8K = "low" | "medium" | "high";
export type CoachDecisionSourceType8K = "official" | "official_with_limitation" | "trend_prudent" | "sandbox_excluded";
export type NextMatchObservationWindow8K = "next_match" | "next_two_matches" | "future_validation";
export type NextMatchObservationMoment8K =
  | "after_recovery"
  | "after_danger_entry"
  | "after_pressure"
  | "after_goalkeeper_action"
  | "late_match"
  | "general";
export type DecisionBoundaryPrevention8K =
  | "selection_imposition"
  | "tactic_imposition"
  | "sandbox_promotion"
  | "score_rewrite"
  | "overclaiming"
  | "single_match_overfit";

export interface CoachDecisionCard8K {
  readonly decisionCardId: string;
  readonly priorityLevel: CoachDecisionPriorityLevel8K;
  readonly title: string;
  readonly decisionQuestion: string;
  readonly whyThisMatters: string;
  readonly linkedStoryMomentIds: readonly string[];
  readonly linkedReplayMomentIds: readonly string[];
  readonly linkedActionPlanCardIds: readonly string[];
  readonly linkedTacticalMapCardIds: readonly string[];
  readonly linkedTrendIds: readonly string[];
  readonly observationFocus: string;
  readonly confirmationSignal: string;
  readonly disconfirmationSignal: string;
  readonly riskToWatch: string;
  readonly doNotOverInterpret: string;
  readonly evidenceBoundary: string;
  readonly confidence: CoachDecisionConfidence8K;
  readonly sourceType: CoachDecisionSourceType8K;
  readonly imposesSelection: boolean;
  readonly imposesTacticalPlan: boolean;
  readonly scoreChangeBackedWhereRelevant: boolean;
}

export interface NextMatchObservationItem8K {
  readonly observationItemId: string;
  readonly title: string;
  readonly linkedDecisionCardId: string;
  readonly whatToWatch: string;
  readonly whenToWatch: NextMatchObservationMoment8K;
  readonly whereToWatch: string;
  readonly replayReference: string;
  readonly tacticalMapReference: string;
  readonly positiveSignal: string;
  readonly negativeSignal: string;
  readonly minimumEvidenceNeeded: string;
  readonly cautionNote: string;
  readonly confidence: CoachDecisionConfidence8K;
}

export interface NextMatchObservationPlan8K {
  readonly observationPlanId: string;
  readonly title: string;
  readonly planSummary: string;
  readonly observationWindow: NextMatchObservationWindow8K;
  readonly observationItems: readonly NextMatchObservationItem8K[];
  readonly priorityOrder: readonly string[];
  readonly linkedDecisionCards: readonly string[];
  readonly confirmationMatrix: readonly string[];
  readonly disconfirmationMatrix: readonly string[];
  readonly evidenceBoundaries: readonly string[];
  readonly coachUsageInstructions: readonly string[];
  readonly notASelectionRecommendation: boolean;
  readonly notATacticalInstruction: boolean;
  readonly noSeasonMemoryRequired: boolean;
}

export interface DecisionBoundaryNote8K {
  readonly boundaryId: string;
  readonly label: string;
  readonly text: string;
  readonly appliesToDecisionCardIds: readonly string[];
  readonly prevents: readonly DecisionBoundaryPrevention8K[];
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface DecisionLayerWordingCleanup8K {
  readonly cleanupId: string;
  readonly targetSurface: "product_main_text" | "export_main_text" | "replay_export" | "decision_layer";
  readonly issueType: "duplicate_phrase" | "raw_id_leak" | "technical_label_leak" | "mechanical_phrase" | "overclaim" | "ambiguous_instruction";
  readonly beforeText: string;
  readonly afterText: string;
  readonly fixed: boolean;
  readonly warningCode: CoachReportDecisionLayerNextMatchObservationPlanWarningCode;
}

export interface CoachDecisionLayerAudit8K {
  readonly decisionLayerVisible: boolean;
  readonly decisionCardCount: number;
  readonly primaryDecisionPresent: boolean;
  readonly secondaryDecisionPresent: boolean;
  readonly watchDecisionPresent: boolean;
  readonly decisionCardsWithQuestionCount: number;
  readonly decisionCardsWithObservationFocusCount: number;
  readonly decisionCardsWithConfirmationSignalCount: number;
  readonly decisionCardsWithDisconfirmationSignalCount: number;
  readonly decisionCardsWithRiskCount: number;
  readonly decisionCardsWithDoNotOverInterpretCount: number;
  readonly decisionCardsLinkedToReplayCount: number;
  readonly decisionCardsLinkedToActionPlanCount: number;
  readonly decisionCardsLinkedToTacticalMapOrTrendCount: number;
  readonly decisionCardsWithEvidenceBoundaryCount: number;
  readonly decisionLayerWarningCodes: readonly CoachReportDecisionLayerNextMatchObservationPlanWarningCode[];
  readonly recommendation: string;
}

export interface NextMatchObservationPlanAudit8K {
  readonly nextMatchObservationPlanVisible: boolean;
  readonly observationItemCount: number;
  readonly observationItemsWithWhenToWatchCount: number;
  readonly observationItemsWithWhereToWatchCount: number;
  readonly observationItemsWithPositiveSignalCount: number;
  readonly observationItemsWithNegativeSignalCount: number;
  readonly observationItemsWithMinimumEvidenceCount: number;
  readonly observationItemsWithCautionNoteCount: number;
  readonly planSaysNotSelectionRecommendation: boolean;
  readonly planSaysNotTacticalInstruction: boolean;
  readonly planRequiresNoSeasonMemory: boolean;
  readonly observationPlanWarningCodes: readonly CoachReportDecisionLayerNextMatchObservationPlanWarningCode[];
  readonly recommendation: string;
}

export interface DecisionBoundaryAudit8K {
  readonly selectionImpositionCount: number;
  readonly tacticalPlanImpositionCount: number;
  readonly automaticLineupRecommendationCount: number;
  readonly sandboxPromotionCount: number;
  readonly diagnosticPromotionCount: number;
  readonly batchPromotionCount: number;
  readonly overclaimCount: number;
  readonly singleMatchOverfitCount: number;
  readonly boundaryNotesVisible: boolean;
  readonly decisionBoundaryWarningCodes: readonly CoachReportDecisionLayerNextMatchObservationPlanWarningCode[];
  readonly recommendation: string;
}

export interface DecisionLayerWordingCleanupAudit8K {
  readonly replayExportDuplicateTitleCount: number;
  readonly replayExportTruncatedSentenceCount: number;
  readonly replayExportMechanicalPhraseCount: number;
  readonly productRawIdMainTextCountBefore8K: number;
  readonly productRawIdMainTextCountAfter8K: number;
  readonly rawEventIdInProductMainTextCount: number;
  readonly rawPlayerIdInProductMainTextCount: number;
  readonly rawEffectLabelInProductMainTextCount: number;
  readonly technicalLabelInDecisionLayerCount: number;
  readonly decisionLayerMechanicalPhraseCount: number;
  readonly decisionLayerCoachReadabilityScore: number;
  readonly wordingCleanupWarningCodes: readonly CoachReportDecisionLayerNextMatchObservationPlanWarningCode[];
  readonly recommendation: string;
}

export interface DecisionLayerExportBudgetAudit8K {
  readonly exportReadTimeSecondsBefore8K: number;
  readonly exportReadTimeSecondsAfter8K: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly exportedDecisionLayerVisible: boolean;
  readonly exportedObservationItemsCount: number;
  readonly exportMandatorySectionsPreserved: boolean;
  readonly exportNoFullTimeline: boolean;
  readonly exportNoSandboxPanel: boolean;
  readonly exportNoLongBatchDiagnostics: boolean;
  readonly exportBudgetWarningCodes: readonly CoachReportDecisionLayerNextMatchObservationPlanWarningCode[];
  readonly recommendation: string;
}

export interface DecisionLayerSourceOfTruthRegressionAudit8K {
  readonly reportUsesOfficialTimelineOnlyForOfficialStory: boolean;
  readonly reportUsesOfficialScoreOnlyForOfficialScore: boolean;
  readonly reportScoreMatchesOfficialScore: boolean;
  readonly allStoryScoreClaimsBackedByScoreChange: boolean;
  readonly allReplayScoreClaimsBackedByScoreChange: boolean;
  readonly decisionLayerScoreClaimsBackedByScoreChange: boolean;
  readonly scoreChangeEventsCoveredByReplayCount: number;
  readonly scoreChangeEventCount: number;
  readonly sandboxExcludedFromOfficialStory: boolean;
  readonly batchExcludedFromOfficialStory: boolean;
  readonly diagnosticSeparatedFromOfficialStory: boolean;
  readonly sandboxDecisionPromotionCount: number;
  readonly diagnosticDecisionPromotionCount: number;
  readonly batchDecisionPromotionCount: number;
  readonly inventedDecisionFactCount: number;
  readonly unsupportedDecisionClaimCount: number;
  readonly noPostHocRewrite: boolean;
  readonly noScoreMutation: boolean;
  readonly noEventDeletion: boolean;
  readonly noForcedNarrativeOutcome: boolean;
  readonly sourceOfTruthWarningCodes: readonly CoachReportDecisionLayerNextMatchObservationPlanWarningCode[];
  readonly recommendation: string;
}

export interface DecisionLayerIntegrationBudgetAudit8K {
  readonly productDecisionLayerVisible: boolean;
  readonly exportDecisionLayerVisible: boolean;
  readonly productStoryFirstSectionVisible: boolean;
  readonly exportStoryFirstSectionVisible: boolean;
  readonly productReplaySectionVisible: boolean;
  readonly exportReplaySectionVisible: boolean;
  readonly productActionPlanVisible: boolean;
  readonly exportActionPlanVisible: boolean;
  readonly tacticalMapCardsStillVisible: boolean;
  readonly trendsStillVisible: boolean;
  readonly sourceOfTruthNoteVisible: boolean;
  readonly productSectionOrderPreserved: boolean;
  readonly exportCompactPreserved: boolean;
  readonly reportIntegrationWarningCodes: readonly CoachReportDecisionLayerNextMatchObservationPlanWarningCode[];
  readonly recommendation: string;
}

export interface CoachReportDecisionLayerNextMatchObservationPlan8KModel {
  readonly status: OfficialCausalityStatus;
  readonly scope: "COACH_REPORT_DECISION_LAYER_NEXT_MATCH_OBSERVATION_PLAN";
  readonly version: "COACH_REPORT_DECISION_LAYER_NEXT_MATCH_OBSERVATION_PLAN_8K";
  readonly baselineVersion: "STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX_8I";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8J: SharePackCompletionExportActionPlanRestoration8JModel;
  readonly baseline8I: StoryFirstExportBudgetValidationThresholdFix8IModel;
  readonly baseline8JPreserved: boolean;
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
  readonly decisionLayerReady: boolean;
  readonly nextMatchObservationPlanReady: boolean;
  readonly confirmationCriteriaReady: boolean;
  readonly disconfirmationCriteriaReady: boolean;
  readonly coachDecisionBoundariesReady: boolean;
  readonly replayDecisionLinksReady: boolean;
  readonly tacticalMapDecisionLinksReady: boolean;
  readonly actionPlanDecisionLinksReady: boolean;
  readonly decisionWordingClean: boolean;
  readonly productRawIdCleanupReady: boolean;
  readonly exportReplayWordingCleanupReady: boolean;
  readonly productStoryFirstPreserved: boolean;
  readonly exportCompactPreserved: boolean;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly numericThresholdGuardPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly decisionCards: readonly CoachDecisionCard8K[];
  readonly nextMatchObservationPlan: NextMatchObservationPlan8K;
  readonly boundaryNotes: readonly DecisionBoundaryNote8K[];
  readonly wordingCleanups: readonly DecisionLayerWordingCleanup8K[];
  readonly decisionLayerAudit: CoachDecisionLayerAudit8K;
  readonly nextMatchObservationPlanAudit: NextMatchObservationPlanAudit8K;
  readonly decisionBoundaryAudit: DecisionBoundaryAudit8K;
  readonly wordingCleanupAudit: DecisionLayerWordingCleanupAudit8K;
  readonly exportBudgetAudit: DecisionLayerExportBudgetAudit8K;
  readonly sourceOfTruthRegressionAudit: DecisionLayerSourceOfTruthRegressionAudit8K;
  readonly integrationBudgetAudit: DecisionLayerIntegrationBudgetAudit8K;
  readonly productDecisionLayerHtml: string;
  readonly exportDecisionLayerHtml: string;
  readonly cleanedProductHtml: string;
  readonly cleanedExportHtml: string;
  readonly warningCodes: readonly CoachReportDecisionLayerNextMatchObservationPlanWarningCode[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

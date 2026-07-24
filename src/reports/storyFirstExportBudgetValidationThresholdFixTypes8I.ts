import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReportStoryFirstRecomposition8HModel } from "./coachReportStoryFirstRecompositionTypes8H";
import type { StoryFirstExportBudgetValidationThresholdFixWarningCode } from "./storyFirstExportBudgetValidationThresholdFixWarnings";

export type NumericThresholdOperator =
  | "less_than"
  | "less_than_or_equal"
  | "greater_than"
  | "greater_than_or_equal"
  | "equal"
  | "not_equal";

export type NumericThresholdSeverity = "blocking" | "partial" | "warning";

export interface NumericThresholdValidationRule {
  readonly ruleId: string;
  readonly metricName: string;
  readonly actualValue: number;
  readonly operator: NumericThresholdOperator;
  readonly thresholdValue: number;
  readonly expectedPass: boolean;
  readonly actualPass: boolean;
  readonly violation: boolean;
  readonly severity: NumericThresholdSeverity;
  readonly failureMessage: string;
  readonly passMessage: string;
}

export interface ExportCompressionPlan8I {
  readonly planId: string;
  readonly beforeReadTimeSeconds: number;
  readonly targetReadTimeSeconds: number;
  readonly hardLimitSeconds: number;
  readonly idealLimitSeconds: number;
  readonly sectionsKept: readonly string[];
  readonly sectionsCompressed: readonly string[];
  readonly sectionsMovedToAppendix: readonly string[];
  readonly sectionsRemovedFromExport: readonly string[];
  readonly productOnlySections: readonly string[];
  readonly preservedStoryFirstOrder: boolean;
  readonly preservedSourceOfTruthNote: boolean;
  readonly preservedReplayMoments: number;
  readonly preservedActionPlanCards: number;
  readonly preservedTacticalMapCards: number;
  readonly estimatedAfterReadTimeSeconds: number;
  readonly compressionRisks: readonly string[];
  readonly recommendation: string;
}

export interface ExportBudgetThresholdAudit8I {
  readonly status: OfficialCausalityStatus;
  readonly exportReadTimeSecondsBefore8I: number;
  readonly exportReadTimeSecondsAfter8I: number;
  readonly exportReadTimeDelta: number;
  readonly hardLimitSeconds: number;
  readonly idealLimitSeconds: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly hardLimitViolated: boolean;
  readonly idealLimitViolated: boolean;
  readonly mandatoryThresholdPass: boolean;
  readonly idealThresholdPass: boolean;
  readonly numericRules: readonly NumericThresholdValidationRule[];
  readonly exportBudgetWarningCodes: readonly StoryFirstExportBudgetValidationThresholdFixWarningCode[];
  readonly recommendation: string;
}

export interface NumericValidationHonestyAudit8I {
  readonly status: OfficialCausalityStatus;
  readonly numericRuleCount: number;
  readonly numericRulePassCount: number;
  readonly numericRuleViolationCount: number;
  readonly passMessageOnFailedRuleCount: number;
  readonly failedRuleMarkedPassCount: number;
  readonly thresholdBooleanMismatchCount: number;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly validationStatusMatchesThresholds: boolean;
  readonly validationHonestyWarningCodes: readonly StoryFirstExportBudgetValidationThresholdFixWarningCode[];
  readonly recommendation: string;
}

export interface StoryFirstExportContentAudit8I {
  readonly status: OfficialCausalityStatus;
  readonly exportStoryFirstSectionVisible: boolean;
  readonly coverVisible: boolean;
  readonly expressReadVisible: boolean;
  readonly matchIn2MinutesVisible: boolean;
  readonly replay60SecondsVisible: boolean;
  readonly actionPlanVisible: boolean;
  readonly actionPlanNonEmpty: boolean;
  readonly exportActionPlanCardCount: number;
  readonly truncatedSentenceCount: number;
  readonly ellipsisTruncationCount: number;
  readonly tacticalMapEssentialsVisible: boolean;
  readonly sourceOfTruthNoteVisible: boolean;
  readonly fullTimelineIncludedInExport: boolean;
  readonly technicalTraceabilityIncludedInExport: boolean;
  readonly sandboxPanelIncludedInExport: boolean;
  readonly longBatchDiagnosticsIncludedInExport: boolean;
  readonly rawEventIdInMainTextCount: number;
  readonly repeatedSourceOfTruthSentenceCount: number;
  readonly exportContentWarningCodes: readonly StoryFirstExportBudgetValidationThresholdFixWarningCode[];
  readonly recommendation: string;
}

export interface StoryFirstProductPreservationAudit8I {
  readonly status: OfficialCausalityStatus;
  readonly productStoryFirstSectionVisible: boolean;
  readonly productReplaySectionVisible: boolean;
  readonly productActionPlanVisible: boolean;
  readonly productTechnicalDetailsStillAvailable: boolean;
  readonly productSandboxDetailsStillSeparated: boolean;
  readonly productTimelineStillAvailableIfPreviouslyPresent: boolean;
  readonly productRawIdMainTextCount: number;
  readonly productStoryFirstOrderPreserved: boolean;
  readonly productPreservationWarningCodes: readonly StoryFirstExportBudgetValidationThresholdFixWarningCode[];
  readonly recommendation: string;
}

export interface SourceOfTruthRegressionAudit8I {
  readonly status: OfficialCausalityStatus;
  readonly reportUsesOfficialTimelineOnlyForOfficialStory: boolean;
  readonly reportUsesOfficialScoreOnlyForOfficialScore: boolean;
  readonly reportScoreMatchesOfficialScore: boolean;
  readonly allStoryScoreClaimsBackedByScoreChange: boolean;
  readonly allReplayScoreClaimsBackedByScoreChange: boolean;
  readonly scoreChangeEventsCoveredByReplayCount: number;
  readonly scoreChangeEventCount: number;
  readonly sandboxExcludedFromOfficialStory: boolean;
  readonly batchExcludedFromOfficialStory: boolean;
  readonly diagnosticSeparatedFromOfficialStory: boolean;
  readonly sandboxStoryPromotionCount: number;
  readonly diagnosticStoryPromotionCount: number;
  readonly batchStoryPromotionCount: number;
  readonly inventedStoryMomentCount: number;
  readonly unsupportedTruthClaimCount: number;
  readonly noPostHocRewrite: boolean;
  readonly noScoreMutation: boolean;
  readonly noEventDeletion: boolean;
  readonly noForcedNarrativeOutcome: boolean;
  readonly sourceOfTruthWarningCodes: readonly StoryFirstExportBudgetValidationThresholdFixWarningCode[];
  readonly recommendation: string;
}

export interface StoryFirstExportMobilePrintAudit8I {
  readonly status: OfficialCausalityStatus;
  readonly exportPrintReady: boolean;
  readonly exportPageBreaksControlled: boolean;
  readonly exportNoHorizontalOverflow: boolean;
  readonly exportCardsStackOnMobile: boolean;
  readonly exportReplayReadableOnMobile: boolean;
  readonly exportActionPlanReadableOnMobile: boolean;
  readonly exportTechnicalAppendixCompact: boolean;
  readonly exportMobilePrintWarningCodes: readonly StoryFirstExportBudgetValidationThresholdFixWarningCode[];
  readonly recommendation: string;
}

export interface StoryFirstExportBudgetValidationThresholdFix8IModel {
  readonly status: OfficialCausalityStatus;
  readonly scope: "STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX";
  readonly version: "STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX_8I";
  readonly baselineVersion: "COACH_REPORT_STORY_FIRST_PRODUCT_RECOMPOSITION_8H";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8H: CoachReportStoryFirstRecomposition8HModel;
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
  readonly exportBudgetFixed: boolean;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly numericThresholdGuardReady: boolean;
  readonly validationHonestyReady: boolean;
  readonly storyFirstExportPreserved: boolean;
  readonly productStoryFirstPreserved: boolean;
  readonly replayExportPreserved: boolean;
  readonly actionPlanExportPreserved: boolean;
  readonly tacticalMapExportPreserved: boolean;
  readonly technicalExportCompressionReady: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly compressionPlan: ExportCompressionPlan8I;
  readonly exportBudgetAudit: ExportBudgetThresholdAudit8I;
  readonly numericValidationHonestyAudit: NumericValidationHonestyAudit8I;
  readonly exportContentAudit: StoryFirstExportContentAudit8I;
  readonly productPreservationAudit: StoryFirstProductPreservationAudit8I;
  readonly sourceOfTruthRegressionAudit: SourceOfTruthRegressionAudit8I;
  readonly mobilePrintAudit: StoryFirstExportMobilePrintAudit8I;
  readonly compressedExportHtml: string;
  readonly warningCodes: readonly StoryFirstExportBudgetValidationThresholdFixWarningCode[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

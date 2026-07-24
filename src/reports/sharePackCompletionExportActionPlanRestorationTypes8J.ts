import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { StoryFirstExportBudgetValidationThresholdFix8IModel } from "./storyFirstExportBudgetValidationThresholdFixTypes8I";
import type { SharePackCompletionExportActionPlanRestorationWarningCode } from "./sharePackCompletionExportActionPlanRestorationWarnings";

export interface SharePack8ICompletionAudit {
  readonly sharePackStatus: OfficialCausalityStatus;
  readonly sharePackMode: string;
  readonly currentSprintName: string;
  readonly expectedSprintName: string;
  readonly currentSprintMatchesExpected: boolean;
  readonly finalFileCount: number;
  readonly shareFileCount: number;
  readonly maxFileCount: number;
  readonly missingExpected8IFiles: readonly string[];
  readonly stale8HFileCount: number;
  readonly stale8HReferencesInValidationCount: number;
  readonly stale8HReferencesInManifestCount: number;
  readonly stale8HReferencesInReadmeCount: number;
  readonly expected8IDocIncluded: boolean;
  readonly expected8IValidationIncluded: boolean;
  readonly readme8IOriented: boolean;
  readonly manifest8IOriented: boolean;
  readonly shareValidation8IOriented: boolean;
  readonly sharePackWarningCodes: readonly SharePackCompletionExportActionPlanRestorationWarningCode[];
  readonly recommendation: string;
}

export interface ExportActionPlanRestorationAudit8J {
  readonly exportActionPlanSectionVisible: boolean;
  readonly exportActionPlanCardCount: number;
  readonly emptyActionPlanGridCount: number;
  readonly actionPlanCardsWithObservationCount: number;
  readonly actionPlanCardsWithWorkFocusCount: number;
  readonly actionPlanCardsWithSignalToCheckCount: number;
  readonly actionPlanCardsWithRiskCount: number;
  readonly actionPlanCardsWithSourceBoundaryCount: number;
  readonly actionPlanImposesSelectionCount: number;
  readonly actionPlanImposesTacticalPlanCount: number;
  readonly exportActionPlanWarningCodes: readonly SharePackCompletionExportActionPlanRestorationWarningCode[];
  readonly recommendation: string;
}

export interface ReplayExportWordingCleanupAudit8J {
  readonly replay60SecondsVisible: boolean;
  readonly replayMomentCount: number;
  readonly truncatedSentenceCount: number;
  readonly ellipsisTruncationCount: number;
  readonly incompleteSentenceCount: number;
  readonly replayMomentWithScoreContextCount: number;
  readonly replayMomentWithActorRoleCount: number;
  readonly replayMomentWithProofCount: number;
  readonly rawPlayerIdInReplayMainTextCount: number;
  readonly rawEventIdInReplayMainTextCount: number;
  readonly rawEffectLabelInReplayMainTextCount: number;
  readonly replayExportWordingWarningCodes: readonly SharePackCompletionExportActionPlanRestorationWarningCode[];
  readonly recommendation: string;
}

export interface ExportThresholdProofAudit8J {
  readonly exportReadTimeSecondsBefore8I: number;
  readonly exportReadTimeSecondsAfter8I: number;
  readonly exportReadTimeSecondsAfter8J: number;
  readonly hardLimitSeconds: number;
  readonly idealLimitSeconds: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly hardLimitViolated: boolean;
  readonly idealLimitViolated: boolean;
  readonly passMessageOnFailedNumericRuleCount: number;
  readonly failedNumericRuleMarkedPassCount: number;
  readonly thresholdBooleanMismatchCount: number;
  readonly validationStatusMatchesThresholds: boolean;
  readonly numericThresholdWarningCodes: readonly SharePackCompletionExportActionPlanRestorationWarningCode[];
  readonly recommendation: string;
}

export interface ExportCompactContentCompletenessAudit8J {
  readonly exportStoryFirstSectionVisible: boolean;
  readonly coverVisible: boolean;
  readonly expressReadVisible: boolean;
  readonly matchIn2MinutesVisible: boolean;
  readonly replay60SecondsVisible: boolean;
  readonly actionPlanVisible: boolean;
  readonly actionPlanNonEmpty: boolean;
  readonly tacticalMapEssentialsVisible: boolean;
  readonly sourceOfTruthNoteVisible: boolean;
  readonly compactAppendixVisible: boolean;
  readonly fullTimelineIncludedInExport: boolean;
  readonly technicalTraceabilityIncludedInExport: boolean;
  readonly sandboxPanelIncludedInExport: boolean;
  readonly longBatchDiagnosticsIncludedInExport: boolean;
  readonly productReportBodyEmbeddedInExport: boolean;
  readonly rawEventIdInMainTextCount: number;
  readonly repeatedSourceOfTruthSentenceCount: number;
  readonly exportCompactContentWarningCodes: readonly SharePackCompletionExportActionPlanRestorationWarningCode[];
  readonly recommendation: string;
}

export interface SharePackCompletionExportActionPlanRestoration8JModel {
  readonly status: OfficialCausalityStatus;
  readonly scope: "SHARE_PACK_COMPLETION_EXPORT_ACTION_PLAN_RESTORATION";
  readonly version: "SHARE_PACK_COMPLETION_EXPORT_ACTION_PLAN_RESTORATION_8J";
  readonly baselineVersion: "STORY_FIRST_EXPORT_BUDGET_VALIDATION_THRESHOLD_FIX_8I";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8I: StoryFirstExportBudgetValidationThresholdFix8IModel;
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
  readonly sharePackCurrentSprintFixed: boolean;
  readonly sharePack8IDocsIncluded: boolean;
  readonly validation8IIncluded: boolean;
  readonly exportThresholdValidationReady: boolean;
  readonly exportActionPlanRestored: boolean;
  readonly replayExportWordingClean: boolean;
  readonly exportBudgetStillValid: boolean;
  readonly productStoryFirstPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly sharePackCompletionAudit: SharePack8ICompletionAudit;
  readonly exportThresholdProofAudit: ExportThresholdProofAudit8J;
  readonly exportActionPlanRestorationAudit: ExportActionPlanRestorationAudit8J;
  readonly replayExportWordingCleanupAudit: ReplayExportWordingCleanupAudit8J;
  readonly exportCompactContentCompletenessAudit: ExportCompactContentCompletenessAudit8J;
  readonly warningCodes: readonly SharePackCompletionExportActionPlanRestorationWarningCode[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

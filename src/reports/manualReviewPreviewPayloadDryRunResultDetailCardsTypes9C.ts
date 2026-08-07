import type { ManualReviewPreviewPayloadDryRunResultKind9A } from "./manualReviewPreviewPayloadDryRunValidatorTypes9A";
import type { ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel } from "./manualReviewPreviewPayloadDryRunResultRendererTypes9B";
import type { ManualReviewPreviewPayloadDryRunResultDetailCardsWarningCode9C } from "./manualReviewPreviewPayloadDryRunResultDetailCardsWarnings9C";

export type ManualReviewPreviewPayloadDryRunResultDetailCardsStatus9C = "PASS" | "PARTIAL" | "FAIL";
export type ManualReviewPreviewPayloadDryRunResultDetailCardMode9C = "dry_run_result_detail_cards_only";
export type ManualReviewPreviewPayloadDryRunResultDetailCardStatus9C =
  | "detail_cards_rendered_without_preview_activation"
  | "partial"
  | "blocked";
export type ManualReviewPreviewPayloadDryRunResultDetailCardsWordingStatus9C =
  | "pass_strong"
  | "pass"
  | "partial"
  | "fail";
export type ManualReviewPreviewPayloadDryRunResultDetailCardsSeverity9C = "info" | "warning" | "blocking";
export type ManualReviewPreviewPayloadDryRunResultDetailCardBlockedNextStep9C =
  | "payload_acceptance"
  | "preview_generation"
  | "runtime_validation"
  | "submit"
  | "api_backend"
  | "persistence"
  | "official_truth"
  | "decision_automation"
  | "selection_tactic"
  | "score_timeline_mutation";

export interface ManualReviewPreviewPayloadDryRunResultDetailCard9C {
  readonly cardId: string;
  readonly source9BRowId: string;
  readonly source9ACaseId: string;
  readonly groupId: string;
  readonly title: string;
  readonly subtitle: string;
  readonly caseKind: string;
  readonly resultKind: ManualReviewPreviewPayloadDryRunResultKind9A;
  readonly coachFacingStatusLabel: string;
  readonly coachFacingSummary: string;
  readonly whyThisCaseExists: string;
  readonly futureValidatorWouldCheck: string;
  readonly expectedErrorStateIds: readonly string[];
  readonly expectedBlockerIds: readonly string[];
  readonly expectedBoundaryGuardIds: readonly string[];
  readonly expectedRefusalStateIds: readonly string[];
  readonly coachFacingErrorMessage: string;
  readonly technicalMessage: string;
  readonly protectedBoundary: string;
  readonly blockedNextStep: readonly ManualReviewPreviewPayloadDryRunResultDetailCardBlockedNextStep9C[];
  readonly severity: ManualReviewPreviewPayloadDryRunResultDetailCardsSeverity9C;
  readonly canCreatePayloadIn9C: false;
  readonly canAcceptPayloadIn9C: false;
  readonly canGeneratePreviewIn9C: false;
  readonly canPersistIn9C: false;
  readonly canPromoteOfficialTruthIn9C: false;
  readonly canDriveDecisionIn9C: false;
  readonly canDriveSelectionIn9C: false;
  readonly canDriveTacticIn9C: false;
  readonly canMutateScoreIn9C: false;
  readonly canMutateTimelineIn9C: false;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewPreviewPayloadDryRunResultDetailCardGroup9C {
  readonly groupId: string;
  readonly source9BGroupId: string;
  readonly label: string;
  readonly coachFacingMeaning: string;
  readonly detailCardIds: readonly string[];
  readonly cardCount: number;
  readonly severity: ManualReviewPreviewPayloadDryRunResultDetailCardsSeverity9C;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewPreviewPayloadDryRunResultDetailCoverageView9C {
  readonly coverageViewId: string;
  readonly detailRuleCoverageCount: number;
  readonly detailRuleCoverageExpected: 20;
  readonly uncoveredDetailRuleIds: readonly string[];
  readonly detailErrorCoverageCount: number;
  readonly detailErrorCoverageExpected: 19;
  readonly uncoveredDetailErrorStateIds: readonly string[];
  readonly detailBlockerCoverageCount: number;
  readonly detailBlockerCoverageExpected: 12;
  readonly uncoveredDetailBlockerIds: readonly string[];
  readonly detailBoundaryGuardCoverageCount: number;
  readonly detailBoundaryGuardCoverageExpected: 14;
  readonly uncoveredDetailBoundaryGuardIds: readonly string[];
  readonly detailRefusalStateCoverageCount: number;
  readonly detailRefusalStateCoverageExpected: 8;
  readonly uncoveredDetailRefusalStateIds: readonly string[];
  readonly coverageCoachFacingSummary: string;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewPreviewPayloadDryRunResultDetailBoundaryView9C {
  readonly boundaryViewId: string;
  readonly acceptedPayloadCount: number;
  readonly acceptedPayloadClaimCount: number;
  readonly previewGeneratedCount: number;
  readonly previewGeneratedClaimCount: number;
  readonly payloadCreatedCount: number;
  readonly payloadCreatedClaimCount: number;
  readonly runtimeValidationCount: number;
  readonly runtimeValidationClaimCount: number;
  readonly realPayloadReadCount: number;
  readonly persistenceCount: number;
  readonly officialTruthPromotionCount: number;
  readonly automationCount: number;
  readonly selectionOrTacticCount: number;
  readonly scoreMutationCount: number;
  readonly timelineMutationCount: number;
  readonly scoreChangeCreationCount: number;
  readonly eventMutationCount: number;
  readonly boundaryCoachFacingSummary: string;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewPreviewPayloadDryRunResultDetailCardsReadinessSummary9C {
  readonly summaryId: string;
  readonly detailCardStatus: ManualReviewPreviewPayloadDryRunResultDetailCardStatus9C;
  readonly expectedDetailCardStatus: "detail_cards_rendered_without_preview_activation";
  readonly statusReason: string;
  readonly detailCardCount: number;
  readonly detailCardGroupCount: number;
  readonly validCaseDetailCardRenderedAsNotAccepted: boolean;
  readonly detailCoverageStillComplete: boolean;
  readonly whatIsReady: readonly string[];
  readonly whatIsBlocked: readonly string[];
  readonly whatFutureSprintCanDo: readonly string[];
  readonly coachFacingReadout: string;
  readonly visibleInProduct: boolean;
  readonly visibleInExport: boolean;
}

export interface ManualReviewPreviewPayloadDryRunResultDetailCardsWithoutPreviewActivation9CModel {
  readonly status: ManualReviewPreviewPayloadDryRunResultDetailCardsStatus9C;
  readonly scope: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_RESULT_DETAIL_CARDS_WITHOUT_PREVIEW_ACTIVATION";
  readonly version: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_RESULT_DETAIL_CARDS_9C";
  readonly baselineVersion: "MANUAL_REVIEW_PREVIEW_PAYLOAD_DRY_RUN_RESULT_RENDERER_9B";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline9B: ManualReviewPreviewPayloadDryRunResultRendererWithoutPreviewActivation9BModel;
  readonly baseline9BPreserved: boolean;
  readonly baseline9APreserved: boolean;
  readonly baseline8ZPreserved: boolean;
  readonly baseline8YPreserved: boolean;
  readonly baseline8XPreserved: boolean;
  readonly baseline8WPreserved: boolean;
  readonly baseline8VPreserved: boolean;
  readonly baseline8UPreserved: boolean;
  readonly baseline8TPreserved: boolean;
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
  readonly dryRunResultDetailCardsReady: boolean;
  readonly productDryRunResultDetailCardsVisible: boolean;
  readonly exportDryRunResultDetailCardsVisible: boolean;
  readonly detailCardsUseResultRenderer9B: true;
  readonly detailCardsUseDryRunValidator9A: true;
  readonly detailCardsUseValidationContract8Y: true;
  readonly detailCardsUsePayloadContract8X: true;
  readonly detailCardMode: ManualReviewPreviewPayloadDryRunResultDetailCardMode9C;
  readonly detailCardStatus: ManualReviewPreviewPayloadDryRunResultDetailCardStatus9C;
  readonly expectedDetailCardStatus: "detail_cards_rendered_without_preview_activation";
  readonly detailCardStatusCorrect: boolean;
  readonly detailCardCount: number;
  readonly detailCardCountExpected: 16;
  readonly detailCardGroupCount: number;
  readonly detailCardGroupCountExpected: 3;
  readonly passButNotAcceptedDetailCardCount: number;
  readonly failValidationDetailCardCount: number;
  readonly blockPreviewDetailCardCount: number;
  readonly detailCardWithCoachMessageCount: number;
  readonly detailCardWithTechnicalMessageCount: number;
  readonly detailCardWithBoundaryExplanationCount: number;
  readonly detailCardWithBlockedNextStepCount: number;
  readonly detailCardWithErrorMappingCount: number;
  readonly detailCardWithBlockerMappingCount: number;
  readonly detailCardWithRefusalMappingCount: number;
  readonly detailCardWithSeverityCount: number;
  readonly validCaseDetailCardRenderedAsNotAccepted: boolean;
  readonly acceptedPayloadClaimCount: number;
  readonly previewGeneratedClaimCount: number;
  readonly payloadCreatedClaimCount: number;
  readonly runtimeValidationClaimCount: number;
  readonly ambiguousDetailCardWordingCount: number;
  readonly wordingReadabilityScore: number;
  readonly wordingPassThreshold: 90;
  readonly wordingPassStrongThreshold: 95;
  readonly wordingThresholdStatus: ManualReviewPreviewPayloadDryRunResultDetailCardsWordingStatus9C;
  readonly wordingThresholdStatusCorrect: boolean;
  readonly detailRuleCoverageCount: number;
  readonly detailRuleCoverageExpected: 20;
  readonly detailErrorCoverageCount: number;
  readonly detailErrorCoverageExpected: 19;
  readonly detailBlockerCoverageCount: number;
  readonly detailBlockerCoverageExpected: 12;
  readonly detailBoundaryGuardCoverageCount: number;
  readonly detailBoundaryGuardCoverageExpected: 14;
  readonly detailRefusalStateCoverageCount: number;
  readonly detailRefusalStateCoverageExpected: 8;
  readonly uncoveredDetailRuleIds: readonly string[];
  readonly uncoveredDetailErrorStateIds: readonly string[];
  readonly uncoveredDetailBlockerIds: readonly string[];
  readonly uncoveredDetailBoundaryGuardIds: readonly string[];
  readonly uncoveredDetailRefusalStateIds: readonly string[];
  readonly detailCoverageStillComplete: boolean;
  readonly validationRuntimeActive: false;
  readonly payloadValidationRuntimeDetected: false;
  readonly validationExecutionCount: number;
  readonly realPayloadReadCount: number;
  readonly payloadCreated: false;
  readonly realPayloadInstanceCount: number;
  readonly dryRunAcceptedPayloadCount: number;
  readonly realInputActivated: false;
  readonly realPreviewGenerated: false;
  readonly previewActivationCount: number;
  readonly submitCreated: false;
  readonly apiCreated: false;
  readonly backendCreated: false;
  readonly storageCreated: false;
  readonly memoryCreated: false;
  readonly draftCreated: false;
  readonly historyCreated: false;
  readonly officialTruthPromoted: false;
  readonly automaticDecisionCreated: false;
  readonly selectionDriven: false;
  readonly tacticalInstructionDriven: false;
  readonly scoreMutationCount: number;
  readonly timelineMutationCount: number;
  readonly scoreChangeCreationCount: number;
  readonly eventMutationCount: number;
  readonly resultRendererStatusFrom9B: "rendered_without_preview_activation";
  readonly dryRunStatusFrom9A: "documented_dry_run_only";
  readonly validationContractStatusFrom8Y: "documented_but_not_executable";
  readonly payloadContractStatusFrom8X: "documented_but_not_instantiated";
  readonly previewActivationStatusFrom8W: "documented_but_blocked";
  readonly fieldVisualReadinessStatusFrom8V: "ready_for_static_visual_review";
  readonly workflowReadinessStatusFrom8R: "ready_for_non_persistent_preview";
  readonly reviewGateStatusFrom8Q: "needs_completion";
  readonly auditConsistencyStatusFrom8Z: "PASS_STRONG";
  readonly readinessDistinctFromReviewGateStillVisible: boolean;
  readonly detailCardsDistinctFromRuntimeValidation: boolean;
  readonly detailCardsDistinctFromPayloadAcceptance: boolean;
  readonly detailCardsDistinctFromPreviewGeneration: boolean;
  readonly detailCardsMarkedReadOnly: boolean;
  readonly detailCardsMarkedNonRuntime: boolean;
  readonly detailCardsMarkedNonOfficial: boolean;
  readonly detailCardsMarkedNotPersisted: boolean;
  readonly detailCardsMarkedNotApplied: boolean;
  readonly productStoryFirstPreserved: boolean;
  readonly exportCompactPreserved: boolean;
  readonly exportMetadataCurrent9CVisible: boolean;
  readonly exportReadTimeSecondsAfter9C: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly exportUnder900BooleanCorrect: boolean;
  readonly exportUnder800BooleanCorrect: boolean;
  readonly numericThresholdGuardPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly sharePackPass: boolean;
  readonly detailCards: readonly ManualReviewPreviewPayloadDryRunResultDetailCard9C[];
  readonly detailCardGroups: readonly ManualReviewPreviewPayloadDryRunResultDetailCardGroup9C[];
  readonly coverageView: ManualReviewPreviewPayloadDryRunResultDetailCoverageView9C;
  readonly boundaryView: ManualReviewPreviewPayloadDryRunResultDetailBoundaryView9C;
  readonly readinessSummary: ManualReviewPreviewPayloadDryRunResultDetailCardsReadinessSummary9C;
  readonly productDryRunResultDetailCardsHtml: string;
  readonly exportDryRunResultDetailCardsHtml: string;
  readonly productHtmlAfter9C: string;
  readonly exportHtmlAfter9C: string;
  readonly warningCodes: readonly ManualReviewPreviewPayloadDryRunResultDetailCardsWarningCode9C[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReplayUXIteration8GModel } from "./coachReplayUXIterationTypes8G";
import type { CoachReportStoryFirstRecompositionWarningCode } from "./coachReportStoryFirstRecompositionWarnings";
import type { ValidationConsistencyCleanupAudit8H } from "./validationConsistencyCleanupAudit8H";
import type { StoryFirstSectionOrderAudit8H } from "./storyFirstSectionOrderAudit8H";
import type { CoachReadFlowAudit8H } from "./coachReadFlowAudit8H";
import type { StoryFirstReplayPreservationAudit8H } from "./storyFirstReplayPreservationAudit8H";
import type { StoryFirstEvidenceBoundaryAudit8H } from "./storyFirstEvidenceBoundaryAudit8H";
import type { StoryFirstMobilePrintExportAudit8H } from "./storyFirstMobilePrintExportAudit8H";
import type { StoryFirstSourceOfTruthRegressionAudit8H } from "./storyFirstSourceOfTruthRegressionAudit8H";
import type { StoryFirstReportIntegrationBudgetAudit8H } from "./storyFirstReportIntegrationBudgetAudit8H";

export interface CoachReportStoryEntry {
  readonly storyEntryId: string;
  readonly title: string;
  readonly subtitle: string;
  readonly officialScore: string;
  readonly shortNarrative: string;
  readonly priorityMoments: readonly string[];
  readonly replayLinkAnchor: string;
  readonly sourceOfTruthNote: string;
  readonly readTimeSeconds: number;
  readonly coachQuestionAnswered: string;
}

export interface StoryFirstReportSectionOrder {
  readonly sectionOrderId: string;
  readonly orderedSections: readonly string[];
  readonly primaryStorySections: readonly string[];
  readonly coachDecisionSections: readonly string[];
  readonly evidenceSections: readonly string[];
  readonly technicalAppendixSections: readonly string[];
  readonly storyFirstScore: number;
  readonly technicalBeforeStoryCount: number;
  readonly actionPlanPosition: number;
  readonly replayPosition: number;
  readonly evidencePosition: number;
  readonly technicalAppendixPosition: number;
  readonly recommendation: string;
}

export interface CoachReportReadFlow {
  readonly readFlowId: string;
  readonly steps: readonly string[];
  readonly estimatedReadTimeSeconds: number;
  readonly coachIntent: readonly (
    | "understand_match"
    | "review_turning_points"
    | "decide_training_focus"
    | "inspect_evidence"
  )[];
  readonly firstActionableSection: string;
  readonly firstTechnicalSection: string;
  readonly technicalBeforeActionPlanCount: number;
  readonly storyBeforeEvidenceReady: boolean;
  readonly recommendation: string;
}

export interface CoachReportStoryFirstRecomposition8HModel {
  readonly status: OfficialCausalityStatus;
  readonly scope: "COACH_REPORT_STORY_FIRST_PRODUCT_RECOMPOSITION";
  readonly version: "COACH_REPORT_STORY_FIRST_PRODUCT_RECOMPOSITION_8H";
  readonly baselineVersion: "COACH_REPLAY_UX_ITERATION_8G";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8G: CoachReplayUXIteration8GModel;
  readonly validationConsistencyAudit: ValidationConsistencyCleanupAudit8H;
  readonly sectionOrder: StoryFirstReportSectionOrder;
  readonly storyEntry: CoachReportStoryEntry;
  readonly readFlow: CoachReportReadFlow;
  readonly sectionOrderAudit: StoryFirstSectionOrderAudit8H;
  readonly readFlowAudit: CoachReadFlowAudit8H;
  readonly replayPreservationAudit: StoryFirstReplayPreservationAudit8H;
  readonly evidenceBoundaryAudit: StoryFirstEvidenceBoundaryAudit8H;
  readonly mobilePrintExportAudit: StoryFirstMobilePrintExportAudit8H;
  readonly sourceOfTruthRegressionAudit: StoryFirstSourceOfTruthRegressionAudit8H;
  readonly integrationBudgetAudit: StoryFirstReportIntegrationBudgetAudit8H;
  readonly validationConsistencyCleanupReady: boolean;
  readonly storyFirstLayoutReady: boolean;
  readonly replayEntryPointReady: boolean;
  readonly coachReadFlowReady: boolean;
  readonly reportSectionOrderReady: boolean;
  readonly actionPlanStillProminent: boolean;
  readonly technicalSectionsDemoted: boolean;
  readonly evidenceDisclosureReady: boolean;
  readonly exportStoryFirstReady: boolean;
  readonly mobileStoryFirstReady: boolean;
  readonly printStoryFirstReady: boolean;
  readonly naturalReplayContentPreserved: boolean;
  readonly actorMappingPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly exportLengthPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly warningCodes: readonly CoachReportStoryFirstRecompositionWarningCode[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

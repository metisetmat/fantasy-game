import type { EventId, SequenceId, TeamId } from "../core/ids";
import type { OfficialCausalityConfidence, OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { ReplayActorMappingNaturalNarrativeFix8FModel } from "./replayActorMappingNaturalMatchNarrativeFix8F";
import type { CoachReplayEvidenceDisclosureAudit8G } from "./coachReplayEvidenceDisclosureAudit8G";
import type { CoachReplayIntegrationBudgetAudit8G } from "./coachReplayIntegrationBudgetAudit8G";
import type { CoachReplayMobilePrintAudit8G } from "./coachReplayMobilePrintAudit8G";
import type { CoachReplayPriorityAudit8G } from "./coachReplayPriorityAudit8G";
import type { CoachReplaySourceOfTruthRegressionAudit8G } from "./coachReplaySourceOfTruthRegressionAudit8G";
import type { CoachReplayUXHierarchyAudit8G } from "./coachReplayUXHierarchyAudit8G";
import type { CoachReplayWordingUXAudit8G } from "./coachReplayWordingUXAudit8G";
import type { CoachReplayUXIterationWarningCode } from "./coachReplayUXIterationWarnings";

export type CoachReplayPriorityLevel8G = "primary" | "secondary" | "context";

export type CoachReplayPriorityReason8G =
  | "first_score"
  | "opponent_response"
  | "lead_change"
  | "final_lock"
  | "fatigue_context"
  | "danger_context";

export type CoachReplayVisualState8G =
  | "score_change"
  | "response"
  | "final_lock"
  | "context"
  | "fatigue_context";

export type CoachReplayUXSourceBadge8G =
  | "official_score_change"
  | "official_context"
  | "official_with_limitation";

export interface CoachReplayPriorityMoment {
  readonly priorityMomentId: string;
  readonly replayMomentId: string;
  readonly minute: string;
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly title: string;
  readonly priorityLevel: CoachReplayPriorityLevel8G;
  readonly priorityReason: CoachReplayPriorityReason8G;
  readonly teamId: TeamId;
  readonly actorLabel: string;
  readonly roleLabel: string;
  readonly zoneLabel: string;
  readonly oneSentenceCoachRead: string;
  readonly proofSummary: string;
  readonly limitationSummary: string;
  readonly evidenceEventIds: readonly EventId[];
  readonly scoreChangeBacked: boolean;
  readonly confidence: OfficialCausalityConfidence;
}

export interface CoachReplayTimelineRailMoment {
  readonly replayMomentId: string;
  readonly minuteLabel: string;
  readonly scoreLabel: string;
  readonly title: string;
  readonly teamId: TeamId;
  readonly visualState: CoachReplayVisualState8G;
}

export interface CoachReplayTimelineRail {
  readonly timelineRailId: string;
  readonly matchId: string;
  readonly officialScore: string;
  readonly moments: readonly CoachReplayTimelineRailMoment[];
  readonly scoreMilestones: readonly CoachReplayTimelineRailMoment[];
  readonly contextMoments: readonly CoachReplayTimelineRailMoment[];
  readonly timelineNarrative: string;
  readonly sourceOfTruthNote: string;
}

export interface CoachReplayMomentCardUX {
  readonly cardId: string;
  readonly replayMomentId: string;
  readonly displayIndex: number;
  readonly priorityLevel: CoachReplayPriorityLevel8G;
  readonly minuteLabel: string;
  readonly scoreLabel: string;
  readonly title: string;
  readonly subtitle: string;
  readonly teamBadge: string;
  readonly actorRoleLine: string;
  readonly zoneLine: string;
  readonly coachReadLine: string;
  readonly whyItMattersLine: string;
  readonly limitationLine: string;
  readonly compactProofLine: string;
  readonly detailsProof: string;
  readonly visualState: CoachReplayVisualState8G;
  readonly sourceBadge: CoachReplayUXSourceBadge8G;
  readonly isCollapsedByDefault: boolean;
  readonly isVisibleInProduct: boolean;
  readonly isVisibleInExport: boolean;
}

export interface CoachReplayEvidenceDisclosure {
  readonly disclosureId: string;
  readonly replayMomentId: string;
  readonly proofSummary: string;
  readonly officialEventIds: readonly EventId[];
  readonly sequenceId: SequenceId;
  readonly scoreChangeBacked: boolean;
  readonly limitationText: string;
  readonly detailsCollapsedByDefault: boolean;
  readonly appearsInMainText: boolean;
  readonly appearsInExport: boolean;
}

export interface CoachReplayUXIterationView8G {
  readonly matchId: string;
  readonly officialScore: string;
  readonly priorityMoments: readonly CoachReplayPriorityMoment[];
  readonly timelineRail: CoachReplayTimelineRail;
  readonly momentCards: readonly CoachReplayMomentCardUX[];
  readonly evidenceDisclosures: readonly CoachReplayEvidenceDisclosure[];
  readonly globalSourceOfTruthNote: string;
  readonly exportIntroLine: string;
  readonly productIntroLine: string;
}

export interface CoachReplayUXIteration8GModel {
  readonly status: OfficialCausalityStatus;
  readonly scope: "COACH_REPLAY_UX_ITERATION";
  readonly version: "COACH_REPLAY_UX_ITERATION_8G";
  readonly baselineVersion: "REPLAY_ACTOR_MAPPING_NATURAL_MATCH_NARRATIVE_FIX_8F";
  readonly matchId: string;
  readonly officialScore: string;
  readonly baseline8F: ReplayActorMappingNaturalNarrativeFix8FModel;
  readonly uxView: CoachReplayUXIterationView8G;
  readonly hierarchyAudit: CoachReplayUXHierarchyAudit8G;
  readonly priorityAudit: CoachReplayPriorityAudit8G;
  readonly evidenceDisclosureAudit: CoachReplayEvidenceDisclosureAudit8G;
  readonly mobilePrintAudit: CoachReplayMobilePrintAudit8G;
  readonly wordingUXAudit: CoachReplayWordingUXAudit8G;
  readonly sourceOfTruthRegressionAudit: CoachReplaySourceOfTruthRegressionAudit8G;
  readonly integrationBudgetAudit: CoachReplayIntegrationBudgetAudit8G;
  readonly baseline8FPreserved: boolean;
  readonly baseline8EPreserved: boolean;
  readonly baseline8DPreserved: boolean;
  readonly baseline8CPreserved: boolean;
  readonly baseline8BPreserved: boolean;
  readonly baseline8APreserved: boolean;
  readonly baseline7HPreserved: boolean;
  readonly baseline6XPreserved: boolean;
  readonly replayUXReady: boolean;
  readonly replayPriorityReady: boolean;
  readonly replayTimelineReady: boolean;
  readonly replayMomentCardsReady: boolean;
  readonly replayEvidenceDisclosureReady: boolean;
  readonly replayMobileReady: boolean;
  readonly replayPrintReady: boolean;
  readonly replayExportReady: boolean;
  readonly replayNoNewTruthLayer: boolean;
  readonly actorMappingPreserved: boolean;
  readonly naturalNarrativePreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly exportLengthPreserved: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly warningCodes: readonly CoachReplayUXIterationWarningCode[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

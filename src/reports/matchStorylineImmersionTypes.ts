import type { EventId, SequenceId, TeamId } from "../core/ids";
import type { ZoneId } from "../core/zones";
import type { OfficialCausalityConfidence, OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";

export type OfficialMatchStorylineScope = "MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW";

export type OfficialMatchStorylineVersion = "MATCH_STORYLINE_IMMERSION_COACH_REPLAY_VIEW_8E";

export type OfficialMatchStorylineBaselineVersion = "PLAYER_ROLE_CAUSALITY_SEQUENCE_LEVEL_STORY_UPGRADE_8D";

export type OfficialMatchStorylineChapterType =
  | "opening_pressure"
  | "first_score"
  | "response_window"
  | "fatigue_turn"
  | "closing_sequence";

export type OfficialCoachReplayMomentType =
  | "first_score"
  | "score_response"
  | "fatigue_visible"
  | "goalkeeper_intervention"
  | "pressure_escape"
  | "final_score_lock";

export type OfficialCoachReplaySourceBadge =
  | "official"
  | "official_with_limitation"
  | "official_score_source";

export type ReplayWordingTransformType =
  | "player"
  | "role"
  | "zone"
  | "event"
  | "effect"
  | "limitation";

export interface OfficialMatchStorylineChapter {
  readonly chapterId: string;
  readonly chapterType: OfficialMatchStorylineChapterType;
  readonly title: string;
  readonly minuteRange: string;
  readonly scoreRange: string;
  readonly chapterNarrative: string;
  readonly coachMeaning: string;
  readonly linkedReplayMomentIds: readonly string[];
  readonly linkedOfficialEventIds: readonly EventId[];
  readonly sourceBadge: OfficialCoachReplaySourceBadge;
  readonly limitationNote: string;
}

export interface OfficialCoachReplayMoment {
  readonly momentId: string;
  readonly momentType: OfficialCoachReplayMomentType;
  readonly sequenceId: SequenceId;
  readonly minuteLabel: string;
  readonly title: string;
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly teamId: TeamId;
  readonly teamLabel: string;
  readonly actorLabel: string;
  readonly roleLabel: string;
  readonly zoneLabel: string;
  readonly coachReplayText: string;
  readonly whyItMatters: string;
  readonly scoreSourceNote: string;
  readonly evidenceEventIds: readonly EventId[];
  readonly evidenceSequenceIds: readonly SequenceId[];
  readonly sourceBadge: OfficialCoachReplaySourceBadge;
  readonly confidence: OfficialCausalityConfidence;
  readonly limitationNote: string;
}

export interface OfficialMatchReplayTimeline {
  readonly matchId: string;
  readonly officialScore: string;
  readonly scope: OfficialMatchStorylineScope;
  readonly version: OfficialMatchStorylineVersion;
  readonly baselineVersion: OfficialMatchStorylineBaselineVersion;
  readonly replayMoments: readonly OfficialCoachReplayMoment[];
  readonly storylineChapters: readonly OfficialMatchStorylineChapter[];
  readonly scoreSourceNote: string;
  readonly replayLimitations: readonly string[];
  readonly officialEventIdsCovered: readonly EventId[];
  readonly officialSequenceIdsCovered: readonly SequenceId[];
  readonly rawEventIdsHiddenFromCoachCopy: true;
  readonly canMutateTimeline: false;
  readonly canMutateScore: false;
  readonly canCreateScoringEvent: false;
}

export interface ReplayWordingTransform {
  readonly transformId: string;
  readonly transformType: ReplayWordingTransformType;
  readonly rawValue: string;
  readonly coachValue: string;
  readonly sourceSequenceId?: SequenceId;
  readonly sourceEventId?: EventId;
  readonly safeForCoachCopy: boolean;
  readonly reason: string;
}

export interface NaturalCoachMatchNarrative {
  readonly shortImmersiveNarrative: string;
  readonly detailedImmersiveNarrative: string;
  readonly coachFacingReplaySummary: string;
  readonly chapterNarratives: readonly string[];
  readonly replayMomentTexts: readonly string[];
  readonly limitations: readonly string[];
}

export interface MatchStorylineImmersionAudit {
  readonly status: OfficialCausalityStatus;
  readonly storylineChapterCount: number;
  readonly replayMomentCount: number;
  readonly chapterWithOfficialEvidenceCount: number;
  readonly momentWithOfficialEvidenceCount: number;
  readonly scoreSourceNoteCount: number;
  readonly limitationNoteCount: number;
  readonly noTimelineMutation: boolean;
  readonly noScoreMutation: boolean;
  readonly recommendation: string;
}

export interface CoachReplayViewAudit {
  readonly status: OfficialCausalityStatus;
  readonly replayMomentCount: number;
  readonly replayCoverageRate: number;
  readonly productReplaySectionVisible: boolean;
  readonly exportReplaySectionVisible: boolean;
  readonly exportReplayMomentCount: number;
  readonly replayMomentWithSourceBadgeCount: number;
  readonly replayMomentWithWhyItMattersCount: number;
  readonly recommendation: string;
}

export interface NaturalNarrativeWordingAudit {
  readonly status: OfficialCausalityStatus;
  readonly rawPlayerIdLeakCount: number;
  readonly rawEventIdLeakCount: number;
  readonly rawEffectLabelLeakCount: number;
  readonly repeatedMechanicalPhraseCount: number;
  readonly coachReadableSentenceCount: number;
  readonly narrativeWarmthScore: number;
  readonly recommendation: string;
}

export interface ReplayScoreSourceOfTruthAudit {
  readonly status: OfficialCausalityStatus;
  readonly officialScore: string;
  readonly scoreChangeEventCount: number;
  readonly replayScoreChangeEventCoverageCount: number;
  readonly replayScoreChangeEventMissingCount: number;
  readonly sandboxScoreClaimCount: number;
  readonly batchScoreClaimCount: number;
  readonly scoreMutationCount: number;
  readonly recommendation: string;
}

export interface ReplayWordingTransformAudit {
  readonly status: OfficialCausalityStatus;
  readonly playerTransformCount: number;
  readonly roleTransformCount: number;
  readonly zoneTransformCount: number;
  readonly eventTransformCount: number;
  readonly effectTransformCount: number;
  readonly unsafeTransformCount: number;
  readonly unmappedTechnicalTermCount: number;
  readonly recommendation: string;
}

export interface CoachReplayReportIntegrationBudgetAudit {
  readonly status: OfficialCausalityStatus;
  readonly productReplaySectionVisible: boolean;
  readonly exportReplaySectionVisible: boolean;
  readonly exportUnder900Seconds: boolean;
  readonly exportReadTimeSecondsBefore8E: number;
  readonly exportReadTimeSecondsAfter8E: number;
  readonly productReplayMomentCount: number;
  readonly exportReplayMomentCount: number;
  readonly compactExportMomentLimitPreserved: boolean;
  readonly recommendation: string;
}

export interface ReplayZoneLabel {
  readonly zoneId: ZoneId;
  readonly label: string;
}

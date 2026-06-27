import type { EventId, PlayerId, TeamId } from "../core/ids";
import type { ZoneId } from "../core/zones";

export type OfficialMatchStoryStatus = "PASS" | "PARTIAL" | "FAIL";

export type OfficialMatchStorySegmentPhaseType =
  | "opening"
  | "style_installation"
  | "pressure_phase"
  | "danger_phase"
  | "scoring_phase"
  | "response_phase"
  | "fatigue_phase"
  | "control_phase"
  | "late_game_phase"
  | "closing";

export type OfficialMatchStoryBeatType =
  | "kickoff_context"
  | "style_signal"
  | "pressure_signal"
  | "danger_created"
  | "chance_created"
  | "score"
  | "defensive_answer"
  | "goalkeeper_answer"
  | "turnover"
  | "fatigue_effect"
  | "momentum_shift"
  | "tactical_warning"
  | "closing_signal";

export type OfficialMatchTurningPointType =
  | "first_real_danger"
  | "first_score"
  | "momentum_shift"
  | "failed_response"
  | "fatigue_exposure"
  | "goalkeeper_intervention"
  | "decisive_score"
  | "late_stabilization";

export type OfficialMatchCausalityCauseType =
  | "player_attribute"
  | "role_fit"
  | "team_strategy"
  | "fatigue"
  | "pressure"
  | "zone_access"
  | "goalkeeper_response"
  | "transition_structure"
  | "support_structure"
  | "rest_defense";

export type OfficialMatchCausalityEffectType =
  | "chance_created"
  | "score_created"
  | "possession_secured"
  | "turnover_created"
  | "pressure_absorbed"
  | "fatigue_error"
  | "defensive_stop"
  | "momentum_shift";

export type StoryConfidence = "low" | "medium" | "high";
export type EvidenceStrength = "weak" | "medium" | "strong";

export interface OfficialMatchStorySegment {
  readonly segmentId: string;
  readonly title: string;
  readonly startMinute: number;
  readonly endMinute: number;
  readonly phaseType: OfficialMatchStorySegmentPhaseType;
  readonly dominantTeamId?: TeamId;
  readonly possessionTrend: string;
  readonly pressureTrend: string;
  readonly dangerTrend: string;
  readonly momentumState: string;
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly linkedOfficialEventIds: readonly EventId[];
  readonly linkedScoreChangeEventIds: readonly EventId[];
  readonly linkedZoneIds: readonly ZoneId[];
  readonly linkedPlayerIds: readonly PlayerId[];
  readonly linkedRoleIds: readonly string[];
  readonly officialEvidenceSummary: string;
  readonly narrativeSummary: string;
  readonly coachMeaning: string;
  readonly confidence: StoryConfidence;
  readonly limitationNote: string;
}

export interface OfficialMatchStoryBeat {
  readonly beatId: string;
  readonly minute: number;
  readonly title: string;
  readonly beatType: OfficialMatchStoryBeatType;
  readonly teamId?: TeamId;
  readonly opponentTeamId?: TeamId;
  readonly primaryPlayerId?: PlayerId;
  readonly secondaryPlayerId?: PlayerId;
  readonly zone?: ZoneId;
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly linkedOfficialEventId: EventId;
  readonly linkedEvidenceFactIds: readonly string[];
  readonly causeTags: readonly string[];
  readonly impactTags: readonly string[];
  readonly narrativeText: string;
  readonly coachReadableText: string;
  readonly confidence: StoryConfidence;
  readonly limitationNote: string;
}

export interface OfficialMatchTurningPoint {
  readonly turningPointId: string;
  readonly minute: number;
  readonly title: string;
  readonly turningPointType: OfficialMatchTurningPointType;
  readonly teamBenefited?: TeamId;
  readonly teamHurt?: TeamId;
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly linkedOfficialEventIds: readonly EventId[];
  readonly linkedStoryBeatIds: readonly string[];
  readonly whyItTurned: string;
  readonly coachMeaning: string;
  readonly confidence: StoryConfidence;
  readonly limitationNote: string;
}

export interface OfficialMatchCausalityLink {
  readonly causalityId: string;
  readonly causeType: OfficialMatchCausalityCauseType;
  readonly causeLabel: string;
  readonly effectType: OfficialMatchCausalityEffectType;
  readonly effectLabel: string;
  readonly linkedOfficialEventIds: readonly EventId[];
  readonly linkedStoryBeatIds: readonly string[];
  readonly linkedPlayerIds: readonly PlayerId[];
  readonly linkedTeamIds: readonly TeamId[];
  readonly linkedZones: readonly ZoneId[];
  readonly evidenceStrength: EvidenceStrength;
  readonly confidence: StoryConfidence;
  readonly officialOnly: boolean;
  readonly diagnosticOnly: boolean;
  readonly sandboxOnly: boolean;
  readonly canAffectScore: false;
  readonly limitationNote: string;
}

export interface OfficialMatchNarrative {
  readonly shortNarrative: string;
  readonly detailedNarrative: string;
  readonly coachFacingNarrative: string;
  readonly timelineNarrative: string;
  readonly scoringNarrative: string;
  readonly fatigueNarrative: string;
  readonly teamStyleNarrative: string;
  readonly playerImpactNarrative: string;
  readonly limitations: readonly string[];
  readonly sourceOfTruthNote: string;
}

export interface OfficialMatchStorySpineModel {
  readonly status: OfficialMatchStoryStatus;
  readonly scope: "OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF";
  readonly version: "OFFICIAL_MATCH_STORY_SPINE_ENGINE_CAUSALITY_PROOF_8A";
  readonly baselineVersion: "COACH_REPORT_EXPORT_LENGTH_TREND_COUNT_CLEANUP_7H";
  readonly matchId: string;
  readonly officialScore: string;
  readonly storySpineReady: boolean;
  readonly engineCausalityReady: boolean;
  readonly officialTimelineCoverageReady: boolean;
  readonly scoringCausalityReady: boolean;
  readonly teamStyleExpressionReady: boolean;
  readonly fatigueCausalityReady: boolean;
  readonly playerImpactReadable: boolean;
  readonly coachReadableNarrativeReady: boolean;
  readonly reportIntegrationMinimalReady: boolean;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly segments: readonly OfficialMatchStorySegment[];
  readonly beats: readonly OfficialMatchStoryBeat[];
  readonly turningPoints: readonly OfficialMatchTurningPoint[];
  readonly causalityLinks: readonly OfficialMatchCausalityLink[];
  readonly narrative: OfficialMatchNarrative;
  readonly warningCodes: readonly string[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

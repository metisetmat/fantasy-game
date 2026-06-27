import type {
  EventId,
  PlayerId,
  TeamId,
} from "../core/ids";
import type { ZoneId } from "../core/zones";
import type {
  MatchReport,
  PlayerSnapshot,
  TacticalPlan,
} from "../contracts/engineToCoach";
import type { OfficialMatchStorySpineModel } from "./officialMatchStorySpineTypes";

export type OfficialCausalityStatus = "PASS" | "PARTIAL" | "FAIL";
export type OfficialCausalityConfidence = "low" | "medium" | "high";
export type OfficialCausalityEvidenceStrength = "weak" | "medium" | "strong";

export type OfficialMatchCausalityFactType =
  | "player_attribute"
  | "role_fit"
  | "tactical_plan"
  | "fatigue"
  | "mental_freshness"
  | "pressure"
  | "zone_access"
  | "goalkeeper_response"
  | "transition_structure"
  | "support_structure"
  | "rest_defense"
  | "score_sequence"
  | "defensive_stop";

export type OfficialMatchPlayerImpactType =
  | "score_created"
  | "danger_created"
  | "pressure_absorbed"
  | "pressure_created"
  | "possession_secured"
  | "turnover_forced"
  | "defensive_stop"
  | "goalkeeper_save"
  | "fatigue_error"
  | "support_action"
  | "rest_defense_cover";

export type OfficialMatchTeamStrategyPlanField =
  | "attackingIntent"
  | "defensiveIntent"
  | "transitionIntent"
  | "tempo"
  | "riskLevel"
  | "targetZones"
  | "scoringBias"
  | "pressingIntensity"
  | "defensiveLineHeight"
  | "widthUsage"
  | "restDefensePriority";

export type OfficialMatchTeamStrategyObservedEffect =
  | "zone_access"
  | "pressure_created"
  | "pressure_absorbed"
  | "danger_created"
  | "possession_instability"
  | "transition_exposure"
  | "rest_defense_stability"
  | "scoring_sequence";

export type OfficialMatchFatigueType =
  | "physical_condition"
  | "mental_freshness"
  | "goalkeeper_mental_fatigue"
  | "high_intensity_load"
  | "late_error"
  | "repeated_pressure";

export type OfficialMatchFatigueObservedEffect =
  | "reduced_pressure_resistance"
  | "technical_error"
  | "slower_support"
  | "weaker_recovery"
  | "goalkeeper_uncertainty"
  | "no_clear_effect";

export type OfficialMatchRoleFunction =
  | "progression_link"
  | "pressure_carrier"
  | "support_runner"
  | "space_attack"
  | "central_connector"
  | "defensive_screen"
  | "rest_defense_anchor"
  | "goalkeeper_free_safety"
  | "second_ball_presence";

export interface OfficialMatchCausalityEvidenceFact {
  readonly causalityFactId: string;
  readonly matchId: string;
  readonly causalityType: OfficialMatchCausalityFactType;
  readonly teamId: TeamId;
  readonly opponentTeamId: TeamId;
  readonly primaryPlayerId?: PlayerId;
  readonly secondaryPlayerId?: PlayerId;
  readonly role?: string;
  readonly attributeNames: readonly string[];
  readonly attributeValuesSnapshot: Readonly<Record<string, number>>;
  readonly fatigueSnapshot: Readonly<Record<string, number>>;
  readonly tacticalPlanFields: readonly string[];
  readonly zoneIds: readonly ZoneId[];
  readonly linkedOfficialEventIds: readonly EventId[];
  readonly linkedScoreChangeEventIds: readonly EventId[];
  readonly linkedStoryBeatIds: readonly string[];
  readonly linkedTurningPointIds: readonly string[];
  readonly causeLabel: string;
  readonly effectLabel: string;
  readonly evidenceSummary: string;
  readonly confidence: OfficialCausalityConfidence;
  readonly evidenceStrength: OfficialCausalityEvidenceStrength;
  readonly officialOnly: boolean;
  readonly diagnosticOnly: boolean;
  readonly sandboxOnly: boolean;
  readonly limitationNote: string;
  readonly coachReadableSummary: string;
}

export interface OfficialMatchPlayerImpactCausality {
  readonly playerId: PlayerId;
  readonly teamId: TeamId;
  readonly role: string;
  readonly impactType: OfficialMatchPlayerImpactType;
  readonly linkedOfficialEventIds: readonly EventId[];
  readonly linkedStoryBeatIds: readonly string[];
  readonly linkedTurningPointIds: readonly string[];
  readonly attributeSupport: string;
  readonly fatigueContext: string;
  readonly roleFitReason: string;
  readonly impactSummary: string;
  readonly confidence: OfficialCausalityConfidence;
  readonly limitationNote: string;
  readonly coachReadableText: string;
}

export interface OfficialMatchTeamStrategyCausality {
  readonly teamId: TeamId;
  readonly planField: OfficialMatchTeamStrategyPlanField;
  readonly observedEffect: OfficialMatchTeamStrategyObservedEffect;
  readonly linkedOfficialEventIds: readonly EventId[];
  readonly linkedZones: readonly ZoneId[];
  readonly linkedStorySegmentIds: readonly string[];
  readonly linkedTurningPointIds: readonly string[];
  readonly evidenceSummary: string;
  readonly confidence: OfficialCausalityConfidence;
  readonly limitationNote: string;
  readonly coachReadableText: string;
}

export interface OfficialMatchFatigueCausality {
  readonly teamId: TeamId;
  readonly playerId?: PlayerId;
  readonly fatigueType: OfficialMatchFatigueType;
  readonly minute: number;
  readonly linkedOfficialEventIds: readonly EventId[];
  readonly linkedStoryBeatIds: readonly string[];
  readonly conditionBefore?: number;
  readonly conditionAfter?: number;
  readonly mentalFreshnessBefore?: number;
  readonly mentalFreshnessAfter?: number;
  readonly observedEffect: OfficialMatchFatigueObservedEffect;
  readonly evidenceSummary: string;
  readonly confidence: OfficialCausalityConfidence;
  readonly limitationNote: string;
  readonly coachReadableText: string;
}

export interface OfficialMatchRoleCausality {
  readonly role: string;
  readonly teamId: TeamId;
  readonly playerId: PlayerId;
  readonly roleFunction: OfficialMatchRoleFunction;
  readonly linkedOfficialEventIds: readonly EventId[];
  readonly linkedZones: readonly ZoneId[];
  readonly linkedStoryBeatIds: readonly string[];
  readonly linkedTurningPointIds: readonly string[];
  readonly roleFitSummary: string;
  readonly observedEffect: string;
  readonly confidence: OfficialCausalityConfidence;
  readonly limitationNote: string;
  readonly coachReadableText: string;
}

export interface CoachReadableCausalityNarrative {
  readonly shortCausalNarrative: string;
  readonly detailedCausalNarrative: string;
  readonly coachFacingCausalSummary: string;
  readonly playerImpactSummary: string;
  readonly roleImpactSummary: string;
  readonly fatigueImpactSummary: string;
  readonly strategyImpactSummary: string;
  readonly limitations: readonly string[];
}

export interface OfficialMatchAttributeRoleFatigueCausalityModel {
  readonly status: OfficialCausalityStatus;
  readonly scope: "ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING";
  readonly version: "ATTRIBUTE_ROLE_FATIGUE_CAUSALITY_DEEPENING_8C";
  readonly baselineVersion: "MATCH_STORY_CHRONOLOGY_CUMULATIVE_SCORE_NARRATIVE_QUALITY_FIX_8B";
  readonly matchId: string;
  readonly officialScore: string;
  readonly officialCausalityLayerReady: boolean;
  readonly attributeCausalityReady: boolean;
  readonly roleCausalityReady: boolean;
  readonly fatigueCausalityReady: boolean;
  readonly strategyCausalityReady: boolean;
  readonly pressureCausalityReady: boolean;
  readonly zoneAccessCausalityReady: boolean;
  readonly goalkeeperCausalityReady: boolean;
  readonly playerImpactCausalityReady: boolean;
  readonly storyCausalityIntegrationReady: boolean;
  readonly coachReadableCausalityReady: boolean;
  readonly unsupportedCausalityClaimCount: number;
  readonly inventedCausalityClaimCount: number;
  readonly diagnosticOnlyCausalityPromotedCount: number;
  readonly sandboxOnlyCausalityPromotedCount: number;
  readonly batchOnlyCausalityPromotedCount: number;
  readonly weakCausalityExplainedCount: number;
  readonly matchEconomyBaselinePreserved: boolean;
  readonly guardrailsPreserved: boolean;
  readonly sourceOfTruthSeparationPreserved: boolean;
  readonly exportLengthPreserved: boolean;
  readonly productBaselineReady: boolean;
  readonly evidenceFacts: readonly OfficialMatchCausalityEvidenceFact[];
  readonly playerImpactCausalities: readonly OfficialMatchPlayerImpactCausality[];
  readonly teamStrategyCausalities: readonly OfficialMatchTeamStrategyCausality[];
  readonly fatigueCausalities: readonly OfficialMatchFatigueCausality[];
  readonly roleCausalities: readonly OfficialMatchRoleCausality[];
  readonly narrative: CoachReadableCausalityNarrative;
  readonly warnings: readonly string[];
  readonly recommendation: string;
  readonly nextSprintRecommendation: string;
}

export interface OfficialMatchAttributeRoleFatigueCausalityInput {
  readonly report: MatchReport;
  readonly storySpine: OfficialMatchStorySpineModel;
  readonly playerSnapshots?: readonly PlayerSnapshot[];
  readonly homePlan?: TacticalPlan;
  readonly awayPlan?: TacticalPlan;
  readonly matchEconomyBaselinePreserved?: boolean;
  readonly guardrailsPreserved?: boolean;
  readonly productBaselineReady?: boolean;
}

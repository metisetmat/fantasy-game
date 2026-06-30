import type { MatchEvent, MatchReport, PlayerSnapshot, TeamSnapshot } from "../contracts/engineToCoach";
import type { EventId, PlayerId, SequenceId, TeamId } from "../core/ids";
import type { ZoneId } from "../core/zones";
import type { OfficialCausalityConfidence, OfficialMatchAttributeRoleFatigueCausalityModel } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { OfficialMatchStorySpineModel } from "./officialMatchStorySpineTypes";

export type OfficialSequenceCausalityStatus = "PASS" | "PARTIAL" | "FAIL";

export type OfficialMatchSequenceCausalityType =
  | "scoring_sequence"
  | "danger_sequence"
  | "pressure_sequence"
  | "recovery_sequence"
  | "possession_security_sequence"
  | "defensive_stop_sequence"
  | "goalkeeper_sequence"
  | "fatigue_exposure_sequence"
  | "stabilization_sequence";

export type OfficialSequenceRoleFunction =
  | "tempo_setter"
  | "central_reconnector"
  | "progression_carrier"
  | "support_runner"
  | "space_attacker"
  | "defensive_screen"
  | "pressure_creator"
  | "pressure_receiver"
  | "goalkeeper_free_safety"
  | "second_ball_presence"
  | "rest_defense_anchor"
  | "unknown_official_actor";

export type OfficialSequenceActionRole =
  | "initiates"
  | "receives"
  | "progresses"
  | "supports"
  | "finishes"
  | "defends"
  | "recovers"
  | "stabilizes"
  | "loses"
  | "pressures"
  | "saves"
  | "converts"
  | "observes_only";

export type OfficialSequenceContributionEffect =
  | "score_created"
  | "danger_created"
  | "possession_secured"
  | "turnover_created"
  | "pressure_absorbed"
  | "pressure_created"
  | "defensive_stop"
  | "goalkeeper_action"
  | "fatigue_visible"
  | "support_missing"
  | "no_direct_effect";

export type OfficialRoleFunctionChainPattern =
  | "recover_connect_progress"
  | "fix_reconnect_progress"
  | "pressure_force_recover"
  | "goalkeeper_secure_reset"
  | "danger_without_support"
  | "score_after_progression"
  | "stabilize_without_score"
  | "unknown_pattern";

export type OfficialSequenceFatigueSignalType =
  | "condition_drop"
  | "mental_freshness_drop"
  | "goalkeeper_mental_load"
  | "high_intensity_load"
  | "late_sequence_load"
  | "repeated_pressure_load"
  | "visible_but_not_causal";

export type OfficialSequenceFatigueObservedEffect =
  | "slower_support"
  | "weaker_recovery"
  | "lower_pressure_resistance"
  | "technical_error"
  | "goalkeeper_uncertainty"
  | "no_clear_effect";

export interface OfficialSequenceActorContribution {
  readonly contributionId: string;
  readonly sequenceId: SequenceId;
  readonly eventId: EventId;
  readonly playerId: PlayerId;
  readonly teamId: TeamId;
  readonly role: string;
  readonly roleFunction: OfficialSequenceRoleFunction;
  readonly actionRole: OfficialSequenceActionRole;
  readonly zone: ZoneId;
  readonly pressureContext: string;
  readonly fatigueContext: string;
  readonly attributeSnapshotUsed: boolean;
  readonly attributeNamesUsed: readonly string[];
  readonly contributionEffect: OfficialSequenceContributionEffect;
  readonly evidenceSummary: string;
  readonly confidence: OfficialCausalityConfidence;
  readonly limitationNote: string;
}

export interface OfficialRoleFunctionChain {
  readonly roleChainId: string;
  readonly sequenceId: SequenceId;
  readonly teamId: TeamId;
  readonly rolesInOrder: readonly string[];
  readonly playersInOrder: readonly PlayerId[];
  readonly zonesInOrder: readonly ZoneId[];
  readonly functionsInOrder: readonly OfficialSequenceRoleFunction[];
  readonly chainPattern: OfficialRoleFunctionChainPattern;
  readonly chainEffect: string;
  readonly linkedOfficialEventIds: readonly EventId[];
  readonly linkedScoreChangeEventIds: readonly EventId[];
  readonly coachReadableText: string;
  readonly confidence: OfficialCausalityConfidence;
  readonly limitationNote: string;
}

export interface OfficialSequenceFatigueEffect {
  readonly fatigueEffectId: string;
  readonly sequenceId: SequenceId;
  readonly eventId: EventId;
  readonly teamId: TeamId;
  readonly playerId?: PlayerId;
  readonly fatigueSignalType: OfficialSequenceFatigueSignalType;
  readonly observedEffect: OfficialSequenceFatigueObservedEffect;
  readonly conditionValue?: number;
  readonly mentalFreshnessValue?: number;
  readonly fatiguePressureValue?: number;
  readonly confidence: OfficialCausalityConfidence;
  readonly limitationNote: string;
  readonly coachReadableText: string;
}

export interface OfficialMatchSequenceCausality {
  readonly sequenceCausalityId: string;
  readonly matchId: string;
  readonly sequenceId: SequenceId;
  readonly minuteStart: number;
  readonly minuteEnd: number;
  readonly phase: string;
  readonly teamId: TeamId;
  readonly opponentTeamId: TeamId;
  readonly sequenceType: OfficialMatchSequenceCausalityType;
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly scoreDelta: string;
  readonly linkedOfficialEventIds: readonly EventId[];
  readonly linkedScoreChangeEventIds: readonly EventId[];
  readonly linkedStoryBeatIds: readonly string[];
  readonly linkedTurningPointIds: readonly string[];
  readonly zoneChain: readonly ZoneId[];
  readonly actorChain: readonly OfficialSequenceActorContribution[];
  readonly roleChain: OfficialRoleFunctionChain;
  readonly tacticalFunctionChain: readonly OfficialSequenceRoleFunction[];
  readonly fatigueEffects: readonly OfficialSequenceFatigueEffect[];
  readonly observedPressure: string;
  readonly observedFatigueSignal: string;
  readonly observedEffect: string;
  readonly causalSummary: string;
  readonly coachReadableSequenceSummary: string;
  readonly confidence: OfficialCausalityConfidence;
  readonly limitationNote: string;
  readonly officialOnly: true;
  readonly diagnosticOnly: false;
  readonly sandboxOnly: false;
}

export interface CoachReadableSequenceStory {
  readonly shortSequenceStory: string;
  readonly detailedSequenceStory: string;
  readonly coachFacingSequenceCausalitySummary: string;
  readonly sequenceCards: readonly string[];
  readonly playerRoleHighlights: readonly string[];
  readonly fatigueSequenceNotes: readonly string[];
  readonly limitations: readonly string[];
}

export interface OfficialPlayerRoleSequenceCausalityUpgrade8DInput {
  readonly report: MatchReport;
  readonly storySpine: OfficialMatchStorySpineModel;
  readonly causality8C: OfficialMatchAttributeRoleFatigueCausalityModel;
  readonly playerSnapshots: readonly PlayerSnapshot[];
  readonly teamSnapshots: readonly TeamSnapshot[];
}

export interface OfficialPlayerRoleSequenceCausalityBuildInput extends OfficialPlayerRoleSequenceCausalityUpgrade8DInput {
  readonly baseline8CStatus: OfficialSequenceCausalityStatus;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}

export type OfficialSequenceEvent = MatchEvent;

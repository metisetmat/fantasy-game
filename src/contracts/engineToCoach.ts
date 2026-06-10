import type { EventId, MatchId, PlayerId, SequenceId, TeamId } from "../core/ids";
import type { Rating, TacticalTick } from "../core/ratings";
import type { ZoneId } from "../core/zones";
import type { MatchPhase, PressureLevel, ScoreState } from "../models/match";
import type { PlayerAttributes, PlayerRole } from "../models/player";
import type { TeamIdentity } from "../models/team";

export type MatchTimestamp = {
  readonly tick: TacticalTick;
  readonly minute: number;
  readonly period: MatchPeriod;
};

export type MatchPeriod = "first_half" | "second_half" | "extra_time" | "shootout";

export type CompetitionType = "friendly" | "league" | "cup" | "playoff";

export type WeatherCondition = "clear" | "rain" | "wind" | "heat" | "cold";

export type PitchCondition = "fast" | "normal" | "heavy" | "worn";

export type AttackingIntent =
  | "structured_possession"
  | "wide_progression"
  | "direct_pressure"
  | "territorial_kicking"
  | "chaos_creation";

export type DefensiveIntent =
  | "compact_block"
  | "high_press"
  | "mid_block"
  | "low_block"
  | "man_oriented_pressure";

export type TransitionIntent =
  | "counterpress"
  | "secure_rest_defense"
  | "fast_break"
  | "territorial_reset"
  | "delay_and_recover";

export type TacticalTempo = "slow" | "balanced" | "fast";

export type TacticalRiskLevel = "low" | "medium" | "high";

export type ScoringBias = "balanced" | "try_first" | "goal_first" | "drop_threat" | "territory_first";

export type PlayerTrait = string;

export interface ChemistryLink {
  readonly playerId: PlayerId;
  readonly strength: Rating;
  readonly description?: string;
}

export interface MatchContext {
  readonly competitionType: CompetitionType;
  readonly matchImportance: Rating;
  readonly weather?: WeatherCondition;
  readonly pitch?: PitchCondition;
  readonly crowdPressure?: Rating;
}

export interface RulesetConfig {
  readonly rulesetId: string;
  readonly scoringVersion: string;
  readonly maxPlayersOnField?: number;
}

export interface MatchInput {
  readonly matchId: MatchId;
  readonly seed: string;
  readonly homeTeam: TeamSnapshot;
  readonly awayTeam: TeamSnapshot;
  readonly homePlan: TacticalPlan;
  readonly awayPlan: TacticalPlan;
  readonly matchContext: MatchContext;
  readonly ruleset: RulesetConfig;
}

export interface TeamSnapshot {
  readonly teamId: TeamId;
  readonly name: string;
  readonly roster: readonly PlayerSnapshot[];
  readonly starters: readonly PlayerId[];
  readonly bench: readonly PlayerId[];
  readonly captainId?: PlayerId;
  readonly primaryKickerId?: PlayerId;
  readonly primaryDropTakerId?: PlayerId;
  readonly goalkeeperId: PlayerId;
  readonly teamIdentity?: TeamIdentity;
}

export interface PlayerSnapshot {
  readonly playerId: PlayerId;
  readonly name: string;
  readonly role: PlayerRole;
  readonly attributes: PlayerAttributes;
  readonly traits: readonly PlayerTrait[];
  readonly currentCondition: Rating;
  readonly mentalFreshness: Rating;
  readonly chemistryLinks?: readonly ChemistryLink[];
}

export interface TacticalPlan {
  readonly attackingIntent: AttackingIntent;
  readonly defensiveIntent: DefensiveIntent;
  readonly transitionIntent: TransitionIntent;
  readonly tempo: TacticalTempo;
  readonly riskLevel: TacticalRiskLevel;
  readonly targetZones: readonly ZoneId[];
  readonly scoringBias: ScoringBias;
  readonly pressingIntensity: Rating;
  readonly defensiveLineHeight: Rating;
  readonly widthUsage: Rating;
  readonly restDefensePriority: Rating;
}

export type MatchEventType =
  | "kickoff"
  | "gain_possession"
  | "lose_possession"
  | "turnover"
  | "progression"
  | "duel"
  | "defensive_action"
  | "fatigue_error"
  | "goalkeeper_action"
  | "scoring"
  | "tactical_shift"
  | "discipline";

export type EventOutcome = "success" | "failure" | "neutral" | "advantage" | "score";

export type EventConsequenceType =
  | "score_change"
  | "possession_change"
  | "zone_change"
  | "fatigue_change"
  | "momentum_change"
  | "tactical_warning";

export interface EventConsequence {
  readonly type: EventConsequenceType;
  readonly description: string;
  readonly value?: number;
}

export type EventTag = string;

export interface TacticalContextSnapshot {
  readonly pressureLevel: PressureLevel;
  readonly ballZone: ZoneId;
  readonly targetZone?: ZoneId;
  readonly moveType?: string;
  readonly attackingDirection?: string;
  readonly reason?: string;
}

export interface FatigueContextSnapshot {
  readonly teamCondition: Rating;
  readonly primaryPlayerCondition?: Rating;
  readonly primaryPlayerMentalFreshness?: Rating;
  readonly fatiguePressure?: Rating;
  readonly goalkeeperMentalFatigue?: Rating;
}

export interface MatchEvent {
  readonly eventId: EventId;
  readonly matchId: MatchId;
  readonly timestamp: MatchTimestamp;
  readonly phase: MatchPhase;
  readonly sequenceId: SequenceId;
  readonly teamId: TeamId;
  readonly opponentTeamId: TeamId;
  readonly eventType: MatchEventType;
  readonly zone: ZoneId;
  readonly subZone?: string;
  readonly primaryPlayerId?: PlayerId;
  readonly secondaryPlayerId?: PlayerId;
  readonly opposingPlayerId?: PlayerId;
  readonly tacticalContext: TacticalContextSnapshot;
  readonly fatigueContext: FatigueContextSnapshot;
  readonly outcome: EventOutcome;
  readonly consequences: readonly EventConsequence[];
  readonly tags: readonly EventTag[];
  readonly narrativeWeight: Rating;
}

export interface MatchMomentumState {
  readonly teamId: TeamId | null;
  readonly intensity: Rating;
  readonly description?: string;
}

export interface TeamRuntimeState {
  readonly teamId: TeamId;
  readonly condition: Rating;
  readonly tacticalStability: Rating;
  readonly pressureResistance: Rating;
}

export interface CoachWarning {
  readonly warningId: string;
  readonly teamId: TeamId;
  readonly title: string;
  readonly severity: "low" | "medium" | "high";
  readonly relatedZone?: ZoneId;
}

export interface MatchSnapshot {
  readonly matchId: MatchId;
  readonly currentMinute: number;
  readonly score: ScoreState;
  readonly phase: MatchPhase;
  readonly possessionTeamId: TeamId;
  readonly ballZone: ZoneId;
  readonly momentum: MatchMomentumState;
  readonly teamStates: readonly TeamRuntimeState[];
  readonly lastEvents: readonly MatchEvent[];
  readonly activeWarnings: readonly CoachWarning[];
}

export interface TeamMatchStats {
  readonly teamId: TeamId;
  readonly score: number;
  readonly possessionShare?: Rating;
  readonly turnovers?: number;
  readonly scoringAttempts?: number;
  readonly eventShare?: Rating;
  readonly progressionCount?: number;
  readonly scoringEventCount?: number;
  readonly pressureInstabilityCount?: number;
}

export interface PlayerMatchStats {
  readonly playerId: PlayerId;
  readonly teamId: TeamId;
  readonly minutes: number;
  readonly actionsInvolved: number;
  readonly mistakes: number;
  readonly contributionScore: Rating;
}

export interface ZoneStats {
  readonly zone: ZoneId;
  readonly entries: number;
  readonly successfulProgressions: number;
  readonly defensiveStops: number;
  readonly scoringEvents?: number;
  readonly pressureEvents?: number;
}

export interface FatigueReport {
  readonly teamSummaries: readonly TeamFatigueSummary[];
  readonly playerSummaries: readonly PlayerFatigueSummary[];
}

export interface TeamFatigueSummary {
  readonly teamId: TeamId;
  readonly averageConditionEnd: Rating;
  readonly highIntensityLoad: Rating;
  readonly lateErrorCount: number;
}

export interface PlayerFatigueSummary {
  readonly playerId: PlayerId;
  readonly conditionStart: Rating;
  readonly conditionEnd: Rating;
  readonly mentalFreshnessEnd: Rating;
}

export interface TacticalReport {
  readonly diagnoses: readonly TacticalDiagnosis[];
}

export interface KeyMoment {
  readonly eventId: EventId;
  readonly title: string;
  readonly summary: string;
  readonly minute: number;
}

export interface TrainingFocusSuggestion {
  readonly focusId: string;
  readonly title: string;
  readonly reason: string;
}

export interface MatchReport {
  readonly matchId: MatchId;
  readonly score: ScoreState;
  readonly timeline: readonly MatchEvent[];
  readonly teamStats: readonly TeamMatchStats[];
  readonly playerStats: readonly PlayerMatchStats[];
  readonly zoneStats: readonly ZoneStats[];
  readonly fatigueReport: FatigueReport;
  readonly tacticalReport: TacticalReport;
  readonly keyMoments: readonly KeyMoment[];
  readonly coachInsights: readonly CoachInsight[];
  readonly suggestedFocus: readonly TrainingFocusSuggestion[];
}

export type CoachInsightType =
  | "strength"
  | "weakness"
  | "tactical_success"
  | "tactical_failure"
  | "fatigue_warning"
  | "player_spotlight"
  | "synergy_detected"
  | "opponent_exploit"
  | "training_recommendation";

export interface InsightEvidence {
  readonly eventIds: readonly EventId[];
  readonly summary: string;
  readonly confidenceNote?: string;
}

export interface CoachActionSuggestion {
  readonly actionId: string;
  readonly label: string;
  readonly tradeoff?: string;
}

export interface CoachInsight {
  readonly insightId: string;
  readonly type: CoachInsightType;
  readonly title: string;
  readonly summary: string;
  readonly evidence: readonly InsightEvidence[];
  readonly affectedPlayers: readonly PlayerId[];
  readonly affectedZones: readonly ZoneId[];
  readonly confidence: "low" | "medium" | "high";
  readonly recommendedActions: readonly CoachActionSuggestion[];
}

export interface TacticalDiagnosis {
  readonly diagnosisId: string;
  readonly teamId: TeamId;
  readonly title: string;
  readonly summary: string;
  readonly evidenceEventIds: readonly EventId[];
  readonly affectedZones: readonly ZoneId[];
  readonly confidence: "low" | "medium" | "high";
}

export interface TrainingRecommendation {
  readonly recommendationId: string;
  readonly teamId: TeamId;
  readonly focus: string;
  readonly priority: "low" | "medium" | "high";
  readonly reason: string;
  readonly tradeoff?: string;
  readonly affectedPlayers: readonly PlayerId[];
}

export interface ProgressionSignal {
  readonly signalId: string;
  readonly playerId?: PlayerId;
  readonly teamId?: TeamId;
  readonly sourceEventIds: readonly EventId[];
  readonly category: "technical" | "physical" | "tactical" | "mental" | "chemistry";
  readonly direction: "positive" | "negative" | "neutral";
  readonly summary: string;
}

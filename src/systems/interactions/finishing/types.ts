import type { TeamId } from "../../../core/ids";
import type { Rating, TacticalTick } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import type { ScoringType } from "../../../models/scoring";
import type { PlayerRole } from "../../../models/player";
import type { InteractionScoreBreakdown, TacticalLogLine } from "../shared";
import type { InteractionType } from "../types";

export enum FinishingOutcome {
  GoalScored = "goal_scored",
  TryScored = "try_scored",
  DropScored = "drop_scored",
  ScrambleFinish = "scramble_finish",
  SavedAttempt = "saved_attempt",
  MissedAttempt = "missed_attempt",
  BlockedAttempt = "blocked_attempt",
  LiveRebound = "live_rebound",
  SecondChance = "second_chance",
  EmergencyClearance = "emergency_clearance",
  LastDefenderSave = "last_defender_save",
  DefensiveRecovery = "defensive_recovery",
}

export enum FinishingDecision {
  GoalAttempt = "goal_attempt",
  TryAttempt = "try_attempt",
  DropAttempt = "drop_attempt",
}

export enum FinishingDangerLevel {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
}

export enum ConversionIdentity {
  ControlledExecution = "CONTROLLED_EXECUTION",
  ChaoticAggression = "CHAOTIC_AGGRESSION",
  UnstableGenius = "UNSTABLE_GENIUS",
  TerritorialSafety = "TERRITORIAL_SAFETY",
}

export enum FinishingContextQuality {
  CleanWindow = "CLEAN_WINDOW",
  PressuredWindow = "PRESSURED_WINDOW",
  ChaoticWindow = "CHAOTIC_WINDOW",
  LastLineWindow = "LAST_LINE_WINDOW",
  DesperateWindow = "DESPERATE_WINDOW",
  BrokenStructureWindow = "BROKEN_STRUCTURE_WINDOW",
}

export interface FinishingChoiceEvaluation {
  readonly decision: FinishingDecision;
  readonly scoringType: ScoringType;
  readonly choiceConfidence: Rating;
  readonly primaryFinisherRole: PlayerRole;
  readonly breakdown: readonly InteractionScoreBreakdown[];
  readonly options: readonly FinishingOptionEvaluation[];
}

export interface FinishingOptionEvaluation {
  readonly decision: FinishingDecision;
  readonly scoringType: ScoringType;
  readonly label: string;
  readonly points: number;
  readonly isLegal: boolean;
  readonly legalReason: string;
  readonly baseScore: Rating;
  readonly scoringValueModifier: number;
  readonly tacticalContextModifier: number;
  readonly teamIdentityModifier: number;
  readonly conversionQualityModifier: number;
  readonly defensiveResponseModifier: number;
  readonly finalScore: Rating | null;
  readonly factors: readonly string[];
}

export interface FinishingCapabilityEvaluation {
  readonly finishingCapability: Rating;
  readonly technicalExecution: Rating;
  readonly composure: Rating;
  readonly actorInitials: string;
  readonly actorRole: PlayerRole;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

export interface DefensiveProtectionEvaluation {
  readonly protectionQuality: Rating;
  readonly scoringZoneDensity: Rating;
  readonly anchorProtection: Rating;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

export interface GoalkeeperResponseEvaluation {
  readonly responseQuality: Rating;
  readonly responderRole: PlayerRole;
  readonly responderInitials: string;
  readonly responderIsGoalkeeper: boolean;
  readonly visibleInputs: {
    readonly handPlay: Rating;
    readonly vision: Rating;
    readonly composure: Rating;
    readonly speed: Rating;
  };
  readonly derivedGoalkeeperResponse: Rating;
  readonly reactsLate: boolean;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

export interface ReboundRiskEvaluation {
  readonly reboundRisk: Rating;
  readonly remainsLive: boolean;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

export interface FinishingStyleEvaluation {
  readonly identity: ConversionIdentity;
  readonly executionModifier: number;
  readonly composureModifier: number;
  readonly reboundModifier: number;
  readonly varianceModifier: number;
  readonly description: string;
}

export interface ConversionContextEvaluation {
  readonly contextQuality: FinishingContextQuality;
  readonly qualityScore: Rating;
  readonly reasons: readonly string[];
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

export interface ConversionQualityEvaluation {
  readonly conversionQuality: Rating;
  readonly composureScore: Rating;
  readonly executionScore: Rating;
  readonly messyDanger: Rating;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

export interface FinishingLegalityEvaluation {
  readonly legal: boolean;
  readonly reason: string;
}

export interface FinishingTriggerEvaluation {
  readonly triggered: boolean;
  readonly scoringDanger: FinishingDangerLevel;
  readonly reason: string;
  readonly possibleScoringTypes: readonly ScoringType[];
}

export interface FinishingScoreUpdate {
  readonly scoringTeamId: TeamId;
  readonly scoringType: ScoringType;
  readonly points: number;
}

export interface FinishingInteractionEvent {
  readonly tick: TacticalTick;
  readonly type: InteractionType;
  readonly offensiveTeamId: TeamId;
  readonly defensiveTeamId: TeamId;
  readonly activeZone: ZoneId;
  readonly involvedRoles: readonly PlayerRole[];
  readonly decision: FinishingDecision;
  readonly outcome: FinishingOutcome;
  readonly scoreUpdate: FinishingScoreUpdate | null;
  readonly summary: string;
}

export interface FinishingInteractionResult {
  readonly outcome: FinishingOutcome;
  readonly decision: FinishingDecision;
  readonly scoringType: ScoringType;
  readonly terminal: true;
  readonly dangerLevel: FinishingDangerLevel;
  readonly territorialPressure: Rating;
  readonly finishingScore: Rating;
  readonly defensiveScore: Rating;
  readonly choice: FinishingChoiceEvaluation;
  readonly capability: FinishingCapabilityEvaluation;
  readonly defensiveProtection: DefensiveProtectionEvaluation;
  readonly goalkeeperResponse: GoalkeeperResponseEvaluation;
  readonly reboundRisk: ReboundRiskEvaluation;
  readonly finishingStyle: FinishingStyleEvaluation;
  readonly conversionContext: ConversionContextEvaluation;
  readonly conversionQuality: ConversionQualityEvaluation;
  readonly legality: FinishingLegalityEvaluation;
  readonly scoreUpdate: FinishingScoreUpdate | null;
  readonly event: FinishingInteractionEvent;
  readonly logs: readonly TacticalLogLine[];
}

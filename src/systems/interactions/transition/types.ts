import type { TeamId } from "../../../core/ids";
import type { Rating, TacticalTick } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import type { PressureLevel } from "../../../models/match";
import type { PlayerRole } from "../../../models/player";
import type { SpatialMoveType } from "../../spatial/intention";
import type { DefensiveParticipationEvaluation, OffensiveParticipationEvaluation } from "../../structure";
import type { FinishingTriggerEvaluation } from "../finishing";
import type { InteractionScoreBreakdown, TacticalLogLine } from "../shared/types";
import type { InteractionType } from "../types";

export enum TransitionTrigger {
  Turnover = "turnover",
  BrokenPress = "broken_press",
  DestabilizedStructure = "destabilized_structure",
}

export enum TransitionOutcome {
  ExplosiveTransition = "explosive_transition",
  ControlledProgression = "controlled_progression",
  DelayedTransition = "delayed_transition",
  EmergencyDefensiveRecovery = "emergency_defensive_recovery",
  WeakSideAttack = "weak_side_attack",
  ImmediateFinish = "immediate_finish",
  ChaoticFinish = "chaotic_finish",
  LiveRebound = "live_rebound",
  LastDefenderRecovery = "last_defender_recovery",
  EmergencyBlock = "emergency_block",
  OverextendedAttack = "overextended_attack",
  TransitionCollapse = "transition_collapse",
  StabilizedPossession = "stabilized_possession",
}

export enum DangerLevel {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
}

export enum TransitionContextUpdateType {
  TemporaryChaos = "temporary_chaos",
  DefensiveBlockBroken = "defensive_block_broken",
  WeakSideThreatened = "weak_side_threatened",
  EmergencyRecovery = "emergency_recovery",
  PossessionStabilized = "possession_stabilized",
  TransitionLost = "transition_lost",
}

export interface TransitionWindow {
  readonly durationTicks: number;
  readonly instability: Rating;
  readonly chaos: Rating;
  readonly delayedDefenders: number;
}

export interface ProjectionEvaluation {
  readonly projectionQuality: Rating;
  readonly transitionSpeed: Rating;
  readonly primaryRunnerRole: PlayerRole;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

export interface TransitionSupportEvaluation {
  readonly supportAvailability: Rating;
  readonly supportRunnerCount: number;
  readonly keySupportRole: PlayerRole;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

export interface DefensiveRecoveryEvaluation {
  readonly recoveryQuality: Rating;
  readonly defensiveInstability: Rating;
  readonly delayedDefenders: number;
  readonly keyRecoveryRole: PlayerRole;
  readonly recoveryExplanation: string;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

export interface TransitionDangerEvaluation {
  readonly dangerScore: Rating;
  readonly dangerLevel: DangerLevel;
  readonly weakSideAttackPotential: Rating;
  readonly openCorridorScore: Rating;
  readonly axisExposure: Rating;
  readonly breakdown: readonly InteractionScoreBreakdown[];
}

export interface UpdatedTransitionContext {
  readonly activeZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly moveType: SpatialMoveType;
  readonly pressureLevel: PressureLevel;
  readonly dangerLevel: DangerLevel;
  readonly transitionWindow: TransitionWindow;
  readonly outcome: TransitionOutcome;
  readonly finishingTrigger: FinishingTriggerEvaluation | null;
  readonly updates: readonly TransitionContextUpdateType[];
  readonly targetZones: readonly ZoneId[];
}

export interface TransitionInteractionEvent {
  readonly tick: TacticalTick;
  readonly type: InteractionType;
  readonly trigger: TransitionTrigger;
  readonly offensiveTeamId: TeamId;
  readonly defensiveTeamId: TeamId;
  readonly activeZone: ZoneId;
  readonly involvedRoles: readonly PlayerRole[];
  readonly outcome: TransitionOutcome;
  readonly dangerLevel: DangerLevel;
  readonly tacticalConsequences: readonly TransitionContextUpdateType[];
  readonly summary: string;
}

export interface TransitionInteractionResult {
  readonly outcome: TransitionOutcome;
  readonly dangerLevel: DangerLevel;
  readonly dangerScore: Rating;
  readonly transitionWindow: TransitionWindow;
  readonly projection: ProjectionEvaluation;
  readonly support: TransitionSupportEvaluation;
  readonly offensiveParticipation: OffensiveParticipationEvaluation;
  readonly defensiveParticipation: DefensiveParticipationEvaluation;
  readonly defensiveRecovery: DefensiveRecoveryEvaluation;
  readonly danger: TransitionDangerEvaluation;
  readonly updatedContext: UpdatedTransitionContext;
  readonly event: TransitionInteractionEvent;
  readonly logs: readonly TacticalLogLine[];
}

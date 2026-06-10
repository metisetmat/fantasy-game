import type { PlayerId, TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { PressureLevel, SequenceType } from "../../models/match";
import type { PlayerRole } from "../../models/player";

export enum InteractionType {
  BuildUpUnderPressure = "build_up_under_pressure",
  OffensiveConstruction = "offensive_construction",
  OffensiveTransition = "offensive_transition",
  CoordinatedPressing = "coordinated_pressing",
  Finishing = "finishing",
}

export enum InteractionLifecycleStage {
  Trigger = "trigger",
  ActorSelection = "actor_selection",
  ContextEvaluation = "context_evaluation",
  DecisionSelection = "decision_selection",
  Resolution = "resolution",
  StateUpdates = "state_updates",
  EventGeneration = "event_generation",
}

export enum InteractionOutcomeTier {
  MajorOffensiveSuccess = "major_offensive_success",
  MinorOffensiveSuccess = "minor_offensive_success",
  Balanced = "balanced",
  MinorDefensiveSuccess = "minor_defensive_success",
  MajorDefensiveSuccess = "major_defensive_success",
}

export interface InteractionActorGroup {
  readonly teamId: TeamId;
  readonly playerIds: readonly PlayerId[];
  readonly roles: readonly PlayerRole[];
}

export interface InteractionContext {
  readonly type: InteractionType;
  readonly sequenceType: SequenceType;
  readonly activeZone: ZoneId;
  readonly pressureLevel: PressureLevel;
  readonly tempo: Rating;
  readonly chaos: Rating;
  readonly offensiveActors: InteractionActorGroup;
  readonly defensiveActors: InteractionActorGroup;
}

export interface InteractionDecision {
  readonly label: string;
  readonly actorTeamId: TeamId;
  readonly risk: Rating;
  readonly verticality: Rating;
}

export interface InteractionResolution {
  readonly type: InteractionType;
  readonly outcomeTier: InteractionOutcomeTier;
  readonly offensiveCapability: Rating;
  readonly defensiveCapability: Rating;
  readonly contextualVariance: Rating;
  readonly tacticalConsequences: readonly string[];
}

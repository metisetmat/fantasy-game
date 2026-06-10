import type { ZoneId } from "../../core/zones";
import type { PressureLevel } from "../../models/match";
import type { PlayerRole } from "../../models/player";
import type { SpatialMoveType, TargetZoneSelection } from "../spatial/intention";
import type { CanonicalEventActorModel } from "./eventActors";

export enum BallMovementEventType {
  ShortPass = "SHORT_PASS",
  DiagonalPass = "DIAGONAL_PASS",
  LongPlay = "LONG_PLAY",
  SwitchPlay = "SWITCH_PLAY",
  Offload = "OFFLOAD",
  Clearance = "CLEARANCE",
  KickIntoSpace = "KICK_INTO_SPACE",
}

export enum ReceptionEventType {
  CleanReception = "CLEAN_RECEPTION",
  ContestedReception = "CONTESTED_RECEPTION",
  LooseReception = "LOOSE_RECEPTION",
  Intercepted = "INTERCEPTED",
}

export enum PressureEventType {
  TacklePressure = "TACKLE_PRESSURE",
  CoverShadowDenial = "COVER_SHADOW_DENIAL",
  SupportCollapse = "SUPPORT_COLLAPSE",
  LastLineRecovery = "LAST_LINE_RECOVERY",
}

export enum ChaosEventType {
  LooseBall = "LOOSE_BALL",
  LiveBall = "LIVE_BALL",
  Scramble = "SCRAMBLE",
  SecondPhase = "SECOND_PHASE",
}

export enum ContactDominance {
  Dominant = "DOMINANT_CONTACT",
  Neutral = "NEUTRAL_CONTACT",
  Losing = "LOSING_CONTACT",
}

export enum SupportArrivalTiming {
  Early = "EARLY",
  Connected = "CONNECTED",
  Late = "LATE",
  Absent = "ABSENT",
}

export enum TacticalEventKind {
  BallMovement = "BALL_MOVEMENT",
  Reception = "RECEPTION",
  Pressure = "PRESSURE",
  SupportArrival = "SUPPORT_ARRIVAL",
  Contact = "CONTACT",
  LooseBall = "LOOSE_BALL",
  Interception = "INTERCEPTION",
}

export interface TacticalEvent {
  readonly kind: TacticalEventKind;
  readonly label: string;
  readonly description: string;
}

export interface TacticalEventChain {
  readonly events: readonly TacticalEvent[];
  readonly summary: string;
}

export interface ResolveTacticalEventChainInput {
  readonly attackingTeamName: string;
  readonly defendingTeamName: string;
  readonly actorRole: PlayerRole;
  readonly receiverRole: PlayerRole;
  readonly supportRole: PlayerRole;
  readonly defenderRole: PlayerRole;
  readonly fromZone: ZoneId;
  readonly targetSelection: TargetZoneSelection;
  readonly moveType: SpatialMoveType;
  readonly pressureLevel: PressureLevel;
  readonly supportQuality: number;
  readonly chaosLevel: number;
  readonly outcomeLabel: string;
  readonly actorModel?: CanonicalEventActorModel;
}

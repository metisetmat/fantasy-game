import type { PlayerId } from "../../core/ids";
import type { Rating, TacticalTick } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";

export enum MovementType {
  SupportRun = "SUPPORT_RUN",
  DepthRun = "DEPTH_RUN",
  WidthRun = "WIDTH_RUN",
  RecoveryRun = "RECOVERY_RUN",
  PressStep = "PRESS_STEP",
  CoverStep = "COVER_STEP",
  Sweep = "SWEEP",
  TransitionSprint = "TRANSITION_SPRINT",
  TrackRunner = "TRACK_RUNNER",
  Reposition = "REPOSITION",
  LooseBallAttack = "LOOSE_BALL_ATTACK",
}

export enum MovementState {
  Holding = "HOLDING",
  Accelerating = "ACCELERATING",
  Moving = "MOVING",
  Sprinting = "SPRINTING",
  Recovering = "RECOVERING",
  Arriving = "ARRIVING",
  Interrupted = "INTERRUPTED",
}

export interface MovementPosition {
  readonly x: number;
  readonly y: number;
  readonly zone: ZoneId;
}

export interface MovementVector {
  readonly dx: number;
  readonly dy: number;
}

export interface PlayerTrajectory {
  readonly trajectoryId: string;
  readonly playerId: PlayerId;
  readonly originZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly currentPosition: MovementPosition;
  readonly targetPosition: MovementPosition;
  readonly directionVector: MovementVector;
  readonly speed: number;
  readonly acceleration: number;
  readonly deceleration: number;
  readonly movementType: MovementType;
  readonly startedTick: TacticalTick;
  readonly expectedArrivalTick: TacticalTick;
  readonly currentProgress: Rating;
  readonly interrupted: boolean;
  readonly movementIntentSource: string;
  readonly urgency: Rating;
  readonly staminaCost: Rating;
  readonly inertiaFactor: Rating;
}

export interface TrajectorySummary {
  readonly playerId: PlayerId;
  readonly movementType: MovementType;
  readonly originZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly expectedArrivalTick: TacticalTick;
  readonly urgency: Rating;
  readonly sprinting: boolean;
}

import type { PlayerId, TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { LateralCorridor, ZoneId } from "../../core/zones";
import type { PlayerRole } from "../../models/player";
import type { VisiblePlayerAttributes } from "./visibleAttributes";
import type { DerivedPlayerAttributes } from "./derived";
import type { PlayerIntent } from "../intent";
import type { MovementPosition, MovementState, MovementVector, PlayerTrajectory } from "../movement";
import type { PerceptionState, PlayerOrientation } from "../perception";

export enum TacticalStatus {
  InStructure = "IN_STRUCTURE",
  Pressing = "PRESSING",
  Supporting = "SUPPORTING",
  Receiving = "RECEIVING",
  Carrying = "CARRYING",
  Covering = "COVERING",
  Recovering = "RECOVERING",
  Delayed = "DELAYED",
  Eliminated = "ELIMINATED",
  Contesting = "CONTESTING",
  Finishing = "FINISHING",
}

export enum RecoveryStatus {
  InLine = "IN_LINE",
  Recovering = "RECOVERING",
  Delayed = "DELAYED",
  Eliminated = "ELIMINATED",
  LastLine = "LAST_LINE",
}

export enum SupportStatus {
  Connected = "CONNECTED",
  Late = "LATE",
  Isolated = "ISOLATED",
  ThirdMan = "THIRD_MAN",
  PodSupport = "POD_SUPPORT",
  Screening = "SCREENING",
}

export enum ReceiverStatus {
  Free = "FREE",
  Supported = "SUPPORTED",
  Isolated = "ISOLATED",
  Marked = "MARKED",
  Unavailable = "UNAVAILABLE",
}

export enum StructuralRole {
  RestDefense = "REST_DEFENSE",
  PressureLine = "PRESSURE_LINE",
  SupportLine = "SUPPORT_LINE",
  DepthRunner = "DEPTH_RUNNER",
  LastLineCover = "LAST_LINE_COVER",
  BallCarrier = "BALL_CARRIER",
}

export interface PlayerMatchState {
  readonly playerId: PlayerId;
  readonly teamId: TeamId;
  readonly role: PlayerRole;
  readonly roleInitials: string;
  readonly visibleAttributes?: VisiblePlayerAttributes;
  readonly derivedAttributes?: DerivedPlayerAttributes;
  readonly zone: ZoneId;
  readonly lane: LateralCorridor;
  readonly hasBall: boolean;
  readonly tacticalIntent: string;
  readonly currentIntent: string | null;
  readonly intentStartedTick: number | null;
  readonly intentExpiresTick: number | null;
  readonly activeIntents: readonly PlayerIntent[];
  readonly primaryIntent: PlayerIntent | null;
  readonly previousIntent: PlayerIntent | null;
  readonly intentAgeTicks: number;
  readonly intentConfidence: Rating;
  readonly intentTargetZone: ZoneId | null;
  readonly intentOriginReason: string;
  readonly intentEvolutionStory: string;
  readonly intentUrgency: Rating;
  readonly intentEvolutionDirection: "ESCALATING" | "DECAYING" | "STABLE";
  readonly abstractX: number;
  readonly abstractY: number;
  readonly facingDirection: string | null;
  readonly movementVector: { readonly dx: number; readonly dy: number } | null;
  readonly playerOrientation: PlayerOrientation | null;
  readonly perception: PerceptionState | null;
  readonly perceptionConfidence: Rating;
  readonly awarenessRadius: number;
  readonly blindSideZones: readonly ZoneId[];
  readonly scanFreshnessTicks: number;
  readonly pressureRecognition: Rating;
  readonly weakSideAwareness: Rating;
  readonly blindSideExposure: Rating;
  readonly reactionDelayTicks: number;
  readonly currentPosition: MovementPosition;
  readonly targetPosition: MovementPosition;
  readonly activeTrajectory: PlayerTrajectory | null;
  readonly velocity: MovementVector;
  readonly movementState: MovementState;
  readonly sprinting: boolean;
  readonly recovering: boolean;
  readonly estimatedArrivalTick: number | null;
  readonly tacticalStatus: TacticalStatus;
  readonly fatigue: Rating;
  readonly pressure: Rating;
  readonly momentum: Rating;
  readonly supportStatus: SupportStatus;
  readonly receiverStatus: ReceiverStatus;
  readonly recoveryStatus: RecoveryStatus;
  readonly structuralRole: StructuralRole;
  readonly isGoalSide: boolean;
  readonly isRelevantToBall: boolean;
  readonly isAvailableReceiver: boolean;
  readonly isDelayed: boolean;
  readonly isEliminated: boolean;
  readonly isRecovering: boolean;
}

export interface PlayerDerivedTeamState {
  readonly compactness: Rating;
  readonly supportQuality: Rating;
  readonly recoveryLoad: Rating;
  readonly restDefenseCount: number;
  readonly corridorOccupation: number;
  readonly relevantPlayers: readonly PlayerMatchState[];
  readonly availableReceivers: readonly PlayerMatchState[];
  readonly delayedPlayers: readonly PlayerMatchState[];
  readonly recoveringPlayers: readonly PlayerMatchState[];
  readonly eliminatedPlayers: readonly PlayerMatchState[];
}

export interface PlayerDerivedNumericalPressure {
  readonly attackersNearBall: readonly PlayerMatchState[];
  readonly defendersGoalSide: readonly PlayerMatchState[];
  readonly delayedDefenders: readonly PlayerMatchState[];
  readonly bypassedDefenders: readonly PlayerMatchState[];
  readonly supportPlayers: readonly PlayerMatchState[];
  readonly description: string;
}

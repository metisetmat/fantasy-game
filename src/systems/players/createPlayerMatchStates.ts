import type { ZoneId } from "../../core/zones";
import type { PlayerRole, PlayerState } from "../../models/player";
import { resolvePlayerTrajectory } from "../movement";
import { getDirectionalDistance, type AttackingDirection, type BallContext } from "../spatial/intention";
import { getLateralIndex, getLongitudinalIndex, getZoneParts } from "../spatial/utils";
import { PlayerStructuralState, type PlayerStructuralParticipation } from "../structure";
import {
  RecoveryStatus,
  ReceiverStatus,
  StructuralRole,
  SupportStatus,
  TacticalStatus,
  type PlayerMatchState,
} from "./types";

export interface PlayerMatchStateAssignment {
  readonly role: PlayerRole;
  readonly zone: ZoneId;
  readonly tacticalStatus?: TacticalStatus;
  readonly recoveryStatus?: RecoveryStatus;
  readonly supportStatus?: SupportStatus;
  readonly structuralRole?: StructuralRole;
}

function roleInitials(role: PlayerRole): string {
  return role
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("")
    .slice(0, 2);
}

function distanceToZone(left: ZoneId, right: ZoneId): number {
  const leftParts = getZoneParts(left);
  const rightParts = getZoneParts(right);

  return (
    Math.abs(Number(leftParts.longitudinalZone.slice(1)) - Number(rightParts.longitudinalZone.slice(1))) +
    Math.abs(getLateralIndex(leftParts.lateralCorridor) - getLateralIndex(rightParts.lateralCorridor))
  );
}

function isGoalSide(input: {
  readonly playerZone: ZoneId;
  readonly ballZone: ZoneId;
  readonly attackingDirection: AttackingDirection;
}): boolean {
  const player = getZoneParts(input.playerZone);
  const ball = getZoneParts(input.ballZone);

  return getDirectionalDistance(ball.longitudinalZone, player.longitudinalZone, input.attackingDirection) >= 0;
}

function fromStructuralParticipation(
  participation: PlayerStructuralParticipation | undefined,
): Pick<PlayerMatchStateAssignment, "tacticalStatus" | "recoveryStatus" | "supportStatus" | "structuralRole"> {
  if (participation === undefined) {
    return {};
  }

  switch (participation.state) {
    case PlayerStructuralState.Covering:
      return {
        tacticalStatus: TacticalStatus.Covering,
        recoveryStatus: RecoveryStatus.LastLine,
        structuralRole: StructuralRole.LastLineCover,
      };
    case PlayerStructuralState.Delayed:
      return {
        tacticalStatus: TacticalStatus.Delayed,
        recoveryStatus: RecoveryStatus.Delayed,
        structuralRole: StructuralRole.PressureLine,
      };
    case PlayerStructuralState.Eliminated:
      return {
        tacticalStatus: TacticalStatus.Eliminated,
        recoveryStatus: RecoveryStatus.Eliminated,
        structuralRole: StructuralRole.PressureLine,
      };
    case PlayerStructuralState.Recovering:
      return {
        tacticalStatus: TacticalStatus.Recovering,
        recoveryStatus: RecoveryStatus.Recovering,
        structuralRole: StructuralRole.SupportLine,
      };
    case PlayerStructuralState.Pressing:
      return {
        tacticalStatus: TacticalStatus.Pressing,
        structuralRole: StructuralRole.PressureLine,
      };
    case PlayerStructuralState.Supporting:
      return {
        tacticalStatus: TacticalStatus.Supporting,
        supportStatus: SupportStatus.Connected,
        structuralRole: StructuralRole.SupportLine,
      };
    case PlayerStructuralState.Projecting:
      return {
        tacticalStatus: TacticalStatus.Supporting,
        structuralRole: StructuralRole.DepthRunner,
      };
    case PlayerStructuralState.InStructure:
      return {
        tacticalStatus: TacticalStatus.InStructure,
        structuralRole: StructuralRole.RestDefense,
      };
  }
}

function defaultSupportStatus(distance: number): SupportStatus {
  if (distance <= 1) {
    return SupportStatus.Connected;
  }

  if (distance === 2) {
    return SupportStatus.Late;
  }

  return SupportStatus.Isolated;
}

function defaultReceiverStatus(input: {
  readonly isPossessionTeam: boolean;
  readonly distance: number;
  readonly hasBall: boolean;
}): ReceiverStatus {
  if (!input.isPossessionTeam) {
    return ReceiverStatus.Unavailable;
  }

  if (input.hasBall) {
    return ReceiverStatus.Supported;
  }

  if (input.distance <= 1) {
    return ReceiverStatus.Free;
  }

  if (input.distance === 2) {
    return ReceiverStatus.Supported;
  }

  return ReceiverStatus.Isolated;
}

function getAbstractPoint(zone: ZoneId): { readonly abstractX: number; readonly abstractY: number } {
  const parts = getZoneParts(zone);

  return {
    abstractX: getLongitudinalIndex(parts.longitudinalZone) / 6,
    abstractY: getLateralIndex(parts.lateralCorridor) / 4,
  };
}

export function createPlayerMatchStates(input: {
  readonly players: readonly PlayerState[];
  readonly isPossessionTeam: boolean;
  readonly ballContext: BallContext;
  readonly attackingDirection: AttackingDirection;
  readonly assignments?: readonly PlayerMatchStateAssignment[];
  readonly structuralParticipation?: readonly PlayerStructuralParticipation[];
  readonly targetRole?: PlayerRole;
  readonly targetZone?: ZoneId;
  readonly tick?: number;
}): readonly PlayerMatchState[] {
  return input.players.map((player): PlayerMatchState => {
    const assignment = input.assignments?.find((item) => item.role === player.role);
    const participation = input.structuralParticipation?.find((item) => item.role === player.role);
    const participationState = fromStructuralParticipation(participation);
    const hasBall = input.isPossessionTeam && player.role === input.ballContext.ballCarrierRole;
    const targetReceiver = input.isPossessionTeam && player.role === input.targetRole;
    const zone = hasBall
      ? input.ballContext.ballLocation
      : targetReceiver && input.targetZone !== undefined
        ? input.targetZone
        : assignment?.zone ?? participation?.zone ?? player.currentZone;
    const distance = distanceToZone(zone, input.ballContext.ballLocation);
    const goalSide = isGoalSide({
      playerZone: zone,
      ballZone: input.ballContext.ballLocation,
      attackingDirection: input.attackingDirection,
    });
    const tacticalStatus =
      hasBall
        ? TacticalStatus.Carrying
        : targetReceiver
          ? TacticalStatus.Receiving
          : assignment?.tacticalStatus ?? participationState.tacticalStatus ?? (input.isPossessionTeam ? TacticalStatus.Supporting : TacticalStatus.InStructure);
    const recoveryStatus = assignment?.recoveryStatus ?? participationState.recoveryStatus ?? (goalSide ? RecoveryStatus.InLine : RecoveryStatus.Recovering);
    const supportStatus =
      assignment?.supportStatus ??
      participationState.supportStatus ??
      (targetReceiver ? SupportStatus.ThirdMan : defaultSupportStatus(distance));
    const receiverStatus = defaultReceiverStatus({
      isPossessionTeam: input.isPossessionTeam,
      distance,
      hasBall,
    });
    const structuralRole =
      hasBall
        ? StructuralRole.BallCarrier
        : assignment?.structuralRole ??
          participationState.structuralRole ??
          (goalSide ? StructuralRole.RestDefense : input.isPossessionTeam ? StructuralRole.SupportLine : StructuralRole.PressureLine);
    const abstractPoint = getAbstractPoint(zone);
    const tacticalIntent = targetReceiver ? "receive next action" : hasBall ? "carry and decide" : input.isPossessionTeam ? "support ball" : "protect structure";
    const primaryIntent = player.primaryIntent ?? null;
    const movement = resolvePlayerTrajectory({
      playerId: player.id,
      role: player.role,
      originZone: zone,
      ballZone: input.ballContext.ballLocation,
      attackingDirection: input.attackingDirection,
      tick: input.tick ?? 0,
      intent: primaryIntent,
      fatigue: player.fatigue.accumulatedFatigue,
      speedAttribute: player.visibleAttributes?.speed ?? player.attributes.speed,
      ...(targetReceiver && input.targetZone !== undefined ? { fallbackTargetZone: input.targetZone } : {}),
    });

    return {
      playerId: player.id,
      teamId: player.teamId,
      role: player.role,
    roleInitials: player.roleInitials ?? roleInitials(player.role),
    ...(player.visibleAttributes === undefined ? {} : { visibleAttributes: player.visibleAttributes }),
    ...(player.derivedAttributes === undefined ? {} : { derivedAttributes: player.derivedAttributes }),
      zone,
      lane: getZoneParts(zone).lateralCorridor,
      hasBall,
      tacticalIntent,
      currentIntent: primaryIntent?.type ?? tacticalIntent,
      intentStartedTick: primaryIntent?.startedTick ?? null,
      intentExpiresTick: primaryIntent?.expiresTick ?? null,
      activeIntents: player.activeIntents ?? [],
      primaryIntent,
      previousIntent: player.previousIntent ?? null,
      intentAgeTicks: player.intentAgeTicks ?? 0,
      intentConfidence: player.intentConfidence ?? 0,
      intentTargetZone: player.intentTargetZone ?? null,
      intentOriginReason: player.intentOriginReason ?? "no active intent",
      intentEvolutionStory: player.intentEvolutionStory ?? player.primaryIntent?.tacticalStory ?? "no intent evolution",
      intentUrgency: player.intentUrgency ?? player.primaryIntent?.urgency ?? 0,
      intentEvolutionDirection: player.intentEvolutionDirection ?? player.primaryIntent?.evolutionDirection ?? "STABLE",
      abstractX: abstractPoint.abstractX,
      abstractY: abstractPoint.abstractY,
      facingDirection: movement.facingDirection,
      movementVector: movement.movementVector,
      playerOrientation: null,
      perception: null,
      perceptionConfidence: 50,
      awarenessRadius: 2,
      blindSideZones: [],
      scanFreshnessTicks: 0,
      pressureRecognition: 50,
      weakSideAwareness: 50,
      blindSideExposure: 50,
      reactionDelayTicks: 1,
      currentPosition: movement.currentPosition,
      targetPosition: movement.targetPosition,
      activeTrajectory: movement.activeTrajectory,
      velocity: movement.velocity,
      movementState: movement.movementState,
      sprinting: movement.sprinting,
      recovering: movement.recovering,
      estimatedArrivalTick: movement.estimatedArrivalTick,
      tacticalStatus,
      fatigue: player.fatigue.accumulatedFatigue,
      pressure: Math.max(0, 100 - player.fatigue.freshness + (distance <= 1 ? 18 : 0)),
      momentum: player.momentum,
      supportStatus,
      receiverStatus: targetReceiver ? ReceiverStatus.Free : receiverStatus,
      recoveryStatus,
      structuralRole,
      isGoalSide: goalSide,
      isRelevantToBall: distance <= 2 || hasBall || targetReceiver,
      isAvailableReceiver: input.isPossessionTeam && !hasBall && (receiverStatus === ReceiverStatus.Free || receiverStatus === ReceiverStatus.Supported || targetReceiver),
      isDelayed: recoveryStatus === RecoveryStatus.Delayed,
      isEliminated: recoveryStatus === RecoveryStatus.Eliminated,
      isRecovering: recoveryStatus === RecoveryStatus.Recovering,
    };
  });
}

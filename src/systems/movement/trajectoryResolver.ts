import type { Rating, TacticalTick } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { PlayerRole } from "../../models/player";
import type { PlayerIntent } from "../intent";
import type { AttackingDirection } from "../spatial/intention";
import { getZoneDistance } from "../spatial/coordinates";
import { getDirectionVector, zoneToMovementPosition } from "./directionality";
import { movementTypeForIntent, resolveIntentTargetZone } from "./movementIntentBinding";
import { advanceTrajectory, movementStateFromTrajectory } from "./movementTick";
import { calculateInertiaFactor, calculateStaminaCost, calculateTrajectorySpeed, shouldSprint } from "./sprintModel";
import { MovementState, type MovementPosition, type MovementVector, type PlayerTrajectory } from "./playerTrajectory";

export interface ResolvedPlayerMovement {
  readonly currentPosition: MovementPosition;
  readonly targetPosition: MovementPosition;
  readonly activeTrajectory: PlayerTrajectory | null;
  readonly velocity: MovementVector;
  readonly facingDirection: string | null;
  readonly movementState: MovementState;
  readonly sprinting: boolean;
  readonly recovering: boolean;
  readonly estimatedArrivalTick: TacticalTick | null;
  readonly movementVector: MovementVector | null;
}

export function resolvePlayerTrajectory(input: {
  readonly playerId: string;
  readonly role: PlayerRole;
  readonly originZone: ZoneId;
  readonly ballZone: ZoneId;
  readonly attackingDirection: AttackingDirection;
  readonly tick: TacticalTick;
  readonly intent: PlayerIntent | null;
  readonly fatigue: Rating;
  readonly speedAttribute: Rating;
  readonly fallbackTargetZone?: ZoneId;
}): ResolvedPlayerMovement {
  const targetZone = resolveIntentTargetZone({
    originZone: input.originZone,
    ballZone: input.ballZone,
    attackingDirection: input.attackingDirection,
    role: input.role,
    intent: input.intent,
    ...(input.fallbackTargetZone === undefined ? {} : { fallbackTargetZone: input.fallbackTargetZone }),
  });
  const distance = getZoneDistance(input.originZone, targetZone);
  const urgency = input.intent?.urgency ?? 35;

  if (distance === 0 && input.intent === null) {
    const position = zoneToMovementPosition(input.originZone);

    return {
      currentPosition: position,
      targetPosition: position,
      activeTrajectory: null,
      velocity: { dx: 0, dy: 0 },
      facingDirection: input.attackingDirection,
      movementState: MovementState.Holding,
      sprinting: false,
      recovering: false,
      estimatedArrivalTick: null,
      movementVector: null,
    };
  }

  const movementType = movementTypeForIntent(input.intent?.type ?? null);
  const speed = calculateTrajectorySpeed({
    movementType,
    urgency,
    fatigue: input.fatigue,
    speedAttribute: input.speedAttribute,
  });
  const durationTicks = Math.max(1, Math.ceil(Math.max(1, distance) / speed));
  const staminaCost = calculateStaminaCost({
    movementType,
    urgency,
    distance,
  });
  const inertiaFactor = calculateInertiaFactor({
    movementType,
    urgency,
    fatigue: input.fatigue,
  });
  const directionVector = getDirectionVector({
    originZone: input.originZone,
    targetZone,
  });
  const trajectory: PlayerTrajectory = {
    trajectoryId: `${input.playerId}-${input.tick}-${movementType}`,
    playerId: input.playerId,
    originZone: input.originZone,
    targetZone,
    currentPosition: zoneToMovementPosition(input.originZone),
    targetPosition: zoneToMovementPosition(targetZone),
    directionVector,
    speed,
    acceleration: Number((speed * 0.28).toFixed(3)),
    deceleration: Number((speed * 0.18 + inertiaFactor / 250).toFixed(3)),
    movementType,
    startedTick: input.tick,
    expectedArrivalTick: input.tick + durationTicks,
    currentProgress: 0,
    interrupted: false,
    movementIntentSource: input.intent?.source ?? "role_default",
    urgency,
    staminaCost,
    inertiaFactor,
  };
  const advanced = advanceTrajectory({
    trajectory,
    tick: input.tick + 1,
  });
  const movementState = movementStateFromTrajectory(advanced);

  return {
    currentPosition: advanced.currentPosition,
    targetPosition: advanced.targetPosition,
    activeTrajectory: advanced,
    velocity: {
      dx: Number((advanced.directionVector.dx * advanced.speed).toFixed(3)),
      dy: Number((advanced.directionVector.dy * advanced.speed).toFixed(3)),
    },
    facingDirection: input.attackingDirection,
    movementState,
    sprinting: shouldSprint({ movementType, urgency }),
    recovering: movementState === MovementState.Recovering,
    estimatedArrivalTick: advanced.expectedArrivalTick,
    movementVector: advanced.directionVector,
  };
}

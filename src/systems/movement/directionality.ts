import { LATERAL_CORRIDORS, LONGITUDINAL_ZONES, createZoneId, type LateralCorridor, type ZoneId } from "../../core/zones";
import { AttackingDirection } from "../spatial/intention";
import { getZoneCoordinate } from "../spatial/coordinates";
import { getLateralIndex, getLongitudinalIndex, getZoneParts } from "../spatial/utils";
import type { MovementPosition, MovementVector } from "./playerTrajectory";

export function zoneToMovementPosition(zone: ZoneId): MovementPosition {
  const coordinate = getZoneCoordinate(zone);

  return {
    x: coordinate.x,
    y: coordinate.y,
    zone,
  };
}

export function normalizeVector(vector: MovementVector): MovementVector {
  const magnitude = Math.hypot(vector.dx, vector.dy);

  if (magnitude === 0) {
    return { dx: 0, dy: 0 };
  }

  return {
    dx: Number((vector.dx / magnitude).toFixed(3)),
    dy: Number((vector.dy / magnitude).toFixed(3)),
  };
}

export function getDirectionVector(input: {
  readonly originZone: ZoneId;
  readonly targetZone: ZoneId;
}): MovementVector {
  const origin = zoneToMovementPosition(input.originZone);
  const target = zoneToMovementPosition(input.targetZone);

  return normalizeVector({
    dx: target.x - origin.x,
    dy: target.y - origin.y,
  });
}

export function interpolatePosition(input: {
  readonly originZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly progress: number;
}): MovementPosition {
  const origin = zoneToMovementPosition(input.originZone);
  const target = zoneToMovementPosition(input.targetZone);
  const progress = Math.max(0, Math.min(1, input.progress));

  return {
    x: Number((origin.x + (target.x - origin.x) * progress).toFixed(3)),
    y: Number((origin.y + (target.y - origin.y) * progress).toFixed(3)),
    zone: progress >= 0.75 ? input.targetZone : input.originZone,
  };
}

export function shiftZoneByDirection(input: {
  readonly zone: ZoneId;
  readonly attackingDirection: AttackingDirection;
  readonly longitudinalSteps: number;
  readonly lateralSteps?: number;
  readonly preferredLane?: LateralCorridor;
}): ZoneId {
  const parts = getZoneParts(input.zone);
  const directionalStep = input.attackingDirection === AttackingDirection.Z1ToZ7 ? 1 : -1;
  const longitudinalIndex = Math.max(
    0,
    Math.min(
      LONGITUDINAL_ZONES.length - 1,
      getLongitudinalIndex(parts.longitudinalZone) + input.longitudinalSteps * directionalStep,
    ),
  );
  const lateralIndex = Math.max(
    0,
    Math.min(
      LATERAL_CORRIDORS.length - 1,
      input.preferredLane === undefined
        ? getLateralIndex(parts.lateralCorridor) + (input.lateralSteps ?? 0)
        : LATERAL_CORRIDORS.indexOf(input.preferredLane),
    ),
  );
  const longitudinalZone = LONGITUDINAL_ZONES[longitudinalIndex] ?? parts.longitudinalZone;
  const lateralCorridor = LATERAL_CORRIDORS[lateralIndex] ?? parts.lateralCorridor;

  return createZoneId(longitudinalZone, lateralCorridor);
}

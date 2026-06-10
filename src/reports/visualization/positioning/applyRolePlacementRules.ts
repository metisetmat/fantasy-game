import { LateralCorridor, LONGITUDINAL_ZONES, createZoneId, type LongitudinalZone, type ZoneId } from "../../../core/zones";
import { PlayerRole } from "../../../models/player";
import { TacticalStyle } from "../../../models/tactics";
import { AttackingDirection } from "../../../systems/spatial/intention";
import { getZoneParts } from "../../../systems/spatial/utils";

const LANES: readonly LateralCorridor[] = [
  LateralCorridor.LeftCorridor,
  LateralCorridor.LeftHalfSpace,
  LateralCorridor.CentralAxis,
  LateralCorridor.RightHalfSpace,
  LateralCorridor.RightCorridor,
];

export function shiftZone(zone: ZoneId, longitudinalShift: number, lane: LateralCorridor): ZoneId {
  const parts = getZoneParts(zone);
  const index = LONGITUDINAL_ZONES.indexOf(parts.longitudinalZone);
  const next = LONGITUDINAL_ZONES[Math.max(0, Math.min(LONGITUDINAL_ZONES.length - 1, index + longitudinalShift))] as LongitudinalZone;

  return createZoneId(next, lane);
}

export function directionShift(direction: AttackingDirection, distance: number): number {
  return direction === AttackingDirection.Z1ToZ7 ? distance : -distance;
}

export function oppositeDirectionShift(direction: AttackingDirection, distance: number): number {
  return directionShift(direction, -distance);
}

export function getLane(zone: ZoneId): LateralCorridor {
  return getZoneParts(zone).lateralCorridor;
}

export function getOppositeLane(lane: LateralCorridor): LateralCorridor {
  switch (lane) {
    case LateralCorridor.LeftCorridor:
      return LateralCorridor.RightCorridor;
    case LateralCorridor.LeftHalfSpace:
      return LateralCorridor.RightHalfSpace;
    case LateralCorridor.RightHalfSpace:
      return LateralCorridor.LeftHalfSpace;
    case LateralCorridor.RightCorridor:
      return LateralCorridor.LeftCorridor;
    case LateralCorridor.CentralAxis:
      return LateralCorridor.CentralAxis;
  }
}

export function getNearbyLane(lane: LateralCorridor, offset: number): LateralCorridor {
  const index = LANES.indexOf(lane);

  return LANES[Math.max(0, Math.min(LANES.length - 1, index + offset))] ?? LateralCorridor.CentralAxis;
}

export function getRolePriorityLane(role: PlayerRole, ballLane: LateralCorridor, style: TacticalStyle): LateralCorridor {
  switch (role) {
    case PlayerRole.LeftAnchor:
    case PlayerRole.LeftPiston:
      return LateralCorridor.LeftCorridor;
    case PlayerRole.RightAnchor:
    case PlayerRole.RightPiston:
      return LateralCorridor.RightCorridor;
    case PlayerRole.MobileLock:
    case PlayerRole.ForwardLeader:
    case PlayerRole.PowerRunner:
    case PlayerRole.FreeSafety:
    case PlayerRole.GoalkeeperFreeSafety:
    case PlayerRole.Pivot:
      return LateralCorridor.CentralAxis;
    case PlayerRole.SpaceHunter:
      return style === TacticalStyle.Blitz ? getOppositeLane(ballLane) : getNearbyLane(ballLane, 1);
    case PlayerRole.Playmaker:
      return getNearbyLane(ballLane, ballLane === LateralCorridor.RightCorridor ? -1 : 1);
    case PlayerRole.TempoHalf:
    case PlayerRole.HookLink:
      return ballLane;
  }
}

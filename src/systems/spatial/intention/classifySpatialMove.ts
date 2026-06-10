import { getLateralIndex, getZoneParts } from "../utils";
import { getDirectionalDistance } from "./attackingDirection";
import { SpatialMoveType, type SpatialMoveClassificationInput } from "./types";

export function classifySpatialMove(input: SpatialMoveClassificationInput): SpatialMoveType {
  const from = getZoneParts(input.from);
  const to = getZoneParts(input.to);
  const forwardDistance = getDirectionalDistance(
    from.longitudinalZone,
    to.longitudinalZone,
    input.attackingDirection,
  );
  const lateralDistance = Math.abs(
    getLateralIndex(to.lateralCorridor) - getLateralIndex(from.lateralCorridor),
  );
  const isWeakSideTarget = input.weakSideZones.includes(input.to);

  if (forwardDistance >= 2) {
    return SpatialMoveType.DirectVerticalAttack;
  }

  if (forwardDistance >= 1) {
    return isWeakSideTarget && lateralDistance >= 2
      ? SpatialMoveType.WeakSideSwitch
      : SpatialMoveType.Progression;
  }

  if (forwardDistance <= -2) {
    return SpatialMoveType.SafetyClearance;
  }

  if (forwardDistance < 0) {
    return SpatialMoveType.BackwardRecycle;
  }

  if (isWeakSideTarget && lateralDistance >= 2) {
    return SpatialMoveType.WeakSideSwitch;
  }

  return SpatialMoveType.LateralCirculation;
}

import type { ZoneId } from "../../../core/zones";
import { getZoneParts } from "../utils";
import { getDirectionalDistance } from "./attackingDirection";
import {
  WeakSideSpatialRole,
  type AttackingDirection,
  type WeakSideClassification,
} from "./types";

export function classifyWeakSideByDirection(input: {
  readonly ballLocation: ZoneId;
  readonly weakSideZone: ZoneId;
  readonly attackingDirection: AttackingDirection;
}): WeakSideClassification {
  const ball = getZoneParts(input.ballLocation);
  const target = getZoneParts(input.weakSideZone);
  const directionalDistance = getDirectionalDistance(
    ball.longitudinalZone,
    target.longitudinalZone,
    input.attackingDirection,
  );

  if (directionalDistance >= 0) {
    return {
      zone: input.weakSideZone,
      role: WeakSideSpatialRole.DangerousWeakSide,
      description: "dangerous weak side, level with or ahead of the ball",
    };
  }

  if (directionalDistance === -1) {
    return {
      zone: input.weakSideZone,
      role: WeakSideSpatialRole.SafeRecycleOption,
      description: "safe recycle option behind the ball",
    };
  }

  return {
    zone: input.weakSideZone,
    role: WeakSideSpatialRole.ResetOption,
    description: "reset option clearly behind the play",
  };
}

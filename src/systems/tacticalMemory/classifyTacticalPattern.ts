import type { LongitudinalZone, ZoneId } from "../../core/zones";
import { getZoneParts } from "../spatial/utils";
import { SpatialMoveType } from "../spatial/intention";
import { SideType } from "../spatial/sides";
import {
  TacticalMemoryInteraction,
  TacticalRiskProfile,
  type TacticalPattern,
} from "./types";

function classifyRisk(moveType: SpatialMoveType): TacticalRiskProfile {
  switch (moveType) {
    case SpatialMoveType.DirectVerticalAttack:
    case SpatialMoveType.WeakSideSwitch:
    case SpatialMoveType.Finishing:
      return TacticalRiskProfile.High;
    case SpatialMoveType.Progression:
      return TacticalRiskProfile.Medium;
    case SpatialMoveType.LateralCirculation:
    case SpatialMoveType.BackwardRecycle:
    case SpatialMoveType.SafetyClearance:
      return TacticalRiskProfile.Low;
  }
}

export function classifyTacticalPattern(input: {
  readonly interaction: TacticalMemoryInteraction;
  readonly moveType: SpatialMoveType;
  readonly targetZone: ZoneId;
  readonly sideType: SideType;
}): TacticalPattern {
  return {
    interaction: input.interaction,
    moveType: input.moveType,
    sideType: input.sideType,
    zoneBand: getZoneParts(input.targetZone).longitudinalZone as LongitudinalZone,
    riskProfile: classifyRisk(input.moveType),
  };
}

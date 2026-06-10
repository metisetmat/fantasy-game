import { PressureLevel } from "../../models/match";
import { SpatialMoveType, ThreatLevel } from "../spatial/intention";
import type { OffensivePhilosophyEvaluationInput } from "./types";

export function evaluateCollectiveProgression(
  input: OffensivePhilosophyEvaluationInput,
): number {
  const stableSupport = input.supportScore >= 72 && input.collectiveProperties.cohesion >= 75;
  const highThreat =
    input.scoringThreat === ThreatLevel.High || input.tacticalDanger === ThreatLevel.High;

  if (input.moveType === SpatialMoveType.Progression && input.forwardDistance === 1) {
    return stableSupport ? 16 : 10;
  }

  if (input.moveType === SpatialMoveType.LateralCirculation) {
    return highThreat || input.territorialPressure >= 70 ? -10 : 6;
  }

  if (input.moveType === SpatialMoveType.WeakSideSwitch) {
    return highThreat ? 10 : 6;
  }

  if (input.moveType === SpatialMoveType.DirectVerticalAttack) {
    return highThreat && input.supportScore >= 78 ? -6 : -24;
  }

  if (
    input.moveType === SpatialMoveType.BackwardRecycle &&
    input.pressure === PressureLevel.High
  ) {
    return 6;
  }

  return 0;
}

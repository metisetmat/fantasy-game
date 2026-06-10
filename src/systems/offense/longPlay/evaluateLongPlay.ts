import { PressureLevel } from "../../../models/match";
import { SpatialMoveType, ThreatLevel } from "../../spatial/intention";
import type { OffensivePhilosophyEvaluationInput } from "../types";
import { evaluateLineBreak } from "./evaluateLineBreak";

export function evaluateLongPlayProgression(input: OffensivePhilosophyEvaluationInput): number {
  if (input.moveType === SpatialMoveType.LateralCirculation) {
    return input.pressure === PressureLevel.High ? -4 : -14;
  }

  if (
    input.moveType === SpatialMoveType.BackwardRecycle ||
    input.moveType === SpatialMoveType.SafetyClearance
  ) {
    return -24;
  }

  const lineBreak = evaluateLineBreak(input);
  const skipReward = input.forwardDistance >= 2 ? 8 : 0;
  const scoringBoost = input.scoringThreat === ThreatLevel.High ? 6 : 0;

  return Math.round(lineBreak * 0.28 + skipReward + scoringBoost);
}

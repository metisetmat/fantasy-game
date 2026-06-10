import { SpatialMoveType } from "../../spatial/intention";
import type { OffensivePhilosophyEvaluationInput } from "../types";
import { evaluateProjectionDepth } from "./evaluateProjectionDepth";

export function evaluateLineBreak(input: OffensivePhilosophyEvaluationInput): number {
  if (
    input.moveType !== SpatialMoveType.DirectVerticalAttack &&
    input.moveType !== SpatialMoveType.Progression &&
    input.moveType !== SpatialMoveType.WeakSideSwitch
  ) {
    return 0;
  }

  return Math.round(
    evaluateProjectionDepth(input) +
      input.collectiveProperties.offensiveTransition * 0.18 +
      input.offensiveInstructions.riskLevel * 0.08 -
      Math.max(0, 65 - input.supportScore) * 0.25,
  );
}

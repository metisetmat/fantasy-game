import { PlayerRole } from "../../../models/player";
import { SpatialMoveType } from "../../spatial/intention";
import type { OffensivePhilosophyEvaluationInput } from "../types";

function getRoleRuptureBonus(role: PlayerRole): number {
  switch (role) {
    case PlayerRole.SpaceHunter:
    case PlayerRole.PowerRunner:
      return 16;
    case PlayerRole.Playmaker:
    case PlayerRole.ForwardLeader:
      return 8;
    default:
      return 0;
  }
}

export function evaluateRuptureReward(input: OffensivePhilosophyEvaluationInput): number {
  if (
    input.moveType !== SpatialMoveType.DirectVerticalAttack &&
    input.moveType !== SpatialMoveType.WeakSideSwitch &&
    input.moveType !== SpatialMoveType.Progression
  ) {
    return -8;
  }

  return Math.round(
    getRoleRuptureBonus(input.ballCarrierRole) +
      input.chaosLevel * 0.16 +
      input.offensiveInstructions.verticality * 0.1 +
      Math.max(0, input.forwardDistance) * 6,
  );
}

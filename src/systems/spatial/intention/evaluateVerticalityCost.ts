import { PressureLevel } from "../../../models/match";
import { SpatialMoveType } from "./types";

export interface VerticalityCostInput {
  readonly moveType: SpatialMoveType;
  readonly forwardDistance: number;
  readonly lateralDistance: number;
  readonly pressure: PressureLevel;
  readonly chaosLevel: number;
  readonly supportScore: number;
  readonly tacticalDiscipline: number;
}

export function evaluateVerticalityCost(input: VerticalityCostInput): number {
  const lineSkipCost = Math.max(0, input.forwardDistance - 1) * 14;
  const distanceCost = Math.max(0, input.forwardDistance) * 5 + input.lateralDistance * 2;
  const pressureCost = input.pressure === PressureLevel.High ? 8 : input.pressure === PressureLevel.Medium ? 4 : 0;
  const chaosCost = input.chaosLevel * 0.08;
  const weakSupportCost = Math.max(0, 62 - input.supportScore) * 0.16;
  const disciplineCost = Math.max(0, 68 - input.tacticalDiscipline) * 0.12;
  const directMultiplier = input.moveType === SpatialMoveType.DirectVerticalAttack ? 1.25 : 1;

  return Math.round(
    (lineSkipCost + distanceCost + pressureCost + chaosCost + weakSupportCost + disciplineCost) * directMultiplier,
  );
}

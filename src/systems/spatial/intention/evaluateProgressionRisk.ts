import { SpatialMoveType } from "./types";

export interface ProgressionRiskInput {
  readonly moveType: SpatialMoveType;
  readonly forwardDistance: number;
  readonly riskLevel: number;
  readonly defensiveCompactness: number;
  readonly supportScore: number;
}

export function evaluateProgressionRisk(input: ProgressionRiskInput): number {
  if (
    input.moveType !== SpatialMoveType.Progression &&
    input.moveType !== SpatialMoveType.DirectVerticalAttack &&
    input.moveType !== SpatialMoveType.WeakSideSwitch
  ) {
    return Math.max(0, 44 - input.supportScore) * 0.08;
  }

  const riskAcceptanceDiscount = input.riskLevel * 0.08;
  const compactnessCost = input.defensiveCompactness * 0.11;
  const supportCost = Math.max(0, 70 - input.supportScore) * 0.18;
  const distanceRisk = Math.max(0, input.forwardDistance) * 6;

  return Math.round(Math.max(0, compactnessCost + supportCost + distanceRisk - riskAcceptanceDiscount));
}

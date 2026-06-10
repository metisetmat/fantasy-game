import type { ZoneId } from "../../core/zones";
import { OccupationFunction, type PlayerFunctionalOccupation } from "./occupationTypes";
import { zoneColumn, type FunctionalOccupationContext } from "./occupationContext";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function corridor(zone: ZoneId): string {
  return zone.split("-")[1] ?? "C";
}

function isCentral(zone: ZoneId): boolean {
  return corridor(zone) === "C";
}

function isOuterOrHalfSpace(zone: ZoneId): boolean {
  return corridor(zone) !== "C";
}

export function scoreOccupationTarget(input: {
  readonly occupation: PlayerFunctionalOccupation;
  readonly zone: ZoneId;
  readonly context: FunctionalOccupationContext;
  readonly conflictCount: number;
}): {
  readonly targetScore: number;
  readonly styleFit: number;
  readonly structureCost: number;
  readonly riskCost: number;
  readonly teammateConflictCost: number;
  readonly functionZoneMismatch: boolean;
} {
  const style = input.context.teamStyles[input.occupation.teamId] ?? "CONTROL";
  const ballDistance = Math.abs(zoneColumn(input.zone) - zoneColumn(input.context.ballZone));
  const styleFit = clamp(style === "CONTROL" ? 84 - Math.max(0, ballDistance - 1) * 7 : 76 + Math.max(0, ballDistance - 1) * 3);
  const structureCost = clamp(input.occupation.structureFreedomBalance.category === "FREE_ROAMER" ? 12 : ballDistance * 7);
  const riskCost = clamp(
    [OccupationFunction.DepthThreat, OccupationFunction.ChaosAttacker, OccupationFunction.TransitionHunter].includes(input.occupation.primaryFunction)
      ? (style === "CONTROL" ? 26 : 12)
      : 8,
  );
  const teammateConflictCost = clamp(input.conflictCount * 12);
  const functionZoneMismatch =
    input.occupation.primaryFunction === OccupationFunction.WidthFixer
      ? isCentral(input.zone)
      : [OccupationFunction.RestDefenseAnchor, OccupationFunction.SafeRecycle].includes(input.occupation.primaryFunction)
        ? ballDistance > 3
        : input.occupation.primaryFunction === OccupationFunction.DirectSupport
          ? ballDistance > 1
          : false;
  const functionFit =
    input.occupation.primaryFunction === OccupationFunction.WidthFixer && isOuterOrHalfSpace(input.zone)
      ? 22
      : input.occupation.primaryFunction === OccupationFunction.RestDefenseAnchor && isCentral(input.zone)
        ? 18
        : input.occupation.primaryFunction === OccupationFunction.DirectSupport && ballDistance <= 1
          ? 18
          : 10;
  const targetScore = clamp(styleFit + functionFit - structureCost * 0.35 - riskCost * 0.25 - teammateConflictCost);

  return {
    targetScore,
    styleFit,
    structureCost,
    riskCost,
    teammateConflictCost,
    functionZoneMismatch,
  };
}

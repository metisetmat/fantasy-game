import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import {
  DensityEvaluation,
  DensityStatus,
  SpatialCellDensity,
  TeamOccupation,
} from "./types";
import { clampRating, getAllTacticalZones } from "./utils";

export interface DensityThresholds {
  readonly overloaded: Rating;
  readonly isolated: Rating;
}

export const DEFAULT_DENSITY_THRESHOLDS: DensityThresholds = {
  overloaded: 70,
  isolated: 20,
};

function getDensityStatus(totalDensity: Rating, thresholds: DensityThresholds): DensityStatus {
  if (totalDensity >= thresholds.overloaded) {
    return DensityStatus.Overloaded;
  }

  if (totalDensity <= thresholds.isolated) {
    return DensityStatus.Isolated;
  }

  return DensityStatus.Balanced;
}

function calculateCellDensity(
  zoneId: ZoneId,
  offensiveOccupation: TeamOccupation,
  defensiveOccupation: TeamOccupation,
  thresholds: DensityThresholds,
): SpatialCellDensity {
  const attackingDensity = offensiveOccupation.occupationMap[zoneId]?.influence ?? 0;
  const defensiveDensity = defensiveOccupation.occupationMap[zoneId]?.influence ?? 0;
  const totalDensity = clampRating((attackingDensity + defensiveDensity) / 2);
  const pressure = clampRating(defensiveDensity * 0.65 + Math.min(attackingDensity, defensiveDensity) * 0.35);

  return {
    zoneId,
    attackingDensity,
    defensiveDensity,
    totalDensity,
    pressure,
    status: getDensityStatus(totalDensity, thresholds),
  };
}

export function calculateDensityValues(
  offensiveOccupation: TeamOccupation,
  defensiveOccupation: TeamOccupation,
  thresholds: DensityThresholds = DEFAULT_DENSITY_THRESHOLDS,
): DensityEvaluation {
  const cells = getAllTacticalZones().map((zoneId) =>
    calculateCellDensity(zoneId, offensiveOccupation, defensiveOccupation, thresholds),
  );

  return {
    cells,
    densityMap: cells.reduce(
      (densityMap, cell) => ({
        ...densityMap,
        [cell.zoneId]: cell,
      }),
      {},
    ),
    overloadedZones: identifyOverloadedAreas(cells),
    isolatedZones: identifyIsolatedAreas(cells),
  };
}

export function identifyOverloadedAreas(cells: readonly SpatialCellDensity[]): readonly ZoneId[] {
  return cells
    .filter((cell) => cell.status === DensityStatus.Overloaded)
    .map((cell) => cell.zoneId);
}

export function identifyIsolatedAreas(cells: readonly SpatialCellDensity[]): readonly ZoneId[] {
  return cells
    .filter((cell) => cell.status === DensityStatus.Isolated)
    .map((cell) => cell.zoneId);
}

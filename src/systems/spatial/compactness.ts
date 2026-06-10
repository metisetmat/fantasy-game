import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { ShapeState } from "../../models/tactics";
import type {
  CompactnessEvaluation,
  OffensiveSpreadEvaluation,
  TeamOccupation,
} from "./types";
import {
  averageRatings,
  clampRating,
  countDistinct,
  getLateralIndex,
  getLongitudinalIndex,
  getZoneParts,
  labelRating,
} from "./utils";

function calculateAxisRange(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.max(...values) - Math.min(...values);
}

function calculateHorizontalCompactness(occupiedZones: readonly ZoneId[]): Rating {
  const lateralIndexes = occupiedZones.map((zoneId) => getLateralIndex(getZoneParts(zoneId).lateralCorridor));
  const lateralRange = calculateAxisRange(lateralIndexes);
  return clampRating(100 - lateralRange * 22);
}

function calculateVerticalCompactness(occupiedZones: readonly ZoneId[]): Rating {
  const longitudinalIndexes = occupiedZones.map((zoneId) =>
    getLongitudinalIndex(getZoneParts(zoneId).longitudinalZone),
  );
  const longitudinalRange = calculateAxisRange(longitudinalIndexes);
  return clampRating(100 - longitudinalRange * 18);
}

export function evaluateDefensiveCompactness(
  shape: ShapeState,
  occupation: TeamOccupation,
): CompactnessEvaluation {
  const horizontalCompactness = calculateHorizontalCompactness(shape.occupiedZones);
  const verticalCompactness = calculateVerticalCompactness(shape.occupiedZones);
  const influenceStability = averageRatings(occupation.cells.map((cell) => cell.influence));
  const overallCompactness = clampRating(
    shape.compactness * 0.45 +
      horizontalCompactness * 0.2 +
      verticalCompactness * 0.2 +
      influenceStability * 0.15,
  );

  return {
    horizontalCompactness,
    verticalCompactness,
    overallCompactness,
    label: labelRating(overallCompactness),
  };
}

export function evaluateOffensiveSpread(shape: ShapeState): OffensiveSpreadEvaluation {
  const corridorCount = countDistinct(shape.occupiedZones.map((zoneId) => getZoneParts(zoneId).lateralCorridor));
  const longitudinalCount = countDistinct(shape.occupiedZones.map((zoneId) => getZoneParts(zoneId).longitudinalZone));
  const widthOccupation = clampRating((corridorCount / 5) * 100 * 0.55 + shape.widthOccupation * 0.45);
  const verticalStretch = clampRating((longitudinalCount / 7) * 100 * 0.5 + (100 - shape.compactness) * 0.5);
  const spread = clampRating(widthOccupation * 0.65 + verticalStretch * 0.35);

  return {
    widthOccupation,
    verticalStretch,
    spread,
    label: labelRating(spread),
  };
}

export function calculateHorizontalCompactnessValue(occupiedZones: readonly ZoneId[]): Rating {
  return calculateHorizontalCompactness(occupiedZones);
}

export function calculateVerticalCompactnessValue(occupiedZones: readonly ZoneId[]): Rating {
  return calculateVerticalCompactness(occupiedZones);
}

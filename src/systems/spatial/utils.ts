import {
  LATERAL_CORRIDORS,
  LONGITUDINAL_ZONES,
  LateralCorridor,
  LongitudinalZone,
  createZoneId,
} from "../../core/zones";
import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import { SpatialLevel } from "./types";

export function clampRating(value: number): Rating {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function averageRatings(values: readonly Rating[]): Rating {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return clampRating(total / values.length);
}

export function labelRating(value: Rating): SpatialLevel {
  if (value >= 67) {
    return SpatialLevel.High;
  }

  if (value <= 33) {
    return SpatialLevel.Low;
  }

  return SpatialLevel.Medium;
}

export function createZones(
  longitudinalZones: readonly LongitudinalZone[],
  lateralCorridors: readonly LateralCorridor[],
): readonly ZoneId[] {
  return longitudinalZones.flatMap((longitudinalZone) =>
    lateralCorridors.map((lateralCorridor) => createZoneId(longitudinalZone, lateralCorridor)),
  );
}

export function getAllTacticalZones(): readonly ZoneId[] {
  return createZones(LONGITUDINAL_ZONES, LATERAL_CORRIDORS);
}

export function getLongitudinalIndex(zone: LongitudinalZone): number {
  return LONGITUDINAL_ZONES.indexOf(zone);
}

export function getLateralIndex(corridor: LateralCorridor): number {
  return LATERAL_CORRIDORS.indexOf(corridor);
}

export function getZoneParts(zoneId: ZoneId): {
  readonly longitudinalZone: LongitudinalZone;
  readonly lateralCorridor: LateralCorridor;
} {
  const [longitudinalZone, lateralCorridor] = zoneId.split("-") as [
    LongitudinalZone,
    LateralCorridor,
  ];

  return {
    longitudinalZone,
    lateralCorridor,
  };
}

export function countDistinct<T>(values: readonly T[]): number {
  return new Set(values).size;
}

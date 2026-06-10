import {
  LATERAL_CORRIDORS,
  LONGITUDINAL_ZONES,
  type LateralCorridor,
  type LongitudinalZone,
  type ZoneId,
} from "../../core/zones";
import { getLateralIndex, getLongitudinalIndex, getZoneParts } from "./utils";

export interface ZoneCoordinate {
  readonly zone: ZoneId;
  readonly x: number;
  readonly y: number;
  readonly longitudinalZone: LongitudinalZone;
  readonly lateralCorridor: LateralCorridor;
}

export function getZoneCoordinate(zone: ZoneId): ZoneCoordinate {
  const parts = getZoneParts(zone);

  return {
    zone,
    x: getLongitudinalIndex(parts.longitudinalZone),
    y: getLateralIndex(parts.lateralCorridor),
    longitudinalZone: parts.longitudinalZone,
    lateralCorridor: parts.lateralCorridor,
  };
}

export function getZoneDistance(left: ZoneId, right: ZoneId): number {
  const leftCoordinate = getZoneCoordinate(left);
  const rightCoordinate = getZoneCoordinate(right);

  return Math.abs(leftCoordinate.x - rightCoordinate.x) + Math.abs(leftCoordinate.y - rightCoordinate.y);
}

export function getAllZoneCoordinates(): readonly ZoneCoordinate[] {
  return LONGITUDINAL_ZONES.flatMap((longitudinalZone) =>
    LATERAL_CORRIDORS.map((lateralCorridor) => {
      const zone = `${longitudinalZone}-${lateralCorridor}` as ZoneId;

      return getZoneCoordinate(zone);
    }),
  );
}

export function getZonesBetween(input: {
  readonly from: ZoneId;
  readonly to: ZoneId;
}): readonly ZoneId[] {
  const from = getZoneCoordinate(input.from);
  const to = getZoneCoordinate(input.to);
  const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y), 1);
  const zones: ZoneId[] = [];

  for (let index = 0; index <= steps; index += 1) {
    const x = Math.round(from.x + ((to.x - from.x) * index) / steps);
    const y = Math.round(from.y + ((to.y - from.y) * index) / steps);
    const longitudinalZone = LONGITUDINAL_ZONES[Math.max(0, Math.min(LONGITUDINAL_ZONES.length - 1, x))];
    const lateralCorridor = LATERAL_CORRIDORS[Math.max(0, Math.min(LATERAL_CORRIDORS.length - 1, y))];

    if (longitudinalZone !== undefined && lateralCorridor !== undefined) {
      const zone = `${longitudinalZone}-${lateralCorridor}` as ZoneId;
      if (!zones.includes(zone)) {
        zones.push(zone);
      }
    }
  }

  return zones;
}

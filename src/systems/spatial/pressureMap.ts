import type { ZoneId } from "../../core/zones";
import type { InfluenceMap } from "./influenceMap";

export interface PressureMapZone {
  readonly zone: ZoneId;
  readonly pressure: number;
  readonly source: "CALCULATED_FROM_INFLUENCE_MAP";
}

export function buildPressureMap(map: InfluenceMap): readonly PressureMapZone[] {
  return map.cells.map((cell) => ({
    zone: cell.zone,
    pressure: cell.pressure,
    source: map.source,
  }));
}

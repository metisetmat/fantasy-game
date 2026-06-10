import type { ZoneId } from "../../core/zones";
import type { InfluenceMap } from "./influenceMap";

export interface ControlMapZone {
  readonly zone: ZoneId;
  readonly attackingControl: number;
  readonly defensiveControl: number;
  readonly source: "CALCULATED_FROM_INFLUENCE_MAP";
}

export function buildControlMap(map: InfluenceMap): readonly ControlMapZone[] {
  return map.cells.map((cell) => ({
    zone: cell.zone,
    attackingControl: cell.attackingInfluence,
    defensiveControl: cell.defensiveInfluence,
    source: map.source,
  }));
}

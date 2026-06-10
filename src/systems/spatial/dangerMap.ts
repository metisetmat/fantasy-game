import type { ZoneId } from "../../core/zones";
import type { InfluenceMap } from "./influenceMap";

export interface DangerMapZone {
  readonly zone: ZoneId;
  readonly danger: number;
  readonly source: "CALCULATED_FROM_INFLUENCE_MAP";
}

export function buildDangerMap(map: InfluenceMap): readonly DangerMapZone[] {
  return map.cells.map((cell) => ({
    zone: cell.zone,
    danger: cell.danger,
    source: map.source,
  }));
}

import type { ZoneId } from "../../../core/zones";
import { getZonesBetween } from "../coordinates";
import { clampRating } from "../utils";
import { getInfluenceFieldCell, type InfluenceField } from "./influenceField";

export interface CoverShadowFieldResult {
  readonly fromZone: ZoneId;
  readonly toZone: ZoneId;
  readonly coverShadowValue: number;
  readonly sourceDefenders: readonly string[];
  readonly reason: string;
}

export function calculateCoverShadowField(input: {
  readonly field: InfluenceField;
  readonly fromZone: ZoneId;
  readonly toZone: ZoneId;
}): CoverShadowFieldResult {
  const cells = getZonesBetween({ from: input.fromZone, to: input.toZone }).map((zone) =>
    getInfluenceFieldCell(input.field, zone),
  );
  const coverShadowValue =
    cells.length === 0 ? 0 : clampRating(cells.reduce((sum, cell) => sum + cell.coverShadowValue, 0) / cells.length);

  return {
    fromZone: input.fromZone,
    toZone: input.toZone,
    coverShadowValue,
    sourceDefenders: cells
      .flatMap((cell) => cell.sourcePlayers)
      .filter((player) => player.teamId === input.field.defendingTeamId)
      .slice(0, 4)
      .map((player) => `${player.initials}@${player.currentZone}->${player.targetZone ?? player.currentZone}`),
    reason: "cover shadow from defender position, movement vector placeholder, pressure intent and projected lane arrival",
  };
}

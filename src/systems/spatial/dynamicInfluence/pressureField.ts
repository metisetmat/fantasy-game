import type { TeamId } from "../../../core/ids";
import type { ZoneId } from "../../../core/zones";
import { getInfluenceFieldCell, getTeamValue, type InfluenceField } from "./influenceField";

export interface PressureFieldResult {
  readonly zone: ZoneId;
  readonly teamId: TeamId;
  readonly pressure: number;
  readonly sourcePlayers: readonly string[];
  readonly reason: string;
}

export function calculatePressureField(input: {
  readonly field: InfluenceField;
  readonly teamId: TeamId;
  readonly zone: ZoneId;
}): PressureFieldResult {
  const cell = getInfluenceFieldCell(input.field, input.zone);
  const pressure = getTeamValue(cell.pressureByTeam, input.teamId);
  const sourcePlayers = cell.sourcePlayers
    .filter((player) => player.teamId === input.teamId)
    .sort((left, right) => right.projectedInfluence + right.currentInfluence - (left.projectedInfluence + left.currentInfluence))
    .slice(0, 4)
    .map((player) => `${player.initials}@${player.currentZone}->${player.targetZone ?? player.currentZone}`);

  return {
    zone: input.zone,
    teamId: input.teamId,
    pressure,
    sourcePlayers,
    reason: `pressure from moving influence, intent pressure, projected arrival and distance to ${input.zone}`,
  };
}

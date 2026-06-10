import type { TeamId } from "../../../core/ids";
import type { ZoneId } from "../../../core/zones";
import { getInfluenceFieldCell, getTeamValue, type InfluenceField } from "./influenceField";

export interface ControlFieldResult {
  readonly zone: ZoneId;
  readonly controlTeamId: TeamId | null;
  readonly controlByTeam: readonly {
    readonly teamId: TeamId;
    readonly value: number;
  }[];
  readonly openness: number;
  readonly contestedness: number;
}

export function calculateControlField(input: {
  readonly field: InfluenceField;
  readonly zone: ZoneId;
}): ControlFieldResult {
  const cell = getInfluenceFieldCell(input.field, input.zone);

  return {
    zone: input.zone,
    controlTeamId: cell.controlTeamId,
    controlByTeam: [
      { teamId: input.field.attackingTeamId, value: getTeamValue(cell.controlValueByTeam, input.field.attackingTeamId) },
      { teamId: input.field.defendingTeamId, value: getTeamValue(cell.controlValueByTeam, input.field.defendingTeamId) },
    ],
    openness: cell.openness,
    contestedness: cell.contestedness,
  };
}

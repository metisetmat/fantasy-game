import type { TeamId } from "../../../core/ids";
import type { ZoneId } from "../../../core/zones";
import { getInfluenceFieldCell, getTeamValue, type InfluenceField } from "./influenceField";

export interface DangerFieldResult {
  readonly zone: ZoneId;
  readonly teamId: TeamId;
  readonly danger: number;
  readonly legalScoringWindow: boolean;
  readonly reason: string;
}

export function calculateDangerField(input: {
  readonly field: InfluenceField;
  readonly teamId: TeamId;
  readonly zone: ZoneId;
  readonly legalScoringWindow?: boolean;
}): DangerFieldResult {
  const cell = getInfluenceFieldCell(input.field, input.zone);
  const rawDanger = getTeamValue(cell.dangerByTeam, input.teamId);
  const legalScoringWindow = input.legalScoringWindow ?? false;
  const danger = legalScoringWindow ? rawDanger : Math.round(rawDanger * 0.72);

  return {
    zone: input.zone,
    teamId: input.teamId,
    danger,
    legalScoringWindow,
    reason: legalScoringWindow
      ? "danger includes legal scoring window, attacking influence, openness and delayed recovery"
      : "danger reduced because no legal scoring window is confirmed; chaos alone is not danger",
  };
}

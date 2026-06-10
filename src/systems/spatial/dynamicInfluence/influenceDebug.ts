import type { TeamId } from "../../../core/ids";
import type { ZoneId } from "../../../core/zones";
import { getInfluenceFieldCell, getTeamValue, type InfluenceField } from "./influenceField";

export function summarizeDynamicInfluenceZone(input: {
  readonly field: InfluenceField;
  readonly zone: ZoneId;
}): string {
  const cell = getInfluenceFieldCell(input.field, input.zone);
  const attacking = getTeamValue(cell.controlValueByTeam, input.field.attackingTeamId);
  const defending = getTeamValue(cell.controlValueByTeam, input.field.defendingTeamId);
  const defenders = cell.sourcePlayers
    .filter((player) => player.teamId === input.field.defendingTeamId)
    .slice(0, 3)
    .map((player) => player.initials)
    .join(", ");
  const attackers = cell.sourcePlayers
    .filter((player) => player.teamId === input.field.attackingTeamId)
    .slice(0, 3)
    .map((player) => player.initials)
    .join(", ");

  const perceptionTrace = cell.sourcePlayers
    .slice(0, 4)
    .map((player) => `${player.initials} perception ${player.perceptionConfidence}/100 delay ${player.reactionDelayTicks}`)
    .join(", ");

  return `${input.zone}: attacking control ${attacking}/100, defensive control ${defending}/100, openness ${cell.openness}/100, weak-side value ${cell.weakSideValue}/100, recovery pressure ${cell.recoveryPressure}/100, source players attack ${attackers || "none"} / defense ${defenders || "none"}, perception-adjusted sources ${perceptionTrace || "none"}`;
}

export function describeTeamInfluence(input: {
  readonly field: InfluenceField;
  readonly teamId: TeamId;
  readonly zone: ZoneId;
}): string {
  const cell = getInfluenceFieldCell(input.field, input.zone);
  const control = getTeamValue(cell.controlValueByTeam, input.teamId);
  const pressure = getTeamValue(cell.pressureByTeam, input.teamId);
  const danger = getTeamValue(cell.dangerByTeam, input.teamId);

  return `${input.teamId} influence at ${input.zone}: control ${control}/100, pressure ${pressure}/100, danger ${danger}/100`;
}

import type { Rating } from "../../core/ratings";
import type { TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { PlayerMatchState } from "../players";
import { clampRating, labelRating } from "./utils";
import { buildInfluenceField, getTeamValue } from "./dynamicInfluence";

export interface InfluenceMapCell {
  readonly zone: ZoneId;
  readonly attackingInfluence: Rating;
  readonly defensiveInfluence: Rating;
  readonly netControl: Rating;
  readonly pressure: Rating;
  readonly danger: Rating;
  readonly attackers: readonly PlayerMatchState[];
  readonly defenders: readonly PlayerMatchState[];
  readonly dynamicSourcePlayers: readonly string[];
  readonly openness: Rating;
  readonly coverShadow: Rating;
  readonly recoveryPressure: Rating;
  readonly weakSideValue: Rating;
}

export interface InfluenceMap {
  readonly attackingTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly cells: readonly InfluenceMapCell[];
  readonly source: "CALCULATED_FROM_INFLUENCE_MAP";
}

export function buildInfluenceMap(input: {
  readonly attackingTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly attackingPlayers: readonly PlayerMatchState[];
  readonly defendingPlayers: readonly PlayerMatchState[];
  readonly ballZone: ZoneId;
  readonly tick?: number;
}): InfluenceMap {
  const field = buildInfluenceField({
    tick: input.tick ?? 0,
    attackingTeamId: input.attackingTeamId,
    defendingTeamId: input.defendingTeamId,
    attackingPlayers: input.attackingPlayers,
    defendingPlayers: input.defendingPlayers,
    ballZone: input.ballZone,
  });
  const cells = field.cells.map((cell): InfluenceMapCell => {
    const attackers = input.attackingPlayers.filter((player) => player.zone === cell.zone);
    const defenders = input.defendingPlayers.filter((player) => player.zone === cell.zone);
    const attackingInfluence = clampRating(getTeamValue(cell.controlValueByTeam, input.attackingTeamId));
    const defensiveInfluence = clampRating(getTeamValue(cell.controlValueByTeam, input.defendingTeamId));
    const pressure = clampRating(getTeamValue(cell.pressureByTeam, input.defendingTeamId));
    const netControl = clampRating(50 + attackingInfluence - defensiveInfluence);
    const danger = clampRating(getTeamValue(cell.dangerByTeam, input.attackingTeamId));

    return {
      zone: cell.zone,
      attackingInfluence,
      defensiveInfluence,
      netControl,
      pressure,
      danger,
      attackers,
      defenders,
      dynamicSourcePlayers: cell.sourcePlayers.map((player) => `${player.initials}@${player.currentZone}->${player.targetZone ?? player.currentZone}`),
      openness: cell.openness,
      coverShadow: cell.coverShadowValue,
      recoveryPressure: cell.recoveryPressure,
      weakSideValue: cell.weakSideValue,
    };
  });

  return {
    attackingTeamId: input.attackingTeamId,
    defendingTeamId: input.defendingTeamId,
    cells,
    source: "CALCULATED_FROM_INFLUENCE_MAP",
  };
}

export function getInfluenceCell(map: InfluenceMap, zone: ZoneId): InfluenceMapCell {
  const cell = map.cells.find((candidate) => candidate.zone === zone);

  if (cell === undefined) {
    throw new Error(`Influence map missing zone ${zone}.`);
  }

  return cell;
}

export function summarizeInfluenceZone(map: InfluenceMap, zone: ZoneId): string {
  const cell = getInfluenceCell(map, zone);

  return `${zone}: dynamic control ${cell.netControl}/100 (${labelRating(cell.netControl)}), pressure ${cell.pressure}/100, danger ${cell.danger}/100, openness ${cell.openness}/100, recovery pressure ${cell.recoveryPressure}/100, source players ${cell.dynamicSourcePlayers.slice(0, 5).join(", ") || "none"}`;
}

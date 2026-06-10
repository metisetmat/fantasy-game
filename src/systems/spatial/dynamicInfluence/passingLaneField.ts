import type { ZoneId } from "../../../core/zones";
import { getZonesBetween } from "../coordinates";
import { clampRating } from "../utils";
import { getInfluenceFieldCell, getTeamValue, type InfluenceField } from "./influenceField";

export enum PassingLaneState {
  Open = "OPEN",
  Contested = "CONTESTED",
  Closed = "CLOSED",
  TemporaryWindow = "TEMPORARY_WINDOW",
}

export interface PassingLaneResult {
  readonly laneId: string;
  readonly fromPlayerId: string | null;
  readonly toPlayerId: string | null;
  readonly fromZone: ZoneId;
  readonly toZone: ZoneId;
  readonly openness: number;
  readonly pressure: number;
  readonly interceptionRisk: number;
  readonly timingWindowTicks: number;
  readonly receiverArrivalTick: number | null;
  readonly defenderEarliestArrivalTick: number | null;
  readonly laneState: PassingLaneState;
  readonly sourceDefenders: readonly string[];
  readonly supportingAttackers: readonly string[];
}

export function evaluatePassingLaneField(input: {
  readonly field: InfluenceField;
  readonly fromZone: ZoneId;
  readonly toZone: ZoneId;
  readonly fromPlayerId?: string | null;
  readonly toPlayerId?: string | null;
}): PassingLaneResult {
  const laneZones = getZonesBetween({ from: input.fromZone, to: input.toZone });
  const cells = laneZones.map((zone) => getInfluenceFieldCell(input.field, zone));
  const pressure =
    cells.length === 0
      ? 0
      : cells.reduce((sum, cell) => sum + getTeamValue(cell.pressureByTeam, input.field.defendingTeamId), 0) / cells.length;
  const openness =
    cells.length === 0 ? 0 : cells.reduce((sum, cell) => sum + cell.openness, 0) / cells.length;
  const coverShadow =
    cells.length === 0 ? 0 : cells.reduce((sum, cell) => sum + cell.coverShadowValue, 0) / cells.length;
  const targetCell = getInfluenceFieldCell(input.field, input.toZone);
  const receiverArrivalTick =
    targetCell.earliestArrivalByTeam.find((arrival) => arrival.teamId === input.field.attackingTeamId)?.tick ?? null;
  const defenderEarliestArrivalTick =
    targetCell.earliestArrivalByTeam.find((arrival) => arrival.teamId === input.field.defendingTeamId)?.tick ?? null;
  const timingWindowTicks =
    receiverArrivalTick === null || defenderEarliestArrivalTick === null
      ? 0
      : defenderEarliestArrivalTick - receiverArrivalTick;
  const interceptionRisk = clampRating(pressure * 0.48 + coverShadow * 0.36 - Math.max(0, timingWindowTicks) * 6);
  const laneState =
    openness >= 70 && interceptionRisk < 42
      ? PassingLaneState.Open
      : timingWindowTicks > 0 && openness >= 52
        ? PassingLaneState.TemporaryWindow
        : openness < 42 || interceptionRisk >= 72
          ? PassingLaneState.Closed
          : PassingLaneState.Contested;

  return {
    laneId: `${input.fromZone}->${input.toZone}`,
    fromPlayerId: input.fromPlayerId ?? null,
    toPlayerId: input.toPlayerId ?? null,
    fromZone: input.fromZone,
    toZone: input.toZone,
    openness: clampRating(openness),
    pressure: clampRating(pressure),
    interceptionRisk,
    timingWindowTicks,
    receiverArrivalTick,
    defenderEarliestArrivalTick,
    laneState,
    sourceDefenders: cells
      .flatMap((cell) => cell.sourcePlayers)
      .filter((player) => player.teamId === input.field.defendingTeamId)
      .slice(0, 5)
      .map((player) => `${player.initials}@${player.currentZone} perception ${player.perceptionConfidence}/100 delay ${player.reactionDelayTicks}`),
    supportingAttackers: cells
      .flatMap((cell) => cell.sourcePlayers)
      .filter((player) => player.teamId === input.field.attackingTeamId)
      .slice(0, 5)
      .map((player) => `${player.initials}@${player.currentZone}`),
  };
}

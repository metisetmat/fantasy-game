import type { ZoneId } from "../../core/zones";
import { clampRating } from "./utils";
import { getZonesBetween } from "./coordinates";
import { getInfluenceCell, type InfluenceMap } from "./influenceMap";
import { PassingLaneState } from "./dynamicInfluence";

export interface PassingLaneEvaluation {
  readonly from: ZoneId;
  readonly to: ZoneId;
  readonly laneZones: readonly ZoneId[];
  readonly openness: number;
  readonly pressure: number;
  readonly interceptionRisk: number;
  readonly timingWindowTicks: number;
  readonly receiverArrivalTick: number | null;
  readonly defenderEarliestArrivalTick: number | null;
  readonly laneState: PassingLaneState;
  readonly sourceDefenders: readonly string[];
  readonly supportingAttackers: readonly string[];
  readonly blocked: boolean;
  readonly source: "CALCULATED_FROM_INFLUENCE_MAP";
}

export function evaluatePassingLane(input: {
  readonly map: InfluenceMap;
  readonly from: ZoneId;
  readonly to: ZoneId;
}): PassingLaneEvaluation {
  const laneZones = getZonesBetween({ from: input.from, to: input.to });
  const pressure =
    laneZones.length === 0
      ? 0
      : laneZones.reduce((sum, zone) => sum + getInfluenceCell(input.map, zone).pressure, 0) / laneZones.length;
  const attackingControl =
    laneZones.length === 0
      ? 0
      : laneZones.reduce((sum, zone) => sum + getInfluenceCell(input.map, zone).netControl, 0) / laneZones.length;
  const openness = clampRating(100 - pressure * 0.62 + attackingControl * 0.28);
  const targetCell = getInfluenceCell(input.map, input.to);
  const receiverArrivalTick = null;
  const defenderEarliestArrivalTick = null;
  const timingWindowTicks = 0;
  const interceptionRisk = clampRating(pressure * 0.52 + targetCell.coverShadow * 0.32 - openness * 0.16);
  const laneState =
    openness >= 70 && interceptionRisk < 42
      ? PassingLaneState.Open
      : openness < 42 || interceptionRisk >= 72
        ? PassingLaneState.Closed
        : targetCell.recoveryPressure >= 45 && openness >= 52
          ? PassingLaneState.TemporaryWindow
          : PassingLaneState.Contested;

  return {
    from: input.from,
    to: input.to,
    laneZones,
    openness,
    pressure: clampRating(pressure),
    interceptionRisk,
    timingWindowTicks,
    receiverArrivalTick,
    defenderEarliestArrivalTick,
    laneState,
    sourceDefenders: targetCell.dynamicSourcePlayers.slice(0, 5),
    supportingAttackers: laneZones.flatMap((zone) => getInfluenceCell(input.map, zone).attackers.map((player) => `${player.roleInitials}@${player.zone}`)).slice(0, 5),
    blocked: openness < 42,
    source: "CALCULATED_FROM_INFLUENCE_MAP",
  };
}

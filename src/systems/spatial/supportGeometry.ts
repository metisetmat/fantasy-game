import type { ZoneId } from "../../core/zones";
import type { PlayerMatchState } from "../players";
import { getZoneDistance } from "./coordinates";

export interface SupportTriangleEvaluation {
  readonly carrierZone: ZoneId;
  readonly supportZones: readonly ZoneId[];
  readonly supportPlayerIds: readonly string[];
  readonly connected: boolean;
  readonly source: "CALCULATED_FROM_INFLUENCE_MAP";
}

export function evaluateSupportTriangle(input: {
  readonly carrierZone: ZoneId;
  readonly attackingPlayers: readonly PlayerMatchState[];
}): SupportTriangleEvaluation {
  const supports = input.attackingPlayers
    .filter((player) => !player.hasBall && player.isAvailableReceiver)
    .sort((left, right) => getZoneDistance(left.zone, input.carrierZone) - getZoneDistance(right.zone, input.carrierZone))
    .slice(0, 2);

  return {
    carrierZone: input.carrierZone,
    supportZones: supports.map((player) => player.zone),
    supportPlayerIds: supports.map((player) => player.playerId),
    connected: supports.length >= 2 && supports.every((player) => getZoneDistance(player.zone, input.carrierZone) <= 2),
    source: "CALCULATED_FROM_INFLUENCE_MAP",
  };
}

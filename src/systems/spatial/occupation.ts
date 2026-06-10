import type { PlayerId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { PlayerRole, PlayerState } from "../../models/player";
import type { ShapeState } from "../../models/tactics";
import {
  CellOccupation,
  OccupationMap,
  RoleInfluence,
  SpatialPhase,
  SpatialTeamContext,
  TeamOccupation,
} from "./types";
import { clampRating } from "./utils";

const OFFENSIVE_ROLE_WEIGHTS: Readonly<Record<PlayerRole, number>> = {
  left_anchor: 0.7,
  right_anchor: 0.7,
  hook_link: 1,
  mobile_lock: 0.75,
  forward_leader: 1,
  tempo_half: 1,
  playmaker: 1,
  power_runner: 0.95,
  space_hunter: 1,
  free_safety: 0.65,
  goalkeeper_free_safety: 0.65,
  pivot: 0.9,
  left_piston: 0.95,
  right_piston: 0.95,
};

const DEFENSIVE_ROLE_WEIGHTS: Readonly<Record<PlayerRole, number>> = {
  left_anchor: 1,
  right_anchor: 1,
  hook_link: 0.75,
  mobile_lock: 1,
  forward_leader: 0.9,
  tempo_half: 0.8,
  playmaker: 0.65,
  power_runner: 0.9,
  space_hunter: 0.75,
  free_safety: 1,
  goalkeeper_free_safety: 1,
  pivot: 0.9,
  left_piston: 0.85,
  right_piston: 0.85,
};

export interface OccupationInput {
  readonly context: SpatialTeamContext;
  readonly shape: ShapeState;
  readonly phase: SpatialPhase;
}

function getRoleWeight(role: PlayerRole, phase: SpatialPhase): number {
  return phase === SpatialPhase.Offensive
    ? OFFENSIVE_ROLE_WEIGHTS[role]
    : DEFENSIVE_ROLE_WEIGHTS[role];
}

function calculatePlayerSpatialInfluence(player: PlayerState, phase: SpatialPhase): Rating {
  const roleWeight = getRoleWeight(player.role, phase);
  const mobility =
    phase === SpatialPhase.Offensive
      ? player.attributes.speed * 0.2 +
        player.attributes.agility * 0.2 +
        player.attributes.intelligence * 0.25 +
        player.attributes.mental * 0.15 +
        player.fatigue.freshness * 0.2
      : player.attributes.speed * 0.15 +
        player.attributes.agility * 0.15 +
        player.attributes.intelligence * 0.25 +
        player.attributes.mental * 0.2 +
        player.fatigue.freshness * 0.25;

  return clampRating(mobility * roleWeight);
}

function getPlayersInfluencingZone(
  players: readonly PlayerState[],
  zoneId: ZoneId,
  fallbackPlayerIds: readonly PlayerId[],
): readonly PlayerState[] {
  const directPlayers = players.filter((player) => player.currentZone === zoneId);
  if (directPlayers.length > 0) {
    return directPlayers;
  }

  return players.filter((player) => fallbackPlayerIds.includes(player.id));
}

function buildFallbackPlayerIds(players: readonly PlayerState[], zoneIndex: number): readonly PlayerId[] {
  if (players.length === 0) {
    return [];
  }

  const primary = players[zoneIndex % players.length];
  const secondary = players[(zoneIndex + 3) % players.length];
  return [primary, secondary].filter((player): player is PlayerState => player !== undefined).map((player) => player.id);
}

function createCellOccupation(
  zoneId: ZoneId,
  zoneIndex: number,
  input: OccupationInput,
): CellOccupation {
  const fallbackPlayerIds = buildFallbackPlayerIds(input.context.players, zoneIndex);
  const zonePlayers = getPlayersInfluencingZone(input.context.players, zoneId, fallbackPlayerIds);
  const roleInfluences: readonly RoleInfluence[] = zonePlayers.map((player) => ({
    role: player.role,
    playerId: player.id,
    influence: calculatePlayerSpatialInfluence(player, input.phase),
  }));

  const playerInfluence = roleInfluences.reduce((sum, roleInfluence) => sum + roleInfluence.influence, 0);
  const structuralInfluence =
    input.phase === SpatialPhase.Offensive
      ? input.shape.widthOccupation * 0.35 + input.shape.diagonalSupport * 0.25
      : input.shape.compactness * 0.35 + input.shape.axisProtection * 0.25;

  return {
    zoneId,
    phase: input.phase,
    influence: clampRating(playerInfluence * 0.45 + structuralInfluence),
    playerIds: zonePlayers.map((player) => player.id),
    roleInfluences,
  };
}

function buildOccupationMap(cells: readonly CellOccupation[]): OccupationMap {
  return cells.reduce<OccupationMap>(
    (occupationMap, cell) => ({
      ...occupationMap,
      [cell.zoneId]: cell,
    }),
    {},
  );
}

export function calculateTeamOccupation(input: OccupationInput): TeamOccupation {
  const cells = input.shape.occupiedZones.map((zoneId, zoneIndex) =>
    createCellOccupation(zoneId, zoneIndex, input),
  );

  return {
    teamId: input.context.teamId,
    phase: input.phase,
    cells,
    occupationMap: buildOccupationMap(cells),
  };
}

export function calculateOffensiveOccupation(
  context: SpatialTeamContext,
  shape: ShapeState,
): TeamOccupation {
  return calculateTeamOccupation({
    context,
    shape,
    phase: SpatialPhase.Offensive,
  });
}

export function calculateDefensiveOccupation(
  context: SpatialTeamContext,
  shape: ShapeState,
): TeamOccupation {
  return calculateTeamOccupation({
    context,
    shape,
    phase: SpatialPhase.Defensive,
  });
}

import type { TeamId } from "../../../core/ids";
import type { TacticalTick } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import type { PlayerMatchState } from "../../players";
import { getAllZoneCoordinates } from "../coordinates";
import { clampRating } from "../utils";
import { zoneToMovementPosition } from "../../movement";
import type { InfluenceCell, TeamInfluenceValue } from "./influenceCell";
import { projectPlayerInfluence } from "./influenceProjection";

export interface InfluenceField {
  readonly tick: TacticalTick;
  readonly attackingTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly ballZone: ZoneId;
  readonly cells: readonly InfluenceCell[];
  readonly source: "CALCULATED_FROM_DYNAMIC_INFLUENCE_FIELD";
}

function valueForTeam(values: readonly TeamInfluenceValue[], teamId: TeamId): number {
  return values.find((value) => value.teamId === teamId)?.value ?? 0;
}

function createTeamValues(input: {
  readonly teamIds: readonly TeamId[];
  readonly values: readonly { readonly teamId: TeamId; readonly value: number }[];
}): readonly TeamInfluenceValue[] {
  return input.teamIds.map((teamId) => ({
    teamId,
    value: clampRating(input.values.filter((value) => value.teamId === teamId).reduce((sum, value) => sum + value.value, 0)),
  }));
}

export function getInfluenceFieldCell(field: InfluenceField, zone: ZoneId): InfluenceCell {
  const cell = field.cells.find((candidate) => candidate.zone === zone);

  if (cell === undefined) {
    throw new Error(`Dynamic influence field missing zone ${zone}.`);
  }

  return cell;
}

export function buildInfluenceField(input: {
  readonly tick: TacticalTick;
  readonly attackingTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly attackingPlayers: readonly PlayerMatchState[];
  readonly defendingPlayers: readonly PlayerMatchState[];
  readonly ballZone: ZoneId;
}): InfluenceField {
  const players = [...input.attackingPlayers, ...input.defendingPlayers];
  const teamIds = [input.attackingTeamId, input.defendingTeamId];
  const cells = getAllZoneCoordinates().map((coordinate): InfluenceCell => {
    const projections = players.map((player) =>
      projectPlayerInfluence({
        player,
        zone: coordinate.zone,
        tick: input.tick,
      }),
    );
    const controlValueByTeam = createTeamValues({
      teamIds,
      values: projections.map((projection) => ({
        teamId: projection.teamId,
        value: projection.currentInfluence + projection.projectedInfluence * 0.72 + projection.pathInfluence * 0.45,
      })),
    });
    const pressureByTeam = createTeamValues({
      teamIds,
      values: projections.map((projection) => ({
        teamId: projection.teamId,
        value:
          projection.currentInfluence * (projection.player.tacticalStatus === "PRESSING" ? 1.1 : 0.45) +
          projection.projectedInfluence * (projection.player.primaryIntent?.type === "PRESS_BALL" ? 0.95 : 0.38),
      })),
    });
    const attackingControl = valueForTeam(controlValueByTeam, input.attackingTeamId);
    const defensiveControl = valueForTeam(controlValueByTeam, input.defendingTeamId);
    const attackingPressure = valueForTeam(pressureByTeam, input.attackingTeamId);
    const defensivePressure = valueForTeam(pressureByTeam, input.defendingTeamId);
    const projectedArrivals = projections
      .map((projection) => projection.projectedArrival)
      .filter((arrival): arrival is NonNullable<typeof arrival> => arrival !== null && arrival.zone === coordinate.zone)
      .sort((left, right) => left.arrivalTick - right.arrivalTick);
    const earliestArrivalByTeam = teamIds.map((teamId) => {
      const arrival = projectedArrivals.find((candidate) => candidate.teamId === teamId);

      return {
        teamId,
        tick: arrival?.arrivalTick ?? null,
      };
    });
    const attackersInZone = input.attackingPlayers.filter((player) => player.zone === coordinate.zone);
    const defendersInZone = input.defendingPlayers.filter((player) => player.zone === coordinate.zone);
    const attackingProjected = projectedArrivals.filter((arrival) => arrival.teamId === input.attackingTeamId).length;
    const defensiveProjected = projectedArrivals.filter((arrival) => arrival.teamId === input.defendingTeamId).length;
    const overloadValue = clampRating((attackersInZone.length + attackingProjected * 0.65 - defendersInZone.length - defensiveProjected * 0.55) * 22 + 42);
    const contestedness = clampRating(100 - Math.abs(attackingControl - defensiveControl));
    const openness = clampRating(100 - defensivePressure * 0.58 - defensiveControl * 0.18 + attackingControl * 0.22);
    const coverShadowValue = clampRating(defensivePressure * 0.45 + defensiveControl * 0.26 + defensiveProjected * 8);
    const recoveryPressure = clampRating(defensiveProjected * 18 + defensivePressure * 0.42);
    const weakSideValue = clampRating(openness * 0.52 + overloadValue * 0.35 - recoveryPressure * 0.24);
    const dangerByTeam = createTeamValues({
      teamIds,
      values: [
        {
          teamId: input.attackingTeamId,
          value: attackingControl * 0.35 + openness * 0.22 + overloadValue * 0.2 - recoveryPressure * 0.18,
        },
        {
          teamId: input.defendingTeamId,
          value: defensiveControl * 0.32 + defensivePressure * 0.24 + coverShadowValue * 0.18,
        },
      ],
    });
    const controlTeamId =
      Math.abs(attackingControl - defensiveControl) < 8
        ? null
        : attackingControl > defensiveControl
          ? input.attackingTeamId
          : input.defendingTeamId;

    return {
      zone: coordinate.zone,
      lane: coordinate.lateralCorridor,
      centerPosition: zoneToMovementPosition(coordinate.zone),
      controlTeamId,
      controlValueByTeam,
      pressureByTeam,
      dangerByTeam,
      attackingDensityByTeam: createTeamValues({
        teamIds,
        values: [
          { teamId: input.attackingTeamId, value: attackersInZone.length * 20 + attackingProjected * 12 },
          { teamId: input.defendingTeamId, value: 0 },
        ],
      }),
      defensiveDensityByTeam: createTeamValues({
        teamIds,
        values: [
          { teamId: input.attackingTeamId, value: 0 },
          { teamId: input.defendingTeamId, value: defendersInZone.length * 20 + defensiveProjected * 12 },
        ],
      }),
      projectedArrivalsByTeam: projectedArrivals,
      earliestArrivalByTeam,
      contestedness,
      openness,
      coverShadowValue,
      weakSideValue,
      overloadValue,
      recoveryPressure,
      sourcePlayers: projections
        .filter((projection) => projection.currentInfluence > 0 || projection.projectedInfluence > 0 || projection.pathInfluence > 0)
        .map((projection) => projection.source),
    };
  });

  return {
    tick: input.tick,
    attackingTeamId: input.attackingTeamId,
    defendingTeamId: input.defendingTeamId,
    ballZone: input.ballZone,
    cells,
    source: "CALCULATED_FROM_DYNAMIC_INFLUENCE_FIELD",
  };
}

export function getTeamValue(values: readonly TeamInfluenceValue[], teamId: TeamId): number {
  return valueForTeam(values, teamId);
}

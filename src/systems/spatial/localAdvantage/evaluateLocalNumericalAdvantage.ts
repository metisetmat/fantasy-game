import type { ZoneId } from "../../../core/zones";
import type { SpatialTeamContext } from "../types";
import { getDirectionalDistance } from "../intention";
import { clampRating, getLateralIndex, getZoneParts } from "../utils";
import type { AttackingDirection } from "../intention";
import type { LocalNumericalAdvantageEvaluation } from "./types";

function isNearZone(left: ZoneId, right: ZoneId): boolean {
  const leftParts = getZoneParts(left);
  const rightParts = getZoneParts(right);
  const longitudinalDistance = Math.abs(
    Number(leftParts.longitudinalZone.slice(1)) - Number(rightParts.longitudinalZone.slice(1)),
  );
  const lateralDistance = Math.abs(
    getLateralIndex(leftParts.lateralCorridor) - getLateralIndex(rightParts.lateralCorridor),
  );

  return longitudinalDistance <= 1 && lateralDistance <= 1;
}

function isGoalSide(input: {
  readonly defenderZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly attackingDirection: AttackingDirection;
}): boolean {
  const defenderParts = getZoneParts(input.defenderZone);
  const targetParts = getZoneParts(input.targetZone);

  return getDirectionalDistance(
    targetParts.longitudinalZone,
    defenderParts.longitudinalZone,
    input.attackingDirection,
  ) >= 0;
}

export function evaluateLocalNumericalAdvantage(input: {
  readonly attackingTeam: SpatialTeamContext;
  readonly defendingTeam: SpatialTeamContext | undefined;
  readonly targetZone: ZoneId;
  readonly attackingDirection: AttackingDirection;
}): LocalNumericalAdvantageEvaluation {
  const defenders = input.defendingTeam?.players ?? [];
  const attackersInTarget = input.attackingTeam.players.filter((player) => player.currentZone === input.targetZone).length;
  const defendersInTarget = defenders.filter((player) => player.currentZone === input.targetZone).length;
  const nearbySupport = input.attackingTeam.players.filter((player) => isNearZone(player.currentZone, input.targetZone)).length;
  const goalSideDefenders = defenders.filter((player) =>
    isGoalSide({
      defenderZone: player.currentZone,
      targetZone: input.targetZone,
      attackingDirection: input.attackingDirection,
    }),
  ).length;
  const localEdge = attackersInTarget - defendersInTarget;
  const score = clampRating(
    50 + localEdge * 18 + Math.min(3, nearbySupport) * 7 - Math.max(0, goalSideDefenders - 3) * 5,
  );
  const description =
    localEdge > 0
      ? `${attackersInTarget}v${defendersInTarget} local overload`
      : localEdge < 0
        ? `${attackersInTarget}v${defendersInTarget} local underload`
        : `${attackersInTarget}v${defendersInTarget} balanced target`;

  return {
    targetZone: input.targetZone,
    attackersInTarget,
    defendersInTarget,
    nearbySupport,
    goalSideDefenders,
    numericalScore: score,
    description,
  };
}

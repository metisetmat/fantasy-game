import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import { PlayerRole } from "../../models/player";
import type { VisiblePlayerAttributes } from "../players";
import { isInsideGoalArea, nearestGoalAreaZone } from "./goalAreaRules";

export interface GoalkeeperRulePlayer {
  readonly id?: PlayerId;
  readonly playerId?: PlayerId;
  readonly teamId: TeamId;
  readonly role: PlayerRole;
  readonly roleInitials?: string;
  readonly isGoalkeeper?: boolean;
  readonly currentZone?: ZoneId;
  readonly zone?: ZoneId;
  readonly visibleAttributes?: VisiblePlayerAttributes;
}

export function rulePlayerId(player: GoalkeeperRulePlayer): PlayerId {
  return player.id ?? player.playerId ?? "unknown-player";
}

export function rulePlayerZone(player: GoalkeeperRulePlayer): ZoneId | null {
  return player.currentZone ?? player.zone ?? null;
}

export function getDefendingGoalkeeper(teamId: TeamId, players: readonly GoalkeeperRulePlayer[]): GoalkeeperRulePlayer | null {
  return (
    players.find((player) => player.teamId === teamId && (player.isGoalkeeper === true || player.role === PlayerRole.GoalkeeperFreeSafety)) ??
    null
  );
}

export function getGoalkeeperPosition(teamId: TeamId, players: readonly GoalkeeperRulePlayer[]): ZoneId {
  const goalkeeper = getDefendingGoalkeeper(teamId, players);

  return (goalkeeper === null ? null : rulePlayerZone(goalkeeper)) ?? nearestGoalAreaZone(teamId);
}

export function canPlayerUseHandsInGoalArea(player: Pick<GoalkeeperRulePlayer, "teamId" | "role" | "isGoalkeeper">, zone: ZoneId, defendingTeamId: TeamId): boolean {
  return (
    player.teamId === defendingTeamId &&
    (player.isGoalkeeper === true || player.role === PlayerRole.GoalkeeperFreeSafety) &&
    isInsideGoalArea(zone, defendingTeamId)
  );
}

export function illegalHandUseReason(input: {
  readonly playerId: PlayerId;
  readonly zone: ZoneId;
  readonly defendingTeamId: TeamId;
  readonly players: readonly GoalkeeperRulePlayer[];
}): string | null {
  const player = input.players.find((candidate) => rulePlayerId(candidate) === input.playerId);

  if (player === undefined || !isInsideGoalArea(input.zone, input.defendingTeamId)) {
    return null;
  }

  return canPlayerUseHandsInGoalArea(player, input.zone, input.defendingTeamId)
    ? null
    : "Outfield players cannot catch or deliberately handle the ball with hands inside their own goal area.";
}

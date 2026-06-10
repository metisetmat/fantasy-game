import type { TeamId } from "../../../core/ids";
import type { ZoneId } from "../../../core/zones";
import { PlayerRole } from "../../../models/player";
import type { SpatialTeamContext } from "../types";
import { AttackingDirection, type BallContext } from "./types";

function pickDefaultCarrier(team: SpatialTeamContext): PlayerRole {
  const preferredRoles: readonly PlayerRole[] = [
    PlayerRole.TempoHalf,
    PlayerRole.Playmaker,
    PlayerRole.HookLink,
    PlayerRole.FreeSafety,
  ];
  const player = team.players.find((candidate) => preferredRoles.includes(candidate.role));

  return player?.role ?? PlayerRole.TempoHalf;
}

export function createBallContext(input: {
  readonly team: SpatialTeamContext;
  readonly ballLocation: ZoneId;
  readonly attackingDirection: AttackingDirection;
  readonly ballCarrierRole?: PlayerRole;
}): BallContext {
  return {
    ballLocation: input.ballLocation,
    ballCarrierRole: input.ballCarrierRole ?? pickDefaultCarrier(input.team),
    possessionTeamId: input.team.teamId,
    attackingDirection: input.attackingDirection,
  };
}

export function updateBallContext(input: {
  readonly previous: BallContext;
  readonly ballLocation: ZoneId;
  readonly possessionTeamId?: TeamId;
  readonly ballCarrierRole?: PlayerRole;
  readonly attackingDirection?: AttackingDirection;
}): BallContext {
  return {
    ballLocation: input.ballLocation,
    ballCarrierRole: input.ballCarrierRole ?? input.previous.ballCarrierRole,
    possessionTeamId: input.possessionTeamId ?? input.previous.possessionTeamId,
    attackingDirection: input.attackingDirection ?? input.previous.attackingDirection,
  };
}

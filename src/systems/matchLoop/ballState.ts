import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

export enum BallStateStatus {
  Controlled = "CONTROLLED",
  InFlight = "IN_FLIGHT",
  Loose = "LOOSE",
  Rebound = "REBOUND",
  Grounded = "GROUNDED",
  OutOfPlay = "OUT_OF_PLAY",
}

export interface BallState {
  readonly status: BallStateStatus;
  readonly zone: ZoneId;
  readonly possessionTeamId: TeamId | null;
  readonly carrierPlayerId: PlayerId | null;
  readonly targetZone: ZoneId | null;
  readonly lastTouchedByTeamId: TeamId | null;
}

export function createControlledBallState(input: {
  readonly zone: ZoneId;
  readonly possessionTeamId: TeamId;
  readonly carrierPlayerId: PlayerId;
}): BallState {
  return {
    status: BallStateStatus.Controlled,
    zone: input.zone,
    possessionTeamId: input.possessionTeamId,
    carrierPlayerId: input.carrierPlayerId,
    targetZone: null,
    lastTouchedByTeamId: input.possessionTeamId,
  };
}

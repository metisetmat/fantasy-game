import type { ZoneId } from "../../core/zones";
import type { PlayerMatchState } from "../players";
import type { MovementPosition } from "../movement";
import { zoneToMovementPosition } from "../movement";

export interface RecoveryVector {
  readonly playerId: string;
  readonly from: ZoneId;
  readonly to: ZoneId;
  readonly fromPosition: MovementPosition;
  readonly targetPosition: MovementPosition;
  readonly etaTicks: number;
  readonly urgency: number;
  readonly recoveryType: string;
  readonly blocksLane: ZoneId | null;
  readonly arrivesBeforeBall: boolean;
  readonly arrivesBeforeAttacker: boolean;
  readonly source: "CALCULATED_FROM_INFLUENCE_MAP";
}

export function evaluateRecoveryVectors(input: {
  readonly defendingPlayers: readonly PlayerMatchState[];
  readonly ballZone: ZoneId;
}): readonly RecoveryVector[] {
  return input.defendingPlayers
    .filter((player) => player.isDelayed || player.isRecovering || player.isEliminated)
    .map((player) => ({
      playerId: player.playerId,
      from: player.zone,
      to: player.activeTrajectory?.targetZone ?? input.ballZone,
      fromPosition: player.currentPosition ?? zoneToMovementPosition(player.zone),
      targetPosition: player.targetPosition ?? zoneToMovementPosition(player.activeTrajectory?.targetZone ?? input.ballZone),
      etaTicks: player.estimatedArrivalTick ?? 0,
      urgency: player.isEliminated ? 100 : player.isDelayed ? 82 : 64,
      recoveryType: player.activeTrajectory?.movementType ?? "RECOVERY_RUN",
      blocksLane: player.activeTrajectory?.targetZone ?? input.ballZone,
      arrivesBeforeBall: (player.estimatedArrivalTick ?? 99) <= 1,
      arrivesBeforeAttacker: (player.estimatedArrivalTick ?? 99) <= 2,
      source: "CALCULATED_FROM_INFLUENCE_MAP" as const,
    }));
}

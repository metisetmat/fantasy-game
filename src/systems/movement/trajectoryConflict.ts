import type { PlayerId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { PlayerTrajectory } from "./playerTrajectory";

export interface TrajectoryConflict {
  readonly playerIds: readonly PlayerId[];
  readonly zone: ZoneId;
  readonly delayTicks: number;
  readonly reason: string;
}

export function evaluateTrajectoryConflicts(trajectories: readonly PlayerTrajectory[]): readonly TrajectoryConflict[] {
  const targetZones = [...new Set(trajectories.map((trajectory) => trajectory.targetZone))];

  return targetZones.flatMap((zone) => {
    const contenders = trajectories.filter((trajectory) => trajectory.targetZone === zone);

    if (contenders.length < 3) {
      return [];
    }

    return [
      {
        playerIds: contenders.map((trajectory) => trajectory.playerId),
        zone,
        delayTicks: Math.min(3, contenders.length - 2),
        reason: `${contenders.length} converging trajectories create support-lane congestion`,
      },
    ];
  });
}

export function getTrajectoryConflictDelay(input: {
  readonly trajectory: PlayerTrajectory;
  readonly conflicts: readonly TrajectoryConflict[];
}): number {
  const conflict = input.conflicts.find((candidate) => candidate.playerIds.includes(input.trajectory.playerId));

  return conflict?.delayTicks ?? 0;
}

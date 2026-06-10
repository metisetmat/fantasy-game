import type { TacticalTick } from "../../core/ratings";
import { interpolatePosition } from "./directionality";
import { MovementState, type PlayerTrajectory } from "./playerTrajectory";

export function advanceTrajectory(input: {
  readonly trajectory: PlayerTrajectory;
  readonly tick: TacticalTick;
  readonly delayTicks?: number;
}): PlayerTrajectory {
  const expectedArrivalTick = input.trajectory.expectedArrivalTick + (input.delayTicks ?? 0);
  const duration = Math.max(1, expectedArrivalTick - input.trajectory.startedTick);
  const elapsed = Math.max(0, input.tick - input.trajectory.startedTick);
  const progress = Math.max(0, Math.min(100, Math.round((elapsed / duration) * 100)));
  const currentPosition = interpolatePosition({
    originZone: input.trajectory.originZone,
    targetZone: input.trajectory.targetZone,
    progress: progress / 100,
  });

  return {
    ...input.trajectory,
    expectedArrivalTick,
    currentProgress: progress,
    currentPosition,
  };
}

export function movementStateFromTrajectory(trajectory: PlayerTrajectory): MovementState {
  if (trajectory.interrupted) {
    return MovementState.Interrupted;
  }

  if (trajectory.currentProgress >= 90) {
    return MovementState.Arriving;
  }

  if (trajectory.movementType === "RECOVERY_RUN") {
    return MovementState.Recovering;
  }

  if (trajectory.urgency >= 75) {
    return MovementState.Sprinting;
  }

  if (trajectory.currentProgress <= 25) {
    return MovementState.Accelerating;
  }

  return MovementState.Moving;
}

import type { Rating } from "../../core/ratings";
import type { MovementVector } from "../movement";
import { clampRating } from "../spatial/utils";

export function calculateBodyTurnSpeed(input: {
  readonly speed: Rating;
  readonly composure: Rating;
  readonly fatigue: Rating;
  readonly sprinting: boolean;
  readonly movementVector: MovementVector | null;
}): Rating {
  const movementCommitment = input.movementVector === null ? 0 : Math.abs(input.movementVector.dx) + Math.abs(input.movementVector.dy);
  const sprintPenalty = input.sprinting ? 18 : 0;
  const fatiguePenalty = input.fatigue * 0.16;

  return clampRating(input.speed * 0.32 + input.composure * 0.36 + 34 - sprintPenalty - fatiguePenalty - movementCommitment * 4);
}

export function calculateOrientationDelayTicks(input: {
  readonly bodyTurnSpeed: Rating;
  readonly pressure: Rating;
  readonly sprinting: boolean;
  readonly chaos: Rating;
}): number {
  const rawDelay = 4 - input.bodyTurnSpeed / 28 + input.pressure / 45 + input.chaos / 55 + (input.sprinting ? 1 : 0);

  return Math.max(0, Math.min(4, Math.round(rawDelay)));
}

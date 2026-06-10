import type { Rating } from "../../core/ratings";
import { MovementType } from "./playerTrajectory";

export function clampMovementRating(value: number): Rating {
  return Math.max(0, Math.min(100, Math.round(value))) as Rating;
}

export function calculateTrajectorySpeed(input: {
  readonly movementType: MovementType;
  readonly urgency: Rating;
  readonly fatigue: Rating;
  readonly speedAttribute: Rating;
}): number {
  const typeBoost =
    input.movementType === MovementType.TransitionSprint || input.movementType === MovementType.DepthRun
      ? 0.32
      : input.movementType === MovementType.PressStep || input.movementType === MovementType.LooseBallAttack
        ? 0.24
        : input.movementType === MovementType.RecoveryRun
          ? 0.18
          : 0.08;
  const fatiguePenalty = input.fatigue / 420;
  const urgencyBoost = input.urgency / 360;
  const attributeBase = 0.72 + input.speedAttribute / 260;

  return Number(Math.max(0.35, attributeBase + typeBoost + urgencyBoost - fatiguePenalty).toFixed(3));
}

export function calculateStaminaCost(input: {
  readonly movementType: MovementType;
  readonly urgency: Rating;
  readonly distance: number;
}): Rating {
  const typeCost =
    input.movementType === MovementType.TransitionSprint || input.movementType === MovementType.DepthRun
      ? 14
      : input.movementType === MovementType.PressStep || input.movementType === MovementType.RecoveryRun
        ? 11
        : 7;

  return clampMovementRating(typeCost + input.distance * 4 + input.urgency / 8);
}

export function calculateInertiaFactor(input: {
  readonly movementType: MovementType;
  readonly urgency: Rating;
  readonly fatigue: Rating;
}): Rating {
  const commitment =
    input.movementType === MovementType.DepthRun || input.movementType === MovementType.TransitionSprint
      ? 28
      : input.movementType === MovementType.Sweep
        ? 22
        : input.movementType === MovementType.PressStep
          ? 18
          : 10;

  return clampMovementRating(commitment + input.urgency * 0.35 + input.fatigue * 0.15);
}

export function shouldSprint(input: {
  readonly movementType: MovementType;
  readonly urgency: Rating;
}): boolean {
  return (
    input.urgency >= 70 ||
    input.movementType === MovementType.TransitionSprint ||
    input.movementType === MovementType.LooseBallAttack
  );
}

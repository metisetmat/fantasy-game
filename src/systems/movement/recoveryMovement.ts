import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import { getZoneDistance } from "../spatial/coordinates";

export interface RecoveryMovementEvaluation {
  readonly delayed: boolean;
  readonly delayTicks: number;
  readonly reason: string;
}

export function evaluateRecoveryMovement(input: {
  readonly originZone: ZoneId;
  readonly targetZone: ZoneId;
  readonly inertiaFactor: Rating;
  readonly fatigue: Rating;
}): RecoveryMovementEvaluation {
  const distance = getZoneDistance(input.originZone, input.targetZone);
  const delayTicks = Math.max(0, Math.round(distance / 2 + input.inertiaFactor / 45 + input.fatigue / 65 - 2));

  return {
    delayed: delayTicks > 0,
    delayTicks,
    reason:
      delayTicks > 0
        ? `recovery delayed by ${distance} zone-step distance, inertia ${input.inertiaFactor}/100, fatigue ${input.fatigue}/100`
        : "recovery movement arrives inside the current tactical window",
  };
}

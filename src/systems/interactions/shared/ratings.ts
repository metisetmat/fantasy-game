import type { Rating } from "../../../core/ratings";
import { PressureLevel } from "../../../models/match";

export function clampInteractionRating(value: number): Rating {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function averageInteractionRatings(values: readonly Rating[]): Rating {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return clampInteractionRating(total / values.length);
}

export function pressureLevelFromRating(value: Rating): PressureLevel {
  if (value >= 67) {
    return PressureLevel.High;
  }

  if (value <= 33) {
    return PressureLevel.Low;
  }

  return PressureLevel.Medium;
}

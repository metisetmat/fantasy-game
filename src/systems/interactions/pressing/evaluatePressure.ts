import type { Rating } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import { PressureLevel } from "../../../models/match";
import type { CompactnessEvaluation } from "../../spatial/types";
import type { DensityEvaluation } from "../../spatial/types";
import { clampInteractionRating, pressureLevelFromRating } from "../shared/ratings";

export interface PressureEvaluationInput {
  readonly activeZone: ZoneId;
  readonly density: DensityEvaluation;
  readonly defensiveCompactness: CompactnessEvaluation;
  readonly contextualPressure: PressureLevel;
}

export interface PressureEvaluation {
  readonly pressureScore: Rating;
  readonly pressureLevel: PressureLevel;
  readonly activeZoneDensity: Rating;
}

function getContextualPressureModifier(pressureLevel: PressureLevel): Rating {
  switch (pressureLevel) {
    case PressureLevel.High:
      return 85;
    case PressureLevel.Medium:
      return 55;
    case PressureLevel.Low:
      return 25;
  }
}

export function evaluatePressure(input: PressureEvaluationInput): PressureEvaluation {
  const activeCell = input.density.densityMap[input.activeZone];
  const activeZoneDensity = activeCell?.pressure ?? 0;
  const contextualPressure = getContextualPressureModifier(input.contextualPressure);
  const pressureScore = clampInteractionRating(
    activeZoneDensity * 0.45 +
      input.defensiveCompactness.overallCompactness * 0.3 +
      contextualPressure * 0.25,
  );

  return {
    pressureScore,
    pressureLevel: pressureLevelFromRating(pressureScore),
    activeZoneDensity,
  };
}

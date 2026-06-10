import { PressureLevel } from "../../../models/match";
import type { CompactnessEvaluation } from "../types";
import type { PassingLaneEvaluation } from "./types";
import { PassingLaneDifficulty } from "./types";
import { clampRating } from "../utils";
import type { ZoneId } from "../../../core/zones";

export function evaluatePassingLane(input: {
  readonly targetZone: ZoneId;
  readonly defensiveCompactness: CompactnessEvaluation;
  readonly currentPressure: PressureLevel;
  readonly defendersInTarget: number;
  readonly coverShadowQuality: number;
}): PassingLaneEvaluation {
  const pressurePenalty =
    input.currentPressure === PressureLevel.High ? 18 : input.currentPressure === PressureLevel.Medium ? 9 : 3;
  const openness = clampRating(
    82 -
      input.defensiveCompactness.overallCompactness * 0.28 -
      pressurePenalty -
      input.defendersInTarget * 12 -
      input.coverShadowQuality * 0.2,
  );
  const difficulty =
    openness >= 62
      ? PassingLaneDifficulty.Open
      : openness >= 38
        ? PassingLaneDifficulty.Contested
        : PassingLaneDifficulty.Closed;

  return {
    targetZone: input.targetZone,
    difficulty,
    openness,
    reason:
      difficulty === PassingLaneDifficulty.Open
        ? "passing lane open enough to find receiver"
        : difficulty === PassingLaneDifficulty.Contested
          ? "passing lane contested by compactness and pressure"
          : "passing lane closed by cover shadow and pressure",
  };
}

import { SCORING_POINTS, type ScoringType } from "../../../models/scoring";

export function evaluateScoringValue(scoringType: ScoringType): {
  readonly points: number;
  readonly modifier: number;
} {
  const points = SCORING_POINTS[scoringType];

  return {
    points,
    modifier: points * 6,
  };
}

export enum ScoringType {
  Goal = "goal",
  Try = "try",
  Drop = "drop",
  Penalty = "penalty",
  Conversion = "conversion",
}

export const SCORING_POINTS: Readonly<Record<ScoringType, number>> = {
  [ScoringType.Goal]: 3,
  [ScoringType.Try]: 5,
  [ScoringType.Drop]: 1,
  [ScoringType.Penalty]: 1,
  [ScoringType.Conversion]: 2,
};

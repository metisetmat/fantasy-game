export interface ScoreComponent {
  readonly label: string;
  readonly value: number;
  readonly reason: string;
}

export interface ActionSelectionScoringBreakdown {
  readonly bonuses: readonly ScoreComponent[];
  readonly penalties: readonly ScoreComponent[];
  readonly finalScore: number;
}

export function sumScoreComponents(input: {
  readonly bonuses: readonly ScoreComponent[];
  readonly penalties: readonly ScoreComponent[];
}): number {
  const bonusTotal = input.bonuses.reduce((sum, component) => sum + component.value, 0);
  const penaltyTotal = input.penalties.reduce((sum, component) => sum + Math.abs(component.value), 0);

  return Math.max(0, Math.min(100, Math.round(bonusTotal - penaltyTotal)));
}

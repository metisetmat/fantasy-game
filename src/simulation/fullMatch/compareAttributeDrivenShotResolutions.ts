import type { AttributeDrivenShotResolutionPathResult } from "./attributeDrivenShotResolutionSandbox";

export function compareAttributeDrivenShotResolutions(input: {
  readonly baseline: AttributeDrivenShotResolutionPathResult;
  readonly override: AttributeDrivenShotResolutionPathResult;
}): {
  readonly attributeDrivenOutcomeDivergenceObserved: boolean;
  readonly shotQualityDivergenceObserved: boolean;
  readonly goalkeeperQualityDivergenceObserved: boolean;
  readonly attributeInfluenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly explanation: string;
} {
  const attributeDrivenOutcomeDivergenceObserved = input.baseline.outcome !== input.override.outcome;
  const shotQualityDivergenceObserved =
    input.baseline.attributeAdjustedShotQuality !== input.override.attributeAdjustedShotQuality;
  const goalkeeperQualityDivergenceObserved =
    input.baseline.attributeAdjustedGoalkeeperResponseQuality !==
    input.override.attributeAdjustedGoalkeeperResponseQuality;
  const attributeInfluenceObserved =
    input.override.shooterAttributeScore > 0 ||
    input.override.goalkeeperAttributeScore > 0 ||
    input.override.factors.some((factor) => factor.startsWith("SHOOTER_") || factor.startsWith("GOALKEEPER_"));
  const sandboxScoringEventDivergenceObserved =
    input.baseline.sandboxScoringEventCreated !== input.override.sandboxScoringEventCreated;
  const sandboxScoreDivergenceObserved = input.baseline.sandboxScoreDelta !== input.override.sandboxScoreDelta;

  return {
    attributeDrivenOutcomeDivergenceObserved,
    shotQualityDivergenceObserved,
    goalkeeperQualityDivergenceObserved,
    attributeInfluenceObserved,
    sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved,
    explanation:
      `Attribute-driven sandbox shot resolution compares baseline ${input.baseline.outcome} ` +
      `against override ${input.override.outcome}. The override uses shooter attributes, reception, ` +
      `pressure, target zone, fatigue/mental freshness, and goalkeeper attributes to compute ` +
      `shot quality ${input.override.attributeAdjustedShotQuality}/100 versus goalkeeper response ` +
      `${input.override.attributeAdjustedGoalkeeperResponseQuality}/100. It remains sandbox-only: ` +
      `no official MatchEvent, production ScoringEvent, score delta, route resolution mutation, or ` +
      `global economy claim is created.`,
  };
}

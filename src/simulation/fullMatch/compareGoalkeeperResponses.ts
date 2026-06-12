import type { GoalkeeperResponsePathResult } from "./goalkeeperResponseModel";

export function compareGoalkeeperResponses(input: {
  readonly baseline: GoalkeeperResponsePathResult;
  readonly override: GoalkeeperResponsePathResult;
}): {
  readonly goalkeeperResponseDivergenceObserved: boolean;
  readonly reboundStateDivergenceObserved: boolean;
  readonly saveMarginObserved: boolean;
  readonly goalkeeperAttributeInfluenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly explanation: string;
} {
  const goalkeeperResponseDivergenceObserved = input.baseline.responseType !== input.override.responseType;
  const reboundStateDivergenceObserved = input.baseline.reboundState !== input.override.reboundState;
  const saveMarginObserved = input.override.shotQualityFaced > 0 && input.override.saveMargin !== 0;
  const goalkeeperAttributeInfluenceObserved =
    input.override.positioningScore > 0 &&
    input.override.trajectoryReadingScore > 0 &&
    input.override.reactionScore > 0 &&
    input.override.handlingScore > 0 &&
    input.override.reboundControlScore > 0 &&
    input.override.concentrationScore > 0;
  const sandboxScoringEventDivergenceObserved =
    input.baseline.sandboxScoringEventCreated !== input.override.sandboxScoringEventCreated;
  const sandboxScoreDivergenceObserved = input.baseline.sandboxScoreDelta !== input.override.sandboxScoreDelta;

  return {
    goalkeeperResponseDivergenceObserved,
    reboundStateDivergenceObserved,
    saveMarginObserved,
    goalkeeperAttributeInfluenceObserved,
    sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved,
    explanation:
      `Baseline ${input.baseline.responseType} becomes ${input.override.responseType}: goalkeeper ` +
      `${input.override.goalkeeperId ?? "fallback"} faces shot quality ${input.override.shotQualityFaced}/100 with ` +
      `response score ${input.override.goalkeeperResponseScore}/100 and save margin ${input.override.saveMargin}. ` +
      `This remains sandbox-only and creates no official scoring event or score delta.`,
  };
}

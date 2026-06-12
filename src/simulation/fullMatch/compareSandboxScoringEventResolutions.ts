import type { SandboxScoringEventResolutionPathResult } from "./sandboxScoringEventResolution";

export type SandboxScoringEventResolutionComparison = {
  readonly scoringResolutionTypeDivergenceObserved: boolean;
  readonly shotAttemptCreationDivergenceObserved: boolean;
  readonly shotQualityDivergenceObserved: boolean;
  readonly goalkeeperResponseDivergenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly explanation: string;
};

export function compareSandboxScoringEventResolutions(input: {
  readonly baseline: SandboxScoringEventResolutionPathResult;
  readonly override: SandboxScoringEventResolutionPathResult;
}): SandboxScoringEventResolutionComparison {
  const scoringResolutionTypeDivergenceObserved = input.baseline.resolutionType !== input.override.resolutionType;
  const shotAttemptCreationDivergenceObserved = input.baseline.shotAttemptCreated !== input.override.shotAttemptCreated;
  const shotQualityDivergenceObserved = input.baseline.shotQuality !== input.override.shotQuality;
  const goalkeeperResponseDivergenceObserved = input.baseline.goalkeeperResponse !== input.override.goalkeeperResponse;
  const sandboxScoringEventDivergenceObserved =
    input.baseline.sandboxScoringEventCreated !== input.override.sandboxScoringEventCreated;
  const sandboxScoreDivergenceObserved = input.baseline.sandboxScoreDelta !== input.override.sandboxScoreDelta;

  return {
    scoringResolutionTypeDivergenceObserved,
    shotAttemptCreationDivergenceObserved,
    shotQualityDivergenceObserved,
    goalkeeperResponseDivergenceObserved,
    sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved,
    explanation:
      `The baseline resolves as ${input.baseline.resolutionType} with shot quality ${input.baseline.shotQuality}/100, while the override resolves as ${input.override.resolutionType} with shot quality ${input.override.shotQuality}/100. This is a sandbox scoring-event resolution only; it does not create official scoring events or official score changes.`,
  };
}

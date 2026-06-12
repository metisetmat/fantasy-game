import type { MultiActionContinuationPathResult } from "./multiActionContinuationSandbox";

export function compareMultiActionContinuation(input: {
  readonly baseline: MultiActionContinuationPathResult;
  readonly override: MultiActionContinuationPathResult;
}): {
  readonly continuationActionDivergenceObserved: boolean;
  readonly continuationOutcomeDivergenceObserved: boolean;
  readonly continuationTeamDivergenceObserved: boolean;
  readonly possessionSecurityObserved: boolean;
  readonly transitionRiskObserved: boolean;
  readonly sandboxMatchEventDivergenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly officialPossessionDivergenceObserved: false;
  readonly explanation: string;
} {
  const continuationActionDivergenceObserved = input.baseline.continuationActionType !== input.override.continuationActionType;
  const continuationOutcomeDivergenceObserved = input.baseline.continuationOutcome !== input.override.continuationOutcome;
  const continuationTeamDivergenceObserved = input.baseline.continuationTeamCandidate !== input.override.continuationTeamCandidate;
  const possessionSecurityObserved = input.override.possessionSecurityScore > input.baseline.possessionSecurityScore;
  const transitionRiskObserved = input.override.transitionRisk > input.baseline.transitionRisk;
  const sandboxMatchEventDivergenceObserved = input.baseline.sandboxMatchEventCreated !== input.override.sandboxMatchEventCreated;
  const sandboxScoringEventDivergenceObserved =
    input.baseline.sandboxScoringEventCreated !== input.override.sandboxScoringEventCreated;
  const sandboxScoreDivergenceObserved = input.baseline.sandboxScoreDelta !== input.override.sandboxScoreDelta;

  return {
    continuationActionDivergenceObserved,
    continuationOutcomeDivergenceObserved,
    continuationTeamDivergenceObserved,
    possessionSecurityObserved,
    transitionRiskObserved,
    sandboxMatchEventDivergenceObserved,
    sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved,
    officialPossessionDivergenceObserved: false,
    explanation:
      `Baseline has ${input.baseline.continuationActionType}; override creates ${input.override.continuationActionType} ` +
      `for ${input.override.continuationTeamCandidate} with confidence ${input.override.continuationConfidence}/100. ` +
      "The continuation is diagnostic-only and does not create official events, possession changes, or score changes.",
  };
}

import type { ReboundSecondChancePathResult } from "./reboundSecondChanceSandbox";

export function compareReboundSecondChance(input: {
  readonly baseline: ReboundSecondChancePathResult;
  readonly override: ReboundSecondChancePathResult;
}): {
  readonly reboundOutcomeDivergenceObserved: boolean;
  readonly ballLooseStateDivergenceObserved: boolean;
  readonly recoveryTeamDivergenceObserved: boolean;
  readonly secondChanceProbabilityObserved: boolean;
  readonly secondChanceCreationDivergenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly explanation: string;
} {
  const reboundOutcomeDivergenceObserved = input.baseline.reboundOutcome !== input.override.reboundOutcome;
  const ballLooseStateDivergenceObserved = input.baseline.ballLooseState !== input.override.ballLooseState;
  const recoveryTeamDivergenceObserved = input.baseline.recoveryTeamCandidate !== input.override.recoveryTeamCandidate;
  const secondChanceProbabilityObserved = input.override.secondChanceProbability > input.baseline.secondChanceProbability;
  const secondChanceCreationDivergenceObserved = input.baseline.secondChanceCreated !== input.override.secondChanceCreated;
  const sandboxScoringEventDivergenceObserved =
    input.baseline.sandboxScoringEventCreated !== input.override.sandboxScoringEventCreated;
  const sandboxScoreDivergenceObserved = input.baseline.sandboxScoreDelta !== input.override.sandboxScoreDelta;

  return {
    reboundOutcomeDivergenceObserved,
    ballLooseStateDivergenceObserved,
    recoveryTeamDivergenceObserved,
    secondChanceProbabilityObserved,
    secondChanceCreationDivergenceObserved,
    sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved,
    explanation:
      `Baseline has ${input.baseline.reboundOutcome}; override has ${input.override.reboundOutcome} ` +
      `with loose state ${input.override.ballLooseState}, recovery candidate ${input.override.recoveryTeamCandidate}, ` +
      `and second-chance probability ${input.override.secondChanceProbability}/100. ` +
      "The comparison is diagnostic-only and does not create official events or score changes.",
  };
}

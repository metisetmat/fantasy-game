import type { SandboxScoringEventCandidatePathResult } from "./sandboxScoringEventCandidate";

export type SandboxScoringEventCandidateComparison = {
  readonly scoringCandidateTypeDivergenceObserved: boolean;
  readonly scoringCandidateFamilyDivergenceObserved: boolean;
  readonly scoringCandidateProbabilityDivergenceObserved: boolean;
  readonly scoringCandidateCreationDivergenceObserved: boolean;
  readonly conversionProbabilityDivergenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly explanation: string;
};

export function compareSandboxScoringEventCandidates(input: {
  readonly baseline: SandboxScoringEventCandidatePathResult;
  readonly override: SandboxScoringEventCandidatePathResult;
}): SandboxScoringEventCandidateComparison {
  const scoringCandidateTypeDivergenceObserved =
    input.baseline.scoringCandidateType !== input.override.scoringCandidateType;
  const scoringCandidateFamilyDivergenceObserved =
    input.baseline.scoringCandidateFamily !== input.override.scoringCandidateFamily;
  const scoringCandidateProbabilityDivergenceObserved =
    input.baseline.scoringCandidateProbability !== input.override.scoringCandidateProbability;
  const scoringCandidateCreationDivergenceObserved =
    input.baseline.scoringCandidateCreated !== input.override.scoringCandidateCreated;
  const conversionProbabilityDivergenceObserved =
    input.baseline.conversionProbability !== input.override.conversionProbability;
  const sandboxScoringEventDivergenceObserved =
    input.baseline.sandboxScoringEventCreated !== input.override.sandboxScoringEventCreated;
  const sandboxScoreDivergenceObserved = input.baseline.sandboxScoreDelta !== input.override.sandboxScoreDelta;

  return {
    scoringCandidateTypeDivergenceObserved,
    scoringCandidateFamilyDivergenceObserved,
    scoringCandidateProbabilityDivergenceObserved,
    scoringCandidateCreationDivergenceObserved,
    conversionProbabilityDivergenceObserved,
    sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved,
    explanation:
      `The baseline produces ${input.baseline.scoringCandidateType} with conversion ${input.baseline.conversionProbability}/100, while the override produces ${input.override.scoringCandidateType} with conversion ${input.override.conversionProbability}/100. This is a sandbox scoring-event candidate only; it does not create official scoring events.`,
  };
}

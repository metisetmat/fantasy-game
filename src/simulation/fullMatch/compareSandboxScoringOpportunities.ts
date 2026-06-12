import type { SandboxScoringOpportunityPathResult } from "./sandboxScoringOpportunityModel";

export type SandboxScoringOpportunityComparison = {
  readonly opportunityTypeDivergenceObserved: boolean;
  readonly opportunityFamilyDivergenceObserved: boolean;
  readonly opportunityProbabilityDivergenceObserved: boolean;
  readonly opportunityCreationDivergenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly explanation: string;
};

export function compareSandboxScoringOpportunities(input: {
  readonly baseline: SandboxScoringOpportunityPathResult;
  readonly override: SandboxScoringOpportunityPathResult;
}): SandboxScoringOpportunityComparison {
  const opportunityTypeDivergenceObserved = input.baseline.opportunityType !== input.override.opportunityType;
  const opportunityFamilyDivergenceObserved = input.baseline.opportunityFamily !== input.override.opportunityFamily;
  const opportunityProbabilityDivergenceObserved = input.baseline.opportunityProbability !== input.override.opportunityProbability;
  const opportunityCreationDivergenceObserved = input.baseline.opportunityCreated !== input.override.opportunityCreated;
  const sandboxScoringEventDivergenceObserved =
    input.baseline.sandboxScoringEventCreated !== input.override.sandboxScoringEventCreated;
  const sandboxScoreDivergenceObserved = input.baseline.sandboxScoreDelta !== input.override.sandboxScoreDelta;

  return {
    opportunityTypeDivergenceObserved,
    opportunityFamilyDivergenceObserved,
    opportunityProbabilityDivergenceObserved,
    opportunityCreationDivergenceObserved,
    sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved,
    explanation:
      `The baseline route stays at ${input.baseline.opportunityType} (${input.baseline.opportunityProbability}/100), while the override reaches ${input.override.opportunityType} (${input.override.opportunityProbability}/100). The comparison creates a sandbox-only opportunity signal, not an official scoring event.`,
  };
}

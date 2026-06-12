import type { ControlledRouteResolutionPathResult } from "./controlledRouteResolutionSandbox";

export type ControlledRouteResolutionSandboxComparison = {
  readonly selectionDivergenceObserved: boolean;
  readonly carrierDivergenceObserved: boolean;
  readonly zoneProgressionDivergenceObserved: boolean;
  readonly dangerCreationDivergenceObserved: boolean;
  readonly scoringOpportunityDivergenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly explanation: string;
};

export function compareControlledRouteResolutionSandbox(input: {
  readonly baseline: ControlledRouteResolutionPathResult;
  readonly override: ControlledRouteResolutionPathResult;
}): ControlledRouteResolutionSandboxComparison {
  const selectionDivergenceObserved = input.baseline.candidateId !== input.override.candidateId ||
    input.baseline.actionType !== input.override.actionType;
  const carrierDivergenceObserved = input.baseline.resultingCarrierId !== input.override.resultingCarrierId;
  const zoneProgressionDivergenceObserved = input.baseline.resultingZone !== input.override.resultingZone;
  const dangerCreationDivergenceObserved = input.baseline.dangerCreated !== input.override.dangerCreated ||
    input.override.dangerProbability > input.baseline.dangerProbability;
  const scoringOpportunityDivergenceObserved =
    input.baseline.scoringOpportunityCreated !== input.override.scoringOpportunityCreated;
  const sandboxScoringEventDivergenceObserved =
    input.baseline.sandboxScoringEventCreated !== input.override.sandboxScoringEventCreated;
  const sandboxScoreDivergenceObserved = input.baseline.sandboxScoreDelta !== input.override.sandboxScoreDelta;

  return {
    selectionDivergenceObserved,
    carrierDivergenceObserved,
    zoneProgressionDivergenceObserved,
    dangerCreationDivergenceObserved,
    scoringOpportunityDivergenceObserved,
    sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved,
    explanation:
      `Sandbox comparison keeps ${input.baseline.actionType ?? "baseline"} as a safer retention route and ` +
      `${input.override.actionType ?? "override"} as the higher-danger progression route. ` +
      "It compares isolated route outcomes only and does not alter the official match.",
  };
}

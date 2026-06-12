import type {
  OfficialTimelineDiffPath,
} from "./officialTimelineDiffView";

export function compareOfficialTimelineDiffPaths(input: {
  readonly baseline: OfficialTimelineDiffPath;
  readonly override: OfficialTimelineDiffPath;
}): {
  readonly sandboxOutcomeDivergenceObserved: boolean;
  readonly sandboxFinalTeamDivergenceObserved: boolean;
  readonly sandboxFinalZoneDivergenceObserved: boolean;
  readonly officialTimelineDivergenceObserved: false;
  readonly officialPossessionDivergenceObserved: false;
  readonly officialScoreDivergenceObserved: false;
  readonly officialScoringEventDivergenceObserved: false;
  readonly explanation: string;
} {
  const sandboxOutcomeDivergenceObserved = input.baseline.finalSandboxOutcome !== input.override.finalSandboxOutcome;
  const sandboxFinalTeamDivergenceObserved = input.baseline.finalSandboxTeamCandidate !== input.override.finalSandboxTeamCandidate;
  const sandboxFinalZoneDivergenceObserved = input.baseline.finalSandboxZoneCandidate !== input.override.finalSandboxZoneCandidate;

  return {
    sandboxOutcomeDivergenceObserved,
    sandboxFinalTeamDivergenceObserved,
    sandboxFinalZoneDivergenceObserved,
    officialTimelineDivergenceObserved: false,
    officialPossessionDivergenceObserved: false,
    officialScoreDivergenceObserved: false,
    officialScoringEventDivergenceObserved: false,
    explanation:
      `Official timeline diff view is read-only: baseline sandbox outcome ${input.baseline.finalSandboxOutcome ?? "none"} ` +
      `versus override ${input.override.finalSandboxOutcome ?? "none"}, while official event, score, scoring-event, and possession deltas remain zero.`,
  };
}

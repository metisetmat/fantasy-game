import type { SandboxSequenceReplayPath } from "./sandboxSequenceReplay";

export function compareSandboxSequenceReplay(input: {
  readonly baseline: SandboxSequenceReplayPath;
  readonly override: SandboxSequenceReplayPath;
}): {
  readonly sequenceStepCountDivergenceObserved: boolean;
  readonly sequenceOutcomeDivergenceObserved: boolean;
  readonly sequenceFinalTeamDivergenceObserved: boolean;
  readonly sequenceFinalZoneDivergenceObserved: boolean;
  readonly sandboxMatchEventDivergenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly officialPossessionDivergenceObserved: false;
  readonly officialTimelineDivergenceObserved: false;
  readonly explanation: string;
} {
  const sequenceStepCountDivergenceObserved = input.baseline.stepCount !== input.override.stepCount;
  const sequenceOutcomeDivergenceObserved = input.baseline.finalOutcome !== input.override.finalOutcome;
  const sequenceFinalTeamDivergenceObserved = input.baseline.finalTeamCandidate !== input.override.finalTeamCandidate;
  const sequenceFinalZoneDivergenceObserved = input.baseline.finalZoneCandidate !== input.override.finalZoneCandidate;
  const sandboxMatchEventDivergenceObserved =
    input.baseline.sandboxMatchEventCreatedCount !== input.override.sandboxMatchEventCreatedCount;
  const sandboxScoringEventDivergenceObserved =
    input.baseline.sandboxScoringEventCreatedCount !== input.override.sandboxScoringEventCreatedCount;
  const sandboxScoreDivergenceObserved = input.baseline.sandboxScoreDeltaTotal !== input.override.sandboxScoreDeltaTotal;

  return {
    sequenceStepCountDivergenceObserved,
    sequenceOutcomeDivergenceObserved,
    sequenceFinalTeamDivergenceObserved,
    sequenceFinalZoneDivergenceObserved,
    sandboxMatchEventDivergenceObserved,
    sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved,
    officialPossessionDivergenceObserved: false,
    officialTimelineDivergenceObserved: false,
    explanation:
      `Baseline sandbox sequence ends with ${input.baseline.finalOutcome ?? "none"}; ` +
      `override sequence ends with ${input.override.finalOutcome ?? "none"} for ${input.override.finalTeamCandidate ?? "none"} ` +
      `at ${input.override.finalZoneCandidate ?? "none"}. The replay is diagnostic-only and does not create official events, ` +
      "timeline mutations, possession changes, scoring events, or score changes.",
  };
}

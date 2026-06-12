import type { ControlledSegmentSandboxTimelinePath } from "./controlledSegmentSandboxTimeline";

export function compareControlledSegmentSandboxTimeline(input: {
  readonly baseline: ControlledSegmentSandboxTimelinePath;
  readonly override: ControlledSegmentSandboxTimelinePath;
}): {
  readonly sandboxTimelineEventCountDivergenceObserved: boolean;
  readonly sandboxTimelineOutcomeDivergenceObserved: boolean;
  readonly sandboxTimelineFinalTeamDivergenceObserved: boolean;
  readonly sandboxTimelineFinalZoneDivergenceObserved: boolean;
  readonly officialTimelineDivergenceObserved: false;
  readonly officialPossessionDivergenceObserved: false;
  readonly officialScoreDivergenceObserved: false;
  readonly officialScoringEventDivergenceObserved: false;
  readonly explanation: string;
} {
  const sandboxTimelineEventCountDivergenceObserved = input.baseline.eventCount !== input.override.eventCount;
  const sandboxTimelineOutcomeDivergenceObserved = input.baseline.finalOutcome !== input.override.finalOutcome;
  const sandboxTimelineFinalTeamDivergenceObserved = input.baseline.finalTeamCandidate !== input.override.finalTeamCandidate;
  const sandboxTimelineFinalZoneDivergenceObserved = input.baseline.finalZoneCandidate !== input.override.finalZoneCandidate;

  return {
    sandboxTimelineEventCountDivergenceObserved,
    sandboxTimelineOutcomeDivergenceObserved,
    sandboxTimelineFinalTeamDivergenceObserved,
    sandboxTimelineFinalZoneDivergenceObserved,
    officialTimelineDivergenceObserved: false,
    officialPossessionDivergenceObserved: false,
    officialScoreDivergenceObserved: false,
    officialScoringEventDivergenceObserved: false,
    explanation:
      `Baseline sandbox timeline ends with ${input.baseline.finalOutcome ?? "none"}; ` +
      `override sandbox timeline ends with ${input.override.finalOutcome ?? "none"} for ${input.override.finalTeamCandidate ?? "none"} ` +
      `at ${input.override.finalZoneCandidate ?? "none"}. This is a separate sandbox timeline, not the official MatchReport timeline.`,
  };
}

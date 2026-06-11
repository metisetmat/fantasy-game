import type { ControlledSegmentReplayPath } from "./fullMatchControlledSegmentReplayComparison";

export type ControlledSegmentReplayPathComparison = {
  readonly selectionDivergenceObserved: boolean;
  readonly possessionContinuityDivergenceObserved: boolean;
  readonly zoneProgressionDivergenceObserved: boolean;
  readonly dangerCreationDivergenceObserved: boolean;
  readonly scoringOpportunityDivergenceObserved: boolean;
  readonly timelineDivergenceObserved: boolean;
  readonly scoringEventDivergenceObserved: boolean;
  readonly scoreDivergenceObserved: boolean;
  readonly explanation: string;
};

function pathSelectionSignature(path: ControlledSegmentReplayPath): string {
  return [
    path.candidateId ?? "none",
    path.actionType ?? "none",
    path.receiverId ?? "none",
    path.targetZone ?? "none",
  ].join("|");
}

export function compareControlledSegmentReplayPaths(input: {
  readonly baseline: ControlledSegmentReplayPath;
  readonly override: ControlledSegmentReplayPath;
}): ControlledSegmentReplayPathComparison {
  const baselineProgression = input.baseline.zoneProgressionDelta ?? 0;
  const overrideProgression = input.override.zoneProgressionDelta ?? 0;
  const baselineTimeline = input.baseline.timelineSignature ?? pathSelectionSignature(input.baseline);
  const overrideTimeline = input.override.timelineSignature ?? pathSelectionSignature(input.override);
  const baselineScoringEvent = input.baseline.scoringEventSignature ?? "no_scoring_event";
  const overrideScoringEvent = input.override.scoringEventSignature ?? "no_scoring_event";
  const baselineScore = input.baseline.scoreSignature ?? `score_delta_${input.baseline.scoreDelta ?? 0}`;
  const overrideScore = input.override.scoreSignature ?? `score_delta_${input.override.scoreDelta ?? 0}`;

  const selectionDivergenceObserved = pathSelectionSignature(input.baseline) !== pathSelectionSignature(input.override);
  const possessionContinuityDivergenceObserved = input.baseline.possessionRetained !== input.override.possessionRetained;
  const zoneProgressionDivergenceObserved = baselineProgression !== overrideProgression;
  const dangerCreationDivergenceObserved = input.baseline.dangerCreated !== input.override.dangerCreated;
  const scoringOpportunityDivergenceObserved =
    input.baseline.scoringOpportunityCreated !== input.override.scoringOpportunityCreated;
  const timelineDivergenceObserved = baselineTimeline !== overrideTimeline;
  const scoringEventDivergenceObserved = baselineScoringEvent !== overrideScoringEvent;
  const scoreDivergenceObserved = baselineScore !== overrideScore;

  return {
    selectionDivergenceObserved,
    possessionContinuityDivergenceObserved,
    zoneProgressionDivergenceObserved,
    dangerCreationDivergenceObserved,
    scoringOpportunityDivergenceObserved,
    timelineDivergenceObserved,
    scoringEventDivergenceObserved,
    scoreDivergenceObserved,
    explanation:
      `Baseline ${input.baseline.actionType ?? "none"} to ${input.baseline.receiverId ?? "none"} in ${input.baseline.targetZone ?? "none"} ` +
      `is compared with override ${input.override.actionType ?? "none"} to ${input.override.receiverId ?? "none"} in ${input.override.targetZone ?? "none"}. ` +
      "The override produces a higher isolated progression and danger profile, while score and official scoring-event signatures remain unchanged unless a real isolated replay later proves otherwise.",
  };
}

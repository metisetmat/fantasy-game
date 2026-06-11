import type { RealIsolatedSegmentReplayPath } from "./fullMatchRealIsolatedSegmentReplay";

export type RealIsolatedSegmentReplayPathComparison = {
  readonly selectionDivergenceObserved: boolean;
  readonly possessionContinuityDivergenceObserved: boolean;
  readonly carrierDivergenceObserved: boolean;
  readonly zoneProgressionDivergenceObserved: boolean;
  readonly dangerCreationDivergenceObserved: boolean;
  readonly scoringOpportunityDivergenceObserved: boolean;
  readonly isolatedTimelineDivergenceObserved: boolean;
  readonly isolatedScoringEventDivergenceObserved: boolean;
  readonly isolatedScoreDivergenceObserved: boolean;
  readonly explanation: string;
};

function selectionSignature(path: RealIsolatedSegmentReplayPath): string {
  return [
    path.candidateId ?? "none",
    path.actionType ?? "none",
    path.receiverId ?? "none",
    path.targetZone ?? "none",
  ].join("|");
}

export function compareRealIsolatedSegmentReplayPaths(input: {
  readonly baseline: RealIsolatedSegmentReplayPath;
  readonly override: RealIsolatedSegmentReplayPath;
}): RealIsolatedSegmentReplayPathComparison {
  const baselineTimeline = input.baseline.timelineSignature ?? "";
  const overrideTimeline = input.override.timelineSignature ?? "";
  const baselineScore = input.baseline.isolatedScoreSignature ?? "isolated_score_delta_0";
  const overrideScore = input.override.isolatedScoreSignature ?? "isolated_score_delta_0";
  const baselineScoringEvent = input.baseline.isolatedScoringEventSignature ?? "no_isolated_scoring_event";
  const overrideScoringEvent = input.override.isolatedScoringEventSignature ?? "no_isolated_scoring_event";

  const selectionDivergenceObserved = selectionSignature(input.baseline) !== selectionSignature(input.override);
  const possessionContinuityDivergenceObserved = input.baseline.possessionRetained !== input.override.possessionRetained;
  const carrierDivergenceObserved = input.baseline.resultingCarrierId !== input.override.resultingCarrierId;
  const zoneProgressionDivergenceObserved = (input.baseline.zoneProgressionDelta ?? 0) !== (input.override.zoneProgressionDelta ?? 0);
  const dangerCreationDivergenceObserved = input.baseline.dangerCreated !== input.override.dangerCreated;
  const scoringOpportunityDivergenceObserved =
    input.baseline.scoringOpportunityCreated !== input.override.scoringOpportunityCreated;
  const isolatedTimelineDivergenceObserved = baselineTimeline !== overrideTimeline;
  const isolatedScoringEventDivergenceObserved = baselineScoringEvent !== overrideScoringEvent;
  const isolatedScoreDivergenceObserved = baselineScore !== overrideScore;

  return {
    selectionDivergenceObserved,
    possessionContinuityDivergenceObserved,
    carrierDivergenceObserved,
    zoneProgressionDivergenceObserved,
    dangerCreationDivergenceObserved,
    scoringOpportunityDivergenceObserved,
    isolatedTimelineDivergenceObserved,
    isolatedScoringEventDivergenceObserved,
    isolatedScoreDivergenceObserved,
    explanation:
      `Real isolated replay compares baseline ${input.baseline.actionType ?? "none"} to ${input.baseline.receiverId ?? "none"} ` +
      `with override ${input.override.actionType ?? "none"} to ${input.override.receiverId ?? "none"}. ` +
      "The override changes carrier, zone progression, danger, and isolated event sequence while preserving possession and official score isolation.",
  };
}

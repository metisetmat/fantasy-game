export type IsolatedMiniMatchSelectionSnapshot = {
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly scoreSignature?: string;
  readonly scoringEventCount?: number;
  readonly timelineEventCount?: number;
};

export type IsolatedMiniMatchOverrideComparison = {
  readonly selectionDivergenceObserved: boolean;
  readonly scoreDivergenceObserved: boolean;
  readonly scoringEventDivergenceObserved: boolean;
  readonly timelineDivergenceObserved: boolean;
  readonly explanation: string;
};

export function compareIsolatedMiniMatchOverride(input: {
  readonly baselineSelection: IsolatedMiniMatchSelectionSnapshot;
  readonly overrideSelection: IsolatedMiniMatchSelectionSnapshot;
}): IsolatedMiniMatchOverrideComparison {
  const selectionDivergenceObserved =
    input.baselineSelection.candidateId !== input.overrideSelection.candidateId ||
    input.baselineSelection.actionType !== input.overrideSelection.actionType ||
    input.baselineSelection.receiverId !== input.overrideSelection.receiverId ||
    input.baselineSelection.targetZone !== input.overrideSelection.targetZone;
  const scoreDivergenceObserved =
    input.baselineSelection.scoreSignature !== undefined &&
    input.overrideSelection.scoreSignature !== undefined &&
    input.baselineSelection.scoreSignature !== input.overrideSelection.scoreSignature;
  const scoringEventDivergenceObserved =
    input.baselineSelection.scoringEventCount !== undefined &&
    input.overrideSelection.scoringEventCount !== undefined &&
    input.baselineSelection.scoringEventCount !== input.overrideSelection.scoringEventCount;
  const timelineDivergenceObserved =
    input.baselineSelection.timelineEventCount !== undefined &&
    input.overrideSelection.timelineEventCount !== undefined &&
    input.baselineSelection.timelineEventCount !== input.overrideSelection.timelineEventCount;

  return {
    selectionDivergenceObserved,
    scoreDivergenceObserved,
    scoringEventDivergenceObserved,
    timelineDivergenceObserved,
    explanation: selectionDivergenceObserved
      ? `Baseline ${input.baselineSelection.candidateId ?? "none"} (${input.baselineSelection.actionType ?? "none"}) is compared with isolated override ${input.overrideSelection.candidateId ?? "none"} (${input.overrideSelection.actionType ?? "none"}); score and timeline divergence remain metadata-only unless an isolated replay provides signatures.`
      : "Baseline and isolated override selections match; no selection divergence is observed.",
  };
}

import type { WorkbenchChainReplayResult } from "../grounding/workbenchChainReplay";

export type FullMatchChainConsumptionMode =
  | "disabled"
  | "experimental_first_segment";

export type FullMatchChainConsumptionStatus =
  | "not_requested"
  | "consumed"
  | "partial"
  | "failed";

export type FullMatchChainConsumptionResult = {
  readonly mode: FullMatchChainConsumptionMode;
  readonly status: FullMatchChainConsumptionStatus;
  readonly chainId?: string;
  readonly segmentLabel?: string;
  readonly consumedStepCount: number;
  readonly visualWorkbenchStepCount: number;
  readonly syntheticStepCount: number;
  readonly hybridStepCount: number;
  readonly spatialSelectionStepCount: number;
  readonly preservedActorStepCount: number;
  readonly preservedReceiverStepCount: number;
  readonly preservedActionTypeStepCount: number;
  readonly preservedBeforeStateStepCount: number;
  readonly preservedAfterStateStepCount: number;
  readonly finalPropagatedCarrierId?: string;
  readonly finalPropagatedZone?: string;
  readonly mismatchWarningCount: number;
  readonly warnings: readonly string[];
  readonly replay?: WorkbenchChainReplayResult;
  readonly scoreMutationCount: 0;
  readonly scoringEventsMutationCount: 0;
};

export function disabledFullMatchChainConsumption(): FullMatchChainConsumptionResult {
  return {
    mode: "disabled",
    status: "not_requested",
    consumedStepCount: 0,
    visualWorkbenchStepCount: 0,
    syntheticStepCount: 0,
    hybridStepCount: 0,
    spatialSelectionStepCount: 0,
    preservedActorStepCount: 0,
    preservedReceiverStepCount: 0,
    preservedActionTypeStepCount: 0,
    preservedBeforeStateStepCount: 0,
    preservedAfterStateStepCount: 0,
    mismatchWarningCount: 0,
    warnings: [],
    scoreMutationCount: 0,
    scoringEventsMutationCount: 0,
  };
}

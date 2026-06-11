import type { MatchInput } from "../../contracts/engineToCoach";
import { sequence1MultiActionChain } from "../grounding/fixtures/sequence1MultiAction.chain.fixture";
import { replayWorkbenchChain } from "../grounding/workbenchChainReplay";
import type { WorkbenchChain } from "../grounding/workbenchChainTypes";
import type { FullMatchRouteSelectionMode } from "./fullMatchRouteSelectionMode";
import {
  disabledFullMatchChainConsumption,
  type FullMatchChainConsumptionResult,
  type FullMatchChainConsumptionStatus,
} from "./fullMatchChainConsumption";

function consumptionStatus(replay: ReturnType<typeof replayWorkbenchChain>): FullMatchChainConsumptionStatus {
  const expectedSteps = 3;
  const fullyPreserved =
    replay.totalSteps === expectedSteps &&
    replay.visualWorkbenchStepCount === expectedSteps &&
    replay.syntheticStepCount === 0 &&
    replay.hybridStepCount === 0 &&
    replay.spatialSelectionStepCount === expectedSteps &&
    replay.preservedActorStepCount === expectedSteps &&
    replay.preservedReceiverStepCount === expectedSteps &&
    replay.preservedActionTypeStepCount === expectedSteps &&
    replay.preservedBeforeStateStepCount === expectedSteps &&
    replay.preservedAfterStateStepCount === expectedSteps &&
    replay.mismatchWarningCount === 0 &&
    replay.finalState.stateWarnings.length === 0;

  if (replay.steps.some((step) => !step.guardValid)) {
    return "failed";
  }

  return fullyPreserved ? "consumed" : "partial";
}

export function consumeWorkbenchChainForFullMatch(input: {
  readonly matchInput: MatchInput;
  readonly routeSelectionMode: FullMatchRouteSelectionMode;
  readonly segmentLabel: string;
  readonly chain?: WorkbenchChain;
}): FullMatchChainConsumptionResult {
  if (input.routeSelectionMode !== "workbench_chain_replay_experimental") {
    return disabledFullMatchChainConsumption();
  }

  const chain = input.chain ?? sequence1MultiActionChain;
  const replay = replayWorkbenchChain({
    matchInput: input.matchInput,
    chain,
    mode: "controlled_minimatch",
  });

  return {
    mode: "experimental_first_segment",
    status: consumptionStatus(replay),
    chainId: replay.chainId,
    segmentLabel: input.segmentLabel,
    consumedStepCount: replay.totalSteps,
    visualWorkbenchStepCount: replay.visualWorkbenchStepCount,
    syntheticStepCount: replay.syntheticStepCount,
    hybridStepCount: replay.hybridStepCount,
    spatialSelectionStepCount: replay.spatialSelectionStepCount,
    preservedActorStepCount: replay.preservedActorStepCount,
    preservedReceiverStepCount: replay.preservedReceiverStepCount,
    preservedActionTypeStepCount: replay.preservedActionTypeStepCount,
    preservedBeforeStateStepCount: replay.preservedBeforeStateStepCount,
    preservedAfterStateStepCount: replay.preservedAfterStateStepCount,
    finalPropagatedCarrierId: replay.finalState.ballCarrierId,
    finalPropagatedZone: replay.finalState.ballZone,
    mismatchWarningCount: replay.mismatchWarningCount,
    warnings: replay.finalState.stateWarnings,
    replay,
    scoreMutationCount: 0,
    scoringEventsMutationCount: 0,
  };
}

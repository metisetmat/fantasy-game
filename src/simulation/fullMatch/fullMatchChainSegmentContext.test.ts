import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { sequence1MultiActionChain } from "../grounding/fixtures/sequence1MultiAction.chain.fixture";
import { consumeWorkbenchChainForFullMatch } from "./consumeWorkbenchChainForFullMatch";
import { disabledFullMatchChainConsumption, type FullMatchChainConsumptionResult } from "./fullMatchChainConsumption";
import { chainConsumptionToSegmentContext } from "./fullMatchChainSegmentContext";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchChainSegmentContext(): readonly string[] {
  const matchInput = engineToCoachPublicContractFixtures.matchInputFixture;
  const disabled = chainConsumptionToSegmentContext(disabledFullMatchChainConsumption());
  const consumed = chainConsumptionToSegmentContext(consumeWorkbenchChainForFullMatch({
    matchInput,
    routeSelectionMode: "workbench_chain_replay_experimental",
    segmentLabel: "segment-1",
  }));
  const partial = chainConsumptionToSegmentContext(consumeWorkbenchChainForFullMatch({
    matchInput,
    routeSelectionMode: "workbench_chain_replay_experimental",
    segmentLabel: "segment-1",
    chain: {
      ...sequence1MultiActionChain,
      chainId: "sequence-1-multi-action-partial-context-test",
      steps: sequence1MultiActionChain.steps.map((step) =>
        step.stepIndex === 2 ? { ...step, expectedActorId: "control-hook-link" } : step,
      ),
    },
  }));
  const failedConsumption: FullMatchChainConsumptionResult = {
    ...disabledFullMatchChainConsumption(),
    mode: "experimental_first_segment",
    status: "failed",
    chainId: "failed-chain",
    segmentLabel: "segment-1",
    consumedStepCount: 3,
    visualWorkbenchStepCount: 3,
    spatialSelectionStepCount: 2,
    finalPropagatedCarrierId: "control-space-hunter",
    finalPropagatedZone: "Z4-HSR",
    warnings: ["guard failed"],
  };
  const failed = chainConsumptionToSegmentContext(failedConsumption);

  assertTest(disabled.status === "not_available", "not_requested consumption must map to not_available.");
  assertTest(disabled.source === "none", "not_available context source must be none.");
  assertTest(consumed.status === "available", "consumed chain must map to available context.");
  assertTest(consumed.source === "workbench_chain_consumption", "available context source must be chain consumption.");
  assertTest(consumed.finalCarrierId === "control-space-hunter", "available context final carrier must be SH.");
  assertTest(consumed.finalZone === "Z4-HSR", "available context final zone must be Z4-HSR.");
  assertTest(consumed.diagnosticOnly, "available context must be diagnostic-only.");
  assertTest(!consumed.canMutateScore, "segment context must not mutate score.");
  assertTest(!consumed.canMutateScoringEvents, "segment context must not mutate scoring events.");
  assertTest(consumed.tags.includes("workbench_chain_segment_context"), "context tag must be present.");
  assertTest(consumed.tags.includes("chain_final_carrier_control-space-hunter"), "final carrier tag must be present.");
  assertTest(consumed.tags.includes("chain_final_zone_Z4-HSR"), "final zone tag must be present.");
  assertTest(consumed.tags.includes("chain_consumed_steps_3"), "consumed steps tag must be present.");
  assertTest(consumed.tags.includes("chain_spatial_steps_3"), "spatial steps tag must be present.");
  assertTest(partial.status === "partial", "partial consumption must map to partial context.");
  assertTest(partial.confidence === "low", "partial context confidence must be low.");
  assertTest(failed.status === "failed", "failed consumption must map to failed context.");
  assertTest(failed.confidence === "low", "failed context confidence must be low.");

  return [
    "not_requested consumption maps to not_available context",
    "consumed chain consumption maps to available context",
    "available context exposes final carrier control-space-hunter",
    "available context exposes final zone Z4-HSR",
    "available context is diagnostic-only",
    "available context cannot mutate score",
    "available context cannot mutate scoring events",
    "chain segment context tags are present",
    "partial consumption maps to partial context",
    "failed consumption maps to failed context",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchChainSegmentContext();

  console.log("fullMatchChainSegmentContext tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

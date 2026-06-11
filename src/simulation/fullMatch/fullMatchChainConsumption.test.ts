import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { consumeWorkbenchChainForFullMatch } from "./consumeWorkbenchChainForFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchChainConsumption(): readonly string[] {
  const matchInput = engineToCoachPublicContractFixtures.matchInputFixture;
  const disabled = consumeWorkbenchChainForFullMatch({
    matchInput,
    routeSelectionMode: "segment_harness",
    segmentLabel: "segment-1",
  });
  const consumed = consumeWorkbenchChainForFullMatch({
    matchInput,
    routeSelectionMode: "workbench_chain_replay_experimental",
    segmentLabel: "segment-1",
  });

  assertTest(disabled.status === "not_requested", "segment_harness must return status not_requested.");
  assertTest(consumed.status === "consumed", "experimental mode must consume the visual chain.");
  assertTest(consumed.chainId === "sequence-1-multi-action-chain", "consumed chain id must be sequence-1-multi-action-chain.");
  assertTest(consumed.consumedStepCount === 3, "consumed step count must be 3.");
  assertTest(consumed.visualWorkbenchStepCount === 3, "visual step count must be 3.");
  assertTest(consumed.syntheticStepCount === 0, "synthetic step count must be 0.");
  assertTest(consumed.spatialSelectionStepCount === 3, "spatial selection step count must be 3.");
  assertTest(consumed.finalPropagatedCarrierId === "control-space-hunter", "final carrier must be control-space-hunter.");
  assertTest(consumed.finalPropagatedZone === "Z4-HSR", "final zone must be Z4-HSR.");
  assertTest(consumed.scoreMutationCount === 0, "scoreMutationCount must be 0.");
  assertTest(consumed.scoringEventsMutationCount === 0, "scoringEventsMutationCount must be 0.");
  assertTest(consumed.mismatchWarningCount === 0, "valid chain mismatch warning count must be 0.");

  return [
    "segment_harness returns status not_requested",
    "workbench_chain_replay_experimental consumes sequence-1-multi-action-chain",
    "consumed chain id is sequence-1-multi-action-chain",
    "consumed step count is 3",
    "visual step count is 3",
    "synthetic step count is 0",
    "spatial selection step count is 3",
    "final propagated carrier is control-space-hunter",
    "final propagated zone is Z4-HSR",
    "scoreMutationCount is 0",
    "scoringEventsMutationCount is 0",
    "mismatch warning count is 0 for valid chain",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchChainConsumption();

  console.log("fullMatchChainConsumption tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

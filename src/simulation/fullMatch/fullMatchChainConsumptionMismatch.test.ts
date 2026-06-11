import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { sequence1MultiActionChain } from "../grounding/fixtures/sequence1MultiAction.chain.fixture";
import { consumeWorkbenchChainForFullMatch } from "./consumeWorkbenchChainForFullMatch";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchChainConsumptionMismatch(): readonly string[] {
  const brokenChain = {
    ...sequence1MultiActionChain,
    chainId: "sequence-1-multi-action-broken-for-fullmatch-consumption",
    steps: sequence1MultiActionChain.steps.map((step) =>
      step.stepIndex === 2
        ? { ...step, expectedActorId: "control-hook-link" }
        : step,
    ),
  };
  const result = consumeWorkbenchChainForFullMatch({
    matchInput: engineToCoachPublicContractFixtures.matchInputFixture,
    routeSelectionMode: "workbench_chain_replay_experimental",
    segmentLabel: "segment-1",
    chain: brokenChain,
  });

  assertTest(result.status === "partial", "broken chain consumption must return partial.");
  assertTest(result.mismatchWarningCount > 0, "mismatch warnings must be exposed.");
  assertTest(result.warnings.some((warning) => warning.includes("WORKBENCH_CHAIN_BALL_CARRIER_MISMATCH")), "carrier mismatch warning must be present.");
  assertTest(result.replay?.recommendations.includes("CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED") ?? false, "fallback must remain observable.");
  assertTest(result.scoreMutationCount === 0, "scoreMutationCount must remain 0.");
  assertTest(result.scoringEventsMutationCount === 0, "scoringEventsMutationCount must remain 0.");

  return [
    "broken chain consumption returns partial",
    "mismatch warnings are exposed",
    "fallback does not hide mismatch",
    "scoreMutationCount remains 0",
    "scoringEventsMutationCount remains 0",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchChainConsumptionMismatch();

  console.log("fullMatchChainConsumptionMismatch tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

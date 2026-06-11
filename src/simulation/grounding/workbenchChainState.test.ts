import { sequence1Action1Chain } from "./fixtures/sequence1Action1.chain.fixture";
import { applyWorkbenchChainStep, createInitialWorkbenchChainState } from "./workbenchChainState";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateWorkbenchChainState(): readonly string[] {
  const initialState = createInitialWorkbenchChainState(sequence1Action1Chain);
  const step = sequence1Action1Chain.steps[0];

  assertTest(step !== undefined, "sequence-1-action-1 chain must contain one step.");
  if (step === undefined) {
    return [];
  }

  const afterState = applyWorkbenchChainStep({ state: initialState, step });
  const mismatchedState = applyWorkbenchChainStep({
    state: {
      ...initialState,
      ballCarrierId: "control-hook-link",
      ballZone: "Z5-C",
    },
    step,
  });

  assertTest(initialState.ballCarrierId === "control-tempo-half", "initial chain state must start with TH.");
  assertTest(initialState.ballZone === "Z4-HSL", "initial chain state must start in Z4-HSL.");
  assertTest(afterState.ballCarrierId === "control-mobile-lock", "chain step must update carrier to ML.");
  assertTest(afterState.ballZone === "Z3-HSL", "chain step must update ball zone to Z3-HSL.");
  assertTest(afterState.previousActionType === "SUPPORT_CLUSTER_RECYCLE", "chain step must store previous action type.");
  assertTest(afterState.stateWarnings.length === 0, "valid chain step must not create warnings.");
  assertTest(
    mismatchedState.stateWarnings.some((warning) => warning.includes("WORKBENCH_CHAIN_BALL_CARRIER_MISMATCH")),
    "carrier mismatch must create warning.",
  );
  assertTest(
    mismatchedState.stateWarnings.some((warning) => warning.includes("WORKBENCH_CHAIN_BALL_ZONE_MISMATCH")),
    "ball zone mismatch must create warning.",
  );
  assertTest(
    mismatchedState.stateWarnings.some((warning) => warning.includes("WORKBENCH_CHAIN_STATE_PROPAGATION_PARTIAL")),
    "mismatch must mark propagation partial.",
  );

  return [
    "initial chain state is created from sequence-1-action-1",
    "chain step updates TH to ML",
    "chain step updates Z4-HSL to Z3-HSL",
    "carrier mismatch creates warning",
    "zone mismatch creates warning",
  ];
}

if (require.main === module) {
  const checks = validateWorkbenchChainState();

  console.log("workbenchChainState tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

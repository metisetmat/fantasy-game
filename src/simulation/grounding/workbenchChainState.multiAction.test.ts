import { sequence1MultiActionChain } from "./fixtures/sequence1MultiAction.chain.fixture";
import { applyWorkbenchChainStep, createInitialWorkbenchChainState } from "./workbenchChainState";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateWorkbenchChainStateMultiAction(): readonly string[] {
  const initialState = createInitialWorkbenchChainState(sequence1MultiActionChain);
  const [step0, step1, step2] = sequence1MultiActionChain.steps;

  assertTest(step0 !== undefined && step1 !== undefined && step2 !== undefined, "multi-action chain must contain three steps.");
  if (step0 === undefined || step1 === undefined || step2 === undefined) {
    return [];
  }

  const afterStep0 = applyWorkbenchChainStep({ state: initialState, step: step0 });
  const afterStep1 = applyWorkbenchChainStep({ state: afterStep0, step: step1 });
  const afterStep2 = applyWorkbenchChainStep({ state: afterStep1, step: step2 });
  const mismatchStep1 = applyWorkbenchChainStep({
    state: {
      ...afterStep0,
      ballCarrierId: "control-hook-link",
      ballZone: "Z4-C",
    },
    step: step1,
  });

  assertTest(sequence1MultiActionChain.steps.length >= 2, "multi-action chain must have at least two steps.");
  assertTest(afterStep0.ballCarrierId === "control-mobile-lock", "Step 0 must propagate TH -> ML.");
  assertTest(afterStep0.ballZone === "Z3-HSL", "Step 0 must propagate Z4-HSL -> Z3-HSL.");
  assertTest(step1.expectedActorId === afterStep0.ballCarrierId, "Step 1 must consume ML from Step 0.");
  assertTest(step1.expectedBallZoneBefore === afterStep0.ballZone, "Step 1 must consume Step 0 zone.");
  assertTest(afterStep1.ballCarrierId === "control-playmaker", "Step 1 must propagate ML -> PM.");
  assertTest(step2.expectedActorId === afterStep1.ballCarrierId, "Step 2 must consume PM from Step 1.");
  assertTest(step2.expectedBallZoneBefore === afterStep1.ballZone, "Step 2 must consume Step 1 zone.");
  assertTest(afterStep2.ballCarrierId === sequence1MultiActionChain.finalExpectedBallCarrierId, "final carrier must match chain expectation.");
  assertTest(afterStep2.ballZone === sequence1MultiActionChain.finalExpectedBallZone, "final zone must match chain expectation.");
  assertTest(
    mismatchStep1.stateWarnings.some((warning) => warning.includes("WORKBENCH_CHAIN_BALL_CARRIER_MISMATCH")),
    "Step 1 carrier mismatch must create warning.",
  );
  assertTest(
    mismatchStep1.stateWarnings.some((warning) => warning.includes("WORKBENCH_CHAIN_BALL_ZONE_MISMATCH")),
    "Step 1 zone mismatch must create warning.",
  );
  assertTest(
    mismatchStep1.stateWarnings.some((warning) => warning.includes("WORKBENCH_CHAIN_STATE_PROPAGATION_PARTIAL")),
    "Step 1 mismatch must mark propagation partial.",
  );

  return [
    "multi-action chain initializes correctly",
    "Step 0 propagates TH -> ML",
    "Step 1 consumes propagated ML state",
    "Step 2 consumes propagated PM state",
    "final state matches expected carrier and zone",
    "Step 1 mismatch creates propagation warnings",
  ];
}

if (require.main === module) {
  const checks = validateWorkbenchChainStateMultiAction();

  console.log("workbenchChainState.multiAction tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

import { sequence1MultiActionChain } from "./fixtures/sequence1MultiAction.chain.fixture";
import { applyWorkbenchChainStep, createInitialWorkbenchChainState } from "./workbenchChainState";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateWorkbenchChainStateVisualMultiAction(): readonly string[] {
  const [step0, step1, step2] = sequence1MultiActionChain.steps;

  if (step0 === undefined || step1 === undefined || step2 === undefined) {
    throw new Error("visual multi-action chain must expose three steps.");
  }

  const initial = createInitialWorkbenchChainState(sequence1MultiActionChain);
  const afterStep0 = applyWorkbenchChainStep({ state: initial, step: step0 });
  const afterStep1 = applyWorkbenchChainStep({ state: afterStep0, step: step1 });
  const afterStep2 = applyWorkbenchChainStep({ state: afterStep1, step: step2 });

  assertTest(initial.ballCarrierId === "control-tempo-half" && initial.ballZone === "Z4-HSL", "initial state must start with TH at Z4-HSL.");
  assertTest(afterStep0.ballCarrierId === "control-mobile-lock" && afterStep0.ballZone === "Z3-HSL", "Step 0 must propagate TH -> ML and Z4-HSL -> Z3-HSL.");
  assertTest(afterStep0.ballCarrierId === step1.expectedActorId && afterStep0.ballZone === step1.expectedBallZoneBefore, "Step 1 must consume ML at Z3-HSL.");
  assertTest(afterStep1.ballCarrierId === "control-playmaker" && afterStep1.ballZone === "Z3-C", "Step 1 must propagate ML -> PM and Z3-HSL -> Z3-C.");
  assertTest(afterStep1.ballCarrierId === step2.expectedActorId && afterStep1.ballZone === step2.expectedBallZoneBefore, "Step 2 must consume PM at Z3-C.");
  assertTest(afterStep2.ballCarrierId === "control-space-hunter" && afterStep2.ballZone === "Z4-HSR", "Step 2 must propagate PM -> SH and Z3-C -> Z4-HSR.");
  assertTest(afterStep2.ballCarrierId === sequence1MultiActionChain.finalExpectedBallCarrierId, "final carrier must be SH.");
  assertTest(afterStep2.ballZone === sequence1MultiActionChain.finalExpectedBallZone, "final zone must be Z4-HSR.");
  assertTest(afterStep2.stateWarnings.length === 0, "valid visual chain must have zero propagation warnings.");

  return [
    "Step 0 propagates TH -> ML and Z4-HSL -> Z3-HSL",
    "Step 1 consumes ML and Z3-HSL",
    "Step 1 propagates ML -> PM and Z3-HSL -> Z3-C",
    "Step 2 consumes PM and Z3-C",
    "Step 2 propagates PM -> SH and Z3-C -> Z4-HSR",
    "final state is SH at Z4-HSR",
    "valid chain has zero propagation warnings",
  ];
}

if (require.main === module) {
  const checks = validateWorkbenchChainStateVisualMultiAction();

  console.log("workbenchChainState.visualMultiAction tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

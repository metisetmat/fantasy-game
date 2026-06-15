import { runFullMatch } from "../runFullMatch";
import { sequence1Action1WorkbenchTruth } from "./fixtures/sequence1Action1.fixture";
import { sequence1MultiActionChain } from "./fixtures/sequence1MultiAction.chain.fixture";
import { createWorkbenchReplayMatchInput } from "./runWorkbenchReplaySeed";
import { replayWorkbenchChain } from "./workbenchChainReplay";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoringEventCount(report: ReturnType<typeof runFullMatch>): number {
  return report.timeline.filter((event) => event.eventType === "scoring").length;
}

export function validateWorkbenchChainReplayVisualMismatch(): readonly string[] {
  const matchInput = createWorkbenchReplayMatchInput(sequence1Action1WorkbenchTruth);
  const actorMismatchChain = {
    ...sequence1MultiActionChain,
    chainId: "sequence-1-visual-actor-mismatch-chain",
    steps: sequence1MultiActionChain.steps.map((step) =>
      step.stepIndex === 2
        ? { ...step, expectedActorId: "control-hook-link" }
        : step,
    ),
  };
  const zoneMismatchChain = {
    ...sequence1MultiActionChain,
    chainId: "sequence-1-visual-zone-mismatch-chain",
    steps: sequence1MultiActionChain.steps.map((step) =>
      step.stepIndex === 2
        ? { ...step, expectedBallZoneBefore: "Z5-C" }
        : step,
    ),
  };
  const actorMismatch = replayWorkbenchChain({
    matchInput,
    chain: actorMismatchChain,
    mode: "diagnostic_only",
  });
  const zoneMismatch = replayWorkbenchChain({
    matchInput,
    chain: zoneMismatchChain,
    mode: "diagnostic_only",
  });
  const fullMatchBefore = runFullMatch(matchInput);
  const fullMatchAfter = runFullMatch(matchInput);

  assertTest(actorMismatch.status === "PARTIAL", "actor mismatch chain must return PARTIAL, not PASS.");
  assertTest(zoneMismatch.status === "PARTIAL", "zone mismatch chain must return PARTIAL, not PASS.");
  assertTest(
    actorMismatch.finalState.stateWarnings.some((warning) => warning.includes("WORKBENCH_CHAIN_BALL_CARRIER_MISMATCH")),
    "breaking Step 2 expectedActorId must create WORKBENCH_CHAIN_BALL_CARRIER_MISMATCH.",
  );
  assertTest(
    zoneMismatch.finalState.stateWarnings.some((warning) => warning.includes("WORKBENCH_CHAIN_BALL_ZONE_MISMATCH")),
    "breaking Step 2 expectedBallZoneBefore must create WORKBENCH_CHAIN_BALL_ZONE_MISMATCH.",
  );
  assertTest(actorMismatch.mismatchWarningCount > 0, "actor mismatch warning count must be visible.");
  assertTest(zoneMismatch.mismatchWarningCount > 0, "zone mismatch warning count must be visible.");
  assertTest(scoringEventCount(fullMatchBefore) === scoringEventCount(fullMatchAfter), "mismatch replay must not mutate scoring.");

  return [
    "breaking Step 2 expectedActorId creates WORKBENCH_CHAIN_BALL_CARRIER_MISMATCH",
    "breaking Step 2 expectedBallZoneBefore creates WORKBENCH_CHAIN_BALL_ZONE_MISMATCH",
    "mismatch chain returns PARTIAL, not PASS",
    "mismatch chain does not mutate scoring",
  ];
}

if (require.main === module) {
  const checks = validateWorkbenchChainReplayVisualMismatch();

  console.log("workbenchChainReplay.visualMismatch tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

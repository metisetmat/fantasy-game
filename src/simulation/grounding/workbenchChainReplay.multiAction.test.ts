import { runFullMatch } from "../runFullMatch";
import { createWorkbenchReplayMatchInput } from "./runWorkbenchReplaySeed";
import { sequence1MultiActionChain } from "./fixtures/sequence1MultiAction.chain.fixture";
import { sequence1Action1WorkbenchTruth } from "./fixtures/sequence1Action1.fixture";
import { replayWorkbenchChain } from "./workbenchChainReplay";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoringEventCount(report: ReturnType<typeof runFullMatch>): number {
  return report.timeline.filter((event) => event.eventType === "scoring").length;
}

export function validateWorkbenchChainReplayMultiAction(): readonly string[] {
  const matchInput = createWorkbenchReplayMatchInput(sequence1Action1WorkbenchTruth);
  const diagnostic = replayWorkbenchChain({
    matchInput,
    chain: sequence1MultiActionChain,
    mode: "diagnostic_only",
  });
  const controlled = replayWorkbenchChain({
    matchInput,
    chain: sequence1MultiActionChain,
    mode: "controlled_minimatch",
  });
  const mismatchChain = {
    ...sequence1MultiActionChain,
    chainId: "sequence-1-multi-action-mismatch-chain",
    steps: sequence1MultiActionChain.steps.map((step) =>
      step.stepIndex === 1
        ? { ...step, expectedActorId: "control-hook-link" }
        : step,
    ),
  };
  const mismatch = replayWorkbenchChain({
    matchInput,
    chain: mismatchChain,
    mode: "diagnostic_only",
  });
  const fullMatchBefore = runFullMatch(matchInput);
  const fullMatchAfter = runFullMatch(matchInput);

  assertTest(diagnostic.totalSteps === sequence1MultiActionChain.steps.length, "diagnostic_only must replay all chain steps.");
  assertTest(diagnostic.totalSteps >= 2, "multi-action replay must contain at least two steps.");
  assertTest(diagnostic.propagatedStepCount === diagnostic.totalSteps, "diagnostic_only must propagate every valid step.");
  assertTest(diagnostic.scoringEventsCreated === 0, "diagnostic_only must create no scoring events.");
  assertTest(diagnostic.finalState.ballCarrierId === sequence1MultiActionChain.finalExpectedBallCarrierId, "diagnostic replay final carrier must match expectation.");
  assertTest(diagnostic.finalState.ballZone === sequence1MultiActionChain.finalExpectedBallZone, "diagnostic replay final zone must match expectation.");
  assertTest(controlled.totalSteps === sequence1MultiActionChain.steps.length, "controlled_minimatch must attempt each chain step.");
  assertTest(controlled.spatialSelectionStepCount >= 1, "controlled_minimatch must expose spatial_candidate_modifier for at least one step.");
  assertTest(controlled.spatialSelectionUsed, "controlled_minimatch must use spatial selection.");
  assertTest(controlled.recommendations.includes("CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED"), "prototype fallback must remain visible.");
  assertTest(diagnostic.finalState.stateWarnings.length === 0, "valid multi-step replay must have no propagation warnings.");
  assertTest(mismatch.status === "PARTIAL", "mismatch diagnostic replay must return PARTIAL, not PASS.");
  assertTest(mismatch.mismatchWarningCount > 0, "mismatch replay must count mismatch warnings.");
  assertTest(scoringEventCount(fullMatchBefore) === scoringEventCount(fullMatchAfter), "mismatch chain replay must not alter scoring events.");

  return [
    "diagnostic_only replays all multi-action steps",
    "diagnostic_only creates 0 scoring events",
    "controlled_minimatch attempts every chain step",
    "controlled_minimatch exposes spatial_candidate_modifier",
    "prototype fallback remains visible",
    "valid multi-step replay has no warnings",
    "mismatch chain replay returns PARTIAL",
    "mismatch chain does not alter scoring events",
  ];
}

if (require.main === module) {
  const checks = validateWorkbenchChainReplayMultiAction();

  console.log("workbenchChainReplay.multiAction tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

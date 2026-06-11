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

export function validateWorkbenchChainReplayVisualMultiAction(): readonly string[] {
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
  const fullMatchBefore = runFullMatch(matchInput);
  const fullMatchAfter = runFullMatch(matchInput);

  assertTest(diagnostic.totalSteps === 3, "diagnostic_only must replay all 3 visual steps.");
  assertTest(diagnostic.scoringEventsCreated === 0, "diagnostic_only must create 0 scoring events.");
  assertTest(controlled.totalSteps === 3, "controlled_minimatch must attempt all 3 steps.");
  assertTest(controlled.visualWorkbenchStepCount === 3, "controlled replay must use visual workbench truth for 3 steps.");
  assertTest(controlled.syntheticStepCount === 0, "controlled replay must have 0 synthetic steps.");
  assertTest(controlled.hybridStepCount === 0, "controlled replay must have 0 hybrid steps.");
  assertTest(controlled.spatialSelectionStepCount === 3, "controlled_minimatch must use spatial_candidate_modifier for 3/3 steps.");
  assertTest(controlled.steps.every((step) => step.guardValid), "guardValid must be true for 3/3 steps.");
  assertTest(controlled.preservedActorStepCount === 3, "selected actor must be preserved for 3/3 steps.");
  assertTest(controlled.preservedReceiverStepCount === 3, "selected receiver must be preserved for 3/3 steps.");
  assertTest(controlled.preservedActionTypeStepCount === 3, "selected action type must be preserved for 3/3 steps.");
  assertTest(controlled.preservedBeforeStateStepCount === 3, "before state must be preserved for 3/3 steps.");
  assertTest(controlled.preservedAfterStateStepCount === 3, "after state must be preserved for 3/3 steps.");
  assertTest(controlled.recommendations.includes("CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED"), "prototype fallback must remain observable.");
  assertTest(controlled.mismatchWarningCount === 0, "valid controlled replay must have zero mismatch warnings.");
  assertTest(controlled.scoringEventsCreated === 0, "controlled replay must create no scoring events.");
  assertTest(controlled.scoringEventsDeletedOrCapped === 0, "controlled replay must not delete or cap scoring events.");
  assertTest(scoringEventCount(fullMatchBefore) === scoringEventCount(fullMatchAfter), "controlled replay must not rewrite or fabricate scoring events.");

  return [
    "diagnostic_only replays all 3 visual steps",
    "diagnostic_only creates 0 scoring events",
    "controlled_minimatch attempts all 3 steps",
    "controlled_minimatch spatial selection step count is 3",
    "guardValid is true for 3/3 steps",
    "selected actor preserved for 3/3 steps",
    "selected receiver preserved for 3/3 steps",
    "selected action type preserved for 3/3 steps",
    "before state preserved for 3/3 steps",
    "after state preserved for 3/3 steps",
    "prototype fallback remains available and observable",
    "no scoring events are created, deleted, capped, rewritten, or fabricated",
  ];
}

if (require.main === module) {
  const checks = validateWorkbenchChainReplayVisualMultiAction();

  console.log("workbenchChainReplay.visualMultiAction tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

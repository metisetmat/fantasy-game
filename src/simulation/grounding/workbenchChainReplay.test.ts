import { scoringRegistryEntry } from "../../systems/scoring";
import { runFullMatch } from "../runFullMatch";
import { createWorkbenchReplayMatchInput } from "./runWorkbenchReplaySeed";
import { sequence1Action1Chain } from "./fixtures/sequence1Action1.chain.fixture";
import { sequence1Action1WorkbenchTruth } from "./fixtures/sequence1Action1.fixture";
import { replayWorkbenchChain, validateWorkbenchChainScoringConstants } from "./workbenchChainReplay";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function scoreSignature(input: ReturnType<typeof runFullMatch>): string {
  return `${input.score.home}-${input.score.away}:${input.timeline.filter((event) => event.eventType === "scoring").length}`;
}

export function validateWorkbenchChainReplay(): readonly string[] {
  const matchInput = createWorkbenchReplayMatchInput(sequence1Action1WorkbenchTruth);
  const diagnostic = replayWorkbenchChain({
    matchInput,
    chain: sequence1Action1Chain,
    mode: "diagnostic_only",
  });
  const controlled = replayWorkbenchChain({
    matchInput,
    chain: sequence1Action1Chain,
    mode: "controlled_minimatch",
  });
  const wrongExpectedAction = replayWorkbenchChain({
    matchInput,
    chain: {
      ...sequence1Action1Chain,
      chainId: "sequence-1-action-1-wrong-expected-action-chain",
      steps: sequence1Action1Chain.steps.map((step) => ({
        ...step,
        expectedReceiverId: "control-hook-link",
      })),
    },
    mode: "controlled_minimatch",
  });
  const fullMatchBefore = runFullMatch(matchInput);
  const warningOnly = replayWorkbenchChain({
    matchInput,
    chain: sequence1Action1Chain,
    mode: "fullmatch_warning_only",
  });
  const fullMatchAfter = runFullMatch(matchInput);

  assertTest(diagnostic.scoringEventsCreated === 0, "diagnostic_only must create no scoring events.");
  assertTest(diagnostic.scoringEventsDeletedOrCapped === 0, "diagnostic_only must delete or cap no scoring events.");
  assertTest(diagnostic.finalState.ballCarrierId === "control-mobile-lock", "diagnostic replay must propagate final carrier ML.");
  assertTest(diagnostic.finalState.ballZone === "Z3-HSL", "diagnostic replay must propagate final zone Z3-HSL.");
  assertTest(controlled.spatialSelectionUsed, "controlled_minimatch must use spatial_candidate_modifier.");
  assertTest(controlled.steps[0]?.routeSelectionSource === "spatial_candidate_modifier", "controlled step must expose spatial route selection source.");
  assertTest(controlled.steps[0]?.preservedExpectedAction === true, "controlled chain replay must preserve TH -> ML.");
  assertTest(wrongExpectedAction.steps[0]?.guardValid === true, "wrong expected-action replay must still have a valid route-selection guard.");
  assertTest(wrongExpectedAction.steps[0]?.preservedExpectedAction === false, "wrong expected-action replay must expose action mismatch.");
  assertTest(wrongExpectedAction.status === "FAIL", "controlled replay must fail when selected route does not preserve expected chain action.");
  assertTest(diagnostic.prototypeFallbackUsed, "diagnostic replay must keep prototype fallback observable.");
  assertTest(
    controlled.recommendations.includes("CONFIRM_PROTOTYPE_FALLBACK_STILL_ENABLED"),
    "controlled replay must keep prototype fallback recommendation visible.",
  );
  assertTest(warningOnly.mode === "fullmatch_warning_only", "fullmatch warning-only mode must be explicit.");
  assertTest(warningOnly.status === "PARTIAL", "fullmatch warning-only replay must stay PARTIAL.");
  assertTest(
    scoreSignature(fullMatchBefore) === scoreSignature(fullMatchAfter),
    "fullmatch_warning_only diagnostics must not alter runFullMatch score.",
  );
  assertTest(scoringRegistryEntry("SHOT_GOAL").points === 3, "SHOT_GOAL must remain 3.");
  assertTest(scoringRegistryEntry("TRY_TOUCHDOWN").points === 5, "TRY_TOUCHDOWN must remain 5.");
  assertTest(scoringRegistryEntry("CONVERSION_GOAL").points === 2, "CONVERSION_GOAL must remain 2.");
  assertTest(scoringRegistryEntry("DROP_GOAL").points === 2, "DROP_GOAL must remain 2.");
  assertTest(!scoringRegistryEntry("PENALTY_SHOT").active, "PENALTY_SHOT must remain inactive.");
  assertTest(
    validateWorkbenchChainScoringConstants().includes("PENALTY_SHOT_ACTIVE=NO"),
    "chain scoring constants helper must expose inactive penalty shot.",
  );

  return [
    "diagnostic_only creates no scoring events",
    "diagnostic replay propagates TH to ML",
    "diagnostic replay propagates Z4-HSL to Z3-HSL",
    "controlled_minimatch uses spatial_candidate_modifier",
    "controlled_minimatch preserves TH -> ML",
    "controlled_minimatch fails when expected chain action is not preserved",
    "prototype fallback remains enabled",
    "fullmatch_warning_only does not alter runFullMatch score",
    "scoring constants remain unchanged",
  ];
}

if (require.main === module) {
  const checks = validateWorkbenchChainReplay();

  console.log("workbenchChainReplay tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchControlledSegmentReplayComparisonSignature } from "./fullMatchControlledSegmentReplayComparisonSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalControlledSegmentReplayComparison(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = fullMatchControlledSegmentReplayComparisonSignature(defaultReport);
  const experimentalSignature = fullMatchControlledSegmentReplayComparisonSignature(experimentalReport);
  const comparisonFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_REPLAY_COMPARISON"
  );
  const diagnosis = experimentalReport.tacticalReport.diagnoses.find((candidate) =>
    candidate.summary.includes("deux replays controles du premier segment")
  );
  const visibleText = [
    ...experimentalReport.tacticalReport.diagnoses.map((item) => item.summary),
    ...experimentalReport.warnings.map((item) => item.coachSummary),
  ].join("\n");

  assertTest(defaultSignature.controlledReplayComparisonTagCount === 0, "default runFullMatch must not expose controlled replay comparison tags.");
  assertTest(experimentalSignature.isolatedOverrideExperimentTagCount > 0, "experimental runFullMatch must still expose isolated override experiment tags.");
  assertTest(experimentalSignature.controlledReplayComparisonTagCount > 0, "experimental runFullMatch must expose controlled replay comparison tags.");
  assertTest(experimentalSignature.baselineCandidateId === "chain-context-safe-recycle-pv", "controlled replay signature must expose baseline candidate.");
  assertTest(experimentalSignature.baselineActionType === "SAFE_RECYCLE", "controlled replay signature must expose baseline action.");
  assertTest(experimentalSignature.baselineReceiverId === "control-pivot", "controlled replay signature must expose baseline receiver.");
  assertTest(experimentalSignature.baselineTargetZone === "Z2-HSL", "controlled replay signature must expose baseline target zone.");
  assertTest(experimentalSignature.overrideCandidateId === "chain-context-forward-progress-sh", "controlled replay signature must expose override candidate.");
  assertTest(experimentalSignature.overrideActionType === "FORWARD_PROGRESS", "controlled replay signature must expose override action.");
  assertTest(experimentalSignature.overrideReceiverId === "control-space-hunter", "controlled replay signature must expose override receiver.");
  assertTest(experimentalSignature.overrideTargetZone === "Z4-HSR", "controlled replay signature must expose override target zone.");
  assertTest(experimentalSignature.selectionDivergenceObserved, "controlled replay comparison must expose selection divergence.");
  assertTest(experimentalSignature.zoneProgressionDivergenceObserved, "controlled replay comparison must expose zone progression divergence.");
  assertTest(experimentalSignature.dangerCreationDivergenceObserved, "controlled replay comparison must expose danger creation divergence.");
  assertTest(!experimentalSignature.scoreDivergenceObserved, "controlled replay comparison must not claim score divergence.");
  assertTest(!experimentalSignature.scoringEventDivergenceObserved, "controlled replay comparison must not claim scoring event divergence.");
  assertTest(experimentalSignature.replayAppliedOnlyInIsolatedComparison, "controlled replay comparison must be isolated-only.");
  assertTest(!experimentalSignature.replayAppliedToNormalLiveSelection, "controlled replay comparison must not apply to normal live selection.");
  assertTest(comparisonFact !== undefined, "experimental report must include controlled segment replay comparison evidence.");
  assertTest(comparisonFact?.internalTags.includes("controlled_replay_applied_only_in_isolated_comparison_true") ?? false, "controlled replay evidence must say isolated-only.");
  assertTest(comparisonFact?.internalTags.includes("controlled_replay_applied_to_normal_live_false") ?? false, "controlled replay evidence must say not applied to normal live selection.");
  assertTest(comparisonFact?.internalTags.includes("controlled_replay_global_economy_claim_forbidden") ?? false, "controlled replay evidence must forbid global economy claims.");
  assertTest(diagnosis !== undefined, "experimental coach diagnosis must mention controlled segment replay comparison.");
  assertTest(diagnosis?.summary.includes("elle ne modifie pas le full-match normal") ?? false, "coach diagnosis must say normal full-match is unchanged.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_APPLIED_ONLY_IN_ISOLATED_COMPARISON"), "limitations must say isolated-only comparison.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_REPLAY_COMPARISON_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION"), "limitations must say not applied to normal live selection.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "experimental report must not claim production chain-driven full-match.");
  assertTest(!visibleText.includes("resolution live du simulation"), "coach copy must not contain stale wording resolution live du simulation.");
  assertTest(!visibleText.includes("simulation experimental"), "coach copy must not contain stale wording simulation experimental.");

  return [
    "default runFullMatch has no controlled replay comparison tags",
    "experimental runFullMatch has controlled replay comparison tags",
    "experimental report includes controlled replay comparison evidence",
    "experimental coach diagnosis mentions controlled segment replay comparison",
    "experimental report says comparison is isolated",
    "experimental report says comparison is not applied to normal live selection",
    "experimental report says normal full-match is unchanged",
    "normal full-match is not claimed as production chain-driven",
    "coach copy avoids stale wording",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalControlledSegmentReplayComparison();

  console.log("runFullMatchExperimentalControlledSegmentReplayComparison tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

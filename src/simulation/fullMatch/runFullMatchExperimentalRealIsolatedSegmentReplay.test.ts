import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchRealIsolatedSegmentReplaySignature } from "./fullMatchRealIsolatedSegmentReplaySignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalRealIsolatedSegmentReplay(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = fullMatchRealIsolatedSegmentReplaySignature(defaultReport);
  const experimentalSignature = fullMatchRealIsolatedSegmentReplaySignature(experimentalReport);
  const replayFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_REAL_ISOLATED_SEGMENT_REPLAY"
  );
  const diagnosis = experimentalReport.tacticalReport.diagnoses.find((candidate) =>
    candidate.summary.includes("vrais evenements de replay isole")
  );
  const visibleText = [
    ...experimentalReport.tacticalReport.diagnoses.map((item) => item.summary),
    ...experimentalReport.warnings.map((item) => item.coachSummary),
  ].join("\n");

  assertTest(defaultSignature.realIsolatedReplayTagCount === 0, "default runFullMatch must not expose real isolated replay tags.");
  assertTest(experimentalSignature.realIsolatedReplayTagCount > 0, "experimental runFullMatch must expose real isolated replay tags.");
  assertTest(experimentalSignature.officialIsolatedReplayEventCount === 0, "isolated replay events must not be inserted as official MatchEvents.");
  assertTest(experimentalSignature.baselineCandidateId === "chain-context-safe-recycle-pv", "real replay signature must expose baseline candidate.");
  assertTest(experimentalSignature.baselineActionType === "SAFE_RECYCLE", "real replay signature must expose baseline action.");
  assertTest(experimentalSignature.baselineReceiverId === "control-pivot", "real replay signature must expose baseline receiver.");
  assertTest(experimentalSignature.baselineTargetZone === "Z2-HSL", "real replay signature must expose baseline target zone.");
  assertTest(experimentalSignature.baselineEventCount > 0, "real replay signature must expose baseline event count.");
  assertTest(experimentalSignature.overrideCandidateId === "chain-context-forward-progress-sh", "real replay signature must expose override candidate.");
  assertTest(experimentalSignature.overrideActionType === "FORWARD_PROGRESS", "real replay signature must expose override action.");
  assertTest(experimentalSignature.overrideReceiverId === "control-space-hunter", "real replay signature must expose override receiver.");
  assertTest(experimentalSignature.overrideTargetZone === "Z4-HSR", "real replay signature must expose override target zone.");
  assertTest(experimentalSignature.overrideEventCount > 0, "real replay signature must expose override event count.");
  assertTest(experimentalSignature.selectionDivergenceObserved, "real replay must expose selection divergence.");
  assertTest(experimentalSignature.carrierDivergenceObserved, "real replay must expose carrier divergence.");
  assertTest(experimentalSignature.zoneProgressionDivergenceObserved, "real replay must expose zone progression divergence.");
  assertTest(experimentalSignature.dangerCreationDivergenceObserved, "real replay must expose danger creation divergence.");
  assertTest(experimentalSignature.isolatedTimelineDivergenceObserved, "real replay must expose isolated timeline divergence.");
  assertTest(experimentalSignature.replayAppliedOnlyInIsolatedEngine, "real replay must be isolated-only.");
  assertTest(!experimentalSignature.replayAppliedToNormalLiveSelection, "real replay must not apply to normal live selection.");
  assertTest(replayFact !== undefined, "experimental report must include real isolated replay evidence.");
  assertTest(replayFact?.internalTags.includes("real_isolated_replay_applied_only_in_isolated_engine_true") ?? false, "real replay evidence must say isolated-only.");
  assertTest(replayFact?.internalTags.includes("real_isolated_replay_official_timeline_injection_forbidden") ?? false, "real replay evidence must forbid official timeline injection.");
  assertTest(diagnosis !== undefined, "experimental coach diagnosis must mention real isolated replay events.");
  assertTest(diagnosis?.summary.includes("ne sont pas des MatchEvents officiels") ?? false, "coach diagnosis must say isolated events are not official MatchEvents.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_EVENTS_EXPERIMENTAL_ONLY"), "limitations must say isolated events are experimental-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_REAL_ISOLATED_SEGMENT_REPLAY_EVENTS_NOT_INSERTED_IN_OFFICIAL_TIMELINE"), "limitations must say isolated events are not inserted in official timeline.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "experimental report must not claim production chain-driven full-match.");
  assertTest(!visibleText.includes("resolution live du simulation"), "coach copy must not contain stale wording resolution live du simulation.");
  assertTest(!visibleText.includes("simulation experimental"), "coach copy must not contain stale wording simulation experimental.");

  return [
    "default runFullMatch has no real isolated replay tags",
    "experimental runFullMatch has real isolated replay tags",
    "experimental report includes real isolated replay evidence",
    "experimental coach diagnosis mentions real isolated replay events",
    "experimental report says isolated events are experimental-only",
    "experimental report says isolated events are not inserted into official timeline",
    "experimental report says official full-match is unchanged",
    "normal full-match is not claimed as production chain-driven",
    "coach copy avoids stale wording",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalRealIsolatedSegmentReplay();

  console.log("runFullMatchExperimentalRealIsolatedSegmentReplay tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

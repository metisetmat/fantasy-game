import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { sandboxSequenceReplaySignature } from "./sandboxSequenceReplaySignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalSandboxSequenceReplay(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = sandboxSequenceReplaySignature(defaultReport);
  const experimentalSignature = sandboxSequenceReplaySignature(experimentalReport);
  const replayFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_SANDBOX_SEQUENCE_REPLAY"
  );
  const visibleText = [
    ...experimentalReport.tacticalReport.diagnoses.map((item) => item.summary),
    ...experimentalReport.warnings.map((item) => item.coachSummary),
  ].join("\n");

  assertTest(defaultSignature.tagCount === 0, "default runFullMatch must not expose sandbox sequence replay tags.");
  assertTest(experimentalSignature.tagCount > 0, "experimental runFullMatch must expose sandbox sequence replay tags.");
  assertTest(experimentalSignature.officialSandboxEventCount === 0, "sandbox sequence replay must not be inserted as official MatchEvent.");
  assertTest(experimentalSignature.status === "available", "sandbox sequence replay model status must be available.");
  assertTest(experimentalSignature.origin === "multi_action_continuation_sandbox", "sandbox sequence replay origin mismatch.");
  assertTest(experimentalSignature.baselineStepCount === "9", "baseline sequence step count must be 9.");
  assertTest(experimentalSignature.overrideStepCount === "9", "override sequence step count must be 9.");
  assertTest(experimentalSignature.baselineStepTypes?.includes("BASELINE_ROUTE_REFERENCE") ?? false, "baseline path must include route reference.");
  assertTest(experimentalSignature.baselineStepTypes?.includes("NO_CONTINUATION") ?? false, "baseline path must include no-continuation step.");
  assertTest(experimentalSignature.overrideStepTypes?.includes("CONTROLLED_ROUTE_RESOLVED") ?? false, "override path must include route resolution.");
  assertTest(experimentalSignature.overrideStepTypes?.includes("SCORING_OPPORTUNITY_CLASSIFIED") ?? false, "override path must include scoring opportunity.");
  assertTest(experimentalSignature.overrideStepTypes?.includes("SCORING_EVENT_CANDIDATE_CREATED") ?? false, "override path must include scoring candidate.");
  assertTest(experimentalSignature.overrideStepTypes?.includes("SHOT_RESOLVED") ?? false, "override path must include shot resolution.");
  assertTest(experimentalSignature.overrideStepTypes?.includes("GOALKEEPER_RESPONSE_RESOLVED") ?? false, "override path must include goalkeeper response.");
  assertTest(experimentalSignature.overrideStepTypes?.includes("REBOUND_STATE_RESOLVED") ?? false, "override path must include rebound state.");
  assertTest(experimentalSignature.overrideStepTypes?.includes("CONTINUATION_ACTION_RESOLVED") ?? false, "override path must include continuation action.");
  assertTest(experimentalSignature.baselineFinalOutcome === "none", "baseline final outcome must remain none.");
  assertTest(experimentalSignature.overrideFinalOutcome === "secured_by_goalkeeper_team", "override final outcome mismatch.");
  assertTest(experimentalSignature.overrideFinalTeamCandidate === "goalkeeper_team", "override final team mismatch.");
  assertTest(experimentalSignature.overrideFinalActorCandidate === "blitz-goalkeeper-free-safety", "override final actor mismatch.");
  assertTest(experimentalSignature.overrideFinalZoneCandidate === "Z3-HSR", "override final zone mismatch.");
  assertTest(experimentalSignature.sequenceStepCountDivergenceObserved === "false", "equal 9-step paths must not diverge by count.");
  assertTest(experimentalSignature.sequenceOutcomeDivergenceObserved === "true", "sequence outcome divergence must be observed.");
  assertTest(experimentalSignature.sequenceFinalTeamDivergenceObserved === "true", "sequence final team divergence must be observed.");
  assertTest(experimentalSignature.sequenceFinalZoneDivergenceObserved === "true", "sequence final zone divergence must be observed.");
  assertTest(experimentalSignature.modelAppliedOnlyInSandbox === "true", "model must apply only in sandbox.");
  assertTest(experimentalSignature.modelAppliedToNormalLiveSelection === "false", "model must not apply to normal live selection.");
  assertTest(experimentalSignature.sandboxContinuationCreatedCount === 1, "one sandbox continuation should be created.");
  assertTest(replayFact !== undefined, "experimental report must include sandbox sequence replay evidence.");
  assertTest(replayFact?.internalTags.includes("sandbox_sequence_official_timeline_injection_forbidden") ?? false, "evidence must forbid official timeline injection.");
  assertTest(visibleText.includes("mini-sequence sandbox"), "coach diagnosis must mention mini-sequence sandbox.");
  assertTest(visibleText.includes("aucune mutation de timeline officielle"), "coach diagnosis must say no official timeline mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SANDBOX_SEQUENCE_REPLAY_RESULTS_ISOLATED_ONLY"), "limitations must say sequence replay result is isolated-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "normal full-match must not be claimed as production chain-driven.");

  return [
    "default runFullMatch has no sandbox sequence replay tags",
    "experimental runFullMatch has sandbox sequence replay tags",
    "experimental report includes sandbox sequence replay evidence",
    "baseline and override paths both expose 9 typed steps",
    "override path ends with goalkeeper-team secure recovery",
    "sandbox sequence replay remains isolated-only and not official",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalSandboxSequenceReplay();

  console.log("runFullMatchExperimentalSandboxSequenceReplay tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

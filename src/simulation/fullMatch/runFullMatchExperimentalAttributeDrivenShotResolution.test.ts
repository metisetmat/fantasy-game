import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { attributeDrivenShotResolutionSignature } from "./attributeDrivenShotResolutionSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalAttributeDrivenShotResolution(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = attributeDrivenShotResolutionSignature(defaultReport);
  const experimentalSignature = attributeDrivenShotResolutionSignature(experimentalReport);
  const attributeFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX"
  );
  const visibleText = [
    ...experimentalReport.tacticalReport.diagnoses.map((item) => item.summary),
    ...experimentalReport.warnings.map((item) => item.coachSummary),
  ].join("\n");

  assertTest(defaultSignature.tagCount === 0, "default runFullMatch must not expose attribute-driven shot tags.");
  assertTest(experimentalSignature.tagCount > 0, "experimental runFullMatch must expose attribute-driven shot tags.");
  assertTest(experimentalSignature.officialSandboxEventCount === 0, "attribute-driven shot resolution must not be inserted as official MatchEvent.");
  assertTest(experimentalSignature.status === "available", "attribute-driven shot model status must be available.");
  assertTest(experimentalSignature.origin === "sandbox_scoring_event_resolution", "attribute-driven shot model origin mismatch.");
  assertTest(experimentalSignature.baselineOutcome === "NO_SCORE_ATTEMPT", "baseline outcome mismatch.");
  assertTest(experimentalSignature.baselineShotAttemptCreated === "false", "baseline shot attempt must be false.");
  assertTest(experimentalSignature.baselineShotQuality === "0", "baseline shot quality must be 0.");
  assertTest(experimentalSignature.overrideSourceCandidateType === "SHOT_CANDIDATE", "override source candidate mismatch.");
  assertTest(experimentalSignature.overrideShooterId === "control-space-hunter", "override shooter mismatch.");
  assertTest(experimentalSignature.overrideGoalkeeperId === "blitz-goalkeeper-free-safety", "override goalkeeper mismatch.");
  assertTest(Number(experimentalSignature.overrideAdjustedShotQuality ?? "0") > 0, "override adjusted shot quality must be populated.");
  assertTest(Number(experimentalSignature.overrideGoalkeeperQuality ?? "0") > 0, "override goalkeeper quality must be populated.");
  assertTest(["SHOT_ON_TARGET", "SAVED_BY_GK", "SHOT_OFF_TARGET", "SHOT_BLOCKED", "SANDBOX_GOAL_CANDIDATE", "NO_SCORE"].includes(experimentalSignature.overrideOutcome ?? ""), "override outcome must be allowed.");
  assertTest(experimentalSignature.attributeInfluenceObserved === "true", "attribute influence must be observed.");
  assertTest(experimentalSignature.outcomeDivergenceObserved === "true", "outcome divergence must be observed.");
  assertTest(experimentalSignature.shotQualityDivergenceObserved === "true", "shot quality divergence must be observed.");
  assertTest(experimentalSignature.sandboxScoringEventDivergenceObserved === "false", "sandbox scoring event divergence must remain false.");
  assertTest(experimentalSignature.sandboxScoreDivergenceObserved === "false", "sandbox score divergence must remain false.");
  assertTest(experimentalSignature.modelAppliedOnlyInSandbox === "true", "model must apply only in sandbox.");
  assertTest(experimentalSignature.modelAppliedToNormalLiveSelection === "false", "model must not apply to normal live selection.");
  assertTest(attributeFact !== undefined, "experimental report must include attribute-driven shot evidence.");
  assertTest(attributeFact?.internalTags.includes("attribute_driven_shot_production_scoring_event_creation_forbidden") ?? false, "evidence must forbid production scoring event creation.");
  assertTest(visibleText.includes("resolution attributaire de tir sandbox"), "coach diagnosis must mention attribute-driven shot resolution.");
  assertTest(visibleText.includes("aucun MatchEvent officiel"), "coach diagnosis must say attribute-driven shot resolution is not official.");
  assertTest(visibleText.includes("aucun score_change"), "coach diagnosis must say no score_change is created.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_ATTRIBUTE_DRIVEN_SHOT_RESOLUTION_SANDBOX_RESULTS_ISOLATED_ONLY"), "limitations must say attribute-driven result is isolated-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "normal full-match must not be claimed as production chain-driven.");
  assertTest(!visibleText.includes("rÃƒÆ’Ã‚Â©solution live du simulation"), "coach copy must not contain stale wording resolution live du simulation.");
  assertTest(!visibleText.includes("simulation experimental"), "coach copy must not contain stale wording simulation experimental.");

  return [
    "default runFullMatch has no attribute-driven shot tags",
    "experimental runFullMatch has attribute-driven shot tags",
    "experimental report includes attribute-driven shot evidence",
    "experimental coach diagnosis mentions attribute-driven shot resolution",
    "experimental report says attribute-driven shot resolution is isolated-only and not official",
    "normal full-match is not claimed as production chain-driven",
    "coach copy avoids stale wording",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalAttributeDrivenShotResolution();

  console.log("runFullMatchExperimentalAttributeDrivenShotResolution tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

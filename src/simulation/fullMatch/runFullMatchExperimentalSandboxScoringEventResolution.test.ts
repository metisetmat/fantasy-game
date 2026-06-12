import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { sandboxScoringEventResolutionSignature } from "./sandboxScoringEventResolutionSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalSandboxScoringEventResolution(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = sandboxScoringEventResolutionSignature(defaultReport);
  const experimentalSignature = sandboxScoringEventResolutionSignature(experimentalReport);
  const resolutionFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_RESOLUTION"
  );
  const visibleText = [
    ...experimentalReport.tacticalReport.diagnoses.map((item) => item.summary),
    ...experimentalReport.warnings.map((item) => item.coachSummary),
  ].join("\n");

  assertTest(defaultSignature.resolutionTagCount === 0, "default runFullMatch must not expose sandbox resolution tags.");
  assertTest(experimentalSignature.resolutionTagCount > 0, "experimental runFullMatch must expose sandbox resolution tags.");
  assertTest(experimentalSignature.officialSandboxResolutionEventCount === 0, "sandbox resolution must not be inserted as official MatchEvent.");
  assertTest(experimentalSignature.baselineCandidateId === "chain-context-safe-recycle-pv", "baseline candidate mismatch.");
  assertTest(experimentalSignature.baselineSourceScoringCandidateType === "NO_SCORING_EVENT", "baseline source candidate mismatch.");
  assertTest(experimentalSignature.baselineResolutionType === "NO_SCORE_ATTEMPT", "baseline resolution mismatch.");
  assertTest(!experimentalSignature.baselineShotAttemptCreated, "baseline shot attempt must be false.");
  assertTest(experimentalSignature.baselineShotQuality === 0, "baseline shot quality must be 0.");
  assertTest(experimentalSignature.baselineGoalkeeperResponse === "not_applicable", "baseline goalkeeper response mismatch.");
  assertTest(experimentalSignature.overrideCandidateId === "chain-context-forward-progress-sh", "override candidate mismatch.");
  assertTest(experimentalSignature.overrideSourceScoringCandidateType === "SHOT_CANDIDATE", "override source candidate mismatch.");
  assertTest(["SHOT_ON_TARGET", "SAVED_BY_GK"].includes(experimentalSignature.overrideResolutionType ?? ""), "override resolution must be sandbox shot result.");
  assertTest(experimentalSignature.overrideShotAttemptCreated, "override shot attempt must be true.");
  assertTest(experimentalSignature.overrideShotQuality > experimentalSignature.baselineShotQuality, "override shot quality must exceed baseline.");
  assertTest(experimentalSignature.scoringResolutionTypeDivergenceObserved, "resolution divergence must be observed.");
  assertTest(experimentalSignature.shotAttemptCreationDivergenceObserved, "shot attempt divergence must be observed.");
  assertTest(experimentalSignature.shotQualityDivergenceObserved, "shot quality divergence must be observed.");
  assertTest(experimentalSignature.goalkeeperResponseDivergenceObserved, "goalkeeper response divergence must be observed.");
  assertTest(!experimentalSignature.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence must remain false.");
  assertTest(!experimentalSignature.sandboxScoreDivergenceObserved, "sandbox score divergence must remain false.");
  assertTest(experimentalSignature.modelAppliedOnlyInSandbox, "model must apply only in sandbox.");
  assertTest(!experimentalSignature.modelAppliedToNormalLiveSelection, "model must not apply to normal live selection.");
  assertTest(resolutionFact !== undefined, "experimental report must include sandbox resolution evidence.");
  assertTest(resolutionFact?.internalTags.includes("sandbox_scoring_resolution_applied_only_in_sandbox_true") ?? false, "evidence must say applied only in sandbox.");
  assertTest(resolutionFact?.internalTags.includes("sandbox_scoring_resolution_production_scoring_event_creation_forbidden") ?? false, "evidence must forbid production scoring event creation.");
  assertTest(visibleText.includes("resolution sandbox d'evenement de scoring"), "coach diagnosis must mention sandbox scoring event resolution.");
  assertTest(visibleText.includes("ne cree aucun MatchEvent officiel"), "coach diagnosis must say sandbox resolution is not official.");
  assertTest(visibleText.includes("ne modifie pas le score officiel"), "coach diagnosis must say sandbox resolution does not alter official score.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SANDBOX_SCORING_EVENT_RESOLUTION_RESULTS_ISOLATED_ONLY"), "limitations must say resolution model is isolated-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "normal full-match must not be claimed as production chain-driven.");
  assertTest(!visibleText.includes("rÃƒÂ©solution live du simulation"), "coach copy must not contain stale wording resolution live du simulation.");
  assertTest(!visibleText.includes("simulation experimental"), "coach copy must not contain stale wording simulation experimental.");

  return [
    "default runFullMatch has no sandbox resolution tags",
    "experimental runFullMatch has sandbox resolution tags",
    "experimental report includes sandbox resolution evidence",
    "experimental coach diagnosis mentions sandbox scoring event resolution",
    "experimental report says sandbox resolution is isolated-only and not official",
    "normal full-match is not claimed as production chain-driven",
    "coach copy avoids stale wording",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalSandboxScoringEventResolution();

  console.log("runFullMatchExperimentalSandboxScoringEventResolution tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

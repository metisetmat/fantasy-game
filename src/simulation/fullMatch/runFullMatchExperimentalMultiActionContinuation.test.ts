import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { multiActionContinuationSignature } from "./multiActionContinuationSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalMultiActionContinuation(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = multiActionContinuationSignature(defaultReport);
  const experimentalSignature = multiActionContinuationSignature(experimentalReport);
  const continuationFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_MULTI_ACTION_CONTINUATION_SANDBOX"
  );
  const visibleText = [
    ...experimentalReport.tacticalReport.diagnoses.map((item) => item.summary),
    ...experimentalReport.warnings.map((item) => item.coachSummary),
  ].join("\n");

  assertTest(defaultSignature.tagCount === 0, "default runFullMatch must not expose multi-action continuation tags.");
  assertTest(experimentalSignature.tagCount > 0, "experimental runFullMatch must expose multi-action continuation tags.");
  assertTest(experimentalSignature.officialSandboxEventCount === 0, "multi-action continuation must not be inserted as official MatchEvent.");
  assertTest(experimentalSignature.status === "available", "multi-action continuation model status must be available.");
  assertTest(experimentalSignature.origin === "rebound_second_chance_sandbox", "multi-action continuation origin mismatch.");
  assertTest(experimentalSignature.baselineContinuationAction === "NO_CONTINUATION", "baseline continuation action mismatch.");
  assertTest(experimentalSignature.baselineContinuationOutcome === "none", "baseline continuation outcome mismatch.");
  assertTest(experimentalSignature.baselineContinuationCreated === "false", "baseline continuation created mismatch.");
  assertTest(experimentalSignature.overrideSourceReboundOutcome === "SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE", "override source rebound mismatch.");
  assertTest(experimentalSignature.overrideSourceBallLooseState === "safe_area", "override source ball loose mismatch.");
  assertTest(experimentalSignature.overrideSourceRecoveryTeamCandidate === "goalkeeper_team", "override source recovery team mismatch.");
  assertTest(experimentalSignature.overrideContinuationAction === "GOALKEEPER_TEAM_SECURE_RECOVERY", "override continuation action mismatch.");
  assertTest(experimentalSignature.overrideContinuationOutcome === "secured_by_goalkeeper_team", "override continuation outcome mismatch.");
  assertTest(experimentalSignature.overrideContinuationTeamCandidate === "goalkeeper_team", "override continuation team mismatch.");
  assertTest(experimentalSignature.overrideContinuationActorCandidate === "blitz-goalkeeper-free-safety", "override continuation actor mismatch.");
  assertTest(experimentalSignature.overrideContinuationTargetZoneCandidate === "Z3-HSR", "override continuation target mismatch.");
  assertTest(experimentalSignature.overridePossessionSecurityScore === "82", "override possession security mismatch.");
  assertTest(experimentalSignature.overridePressureAfterRebound === "24", "override pressure after rebound mismatch.");
  assertTest(experimentalSignature.overrideTransitionRisk === "18", "override transition risk mismatch.");
  assertTest(experimentalSignature.overrideContinuationConfidence === "77", "override continuation confidence mismatch.");
  assertTest(experimentalSignature.overrideContinuationCreated === "true", "override continuation created mismatch.");
  assertTest(experimentalSignature.continuationActionDivergenceObserved === "true", "continuation action divergence must be observed.");
  assertTest(experimentalSignature.continuationOutcomeDivergenceObserved === "true", "continuation outcome divergence must be observed.");
  assertTest(experimentalSignature.continuationTeamDivergenceObserved === "true", "continuation team divergence must be observed.");
  assertTest(experimentalSignature.possessionSecurityObserved === "true", "possession security must be observed.");
  assertTest(experimentalSignature.transitionRiskObserved === "true", "transition risk must be observed.");
  assertTest(experimentalSignature.sandboxMatchEventDivergenceObserved === "false", "sandbox MatchEvent divergence must remain false.");
  assertTest(experimentalSignature.sandboxScoringEventDivergenceObserved === "false", "sandbox scoring event divergence must remain false.");
  assertTest(experimentalSignature.sandboxScoreDivergenceObserved === "false", "sandbox score divergence must remain false.");
  assertTest(experimentalSignature.officialPossessionDivergenceObserved === "false", "official possession divergence must remain false.");
  assertTest(experimentalSignature.modelAppliedOnlyInSandbox === "true", "model must apply only in sandbox.");
  assertTest(experimentalSignature.modelAppliedToNormalLiveSelection === "false", "model must not apply to normal live selection.");
  assertTest(continuationFact !== undefined, "experimental report must include multi-action continuation evidence.");
  assertTest(continuationFact?.internalTags.includes("multi_action_continuation_official_possession_mutation_forbidden") ?? false, "evidence must forbid official possession mutation.");
  assertTest(visibleText.includes("sandbox de continuation multi-action"), "coach diagnosis must mention multi-action continuation sandbox.");
  assertTest(visibleText.includes("aucune mutation de timeline officielle"), "coach diagnosis must say no official timeline mutation.");
  assertTest(visibleText.includes("aucune mutation de possession officielle"), "coach diagnosis must say no official possession mutation.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_MULTI_ACTION_CONTINUATION_SANDBOX_RESULTS_ISOLATED_ONLY"), "limitations must say continuation result is isolated-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "normal full-match must not be claimed as production chain-driven.");

  return [
    "default runFullMatch has no multi-action continuation tags",
    "experimental runFullMatch has multi-action continuation tags",
    "experimental report includes multi-action continuation evidence",
    "baseline has no continuation and override secures goalkeeper-team recovery",
    "experimental coach diagnosis mentions multi-action continuation sandbox",
    "multi-action continuation remains isolated-only and not official",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalMultiActionContinuation();

  console.log("runFullMatchExperimentalMultiActionContinuation tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

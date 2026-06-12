import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { reboundSecondChanceSignature } from "./reboundSecondChanceSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalReboundSecondChance(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = reboundSecondChanceSignature(defaultReport);
  const experimentalSignature = reboundSecondChanceSignature(experimentalReport);
  const reboundFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_REBOUND_SECOND_CHANCE_SANDBOX"
  );
  const visibleText = [
    ...experimentalReport.tacticalReport.diagnoses.map((item) => item.summary),
    ...experimentalReport.warnings.map((item) => item.coachSummary),
  ].join("\n");

  assertTest(defaultSignature.tagCount === 0, "default runFullMatch must not expose rebound second chance tags.");
  assertTest(experimentalSignature.tagCount > 0, "experimental runFullMatch must expose rebound second chance tags.");
  assertTest(experimentalSignature.officialSandboxEventCount === 0, "rebound sandbox must not be inserted as official MatchEvent.");
  assertTest(experimentalSignature.status === "available", "rebound second chance model status must be available.");
  assertTest(experimentalSignature.origin === "goalkeeper_response_model_sandbox", "rebound second chance origin mismatch.");
  assertTest(experimentalSignature.baselineReboundOutcome === "NO_REBOUND", "baseline rebound outcome mismatch.");
  assertTest(experimentalSignature.baselineBallLooseState === "none", "baseline ball loose state mismatch.");
  assertTest(experimentalSignature.baselineSecondChanceCreated === "false", "baseline second chance created mismatch.");
  assertTest(experimentalSignature.overrideGoalkeeperResponseType === "PARRIED_SAVE", "override source response mismatch.");
  assertTest(experimentalSignature.overrideSourceReboundState === "safe_deflection", "override source rebound state mismatch.");
  assertTest(["SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE", "SAFE_DEFLECTION"].includes(experimentalSignature.overrideReboundOutcome ?? ""), "override rebound outcome mismatch.");
  assertTest(["safe_area", "contested"].includes(experimentalSignature.overrideBallLooseState ?? ""), "override ball loose state mismatch.");
  assertTest(["goalkeeper_team", "contested"].includes(experimentalSignature.overrideRecoveryTeamCandidate ?? ""), "override recovery candidate mismatch.");
  assertTest(experimentalSignature.overrideNextSandboxPossessionCandidate !== undefined, "next sandbox possession candidate must be present.");
  assertTest(Number(experimentalSignature.overrideAttackingProximityScore ?? "0") > 0, "attacking proximity score must be populated.");
  assertTest(Number(experimentalSignature.overrideDefensiveRecoveryScore ?? "0") > 0, "defensive recovery score must be populated.");
  assertTest(Number(experimentalSignature.overrideReboundDangerScore ?? "-1") >= 0, "rebound danger score must be populated.");
  assertTest(Number(experimentalSignature.overrideSecondChanceProbability ?? "-1") >= 0, "second chance probability must be populated.");
  assertTest(experimentalSignature.overrideSecondChanceCreated === "false", "current fixture must not create a second chance.");
  assertTest(experimentalSignature.reboundOutcomeDivergenceObserved === "true", "rebound outcome divergence must be observed.");
  assertTest(experimentalSignature.ballLooseStateDivergenceObserved === "true", "ball loose state divergence must be observed.");
  assertTest(experimentalSignature.recoveryTeamDivergenceObserved === "true", "recovery team divergence must be observed.");
  assertTest(experimentalSignature.secondChanceProbabilityObserved === "true", "second chance probability must be observed.");
  assertTest(experimentalSignature.secondChanceCreationDivergenceObserved === "false", "second chance creation divergence should remain false.");
  assertTest(experimentalSignature.sandboxScoringEventDivergenceObserved === "false", "sandbox scoring event divergence must remain false.");
  assertTest(experimentalSignature.sandboxScoreDivergenceObserved === "false", "sandbox score divergence must remain false.");
  assertTest(experimentalSignature.modelAppliedOnlyInSandbox === "true", "model must apply only in sandbox.");
  assertTest(experimentalSignature.modelAppliedToNormalLiveSelection === "false", "model must not apply to normal live selection.");
  assertTest(reboundFact !== undefined, "experimental report must include rebound second chance evidence.");
  assertTest(reboundFact?.internalTags.includes("rebound_second_chance_production_scoring_event_creation_forbidden") ?? false, "evidence must forbid production scoring event creation.");
  assertTest(visibleText.includes("sandbox rebond et seconde chance"), "coach diagnosis must mention rebound second chance sandbox.");
  assertTest(visibleText.includes("aucune mutation de possession officielle"), "coach diagnosis must say no official possession mutation.");
  assertTest(visibleText.includes("aucun MatchEvent officiel"), "coach diagnosis must say no official MatchEvent is created.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_REBOUND_SECOND_CHANCE_SANDBOX_RESULTS_ISOLATED_ONLY"), "limitations must say rebound result is isolated-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "normal full-match must not be claimed as production chain-driven.");

  return [
    "default runFullMatch has no rebound second chance tags",
    "experimental runFullMatch has rebound second chance tags",
    "experimental report includes rebound second chance evidence",
    "baseline has no rebound and override resolves safe deflection",
    "current fixture creates no second chance",
    "experimental coach diagnosis mentions rebound second chance sandbox",
    "rebound second chance remains isolated-only and not official",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalReboundSecondChance();

  console.log("runFullMatchExperimentalReboundSecondChance tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

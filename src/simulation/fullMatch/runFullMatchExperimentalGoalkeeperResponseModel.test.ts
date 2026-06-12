import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { goalkeeperResponseModelSignature } from "./goalkeeperResponseModelSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalGoalkeeperResponseModel(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = goalkeeperResponseModelSignature(defaultReport);
  const experimentalSignature = goalkeeperResponseModelSignature(experimentalReport);
  const goalkeeperFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_GOALKEEPER_RESPONSE_MODEL_SANDBOX"
  );
  const visibleText = [
    ...experimentalReport.tacticalReport.diagnoses.map((item) => item.summary),
    ...experimentalReport.warnings.map((item) => item.coachSummary),
  ].join("\n");

  assertTest(defaultSignature.tagCount === 0, "default runFullMatch must not expose goalkeeper response tags.");
  assertTest(experimentalSignature.tagCount > 0, "experimental runFullMatch must expose goalkeeper response tags.");
  assertTest(experimentalSignature.officialSandboxEventCount === 0, "goalkeeper response must not be inserted as official MatchEvent.");
  assertTest(experimentalSignature.status === "available", "goalkeeper response model status must be available.");
  assertTest(experimentalSignature.origin === "attribute_driven_shot_resolution_sandbox", "goalkeeper response model origin mismatch.");
  assertTest(experimentalSignature.baselineResponseType === "NOT_APPLICABLE", "baseline response type mismatch.");
  assertTest(experimentalSignature.baselineReboundState === "none", "baseline rebound state mismatch.");
  assertTest(experimentalSignature.overrideShooterId === "control-space-hunter", "override shooter mismatch.");
  assertTest(experimentalSignature.overrideGoalkeeperId === "blitz-goalkeeper-free-safety", "override goalkeeper mismatch.");
  assertTest(Number(experimentalSignature.overrideShotQualityFaced ?? "0") > 0, "shot quality faced must be populated.");
  assertTest(Number(experimentalSignature.overrideGoalkeeperResponseScore ?? "0") > 0, "goalkeeper response score must be populated.");
  assertTest(Number(experimentalSignature.overrideSaveMargin ?? "0") > 0, "save margin must be positive.");
  assertTest(Number(experimentalSignature.overridePositioningScore ?? "0") > 0, "positioning score must be populated.");
  assertTest(Number(experimentalSignature.overrideTrajectoryReadingScore ?? "0") > 0, "trajectory reading score must be populated.");
  assertTest(Number(experimentalSignature.overrideReactionScore ?? "0") > 0, "reaction score must be populated.");
  assertTest(Number(experimentalSignature.overrideHandlingScore ?? "0") > 0, "handling score must be populated.");
  assertTest(Number(experimentalSignature.overrideReboundControlScore ?? "0") > 0, "rebound control score must be populated.");
  assertTest(Number(experimentalSignature.overrideConcentrationScore ?? "0") > 0, "concentration score must be populated.");
  assertTest(Number(experimentalSignature.overrideMentalFatigueImpact ?? "-1") >= 0, "mental fatigue impact must be populated.");
  assertTest(["CLEAN_SAVE", "PARRIED_SAVE"].includes(experimentalSignature.overrideResponseType ?? ""), "override response type must be CLEAN_SAVE or PARRIED_SAVE.");
  assertTest(["held", "safe_deflection"].includes(experimentalSignature.overrideReboundState ?? ""), "override rebound state must be held or safe_deflection.");
  assertTest(experimentalSignature.goalkeeperAttributeInfluenceObserved === "true", "goalkeeper attribute influence must be observed.");
  assertTest(experimentalSignature.responseDivergenceObserved === "true", "goalkeeper response divergence must be observed.");
  assertTest(experimentalSignature.reboundStateDivergenceObserved === "true", "rebound state divergence must be observed.");
  assertTest(experimentalSignature.sandboxScoringEventDivergenceObserved === "false", "sandbox scoring event divergence must remain false.");
  assertTest(experimentalSignature.sandboxScoreDivergenceObserved === "false", "sandbox score divergence must remain false.");
  assertTest(experimentalSignature.modelAppliedOnlyInSandbox === "true", "model must apply only in sandbox.");
  assertTest(experimentalSignature.modelAppliedToNormalLiveSelection === "false", "model must not apply to normal live selection.");
  assertTest(goalkeeperFact !== undefined, "experimental report must include goalkeeper response evidence.");
  assertTest(goalkeeperFact?.internalTags.includes("goalkeeper_response_production_scoring_event_creation_forbidden") ?? false, "evidence must forbid production scoring event creation.");
  assertTest(visibleText.includes("modele de reponse gardien sandbox"), "coach diagnosis must mention goalkeeper response model.");
  assertTest(visibleText.includes("aucun MatchEvent officiel"), "coach diagnosis must say goalkeeper response is not official.");
  assertTest(visibleText.includes("aucun score_change"), "coach diagnosis must say no score_change is created.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_GOALKEEPER_RESPONSE_MODEL_SANDBOX_RESULTS_ISOLATED_ONLY"), "limitations must say goalkeeper response result is isolated-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "normal full-match must not be claimed as production chain-driven.");
  assertTest(!visibleText.includes("rÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©solution live du simulation"), "coach copy must not contain stale wording resolution live du simulation.");
  assertTest(!visibleText.includes("simulation experimental"), "coach copy must not contain stale wording simulation experimental.");

  return [
    "default runFullMatch has no goalkeeper response tags",
    "experimental runFullMatch has goalkeeper response tags",
    "experimental report includes goalkeeper response evidence",
    "baseline is NOT_APPLICABLE with no rebound",
    "override goalkeeper response exposes sub-scores, save margin, response, and rebound",
    "experimental coach diagnosis mentions goalkeeper response model",
    "goalkeeper response remains isolated-only and not official",
    "normal full-match is not claimed as production chain-driven",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalGoalkeeperResponseModel();

  console.log("runFullMatchExperimentalGoalkeeperResponseModel tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { controlledRouteResolutionSandboxSignature } from "./controlledRouteResolutionSandboxSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalControlledRouteResolutionSandbox(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = controlledRouteResolutionSandboxSignature(defaultReport);
  const experimentalSignature = controlledRouteResolutionSandboxSignature(experimentalReport);
  const sandboxFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_CONTROLLED_ROUTE_RESOLUTION_SANDBOX"
  );
  const diagnosis = experimentalReport.tacticalReport.diagnoses.find((candidate) =>
    candidate.summary.includes("sandbox de resolution controlee")
  );
  const visibleText = [
    ...experimentalReport.tacticalReport.diagnoses.map((item) => item.summary),
    ...experimentalReport.warnings.map((item) => item.coachSummary),
  ].join("\n");

  assertTest(defaultSignature.sandboxTagCount === 0, "default runFullMatch must not expose sandbox tags.");
  assertTest(experimentalSignature.sandboxTagCount > 0, "experimental runFullMatch must expose sandbox tags.");
  assertTest(experimentalSignature.officialSandboxEventCount === 0, "sandbox results must not be inserted as official MatchEvents.");
  assertTest(experimentalSignature.baselineCandidateId === "chain-context-safe-recycle-pv", "sandbox signature must expose baseline candidate.");
  assertTest(experimentalSignature.baselineActionType === "SAFE_RECYCLE", "sandbox signature must expose baseline action.");
  assertTest(experimentalSignature.baselineReceiverId === "control-pivot", "sandbox signature must expose baseline receiver.");
  assertTest(experimentalSignature.baselineTargetZone === "Z2-HSL", "sandbox signature must expose baseline zone.");
  assertTest(experimentalSignature.baselineResolved, "baseline route must resolve.");
  assertTest(experimentalSignature.baselineOutcome === "safe_retention", "baseline outcome must be safe_retention.");
  assertTest(experimentalSignature.overrideCandidateId === "chain-context-forward-progress-sh", "sandbox signature must expose override candidate.");
  assertTest(experimentalSignature.overrideActionType === "FORWARD_PROGRESS", "sandbox signature must expose override action.");
  assertTest(experimentalSignature.overrideReceiverId === "control-space-hunter", "sandbox signature must expose override receiver.");
  assertTest(experimentalSignature.overrideTargetZone === "Z4-HSR", "sandbox signature must expose override zone.");
  assertTest(experimentalSignature.overrideResolved, "override route must resolve.");
  assertTest(experimentalSignature.overrideOutcome === "dangerous_progression", "override outcome must be dangerous_progression.");
  assertTest(experimentalSignature.overrideDangerProbability > experimentalSignature.baselineDangerProbability, "override danger probability must be greater than baseline.");
  assertTest(experimentalSignature.selectionDivergenceObserved, "sandbox must expose selection divergence.");
  assertTest(experimentalSignature.carrierDivergenceObserved, "sandbox must expose carrier divergence.");
  assertTest(experimentalSignature.zoneProgressionDivergenceObserved, "sandbox must expose zone progression divergence.");
  assertTest(experimentalSignature.dangerCreationDivergenceObserved, "sandbox must expose danger creation divergence.");
  assertTest(experimentalSignature.sandboxAppliedOnlyInIsolatedResolution, "sandbox must apply only in isolated resolution.");
  assertTest(!experimentalSignature.sandboxAppliedToNormalLiveSelection, "sandbox must not apply to normal live selection.");
  assertTest(sandboxFact !== undefined, "experimental report must include sandbox evidence.");
  assertTest(sandboxFact?.internalTags.includes("sandbox_applied_only_in_isolated_resolution_true") ?? false, "sandbox evidence must say isolated-only.");
  assertTest(sandboxFact?.internalTags.includes("sandbox_official_timeline_injection_forbidden") ?? false, "sandbox evidence must forbid official timeline injection.");
  assertTest(diagnosis !== undefined, "experimental coach diagnosis must mention route resolution sandbox.");
  assertTest(diagnosis?.summary.includes("ne modifie pas le full-match normal") ?? false, "coach diagnosis must say sandbox does not alter official full-match.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_RESULTS_ISOLATED_ONLY"), "limitations must say sandbox results are isolated-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_ROUTE_RESOLUTION_SANDBOX_RESULTS_NOT_OFFICIAL_MATCH_EVENTS"), "limitations must say sandbox results are not official MatchEvents.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "experimental report must not claim production chain-driven full-match.");
  assertTest(!visibleText.includes("resolution live du simulation"), "coach copy must not contain stale wording resolution live du simulation.");
  assertTest(!visibleText.includes("simulation experimental"), "coach copy must not contain stale wording simulation experimental.");

  return [
    "default runFullMatch has no sandbox tags",
    "experimental runFullMatch has sandbox tags",
    "experimental report includes sandbox evidence",
    "experimental coach diagnosis mentions controlled route resolution sandbox",
    "experimental report says sandbox results are isolated-only",
    "experimental report says sandbox results are not official MatchEvents",
    "experimental report says sandbox does not alter official full-match",
    "normal full-match is not claimed as production chain-driven",
    "coach copy avoids stale wording",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalControlledRouteResolutionSandbox();

  console.log("runFullMatchExperimentalControlledRouteResolutionSandbox tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

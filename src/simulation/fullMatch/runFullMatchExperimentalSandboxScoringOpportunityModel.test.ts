import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { sandboxScoringOpportunityModelSignature } from "./sandboxScoringOpportunityModelSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalSandboxScoringOpportunityModel(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = sandboxScoringOpportunityModelSignature(defaultReport);
  const experimentalSignature = sandboxScoringOpportunityModelSignature(experimentalReport);
  const opportunityFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_SANDBOX_SCORING_OPPORTUNITY_MODEL"
  );
  const visibleText = [
    ...experimentalReport.tacticalReport.diagnoses.map((item) => item.summary),
    ...experimentalReport.warnings.map((item) => item.coachSummary),
  ].join("\n");

  assertTest(defaultSignature.opportunityTagCount === 0, "default runFullMatch must not expose sandbox opportunity tags.");
  assertTest(experimentalSignature.opportunityTagCount > 0, "experimental runFullMatch must expose sandbox opportunity tags.");
  assertTest(experimentalSignature.officialSandboxOpportunityEventCount === 0, "sandbox opportunity must not be inserted as official MatchEvent.");
  assertTest(experimentalSignature.baselineCandidateId === "chain-context-safe-recycle-pv", "baseline candidate mismatch.");
  assertTest(experimentalSignature.baselineActionType === "SAFE_RECYCLE", "baseline action mismatch.");
  assertTest(experimentalSignature.baselineReceiverId === "control-pivot", "baseline receiver mismatch.");
  assertTest(experimentalSignature.baselineTargetZone === "Z2-HSL", "baseline zone mismatch.");
  assertTest(experimentalSignature.baselineRouteOutcome === "safe_retention", "baseline route outcome mismatch.");
  assertTest(experimentalSignature.baselineSourceDangerProbability === 18, "baseline danger probability must be 18.");
  assertTest(experimentalSignature.baselineSourceScoringOpportunityProbability === 5, "baseline scoring opportunity probability must be 5.");
  assertTest(experimentalSignature.baselineOpportunityType === "no_opportunity", "baseline opportunity type mismatch.");
  assertTest(experimentalSignature.baselineOpportunityFamily === "none", "baseline opportunity family mismatch.");
  assertTest(experimentalSignature.baselineOpportunityProbability === 5, "baseline opportunity probability mismatch.");
  assertTest(!experimentalSignature.baselineOpportunityCreated, "baseline opportunity created must be false.");
  assertTest(experimentalSignature.overrideCandidateId === "chain-context-forward-progress-sh", "override candidate mismatch.");
  assertTest(experimentalSignature.overrideActionType === "FORWARD_PROGRESS", "override action mismatch.");
  assertTest(experimentalSignature.overrideReceiverId === "control-space-hunter", "override receiver mismatch.");
  assertTest(experimentalSignature.overrideTargetZone === "Z4-HSR", "override zone mismatch.");
  assertTest(experimentalSignature.overrideRouteOutcome === "dangerous_progression", "override route outcome mismatch.");
  assertTest(experimentalSignature.overrideSourceDangerProbability === 64, "override danger probability must be 64.");
  assertTest(experimentalSignature.overrideSourceScoringOpportunityProbability === 24, "override scoring opportunity probability must be 24.");
  assertTest(experimentalSignature.overrideOpportunityType === "half_chance", "override opportunity type mismatch.");
  assertTest(experimentalSignature.overrideOpportunityFamily === "territorial_danger", "override opportunity family mismatch.");
  assertTest(experimentalSignature.overrideOpportunityProbability === 24, "override opportunity probability mismatch.");
  assertTest(experimentalSignature.overrideOpportunityCreated, "override opportunity created must be true.");
  assertTest(experimentalSignature.opportunityTypeDivergenceObserved, "type divergence must be observed.");
  assertTest(experimentalSignature.opportunityFamilyDivergenceObserved, "family divergence must be observed.");
  assertTest(experimentalSignature.opportunityProbabilityDivergenceObserved, "probability divergence must be observed.");
  assertTest(experimentalSignature.opportunityCreationDivergenceObserved, "creation divergence must be observed.");
  assertTest(!experimentalSignature.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence must remain false.");
  assertTest(!experimentalSignature.sandboxScoreDivergenceObserved, "sandbox score divergence must remain false.");
  assertTest(experimentalSignature.modelAppliedOnlyInSandbox, "model must apply only in sandbox.");
  assertTest(!experimentalSignature.modelAppliedToNormalLiveSelection, "model must not apply to normal live selection.");
  assertTest(opportunityFact !== undefined, "experimental report must include sandbox opportunity evidence.");
  assertTest(opportunityFact?.internalTags.includes("sandbox_opportunity_applied_only_in_sandbox_true") ?? false, "evidence must say applied only in sandbox.");
  assertTest(opportunityFact?.internalTags.includes("sandbox_opportunity_official_timeline_injection_forbidden") ?? false, "evidence must forbid official timeline injection.");
  assertTest(visibleText.includes("modele sandbox d'opportunite de scoring"), "coach diagnosis must mention sandbox scoring opportunity model.");
  assertTest(visibleText.includes("ne cree aucun MatchEvent officiel"), "coach diagnosis must say sandbox opportunity is not official.");
  assertTest(visibleText.includes("ne modifie pas le score officiel"), "coach diagnosis must say sandbox opportunity does not alter official score.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SANDBOX_SCORING_OPPORTUNITY_MODEL_RESULTS_ISOLATED_ONLY"), "limitations must say opportunity model is isolated-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "normal full-match must not be claimed as production chain-driven.");
  assertTest(!visibleText.includes("rÃ©solution live du simulation"), "coach copy must not contain stale wording resolution live du simulation.");
  assertTest(!visibleText.includes("simulation experimental"), "coach copy must not contain stale wording simulation experimental.");

  return [
    "default runFullMatch has no sandbox opportunity tags",
    "experimental runFullMatch has sandbox opportunity tags",
    "experimental report includes sandbox opportunity evidence",
    "experimental coach diagnosis mentions sandbox scoring opportunity model",
    "experimental report says sandbox opportunity is isolated-only and not official",
    "normal full-match is not claimed as production chain-driven",
    "coach copy avoids stale wording",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalSandboxScoringOpportunityModel();

  console.log("runFullMatchExperimentalSandboxScoringOpportunityModel tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

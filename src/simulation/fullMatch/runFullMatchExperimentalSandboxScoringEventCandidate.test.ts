import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { sandboxScoringEventCandidateSignature } from "./sandboxScoringEventCandidateSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalSandboxScoringEventCandidate(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = sandboxScoringEventCandidateSignature(defaultReport);
  const experimentalSignature = sandboxScoringEventCandidateSignature(experimentalReport);
  const candidateFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_SANDBOX_SCORING_EVENT_CANDIDATE"
  );
  const visibleText = [
    ...experimentalReport.tacticalReport.diagnoses.map((item) => item.summary),
    ...experimentalReport.warnings.map((item) => item.coachSummary),
  ].join("\n");

  assertTest(defaultSignature.candidateTagCount === 0, "default runFullMatch must not expose sandbox candidate tags.");
  assertTest(experimentalSignature.candidateTagCount > 0, "experimental runFullMatch must expose sandbox candidate tags.");
  assertTest(experimentalSignature.officialSandboxCandidateEventCount === 0, "sandbox candidate must not be inserted as official MatchEvent.");
  assertTest(experimentalSignature.baselineCandidateId === "chain-context-safe-recycle-pv", "baseline candidate mismatch.");
  assertTest(experimentalSignature.baselineSourceOpportunityType === "no_opportunity", "baseline source opportunity mismatch.");
  assertTest(experimentalSignature.baselineScoringCandidateType === "NO_SCORING_EVENT", "baseline candidate type mismatch.");
  assertTest(experimentalSignature.baselineScoringCandidateFamily === "none", "baseline candidate family mismatch.");
  assertTest(experimentalSignature.baselineScoringCandidateProbability === 0, "baseline probability must be 0.");
  assertTest(experimentalSignature.baselineConversionProbability === 0, "baseline conversion probability must be 0.");
  assertTest(!experimentalSignature.baselineScoringCandidateCreated, "baseline candidate created must be false.");
  assertTest(experimentalSignature.overrideCandidateId === "chain-context-forward-progress-sh", "override candidate mismatch.");
  assertTest(experimentalSignature.overrideSourceOpportunityType === "half_chance", "override source opportunity mismatch.");
  assertTest(experimentalSignature.overrideScoringCandidateType === "SHOT_CANDIDATE", "override candidate type mismatch.");
  assertTest(experimentalSignature.overrideScoringCandidateFamily === "shot", "override candidate family mismatch.");
  assertTest(experimentalSignature.overrideScoringCandidateProbability === 24, "override probability must be 24.");
  assertTest(experimentalSignature.overrideConversionProbability > 0, "override conversion probability must be positive.");
  assertTest(experimentalSignature.overrideScoringCandidateCreated, "override candidate created must be true.");
  assertTest(experimentalSignature.scoringCandidateTypeDivergenceObserved, "type divergence must be observed.");
  assertTest(experimentalSignature.scoringCandidateFamilyDivergenceObserved, "family divergence must be observed.");
  assertTest(experimentalSignature.scoringCandidateProbabilityDivergenceObserved, "probability divergence must be observed.");
  assertTest(experimentalSignature.scoringCandidateCreationDivergenceObserved, "creation divergence must be observed.");
  assertTest(experimentalSignature.conversionProbabilityDivergenceObserved, "conversion divergence must be observed.");
  assertTest(!experimentalSignature.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence must remain false.");
  assertTest(!experimentalSignature.sandboxScoreDivergenceObserved, "sandbox score divergence must remain false.");
  assertTest(experimentalSignature.modelAppliedOnlyInSandbox, "model must apply only in sandbox.");
  assertTest(!experimentalSignature.modelAppliedToNormalLiveSelection, "model must not apply to normal live selection.");
  assertTest(candidateFact !== undefined, "experimental report must include sandbox candidate evidence.");
  assertTest(candidateFact?.internalTags.includes("sandbox_scoring_candidate_applied_only_in_sandbox_true") ?? false, "evidence must say applied only in sandbox.");
  assertTest(candidateFact?.internalTags.includes("sandbox_scoring_candidate_production_scoring_event_creation_forbidden") ?? false, "evidence must forbid production scoring event creation.");
  assertTest(visibleText.includes("candidat sandbox d'evenement de scoring"), "coach diagnosis must mention sandbox scoring event candidate.");
  assertTest(visibleText.includes("ne cree aucun MatchEvent officiel"), "coach diagnosis must say sandbox candidate is not official.");
  assertTest(visibleText.includes("ne modifie pas le score officiel"), "coach diagnosis must say sandbox candidate does not alter official score.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SANDBOX_SCORING_EVENT_CANDIDATE_RESULTS_ISOLATED_ONLY"), "limitations must say candidate model is isolated-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "normal full-match must not be claimed as production chain-driven.");

  return [
    "default runFullMatch has no sandbox candidate tags",
    "experimental runFullMatch has sandbox candidate tags",
    "experimental report includes sandbox candidate evidence",
    "experimental coach diagnosis mentions sandbox scoring event candidate",
    "experimental report says sandbox candidate is isolated-only and not official",
    "normal full-match is not claimed as production chain-driven",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalSandboxScoringEventCandidate();

  console.log("runFullMatchExperimentalSandboxScoringEventCandidate tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

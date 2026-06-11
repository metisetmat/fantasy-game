import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchIsolatedMiniMatchOverrideExperimentSignature } from "./fullMatchIsolatedMiniMatchOverrideExperimentSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalIsolatedMiniMatchOverrideExperiment(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = fullMatchIsolatedMiniMatchOverrideExperimentSignature(defaultReport);
  const experimentalSignature = fullMatchIsolatedMiniMatchOverrideExperimentSignature(experimentalReport);
  const experimentFact = experimentalReport.evidenceFacts.find((fact) => fact.category === "WORKBENCH_CHAIN_ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT");
  const diagnosis = experimentalReport.tacticalReport.diagnoses.find((candidate) =>
    candidate.summary.includes("experience mini-match isolee")
  );
  const visibleText = [
    ...experimentalReport.tacticalReport.diagnoses.map((item) => item.summary),
    ...experimentalReport.warnings.map((item) => item.coachSummary),
  ].join("\n");

  assertTest(defaultSignature.isolatedOverrideExperimentTagCount === 0, "default runFullMatch must not expose isolated override experiment tags.");
  assertTest(experimentalSignature.liveSelectionOverrideGuardTagCount > 0, "experimental runFullMatch must still expose live selection override guard tags.");
  assertTest(experimentalSignature.isolatedOverrideExperimentTagCount > 0, "experimental runFullMatch must expose isolated override experiment tags.");
  assertTest(experimentalSignature.baselineCandidateId === "chain-context-safe-recycle-pv", "isolated signature must expose baseline candidate.");
  assertTest(experimentalSignature.overrideCandidateId === "chain-context-forward-progress-sh", "isolated signature must expose override candidate.");
  assertTest(experimentalSignature.overrideActionType === "FORWARD_PROGRESS", "isolated signature must expose override action.");
  assertTest(experimentalSignature.overrideReceiverId === "control-space-hunter", "isolated signature must expose override receiver.");
  assertTest(experimentalSignature.overrideTargetZone === "Z4-HSR", "isolated signature must expose override target zone.");
  assertTest(experimentalSignature.candidateLegal, "isolated override candidate must be legal.");
  assertTest(experimentalSignature.candidateAvailable, "isolated override candidate must be available.");
  assertTest(experimentalSignature.rejectedClosedCandidateCount >= 1, "isolated signature must expose closed rejection count.");
  assertTest(experimentalSignature.rejectedUnavailableCandidateCount >= 1, "isolated signature must expose unavailable rejection count.");
  assertTest(experimentalSignature.overrideAppliedInIsolatedExperiment, "override must be applied in isolated experiment.");
  assertTest(!experimentalSignature.overrideAppliedToNormalLiveSelection, "override must not be applied to normal live selection.");
  assertTest(experimentalSignature.isolatedSelectionDivergenceObserved, "isolated experiment must expose selection divergence.");
  assertTest(experimentFact !== undefined, "experimental report must include isolated override experiment evidence.");
  assertTest(experimentFact?.internalTags.includes("isolated_override_applied_in_experiment_true") ?? false, "isolated evidence must say applied in isolated experiment.");
  assertTest(experimentFact?.internalTags.includes("isolated_override_applied_to_normal_live_false") ?? false, "isolated evidence must say not applied to normal live selection.");
  assertTest(experimentFact?.internalTags.includes("isolated_override_global_economy_claim_forbidden") ?? false, "isolated evidence must forbid global economy claims.");
  assertTest(diagnosis !== undefined, "experimental coach diagnosis must mention isolated mini-match override experiment.");
  assertTest(diagnosis?.summary.includes("uniquement dans une experience mini-match isolee") ?? false, "coach diagnosis must say override is applied only in isolated experiment.");
  assertTest(diagnosis?.summary.includes("ne modifie pas le full-match normal") ?? false, "coach diagnosis must say normal full-match is unchanged.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_APPLIED_ONLY_IN_ISOLATED_EXPERIMENT"), "limitations must say isolated-only application.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_ISOLATED_MINIMATCH_OVERRIDE_NOT_APPLIED_TO_NORMAL_LIVE_SELECTION"), "limitations must say not applied to normal live selection.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "experimental report must not claim production chain-driven full-match.");
  assertTest(!visibleText.includes("resolution live du simulation"), "coach copy must not contain stale wording resolution live du simulation.");
  assertTest(!visibleText.includes("simulation experimental"), "coach copy must not contain stale wording simulation experimental.");

  return [
    "default runFullMatch has no isolated override experiment tags",
    "experimental runFullMatch has isolated override experiment tags",
    "experimental report includes isolated override experiment evidence",
    "experimental coach diagnosis mentions isolated mini-match override experiment",
    "experimental report says override is applied only in isolated experiment",
    "experimental report says override is not applied to normal live selection",
    "experimental report says normal full-match is unchanged",
    "normal full-match is not claimed as production chain-driven",
    "coach copy avoids stale wording",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalIsolatedMiniMatchOverrideExperiment();

  console.log("runFullMatchExperimentalIsolatedMiniMatchOverrideExperiment tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

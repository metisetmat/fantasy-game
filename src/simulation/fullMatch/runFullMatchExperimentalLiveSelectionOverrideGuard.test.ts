import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchLiveSelectionOverrideGuardSignature } from "./fullMatchLiveSelectionOverrideGuardSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalLiveSelectionOverrideGuard(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = fullMatchLiveSelectionOverrideGuardSignature(defaultReport);
  const experimentalSignature = fullMatchLiveSelectionOverrideGuardSignature(experimentalReport);
  const overrideFact = experimentalReport.evidenceFacts.find((fact) => fact.category === "WORKBENCH_CHAIN_LIVE_SELECTION_OVERRIDE_GUARD");
  const diagnosis = experimentalReport.tacticalReport.diagnoses.find((candidate) =>
    candidate.summary.includes("override de selection live experimental"),
  );
  const visibleText = [
    ...experimentalReport.tacticalReport.diagnoses.map((item) => item.summary),
    ...experimentalReport.warnings.map((item) => item.coachSummary),
  ].join("\n");

  assertTest(defaultSignature.liveSelectionOverrideGuardTagCount === 0, "default runFullMatch must not expose live selection override guard tags.");
  assertTest(experimentalSignature.controlledMiniMatchRouteSourceTagCount > 0, "experimental runFullMatch must still expose controlled route source tags.");
  assertTest(experimentalSignature.liveSelectionOverrideGuardTagCount > 0, "experimental runFullMatch must expose live selection override guard tags.");
  assertTest(experimentalSignature.overrideCandidateId === "chain-context-forward-progress-sh", "override signature must expose candidate.");
  assertTest(experimentalSignature.overrideActionType === "FORWARD_PROGRESS", "override signature must expose action.");
  assertTest(experimentalSignature.overrideReceiverId === "control-space-hunter", "override signature must expose receiver.");
  assertTest(experimentalSignature.overrideTargetZone === "Z4-HSR", "override signature must expose target zone.");
  assertTest(experimentalSignature.candidateLegal, "override candidate must be legal.");
  assertTest(experimentalSignature.candidateAvailable, "override candidate must be available.");
  assertTest(experimentalSignature.rejectedClosedCandidateCount >= 1, "override signature must expose closed rejection count.");
  assertTest(experimentalSignature.rejectedUnavailableCandidateCount >= 1, "override signature must expose unavailable rejection count.");
  assertTest(!experimentalSignature.overrideAppliedToLiveSelection, "override must not be applied to live selection.");
  assertTest(overrideFact !== undefined, "experimental report must include live selection override guard evidence.");
  assertTest(overrideFact?.internalTags.includes("live_selection_override_guard_diagnostic_only") ?? false, "override evidence must be diagnostic-only.");
  assertTest(overrideFact?.internalTags.includes("live_selection_override_applied_false") ?? false, "override evidence must say not applied.");
  assertTest(overrideFact?.internalTags.includes("live_selection_override_guard_normal_live_resolution_forbidden") ?? false, "override evidence must forbid normal live mini-match resolution.");
  assertTest(diagnosis !== undefined, "experimental coach diagnosis must mention live selection override guard.");
  assertTest(diagnosis?.summary.includes("Il reste volontairement non applique") ?? false, "coach diagnosis must say override is not applied.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_DIAGNOSTIC_ONLY"), "experimental limitations must mark override guard diagnostic-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_NOT_APPLIED_TO_LIVE_SELECTION"), "experimental limitations must say override is not applied.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_LIVE_SELECTION_OVERRIDE_GUARD_CANNOT_DRIVE_NORMAL_LIVE_MINIMATCH_RESOLUTION"), "experimental limitations must forbid normal live mini-match resolution.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "experimental report must not claim production chain-driven full-match.");
  assertTest(!visibleText.includes("simulation experimental"), "coach copy must not contain the stale wording 'simulation experimental'.");

  return [
    "default runFullMatch has no live selection override guard tags",
    "experimental runFullMatch has live selection override guard tags",
    "experimental report includes live selection override guard evidence",
    "experimental coach diagnosis mentions live selection override guard",
    "live selection override guard is diagnostic-only",
    "override is not applied to live selection",
    "override cannot drive normal live mini-match route resolution",
    "normal full-match is not claimed as production chain-driven",
    "previous wording simulation experimental is absent",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalLiveSelectionOverrideGuard();

  console.log("runFullMatchExperimentalLiveSelectionOverrideGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

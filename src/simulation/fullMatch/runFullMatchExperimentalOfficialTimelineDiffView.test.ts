import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { officialTimelineDiffViewSignature } from "./officialTimelineDiffViewSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalOfficialTimelineDiffView(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = officialTimelineDiffViewSignature(defaultReport);
  const experimentalSignature = officialTimelineDiffViewSignature(experimentalReport);
  const diffFact = experimentalReport.evidenceFacts.find((fact) =>
    fact.category === "WORKBENCH_CHAIN_OFFICIAL_TIMELINE_DIFF_VIEW"
  );
  const visibleText = [
    ...experimentalReport.tacticalReport.diagnoses.map((item) => item.summary),
    ...experimentalReport.warnings.map((item) => item.coachSummary),
  ].join("\n");

  assertTest(defaultSignature.tagCount === 0, "default runFullMatch must not expose official timeline diff view tags.");
  assertTest(experimentalSignature.tagCount > 0, "experimental runFullMatch must expose official timeline diff view tags.");
  assertTest(experimentalSignature.officialTimelineDiffEventCount === 0, "official diff view must not add diff events to official timeline.");
  assertTest(experimentalSignature.status === "available", "official timeline diff view status must be available.");
  assertTest(experimentalSignature.origin === "controlled_segment_sandbox_timeline", "official timeline diff view origin mismatch.");
  assertTest(experimentalSignature.baselineSandboxOnlyEventCount === "9", "baseline sandbox-only event count must be 9.");
  assertTest(experimentalSignature.overrideSandboxOnlyEventCount === "9", "override sandbox-only event count must be 9.");
  assertTest(experimentalSignature.baselineFinalOutcome === "none", "baseline sandbox final outcome must remain none.");
  assertTest(experimentalSignature.overrideFinalOutcome === "secured_by_goalkeeper_team", "override final outcome mismatch.");
  assertTest(experimentalSignature.overrideFinalTeamCandidate === "goalkeeper_team", "override final team mismatch.");
  assertTest(experimentalSignature.overrideFinalActorCandidate === "blitz-goalkeeper-free-safety", "override final actor mismatch.");
  assertTest(experimentalSignature.overrideFinalZoneCandidate === "Z3-HSR", "override final zone mismatch.");
  assertTest(experimentalSignature.sandboxOutcomeDivergenceObserved === "true", "sandbox outcome divergence must be visible.");
  assertTest(experimentalSignature.sandboxFinalTeamDivergenceObserved === "true", "sandbox final team divergence must be visible.");
  assertTest(experimentalSignature.sandboxFinalZoneDivergenceObserved === "true", "sandbox final zone divergence must be visible.");
  assertTest(experimentalSignature.officialTimelineDivergenceObserved === "false", "official timeline divergence must remain false.");
  assertTest(experimentalSignature.officialPossessionDivergenceObserved === "false", "official possession divergence must remain false.");
  assertTest(experimentalSignature.officialScoreDivergenceObserved === "false", "official score divergence must remain false.");
  assertTest(experimentalSignature.officialScoringEventDivergenceObserved === "false", "official scoring-event divergence must remain false.");
  assertTest(experimentalSignature.modelAppliedOnlyInSandbox === "true", "diff view must apply only in sandbox.");
  assertTest(experimentalSignature.modelAppliedToNormalLiveSelection === "false", "diff view must not apply to normal live selection.");
  assertTest(diffFact !== undefined, "experimental report must include official timeline diff view evidence.");
  assertTest(diffFact?.internalTags.includes("official_timeline_diff_official_timeline_injection_forbidden") ?? false, "evidence must forbid official timeline injection.");
  assertTest(visibleText.includes("diff officiel read-only"), "coach diagnosis must mention the read-only official diff.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_OFFICIAL_TIMELINE_DIFF_VIEW_READ_ONLY"), "limitations must mark diff view read-only.");

  return [
    "default runFullMatch has no official timeline diff view tags",
    "experimental runFullMatch exposes official timeline diff evidence",
    "baseline and override paths expose sandbox-only event counts",
    "official timeline diff view does not create official timeline events",
    "official divergence flags remain false while sandbox divergence is visible",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalOfficialTimelineDiffView();

  console.log("runFullMatchExperimentalOfficialTimelineDiffView tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

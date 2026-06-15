import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchRouteCandidateInfluenceSignature } from "./fullMatchRouteCandidateInfluenceSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalRouteCandidateInfluence(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = fullMatchRouteCandidateInfluenceSignature(defaultReport);
  const experimentalSignature = fullMatchRouteCandidateInfluenceSignature(experimentalReport);
  const routeInfluenceFact = experimentalReport.evidenceFacts.find((fact) => fact.category === "WORKBENCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE");
  const diagnosis = experimentalReport.tacticalReport.diagnoses.find((candidate) =>
    candidate.summary.includes("selection shadow") || candidate.summary.includes("Influence candidates"),
  );

  assertTest(defaultSignature.routeCandidateInfluenceTagCount === 0, "default runFullMatch must not expose route candidate influence tags.");
  assertTest(experimentalSignature.routeCandidateInfluenceTagCount > 0, "experimental runFullMatch must expose route candidate influence tags.");
  assertTest(experimentalSignature.influencedCandidateCount > 0, "experimental signature must expose influenced candidate count.");
  assertTest(routeInfluenceFact !== undefined, "experimental report must include route candidate influence evidence.");
  assertTest(routeInfluenceFact?.internalTags.includes("route_candidate_influence_diagnostic_only") ?? false, "route influence evidence must be diagnostic-only.");
  assertTest(routeInfluenceFact?.internalTags.includes("route_candidate_influence_production_selection_forbidden") ?? false, "route influence evidence must forbid production selection.");
  assertTest(routeInfluenceFact?.summary.includes("control-space-hunter") ?? false, "route influence evidence must include final carrier.");
  assertTest(routeInfluenceFact?.summary.includes("Z4-HSR") ?? false, "route influence evidence must include final zone.");
  assertTest(diagnosis !== undefined, "experimental coach diagnosis must mention route candidate influence.");
  assertTest(diagnosis?.summary.includes("sans modifier le score ni les evenements") || diagnosis?.summary.includes("ne modifie pas encore la resolution ni le score") || false, "coach diagnosis must state diagnostic influence does not mutate resolution or score.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_DIAGNOSTIC_ONLY"), "experimental limitations must mark route influence diagnostic-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CHAIN_ROUTE_CANDIDATE_INFLUENCE_CANNOT_DRIVE_PRODUCTION_SELECTION"), "experimental limitations must forbid production selection.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "experimental report must not claim production chain-driven full-match.");

  return [
    "default runFullMatch has no route candidate influence tags",
    "experimental runFullMatch has route candidate influence tags",
    "experimental report includes route candidate influence evidence",
    "experimental coach diagnosis mentions route candidate influence",
    "experimental report says influence is diagnostic-only",
    "normal full-match is not claimed as production chain-driven",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalRouteCandidateInfluence();

  console.log("runFullMatchExperimentalRouteCandidateInfluence tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

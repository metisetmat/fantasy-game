import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchShadowRouteSelectionSignature } from "./fullMatchShadowRouteSelectionSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalShadowRouteSelection(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = fullMatchShadowRouteSelectionSignature(defaultReport);
  const experimentalSignature = fullMatchShadowRouteSelectionSignature(experimentalReport);
  const shadowFact = experimentalReport.evidenceFacts.find((fact) => fact.category === "WORKBENCH_CHAIN_SHADOW_ROUTE_SELECTION");
  const diagnosis = experimentalReport.tacticalReport.diagnoses.find((candidate) =>
    candidate.summary.includes("selection shadow"),
  );

  assertTest(defaultSignature.shadowRouteSelectionTagCount === 0, "default runFullMatch must not expose shadow route selection tags.");
  assertTest(experimentalSignature.shadowRouteSelectionTagCount > 0, "experimental runFullMatch must expose shadow route selection tags.");
  assertTest(experimentalSignature.productionSelectionCandidateId === "chain-context-safe-recycle-pv", "experimental signature must expose production proxy.");
  assertTest(experimentalSignature.shadowSelectionCandidateId === "chain-context-forward-progress-sh", "experimental signature must expose shadow candidate.");
  assertTest(experimentalSignature.shadowSelectionChangedFromProduction, "experimental signature must expose changed selection.");
  assertTest(shadowFact !== undefined, "experimental report must include shadow route selection evidence.");
  assertTest(shadowFact?.internalTags.includes("shadow_route_selection_diagnostic_only") ?? false, "shadow evidence must be diagnostic-only.");
  assertTest(shadowFact?.internalTags.includes("shadow_route_selection_production_forbidden") ?? false, "shadow evidence must forbid production selection.");
  assertTest(shadowFact?.summary.includes("chain-context-forward-progress-sh") ?? false, "shadow evidence must include shadow candidate.");
  assertTest(diagnosis !== undefined, "experimental coach diagnosis must mention shadow route selection.");
  assertTest(diagnosis?.summary.includes("sans modifier le score ni les evenements") ?? false, "coach diagnosis must state score/events are unchanged.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SHADOW_ROUTE_SELECTION_DIAGNOSTIC_ONLY"), "experimental limitations must mark shadow selection diagnostic-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SHADOW_ROUTE_SELECTION_CANNOT_DRIVE_PRODUCTION_SELECTION"), "experimental limitations must forbid production selection.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "experimental report must not claim production chain-driven full-match.");

  return [
    "default runFullMatch has no shadow route selection tags",
    "experimental runFullMatch has shadow route selection tags",
    "experimental report includes shadow route selection evidence",
    "experimental coach diagnosis mentions shadow route selection",
    "experimental report says shadow selection is diagnostic-only",
    "experimental report says shadow selection cannot drive production selection",
    "normal full-match is not claimed as production chain-driven",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalShadowRouteSelection();

  console.log("runFullMatchExperimentalShadowRouteSelection tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

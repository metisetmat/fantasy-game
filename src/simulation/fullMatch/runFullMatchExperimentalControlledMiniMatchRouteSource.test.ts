import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchControlledMiniMatchRouteSourceSignature } from "./fullMatchControlledMiniMatchRouteSourceSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalControlledMiniMatchRouteSource(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = fullMatchControlledMiniMatchRouteSourceSignature(defaultReport);
  const experimentalSignature = fullMatchControlledMiniMatchRouteSourceSignature(experimentalReport);
  const routeSourceFact = experimentalReport.evidenceFacts.find((fact) => fact.category === "WORKBENCH_CHAIN_CONTROLLED_MINIMATCH_ROUTE_SOURCE");
  const diagnosis = experimentalReport.tacticalReport.diagnoses.find((candidate) =>
    candidate.summary.includes("source de route controlee pour mini-match"),
  );

  assertTest(defaultSignature.controlledMiniMatchRouteSourceTagCount === 0, "default runFullMatch must not expose controlled mini-match route source tags.");
  assertTest(experimentalSignature.segmentRouteInputTagCount > 0, "experimental runFullMatch must still expose SegmentRouteInput tags.");
  assertTest(experimentalSignature.controlledMiniMatchRouteSourceTagCount > 0, "experimental runFullMatch must expose controlled mini-match route source tags.");
  assertTest(experimentalSignature.routeSourceCandidateId === "chain-context-forward-progress-sh", "controlled route source signature must expose candidate.");
  assertTest(experimentalSignature.routeSourceActionType === "FORWARD_PROGRESS", "controlled route source signature must expose action.");
  assertTest(experimentalSignature.routeSourceReceiverId === "control-space-hunter", "controlled route source signature must expose receiver.");
  assertTest(experimentalSignature.routeSourceTargetZone === "Z4-HSR", "controlled route source signature must expose target zone.");
  assertTest(experimentalSignature.candidateLegal, "controlled route source candidate must be legal.");
  assertTest(experimentalSignature.candidateAvailable, "controlled route source candidate must be available.");
  assertTest(experimentalSignature.rejectedClosedCandidateCount >= 1, "controlled route source signature must expose closed rejection count.");
  assertTest(experimentalSignature.rejectedUnavailableCandidateCount >= 1, "controlled route source signature must expose unavailable rejection count.");
  assertTest(routeSourceFact !== undefined, "experimental report must include controlled mini-match route source evidence.");
  assertTest(routeSourceFact?.internalTags.includes("controlled_minimatch_route_source_diagnostic_only") ?? false, "controlled route source evidence must be diagnostic-only.");
  assertTest(routeSourceFact?.internalTags.includes("controlled_minimatch_route_source_live_resolution_forbidden") ?? false, "controlled route source evidence must forbid live mini-match resolution.");
  assertTest(routeSourceFact?.summary.includes("segment_route_input") ?? false, "controlled route source evidence must include SegmentRouteInput origin.");
  assertTest(diagnosis !== undefined, "experimental coach diagnosis must mention controlled mini-match route source.");
  assertTest(diagnosis?.summary.includes("ne pilote pas encore la resolution live du mini-match") ?? false, "coach diagnosis must state controlled route source is not live-driving.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_DIAGNOSTIC_ONLY"), "experimental limitations must mark controlled route source diagnostic-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_MINIMATCH_ROUTE_SOURCE_CANNOT_DRIVE_LIVE_MINIMATCH_RESOLUTION"), "experimental limitations must forbid live mini-match resolution.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "experimental report must not claim production chain-driven full-match.");

  return [
    "default runFullMatch has no controlled mini-match route source tags",
    "experimental runFullMatch has controlled mini-match route source tags",
    "experimental report includes controlled mini-match route source evidence",
    "controlled mini-match route source exposes candidate, action, receiver, and target zone",
    "controlled mini-match route source is legal and available",
    "closed and unavailable candidates remain rejected",
    "experimental coach diagnosis mentions controlled mini-match route source",
    "controlled mini-match route source is diagnostic-only and live-resolution forbidden",
    "normal full-match is not claimed as production chain-driven",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalControlledMiniMatchRouteSource();

  console.log("runFullMatchExperimentalControlledMiniMatchRouteSource tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

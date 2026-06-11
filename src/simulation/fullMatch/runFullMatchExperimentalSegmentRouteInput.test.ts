import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchSegmentRouteInputSignature } from "./fullMatchSegmentRouteInputSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalSegmentRouteInput(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = fullMatchSegmentRouteInputSignature(defaultReport);
  const experimentalSignature = fullMatchSegmentRouteInputSignature(experimentalReport);
  const routeInputFact = experimentalReport.evidenceFacts.find((fact) => fact.category === "WORKBENCH_CHAIN_SEGMENT_ROUTE_INPUT");
  const diagnosis = experimentalReport.tacticalReport.diagnoses.find((candidate) =>
    candidate.summary.includes("input de route experimental"),
  );

  assertTest(defaultSignature.segmentRouteInputTagCount === 0, "default runFullMatch must not expose SegmentRouteInput tags.");
  assertTest(experimentalSignature.controlledSegmentSelectionTagCount > 0, "experimental runFullMatch must still expose controlled selection tags.");
  assertTest(experimentalSignature.segmentRouteInputTagCount > 0, "experimental runFullMatch must expose SegmentRouteInput tags.");
  assertTest(experimentalSignature.routeInputCandidateId === "chain-context-forward-progress-sh", "SegmentRouteInput signature must expose candidate.");
  assertTest(experimentalSignature.routeInputActionType === "FORWARD_PROGRESS", "SegmentRouteInput signature must expose action.");
  assertTest(experimentalSignature.routeInputReceiverId === "control-space-hunter", "SegmentRouteInput signature must expose receiver.");
  assertTest(experimentalSignature.routeInputTargetZone === "Z4-HSR", "SegmentRouteInput signature must expose target zone.");
  assertTest(experimentalSignature.candidateLegal, "SegmentRouteInput candidate must be legal.");
  assertTest(experimentalSignature.candidateAvailable, "SegmentRouteInput candidate must be available.");
  assertTest(experimentalSignature.rejectedClosedCandidateCount >= 1, "SegmentRouteInput signature must expose closed rejection count.");
  assertTest(experimentalSignature.rejectedUnavailableCandidateCount >= 1, "SegmentRouteInput signature must expose unavailable rejection count.");
  assertTest(routeInputFact !== undefined, "experimental report must include SegmentRouteInput evidence.");
  assertTest(routeInputFact?.internalTags.includes("segment_route_input_diagnostic_only") ?? false, "SegmentRouteInput evidence must be diagnostic-only.");
  assertTest(routeInputFact?.internalTags.includes("segment_route_input_production_resolution_forbidden") ?? false, "SegmentRouteInput evidence must forbid production route resolution.");
  assertTest(routeInputFact?.summary.includes("controlled_segment_selection") ?? false, "SegmentRouteInput evidence must include controlled selection source.");
  assertTest(diagnosis !== undefined, "experimental coach diagnosis must mention SegmentRouteInput.");
  assertTest(diagnosis?.summary.includes("ne pilote pas encore la resolution reelle") ?? false, "coach diagnosis must state SegmentRouteInput is not production-driving.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SEGMENT_ROUTE_INPUT_DIAGNOSTIC_ONLY"), "experimental limitations must mark SegmentRouteInput diagnostic-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_SEGMENT_ROUTE_INPUT_CANNOT_DRIVE_PRODUCTION_ROUTE_RESOLUTION"), "experimental limitations must forbid production route resolution.");
  assertTest(experimentalReport.reportMeta.limitations.includes("NORMAL_FULLMATCH_STILL_SEGMENT_HARNESS_BY_DEFAULT"), "experimental report must not claim production chain-driven full-match.");

  return [
    "default runFullMatch has no SegmentRouteInput tags",
    "experimental runFullMatch has SegmentRouteInput tags",
    "experimental report includes SegmentRouteInput evidence",
    "SegmentRouteInput exposes candidate, action, receiver, and target zone",
    "SegmentRouteInput is legal and available",
    "closed and unavailable candidates remain rejected",
    "experimental coach diagnosis mentions SegmentRouteInput",
    "SegmentRouteInput is diagnostic-only and production route resolution forbidden",
    "normal full-match is not claimed as production chain-driven",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalSegmentRouteInput();

  console.log("runFullMatchExperimentalSegmentRouteInput tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

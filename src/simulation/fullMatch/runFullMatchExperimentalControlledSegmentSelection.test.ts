import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { runFullMatch } from "../runFullMatch";
import { fullMatchControlledSegmentSelectionSignature } from "./fullMatchControlledSegmentSelectionSignature";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateRunFullMatchExperimentalControlledSegmentSelection(): readonly string[] {
  const input = engineToCoachPublicContractFixtures.matchInputFixture;
  const defaultReport = runFullMatch(input);
  const experimentalReport = runFullMatch(input, {
    routeSelectionMode: "workbench_chain_replay_experimental",
  });
  const defaultSignature = fullMatchControlledSegmentSelectionSignature(defaultReport);
  const experimentalSignature = fullMatchControlledSegmentSelectionSignature(experimentalReport);
  const controlledFact = experimentalReport.evidenceFacts.find((fact) => fact.category === "WORKBENCH_CHAIN_CONTROLLED_SEGMENT_SELECTION");
  const diagnosis = experimentalReport.tacticalReport.diagnoses.find((candidate) =>
    candidate.summary.includes("selection controlee experimentale"),
  );

  assertTest(defaultSignature.controlledSegmentSelectionTagCount === 0, "default runFullMatch must not expose controlled selection tags.");
  assertTest(experimentalSignature.shadowRouteSelectionTagCount > 0, "experimental runFullMatch must still expose shadow route selection tags.");
  assertTest(experimentalSignature.controlledSegmentSelectionTagCount > 0, "experimental runFullMatch must expose controlled selection tags.");
  assertTest(experimentalSignature.controlledSelectionCandidateId === "chain-context-forward-progress-sh", "controlled signature must expose selected candidate.");
  assertTest(experimentalSignature.controlledSelectionActionType === "FORWARD_PROGRESS", "controlled signature must expose selected action.");
  assertTest(experimentalSignature.controlledSelectionReceiverId === "control-space-hunter", "controlled signature must expose selected receiver.");
  assertTest(experimentalSignature.controlledSelectionTargetZone === "Z4-HSR", "controlled signature must expose selected target zone.");
  assertTest(experimentalSignature.selectedCandidateLegal, "controlled selected candidate must be legal.");
  assertTest(experimentalSignature.selectedCandidateAvailable, "controlled selected candidate must be available.");
  assertTest(experimentalSignature.rejectedClosedCandidateCount >= 1, "controlled signature must expose closed rejection count.");
  assertTest(experimentalSignature.rejectedUnavailableCandidateCount >= 1, "controlled signature must expose unavailable rejection count.");
  assertTest(controlledFact !== undefined, "experimental report must include controlled segment selection evidence.");
  assertTest(controlledFact?.internalTags.includes("controlled_segment_selection_diagnostic_only") ?? false, "controlled evidence must be diagnostic-only.");
  assertTest(controlledFact?.internalTags.includes("controlled_segment_selection_production_fullmatch_forbidden") ?? false, "controlled evidence must forbid production full-match selection.");
  assertTest(controlledFact?.summary.includes("chain-context-forward-progress-sh") ?? false, "controlled evidence must include selected candidate.");
  assertTest(diagnosis !== undefined, "experimental coach diagnosis must mention controlled segment selection.");
  assertTest(diagnosis?.summary.includes("ne pilote pas encore la resolution reelle du full-match") ?? false, "coach diagnosis must state controlled selection is not production-driving.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_SELECTION_DIAGNOSTIC_ONLY"), "experimental limitations must mark controlled selection diagnostic-only.");
  assertTest(experimentalReport.reportMeta.limitations.includes("FULLMATCH_CONTROLLED_SEGMENT_SELECTION_CANNOT_DRIVE_PRODUCTION_FULLMATCH_SELECTION"), "experimental limitations must forbid production full-match selection.");

  return [
    "default runFullMatch has no controlled segment selection tags",
    "experimental runFullMatch has controlled segment selection tags",
    "experimental report includes controlled segment selection evidence",
    "controlled selection exposes candidate, action, receiver, and target zone",
    "controlled selection is legal and available",
    "closed and unavailable candidates remain rejected",
    "experimental coach diagnosis mentions controlled segment selection",
    "controlled selection is diagnostic-only and production-forbidden",
  ];
}

if (require.main === module) {
  const checks = validateRunFullMatchExperimentalControlledSegmentSelection();

  console.log("runFullMatchExperimentalControlledSegmentSelection tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

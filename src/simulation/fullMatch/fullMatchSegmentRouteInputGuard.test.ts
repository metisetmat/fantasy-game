import type { FullMatchControlledSegmentSelectionResult } from "./fullMatchControlledSegmentSelection";
import {
  segmentRouteInputCannotDriveProductionRouteResolution,
  segmentRouteInputCannotMutateScore,
  segmentRouteInputFromControlledSelection,
  validateSegmentRouteInput,
} from "./segmentRouteInputFromControlledSelection";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function controlledSelectionOverride(
  overrides: Partial<FullMatchControlledSegmentSelectionResult>,
): FullMatchControlledSegmentSelectionResult {
  return {
    status: "available",
    scope: "experimental_controlled_segment_selection",
    source: "shadow_route_selection",
    segmentLabel: "segment-1",
    chainId: "sequence-1-multi-action-chain",
    selectedCandidateId: "chain-context-forward-progress-sh",
    selectedActionType: "FORWARD_PROGRESS",
    selectedReceiverId: "control-space-hunter",
    selectedTargetZone: "Z4-HSR",
    selectedBaseScore: 82,
    selectedInfluenceDelta: 5,
    selectedInfluencedScore: 87,
    selectedCandidateLegal: true,
    selectedCandidateAvailable: true,
    rejectedClosedCandidateCount: 1,
    rejectedUnavailableCandidateCount: 1,
    diagnosticOnly: true,
    experimentalControlledSelection: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canMutateRouteSuccessRates: false,
    canDriveProductionFullMatchSelection: false,
    tags: [],
    warnings: [],
    ...overrides,
  };
}

export function validateFullMatchSegmentRouteInputGuard(): readonly string[] {
  const legalRouteInput = segmentRouteInputFromControlledSelection({
    controlledSelection: controlledSelectionOverride({}),
  });
  const illegalRouteInput = segmentRouteInputFromControlledSelection({
    controlledSelection: controlledSelectionOverride({
      selectedCandidateId: "chain-context-closed-central-force",
      selectedCandidateLegal: false,
    }),
  });
  const unavailableRouteInput = segmentRouteInputFromControlledSelection({
    controlledSelection: controlledSelectionOverride({
      selectedCandidateId: "chain-context-unavailable-switch",
      selectedCandidateAvailable: false,
    }),
  });
  const { selectedCandidateId: _removedCandidateId, ...missingCandidateSelection } = controlledSelectionOverride({});
  const missingRouteInput = segmentRouteInputFromControlledSelection({
    controlledSelection: missingCandidateSelection,
  });

  assertTest(legalRouteInput.status === "available", "legal controlled selection must produce available SegmentRouteInput.");
  assertTest(illegalRouteInput.status !== "available", "CLOSED/illegal candidate cannot become available SegmentRouteInput.");
  assertTest(unavailableRouteInput.status !== "available", "unavailable candidate cannot become available SegmentRouteInput.");
  assertTest(missingRouteInput.status !== "available", "missing candidate cannot become available SegmentRouteInput.");
  assertTest(validateSegmentRouteInput(legalRouteInput).length === 0, "legal SegmentRouteInput validation must pass.");
  assertTest(validateSegmentRouteInput(illegalRouteInput).length > 0, "illegal SegmentRouteInput validation must warn.");
  assertTest(segmentRouteInputCannotMutateScore(legalRouteInput), "SegmentRouteInput cannot mutate score surfaces.");
  assertTest(segmentRouteInputCannotDriveProductionRouteResolution(legalRouteInput), "SegmentRouteInput cannot drive production route resolution.");
  assertTest(!legalRouteInput.canMutateRouteSuccessRates, "SegmentRouteInput cannot mutate route success rates.");

  return [
    "legal controlled selection creates available SegmentRouteInput",
    "CLOSED candidate cannot become SegmentRouteInput",
    "unavailable candidate cannot become SegmentRouteInput",
    "missing selected candidate returns failed or partial SegmentRouteInput",
    "candidate must be legal and available",
    "SegmentRouteInput cannot drive production full-match selection",
    "SegmentRouteInput cannot drive production route resolution",
    "SegmentRouteInput cannot mutate route success rates",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchSegmentRouteInputGuard();

  console.log("fullMatchSegmentRouteInputGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

import type { FullMatchSegmentRouteInput } from "./fullMatchSegmentRouteInput";
import {
  controlledMiniMatchRouteSourceCannotDriveLiveMiniMatchResolution,
  controlledMiniMatchRouteSourceCannotMutateScore,
  controlledMiniMatchRouteSourceFromSegmentRouteInput,
  validateControlledMiniMatchRouteSource,
} from "./controlledMiniMatchRouteSourceFromSegmentRouteInput";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function segmentRouteInputOverride(
  overrides: Partial<FullMatchSegmentRouteInput>,
): FullMatchSegmentRouteInput {
  return {
    status: "available",
    scope: "experimental_segment_route_input",
    source: "controlled_segment_selection",
    segmentLabel: "segment-1",
    chainId: "sequence-1-multi-action-chain",
    candidateId: "chain-context-forward-progress-sh",
    actionType: "FORWARD_PROGRESS",
    receiverId: "control-space-hunter",
    targetZone: "Z4-HSR",
    sourceBaseScore: 82,
    sourceInfluenceDelta: 5,
    sourceInfluencedScore: 87,
    candidateLegal: true,
    candidateAvailable: true,
    rejectedClosedCandidateCount: 1,
    rejectedUnavailableCandidateCount: 1,
    diagnosticOnly: true,
    experimentalRouteInput: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canMutateRouteSuccessRates: false,
    canDriveProductionFullMatchSelection: false,
    canDriveProductionRouteResolution: false,
    tags: [],
    warnings: [],
    ...overrides,
  };
}

export function validateFullMatchControlledMiniMatchRouteSourceGuard(): readonly string[] {
  const legalRouteSource = controlledMiniMatchRouteSourceFromSegmentRouteInput({
    segmentRouteInput: segmentRouteInputOverride({}),
  });
  const illegalRouteSource = controlledMiniMatchRouteSourceFromSegmentRouteInput({
    segmentRouteInput: segmentRouteInputOverride({
      candidateId: "chain-context-closed-central-force",
      candidateLegal: false,
    }),
  });
  const unavailableRouteSource = controlledMiniMatchRouteSourceFromSegmentRouteInput({
    segmentRouteInput: segmentRouteInputOverride({
      candidateId: "chain-context-unavailable-switch",
      candidateAvailable: false,
    }),
  });
  const { candidateId: _removedCandidateId, ...missingCandidateInput } = segmentRouteInputOverride({});
  const missingRouteSource = controlledMiniMatchRouteSourceFromSegmentRouteInput({
    segmentRouteInput: missingCandidateInput,
  });

  assertTest(legalRouteSource.status === "available", "legal SegmentRouteInput must produce available controlled mini-match route source.");
  assertTest(illegalRouteSource.status !== "available", "CLOSED/illegal candidate cannot become available controlled mini-match route source.");
  assertTest(unavailableRouteSource.status !== "available", "unavailable candidate cannot become available controlled mini-match route source.");
  assertTest(missingRouteSource.status !== "available", "missing candidate cannot become available controlled mini-match route source.");
  assertTest(validateControlledMiniMatchRouteSource(legalRouteSource).length === 0, "legal controlled route source validation must pass.");
  assertTest(validateControlledMiniMatchRouteSource(illegalRouteSource).length > 0, "illegal controlled route source validation must warn.");
  assertTest(controlledMiniMatchRouteSourceCannotMutateScore(legalRouteSource), "controlled route source cannot mutate score surfaces.");
  assertTest(controlledMiniMatchRouteSourceCannotDriveLiveMiniMatchResolution(legalRouteSource), "controlled route source cannot drive production or live mini-match resolution.");
  assertTest(!legalRouteSource.canMutateRouteSuccessRates, "controlled route source cannot mutate route success rates.");

  return [
    "legal SegmentRouteInput creates available controlled mini-match route source",
    "CLOSED candidate cannot become controlled mini-match route source",
    "unavailable candidate cannot become controlled mini-match route source",
    "missing selected candidate returns failed or partial controlled route source",
    "candidate must be legal and available",
    "controlled route source cannot drive production full-match selection",
    "controlled route source cannot drive production route resolution",
    "controlled route source cannot drive live mini-match resolution",
    "controlled route source cannot mutate route success rates",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchControlledMiniMatchRouteSourceGuard();

  console.log("fullMatchControlledMiniMatchRouteSourceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

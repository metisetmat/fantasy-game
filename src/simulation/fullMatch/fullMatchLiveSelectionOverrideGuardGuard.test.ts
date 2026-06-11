import type { FullMatchControlledMiniMatchRouteSource } from "./fullMatchControlledMiniMatchRouteSource";
import {
  liveSelectionOverrideGuardCannotDriveNormalLiveResolution,
  liveSelectionOverrideGuardCannotMutateScore,
  liveSelectionOverrideGuardFromControlledRouteSource,
  validateLiveSelectionOverrideGuard,
} from "./liveSelectionOverrideGuardFromControlledRouteSource";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function controlledRouteSourceOverride(
  overrides: Partial<FullMatchControlledMiniMatchRouteSource>,
): FullMatchControlledMiniMatchRouteSource {
  return {
    status: "available",
    scope: "experimental_controlled_minimatch_route_source",
    origin: "segment_route_input",
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
    experimentalControlledRouteSource: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canMutateRouteSuccessRates: false,
    canDriveProductionFullMatchSelection: false,
    canDriveProductionRouteResolution: false,
    canDriveLiveMiniMatchResolution: false,
    tags: [],
    warnings: [],
    ...overrides,
  };
}

export function validateFullMatchLiveSelectionOverrideGuardGuard(): readonly string[] {
  const legalGuard = liveSelectionOverrideGuardFromControlledRouteSource({
    controlledRouteSource: controlledRouteSourceOverride({}),
  });
  const illegalGuard = liveSelectionOverrideGuardFromControlledRouteSource({
    controlledRouteSource: controlledRouteSourceOverride({
      candidateId: "chain-context-closed-central-force",
      candidateLegal: false,
    }),
  });
  const unavailableGuard = liveSelectionOverrideGuardFromControlledRouteSource({
    controlledRouteSource: controlledRouteSourceOverride({
      candidateId: "chain-context-unavailable-switch",
      candidateAvailable: false,
    }),
  });
  const { candidateId: _removedCandidateId, ...missingCandidateSource } = controlledRouteSourceOverride({});
  const missingGuard = liveSelectionOverrideGuardFromControlledRouteSource({
    controlledRouteSource: missingCandidateSource,
  });

  assertTest(legalGuard.status === "available", "legal controlled route source must produce available live selection override guard.");
  assertTest(illegalGuard.status !== "available", "CLOSED/illegal candidate cannot become available live selection override guard.");
  assertTest(unavailableGuard.status !== "available", "unavailable candidate cannot become available live selection override guard.");
  assertTest(missingGuard.status !== "available", "missing candidate cannot become available live selection override guard.");
  assertTest(validateLiveSelectionOverrideGuard(legalGuard).length === 0, "legal live selection override guard validation must pass.");
  assertTest(validateLiveSelectionOverrideGuard(illegalGuard).length > 0, "illegal live selection override guard validation must warn.");
  assertTest(liveSelectionOverrideGuardCannotMutateScore(legalGuard), "override guard cannot mutate score surfaces.");
  assertTest(liveSelectionOverrideGuardCannotDriveNormalLiveResolution(legalGuard), "override guard cannot drive production or normal live mini-match resolution.");
  assertTest(!legalGuard.canCreateScoringEvents, "override guard cannot create scoring events.");
  assertTest(!legalGuard.canMutateRouteSuccessRates, "override guard cannot mutate route success rates.");

  return [
    "legal controlled route source creates available live selection override guard",
    "CLOSED candidate cannot become live selection override",
    "unavailable candidate cannot become live selection override",
    "missing candidate returns blocked or failed live selection override guard",
    "candidate must be legal and available",
    "override guard cannot drive production full-match selection",
    "override guard cannot drive production route resolution",
    "override guard cannot drive normal live mini-match resolution",
    "override guard cannot create scoring events",
    "override guard cannot mutate route success rates",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchLiveSelectionOverrideGuardGuard();

  console.log("fullMatchLiveSelectionOverrideGuardGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

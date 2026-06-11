import { controlledSegmentReplayComparisonFromExperiment } from "./controlledSegmentReplayComparisonFromExperiment";
import type { FullMatchIsolatedMiniMatchOverrideExperiment } from "./fullMatchIsolatedMiniMatchOverrideExperiment";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function experimentFixture(overrides?: Partial<FullMatchIsolatedMiniMatchOverrideExperiment>): FullMatchIsolatedMiniMatchOverrideExperiment {
  return {
    status: "available",
    scope: "isolated_minimatch_override_experiment",
    origin: "live_selection_override_guard",
    segmentLabel: "segment-1",
    chainId: "sequence-1-multi-action-chain",
    baselineCandidateId: "chain-context-safe-recycle-pv",
    baselineActionType: "SAFE_RECYCLE",
    baselineReceiverId: "control-pivot",
    baselineTargetZone: "Z2-HSL",
    overrideCandidateId: "chain-context-forward-progress-sh",
    overrideActionType: "FORWARD_PROGRESS",
    overrideReceiverId: "control-space-hunter",
    overrideTargetZone: "Z4-HSR",
    overrideAppliedInIsolatedExperiment: true,
    overrideAppliedToNormalLiveSelection: false,
    candidateLegal: true,
    candidateAvailable: true,
    rejectedClosedCandidateCount: 1,
    rejectedUnavailableCandidateCount: 1,
    isolatedSelectionDivergenceObserved: true,
    isolatedScoreDivergenceObserved: false,
    isolatedScoringEventDivergenceObserved: false,
    isolatedTimelineDivergenceObserved: false,
    diagnosticOnly: true,
    canMutateNormalFullMatchScore: false,
    canMutateNormalFullMatchScoringEvents: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    tags: [],
    warnings: [],
    ...overrides,
  };
}

function experimentWithoutOverrideCandidate(): FullMatchIsolatedMiniMatchOverrideExperiment {
  const { overrideCandidateId: _removedOverrideCandidateId, ...experiment } = experimentFixture();

  return experiment;
}

export function validateFullMatchControlledSegmentReplayComparisonGuard(): readonly string[] {
  const legal = controlledSegmentReplayComparisonFromExperiment({ experiment: experimentFixture() });
  const closed = controlledSegmentReplayComparisonFromExperiment({ experiment: experimentFixture({ candidateLegal: false }) });
  const unavailable = controlledSegmentReplayComparisonFromExperiment({ experiment: experimentFixture({ candidateAvailable: false }) });
  const missingOverride = controlledSegmentReplayComparisonFromExperiment({
    experiment: experimentWithoutOverrideCandidate(),
  });

  assertTest(legal.status === "available", "legal available experiment must produce available comparison.");
  assertTest(closed.status !== "available", "CLOSED/illegal override candidate cannot become controlled replay comparison.");
  assertTest(unavailable.status !== "available", "unavailable override candidate cannot become controlled replay comparison.");
  assertTest(missingOverride.status !== "available", "missing override candidate must return blocked or failed comparison.");
  assertTest(legal.override.candidateLegal, "override candidate must be legal.");
  assertTest(legal.override.candidateAvailable, "override candidate must be available.");
  assertTest(!legal.canMutateNormalFullMatchScore, "controlled replay comparison cannot mutate normal full-match score.");
  assertTest(!legal.canMutateNormalFullMatchScoringEvents, "controlled replay comparison cannot mutate normal scoring events.");
  assertTest(!legal.canCreateProductionScoringEvents, "controlled replay comparison cannot create production scoring events.");
  assertTest(!legal.canMutateProductionRouteResolution, "controlled replay comparison cannot mutate production route resolution.");
  assertTest(!legal.canMutateGlobalRouteSuccessRates, "controlled replay comparison cannot mutate global route success rates.");
  assertTest(!legal.canClaimGlobalEconomy, "controlled replay comparison cannot claim global economy.");

  return [
    "CLOSED override candidate cannot become controlled replay comparison",
    "unavailable override candidate cannot become controlled replay comparison",
    "missing override candidate returns blocked or failed",
    "override candidate must be legal and available",
    "controlled replay comparison cannot mutate normal full-match score",
    "controlled replay comparison cannot mutate normal full-match scoring events",
    "controlled replay comparison cannot create production scoring events",
    "controlled replay comparison cannot mutate production route resolution",
    "controlled replay comparison cannot mutate global route success rates",
    "controlled replay comparison cannot claim global economy",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchControlledSegmentReplayComparisonGuard();

  console.log("fullMatchControlledSegmentReplayComparisonGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

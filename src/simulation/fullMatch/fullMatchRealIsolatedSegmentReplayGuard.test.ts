import { controlledSegmentReplayComparisonFromExperiment } from "./controlledSegmentReplayComparisonFromExperiment";
import type { FullMatchIsolatedMiniMatchOverrideExperiment } from "./fullMatchIsolatedMiniMatchOverrideExperiment";
import { realIsolatedSegmentReplayFromComparison } from "./realIsolatedSegmentReplayFromComparison";

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

function replay(overrides?: Partial<FullMatchIsolatedMiniMatchOverrideExperiment>) {
  return realIsolatedSegmentReplayFromComparison({
    comparison: controlledSegmentReplayComparisonFromExperiment({ experiment: experimentFixture(overrides) }),
  });
}

function replayWithoutOverrideCandidate() {
  const { overrideCandidateId: _removedOverrideCandidateId, ...experiment } = experimentFixture();

  return realIsolatedSegmentReplayFromComparison({
    comparison: controlledSegmentReplayComparisonFromExperiment({ experiment }),
  });
}

export function validateFullMatchRealIsolatedSegmentReplayGuard(): readonly string[] {
  const legal = replay();
  const closed = replay({ candidateLegal: false });
  const unavailable = replay({ candidateAvailable: false });
  const missingOverride = replayWithoutOverrideCandidate();

  assertTest(legal.status === "available", "legal available comparison must produce available real isolated replay.");
  assertTest(closed.status !== "available", "CLOSED override candidate cannot produce available real isolated replay.");
  assertTest(unavailable.status !== "available", "unavailable override candidate cannot produce available real isolated replay.");
  assertTest(missingOverride.status !== "available", "missing override candidate must return blocked or failed.");
  assertTest(!legal.canInjectEventsIntoOfficialTimeline, "isolated replay cannot inject events into official timeline.");
  assertTest(!legal.canMutateOfficialScore, "isolated replay cannot mutate official score.");
  assertTest(!legal.canMutateOfficialScoringEvents, "isolated replay cannot mutate official scoring events.");
  assertTest(!legal.canCreateProductionScoringEvents, "isolated replay cannot create production scoring events.");
  assertTest(!legal.canMutateProductionRouteResolution, "isolated replay cannot mutate production route resolution.");
  assertTest(!legal.canMutateGlobalRouteSuccessRates, "isolated replay cannot mutate global route success rates.");
  assertTest(!legal.canClaimGlobalEconomy, "isolated replay cannot claim global economy.");

  return [
    "CLOSED override candidate cannot produce available real isolated replay",
    "unavailable override candidate cannot produce available real isolated replay",
    "missing override candidate returns blocked or failed",
    "isolated replay cannot inject official timeline events",
    "isolated replay cannot mutate score, scoring events, production route resolution, global route success, production scoring events, or global economy",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchRealIsolatedSegmentReplayGuard();

  console.log("fullMatchRealIsolatedSegmentReplayGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

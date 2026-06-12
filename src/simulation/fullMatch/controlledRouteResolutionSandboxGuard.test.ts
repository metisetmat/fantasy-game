import { controlledRouteResolutionSandboxFromReplay } from "./controlledRouteResolutionSandboxFromReplay";
import type { FullMatchRealIsolatedSegmentReplay } from "./fullMatchRealIsolatedSegmentReplay";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function replayWithOverride(input: {
  readonly candidateId?: string;
  readonly candidateLegal: boolean;
  readonly candidateAvailable: boolean;
}): FullMatchRealIsolatedSegmentReplay {
  return {
    status: "available",
    scope: "real_isolated_segment_replay",
    origin: "controlled_segment_replay_comparison",
    segmentLabel: "segment-1",
    baseline: {
      pathId: "baseline",
      candidateId: "chain-context-safe-recycle-pv",
      actionType: "SAFE_RECYCLE",
      receiverId: "control-pivot",
      targetZone: "Z2-HSL",
      candidateLegal: true,
      candidateAvailable: true,
      events: [],
      eventCount: 4,
      warnings: [],
    },
    override: {
      pathId: "override",
      ...(input.candidateId === undefined ? {} : { candidateId: input.candidateId }),
      actionType: "FORWARD_PROGRESS",
      receiverId: "control-space-hunter",
      targetZone: "Z4-HSR",
      candidateLegal: input.candidateLegal,
      candidateAvailable: input.candidateAvailable,
      events: [],
      eventCount: 5,
      warnings: [],
    },
    baselineEventCount: 4,
    overrideEventCount: 5,
    selectionDivergenceObserved: true,
    possessionContinuityDivergenceObserved: false,
    carrierDivergenceObserved: true,
    zoneProgressionDivergenceObserved: true,
    dangerCreationDivergenceObserved: true,
    scoringOpportunityDivergenceObserved: false,
    isolatedTimelineDivergenceObserved: true,
    isolatedScoringEventDivergenceObserved: false,
    isolatedScoreDivergenceObserved: false,
    replayAppliedOnlyInIsolatedEngine: true,
    replayAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: 1,
    rejectedUnavailableCandidateCount: 1,
    diagnosticOnly: true,
    canInjectEventsIntoOfficialTimeline: false,
    canMutateOfficialScore: false,
    canMutateOfficialScoringEvents: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    tags: [],
    warnings: [],
  };
}

export function validateControlledRouteResolutionSandboxGuard(): readonly string[] {
  const closed = controlledRouteResolutionSandboxFromReplay({
    replay: replayWithOverride({
      candidateId: "chain-context-forward-progress-sh",
      candidateLegal: false,
      candidateAvailable: true,
    }),
  });
  const unavailable = controlledRouteResolutionSandboxFromReplay({
    replay: replayWithOverride({
      candidateId: "chain-context-forward-progress-sh",
      candidateLegal: true,
      candidateAvailable: false,
    }),
  });
  const missing = controlledRouteResolutionSandboxFromReplay({
    replay: replayWithOverride({
      candidateLegal: true,
      candidateAvailable: true,
    }),
  });

  for (const sandbox of [closed, unavailable, missing]) {
    assertTest(sandbox.status !== "available", "blocked sandbox must not be available.");
    assertTest(!sandbox.canInjectEventsIntoOfficialTimeline, "sandbox cannot inject events into official timeline.");
    assertTest(!sandbox.canMutateOfficialScore, "sandbox cannot mutate official score.");
    assertTest(!sandbox.canMutateOfficialScoringEvents, "sandbox cannot mutate official scoring events.");
    assertTest(!sandbox.canCreateProductionScoringEvents, "sandbox cannot create production scoring events.");
    assertTest(!sandbox.canMutateProductionRouteResolution, "sandbox cannot mutate production route resolution.");
    assertTest(!sandbox.canMutateGlobalRouteSuccessRates, "sandbox cannot mutate global route success rates.");
    assertTest(!sandbox.canClaimGlobalEconomy, "sandbox cannot claim global economy.");
  }

  return [
    "CLOSED override candidate cannot produce available sandbox",
    "unavailable override candidate cannot produce available sandbox",
    "missing override candidate returns blocked or failed",
    "sandbox cannot mutate official or production outputs",
    "sandbox cannot claim global economy",
  ];
}

if (require.main === module) {
  const checks = validateControlledRouteResolutionSandboxGuard();

  console.log("controlledRouteResolutionSandboxGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

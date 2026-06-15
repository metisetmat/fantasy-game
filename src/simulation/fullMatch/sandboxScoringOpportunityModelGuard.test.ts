import { controlledRouteResolutionSandboxFromReplay } from "./controlledRouteResolutionSandboxFromReplay";
import type { FullMatchRealIsolatedSegmentReplay } from "./fullMatchRealIsolatedSegmentReplay";
import {
  sandboxScoringOpportunityCannotClaimGlobalEconomy,
  sandboxScoringOpportunityCannotMutateOfficialFullMatch,
  sandboxScoringOpportunityModelFromResolution,
} from "./sandboxScoringOpportunityModelFromResolution";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function replayFixture(input?: {
  readonly overrideCandidateLegal?: boolean;
  readonly overrideCandidateAvailable?: boolean;
  readonly overrideCandidateId?: string;
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
      ...(input?.overrideCandidateId === undefined ? {} : { candidateId: input.overrideCandidateId }),
      actionType: "FORWARD_PROGRESS",
      receiverId: "control-space-hunter",
      targetZone: "Z4-HSR",
      candidateLegal: input?.overrideCandidateLegal ?? true,
      candidateAvailable: input?.overrideCandidateAvailable ?? true,
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
    rejectedClosedCandidateCount: input?.overrideCandidateLegal === false ? 1 : 0,
    rejectedUnavailableCandidateCount: input?.overrideCandidateAvailable === false ? 1 : 0,
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

export function validateSandboxScoringOpportunityModelGuard(): readonly string[] {
  const available = sandboxScoringOpportunityModelFromResolution({
    sandbox: controlledRouteResolutionSandboxFromReplay({
      replay: replayFixture({ overrideCandidateId: "chain-context-forward-progress-sh" }),
    }),
  });
  const closed = sandboxScoringOpportunityModelFromResolution({
    sandbox: controlledRouteResolutionSandboxFromReplay({
      replay: replayFixture({
        overrideCandidateId: "chain-context-forward-progress-sh",
        overrideCandidateLegal: false,
      }),
    }),
  });
  const unavailable = sandboxScoringOpportunityModelFromResolution({
    sandbox: controlledRouteResolutionSandboxFromReplay({
      replay: replayFixture({
        overrideCandidateId: "chain-context-forward-progress-sh",
        overrideCandidateAvailable: false,
      }),
    }),
  });
  const missing = sandboxScoringOpportunityModelFromResolution({
    sandbox: controlledRouteResolutionSandboxFromReplay({ replay: replayFixture() }),
  });

  assertTest(available.status === "available", "available sandbox opportunity should be available.");
  assertTest(closed.status !== "available", "closed override candidate cannot produce available opportunity model.");
  assertTest(unavailable.status !== "available", "unavailable override candidate cannot produce available opportunity model.");
  assertTest(missing.status !== "available", "missing override candidate cannot produce available opportunity model.");
  assertTest(sandboxScoringOpportunityCannotMutateOfficialFullMatch(available), "available model cannot mutate official full-match.");
  assertTest(sandboxScoringOpportunityCannotClaimGlobalEconomy(available), "available model cannot claim global economy.");
  assertTest(!available.canInjectEventsIntoOfficialTimeline, "model cannot inject official timeline events.");
  assertTest(!available.canMutateOfficialScore, "model cannot mutate official score.");
  assertTest(!available.canMutateOfficialScoringEvents, "model cannot mutate official scoring events.");
  assertTest(!available.canCreateProductionScoringEvents, "model cannot create production scoring events.");
  assertTest(!available.canMutateProductionRouteResolution, "model cannot mutate production route resolution.");
  assertTest(!available.canMutateGlobalRouteSuccessRates, "model cannot mutate global route success rates.");
  assertTest(!available.canClaimGlobalEconomy, "model cannot claim global economy.");

  return [
    "CLOSED override candidate cannot produce available model",
    "unavailable override candidate cannot produce available model",
    "missing override candidate returns not available or blocked",
    "sandbox opportunity cannot inject events into official timeline",
    "sandbox opportunity cannot mutate official score, scoring events, production route resolution, route success rates, or global economy",
  ];
}

if (require.main === module) {
  const checks = validateSandboxScoringOpportunityModelGuard();

  console.log("sandboxScoringOpportunityModelGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

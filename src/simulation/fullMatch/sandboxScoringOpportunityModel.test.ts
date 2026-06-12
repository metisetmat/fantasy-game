import { controlledRouteResolutionSandboxFromReplay } from "./controlledRouteResolutionSandboxFromReplay";
import type { FullMatchRealIsolatedSegmentReplay } from "./fullMatchRealIsolatedSegmentReplay";
import { sandboxScoringOpportunityModelFromResolution } from "./sandboxScoringOpportunityModelFromResolution";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function replayFixture(): FullMatchRealIsolatedSegmentReplay {
  return {
    status: "available",
    scope: "real_isolated_segment_replay",
    origin: "controlled_segment_replay_comparison",
    segmentLabel: "segment-1",
    chainId: "sequence-1-multi-action-chain",
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
      resultingCarrierId: "control-pivot",
      resultingZone: "Z2-HSL",
      warnings: [],
    },
    override: {
      pathId: "override",
      candidateId: "chain-context-forward-progress-sh",
      actionType: "FORWARD_PROGRESS",
      receiverId: "control-space-hunter",
      targetZone: "Z4-HSR",
      candidateLegal: true,
      candidateAvailable: true,
      events: [],
      eventCount: 5,
      resultingCarrierId: "control-space-hunter",
      resultingZone: "Z4-HSR",
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

export function validateSandboxScoringOpportunityModel(): readonly string[] {
  const sandbox = controlledRouteResolutionSandboxFromReplay({ replay: replayFixture() });
  const model = sandboxScoringOpportunityModelFromResolution({ sandbox });

  assertTest(model.status === "available", "sandbox opportunity model must be available.");
  assertTest(model.origin === "controlled_route_resolution_sandbox", "opportunity model origin mismatch.");
  assertTest(model.segmentLabel === "segment-1", "opportunity model must attach to segment-1.");
  assertTest(model.baseline.candidateId === "chain-context-safe-recycle-pv", "baseline candidate mismatch.");
  assertTest(model.baseline.actionType === "SAFE_RECYCLE", "baseline action mismatch.");
  assertTest(model.baseline.receiverId === "control-pivot", "baseline receiver mismatch.");
  assertTest(model.baseline.targetZone === "Z2-HSL", "baseline target zone mismatch.");
  assertTest(model.baseline.routeOutcome === "safe_retention", "baseline route outcome mismatch.");
  assertTest(model.baseline.sourceDangerProbability === 18, "baseline source danger probability must be 18.");
  assertTest(model.baseline.sourceScoringOpportunityProbability === 5, "baseline source scoring opportunity probability must be 5.");
  assertTest(model.baseline.opportunityType === "no_opportunity", "baseline opportunity type must be no_opportunity.");
  assertTest(model.baseline.opportunityFamily === "none", "baseline opportunity family must be none.");
  assertTest(model.baseline.opportunityProbability === 5, "baseline opportunity probability must be 5.");
  assertTest(!model.baseline.opportunityCreated, "baseline opportunity must not be created.");
  assertTest(model.override.candidateId === "chain-context-forward-progress-sh", "override candidate mismatch.");
  assertTest(model.override.actionType === "FORWARD_PROGRESS", "override action mismatch.");
  assertTest(model.override.receiverId === "control-space-hunter", "override receiver mismatch.");
  assertTest(model.override.targetZone === "Z4-HSR", "override target zone mismatch.");
  assertTest(model.override.routeOutcome === "dangerous_progression", "override route outcome mismatch.");
  assertTest(model.override.sourceDangerProbability === 64, "override source danger probability must be 64.");
  assertTest(model.override.sourceScoringOpportunityProbability === 24, "override source scoring opportunity probability must be 24.");
  assertTest(model.override.opportunityType === "half_chance", "override opportunity type must be half_chance.");
  assertTest(model.override.opportunityFamily === "territorial_danger", "override opportunity family must be territorial_danger.");
  assertTest(model.override.opportunityProbability === 24, "override opportunity probability must be 24.");
  assertTest(model.override.opportunityCreated, "override opportunity must be created.");
  assertTest(model.opportunityTypeDivergenceObserved, "opportunity type divergence must be observed.");
  assertTest(model.opportunityFamilyDivergenceObserved, "opportunity family divergence must be observed.");
  assertTest(model.opportunityProbabilityDivergenceObserved, "opportunity probability divergence must be observed.");
  assertTest(model.opportunityCreationDivergenceObserved, "opportunity creation divergence must be observed.");
  assertTest(!model.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence must remain false.");
  assertTest(!model.sandboxScoreDivergenceObserved, "sandbox score divergence must remain false.");
  assertTest(model.modelAppliedOnlyInSandbox, "model must apply only in sandbox.");
  assertTest(!model.modelAppliedToNormalLiveSelection, "model must not apply to normal live selection.");
  assertTest(!model.baseline.sandboxScoringEventCreated, "baseline must not create sandbox scoring event.");
  assertTest(!model.override.sandboxScoringEventCreated, "override must not create sandbox scoring event.");
  assertTest(model.baseline.sandboxScoreDelta === 0, "baseline sandbox score delta must remain 0.");
  assertTest(model.override.sandboxScoreDelta === 0, "override sandbox score delta must remain 0.");
  assertTest(!model.canInjectEventsIntoOfficialTimeline, "model cannot inject events into official timeline.");
  assertTest(!model.canMutateOfficialScore, "model cannot mutate official score.");
  assertTest(!model.canMutateOfficialScoringEvents, "model cannot mutate official scoring events.");
  assertTest(!model.canCreateProductionScoringEvents, "model cannot create production scoring events.");
  assertTest(!model.canClaimGlobalEconomy, "model cannot claim global economy.");

  return [
    "sandbox scoring opportunity model status is available",
    "baseline opportunity type is no_opportunity",
    "override opportunity type is half_chance",
    "opportunity divergences are observed",
    "sandbox opportunity creates no scoring event and no score delta",
    "sandbox opportunity remains isolated-only",
  ];
}

if (require.main === module) {
  const checks = validateSandboxScoringOpportunityModel();

  console.log("sandboxScoringOpportunityModel tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

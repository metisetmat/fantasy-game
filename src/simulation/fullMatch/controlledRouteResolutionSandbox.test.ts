import { controlledRouteResolutionSandboxFromReplay } from "./controlledRouteResolutionSandboxFromReplay";
import type { FullMatchRealIsolatedSegmentReplay } from "./fullMatchRealIsolatedSegmentReplay";

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

export function validateControlledRouteResolutionSandbox(): readonly string[] {
  const sandbox = controlledRouteResolutionSandboxFromReplay({ replay: replayFixture() });

  assertTest(sandbox.status === "available", "controlled route resolution sandbox must be available.");
  assertTest(sandbox.origin === "real_isolated_segment_replay", "sandbox origin must be real isolated replay.");
  assertTest(sandbox.segmentLabel === "segment-1", "sandbox must attach to segment-1.");
  assertTest(sandbox.baseline.candidateId === "chain-context-safe-recycle-pv", "baseline candidate mismatch.");
  assertTest(sandbox.baseline.actionType === "SAFE_RECYCLE", "baseline action mismatch.");
  assertTest(sandbox.baseline.receiverId === "control-pivot", "baseline receiver mismatch.");
  assertTest(sandbox.baseline.targetZone === "Z2-HSL", "baseline zone mismatch.");
  assertTest(sandbox.baseline.routeResolved, "baseline route must resolve.");
  assertTest(sandbox.baseline.outcome === "safe_retention", "baseline outcome must be safe_retention.");
  assertTest(sandbox.baseline.resultingCarrierId === "control-pivot", "baseline resulting carrier mismatch.");
  assertTest(sandbox.baseline.resultingZone === "Z2-HSL", "baseline resulting zone mismatch.");
  assertTest(sandbox.override.candidateId === "chain-context-forward-progress-sh", "override candidate mismatch.");
  assertTest(sandbox.override.actionType === "FORWARD_PROGRESS", "override action mismatch.");
  assertTest(sandbox.override.receiverId === "control-space-hunter", "override receiver mismatch.");
  assertTest(sandbox.override.targetZone === "Z4-HSR", "override zone mismatch.");
  assertTest(sandbox.override.routeResolved, "override route must resolve.");
  assertTest(sandbox.override.outcome === "dangerous_progression", "override outcome must be dangerous_progression.");
  assertTest(sandbox.override.resultingCarrierId === "control-space-hunter", "override resulting carrier mismatch.");
  assertTest(sandbox.override.resultingZone === "Z4-HSR", "override resulting zone mismatch.");
  assertTest(sandbox.override.dangerProbability > sandbox.baseline.dangerProbability, "override must carry higher danger probability.");
  assertTest(sandbox.override.turnoverRisk >= sandbox.baseline.turnoverRisk, "override turnover risk must be >= baseline.");
  assertTest(sandbox.override.scoringOpportunityProbability >= sandbox.baseline.scoringOpportunityProbability, "override scoring opportunity probability must be >= baseline.");
  assertTest(sandbox.selectionDivergenceObserved, "selection divergence must be observed.");
  assertTest(sandbox.carrierDivergenceObserved, "carrier divergence must be observed.");
  assertTest(sandbox.zoneProgressionDivergenceObserved, "zone progression divergence must be observed.");
  assertTest(sandbox.dangerCreationDivergenceObserved, "danger creation divergence must be observed.");
  assertTest(!sandbox.scoringOpportunityDivergenceObserved, "scoring opportunity divergence should remain false.");
  assertTest(!sandbox.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence should remain false.");
  assertTest(!sandbox.sandboxScoreDivergenceObserved, "sandbox score divergence should remain false.");
  assertTest(sandbox.sandboxAppliedOnlyInIsolatedResolution, "sandbox must apply only in isolated resolution.");
  assertTest(!sandbox.sandboxAppliedToNormalLiveSelection, "sandbox must not apply to normal live selection.");
  assertTest(sandbox.diagnosticOnly, "sandbox must be diagnostic-only.");
  assertTest(!sandbox.canInjectEventsIntoOfficialTimeline, "sandbox cannot inject official timeline events.");
  assertTest(!sandbox.canMutateOfficialScore, "sandbox cannot mutate official score.");
  assertTest(!sandbox.canMutateOfficialScoringEvents, "sandbox cannot mutate official scoring events.");
  assertTest(!sandbox.canCreateProductionScoringEvents, "sandbox cannot create production scoring events.");
  assertTest(!sandbox.canClaimGlobalEconomy, "sandbox cannot claim global economy.");

  return [
    "controlled route resolution sandbox status is available",
    "sandbox origin is real_isolated_segment_replay",
    "baseline route resolves as safe_retention",
    "override route resolves as dangerous_progression",
    "override danger probability is greater than baseline",
    "sandbox remains isolated-only and diagnostic-only",
  ];
}

if (require.main === module) {
  const checks = validateControlledRouteResolutionSandbox();

  console.log("controlledRouteResolutionSandbox tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

import { controlledRouteResolutionSandboxFromReplay } from "./controlledRouteResolutionSandboxFromReplay";
import type { FullMatchRealIsolatedSegmentReplay } from "./fullMatchRealIsolatedSegmentReplay";
import { sandboxScoringOpportunityModelFromResolution } from "./sandboxScoringOpportunityModelFromResolution";
import { sandboxScoringEventCandidateModelFromOpportunity } from "./sandboxScoringEventCandidateModelFromOpportunity";

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

export function validateSandboxScoringEventCandidate(): readonly string[] {
  const sandbox = controlledRouteResolutionSandboxFromReplay({ replay: replayFixture() });
  const opportunityModel = sandboxScoringOpportunityModelFromResolution({ sandbox });
  const model = sandboxScoringEventCandidateModelFromOpportunity({ opportunityModel });

  assertTest(model.status === "available", "sandbox scoring event candidate model must be available.");
  assertTest(model.origin === "sandbox_scoring_opportunity_model", "candidate model origin mismatch.");
  assertTest(model.baseline.sourceOpportunityType === "no_opportunity", "baseline source opportunity mismatch.");
  assertTest(model.baseline.scoringCandidateType === "NO_SCORING_EVENT", "baseline candidate type mismatch.");
  assertTest(model.baseline.scoringCandidateFamily === "none", "baseline candidate family mismatch.");
  assertTest(model.baseline.scoringCandidateProbability === 0, "baseline candidate probability must be 0.");
  assertTest(model.baseline.conversionProbability === 0, "baseline conversion probability must be 0.");
  assertTest(!model.baseline.scoringCandidateCreated, "baseline scoring candidate must not be created.");
  assertTest(model.override.sourceOpportunityType === "half_chance", "override source opportunity mismatch.");
  assertTest(model.override.scoringCandidateType === "SHOT_CANDIDATE", "override candidate type must be SHOT_CANDIDATE.");
  assertTest(model.override.scoringCandidateFamily === "shot", "override candidate family must be shot.");
  assertTest(model.override.scoringCandidateProbability === 24, "override candidate probability must be 24.");
  assertTest(model.override.conversionProbability > model.baseline.conversionProbability, "override conversion must beat baseline.");
  assertTest(model.override.scoringCandidateCreated, "override scoring candidate must be created.");
  assertTest(model.scoringCandidateTypeDivergenceObserved, "candidate type divergence must be observed.");
  assertTest(model.scoringCandidateFamilyDivergenceObserved, "candidate family divergence must be observed.");
  assertTest(model.scoringCandidateProbabilityDivergenceObserved, "candidate probability divergence must be observed.");
  assertTest(model.scoringCandidateCreationDivergenceObserved, "candidate creation divergence must be observed.");
  assertTest(model.conversionProbabilityDivergenceObserved, "conversion probability divergence must be observed.");
  assertTest(!model.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence must remain false.");
  assertTest(!model.sandboxScoreDivergenceObserved, "sandbox score divergence must remain false.");
  assertTest(!model.override.sandboxScoringEventCreated, "override must not create sandbox scoring event in 3M.");
  assertTest(model.override.sandboxScoreDelta === 0, "override sandbox score delta must remain 0.");
  assertTest(model.modelAppliedOnlyInSandbox, "model must apply only in sandbox.");
  assertTest(!model.modelAppliedToNormalLiveSelection, "model must not apply to normal live selection.");
  assertTest(!model.canCreateProductionScoringEvents, "model cannot create production scoring events.");
  assertTest(!model.canClaimGlobalEconomy, "model cannot claim global economy.");

  return [
    "sandbox scoring event candidate model status is available",
    "baseline produces NO_SCORING_EVENT",
    "override produces SHOT_CANDIDATE",
    "candidate and conversion divergences are observed",
    "sandbox candidate creates no scoring event and no score delta",
    "sandbox candidate remains isolated-only",
  ];
}

if (require.main === module) {
  const checks = validateSandboxScoringEventCandidate();

  console.log("sandboxScoringEventCandidate tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

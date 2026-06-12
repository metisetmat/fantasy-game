import { controlledRouteResolutionSandboxFromReplay } from "./controlledRouteResolutionSandboxFromReplay";
import type { FullMatchRealIsolatedSegmentReplay } from "./fullMatchRealIsolatedSegmentReplay";
import { sandboxScoringEventCandidateModelFromOpportunity } from "./sandboxScoringEventCandidateModelFromOpportunity";
import { sandboxScoringEventResolutionFromCandidate } from "./sandboxScoringEventResolutionFromCandidate";
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

export function validateSandboxScoringEventResolution(): readonly string[] {
  const sandbox = controlledRouteResolutionSandboxFromReplay({ replay: replayFixture() });
  const opportunityModel = sandboxScoringOpportunityModelFromResolution({ sandbox });
  const candidateModel = sandboxScoringEventCandidateModelFromOpportunity({ opportunityModel });
  const model = sandboxScoringEventResolutionFromCandidate({ candidateModel });

  assertTest(model.status === "available", "sandbox scoring event resolution model must be available.");
  assertTest(model.origin === "sandbox_scoring_event_candidate", "resolution model origin mismatch.");
  assertTest(model.baseline.sourceScoringCandidateType === "NO_SCORING_EVENT", "baseline source candidate mismatch.");
  assertTest(model.baseline.resolutionType === "NO_SCORE_ATTEMPT", "baseline resolution type mismatch.");
  assertTest(!model.baseline.shotAttemptCreated, "baseline shot attempt must not be created.");
  assertTest(model.baseline.shotQuality === 0, "baseline shot quality must be 0.");
  assertTest(model.baseline.goalkeeperResponse === "not_applicable", "baseline goalkeeper response mismatch.");
  assertTest(!model.baseline.sandboxScoringEventCreated, "baseline must not create sandbox scoring event.");
  assertTest(model.baseline.sandboxScoreDelta === 0, "baseline score delta must be 0.");
  assertTest(model.override.sourceScoringCandidateType === "SHOT_CANDIDATE", "override source candidate mismatch.");
  assertTest(["SHOT_ON_TARGET", "SAVED_BY_GK"].includes(model.override.resolutionType), "override must resolve as sandbox shot result.");
  assertTest(model.override.shotAttemptCreated, "override shot attempt must be created.");
  assertTest(model.override.shotQuality > model.baseline.shotQuality, "override shot quality must exceed baseline.");
  assertTest(model.override.goalkeeperResponse !== model.baseline.goalkeeperResponse, "goalkeeper response divergence expected.");
  assertTest(!model.override.sandboxScoringEventCreated, "override must not create sandbox scoring event in 3N.");
  assertTest(model.override.sandboxScoreDelta === 0, "override score delta must be 0.");
  assertTest(model.scoringResolutionTypeDivergenceObserved, "resolution type divergence must be observed.");
  assertTest(model.shotAttemptCreationDivergenceObserved, "shot attempt divergence must be observed.");
  assertTest(model.shotQualityDivergenceObserved, "shot quality divergence must be observed.");
  assertTest(model.goalkeeperResponseDivergenceObserved, "goalkeeper response divergence must be observed.");
  assertTest(!model.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence must remain false.");
  assertTest(!model.sandboxScoreDivergenceObserved, "sandbox score divergence must remain false.");
  assertTest(model.modelAppliedOnlyInSandbox, "model must apply only in sandbox.");
  assertTest(!model.modelAppliedToNormalLiveSelection, "model must not apply to normal live selection.");
  assertTest(!model.canCreateProductionScoringEvents, "model cannot create production scoring events.");
  assertTest(!model.canClaimGlobalEconomy, "model cannot claim global economy.");

  return [
    "sandbox scoring event resolution model status is available",
    "baseline resolves as NO_SCORE_ATTEMPT",
    "override resolves as sandbox shot result",
    "resolution, shot attempt, shot quality, and goalkeeper response divergences are observed",
    "sandbox resolution creates no scoring event and no score delta",
    "sandbox resolution remains isolated-only",
  ];
}

if (require.main === module) {
  const checks = validateSandboxScoringEventResolution();

  console.log("sandboxScoringEventResolution tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

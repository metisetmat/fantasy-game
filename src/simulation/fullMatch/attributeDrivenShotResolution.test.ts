import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { controlledRouteResolutionSandboxFromReplay } from "./controlledRouteResolutionSandboxFromReplay";
import { attributeDrivenShotResolutionFromSandbox } from "./attributeDrivenShotResolutionFromSandbox";
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

export function validateAttributeDrivenShotResolution(): readonly string[] {
  const sandbox = controlledRouteResolutionSandboxFromReplay({ replay: replayFixture() });
  const opportunityModel = sandboxScoringOpportunityModelFromResolution({ sandbox });
  const candidateModel = sandboxScoringEventCandidateModelFromOpportunity({ opportunityModel });
  const resolutionModel = sandboxScoringEventResolutionFromCandidate({ candidateModel });
  const model = attributeDrivenShotResolutionFromSandbox({
    matchInput: engineToCoachPublicContractFixtures.matchInputFixture,
    resolutionModel,
  });

  assertTest(model.status === "available", "attribute-driven shot resolution model must be available.");
  assertTest(model.origin === "sandbox_scoring_event_resolution", "attribute-driven model origin mismatch.");
  assertTest(model.baseline.outcome === "NO_SCORE_ATTEMPT", "baseline outcome mismatch.");
  assertTest(!model.baseline.shotAttemptCreated, "baseline shot attempt must not be created.");
  assertTest(model.baseline.attributeAdjustedShotQuality === 0, "baseline adjusted shot quality must be 0.");
  assertTest(model.override.sourceScoringCandidateType === "SHOT_CANDIDATE", "override source candidate mismatch.");
  assertTest(model.override.receiverId === "control-space-hunter", "override receiver mismatch.");
  assertTest(model.override.targetZone === "Z4-HSR", "override target zone mismatch.");
  assertTest(model.override.shooter.playerId === "control-space-hunter", "override shooter must be control-space-hunter.");
  assertTest(model.override.goalkeeper.playerId === "blitz-goalkeeper-free-safety", "override goalkeeper mismatch.");
  assertTest(model.override.shotAttemptCreated, "override shot attempt must be created.");
  assertTest(model.override.attributeAdjustedShotQuality > model.baseline.attributeAdjustedShotQuality, "override adjusted shot quality must exceed baseline.");
  assertTest(model.override.attributeAdjustedGoalkeeperResponseQuality > 0, "goalkeeper response quality must be computed.");
  assertTest(["SHOT_ON_TARGET", "SAVED_BY_GK", "SHOT_OFF_TARGET", "SHOT_BLOCKED", "SANDBOX_GOAL_CANDIDATE", "NO_SCORE"].includes(model.override.outcome), "override outcome must be allowed.");
  assertTest(model.attributeInfluenceObserved, "attribute influence must be observed.");
  assertTest(model.attributeDrivenOutcomeDivergenceObserved, "outcome divergence must be observed.");
  assertTest(model.shotQualityDivergenceObserved, "shot quality divergence must be observed.");
  assertTest(model.goalkeeperQualityDivergenceObserved, "goalkeeper quality divergence must be observed.");
  assertTest(!model.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence must remain false.");
  assertTest(!model.sandboxScoreDivergenceObserved, "sandbox score divergence must remain false.");
  assertTest(!model.override.sandboxScoringEventCreated, "override must not create sandbox scoring event in 3O.");
  assertTest(model.override.sandboxScoreDelta === 0, "override score delta must remain 0.");
  assertTest(model.modelAppliedOnlyInSandbox, "model must apply only in sandbox.");
  assertTest(!model.modelAppliedToNormalLiveSelection, "model must not apply to normal live selection.");
  assertTest(!model.canCreateProductionScoringEvents, "model cannot create production scoring events.");
  assertTest(!model.canClaimGlobalEconomy, "model cannot claim global economy.");

  return [
    "attribute-driven shot resolution model status is available",
    "baseline outcome is NO_SCORE_ATTEMPT",
    "override uses shooter and goalkeeper attributes",
    "override adjusted shot quality exceeds baseline",
    "goalkeeper response quality is computed",
    "attribute influence and divergences are observed",
    "sandbox result creates no scoring event and no score delta",
    "attribute-driven shot resolution remains isolated-only",
  ];
}

if (require.main === module) {
  const checks = validateAttributeDrivenShotResolution();

  console.log("attributeDrivenShotResolution tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

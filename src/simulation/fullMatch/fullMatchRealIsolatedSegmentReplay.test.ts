import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { consumeWorkbenchChainForFullMatch } from "./consumeWorkbenchChainForFullMatch";
import {
  applyChainContextToRouteCandidates,
  buildDiagnosticRouteCandidatesForSegment,
} from "./applyChainContextToRouteCandidates";
import { chainConsumptionToSegmentContext } from "./fullMatchChainSegmentContext";
import { selectShadowRouteFromInfluencedCandidates } from "./selectShadowRouteFromInfluencedCandidates";
import { controlledSegmentSelectionFromShadow } from "./controlledSegmentSelectionFromShadow";
import { segmentRouteInputFromControlledSelection } from "./segmentRouteInputFromControlledSelection";
import { controlledMiniMatchRouteSourceFromSegmentRouteInput } from "./controlledMiniMatchRouteSourceFromSegmentRouteInput";
import { liveSelectionOverrideGuardFromControlledRouteSource } from "./liveSelectionOverrideGuardFromControlledRouteSource";
import { isolatedMiniMatchOverrideExperimentFromGuard } from "./isolatedMiniMatchOverrideExperimentFromGuard";
import { controlledSegmentReplayComparisonFromExperiment } from "./controlledSegmentReplayComparisonFromExperiment";
import { realIsolatedSegmentReplayFromComparison } from "./realIsolatedSegmentReplayFromComparison";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function replayForMode(routeSelectionMode: "segment_harness" | "workbench_chain_replay_experimental") {
  const matchInput = engineToCoachPublicContractFixtures.matchInputFixture;
  const context = chainConsumptionToSegmentContext(consumeWorkbenchChainForFullMatch({
    matchInput,
    routeSelectionMode,
    segmentLabel: "segment-1",
  }));
  const influence = applyChainContextToRouteCandidates({
    segmentContext: context,
    candidates: buildDiagnosticRouteCandidatesForSegment({
      segmentLabel: "segment-1",
      chainSegmentContext: context,
    }),
  });
  const shadowSelection = selectShadowRouteFromInfluencedCandidates({
    influence,
    ...(influence.selectedCandidateBefore === undefined ? {} : { productionSelectionCandidateId: influence.selectedCandidateBefore }),
  });
  const controlledSelection = controlledSegmentSelectionFromShadow({ shadowSelection });
  const segmentRouteInput = segmentRouteInputFromControlledSelection({ controlledSelection });
  const controlledRouteSource = controlledMiniMatchRouteSourceFromSegmentRouteInput({ segmentRouteInput });
  const liveSelectionOverrideGuard = liveSelectionOverrideGuardFromControlledRouteSource({ controlledRouteSource });
  const experiment = isolatedMiniMatchOverrideExperimentFromGuard({
    liveSelectionOverrideGuard,
    ...(influence.selectedCandidateBefore === undefined ? {} : { baselineCandidateId: influence.selectedCandidateBefore }),
    baselineActionType: "SAFE_RECYCLE",
    baselineReceiverId: "control-pivot",
    baselineTargetZone: "Z2-HSL",
  });
  const comparison = controlledSegmentReplayComparisonFromExperiment({ experiment });

  return realIsolatedSegmentReplayFromComparison({ comparison });
}

export function validateFullMatchRealIsolatedSegmentReplay(): readonly string[] {
  const unavailable = replayForMode("segment_harness");
  const replay = replayForMode("workbench_chain_replay_experimental");

  assertTest(unavailable.status === "not_available", "default route mode must not expose real isolated segment replay.");
  assertTest(replay.status === "available", "available comparison must return real isolated segment replay.");
  assertTest(replay.origin === "controlled_segment_replay_comparison", "real isolated replay origin must be controlled comparison.");
  assertTest(replay.baseline.candidateId === "chain-context-safe-recycle-pv", "baseline candidate must match.");
  assertTest(replay.baseline.actionType === "SAFE_RECYCLE", "baseline action must match.");
  assertTest(replay.baseline.receiverId === "control-pivot", "baseline receiver must match.");
  assertTest(replay.baseline.targetZone === "Z2-HSL", "baseline zone must match.");
  assertTest(replay.baselineEventCount > 0, "baseline must produce isolated replay events.");
  assertTest(replay.baseline.resultingCarrierId === "control-pivot", "baseline resulting carrier must match.");
  assertTest(replay.baseline.resultingZone === "Z2-HSL", "baseline resulting zone must match.");
  assertTest(replay.override.candidateId === "chain-context-forward-progress-sh", "override candidate must match.");
  assertTest(replay.override.actionType === "FORWARD_PROGRESS", "override action must match.");
  assertTest(replay.override.receiverId === "control-space-hunter", "override receiver must match.");
  assertTest(replay.override.targetZone === "Z4-HSR", "override zone must match.");
  assertTest(replay.overrideEventCount > 0, "override must produce isolated replay events.");
  assertTest(replay.override.resultingCarrierId === "control-space-hunter", "override resulting carrier must match.");
  assertTest(replay.override.resultingZone === "Z4-HSR", "override resulting zone must match.");
  assertTest(replay.selectionDivergenceObserved, "selection divergence must be true.");
  assertTest(replay.carrierDivergenceObserved, "carrier divergence must be true.");
  assertTest(replay.zoneProgressionDivergenceObserved, "zone progression divergence must be true.");
  assertTest(replay.dangerCreationDivergenceObserved, "danger creation divergence must be true.");
  assertTest(replay.isolatedTimelineDivergenceObserved, "isolated timeline divergence must be true.");
  assertTest(replay.replayAppliedOnlyInIsolatedEngine, "replay must apply only in isolated engine.");
  assertTest(!replay.replayAppliedToNormalLiveSelection, "replay must not apply to normal live selection.");
  assertTest(replay.diagnosticOnly, "real isolated replay must be diagnostic-only.");
  assertTest(!replay.canInjectEventsIntoOfficialTimeline, "real isolated replay cannot inject events into official timeline.");
  assertTest(!replay.canMutateOfficialScore, "real isolated replay cannot mutate official score.");
  assertTest(!replay.canMutateOfficialScoringEvents, "real isolated replay cannot mutate official scoring events.");
  assertTest(!replay.canMutateProductionRouteResolution, "real isolated replay cannot mutate production route resolution.");
  assertTest(!replay.canMutateGlobalRouteSuccessRates, "real isolated replay cannot mutate global route success rates.");
  assertTest(!replay.canCreateProductionScoringEvents, "real isolated replay cannot create production scoring events.");
  assertTest(!replay.canClaimGlobalEconomy, "real isolated replay cannot claim global economy.");
  assertTest([...replay.baseline.events, ...replay.override.events].every((event) => event.experimentalOnly), "all isolated events must be experimental-only.");

  return [
    "default mode returns no real isolated replay",
    "experimental mode returns available real isolated replay",
    "baseline candidate/action/receiver/zone and events are preserved",
    "override candidate/action/receiver/zone and events are preserved",
    "selection, carrier, zone progression, danger, and isolated timeline divergence are true",
    "real isolated replay cannot mutate official timeline, score, scoring events, route resolution, route success, production scoring events, or global economy",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchRealIsolatedSegmentReplay();

  console.log("fullMatchRealIsolatedSegmentReplay tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

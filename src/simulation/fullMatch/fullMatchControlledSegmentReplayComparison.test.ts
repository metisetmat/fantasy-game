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

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function comparisonForMode(routeSelectionMode: "segment_harness" | "workbench_chain_replay_experimental") {
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

  return controlledSegmentReplayComparisonFromExperiment({ experiment });
}

export function validateFullMatchControlledSegmentReplayComparison(): readonly string[] {
  const unavailable = comparisonForMode("segment_harness");
  const comparison = comparisonForMode("workbench_chain_replay_experimental");

  assertTest(unavailable.status === "not_available", "default route mode must not expose controlled segment replay comparison.");
  assertTest(comparison.status === "available", "available isolated experiment must return controlled segment replay comparison.");
  assertTest(comparison.origin === "isolated_minimatch_override_experiment", "controlled comparison origin must be isolated_minimatch_override_experiment.");
  assertTest(comparison.baseline.candidateId === "chain-context-safe-recycle-pv", "baseline candidate must be chain-context-safe-recycle-pv.");
  assertTest(comparison.baseline.actionType === "SAFE_RECYCLE", "baseline action must be SAFE_RECYCLE.");
  assertTest(comparison.baseline.receiverId === "control-pivot", "baseline receiver must be control-pivot.");
  assertTest(comparison.baseline.targetZone === "Z2-HSL", "baseline zone must be Z2-HSL.");
  assertTest(comparison.override.candidateId === "chain-context-forward-progress-sh", "override candidate must be chain-context-forward-progress-sh.");
  assertTest(comparison.override.actionType === "FORWARD_PROGRESS", "override action must be FORWARD_PROGRESS.");
  assertTest(comparison.override.receiverId === "control-space-hunter", "override receiver must be control-space-hunter.");
  assertTest(comparison.override.targetZone === "Z4-HSR", "override zone must be Z4-HSR.");
  assertTest(comparison.selectionDivergenceObserved, "selection divergence must be true.");
  assertTest(comparison.zoneProgressionDivergenceObserved, "zone progression divergence must be true.");
  assertTest(comparison.dangerCreationDivergenceObserved, "danger creation divergence must be true.");
  assertTest(!comparison.scoringOpportunityDivergenceObserved, "scoring opportunity divergence remains false in metadata-backed 3I comparison.");
  assertTest(comparison.replayAppliedOnlyInIsolatedComparison, "replay must apply only in isolated comparison.");
  assertTest(!comparison.replayAppliedToNormalLiveSelection, "replay must not apply to normal live selection.");
  assertTest(comparison.diagnosticOnly, "controlled replay comparison must be diagnostic-only.");
  assertTest(!comparison.canMutateNormalFullMatchScore, "controlled replay comparison must not mutate normal score.");
  assertTest(!comparison.canMutateNormalFullMatchScoringEvents, "controlled replay comparison must not mutate normal scoring events.");
  assertTest(!comparison.canMutateProductionRouteResolution, "controlled replay comparison must not mutate production route resolution.");
  assertTest(!comparison.canMutateGlobalRouteSuccessRates, "controlled replay comparison must not mutate global route success rates.");
  assertTest(!comparison.canCreateProductionScoringEvents, "controlled replay comparison must not create production scoring events.");
  assertTest(!comparison.canClaimGlobalEconomy, "controlled replay comparison must not claim global economy.");

  return [
    "not_available isolated experiment returns no controlled replay comparison",
    "available isolated experiment returns controlled replay comparison",
    "baseline candidate/action/receiver/zone are preserved",
    "override candidate/action/receiver/zone are preserved",
    "selection divergence is true",
    "zone progression divergence is true",
    "danger creation divergence is true",
    "replayAppliedOnlyInIsolatedComparison is true",
    "replayAppliedToNormalLiveSelection is false",
    "controlled replay comparison cannot mutate score, scoring events, route resolution, route success, production scoring events, or global economy",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchControlledSegmentReplayComparison();

  console.log("fullMatchControlledSegmentReplayComparison tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

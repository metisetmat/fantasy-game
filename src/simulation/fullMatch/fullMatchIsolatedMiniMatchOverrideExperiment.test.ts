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

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function isolatedExperimentForMode(routeSelectionMode: "segment_harness" | "workbench_chain_replay_experimental") {
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

  return isolatedMiniMatchOverrideExperimentFromGuard({
    liveSelectionOverrideGuard,
    ...(influence.selectedCandidateBefore === undefined ? {} : { baselineCandidateId: influence.selectedCandidateBefore }),
    baselineActionType: "SAFE_RECYCLE",
    baselineReceiverId: "control-pivot",
    baselineTargetZone: "Z2-HSL",
  });
}

export function validateFullMatchIsolatedMiniMatchOverrideExperiment(): readonly string[] {
  const unavailable = isolatedExperimentForMode("segment_harness");
  const experiment = isolatedExperimentForMode("workbench_chain_replay_experimental");

  assertTest(unavailable.status === "not_available", "default route mode must not expose isolated mini-match override experiment.");
  assertTest(experiment.status === "available", "available live override guard must return isolated mini-match override experiment.");
  assertTest(experiment.origin === "live_selection_override_guard", "isolated experiment origin must be live_selection_override_guard.");
  assertTest(experiment.scope === "isolated_minimatch_override_experiment", "isolated experiment scope must remain isolated.");
  assertTest(experiment.baselineCandidateId === "chain-context-safe-recycle-pv", "baseline candidate must expose current/proxy selection.");
  assertTest(experiment.overrideCandidateId === "chain-context-forward-progress-sh", "override candidate must be chain-context-forward-progress-sh.");
  assertTest(experiment.overrideActionType === "FORWARD_PROGRESS", "override action must be FORWARD_PROGRESS.");
  assertTest(experiment.overrideReceiverId === "control-space-hunter", "override receiver must be control-space-hunter.");
  assertTest(experiment.overrideTargetZone === "Z4-HSR", "override target zone must be Z4-HSR.");
  assertTest(experiment.candidateLegal, "override candidate must be legal.");
  assertTest(experiment.candidateAvailable, "override candidate must be available.");
  assertTest(experiment.overrideAppliedInIsolatedExperiment, "override must be applied in isolated experiment.");
  assertTest(!experiment.overrideAppliedToNormalLiveSelection, "override must not be applied to normal live selection.");
  assertTest(experiment.isolatedSelectionDivergenceObserved, "isolated experiment must expose selection divergence.");
  assertTest(!experiment.isolatedScoreDivergenceObserved, "isolated score divergence remains false without isolated replay score signatures.");
  assertTest(!experiment.isolatedScoringEventDivergenceObserved, "isolated scoring-event divergence remains false without isolated replay counts.");
  assertTest(experiment.diagnosticOnly, "isolated experiment must be diagnostic-only.");
  assertTest(!experiment.canMutateNormalFullMatchScore, "isolated experiment must not mutate normal full-match score.");
  assertTest(!experiment.canMutateNormalFullMatchScoringEvents, "isolated experiment must not mutate normal scoring events.");
  assertTest(!experiment.canMutateProductionRouteResolution, "isolated experiment must not mutate production route resolution.");
  assertTest(!experiment.canMutateGlobalRouteSuccessRates, "isolated experiment must not mutate global route success rates.");
  assertTest(!experiment.canCreateProductionScoringEvents, "isolated experiment must not create production scoring events.");
  assertTest(!experiment.canClaimGlobalEconomy, "isolated experiment must not claim global economy.");

  return [
    "not_available live override guard returns no isolated experiment",
    "available live override guard returns isolated experiment",
    "override candidate is chain-context-forward-progress-sh",
    "override action is FORWARD_PROGRESS",
    "override receiver is control-space-hunter",
    "override target zone is Z4-HSR",
    "candidate is legal and available",
    "overrideAppliedInIsolatedExperiment is true",
    "overrideAppliedToNormalLiveSelection is false",
    "diagnosticOnly is true",
    "isolated experiment cannot mutate normal full-match score or scoring events",
    "isolated experiment cannot mutate production route resolution, global route success rates, create production scoring events, or claim global economy",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchIsolatedMiniMatchOverrideExperiment();

  console.log("fullMatchIsolatedMiniMatchOverrideExperiment tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

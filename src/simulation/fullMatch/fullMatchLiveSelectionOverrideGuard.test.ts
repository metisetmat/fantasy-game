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

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function overrideGuardForMode(routeSelectionMode: "segment_harness" | "workbench_chain_replay_experimental") {
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

  return liveSelectionOverrideGuardFromControlledRouteSource({ controlledRouteSource });
}

export function validateFullMatchLiveSelectionOverrideGuard(): readonly string[] {
  const unavailable = overrideGuardForMode("segment_harness");
  const guard = overrideGuardForMode("workbench_chain_replay_experimental");

  assertTest(unavailable.status === "not_available", "default route mode must not expose live selection override guard.");
  assertTest(guard.status === "available", "available controlled route source must return live selection override guard.");
  assertTest(guard.origin === "controlled_minimatch_route_source", "override guard origin must be controlled_minimatch_route_source.");
  assertTest(guard.scope === "experimental_live_selection_override_guard", "override guard scope must remain experimental.");
  assertTest(guard.overrideCandidateId === "chain-context-forward-progress-sh", "override candidate must be chain-context-forward-progress-sh.");
  assertTest(guard.overrideActionType === "FORWARD_PROGRESS", "override action must be FORWARD_PROGRESS.");
  assertTest(guard.overrideReceiverId === "control-space-hunter", "override receiver must be control-space-hunter.");
  assertTest(guard.overrideTargetZone === "Z4-HSR", "override target zone must be Z4-HSR.");
  assertTest(guard.sourceBaseScore === 82, "override guard must expose source base score 82.");
  assertTest(guard.sourceInfluenceDelta === 5, "override guard must expose source influence delta 5.");
  assertTest(guard.sourceInfluencedScore === 87, "override guard must expose source influenced score 87.");
  assertTest(guard.candidateLegal, "override candidate must be legal.");
  assertTest(guard.candidateAvailable, "override candidate must be available.");
  assertTest(guard.experimentalOverridePrepared, "override guard must prepare experimental override.");
  assertTest(!guard.overrideAppliedToLiveSelection, "override guard must not apply to live selection.");
  assertTest(guard.diagnosticOnly, "override guard must be diagnostic-only.");
  assertTest(!guard.canMutateScore, "override guard must not mutate score.");
  assertTest(!guard.canMutateScoringEvents, "override guard must not mutate scoring events.");
  assertTest(!guard.canMutateRouteSuccessRates, "override guard must not mutate route success rates.");
  assertTest(!guard.canDriveProductionFullMatchSelection, "override guard must not drive production full-match selection.");
  assertTest(!guard.canDriveProductionRouteResolution, "override guard must not drive production route resolution.");
  assertTest(!guard.canDriveNormalLiveMiniMatchResolution, "override guard must not drive normal live mini-match resolution.");
  assertTest(!guard.canCreateScoringEvents, "override guard must not create scoring events.");

  return [
    "not_available controlled route source returns no override guard",
    "available controlled route source returns live selection override guard",
    "override candidate is chain-context-forward-progress-sh",
    "override action is FORWARD_PROGRESS",
    "override receiver is control-space-hunter",
    "override target zone is Z4-HSR",
    "override candidate is legal and available",
    "experimentalOverridePrepared is true",
    "overrideAppliedToLiveSelection is false",
    "override guard is diagnostic-only",
    "override guard cannot mutate score, scoring events, route success rates, or create scoring events",
    "override guard cannot drive production or normal live mini-match resolution",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchLiveSelectionOverrideGuard();

  console.log("fullMatchLiveSelectionOverrideGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

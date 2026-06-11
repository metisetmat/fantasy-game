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

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function routeInputForMode(routeSelectionMode: "segment_harness" | "workbench_chain_replay_experimental") {
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

  return segmentRouteInputFromControlledSelection({ controlledSelection });
}

export function validateFullMatchSegmentRouteInput(): readonly string[] {
  const unavailable = routeInputForMode("segment_harness");
  const routeInput = routeInputForMode("workbench_chain_replay_experimental");

  assertTest(unavailable.status === "not_available", "default route mode must not expose SegmentRouteInput.");
  assertTest(routeInput.status === "available", "available controlled selection must return SegmentRouteInput.");
  assertTest(routeInput.source === "controlled_segment_selection", "SegmentRouteInput source must be controlled_segment_selection.");
  assertTest(routeInput.scope === "experimental_segment_route_input", "SegmentRouteInput scope must remain experimental.");
  assertTest(routeInput.candidateId === "chain-context-forward-progress-sh", "SegmentRouteInput candidate must be chain-context-forward-progress-sh.");
  assertTest(routeInput.actionType === "FORWARD_PROGRESS", "SegmentRouteInput action must be FORWARD_PROGRESS.");
  assertTest(routeInput.receiverId === "control-space-hunter", "SegmentRouteInput receiver must be control-space-hunter.");
  assertTest(routeInput.targetZone === "Z4-HSR", "SegmentRouteInput target zone must be Z4-HSR.");
  assertTest(routeInput.sourceBaseScore === 82, "SegmentRouteInput must expose source base score 82.");
  assertTest(routeInput.sourceInfluenceDelta === 5, "SegmentRouteInput must expose source influence delta 5.");
  assertTest(routeInput.sourceInfluencedScore === 87, "SegmentRouteInput must expose source influenced score 87.");
  assertTest(routeInput.candidateLegal, "SegmentRouteInput candidate must be legal.");
  assertTest(routeInput.candidateAvailable, "SegmentRouteInput candidate must be available.");
  assertTest(routeInput.diagnosticOnly, "SegmentRouteInput must be diagnostic-only.");
  assertTest(routeInput.experimentalRouteInput, "SegmentRouteInput must be marked experimental.");
  assertTest(!routeInput.canMutateScore, "SegmentRouteInput must not mutate score.");
  assertTest(!routeInput.canMutateScoringEvents, "SegmentRouteInput must not mutate scoring events.");
  assertTest(!routeInput.canMutateRouteSuccessRates, "SegmentRouteInput must not mutate route success rates.");
  assertTest(!routeInput.canDriveProductionFullMatchSelection, "SegmentRouteInput must not drive production full-match selection.");
  assertTest(!routeInput.canDriveProductionRouteResolution, "SegmentRouteInput must not drive production route resolution.");

  return [
    "not_available controlled selection returns no SegmentRouteInput",
    "available controlled selection returns SegmentRouteInput",
    "SegmentRouteInput source is controlled_segment_selection",
    "SegmentRouteInput candidate is chain-context-forward-progress-sh",
    "SegmentRouteInput action is FORWARD_PROGRESS",
    "SegmentRouteInput receiver is control-space-hunter",
    "SegmentRouteInput target zone is Z4-HSR",
    "SegmentRouteInput source scores are exposed",
    "SegmentRouteInput candidate is legal and available",
    "SegmentRouteInput is diagnostic-only and experimental",
    "SegmentRouteInput cannot mutate score, scoring events, or route success rates",
    "SegmentRouteInput cannot drive production selection or route resolution",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchSegmentRouteInput();

  console.log("fullMatchSegmentRouteInput tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

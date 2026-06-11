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

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function routeSourceForMode(routeSelectionMode: "segment_harness" | "workbench_chain_replay_experimental") {
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

  return controlledMiniMatchRouteSourceFromSegmentRouteInput({ segmentRouteInput });
}

export function validateFullMatchControlledMiniMatchRouteSource(): readonly string[] {
  const unavailable = routeSourceForMode("segment_harness");
  const routeSource = routeSourceForMode("workbench_chain_replay_experimental");

  assertTest(unavailable.status === "not_available", "default route mode must not expose controlled mini-match route source.");
  assertTest(routeSource.status === "available", "available SegmentRouteInput must return controlled mini-match route source.");
  assertTest(routeSource.origin === "segment_route_input", "controlled route source origin must be segment_route_input.");
  assertTest(routeSource.scope === "experimental_controlled_minimatch_route_source", "controlled route source scope must remain experimental.");
  assertTest(routeSource.candidateId === "chain-context-forward-progress-sh", "controlled route source candidate must be chain-context-forward-progress-sh.");
  assertTest(routeSource.actionType === "FORWARD_PROGRESS", "controlled route source action must be FORWARD_PROGRESS.");
  assertTest(routeSource.receiverId === "control-space-hunter", "controlled route source receiver must be control-space-hunter.");
  assertTest(routeSource.targetZone === "Z4-HSR", "controlled route source target zone must be Z4-HSR.");
  assertTest(routeSource.sourceBaseScore === 82, "controlled route source must expose source base score 82.");
  assertTest(routeSource.sourceInfluenceDelta === 5, "controlled route source must expose source influence delta 5.");
  assertTest(routeSource.sourceInfluencedScore === 87, "controlled route source must expose source influenced score 87.");
  assertTest(routeSource.candidateLegal, "controlled route source candidate must be legal.");
  assertTest(routeSource.candidateAvailable, "controlled route source candidate must be available.");
  assertTest(routeSource.diagnosticOnly, "controlled route source must be diagnostic-only.");
  assertTest(routeSource.experimentalControlledRouteSource, "controlled route source must be marked experimental.");
  assertTest(!routeSource.canMutateScore, "controlled route source must not mutate score.");
  assertTest(!routeSource.canMutateScoringEvents, "controlled route source must not mutate scoring events.");
  assertTest(!routeSource.canMutateRouteSuccessRates, "controlled route source must not mutate route success rates.");
  assertTest(!routeSource.canDriveProductionFullMatchSelection, "controlled route source must not drive production full-match selection.");
  assertTest(!routeSource.canDriveProductionRouteResolution, "controlled route source must not drive production route resolution.");
  assertTest(!routeSource.canDriveLiveMiniMatchResolution, "controlled route source must not drive live mini-match resolution.");

  return [
    "not_available SegmentRouteInput returns no controlled route source",
    "available SegmentRouteInput returns controlled mini-match route source",
    "controlled route source origin is segment_route_input",
    "controlled route source candidate is chain-context-forward-progress-sh",
    "controlled route source action is FORWARD_PROGRESS",
    "controlled route source receiver is control-space-hunter",
    "controlled route source target zone is Z4-HSR",
    "controlled route source source scores are exposed",
    "controlled route source candidate is legal and available",
    "controlled route source is diagnostic-only and experimental",
    "controlled route source cannot mutate score, scoring events, or route success rates",
    "controlled route source cannot drive production or live mini-match resolution",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchControlledMiniMatchRouteSource();

  console.log("fullMatchControlledMiniMatchRouteSource tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

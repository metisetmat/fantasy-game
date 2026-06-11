import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { consumeWorkbenchChainForFullMatch } from "./consumeWorkbenchChainForFullMatch";
import {
  applyChainContextToRouteCandidates,
  buildDiagnosticRouteCandidatesForSegment,
} from "./applyChainContextToRouteCandidates";
import { chainConsumptionToSegmentContext } from "./fullMatchChainSegmentContext";
import { selectShadowRouteFromInfluencedCandidates } from "./selectShadowRouteFromInfluencedCandidates";
import { controlledSegmentSelectionFromShadow } from "./controlledSegmentSelectionFromShadow";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function controlledSelectionForMode(routeSelectionMode: "segment_harness" | "workbench_chain_replay_experimental") {
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

  return controlledSegmentSelectionFromShadow({ shadowSelection });
}

export function validateFullMatchControlledSegmentSelection(): readonly string[] {
  const unavailable = controlledSelectionForMode("segment_harness");
  const selection = controlledSelectionForMode("workbench_chain_replay_experimental");

  assertTest(unavailable.status === "not_available", "default route mode must not expose controlled segment selection.");
  assertTest(selection.status === "available", "experimental shadow selection must become controlled segment selection.");
  assertTest(selection.source === "shadow_route_selection", "controlled selection source must be shadow_route_selection.");
  assertTest(selection.scope === "experimental_controlled_segment_selection", "controlled selection scope must remain experimental.");
  assertTest(selection.selectedCandidateId === "chain-context-forward-progress-sh", "controlled candidate must be chain-context-forward-progress-sh.");
  assertTest(selection.selectedActionType === "FORWARD_PROGRESS", "controlled action must be FORWARD_PROGRESS.");
  assertTest(selection.selectedReceiverId === "control-space-hunter", "controlled receiver must be control-space-hunter.");
  assertTest(selection.selectedTargetZone === "Z4-HSR", "controlled target zone must be Z4-HSR.");
  assertTest(selection.selectedBaseScore === 82, "controlled selection must expose base score 82.");
  assertTest(selection.selectedInfluenceDelta === 5, "controlled selection must expose influence delta 5.");
  assertTest(selection.selectedInfluencedScore === 87, "controlled selection must expose influenced score 87.");
  assertTest(selection.selectedCandidateLegal, "controlled selected candidate must be legal.");
  assertTest(selection.selectedCandidateAvailable, "controlled selected candidate must be available.");
  assertTest(selection.rejectedClosedCandidateCount >= 1, "controlled selection must reject at least one closed candidate.");
  assertTest(selection.rejectedUnavailableCandidateCount >= 1, "controlled selection must reject at least one unavailable candidate.");
  assertTest(selection.diagnosticOnly, "controlled selection must be diagnostic-only.");
  assertTest(!selection.canMutateScore, "controlled selection must not mutate score.");
  assertTest(!selection.canMutateScoringEvents, "controlled selection must not mutate scoring events.");
  assertTest(!selection.canMutateRouteSuccessRates, "controlled selection must not mutate route success rates.");
  assertTest(!selection.canDriveProductionFullMatchSelection, "controlled selection must not drive production full-match selection.");

  return [
    "default route mode exposes no controlled segment selection",
    "experimental shadow selection becomes controlled segment selection",
    "controlled candidate is chain-context-forward-progress-sh",
    "controlled action is FORWARD_PROGRESS",
    "controlled receiver is control-space-hunter",
    "controlled target zone is Z4-HSR",
    "controlled selected candidate is legal and available",
    "closed and unavailable candidates remain rejected",
    "controlled selection is diagnostic-only",
    "controlled selection cannot mutate score, scoring events, or route success rates",
    "controlled selection cannot drive production full-match selection",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchControlledSegmentSelection();

  console.log("fullMatchControlledSegmentSelection tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

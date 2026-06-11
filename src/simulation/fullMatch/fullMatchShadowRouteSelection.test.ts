import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { consumeWorkbenchChainForFullMatch } from "./consumeWorkbenchChainForFullMatch";
import {
  applyChainContextToRouteCandidates,
  buildDiagnosticRouteCandidatesForSegment,
} from "./applyChainContextToRouteCandidates";
import { chainConsumptionToSegmentContext } from "./fullMatchChainSegmentContext";
import { selectShadowRouteFromInfluencedCandidates } from "./selectShadowRouteFromInfluencedCandidates";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function influenceForMode(routeSelectionMode: "segment_harness" | "workbench_chain_replay_experimental") {
  const matchInput = engineToCoachPublicContractFixtures.matchInputFixture;
  const context = chainConsumptionToSegmentContext(consumeWorkbenchChainForFullMatch({
    matchInput,
    routeSelectionMode,
    segmentLabel: "segment-1",
  }));

  return applyChainContextToRouteCandidates({
    segmentContext: context,
    candidates: buildDiagnosticRouteCandidatesForSegment({
      segmentLabel: "segment-1",
      chainSegmentContext: context,
    }),
  });
}

export function validateFullMatchShadowRouteSelection(): readonly string[] {
  const unavailable = selectShadowRouteFromInfluencedCandidates({
    influence: influenceForMode("segment_harness"),
  });
  const influence = influenceForMode("workbench_chain_replay_experimental");
  const selection = selectShadowRouteFromInfluencedCandidates({
    influence,
    ...(influence.selectedCandidateBefore === undefined ? {} : { productionSelectionCandidateId: influence.selectedCandidateBefore }),
  });

  assertTest(unavailable.status === "not_available", "not_available route influence must return no shadow selection.");
  assertTest(selection.status === "available", "available route influence must return shadow selection.");
  assertTest(selection.shadowSelectionCandidateId === "chain-context-forward-progress-sh", "shadow candidate must be chain-context-forward-progress-sh.");
  assertTest(selection.shadowSelectionActionType === "FORWARD_PROGRESS", "shadow action must be FORWARD_PROGRESS.");
  assertTest(selection.shadowSelectionReceiverId === "control-space-hunter", "shadow receiver must be control-space-hunter.");
  assertTest(selection.shadowSelectionTargetZone === "Z4-HSR", "shadow target zone must be Z4-HSR.");
  assertTest(selection.productionSelectionCandidateId === "chain-context-safe-recycle-pv", "production proxy must be chain-context-safe-recycle-pv.");
  assertTest(selection.shadowSelectionChangedFromProduction, "shadow selection must differ from production proxy.");
  assertTest(selection.explanation.length > 0, "shadow selection explanation must be present.");
  assertTest(selection.diagnosticOnly, "shadow selection must be diagnostic-only.");
  assertTest(!selection.canMutateScore, "shadow selection must not mutate score.");
  assertTest(!selection.canMutateScoringEvents, "shadow selection must not mutate scoring events.");
  assertTest(!selection.canDriveProductionSelection, "shadow selection must not drive production selection.");

  return [
    "not_available route influence returns no shadow selection",
    "available route influence returns shadow selection",
    "selected shadow candidate is chain-context-forward-progress-sh",
    "selected action type is FORWARD_PROGRESS",
    "selected receiver is control-space-hunter",
    "selected target zone is Z4-HSR",
    "production selection proxy is chain-context-safe-recycle-pv",
    "shadow selection changed from production is true",
    "explanation is present",
    "diagnosticOnly = true",
    "canMutateScore = false",
    "canMutateScoringEvents = false",
    "canDriveProductionSelection = false",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchShadowRouteSelection();

  console.log("fullMatchShadowRouteSelection tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

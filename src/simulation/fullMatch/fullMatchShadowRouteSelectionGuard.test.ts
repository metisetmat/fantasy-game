import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { consumeWorkbenchChainForFullMatch } from "./consumeWorkbenchChainForFullMatch";
import {
  applyChainContextToRouteCandidates,
  buildDiagnosticRouteCandidatesForSegment,
} from "./applyChainContextToRouteCandidates";
import { chainConsumptionToSegmentContext } from "./fullMatchChainSegmentContext";
import {
  assertShadowSelectionDoesNotDriveProduction,
  eligibleForShadowSelection,
  selectShadowRouteFromInfluencedCandidates,
  shadowSelectionCannotOverrideAvailability,
} from "./selectShadowRouteFromInfluencedCandidates";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchShadowRouteSelectionGuard(): readonly string[] {
  const matchInput = engineToCoachPublicContractFixtures.matchInputFixture;
  const context = chainConsumptionToSegmentContext(consumeWorkbenchChainForFullMatch({
    matchInput,
    routeSelectionMode: "workbench_chain_replay_experimental",
    segmentLabel: "segment-1",
  }));
  const influence = applyChainContextToRouteCandidates({
    segmentContext: context,
    candidates: buildDiagnosticRouteCandidatesForSegment({
      segmentLabel: "segment-1",
      chainSegmentContext: context,
    }),
  });
  const selection = selectShadowRouteFromInfluencedCandidates({
    influence,
    ...(influence.selectedCandidateBefore === undefined ? {} : { productionSelectionCandidateId: influence.selectedCandidateBefore }),
  });
  const closedCandidate = influence.influences.find((candidate) => candidate.candidateId === "chain-context-closed-central-force");
  const unavailableCandidate = influence.influences.find((candidate) => candidate.candidateId === "chain-context-unavailable-switch");

  assertTest(closedCandidate !== undefined, "closed diagnostic candidate must be present.");
  assertTest(unavailableCandidate !== undefined, "unavailable diagnostic candidate must be present.");
  assertTest(closedCandidate !== undefined && !eligibleForShadowSelection(closedCandidate), "CLOSED candidate cannot be eligible for shadow selection.");
  assertTest(unavailableCandidate !== undefined && !eligibleForShadowSelection(unavailableCandidate), "unavailable candidate cannot be eligible for shadow selection.");
  assertTest(selection.selectedCandidateLegal, "selected candidate must be legal.");
  assertTest(selection.selectedCandidateAvailable, "selected candidate must be available.");
  assertTest(selection.closedCandidateRejectedCount >= 1, "closedCandidateRejectedCount must be >= 1.");
  assertTest(selection.unavailableCandidateRejectedCount >= 1, "unavailableCandidateRejectedCount must be >= 1.");
  assertTest(selection.shadowSelectionCandidateId !== closedCandidate?.candidateId, "selected shadow candidate must not be closed.");
  assertTest(selection.shadowSelectionCandidateId !== unavailableCandidate?.candidateId, "selected shadow candidate must not be unavailable.");
  assertShadowSelectionDoesNotDriveProduction(selection);
  assertTest(shadowSelectionCannotOverrideAvailability(selection), "shadow selection cannot override availability.");

  return [
    "CLOSED candidate cannot be selected",
    "unavailable candidate cannot be selected",
    "selected candidate is legal",
    "selected candidate is available",
    "closedCandidateRejectedCount >= 1",
    "unavailableCandidateRejectedCount >= 1",
    "selected shadow candidate is never a blocked candidate",
    "shadow selection cannot drive production",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchShadowRouteSelectionGuard();

  console.log("fullMatchShadowRouteSelectionGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

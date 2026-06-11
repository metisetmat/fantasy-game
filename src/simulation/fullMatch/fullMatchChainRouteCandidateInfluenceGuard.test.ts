import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { consumeWorkbenchChainForFullMatch } from "./consumeWorkbenchChainForFullMatch";
import {
  applyChainContextToRouteCandidates,
  buildDiagnosticRouteCandidatesForSegment,
  canCandidateReceiveChainInfluence,
  chainInfluenceCannotOverrideAvailability,
} from "./applyChainContextToRouteCandidates";
import { chainConsumptionToSegmentContext } from "./fullMatchChainSegmentContext";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchChainRouteCandidateInfluenceGuard(): readonly string[] {
  const matchInput = engineToCoachPublicContractFixtures.matchInputFixture;
  const segmentContext = chainConsumptionToSegmentContext(consumeWorkbenchChainForFullMatch({
    matchInput,
    routeSelectionMode: "workbench_chain_replay_experimental",
    segmentLabel: "segment-1",
  }));
  const candidates = buildDiagnosticRouteCandidatesForSegment({
    segmentLabel: "segment-1",
    chainSegmentContext: segmentContext,
  });
  const influence = applyChainContextToRouteCandidates({
    segmentContext,
    candidates,
  });
  const closedCandidate = influence.influences.find((candidate) => candidate.candidateId === "chain-context-closed-central-force");
  const unavailableCandidate = influence.influences.find((candidate) => candidate.candidateId === "chain-context-unavailable-switch");
  const selectedAfter = influence.influences.find((candidate) => candidate.candidateId === influence.selectedCandidateAfterDiagnostic);

  assertTest(closedCandidate !== undefined, "closed diagnostic candidate must be present.");
  assertTest(unavailableCandidate !== undefined, "unavailable diagnostic candidate must be present.");
  assertTest(closedCandidate?.selectableAfterInfluence === false, "CLOSED candidate must remain unselectable after influence.");
  assertTest(closedCandidate?.influenceDelta === 0, "CLOSED candidate must not receive selectable boost.");
  assertTest(closedCandidate?.blockedReasons.includes("CLOSED_LANE_NOT_OVERRIDABLE") ?? false, "CLOSED candidate must expose blocked reason.");
  assertTest(unavailableCandidate?.selectableAfterInfluence === false, "unavailable candidate must remain unselectable after influence.");
  assertTest(unavailableCandidate?.influenceDelta === 0, "unavailable candidate must not receive selectable boost.");
  assertTest(unavailableCandidate?.blockedReasons.includes("CANDIDATE_NOT_AVAILABLE_NOW") ?? false, "unavailable candidate must expose blocked reason.");
  assertTest(influence.illegalCandidateBoostBlockedCount > 0, "illegal boost blocked counter must increment.");
  assertTest(influence.unavailableCandidateBoostBlockedCount > 0, "unavailable boost blocked counter must increment.");
  assertTest(selectedAfter !== undefined, "diagnostic winner must be present.");
  assertTest(selectedAfter?.selectableAfterInfluence === true, "diagnostic winner may only be legal and available.");
  assertTest(candidates.every((candidate) =>
    canCandidateReceiveChainInfluence(candidate) || chainInfluenceCannotOverrideAvailability(candidate)
  ), "guard helpers must not leave a candidate in an undefined availability state.");

  return [
    "CLOSED candidate remains unselectable after influence",
    "unavailable candidate remains unselectable after influence",
    "illegal/unavailable boost blocked counters are incremented",
    "diagnostic winner may only be legal and available",
    "fallback cannot hide illegal candidate selection",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchChainRouteCandidateInfluenceGuard();

  console.log("fullMatchChainRouteCandidateInfluenceGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

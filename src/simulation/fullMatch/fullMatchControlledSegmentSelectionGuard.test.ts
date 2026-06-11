import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { consumeWorkbenchChainForFullMatch } from "./consumeWorkbenchChainForFullMatch";
import {
  applyChainContextToRouteCandidates,
  buildDiagnosticRouteCandidatesForSegment,
} from "./applyChainContextToRouteCandidates";
import { chainConsumptionToSegmentContext } from "./fullMatchChainSegmentContext";
import { selectShadowRouteFromInfluencedCandidates } from "./selectShadowRouteFromInfluencedCandidates";
import {
  controlledSegmentSelectionCannotDriveProduction,
  controlledSegmentSelectionCannotMutateScore,
  controlledSegmentSelectionFromShadow,
  validateControlledSegmentSelection,
} from "./controlledSegmentSelectionFromShadow";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchControlledSegmentSelectionGuard(): readonly string[] {
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
  const shadowSelection = selectShadowRouteFromInfluencedCandidates({
    influence,
    ...(influence.selectedCandidateBefore === undefined ? {} : { productionSelectionCandidateId: influence.selectedCandidateBefore }),
  });
  const selection = controlledSegmentSelectionFromShadow({ shadowSelection });
  const closedCandidate = influence.influences.find((candidate) => candidate.candidateId === "chain-context-closed-central-force");
  const unavailableCandidate = influence.influences.find((candidate) => candidate.candidateId === "chain-context-unavailable-switch");

  assertTest(closedCandidate !== undefined, "closed diagnostic candidate must be present.");
  assertTest(unavailableCandidate !== undefined, "unavailable diagnostic candidate must be present.");
  assertTest(selection.selectedCandidateId !== closedCandidate?.candidateId, "controlled selection must not select a closed candidate.");
  assertTest(selection.selectedCandidateId !== unavailableCandidate?.candidateId, "controlled selection must not select an unavailable candidate.");
  assertTest(selection.selectedCandidateLegal, "controlled selected candidate must be legal.");
  assertTest(selection.selectedCandidateAvailable, "controlled selected candidate must be available.");
  assertTest(selection.rejectedClosedCandidateCount >= 1, "closed candidates must be counted as rejected.");
  assertTest(selection.rejectedUnavailableCandidateCount >= 1, "unavailable candidates must be counted as rejected.");
  assertTest(controlledSegmentSelectionCannotMutateScore(selection), "controlled selection cannot mutate score surfaces.");
  assertTest(controlledSegmentSelectionCannotDriveProduction(selection), "controlled selection cannot drive production.");
  assertTest(validateControlledSegmentSelection(selection).length === 0, "controlled selection validation must pass.");

  return [
    "closed candidate cannot be selected",
    "unavailable candidate cannot be selected",
    "selected candidate is legal",
    "selected candidate is available",
    "closed candidates are counted as rejected",
    "unavailable candidates are counted as rejected",
    "controlled selection cannot mutate score surfaces",
    "controlled selection cannot drive production",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchControlledSegmentSelectionGuard();

  console.log("fullMatchControlledSegmentSelectionGuard tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

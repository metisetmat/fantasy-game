import { engineToCoachPublicContractFixtures } from "../../contracts/engineToCoach.test";
import { consumeWorkbenchChainForFullMatch } from "./consumeWorkbenchChainForFullMatch";
import {
  applyChainContextToRouteCandidates,
  buildDiagnosticRouteCandidatesForSegment,
  clampChainInfluenceDelta,
} from "./applyChainContextToRouteCandidates";
import { chainConsumptionToSegmentContext } from "./fullMatchChainSegmentContext";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateFullMatchChainRouteCandidateInfluence(): readonly string[] {
  const matchInput = engineToCoachPublicContractFixtures.matchInputFixture;
  const disabledContext = chainConsumptionToSegmentContext(consumeWorkbenchChainForFullMatch({
    matchInput,
    routeSelectionMode: "segment_harness",
    segmentLabel: "segment-1",
  }));
  const availableContext = chainConsumptionToSegmentContext(consumeWorkbenchChainForFullMatch({
    matchInput,
    routeSelectionMode: "workbench_chain_replay_experimental",
    segmentLabel: "segment-1",
  }));
  const disabledInfluence = applyChainContextToRouteCandidates({
    segmentContext: disabledContext,
    candidates: buildDiagnosticRouteCandidatesForSegment({
      segmentLabel: "segment-1",
      chainSegmentContext: disabledContext,
    }),
  });
  const availableInfluence = applyChainContextToRouteCandidates({
    segmentContext: availableContext,
    candidates: buildDiagnosticRouteCandidatesForSegment({
      segmentLabel: "segment-1",
      chainSegmentContext: availableContext,
    }),
  });
  const compatible = availableInfluence.influences.find((candidate) => candidate.candidateId === "chain-context-forward-progress-sh");
  const finalZoneCandidate = availableInfluence.influences.find((candidate) => candidate.targetZone === "Z4-HSR" && candidate.selectableAfterInfluence);

  assertTest(disabledInfluence.status === "not_available", "not_available segment context must return no influence.");
  assertTest(disabledInfluence.candidateCount === 0, "not_available segment context must not create candidates.");
  assertTest(availableInfluence.status === "available", "available segment context must return available influence.");
  assertTest(availableInfluence.scope === "diagnostic_shadow_ranking", "route candidate influence must be shadow diagnostic ranking.");
  assertTest(availableInfluence.finalCarrierId === "control-space-hunter", "influence must expose final carrier.");
  assertTest(availableInfluence.finalZone === "Z4-HSR", "influence must expose final zone.");
  assertTest((compatible?.influenceDelta ?? 0) > 0, "finalCarrierId must boost compatible receiver candidate.");
  assertTest((finalZoneCandidate?.influenceDelta ?? 0) > 0, "finalZone must boost compatible zone candidate.");
  assertTest(availableInfluence.influences.every((candidate) => candidate.influenceDelta >= -3 && candidate.influenceDelta <= 5), "influence delta must remain bounded.");
  assertTest(clampChainInfluenceDelta(12) === 5, "positive influence clamp must be capped at 5.");
  assertTest(clampChainInfluenceDelta(-8) === -3, "negative influence clamp must be capped at -3.");
  assertTest(availableInfluence.influencedCandidateCount > 0, "available influence must include influenced candidates.");
  assertTest(availableInfluence.diagnosticOnly, "route candidate influence must be diagnostic-only.");
  assertTest(!availableInfluence.canMutateScore, "route candidate influence must not mutate score.");
  assertTest(!availableInfluence.canMutateScoringEvents, "route candidate influence must not mutate scoring events.");
  assertTest(!availableInfluence.canDriveProductionSelection, "route candidate influence must not drive production selection.");

  return [
    "not_available segment context returns no influence",
    "available segment context returns influence result",
    "finalCarrierId boosts compatible receiver candidate",
    "finalZone boosts compatible zone candidate",
    "total delta is bounded",
    "influencedCandidateCount > 0",
    "diagnosticOnly = true",
    "canMutateScore = false",
    "canMutateScoringEvents = false",
    "canDriveProductionSelection = false",
  ];
}

if (require.main === module) {
  const checks = validateFullMatchChainRouteCandidateInfluence();

  console.log("fullMatchChainRouteCandidateInfluence tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

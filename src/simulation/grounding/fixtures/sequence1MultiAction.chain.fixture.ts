import type { WorkbenchChain, WorkbenchChainStepSource } from "../workbenchChainTypes";
import { sequence1Action1Chain } from "./sequence1Action1.chain.fixture";
import { sequence1Action2WorkbenchTruth } from "./sequence1Action2.fixture";
import { sequence1Action3WorkbenchTruth } from "./sequence1Action3.fixture";

function visualSource(artifactId: string, note: string): WorkbenchChainStepSource {
  return {
    source: "visual_workbench_truth",
    sourceArtifactId: artifactId,
    sourceNote: note,
  };
}

const visualStep0 = sequence1Action1Chain.steps[0];

if (visualStep0 === undefined) {
  throw new Error("sequence1Action1Chain must expose step 0 for the multi-action chain.");
}

export const sequence1MultiActionChain: WorkbenchChain = {
  chainId: "sequence-1-multi-action-chain",
  description: "Visual chain: Sequence 1 Action 1, Action 2, and Action 3 are all backed by visual workbench truth artifacts.",
  expectedPossessionTeamId: "control",
  expectedDefendingTeamId: "blitz",
  initialBallCarrierId: "control-tempo-half",
  initialBallZone: "Z4-HSL",
  finalExpectedBallCarrierId: "control-space-hunter",
  finalExpectedBallZone: "Z4-HSR",
  steps: [
    visualStep0,
    {
      stepIndex: 1,
      frame: sequence1Action2WorkbenchTruth,
      stepSource: visualSource(
        "reports/workbench/sequence-1-action-2.html",
        "Backed by the Sequence 1 Action 2 visual workbench artifact.",
      ),
      expectedActorId: "control-mobile-lock",
      expectedReceiverId: "control-playmaker",
      expectedNewCarrierId: "control-playmaker",
      expectedBallZoneBefore: "Z3-HSL",
      expectedBallZoneAfter: "Z3-C",
      expectedActionType: "CENTRAL_RECONNECT",
    },
    {
      stepIndex: 2,
      frame: sequence1Action3WorkbenchTruth,
      stepSource: visualSource(
        "reports/workbench/sequence-1-action-3.html",
        "Backed by the Sequence 1 Action 3 visual workbench artifact.",
      ),
      expectedActorId: "control-playmaker",
      expectedReceiverId: "control-space-hunter",
      expectedNewCarrierId: "control-space-hunter",
      expectedBallZoneBefore: "Z3-C",
      expectedBallZoneAfter: "Z4-HSR",
      expectedActionType: "FORWARD_PROGRESS",
    },
  ],
};

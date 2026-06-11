import { sequence1Action1WorkbenchTruth } from "./sequence1Action1.fixture";
import type { WorkbenchChain } from "../workbenchChainTypes";

export const sequence1Action1Chain: WorkbenchChain = {
  chainId: "sequence-1-action-1-chain",
  description: "CONTROL first pressure-escape recycle from TH to ML, represented as a stateful workbench chain seed.",
  expectedPossessionTeamId: "control",
  expectedDefendingTeamId: "blitz",
  initialBallCarrierId: "control-tempo-half",
  initialBallZone: "Z4-HSL",
  finalExpectedBallCarrierId: "control-mobile-lock",
  finalExpectedBallZone: "Z3-HSL",
  steps: [
    {
      stepIndex: 0,
      frame: sequence1Action1WorkbenchTruth,
      stepSource: {
        source: "visual_workbench_truth",
        sourceArtifactId: "reports/workbench/sequence-1-action-1.html",
        sourceNote: "Backed by the Sequence 1 Action 1 visual workbench artifact.",
      },
      expectedActorId: "control-tempo-half",
      expectedReceiverId: "control-mobile-lock",
      expectedNewCarrierId: "control-mobile-lock",
      expectedBallZoneBefore: "Z4-HSL",
      expectedBallZoneAfter: "Z3-HSL",
      expectedActionType: "SUPPORT_CLUSTER_RECYCLE",
    },
  ],
};

// Extension points:
// - sequence-1-action-2
// - sequence-1-action-3
// - sequence-3-action-1 before/after SVG artifacts
// - full opening possession chain

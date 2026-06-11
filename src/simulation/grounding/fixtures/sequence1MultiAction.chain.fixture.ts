import type { TacticalWorkbenchFrame, TacticalWorkbenchPlayerPosition, TacticalWorkbenchRankedOption } from "../tacticalWorkbenchTypes";
import type { WorkbenchChain, WorkbenchChainStepSource } from "../workbenchChainTypes";
import { sequence1Action1Chain } from "./sequence1Action1.chain.fixture";
import { sequence1Action1AfterPositions, sequence1Action1WorkbenchTruth } from "./sequence1Action1.fixture";

function withCarrier(
  positions: readonly TacticalWorkbenchPlayerPosition[],
  carrierId: string,
  carrierZone: string,
): readonly TacticalWorkbenchPlayerPosition[] {
  return positions.map((position) => ({
    ...position,
    realZone: position.playerId === carrierId ? carrierZone : position.realZone,
    ...(position.playerId === carrierId
      ? { projectedZone: carrierZone }
      : position.projectedZone === undefined ? {} : { projectedZone: position.projectedZone }),
    ...(position.playerId === carrierId ? { isBallCarrier: true } : {}),
    ...(position.playerId !== carrierId && position.isBallCarrier ? { isBallCarrier: false } : {}),
  }));
}

function selectedOption(input: {
  readonly actionType: string;
  readonly receiverId: string;
  readonly targetZone: string;
  readonly score: number;
}): TacticalWorkbenchRankedOption {
  return {
    rank: 1,
    actionType: input.actionType,
    receiverId: input.receiverId,
    targetZone: input.targetZone,
    laneState: "CONTESTED",
    risk: "LOW",
    score: input.score,
    finalSelectionScore: input.score,
    selected: true,
  };
}

const syntheticSource = (note: string): WorkbenchChainStepSource => ({
  source: "synthetic_continuation",
  sourceNote: note,
});

const step1Before = withCarrier(sequence1Action1AfterPositions, "control-mobile-lock", "Z3-HSL");
const step1After = withCarrier(step1Before, "control-playmaker", "Z3-C");
const step2Before = step1After;
const step2After = withCarrier(step2Before, "control-space-hunter", "Z4-HSR");
const visualStep0 = sequence1Action1Chain.steps[0];

if (visualStep0 === undefined) {
  throw new Error("sequence1Action1Chain must expose step 0 for the multi-action chain.");
}

const sequence1Action2SyntheticFrame: TacticalWorkbenchFrame = {
  ...sequence1Action1WorkbenchTruth,
  frameId: "sequence-1-action-2-synthetic-continuation",
  actionId: "action-2-synthetic-continuation",
  phase: "CONTROLLED_CONTINUATION",
  ballCarrierId: "control-mobile-lock",
  ballZone: "Z3-HSL",
  playerPositions: step1Before,
  afterPlayerPositions: step1After,
  teamShapeIntents: [
    {
      teamId: "control",
      frame: "before",
      intent: "synthetic central reconnection continuation",
      evidence: ["ML@Z3-HSL", "PM@Z3-C"],
    },
    {
      teamId: "control",
      frame: "after",
      intent: "central support restored for next progression",
      evidence: ["PM@Z3-C"],
    },
  ],
  selectedAction: {
    actorId: "control-mobile-lock",
    receiverId: "control-playmaker",
    newCarrierId: "control-playmaker",
    fromZone: "Z3-HSL",
    targetZone: "Z3-C",
    actualReceptionZone: "Z3-C",
    actionType: "CENTRAL_RECONNECT",
    actionSubtype: "SAFE_CONTINUITY",
    transferType: "PASS",
    possessionResult: "CONTROL_RETAINED",
  },
  rankedOptions: [
    selectedOption({
      actionType: "CENTRAL_RECONNECT",
      receiverId: "control-playmaker",
      targetZone: "Z3-C",
      score: 82,
    }),
    {
      rank: 2,
      actionType: "FORWARD_PROGRESS",
      receiverId: "control-forward-leader",
      targetZone: "Z4-C",
      laneState: "CONTESTED",
      risk: "MEDIUM",
      score: 75,
      finalSelectionScore: 75,
      selected: false,
    },
  ],
  afterState: {
    newCarrierId: "control-playmaker",
    ballZone: "Z3-C",
    possessionResult: "CONTROL_RETAINED",
  },
};

const sequence1Action3SyntheticFrame: TacticalWorkbenchFrame = {
  ...sequence1Action1WorkbenchTruth,
  frameId: "sequence-1-action-3-synthetic-continuation",
  actionId: "action-3-synthetic-continuation",
  phase: "STRUCTURE_ADVANCEMENT",
  ballCarrierId: "control-playmaker",
  ballZone: "Z3-C",
  playerPositions: step2Before,
  afterPlayerPositions: step2After,
  teamShapeIntents: [
    {
      teamId: "control",
      frame: "before",
      intent: "synthetic forward support advance",
      evidence: ["PM@Z3-C", "SH@Z4-HSR"],
    },
    {
      teamId: "control",
      frame: "after",
      intent: "advanced receiver prepared on the right half-space",
      evidence: ["SH@Z4-HSR"],
    },
  ],
  selectedAction: {
    actorId: "control-playmaker",
    receiverId: "control-space-hunter",
    newCarrierId: "control-space-hunter",
    fromZone: "Z3-C",
    targetZone: "Z4-HSR",
    actualReceptionZone: "Z4-HSR",
    actionType: "FORWARD_PROGRESS",
    actionSubtype: "SUPPORT_ADVANCE",
    transferType: "PASS",
    possessionResult: "CONTROL_RETAINED",
  },
  rankedOptions: [
    selectedOption({
      actionType: "FORWARD_PROGRESS",
      receiverId: "control-space-hunter",
      targetZone: "Z4-HSR",
      score: 84,
    }),
    {
      rank: 2,
      actionType: "SAFE_RECYCLE",
      receiverId: "control-pivot",
      targetZone: "Z2-HSL",
      laneState: "CONTESTED",
      risk: "LOW",
      score: 73,
      finalSelectionScore: 73,
      selected: false,
    },
  ],
  afterState: {
    newCarrierId: "control-space-hunter",
    ballZone: "Z4-HSR",
    possessionResult: "CONTROL_RETAINED",
  },
};

export const sequence1MultiActionChain: WorkbenchChain = {
  chainId: "sequence-1-multi-action-chain",
  description: "Hybrid chain: visual sequence-1-action-1 truth followed by synthetic typed continuation steps for central reconnection and forward support advance.",
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
      frame: sequence1Action2SyntheticFrame,
      stepSource: syntheticSource("Synthetic typed continuation only; not backed by a visual workbench artifact yet."),
      expectedActorId: "control-mobile-lock",
      expectedReceiverId: "control-playmaker",
      expectedNewCarrierId: "control-playmaker",
      expectedBallZoneBefore: "Z3-HSL",
      expectedBallZoneAfter: "Z3-C",
      expectedActionType: "CENTRAL_RECONNECT",
    },
    {
      stepIndex: 2,
      frame: sequence1Action3SyntheticFrame,
      stepSource: syntheticSource("Synthetic typed continuation only; future sprint should replace it with a real visual workbench artifact."),
      expectedActorId: "control-playmaker",
      expectedReceiverId: "control-space-hunter",
      expectedNewCarrierId: "control-space-hunter",
      expectedBallZoneBefore: "Z3-C",
      expectedBallZoneAfter: "Z4-HSR",
      expectedActionType: "FORWARD_PROGRESS",
    },
  ],
};

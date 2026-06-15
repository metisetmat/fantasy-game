import type { TacticalWorkbenchFrame, TacticalWorkbenchPlayerPosition } from "../tacticalWorkbenchTypes";
import { sequence1Action2AfterPositions } from "./sequence1Action2.fixture";

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

export const sequence1Action3BeforePositions: readonly TacticalWorkbenchPlayerPosition[] = withCarrier(
  sequence1Action2AfterPositions,
  "control-playmaker",
  "Z3-C",
);

export const sequence1Action3AfterPositions: readonly TacticalWorkbenchPlayerPosition[] = withCarrier(
  sequence1Action3BeforePositions,
  "control-space-hunter",
  "Z4-HSR",
);

export const sequence1Action3WorkbenchTruth: TacticalWorkbenchFrame = {
  frameId: "sequence-1-action-3",
  sequenceId: "sequence-1",
  actionId: "action-3",
  phase: "STRUCTURE_ADVANCEMENT",
  possessionTeamId: "control",
  defendingTeamId: "blitz",
  ballCarrierId: "control-playmaker",
  ballZone: "Z3-C",
  attackingDirection: "LEFT_TO_RIGHT",
  playerPositions: sequence1Action3BeforePositions,
  afterPlayerPositions: sequence1Action3AfterPositions,
  teamShapeIntents: [
    {
      teamId: "control",
      frame: "before",
      intent: "central platform ready to advance into the right half-space",
      evidence: ["PM@Z3-C", "SH@Z4-C", "RP@Z2-HSR"],
    },
    {
      teamId: "control",
      frame: "after",
      intent: "forward support line reached without abandoning rest defense",
      evidence: ["SH@Z4-HSR", "PM@Z3-C", "PV@Z2-HSL"],
    },
    {
      teamId: "blitz",
      frame: "before",
      intent: "central pressure narrows the immediate rebuild lane",
      evidence: ["BLITZ SH@Z3-C", "BLITZ ML@Z3-HSL"],
    },
    {
      teamId: "blitz",
      frame: "after",
      intent: "right half-space response after CONTROL progresses",
      evidence: ["BLITZ SH@Z3-C", "BLITZ RP@Z5-C"],
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
    {
      rank: 1,
      actionType: "FORWARD_PROGRESS",
      receiverId: "control-space-hunter",
      targetZone: "Z4-HSR",
      laneState: "OPEN",
      risk: "MEDIUM",
      score: 86,
      finalSelectionScore: 86,
      selected: true,
    },
    {
      rank: 2,
      actionType: "SAFE_RECYCLE",
      receiverId: "control-pivot",
      targetZone: "Z2-HSL",
      laneState: "OPEN",
      risk: "LOW",
      score: 73,
      finalSelectionScore: 73,
      selected: false,
    },
    {
      rank: 3,
      actionType: "WEAK_SIDE_SWITCH",
      receiverId: "control-right-piston",
      targetZone: "Z3-HSR",
      laneState: "CONTESTED",
      risk: "MEDIUM",
      score: 71,
      finalSelectionScore: 71,
      selected: false,
    },
  ],
  afterState: {
    newCarrierId: "control-space-hunter",
    ballZone: "Z4-HSR",
    possessionResult: "CONTROL_RETAINED",
  },
};

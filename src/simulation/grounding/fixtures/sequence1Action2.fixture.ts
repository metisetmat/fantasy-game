import type { TacticalWorkbenchFrame, TacticalWorkbenchPlayerPosition } from "../tacticalWorkbenchTypes";
import { sequence1Action1AfterPositions } from "./sequence1Action1.fixture";

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

export const sequence1Action2BeforePositions: readonly TacticalWorkbenchPlayerPosition[] = withCarrier(
  sequence1Action1AfterPositions,
  "control-mobile-lock",
  "Z3-HSL",
);

export const sequence1Action2AfterPositions: readonly TacticalWorkbenchPlayerPosition[] = withCarrier(
  sequence1Action2BeforePositions,
  "control-playmaker",
  "Z3-C",
);

export const sequence1Action2WorkbenchTruth: TacticalWorkbenchFrame = {
  frameId: "sequence-1-action-2",
  sequenceId: "sequence-1",
  actionId: "action-2",
  phase: "CONTROLLED_CONTINUATION",
  possessionTeamId: "control",
  defendingTeamId: "blitz",
  ballCarrierId: "control-mobile-lock",
  ballZone: "Z3-HSL",
  attackingDirection: "LEFT_TO_RIGHT",
  playerPositions: sequence1Action2BeforePositions,
  afterPlayerPositions: sequence1Action2AfterPositions,
  teamShapeIntents: [
    {
      teamId: "control",
      frame: "before",
      intent: "central reconnection after the first pressure escape",
      evidence: ["ML@Z3-HSL", "PM@Z2-C", "PV@Z2-HSL"],
    },
    {
      teamId: "control",
      frame: "after",
      intent: "central support restored for the next forward action",
      evidence: ["PM@Z3-C", "SH@Z4-C", "HL@Z3-CL"],
    },
    {
      teamId: "blitz",
      frame: "before",
      intent: "compact pressure around the left half-space recycle",
      evidence: ["BLITZ ML@Z3-HSL", "BLITZ PV@Z3-HSL"],
    },
    {
      teamId: "blitz",
      frame: "after",
      intent: "central lane compression after CONTROL reconnects",
      evidence: ["BLITZ SH@Z3-C", "BLITZ ML@Z3-HSL"],
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
    {
      rank: 1,
      actionType: "CENTRAL_RECONNECT",
      receiverId: "control-playmaker",
      targetZone: "Z3-C",
      laneState: "OPEN",
      risk: "LOW",
      score: 84,
      finalSelectionScore: 84,
      selected: true,
    },
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
    {
      rank: 3,
      actionType: "SAFE_RECYCLE",
      receiverId: "control-pivot",
      targetZone: "Z2-HSL",
      laneState: "OPEN",
      risk: "LOW",
      score: 70,
      finalSelectionScore: 70,
      selected: false,
    },
  ],
  afterState: {
    newCarrierId: "control-playmaker",
    ballZone: "Z3-C",
    possessionResult: "CONTROL_RETAINED",
  },
};

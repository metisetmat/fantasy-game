import type { TacticalWorkbenchFrame, TacticalWorkbenchPlayerPosition } from "../tacticalWorkbenchTypes";

const beforeControl: readonly TacticalWorkbenchPlayerPosition[] = [
  { playerId: "control-tempo-half", teamId: "control", role: "tempo_half", initials: "TH", realZone: "Z4-HSL", renderedZone: "Z4-HSL offset", projectedZone: "Z4-HSL", isBallCarrier: true },
  { playerId: "control-hook-link", teamId: "control", role: "hook_link", initials: "HL", realZone: "Z4-CL", renderedZone: "Z4-CL offset", projectedZone: "Z4-CL" },
  { playerId: "control-forward-leader", teamId: "control", role: "forward_leader", initials: "FL", realZone: "Z5-HSL", renderedZone: "Z5-HSL offset", projectedZone: "Z5-HSL" },
  { playerId: "control-goalkeeper-free-safety", teamId: "control", role: "goalkeeper_free_safety", initials: "GK", realZone: "Z2-C", renderedZone: "Z2-C", projectedZone: "Z2-C" },
  { playerId: "control-mobile-lock", teamId: "control", role: "mobile_lock", initials: "ML", realZone: "Z3-HSL", renderedZone: "Z3-HSL", projectedZone: "Z3-HSL" },
  { playerId: "control-space-hunter", teamId: "control", role: "space_hunter", initials: "SH", realZone: "Z5-HSR", renderedZone: "Z5-HSR", projectedZone: "Z5-HSR" },
  { playerId: "control-playmaker", teamId: "control", role: "playmaker", initials: "PM", realZone: "Z4-C", renderedZone: "Z4-C offset", projectedZone: "Z4-C" },
  { playerId: "control-pivot", teamId: "control", role: "pivot", initials: "PV", realZone: "Z3-C", renderedZone: "Z3-C", projectedZone: "Z3-C" },
  { playerId: "control-left-piston", teamId: "control", role: "left_piston", initials: "LP", realZone: "Z3-CL", renderedZone: "Z3-CL", projectedZone: "Z3-CL" },
  { playerId: "control-right-piston", teamId: "control", role: "right_piston", initials: "RP", realZone: "Z3-HSR", renderedZone: "Z3-HSR", projectedZone: "Z3-HSR" },
];

const beforeBlitz: readonly TacticalWorkbenchPlayerPosition[] = [
  { playerId: "blitz-tempo-half", teamId: "blitz", role: "tempo_half", initials: "TH", realZone: "Z5-HSL", renderedZone: "Z5-HSL offset", projectedZone: "Z5-HSL" },
  { playerId: "blitz-hook-link", teamId: "blitz", role: "hook_link", initials: "HL", realZone: "Z4-CL", renderedZone: "Z4-CL offset", projectedZone: "Z4-CL" },
  { playerId: "blitz-forward-leader", teamId: "blitz", role: "forward_leader", initials: "FL", realZone: "Z4-C", renderedZone: "Z4-C offset", projectedZone: "Z4-C" },
  { playerId: "blitz-goalkeeper-free-safety", teamId: "blitz", role: "goalkeeper_free_safety", initials: "GK", realZone: "Z6-C", renderedZone: "Z6-C", projectedZone: "Z6-C" },
  { playerId: "blitz-mobile-lock", teamId: "blitz", role: "mobile_lock", initials: "ML", realZone: "Z4-HSL", renderedZone: "Z4-HSL offset", projectedZone: "Z4-HSL" },
  { playerId: "blitz-space-hunter", teamId: "blitz", role: "space_hunter", initials: "SH", realZone: "Z5-C", renderedZone: "Z5-C offset", projectedZone: "Z5-C" },
  { playerId: "blitz-playmaker", teamId: "blitz", role: "playmaker", initials: "PM", realZone: "Z5-HSL", renderedZone: "Z5-HSL offset", projectedZone: "Z5-HSL" },
  { playerId: "blitz-pivot", teamId: "blitz", role: "pivot", initials: "PV", realZone: "Z4-HSL", renderedZone: "Z4-HSL offset", projectedZone: "Z4-HSL" },
  { playerId: "blitz-left-piston", teamId: "blitz", role: "left_piston", initials: "LP", realZone: "Z5-CL", renderedZone: "Z5-CL", projectedZone: "Z5-CL" },
  { playerId: "blitz-right-piston", teamId: "blitz", role: "right_piston", initials: "RP", realZone: "Z5-C", renderedZone: "Z5-C offset", projectedZone: "Z5-C" },
];

export const sequence1Action1AfterPositions: readonly TacticalWorkbenchPlayerPosition[] = [
  { playerId: "control-tempo-half", teamId: "control", role: "tempo_half", initials: "TH", realZone: "Z3-HSL", renderedZone: "Z3-HSL offset", projectedZone: "Z3-HSL" },
  { playerId: "control-hook-link", teamId: "control", role: "hook_link", initials: "HL", realZone: "Z3-CL", renderedZone: "Z3-CL offset", projectedZone: "Z3-HSL" },
  { playerId: "control-forward-leader", teamId: "control", role: "forward_leader", initials: "FL", realZone: "Z4-C", renderedZone: "Z4-C offset", projectedZone: "Z4-C" },
  { playerId: "control-goalkeeper-free-safety", teamId: "control", role: "goalkeeper_free_safety", initials: "GK", realZone: "Z1-C", renderedZone: "Z1-C", projectedZone: "Z1-C" },
  { playerId: "control-mobile-lock", teamId: "control", role: "mobile_lock", initials: "ML", realZone: "Z3-HSL", renderedZone: "Z3-HSL offset", projectedZone: "Z2-C", isBallCarrier: true },
  { playerId: "control-space-hunter", teamId: "control", role: "space_hunter", initials: "SH", realZone: "Z4-C", renderedZone: "Z4-C offset", projectedZone: "Z4-C" },
  { playerId: "control-playmaker", teamId: "control", role: "playmaker", initials: "PM", realZone: "Z2-C", renderedZone: "Z2-C", projectedZone: "Z2-C" },
  { playerId: "control-pivot", teamId: "control", role: "pivot", initials: "PV", realZone: "Z2-HSL", renderedZone: "Z2-HSL offset", projectedZone: "Z2-HSL" },
  { playerId: "control-left-piston", teamId: "control", role: "left_piston", initials: "LP", realZone: "Z2-CL", renderedZone: "Z2-CL", projectedZone: "Z2-CL" },
  { playerId: "control-right-piston", teamId: "control", role: "right_piston", initials: "RP", realZone: "Z2-HSR", renderedZone: "Z2-HSR", projectedZone: "Z2-CR" },
  { playerId: "blitz-mobile-lock", teamId: "blitz", role: "mobile_lock", initials: "ML", realZone: "Z3-HSL", renderedZone: "Z3-HSL offset", projectedZone: "Z3-HSL" },
  { playerId: "blitz-space-hunter", teamId: "blitz", role: "space_hunter", initials: "SH", realZone: "Z3-C", renderedZone: "Z3-C", projectedZone: "Z3-C" },
  { playerId: "blitz-pivot", teamId: "blitz", role: "pivot", initials: "PV", realZone: "Z3-HSL", renderedZone: "Z3-HSL offset", projectedZone: "Z3-HSL" },
];

export const sequence1Action1WorkbenchTruth: TacticalWorkbenchFrame = {
  frameId: "sequence-1-action-1",
  sequenceId: "sequence-1",
  actionId: "action-1",
  phase: "STABLE_POSSESSION",
  possessionTeamId: "control",
  defendingTeamId: "blitz",
  ballCarrierId: "control-tempo-half",
  ballZone: "Z4-HSL",
  attackingDirection: "LEFT_TO_RIGHT",
  playerPositions: [...beforeControl, ...beforeBlitz],
  afterPlayerPositions: sequence1Action1AfterPositions,
  teamShapeIntents: [
    { teamId: "control", frame: "before", intent: "structured pressure escape support", evidence: ["TH@Z4-HSL", "ML@Z3-HSL", "PV@Z3-C"] },
    { teamId: "control", frame: "after", intent: "rest-defense protected recycle base", evidence: ["GK@Z1-C", "PV@Z2-HSL", "LP@Z2-CL"] },
    { teamId: "blitz", frame: "before", intent: "ball-side pressure and lane compression", evidence: ["ML@Z4-HSL", "PV@Z4-HSL"] },
    { teamId: "blitz", frame: "after", intent: "compact response around ML reception", evidence: ["ML@Z3-HSL", "SH@Z3-C", "PV@Z3-HSL"] },
  ],
  selectedAction: {
    actorId: "control-tempo-half",
    receiverId: "control-mobile-lock",
    newCarrierId: "control-mobile-lock",
    fromZone: "Z4-HSL",
    targetZone: "Z3-C",
    actualReceptionZone: "Z3-HSL",
    actionType: "SUPPORT_CLUSTER_RECYCLE",
    actionSubtype: "BALL_SIDE_PRESSURE_ESCAPE",
    transferType: "PASS",
    possessionResult: "CONTROL_RETAINED",
  },
  rankedOptions: [
    { rank: 1, actionType: "SUPPORT_CLUSTER_RECYCLE", receiverId: "control-mobile-lock", targetZone: "Z3-C", laneState: "CLOSED", risk: "LOW", score: 87, finalSelectionScore: 87, selected: true },
    { rank: 2, actionType: "FORWARD_PROGRESS", receiverId: "control-forward-leader", targetZone: "Z5-HSL", laneState: "CLOSED", risk: "HIGH", score: 78, finalSelectionScore: 78, selected: false },
    { rank: 3, actionType: "WEAK_SIDE_SWITCH", receiverId: "control-right-piston", targetZone: "Z3-HSR", laneState: "CONTESTED", risk: "MEDIUM", score: 72, finalSelectionScore: 72, selected: false },
  ],
  afterState: {
    newCarrierId: "control-mobile-lock",
    ballZone: "Z3-HSL",
    possessionResult: "CONTROL_RETAINED",
  },
};

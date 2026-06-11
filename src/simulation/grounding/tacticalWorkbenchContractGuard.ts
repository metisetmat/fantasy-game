import type { TacticalWorkbenchFrame } from "./tacticalWorkbenchTypes";
import { sequence1Action1WorkbenchTruth } from "./fixtures/sequence1Action1.fixture";
import { sequence1Action2WorkbenchTruth } from "./fixtures/sequence1Action2.fixture";
import { sequence1Action3WorkbenchTruth } from "./fixtures/sequence1Action3.fixture";
import { sequence1MultiActionChain } from "./fixtures/sequence1MultiAction.chain.fixture";

function assertGuard(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function playerExists(frame: TacticalWorkbenchFrame, playerId: string, zone: string): boolean {
  return frame.playerPositions.some((player) => player.playerId === playerId && player.realZone === zone);
}

function afterPlayerExists(frame: TacticalWorkbenchFrame, playerId: string, zone: string): boolean {
  return (frame.afterPlayerPositions ?? []).some((player) => player.playerId === playerId && player.realZone === zone);
}

function renderedZonesStayDistinctFromRealOffsets(frame: TacticalWorkbenchFrame): boolean {
  return frame.playerPositions
    .filter((player) => player.renderedZone?.includes("offset"))
    .every((player) => player.renderedZone !== player.realZone);
}

export function validateSequenceOneActionOneWorkbenchTruth(
  frame: TacticalWorkbenchFrame = sequence1Action1WorkbenchTruth,
): readonly string[] {
  assertGuard(frame.ballCarrierId === "control-tempo-half", "before ball carrier must be CONTROL TH.");
  assertGuard(frame.ballZone === "Z4-HSL", "before ball zone must be Z4-HSL.");
  assertGuard(frame.selectedAction.actorId === "control-tempo-half", "selected action decision actor must be CONTROL TH.");
  assertGuard(frame.selectedAction.receiverId === "control-mobile-lock", "selected receiver must be CONTROL ML.");
  assertGuard(frame.selectedAction.newCarrierId === "control-mobile-lock", "new carrier after action must be CONTROL ML.");
  assertGuard(frame.selectedAction.actualReceptionZone === "Z3-HSL", "actual reception zone must be Z3-HSL.");
  assertGuard(frame.afterState?.ballZone === "Z3-HSL", "actual ball zone after action must be Z3-HSL.");
  assertGuard(frame.selectedAction.actionType === "SUPPORT_CLUSTER_RECYCLE", "selected action type must be SUPPORT_CLUSTER_RECYCLE.");
  assertGuard(frame.selectedAction.actionSubtype === "BALL_SIDE_PRESSURE_ESCAPE", "selected action subtype must be BALL_SIDE_PRESSURE_ESCAPE.");
  assertGuard(frame.selectedAction.targetZone === "Z3-C", "target cluster must be Z3-C.");
  assertGuard(frame.selectedAction.actorId !== "control-mobile-lock", "selected action must not say ML was decision actor.");
  assertGuard(playerExists(frame, "control-tempo-half", "Z4-HSL"), "CONTROL TH must exist at real zone Z4-HSL before action.");
  assertGuard(playerExists(frame, "control-mobile-lock", "Z3-HSL"), "CONTROL ML must exist at real zone Z3-HSL before action.");
  assertGuard(afterPlayerExists(frame, "control-mobile-lock", "Z3-HSL"), "CONTROL ML must exist at real zone Z3-HSL after action.");
  assertGuard(
    frame.teamShapeIntents.some((intent) => intent.teamId === "control" && intent.frame === "after"),
    "CONTROL rest-defense after-state must exist.",
  );
  assertGuard(
    frame.teamShapeIntents.some((intent) => intent.teamId === "blitz" && intent.frame === "after"),
    "BLITZ defensive/pressing response must exist.",
  );
  assertGuard(renderedZonesStayDistinctFromRealOffsets(frame), "real zones and rendered offset zones must not be confused.");

  return [
    "before ball carrier is CONTROL TH",
    "before ball zone is Z4-HSL",
    "selected action is TH -> ML",
    "new carrier after action is CONTROL ML",
    "actual ball zone after action is Z3-HSL",
    "selected action type is SUPPORT_CLUSTER_RECYCLE",
    "target cluster is Z3-C",
    "CONTROL and BLITZ after-state shapes exist",
    "real zones and rendered-offset zones remain distinct",
  ];
}

export function validateSequenceOneActionTwoWorkbenchTruth(
  frame: TacticalWorkbenchFrame = sequence1Action2WorkbenchTruth,
): readonly string[] {
  assertGuard(frame.frameId === "sequence-1-action-2", "frame must be sequence-1-action-2.");
  assertGuard(frame.ballCarrierId === "control-mobile-lock", "before ball carrier must be CONTROL ML.");
  assertGuard(frame.ballZone === "Z3-HSL", "before ball zone must be Z3-HSL.");
  assertGuard(frame.selectedAction.actorId === "control-mobile-lock", "selected action decision actor must be CONTROL ML.");
  assertGuard(frame.selectedAction.receiverId === "control-playmaker", "selected receiver must be CONTROL PM.");
  assertGuard(frame.selectedAction.newCarrierId === "control-playmaker", "new carrier after action must be CONTROL PM.");
  assertGuard(frame.selectedAction.fromZone === "Z3-HSL", "selected action from zone must be Z3-HSL.");
  assertGuard(frame.selectedAction.actualReceptionZone === "Z3-C", "actual reception zone must be Z3-C.");
  assertGuard(frame.afterState?.ballZone === "Z3-C", "actual ball zone after action must be Z3-C.");
  assertGuard(frame.selectedAction.actionType === "CENTRAL_RECONNECT", "selected action type must be CENTRAL_RECONNECT.");
  assertGuard(playerExists(frame, "control-mobile-lock", "Z3-HSL"), "CONTROL ML must exist at real zone Z3-HSL before action.");
  assertGuard(afterPlayerExists(frame, "control-playmaker", "Z3-C"), "CONTROL PM must exist at real zone Z3-C after action.");
  assertGuard(renderedZonesStayDistinctFromRealOffsets(frame), "real zones and rendered offset zones must not be confused.");

  return [
    "sequence-1-action-2 visual truth exists",
    "selected action is ML -> PM",
    "ball transition is Z3-HSL -> Z3-C",
    "new carrier after action is CONTROL PM",
    "real zones and rendered-offset zones remain distinct",
  ];
}

export function validateSequenceOneActionThreeWorkbenchTruth(
  frame: TacticalWorkbenchFrame = sequence1Action3WorkbenchTruth,
): readonly string[] {
  assertGuard(frame.frameId === "sequence-1-action-3", "frame must be sequence-1-action-3.");
  assertGuard(frame.ballCarrierId === "control-playmaker", "before ball carrier must be CONTROL PM.");
  assertGuard(frame.ballZone === "Z3-C", "before ball zone must be Z3-C.");
  assertGuard(frame.selectedAction.actorId === "control-playmaker", "selected action decision actor must be CONTROL PM.");
  assertGuard(frame.selectedAction.receiverId === "control-space-hunter", "selected receiver must be CONTROL SH.");
  assertGuard(frame.selectedAction.newCarrierId === "control-space-hunter", "new carrier after action must be CONTROL SH.");
  assertGuard(frame.selectedAction.fromZone === "Z3-C", "selected action from zone must be Z3-C.");
  assertGuard(frame.selectedAction.actualReceptionZone === "Z4-HSR", "actual reception zone must be Z4-HSR.");
  assertGuard(frame.afterState?.ballZone === "Z4-HSR", "actual ball zone after action must be Z4-HSR.");
  assertGuard(frame.selectedAction.actionType === "FORWARD_PROGRESS", "selected action type must be FORWARD_PROGRESS.");
  assertGuard(playerExists(frame, "control-playmaker", "Z3-C"), "CONTROL PM must exist at real zone Z3-C before action.");
  assertGuard(afterPlayerExists(frame, "control-space-hunter", "Z4-HSR"), "CONTROL SH must exist at real zone Z4-HSR after action.");
  assertGuard(renderedZonesStayDistinctFromRealOffsets(frame), "real zones and rendered offset zones must not be confused.");

  return [
    "sequence-1-action-3 visual truth exists",
    "selected action is PM -> SH",
    "ball transition is Z3-C -> Z4-HSR",
    "new carrier after action is CONTROL SH",
    "real zones and rendered-offset zones remain distinct",
  ];
}

export function validateSequenceOneMultiActionWorkbenchChainTruth(): readonly string[] {
  const step0 = sequence1MultiActionChain.steps[0];
  const step1 = sequence1MultiActionChain.steps[1];
  const step2 = sequence1MultiActionChain.steps[2];

  if (step0 === undefined || step1 === undefined || step2 === undefined) {
    throw new Error("multi-action chain must expose three steps.");
  }

  assertGuard(sequence1MultiActionChain.steps.length === 3, "multi-action chain must contain exactly three steps.");
  assertGuard(step0.stepSource.source === "visual_workbench_truth", "step 0 must use visual workbench truth.");
  assertGuard(step1.stepSource.source === "visual_workbench_truth", "step 1 must use visual workbench truth.");
  assertGuard(step2.stepSource.source === "visual_workbench_truth", "step 2 must use visual workbench truth.");
  assertGuard(!sequence1MultiActionChain.steps.some((step) => step.stepSource.source === "synthetic_continuation"), "no synthetic continuation may remain in the PASS chain.");
  assertGuard(step0.expectedNewCarrierId === step1.expectedActorId, "step 0 after carrier must match step 1 before actor.");
  assertGuard(step0.expectedBallZoneAfter === step1.expectedBallZoneBefore, "step 0 after zone must match step 1 before zone.");
  assertGuard(step1.expectedNewCarrierId === step2.expectedActorId, "step 1 after carrier must match step 2 before actor.");
  assertGuard(step1.expectedBallZoneAfter === step2.expectedBallZoneBefore, "step 1 after zone must match step 2 before zone.");
  assertGuard(step2.expectedNewCarrierId === sequence1MultiActionChain.finalExpectedBallCarrierId, "step 2 after carrier must match final expected carrier.");
  assertGuard(step2.expectedBallZoneAfter === sequence1MultiActionChain.finalExpectedBallZone, "step 2 after zone must match final expected zone.");

  return [
    "multi-action chain exposes three visual workbench steps",
    "Step 0 after state matches Step 1 before state",
    "Step 1 after state matches Step 2 before state",
    "Step 2 after state matches final chain expected state",
    "no synthetic_continuation remains in PASS path",
  ];
}

if (require.main === module) {
  const checks = [
    ...validateSequenceOneActionOneWorkbenchTruth(),
    ...validateSequenceOneActionTwoWorkbenchTruth(),
    ...validateSequenceOneActionThreeWorkbenchTruth(),
    ...validateSequenceOneMultiActionWorkbenchChainTruth(),
  ];

  console.log("tacticalWorkbenchContractGuard passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

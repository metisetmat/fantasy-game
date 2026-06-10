import type { TacticalWorkbenchFrame } from "./tacticalWorkbenchTypes";
import { sequence1Action1WorkbenchTruth } from "./fixtures/sequence1Action1.fixture";

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

if (require.main === module) {
  const checks = validateSequenceOneActionOneWorkbenchTruth();

  console.log("tacticalWorkbenchContractGuard passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

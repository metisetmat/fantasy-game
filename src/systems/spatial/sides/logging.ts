import type { TacticalLogLine } from "../../interactions/shared";
import { createLogLine } from "../../interactions/shared";
import type { SideContextEvaluation } from "./types";

export function createSideContextLogs(sideContext: SideContextEvaluation): readonly TacticalLogLine[] {
  return [
    createLogLine(`Open side: ${sideContext.openSide.toUpperCase()}.`),
    createLogLine(`Closed side: ${sideContext.closedSide.toUpperCase()}.`),
    createLogLine(`Reason: ${sideContext.reason}.`),
  ];
}

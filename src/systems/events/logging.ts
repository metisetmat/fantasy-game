import { createLogLine, type TacticalLogLine } from "../interactions/shared";
import type { TacticalEventChain } from "./types";

export function createTacticalEventChainLogs(chain: TacticalEventChain): readonly TacticalLogLine[] {
  return [
    createLogLine("### Tactical Event Chain"),
    ...chain.events.map((event) => createLogLine(event.description)),
    createLogLine(chain.summary),
  ];
}

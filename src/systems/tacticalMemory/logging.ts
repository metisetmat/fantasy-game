import type { TacticalLogLine } from "../interactions/shared";
import { createLogLine } from "../interactions/shared";
import type { TargetSelectionMemoryModifier } from "./types";

export function createTacticalMemoryLogs(modifiers: readonly TargetSelectionMemoryModifier[]): readonly TacticalLogLine[] {
  if (modifiers.length === 0) {
    return [createLogLine("Tactical memory: no strong recent pattern.")];
  }

  return [
    createLogLine("Tactical memory modifiers:"),
    ...modifiers.slice(0, 3).map((modifier) =>
      createLogLine(
        `- ${modifier.moveType} on ${modifier.sideType}: ${modifier.reason} ${modifier.value >= 0 ? "+" : ""}${modifier.value}.`,
      ),
    ),
  ];
}

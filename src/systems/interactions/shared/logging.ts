import type { TacticalLogLine } from "./types";

export function createLogLine(text: string): TacticalLogLine {
  return { text };
}

export function formatInteractionLogs(logs: readonly TacticalLogLine[]): string {
  return logs.map((log) => log.text).join("\n");
}

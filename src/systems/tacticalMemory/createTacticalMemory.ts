import type { TeamId } from "../../core/ids";
import type { TacticalMemoryState } from "./types";

export function createTacticalMemory(teamIds: readonly TeamId[]): TacticalMemoryState {
  return {
    teams: teamIds.map((teamId) => ({
      teamId,
      entries: [],
      adaptationNote: null,
    })),
  };
}

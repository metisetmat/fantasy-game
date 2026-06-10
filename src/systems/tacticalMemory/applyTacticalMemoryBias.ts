import type { TeamId } from "../../core/ids";
import {
  TacticalMemoryInteraction,
  type TacticalMemoryState,
  type TargetSelectionMemoryModifier,
} from "./types";

function signedClamp(value: number): number {
  return Math.max(-20, Math.min(20, Math.round(value)));
}

export function createTargetSelectionMemoryModifiers(input: {
  readonly memory: TacticalMemoryState;
  readonly attackingTeamId: TeamId;
  readonly defendingTeamId?: TeamId;
  readonly interaction: TacticalMemoryInteraction;
  readonly attackingTeamName?: string;
  readonly defendingTeamName?: string;
}): readonly TargetSelectionMemoryModifier[] {
  const attackingMemory = input.memory.teams.find((team) => team.teamId === input.attackingTeamId);
  const defendingMemory =
    input.defendingTeamId === undefined
      ? undefined
      : input.memory.teams.find((team) => team.teamId === input.defendingTeamId);
  const attackingTeamName = input.attackingTeamName ?? input.attackingTeamId;
  const defendingTeamName = input.defendingTeamName ?? input.defendingTeamId;
  const attackingModifiers =
    attackingMemory?.entries
      .filter((entry) => signedClamp(entry.attackingModifier) !== 0)
      .filter((entry) => entry.pattern.interaction === input.interaction)
      .map((entry) => ({
        interaction: entry.pattern.interaction,
        moveType: entry.pattern.moveType,
        sideType: entry.pattern.sideType,
        zoneBand: entry.pattern.zoneBand,
        value: signedClamp(entry.attackingModifier),
        reason:
          entry.attackingModifier >= 0
            ? `${attackingTeamName} attack boost from repeated success`
            : `${attackingTeamName} attack penalty from recent failure`,
      })) ?? [];
  const defensiveModifiers =
    defendingMemory?.entries
      .filter((entry) => signedClamp(entry.defendingAwareness) !== 0)
      .filter((entry) => entry.pattern.interaction === input.interaction)
      .map((entry) => ({
        interaction: entry.pattern.interaction,
        moveType: entry.pattern.moveType,
        sideType: entry.pattern.sideType,
        zoneBand: entry.pattern.zoneBand,
        value: -signedClamp(entry.defendingAwareness),
        reason: `${defendingTeamName} defensive adaptation: covering repeated ${entry.pattern.moveType}`,
      })) ?? [];

  return [...attackingModifiers, ...defensiveModifiers];
}

export function describeMemoryModifier(value: number): string {
  if (value > 0) {
    return `memory boost +${Math.round(value)}`;
  }

  if (value < 0) {
    return `memory penalty ${Math.round(value)}`;
  }

  return "memory neutral";
}

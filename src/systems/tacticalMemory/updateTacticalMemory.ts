import type { TeamId } from "../../core/ids";
import type {
  TacticalMemoryEntry,
  TacticalMemoryState,
  TacticalPattern,
  TeamTacticalMemory,
} from "./types";

const MAX_MEMORY_ENTRIES = 8;

function patternsMatch(left: TacticalPattern, right: TacticalPattern): boolean {
  return (
    left.interaction === right.interaction &&
    left.moveType === right.moveType &&
    left.sideType === right.sideType &&
    left.zoneBand === right.zoneBand
  );
}

function clampModifier(value: number): number {
  return Math.max(-20, Math.min(20, Math.round(value)));
}

function updateTeamEntries(input: {
  readonly team: TeamTacticalMemory;
  readonly pattern: TacticalPattern;
  readonly sequenceNumber: number;
  readonly success: boolean;
  readonly isAttackingTeam: boolean;
}): TeamTacticalMemory {
  const existingEntry = input.team.entries.find((entry) => patternsMatch(entry.pattern, input.pattern));
  const decayedEntries = input.team.entries
    .filter((entry) => !patternsMatch(entry.pattern, input.pattern))
    .map((entry) => ({
      ...entry,
      attackingModifier: clampModifier(entry.attackingModifier * 0.85),
      defendingAwareness: clampModifier(entry.defendingAwareness * 0.85),
    }));
  const baseEntry: TacticalMemoryEntry =
    existingEntry ?? {
      pattern: input.pattern,
      attackingModifier: 0,
      defendingAwareness: 0,
      successes: 0,
      failures: 0,
      lastSequence: input.sequenceNumber,
    };
  const attackingDelta = input.isAttackingTeam ? (input.success ? 6 : -7) : 0;
  const defendingDelta = input.isAttackingTeam ? 0 : input.success ? 5 : 10;
  const updatedEntry: TacticalMemoryEntry = {
    ...baseEntry,
    attackingModifier: clampModifier(baseEntry.attackingModifier + attackingDelta),
    defendingAwareness: clampModifier(baseEntry.defendingAwareness + defendingDelta),
    successes: baseEntry.successes + (input.success ? 1 : 0),
    failures: baseEntry.failures + (input.success ? 0 : 1),
    lastSequence: input.sequenceNumber,
  };
  const entries = [updatedEntry, ...decayedEntries]
    .sort((left, right) => right.lastSequence - left.lastSequence)
    .slice(0, MAX_MEMORY_ENTRIES);

  return {
    ...input.team,
    entries,
    adaptationNote: input.success
      ? `${input.team.teamId} remembers ${input.pattern.moveType} on ${input.pattern.sideType} as useful.`
      : `${input.team.teamId} cools on ${input.pattern.moveType} after a failed pattern.`,
  };
}

export function updateTacticalMemory(input: {
  readonly memory: TacticalMemoryState;
  readonly attackingTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly pattern: TacticalPattern;
  readonly success: boolean;
  readonly sequenceNumber: number;
}): TacticalMemoryState {
  return {
    teams: input.memory.teams.map((team) => {
      if (team.teamId === input.attackingTeamId) {
        return updateTeamEntries({
          team,
          pattern: input.pattern,
          sequenceNumber: input.sequenceNumber,
          success: input.success,
          isAttackingTeam: true,
        });
      }

      if (team.teamId === input.defendingTeamId) {
        return updateTeamEntries({
          team,
          pattern: input.pattern,
          sequenceNumber: input.sequenceNumber,
          success: !input.success,
          isAttackingTeam: false,
        });
      }

      return team;
    }),
  };
}

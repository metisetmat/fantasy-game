import type { PlayerState } from "../../models/player";
import type { TacticalStyle } from "../../models/tactics";
import type { ZoneId } from "../../core/zones";
import { IntentStatus, type IntentChange, type PlayerIntent } from "./intentTypes";
import { createIntent } from "./playerIntent";
import { selectPrimaryIntent } from "./intentPriority";
import { getRoleIntentProfile } from "./roleIntentProfiles";
import { applyTeamIntentModifier } from "./teamIntentModifiers";
import { evolveIntent, resolveIntentConflicts } from "./evolution";

export interface PlayerWithIntentState extends PlayerState {
  readonly activeIntents: readonly PlayerIntent[];
  readonly primaryIntent: PlayerIntent | null;
  readonly previousIntent: PlayerIntent | null;
  readonly intentAgeTicks: number;
  readonly intentConfidence: number;
  readonly intentTargetZone: ZoneId | null;
  readonly intentOriginReason: string;
  readonly intentEvolutionStory: string;
  readonly intentUrgency: number;
  readonly intentEvolutionDirection: "ESCALATING" | "DECAYING" | "STABLE";
}

export function createDefaultIntentsForPlayer(input: {
  readonly player: PlayerState;
  readonly tacticalStyle: TacticalStyle;
  readonly tick: number;
}): readonly PlayerIntent[] {
  const carriedAgeTicks = Math.min(4, Math.max(0, input.tick));
  const startedTick = input.tick - carriedAgeTicks;

  return getRoleIntentProfile(input.player.role, input.tacticalStyle).map((profile) =>
    applyTeamIntentModifier(
      createIntent({
        playerId: input.player.id,
        teamId: input.player.teamId,
        type: profile.type,
        trigger: "role_default",
        priority: profile.priority,
        confidence: profile.confidence,
        startedTick,
        tacticalReason: profile.reason,
        source: profile.source,
      }),
      input.tacticalStyle,
    ),
  );
}

export function attachDefaultIntentState(input: {
  readonly player: PlayerState;
  readonly tacticalStyle: TacticalStyle;
  readonly tick: number;
}): PlayerWithIntentState {
  const existingIntents = input.player.activeIntents ?? [];
  const activeIntents =
    existingIntents.length > 0
      ? existingIntents.filter((intent) => intent.status === IntentStatus.Active)
      : createDefaultIntentsForPlayer(input);
  const evolved = activeIntents.map((intent) =>
    evolveIntent({
      intent,
      tick: input.tick,
      role: input.player.role,
      tacticalStyle: input.tacticalStyle,
    }).intent,
  ).filter((intent): intent is PlayerIntent => intent !== null);
  const conflictResolved = resolveIntentConflicts({
    playerId: input.player.id,
    tick: input.tick,
    intents: evolved,
  });
  const primaryIntent = selectPrimaryIntent(conflictResolved.intents);

  return {
    ...input.player,
    activeIntents: conflictResolved.intents,
    primaryIntent,
    previousIntent: input.player.primaryIntent ?? null,
    intentAgeTicks: primaryIntent === null ? 0 : Math.max(0, input.tick - primaryIntent.startedTick),
    intentConfidence: primaryIntent?.confidence ?? 0,
    intentTargetZone: primaryIntent?.targetZone ?? null,
    intentOriginReason: primaryIntent?.tacticalReason ?? "no active intent",
    intentEvolutionStory: primaryIntent?.tacticalStory ?? "no intent evolution",
    intentUrgency: primaryIntent?.urgency ?? 0,
    intentEvolutionDirection: primaryIntent?.evolutionDirection ?? "STABLE",
  };
}

export function summarizeTeamIntents(players: readonly PlayerState[]): string {
  return players
    .map((player) => `${player.roleInitials ?? player.role}:${player.primaryIntent?.type ?? "NONE"}`)
    .join(", ");
}

export function createIntentChangesForPlayers(input: {
  readonly previousPlayers: readonly PlayerState[];
  readonly nextPlayers: readonly PlayerState[];
  readonly tick: number;
}): readonly IntentChange[] {
  return input.nextPlayers.flatMap((nextPlayer) => {
    const previous = input.previousPlayers.find((player) => player.id === nextPlayer.id);
    const previousType = previous?.primaryIntent?.type ?? null;
    const nextType = nextPlayer.primaryIntent?.type ?? null;

    if (previousType === nextType) {
      return [];
    }

    return [
      {
        playerId: nextPlayer.id,
        previousIntent: previousType,
        nextIntent: nextType,
        changeType: previousType === null ? "CREATED" : nextType === null ? "RESOLVED" : "SUPERSEDED",
        reason: nextPlayer.intentOriginReason ?? "intent state updated",
        tick: input.tick,
      },
    ];
  });
}

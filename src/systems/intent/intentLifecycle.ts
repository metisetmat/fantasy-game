import type { TacticalTick } from "../../core/ratings";
import { IntentStatus, type IntentChange, type PlayerIntent } from "./intentTypes";

function withStatus(intent: PlayerIntent, status: IntentStatus, resolvedByEventId: string | null): PlayerIntent {
  return {
    ...intent,
    status,
    resolvedByEventId,
  };
}

export function refreshIntent(intent: PlayerIntent, tick: TacticalTick): PlayerIntent {
  if (intent.status !== IntentStatus.Active || tick > intent.expiresTick) {
    return intent;
  }

  return {
    ...intent,
    expiresTick: Math.min(intent.startedTick + intent.maxDurationTicks, tick + intent.maxDurationTicks),
  };
}

export function resolveIntent(intent: PlayerIntent, eventId: string): PlayerIntent {
  return withStatus(intent, IntentStatus.Resolved, eventId);
}

export function expireIntent(intent: PlayerIntent): PlayerIntent {
  return withStatus(intent, IntentStatus.Expired, intent.resolvedByEventId);
}

export function supersedeIntent(intent: PlayerIntent, eventId: string | null): PlayerIntent {
  return withStatus(intent, IntentStatus.Superseded, eventId);
}

export function blockIntent(intent: PlayerIntent, eventId: string | null): PlayerIntent {
  return withStatus(intent, IntentStatus.Blocked, eventId);
}

export function tickIntents(input: {
  readonly intents: readonly PlayerIntent[];
  readonly tick: TacticalTick;
  readonly completedEventIds?: readonly string[];
}): { readonly intents: readonly PlayerIntent[]; readonly changes: readonly IntentChange[] } {
  const completed = new Set(input.completedEventIds ?? []);
  const changes: IntentChange[] = [];
  const intents = input.intents.map((intent) => {
    if (intent.status !== IntentStatus.Active) {
      return intent;
    }

    if (intent.parentEventId !== null && completed.has(intent.parentEventId)) {
      changes.push({
        playerId: intent.playerId,
        previousIntent: intent.type,
        nextIntent: null,
        changeType: "RESOLVED",
        reason: `resolved by event ${intent.parentEventId}`,
        tick: input.tick,
      });
      return resolveIntent(intent, intent.parentEventId);
    }

    if (input.tick > intent.expiresTick) {
      changes.push({
        playerId: intent.playerId,
        previousIntent: intent.type,
        nextIntent: null,
        changeType: "EXPIRED",
        reason: "intent exceeded max duration",
        tick: input.tick,
      });
      return expireIntent(intent);
    }

    return refreshIntent(intent, input.tick);
  });

  return { intents, changes };
}

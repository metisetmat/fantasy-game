import { INTENT_ENGINE_CONFIG } from "../../config/intentConfig";
import type { PlayerId, TeamId } from "../../core/ids";
import type { TacticalTick } from "../../core/ratings";
import type { LateralCorridor, ZoneId } from "../../core/zones";
import { IntentSource, IntentStatus, type IntentType, type PlayerIntent } from "./intentTypes";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function createIntent(input: {
  readonly playerId: PlayerId;
  readonly teamId: TeamId;
  readonly type: IntentType;
  readonly trigger: string;
  readonly priority: number;
  readonly confidence: number;
  readonly startedTick: TacticalTick;
  readonly minDurationTicks?: number;
  readonly maxDurationTicks?: number;
  readonly targetZone?: ZoneId | null;
  readonly targetPlayerId?: PlayerId | null;
  readonly targetLane?: LateralCorridor | null;
  readonly tacticalReason: string;
  readonly source: IntentSource;
  readonly parentEventId?: string | null;
}): PlayerIntent {
  const minDurationTicks = input.minDurationTicks ?? INTENT_ENGINE_CONFIG.defaultMinIntentDurationTicks;
  const maxDurationTicks = input.maxDurationTicks ?? INTENT_ENGINE_CONFIG.defaultMaxIntentDurationTicks;

  return {
    intentId: `${input.playerId}-${input.type}-${input.startedTick}`,
    playerId: input.playerId,
    teamId: input.teamId,
    type: input.type,
    trigger: input.trigger,
    priority: clamp(input.priority),
    confidence: clamp(input.confidence),
    startedTick: input.startedTick,
    expiresTick: input.startedTick + maxDurationTicks,
    minDurationTicks,
    maxDurationTicks,
    status: IntentStatus.Active,
    targetZone: input.targetZone ?? null,
    targetPlayerId: input.targetPlayerId ?? null,
    targetLane: input.targetLane ?? null,
    tacticalReason: input.tacticalReason,
    source: input.source,
    parentEventId: input.parentEventId ?? null,
    resolvedByEventId: null,
    chainId: `${input.playerId}-${input.type}-${input.startedTick}`,
    urgency: 50,
    evolutionDirection: "STABLE",
    previousTypes: [],
    tacticalStory: `${input.type} created from ${input.source}: ${input.tacticalReason}`,
  };
}

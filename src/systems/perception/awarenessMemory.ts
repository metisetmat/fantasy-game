import type { PlayerId } from "../../core/ids";
import type { Rating, TacticalTick } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import { clampRating } from "../spatial/utils";
import type { AwarenessMemory } from "./playerOrientation";

export function updateAwarenessMemory(input: {
  readonly previous: AwarenessMemory | null;
  readonly seenPlayers: readonly PlayerId[];
  readonly ballZone: ZoneId;
  readonly threatZones: readonly ZoneId[];
  readonly overloadZone: ZoneId | null;
  readonly scanQuality: Rating;
  readonly tick: TacticalTick;
  readonly chaos: Rating;
}): AwarenessMemory {
  const previousCertainty = input.previous?.certainty ?? 54;
  const tickGap = input.previous === null ? 1 : Math.max(1, input.tick - input.previous.updatedTick);
  const decay = tickGap * (4 + input.chaos / 34);
  const certainty = clampRating(previousCertainty - decay + input.scanQuality * 0.28);

  return {
    knownThreatZones: [...new Set([...input.threatZones, ...(input.previous?.knownThreatZones ?? [])])].slice(0, 5),
    knownRunnerIds: [...new Set([...input.seenPlayers, ...(input.previous?.knownRunnerIds ?? [])])].slice(0, 8),
    lastKnownBallZone: input.ballZone,
    lastKnownOverloadZone: input.overloadZone ?? input.previous?.lastKnownOverloadZone ?? null,
    certainty,
    updatedTick: input.tick,
  };
}

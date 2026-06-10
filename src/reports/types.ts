import type { EventId, PlayerId, TeamId } from "../core/ids";
import type { TacticalTick } from "../core/ratings";
import type { ZoneId } from "../core/zones";
import type { InteractionType } from "../systems/interactions/types";
import type { PressureLevel } from "../models/match";
import type { PlayerRole } from "../models/player";

export enum MatchEventCategory {
  Interaction = "interaction",
  TacticalShift = "tactical_shift",
  Score = "score",
  Momentum = "momentum",
  Fatigue = "fatigue",
}

export interface MatchEvent {
  readonly id: EventId;
  readonly tick: TacticalTick;
  readonly teamId: TeamId;
  readonly category: MatchEventCategory;
  readonly interactionType?: InteractionType;
  readonly involvedPlayerIds: readonly PlayerId[];
  readonly involvedRoles: readonly PlayerRole[];
  readonly zone: ZoneId;
  readonly pressureLevel: PressureLevel;
  readonly result: string;
  readonly tacticalConsequences: readonly string[];
  readonly narrative: string;
}

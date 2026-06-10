import type { TacticalTick } from "../../core/ratings";
import type { IntentChange } from "../intent";
import type { MatchLoopEvent, WorldStateSummary } from "./worldState";

export interface TickResult {
  readonly tick: TacticalTick;
  readonly previousWorldStateSummary: WorldStateSummary;
  readonly nextWorldStateSummary: WorldStateSummary;
  readonly generatedEvents: readonly MatchLoopEvent[];
  readonly resolvedEvents: readonly MatchLoopEvent[];
  readonly newIntents: readonly IntentChange[];
  readonly resolvedIntents: readonly IntentChange[];
  readonly expiredIntents: readonly IntentChange[];
  readonly supersededIntents: readonly IntentChange[];
  readonly intentChanges: readonly IntentChange[];
  readonly debugNotes: readonly string[];
}

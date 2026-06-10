import type { TeamId } from "../../core/ids";
import type { Rating } from "../../core/ratings";
import type { LongitudinalZone } from "../../core/zones";
import type { SpatialMoveType } from "../spatial/intention";
import type { SideType } from "../spatial/sides";

export enum TacticalMemoryInteraction {
  BuildUp = "BUILD_UP",
  Transition = "TRANSITION",
  Construction = "CONSTRUCTION",
}

export enum TacticalRiskProfile {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
}

export interface TacticalPattern {
  readonly interaction: TacticalMemoryInteraction;
  readonly moveType: SpatialMoveType;
  readonly sideType: SideType;
  readonly zoneBand: LongitudinalZone;
  readonly riskProfile: TacticalRiskProfile;
}

export interface TacticalMemoryEntry {
  readonly pattern: TacticalPattern;
  readonly attackingModifier: Rating;
  readonly defendingAwareness: Rating;
  readonly successes: number;
  readonly failures: number;
  readonly lastSequence: number;
}

export interface TeamTacticalMemory {
  readonly teamId: TeamId;
  readonly entries: readonly TacticalMemoryEntry[];
  readonly adaptationNote: string | null;
}

export interface TacticalMemoryState {
  readonly teams: readonly TeamTacticalMemory[];
}

export interface TargetSelectionMemoryModifier {
  readonly interaction: TacticalMemoryInteraction;
  readonly moveType: SpatialMoveType;
  readonly sideType: SideType;
  readonly zoneBand?: LongitudinalZone;
  readonly value: number;
  readonly reason: string;
}

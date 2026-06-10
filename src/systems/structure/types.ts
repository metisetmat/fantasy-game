import type { Rating } from "../../core/ratings";
import type { ZoneId } from "../../core/zones";
import type { PlayerRole } from "../../models/player";

export enum PlayerStructuralState {
  InStructure = "IN_STRUCTURE",
  Pressing = "PRESSING",
  Supporting = "SUPPORTING",
  Projecting = "PROJECTING",
  Recovering = "RECOVERING",
  Delayed = "DELAYED",
  Eliminated = "ELIMINATED",
  Covering = "COVERING",
}

export interface PlayerStructuralParticipation {
  readonly role: PlayerRole;
  readonly state: PlayerStructuralState;
  readonly zone: ZoneId;
  readonly reason: string;
}

export interface DefensiveParticipationCounts {
  readonly inStructure: number;
  readonly recovering: number;
  readonly delayed: number;
  readonly eliminated: number;
  readonly covering: number;
}

export interface DefensiveParticipationEvaluation {
  readonly counts: DefensiveParticipationCounts;
  readonly players: readonly PlayerStructuralParticipation[];
  readonly delayedDefenders: number;
  readonly coveringDefenders: number;
  readonly eliminatedDefenders: number;
  readonly structuralRecoveryScore: Rating;
  readonly centralCoverRole: PlayerRole | null;
  readonly depthCoverRole: PlayerRole | null;
  readonly explanation: string;
  readonly coveringZones: readonly ZoneId[];
}

export interface OffensiveParticipationEvaluation {
  readonly projectingPlayers: number;
  readonly supportingPlayers: number;
  readonly conservativeSupport: boolean;
  readonly explanation: string;
}

import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { ReboundType, ReboundZone, ResolvedPossessionAfterShot } from "./shotOutcomeTypes";

export type ReboundBallHeight = "LOW" | "MID" | "HIGH";
export type ReboundWinner = "ATTACKER" | "DEFENDER" | "GOALKEEPER" | "CONTESTED_REMAINS" | "OUT_OF_PLAY";
export type ReboundContinuationType =
  | "SECOND_SHOT_WINDOW"
  | "GK_RECOVERY"
  | "DEFENSIVE_CLEARANCE"
  | "ATTACKER_RECOVERY"
  | "SCRAMBLE"
  | "OUT_OF_PLAY";
export type ReboundDangerLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH";

export interface ReboundContinuationPlayer {
  readonly playerId: PlayerId;
  readonly roleInitials: string;
  readonly teamId: TeamId;
  readonly zone: ZoneId;
  readonly reactionScore: number;
}

export interface ReboundContinuationContext {
  readonly reboundSourceActionId: string;
  readonly reboundType: ReboundType;
  readonly reboundZone: ReboundZone;
  readonly ballHeight: ReboundBallHeight;
  readonly ballSpeed: number;
  readonly spinOrDeflectionSeverity: number;
  readonly attackingTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly goalkeeperId: PlayerId;
  readonly nearestAttackers: readonly ReboundContinuationPlayer[];
  readonly nearestDefenders: readonly ReboundContinuationPlayer[];
  readonly goalkeeperRecoveryScore: number;
  readonly defenderReactionScore: number;
  readonly attackerReactionScore: number;
  readonly contactRisk: number;
  readonly goalDangerLevel: ReboundDangerLevel;
}

export interface ReboundContinuationResult {
  readonly resolved: boolean;
  readonly reboundWinner: ReboundWinner;
  readonly winningPlayerId?: PlayerId;
  readonly winningPlayerInitials?: string;
  readonly nextPossession: ResolvedPossessionAfterShot;
  readonly continuationType: ReboundContinuationType;
  readonly continuationZone: ReboundZone;
  readonly immediateDanger: ReboundDangerLevel;
  readonly reason: string;
}

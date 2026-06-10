import type { PlayerId, TeamId } from "../../core/ids";
import type {
  ReboundBallHeight,
  ReboundContinuationPlayer,
  ReboundDangerLevel,
} from "./reboundContinuationTypes";
import type { ReboundZone, ResolvedPossessionAfterShot } from "./shotOutcomeTypes";

export type ScrambleType =
  | "NONE"
  | "LOOSE_BALL"
  | "CONTACT_CONTEST"
  | "DOUBLE_TOUCH"
  | "CHAOTIC_CLEARANCE"
  | "DESPERATE_SECOND_SHOT";

export type ScrambleWinner = "ATTACKER" | "DEFENDER" | "GOALKEEPER" | "CONTESTED_REMAINS" | "OUT_OF_PLAY";

export type ScrambleContinuationType =
  | "ATTACKER_RECOVERY"
  | "DEFENSIVE_CLEARANCE"
  | "SECOND_SHOT_WINDOW"
  | "GK_RECOVERY"
  | "SCRAMBLE_CONTINUES"
  | "OUT_OF_PLAY";

export interface ScrambleContext {
  readonly sourceActionId: string;
  readonly reboundZone: ReboundZone;
  readonly ballHeight: ReboundBallHeight;
  readonly ballSpeed: number;
  readonly deflectionSeverity: number;
  readonly contactDensity: number;
  readonly nearestAttackers: readonly ReboundContinuationPlayer[];
  readonly nearestDefenders: readonly ReboundContinuationPlayer[];
  readonly attackerMomentumScore: number;
  readonly defenderMomentumScore: number;
  readonly goalkeeperRecoveryScore: number;
  readonly looseBallDuration: number;
  readonly collisionRisk: number;
  readonly foulRisk: number;
  readonly attackingTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly goalkeeperId: PlayerId;
  readonly immediateDangerBase: ReboundDangerLevel;
}

export interface ScrambleResult {
  readonly scrambleTriggered: boolean;
  readonly scrambleType: ScrambleType;
  readonly scrambleWinner: ScrambleWinner;
  readonly winningPlayerId?: PlayerId;
  readonly winningPlayerInitials?: string;
  readonly nextPossession: ResolvedPossessionAfterShot;
  readonly continuationType: ScrambleContinuationType;
  readonly immediateDanger: ReboundDangerLevel;
  readonly reason: string;
}

import type { TacticalTick } from "../../../core/ratings";
import type { ZoneId } from "../../../core/zones";
import type { ScoringType } from "../../../models/scoring";
import type { PlayerRole } from "../../../models/player";
import type { TacticalLogLine } from "../shared";

export enum SecondChanceOutcome {
  SecondChanceFinish = "SECOND_CHANCE_FINISH",
  EmergencyClearance = "EMERGENCY_CLEARANCE",
  AttackingRecovery = "ATTACKING_RECOVERY",
  DefensiveRecovery = "DEFENSIVE_RECOVERY",
  ScrambleTurnover = "SCRAMBLE_TURNOVER",
  ChaoticTry = "CHAOTIC_TRY",
  RushedSecondShot = "RUSHED_SECOND_SHOT",
  SequenceDies = "SEQUENCE_DIES",
}

export interface SecondChanceScoreUpdate {
  readonly scoringTeamId: string;
  readonly scoringType: ScoringType;
  readonly points: number;
}

export interface ReboundControlEvaluation {
  readonly controlScore: number;
  readonly supportQuality: number;
  readonly composure: number;
  readonly reasons: readonly string[];
}

export interface ScrambleDangerEvaluation {
  readonly dangerScore: number;
  readonly label: string;
  readonly reasons: readonly string[];
}

export interface EmergencyClearanceEvaluation {
  readonly clearanceScore: number;
  readonly reasons: readonly string[];
}

export interface SecondChanceInteractionEvent {
  readonly tick: TacticalTick;
  readonly offensiveTeamId: string;
  readonly defensiveTeamId: string;
  readonly activeZone: ZoneId;
  readonly involvedRoles: readonly PlayerRole[];
  readonly outcome: SecondChanceOutcome;
  readonly scoreUpdate: SecondChanceScoreUpdate | null;
  readonly summary: string;
}

export interface SecondChanceInteractionResult {
  readonly outcome: SecondChanceOutcome;
  readonly terminal: true;
  readonly reboundControl: ReboundControlEvaluation;
  readonly scrambleDanger: ScrambleDangerEvaluation;
  readonly emergencyClearance: EmergencyClearanceEvaluation;
  readonly scoreUpdate: SecondChanceScoreUpdate | null;
  readonly event: SecondChanceInteractionEvent;
  readonly logs: readonly TacticalLogLine[];
}

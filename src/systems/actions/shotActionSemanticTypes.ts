import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";

export type ShotActionType = "SHOT";
export type ShotActionSubtype = "SHOT_CREATION";
export type ShotActionShotType = "FOOT_STRIKE" | "HEADER" | "VOLLEY" | "DROP_ATTEMPT" | "OTHER";
export type ShotActionLegality = "LEGAL" | "ILLEGAL" | "UNKNOWN";
export type ShotBallOutcome = "GOAL" | "SAVED" | "MISSED" | "BLOCKED" | "REBOUND" | "PENDING" | "UNKNOWN";
export type PossessionAfterShot = TeamId | "CONTESTED" | "OUT_OF_PLAY" | "PENDING" | "UNKNOWN";
export type ShotSemanticStatus = "PASS" | "WARNING" | "FAIL";

export interface ShotActionSemanticContract {
  readonly actionId: string;
  readonly eventType: "finishing";
  readonly selectedActionType: ShotActionType;
  readonly selectedActionSubtype: ShotActionSubtype;
  readonly decisionActorId: PlayerId;
  readonly decisionActorRole: string;
  readonly shootingTeamId: TeamId;
  readonly shotOriginZone: ZoneId;
  readonly shotTargetZone?: ZoneId;
  readonly shotTargetFrame?: string;
  readonly shotType: ShotActionShotType;
  readonly shotLegality: ShotActionLegality;
  readonly shotLegalityReason: string;
  readonly ballOutcome: ShotBallOutcome;
  readonly possessionAfterShot: PossessionAfterShot;
  readonly reboundActorId?: PlayerId;
  readonly goalkeeperInvolvedId?: PlayerId;
  readonly pressureLevel: string;
  readonly pressureSource: string;
  readonly semanticStatus: ShotSemanticStatus;
  readonly reason: string;
}

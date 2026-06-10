import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { GoalkeeperFatigueProfile } from "./goalkeeperFatigueTypes";
import type { CleanWindowType, ShotOutcomeShotType } from "./shotOutcomeTypes";

export type ShotTargetFrame = "LOW" | "MID" | "HIGH" | "CORNER" | "CENTER" | "UNKNOWN";

export type GoalkeeperAction =
  | "NO_ACTION"
  | "SET_AND_COVER"
  | "TRACKED_MISS"
  | "HAND_SAVE"
  | "CATCH"
  | "FOOT_SAVE"
  | "DEFLECTION"
  | "FAILED_SAVE"
  | "OUT_OF_AREA_BODY_BLOCK";

export interface GKShotStoppingContext {
  readonly shotActionId: string;
  readonly shootingTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly shooterId: PlayerId;
  readonly goalkeeperId: PlayerId;
  readonly shotOriginZone: ZoneId;
  readonly shotTargetFrame: ShotTargetFrame;
  readonly shotOnTarget: boolean;
  readonly shotType: ShotOutcomeShotType;
  readonly goalkeeperZone: ZoneId;
  readonly goalkeeperInsideGoalArea: boolean;
  readonly goalkeeperLegalHandUseAvailable: boolean;
  readonly goalkeeperSetPositionScore: number;
  readonly goalkeeperReactionScore: number;
  readonly goalkeeperReachScore: number;
  readonly goalkeeperHandlingScore: number;
  readonly goalkeeperFootSaveScore: number;
  readonly shotQuality: number;
  readonly shotPower: number;
  readonly shotPlacement: number;
  readonly shotAngleDifficulty: number;
  readonly defensiveBlockPressure: number;
  readonly finishingPressure: number;
  readonly cleanWindowType: CleanWindowType;
  readonly goalkeeperFatigueProfile: GoalkeeperFatigueProfile;
}

export interface GKShotStoppingResult {
  readonly goalkeeperEvaluated: boolean;
  readonly goalkeeperInvolved: boolean;
  readonly goalkeeperAction: GoalkeeperAction;
  readonly saveProbabilityScore: number;
  readonly catchProbabilityScore: number;
  readonly deflectionProbabilityScore: number;
  readonly gkOutcomeReason: string;
}

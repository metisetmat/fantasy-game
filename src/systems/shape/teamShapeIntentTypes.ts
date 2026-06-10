import type { TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { PlayerMatchState } from "../players";

export type TeamShapePossessionState =
  | "IN_POSSESSION"
  | "OUT_OF_POSSESSION"
  | "DEFENSIVE_TRANSITION"
  | "OFFENSIVE_TRANSITION";

export type TeamShapeStyle = "CONTROL" | "BLITZ" | "BALANCED";

export type TeamShapePrimaryIntent =
  | "SECURE_POSSESSION"
  | "PRESSURE_ESCAPE"
  | "REST_DEFENSE_PROTECTION"
  | "BALL_GOAL_AXIS_PROTECTION"
  | "TRY_ACCESS_PROTECTION"
  | "COMPACT_PRESS"
  | "COUNTERPRESS"
  | "WEAK_SIDE_RISK_ACCEPTANCE"
  | "STRUCTURE_ADVANCEMENT";

export interface TeamShapeIntent {
  readonly teamId: TeamId;
  readonly phase: string;
  readonly possessionState: TeamShapePossessionState;
  readonly style: TeamShapeStyle;
  readonly ballZone: ZoneId;
  readonly attackingDirection: string;
  readonly defendingDirection: string;
  readonly primaryIntent: TeamShapePrimaryIntent;
  readonly secondaryIntents: readonly string[];
  readonly requiredZones: readonly ZoneId[];
  readonly preferredZones: readonly ZoneId[];
  readonly allowedRiskTradeoffs: readonly string[];
  readonly explanation: string;
}

export interface TeamShapePlayerResolution {
  readonly teamId: TeamId;
  readonly playerId: string;
  readonly roleInitials: string;
  readonly beforeZone: ZoneId;
  readonly afterZone: ZoneId;
  readonly function: string;
  readonly reason: string;
}

export interface TeamShapeFrameResolution {
  readonly frame: "before" | "after";
  readonly players: readonly PlayerMatchState[];
  readonly playerResolutions: readonly TeamShapePlayerResolution[];
}

export interface TeamShapeCalibrationResult {
  readonly controlBeforeIntent: TeamShapeIntent;
  readonly blitzBeforeIntent: TeamShapeIntent;
  readonly controlAfterIntent: TeamShapeIntent;
  readonly blitzAfterIntent: TeamShapeIntent;
  readonly before: TeamShapeFrameResolution;
  readonly after: TeamShapeFrameResolution;
  readonly evaluation: TeamShapeEvaluation;
  readonly recommendation:
    | "KEEP_TEAM_SHAPE_INTENT_MODEL"
    | "IMPROVE_BLITZ_AXIS_PROTECTION"
    | "IMPROVE_CONTROL_REST_DEFENSE"
    | "IMPROVE_BLITZ_PRESS_SYNCHRONIZATION"
    | "FIX_WORKBENCH_POSITION_MISMATCH"
    | "NEEDS_MORE_SAMPLE";
}

export interface TeamShapeEvaluation {
  readonly blitzBeforeAxisProtectionScore: number;
  readonly blitzBeforeTryAccessProtectionScore: number;
  readonly controlAfterRestDefenseScore: number;
  readonly controlAfterLossChannelProtectionScore: number;
  readonly blitzAfterPressingSynchronizationScore: number;
  readonly positionMismatchCount: number;
  readonly illegalOffBallInGoalOccupancyCount: number;
  readonly blitzBeforeBallGoalAxisProtected: boolean;
  readonly blitzBeforeTryAccessProtected: boolean;
  readonly blitzBeforeNearSideCentralLateralCover: boolean;
  readonly blitzBeforeHslPressureSupport: boolean;
  readonly blitzBeforeCentralCover: boolean;
  readonly controlAfterLossChannelProtected: boolean;
  readonly controlAfterCentralRestDefenseProtected: boolean;
  readonly controlGoalkeeperLastRempart: boolean;
  readonly controlShReconnects: boolean;
  readonly blitzAfterPressesNewCarrierArea: boolean;
  readonly blitzAfterCentralCover: boolean;
  readonly blitzAfterWeakSideRiskDocumented: boolean;
  readonly occupationQualityReflectsShapeIntent: boolean;
  readonly explanation: string;
}

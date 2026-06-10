import type { PlayerId, TeamId } from "../../core/ids";
import type { ScoringZoneId } from "../../core/scoringZones";
import type { LateralCorridor } from "../../core/zones";

export type ConversionOutcome =
  | "CONVERSION_GOAL"
  | "CONVERSION_MISSED"
  | "CONVERSION_BLOCKED"
  | "CONVERSION_INVALID";

export type ConversionScoringAction = "CONVERSION_GOAL" | "NONE";

export type ConversionRecommendation =
  | "KEEP_CONVERSION_MODEL"
  | "KEEP_CONVERSION_MODEL_BUT_MONITOR"
  | "INCREASE_CONVERSION_DIFFICULTY"
  | "REDUCE_CONVERSION_DIFFICULTY"
  | "INCREASE_WIDE_CONVERSION_DIFFICULTY"
  | "REDUCE_CENTRAL_CONVERSION_DIFFICULTY"
  | "FIX_CONVERSION_GEOMETRY"
  | "FIX_CONVERSION_SCORING_LINK"
  | "NEEDS_MORE_SAMPLE";

export interface ConversionScoringRule {
  readonly actionType: ConversionOutcome;
  readonly pointValue: number;
  readonly activeInVersion: "V2_CONVERSION_ACTIVE" | "V2_DROP_FOUNDATION";
}

export interface ConversionAttemptContext {
  readonly sourceTryActionId: string;
  readonly scoringTeamId: TeamId;
  readonly scoringTeamName: string;
  readonly defendingTeamId: TeamId;
  readonly kickerId: PlayerId;
  readonly kickerRole: string;
  readonly groundingZone: ScoringZoneId;
  readonly groundingLane: LateralCorridor;
  readonly groundingPoint: string;
  readonly conversionLine: string;
  readonly selectedConversionPoint: string;
  readonly distanceFromGoalLine: number;
  readonly angleDifficulty: number;
  readonly kickerAccuracy: number;
  readonly kickerPower: number;
  readonly kickerComposure: number;
  readonly fatiguePenalty: number;
  readonly weatherPenalty?: number;
  readonly pressurePenalty: number;
  readonly defenderChargePressure: number;
  readonly defendingTeamBehindGoalLine: boolean;
  readonly scoreBefore: string;
  readonly scoreAfterIfGoal: string;
  readonly scoreAfterIfNoScore: string;
}

export interface ConversionAttemptResult {
  readonly resolved: boolean;
  readonly sourceTryActionId: string;
  readonly matchId: string;
  readonly scoringTeamId: TeamId;
  readonly scoringTeamName: string;
  readonly defendingTeamId: TeamId;
  readonly kickerId: PlayerId;
  readonly kickerRole: string;
  readonly groundingZone: ScoringZoneId;
  readonly groundingLane: LateralCorridor;
  readonly groundingPoint: string;
  readonly conversionLine: string;
  readonly selectedConversionPoint: string;
  readonly distanceFromGoalLine: number;
  readonly angleDifficulty: number;
  readonly kickerAccuracy: number;
  readonly kickerPower: number;
  readonly kickerComposure: number;
  readonly fatiguePenalty: number;
  readonly pressurePenalty: number;
  readonly defenderChargePressure: number;
  readonly defendingTeamBehindGoalLine: boolean;
  readonly selectedPointQuality: number;
  readonly laneDifficulty: number;
  readonly distancePenalty: number;
  readonly anglePenalty: number;
  readonly defenderChargePressureModifier: number;
  readonly pressureDifficultyScore: number;
  readonly kickRhythmModifier: number;
  readonly kickExecutionScore: number;
  readonly geometryDifficultyScore: number;
  readonly finalDifficultyScore: number;
  readonly cleanKickScore: number;
  readonly outcome: ConversionOutcome;
  readonly scoringAction: ConversionScoringAction;
  readonly pointValue: number;
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly conversionActive: true;
  readonly reason: string;
}

export interface ConversionResolutionSummary {
  readonly scoringVersion: "V2_CONVERSION_ACTIVE" | "V2_DROP_FOUNDATION";
  readonly scoreUnit: "POINTS";
  readonly batchTryTouchdownsScored: number;
  readonly batchConversionAttempts: number;
  readonly batchConversionsMade: number;
  readonly batchConversionsMissed: number;
  readonly batchConversionsBlocked: number;
  readonly batchInvalidConversions: number;
  readonly batchConversionSuccessRate: number;
  readonly centralConversionSuccessRate: number;
  readonly halfSpaceConversionSuccessRate: number;
  readonly wideConversionSuccessRate: number;
  readonly averageAngleDifficulty: number;
  readonly averageDistance: number;
  readonly averageKickExecutionScore: number;
  readonly averagePressureDifficulty: number;
  readonly batchConversionPoints: number;
  readonly liveConversionAttempts: number;
  readonly liveConversionsMade: number;
  readonly liveConversionPoints: number;
  readonly missingConversionGeometryRows: number;
  readonly conversionAttemptsAfterFailedTries: number;
  readonly recommendation: ConversionRecommendation;
  readonly attempts: readonly ConversionAttemptResult[];
  readonly liveAttempts: readonly ConversionAttemptResult[];
}

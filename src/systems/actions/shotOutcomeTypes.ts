import type { PlayerId, TeamId } from "../../core/ids";
import type { ZoneId } from "../../core/zones";
import type { GoalkeeperPressureContext, GoalkeeperPreviousErrorFlag, GoalkeeperReadinessState } from "./goalkeeperFatigueTypes";
import type { GKShotStoppingResult, GoalkeeperAction, ShotTargetFrame } from "./gkShotStoppingTypes";
import type { ReboundContinuationContext, ReboundContinuationResult } from "./reboundContinuationTypes";

export type ShotTargetType = "GOAL_FRAME_TARGET" | "DROP_TARGET" | "SPACE_TARGET" | "UNKNOWN";
export type ShotOutcomeShotType = "FOOT_STRIKE" | "HEADER" | "VOLLEY" | "DROP_ATTEMPT" | "OTHER";
export type ShotOutcomeLegality = "LEGAL" | "ILLEGAL" | "UNKNOWN";
export type ResolvedShotBallOutcome =
  | "GOAL"
  | "MISSED"
  | "MISSED_WIDE"
  | "MISSED_HIGH"
  | "SAVED"
  | "SAVED_BY_GK"
  | "CAUGHT_BY_GK"
  | "DEFLECTED_BY_GK"
  | "BLOCKED"
  | "BLOCKED_BY_DEFENDER"
  | "REBOUND"
  | "REBOUND_CONTESTED"
  | "OUT_OF_PLAY"
  | "PENDING";
export type ResolvedPossessionAfterShot = TeamId | "CONTESTED" | "OUT_OF_PLAY" | "PENDING";
export type ShotOutcomeStatus = "PASS" | "WARNING" | "FAIL";
export type CleanWindowType = "NONE" | "PARTIAL" | "CLEAN" | "ELITE";
export type ReboundType = "NONE" | "OUT_OF_PLAY" | "GK_CONTROLLED" | "DEFENDER_CONTROLLED" | "ATTACKER_RECOVERY" | "CONTESTED";
export type ReboundZone = ZoneId | "OUT_OF_PLAY" | "NONE";

export interface ReboundResolution {
  readonly reboundType: ReboundType;
  readonly reboundZone: ReboundZone;
  readonly nextPossession: ResolvedPossessionAfterShot;
  readonly reboundReason: string;
}

export interface ShotDifficultyFactors {
  readonly cleanWindowType: CleanWindowType;
  readonly goalkeeperChallengeImpact: number;
  readonly defensiveBlockPressureImpact: number;
  readonly finishingPressureImpact: number;
  readonly forcedShotPenalty: number;
  readonly distanceOrZonePenalty: number;
  readonly cleanWindowBonus: number;
  readonly eliteFinisherBonus: number;
  readonly finalShotSuccessScore: number;
  readonly cleanWindowAdjustedScore: number;
  readonly outcomeThreshold: number;
  readonly forcedShot: boolean;
  readonly cleanWindow: boolean;
  readonly cleanWindowReason: string;
}

export interface ShotScoringImpact {
  readonly teamId?: TeamId;
  readonly pointsAdded: number;
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly reason: string;
}

export interface ShotOutcomeContract {
  readonly actionId: string;
  readonly sequenceId: string;
  readonly shootingTeamId: TeamId;
  readonly shooterId: PlayerId;
  readonly shooterInitials: string;
  readonly shootingTeamName: string;
  readonly defendingTeamId: TeamId;
  readonly defendingTeamName: string;
  readonly shotOriginZone: ZoneId;
  readonly shotTargetType: ShotTargetType;
  readonly shotTargetZone?: ZoneId;
  readonly shotTargetFrame?: ShotTargetFrame;
  readonly shotType: ShotOutcomeShotType;
  readonly shotLegality: ShotOutcomeLegality;
  readonly shotLegalityReason: string;
  readonly shotOnTarget: boolean;
  readonly shotPower: number;
  readonly shotPlacement: number;
  readonly shotAngleDifficulty: number;
  readonly goalkeeperId: PlayerId;
  readonly goalkeeperInitials: string;
  readonly goalkeeperZone: ZoneId;
  readonly goalkeeperInsideGoalArea: boolean;
  readonly goalkeeperLegalHandUseAvailable: boolean;
  readonly goalkeeperSetPositionScore: number;
  readonly goalkeeperReactionScore: number;
  readonly goalkeeperReachScore: number;
  readonly goalkeeperHandlingScore: number;
  readonly goalkeeperFootSaveScore: number;
  readonly goalkeeperPhysicalFatigue: number;
  readonly goalkeeperMentalFatigue: number;
  readonly goalkeeperReadinessState: GoalkeeperReadinessState;
  readonly concentrationLoad: number;
  readonly shotsFacedRecently: number;
  readonly timeSinceLastAction: number;
  readonly pressureContext: GoalkeeperPressureContext;
  readonly defensiveOrganizationInFront: number;
  readonly previousErrorFlag: GoalkeeperPreviousErrorFlag;
  readonly reboundControlScore: number;
  readonly secondSaveRecoveryScore: number;
  readonly goalkeeperAction: GoalkeeperAction;
  readonly gkShotStopping: GKShotStoppingResult;
  readonly shotQuality: number;
  readonly goalkeeperChallenge: number;
  readonly defensiveBlockPressure: number;
  readonly finishingPressure: number;
  readonly difficultyFactors: ShotDifficultyFactors;
  readonly ballOutcome: ResolvedShotBallOutcome;
  readonly possessionAfterShot: ResolvedPossessionAfterShot;
  readonly reboundResolution: ReboundResolution;
  readonly reboundContinuationContext: ReboundContinuationContext;
  readonly reboundContinuation: ReboundContinuationResult;
  readonly scoringImpact: ShotScoringImpact;
  readonly outcomeReason: string;
  readonly outcomeStatus: ShotOutcomeStatus;
}

export interface ShotOutcomeScoreSummary {
  readonly finalScoreReported: string;
  readonly finalScoreFromOutcomes: string;
  readonly scoreSource: "SHOT_OUTCOME_RESOLUTION" | "ABSTRACT_FALLBACK";
  readonly controlGoals: number;
  readonly blitzGoals: number;
  readonly controlGoalPoints: number;
  readonly blitzGoalPoints: number;
  readonly controlShots: number;
  readonly blitzShots: number;
  readonly pendingShotOutcomes: number;
  readonly scoreMismatchCount: number;
}

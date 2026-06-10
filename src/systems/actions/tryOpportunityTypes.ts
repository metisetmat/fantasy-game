import type { PlayerId, TeamId } from "../../core/ids";
import type { ScoringZoneId } from "../../core/scoringZones";
import type { ZoneId } from "../../core/zones";
import type { AttackingDirection } from "../spatial/intention/types";
import type { InGoalAccessLaneCategory } from "../rules";
import type { TryTouchdownOutcome } from "../scoring/tryTouchdownTypes";

export type TryOpportunityType =
  | "OUTER_CHANNEL_CARRY_TO_IN_GOAL"
  | "OUTER_HALF_SPACE_CARRY_TO_IN_GOAL"
  | "WEAK_SIDE_OVERLOAD_TO_IN_GOAL"
  | "CONTACT_BREAK_LATERAL_TO_IN_GOAL"
  | "TRANSITION_WIDE_RUN_TO_IN_GOAL"
  | "SCRAMBLE_LOOSE_BALL_IN_GOAL"
  | "REBOUND_DIVE_IN_GOAL";

export interface TryOpportunityContext {
  readonly possessionTeamId: TeamId;
  readonly carrierId: PlayerId;
  readonly carrierRole: string;
  readonly currentZone: ZoneId;
  readonly currentLane: string;
  readonly previousZone: ZoneId;
  readonly attackingDirection: AttackingDirection;
  readonly distanceToInGoal: number;
  readonly legalAccessLane: string;
  readonly accessRouteType: InGoalAccessLaneCategory;
  readonly supportRunnersNearby: number;
  readonly defensiveGoalLineDensity: number;
  readonly outerChannelSpace: number;
  readonly outerHalfSpaceSpace: number;
  readonly contactPressure: number;
  readonly tacklePressure: number;
  readonly carryMomentum: number;
  readonly handlingControl: number;
  readonly fatiguePenalty: number;
  readonly teamStyle: string;
  readonly phase: string;
}

export interface TryOpportunityRecord {
  readonly matchId: string;
  readonly seed: string;
  readonly teamId: TeamId;
  readonly teamName: string;
  readonly styleVariant: string;
  readonly opportunityType: TryOpportunityType;
  readonly previousZone: ZoneId;
  readonly groundingZone: ScoringZoneId;
  readonly accessRouteType: InGoalAccessLaneCategory;
  readonly legalAccessRoute: boolean;
  readonly attemptGenerated: boolean;
  readonly blockedBeforeAttempt: boolean;
  readonly groundingResolverReached: boolean;
  readonly legalAccessQuality: number;
  readonly ballControlScore: number;
  readonly groundingScore: number;
  readonly bodyControlScore: number;
  readonly carrierMomentumScore: number;
  readonly supportArrivingScore: number;
  readonly contactPressure: number;
  readonly tacklePressure: number;
  readonly defenderGoalLinePressure: number;
  readonly fatiguePenalty: number;
  readonly outcome: Exclude<TryTouchdownOutcome, "PENDING"> | "NO_ATTEMPT";
  readonly pointValue: number;
  readonly reason: string;
}

export interface TryOpportunityGenerationSummary {
  readonly detectorActive: true;
  readonly matchesSimulated: number;
  readonly tryOpportunities: number;
  readonly opportunitiesPerMatch: number;
  readonly tryAttempts: number;
  readonly attemptsPerOpportunity: number;
  readonly triesScored: number;
  readonly tryConversionRate: number;
  readonly opportunitiesByType: Readonly<Record<TryOpportunityType, number>>;
  readonly legalAccessRouteDistribution: Readonly<Record<InGoalAccessLaneCategory, number>>;
  readonly invalidAccessBlockedCount: number;
  readonly opportunitiesByTeam: Readonly<Record<string, number>>;
  readonly opportunitiesByStyle: Readonly<Record<string, number>>;
  readonly opportunitiesBlockedBeforeAttempt: number;
  readonly attemptsReachingGroundingResolver: number;
  readonly outcomeCounts: Readonly<Record<Exclude<TryTouchdownOutcome, "PENDING">, number>>;
  readonly centralFrontalTriesGenerated: number;
  readonly offBallInGoalPlayerCount: number;
  readonly recommendation:
    | "KEEP_TRY_OPPORTUNITY_MODEL"
    | "KEEP_TRY_ATTEMPT_MODEL"
    | "INCREASE_TRY_OPPORTUNITIES"
    | "MONITOR_TRY_FREQUENCY"
    | "INCREASE_TRY_FINISHING_SLIGHTLY"
    | "REDUCE_TRY_EASE"
    | "INCREASE_HELD_UP_OUTCOMES"
    | "NEEDS_MORE_SAMPLE";
  readonly opportunities: readonly TryOpportunityRecord[];
}

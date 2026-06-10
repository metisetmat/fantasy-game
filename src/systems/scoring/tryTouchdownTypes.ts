import type { PlayerId, TeamId } from "../../core/ids";
import type { ScoringZoneId } from "../../core/scoringZones";
import type { ZoneId } from "../../core/zones";
import type { InGoalAccessLaneCategory } from "../rules";

export type TryTouchdownFoundationVersion = "V2_FOUNDATION" | "V2_CONVERSION_ACTIVE" | "V2_DROP_FOUNDATION";
export type TryTouchdownOutcome =
  | "TRY_SCORED"
  | "HELD_UP"
  | "LOST_FORWARD"
  | "TACKLED_SHORT"
  | "OUT_OF_PLAY"
  | "INVALID_GROUNDING"
  | "INVALID_ACCESS_ROUTE"
  | "PENDING";
export type TryTouchdownRecommendation =
  | "KEEP_TRY_FOUNDATION"
  | "MONITOR_TRY_FREQUENCY"
  | "INCREASE_TRY_OPPORTUNITIES"
  | "REDUCE_TRY_EASE"
  | "NEEDS_MORE_SAMPLE";

export interface TryTouchdownScoringRule {
  readonly actionType: "TRY_TOUCHDOWN";
  readonly pointValue: 5;
  readonly activeInVersion: TryTouchdownFoundationVersion;
}

export interface TryTouchdownScoringEvent {
  readonly actionId: string;
  readonly sequenceId: string;
  readonly teamId: TeamId;
  readonly carrierId: PlayerId;
  readonly carrierRole: string;
  readonly outcome: TryTouchdownOutcome;
  readonly pointValue: number;
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly reason: string;
}

export interface TryTouchdownAttemptRecord {
  readonly actionId: string;
  readonly sequenceId: string;
  readonly teamId: TeamId;
  readonly carrierId: PlayerId;
  readonly carrierRole: string;
  readonly entryType: string;
  readonly previousZone: ZoneId;
  readonly currentZone: ScoringZoneId | string;
  readonly targetTryZone: readonly ScoringZoneId[];
  readonly accessRouteCategory: InGoalAccessLaneCategory;
  readonly groundingZone?: ScoringZoneId;
  readonly groundingType?: "HELD_BALL" | "LOOSE_BALL";
  readonly ballControlScore: number;
  readonly groundingScore: number;
  readonly bodyControlScore: number;
  readonly contactPressure: number;
  readonly tacklePressure: number;
  readonly supportArrivingScore: number;
  readonly defenderGoalLinePressure: number;
  readonly fatiguePenalty: number;
  readonly outcome: TryTouchdownOutcome;
  readonly scoringAction: "TRY_TOUCHDOWN" | "NONE";
  readonly pointValue: number;
  readonly reason: string;
}

export interface TryTouchdownFoundationSummary {
  readonly scoringVersion: TryTouchdownFoundationVersion;
  readonly scoreUnit: "POINTS";
  readonly shotGoalPoints: 3;
  readonly tryTouchdownPoints: 5;
  readonly conversionActive: true;
  readonly dropGoalActive: true;
  readonly penaltyShotActive: false;
  readonly attempts: readonly TryTouchdownAttemptRecord[];
  readonly scoringEvents: readonly TryTouchdownScoringEvent[];
  readonly tryAttempts: number;
  readonly tryTouchdownsScored: number;
  readonly pointsFromTries: number;
  readonly recommendation: TryTouchdownRecommendation;
}

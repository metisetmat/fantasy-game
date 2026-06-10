import type { PlayerId, TeamId } from "../../core/ids";
import type { ScoringZoneId } from "../../core/scoringZones";
import type { ZoneId } from "../../core/zones";
import type { TryTouchdownOutcome } from "../scoring/tryTouchdownTypes";
import type { InGoalAccessLaneCategory } from "../rules";

export type TryTouchdownEntryType =
  | "CARRY"
  | "PASS_RECEIVE_AND_GROUND"
  | "REBOUND_RECOVERY_AND_GROUND"
  | "LOOSE_BALL_DIVE"
  | "UNKNOWN";

export type TryGroundingType = "HELD_BALL" | "LOOSE_BALL";

export interface TryTouchdownAttemptContext {
  readonly actionId: string;
  readonly attackingTeamId: TeamId;
  readonly defendingTeamId: TeamId;
  readonly carrierId: PlayerId;
  readonly carrierRole: string;
  readonly previousZone: ZoneId;
  readonly currentZone: ScoringZoneId | string;
  readonly targetTryZone: readonly ScoringZoneId[];
  readonly groundingZone: ScoringZoneId | undefined;
  readonly groundingType: TryGroundingType;
  readonly downwardPressureApplied: boolean;
  readonly frontBodyWaistToNeckPressure: boolean;
  readonly ballControlScore: number;
  readonly groundingScore: number;
  readonly bodyControlScore: number;
  readonly carrierMomentumScore: number;
  readonly legalAccessQuality: number;
  readonly teamStyleModifier: number;
  readonly contactPressure: number;
  readonly tacklePressure: number;
  readonly supportArrivingScore: number;
  readonly defenderGoalLinePressure: number;
  readonly fatiguePenalty: number;
  readonly handlingRisk: number;
  readonly legalGroundingAvailable: boolean;
  readonly entryType: TryTouchdownEntryType;
  readonly scoreBefore: string;
}

export interface TryTouchdownAttemptResult {
  readonly resolved: boolean;
  readonly outcome: Exclude<TryTouchdownOutcome, "PENDING">;
  readonly scoringAction: "TRY_TOUCHDOWN" | "NONE";
  readonly pointValue: number;
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly possessionAfter: TeamId | "CONTESTED" | "OUT_OF_PLAY";
  readonly restartType: "TRY_RESTART" | "DEFENSIVE_RESTART" | "SCRUM_RESTART" | "TOUCH_RESTART" | "PLAY_CONTINUES";
  readonly accessRouteCategory: InGoalAccessLaneCategory;
  readonly groundingZone: ScoringZoneId | undefined;
  readonly groundingType: TryGroundingType;
  readonly conversionGeometryStored: boolean;
  readonly reason: string;
}

import type { PlayerId, TeamId } from "../../core/ids";

export interface ScoringEventScoreState {
  readonly CONTROL: number;
  readonly BLITZ: number;
}

export type ScoringEventFamily = "SHOT" | "TRY_TOUCHDOWN" | "CONVERSION" | "DROP_GOAL" | "PENALTY_SHOT";
export type LiveScoringAction = "SHOT_GOAL" | "TRY_TOUCHDOWN" | "CONVERSION_GOAL" | "DROP_GOAL" | "NONE";
export type ScoringEventSourceOutcome =
  | "GOAL"
  | "TRY_SCORED"
  | "CONVERSION_GOAL"
  | "CONVERSION_MISSED"
  | "DROP_GOAL"
  | "DROP_MISSED"
  | "DROP_BLOCKED"
  | "DROP_INVALID"
  | "LOST_FORWARD"
  | "TACKLED_SHORT"
  | "HELD_UP"
  | "MISSED_HIGH"
  | "SAVED_BY_GK"
  | "DEFLECTED_BY_GK"
  | "NONE";

export interface ScoringEvent {
  readonly id: string;
  readonly matchId: string;
  readonly sequenceId?: string;
  readonly sourceActionId: string;
  readonly teamId: TeamId;
  readonly actorId?: PlayerId;
  readonly eventFamily: ScoringEventFamily;
  readonly scoringAction: LiveScoringAction;
  readonly pointValue: number;
  readonly scoreBefore: ScoringEventScoreState;
  readonly scoreAfter: ScoringEventScoreState;
  readonly active: boolean;
  readonly sourceOutcome: ScoringEventSourceOutcome;
  readonly reason: string;
}

export interface UnifiedScoringEventSummary {
  readonly scoringVersion: "V2_DROP_FOUNDATION";
  readonly scoreUnit: "POINTS";
  readonly scoringSource: "UNIFIED_LIVE_SCORING_EVENTS";
  readonly events: readonly ScoringEvent[];
  readonly activeEvents: readonly ScoringEvent[];
  readonly nonScoringEvents: readonly ScoringEvent[];
  readonly finalScoreFromEvents: ScoringEventScoreState;
  readonly finalScoreReported: ScoringEventScoreState;
  readonly finalScoreDisplay: string;
  readonly scoringEventCount: number;
  readonly activeScoringEventCount: number;
  readonly shotGoalEvents: number;
  readonly tryTouchdownEvents: number;
  readonly conversionGoalEvents: number;
  readonly dropGoalEvents: number;
  readonly failedTryActiveScoringLeakageCount: number;
  readonly conversionWithoutTryCount: number;
  readonly batchLiveContaminationCount: number;
  readonly finalScoreMismatchCount: number;
  readonly inactiveScoringLeakageCount: number;
  readonly recommendation: "KEEP_UNIFIED_SCORING_STREAM" | "FIX_SCORE_AGGREGATION" | "FIX_BATCH_LIVE_SCORE_SEPARATION" | "FIX_CONVERSION_SCORING_LINK" | "NEEDS_MORE_SAMPLE";
}

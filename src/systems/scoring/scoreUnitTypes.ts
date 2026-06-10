import type { PlayerId, TeamId } from "../../core/ids";
import type { ScoringActionType } from "./scoringRuleTypes";

export type ScoreUnit = "POINTS" | "GOALS" | "ABSTRACT_POINTS";
export type ScoreUnitConsistencyStatus = "PASS" | "WARNING" | "FAIL";

export interface ScoreUnitScoringEvent {
  readonly actionId: string;
  readonly sequenceId: string;
  readonly teamId: TeamId;
  readonly actorId: PlayerId;
  readonly actorInitials: string;
  readonly scoringActionType: ScoringActionType;
  readonly pointValue: number;
  readonly scoreBefore: string;
  readonly scoreAfter: string;
  readonly reason: string;
}

export interface ScoreUnitFinalScore {
  readonly homeTeamId: TeamId;
  readonly awayTeamId: TeamId;
  readonly homePoints: number;
  readonly awayPoints: number;
  readonly display: string;
}

export interface ScoreUnitTeamTotal {
  readonly teamId: TeamId;
  readonly teamName: string;
  readonly goalCount: number;
  readonly points: number;
  readonly scoringActions: number;
}

export interface ScoreUnitContract {
  readonly scoreUnit: ScoreUnit;
  readonly scoringEvents: readonly ScoreUnitScoringEvent[];
  readonly finalScore: ScoreUnitFinalScore;
  readonly teamTotals: readonly ScoreUnitTeamTotal[];
  readonly consistencyStatus: ScoreUnitConsistencyStatus;
  readonly reason: string;
}

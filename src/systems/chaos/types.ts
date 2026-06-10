import type { Rating } from "../../core/ratings";
import type { PressureLevel } from "../../models/match";

export enum ChaosOutcome {
  None = "NONE",
  TechnicalError = "TECHNICAL_ERROR",
  PoorDecision = "POOR_DECISION",
  SupportFailure = "SUPPORT_FAILURE",
  ForcedTurnover = "FORCED_TURNOVER",
  RushedClearance = "RUSHED_CLEARANCE",
  TransitionReversal = "TRANSITION_REVERSAL",
}

export enum ChaosAdvantage {
  AttackingAdvantage = "ATTACKING_ADVANTAGE",
  DefensiveAdvantage = "DEFENSIVE_ADVANTAGE",
  Neutral = "NEUTRAL",
}

export interface ChaosEvaluationInput {
  readonly chaosLevel: Rating;
  readonly pressureLevel: PressureLevel;
  readonly riskLevel: Rating;
  readonly tacticalDiscipline: Rating;
  readonly cohesion: Rating;
  readonly mental: Rating;
  readonly freshness: Rating;
  readonly supportQuality: Rating;
}

export interface ChaosEvaluation {
  readonly score: Rating;
  readonly outcome: ChaosOutcome;
  readonly reasons: readonly string[];
}

export interface ChaosAdvantageEvaluation {
  readonly advantage: ChaosAdvantage;
  readonly score: Rating;
  readonly reasons: readonly string[];
}

import type { Rating } from "../../core/ratings";

export enum DangerMetricLevel {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Critical = "CRITICAL",
}

export interface DangerMetricsEvaluation {
  readonly chaosLevel: Rating;
  readonly territorialPressure: Rating;
  readonly structuralBreak: Rating;
  readonly numericalAdvantage: Rating;
  readonly laneAccess: Rating;
  readonly supportQuality: Rating;
  readonly goalkeeperExposure: Rating;
  readonly finishingViability: Rating;
  readonly conversionProbability: Rating;
  readonly finalDanger: Rating;
  readonly finalDangerLevel: DangerMetricLevel;
  readonly attackingNumericalMargin: number;
  readonly hasRealNumericalAdvantage: boolean;
  readonly hasUsableScoringLane: boolean;
  readonly hasViableFinishing: boolean;
  readonly dangerPhaseAllowed: boolean;
  readonly reasons: readonly string[];
  readonly warnings: readonly string[];
}

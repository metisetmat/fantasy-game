export enum NumericalPressureAdvantage {
  Attack = "ATTACK",
  Defense = "DEFENSE",
  Balanced = "BALANCED",
}

export interface NumericalPressureEvaluation {
  readonly attackersNearBall: number;
  readonly defendersGoalSide: number;
  readonly supportArrivals: number;
  readonly delayedDefenders: number;
  readonly advantage: NumericalPressureAdvantage;
  readonly description: string;
}

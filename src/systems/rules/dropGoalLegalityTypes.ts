export interface DropGoalLegality {
  readonly legal: boolean;
  readonly reason: string;
  readonly zoneAllowed: boolean;
  readonly openPlay: boolean;
  readonly controlledPossession: boolean;
  readonly validDropSetup: boolean;
  readonly notInInGoal: boolean;
  readonly notAfterTryConversion: boolean;
}

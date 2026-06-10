import type { TryTouchdownFoundationSummary } from "./tryTouchdownTypes";

export interface TryTouchdownFoundationValidation {
  readonly valid: boolean;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
}

export function validateTryTouchdownFoundation(summary: TryTouchdownFoundationSummary): TryTouchdownFoundationValidation {
  const errors = [
    ...(summary.scoringVersion === "V2_DROP_FOUNDATION" ? [] : ["scoring version is not V2_DROP_FOUNDATION"]),
    ...(summary.scoreUnit === "POINTS" ? [] : ["score unit is not POINTS"]),
    ...(summary.shotGoalPoints === 3 ? [] : ["SHOT_GOAL changed from 3 points"]),
    ...(summary.tryTouchdownPoints === 5 ? [] : ["TRY_TOUCHDOWN is not 5 points"]),
    ...(summary.conversionActive ? [] : ["CONVERSION is not active"]),
    ...(summary.dropGoalActive ? [] : ["DROP_GOAL is not active"]),
    ...(summary.penaltyShotActive ? ["PENALTY_SHOT is active"] : []),
  ];
  const warnings = [
    ...(summary.tryAttempts === 0 ? ["no try attempts generated yet"] : []),
    ...(summary.tryTouchdownsScored === 0 ? ["no try touchdowns scored yet"] : []),
  ];

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

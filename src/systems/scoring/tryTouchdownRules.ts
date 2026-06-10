import { scoringRuleLabel } from "./scoringRules";
import type { TryTouchdownScoringRule } from "./tryTouchdownTypes";

export const TRY_TOUCHDOWN_SCORING_VERSION = "V2_DROP_FOUNDATION";
export const TRY_TOUCHDOWN_POINT_VALUE = 5;
export const CONVERSION_POINT_VALUE = 2;

export const TRY_TOUCHDOWN_SCORING_RULE: TryTouchdownScoringRule = {
  actionType: "TRY_TOUCHDOWN",
  pointValue: TRY_TOUCHDOWN_POINT_VALUE,
  activeInVersion: TRY_TOUCHDOWN_SCORING_VERSION,
};

export function tryTouchdownRuleLabel(): string {
  return `TRY_TOUCHDOWN = ${TRY_TOUCHDOWN_POINT_VALUE} points`;
}

export function activeFoundationScoringRules(): readonly string[] {
  return [scoringRuleLabel("SHOT_GOAL"), tryTouchdownRuleLabel(), scoringRuleLabel("CONVERSION_GOAL"), "DROP_GOAL = 2 points"];
}

export function inactiveFoundationScoringRules(): readonly string[] {
  return ["PENALTY_SHOT"];
}

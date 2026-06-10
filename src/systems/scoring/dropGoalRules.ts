import type { ScoringRule } from "./scoringRuleTypes";

export const DROP_GOAL_POINT_VALUE = 2;

export const DROP_GOAL_SCORING_RULES: readonly ScoringRule[] = [
  { actionType: "DROP_GOAL", pointValue: DROP_GOAL_POINT_VALUE, activeInVersion: "V2_DROP_FOUNDATION" },
  { actionType: "DROP_MISSED", pointValue: 0, activeInVersion: "V2_DROP_FOUNDATION" },
  { actionType: "DROP_BLOCKED", pointValue: 0, activeInVersion: "V2_DROP_FOUNDATION" },
  { actionType: "DROP_INVALID", pointValue: 0, activeInVersion: "V2_DROP_FOUNDATION" },
];

export function pointValueForDropGoalOutcome(outcome: "DROP_GOAL" | "DROP_MISSED" | "DROP_BLOCKED" | "DROP_INVALID"): number {
  return DROP_GOAL_SCORING_RULES.find((rule) => rule.actionType === outcome)?.pointValue ?? 0;
}

export function dropGoalRuleLabel(): string {
  return `DROP_GOAL = ${DROP_GOAL_POINT_VALUE} points`;
}

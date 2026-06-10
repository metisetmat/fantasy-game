import type { ConversionOutcome, ConversionScoringRule } from "./conversionTypes";
import { CONVERSION_POINT_VALUE } from "./tryTouchdownRules";

export const CONVERSION_SCORING_RULES: readonly ConversionScoringRule[] = [
  { actionType: "CONVERSION_GOAL", pointValue: CONVERSION_POINT_VALUE, activeInVersion: "V2_DROP_FOUNDATION" },
  { actionType: "CONVERSION_MISSED", pointValue: 0, activeInVersion: "V2_DROP_FOUNDATION" },
  { actionType: "CONVERSION_BLOCKED", pointValue: 0, activeInVersion: "V2_DROP_FOUNDATION" },
  { actionType: "CONVERSION_INVALID", pointValue: 0, activeInVersion: "V2_DROP_FOUNDATION" },
];

export function pointValueForConversionOutcome(outcome: ConversionOutcome): number {
  return CONVERSION_SCORING_RULES.find((rule) => rule.actionType === outcome)?.pointValue ?? 0;
}

export function conversionRuleLabel(): string {
  return `CONVERSION_GOAL = ${CONVERSION_POINT_VALUE} points`;
}

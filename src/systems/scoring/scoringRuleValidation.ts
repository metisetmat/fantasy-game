import type { ScoringRuleSet } from "./scoringRuleTypes";

export interface ScoringRuleValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function validateScoringRulesV1(ruleSet: ScoringRuleSet): ScoringRuleValidation {
  const ruleValue = (actionType: string): number | undefined => ruleSet.rules.find((rule) => rule.actionType === actionType)?.pointValue;
  const activeRuleNames: readonly string[] = ruleSet.rules.filter((rule) => rule.activeInVersion === "V1").map((rule) => rule.actionType);
  const v2Leakage = ["TRY", "TOUCHDOWN", "TRY_TOUCHDOWN", "CONVERSION", "CONVERSION_GOAL", "DROP_GOAL", "PENALTY_SHOT"].filter((rule) =>
    activeRuleNames.includes(rule),
  );
  const errors = [
    ...(ruleSet.version === "V1" ? [] : ["scoring version is not V1"]),
    ...(ruleSet.scoreUnit === "POINTS" ? [] : ["score unit is not POINTS"]),
    ...(ruleValue("SHOT_GOAL") === 3 ? [] : ["SHOT_GOAL is not worth 3 points"]),
    ...(ruleValue("SHOT_MISSED") === 0 ? [] : ["SHOT_MISSED is not worth 0 points"]),
    ...(ruleValue("SHOT_SAVED") === 0 ? [] : ["SHOT_SAVED is not worth 0 points"]),
    ...(ruleValue("SHOT_BLOCKED") === 0 ? [] : ["SHOT_BLOCKED is not worth 0 points"]),
    ...(ruleValue("SHOT_OUT_OF_PLAY") === 0 ? [] : ["SHOT_OUT_OF_PLAY is not worth 0 points"]),
    ...(v2Leakage.length === 0 ? [] : [`V2 scoring rules are active inside shot-subsystem V1: ${v2Leakage.join(", ")}`]),
  ];

  return {
    valid: errors.length === 0,
    errors,
  };
}

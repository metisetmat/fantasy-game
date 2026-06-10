import type { BatchScoringCalibrationSummary } from "./batchScoringCalibrationTypes";
import { V1_SCORING_RULES } from "./scoringRules";

export interface BatchScoringCalibrationValidation {
  readonly valid: boolean;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
}

export function validateBatchScoringCalibrationSummary(summary: BatchScoringCalibrationSummary): BatchScoringCalibrationValidation {
  const activeRuleNames = V1_SCORING_RULES.rules.filter((rule) => rule.activeInVersion === "V1").map((rule) => rule.actionType as string);
  const v2Leakage = ["TRY", "TOUCHDOWN", "TRY_TOUCHDOWN", "CONVERSION", "CONVERSION_GOAL", "DROP_GOAL", "PENALTY_SHOT"].filter((rule) => activeRuleNames.includes(rule));
  const warnings = [
    ...(summary.variationStatus === "IDENTICAL_OUTPUT_WARNING" ? ["batch lacks variation; calibration sample may not be meaningful"] : []),
    ...(summary.scenarioVariation.uniqueShotCounts <= 1 ? ["shot counts remain deterministic across scenarios"] : []),
    ...(summary.scenarioVariation.uniqueFinalScores <= 1 ? ["final scores remain deterministic across scenarios"] : []),
  ];
  const errors = [
    ...(summary.scoringVersion === "V1" ? [] : ["scoring version is not V1"]),
    ...(summary.scoreUnit === "POINTS" ? [] : ["score unit is not POINTS"]),
    ...(summary.scoringRule === "SHOT_GOAL = 3 points" ? [] : ["SHOT_GOAL point value changed"]),
    ...(summary.matchesSimulated >= 20 ? [] : ["batch match count is below 20"]),
    ...(summary.variationStatus !== "IDENTICAL_OUTPUT_WARNING" ? [] : ["batch variation status remains IDENTICAL_OUTPUT_WARNING"]),
    ...(summary.scenarioVariation.connectedSimulationInputCount >= 3 ? [] : ["seed is connected to fewer than 3 calibration inputs"]),
    ...(v2Leakage.length === 0 ? [] : [`V2 scoring rules active: ${v2Leakage.join(", ")}`]),
  ];

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

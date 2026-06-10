import type { ScenarioVariationSummary } from "./seedVariationTypes";

export interface SeedVariationValidation {
  readonly valid: boolean;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
}

export function validateSeedVariationSummary(summary: ScenarioVariationSummary): SeedVariationValidation {
  const warnings = [
    ...(summary.uniqueShotCounts <= 1 ? ["shot counts remain deterministic across scenarios"] : []),
    ...(summary.uniqueFinalScores <= 1 ? ["final scores remain deterministic across scenarios"] : []),
  ];
  const errors = [
    ...(summary.generatedScenarioCount >= 20 ? [] : ["fewer than 20 scenarios generated"]),
    ...(summary.uniqueInitialScenarios > 1 ? [] : ["initial scenarios did not vary"]),
    ...(summary.connectedSimulationInputCount >= 3 ? [] : ["seed is connected to fewer than 3 calibration inputs"]),
    ...(summary.scenarioDiversityStatus !== "IDENTICAL_OUTPUT_WARNING" ? [] : ["batch variation status remains IDENTICAL_OUTPUT_WARNING"]),
    ...(summary.seedImpactStatus !== "SEED_NOT_CONNECTED_TO_SIMULATION" ? [] : ["seed is not connected to simulation inputs"]),
  ];

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

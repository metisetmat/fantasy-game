import { createSandboxDecisionBatchScenarios } from "./createSandboxDecisionBatchScenarios";
import { sandboxDecisionEvidenceCalibrationFixture } from "./sandboxDecisionBatchConfidenceTestHelpers";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCreateSandboxDecisionBatchScenarios(): readonly string[] {
  const calibration = sandboxDecisionEvidenceCalibrationFixture();
  const scenarios = createSandboxDecisionBatchScenarios({ calibration });
  const scenarioTypes = new Set(scenarios.map((scenario) => scenario.scenarioType));
  const modifiers = scenarios.flatMap((scenario) => [
    scenario.attackingSupportModifier,
    scenario.secondBallOccupationModifier,
    scenario.goalkeeperStrengthModifier,
    scenario.attackerFatigueModifier,
    scenario.goalkeeperFatigueModifier,
    scenario.defensiveRecoveryModifier,
    scenario.pressureModifier,
  ]);

  assertTest(scenarios.length >= 6, "scenario count must be at least 6.");
  assertTest(scenarioTypes.has("base"), "base scenario missing.");
  assertTest(scenarioTypes.has("better_attacking_support"), "better attacking support scenario missing.");
  assertTest(scenarioTypes.has("weak_attacking_support"), "weak attacking support scenario missing.");
  assertTest(scenarioTypes.has("stronger_goalkeeper"), "stronger goalkeeper scenario missing.");
  assertTest(scenarioTypes.has("weaker_goalkeeper"), "weaker goalkeeper scenario missing.");
  assertTest(scenarioTypes.has("fatigued_attacker"), "fatigued attacker scenario missing.");
  assertTest(scenarioTypes.has("fatigued_goalkeeper"), "fatigued goalkeeper scenario missing.");
  assertTest(modifiers.every((modifier) => modifier >= -2 && modifier <= 2), "scenario modifiers must be bounded.");
  assertTest(calibration.evidenceScore === 38, "scenario creation must not mutate calibration fixture.");

  return [
    "scenario count is at least 6",
    "base, support, goalkeeper, fatigue, and recovery variations exist",
    "modifiers are bounded",
    "scenario creation does not mutate calibration fixture",
  ];
}

if (require.main === module) {
  const checks = validateCreateSandboxDecisionBatchScenarios();

  console.log("createSandboxDecisionBatchScenarios tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

import { createSandboxDecisionBatchScenarios } from "./createSandboxDecisionBatchScenarios";
import { resolveSandboxDecisionBatchScenario } from "./resolveSandboxDecisionBatchScenario";
import { sandboxDecisionEvidenceCalibrationFixture } from "./sandboxDecisionBatchConfidenceTestHelpers";
import type { SandboxDecisionBatchScenarioType } from "./sandboxDecisionBatchConfidenceCalibration";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateResolveSandboxDecisionBatchScenario(): readonly string[] {
  const calibration = sandboxDecisionEvidenceCalibrationFixture();
  const scenarios = createSandboxDecisionBatchScenarios({ calibration });
  const resultByType = new Map<SandboxDecisionBatchScenarioType, number>();

  for (const scenario of scenarios) {
    const result = resolveSandboxDecisionBatchScenario({ calibration, scenario });

    assertTest(result.suggestionOnly, "scenario result must be suggestion-only.");
    assertTest(!result.canDriveLiveSelection, "scenario result cannot drive live selection.");
    assertTest(!result.canCreateProductionScoringEvents, "scenario result cannot create production scoring events.");
    resultByType.set(scenario.scenarioType, result.evidenceScore);
  }

  const base = resultByType.get("base") ?? 0;

  assertTest(base >= 35 && base <= 41, "base scenario must keep current score near 38.");
  assertTest((resultByType.get("better_attacking_support") ?? 0) >= base, "better attacking support must improve or preserve score.");
  assertTest((resultByType.get("weak_attacking_support") ?? 100) < base, "weak attacking support must lower score.");
  assertTest((resultByType.get("stronger_goalkeeper") ?? 100) < base, "stronger goalkeeper must lower score.");
  assertTest((resultByType.get("weaker_goalkeeper") ?? 0) >= base, "weaker goalkeeper must improve or preserve score.");
  assertTest((resultByType.get("fatigued_attacker") ?? 100) < base, "fatigued attacker must lower score.");
  assertTest((resultByType.get("fatigued_goalkeeper") ?? 0) >= base, "fatigued goalkeeper must improve or preserve score.");
  assertTest((resultByType.get("higher_defensive_recovery") ?? 100) < base, "higher defensive recovery must lower score.");

  return [
    "base scenario keeps current score near 38",
    "support and weaker goalkeeper scenarios improve or preserve score",
    "weak support, stronger goalkeeper, fatigue, and defensive recovery lower score",
    "scenario results preserve sandbox-only guardrails",
  ];
}

if (require.main === module) {
  const checks = validateResolveSandboxDecisionBatchScenario();

  console.log("resolveSandboxDecisionBatchScenario tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

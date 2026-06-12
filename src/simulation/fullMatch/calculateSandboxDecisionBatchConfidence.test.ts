import { calculateSandboxDecisionBatchConfidence } from "./calculateSandboxDecisionBatchConfidence";
import type { SandboxDecisionBatchScenarioResult } from "./sandboxDecisionBatchConfidenceCalibration";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function result(score: number, index: number): SandboxDecisionBatchScenarioResult {
  return {
    scenarioId: `scenario-${index}`,
    scenarioType: "base",
    label: `Scenario ${index}`,
    evidenceScore: score,
    confidence: score <= 34 ? "very_low" : score <= 54 ? "low" : score <= 69 ? "medium" : "strong",
    supportingSignalCount: 6,
    limitingSignalCount: 7,
    scenarioInterpretation: "fixture",
    suggestionOnly: true,
    officialTruth: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
  };
}

export function validateCalculateSandboxDecisionBatchConfidence(): readonly string[] {
  const clamped = calculateSandboxDecisionBatchConfidence({
    scenarioResults: [result(-10, 1), result(110, 2), result(50, 3), result(50, 4), result(50, 5), result(50, 6)],
    singleChainEvidenceScore: 38,
    singleChainConfidence: "low",
  });
  const short = calculateSandboxDecisionBatchConfidence({
    scenarioResults: [result(70, 1), result(70, 2), result(70, 3)],
    singleChainEvidenceScore: 38,
    singleChainConfidence: "low",
  });
  const mixed = calculateSandboxDecisionBatchConfidence({
    scenarioResults: [result(20, 1), result(25, 2), result(38, 3), result(50, 4), result(58, 5), result(62, 6)],
    singleChainEvidenceScore: 38,
    singleChainConfidence: "low",
  });
  const medium = calculateSandboxDecisionBatchConfidence({
    scenarioResults: [result(56, 1), result(57, 2), result(58, 3), result(59, 4), result(60, 5), result(61, 6)],
    singleChainEvidenceScore: 38,
    singleChainConfidence: "low",
  });
  const currentFixture = calculateSandboxDecisionBatchConfidence({
    scenarioResults: [result(38, 1), result(50, 2), result(22, 3), result(20, 4), result(50, 5), result(26, 6), result(47, 7), result(28, 8), result(51, 9)],
    singleChainEvidenceScore: 38,
    singleChainConfidence: "low",
  });

  assertTest(clamped.minEvidenceScore === 0, "scores must clamp low values to 0.");
  assertTest(clamped.maxEvidenceScore === 100, "scores must clamp high values to 100.");
  assertTest(short.batchConfidence === "low", "fewer than 6 scenarios must cap confidence at low.");
  assertTest(mixed.recommendationStability === "mixed", "split results must produce mixed stability.");
  assertTest(medium.batchConfidence === "medium", "repeated medium scores can produce medium.");
  assertTest(currentFixture.batchConfidence !== "medium", "current fixture batch must not become high-confidence.");
  assertTest(!Object.keys(currentFixture.confidenceDistribution).includes("high"), "local batch confidence must not support high.");

  return [
    "scores are clamped",
    "fewer than 6 scenarios cap confidence at low",
    "mixed results produce mixed stability",
    "repeated medium scores can produce medium but not strong",
    "current fixture batch is not high confidence",
  ];
}

if (require.main === module) {
  const checks = validateCalculateSandboxDecisionBatchConfidence();

  console.log("calculateSandboxDecisionBatchConfidence tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

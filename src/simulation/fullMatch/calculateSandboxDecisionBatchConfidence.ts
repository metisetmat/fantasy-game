import type { SandboxDecisionEvidenceConfidence } from "./sandboxDecisionEvidenceCalibration";
import {
  emptyConfidenceDistribution,
  sandboxDecisionBatchConfidenceLabel,
  type SandboxDecisionBatchConfidence,
  type SandboxDecisionBatchConfidenceCalibrationModel,
  type SandboxDecisionBatchConfidenceDistribution,
  type SandboxDecisionBatchScenarioResult,
} from "./sandboxDecisionBatchConfidenceCalibration";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function confidenceFromAverage(input: {
  readonly averageScore: number;
  readonly scenarioCount: number;
  readonly belowUsefulThresholdCount: number;
  readonly mediumReadyCount: number;
}): SandboxDecisionBatchConfidence {
  if (input.averageScore < 30) {
    return "very_low";
  }

  if (input.scenarioCount < 6) {
    return "low";
  }

  if (input.belowUsefulThresholdCount > input.scenarioCount / 2) {
    return input.averageScore < 35 ? "very_low" : "low";
  }

  if (input.averageScore >= 55 && input.mediumReadyCount > input.scenarioCount / 2) {
    return "medium";
  }

  if (input.averageScore >= 45) {
    return "low_medium";
  }

  return "low";
}

function stability(input: {
  readonly scores: readonly number[];
  readonly batchConfidence: SandboxDecisionBatchConfidence;
}): SandboxDecisionBatchConfidenceCalibrationModel["recommendationStability"] {
  const minScore = Math.min(...input.scores);
  const maxScore = Math.max(...input.scores);

  if (maxScore - minScore >= 28) {
    return "mixed";
  }

  if (input.batchConfidence === "medium") {
    return "stable_medium";
  }

  if (input.batchConfidence === "low" || input.batchConfidence === "low_medium") {
    return "stable_but_low";
  }

  return "unstable";
}

function distribution(results: readonly SandboxDecisionBatchScenarioResult[]): SandboxDecisionBatchConfidenceDistribution {
  const dist: Record<string, number> = { ...emptyConfidenceDistribution() };

  for (const result of results) {
    dist[result.confidence] = (dist[result.confidence] ?? 0) + 1;
  }

  return {
    very_low: dist.very_low ?? 0,
    low: dist.low ?? 0,
    low_medium: dist.low_medium ?? 0,
    medium: dist.medium ?? 0,
    strong: dist.strong ?? 0,
    very_strong: dist.very_strong ?? 0,
  };
}

function singleChainAsBatchConfidence(confidence: SandboxDecisionEvidenceConfidence): SandboxDecisionBatchConfidence {
  switch (confidence) {
    case "very_low":
      return "very_low";
    case "low":
      return "low";
    case "medium":
    case "strong":
    case "very_strong":
      return "medium";
  }
}

export function calculateSandboxDecisionBatchConfidence(input: {
  readonly scenarioResults: readonly SandboxDecisionBatchScenarioResult[];
  readonly singleChainEvidenceScore: number;
  readonly singleChainConfidence: SandboxDecisionEvidenceConfidence;
}): {
  readonly averageEvidenceScore: number;
  readonly minEvidenceScore: number;
  readonly maxEvidenceScore: number;
  readonly batchConfidence: SandboxDecisionBatchConfidence;
  readonly batchConfidenceLabel: string;
  readonly recommendationStability: SandboxDecisionBatchConfidenceCalibrationModel["recommendationStability"];
  readonly confidenceChangedFromSingleChain: boolean;
  readonly confidenceDistribution: SandboxDecisionBatchConfidenceDistribution;
} {
  const scores = input.scenarioResults.map((result) => clampScore(result.evidenceScore));
  const averageEvidenceScore = average(scores);
  const minEvidenceScore = scores.length === 0 ? 0 : Math.min(...scores);
  const maxEvidenceScore = scores.length === 0 ? 0 : Math.max(...scores);
  const belowUsefulThresholdCount = scores.filter((score) => score < 35).length;
  const mediumReadyCount = scores.filter((score) => score >= 45).length;
  const batchConfidence = confidenceFromAverage({
    averageScore: averageEvidenceScore,
    scenarioCount: scores.length,
    belowUsefulThresholdCount,
    mediumReadyCount,
  });

  return {
    averageEvidenceScore,
    minEvidenceScore,
    maxEvidenceScore,
    batchConfidence,
    batchConfidenceLabel: sandboxDecisionBatchConfidenceLabel(batchConfidence),
    recommendationStability: scores.length === 0
      ? "unstable"
      : stability({ scores, batchConfidence }),
    confidenceChangedFromSingleChain: batchConfidence !== singleChainAsBatchConfidence(input.singleChainConfidence),
    confidenceDistribution: distribution(input.scenarioResults),
  };
}

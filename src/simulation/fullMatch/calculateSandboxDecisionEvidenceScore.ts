import type {
  SandboxDecisionEvidenceConfidence,
  SandboxDecisionEvidenceSignal,
} from "./sandboxDecisionEvidenceCalibration";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function confidenceFromScore(score: number): SandboxDecisionEvidenceConfidence {
  if (score <= 34) {
    return "very_low";
  }

  if (score <= 54) {
    return "low";
  }

  if (score <= 69) {
    return "medium";
  }

  if (score <= 84) {
    return "strong";
  }

  return "very_strong";
}

function confidenceRank(confidence: SandboxDecisionEvidenceConfidence): number {
  switch (confidence) {
    case "very_low":
      return 0;
    case "low":
      return 1;
    case "medium":
      return 2;
    case "strong":
      return 3;
    case "very_strong":
      return 4;
  }
}

function confidenceByRank(rank: number): SandboxDecisionEvidenceConfidence {
  switch (rank) {
    case 0:
      return "very_low";
    case 1:
      return "low";
    case 2:
      return "medium";
    case 3:
      return "strong";
    default:
      return "very_strong";
  }
}

function capConfidence(
  confidence: SandboxDecisionEvidenceConfidence,
  cap: SandboxDecisionEvidenceConfidence,
): SandboxDecisionEvidenceConfidence {
  return confidenceByRank(Math.min(confidenceRank(confidence), confidenceRank(cap)));
}

function hasSignal(signals: readonly SandboxDecisionEvidenceSignal[], signalId: string): boolean {
  return signals.some((signal) => signal.signalId === signalId);
}

export function calculateSandboxDecisionEvidenceScore(input: {
  readonly supportingSignals: readonly SandboxDecisionEvidenceSignal[];
  readonly limitingSignals: readonly SandboxDecisionEvidenceSignal[];
  readonly baseScore?: number;
}): {
  readonly evidenceScore: number;
  readonly positiveWeightTotal: number;
  readonly negativeWeightTotal: number;
  readonly netEvidenceWeight: number;
  readonly confidence: SandboxDecisionEvidenceConfidence;
} {
  const baseScore = input.baseScore ?? 30;
  const positiveWeightTotal = input.supportingSignals.reduce((total, signal) => total + Math.max(0, signal.weight), 0);
  const negativeWeightTotal = input.limitingSignals.reduce((total, signal) => total + Math.max(0, Math.abs(signal.weight)), 0);
  const netEvidenceWeight = positiveWeightTotal - negativeWeightTotal;
  const evidenceScore = clampScore(baseScore + netEvidenceWeight);
  const hasNoBatchConfirmation = hasSignal(input.limitingSignals, "no_batch_confirmation");
  const hasGoalkeeperRecovery = hasSignal(input.limitingSignals, "final_outcome_secured_by_goalkeeper_team");
  let confidence = confidenceFromScore(evidenceScore);

  if (hasNoBatchConfirmation) {
    confidence = capConfidence(confidence, "medium");
  }

  if (hasGoalkeeperRecovery) {
    confidence = capConfidence(confidence, "medium");
  }

  if (hasNoBatchConfirmation && hasGoalkeeperRecovery) {
    confidence = capConfidence(confidence, "low");
  }

  return {
    evidenceScore,
    positiveWeightTotal,
    negativeWeightTotal,
    netEvidenceWeight,
    confidence,
  };
}

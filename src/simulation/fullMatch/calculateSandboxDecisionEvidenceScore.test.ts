import { calculateSandboxDecisionEvidenceScore } from "./calculateSandboxDecisionEvidenceScore";
import type { SandboxDecisionEvidenceSignal } from "./sandboxDecisionEvidenceCalibration";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function supportingSignals(): readonly SandboxDecisionEvidenceSignal[] {
  return [
    { signalId: "dangerous_progression", type: "supporting", label: "danger", value: 64, maxValue: 100, explanation: "danger", weight: 12 },
    { signalId: "half_chance_created", type: "supporting", label: "half", value: 24, maxValue: 100, explanation: "half", weight: 8 },
    { signalId: "shot_candidate_created", type: "supporting", label: "shot", explanation: "shot", weight: 8 },
    { signalId: "adjusted_shot_quality_above_50", type: "supporting", label: "quality", value: 53, maxValue: 100, explanation: "quality", weight: 6 },
    { signalId: "on_target_saved_state", type: "supporting", label: "saved", explanation: "saved", weight: 8 },
    { signalId: "concrete_tactical_test", type: "supporting", label: "test", explanation: "test", weight: 6 },
  ];
}

function limitingSignals(): readonly SandboxDecisionEvidenceSignal[] {
  return [
    { signalId: "shot_saved_by_goalkeeper", type: "limiting", label: "saved", explanation: "saved", weight: -8 },
    { signalId: "goalkeeper_response_score_65", type: "limiting", label: "gk", value: 65, maxValue: 100, explanation: "gk", weight: -6 },
    { signalId: "safe_defensive_rebound", type: "limiting", label: "rebound", value: 4, maxValue: 100, explanation: "rebound", weight: -8 },
    { signalId: "low_second_chance_probability", type: "limiting", label: "second", value: 4, maxValue: 100, explanation: "second", weight: -6 },
    { signalId: "isolated_single_chain", type: "limiting", label: "single", explanation: "single", weight: -4 },
    { signalId: "no_batch_confirmation", type: "limiting", label: "batch", explanation: "batch", weight: -4 },
    { signalId: "final_outcome_secured_by_goalkeeper_team", type: "limiting", label: "outcome", explanation: "outcome", weight: -4 },
  ];
}

export function validateCalculateSandboxDecisionEvidenceScore(): readonly string[] {
  const positiveOnly = calculateSandboxDecisionEvidenceScore({
    supportingSignals: supportingSignals(),
    limitingSignals: [],
  });
  const limitingOnly = calculateSandboxDecisionEvidenceScore({
    supportingSignals: [],
    limitingSignals: limitingSignals(),
  });
  const currentFixture = calculateSandboxDecisionEvidenceScore({
    supportingSignals: supportingSignals(),
    limitingSignals: limitingSignals(),
  });
  const clampedHigh = calculateSandboxDecisionEvidenceScore({
    supportingSignals: [{ signalId: "huge", type: "supporting", label: "huge", explanation: "huge", weight: 500 }],
    limitingSignals: [],
  });
  const clampedLow = calculateSandboxDecisionEvidenceScore({
    supportingSignals: [],
    limitingSignals: [{ signalId: "huge_negative", type: "limiting", label: "huge negative", explanation: "huge negative", weight: -500 }],
  });
  const noBatchOnly = calculateSandboxDecisionEvidenceScore({
    supportingSignals: [{ signalId: "huge", type: "supporting", label: "huge", explanation: "huge", weight: 90 }],
    limitingSignals: [{ signalId: "no_batch_confirmation", type: "limiting", label: "batch", explanation: "batch", weight: -1 }],
  });
  const goalkeeperOnly = calculateSandboxDecisionEvidenceScore({
    supportingSignals: [{ signalId: "huge", type: "supporting", label: "huge", explanation: "huge", weight: 90 }],
    limitingSignals: [{ signalId: "final_outcome_secured_by_goalkeeper_team", type: "limiting", label: "outcome", explanation: "outcome", weight: -1 }],
  });

  assertTest(clampedHigh.evidenceScore === 100, "score must clamp high values to 100.");
  assertTest(clampedLow.evidenceScore === 0, "score must clamp low values to 0.");
  assertTest(positiveOnly.evidenceScore > limitingOnly.evidenceScore, "positive signals must increase score versus limiting-only signals.");
  assertTest(noBatchOnly.confidence === "medium", "no batch confirmation must cap confidence at medium.");
  assertTest(goalkeeperOnly.confidence === "medium", "goalkeeper-team recovery must cap confidence at medium.");
  assertTest(currentFixture.evidenceScore >= 35 && currentFixture.evidenceScore <= 50, "current fixture score must be between 35 and 50.");
  assertTest(currentFixture.confidence === "low", "current fixture confidence must be low.");

  return [
    "score is clamped between 0 and 100",
    "positive signals increase score",
    "limiting signals decrease score",
    "no batch confirmation caps confidence",
    "goalkeeper-team recovery caps confidence",
    "current fixture score is between 35 and 50",
    "current fixture confidence is low",
  ];
}

if (require.main === module) {
  const checks = validateCalculateSandboxDecisionEvidenceScore();

  console.log("calculateSandboxDecisionEvidenceScore tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

import { PressureLevel } from "../../models/match";
import { clampRating } from "../spatial/utils";
import { ChaosOutcome, type ChaosEvaluation, type ChaosEvaluationInput } from "./types";

function pressureModifier(pressureLevel: PressureLevel): number {
  switch (pressureLevel) {
    case PressureLevel.High:
      return 18;
    case PressureLevel.Medium:
      return 8;
    case PressureLevel.Low:
      return 0;
  }
}

function chooseOutcome(input: ChaosEvaluationInput, score: number): ChaosOutcome {
  if (score >= 84 && input.pressureLevel === PressureLevel.High && input.supportQuality < 45) {
    return ChaosOutcome.ForcedTurnover;
  }

  if (score >= 78 && input.pressureLevel === PressureLevel.High) {
    return ChaosOutcome.RushedClearance;
  }

  if (score >= 62 && input.riskLevel >= 65) {
    return ChaosOutcome.PoorDecision;
  }

  if (score >= 58 && input.supportQuality < 52) {
    return ChaosOutcome.SupportFailure;
  }

  if (score >= 50 && input.mental < 58) {
    return ChaosOutcome.TechnicalError;
  }

  return ChaosOutcome.None;
}

export function evaluateChaosOutcome(input: ChaosEvaluationInput): ChaosEvaluation {
  const score = clampRating(
    input.chaosLevel * 0.34 +
      input.riskLevel * 0.18 +
      pressureModifier(input.pressureLevel) +
      (100 - input.tacticalDiscipline) * 0.14 +
      (100 - input.cohesion) * 0.12 +
      (100 - input.mental) * 0.1 +
      (100 - input.freshness) * 0.06 +
      (100 - input.supportQuality) * 0.12,
  );
  const reasons: string[] = [`chaos ${input.chaosLevel}`, `risk ${input.riskLevel}`];

  if (input.pressureLevel !== PressureLevel.Low) {
    reasons.push(`${input.pressureLevel} pressure`);
  }

  if (input.supportQuality < 55) {
    reasons.push("support quality strained");
  }

  if (input.tacticalDiscipline < 60) {
    reasons.push("discipline stretched");
  }

  return {
    score,
    outcome: chooseOutcome(input, score),
    reasons,
  };
}

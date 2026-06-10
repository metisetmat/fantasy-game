import { PressureLevel } from "../../../models/match";
import type { OffensivePhilosophyEvaluationInput } from "../types";

export function evaluateRuptureRisk(input: OffensivePhilosophyEvaluationInput): number {
  return Math.round(
    input.chaosLevel * 0.18 +
      input.offensiveInstructions.riskLevel * 0.12 +
      (input.pressure === PressureLevel.High ? 12 : 0) -
      input.collectiveProperties.tacticalDiscipline * 0.1 -
      input.supportScore * 0.08,
  );
}

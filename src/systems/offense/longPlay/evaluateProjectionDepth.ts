import type { OffensivePhilosophyEvaluationInput } from "../types";

export function evaluateProjectionDepth(input: OffensivePhilosophyEvaluationInput): number {
  return Math.max(0, input.forwardDistance) * 18 + input.offensiveInstructions.verticality * 0.18;
}

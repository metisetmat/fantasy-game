import type { SpatialTeamContext } from "../../spatial";
import type { EmergencyClearanceEvaluation } from "./types";

export function evaluateEmergencyClearance(input: {
  readonly defensiveTeam: SpatialTeamContext;
  readonly chaosLevel: number;
}): EmergencyClearanceEvaluation {
  const clearanceScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        input.defensiveTeam.collectiveProperties.defensiveTransition * 0.28 +
          input.defensiveTeam.collectiveProperties.tacticalDiscipline * 0.24 +
          input.defensiveTeam.collectiveProperties.resilience * 0.2 +
          (100 - input.defensiveTeam.recoverySaturation.score) * 0.18 -
          input.chaosLevel * 0.08,
      ),
    ),
  );

  return {
    clearanceScore,
    reasons: [
      ...(input.defensiveTeam.recoverySaturation.score >= 50 ? ["recovery load makes clearance less reliable"] : []),
      ...(input.chaosLevel >= 70 ? ["chaos reduces clean emergency technique"] : []),
    ],
  };
}

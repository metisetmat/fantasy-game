import { TacticalStyle } from "../../../models/tactics";
import type { SpatialTeamContext } from "../../spatial";
import type { ConversionIdentity } from "../finishing";
import type { ReboundControlEvaluation } from "./types";

export function evaluateReboundControl(input: {
  readonly offensiveTeam: SpatialTeamContext;
  readonly conversionIdentity: ConversionIdentity;
  readonly chaosLevel: number;
}): ReboundControlEvaluation {
  const supportQuality = Math.round(
    input.offensiveTeam.collectiveProperties.cohesion * 0.28 +
      input.offensiveTeam.collectiveProperties.collectiveReading * 0.24 +
      input.offensiveTeam.collectiveProperties.collectiveMobility * 0.2 +
      input.offensiveTeam.tacticalInstructions.offensive.collectiveness * 0.18 +
      input.offensiveTeam.offensiveMomentum.score * 0.1,
  );
  const composure = Math.round(
    input.offensiveTeam.collectiveProperties.tacticalDiscipline * 0.32 +
      input.offensiveTeam.collectiveProperties.resilience * 0.22 +
      input.offensiveTeam.collectiveProperties.cohesion * 0.22 +
      (100 - input.chaosLevel) * 0.12 +
      input.offensiveTeam.offensiveMomentum.score * 0.12,
  );
  const styleBonus = input.offensiveTeam.tacticalStyle === TacticalStyle.Control ? 8 : 0;
  const controlScore = Math.max(0, Math.min(100, Math.round(supportQuality * 0.5 + composure * 0.42 + styleBonus)));

  return {
    controlScore,
    supportQuality,
    composure,
    reasons: [
      ...(input.offensiveTeam.tacticalStyle === TacticalStyle.Control ? ["structured team can form a controlled second wave"] : []),
      ...(input.offensiveTeam.offensiveMomentum.score >= 62 ? ["offensive momentum keeps attackers alive around the rebound"] : []),
      ...(input.chaosLevel >= 70 ? ["chaos makes clean rebound control difficult"] : []),
    ],
  };
}

import type { DensityEvaluation, SpatialTeamContext } from "../../spatial";
import { clampInteractionRating } from "../shared/ratings";
import type {
  BlockManipulationEvaluation,
  ConstructionRiskEvaluation,
  ConstructionSupportEvaluation,
  DefensiveBlockStabilityEvaluation,
} from "./types";

export interface ConstructionRiskInput {
  readonly offensiveTeam: SpatialTeamContext;
  readonly defensiveStability: DefensiveBlockStabilityEvaluation;
  readonly support: ConstructionSupportEvaluation;
  readonly manipulation: BlockManipulationEvaluation;
  readonly density: DensityEvaluation;
}

export function evaluateConstructionRisk(input: ConstructionRiskInput): ConstructionRiskEvaluation {
  const overloadedPressure = clampInteractionRating(Math.min(100, input.density.overloadedZones.length * 14));
  const interceptionThreat = clampInteractionRating(
    input.defensiveStability.blockStability * 0.28 +
      overloadedPressure * 0.18 +
      input.offensiveTeam.tacticalInstructions.offensive.riskLevel * 0.22 +
      (100 - input.support.supportQuality) * 0.2 +
      (100 - input.manipulation.rhythmControl) * 0.12,
  );
  const sterileCirculationRisk = clampInteractionRating(
    input.defensiveStability.centralResistance * 0.32 +
      input.defensiveStability.slideMobility * 0.22 +
      (100 - input.manipulation.widthUsage) * 0.22 +
      (100 - input.offensiveTeam.tacticalInstructions.offensive.verticality) * 0.12 +
      (100 - input.support.circulationQuality) * 0.12,
  );
  const riskScore = clampInteractionRating(interceptionThreat * 0.55 + sterileCirculationRisk * 0.45);

  return {
    riskScore,
    interceptionThreat,
    sterileCirculationRisk,
    breakdown: [
      { label: "interception threat", value: interceptionThreat },
      { label: "sterile circulation risk", value: sterileCirculationRisk },
      { label: "overloaded pressure", value: overloadedPressure },
      { label: "offensive risk level", value: input.offensiveTeam.tacticalInstructions.offensive.riskLevel },
    ],
  };
}

import type { ZoneId } from "../../../core/zones";
import type { OffensiveSpreadEvaluation, SpatialTeamContext, WeakSideEvaluation } from "../../spatial";
import { LaneAvailability } from "../../spatial";
import { clampInteractionRating } from "../shared/ratings";
import type { BlockManipulationEvaluation, ConstructionSupportEvaluation, TerritorialProgressionEvaluation } from "./types";

export interface TerritorialProgressionInput {
  readonly offensiveTeam: SpatialTeamContext;
  readonly offensiveSpread: OffensiveSpreadEvaluation;
  readonly support: ConstructionSupportEvaluation;
  readonly manipulation: BlockManipulationEvaluation;
  readonly weakSide: WeakSideEvaluation;
  readonly activeZone: ZoneId;
  readonly baseTerritorialPressure: number;
}

export function evaluateTerritorialProgression(
  input: TerritorialProgressionInput,
): TerritorialProgressionEvaluation {
  const weakSideOpportunity = clampInteractionRating(
    input.weakSide.exposure * 0.58 +
      (input.weakSide.switchPlayOpportunity === LaneAvailability.Open ? 32 : 10),
  );
  const progressionQuality = clampInteractionRating(
    input.manipulation.manipulationQuality * 0.28 +
      input.support.supportQuality * 0.2 +
      input.offensiveTeam.collectiveProperties.collectiveReading * 0.16 +
      input.offensiveTeam.collectiveProperties.collectiveMobility * 0.14 +
      input.offensiveTeam.tacticalInstructions.offensive.verticality * 0.08 +
      input.offensiveSpread.widthOccupation * 0.08 +
      weakSideOpportunity * 0.06,
  );
  const territorialPressure = clampInteractionRating(
    input.baseTerritorialPressure * 0.42 +
      progressionQuality * 0.36 +
      input.manipulation.widthUsage * 0.12 +
      weakSideOpportunity * 0.1,
  );

  return {
    progressionQuality,
    territorialPressure,
    weakSideOpportunity,
    targetZone: input.weakSide.switchTargetZones[0] ?? input.activeZone,
    breakdown: [
      { label: "progression quality", value: progressionQuality },
      { label: "weak side opportunity", value: weakSideOpportunity },
      { label: "width occupation", value: input.offensiveSpread.widthOccupation },
      { label: "base territorial pressure", value: clampInteractionRating(input.baseTerritorialPressure) },
    ],
  };
}

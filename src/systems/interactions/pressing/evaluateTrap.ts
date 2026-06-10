import type { Rating } from "../../../core/ratings";
import { LateralCorridor, type ZoneId } from "../../../core/zones";
import type { SpatialTeamContext, WeakSideEvaluation } from "../../spatial/types";
import { getZoneParts } from "../../spatial/utils";
import { clampInteractionRating } from "../shared/ratings";

export interface TrapEvaluationInput {
  readonly defensiveTeam: SpatialTeamContext;
  readonly activeZone: ZoneId;
  readonly weakSide: WeakSideEvaluation;
}

export interface TrapEvaluation {
  readonly trapQuality: Rating;
  readonly touchlineTrap: boolean;
  readonly weakSideProtected: boolean;
}

function isWideCorridor(zoneId: ZoneId): boolean {
  const { lateralCorridor } = getZoneParts(zoneId);
  return lateralCorridor === LateralCorridor.LeftCorridor || lateralCorridor === LateralCorridor.RightCorridor;
}

export function evaluateTrap(input: TrapEvaluationInput): TrapEvaluation {
  const touchlineTrap = isWideCorridor(input.activeZone);
  const weakSideProtected = input.weakSide.exposure < 55;
  const trapQuality = clampInteractionRating(
    input.defensiveTeam.tacticalInstructions.defensive.pressingIntensity * 0.3 +
      input.defensiveTeam.tacticalInstructions.defensive.aggressiveness * 0.2 +
      input.defensiveTeam.collectiveProperties.cohesion * 0.2 +
      input.defensiveTeam.collectiveProperties.tacticalDiscipline * 0.15 +
      (touchlineTrap ? 10 : 0) +
      (weakSideProtected ? 15 : -10),
  );

  return {
    trapQuality,
    touchlineTrap,
    weakSideProtected,
  };
}

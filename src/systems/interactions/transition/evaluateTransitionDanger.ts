import type { DensityEvaluation, WeakSideEvaluation } from "../../spatial/types";
import { LaneAvailability } from "../../spatial/types";
import type { DefensiveParticipationEvaluation } from "../../structure";
import { clampInteractionRating } from "../shared/ratings";
import type {
  DefensiveRecoveryEvaluation,
  ProjectionEvaluation,
  TransitionDangerEvaluation,
  TransitionSupportEvaluation,
  TransitionWindow,
} from "./types";
import { DangerLevel } from "./types";

export interface TransitionDangerInput {
  readonly transitionWindow: TransitionWindow;
  readonly projection: ProjectionEvaluation;
  readonly support: TransitionSupportEvaluation;
  readonly defensiveRecovery: DefensiveRecoveryEvaluation;
  readonly defensiveParticipation: DefensiveParticipationEvaluation;
  readonly weakSide: WeakSideEvaluation;
  readonly density: DensityEvaluation;
}

function getDangerLevel(score: number): DangerLevel {
  if (score >= 67) {
    return DangerLevel.High;
  }

  if (score <= 33) {
    return DangerLevel.Low;
  }

  return DangerLevel.Medium;
}

function calculateOpenCorridorScore(input: TransitionDangerInput): number {
  const isolatedWideZones = input.density.isolatedZones.filter((zoneId) =>
    zoneId.endsWith("-CL") || zoneId.endsWith("-CR") || zoneId.endsWith("-HSL") || zoneId.endsWith("-HSR"),
  );

  return clampInteractionRating(Math.min(100, isolatedWideZones.length * 18 + input.weakSide.exposure * 0.35));
}

function calculateAxisExposure(input: TransitionDangerInput): number {
  const centralCells = input.density.cells.filter((cell) => cell.zoneId.endsWith("-C"));
  const averageCentralDefense =
    centralCells.length === 0
      ? 0
      : centralCells.reduce((sum, cell) => sum + cell.defensiveDensity, 0) / centralCells.length;

  return clampInteractionRating(100 - averageCentralDefense + input.defensiveRecovery.defensiveInstability * 0.25);
}

export function evaluateTransitionDanger(input: TransitionDangerInput): TransitionDangerEvaluation {
  const weakSideAttackPotential = clampInteractionRating(
    input.weakSide.exposure * 0.55 +
      (input.weakSide.switchPlayOpportunity === LaneAvailability.Open ? 35 : 10),
  );
  const openCorridorScore = calculateOpenCorridorScore(input);
  const axisExposure = calculateAxisExposure(input);
  const dangerScore = clampInteractionRating(
    input.projection.projectionQuality * 0.28 +
      input.defensiveRecovery.defensiveInstability * 0.2 +
      input.defensiveParticipation.delayedDefenders * 4 +
      input.defensiveParticipation.eliminatedDefenders * 6 -
      input.defensiveParticipation.coveringDefenders * 3 +
      weakSideAttackPotential * 0.18 +
      openCorridorScore * 0.13 +
      input.support.supportAvailability * 0.1 +
      input.transitionWindow.chaos * 0.07,
  );

  return {
    dangerScore,
    dangerLevel: getDangerLevel(dangerScore),
    weakSideAttackPotential,
    openCorridorScore,
    axisExposure,
    breakdown: [
      { label: "projection quality", value: input.projection.projectionQuality },
      { label: "defensive instability", value: input.defensiveRecovery.defensiveInstability },
      { label: "late defenders", value: input.defensiveParticipation.delayedDefenders },
      { label: "covering defenders", value: input.defensiveParticipation.coveringDefenders },
      { label: "weak side attack potential", value: weakSideAttackPotential },
      { label: "open corridors", value: openCorridorScore },
      { label: "support availability", value: input.support.supportAvailability },
      { label: "temporary chaos", value: input.transitionWindow.chaos },
    ],
  };
}

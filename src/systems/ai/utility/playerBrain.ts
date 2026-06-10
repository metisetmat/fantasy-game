import type { PlayerState } from "../../../models/player";
import type { TacticalStyle } from "../../../models/tactics";
import { UtilityActionType } from "./actionTypes";
import { scorePlayerUtility, type UtilityScoreBreakdown } from "./utilityScoring";

export interface PlayerUtilityCandidate {
  readonly player: PlayerState;
  readonly action: UtilityActionType;
  readonly score: number;
  readonly breakdown: UtilityScoreBreakdown;
}

export interface PlayerBrainInput {
  readonly player: PlayerState;
  readonly actions: readonly UtilityActionType[];
  readonly tacticalStyle: TacticalStyle;
  readonly spatialAffordance: number;
  readonly tacticalIntent: number;
  readonly pressure: number;
  readonly perceptionConfidence?: number;
  readonly scanFreshnessTicks?: number;
  readonly awarenessPressureRecognition?: number;
  readonly risk: number;
  readonly cohesion: number;
}

export function scorePlayerBrain(input: PlayerBrainInput): readonly PlayerUtilityCandidate[] {
  return input.actions.map((action) => {
    const breakdown = scorePlayerUtility(input.player, {
      action,
      tacticalStyle: input.tacticalStyle,
      spatialAffordance: input.spatialAffordance,
      tacticalIntent: input.tacticalIntent,
      pressure: input.pressure,
      ...(input.perceptionConfidence === undefined ? {} : { perceptionConfidence: input.perceptionConfidence }),
      ...(input.scanFreshnessTicks === undefined ? {} : { scanFreshnessTicks: input.scanFreshnessTicks }),
      ...(input.awarenessPressureRecognition === undefined ? {} : { awarenessPressureRecognition: input.awarenessPressureRecognition }),
      risk: input.risk,
      cohesion: input.cohesion,
    });

    return {
      player: input.player,
      action,
      score: breakdown.finalScore,
      breakdown,
    };
  });
}

import { TacticalStyle } from "../../../models/tactics";
import type { SpatialTeamContext, WeakSideEvaluation } from "../../spatial";
import { RecoverySaturationLevel } from "../../structure";
import type { ConversionIdentity } from "../finishing";
import type { ScrambleDangerEvaluation } from "./types";

export function evaluateScrambleDanger(input: {
  readonly offensiveTeam: SpatialTeamContext;
  readonly defensiveTeam: SpatialTeamContext;
  readonly weakSide: WeakSideEvaluation;
  readonly conversionIdentity: ConversionIdentity;
  readonly chaosLevel: number;
}): ScrambleDangerEvaluation {
  const styleBonus = input.offensiveTeam.tacticalStyle === TacticalStyle.Blitz ? 14 : input.offensiveTeam.tacticalStyle === TacticalStyle.Control ? 2 : 10;
  const saturationBonus =
    input.defensiveTeam.recoverySaturation.level === RecoverySaturationLevel.Critical
      ? 18
      : input.defensiveTeam.recoverySaturation.level === RecoverySaturationLevel.High
        ? 12
        : input.defensiveTeam.recoverySaturation.level === RecoverySaturationLevel.Medium
          ? 6
          : 0;
  const dangerScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        input.chaosLevel * 0.28 +
          input.weakSide.exposure * 0.26 +
          input.offensiveTeam.offensiveMomentum.score * 0.18 +
          input.offensiveTeam.collectiveProperties.offensiveTransition * 0.12 +
          styleBonus +
          saturationBonus,
      ),
    ),
  );

  return {
    dangerScore,
    label: dangerScore >= 70 ? "HIGH" : dangerScore >= 50 ? "MEDIUM" : "LOW",
    reasons: [
      ...(input.offensiveTeam.tacticalStyle === TacticalStyle.Blitz ? ["BLITZ momentum turns loose rebound into chaotic second attempt"] : []),
      ...(input.weakSide.exposure >= 65 ? ["weak side still exposed"] : []),
      ...(saturationBonus > 0 ? [`defensive recovery saturation ${input.defensiveTeam.recoverySaturation.level}`] : []),
      ...(input.chaosLevel >= 68 ? ["chaotic rebound"] : []),
    ],
  };
}

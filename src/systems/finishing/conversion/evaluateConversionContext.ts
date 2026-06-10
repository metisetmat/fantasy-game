import type { Rating } from "../../../core/ratings";
import { RecoverySaturationLevel } from "../../structure/recoverySaturation";
import type { WeakSideEvaluation } from "../../spatial";
import { clampInteractionRating } from "../../interactions/shared/ratings";
import { FinishingDangerLevel, FinishingContextQuality, type ConversionContextEvaluation } from "./types";

export interface ConversionContextInput {
  readonly dangerLevel: FinishingDangerLevel;
  readonly chaosLevel: number;
  readonly territorialPressure: number;
  readonly weakSide: WeakSideEvaluation;
  readonly defensiveRecoverySaturation: RecoverySaturationLevel;
  readonly defensiveScore: number;
  readonly goalkeeperResponse: number;
}

function getSaturationBonus(level: RecoverySaturationLevel): number {
  switch (level) {
    case RecoverySaturationLevel.Low:
      return 0;
    case RecoverySaturationLevel.Medium:
      return 6;
    case RecoverySaturationLevel.High:
      return 12;
    case RecoverySaturationLevel.Critical:
      return 18;
  }
}

function classifyContext(input: ConversionContextInput, qualityScore: Rating): FinishingContextQuality {
  if (input.chaosLevel >= 72 && input.weakSide.exposure >= 62) {
    return FinishingContextQuality.ChaoticWindow;
  }

  if (
    input.defensiveRecoverySaturation === RecoverySaturationLevel.High ||
    input.defensiveRecoverySaturation === RecoverySaturationLevel.Critical
  ) {
    return FinishingContextQuality.BrokenStructureWindow;
  }

  if (input.goalkeeperResponse >= 72 || input.defensiveScore >= 74) {
    return FinishingContextQuality.LastLineWindow;
  }

  if (qualityScore >= 72) {
    return FinishingContextQuality.CleanWindow;
  }

  if (input.chaosLevel >= 62) {
    return FinishingContextQuality.DesperateWindow;
  }

  return FinishingContextQuality.PressuredWindow;
}

export function evaluateConversionContext(input: ConversionContextInput): ConversionContextEvaluation {
  const dangerBonus = input.dangerLevel === FinishingDangerLevel.High ? 18 : input.dangerLevel === FinishingDangerLevel.Medium ? 8 : 0;
  const saturationBonus = getSaturationBonus(input.defensiveRecoverySaturation);
  const weakSideBonus = input.weakSide.exposure >= 70 ? 12 : input.weakSide.exposure >= 55 ? 6 : 0;
  const chaosWindowBonus = input.chaosLevel >= 70 ? 8 : input.chaosLevel >= 58 ? 4 : 0;
  const protectionPenalty = Math.max(0, input.defensiveScore - 68) * 0.35;
  const qualityScore = clampInteractionRating(
    input.territorialPressure * 0.22 +
      dangerBonus +
      saturationBonus +
      weakSideBonus +
      chaosWindowBonus +
      (100 - input.goalkeeperResponse) * 0.16 -
      protectionPenalty,
  );
  const reasons = [
    ...(input.dangerLevel === FinishingDangerLevel.High ? ["scoring danger HIGH"] : []),
    ...(weakSideBonus > 0 ? ["weak side exposed"] : []),
    ...(saturationBonus > 0 ? ["defensive recovery saturation reduces last-line reliability"] : []),
    ...(chaosWindowBonus > 0 ? ["chaotic finishing window"] : []),
    ...(protectionPenalty > 0 ? ["defensive protection still contests the lane"] : []),
  ];

  return {
    contextQuality: classifyContext(input, qualityScore),
    qualityScore,
    reasons,
    breakdown: [
      { label: "territorial pressure", value: clampInteractionRating(input.territorialPressure) },
      { label: "scoring danger bonus", value: dangerBonus },
      { label: "weak side bonus", value: weakSideBonus },
      { label: "recovery saturation bonus", value: saturationBonus },
      { label: "chaos window bonus", value: chaosWindowBonus },
      { label: "defensive protection cost", value: -Math.round(protectionPenalty) },
    ],
  };
}

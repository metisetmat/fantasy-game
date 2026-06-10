import { clampInteractionRating } from "../../interactions/shared/ratings";
import { ConversionIdentity, FinishingContextQuality, type ConversionContextEvaluation, type FinishingStyleEvaluation } from "./types";

export interface ConversionComposureInput {
  readonly baseComposure: number;
  readonly tacticalDiscipline: number;
  readonly cohesion: number;
  readonly chaosLevel: number;
  readonly style: FinishingStyleEvaluation;
  readonly context: ConversionContextEvaluation;
}

function getContextComposureModifier(context: FinishingContextQuality): number {
  switch (context) {
    case FinishingContextQuality.CleanWindow:
      return 8;
    case FinishingContextQuality.BrokenStructureWindow:
      return 4;
    case FinishingContextQuality.PressuredWindow:
      return -2;
    case FinishingContextQuality.LastLineWindow:
      return -5;
    case FinishingContextQuality.ChaoticWindow:
      return -8;
    case FinishingContextQuality.DesperateWindow:
      return -12;
  }
}

export function evaluateComposure(input: ConversionComposureInput): number {
  const chaosPenalty =
    input.style.identity === ConversionIdentity.ChaoticAggression
      ? input.chaosLevel * 0.06
      : input.chaosLevel * 0.14;

  return clampInteractionRating(
    input.baseComposure * 0.52 +
      input.tacticalDiscipline * 0.18 +
      input.cohesion * 0.14 +
      input.context.qualityScore * 0.08 +
      input.style.composureModifier +
      getContextComposureModifier(input.context.contextQuality) -
      chaosPenalty,
  );
}

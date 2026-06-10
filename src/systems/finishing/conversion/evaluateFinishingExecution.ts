import { ScoringType } from "../../../models/scoring";
import { clampInteractionRating } from "../../interactions/shared/ratings";
import { ConversionIdentity, FinishingContextQuality, type ConversionContextEvaluation, type FinishingStyleEvaluation } from "./types";

export interface FinishingExecutionInput {
  readonly baseExecution: number;
  readonly supportQuality: number;
  readonly offensiveTransition: number;
  readonly scoringType: ScoringType;
  readonly style: FinishingStyleEvaluation;
  readonly context: ConversionContextEvaluation;
}

function getScoringTypeModifier(scoringType: ScoringType, style: FinishingStyleEvaluation): number {
  if (style.identity === ConversionIdentity.ControlledExecution && scoringType === ScoringType.Drop) {
    return 5;
  }

  if (style.identity === ConversionIdentity.ChaoticAggression && scoringType === ScoringType.Try) {
    return 5;
  }

  return 0;
}

function getContextExecutionModifier(context: FinishingContextQuality): number {
  switch (context) {
    case FinishingContextQuality.CleanWindow:
      return 8;
    case FinishingContextQuality.BrokenStructureWindow:
      return 7;
    case FinishingContextQuality.ChaoticWindow:
      return 2;
    case FinishingContextQuality.PressuredWindow:
      return -2;
    case FinishingContextQuality.LastLineWindow:
      return -5;
    case FinishingContextQuality.DesperateWindow:
      return -8;
  }
}

export function evaluateFinishingExecution(input: FinishingExecutionInput): number {
  return clampInteractionRating(
    input.baseExecution * 0.54 +
      input.supportQuality * 0.16 +
      input.offensiveTransition * 0.1 +
      input.context.qualityScore * 0.1 +
      input.style.executionModifier +
      getScoringTypeModifier(input.scoringType, input.style) +
      getContextExecutionModifier(input.context.contextQuality),
  );
}

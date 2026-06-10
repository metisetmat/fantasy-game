import { ChaosOutcome } from "../chaos";
import { SpatialMoveType } from "../spatial/intention";
import {
  EmotionalControl,
  StructuralSupportState,
  TacticalChoiceQuality,
  TechnicalExecution,
  type DecisionDimensionEvaluation,
} from "./types";

export function evaluateDecisionDimensions(input: {
  readonly moveType: SpatialMoveType;
  readonly chaosOutcome: ChaosOutcome;
  readonly supportQuality: number;
  readonly tacticalDangerHigh: boolean;
}): DecisionDimensionEvaluation {
  const tacticalChoice =
    input.moveType === SpatialMoveType.DirectVerticalAttack || input.moveType === SpatialMoveType.Progression
      ? input.tacticalDangerHigh
        ? TacticalChoiceQuality.Good
        : TacticalChoiceQuality.Forced
      : input.tacticalDangerHigh
        ? TacticalChoiceQuality.Forced
        : TacticalChoiceQuality.Good;
  const technicalExecution =
    input.chaosOutcome === ChaosOutcome.TechnicalError || input.chaosOutcome === ChaosOutcome.ForcedTurnover
      ? TechnicalExecution.Bad
      : input.chaosOutcome === ChaosOutcome.None
        ? TechnicalExecution.Clean
        : TechnicalExecution.Imperfect;
  const emotionalControl =
    input.chaosOutcome === ChaosOutcome.RushedClearance || input.chaosOutcome === ChaosOutcome.PoorDecision
      ? EmotionalControl.Rushed
      : input.chaosOutcome === ChaosOutcome.ForcedTurnover
        ? EmotionalControl.Panicked
        : EmotionalControl.Composed;
  const structuralSupport =
    input.supportQuality >= 62
      ? StructuralSupportState.Connected
      : input.supportQuality >= 42
        ? StructuralSupportState.Late
        : StructuralSupportState.Isolated;

  return {
    tacticalChoice,
    technicalExecution,
    emotionalControl,
    structuralSupport,
    reasons: [
      `support quality ${input.supportQuality} / 100`,
      `chaos outcome ${input.chaosOutcome}`,
      `move type ${input.moveType}`,
    ],
  };
}

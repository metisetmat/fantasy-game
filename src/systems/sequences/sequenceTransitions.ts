import { BuildUpPressingOutcome } from "../interactions/shared";
import { DangerLevel, TransitionOutcome } from "../interactions/transition";
import { SequenceInteractionKind, SequenceLevel } from "./types";

export function sequenceLevelFromRating(value: number): SequenceLevel {
  if (value >= 67) {
    return SequenceLevel.High;
  }

  if (value <= 33) {
    return SequenceLevel.Low;
  }

  return SequenceLevel.Medium;
}

export function sequenceLevelFromDangerLevel(dangerLevel: DangerLevel): SequenceLevel {
  switch (dangerLevel) {
    case DangerLevel.High:
      return SequenceLevel.High;
    case DangerLevel.Medium:
      return SequenceLevel.Medium;
    case DangerLevel.Low:
      return SequenceLevel.Low;
  }
}

export function isTransitionTriggeringBuildUpOutcome(outcome: BuildUpPressingOutcome): boolean {
  return (
    outcome === BuildUpPressingOutcome.DangerousTurnover ||
    outcome === BuildUpPressingOutcome.PressBroken ||
    outcome === BuildUpPressingOutcome.WeakSideExposed
  );
}

export function isPossessionStabilizingTransitionOutcome(outcome: TransitionOutcome): boolean {
  return (
    outcome === TransitionOutcome.DelayedTransition ||
    outcome === TransitionOutcome.EmergencyDefensiveRecovery ||
    outcome === TransitionOutcome.StabilizedPossession ||
    outcome === TransitionOutcome.ControlledProgression ||
    outcome === TransitionOutcome.LastDefenderRecovery ||
    outcome === TransitionOutcome.EmergencyBlock
  );
}

export function constructionPendingInteraction(): SequenceInteractionKind {
  return SequenceInteractionKind.OffensiveConstructionPending;
}

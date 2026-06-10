import { SequenceInteractionKind } from "./types";
import type { SequenceTacticalContext } from "./types";

export interface SequenceStateEvaluation {
  readonly readableState: string;
  readonly shouldContinue: boolean;
}

export function evaluateSequenceState(context: SequenceTacticalContext): SequenceStateEvaluation {
  if (context.chaosLevel >= 60 && context.possessionStability !== "HIGH") {
    return {
      readableState: "chaotic tactical flow",
      shouldContinue: true,
    };
  }

  if (context.currentDanger === "HIGH" && context.possessionStability !== "HIGH") {
    return {
      readableState: "danger window still active",
      shouldContinue: true,
    };
  }

  if (context.possessionStability === "HIGH") {
    return {
      readableState: "stabilized possession",
      shouldContinue: false,
    };
  }

  if (context.currentInteraction === SequenceInteractionKind.SequenceSettled) {
    return {
      readableState: "terminal sequence",
      shouldContinue: false,
    };
  }

  return {
    readableState: "balanced tactical flow",
    shouldContinue: true,
  };
}

import type { IsolatedInteractionResult } from "../interactions/shared";
import { ConstructionContextUpdateType, type ConstructionInteractionResult } from "../interactions/construction";
import { TransitionOutcome, type TransitionInteractionResult } from "../interactions/transition";
import { SpatialMoveType } from "../spatial/intention";
import { TacticalPhaseState } from "../tacticalState";
import {
  constructionPendingInteraction,
  isPossessionStabilizingTransitionOutcome,
  isTransitionTriggeringBuildUpOutcome,
} from "./sequenceTransitions";
import { SequenceInteractionKind, type SequenceTacticalContext } from "./types";

export interface DetermineNextInteractionInput {
  readonly context: SequenceTacticalContext;
  readonly buildUpResult: IsolatedInteractionResult | null;
  readonly transitionResult: TransitionInteractionResult | null;
  readonly constructionResult?: ConstructionInteractionResult | null;
}

export function determineNextInteraction(input: DetermineNextInteractionInput): SequenceInteractionKind {
  if (input.constructionResult !== undefined && input.constructionResult !== null) {
    return input.constructionResult.updatedContext.updates.includes(
      ConstructionContextUpdateType.FinishingOpportunityPending,
    )
      ? SequenceInteractionKind.Finishing
      : SequenceInteractionKind.SequenceSettled;
  }

  if (input.transitionResult !== null) {
    if (
      input.context.tacticalPhaseState === TacticalPhaseState.DangerPhase &&
      input.transitionResult.updatedContext.finishingTrigger?.triggered === true
    ) {
      return SequenceInteractionKind.Finishing;
    }

    if (
      (input.transitionResult.updatedContext.moveType === SpatialMoveType.Finishing ||
        input.transitionResult.outcome === TransitionOutcome.ImmediateFinish ||
        input.transitionResult.outcome === TransitionOutcome.ChaoticFinish) &&
      input.transitionResult.updatedContext.finishingTrigger?.triggered === true
    ) {
      return SequenceInteractionKind.Finishing;
    }

    return isPossessionStabilizingTransitionOutcome(input.transitionResult.outcome)
      ? SequenceInteractionKind.OffensiveConstruction
      : SequenceInteractionKind.SequenceSettled;
  }

  if (input.buildUpResult !== null && isTransitionTriggeringBuildUpOutcome(input.buildUpResult.outcome)) {
    return SequenceInteractionKind.OffensiveTransition;
  }

  if (input.context.possessionStability === "HIGH") {
    return constructionPendingInteraction();
  }

  return SequenceInteractionKind.SequenceSettled;
}

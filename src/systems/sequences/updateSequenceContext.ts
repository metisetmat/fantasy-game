import { PressureLevel } from "../../models/match";
import type { IsolatedInteractionResult } from "../interactions/shared";
import type { ConstructionInteractionResult } from "../interactions/construction";
import { ConstructionDangerLevel, ConstructionOutcome } from "../interactions/construction";
import type { FinishingInteractionResult } from "../interactions/finishing";
import { BuildUpPressingOutcome } from "../interactions/shared";
import type { TransitionInteractionResult } from "../interactions/transition";
import { TransitionOutcome } from "../interactions/transition";
import { TacticalPhaseState, phaseFromTransitionOutcome, settlePhaseAfterFinishing } from "../tacticalState";
import { clampInteractionRating } from "../interactions/shared/ratings";
import { sequenceLevelFromDangerLevel, sequenceLevelFromRating } from "./sequenceTransitions";
import {
  SequenceInteractionKind,
  SequenceLevel,
  type SequenceTacticalContext,
} from "./types";

export function updateContextAfterBuildUp(
  context: SequenceTacticalContext,
  result: IsolatedInteractionResult,
): SequenceTacticalContext {
  switch (result.outcome) {
    case BuildUpPressingOutcome.PressBroken:
    case BuildUpPressingOutcome.WeakSideExposed:
      return {
        ...context,
        activeZone: result.updatedContext.activeZone,
        chaosLevel: clampInteractionRating(context.chaosLevel + 28),
        possessionStability: SequenceLevel.Low,
        territorialPressure: clampInteractionRating(context.territorialPressure + 18),
        currentDanger: SequenceLevel.High,
        sequenceMomentum: clampInteractionRating(context.sequenceMomentum + 24),
        weakSideExposure: sequenceLevelFromRating(result.weakSideOpportunity),
        currentInteraction: SequenceInteractionKind.OffensiveTransition,
        pressureLevel: result.pressureLevel,
        tacticalPhaseState: TacticalPhaseState.FragileAttackingControl,
      };
    case BuildUpPressingOutcome.DangerousTurnover:
      return {
        ...context,
        activeZone: result.updatedContext.activeZone,
        chaosLevel: clampInteractionRating(context.chaosLevel + 34),
        possessionStability: SequenceLevel.Low,
        territorialPressure: clampInteractionRating(context.territorialPressure + 24),
        currentDanger: SequenceLevel.High,
        sequenceMomentum: clampInteractionRating(context.sequenceMomentum + 30),
        weakSideExposure: sequenceLevelFromRating(result.weakSideOpportunity),
        currentInteraction: SequenceInteractionKind.OffensiveTransition,
        pressureLevel: PressureLevel.High,
        tacticalPhaseState: TacticalPhaseState.BrokenPlay,
      };
    case BuildUpPressingOutcome.ControlledRecycle:
    case BuildUpPressingOutcome.CleanExit:
      return {
        ...context,
        activeZone: result.updatedContext.activeZone,
        chaosLevel: clampInteractionRating(context.chaosLevel - 12),
        possessionStability: SequenceLevel.High,
        currentDanger: SequenceLevel.Low,
        currentInteraction: SequenceInteractionKind.OffensiveConstructionPending,
        pressureLevel: result.pressureLevel,
        tacticalPhaseState: TacticalPhaseState.StablePossession,
      };
    case BuildUpPressingOutcome.ForcedBackwardPlay:
    case BuildUpPressingOutcome.ForcedClearance:
      return {
        ...context,
        activeZone: result.updatedContext.activeZone,
        chaosLevel: clampInteractionRating(context.chaosLevel + 12),
        possessionStability: SequenceLevel.Low,
        currentDanger: SequenceLevel.Medium,
        currentInteraction: SequenceInteractionKind.SequenceSettled,
        pressureLevel: result.pressureLevel,
        tacticalPhaseState: TacticalPhaseState.Settled,
      };
  }
}

export function updateContextAfterFinishing(
  context: SequenceTacticalContext,
  result: FinishingInteractionResult,
): SequenceTacticalContext {
  return {
    ...context,
    activeZone: result.event.activeZone,
    chaosLevel: result.scoreUpdate === null ? clampInteractionRating(context.chaosLevel + 10) : 0,
    possessionStability: SequenceLevel.Low,
    currentDanger: SequenceLevel.Low,
    sequenceMomentum: result.scoreUpdate === null ? context.sequenceMomentum : 100,
    currentInteraction: SequenceInteractionKind.SequenceSettled,
    tacticalPhaseState: settlePhaseAfterFinishing(result.outcome),
  };
}

export function updateContextAfterConstruction(
  context: SequenceTacticalContext,
  result: ConstructionInteractionResult,
): SequenceTacticalContext {
  if (result.updatedContext.finishingTrigger.triggered) {
    return {
      ...context,
      activeZone: result.updatedContext.activeZone,
      chaosLevel: clampInteractionRating(context.chaosLevel - 8),
      possessionStability: SequenceLevel.Low,
      territorialPressure: result.territorialPressure,
      currentDanger: SequenceLevel.High,
      sequenceMomentum: clampInteractionRating(context.sequenceMomentum + 10),
      weakSideExposure: SequenceLevel.High,
      currentInteraction: SequenceInteractionKind.Finishing,
      tacticalPhaseState: TacticalPhaseState.DangerPhase,
    };
  }

  switch (result.outcome) {
    case ConstructionOutcome.WeakSideCreated:
    case ConstructionOutcome.BlockStretched:
      return {
        ...context,
        activeZone: result.updatedContext.activeZone,
        chaosLevel: clampInteractionRating(context.chaosLevel + 8),
        possessionStability: SequenceLevel.High,
        territorialPressure: result.territorialPressure,
        currentDanger:
          result.dangerLevel === ConstructionDangerLevel.High ? SequenceLevel.High : SequenceLevel.Medium,
        sequenceMomentum: clampInteractionRating(context.sequenceMomentum + 12),
        weakSideExposure: SequenceLevel.High,
        currentInteraction: SequenceInteractionKind.SequenceSettled,
        tacticalPhaseState: result.updatedContext.finishingTrigger.triggered
          ? TacticalPhaseState.DangerPhase
          : TacticalPhaseState.StructuredAttackingControl,
      };
    case ConstructionOutcome.TerritorialProgression:
      return {
        ...context,
        activeZone: result.updatedContext.activeZone,
        chaosLevel: clampInteractionRating(context.chaosLevel - 4),
        possessionStability: SequenceLevel.High,
        territorialPressure: result.territorialPressure,
        currentDanger:
          result.dangerLevel === ConstructionDangerLevel.High ? SequenceLevel.High : SequenceLevel.Medium,
        sequenceMomentum: clampInteractionRating(context.sequenceMomentum + 8),
        weakSideExposure: SequenceLevel.Medium,
        currentInteraction: SequenceInteractionKind.SequenceSettled,
        tacticalPhaseState: result.updatedContext.finishingTrigger.triggered
          ? TacticalPhaseState.DangerPhase
          : TacticalPhaseState.StructuredAttackingControl,
      };
    case ConstructionOutcome.PossessionRecycled:
      return {
        ...context,
        activeZone: result.updatedContext.activeZone,
        chaosLevel: clampInteractionRating(context.chaosLevel - 10),
        possessionStability: SequenceLevel.High,
        territorialPressure: result.territorialPressure,
        currentDanger: SequenceLevel.Low,
        currentInteraction: SequenceInteractionKind.SequenceSettled,
        tacticalPhaseState: TacticalPhaseState.StablePossession,
      };
    case ConstructionOutcome.ConstructionStalled:
    case ConstructionOutcome.ForcedBackwardCirculation:
      return {
        ...context,
        activeZone: result.updatedContext.activeZone,
        chaosLevel: clampInteractionRating(context.chaosLevel + 4),
        possessionStability: SequenceLevel.Medium,
        territorialPressure: result.territorialPressure,
        currentDanger: SequenceLevel.Low,
        sequenceMomentum: clampInteractionRating(context.sequenceMomentum - 8),
        weakSideExposure: SequenceLevel.Low,
        currentInteraction: SequenceInteractionKind.SequenceSettled,
        tacticalPhaseState: TacticalPhaseState.FragileAttackingControl,
      };
    case ConstructionOutcome.DangerousInterception:
      return {
        ...context,
        activeZone: result.updatedContext.activeZone,
        chaosLevel: clampInteractionRating(context.chaosLevel + 22),
        possessionStability: SequenceLevel.Low,
        territorialPressure: result.territorialPressure,
        currentDanger: SequenceLevel.High,
        sequenceMomentum: clampInteractionRating(context.sequenceMomentum - 14),
        currentInteraction: SequenceInteractionKind.SequenceSettled,
        tacticalPhaseState: TacticalPhaseState.BrokenPlay,
      };
  }
}

export function updateContextAfterTransition(
  context: SequenceTacticalContext,
  result: TransitionInteractionResult,
): SequenceTacticalContext {
  switch (result.outcome) {
    case TransitionOutcome.DelayedTransition:
    case TransitionOutcome.EmergencyDefensiveRecovery:
    case TransitionOutcome.StabilizedPossession:
    case TransitionOutcome.ControlledProgression:
      return {
        ...context,
        activeZone: result.updatedContext.activeZone,
        chaosLevel: clampInteractionRating(result.transitionWindow.chaos - 24),
        possessionStability: SequenceLevel.High,
        territorialPressure: clampInteractionRating(context.territorialPressure + 8),
        currentDanger:
          result.outcome === TransitionOutcome.ControlledProgression
            ? SequenceLevel.Medium
            : sequenceLevelFromDangerLevel(result.dangerLevel),
        sequenceMomentum: clampInteractionRating(context.sequenceMomentum - 10),
        currentInteraction: SequenceInteractionKind.OffensiveConstructionPending,
        pressureLevel: result.updatedContext.pressureLevel,
        tacticalPhaseState:
          result.updatedContext.finishingTrigger?.triggered === true
            ? TacticalPhaseState.DangerPhase
            : phaseFromTransitionOutcome(result.outcome),
      };
    case TransitionOutcome.ExplosiveTransition:
    case TransitionOutcome.WeakSideAttack:
    case TransitionOutcome.ImmediateFinish:
    case TransitionOutcome.ChaoticFinish:
    case TransitionOutcome.LiveRebound:
      return {
        ...context,
        activeZone: result.updatedContext.activeZone,
        chaosLevel: result.transitionWindow.chaos,
        possessionStability: SequenceLevel.Low,
        territorialPressure: clampInteractionRating(context.territorialPressure + 20),
        currentDanger: sequenceLevelFromDangerLevel(result.dangerLevel),
        sequenceMomentum: clampInteractionRating(context.sequenceMomentum + 18),
        currentInteraction:
          result.outcome === TransitionOutcome.ImmediateFinish || result.outcome === TransitionOutcome.ChaoticFinish
            ? SequenceInteractionKind.Finishing
            : SequenceInteractionKind.SequenceSettled,
        pressureLevel: result.updatedContext.pressureLevel,
        tacticalPhaseState:
          result.updatedContext.finishingTrigger?.triggered === true
            ? TacticalPhaseState.DangerPhase
            : phaseFromTransitionOutcome(result.outcome),
      };
    case TransitionOutcome.LastDefenderRecovery:
    case TransitionOutcome.EmergencyBlock:
      return {
        ...context,
        activeZone: result.updatedContext.activeZone,
        chaosLevel: clampInteractionRating(result.transitionWindow.chaos + 6),
        possessionStability: SequenceLevel.Medium,
        territorialPressure: clampInteractionRating(context.territorialPressure + 14),
        currentDanger: SequenceLevel.Medium,
        sequenceMomentum: clampInteractionRating(context.sequenceMomentum + 4),
        currentInteraction: SequenceInteractionKind.OffensiveConstructionPending,
        pressureLevel: result.updatedContext.pressureLevel,
        tacticalPhaseState:
          result.updatedContext.finishingTrigger?.triggered === true
            ? TacticalPhaseState.DangerPhase
            : phaseFromTransitionOutcome(result.outcome),
      };
    case TransitionOutcome.OverextendedAttack:
    case TransitionOutcome.TransitionCollapse:
      return {
        ...context,
        activeZone: result.updatedContext.activeZone,
        chaosLevel: clampInteractionRating(context.chaosLevel + 8),
        possessionStability: SequenceLevel.Low,
        currentDanger: SequenceLevel.Medium,
        currentInteraction: SequenceInteractionKind.SequenceSettled,
        pressureLevel: result.updatedContext.pressureLevel,
        tacticalPhaseState: phaseFromTransitionOutcome(result.outcome),
      };
  }
}

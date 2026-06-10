import { FinishingOutcome } from "../interactions/finishing";
import { TransitionOutcome } from "../interactions/transition";
import { TacticalPhaseState } from "./types";

export function settlePhaseAfterFinishing(outcome: FinishingOutcome): TacticalPhaseState {
  if (
    outcome === FinishingOutcome.LiveRebound ||
    outcome === FinishingOutcome.SecondChance ||
    outcome === FinishingOutcome.ScrambleFinish
  ) {
    return TacticalPhaseState.BrokenPlay;
  }

  return TacticalPhaseState.Settled;
}

export function phaseFromTransitionOutcome(outcome: TransitionOutcome): TacticalPhaseState {
  switch (outcome) {
    case TransitionOutcome.ImmediateFinish:
    case TransitionOutcome.ChaoticFinish:
    case TransitionOutcome.LiveRebound:
      return TacticalPhaseState.DangerPhase;
    case TransitionOutcome.ExplosiveTransition:
    case TransitionOutcome.WeakSideAttack:
      return TacticalPhaseState.ChaoticAttackingAdvantage;
    case TransitionOutcome.LastDefenderRecovery:
    case TransitionOutcome.EmergencyBlock:
      return TacticalPhaseState.LastLineSurvival;
    case TransitionOutcome.TransitionCollapse:
    case TransitionOutcome.OverextendedAttack:
      return TacticalPhaseState.TransitionCollapse;
    case TransitionOutcome.ControlledProgression:
    case TransitionOutcome.DelayedTransition:
    case TransitionOutcome.EmergencyDefensiveRecovery:
      return TacticalPhaseState.FragileAttackingControl;
    case TransitionOutcome.StabilizedPossession:
      return TacticalPhaseState.StablePossession;
  }
}

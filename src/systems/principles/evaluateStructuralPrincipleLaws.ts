import { TacticalStyle } from "../../models/tactics";
import type { SpatialTeamContext } from "../spatial";
import { SequenceInteractionKind, SequenceLevel, type SequenceTacticalContext } from "../sequences";
import { StructuralLawIntensity, type StructuralPrincipleLawProfile } from "./types";

function intensity(value: number): StructuralLawIntensity {
  if (value >= 67) {
    return StructuralLawIntensity.High;
  }

  if (value <= 34) {
    return StructuralLawIntensity.Low;
  }

  return StructuralLawIntensity.Medium;
}

export function evaluateStructuralPrincipleLaws(input: {
  readonly team: SpatialTeamContext;
  readonly isPossessionTeam: boolean;
  readonly interaction: SequenceInteractionKind;
  readonly context: SequenceTacticalContext;
}): StructuralPrincipleLawProfile {
  const offensive = input.team.tacticalInstructions.offensive;
  const defensive = input.team.tacticalInstructions.defensive;
  const collective = input.team.collectiveProperties;
  const isControl = input.team.tacticalStyle === TacticalStyle.Control;
  const isBlitz = input.team.tacticalStyle === TacticalStyle.Blitz;
  const dangerBoost = input.context.currentDanger === SequenceLevel.High ? 12 : input.context.currentDanger === SequenceLevel.Medium ? 5 : 0;
  const transitionMode = input.interaction === SequenceInteractionKind.OffensiveTransition;
  const restDefenseSlots = isControl ? 3 : isBlitz ? (transitionMode ? 1 : 2) : 2;
  const depthRunnerCount = isBlitz ? (transitionMode ? 3 : 2) : isControl ? 1 : 2;
  const supportTriangleScore = collective.cohesion * 0.35 + offensive.collectiveness * 0.45 + collective.collectiveReading * 0.2;
  const podScore = collective.collectivePower * 0.28 + offensive.collectiveness * 0.34 + collective.cohesion * 0.24 + (isControl ? 10 : 0);
  const coverShadowScore = defensive.pressingIntensity * 0.35 + collective.tacticalDiscipline * 0.35 + collective.collectiveReading * 0.2;
  const pressingTrapScore = defensive.pressingIntensity * 0.48 + defensive.aggressiveness * 0.28 + collective.collectiveMobility * 0.18;
  const gainLineScore = offensive.verticality * 0.35 + collective.collectivePower * 0.24 + collective.offensiveTransition * 0.26 + dangerBoost;
  const foldScore = collective.defensiveTransition * 0.45 + collective.collectiveMobility * 0.28 + collective.tacticalDiscipline * 0.2 - (isBlitz ? 8 : 0);
  const recycleScore = offensive.collectiveness * 0.25 + collective.cohesion * 0.22 + collective.collectiveReading * 0.22 + collective.collectiveMobility * 0.18;

  return {
    restDefenseSlots,
    attackCorridorTarget: isBlitz ? 5 : isControl ? 4 : 4,
    defensiveCorridorTarget: isBlitz ? 3 : isControl ? 3 : 4,
    depthRunnerCount,
    supportTriangle: intensity(supportTriangleScore),
    podSupport: intensity(podScore),
    staggering: intensity(collective.collectiveMobility * 0.36 + offensive.collectiveness * 0.28 + offensive.verticality * 0.18),
    coverShadow: intensity(coverShadowScore),
    pressingTrap: intensity(pressingTrapScore),
    counterpress: intensity(defensive.pressingIntensity * 0.42 + collective.defensiveTransition * 0.32 + collective.collectiveMobility * 0.18),
    gainLineIntent: intensity(gainLineScore),
    recycleSpeed: intensity(recycleScore),
    foldSpeed: intensity(foldScore),
    collisionDominance: intensity(collective.collectivePower * 0.38 + collective.resilience * 0.24 + collective.offensiveTransition * 0.12),
    structuralRisk: intensity(offensive.riskLevel * 0.45 + offensive.verticality * 0.32 + (isBlitz ? 12 : 0) - (isControl ? 14 : 0)),
    labels: [
      ...(isControl ? ["CONTROL layered rest defense", "support triangle priority", "pod support around carrier"] : []),
      ...(isBlitz ? ["BLITZ depth runners", "line-breaking occupation", "weaker rest-defense tradeoff"] : []),
      transitionMode ? "transition principles active" : "stable phase principles active",
    ],
  };
}

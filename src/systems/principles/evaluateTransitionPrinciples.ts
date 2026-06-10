import type { SpatialTeamContext, WeakSideEvaluation } from "../spatial";
import { BallSpeedState, PrincipleQuality, type AttackingPrinciples, type DefensivePrinciples, type TransitionPrinciples } from "./types";

function quality(value: number): PrincipleQuality {
  if (value >= 67) {
    return PrincipleQuality.Good;
  }

  if (value <= 34) {
    return PrincipleQuality.Poor;
  }

  return PrincipleQuality.Medium;
}

export function evaluateTransitionPrinciples(input: {
  readonly attackingTeam: SpatialTeamContext;
  readonly defendingTeam: SpatialTeamContext;
  readonly attacking: AttackingPrinciples;
  readonly defensive: DefensivePrinciples;
  readonly weakSide: WeakSideEvaluation;
  readonly chaosLevel: number;
}): TransitionPrinciples {
  const readinessBonus = input.defensive.counterpressReadiness === PrincipleQuality.Good ? 18 : 0;
  const counterpressScore =
    input.defendingTeam.tacticalInstructions.defensive.pressingIntensity * 0.35 +
    input.defendingTeam.collectiveProperties.collectiveMobility * 0.25 +
    readinessBonus;
  const attackingChaosScore =
    input.weakSide.exposure * 0.35 +
    input.attackingTeam.tacticalInstructions.offensive.verticality * 0.28 +
    input.chaosLevel * 0.18;
  const secondWaveScore =
    input.attackingTeam.collectiveProperties.cohesion * 0.25 +
    input.attacking.supportBehindBall * 11 +
    input.attackingTeam.tacticalInstructions.offensive.collectiveness * 0.25;
  const recycleScore =
    input.attacking.frontFootBall === BallSpeedState.FrontFoot
      ? 76
      : input.attacking.frontFootBall === BallSpeedState.BackFoot
        ? 34
        : 55;

  return {
    counterpressWindow: quality(counterpressScore),
    defensiveRestDefense: input.defensive.restDefenseIntegrity,
    attackingChaosAdvantage: quality(attackingChaosScore),
    recoveryRace: input.defensive.defensiveFoldSpeed,
    looseBallPressure: quality(counterpressScore * 0.55 + input.chaosLevel * 0.25),
    secondWaveSupport: quality(secondWaveScore),
    recycleSpeed: quality(recycleScore),
    contactDominanceEstimate: quality(input.attackingTeam.collectiveProperties.collectivePower * 0.45 + input.attackingTeam.collectiveProperties.resilience * 0.25),
  };
}

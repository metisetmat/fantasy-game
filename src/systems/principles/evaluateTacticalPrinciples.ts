import type { PressureLevel } from "../../models/match";
import type { BallContext } from "../spatial/intention";
import type { CompactnessEvaluation, SpatialTeamContext, WeakSideEvaluation } from "../spatial";
import type { SideContextEvaluation } from "../spatial/sides";
import { evaluateAttackingPrinciples } from "./evaluateAttackingPrinciples";
import { evaluateDefensivePrinciples } from "./evaluateDefensivePrinciples";
import { evaluateTransitionPrinciples } from "./evaluateTransitionPrinciples";
import type { TacticalPrincipleEvaluation } from "./types";

export function evaluateTacticalPrinciples(input: {
  readonly attackingTeam: SpatialTeamContext;
  readonly defendingTeam: SpatialTeamContext;
  readonly ballContext: BallContext;
  readonly sideContext: SideContextEvaluation;
  readonly weakSide: WeakSideEvaluation;
  readonly defensiveCompactness: CompactnessEvaluation;
  readonly pressure: PressureLevel;
  readonly territorialPressure: number;
  readonly chaosLevel: number;
}): TacticalPrincipleEvaluation {
  const attacking = evaluateAttackingPrinciples({
    team: input.attackingTeam,
    ballContext: input.ballContext,
    sideContext: input.sideContext,
    weakSide: input.weakSide,
    territorialPressure: input.territorialPressure,
    chaosLevel: input.chaosLevel,
  });
  const defensive = evaluateDefensivePrinciples({
    defendingTeam: input.defendingTeam,
    compactness: input.defensiveCompactness,
    sideContext: input.sideContext,
    pressure: input.pressure,
  });
  const transition = evaluateTransitionPrinciples({
    attackingTeam: input.attackingTeam,
    defendingTeam: input.defendingTeam,
    attacking,
    defensive,
    weakSide: input.weakSide,
    chaosLevel: input.chaosLevel,
  });

  return {
    attacking,
    defensive,
    transition,
    baseModifiers: [],
  };
}

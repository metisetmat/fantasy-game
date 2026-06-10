import type { DefensiveParticipationEvaluation, OffensiveParticipationEvaluation } from "../types";
import { NumericalPressureAdvantage, type NumericalPressureEvaluation } from "./types";

export function evaluateNumericalPressure(input: {
  readonly offensiveParticipation: OffensiveParticipationEvaluation;
  readonly defensiveParticipation: DefensiveParticipationEvaluation;
}): NumericalPressureEvaluation {
  const attackersNearBall = Math.max(
    1,
    input.offensiveParticipation.projectingPlayers + input.offensiveParticipation.supportingPlayers,
  );
  const defendersGoalSide = Math.max(
    0,
    input.defensiveParticipation.counts.inStructure + input.defensiveParticipation.counts.covering,
  );
  const supportArrivals = input.offensiveParticipation.supportingPlayers;
  const delayedDefenders =
    input.defensiveParticipation.counts.delayed + input.defensiveParticipation.counts.eliminated;
  const margin = attackersNearBall - defendersGoalSide;
  const advantage =
    margin >= 1 || delayedDefenders >= 3
      ? NumericalPressureAdvantage.Attack
      : margin <= -2
        ? NumericalPressureAdvantage.Defense
        : NumericalPressureAdvantage.Balanced;

  return {
    attackersNearBall,
    defendersGoalSide,
    supportArrivals,
    delayedDefenders,
    advantage,
    description:
      advantage === NumericalPressureAdvantage.Attack
        ? `temporary attacking advantage: ${attackersNearBall}v${defendersGoalSide}`
        : advantage === NumericalPressureAdvantage.Defense
          ? `defensive numbers hold: ${attackersNearBall}v${defendersGoalSide}`
          : `balanced pressure: ${attackersNearBall}v${defendersGoalSide}`,
  };
}

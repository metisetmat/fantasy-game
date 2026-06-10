import { ChaosAdvantage, ChaosOutcome, type ChaosAdvantageEvaluation, type ChaosEvaluation } from "./types";

export function applyChaosAdvantage(input: {
  readonly chaos: ChaosEvaluation;
  readonly advantage: ChaosAdvantageEvaluation;
}): ChaosEvaluation {
  if (
    input.advantage.advantage === ChaosAdvantage.AttackingAdvantage &&
    input.chaos.outcome === ChaosOutcome.RushedClearance
  ) {
    return {
      ...input.chaos,
      outcome: ChaosOutcome.PoorDecision,
      reasons: [...input.chaos.reasons, "chaos favors attack, so clearance becomes forced attacking action"],
    };
  }

  if (
    input.advantage.advantage === ChaosAdvantage.AttackingAdvantage &&
    input.chaos.outcome === ChaosOutcome.ForcedTurnover
  ) {
    return {
      ...input.chaos,
      outcome: ChaosOutcome.TransitionReversal,
      reasons: [...input.chaos.reasons, "attacking chaos keeps the ball alive"],
    };
  }

  return input.chaos;
}

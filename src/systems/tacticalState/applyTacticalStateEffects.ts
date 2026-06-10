import { ChaosOutcome, type ChaosEvaluation } from "../chaos";
import { TacticalPhaseState } from "./types";

export function applyTacticalStateEffects(input: {
  readonly phase: TacticalPhaseState;
  readonly chaos: ChaosEvaluation;
}): ChaosEvaluation {
  if (
    input.phase === TacticalPhaseState.ChaoticAttackingAdvantage &&
    (input.chaos.outcome === ChaosOutcome.ForcedTurnover ||
      input.chaos.outcome === ChaosOutcome.TechnicalError)
  ) {
    return {
      ...input.chaos,
      outcome: ChaosOutcome.SupportFailure,
      reasons: [...input.chaos.reasons, "attacking advantage retains loose-ball danger instead of clean turnover"],
    };
  }

  return input.chaos;
}

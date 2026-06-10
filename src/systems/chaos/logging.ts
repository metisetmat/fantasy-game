import type { TacticalLogLine } from "../interactions/shared";
import { createLogLine } from "../interactions/shared";
import type { ChaosEvaluation } from "./types";
import { ChaosOutcome } from "./types";

function describeConsequence(outcome: ChaosOutcome): string {
  switch (outcome) {
    case ChaosOutcome.None:
      return "structure remains readable";
    case ChaosOutcome.TechnicalError:
      return "technical execution becomes unstable";
    case ChaosOutcome.PoorDecision:
      return "ball carrier forces the next action despite weak structure";
    case ChaosOutcome.SupportFailure:
      return "support line disconnects from the carrier";
    case ChaosOutcome.ForcedTurnover:
      return "pressure creates an immediate turnover risk";
    case ChaosOutcome.RushedClearance:
      return "carrier clears long to avoid an immediate turnover";
    case ChaosOutcome.TransitionReversal:
      return "chaos opens a reverse transition threat";
  }
}

export function createChaosLogs(
  evaluation: ChaosEvaluation,
  input?: {
    readonly teamName: string;
    readonly actor: string;
  },
): readonly TacticalLogLine[] {
  const actorLine =
    input === undefined
      ? []
      : [createLogLine(`${input.teamName} ${input.actor} chaos consequence: ${describeConsequence(evaluation.outcome)}.`)];

  return [
    createLogLine("Chaos check:"),
    createLogLine(`- score: ${evaluation.score} / 100`),
    createLogLine(`- context: ${evaluation.reasons.join(", ")}`),
    createLogLine(`- outcome: ${evaluation.outcome} (${describeConsequence(evaluation.outcome)})`),
    ...actorLine,
  ];
}

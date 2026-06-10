import {
  RuptureOutcome,
  type OffensivePhilosophyEvaluationInput,
} from "../types";
import { evaluateRuptureReward } from "./evaluateRuptureReward";
import { evaluateRuptureRisk } from "./evaluateRuptureRisk";

export interface IndividualRuptureEvaluation {
  readonly reward: number;
  readonly risk: number;
  readonly modifier: number;
  readonly outcome: RuptureOutcome;
}

function chooseRuptureOutcome(reward: number, risk: number): RuptureOutcome {
  if (reward >= risk + 16) {
    return RuptureOutcome.StructureBroken;
  }

  if (reward >= risk + 8) {
    return RuptureOutcome.ChaoticAdvantage;
  }

  if (reward >= risk) {
    return RuptureOutcome.PartialBreak;
  }

  if (risk >= reward + 18) {
    return RuptureOutcome.LostBall;
  }

  if (risk >= reward + 10) {
    return RuptureOutcome.IsolatedCarrier;
  }

  return RuptureOutcome.DrawnDefenders;
}

export function evaluateIndividualRupture(
  input: OffensivePhilosophyEvaluationInput,
): IndividualRuptureEvaluation {
  const reward = evaluateRuptureReward(input);
  const risk = evaluateRuptureRisk(input);

  return {
    reward,
    risk,
    modifier: Math.round((reward - risk) * 0.35),
    outcome: chooseRuptureOutcome(reward, risk),
  };
}

import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { ShotOutcomeContract } from "./shotOutcomeTypes";
import { summarizeShotOutcomeScore } from "./shotOutcomeResolver";

export interface ShotOutcomeValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function validateShotOutcomes(input: {
  readonly result: MiniMatchResult;
  readonly outcomes: readonly ShotOutcomeContract[];
}): ShotOutcomeValidation {
  const summary = summarizeShotOutcomeScore(input);
  const errors = [
    ...(input.outcomes.some((outcome) => outcome.ballOutcome === "PENDING") ? ["pending shot outcome exists"] : []),
    ...(input.outcomes.some((outcome) => outcome.possessionAfterShot === "PENDING") ? ["pending possession after shot exists"] : []),
    ...(input.outcomes.some((outcome) => outcome.ballOutcome === "GOAL" && outcome.scoringImpact.pointsAdded <= 0)
      ? ["goal without scoring impact"]
      : []),
    ...(input.outcomes.some((outcome) => outcome.ballOutcome !== "GOAL" && outcome.scoringImpact.pointsAdded !== 0)
      ? ["non-goal with scoring impact"]
      : []),
    ...(summary.scoreMismatchCount === 0 ? [] : ["final score does not match resolved shot outcomes"]),
  ];

  return {
    valid: errors.length === 0,
    errors,
  };
}

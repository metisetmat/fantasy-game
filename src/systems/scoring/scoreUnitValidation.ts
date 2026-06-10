import type { ScoreUnitContract } from "./scoreUnitTypes";

export interface ScoreUnitValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function validateScoreUnitContract(contract: ScoreUnitContract): ScoreUnitValidation {
  const homeTotal = contract.teamTotals.find((total) => total.teamId === contract.finalScore.homeTeamId);
  const awayTotal = contract.teamTotals.find((total) => total.teamId === contract.finalScore.awayTeamId);
  const errors = [
    ...(contract.scoreUnit === "POINTS" ? [] : ["score unit is not POINTS"]),
    ...((homeTotal?.points ?? -1) === contract.finalScore.homePoints ? [] : ["home points do not match final score"]),
    ...((awayTotal?.points ?? -1) === contract.finalScore.awayPoints ? [] : ["away points do not match final score"]),
    ...(contract.consistencyStatus === "PASS" ? [] : ["score unit contract status is not PASS"]),
  ];

  return {
    valid: errors.length === 0,
    errors,
  };
}

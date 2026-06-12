import { compareReboundSecondChance } from "./compareReboundSecondChance";
import type { ReboundSecondChancePathResult } from "./reboundSecondChanceSandbox";
import { emptyReboundSecondChancePathResult } from "./reboundSecondChanceSandbox";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function path(input: Partial<ReboundSecondChancePathResult> & {
  readonly pathId: "baseline" | "override";
}): ReboundSecondChancePathResult {
  return {
    ...emptyReboundSecondChancePathResult(input.pathId),
    ...input,
  };
}

export function validateCompareReboundSecondChance(): readonly string[] {
  const comparison = compareReboundSecondChance({
    baseline: path({ pathId: "baseline", reboundOutcome: "NO_REBOUND", ballLooseState: "none" }),
    override: path({
      pathId: "override",
      reboundOutcome: "SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE",
      ballLooseState: "safe_area",
      recoveryTeamCandidate: "goalkeeper_team",
      secondChanceProbability: 4,
    }),
  });

  assertTest(comparison.reboundOutcomeDivergenceObserved, "rebound outcome divergence must be observed.");
  assertTest(comparison.ballLooseStateDivergenceObserved, "ball loose state divergence must be observed.");
  assertTest(comparison.recoveryTeamDivergenceObserved, "recovery team divergence must be observed.");
  assertTest(comparison.secondChanceProbabilityObserved, "second chance probability must be observed.");
  assertTest(!comparison.secondChanceCreationDivergenceObserved, "second chance creation divergence should remain false.");
  assertTest(!comparison.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence must remain false.");
  assertTest(!comparison.sandboxScoreDivergenceObserved, "sandbox score divergence must remain false.");
  assertTest(comparison.explanation.includes("diagnostic-only"), "comparison explanation must be coach-readable and diagnostic-only.");

  return [
    "rebound outcome divergence is observed",
    "ball loose and recovery divergence are observed",
    "second chance probability is observed without score/scoring divergence",
  ];
}

if (require.main === module) {
  const checks = validateCompareReboundSecondChance();

  console.log("compareReboundSecondChance tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

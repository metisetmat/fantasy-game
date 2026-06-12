import { compareMultiActionContinuation } from "./compareMultiActionContinuation";
import { emptyMultiActionContinuationPathResult, type MultiActionContinuationPathResult } from "./multiActionContinuationSandbox";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function path(input: Partial<MultiActionContinuationPathResult> & {
  readonly pathId: "baseline" | "override";
}): MultiActionContinuationPathResult {
  return {
    ...emptyMultiActionContinuationPathResult(input.pathId),
    ...input,
  };
}

export function validateCompareMultiActionContinuation(): readonly string[] {
  const comparison = compareMultiActionContinuation({
    baseline: path({
      pathId: "baseline",
      continuationActionType: "NO_CONTINUATION",
      continuationOutcome: "none",
      continuationTeamCandidate: "none",
    }),
    override: path({
      pathId: "override",
      continuationActionType: "GOALKEEPER_TEAM_SECURE_RECOVERY",
      continuationOutcome: "secured_by_goalkeeper_team",
      continuationTeamCandidate: "goalkeeper_team",
      possessionSecurityScore: 82,
      transitionRisk: 18,
      sandboxContinuationCreated: true,
    }),
  });

  assertTest(comparison.continuationActionDivergenceObserved, "continuation action divergence must be observed.");
  assertTest(comparison.continuationOutcomeDivergenceObserved, "continuation outcome divergence must be observed.");
  assertTest(comparison.continuationTeamDivergenceObserved, "continuation team divergence must be observed.");
  assertTest(comparison.possessionSecurityObserved, "possession security must be observed.");
  assertTest(comparison.transitionRiskObserved, "transition risk must be observed.");
  assertTest(!comparison.sandboxMatchEventDivergenceObserved, "sandbox MatchEvent divergence must remain false.");
  assertTest(!comparison.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence must remain false.");
  assertTest(!comparison.sandboxScoreDivergenceObserved, "sandbox score divergence must remain false.");
  assertTest(comparison.explanation.includes("diagnostic-only"), "comparison explanation must be coach-readable and diagnostic-only.");

  return [
    "continuation action, outcome, and team divergence are observed",
    "possession security and transition risk are observed",
    "score/scoring/MatchEvent divergence remains false",
  ];
}

if (require.main === module) {
  const checks = validateCompareMultiActionContinuation();

  console.log("compareMultiActionContinuation tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

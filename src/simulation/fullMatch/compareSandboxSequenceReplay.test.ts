import { compareSandboxSequenceReplay } from "./compareSandboxSequenceReplay";
import { emptySandboxSequenceReplayPath, type SandboxSequenceReplayPath } from "./sandboxSequenceReplay";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function path(input: Partial<SandboxSequenceReplayPath> & Pick<SandboxSequenceReplayPath, "pathId">): SandboxSequenceReplayPath {
  return {
    ...emptySandboxSequenceReplayPath(input.pathId),
    status: "available",
    stepCount: input.stepCount ?? 0,
    finalOutcome: input.finalOutcome ?? "none",
    finalTeamCandidate: input.finalTeamCandidate ?? "none",
    finalZoneCandidate: input.finalZoneCandidate ?? "none",
    sandboxContinuationCreated: input.sandboxContinuationCreated ?? false,
  };
}

export function validateCompareSandboxSequenceReplay(): readonly string[] {
  const comparison = compareSandboxSequenceReplay({
    baseline: path({ pathId: "baseline", stepCount: 9 }),
    override: path({
      pathId: "override",
      stepCount: 9,
      finalOutcome: "secured_by_goalkeeper_team",
      finalTeamCandidate: "goalkeeper_team",
      finalZoneCandidate: "Z3-HSR",
      sandboxContinuationCreated: true,
    }),
  });

  assertTest(!comparison.sequenceStepCountDivergenceObserved, "equal step counts should not create step-count divergence.");
  assertTest(comparison.sequenceOutcomeDivergenceObserved, "different final outcomes should create outcome divergence.");
  assertTest(comparison.sequenceFinalTeamDivergenceObserved, "different final teams should create team divergence.");
  assertTest(comparison.sequenceFinalZoneDivergenceObserved, "different final zones should create zone divergence.");
  assertTest(!comparison.sandboxMatchEventDivergenceObserved, "sandbox MatchEvent counts remain equal at zero.");
  assertTest(!comparison.sandboxScoringEventDivergenceObserved, "sandbox scoring-event counts remain equal at zero.");
  assertTest(!comparison.sandboxScoreDivergenceObserved, "sandbox score deltas remain equal at zero.");
  assertTest(!comparison.officialPossessionDivergenceObserved, "official possession divergence must remain false.");
  assertTest(!comparison.officialTimelineDivergenceObserved, "official timeline divergence must remain false.");

  return [
    "sandbox sequence comparison observes outcome/team/zone divergence",
    "sandbox sequence comparison does not create MatchEvent/scoring/score divergence",
    "official timeline and possession divergence remain false",
  ];
}

if (require.main === module) {
  const checks = validateCompareSandboxSequenceReplay();

  console.log("compareSandboxSequenceReplay tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

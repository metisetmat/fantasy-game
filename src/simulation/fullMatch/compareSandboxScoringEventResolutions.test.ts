import { compareSandboxScoringEventResolutions } from "./compareSandboxScoringEventResolutions";
import { resolveSandboxScoringEventCandidate } from "./resolveSandboxScoringEventCandidate";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCompareSandboxScoringEventResolutions(): readonly string[] {
  const baseline = resolveSandboxScoringEventCandidate({
    pathId: "baseline",
    candidateId: "chain-context-safe-recycle-pv",
    actionType: "SAFE_RECYCLE",
    receiverId: "control-pivot",
    targetZone: "Z2-HSL",
    scoringCandidateType: "NO_SCORING_EVENT",
    scoringCandidateFamily: "none",
    scoringCandidateProbability: 0,
    conversionProbability: 0,
    opportunityType: "no_opportunity",
    routeOutcome: "safe_retention",
  });
  const override = resolveSandboxScoringEventCandidate({
    pathId: "override",
    candidateId: "chain-context-forward-progress-sh",
    actionType: "FORWARD_PROGRESS",
    receiverId: "control-space-hunter",
    targetZone: "Z4-HSR",
    scoringCandidateType: "SHOT_CANDIDATE",
    scoringCandidateFamily: "shot",
    scoringCandidateProbability: 24,
    conversionProbability: 14,
    opportunityType: "half_chance",
    routeOutcome: "dangerous_progression",
  });
  const comparison = compareSandboxScoringEventResolutions({ baseline, override });

  assertTest(comparison.scoringResolutionTypeDivergenceObserved, "resolution type divergence must be observed.");
  assertTest(comparison.shotAttemptCreationDivergenceObserved, "shot attempt divergence must be observed.");
  assertTest(comparison.shotQualityDivergenceObserved, "shot quality divergence must be observed.");
  assertTest(comparison.goalkeeperResponseDivergenceObserved, "goalkeeper response divergence must be observed.");
  assertTest(!comparison.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence must remain false.");
  assertTest(!comparison.sandboxScoreDivergenceObserved, "sandbox score divergence must remain false.");
  assertTest(comparison.explanation.includes("NO_SCORE_ATTEMPT"), "comparison explanation must mention baseline.");
  assertTest(comparison.explanation.includes(override.resolutionType), "comparison explanation must mention override.");
  assertTest(comparison.explanation.includes("does not create official scoring events"), "comparison must mention scoring guard.");

  return [
    "resolution type, shot attempt, shot quality, and goalkeeper divergences are visible",
    "sandbox scoring event and score divergences remain false",
    "comparison explanation names baseline, override, and scoring guard",
  ];
}

if (require.main === module) {
  const checks = validateCompareSandboxScoringEventResolutions();

  console.log("compareSandboxScoringEventResolutions tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

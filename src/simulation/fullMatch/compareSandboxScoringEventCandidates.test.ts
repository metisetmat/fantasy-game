import { compareSandboxScoringEventCandidates } from "./compareSandboxScoringEventCandidates";
import { createSandboxScoringEventCandidate } from "./createSandboxScoringEventCandidate";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateCompareSandboxScoringEventCandidates(): readonly string[] {
  const baseline = createSandboxScoringEventCandidate({
    pathId: "baseline",
    candidateId: "chain-context-safe-recycle-pv",
    actionType: "SAFE_RECYCLE",
    receiverId: "control-pivot",
    targetZone: "Z2-HSL",
    opportunityType: "no_opportunity",
    opportunityFamily: "none",
    opportunityProbability: 5,
    routeOutcome: "safe_retention",
    dangerProbability: 18,
  });
  const override = createSandboxScoringEventCandidate({
    pathId: "override",
    candidateId: "chain-context-forward-progress-sh",
    actionType: "FORWARD_PROGRESS",
    receiverId: "control-space-hunter",
    targetZone: "Z4-HSR",
    opportunityType: "half_chance",
    opportunityFamily: "territorial_danger",
    opportunityProbability: 24,
    routeOutcome: "dangerous_progression",
    dangerProbability: 64,
  });
  const comparison = compareSandboxScoringEventCandidates({ baseline, override });

  assertTest(comparison.scoringCandidateTypeDivergenceObserved, "candidate type divergence must be observed.");
  assertTest(comparison.scoringCandidateFamilyDivergenceObserved, "candidate family divergence must be observed.");
  assertTest(comparison.scoringCandidateProbabilityDivergenceObserved, "candidate probability divergence must be observed.");
  assertTest(comparison.scoringCandidateCreationDivergenceObserved, "candidate creation divergence must be observed.");
  assertTest(comparison.conversionProbabilityDivergenceObserved, "conversion probability divergence must be observed.");
  assertTest(!comparison.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence must remain false.");
  assertTest(!comparison.sandboxScoreDivergenceObserved, "sandbox score divergence must remain false.");
  assertTest(comparison.explanation.includes("NO_SCORING_EVENT"), "comparison explanation must mention baseline.");
  assertTest(comparison.explanation.includes("SHOT_CANDIDATE"), "comparison explanation must mention override.");
  assertTest(comparison.explanation.includes("does not create official scoring events"), "comparison must mention scoring guard.");

  return [
    "candidate type/family/probability/creation/conversion divergences are visible",
    "sandbox scoring event and score divergences remain false",
    "comparison explanation names baseline, override, and scoring guard",
  ];
}

if (require.main === module) {
  const checks = validateCompareSandboxScoringEventCandidates();

  console.log("compareSandboxScoringEventCandidates tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

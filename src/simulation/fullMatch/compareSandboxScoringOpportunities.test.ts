import { compareSandboxScoringOpportunities } from "./compareSandboxScoringOpportunities";
import type { SandboxScoringOpportunityPathResult } from "./sandboxScoringOpportunityModel";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function path(input: {
  readonly pathId: "baseline" | "override";
  readonly opportunityType: SandboxScoringOpportunityPathResult["opportunityType"];
  readonly opportunityFamily: SandboxScoringOpportunityPathResult["opportunityFamily"];
  readonly opportunityProbability: number;
  readonly opportunityCreated: boolean;
}): SandboxScoringOpportunityPathResult {
  return {
    pathId: input.pathId,
    sourceDangerProbability: input.pathId === "baseline" ? 18 : 64,
    sourceScoringOpportunityProbability: input.opportunityProbability,
    turnoverRisk: input.pathId === "baseline" ? 12 : 34,
    receptionQuality: input.pathId === "baseline" ? 86 : 72,
    defensivePressure: input.pathId === "baseline" ? 31 : 58,
    opportunityType: input.opportunityType,
    opportunityFamily: input.opportunityFamily,
    opportunityProbability: input.opportunityProbability,
    opportunityCreated: input.opportunityCreated,
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    canCreateProductionScoringEvent: false,
    tags: [],
    warnings: [],
  };
}

export function validateCompareSandboxScoringOpportunities(): readonly string[] {
  const comparison = compareSandboxScoringOpportunities({
    baseline: path({
      pathId: "baseline",
      opportunityType: "no_opportunity",
      opportunityFamily: "none",
      opportunityProbability: 5,
      opportunityCreated: false,
    }),
    override: path({
      pathId: "override",
      opportunityType: "half_chance",
      opportunityFamily: "territorial_danger",
      opportunityProbability: 24,
      opportunityCreated: true,
    }),
  });

  assertTest(comparison.opportunityTypeDivergenceObserved, "type divergence must be observed.");
  assertTest(comparison.opportunityFamilyDivergenceObserved, "family divergence must be observed.");
  assertTest(comparison.opportunityProbabilityDivergenceObserved, "probability divergence must be observed.");
  assertTest(comparison.opportunityCreationDivergenceObserved, "creation divergence must be observed.");
  assertTest(!comparison.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence must remain false.");
  assertTest(!comparison.sandboxScoreDivergenceObserved, "sandbox score divergence must remain false.");
  assertTest(comparison.explanation.includes("baseline route") && comparison.explanation.includes("override"), "comparison explanation must be coach-readable.");

  return [
    "no_opportunity baseline vs half_chance override creates type divergence",
    "none family vs territorial_danger family creates family divergence",
    "5 vs 24 creates probability divergence",
    "false vs true creates creation divergence",
    "sandbox scoring event and score divergences remain false",
    "comparison explanation is present",
  ];
}

if (require.main === module) {
  const checks = validateCompareSandboxScoringOpportunities();

  console.log("compareSandboxScoringOpportunities tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

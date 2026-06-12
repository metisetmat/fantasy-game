import { compareAttributeDrivenShotResolutions } from "./compareAttributeDrivenShotResolutions";
import type { AttributeDrivenShotResolutionPathResult } from "./attributeDrivenShotResolutionSandbox";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function result(input: {
  readonly pathId: "baseline" | "override";
  readonly outcome: AttributeDrivenShotResolutionPathResult["outcome"];
  readonly shotQuality: number;
  readonly goalkeeperQuality: number;
  readonly scoringEventCreated?: false;
  readonly scoreDelta?: 0;
}): AttributeDrivenShotResolutionPathResult {
  return {
    pathId: input.pathId,
    sourceConversionProbability: input.pathId === "override" ? 14 : 0,
    sourceShotQuality: input.pathId === "override" ? 44 : 0,
    shooter: {},
    goalkeeper: {},
    receptionQuality: input.pathId === "override" ? 72 : 0,
    defensivePressure: input.pathId === "override" ? 58 : 0,
    zoneShotModifier: input.pathId === "override" ? 4 : 0,
    fatigueModifier: input.pathId === "override" ? 3 : 0,
    mentalModifier: input.pathId === "override" ? 3 : 0,
    shooterAttributeScore: input.pathId === "override" ? 70 : 0,
    goalkeeperAttributeScore: input.pathId === "override" ? 78 : 0,
    attributeAdjustedShotQuality: input.shotQuality,
    attributeAdjustedGoalkeeperResponseQuality: input.goalkeeperQuality,
    outcome: input.outcome,
    shotAttemptCreated: input.pathId === "override",
    sandboxScoringEventCreated: input.scoringEventCreated ?? false,
    sandboxScoreDelta: input.scoreDelta ?? 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    canCreateProductionScoringEvent: false,
    factors: ["SANDBOX_ONLY", "PRODUCTION_SCORING_FORBIDDEN"],
    tags: [],
    warnings: [],
  };
}

export function validateCompareAttributeDrivenShotResolutions(): readonly string[] {
  const comparison = compareAttributeDrivenShotResolutions({
    baseline: result({ pathId: "baseline", outcome: "NO_SCORE_ATTEMPT", shotQuality: 0, goalkeeperQuality: 0 }),
    override: result({ pathId: "override", outcome: "SAVED_BY_GK", shotQuality: 53, goalkeeperQuality: 75 }),
  });

  assertTest(comparison.attributeDrivenOutcomeDivergenceObserved, "outcome divergence must be true.");
  assertTest(comparison.shotQualityDivergenceObserved, "shot quality divergence must be true.");
  assertTest(comparison.goalkeeperQualityDivergenceObserved, "goalkeeper quality divergence must be true.");
  assertTest(comparison.attributeInfluenceObserved, "attribute influence must be true.");
  assertTest(!comparison.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence must remain false.");
  assertTest(!comparison.sandboxScoreDivergenceObserved, "sandbox score divergence must remain false.");
  assertTest(comparison.explanation.includes("sandbox-only"), "explanation must be coach-readable and sandbox-only.");

  return [
    "attribute-driven outcome divergence is observed",
    "shot quality divergence is observed",
    "goalkeeper quality divergence is observed",
    "attribute influence is observed",
    "sandbox scoring event divergence remains false",
    "sandbox score divergence remains false",
  ];
}

if (require.main === module) {
  const checks = validateCompareAttributeDrivenShotResolutions();

  console.log("compareAttributeDrivenShotResolutions tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

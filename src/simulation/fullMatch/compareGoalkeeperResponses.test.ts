import { compareGoalkeeperResponses } from "./compareGoalkeeperResponses";
import type { GoalkeeperResponsePathResult } from "./goalkeeperResponseModel";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function pathFixture(input: {
  readonly pathId: "baseline" | "override";
  readonly responseType: GoalkeeperResponsePathResult["responseType"];
  readonly reboundState: GoalkeeperResponsePathResult["reboundState"];
  readonly shotQualityFaced: number;
  readonly goalkeeperResponseScore: number;
  readonly sandboxScoringEventCreated?: false;
  readonly sandboxScoreDelta?: 0;
}): GoalkeeperResponsePathResult {
  return {
    pathId: input.pathId,
    sourceShotQuality: input.shotQualityFaced,
    sourceGoalkeeperResponseQuality: input.goalkeeperResponseScore,
    positioningScore: input.pathId === "override" ? 75 : 0,
    trajectoryReadingScore: input.pathId === "override" ? 74 : 0,
    reactionScore: input.pathId === "override" ? 73 : 0,
    handlingScore: input.pathId === "override" ? 78 : 0,
    reboundControlScore: input.pathId === "override" ? 73 : 0,
    concentrationScore: input.pathId === "override" ? 68 : 0,
    mentalFatigueImpact: input.pathId === "override" ? 8 : 0,
    shotPressureContext: input.pathId === "override" ? 58 : 0,
    shotQualityFaced: input.shotQualityFaced,
    goalkeeperResponseScore: input.goalkeeperResponseScore,
    saveMargin: input.goalkeeperResponseScore - input.shotQualityFaced,
    responseType: input.responseType,
    reboundState: input.reboundState,
    sandboxScoringEventCreated: input.sandboxScoringEventCreated ?? false,
    sandboxScoreDelta: input.sandboxScoreDelta ?? 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    canCreateProductionScoringEvent: false,
    reasons: ["SANDBOX_ONLY", "PRODUCTION_SCORING_FORBIDDEN"],
    tags: [],
    warnings: [],
  };
}

export function validateCompareGoalkeeperResponses(): readonly string[] {
  const comparison = compareGoalkeeperResponses({
    baseline: pathFixture({
      pathId: "baseline",
      responseType: "NOT_APPLICABLE",
      reboundState: "none",
      shotQualityFaced: 0,
      goalkeeperResponseScore: 0,
    }),
    override: pathFixture({
      pathId: "override",
      responseType: "PARRIED_SAVE",
      reboundState: "safe_deflection",
      shotQualityFaced: 53,
      goalkeeperResponseScore: 65,
    }),
  });

  assertTest(comparison.goalkeeperResponseDivergenceObserved, "goalkeeper response divergence must be observed.");
  assertTest(comparison.reboundStateDivergenceObserved, "rebound state divergence must be observed.");
  assertTest(comparison.saveMarginObserved, "save margin must be observed.");
  assertTest(comparison.goalkeeperAttributeInfluenceObserved, "goalkeeper attribute influence must be observed.");
  assertTest(!comparison.sandboxScoringEventDivergenceObserved, "sandbox scoring event divergence must remain false.");
  assertTest(!comparison.sandboxScoreDivergenceObserved, "sandbox score divergence must remain false.");
  assertTest(comparison.explanation.includes("sandbox-only"), "comparison explanation must mention sandbox-only.");

  return [
    "goalkeeper response divergence is observed",
    "rebound state divergence is observed",
    "save margin is observed",
    "goalkeeper attribute influence is observed",
    "sandbox scoring event divergence remains false",
    "sandbox score divergence remains false",
  ];
}

if (require.main === module) {
  const checks = validateCompareGoalkeeperResponses();

  console.log("compareGoalkeeperResponses tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

import { resolveGoalkeeperResponse } from "./resolveGoalkeeperResponse";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateGoalkeeperResponseModel(): readonly string[] {
  const baseline = resolveGoalkeeperResponse({
    pathId: "baseline",
    sourceOutcome: "NO_SCORE_ATTEMPT",
    sourceShotQuality: 0,
    sourceGoalkeeperResponseQuality: 0,
    shotPressureContext: 0,
    positioningScore: 0,
    trajectoryReadingScore: 0,
    reactionScore: 0,
    handlingScore: 0,
    reboundControlScore: 0,
    concentrationScore: 0,
    mentalFatigueImpact: 0,
  });
  const override = resolveGoalkeeperResponse({
    pathId: "override",
    candidateId: "chain-context-forward-progress-sh",
    shooterId: "control-space-hunter",
    goalkeeperId: "blitz-goalkeeper-free-safety",
    targetZone: "Z4-HSR",
    sourceOutcome: "SAVED_BY_GK",
    sourceShotQuality: 53,
    sourceGoalkeeperResponseQuality: 75,
    shotPressureContext: 58,
    positioningScore: 75,
    trajectoryReadingScore: 74,
    reactionScore: 73,
    handlingScore: 78,
    reboundControlScore: 73,
    concentrationScore: 68,
    mentalFatigueImpact: 8,
    goalkeeperRole: "Goalkeeper / Free Safety",
  });

  assertTest(baseline.responseType === "NOT_APPLICABLE", "baseline response type must be NOT_APPLICABLE.");
  assertTest(baseline.reboundState === "none", "baseline rebound state must be none.");
  assertTest(!baseline.sandboxScoringEventCreated, "baseline must not create a sandbox scoring event.");
  assertTest(baseline.sandboxScoreDelta === 0, "baseline score delta must be 0.");
  assertTest(override.shooterId === "control-space-hunter", "override shooter mismatch.");
  assertTest(override.goalkeeperId === "blitz-goalkeeper-free-safety", "override goalkeeper mismatch.");
  assertTest(override.shotQualityFaced === 53, "override shot quality faced mismatch.");
  assertTest(override.goalkeeperResponseScore === 65, "override goalkeeper response score mismatch.");
  assertTest(override.saveMargin === 12, "override save margin mismatch.");
  assertTest(["CLEAN_SAVE", "PARRIED_SAVE"].includes(override.responseType), "override response must be a clean or parried save.");
  assertTest(["held", "safe_deflection"].includes(override.reboundState), "override rebound state must be held or safe_deflection.");
  assertTest(!override.sandboxScoringEventCreated, "override must not create a sandbox scoring event.");
  assertTest(override.sandboxScoreDelta === 0, "override score delta must be 0.");
  assertTest(override.isolatedOnly, "override must remain isolated-only.");
  assertTest(!override.canBecomeOfficialMatchEvent, "override cannot become official MatchEvent.");
  assertTest(!override.canMutateOfficialScore, "override cannot mutate official score.");
  assertTest(!override.canCreateOfficialScoringEvent, "override cannot create official scoring event.");
  assertTest(!override.canCreateProductionScoringEvent, "override cannot create production scoring event.");

  return [
    "baseline response type is NOT_APPLICABLE",
    "baseline rebound state is none",
    "override goalkeeper response uses structured sub-scores",
    "override save margin is positive",
    "override response is CLEAN_SAVE or PARRIED_SAVE",
    "override rebound state is held or safe_deflection",
    "goalkeeper response creates no scoring event and no score delta",
    "goalkeeper response remains isolated-only",
  ];
}

if (require.main === module) {
  const checks = validateGoalkeeperResponseModel();

  console.log("goalkeeperResponseModel tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

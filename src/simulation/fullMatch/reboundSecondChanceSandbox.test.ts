import { resolveReboundSecondChance } from "./resolveReboundSecondChance";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateReboundSecondChanceSandbox(): readonly string[] {
  const baseline = resolveReboundSecondChance({
    pathId: "baseline",
    sourceGoalkeeperResponseType: "NOT_APPLICABLE",
    sourceReboundState: "none",
    sourceShotQualityFaced: 0,
    sourceGoalkeeperResponseScore: 0,
    sourceSaveMargin: 0,
    handlingScore: 0,
    reboundControlScore: 0,
    concentrationScore: 0,
    mentalFatigueImpact: 0,
    attackingProximityScore: 0,
    defensiveRecoveryScore: 0,
  });
  const override = resolveReboundSecondChance({
    pathId: "override",
    candidateId: "chain-context-forward-progress-sh",
    shooterId: "control-space-hunter",
    goalkeeperId: "blitz-goalkeeper-free-safety",
    targetZone: "Z4-HSR",
    sourceGoalkeeperResponseType: "PARRIED_SAVE",
    sourceReboundState: "safe_deflection",
    sourceShotQualityFaced: 53,
    sourceGoalkeeperResponseScore: 65,
    sourceSaveMargin: 12,
    handlingScore: 78,
    reboundControlScore: 73,
    concentrationScore: 68,
    mentalFatigueImpact: 8,
    attackingProximityScore: 61,
    defensiveRecoveryScore: 77,
  });

  assertTest(baseline.reboundOutcome === "NO_REBOUND", "baseline rebound outcome must be NO_REBOUND.");
  assertTest(baseline.ballLooseState === "none", "baseline ball loose state must be none.");
  assertTest(!baseline.secondChanceCreated, "baseline must not create a second chance.");
  assertTest(override.reboundOutcome === "SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE", "override rebound outcome mismatch.");
  assertTest(override.ballLooseState === "safe_area", "override ball loose state mismatch.");
  assertTest(override.recoveryTeamCandidate === "goalkeeper_team", "override recovery team candidate mismatch.");
  assertTest(override.nextSandboxPossessionCandidate === "goalkeeper_team", "override next sandbox possession mismatch.");
  assertTest(override.reboundDangerScore === 4, "override rebound danger score mismatch.");
  assertTest(override.secondChanceProbability === 4, "override second chance probability mismatch.");
  assertTest(!override.secondChanceCreated, "current fixture must not create a second chance.");
  assertTest(!override.sandboxMatchEventCreated, "sandbox rebound must not create a MatchEvent.");
  assertTest(!override.sandboxScoringEventCreated, "sandbox rebound must not create a scoring event.");
  assertTest(override.sandboxScoreDelta === 0, "sandbox rebound score delta must be 0.");

  return [
    "baseline has no rebound",
    "override resolves safe deflection recoverable by defense",
    "current fixture does not create a second chance",
    "sandbox rebound creates no MatchEvent, scoring event, or score delta",
  ];
}

if (require.main === module) {
  const checks = validateReboundSecondChanceSandbox();

  console.log("reboundSecondChanceSandbox tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

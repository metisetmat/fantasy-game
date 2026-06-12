import { resolveMultiActionContinuation } from "./resolveMultiActionContinuation";

function assertTest(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function validateMultiActionContinuationSandbox(): readonly string[] {
  const baseline = resolveMultiActionContinuation({
    pathId: "baseline",
    sourceReboundOutcome: "NO_REBOUND",
    sourceBallLooseState: "none",
    sourceRecoveryTeamCandidate: "none",
    sourceNextSandboxPossessionCandidate: "none",
    sourceReboundDangerScore: 0,
    sourceSecondChanceProbability: 0,
    sourceSecondChanceCreated: false,
    possessionSecurityScore: 0,
    pressureAfterRebound: 0,
    transitionRisk: 0,
  });
  const override = resolveMultiActionContinuation({
    pathId: "override",
    candidateId: "chain-context-forward-progress-sh",
    shooterId: "control-space-hunter",
    goalkeeperId: "blitz-goalkeeper-free-safety",
    targetZone: "Z4-HSR",
    sourceReboundOutcome: "SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE",
    sourceBallLooseState: "safe_area",
    sourceRecoveryTeamCandidate: "goalkeeper_team",
    sourceNextSandboxPossessionCandidate: "goalkeeper_team",
    sourceReboundDangerScore: 4,
    sourceSecondChanceProbability: 4,
    sourceSecondChanceCreated: false,
    continuationActorCandidate: "blitz-goalkeeper-free-safety",
    continuationTargetZoneCandidate: "Z3-HSR",
    possessionSecurityScore: 82,
    pressureAfterRebound: 24,
    transitionRisk: 18,
  });

  assertTest(baseline.continuationActionType === "NO_CONTINUATION", "baseline continuation action must be NO_CONTINUATION.");
  assertTest(baseline.continuationOutcome === "none", "baseline continuation outcome must be none.");
  assertTest(!baseline.sandboxContinuationCreated, "baseline must not create a continuation.");
  assertTest(override.sourceReboundOutcome === "SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE", "override source rebound outcome mismatch.");
  assertTest(override.sourceBallLooseState === "safe_area", "override source ball loose state mismatch.");
  assertTest(override.sourceRecoveryTeamCandidate === "goalkeeper_team", "override recovery team mismatch.");
  assertTest(override.continuationActionType === "GOALKEEPER_TEAM_SECURE_RECOVERY", "override continuation action mismatch.");
  assertTest(override.continuationOutcome === "secured_by_goalkeeper_team", "override continuation outcome mismatch.");
  assertTest(override.continuationTeamCandidate === "goalkeeper_team", "override continuation team mismatch.");
  assertTest(override.continuationActorCandidate === "blitz-goalkeeper-free-safety", "override continuation actor mismatch.");
  assertTest(override.continuationTargetZoneCandidate === "Z3-HSR", "override continuation target zone mismatch.");
  assertTest(override.possessionSecurityScore === 82, "override possession security mismatch.");
  assertTest(override.pressureAfterRebound === 24, "override pressure after rebound mismatch.");
  assertTest(override.transitionRisk === 18, "override transition risk mismatch.");
  assertTest(override.continuationConfidence === 77, "override continuation confidence mismatch.");
  assertTest(override.sandboxContinuationCreated, "override must create a sandbox continuation.");
  assertTest(!override.sandboxMatchEventCreated, "sandbox continuation must not create a MatchEvent.");
  assertTest(!override.sandboxScoringEventCreated, "sandbox continuation must not create a scoring event.");
  assertTest(override.sandboxScoreDelta === 0, "sandbox continuation score delta must be 0.");
  assertTest(!override.canMutateOfficialPossession, "sandbox continuation must not mutate official possession.");
  assertTest(!override.canMutateOfficialTimeline, "sandbox continuation must not mutate official timeline.");

  return [
    "baseline has no continuation",
    "override resolves goalkeeper-team secure recovery",
    "current fixture creates one sandbox-only continuation",
    "sandbox continuation creates no MatchEvent, scoring event, possession mutation, timeline mutation, or score delta",
  ];
}

if (require.main === module) {
  const checks = validateMultiActionContinuationSandbox();

  console.log("multiActionContinuationSandbox tests passed.");
  for (const check of checks) {
    console.log(`- ${check}`);
  }
}

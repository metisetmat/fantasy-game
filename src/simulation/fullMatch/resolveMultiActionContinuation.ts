import type {
  MultiActionContinuationPathResult,
  SandboxContinuationActionType,
  SandboxContinuationOutcome,
  SandboxContinuationReason,
  SandboxContinuationTeamCandidate,
} from "./multiActionContinuationSandbox";

function bounded(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function actionForInput(input: {
  readonly pathId: "baseline" | "override";
  readonly sourceReboundOutcome?: string;
  readonly sourceBallLooseState?: string;
  readonly sourceRecoveryTeamCandidate?: string;
  readonly sourceSecondChanceCreated: boolean;
  readonly sourceSecondChanceProbability: number;
  readonly possessionSecurityScore: number;
  readonly transitionRisk: number;
}): {
  readonly continuationActionType: SandboxContinuationActionType;
  readonly continuationOutcome: SandboxContinuationOutcome;
  readonly continuationTeamCandidate: SandboxContinuationTeamCandidate;
  readonly sandboxContinuationCreated: boolean;
} {
  if (input.pathId === "baseline" || input.sourceReboundOutcome === "NO_REBOUND") {
    return {
      continuationActionType: "NO_CONTINUATION",
      continuationOutcome: "none",
      continuationTeamCandidate: "none",
      sandboxContinuationCreated: false,
    };
  }

  if (
    input.sourceReboundOutcome === "SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE" &&
    input.sourceBallLooseState === "safe_area" &&
    input.sourceRecoveryTeamCandidate === "goalkeeper_team"
  ) {
    return {
      continuationActionType: input.possessionSecurityScore >= 78 ? "GOALKEEPER_TEAM_SECURE_RECOVERY" : "DEFENSIVE_CLEARANCE",
      continuationOutcome: input.possessionSecurityScore >= 78 ? "secured_by_goalkeeper_team" : "cleared_to_safe_zone",
      continuationTeamCandidate: "goalkeeper_team",
      sandboxContinuationCreated: true,
    };
  }

  if (input.sourceSecondChanceCreated || input.sourceSecondChanceProbability >= 50) {
    return {
      continuationActionType: "SECOND_CHANCE_ATTACK",
      continuationOutcome: "attacking_second_chance_window",
      continuationTeamCandidate: "attacking_team",
      sandboxContinuationCreated: true,
    };
  }

  if (input.sourceBallLooseState === "contested") {
    return {
      continuationActionType: "LOOSE_BALL_CONTEST",
      continuationOutcome: "contested_loose_ball",
      continuationTeamCandidate: "contested",
      sandboxContinuationCreated: true,
    };
  }

  if (input.transitionRisk <= 35) {
    return {
      continuationActionType: "SAFE_RESET",
      continuationOutcome: "reset_under_control",
      continuationTeamCandidate: "goalkeeper_team",
      sandboxContinuationCreated: true,
    };
  }

  return {
    continuationActionType: "DEFENSIVE_CLEARANCE",
    continuationOutcome: "cleared_to_safe_zone",
    continuationTeamCandidate: "goalkeeper_team",
    sandboxContinuationCreated: true,
  };
}

function reasonsForInput(input: {
  readonly sourceReboundOutcome?: string;
  readonly sourceBallLooseState?: string;
  readonly sourceRecoveryTeamCandidate?: string;
  readonly sourceSecondChanceCreated: boolean;
  readonly sourceSecondChanceProbability: number;
  readonly possessionSecurityScore: number;
  readonly transitionRisk: number;
}): readonly SandboxContinuationReason[] {
  return [
    ...(input.sourceReboundOutcome === "NO_REBOUND" ? ["NO_REBOUND" as const] : []),
    ...(input.sourceReboundOutcome === "SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE" || input.sourceReboundOutcome === "SAFE_DEFLECTION" ? ["SAFE_DEFLECTION" as const] : []),
    ...(input.sourceRecoveryTeamCandidate === "goalkeeper_team" ? ["RECOVERY_TEAM_GOALKEEPER_TEAM" as const] : []),
    ...(input.possessionSecurityScore >= 60 ? ["DEFENSIVE_RECOVERY_ADVANTAGE" as const] : []),
    ...(input.sourceSecondChanceProbability < 30 ? ["SECOND_CHANCE_PROBABILITY_LOW" as const] : []),
    ...(input.sourceSecondChanceCreated ? ["SECOND_CHANCE_WINDOW_CREATED" as const] : ["ATTACKING_PROXIMITY_SUPPRESSED" as const]),
    ...(input.sourceBallLooseState === "safe_area" ? ["SAFE_AREA" as const] : []),
    ...(input.sourceBallLooseState === "contested" ? ["CONTESTED_AREA" as const] : []),
    ...(input.sourceBallLooseState === "danger_zone" ? ["DANGER_ZONE" as const] : []),
    "SANDBOX_ONLY",
    "PRODUCTION_SCORING_FORBIDDEN",
  ];
}

export function resolveMultiActionContinuation(input: {
  readonly pathId: "baseline" | "override";
  readonly candidateId?: string;
  readonly shooterId?: string;
  readonly goalkeeperId?: string;
  readonly targetZone?: string;
  readonly sourceReboundOutcome?: string;
  readonly sourceBallLooseState?: string;
  readonly sourceRecoveryTeamCandidate?: string;
  readonly sourceNextSandboxPossessionCandidate?: string;
  readonly sourceReboundDangerScore: number;
  readonly sourceSecondChanceProbability: number;
  readonly sourceSecondChanceCreated: boolean;
  readonly continuationActorCandidate?: string;
  readonly continuationTargetZoneCandidate?: string;
  readonly possessionSecurityScore: number;
  readonly pressureAfterRebound: number;
  readonly transitionRisk: number;
}): MultiActionContinuationPathResult {
  const action = actionForInput({
    pathId: input.pathId,
    ...(input.sourceReboundOutcome === undefined ? {} : { sourceReboundOutcome: input.sourceReboundOutcome }),
    ...(input.sourceBallLooseState === undefined ? {} : { sourceBallLooseState: input.sourceBallLooseState }),
    ...(input.sourceRecoveryTeamCandidate === undefined ? {} : { sourceRecoveryTeamCandidate: input.sourceRecoveryTeamCandidate }),
    sourceSecondChanceCreated: input.sourceSecondChanceCreated,
    sourceSecondChanceProbability: input.sourceSecondChanceProbability,
    possessionSecurityScore: input.possessionSecurityScore,
    transitionRisk: input.transitionRisk,
  });
  const continuationConfidence = input.pathId === "baseline"
    ? 0
    : bounded(
      input.possessionSecurityScore * 0.55 +
      (100 - input.transitionRisk) * 0.25 +
      (100 - input.pressureAfterRebound) * 0.15 -
      input.sourceSecondChanceProbability * 0.1,
    );

  return {
    pathId: input.pathId,
    ...(input.candidateId === undefined ? {} : { candidateId: input.candidateId }),
    ...(input.shooterId === undefined ? {} : { shooterId: input.shooterId }),
    ...(input.goalkeeperId === undefined ? {} : { goalkeeperId: input.goalkeeperId }),
    ...(input.targetZone === undefined ? {} : { targetZone: input.targetZone }),
    ...(input.sourceReboundOutcome === undefined ? {} : { sourceReboundOutcome: input.sourceReboundOutcome }),
    ...(input.sourceBallLooseState === undefined ? {} : { sourceBallLooseState: input.sourceBallLooseState }),
    ...(input.sourceRecoveryTeamCandidate === undefined ? {} : { sourceRecoveryTeamCandidate: input.sourceRecoveryTeamCandidate }),
    ...(input.sourceNextSandboxPossessionCandidate === undefined ? {} : { sourceNextSandboxPossessionCandidate: input.sourceNextSandboxPossessionCandidate }),
    sourceReboundDangerScore: input.sourceReboundDangerScore,
    sourceSecondChanceProbability: input.sourceSecondChanceProbability,
    sourceSecondChanceCreated: input.sourceSecondChanceCreated,
    continuationActionType: action.continuationActionType,
    continuationOutcome: action.continuationOutcome,
    continuationTeamCandidate: action.continuationTeamCandidate,
    ...(input.continuationActorCandidate === undefined ? {} : { continuationActorCandidate: input.continuationActorCandidate }),
    ...(input.continuationTargetZoneCandidate === undefined ? {} : { continuationTargetZoneCandidate: input.continuationTargetZoneCandidate }),
    possessionSecurityScore: input.pathId === "baseline" ? 0 : input.possessionSecurityScore,
    pressureAfterRebound: input.pathId === "baseline" ? 0 : input.pressureAfterRebound,
    transitionRisk: input.pathId === "baseline" ? 0 : input.transitionRisk,
    continuationConfidence,
    sandboxContinuationCreated: action.sandboxContinuationCreated,
    sandboxMatchEventCreated: false,
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    canCreateProductionScoringEvent: false,
    canMutateOfficialPossession: false,
    canMutateOfficialTimeline: false,
    reasons: reasonsForInput({
      ...(input.sourceReboundOutcome === undefined ? {} : { sourceReboundOutcome: input.sourceReboundOutcome }),
      ...(input.sourceBallLooseState === undefined ? {} : { sourceBallLooseState: input.sourceBallLooseState }),
      ...(input.sourceRecoveryTeamCandidate === undefined ? {} : { sourceRecoveryTeamCandidate: input.sourceRecoveryTeamCandidate }),
      sourceSecondChanceCreated: input.sourceSecondChanceCreated,
      sourceSecondChanceProbability: input.sourceSecondChanceProbability,
      possessionSecurityScore: input.possessionSecurityScore,
      transitionRisk: input.transitionRisk,
    }),
    tags: [
      `multi_action_continuation_${input.pathId}_action_${action.continuationActionType}`,
      `multi_action_continuation_${input.pathId}_outcome_${action.continuationOutcome}`,
      `multi_action_continuation_${input.pathId}_team_${action.continuationTeamCandidate}`,
      `multi_action_continuation_${input.pathId}_created_${action.sandboxContinuationCreated ? "true" : "false"}`,
      `multi_action_continuation_${input.pathId}_security_${input.pathId === "baseline" ? 0 : input.possessionSecurityScore}`,
      `multi_action_continuation_${input.pathId}_pressure_${input.pathId === "baseline" ? 0 : input.pressureAfterRebound}`,
      `multi_action_continuation_${input.pathId}_transition_risk_${input.pathId === "baseline" ? 0 : input.transitionRisk}`,
      `multi_action_continuation_${input.pathId}_confidence_${continuationConfidence}`,
    ],
    warnings: [],
  };
}

import type {
  BallLooseState,
  ReboundOutcome,
  ReboundSecondChancePathResult,
  ReboundSecondChanceReason,
  SandboxRecoveryTeamCandidate,
} from "./reboundSecondChanceSandbox";

function bounded(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function outcomeForInput(input: {
  readonly pathId: "baseline" | "override";
  readonly sourceGoalkeeperResponseType?: string;
  readonly sourceReboundState?: string;
  readonly sourceSaveMargin: number;
  readonly reboundControlScore: number;
  readonly handlingScore: number;
  readonly attackingProximityScore: number;
  readonly defensiveRecoveryScore: number;
  readonly secondChanceProbability: number;
}): {
  readonly reboundOutcome: ReboundOutcome;
  readonly ballLooseState: BallLooseState;
  readonly recoveryTeamCandidate: SandboxRecoveryTeamCandidate;
  readonly nextSandboxPossessionCandidate: SandboxRecoveryTeamCandidate;
  readonly secondChanceCreated: boolean;
} {
  if (input.pathId === "baseline" || input.sourceGoalkeeperResponseType === "NOT_APPLICABLE") {
    return {
      reboundOutcome: "NO_REBOUND",
      ballLooseState: "none",
      recoveryTeamCandidate: "none",
      nextSandboxPossessionCandidate: "none",
      secondChanceCreated: false,
    };
  }

  if (input.sourceGoalkeeperResponseType === "CLEAN_SAVE" || input.sourceReboundState === "held") {
    return {
      reboundOutcome: "HELD_BALL",
      ballLooseState: "held_by_goalkeeper",
      recoveryTeamCandidate: "goalkeeper_team",
      nextSandboxPossessionCandidate: "goalkeeper_team",
      secondChanceCreated: false,
    };
  }

  if (
    input.sourceGoalkeeperResponseType === "PARRIED_SAVE" &&
    input.sourceReboundState === "safe_deflection" &&
    input.reboundControlScore >= 70 &&
    input.handlingScore >= 70 &&
    input.sourceSaveMargin > 0
  ) {
    return {
      reboundOutcome: "SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE",
      ballLooseState: "safe_area",
      recoveryTeamCandidate: "goalkeeper_team",
      nextSandboxPossessionCandidate: "goalkeeper_team",
      secondChanceCreated: false,
    };
  }

  if (
    input.sourceGoalkeeperResponseType === "PARRIED_SAVE" &&
    input.sourceReboundState === "safe_deflection" &&
    input.reboundControlScore >= 55
  ) {
    return {
      reboundOutcome: "SAFE_DEFLECTION",
      ballLooseState: "contested",
      recoveryTeamCandidate: "contested",
      nextSandboxPossessionCandidate: "contested",
      secondChanceCreated: false,
    };
  }

  if (input.secondChanceProbability >= 50 && input.attackingProximityScore > input.defensiveRecoveryScore) {
    return {
      reboundOutcome: "SECOND_CHANCE_WINDOW",
      ballLooseState: "attacker_favored",
      recoveryTeamCandidate: "attacking_team",
      nextSandboxPossessionCandidate: "attacking_team",
      secondChanceCreated: true,
    };
  }

  if (input.defensiveRecoveryScore >= input.attackingProximityScore + 8) {
    return {
      reboundOutcome: "DEFENSIVE_CLEARANCE",
      ballLooseState: "defender_favored",
      recoveryTeamCandidate: "goalkeeper_team",
      nextSandboxPossessionCandidate: "goalkeeper_team",
      secondChanceCreated: false,
    };
  }

  return {
    reboundOutcome: "DANGEROUS_REBOUND",
    ballLooseState: "danger_zone",
    recoveryTeamCandidate: "contested",
    nextSandboxPossessionCandidate: "contested",
    secondChanceCreated: input.secondChanceProbability >= 50,
  };
}

function reasonsForInput(input: {
  readonly sourceGoalkeeperResponseType?: string;
  readonly sourceReboundState?: string;
  readonly reboundControlScore: number;
  readonly handlingScore: number;
  readonly attackingProximityScore: number;
  readonly defensiveRecoveryScore: number;
  readonly secondChanceCreated: boolean;
}): readonly ReboundSecondChanceReason[] {
  return [
    ...(input.sourceGoalkeeperResponseType === "NOT_APPLICABLE" ? ["NO_SAVE_REQUIRED" as const] : []),
    ...(input.sourceGoalkeeperResponseType === "CLEAN_SAVE" ? ["CLEAN_SAVE_HELD" as const] : []),
    ...(input.sourceGoalkeeperResponseType === "PARRIED_SAVE" ? ["PARRIED_SAVE" as const] : []),
    ...(input.sourceReboundState === "safe_deflection" ? ["SAFE_DEFLECTION" as const] : []),
    ...(input.reboundControlScore >= 70 ? ["REBOUND_CONTROL_STRONG" as const] : []),
    ...(input.reboundControlScore > 0 && input.reboundControlScore < 55 ? ["REBOUND_CONTROL_WEAK" as const] : []),
    ...(input.handlingScore >= 70 ? ["HANDLING_STRONG" as const] : []),
    ...(input.handlingScore > 0 && input.handlingScore < 55 ? ["HANDLING_WEAK" as const] : []),
    ...(input.defensiveRecoveryScore >= input.attackingProximityScore ? ["DEFENSIVE_RECOVERY_ADVANTAGE" as const] : ["ATTACKING_PROXIMITY_ADVANTAGE" as const]),
    input.secondChanceCreated ? "SECOND_CHANCE_CREATED" : "SECOND_CHANCE_SUPPRESSED",
    "SANDBOX_ONLY",
    "PRODUCTION_SCORING_FORBIDDEN",
  ];
}

export function resolveReboundSecondChance(input: {
  readonly pathId: "baseline" | "override";
  readonly candidateId?: string;
  readonly shooterId?: string;
  readonly goalkeeperId?: string;
  readonly targetZone?: string;
  readonly sourceGoalkeeperResponseType?: string;
  readonly sourceReboundState?: string;
  readonly sourceShotQualityFaced: number;
  readonly sourceGoalkeeperResponseScore: number;
  readonly sourceSaveMargin: number;
  readonly handlingScore: number;
  readonly reboundControlScore: number;
  readonly concentrationScore: number;
  readonly mentalFatigueImpact: number;
  readonly attackingProximityScore: number;
  readonly defensiveRecoveryScore: number;
}): ReboundSecondChancePathResult {
  const reboundControlModifier = input.reboundControlScore * 0.42;
  const handlingModifier = input.handlingScore * 0.24;
  const defensiveRecoveryModifier = input.defensiveRecoveryScore * 0.18;
  const attackingProximityModifier = input.attackingProximityScore * 0.22;
  const reboundDangerScore = input.pathId === "baseline"
    ? 0
    : bounded(
      input.sourceShotQualityFaced +
      attackingProximityModifier -
      reboundControlModifier -
      handlingModifier -
      defensiveRecoveryModifier +
      input.mentalFatigueImpact * 0.5 -
      Math.max(0, input.sourceSaveMargin) * 0.3,
    );
  const secondChanceProbability = input.pathId === "baseline"
    ? 0
    : bounded(reboundDangerScore + input.attackingProximityScore * 0.25 - input.defensiveRecoveryScore * 0.2);
  const outcome = outcomeForInput({
    pathId: input.pathId,
    ...(input.sourceGoalkeeperResponseType === undefined ? {} : { sourceGoalkeeperResponseType: input.sourceGoalkeeperResponseType }),
    ...(input.sourceReboundState === undefined ? {} : { sourceReboundState: input.sourceReboundState }),
    sourceSaveMargin: input.sourceSaveMargin,
    reboundControlScore: input.reboundControlScore,
    handlingScore: input.handlingScore,
    attackingProximityScore: input.attackingProximityScore,
    defensiveRecoveryScore: input.defensiveRecoveryScore,
    secondChanceProbability,
  });

  return {
    pathId: input.pathId,
    ...(input.candidateId === undefined ? {} : { candidateId: input.candidateId }),
    ...(input.shooterId === undefined ? {} : { shooterId: input.shooterId }),
    ...(input.goalkeeperId === undefined ? {} : { goalkeeperId: input.goalkeeperId }),
    ...(input.targetZone === undefined ? {} : { targetZone: input.targetZone }),
    ...(input.sourceGoalkeeperResponseType === undefined ? {} : { sourceGoalkeeperResponseType: input.sourceGoalkeeperResponseType }),
    ...(input.sourceReboundState === undefined ? {} : { sourceReboundState: input.sourceReboundState }),
    sourceShotQualityFaced: input.sourceShotQualityFaced,
    sourceGoalkeeperResponseScore: input.sourceGoalkeeperResponseScore,
    sourceSaveMargin: input.sourceSaveMargin,
    handlingScore: input.handlingScore,
    reboundControlScore: input.reboundControlScore,
    concentrationScore: input.concentrationScore,
    mentalFatigueImpact: input.mentalFatigueImpact,
    attackingProximityScore: input.attackingProximityScore,
    defensiveRecoveryScore: input.defensiveRecoveryScore,
    reboundDangerScore,
    secondChanceProbability,
    reboundOutcome: outcome.reboundOutcome,
    ballLooseState: outcome.ballLooseState,
    recoveryTeamCandidate: outcome.recoveryTeamCandidate,
    nextSandboxPossessionCandidate: outcome.nextSandboxPossessionCandidate,
    secondChanceCreated: outcome.secondChanceCreated,
    sandboxMatchEventCreated: false,
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    canCreateProductionScoringEvent: false,
    canMutateOfficialPossession: false,
    reasons: reasonsForInput({
      ...(input.sourceGoalkeeperResponseType === undefined ? {} : { sourceGoalkeeperResponseType: input.sourceGoalkeeperResponseType }),
      ...(input.sourceReboundState === undefined ? {} : { sourceReboundState: input.sourceReboundState }),
      reboundControlScore: input.reboundControlScore,
      handlingScore: input.handlingScore,
      attackingProximityScore: input.attackingProximityScore,
      defensiveRecoveryScore: input.defensiveRecoveryScore,
      secondChanceCreated: outcome.secondChanceCreated,
    }),
    tags: [
      `rebound_second_chance_${input.pathId}_outcome_${outcome.reboundOutcome}`,
      `rebound_second_chance_${input.pathId}_ball_loose_${outcome.ballLooseState}`,
      `rebound_second_chance_${input.pathId}_recovery_team_${outcome.recoveryTeamCandidate}`,
      `rebound_second_chance_${input.pathId}_next_possession_${outcome.nextSandboxPossessionCandidate}`,
      `rebound_second_chance_${input.pathId}_danger_${reboundDangerScore}`,
      `rebound_second_chance_${input.pathId}_probability_${secondChanceProbability}`,
      `rebound_second_chance_${input.pathId}_created_${outcome.secondChanceCreated ? "true" : "false"}`,
    ],
    warnings: [],
  };
}

import type {
  GoalkeeperReboundState,
  GoalkeeperResponsePathResult,
  GoalkeeperResponseReason,
  GoalkeeperResponseType,
} from "./goalkeeperResponseModel";

function bounded(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function weightedGoalkeeperScore(input: {
  readonly sourceGoalkeeperResponseQuality: number;
  readonly positioningScore: number;
  readonly trajectoryReadingScore: number;
  readonly reactionScore: number;
  readonly handlingScore: number;
  readonly reboundControlScore: number;
  readonly concentrationScore: number;
  readonly mentalFatigueImpact: number;
  readonly shotPressureContext: number;
}): number {
  const attributeScore =
    input.positioningScore * 0.18 +
    input.trajectoryReadingScore * 0.18 +
    input.reactionScore * 0.2 +
    input.handlingScore * 0.18 +
    input.reboundControlScore * 0.12 +
    input.concentrationScore * 0.14;
  const pressureModifier = input.shotPressureContext >= 70
    ? -4
    : input.shotPressureContext >= 55
      ? -1
      : 2;

  return bounded(
    attributeScore * 0.65 +
      input.sourceGoalkeeperResponseQuality * 0.35 +
      pressureModifier -
      input.mentalFatigueImpact,
    0,
    100,
  );
}

function responseClassification(input: {
  readonly sourceOutcome?: string;
  readonly sourceShotQuality: number;
  readonly shotQualityFaced: number;
  readonly saveMargin: number;
  readonly positioningScore: number;
  readonly reactionScore: number;
  readonly handlingScore: number;
  readonly reboundControlScore: number;
}): {
  readonly responseType: GoalkeeperResponseType;
  readonly reboundState: GoalkeeperReboundState;
} {
  if (input.sourceOutcome === "NO_SCORE_ATTEMPT" || input.sourceShotQuality <= 0 || input.shotQualityFaced <= 0) {
    return {
      responseType: "NOT_APPLICABLE",
      reboundState: "none",
    };
  }

  if (input.saveMargin < 0) {
    return {
      responseType: "SANDBOX_GOAL_CANDIDATE",
      reboundState: "goal_candidate",
    };
  }

  if (input.positioningScore < 55 && input.shotQualityFaced >= 50) {
    return {
      responseType: "POSITIONING_ERROR",
      reboundState: "goal_candidate",
    };
  }

  if (input.reactionScore < 55 && input.shotQualityFaced >= 50) {
    return {
      responseType: "LATE_REACTION",
      reboundState: "loose_ball",
    };
  }

  if (input.handlingScore < 50 && input.shotQualityFaced >= 45) {
    return {
      responseType: "HANDLING_ERROR",
      reboundState: "dangerous_rebound",
    };
  }

  if (input.saveMargin >= 18 && input.handlingScore >= 65) {
    return {
      responseType: "CLEAN_SAVE",
      reboundState: "held",
    };
  }

  if (input.saveMargin >= 8) {
    return {
      responseType: "PARRIED_SAVE",
      reboundState: "safe_deflection",
    };
  }

  if (input.reboundControlScore < 60) {
    return {
      responseType: "REBOUND_ALLOWED",
      reboundState: "dangerous_rebound",
    };
  }

  return {
    responseType: "PARRIED_SAVE",
    reboundState: "safe_deflection",
  };
}

function shotQualityReason(shotQualityFaced: number): GoalkeeperResponseReason {
  if (shotQualityFaced >= 70) {
    return "SHOT_QUALITY_HIGH";
  }

  if (shotQualityFaced >= 40) {
    return "SHOT_QUALITY_MEDIUM";
  }

  return "SHOT_QUALITY_LOW";
}

function reasons(input: {
  readonly sourceOutcome?: string;
  readonly shotQualityFaced: number;
  readonly positioningScore: number;
  readonly trajectoryReadingScore: number;
  readonly reactionScore: number;
  readonly handlingScore: number;
  readonly reboundControlScore: number;
  readonly concentrationScore: number;
  readonly mentalFatigueImpact: number;
  readonly saveMargin: number;
}): readonly GoalkeeperResponseReason[] {
  if (input.sourceOutcome === "NO_SCORE_ATTEMPT" || input.shotQualityFaced <= 0) {
    return ["NO_SHOT_ATTEMPT", "SANDBOX_ONLY", "PRODUCTION_SCORING_FORBIDDEN"];
  }

  return [
    shotQualityReason(input.shotQualityFaced),
    ...(input.positioningScore >= 65 ? ["POSITIONING_ADVANTAGE" as const] : []),
    ...(input.trajectoryReadingScore >= 65 ? ["TRAJECTORY_READING_ADVANTAGE" as const] : []),
    ...(input.reactionScore >= 65 ? ["REACTION_ADVANTAGE" as const] : []),
    ...(input.handlingScore >= 65 ? ["HANDLING_ADVANTAGE" as const] : []),
    ...(input.reboundControlScore >= 65 ? ["REBOUND_CONTROL_ADVANTAGE" as const] : []),
    ...(input.concentrationScore >= 65 ? ["CONCENTRATION_ADVANTAGE" as const] : []),
    ...(input.mentalFatigueImpact > 8 ? ["MENTAL_FATIGUE_RISK" as const] : []),
    ...(input.saveMargin >= 18
      ? ["SAVE_MARGIN_STRONG" as const]
      : input.saveMargin >= 0
        ? ["SAVE_MARGIN_NARROW" as const]
        : ["KEEPER_BEATEN" as const]),
    "SANDBOX_ONLY",
    "PRODUCTION_SCORING_FORBIDDEN",
  ];
}

export function resolveGoalkeeperResponse(input: {
  readonly pathId: "baseline" | "override";
  readonly candidateId?: string;
  readonly shooterId?: string;
  readonly goalkeeperId?: string;
  readonly targetZone?: string;
  readonly sourceOutcome?: string;
  readonly sourceShotQuality: number;
  readonly sourceGoalkeeperResponseQuality: number;
  readonly shotPressureContext: number;
  readonly positioningScore: number;
  readonly trajectoryReadingScore: number;
  readonly reactionScore: number;
  readonly handlingScore: number;
  readonly reboundControlScore: number;
  readonly concentrationScore: number;
  readonly mentalFatigueImpact: number;
  readonly goalkeeperRole?: string;
}): GoalkeeperResponsePathResult {
  const shotQualityFaced = input.sourceOutcome === "NO_SCORE_ATTEMPT" ? 0 : bounded(input.sourceShotQuality, 0, 100);
  const goalkeeperResponseScore = shotQualityFaced <= 0
    ? 0
    : weightedGoalkeeperScore({
      sourceGoalkeeperResponseQuality: input.sourceGoalkeeperResponseQuality,
      positioningScore: input.positioningScore,
      trajectoryReadingScore: input.trajectoryReadingScore,
      reactionScore: input.reactionScore,
      handlingScore: input.handlingScore,
      reboundControlScore: input.reboundControlScore,
      concentrationScore: input.concentrationScore,
      mentalFatigueImpact: input.mentalFatigueImpact,
      shotPressureContext: input.shotPressureContext,
    });
  const saveMargin = shotQualityFaced <= 0 ? 0 : goalkeeperResponseScore - shotQualityFaced;
  const classification = responseClassification({
    ...(input.sourceOutcome === undefined ? {} : { sourceOutcome: input.sourceOutcome }),
    sourceShotQuality: input.sourceShotQuality,
    shotQualityFaced,
    saveMargin,
    positioningScore: input.positioningScore,
    reactionScore: input.reactionScore,
    handlingScore: input.handlingScore,
    reboundControlScore: input.reboundControlScore,
  });
  const resultReasons = reasons({
    ...(input.sourceOutcome === undefined ? {} : { sourceOutcome: input.sourceOutcome }),
    shotQualityFaced,
    positioningScore: input.positioningScore,
    trajectoryReadingScore: input.trajectoryReadingScore,
    reactionScore: input.reactionScore,
    handlingScore: input.handlingScore,
    reboundControlScore: input.reboundControlScore,
    concentrationScore: input.concentrationScore,
    mentalFatigueImpact: input.mentalFatigueImpact,
    saveMargin,
  });

  return {
    pathId: input.pathId,
    ...(input.candidateId === undefined ? {} : { candidateId: input.candidateId }),
    ...(input.shooterId === undefined ? {} : { shooterId: input.shooterId }),
    ...(input.goalkeeperId === undefined ? {} : { goalkeeperId: input.goalkeeperId }),
    ...(input.targetZone === undefined ? {} : { targetZone: input.targetZone }),
    ...(input.sourceOutcome === undefined ? {} : { sourceOutcome: input.sourceOutcome }),
    sourceShotQuality: input.sourceShotQuality,
    sourceGoalkeeperResponseQuality: input.sourceGoalkeeperResponseQuality,
    ...(input.goalkeeperRole === undefined ? {} : { goalkeeperRole: input.goalkeeperRole }),
    positioningScore: input.positioningScore,
    trajectoryReadingScore: input.trajectoryReadingScore,
    reactionScore: input.reactionScore,
    handlingScore: input.handlingScore,
    reboundControlScore: input.reboundControlScore,
    concentrationScore: input.concentrationScore,
    mentalFatigueImpact: input.mentalFatigueImpact,
    shotPressureContext: input.shotPressureContext,
    shotQualityFaced,
    goalkeeperResponseScore,
    saveMargin,
    responseType: classification.responseType,
    reboundState: classification.reboundState,
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    canCreateProductionScoringEvent: false,
    reasons: resultReasons,
    tags: [
      `goalkeeper_response_${input.pathId}_candidate_${input.candidateId ?? "none"}`,
      `goalkeeper_response_${input.pathId}_shooter_${input.shooterId ?? "none"}`,
      `goalkeeper_response_${input.pathId}_goalkeeper_${input.goalkeeperId ?? "none"}`,
      `goalkeeper_response_${input.pathId}_target_zone_${input.targetZone ?? "none"}`,
      `goalkeeper_response_${input.pathId}_source_outcome_${input.sourceOutcome ?? "none"}`,
      `goalkeeper_response_${input.pathId}_shot_quality_faced_${shotQualityFaced}`,
      `goalkeeper_response_${input.pathId}_source_goalkeeper_quality_${input.sourceGoalkeeperResponseQuality}`,
      `goalkeeper_response_${input.pathId}_positioning_${input.positioningScore}`,
      `goalkeeper_response_${input.pathId}_trajectory_reading_${input.trajectoryReadingScore}`,
      `goalkeeper_response_${input.pathId}_reaction_${input.reactionScore}`,
      `goalkeeper_response_${input.pathId}_handling_${input.handlingScore}`,
      `goalkeeper_response_${input.pathId}_rebound_control_${input.reboundControlScore}`,
      `goalkeeper_response_${input.pathId}_concentration_${input.concentrationScore}`,
      `goalkeeper_response_${input.pathId}_mental_fatigue_impact_${input.mentalFatigueImpact}`,
      `goalkeeper_response_${input.pathId}_pressure_context_${input.shotPressureContext}`,
      `goalkeeper_response_${input.pathId}_response_score_${goalkeeperResponseScore}`,
      `goalkeeper_response_${input.pathId}_save_margin_${saveMargin}`,
      `goalkeeper_response_${input.pathId}_response_type_${classification.responseType}`,
      `goalkeeper_response_${input.pathId}_rebound_state_${classification.reboundState}`,
      `goalkeeper_response_${input.pathId}_score_delta_0`,
      ...resultReasons.map((reason) => `goalkeeper_response_${input.pathId}_reason_${reason}`),
    ],
    warnings: [],
  };
}

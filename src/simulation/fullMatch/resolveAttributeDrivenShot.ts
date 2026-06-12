import type {
  AttributeDrivenGoalkeeperSnapshot,
  AttributeDrivenShotFactor,
  AttributeDrivenShotOutcome,
  AttributeDrivenShotPlayerSnapshot,
  AttributeDrivenShotResolutionPathResult,
} from "./attributeDrivenShotResolutionSandbox";

function bounded(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 50;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function valueOrNeutral(value: number | undefined): number {
  return value ?? 50;
}

function shooterAttributeScore(shooter: AttributeDrivenShotPlayerSnapshot): number {
  const technique = average([valueOrNeutral(shooter.shooting), valueOrNeutral(shooter.finishing)]);

  return bounded(average([
    technique,
    valueOrNeutral(shooter.decision),
    valueOrNeutral(shooter.composure),
  ]), 0, 100);
}

function goalkeeperAttributeScore(goalkeeper: AttributeDrivenGoalkeeperSnapshot): number {
  return bounded(average([
    valueOrNeutral(goalkeeper.reaction),
    valueOrNeutral(goalkeeper.positioning),
    valueOrNeutral(goalkeeper.handling),
    valueOrNeutral(goalkeeper.concentration),
  ]), 0, 100);
}

function zoneShotModifier(targetZone: string | undefined): number {
  if (targetZone?.startsWith("Z5") === true) {
    return 8;
  }

  if (targetZone?.startsWith("Z4") === true) {
    return 4;
  }

  if (targetZone?.startsWith("Z3") === true) {
    return 1;
  }

  return 0;
}

function fatigueModifier(condition: number | undefined): number {
  return bounded((valueOrNeutral(condition) - 70) * 0.18, -8, 6);
}

function mentalModifier(mentalFreshness: number | undefined): number {
  return bounded((valueOrNeutral(mentalFreshness) - 70) * 0.2, -8, 6);
}

function shotQuality(input: {
  readonly sourceShotQuality: number;
  readonly shooterAttributeScore: number;
  readonly receptionQuality: number;
  readonly defensivePressure: number;
  readonly zoneShotModifier: number;
  readonly fatigueModifier: number;
  readonly mentalModifier: number;
}): number {
  const attributeModifier = (input.shooterAttributeScore - 50) * 0.35;
  const receptionModifier = (input.receptionQuality - 50) * 0.18;
  const pressurePenalty = input.defensivePressure * 0.22;

  return bounded(
    input.sourceShotQuality +
      attributeModifier +
      receptionModifier +
      input.zoneShotModifier +
      input.fatigueModifier +
      input.mentalModifier -
      pressurePenalty,
    0,
    100,
  );
}

function goalkeeperQuality(input: {
  readonly goalkeeperAttributeScore: number;
  readonly currentCondition?: number;
  readonly mentalFreshness?: number;
  readonly goalkeeperMentalFatigue?: number;
}): number {
  const conditionModifier = (valueOrNeutral(input.currentCondition) - 70) * 0.15;
  const mentalFreshnessModifier = (valueOrNeutral(input.mentalFreshness) - 70) * 0.18;
  const fatiguePenalty = valueOrNeutral(input.goalkeeperMentalFatigue) * 0.08;

  return bounded(
    input.goalkeeperAttributeScore + conditionModifier + mentalFreshnessModifier - fatiguePenalty,
    0,
    100,
  );
}

function outcome(input: {
  readonly sourceResolutionType?: string;
  readonly sourceScoringCandidateType?: string;
  readonly sourceConversionProbability: number;
  readonly shotQuality: number;
  readonly goalkeeperQuality: number;
  readonly defensivePressure: number;
}): AttributeDrivenShotOutcome {
  if (
    input.sourceResolutionType === "NO_SCORE_ATTEMPT" ||
    input.sourceScoringCandidateType === "NO_SCORING_EVENT" ||
    input.sourceConversionProbability <= 0
  ) {
    return "NO_SCORE_ATTEMPT";
  }

  if (input.shotQuality < 35) {
    return "SHOT_OFF_TARGET";
  }

  if (input.defensivePressure >= 70 && input.shotQuality < 50) {
    return "SHOT_BLOCKED";
  }

  if (input.goalkeeperQuality >= input.shotQuality) {
    return "SAVED_BY_GK";
  }

  if (input.shotQuality >= 60 && input.goalkeeperQuality + 6 < input.shotQuality) {
    return "SANDBOX_GOAL_CANDIDATE";
  }

  return "SHOT_ON_TARGET";
}

function factors(input: {
  readonly shotAttemptCreated: boolean;
  readonly goalkeeperEvaluated: boolean;
}): readonly AttributeDrivenShotFactor[] {
  if (!input.shotAttemptCreated) {
    return ["SANDBOX_ONLY", "PRODUCTION_SCORING_FORBIDDEN"];
  }

  return [
    "SHOOTER_TECHNIQUE",
    "SHOOTER_DECISION",
    "SHOOTER_COMPOSURE",
    "SHOOTER_CONDITION",
    "SHOOTER_MENTAL_FRESHNESS",
    "RECEPTION_QUALITY",
    "DEFENSIVE_PRESSURE",
    "TARGET_ZONE",
    ...(input.goalkeeperEvaluated
      ? [
        "GOALKEEPER_REACTION" as const,
        "GOALKEEPER_POSITIONING" as const,
        "GOALKEEPER_HANDLING" as const,
        "GOALKEEPER_CONCENTRATION" as const,
        "GOALKEEPER_MENTAL_FATIGUE" as const,
      ]
      : []),
    "SANDBOX_ONLY",
    "PRODUCTION_SCORING_FORBIDDEN",
  ];
}

export function resolveAttributeDrivenShot(input: {
  readonly pathId: "baseline" | "override";
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly sourceResolutionType?: string;
  readonly sourceScoringCandidateType?: string;
  readonly sourceConversionProbability: number;
  readonly sourceShotQuality: number;
  readonly sourceGoalkeeperResponse?: string;
  readonly shooter: AttributeDrivenShotPlayerSnapshot;
  readonly goalkeeper: AttributeDrivenGoalkeeperSnapshot;
  readonly receptionQuality: number;
  readonly defensivePressure: number;
}): AttributeDrivenShotResolutionPathResult {
  const shotAttemptCreated =
    input.sourceScoringCandidateType === "SHOT_CANDIDATE" &&
    input.sourceConversionProbability > 0 &&
    input.sourceResolutionType !== "NO_SCORE_ATTEMPT";
  const shooterScore = shotAttemptCreated ? shooterAttributeScore(input.shooter) : 0;
  const goalkeeperScore = shotAttemptCreated ? goalkeeperAttributeScore(input.goalkeeper) : 0;
  const zoneModifier = shotAttemptCreated ? zoneShotModifier(input.targetZone) : 0;
  const conditionModifier = shotAttemptCreated ? fatigueModifier(input.shooter.currentCondition) : 0;
  const freshnessModifier = shotAttemptCreated ? mentalModifier(input.shooter.mentalFreshness) : 0;
  const adjustedShotQuality = shotAttemptCreated
    ? shotQuality({
      sourceShotQuality: input.sourceShotQuality,
      shooterAttributeScore: shooterScore,
      receptionQuality: input.receptionQuality,
      defensivePressure: input.defensivePressure,
      zoneShotModifier: zoneModifier,
      fatigueModifier: conditionModifier,
      mentalModifier: freshnessModifier,
    })
    : 0;
  const adjustedGoalkeeperQuality = shotAttemptCreated
    ? goalkeeperQuality({
      goalkeeperAttributeScore: goalkeeperScore,
      ...(input.goalkeeper.currentCondition === undefined ? {} : { currentCondition: input.goalkeeper.currentCondition }),
      ...(input.goalkeeper.mentalFreshness === undefined ? {} : { mentalFreshness: input.goalkeeper.mentalFreshness }),
      ...(input.goalkeeper.goalkeeperMentalFatigue === undefined
        ? {}
        : { goalkeeperMentalFatigue: input.goalkeeper.goalkeeperMentalFatigue }),
    })
    : 0;
  const resultOutcome = outcome({
    ...(input.sourceResolutionType === undefined ? {} : { sourceResolutionType: input.sourceResolutionType }),
    ...(input.sourceScoringCandidateType === undefined ? {} : { sourceScoringCandidateType: input.sourceScoringCandidateType }),
    sourceConversionProbability: input.sourceConversionProbability,
    shotQuality: adjustedShotQuality,
    goalkeeperQuality: adjustedGoalkeeperQuality,
    defensivePressure: input.defensivePressure,
  });
  const resultFactors = factors({
    shotAttemptCreated,
    goalkeeperEvaluated: input.goalkeeper.playerId !== undefined,
  });

  return {
    pathId: input.pathId,
    ...(input.candidateId === undefined ? {} : { candidateId: input.candidateId }),
    ...(input.actionType === undefined ? {} : { actionType: input.actionType }),
    ...(input.receiverId === undefined ? {} : { receiverId: input.receiverId }),
    ...(input.targetZone === undefined ? {} : { targetZone: input.targetZone }),
    ...(input.sourceResolutionType === undefined ? {} : { sourceResolutionType: input.sourceResolutionType }),
    ...(input.sourceScoringCandidateType === undefined ? {} : { sourceScoringCandidateType: input.sourceScoringCandidateType }),
    sourceConversionProbability: input.sourceConversionProbability,
    sourceShotQuality: input.sourceShotQuality,
    ...(input.sourceGoalkeeperResponse === undefined ? {} : { sourceGoalkeeperResponse: input.sourceGoalkeeperResponse }),
    shooter: input.shooter,
    goalkeeper: input.goalkeeper,
    receptionQuality: shotAttemptCreated ? input.receptionQuality : 0,
    defensivePressure: shotAttemptCreated ? input.defensivePressure : 0,
    zoneShotModifier: zoneModifier,
    fatigueModifier: conditionModifier,
    mentalModifier: freshnessModifier,
    shooterAttributeScore: shooterScore,
    goalkeeperAttributeScore: goalkeeperScore,
    attributeAdjustedShotQuality: adjustedShotQuality,
    attributeAdjustedGoalkeeperResponseQuality: adjustedGoalkeeperQuality,
    outcome: resultOutcome,
    shotAttemptCreated,
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    canCreateProductionScoringEvent: false,
    factors: resultFactors,
    tags: [
      `attribute_driven_shot_resolution_${input.pathId}_candidate_${input.candidateId ?? "none"}`,
      `attribute_driven_shot_resolution_${input.pathId}_receiver_${input.receiverId ?? "none"}`,
      `attribute_driven_shot_resolution_${input.pathId}_target_zone_${input.targetZone ?? "none"}`,
      `attribute_driven_shot_resolution_${input.pathId}_source_resolution_${input.sourceResolutionType ?? "none"}`,
      `attribute_driven_shot_resolution_${input.pathId}_source_candidate_${input.sourceScoringCandidateType ?? "none"}`,
      `attribute_driven_shot_resolution_${input.pathId}_source_conversion_${input.sourceConversionProbability}`,
      `attribute_driven_shot_resolution_${input.pathId}_source_shot_quality_${input.sourceShotQuality}`,
      `attribute_driven_shot_resolution_${input.pathId}_shooter_${input.shooter.playerId ?? "fallback"}`,
      `attribute_driven_shot_resolution_${input.pathId}_goalkeeper_${input.goalkeeper.playerId ?? "fallback"}`,
      `attribute_driven_shot_resolution_${input.pathId}_shooter_attribute_score_${shooterScore}`,
      `attribute_driven_shot_resolution_${input.pathId}_goalkeeper_attribute_score_${goalkeeperScore}`,
      `attribute_driven_shot_resolution_${input.pathId}_shot_attempt_${shotAttemptCreated ? "true" : "false"}`,
      `attribute_driven_shot_resolution_${input.pathId}_adjusted_shot_quality_${adjustedShotQuality}`,
      `attribute_driven_shot_resolution_${input.pathId}_goalkeeper_quality_${adjustedGoalkeeperQuality}`,
      `attribute_driven_shot_resolution_${input.pathId}_outcome_${resultOutcome}`,
      `attribute_driven_shot_resolution_${input.pathId}_score_delta_0`,
      ...resultFactors.map((factor) => `attribute_driven_shot_resolution_${input.pathId}_factor_${factor}`),
    ],
    warnings: [
      ...(shotAttemptCreated && input.goalkeeper.playerId === undefined
        ? ["ATTRIBUTE_DRIVEN_SHOT_GOALKEEPER_RESPONSE_NOT_READY"]
        : []),
    ],
  };
}

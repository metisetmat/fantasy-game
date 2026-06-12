export type AttributeDrivenShotResolutionStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type AttributeDrivenShotResolutionScope =
  | "attribute_driven_shot_resolution_sandbox"
  | "production_scoring_forbidden";

export type AttributeDrivenShotResolutionOrigin =
  | "none"
  | "sandbox_scoring_event_resolution";

export type AttributeDrivenShotOutcome =
  | "NO_SCORE_ATTEMPT"
  | "SHOT_OFF_TARGET"
  | "SHOT_BLOCKED"
  | "SHOT_ON_TARGET"
  | "SAVED_BY_GK"
  | "SANDBOX_GOAL_CANDIDATE"
  | "NO_SCORE";

export type AttributeDrivenShotFactor =
  | "SHOOTER_TECHNIQUE"
  | "SHOOTER_DECISION"
  | "SHOOTER_COMPOSURE"
  | "SHOOTER_CONDITION"
  | "SHOOTER_MENTAL_FRESHNESS"
  | "RECEPTION_QUALITY"
  | "DEFENSIVE_PRESSURE"
  | "TARGET_ZONE"
  | "GOALKEEPER_REACTION"
  | "GOALKEEPER_POSITIONING"
  | "GOALKEEPER_HANDLING"
  | "GOALKEEPER_CONCENTRATION"
  | "GOALKEEPER_MENTAL_FATIGUE"
  | "SANDBOX_ONLY"
  | "PRODUCTION_SCORING_FORBIDDEN";

export type AttributeDrivenShotPlayerSnapshot = {
  readonly playerId?: string;
  readonly role?: string;
  readonly shooting?: number;
  readonly finishing?: number;
  readonly decision?: number;
  readonly composure?: number;
  readonly currentCondition?: number;
  readonly mentalFreshness?: number;
};

export type AttributeDrivenGoalkeeperSnapshot = {
  readonly playerId?: string;
  readonly role?: string;
  readonly reaction?: number;
  readonly positioning?: number;
  readonly handling?: number;
  readonly concentration?: number;
  readonly currentCondition?: number;
  readonly mentalFreshness?: number;
  readonly goalkeeperMentalFatigue?: number;
};

export type AttributeDrivenShotResolutionPathResult = {
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
  readonly zoneShotModifier: number;
  readonly fatigueModifier: number;
  readonly mentalModifier: number;
  readonly shooterAttributeScore: number;
  readonly goalkeeperAttributeScore: number;
  readonly attributeAdjustedShotQuality: number;
  readonly attributeAdjustedGoalkeeperResponseQuality: number;
  readonly outcome: AttributeDrivenShotOutcome;
  readonly shotAttemptCreated: boolean;
  readonly sandboxScoringEventCreated: false;
  readonly sandboxScoreDelta: 0;
  readonly isolatedOnly: true;
  readonly canBecomeOfficialMatchEvent: false;
  readonly canMutateOfficialScore: false;
  readonly canCreateOfficialScoringEvent: false;
  readonly canCreateProductionScoringEvent: false;
  readonly factors: readonly AttributeDrivenShotFactor[];
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export type AttributeDrivenShotResolutionModel = {
  readonly status: AttributeDrivenShotResolutionStatus;
  readonly scope: AttributeDrivenShotResolutionScope;
  readonly origin: AttributeDrivenShotResolutionOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly baseline: AttributeDrivenShotResolutionPathResult;
  readonly override: AttributeDrivenShotResolutionPathResult;
  readonly baselineShotAttemptCreated: boolean;
  readonly overrideShotAttemptCreated: boolean;
  readonly attributeDrivenOutcomeDivergenceObserved: boolean;
  readonly shotQualityDivergenceObserved: boolean;
  readonly goalkeeperQualityDivergenceObserved: boolean;
  readonly attributeInfluenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly modelAppliedOnlyInSandbox: boolean;
  readonly modelAppliedToNormalLiveSelection: false;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
  readonly diagnosticOnly: boolean;
  readonly canInjectEventsIntoOfficialTimeline: false;
  readonly canMutateOfficialScore: false;
  readonly canMutateOfficialScoringEvents: false;
  readonly canMutateProductionRouteResolution: false;
  readonly canMutateGlobalRouteSuccessRates: false;
  readonly canCreateProductionScoringEvents: false;
  readonly canClaimGlobalEconomy: false;
  readonly explanation?: string;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptyAttributeDrivenShotResolutionPathResult(
  pathId: "baseline" | "override",
): AttributeDrivenShotResolutionPathResult {
  return {
    pathId,
    sourceConversionProbability: 0,
    sourceShotQuality: 0,
    shooter: {},
    goalkeeper: {},
    receptionQuality: 0,
    defensivePressure: 0,
    zoneShotModifier: 0,
    fatigueModifier: 0,
    mentalModifier: 0,
    shooterAttributeScore: 0,
    goalkeeperAttributeScore: 0,
    attributeAdjustedShotQuality: 0,
    attributeAdjustedGoalkeeperResponseQuality: 0,
    outcome: "NO_SCORE_ATTEMPT",
    shotAttemptCreated: false,
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
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

export function emptyAttributeDrivenShotResolutionModel(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): AttributeDrivenShotResolutionModel {
  return {
    status: "not_available",
    scope: "production_scoring_forbidden",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    baseline: emptyAttributeDrivenShotResolutionPathResult("baseline"),
    override: emptyAttributeDrivenShotResolutionPathResult("override"),
    baselineShotAttemptCreated: false,
    overrideShotAttemptCreated: false,
    attributeDrivenOutcomeDivergenceObserved: false,
    shotQualityDivergenceObserved: false,
    goalkeeperQualityDivergenceObserved: false,
    attributeInfluenceObserved: false,
    sandboxScoringEventDivergenceObserved: false,
    sandboxScoreDivergenceObserved: false,
    modelAppliedOnlyInSandbox: false,
    modelAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: 0,
    rejectedUnavailableCandidateCount: 0,
    diagnosticOnly: true,
    canInjectEventsIntoOfficialTimeline: false,
    canMutateOfficialScore: false,
    canMutateOfficialScoringEvents: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    tags: [],
    warnings: input.warnings,
  };
}

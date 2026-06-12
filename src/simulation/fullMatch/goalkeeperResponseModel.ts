export type GoalkeeperResponseModelStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type GoalkeeperResponseModelScope =
  | "goalkeeper_response_model_sandbox"
  | "production_scoring_forbidden";

export type GoalkeeperResponseModelOrigin =
  | "none"
  | "attribute_driven_shot_resolution_sandbox";

export type GoalkeeperResponseType =
  | "NOT_APPLICABLE"
  | "NO_SAVE_REQUIRED"
  | "CLEAN_SAVE"
  | "PARRIED_SAVE"
  | "REBOUND_ALLOWED"
  | "LATE_REACTION"
  | "POSITIONING_ERROR"
  | "HANDLING_ERROR"
  | "SANDBOX_GOAL_CANDIDATE";

export type GoalkeeperReboundState =
  | "none"
  | "held"
  | "safe_deflection"
  | "dangerous_rebound"
  | "loose_ball"
  | "goal_candidate";

export type GoalkeeperResponseReason =
  | "NO_SHOT_ATTEMPT"
  | "SHOT_QUALITY_LOW"
  | "SHOT_QUALITY_MEDIUM"
  | "SHOT_QUALITY_HIGH"
  | "POSITIONING_ADVANTAGE"
  | "TRAJECTORY_READING_ADVANTAGE"
  | "REACTION_ADVANTAGE"
  | "HANDLING_ADVANTAGE"
  | "REBOUND_CONTROL_ADVANTAGE"
  | "CONCENTRATION_ADVANTAGE"
  | "MENTAL_FATIGUE_RISK"
  | "SAVE_MARGIN_STRONG"
  | "SAVE_MARGIN_NARROW"
  | "KEEPER_BEATEN"
  | "SANDBOX_ONLY"
  | "PRODUCTION_SCORING_FORBIDDEN";

export type GoalkeeperResponsePathResult = {
  readonly pathId: "baseline" | "override";
  readonly candidateId?: string;
  readonly shooterId?: string;
  readonly goalkeeperId?: string;
  readonly targetZone?: string;
  readonly sourceOutcome?: string;
  readonly sourceShotQuality: number;
  readonly sourceGoalkeeperResponseQuality: number;
  readonly goalkeeperRole?: string;
  readonly positioningScore: number;
  readonly trajectoryReadingScore: number;
  readonly reactionScore: number;
  readonly handlingScore: number;
  readonly reboundControlScore: number;
  readonly concentrationScore: number;
  readonly mentalFatigueImpact: number;
  readonly shotPressureContext: number;
  readonly shotQualityFaced: number;
  readonly goalkeeperResponseScore: number;
  readonly saveMargin: number;
  readonly responseType: GoalkeeperResponseType;
  readonly reboundState: GoalkeeperReboundState;
  readonly sandboxScoringEventCreated: false;
  readonly sandboxScoreDelta: 0;
  readonly isolatedOnly: true;
  readonly canBecomeOfficialMatchEvent: false;
  readonly canMutateOfficialScore: false;
  readonly canCreateOfficialScoringEvent: false;
  readonly canCreateProductionScoringEvent: false;
  readonly reasons: readonly GoalkeeperResponseReason[];
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export type GoalkeeperResponseModel = {
  readonly status: GoalkeeperResponseModelStatus;
  readonly scope: GoalkeeperResponseModelScope;
  readonly origin: GoalkeeperResponseModelOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly baseline: GoalkeeperResponsePathResult;
  readonly override: GoalkeeperResponsePathResult;
  readonly baselineSaveRequired: boolean;
  readonly overrideSaveRequired: boolean;
  readonly goalkeeperResponseDivergenceObserved: boolean;
  readonly reboundStateDivergenceObserved: boolean;
  readonly saveMarginObserved: boolean;
  readonly goalkeeperAttributeInfluenceObserved: boolean;
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

export function emptyGoalkeeperResponsePathResult(
  pathId: "baseline" | "override",
): GoalkeeperResponsePathResult {
  return {
    pathId,
    sourceShotQuality: 0,
    sourceGoalkeeperResponseQuality: 0,
    positioningScore: 0,
    trajectoryReadingScore: 0,
    reactionScore: 0,
    handlingScore: 0,
    reboundControlScore: 0,
    concentrationScore: 0,
    mentalFatigueImpact: 0,
    shotPressureContext: 0,
    shotQualityFaced: 0,
    goalkeeperResponseScore: 0,
    saveMargin: 0,
    responseType: "NOT_APPLICABLE",
    reboundState: "none",
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    canCreateProductionScoringEvent: false,
    reasons: ["NO_SHOT_ATTEMPT", "SANDBOX_ONLY", "PRODUCTION_SCORING_FORBIDDEN"],
    tags: [],
    warnings: [],
  };
}

export function emptyGoalkeeperResponseModel(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): GoalkeeperResponseModel {
  return {
    status: "not_available",
    scope: "production_scoring_forbidden",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    baseline: emptyGoalkeeperResponsePathResult("baseline"),
    override: emptyGoalkeeperResponsePathResult("override"),
    baselineSaveRequired: false,
    overrideSaveRequired: false,
    goalkeeperResponseDivergenceObserved: false,
    reboundStateDivergenceObserved: false,
    saveMarginObserved: false,
    goalkeeperAttributeInfluenceObserved: false,
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

export type ReboundSecondChanceStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type ReboundSecondChanceScope =
  | "rebound_second_chance_sandbox"
  | "production_scoring_forbidden";

export type ReboundSecondChanceOrigin =
  | "none"
  | "goalkeeper_response_model_sandbox";

export type ReboundOutcome =
  | "NO_REBOUND"
  | "HELD_BALL"
  | "SAFE_DEFLECTION"
  | "SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE"
  | "DANGEROUS_REBOUND"
  | "LOOSE_BALL"
  | "SECOND_CHANCE_WINDOW"
  | "DEFENSIVE_CLEARANCE";

export type BallLooseState =
  | "none"
  | "held_by_goalkeeper"
  | "safe_area"
  | "contested"
  | "danger_zone"
  | "attacker_favored"
  | "defender_favored";

export type SandboxRecoveryTeamCandidate =
  | "none"
  | "goalkeeper_team"
  | "attacking_team"
  | "contested";

export type ReboundSecondChanceReason =
  | "NO_SAVE_REQUIRED"
  | "CLEAN_SAVE_HELD"
  | "PARRIED_SAVE"
  | "SAFE_DEFLECTION"
  | "REBOUND_CONTROL_STRONG"
  | "REBOUND_CONTROL_WEAK"
  | "HANDLING_STRONG"
  | "HANDLING_WEAK"
  | "DEFENSIVE_RECOVERY_ADVANTAGE"
  | "ATTACKING_PROXIMITY_ADVANTAGE"
  | "SECOND_CHANCE_SUPPRESSED"
  | "SECOND_CHANCE_CREATED"
  | "SANDBOX_ONLY"
  | "PRODUCTION_SCORING_FORBIDDEN";

export type ReboundSecondChancePathResult = {
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
  readonly reboundDangerScore: number;
  readonly secondChanceProbability: number;
  readonly reboundOutcome: ReboundOutcome;
  readonly ballLooseState: BallLooseState;
  readonly recoveryTeamCandidate: SandboxRecoveryTeamCandidate;
  readonly nextSandboxPossessionCandidate: SandboxRecoveryTeamCandidate;
  readonly secondChanceCreated: boolean;
  readonly sandboxMatchEventCreated: false;
  readonly sandboxScoringEventCreated: false;
  readonly sandboxScoreDelta: 0;
  readonly isolatedOnly: true;
  readonly canBecomeOfficialMatchEvent: false;
  readonly canMutateOfficialScore: false;
  readonly canCreateOfficialScoringEvent: false;
  readonly canCreateProductionScoringEvent: false;
  readonly canMutateOfficialPossession: false;
  readonly reasons: readonly ReboundSecondChanceReason[];
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export type ReboundSecondChanceModel = {
  readonly status: ReboundSecondChanceStatus;
  readonly scope: ReboundSecondChanceScope;
  readonly origin: ReboundSecondChanceOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly baseline: ReboundSecondChancePathResult;
  readonly override: ReboundSecondChancePathResult;
  readonly baselineSecondChanceCreated: boolean;
  readonly overrideSecondChanceCreated: boolean;
  readonly reboundOutcomeDivergenceObserved: boolean;
  readonly ballLooseStateDivergenceObserved: boolean;
  readonly recoveryTeamDivergenceObserved: boolean;
  readonly secondChanceProbabilityObserved: boolean;
  readonly secondChanceCreationDivergenceObserved: boolean;
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
  readonly canMutateOfficialPossession: false;
  readonly canMutateProductionRouteResolution: false;
  readonly canMutateGlobalRouteSuccessRates: false;
  readonly canCreateProductionScoringEvents: false;
  readonly canClaimGlobalEconomy: false;
  readonly explanation?: string;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptyReboundSecondChancePathResult(
  pathId: "baseline" | "override",
): ReboundSecondChancePathResult {
  return {
    pathId,
    sourceShotQualityFaced: 0,
    sourceGoalkeeperResponseScore: 0,
    sourceSaveMargin: 0,
    handlingScore: 0,
    reboundControlScore: 0,
    concentrationScore: 0,
    mentalFatigueImpact: 0,
    attackingProximityScore: 0,
    defensiveRecoveryScore: 0,
    reboundDangerScore: 0,
    secondChanceProbability: 0,
    reboundOutcome: "NO_REBOUND",
    ballLooseState: "none",
    recoveryTeamCandidate: "none",
    nextSandboxPossessionCandidate: "none",
    secondChanceCreated: false,
    sandboxMatchEventCreated: false,
    sandboxScoringEventCreated: false,
    sandboxScoreDelta: 0,
    isolatedOnly: true,
    canBecomeOfficialMatchEvent: false,
    canMutateOfficialScore: false,
    canCreateOfficialScoringEvent: false,
    canCreateProductionScoringEvent: false,
    canMutateOfficialPossession: false,
    reasons: ["NO_SAVE_REQUIRED", "SANDBOX_ONLY", "PRODUCTION_SCORING_FORBIDDEN"],
    tags: [],
    warnings: [],
  };
}

export function emptyReboundSecondChanceModel(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): ReboundSecondChanceModel {
  return {
    status: "not_available",
    scope: "production_scoring_forbidden",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    baseline: emptyReboundSecondChancePathResult("baseline"),
    override: emptyReboundSecondChancePathResult("override"),
    baselineSecondChanceCreated: false,
    overrideSecondChanceCreated: false,
    reboundOutcomeDivergenceObserved: false,
    ballLooseStateDivergenceObserved: false,
    recoveryTeamDivergenceObserved: false,
    secondChanceProbabilityObserved: false,
    secondChanceCreationDivergenceObserved: false,
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
    canMutateOfficialPossession: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    tags: [],
    warnings: input.warnings,
  };
}

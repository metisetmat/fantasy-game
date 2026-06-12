export type MultiActionContinuationStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type MultiActionContinuationScope =
  | "multi_action_continuation_sandbox"
  | "production_scoring_forbidden";

export type MultiActionContinuationOrigin =
  | "none"
  | "rebound_second_chance_sandbox";

export type SandboxContinuationActionType =
  | "NO_CONTINUATION"
  | "GOALKEEPER_CLAIM"
  | "GOALKEEPER_TEAM_SECURE_RECOVERY"
  | "DEFENSIVE_CLEARANCE"
  | "SAFE_RESET"
  | "TERRITORIAL_CLEARANCE"
  | "CONTROLLED_OUTLET"
  | "SECOND_CHANCE_ATTACK"
  | "LOOSE_BALL_CONTEST";

export type SandboxContinuationOutcome =
  | "none"
  | "secured_by_goalkeeper_team"
  | "cleared_to_safe_zone"
  | "reset_under_control"
  | "territory_relieved"
  | "outlet_available"
  | "attacking_second_chance_window"
  | "contested_loose_ball";

export type SandboxContinuationReason =
  | "NO_REBOUND"
  | "SAFE_DEFLECTION"
  | "RECOVERY_TEAM_GOALKEEPER_TEAM"
  | "DEFENSIVE_RECOVERY_ADVANTAGE"
  | "ATTACKING_PROXIMITY_SUPPRESSED"
  | "SECOND_CHANCE_PROBABILITY_LOW"
  | "SECOND_CHANCE_WINDOW_CREATED"
  | "SAFE_AREA"
  | "CONTESTED_AREA"
  | "DANGER_ZONE"
  | "SANDBOX_ONLY"
  | "PRODUCTION_SCORING_FORBIDDEN";

export type SandboxContinuationTeamCandidate =
  | "none"
  | "goalkeeper_team"
  | "attacking_team"
  | "contested";

export type MultiActionContinuationPathResult = {
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
  readonly continuationActionType: SandboxContinuationActionType;
  readonly continuationOutcome: SandboxContinuationOutcome;
  readonly continuationTeamCandidate: SandboxContinuationTeamCandidate;
  readonly continuationActorCandidate?: string;
  readonly continuationTargetZoneCandidate?: string;
  readonly possessionSecurityScore: number;
  readonly pressureAfterRebound: number;
  readonly transitionRisk: number;
  readonly continuationConfidence: number;
  readonly sandboxContinuationCreated: boolean;
  readonly sandboxMatchEventCreated: false;
  readonly sandboxScoringEventCreated: false;
  readonly sandboxScoreDelta: 0;
  readonly isolatedOnly: true;
  readonly canBecomeOfficialMatchEvent: false;
  readonly canMutateOfficialScore: false;
  readonly canCreateOfficialScoringEvent: false;
  readonly canCreateProductionScoringEvent: false;
  readonly canMutateOfficialPossession: false;
  readonly canMutateOfficialTimeline: false;
  readonly reasons: readonly SandboxContinuationReason[];
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export type MultiActionContinuationModel = {
  readonly status: MultiActionContinuationStatus;
  readonly scope: MultiActionContinuationScope;
  readonly origin: MultiActionContinuationOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly baseline: MultiActionContinuationPathResult;
  readonly override: MultiActionContinuationPathResult;
  readonly baselineContinuationCreated: boolean;
  readonly overrideContinuationCreated: boolean;
  readonly continuationActionDivergenceObserved: boolean;
  readonly continuationOutcomeDivergenceObserved: boolean;
  readonly continuationTeamDivergenceObserved: boolean;
  readonly possessionSecurityObserved: boolean;
  readonly transitionRiskObserved: boolean;
  readonly sandboxMatchEventDivergenceObserved: boolean;
  readonly sandboxScoringEventDivergenceObserved: boolean;
  readonly sandboxScoreDivergenceObserved: boolean;
  readonly officialPossessionDivergenceObserved: false;
  readonly modelAppliedOnlyInSandbox: boolean;
  readonly modelAppliedToNormalLiveSelection: false;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
  readonly diagnosticOnly: boolean;
  readonly canInjectEventsIntoOfficialTimeline: false;
  readonly canMutateOfficialScore: false;
  readonly canMutateOfficialScoringEvents: false;
  readonly canMutateOfficialPossession: false;
  readonly canMutateOfficialTimeline: false;
  readonly canMutateProductionRouteResolution: false;
  readonly canMutateGlobalRouteSuccessRates: false;
  readonly canCreateProductionScoringEvents: false;
  readonly canClaimGlobalEconomy: false;
  readonly explanation?: string;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptyMultiActionContinuationPathResult(
  pathId: "baseline" | "override",
): MultiActionContinuationPathResult {
  return {
    pathId,
    sourceReboundDangerScore: 0,
    sourceSecondChanceProbability: 0,
    sourceSecondChanceCreated: false,
    continuationActionType: "NO_CONTINUATION",
    continuationOutcome: "none",
    continuationTeamCandidate: "none",
    possessionSecurityScore: 0,
    pressureAfterRebound: 0,
    transitionRisk: 0,
    continuationConfidence: 0,
    sandboxContinuationCreated: false,
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
    reasons: ["NO_REBOUND", "SANDBOX_ONLY", "PRODUCTION_SCORING_FORBIDDEN"],
    tags: [],
    warnings: [],
  };
}

export function emptyMultiActionContinuationModel(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): MultiActionContinuationModel {
  return {
    status: "not_available",
    scope: "production_scoring_forbidden",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    baseline: emptyMultiActionContinuationPathResult("baseline"),
    override: emptyMultiActionContinuationPathResult("override"),
    baselineContinuationCreated: false,
    overrideContinuationCreated: false,
    continuationActionDivergenceObserved: false,
    continuationOutcomeDivergenceObserved: false,
    continuationTeamDivergenceObserved: false,
    possessionSecurityObserved: false,
    transitionRiskObserved: false,
    sandboxMatchEventDivergenceObserved: false,
    sandboxScoringEventDivergenceObserved: false,
    sandboxScoreDivergenceObserved: false,
    officialPossessionDivergenceObserved: false,
    modelAppliedOnlyInSandbox: false,
    modelAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: 0,
    rejectedUnavailableCandidateCount: 0,
    diagnosticOnly: true,
    canInjectEventsIntoOfficialTimeline: false,
    canMutateOfficialScore: false,
    canMutateOfficialScoringEvents: false,
    canMutateOfficialPossession: false,
    canMutateOfficialTimeline: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    tags: [],
    warnings: input.warnings,
  };
}

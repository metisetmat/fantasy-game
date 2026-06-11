export type FullMatchLiveSelectionOverrideGuardStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type FullMatchLiveSelectionOverrideGuardScope =
  | "experimental_live_selection_override_guard"
  | "production_live_resolution_forbidden";

export type FullMatchLiveSelectionOverrideGuardOrigin =
  | "none"
  | "controlled_minimatch_route_source";

export type FullMatchLiveSelectionOverrideGuard = {
  readonly status: FullMatchLiveSelectionOverrideGuardStatus;
  readonly scope: FullMatchLiveSelectionOverrideGuardScope;
  readonly origin: FullMatchLiveSelectionOverrideGuardOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly overrideCandidateId?: string;
  readonly overrideActionType?: string;
  readonly overrideReceiverId?: string;
  readonly overrideTargetZone?: string;
  readonly sourceBaseScore?: number;
  readonly sourceInfluenceDelta?: number;
  readonly sourceInfluencedScore?: number;
  readonly candidateLegal: boolean;
  readonly candidateAvailable: boolean;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
  readonly experimentalOverridePrepared: boolean;
  readonly overrideAppliedToLiveSelection: false;
  readonly diagnosticOnly: boolean;
  readonly canMutateScore: false;
  readonly canMutateScoringEvents: false;
  readonly canMutateRouteSuccessRates: false;
  readonly canDriveProductionFullMatchSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canDriveNormalLiveMiniMatchResolution: false;
  readonly canCreateScoringEvents: false;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptyLiveSelectionOverrideGuard(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): FullMatchLiveSelectionOverrideGuard {
  return {
    status: "not_available",
    scope: "production_live_resolution_forbidden",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    candidateLegal: false,
    candidateAvailable: false,
    rejectedClosedCandidateCount: 0,
    rejectedUnavailableCandidateCount: 0,
    experimentalOverridePrepared: false,
    overrideAppliedToLiveSelection: false,
    diagnosticOnly: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canMutateRouteSuccessRates: false,
    canDriveProductionFullMatchSelection: false,
    canDriveProductionRouteResolution: false,
    canDriveNormalLiveMiniMatchResolution: false,
    canCreateScoringEvents: false,
    tags: [],
    warnings: input.warnings,
  };
}

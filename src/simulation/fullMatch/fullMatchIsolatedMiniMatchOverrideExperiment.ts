export type FullMatchIsolatedMiniMatchOverrideExperimentStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type FullMatchIsolatedMiniMatchOverrideExperimentScope =
  | "isolated_minimatch_override_experiment"
  | "production_resolution_forbidden";

export type FullMatchIsolatedMiniMatchOverrideExperimentOrigin =
  | "none"
  | "live_selection_override_guard";

export type FullMatchIsolatedMiniMatchOverrideExperiment = {
  readonly status: FullMatchIsolatedMiniMatchOverrideExperimentStatus;
  readonly scope: FullMatchIsolatedMiniMatchOverrideExperimentScope;
  readonly origin: FullMatchIsolatedMiniMatchOverrideExperimentOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly baselineCandidateId?: string;
  readonly baselineActionType?: string;
  readonly baselineReceiverId?: string;
  readonly baselineTargetZone?: string;
  readonly overrideCandidateId?: string;
  readonly overrideActionType?: string;
  readonly overrideReceiverId?: string;
  readonly overrideTargetZone?: string;
  readonly overrideAppliedInIsolatedExperiment: boolean;
  readonly overrideAppliedToNormalLiveSelection: false;
  readonly candidateLegal: boolean;
  readonly candidateAvailable: boolean;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
  readonly baselineScoreSignature?: string;
  readonly overrideScoreSignature?: string;
  readonly isolatedSelectionDivergenceObserved: boolean;
  readonly isolatedScoreDivergenceObserved: boolean;
  readonly isolatedScoringEventDivergenceObserved: boolean;
  readonly isolatedTimelineDivergenceObserved: boolean;
  readonly diagnosticOnly: boolean;
  readonly canMutateNormalFullMatchScore: false;
  readonly canMutateNormalFullMatchScoringEvents: false;
  readonly canMutateProductionRouteResolution: false;
  readonly canMutateGlobalRouteSuccessRates: false;
  readonly canCreateProductionScoringEvents: false;
  readonly canClaimGlobalEconomy: false;
  readonly comparisonExplanation?: string;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptyIsolatedMiniMatchOverrideExperiment(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): FullMatchIsolatedMiniMatchOverrideExperiment {
  return {
    status: "not_available",
    scope: "production_resolution_forbidden",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    overrideAppliedInIsolatedExperiment: false,
    overrideAppliedToNormalLiveSelection: false,
    candidateLegal: false,
    candidateAvailable: false,
    rejectedClosedCandidateCount: 0,
    rejectedUnavailableCandidateCount: 0,
    isolatedSelectionDivergenceObserved: false,
    isolatedScoreDivergenceObserved: false,
    isolatedScoringEventDivergenceObserved: false,
    isolatedTimelineDivergenceObserved: false,
    diagnosticOnly: true,
    canMutateNormalFullMatchScore: false,
    canMutateNormalFullMatchScoringEvents: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    tags: [],
    warnings: input.warnings,
  };
}

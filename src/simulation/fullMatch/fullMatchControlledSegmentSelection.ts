export type FullMatchControlledSegmentSelectionStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type FullMatchControlledSegmentSelectionScope =
  | "experimental_controlled_segment_selection"
  | "production_fullmatch_selection_forbidden";

export type ControlledSegmentSelectionSource =
  | "none"
  | "shadow_route_selection";

export type FullMatchControlledSegmentSelectionResult = {
  readonly status: FullMatchControlledSegmentSelectionStatus;
  readonly scope: FullMatchControlledSegmentSelectionScope;
  readonly source: ControlledSegmentSelectionSource;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly selectedCandidateId?: string;
  readonly selectedActionType?: string;
  readonly selectedReceiverId?: string;
  readonly selectedTargetZone?: string;
  readonly selectedBaseScore?: number;
  readonly selectedInfluenceDelta?: number;
  readonly selectedInfluencedScore?: number;
  readonly selectedCandidateLegal: boolean;
  readonly selectedCandidateAvailable: boolean;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
  readonly diagnosticOnly: boolean;
  readonly experimentalControlledSelection: boolean;
  readonly canMutateScore: false;
  readonly canMutateScoringEvents: false;
  readonly canMutateRouteSuccessRates: false;
  readonly canDriveProductionFullMatchSelection: false;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptyControlledSegmentSelection(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): FullMatchControlledSegmentSelectionResult {
  return {
    status: "not_available",
    scope: "production_fullmatch_selection_forbidden",
    source: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    selectedCandidateLegal: false,
    selectedCandidateAvailable: false,
    rejectedClosedCandidateCount: 0,
    rejectedUnavailableCandidateCount: 0,
    diagnosticOnly: true,
    experimentalControlledSelection: false,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canMutateRouteSuccessRates: false,
    canDriveProductionFullMatchSelection: false,
    tags: [],
    warnings: input.warnings,
  };
}

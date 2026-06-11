export type FullMatchControlledMiniMatchRouteSourceStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type FullMatchControlledMiniMatchRouteSourceScope =
  | "experimental_controlled_minimatch_route_source"
  | "production_route_resolution_forbidden";

export type FullMatchControlledMiniMatchRouteSourceOrigin =
  | "none"
  | "segment_route_input";

export type FullMatchControlledMiniMatchRouteSource = {
  readonly status: FullMatchControlledMiniMatchRouteSourceStatus;
  readonly scope: FullMatchControlledMiniMatchRouteSourceScope;
  readonly origin: FullMatchControlledMiniMatchRouteSourceOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly candidateId?: string;
  readonly actionType?: string;
  readonly receiverId?: string;
  readonly targetZone?: string;
  readonly sourceBaseScore?: number;
  readonly sourceInfluenceDelta?: number;
  readonly sourceInfluencedScore?: number;
  readonly candidateLegal: boolean;
  readonly candidateAvailable: boolean;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
  readonly diagnosticOnly: boolean;
  readonly experimentalControlledRouteSource: boolean;
  readonly canMutateScore: false;
  readonly canMutateScoringEvents: false;
  readonly canMutateRouteSuccessRates: false;
  readonly canDriveProductionFullMatchSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canDriveLiveMiniMatchResolution: false;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptyControlledMiniMatchRouteSource(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): FullMatchControlledMiniMatchRouteSource {
  return {
    status: "not_available",
    scope: "production_route_resolution_forbidden",
    origin: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    candidateLegal: false,
    candidateAvailable: false,
    rejectedClosedCandidateCount: 0,
    rejectedUnavailableCandidateCount: 0,
    diagnosticOnly: true,
    experimentalControlledRouteSource: false,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canMutateRouteSuccessRates: false,
    canDriveProductionFullMatchSelection: false,
    canDriveProductionRouteResolution: false,
    canDriveLiveMiniMatchResolution: false,
    tags: [],
    warnings: input.warnings,
  };
}

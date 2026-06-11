export type FullMatchSegmentRouteInputStatus =
  | "not_available"
  | "available"
  | "partial"
  | "failed";

export type FullMatchSegmentRouteInputSource =
  | "none"
  | "controlled_segment_selection";

export type FullMatchSegmentRouteInputScope =
  | "experimental_segment_route_input"
  | "production_fullmatch_route_input_forbidden";

export type FullMatchSegmentRouteInput = {
  readonly status: FullMatchSegmentRouteInputStatus;
  readonly scope: FullMatchSegmentRouteInputScope;
  readonly source: FullMatchSegmentRouteInputSource;
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
  readonly experimentalRouteInput: boolean;
  readonly canMutateScore: false;
  readonly canMutateScoringEvents: false;
  readonly canMutateRouteSuccessRates: false;
  readonly canDriveProductionFullMatchSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

export function emptySegmentRouteInput(input: {
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly warnings: readonly string[];
}): FullMatchSegmentRouteInput {
  return {
    status: "not_available",
    scope: "production_fullmatch_route_input_forbidden",
    source: "none",
    ...(input.segmentLabel === undefined ? {} : { segmentLabel: input.segmentLabel }),
    ...(input.chainId === undefined ? {} : { chainId: input.chainId }),
    candidateLegal: false,
    candidateAvailable: false,
    rejectedClosedCandidateCount: 0,
    rejectedUnavailableCandidateCount: 0,
    diagnosticOnly: true,
    experimentalRouteInput: false,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canMutateRouteSuccessRates: false,
    canDriveProductionFullMatchSelection: false,
    canDriveProductionRouteResolution: false,
    tags: [],
    warnings: input.warnings,
  };
}

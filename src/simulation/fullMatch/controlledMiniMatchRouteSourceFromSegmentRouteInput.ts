import type { FullMatchSegmentRouteInput } from "./fullMatchSegmentRouteInput";
import {
  emptyControlledMiniMatchRouteSource,
  type FullMatchControlledMiniMatchRouteSource,
} from "./fullMatchControlledMiniMatchRouteSource";

export function controlledMiniMatchRouteSourceCannotMutateScore(
  source: FullMatchControlledMiniMatchRouteSource,
): boolean {
  return !source.canMutateScore && !source.canMutateScoringEvents && !source.canMutateRouteSuccessRates;
}

export function controlledMiniMatchRouteSourceCannotDriveLiveMiniMatchResolution(
  source: FullMatchControlledMiniMatchRouteSource,
): boolean {
  return (
    !source.canDriveProductionFullMatchSelection &&
    !source.canDriveProductionRouteResolution &&
    !source.canDriveLiveMiniMatchResolution
  );
}

export function validateControlledMiniMatchRouteSource(
  source: FullMatchControlledMiniMatchRouteSource,
): readonly string[] {
  const shouldValidateCandidate = source.status !== "not_available";

  return [
    ...(shouldValidateCandidate && source.candidateId === undefined ? ["CONTROLLED_MINIMATCH_ROUTE_SOURCE_MISSING_CANDIDATE"] : []),
    ...(shouldValidateCandidate && source.actionType === undefined ? ["CONTROLLED_MINIMATCH_ROUTE_SOURCE_MISSING_ACTION"] : []),
    ...(shouldValidateCandidate && source.receiverId === undefined ? ["CONTROLLED_MINIMATCH_ROUTE_SOURCE_MISSING_RECEIVER"] : []),
    ...(shouldValidateCandidate && source.targetZone === undefined ? ["CONTROLLED_MINIMATCH_ROUTE_SOURCE_MISSING_TARGET_ZONE"] : []),
    ...(shouldValidateCandidate && !source.candidateLegal ? ["CONTROLLED_MINIMATCH_ROUTE_SOURCE_ILLEGAL_CANDIDATE"] : []),
    ...(shouldValidateCandidate && !source.candidateAvailable ? ["CONTROLLED_MINIMATCH_ROUTE_SOURCE_UNAVAILABLE_CANDIDATE"] : []),
    ...(!controlledMiniMatchRouteSourceCannotMutateScore(source) ? ["CONTROLLED_MINIMATCH_ROUTE_SOURCE_MUTATION_FORBIDDEN_BREACH"] : []),
    ...(!controlledMiniMatchRouteSourceCannotDriveLiveMiniMatchResolution(source) ? ["CONTROLLED_MINIMATCH_ROUTE_SOURCE_LIVE_RESOLUTION_FORBIDDEN_BREACH"] : []),
  ];
}

function failedControlledMiniMatchRouteSourceFromSegmentRouteInput(
  segmentRouteInput: FullMatchSegmentRouteInput,
): FullMatchControlledMiniMatchRouteSource {
  return {
    status: "failed",
    scope: "production_route_resolution_forbidden",
    origin: "segment_route_input",
    ...(segmentRouteInput.segmentLabel === undefined ? {} : { segmentLabel: segmentRouteInput.segmentLabel }),
    ...(segmentRouteInput.chainId === undefined ? {} : { chainId: segmentRouteInput.chainId }),
    ...(segmentRouteInput.candidateId === undefined ? {} : { candidateId: segmentRouteInput.candidateId }),
    ...(segmentRouteInput.actionType === undefined ? {} : { actionType: segmentRouteInput.actionType }),
    ...(segmentRouteInput.receiverId === undefined ? {} : { receiverId: segmentRouteInput.receiverId }),
    ...(segmentRouteInput.targetZone === undefined ? {} : { targetZone: segmentRouteInput.targetZone }),
    ...(segmentRouteInput.sourceBaseScore === undefined ? {} : { sourceBaseScore: segmentRouteInput.sourceBaseScore }),
    ...(segmentRouteInput.sourceInfluenceDelta === undefined ? {} : { sourceInfluenceDelta: segmentRouteInput.sourceInfluenceDelta }),
    ...(segmentRouteInput.sourceInfluencedScore === undefined ? {} : { sourceInfluencedScore: segmentRouteInput.sourceInfluencedScore }),
    candidateLegal: segmentRouteInput.candidateLegal,
    candidateAvailable: segmentRouteInput.candidateAvailable,
    rejectedClosedCandidateCount: segmentRouteInput.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: segmentRouteInput.rejectedUnavailableCandidateCount,
    diagnosticOnly: true,
    experimentalControlledRouteSource: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canMutateRouteSuccessRates: false,
    canDriveProductionFullMatchSelection: false,
    canDriveProductionRouteResolution: false,
    canDriveLiveMiniMatchResolution: false,
    tags: [],
    warnings: [...segmentRouteInput.warnings, "CONTROLLED_MINIMATCH_ROUTE_SOURCE_FAILED_GUARD"],
  };
}

function availableControlledMiniMatchRouteSourceFromSegmentRouteInput(
  segmentRouteInput: FullMatchSegmentRouteInput,
): FullMatchControlledMiniMatchRouteSource {
  if (
    segmentRouteInput.candidateId === undefined ||
    segmentRouteInput.actionType === undefined ||
    segmentRouteInput.receiverId === undefined ||
    segmentRouteInput.targetZone === undefined ||
    !segmentRouteInput.candidateLegal ||
    !segmentRouteInput.candidateAvailable
  ) {
    return failedControlledMiniMatchRouteSourceFromSegmentRouteInput(segmentRouteInput);
  }

  return {
    status: "available",
    scope: "experimental_controlled_minimatch_route_source",
    origin: "segment_route_input",
    ...(segmentRouteInput.segmentLabel === undefined ? {} : { segmentLabel: segmentRouteInput.segmentLabel }),
    ...(segmentRouteInput.chainId === undefined ? {} : { chainId: segmentRouteInput.chainId }),
    candidateId: segmentRouteInput.candidateId,
    actionType: segmentRouteInput.actionType,
    receiverId: segmentRouteInput.receiverId,
    targetZone: segmentRouteInput.targetZone,
    ...(segmentRouteInput.sourceBaseScore === undefined ? {} : { sourceBaseScore: segmentRouteInput.sourceBaseScore }),
    ...(segmentRouteInput.sourceInfluenceDelta === undefined ? {} : { sourceInfluenceDelta: segmentRouteInput.sourceInfluenceDelta }),
    ...(segmentRouteInput.sourceInfluencedScore === undefined ? {} : { sourceInfluencedScore: segmentRouteInput.sourceInfluencedScore }),
    candidateLegal: segmentRouteInput.candidateLegal,
    candidateAvailable: segmentRouteInput.candidateAvailable,
    rejectedClosedCandidateCount: segmentRouteInput.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: segmentRouteInput.rejectedUnavailableCandidateCount,
    diagnosticOnly: true,
    experimentalControlledRouteSource: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canMutateRouteSuccessRates: false,
    canDriveProductionFullMatchSelection: false,
    canDriveProductionRouteResolution: false,
    canDriveLiveMiniMatchResolution: false,
    tags: [
      "workbench_chain_controlled_minimatch_route_source",
      "controlled_minimatch_route_source_experimental",
      "controlled_minimatch_route_source_diagnostic_only",
      `controlled_minimatch_route_source_candidate_${segmentRouteInput.candidateId}`,
      `controlled_minimatch_route_source_action_${segmentRouteInput.actionType}`,
      `controlled_minimatch_route_source_receiver_${segmentRouteInput.receiverId}`,
      `controlled_minimatch_route_source_zone_${segmentRouteInput.targetZone}`,
      "controlled_minimatch_route_source_score_mutation_forbidden",
      "controlled_minimatch_route_source_scoring_events_mutation_forbidden",
      "controlled_minimatch_route_source_route_success_mutation_forbidden",
      "controlled_minimatch_route_source_production_fullmatch_forbidden",
      "controlled_minimatch_route_source_production_resolution_forbidden",
      "controlled_minimatch_route_source_live_resolution_forbidden",
      "controlled_minimatch_route_source_closed_candidates_rejected",
      "controlled_minimatch_route_source_unavailable_candidates_rejected",
      ...(segmentRouteInput.chainId === undefined ? [] : [`controlled_minimatch_route_source_chain_id_${segmentRouteInput.chainId}`]),
    ],
    warnings: segmentRouteInput.warnings,
  };
}

export function controlledMiniMatchRouteSourceFromSegmentRouteInput(input: {
  readonly segmentRouteInput: FullMatchSegmentRouteInput;
}): FullMatchControlledMiniMatchRouteSource {
  if (input.segmentRouteInput.status === "not_available") {
    return emptyControlledMiniMatchRouteSource({
      ...(input.segmentRouteInput.segmentLabel === undefined ? {} : { segmentLabel: input.segmentRouteInput.segmentLabel }),
      ...(input.segmentRouteInput.chainId === undefined ? {} : { chainId: input.segmentRouteInput.chainId }),
      warnings: input.segmentRouteInput.warnings,
    });
  }

  const routeSource = availableControlledMiniMatchRouteSourceFromSegmentRouteInput(input.segmentRouteInput);
  const validationWarnings = validateControlledMiniMatchRouteSource(routeSource);

  if (validationWarnings.length === 0) {
    return routeSource;
  }

  return {
    ...routeSource,
    status: routeSource.status === "available" ? "failed" : routeSource.status,
    warnings: [...routeSource.warnings, ...validationWarnings],
  };
}

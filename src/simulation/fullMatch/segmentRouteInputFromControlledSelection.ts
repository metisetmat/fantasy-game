import type { FullMatchControlledSegmentSelectionResult } from "./fullMatchControlledSegmentSelection";
import {
  emptySegmentRouteInput,
  type FullMatchSegmentRouteInput,
} from "./fullMatchSegmentRouteInput";

export function segmentRouteInputCannotMutateScore(
  input: FullMatchSegmentRouteInput,
): boolean {
  return !input.canMutateScore && !input.canMutateScoringEvents && !input.canMutateRouteSuccessRates;
}

export function segmentRouteInputCannotDriveProductionRouteResolution(
  input: FullMatchSegmentRouteInput,
): boolean {
  return !input.canDriveProductionFullMatchSelection && !input.canDriveProductionRouteResolution;
}

export function validateSegmentRouteInput(
  input: FullMatchSegmentRouteInput,
): readonly string[] {
  const shouldValidateCandidate = input.status !== "not_available";

  return [
    ...(shouldValidateCandidate && input.candidateId === undefined ? ["SEGMENT_ROUTE_INPUT_MISSING_CANDIDATE"] : []),
    ...(shouldValidateCandidate && input.actionType === undefined ? ["SEGMENT_ROUTE_INPUT_MISSING_ACTION"] : []),
    ...(shouldValidateCandidate && input.receiverId === undefined ? ["SEGMENT_ROUTE_INPUT_MISSING_RECEIVER"] : []),
    ...(shouldValidateCandidate && input.targetZone === undefined ? ["SEGMENT_ROUTE_INPUT_MISSING_TARGET_ZONE"] : []),
    ...(shouldValidateCandidate && !input.candidateLegal ? ["SEGMENT_ROUTE_INPUT_ILLEGAL_CANDIDATE"] : []),
    ...(shouldValidateCandidate && !input.candidateAvailable ? ["SEGMENT_ROUTE_INPUT_UNAVAILABLE_CANDIDATE"] : []),
    ...(!segmentRouteInputCannotMutateScore(input) ? ["SEGMENT_ROUTE_INPUT_MUTATION_FORBIDDEN_BREACH"] : []),
    ...(!segmentRouteInputCannotDriveProductionRouteResolution(input) ? ["SEGMENT_ROUTE_INPUT_PRODUCTION_RESOLUTION_FORBIDDEN_BREACH"] : []),
  ];
}

function failedSegmentRouteInputFromControlledSelection(
  controlledSelection: FullMatchControlledSegmentSelectionResult,
): FullMatchSegmentRouteInput {
  return {
    status: "failed",
    scope: "production_fullmatch_route_input_forbidden",
    source: "controlled_segment_selection",
    ...(controlledSelection.segmentLabel === undefined ? {} : { segmentLabel: controlledSelection.segmentLabel }),
    ...(controlledSelection.chainId === undefined ? {} : { chainId: controlledSelection.chainId }),
    ...(controlledSelection.selectedCandidateId === undefined ? {} : { candidateId: controlledSelection.selectedCandidateId }),
    ...(controlledSelection.selectedActionType === undefined ? {} : { actionType: controlledSelection.selectedActionType }),
    ...(controlledSelection.selectedReceiverId === undefined ? {} : { receiverId: controlledSelection.selectedReceiverId }),
    ...(controlledSelection.selectedTargetZone === undefined ? {} : { targetZone: controlledSelection.selectedTargetZone }),
    candidateLegal: controlledSelection.selectedCandidateLegal,
    candidateAvailable: controlledSelection.selectedCandidateAvailable,
    rejectedClosedCandidateCount: controlledSelection.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: controlledSelection.rejectedUnavailableCandidateCount,
    diagnosticOnly: true,
    experimentalRouteInput: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canMutateRouteSuccessRates: false,
    canDriveProductionFullMatchSelection: false,
    canDriveProductionRouteResolution: false,
    tags: [],
    warnings: [...controlledSelection.warnings, "SEGMENT_ROUTE_INPUT_FAILED_GUARD"],
  };
}

function availableSegmentRouteInputFromControlledSelection(
  controlledSelection: FullMatchControlledSegmentSelectionResult,
): FullMatchSegmentRouteInput {
  if (
    controlledSelection.selectedCandidateId === undefined ||
    controlledSelection.selectedActionType === undefined ||
    controlledSelection.selectedReceiverId === undefined ||
    controlledSelection.selectedTargetZone === undefined ||
    !controlledSelection.selectedCandidateLegal ||
    !controlledSelection.selectedCandidateAvailable
  ) {
    return failedSegmentRouteInputFromControlledSelection(controlledSelection);
  }

  return {
    status: "available",
    scope: "experimental_segment_route_input",
    source: "controlled_segment_selection",
    ...(controlledSelection.segmentLabel === undefined ? {} : { segmentLabel: controlledSelection.segmentLabel }),
    ...(controlledSelection.chainId === undefined ? {} : { chainId: controlledSelection.chainId }),
    candidateId: controlledSelection.selectedCandidateId,
    actionType: controlledSelection.selectedActionType,
    receiverId: controlledSelection.selectedReceiverId,
    targetZone: controlledSelection.selectedTargetZone,
    ...(controlledSelection.selectedBaseScore === undefined ? {} : { sourceBaseScore: controlledSelection.selectedBaseScore }),
    ...(controlledSelection.selectedInfluenceDelta === undefined ? {} : { sourceInfluenceDelta: controlledSelection.selectedInfluenceDelta }),
    ...(controlledSelection.selectedInfluencedScore === undefined ? {} : { sourceInfluencedScore: controlledSelection.selectedInfluencedScore }),
    candidateLegal: controlledSelection.selectedCandidateLegal,
    candidateAvailable: controlledSelection.selectedCandidateAvailable,
    rejectedClosedCandidateCount: controlledSelection.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: controlledSelection.rejectedUnavailableCandidateCount,
    diagnosticOnly: true,
    experimentalRouteInput: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canMutateRouteSuccessRates: false,
    canDriveProductionFullMatchSelection: false,
    canDriveProductionRouteResolution: false,
    tags: [
      "workbench_chain_segment_route_input",
      "segment_route_input_experimental",
      "segment_route_input_diagnostic_only",
      `segment_route_input_candidate_${controlledSelection.selectedCandidateId}`,
      `segment_route_input_action_${controlledSelection.selectedActionType}`,
      `segment_route_input_receiver_${controlledSelection.selectedReceiverId}`,
      `segment_route_input_zone_${controlledSelection.selectedTargetZone}`,
      "segment_route_input_score_mutation_forbidden",
      "segment_route_input_scoring_events_mutation_forbidden",
      "segment_route_input_route_success_mutation_forbidden",
      "segment_route_input_production_fullmatch_forbidden",
      "segment_route_input_production_resolution_forbidden",
      "segment_route_input_closed_candidates_rejected",
      "segment_route_input_unavailable_candidates_rejected",
      ...(controlledSelection.chainId === undefined ? [] : [`segment_route_input_chain_id_${controlledSelection.chainId}`]),
    ],
    warnings: controlledSelection.warnings,
  };
}

export function segmentRouteInputFromControlledSelection(input: {
  readonly controlledSelection: FullMatchControlledSegmentSelectionResult;
}): FullMatchSegmentRouteInput {
  if (input.controlledSelection.status === "not_available") {
    return emptySegmentRouteInput({
      ...(input.controlledSelection.segmentLabel === undefined ? {} : { segmentLabel: input.controlledSelection.segmentLabel }),
      ...(input.controlledSelection.chainId === undefined ? {} : { chainId: input.controlledSelection.chainId }),
      warnings: input.controlledSelection.warnings,
    });
  }

  const routeInput = availableSegmentRouteInputFromControlledSelection(input.controlledSelection);
  const validationWarnings = validateSegmentRouteInput(routeInput);

  if (validationWarnings.length === 0) {
    return routeInput;
  }

  return {
    ...routeInput,
    status: routeInput.status === "available" ? "failed" : routeInput.status,
    warnings: [...routeInput.warnings, ...validationWarnings],
  };
}

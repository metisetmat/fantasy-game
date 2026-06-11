import type { FullMatchControlledMiniMatchRouteSource } from "./fullMatchControlledMiniMatchRouteSource";
import {
  emptyLiveSelectionOverrideGuard,
  type FullMatchLiveSelectionOverrideGuard,
} from "./fullMatchLiveSelectionOverrideGuard";

export function liveSelectionOverrideGuardCannotMutateScore(
  guard: FullMatchLiveSelectionOverrideGuard,
): boolean {
  return (
    !guard.canMutateScore &&
    !guard.canMutateScoringEvents &&
    !guard.canMutateRouteSuccessRates &&
    !guard.canCreateScoringEvents
  );
}

export function liveSelectionOverrideGuardCannotDriveNormalLiveResolution(
  guard: FullMatchLiveSelectionOverrideGuard,
): boolean {
  return (
    !guard.canDriveProductionFullMatchSelection &&
    !guard.canDriveProductionRouteResolution &&
    !guard.canDriveNormalLiveMiniMatchResolution &&
    !guard.overrideAppliedToLiveSelection
  );
}

export function validateLiveSelectionOverrideGuard(
  guard: FullMatchLiveSelectionOverrideGuard,
): readonly string[] {
  const shouldValidateCandidate = guard.status !== "not_available";

  return [
    ...(shouldValidateCandidate && guard.overrideCandidateId === undefined ? ["LIVE_SELECTION_OVERRIDE_MISSING_CANDIDATE"] : []),
    ...(shouldValidateCandidate && guard.overrideActionType === undefined ? ["LIVE_SELECTION_OVERRIDE_MISSING_ACTION"] : []),
    ...(shouldValidateCandidate && guard.overrideReceiverId === undefined ? ["LIVE_SELECTION_OVERRIDE_MISSING_RECEIVER"] : []),
    ...(shouldValidateCandidate && guard.overrideTargetZone === undefined ? ["LIVE_SELECTION_OVERRIDE_MISSING_TARGET_ZONE"] : []),
    ...(shouldValidateCandidate && !guard.candidateLegal ? ["LIVE_SELECTION_OVERRIDE_ILLEGAL_CANDIDATE"] : []),
    ...(shouldValidateCandidate && !guard.candidateAvailable ? ["LIVE_SELECTION_OVERRIDE_UNAVAILABLE_CANDIDATE"] : []),
    ...(guard.overrideAppliedToLiveSelection ? ["LIVE_SELECTION_OVERRIDE_WAS_APPLIED"] : []),
    ...(!liveSelectionOverrideGuardCannotMutateScore(guard) ? ["LIVE_SELECTION_OVERRIDE_MUTATION_FORBIDDEN_BREACH"] : []),
    ...(!liveSelectionOverrideGuardCannotDriveNormalLiveResolution(guard) ? ["LIVE_SELECTION_OVERRIDE_LIVE_RESOLUTION_FORBIDDEN_BREACH"] : []),
  ];
}

function blockedLiveSelectionOverrideGuardFromControlledRouteSource(
  controlledRouteSource: FullMatchControlledMiniMatchRouteSource,
): FullMatchLiveSelectionOverrideGuard {
  return {
    status: "blocked",
    scope: "production_live_resolution_forbidden",
    origin: "controlled_minimatch_route_source",
    ...(controlledRouteSource.segmentLabel === undefined ? {} : { segmentLabel: controlledRouteSource.segmentLabel }),
    ...(controlledRouteSource.chainId === undefined ? {} : { chainId: controlledRouteSource.chainId }),
    ...(controlledRouteSource.candidateId === undefined ? {} : { overrideCandidateId: controlledRouteSource.candidateId }),
    ...(controlledRouteSource.actionType === undefined ? {} : { overrideActionType: controlledRouteSource.actionType }),
    ...(controlledRouteSource.receiverId === undefined ? {} : { overrideReceiverId: controlledRouteSource.receiverId }),
    ...(controlledRouteSource.targetZone === undefined ? {} : { overrideTargetZone: controlledRouteSource.targetZone }),
    ...(controlledRouteSource.sourceBaseScore === undefined ? {} : { sourceBaseScore: controlledRouteSource.sourceBaseScore }),
    ...(controlledRouteSource.sourceInfluenceDelta === undefined ? {} : { sourceInfluenceDelta: controlledRouteSource.sourceInfluenceDelta }),
    ...(controlledRouteSource.sourceInfluencedScore === undefined ? {} : { sourceInfluencedScore: controlledRouteSource.sourceInfluencedScore }),
    candidateLegal: controlledRouteSource.candidateLegal,
    candidateAvailable: controlledRouteSource.candidateAvailable,
    rejectedClosedCandidateCount: controlledRouteSource.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: controlledRouteSource.rejectedUnavailableCandidateCount,
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
    warnings: [...controlledRouteSource.warnings, "LIVE_SELECTION_OVERRIDE_GUARD_BLOCKED"],
  };
}

function availableLiveSelectionOverrideGuardFromControlledRouteSource(
  controlledRouteSource: FullMatchControlledMiniMatchRouteSource,
): FullMatchLiveSelectionOverrideGuard {
  if (
    controlledRouteSource.candidateId === undefined ||
    controlledRouteSource.actionType === undefined ||
    controlledRouteSource.receiverId === undefined ||
    controlledRouteSource.targetZone === undefined ||
    !controlledRouteSource.candidateLegal ||
    !controlledRouteSource.candidateAvailable
  ) {
    return blockedLiveSelectionOverrideGuardFromControlledRouteSource(controlledRouteSource);
  }

  return {
    status: "available",
    scope: "experimental_live_selection_override_guard",
    origin: "controlled_minimatch_route_source",
    ...(controlledRouteSource.segmentLabel === undefined ? {} : { segmentLabel: controlledRouteSource.segmentLabel }),
    ...(controlledRouteSource.chainId === undefined ? {} : { chainId: controlledRouteSource.chainId }),
    overrideCandidateId: controlledRouteSource.candidateId,
    overrideActionType: controlledRouteSource.actionType,
    overrideReceiverId: controlledRouteSource.receiverId,
    overrideTargetZone: controlledRouteSource.targetZone,
    ...(controlledRouteSource.sourceBaseScore === undefined ? {} : { sourceBaseScore: controlledRouteSource.sourceBaseScore }),
    ...(controlledRouteSource.sourceInfluenceDelta === undefined ? {} : { sourceInfluenceDelta: controlledRouteSource.sourceInfluenceDelta }),
    ...(controlledRouteSource.sourceInfluencedScore === undefined ? {} : { sourceInfluencedScore: controlledRouteSource.sourceInfluencedScore }),
    candidateLegal: controlledRouteSource.candidateLegal,
    candidateAvailable: controlledRouteSource.candidateAvailable,
    rejectedClosedCandidateCount: controlledRouteSource.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: controlledRouteSource.rejectedUnavailableCandidateCount,
    experimentalOverridePrepared: true,
    overrideAppliedToLiveSelection: false,
    diagnosticOnly: true,
    canMutateScore: false,
    canMutateScoringEvents: false,
    canMutateRouteSuccessRates: false,
    canDriveProductionFullMatchSelection: false,
    canDriveProductionRouteResolution: false,
    canDriveNormalLiveMiniMatchResolution: false,
    canCreateScoringEvents: false,
    tags: [
      "workbench_chain_live_selection_override_guard",
      "live_selection_override_guard_experimental",
      "live_selection_override_guard_diagnostic_only",
      `live_selection_override_candidate_${controlledRouteSource.candidateId}`,
      `live_selection_override_action_${controlledRouteSource.actionType}`,
      `live_selection_override_receiver_${controlledRouteSource.receiverId}`,
      `live_selection_override_zone_${controlledRouteSource.targetZone}`,
      "live_selection_override_applied_false",
      "live_selection_override_score_mutation_forbidden",
      "live_selection_override_scoring_events_mutation_forbidden",
      "live_selection_override_route_success_mutation_forbidden",
      "live_selection_override_production_fullmatch_forbidden",
      "live_selection_override_production_resolution_forbidden",
      "live_selection_override_normal_live_resolution_forbidden",
      "live_selection_override_scoring_event_creation_forbidden",
      "live_selection_override_closed_candidates_rejected",
      "live_selection_override_unavailable_candidates_rejected",
      ...(controlledRouteSource.chainId === undefined ? [] : [`live_selection_override_chain_id_${controlledRouteSource.chainId}`]),
    ],
    warnings: controlledRouteSource.warnings,
  };
}

export function liveSelectionOverrideGuardFromControlledRouteSource(input: {
  readonly controlledRouteSource: FullMatchControlledMiniMatchRouteSource;
}): FullMatchLiveSelectionOverrideGuard {
  if (input.controlledRouteSource.status === "not_available") {
    return emptyLiveSelectionOverrideGuard({
      ...(input.controlledRouteSource.segmentLabel === undefined ? {} : { segmentLabel: input.controlledRouteSource.segmentLabel }),
      ...(input.controlledRouteSource.chainId === undefined ? {} : { chainId: input.controlledRouteSource.chainId }),
      warnings: input.controlledRouteSource.warnings,
    });
  }

  const guard = availableLiveSelectionOverrideGuardFromControlledRouteSource(input.controlledRouteSource);
  const validationWarnings = validateLiveSelectionOverrideGuard(guard);

  if (validationWarnings.length === 0) {
    return guard;
  }

  return {
    ...guard,
    status: guard.status === "available" ? "failed" : guard.status,
    warnings: [...guard.warnings, ...validationWarnings],
  };
}

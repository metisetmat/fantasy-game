import type { FullMatchLiveSelectionOverrideGuard } from "./fullMatchLiveSelectionOverrideGuard";
import {
  emptyIsolatedMiniMatchOverrideExperiment,
  type FullMatchIsolatedMiniMatchOverrideExperiment,
} from "./fullMatchIsolatedMiniMatchOverrideExperiment";
import { compareIsolatedMiniMatchOverride } from "./compareIsolatedMiniMatchOverride";

export function isolatedMiniMatchOverrideCannotMutateNormalFullMatch(
  experiment: FullMatchIsolatedMiniMatchOverrideExperiment,
): boolean {
  return (
    !experiment.canMutateNormalFullMatchScore &&
    !experiment.canMutateNormalFullMatchScoringEvents &&
    !experiment.canMutateProductionRouteResolution &&
    !experiment.canMutateGlobalRouteSuccessRates &&
    !experiment.canCreateProductionScoringEvents &&
    !experiment.overrideAppliedToNormalLiveSelection
  );
}

export function isolatedMiniMatchOverrideCannotClaimGlobalEconomy(
  experiment: FullMatchIsolatedMiniMatchOverrideExperiment,
): boolean {
  return !experiment.canClaimGlobalEconomy;
}

export function validateIsolatedMiniMatchOverrideExperiment(
  experiment: FullMatchIsolatedMiniMatchOverrideExperiment,
): readonly string[] {
  const shouldValidateCandidate = experiment.status !== "not_available";

  return [
    ...(shouldValidateCandidate && experiment.overrideCandidateId === undefined ? ["ISOLATED_OVERRIDE_MISSING_CANDIDATE"] : []),
    ...(shouldValidateCandidate && experiment.overrideActionType === undefined ? ["ISOLATED_OVERRIDE_MISSING_ACTION"] : []),
    ...(shouldValidateCandidate && experiment.overrideReceiverId === undefined ? ["ISOLATED_OVERRIDE_MISSING_RECEIVER"] : []),
    ...(shouldValidateCandidate && experiment.overrideTargetZone === undefined ? ["ISOLATED_OVERRIDE_MISSING_TARGET_ZONE"] : []),
    ...(shouldValidateCandidate && !experiment.candidateLegal ? ["ISOLATED_OVERRIDE_ILLEGAL_CANDIDATE"] : []),
    ...(shouldValidateCandidate && !experiment.candidateAvailable ? ["ISOLATED_OVERRIDE_UNAVAILABLE_CANDIDATE"] : []),
    ...(experiment.overrideAppliedToNormalLiveSelection ? ["ISOLATED_OVERRIDE_APPLIED_TO_NORMAL_LIVE_SELECTION"] : []),
    ...(!isolatedMiniMatchOverrideCannotMutateNormalFullMatch(experiment) ? ["ISOLATED_OVERRIDE_MUTATION_FORBIDDEN_BREACH"] : []),
    ...(!isolatedMiniMatchOverrideCannotClaimGlobalEconomy(experiment) ? ["ISOLATED_OVERRIDE_GLOBAL_ECONOMY_CLAIM_BREACH"] : []),
  ];
}

function blockedIsolatedMiniMatchOverrideExperimentFromGuard(
  liveSelectionOverrideGuard: FullMatchLiveSelectionOverrideGuard,
  input: {
    readonly baselineCandidateId?: string;
    readonly baselineActionType?: string;
    readonly baselineReceiverId?: string;
    readonly baselineTargetZone?: string;
  },
): FullMatchIsolatedMiniMatchOverrideExperiment {
  return {
    status: "blocked",
    scope: "production_resolution_forbidden",
    origin: "live_selection_override_guard",
    ...(liveSelectionOverrideGuard.segmentLabel === undefined ? {} : { segmentLabel: liveSelectionOverrideGuard.segmentLabel }),
    ...(liveSelectionOverrideGuard.chainId === undefined ? {} : { chainId: liveSelectionOverrideGuard.chainId }),
    ...(input.baselineCandidateId === undefined ? {} : { baselineCandidateId: input.baselineCandidateId }),
    ...(input.baselineActionType === undefined ? {} : { baselineActionType: input.baselineActionType }),
    ...(input.baselineReceiverId === undefined ? {} : { baselineReceiverId: input.baselineReceiverId }),
    ...(input.baselineTargetZone === undefined ? {} : { baselineTargetZone: input.baselineTargetZone }),
    ...(liveSelectionOverrideGuard.overrideCandidateId === undefined ? {} : { overrideCandidateId: liveSelectionOverrideGuard.overrideCandidateId }),
    ...(liveSelectionOverrideGuard.overrideActionType === undefined ? {} : { overrideActionType: liveSelectionOverrideGuard.overrideActionType }),
    ...(liveSelectionOverrideGuard.overrideReceiverId === undefined ? {} : { overrideReceiverId: liveSelectionOverrideGuard.overrideReceiverId }),
    ...(liveSelectionOverrideGuard.overrideTargetZone === undefined ? {} : { overrideTargetZone: liveSelectionOverrideGuard.overrideTargetZone }),
    overrideAppliedInIsolatedExperiment: false,
    overrideAppliedToNormalLiveSelection: false,
    candidateLegal: liveSelectionOverrideGuard.candidateLegal,
    candidateAvailable: liveSelectionOverrideGuard.candidateAvailable,
    rejectedClosedCandidateCount: liveSelectionOverrideGuard.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: liveSelectionOverrideGuard.rejectedUnavailableCandidateCount,
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
    warnings: [...liveSelectionOverrideGuard.warnings, "ISOLATED_MINIMATCH_OVERRIDE_EXPERIMENT_BLOCKED"],
  };
}

function availableIsolatedMiniMatchOverrideExperimentFromGuard(
  liveSelectionOverrideGuard: FullMatchLiveSelectionOverrideGuard,
  input: {
    readonly baselineCandidateId?: string;
    readonly baselineActionType?: string;
    readonly baselineReceiverId?: string;
    readonly baselineTargetZone?: string;
  },
): FullMatchIsolatedMiniMatchOverrideExperiment {
  if (
    liveSelectionOverrideGuard.overrideCandidateId === undefined ||
    liveSelectionOverrideGuard.overrideActionType === undefined ||
    liveSelectionOverrideGuard.overrideReceiverId === undefined ||
    liveSelectionOverrideGuard.overrideTargetZone === undefined ||
    !liveSelectionOverrideGuard.candidateLegal ||
    !liveSelectionOverrideGuard.candidateAvailable
  ) {
    return blockedIsolatedMiniMatchOverrideExperimentFromGuard(liveSelectionOverrideGuard, input);
  }

  const comparison = compareIsolatedMiniMatchOverride({
    baselineSelection: {
      ...(input.baselineCandidateId === undefined ? {} : { candidateId: input.baselineCandidateId }),
      ...(input.baselineActionType === undefined ? {} : { actionType: input.baselineActionType }),
      ...(input.baselineReceiverId === undefined ? {} : { receiverId: input.baselineReceiverId }),
      ...(input.baselineTargetZone === undefined ? {} : { targetZone: input.baselineTargetZone }),
    },
    overrideSelection: {
      candidateId: liveSelectionOverrideGuard.overrideCandidateId,
      actionType: liveSelectionOverrideGuard.overrideActionType,
      receiverId: liveSelectionOverrideGuard.overrideReceiverId,
      targetZone: liveSelectionOverrideGuard.overrideTargetZone,
    },
  });

  return {
    status: "available",
    scope: "isolated_minimatch_override_experiment",
    origin: "live_selection_override_guard",
    ...(liveSelectionOverrideGuard.segmentLabel === undefined ? {} : { segmentLabel: liveSelectionOverrideGuard.segmentLabel }),
    ...(liveSelectionOverrideGuard.chainId === undefined ? {} : { chainId: liveSelectionOverrideGuard.chainId }),
    ...(input.baselineCandidateId === undefined ? {} : { baselineCandidateId: input.baselineCandidateId }),
    ...(input.baselineActionType === undefined ? {} : { baselineActionType: input.baselineActionType }),
    ...(input.baselineReceiverId === undefined ? {} : { baselineReceiverId: input.baselineReceiverId }),
    ...(input.baselineTargetZone === undefined ? {} : { baselineTargetZone: input.baselineTargetZone }),
    overrideCandidateId: liveSelectionOverrideGuard.overrideCandidateId,
    overrideActionType: liveSelectionOverrideGuard.overrideActionType,
    overrideReceiverId: liveSelectionOverrideGuard.overrideReceiverId,
    overrideTargetZone: liveSelectionOverrideGuard.overrideTargetZone,
    overrideAppliedInIsolatedExperiment: true,
    overrideAppliedToNormalLiveSelection: false,
    candidateLegal: liveSelectionOverrideGuard.candidateLegal,
    candidateAvailable: liveSelectionOverrideGuard.candidateAvailable,
    rejectedClosedCandidateCount: liveSelectionOverrideGuard.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: liveSelectionOverrideGuard.rejectedUnavailableCandidateCount,
    isolatedSelectionDivergenceObserved: comparison.selectionDivergenceObserved,
    isolatedScoreDivergenceObserved: comparison.scoreDivergenceObserved,
    isolatedScoringEventDivergenceObserved: comparison.scoringEventDivergenceObserved,
    isolatedTimelineDivergenceObserved: comparison.timelineDivergenceObserved,
    diagnosticOnly: true,
    canMutateNormalFullMatchScore: false,
    canMutateNormalFullMatchScoringEvents: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    comparisonExplanation: comparison.explanation,
    tags: [
      "workbench_chain_isolated_minimatch_override_experiment",
      "isolated_minimatch_override_experiment",
      `isolated_override_candidate_${liveSelectionOverrideGuard.overrideCandidateId}`,
      `isolated_override_action_${liveSelectionOverrideGuard.overrideActionType}`,
      `isolated_override_receiver_${liveSelectionOverrideGuard.overrideReceiverId}`,
      `isolated_override_zone_${liveSelectionOverrideGuard.overrideTargetZone}`,
      "isolated_override_applied_in_experiment_true",
      "isolated_override_applied_to_normal_live_false",
      "isolated_override_normal_score_mutation_forbidden",
      "isolated_override_normal_scoring_events_mutation_forbidden",
      "isolated_override_production_resolution_forbidden",
      "isolated_override_global_route_success_mutation_forbidden",
      "isolated_override_production_scoring_event_creation_forbidden",
      "isolated_override_global_economy_claim_forbidden",
      "isolated_override_closed_candidates_rejected",
      "isolated_override_unavailable_candidates_rejected",
      ...(liveSelectionOverrideGuard.chainId === undefined ? [] : [`isolated_override_chain_id_${liveSelectionOverrideGuard.chainId}`]),
    ],
    warnings: liveSelectionOverrideGuard.warnings,
  };
}

export function isolatedMiniMatchOverrideExperimentFromGuard(input: {
  readonly liveSelectionOverrideGuard: FullMatchLiveSelectionOverrideGuard;
  readonly baselineCandidateId?: string;
  readonly baselineActionType?: string;
  readonly baselineReceiverId?: string;
  readonly baselineTargetZone?: string;
}): FullMatchIsolatedMiniMatchOverrideExperiment {
  if (input.liveSelectionOverrideGuard.status !== "available") {
    return emptyIsolatedMiniMatchOverrideExperiment({
      ...(input.liveSelectionOverrideGuard.segmentLabel === undefined ? {} : { segmentLabel: input.liveSelectionOverrideGuard.segmentLabel }),
      ...(input.liveSelectionOverrideGuard.chainId === undefined ? {} : { chainId: input.liveSelectionOverrideGuard.chainId }),
      warnings: input.liveSelectionOverrideGuard.warnings,
    });
  }

  const experiment = availableIsolatedMiniMatchOverrideExperimentFromGuard(input.liveSelectionOverrideGuard, input);
  const validationWarnings = validateIsolatedMiniMatchOverrideExperiment(experiment);

  if (validationWarnings.length === 0) {
    return experiment;
  }

  return {
    ...experiment,
    status: experiment.status === "available" ? "failed" : experiment.status,
    warnings: [...experiment.warnings, ...validationWarnings],
  };
}

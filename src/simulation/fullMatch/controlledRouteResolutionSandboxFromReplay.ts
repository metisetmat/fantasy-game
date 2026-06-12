import { compareControlledRouteResolutionSandbox } from "./compareControlledRouteResolutionSandbox";
import {
  emptyControlledRouteResolutionSandbox,
  type ControlledRouteResolutionSandbox,
} from "./controlledRouteResolutionSandbox";
import type { FullMatchRealIsolatedSegmentReplay } from "./fullMatchRealIsolatedSegmentReplay";
import { resolveControlledRouteInSandbox } from "./resolveControlledRouteInSandbox";

export function controlledRouteResolutionSandboxCannotMutateOfficialFullMatch(
  sandbox: ControlledRouteResolutionSandbox,
): boolean {
  const results = [sandbox.baseline, sandbox.override];

  return (
    !sandbox.canInjectEventsIntoOfficialTimeline &&
    !sandbox.canMutateOfficialScore &&
    !sandbox.canMutateOfficialScoringEvents &&
    !sandbox.canMutateProductionRouteResolution &&
    !sandbox.canMutateGlobalRouteSuccessRates &&
    !sandbox.canCreateProductionScoringEvents &&
    !sandbox.sandboxAppliedToNormalLiveSelection &&
    results.every((result) =>
      result.isolatedOnly &&
      !result.canBecomeOfficialMatchEvent &&
      !result.canMutateOfficialScore &&
      !result.canCreateOfficialScoringEvent
    )
  );
}

export function controlledRouteResolutionSandboxCannotClaimGlobalEconomy(
  sandbox: ControlledRouteResolutionSandbox,
): boolean {
  return !sandbox.canClaimGlobalEconomy;
}

export function validateControlledRouteResolutionSandbox(
  sandbox: ControlledRouteResolutionSandbox,
): readonly string[] {
  const shouldValidate = sandbox.status === "available";
  const results = [sandbox.baseline, sandbox.override];

  return [
    ...(shouldValidate && !sandbox.baselineResolved ? ["CONTROLLED_ROUTE_SANDBOX_BASELINE_NOT_RESOLVED"] : []),
    ...(shouldValidate && !sandbox.overrideResolved ? ["CONTROLLED_ROUTE_SANDBOX_OVERRIDE_NOT_RESOLVED"] : []),
    ...(shouldValidate && !sandbox.override.candidateLegal ? ["CONTROLLED_ROUTE_SANDBOX_ILLEGAL_OVERRIDE"] : []),
    ...(shouldValidate && !sandbox.override.candidateAvailable ? ["CONTROLLED_ROUTE_SANDBOX_UNAVAILABLE_OVERRIDE"] : []),
    ...(shouldValidate && !sandbox.sandboxAppliedOnlyInIsolatedResolution ? ["CONTROLLED_ROUTE_SANDBOX_NOT_ISOLATED"] : []),
    ...(sandbox.sandboxAppliedToNormalLiveSelection ? ["CONTROLLED_ROUTE_SANDBOX_APPLIED_TO_NORMAL_LIVE"] : []),
    ...(results.some((result) => !result.isolatedOnly) ? ["CONTROLLED_ROUTE_SANDBOX_RESULT_NOT_ISOLATED_ONLY"] : []),
    ...(results.some((result) => result.canBecomeOfficialMatchEvent) ? ["CONTROLLED_ROUTE_SANDBOX_RESULT_CAN_BECOME_MATCH_EVENT"] : []),
    ...(results.some((result) => result.canMutateOfficialScore) ? ["CONTROLLED_ROUTE_SANDBOX_RESULT_CAN_MUTATE_SCORE"] : []),
    ...(results.some((result) => result.canCreateOfficialScoringEvent) ? ["CONTROLLED_ROUTE_SANDBOX_RESULT_CAN_CREATE_SCORING_EVENT"] : []),
    ...(!controlledRouteResolutionSandboxCannotMutateOfficialFullMatch(sandbox)
      ? ["CONTROLLED_ROUTE_SANDBOX_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!controlledRouteResolutionSandboxCannotClaimGlobalEconomy(sandbox)
      ? ["CONTROLLED_ROUTE_SANDBOX_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
  ];
}

function blockedControlledRouteResolutionSandboxFromReplay(
  replay: FullMatchRealIsolatedSegmentReplay,
): ControlledRouteResolutionSandbox {
  const baseline = resolveControlledRouteInSandbox({
    pathId: "baseline",
    segmentLabel: replay.segmentLabel ?? "segment-1",
    ...(replay.baseline.candidateId === undefined ? {} : { candidateId: replay.baseline.candidateId }),
    ...(replay.baseline.actionType === undefined ? {} : { actionType: replay.baseline.actionType }),
    ...(replay.baseline.receiverId === undefined ? {} : { receiverId: replay.baseline.receiverId }),
    ...(replay.baseline.targetZone === undefined ? {} : { targetZone: replay.baseline.targetZone }),
    candidateLegal: replay.baseline.candidateLegal,
    candidateAvailable: replay.baseline.candidateAvailable,
  });
  const override = resolveControlledRouteInSandbox({
    pathId: "override",
    segmentLabel: replay.segmentLabel ?? "segment-1",
    ...(replay.override.candidateId === undefined ? {} : { candidateId: replay.override.candidateId }),
    ...(replay.override.actionType === undefined ? {} : { actionType: replay.override.actionType }),
    ...(replay.override.receiverId === undefined ? {} : { receiverId: replay.override.receiverId }),
    ...(replay.override.targetZone === undefined ? {} : { targetZone: replay.override.targetZone }),
    candidateLegal: replay.override.candidateLegal,
    candidateAvailable: replay.override.candidateAvailable,
  });

  return {
    status: "blocked",
    scope: "production_resolution_forbidden",
    origin: "real_isolated_segment_replay",
    ...(replay.segmentLabel === undefined ? {} : { segmentLabel: replay.segmentLabel }),
    ...(replay.chainId === undefined ? {} : { chainId: replay.chainId }),
    baseline,
    override,
    baselineResolved: baseline.routeResolved,
    overrideResolved: override.routeResolved,
    selectionDivergenceObserved: false,
    carrierDivergenceObserved: false,
    zoneProgressionDivergenceObserved: false,
    dangerCreationDivergenceObserved: false,
    scoringOpportunityDivergenceObserved: false,
    sandboxScoringEventDivergenceObserved: false,
    sandboxScoreDivergenceObserved: false,
    sandboxAppliedOnlyInIsolatedResolution: false,
    sandboxAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: replay.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: replay.rejectedUnavailableCandidateCount,
    diagnosticOnly: true,
    canInjectEventsIntoOfficialTimeline: false,
    canMutateOfficialScore: false,
    canMutateOfficialScoringEvents: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    tags: [],
    warnings: [...replay.warnings, "CONTROLLED_ROUTE_RESOLUTION_SANDBOX_BLOCKED"],
  };
}

export function controlledRouteResolutionSandboxFromReplay(input: {
  readonly replay: FullMatchRealIsolatedSegmentReplay;
}): ControlledRouteResolutionSandbox {
  if (input.replay.status !== "available") {
    return emptyControlledRouteResolutionSandbox({
      ...(input.replay.segmentLabel === undefined ? {} : { segmentLabel: input.replay.segmentLabel }),
      ...(input.replay.chainId === undefined ? {} : { chainId: input.replay.chainId }),
      warnings: input.replay.warnings,
    });
  }

  if (
    input.replay.baseline.candidateId === undefined ||
    input.replay.override.candidateId === undefined ||
    !input.replay.override.candidateLegal ||
    !input.replay.override.candidateAvailable
  ) {
    return blockedControlledRouteResolutionSandboxFromReplay(input.replay);
  }

  const segmentLabel = input.replay.segmentLabel ?? "segment-1";
  const baseline = resolveControlledRouteInSandbox({
    pathId: "baseline",
    segmentLabel,
    candidateId: input.replay.baseline.candidateId,
    ...(input.replay.baseline.actionType === undefined ? {} : { actionType: input.replay.baseline.actionType }),
    ...(input.replay.baseline.receiverId === undefined ? {} : { receiverId: input.replay.baseline.receiverId }),
    ...(input.replay.baseline.targetZone === undefined ? {} : { targetZone: input.replay.baseline.targetZone }),
    candidateLegal: input.replay.baseline.candidateLegal,
    candidateAvailable: input.replay.baseline.candidateAvailable,
  });
  const override = resolveControlledRouteInSandbox({
    pathId: "override",
    segmentLabel,
    candidateId: input.replay.override.candidateId,
    ...(input.replay.override.actionType === undefined ? {} : { actionType: input.replay.override.actionType }),
    ...(input.replay.override.receiverId === undefined ? {} : { receiverId: input.replay.override.receiverId }),
    ...(input.replay.override.targetZone === undefined ? {} : { targetZone: input.replay.override.targetZone }),
    candidateLegal: input.replay.override.candidateLegal,
    candidateAvailable: input.replay.override.candidateAvailable,
  });
  const comparison = compareControlledRouteResolutionSandbox({ baseline, override });
  const result: ControlledRouteResolutionSandbox = {
    status: "available",
    scope: "controlled_route_resolution_sandbox",
    origin: "real_isolated_segment_replay",
    ...(input.replay.segmentLabel === undefined ? {} : { segmentLabel: input.replay.segmentLabel }),
    ...(input.replay.chainId === undefined ? {} : { chainId: input.replay.chainId }),
    baseline,
    override,
    baselineResolved: baseline.routeResolved,
    overrideResolved: override.routeResolved,
    selectionDivergenceObserved: comparison.selectionDivergenceObserved,
    carrierDivergenceObserved: comparison.carrierDivergenceObserved,
    zoneProgressionDivergenceObserved: comparison.zoneProgressionDivergenceObserved,
    dangerCreationDivergenceObserved: comparison.dangerCreationDivergenceObserved,
    scoringOpportunityDivergenceObserved: comparison.scoringOpportunityDivergenceObserved,
    sandboxScoringEventDivergenceObserved: comparison.sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved: comparison.sandboxScoreDivergenceObserved,
    sandboxAppliedOnlyInIsolatedResolution: true,
    sandboxAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: input.replay.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: input.replay.rejectedUnavailableCandidateCount,
    diagnosticOnly: true,
    canInjectEventsIntoOfficialTimeline: false,
    canMutateOfficialScore: false,
    canMutateOfficialScoringEvents: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    explanation: comparison.explanation,
    tags: [
      "workbench_chain_controlled_route_resolution_sandbox",
      "controlled_route_resolution_sandbox",
      `sandbox_baseline_candidate_${baseline.candidateId ?? "none"}`,
      `sandbox_baseline_action_${baseline.actionType ?? "none"}`,
      `sandbox_baseline_receiver_${baseline.receiverId ?? "none"}`,
      `sandbox_baseline_zone_${baseline.targetZone ?? "none"}`,
      `sandbox_baseline_outcome_${baseline.outcome}`,
      `sandbox_override_candidate_${override.candidateId ?? "none"}`,
      `sandbox_override_action_${override.actionType ?? "none"}`,
      `sandbox_override_receiver_${override.receiverId ?? "none"}`,
      `sandbox_override_zone_${override.targetZone ?? "none"}`,
      `sandbox_override_outcome_${override.outcome}`,
      `sandbox_baseline_resolved_${baseline.routeResolved ? "true" : "false"}`,
      `sandbox_override_resolved_${override.routeResolved ? "true" : "false"}`,
      `sandbox_selection_divergence_${comparison.selectionDivergenceObserved ? "true" : "false"}`,
      `sandbox_carrier_divergence_${comparison.carrierDivergenceObserved ? "true" : "false"}`,
      `sandbox_zone_progression_divergence_${comparison.zoneProgressionDivergenceObserved ? "true" : "false"}`,
      `sandbox_danger_creation_divergence_${comparison.dangerCreationDivergenceObserved ? "true" : "false"}`,
      `sandbox_scoring_opportunity_divergence_${comparison.scoringOpportunityDivergenceObserved ? "true" : "false"}`,
      `sandbox_scoring_event_divergence_${comparison.sandboxScoringEventDivergenceObserved ? "true" : "false"}`,
      `sandbox_score_divergence_${comparison.sandboxScoreDivergenceObserved ? "true" : "false"}`,
      "sandbox_applied_only_in_isolated_resolution_true",
      "sandbox_applied_to_normal_live_false",
      "sandbox_official_timeline_injection_forbidden",
      "sandbox_official_score_mutation_forbidden",
      "sandbox_official_scoring_events_mutation_forbidden",
      "sandbox_production_scoring_event_creation_forbidden",
      "sandbox_production_resolution_forbidden",
      "sandbox_global_route_success_mutation_forbidden",
      "sandbox_global_economy_claim_forbidden",
      "sandbox_closed_candidates_rejected",
      "sandbox_unavailable_candidates_rejected",
      ...(input.replay.chainId === undefined ? [] : [`sandbox_chain_id_${input.replay.chainId}`]),
    ],
    warnings: [...baseline.warnings, ...override.warnings],
  };
  const warnings = validateControlledRouteResolutionSandbox(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}

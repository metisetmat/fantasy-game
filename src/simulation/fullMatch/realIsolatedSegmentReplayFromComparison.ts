import { compareRealIsolatedSegmentReplayPaths } from "./compareRealIsolatedSegmentReplayPaths";
import type { FullMatchControlledSegmentReplayComparison } from "./fullMatchControlledSegmentReplayComparison";
import {
  emptyRealIsolatedSegmentReplay,
  type FullMatchRealIsolatedSegmentReplay,
} from "./fullMatchRealIsolatedSegmentReplay";
import { runRealIsolatedSegmentReplayPath } from "./realIsolatedSegmentReplayEngine";

export function realIsolatedReplayCannotMutateOfficialFullMatch(
  replay: FullMatchRealIsolatedSegmentReplay,
): boolean {
  const events = [...replay.baseline.events, ...replay.override.events];

  return (
    !replay.canInjectEventsIntoOfficialTimeline &&
    !replay.canMutateOfficialScore &&
    !replay.canMutateOfficialScoringEvents &&
    !replay.canMutateProductionRouteResolution &&
    !replay.canMutateGlobalRouteSuccessRates &&
    !replay.canCreateProductionScoringEvents &&
    !replay.replayAppliedToNormalLiveSelection &&
    events.every((event) =>
      event.experimentalOnly &&
      !event.canMutateOfficialTimeline &&
      !event.canMutateOfficialScore &&
      !event.canCreateOfficialScoringEvent
    )
  );
}

export function realIsolatedReplayCannotClaimGlobalEconomy(
  replay: FullMatchRealIsolatedSegmentReplay,
): boolean {
  return !replay.canClaimGlobalEconomy;
}

export function validateRealIsolatedSegmentReplay(
  replay: FullMatchRealIsolatedSegmentReplay,
): readonly string[] {
  const shouldValidate = replay.status !== "not_available";
  const events = [...replay.baseline.events, ...replay.override.events];

  return [
    ...(shouldValidate && replay.baselineEventCount <= 0 ? ["REAL_ISOLATED_REPLAY_MISSING_BASELINE_EVENTS"] : []),
    ...(shouldValidate && replay.overrideEventCount <= 0 ? ["REAL_ISOLATED_REPLAY_MISSING_OVERRIDE_EVENTS"] : []),
    ...(shouldValidate && !replay.override.candidateLegal ? ["REAL_ISOLATED_REPLAY_ILLEGAL_OVERRIDE_CANDIDATE"] : []),
    ...(shouldValidate && !replay.override.candidateAvailable ? ["REAL_ISOLATED_REPLAY_UNAVAILABLE_OVERRIDE_CANDIDATE"] : []),
    ...(shouldValidate && !replay.replayAppliedOnlyInIsolatedEngine ? ["REAL_ISOLATED_REPLAY_NOT_ISOLATED"] : []),
    ...(replay.replayAppliedToNormalLiveSelection ? ["REAL_ISOLATED_REPLAY_APPLIED_TO_NORMAL_LIVE_SELECTION"] : []),
    ...(events.some((event) => !event.experimentalOnly) ? ["REAL_ISOLATED_REPLAY_EVENT_NOT_EXPERIMENTAL_ONLY"] : []),
    ...(events.some((event) => event.canMutateOfficialTimeline) ? ["REAL_ISOLATED_REPLAY_EVENT_CAN_MUTATE_OFFICIAL_TIMELINE"] : []),
    ...(events.some((event) => event.canMutateOfficialScore) ? ["REAL_ISOLATED_REPLAY_EVENT_CAN_MUTATE_OFFICIAL_SCORE"] : []),
    ...(events.some((event) => event.canCreateOfficialScoringEvent) ? ["REAL_ISOLATED_REPLAY_EVENT_CAN_CREATE_OFFICIAL_SCORING_EVENT"] : []),
    ...(!realIsolatedReplayCannotMutateOfficialFullMatch(replay) ? ["REAL_ISOLATED_REPLAY_MUTATION_FORBIDDEN_BREACH"] : []),
    ...(!realIsolatedReplayCannotClaimGlobalEconomy(replay) ? ["REAL_ISOLATED_REPLAY_GLOBAL_ECONOMY_CLAIM_BREACH"] : []),
  ];
}

function blockedRealIsolatedSegmentReplayFromComparison(
  comparison: FullMatchControlledSegmentReplayComparison,
): FullMatchRealIsolatedSegmentReplay {
  const baseline = runRealIsolatedSegmentReplayPath({
    pathId: "baseline",
    segmentLabel: comparison.segmentLabel ?? "segment-1",
    ...(comparison.baseline.candidateId === undefined ? {} : { candidateId: comparison.baseline.candidateId }),
    ...(comparison.baseline.actionType === undefined ? {} : { actionType: comparison.baseline.actionType }),
    ...(comparison.baseline.receiverId === undefined ? {} : { receiverId: comparison.baseline.receiverId }),
    ...(comparison.baseline.targetZone === undefined ? {} : { targetZone: comparison.baseline.targetZone }),
    candidateLegal: comparison.baseline.candidateLegal,
    candidateAvailable: comparison.baseline.candidateAvailable,
  });
  const override = runRealIsolatedSegmentReplayPath({
    pathId: "override",
    segmentLabel: comparison.segmentLabel ?? "segment-1",
    ...(comparison.override.candidateId === undefined ? {} : { candidateId: comparison.override.candidateId }),
    ...(comparison.override.actionType === undefined ? {} : { actionType: comparison.override.actionType }),
    ...(comparison.override.receiverId === undefined ? {} : { receiverId: comparison.override.receiverId }),
    ...(comparison.override.targetZone === undefined ? {} : { targetZone: comparison.override.targetZone }),
    candidateLegal: comparison.override.candidateLegal,
    candidateAvailable: comparison.override.candidateAvailable,
  });

  return {
    status: "blocked",
    scope: "production_resolution_forbidden",
    origin: "controlled_segment_replay_comparison",
    ...(comparison.segmentLabel === undefined ? {} : { segmentLabel: comparison.segmentLabel }),
    ...(comparison.chainId === undefined ? {} : { chainId: comparison.chainId }),
    baseline,
    override,
    baselineEventCount: baseline.eventCount,
    overrideEventCount: override.eventCount,
    selectionDivergenceObserved: false,
    possessionContinuityDivergenceObserved: false,
    carrierDivergenceObserved: false,
    zoneProgressionDivergenceObserved: false,
    dangerCreationDivergenceObserved: false,
    scoringOpportunityDivergenceObserved: false,
    isolatedTimelineDivergenceObserved: false,
    isolatedScoringEventDivergenceObserved: false,
    isolatedScoreDivergenceObserved: false,
    replayAppliedOnlyInIsolatedEngine: false,
    replayAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: comparison.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: comparison.rejectedUnavailableCandidateCount,
    diagnosticOnly: true,
    canInjectEventsIntoOfficialTimeline: false,
    canMutateOfficialScore: false,
    canMutateOfficialScoringEvents: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    tags: [],
    warnings: [...comparison.warnings, "REAL_ISOLATED_SEGMENT_REPLAY_BLOCKED"],
  };
}

export function realIsolatedSegmentReplayFromComparison(input: {
  readonly comparison: FullMatchControlledSegmentReplayComparison;
}): FullMatchRealIsolatedSegmentReplay {
  if (input.comparison.status !== "available") {
    return emptyRealIsolatedSegmentReplay({
      ...(input.comparison.segmentLabel === undefined ? {} : { segmentLabel: input.comparison.segmentLabel }),
      ...(input.comparison.chainId === undefined ? {} : { chainId: input.comparison.chainId }),
      warnings: input.comparison.warnings,
    });
  }

  if (
    input.comparison.baseline.candidateId === undefined ||
    input.comparison.override.candidateId === undefined ||
    !input.comparison.override.candidateLegal ||
    !input.comparison.override.candidateAvailable
  ) {
    return blockedRealIsolatedSegmentReplayFromComparison(input.comparison);
  }

  const segmentLabel = input.comparison.segmentLabel ?? "segment-1";
  const baseline = runRealIsolatedSegmentReplayPath({
    pathId: "baseline",
    segmentLabel,
    candidateId: input.comparison.baseline.candidateId,
    ...(input.comparison.baseline.actionType === undefined ? {} : { actionType: input.comparison.baseline.actionType }),
    ...(input.comparison.baseline.receiverId === undefined ? {} : { receiverId: input.comparison.baseline.receiverId }),
    ...(input.comparison.baseline.targetZone === undefined ? {} : { targetZone: input.comparison.baseline.targetZone }),
    candidateLegal: input.comparison.baseline.candidateLegal,
    candidateAvailable: input.comparison.baseline.candidateAvailable,
  });
  const override = runRealIsolatedSegmentReplayPath({
    pathId: "override",
    segmentLabel,
    candidateId: input.comparison.override.candidateId,
    ...(input.comparison.override.actionType === undefined ? {} : { actionType: input.comparison.override.actionType }),
    ...(input.comparison.override.receiverId === undefined ? {} : { receiverId: input.comparison.override.receiverId }),
    ...(input.comparison.override.targetZone === undefined ? {} : { targetZone: input.comparison.override.targetZone }),
    candidateLegal: input.comparison.override.candidateLegal,
    candidateAvailable: input.comparison.override.candidateAvailable,
  });
  const pathComparison = compareRealIsolatedSegmentReplayPaths({ baseline, override });
  const result: FullMatchRealIsolatedSegmentReplay = {
    status: "available",
    scope: "real_isolated_segment_replay",
    origin: "controlled_segment_replay_comparison",
    ...(input.comparison.segmentLabel === undefined ? {} : { segmentLabel: input.comparison.segmentLabel }),
    ...(input.comparison.chainId === undefined ? {} : { chainId: input.comparison.chainId }),
    baseline,
    override,
    baselineEventCount: baseline.eventCount,
    overrideEventCount: override.eventCount,
    selectionDivergenceObserved: pathComparison.selectionDivergenceObserved,
    possessionContinuityDivergenceObserved: pathComparison.possessionContinuityDivergenceObserved,
    carrierDivergenceObserved: pathComparison.carrierDivergenceObserved,
    zoneProgressionDivergenceObserved: pathComparison.zoneProgressionDivergenceObserved,
    dangerCreationDivergenceObserved: pathComparison.dangerCreationDivergenceObserved,
    scoringOpportunityDivergenceObserved: pathComparison.scoringOpportunityDivergenceObserved,
    isolatedTimelineDivergenceObserved: pathComparison.isolatedTimelineDivergenceObserved,
    isolatedScoringEventDivergenceObserved: pathComparison.isolatedScoringEventDivergenceObserved,
    isolatedScoreDivergenceObserved: pathComparison.isolatedScoreDivergenceObserved,
    replayAppliedOnlyInIsolatedEngine: true,
    replayAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: input.comparison.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: input.comparison.rejectedUnavailableCandidateCount,
    diagnosticOnly: true,
    canInjectEventsIntoOfficialTimeline: false,
    canMutateOfficialScore: false,
    canMutateOfficialScoringEvents: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    explanation: pathComparison.explanation,
    tags: [
      "workbench_chain_real_isolated_segment_replay",
      "real_isolated_segment_replay",
      `real_isolated_replay_baseline_candidate_${baseline.candidateId ?? "none"}`,
      `real_isolated_replay_baseline_action_${baseline.actionType ?? "none"}`,
      `real_isolated_replay_baseline_receiver_${baseline.receiverId ?? "none"}`,
      `real_isolated_replay_baseline_zone_${baseline.targetZone ?? "none"}`,
      `real_isolated_replay_override_candidate_${override.candidateId ?? "none"}`,
      `real_isolated_replay_override_action_${override.actionType ?? "none"}`,
      `real_isolated_replay_override_receiver_${override.receiverId ?? "none"}`,
      `real_isolated_replay_override_zone_${override.targetZone ?? "none"}`,
      "real_isolated_replay_baseline_events_present",
      "real_isolated_replay_override_events_present",
      `real_isolated_replay_selection_divergence_${pathComparison.selectionDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_possession_continuity_divergence_${pathComparison.possessionContinuityDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_carrier_divergence_${pathComparison.carrierDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_zone_progression_divergence_${pathComparison.zoneProgressionDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_danger_creation_divergence_${pathComparison.dangerCreationDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_scoring_opportunity_divergence_${pathComparison.scoringOpportunityDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_timeline_divergence_${pathComparison.isolatedTimelineDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_score_divergence_${pathComparison.isolatedScoreDivergenceObserved ? "true" : "false"}`,
      `real_isolated_replay_scoring_event_divergence_${pathComparison.isolatedScoringEventDivergenceObserved ? "true" : "false"}`,
      "real_isolated_replay_applied_only_in_isolated_engine_true",
      "real_isolated_replay_applied_to_normal_live_false",
      "real_isolated_replay_official_timeline_injection_forbidden",
      "real_isolated_replay_official_score_mutation_forbidden",
      "real_isolated_replay_official_scoring_events_mutation_forbidden",
      "real_isolated_replay_production_resolution_forbidden",
      "real_isolated_replay_global_route_success_mutation_forbidden",
      "real_isolated_replay_production_scoring_event_creation_forbidden",
      "real_isolated_replay_global_economy_claim_forbidden",
      ...(input.comparison.chainId === undefined ? [] : [`real_isolated_replay_chain_id_${input.comparison.chainId}`]),
    ],
    warnings: [...baseline.warnings, ...override.warnings],
  };
  const warnings = validateRealIsolatedSegmentReplay(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}

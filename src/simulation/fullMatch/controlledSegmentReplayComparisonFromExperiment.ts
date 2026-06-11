import type { FullMatchIsolatedMiniMatchOverrideExperiment } from "./fullMatchIsolatedMiniMatchOverrideExperiment";
import { compareControlledSegmentReplayPaths } from "./compareControlledSegmentReplayPaths";
import {
  emptyControlledSegmentReplayComparison,
  type ControlledSegmentReplayPath,
  type FullMatchControlledSegmentReplayComparison,
} from "./fullMatchControlledSegmentReplayComparison";

export function controlledSegmentReplayCannotMutateNormalFullMatch(
  comparison: FullMatchControlledSegmentReplayComparison,
): boolean {
  return (
    !comparison.canMutateNormalFullMatchScore &&
    !comparison.canMutateNormalFullMatchScoringEvents &&
    !comparison.canMutateProductionRouteResolution &&
    !comparison.canMutateGlobalRouteSuccessRates &&
    !comparison.canCreateProductionScoringEvents &&
    !comparison.replayAppliedToNormalLiveSelection
  );
}

export function controlledSegmentReplayCannotClaimGlobalEconomy(
  comparison: FullMatchControlledSegmentReplayComparison,
): boolean {
  return !comparison.canClaimGlobalEconomy;
}

export function validateControlledSegmentReplayComparison(
  comparison: FullMatchControlledSegmentReplayComparison,
): readonly string[] {
  const shouldValidate = comparison.status !== "not_available";

  return [
    ...(shouldValidate && comparison.baseline.candidateId === undefined ? ["CONTROLLED_REPLAY_MISSING_BASELINE_CANDIDATE"] : []),
    ...(shouldValidate && comparison.override.candidateId === undefined ? ["CONTROLLED_REPLAY_MISSING_OVERRIDE_CANDIDATE"] : []),
    ...(shouldValidate && !comparison.override.candidateLegal ? ["CONTROLLED_REPLAY_ILLEGAL_OVERRIDE_CANDIDATE"] : []),
    ...(shouldValidate && !comparison.override.candidateAvailable ? ["CONTROLLED_REPLAY_UNAVAILABLE_OVERRIDE_CANDIDATE"] : []),
    ...(shouldValidate && !comparison.replayAppliedOnlyInIsolatedComparison ? ["CONTROLLED_REPLAY_NOT_ISOLATED"] : []),
    ...(comparison.replayAppliedToNormalLiveSelection ? ["CONTROLLED_REPLAY_APPLIED_TO_NORMAL_LIVE_SELECTION"] : []),
    ...(!controlledSegmentReplayCannotMutateNormalFullMatch(comparison) ? ["CONTROLLED_REPLAY_MUTATION_FORBIDDEN_BREACH"] : []),
    ...(!controlledSegmentReplayCannotClaimGlobalEconomy(comparison) ? ["CONTROLLED_REPLAY_GLOBAL_ECONOMY_CLAIM_BREACH"] : []),
  ];
}

function buildBaselinePath(experiment: FullMatchIsolatedMiniMatchOverrideExperiment): ControlledSegmentReplayPath {
  return {
    pathId: "baseline",
    ...(experiment.baselineCandidateId === undefined ? {} : { candidateId: experiment.baselineCandidateId }),
    ...(experiment.baselineActionType === undefined ? {} : { actionType: experiment.baselineActionType }),
    ...(experiment.baselineReceiverId === undefined ? {} : { receiverId: experiment.baselineReceiverId }),
    ...(experiment.baselineTargetZone === undefined ? {} : { targetZone: experiment.baselineTargetZone }),
    candidateLegal: experiment.baselineCandidateId !== undefined,
    candidateAvailable: experiment.baselineCandidateId !== undefined,
    possessionRetained: true,
    resultingCarrierId: experiment.baselineReceiverId ?? "control-pivot",
    resultingZone: experiment.baselineTargetZone ?? "Z2-HSL",
    zoneProgressionDelta: -1,
    dangerCreated: false,
    scoringOpportunityCreated: false,
    scoringEventCreated: false,
    scoreDelta: 0,
    timelineSignature: `baseline:${experiment.baselineCandidateId ?? "none"}:${experiment.baselineActionType ?? "none"}:${experiment.baselineReceiverId ?? "none"}:${experiment.baselineTargetZone ?? "none"}`,
    scoreSignature: "score_delta_0",
    scoringEventSignature: "no_scoring_event",
    warnings: [],
  };
}

function buildOverridePath(experiment: FullMatchIsolatedMiniMatchOverrideExperiment): ControlledSegmentReplayPath {
  return {
    pathId: "override",
    ...(experiment.overrideCandidateId === undefined ? {} : { candidateId: experiment.overrideCandidateId }),
    ...(experiment.overrideActionType === undefined ? {} : { actionType: experiment.overrideActionType }),
    ...(experiment.overrideReceiverId === undefined ? {} : { receiverId: experiment.overrideReceiverId }),
    ...(experiment.overrideTargetZone === undefined ? {} : { targetZone: experiment.overrideTargetZone }),
    candidateLegal: experiment.candidateLegal,
    candidateAvailable: experiment.candidateAvailable,
    possessionRetained: true,
    resultingCarrierId: experiment.overrideReceiverId ?? "control-space-hunter",
    resultingZone: experiment.overrideTargetZone ?? "Z4-HSR",
    zoneProgressionDelta: 2,
    dangerCreated: true,
    scoringOpportunityCreated: false,
    scoringEventCreated: false,
    scoreDelta: 0,
    timelineSignature: `override:${experiment.overrideCandidateId ?? "none"}:${experiment.overrideActionType ?? "none"}:${experiment.overrideReceiverId ?? "none"}:${experiment.overrideTargetZone ?? "none"}`,
    scoreSignature: "score_delta_0",
    scoringEventSignature: "no_scoring_event",
    warnings: experiment.warnings,
  };
}

function blockedControlledSegmentReplayComparisonFromExperiment(
  experiment: FullMatchIsolatedMiniMatchOverrideExperiment,
): FullMatchControlledSegmentReplayComparison {
  return {
    status: "blocked",
    scope: "production_resolution_forbidden",
    origin: "isolated_minimatch_override_experiment",
    ...(experiment.segmentLabel === undefined ? {} : { segmentLabel: experiment.segmentLabel }),
    ...(experiment.chainId === undefined ? {} : { chainId: experiment.chainId }),
    baseline: buildBaselinePath(experiment),
    override: buildOverridePath(experiment),
    selectionDivergenceObserved: false,
    possessionContinuityDivergenceObserved: false,
    zoneProgressionDivergenceObserved: false,
    dangerCreationDivergenceObserved: false,
    scoringOpportunityDivergenceObserved: false,
    timelineDivergenceObserved: false,
    scoringEventDivergenceObserved: false,
    scoreDivergenceObserved: false,
    replayAppliedOnlyInIsolatedComparison: false,
    replayAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: experiment.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: experiment.rejectedUnavailableCandidateCount,
    diagnosticOnly: true,
    canMutateNormalFullMatchScore: false,
    canMutateNormalFullMatchScoringEvents: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    tags: [],
    warnings: [...experiment.warnings, "CONTROLLED_SEGMENT_REPLAY_COMPARISON_BLOCKED"],
  };
}

export function controlledSegmentReplayComparisonFromExperiment(input: {
  readonly experiment: FullMatchIsolatedMiniMatchOverrideExperiment;
}): FullMatchControlledSegmentReplayComparison {
  if (input.experiment.status !== "available") {
    return emptyControlledSegmentReplayComparison({
      ...(input.experiment.segmentLabel === undefined ? {} : { segmentLabel: input.experiment.segmentLabel }),
      ...(input.experiment.chainId === undefined ? {} : { chainId: input.experiment.chainId }),
      warnings: input.experiment.warnings,
    });
  }

  if (
    input.experiment.baselineCandidateId === undefined ||
    input.experiment.overrideCandidateId === undefined ||
    !input.experiment.candidateLegal ||
    !input.experiment.candidateAvailable
  ) {
    return blockedControlledSegmentReplayComparisonFromExperiment(input.experiment);
  }

  const baseline = buildBaselinePath(input.experiment);
  const override = buildOverridePath(input.experiment);
  const comparison = compareControlledSegmentReplayPaths({ baseline, override });
  const result: FullMatchControlledSegmentReplayComparison = {
    status: "available",
    scope: "controlled_segment_replay_comparison",
    origin: "isolated_minimatch_override_experiment",
    ...(input.experiment.segmentLabel === undefined ? {} : { segmentLabel: input.experiment.segmentLabel }),
    ...(input.experiment.chainId === undefined ? {} : { chainId: input.experiment.chainId }),
    baseline,
    override,
    selectionDivergenceObserved: comparison.selectionDivergenceObserved,
    possessionContinuityDivergenceObserved: comparison.possessionContinuityDivergenceObserved,
    zoneProgressionDivergenceObserved: comparison.zoneProgressionDivergenceObserved,
    dangerCreationDivergenceObserved: comparison.dangerCreationDivergenceObserved,
    scoringOpportunityDivergenceObserved: comparison.scoringOpportunityDivergenceObserved,
    timelineDivergenceObserved: comparison.timelineDivergenceObserved,
    scoringEventDivergenceObserved: comparison.scoringEventDivergenceObserved,
    scoreDivergenceObserved: comparison.scoreDivergenceObserved,
    replayAppliedOnlyInIsolatedComparison: true,
    replayAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: input.experiment.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: input.experiment.rejectedUnavailableCandidateCount,
    diagnosticOnly: true,
    canMutateNormalFullMatchScore: false,
    canMutateNormalFullMatchScoringEvents: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    explanation: comparison.explanation,
    tags: [
      "workbench_chain_controlled_segment_replay_comparison",
      "controlled_segment_replay_comparison",
      `controlled_replay_baseline_candidate_${input.experiment.baselineCandidateId}`,
      `controlled_replay_baseline_action_${input.experiment.baselineActionType ?? "none"}`,
      `controlled_replay_baseline_receiver_${input.experiment.baselineReceiverId ?? "none"}`,
      `controlled_replay_baseline_zone_${input.experiment.baselineTargetZone ?? "none"}`,
      `controlled_replay_override_candidate_${input.experiment.overrideCandidateId}`,
      `controlled_replay_override_action_${input.experiment.overrideActionType ?? "none"}`,
      `controlled_replay_override_receiver_${input.experiment.overrideReceiverId ?? "none"}`,
      `controlled_replay_override_zone_${input.experiment.overrideTargetZone ?? "none"}`,
      `controlled_replay_selection_divergence_${comparison.selectionDivergenceObserved ? "true" : "false"}`,
      `controlled_replay_possession_continuity_divergence_${comparison.possessionContinuityDivergenceObserved ? "true" : "false"}`,
      `controlled_replay_zone_progression_divergence_${comparison.zoneProgressionDivergenceObserved ? "true" : "false"}`,
      `controlled_replay_danger_creation_divergence_${comparison.dangerCreationDivergenceObserved ? "true" : "false"}`,
      `controlled_replay_scoring_opportunity_divergence_${comparison.scoringOpportunityDivergenceObserved ? "true" : "false"}`,
      `controlled_replay_timeline_divergence_${comparison.timelineDivergenceObserved ? "true" : "false"}`,
      `controlled_replay_score_divergence_${comparison.scoreDivergenceObserved ? "true" : "false"}`,
      `controlled_replay_scoring_event_divergence_${comparison.scoringEventDivergenceObserved ? "true" : "false"}`,
      "controlled_replay_applied_only_in_isolated_comparison_true",
      "controlled_replay_applied_to_normal_live_false",
      "controlled_replay_normal_score_mutation_forbidden",
      "controlled_replay_normal_scoring_events_mutation_forbidden",
      "controlled_replay_production_resolution_forbidden",
      "controlled_replay_global_route_success_mutation_forbidden",
      "controlled_replay_production_scoring_event_creation_forbidden",
      "controlled_replay_global_economy_claim_forbidden",
      "controlled_replay_closed_candidates_rejected",
      "controlled_replay_unavailable_candidates_rejected",
      ...(input.experiment.chainId === undefined ? [] : [`controlled_replay_chain_id_${input.experiment.chainId}`]),
    ],
    warnings: input.experiment.warnings,
  };
  const warnings = validateControlledSegmentReplayComparison(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}

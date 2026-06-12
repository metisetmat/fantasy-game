import type { MatchInput } from "../../contracts/engineToCoach";
import { compareMultiActionContinuation } from "./compareMultiActionContinuation";
import { extractContinuationContext } from "./extractContinuationContext";
import {
  emptyMultiActionContinuationModel,
  type MultiActionContinuationModel,
  type MultiActionContinuationPathResult,
} from "./multiActionContinuationSandbox";
import type { ReboundSecondChanceModel, ReboundSecondChancePathResult } from "./reboundSecondChanceSandbox";
import { resolveMultiActionContinuation } from "./resolveMultiActionContinuation";

function continuationFromReboundPath(input: {
  readonly matchInput: MatchInput;
  readonly path: ReboundSecondChancePathResult;
}): MultiActionContinuationPathResult {
  const context = extractContinuationContext({
    matchInput: input.matchInput,
    ...(input.path.shooterId === undefined ? {} : { shooterId: input.path.shooterId }),
    ...(input.path.goalkeeperId === undefined ? {} : { goalkeeperId: input.path.goalkeeperId }),
    ...(input.path.targetZone === undefined ? {} : { targetZone: input.path.targetZone }),
    recoveryTeamCandidate: input.path.recoveryTeamCandidate,
  });

  return {
    ...resolveMultiActionContinuation({
      pathId: input.path.pathId,
      ...(input.path.candidateId === undefined ? {} : { candidateId: input.path.candidateId }),
      ...(input.path.shooterId === undefined ? {} : { shooterId: input.path.shooterId }),
      ...(input.path.goalkeeperId === undefined ? {} : { goalkeeperId: input.path.goalkeeperId }),
      ...(input.path.targetZone === undefined ? {} : { targetZone: input.path.targetZone }),
      sourceReboundOutcome: input.path.reboundOutcome,
      sourceBallLooseState: input.path.ballLooseState,
      sourceRecoveryTeamCandidate: input.path.recoveryTeamCandidate,
      sourceNextSandboxPossessionCandidate: input.path.nextSandboxPossessionCandidate,
      sourceReboundDangerScore: input.path.reboundDangerScore,
      sourceSecondChanceProbability: input.path.secondChanceProbability,
      sourceSecondChanceCreated: input.path.secondChanceCreated,
      ...(context.continuationActorCandidate === undefined ? {} : { continuationActorCandidate: context.continuationActorCandidate }),
      ...(context.continuationTargetZoneCandidate === undefined ? {} : { continuationTargetZoneCandidate: context.continuationTargetZoneCandidate }),
      possessionSecurityScore: context.possessionSecurityScore,
      pressureAfterRebound: context.pressureAfterRebound,
      transitionRisk: context.transitionRisk,
    }),
    warnings: context.warnings,
  };
}

export function multiActionContinuationCannotMutateOfficialFullMatch(
  model: MultiActionContinuationModel,
): boolean {
  const results = [model.baseline, model.override];

  return (
    !model.canInjectEventsIntoOfficialTimeline &&
    !model.canMutateOfficialScore &&
    !model.canMutateOfficialScoringEvents &&
    !model.canMutateOfficialPossession &&
    !model.canMutateOfficialTimeline &&
    !model.canMutateProductionRouteResolution &&
    !model.canMutateGlobalRouteSuccessRates &&
    !model.canCreateProductionScoringEvents &&
    !model.modelAppliedToNormalLiveSelection &&
    results.every((result) =>
      result.isolatedOnly &&
      !result.canBecomeOfficialMatchEvent &&
      !result.canMutateOfficialScore &&
      !result.canCreateOfficialScoringEvent &&
      !result.canCreateProductionScoringEvent &&
      !result.canMutateOfficialPossession &&
      !result.canMutateOfficialTimeline &&
      !result.sandboxMatchEventCreated &&
      !result.sandboxScoringEventCreated &&
      result.sandboxScoreDelta === 0
    )
  );
}

export function multiActionContinuationCannotClaimGlobalEconomy(
  model: MultiActionContinuationModel,
): boolean {
  return !model.canClaimGlobalEconomy;
}

export function validateMultiActionContinuationModel(model: MultiActionContinuationModel): readonly string[] {
  const shouldValidate = model.status === "available";
  const results = [model.baseline, model.override];

  return [
    ...(shouldValidate && model.origin !== "rebound_second_chance_sandbox"
      ? ["MULTI_ACTION_CONTINUATION_WRONG_ORIGIN"]
      : []),
    ...(shouldValidate && model.baseline.continuationActionType !== "NO_CONTINUATION"
      ? ["MULTI_ACTION_CONTINUATION_BASELINE_NOT_NO_CONTINUATION"]
      : []),
    ...(shouldValidate && model.baseline.sandboxContinuationCreated
      ? ["MULTI_ACTION_CONTINUATION_BASELINE_CREATED"]
      : []),
    ...(shouldValidate && !["GOALKEEPER_TEAM_SECURE_RECOVERY", "DEFENSIVE_CLEARANCE", "SAFE_RESET"].includes(model.override.continuationActionType)
      ? ["MULTI_ACTION_CONTINUATION_OVERRIDE_UNEXPECTED_ACTION"]
      : []),
    ...(shouldValidate && model.override.continuationTeamCandidate !== "goalkeeper_team"
      ? ["MULTI_ACTION_CONTINUATION_OVERRIDE_NOT_GOALKEEPER_TEAM"]
      : []),
    ...(shouldValidate && !model.override.sandboxContinuationCreated
      ? ["MULTI_ACTION_CONTINUATION_OVERRIDE_NOT_CREATED"]
      : []),
    ...(results.some((result) => result.sandboxMatchEventCreated)
      ? ["MULTI_ACTION_CONTINUATION_CREATED_MATCH_EVENT"]
      : []),
    ...(results.some((result) => result.sandboxScoringEventCreated)
      ? ["MULTI_ACTION_CONTINUATION_CREATED_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.sandboxScoreDelta !== 0)
      ? ["MULTI_ACTION_CONTINUATION_SCORE_DELTA_NON_ZERO"]
      : []),
    ...(shouldValidate && !model.modelAppliedOnlyInSandbox
      ? ["MULTI_ACTION_CONTINUATION_NOT_SANDBOX_ONLY"]
      : []),
    ...(model.modelAppliedToNormalLiveSelection
      ? ["MULTI_ACTION_CONTINUATION_APPLIED_TO_NORMAL_LIVE"]
      : []),
    ...(results.some((result) => !result.isolatedOnly) ? ["MULTI_ACTION_CONTINUATION_RESULT_NOT_ISOLATED"] : []),
    ...(results.some((result) => result.canBecomeOfficialMatchEvent)
      ? ["MULTI_ACTION_CONTINUATION_RESULT_CAN_BECOME_MATCH_EVENT"]
      : []),
    ...(results.some((result) => result.canMutateOfficialScore)
      ? ["MULTI_ACTION_CONTINUATION_RESULT_CAN_MUTATE_SCORE"]
      : []),
    ...(results.some((result) => result.canCreateOfficialScoringEvent)
      ? ["MULTI_ACTION_CONTINUATION_RESULT_CAN_CREATE_OFFICIAL_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.canCreateProductionScoringEvent)
      ? ["MULTI_ACTION_CONTINUATION_RESULT_CAN_CREATE_PRODUCTION_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.canMutateOfficialPossession)
      ? ["MULTI_ACTION_CONTINUATION_RESULT_CAN_MUTATE_POSSESSION"]
      : []),
    ...(results.some((result) => result.canMutateOfficialTimeline)
      ? ["MULTI_ACTION_CONTINUATION_RESULT_CAN_MUTATE_TIMELINE"]
      : []),
    ...(!multiActionContinuationCannotMutateOfficialFullMatch(model)
      ? ["MULTI_ACTION_CONTINUATION_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!multiActionContinuationCannotClaimGlobalEconomy(model)
      ? ["MULTI_ACTION_CONTINUATION_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
  ];
}

export function multiActionContinuationFromRebound(input: {
  readonly matchInput: MatchInput;
  readonly reboundSecondChanceModel: ReboundSecondChanceModel;
}): MultiActionContinuationModel {
  if (input.reboundSecondChanceModel.status !== "available") {
    return emptyMultiActionContinuationModel({
      ...(input.reboundSecondChanceModel.segmentLabel === undefined ? {} : { segmentLabel: input.reboundSecondChanceModel.segmentLabel }),
      ...(input.reboundSecondChanceModel.chainId === undefined ? {} : { chainId: input.reboundSecondChanceModel.chainId }),
      warnings: input.reboundSecondChanceModel.warnings,
    });
  }

  const baseline = continuationFromReboundPath({
    matchInput: input.matchInput,
    path: input.reboundSecondChanceModel.baseline,
  });
  const override = continuationFromReboundPath({
    matchInput: input.matchInput,
    path: input.reboundSecondChanceModel.override,
  });
  const comparison = compareMultiActionContinuation({ baseline, override });
  const result: MultiActionContinuationModel = {
    status: "available",
    scope: "multi_action_continuation_sandbox",
    origin: "rebound_second_chance_sandbox",
    ...(input.reboundSecondChanceModel.segmentLabel === undefined ? {} : { segmentLabel: input.reboundSecondChanceModel.segmentLabel }),
    ...(input.reboundSecondChanceModel.chainId === undefined ? {} : { chainId: input.reboundSecondChanceModel.chainId }),
    baseline,
    override,
    baselineContinuationCreated: baseline.sandboxContinuationCreated,
    overrideContinuationCreated: override.sandboxContinuationCreated,
    continuationActionDivergenceObserved: comparison.continuationActionDivergenceObserved,
    continuationOutcomeDivergenceObserved: comparison.continuationOutcomeDivergenceObserved,
    continuationTeamDivergenceObserved: comparison.continuationTeamDivergenceObserved,
    possessionSecurityObserved: comparison.possessionSecurityObserved,
    transitionRiskObserved: comparison.transitionRiskObserved,
    sandboxMatchEventDivergenceObserved: comparison.sandboxMatchEventDivergenceObserved,
    sandboxScoringEventDivergenceObserved: comparison.sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved: comparison.sandboxScoreDivergenceObserved,
    officialPossessionDivergenceObserved: false,
    modelAppliedOnlyInSandbox: true,
    modelAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: input.reboundSecondChanceModel.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: input.reboundSecondChanceModel.rejectedUnavailableCandidateCount,
    diagnosticOnly: true,
    canInjectEventsIntoOfficialTimeline: false,
    canMutateOfficialScore: false,
    canMutateOfficialScoringEvents: false,
    canMutateOfficialPossession: false,
    canMutateOfficialTimeline: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    explanation: comparison.explanation,
    tags: [
      "workbench_chain_multi_action_continuation_sandbox",
      "multi_action_continuation_sandbox",
      "multi_action_continuation_results_isolated_only",
      "multi_action_continuation_model_status_available",
      "multi_action_continuation_model_origin_rebound_second_chance_sandbox",
      `multi_action_continuation_baseline_action_${baseline.continuationActionType}`,
      `multi_action_continuation_baseline_outcome_${baseline.continuationOutcome}`,
      `multi_action_continuation_baseline_created_${baseline.sandboxContinuationCreated ? "true" : "false"}`,
      `multi_action_continuation_override_source_rebound_outcome_${override.sourceReboundOutcome ?? "none"}`,
      `multi_action_continuation_override_source_ball_loose_${override.sourceBallLooseState ?? "none"}`,
      `multi_action_continuation_override_source_recovery_team_${override.sourceRecoveryTeamCandidate ?? "none"}`,
      `multi_action_continuation_override_action_${override.continuationActionType}`,
      `multi_action_continuation_override_outcome_${override.continuationOutcome}`,
      `multi_action_continuation_override_team_${override.continuationTeamCandidate}`,
      `multi_action_continuation_override_actor_${override.continuationActorCandidate ?? "none"}`,
      `multi_action_continuation_override_target_zone_${override.continuationTargetZoneCandidate ?? "none"}`,
      `multi_action_continuation_override_security_${override.possessionSecurityScore}`,
      `multi_action_continuation_override_pressure_${override.pressureAfterRebound}`,
      `multi_action_continuation_override_transition_risk_${override.transitionRisk}`,
      `multi_action_continuation_override_confidence_${override.continuationConfidence}`,
      `multi_action_continuation_override_created_${override.sandboxContinuationCreated ? "true" : "false"}`,
      ...baseline.tags,
      ...override.tags,
      `multi_action_continuation_action_divergence_${comparison.continuationActionDivergenceObserved ? "true" : "false"}`,
      `multi_action_continuation_outcome_divergence_${comparison.continuationOutcomeDivergenceObserved ? "true" : "false"}`,
      `multi_action_continuation_team_divergence_${comparison.continuationTeamDivergenceObserved ? "true" : "false"}`,
      `multi_action_continuation_possession_security_observed_${comparison.possessionSecurityObserved ? "true" : "false"}`,
      `multi_action_continuation_transition_risk_observed_${comparison.transitionRiskObserved ? "true" : "false"}`,
      `multi_action_continuation_match_event_divergence_${comparison.sandboxMatchEventDivergenceObserved ? "true" : "false"}`,
      `multi_action_continuation_scoring_event_divergence_${comparison.sandboxScoringEventDivergenceObserved ? "true" : "false"}`,
      `multi_action_continuation_score_divergence_${comparison.sandboxScoreDivergenceObserved ? "true" : "false"}`,
      "multi_action_continuation_official_possession_divergence_false",
      "multi_action_continuation_match_event_created_false",
      "multi_action_continuation_scoring_event_created_false",
      "multi_action_continuation_score_delta_0",
      "multi_action_continuation_official_possession_mutation_count_0",
      "multi_action_continuation_official_timeline_mutation_count_0",
      `multi_action_continuation_rejected_closed_count_${input.reboundSecondChanceModel.rejectedClosedCandidateCount}`,
      `multi_action_continuation_rejected_unavailable_count_${input.reboundSecondChanceModel.rejectedUnavailableCandidateCount}`,
      "multi_action_continuation_applied_only_in_sandbox_true",
      "multi_action_continuation_applied_to_normal_live_false",
      "multi_action_continuation_model_applied_only_in_sandbox_true",
      "multi_action_continuation_model_applied_to_normal_live_false",
      "multi_action_continuation_official_timeline_injection_forbidden",
      "multi_action_continuation_official_score_mutation_forbidden",
      "multi_action_continuation_official_scoring_events_mutation_forbidden",
      "multi_action_continuation_official_possession_mutation_forbidden",
      "multi_action_continuation_production_scoring_event_creation_forbidden",
      "multi_action_continuation_production_route_resolution_mutation_forbidden",
      "multi_action_continuation_global_route_success_mutation_forbidden",
      "multi_action_continuation_global_economy_claim_forbidden",
      "multi_action_continuation_closed_candidates_rejected",
      "multi_action_continuation_unavailable_candidates_rejected",
      "multi_action_continuation_injected_into_official_timeline_count_0",
      "multi_action_continuation_official_score_mutation_count_0",
      "multi_action_continuation_official_scoring_event_mutation_count_0",
      "multi_action_continuation_production_scoring_event_creation_count_0",
      "multi_action_continuation_production_route_resolution_mutation_count_0",
      "multi_action_continuation_global_route_success_mutation_count_0",
      "multi_action_continuation_global_economy_claim_count_0",
      ...(input.reboundSecondChanceModel.chainId === undefined ? [] : [`multi_action_continuation_chain_id_${input.reboundSecondChanceModel.chainId}`]),
    ],
    warnings: [...baseline.warnings, ...override.warnings],
  };
  const warnings = validateMultiActionContinuationModel(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}

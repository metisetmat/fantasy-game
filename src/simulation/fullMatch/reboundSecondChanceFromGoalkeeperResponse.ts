import type { MatchInput } from "../../contracts/engineToCoach";
import type { GoalkeeperResponseModel, GoalkeeperResponsePathResult } from "./goalkeeperResponseModel";
import { compareReboundSecondChance } from "./compareReboundSecondChance";
import { extractReboundContext } from "./extractReboundContext";
import {
  emptyReboundSecondChanceModel,
  type ReboundSecondChanceModel,
  type ReboundSecondChancePathResult,
} from "./reboundSecondChanceSandbox";
import { resolveReboundSecondChance } from "./resolveReboundSecondChance";

function reboundFromGoalkeeperPath(input: {
  readonly matchInput: MatchInput;
  readonly path: GoalkeeperResponsePathResult;
}): ReboundSecondChancePathResult {
  const context = extractReboundContext({
    matchInput: input.matchInput,
    ...(input.path.shooterId === undefined ? {} : { shooterId: input.path.shooterId }),
    ...(input.path.goalkeeperId === undefined ? {} : { goalkeeperId: input.path.goalkeeperId }),
    ...(input.path.targetZone === undefined ? {} : { targetZone: input.path.targetZone }),
  });

  return {
    ...resolveReboundSecondChance({
      pathId: input.path.pathId,
      ...(input.path.candidateId === undefined ? {} : { candidateId: input.path.candidateId }),
      ...(input.path.shooterId === undefined ? {} : { shooterId: input.path.shooterId }),
      ...(input.path.goalkeeperId === undefined ? {} : { goalkeeperId: input.path.goalkeeperId }),
      ...(input.path.targetZone === undefined ? {} : { targetZone: input.path.targetZone }),
      sourceGoalkeeperResponseType: input.path.responseType,
      sourceReboundState: input.path.reboundState,
      sourceShotQualityFaced: input.path.shotQualityFaced,
      sourceGoalkeeperResponseScore: input.path.goalkeeperResponseScore,
      sourceSaveMargin: input.path.saveMargin,
      handlingScore: input.path.handlingScore,
      reboundControlScore: input.path.reboundControlScore,
      concentrationScore: input.path.concentrationScore,
      mentalFatigueImpact: input.path.mentalFatigueImpact,
      attackingProximityScore: context.attackingProximityScore,
      defensiveRecoveryScore: context.defensiveRecoveryScore,
    }),
    warnings: context.warnings,
  };
}

export function reboundSecondChanceCannotMutateOfficialFullMatch(
  model: ReboundSecondChanceModel,
): boolean {
  const results = [model.baseline, model.override];

  return (
    !model.canInjectEventsIntoOfficialTimeline &&
    !model.canMutateOfficialScore &&
    !model.canMutateOfficialScoringEvents &&
    !model.canMutateOfficialPossession &&
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
      !result.sandboxMatchEventCreated &&
      !result.sandboxScoringEventCreated &&
      result.sandboxScoreDelta === 0
    )
  );
}

export function reboundSecondChanceCannotClaimGlobalEconomy(model: ReboundSecondChanceModel): boolean {
  return !model.canClaimGlobalEconomy;
}

export function validateReboundSecondChanceModel(model: ReboundSecondChanceModel): readonly string[] {
  const shouldValidate = model.status === "available";
  const results = [model.baseline, model.override];

  return [
    ...(shouldValidate && model.origin !== "goalkeeper_response_model_sandbox"
      ? ["REBOUND_SECOND_CHANCE_WRONG_ORIGIN"]
      : []),
    ...(shouldValidate && model.baseline.reboundOutcome !== "NO_REBOUND"
      ? ["REBOUND_SECOND_CHANCE_BASELINE_NOT_NO_REBOUND"]
      : []),
    ...(shouldValidate && model.baseline.ballLooseState !== "none"
      ? ["REBOUND_SECOND_CHANCE_BASELINE_BALL_LOOSE_NOT_NONE"]
      : []),
    ...(shouldValidate && model.baseline.secondChanceCreated
      ? ["REBOUND_SECOND_CHANCE_BASELINE_CREATED"]
      : []),
    ...(shouldValidate && !["SAFE_DEFLECTION_RECOVERABLE_BY_DEFENSE", "SAFE_DEFLECTION", "HELD_BALL", "DEFENSIVE_CLEARANCE"].includes(model.override.reboundOutcome)
      ? ["REBOUND_SECOND_CHANCE_OVERRIDE_UNEXPECTED_OUTCOME"]
      : []),
    ...(shouldValidate && model.override.secondChanceCreated
      ? ["REBOUND_SECOND_CHANCE_CURRENT_FIXTURE_CREATED_SECOND_CHANCE"]
      : []),
    ...(results.some((result) => result.sandboxMatchEventCreated)
      ? ["REBOUND_SECOND_CHANCE_CREATED_MATCH_EVENT"]
      : []),
    ...(results.some((result) => result.sandboxScoringEventCreated)
      ? ["REBOUND_SECOND_CHANCE_CREATED_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.sandboxScoreDelta !== 0)
      ? ["REBOUND_SECOND_CHANCE_SCORE_DELTA_NON_ZERO"]
      : []),
    ...(shouldValidate && !model.modelAppliedOnlyInSandbox
      ? ["REBOUND_SECOND_CHANCE_NOT_SANDBOX_ONLY"]
      : []),
    ...(model.modelAppliedToNormalLiveSelection
      ? ["REBOUND_SECOND_CHANCE_APPLIED_TO_NORMAL_LIVE"]
      : []),
    ...(results.some((result) => !result.isolatedOnly) ? ["REBOUND_SECOND_CHANCE_RESULT_NOT_ISOLATED"] : []),
    ...(results.some((result) => result.canBecomeOfficialMatchEvent)
      ? ["REBOUND_SECOND_CHANCE_RESULT_CAN_BECOME_MATCH_EVENT"]
      : []),
    ...(results.some((result) => result.canMutateOfficialScore)
      ? ["REBOUND_SECOND_CHANCE_RESULT_CAN_MUTATE_SCORE"]
      : []),
    ...(results.some((result) => result.canCreateOfficialScoringEvent)
      ? ["REBOUND_SECOND_CHANCE_RESULT_CAN_CREATE_OFFICIAL_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.canCreateProductionScoringEvent)
      ? ["REBOUND_SECOND_CHANCE_RESULT_CAN_CREATE_PRODUCTION_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.canMutateOfficialPossession)
      ? ["REBOUND_SECOND_CHANCE_RESULT_CAN_MUTATE_POSSESSION"]
      : []),
    ...(!reboundSecondChanceCannotMutateOfficialFullMatch(model)
      ? ["REBOUND_SECOND_CHANCE_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!reboundSecondChanceCannotClaimGlobalEconomy(model)
      ? ["REBOUND_SECOND_CHANCE_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
  ];
}

export function reboundSecondChanceFromGoalkeeperResponse(input: {
  readonly matchInput: MatchInput;
  readonly goalkeeperResponseModel: GoalkeeperResponseModel;
}): ReboundSecondChanceModel {
  if (input.goalkeeperResponseModel.status !== "available") {
    return emptyReboundSecondChanceModel({
      ...(input.goalkeeperResponseModel.segmentLabel === undefined ? {} : { segmentLabel: input.goalkeeperResponseModel.segmentLabel }),
      ...(input.goalkeeperResponseModel.chainId === undefined ? {} : { chainId: input.goalkeeperResponseModel.chainId }),
      warnings: input.goalkeeperResponseModel.warnings,
    });
  }

  const baseline = reboundFromGoalkeeperPath({
    matchInput: input.matchInput,
    path: input.goalkeeperResponseModel.baseline,
  });
  const override = reboundFromGoalkeeperPath({
    matchInput: input.matchInput,
    path: input.goalkeeperResponseModel.override,
  });
  const comparison = compareReboundSecondChance({ baseline, override });
  const result: ReboundSecondChanceModel = {
    status: "available",
    scope: "rebound_second_chance_sandbox",
    origin: "goalkeeper_response_model_sandbox",
    ...(input.goalkeeperResponseModel.segmentLabel === undefined ? {} : { segmentLabel: input.goalkeeperResponseModel.segmentLabel }),
    ...(input.goalkeeperResponseModel.chainId === undefined ? {} : { chainId: input.goalkeeperResponseModel.chainId }),
    baseline,
    override,
    baselineSecondChanceCreated: baseline.secondChanceCreated,
    overrideSecondChanceCreated: override.secondChanceCreated,
    reboundOutcomeDivergenceObserved: comparison.reboundOutcomeDivergenceObserved,
    ballLooseStateDivergenceObserved: comparison.ballLooseStateDivergenceObserved,
    recoveryTeamDivergenceObserved: comparison.recoveryTeamDivergenceObserved,
    secondChanceProbabilityObserved: comparison.secondChanceProbabilityObserved,
    secondChanceCreationDivergenceObserved: comparison.secondChanceCreationDivergenceObserved,
    sandboxScoringEventDivergenceObserved: comparison.sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved: comparison.sandboxScoreDivergenceObserved,
    modelAppliedOnlyInSandbox: true,
    modelAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: input.goalkeeperResponseModel.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: input.goalkeeperResponseModel.rejectedUnavailableCandidateCount,
    diagnosticOnly: true,
    canInjectEventsIntoOfficialTimeline: false,
    canMutateOfficialScore: false,
    canMutateOfficialScoringEvents: false,
    canMutateOfficialPossession: false,
    canMutateProductionRouteResolution: false,
    canMutateGlobalRouteSuccessRates: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    explanation: comparison.explanation,
    tags: [
      "workbench_chain_rebound_second_chance_sandbox",
      "rebound_second_chance_sandbox",
      "rebound_second_chance_results_isolated_only",
      "rebound_second_chance_model_status_available",
      "rebound_second_chance_model_origin_goalkeeper_response_model_sandbox",
      `rebound_second_chance_baseline_outcome_${baseline.reboundOutcome}`,
      `rebound_second_chance_baseline_ball_loose_${baseline.ballLooseState}`,
      `rebound_second_chance_baseline_created_${baseline.secondChanceCreated ? "true" : "false"}`,
      `rebound_second_chance_override_source_response_type_${override.sourceGoalkeeperResponseType ?? "none"}`,
      `rebound_second_chance_override_source_rebound_state_${override.sourceReboundState ?? "none"}`,
      `rebound_second_chance_override_outcome_${override.reboundOutcome}`,
      `rebound_second_chance_override_ball_loose_${override.ballLooseState}`,
      `rebound_second_chance_override_recovery_team_${override.recoveryTeamCandidate}`,
      `rebound_second_chance_override_next_possession_${override.nextSandboxPossessionCandidate}`,
      `rebound_second_chance_override_attacking_proximity_${override.attackingProximityScore}`,
      `rebound_second_chance_override_defensive_recovery_${override.defensiveRecoveryScore}`,
      `rebound_second_chance_override_danger_${override.reboundDangerScore}`,
      `rebound_second_chance_override_probability_${override.secondChanceProbability}`,
      `rebound_second_chance_override_created_${override.secondChanceCreated ? "true" : "false"}`,
      ...baseline.tags,
      ...override.tags,
      `rebound_second_chance_outcome_divergence_${comparison.reboundOutcomeDivergenceObserved ? "true" : "false"}`,
      `rebound_second_chance_ball_loose_divergence_${comparison.ballLooseStateDivergenceObserved ? "true" : "false"}`,
      `rebound_second_chance_recovery_team_divergence_${comparison.recoveryTeamDivergenceObserved ? "true" : "false"}`,
      `rebound_second_chance_probability_observed_${comparison.secondChanceProbabilityObserved ? "true" : "false"}`,
      `rebound_second_chance_creation_divergence_${comparison.secondChanceCreationDivergenceObserved ? "true" : "false"}`,
      `rebound_second_chance_scoring_event_divergence_${comparison.sandboxScoringEventDivergenceObserved ? "true" : "false"}`,
      `rebound_second_chance_score_divergence_${comparison.sandboxScoreDivergenceObserved ? "true" : "false"}`,
      "rebound_second_chance_match_event_created_false",
      "rebound_second_chance_scoring_event_created_false",
      "rebound_second_chance_score_delta_0",
      "rebound_second_chance_official_possession_mutation_count_0",
      `rebound_second_chance_rejected_closed_count_${input.goalkeeperResponseModel.rejectedClosedCandidateCount}`,
      `rebound_second_chance_rejected_unavailable_count_${input.goalkeeperResponseModel.rejectedUnavailableCandidateCount}`,
      "rebound_second_chance_applied_only_in_sandbox_true",
      "rebound_second_chance_applied_to_normal_live_false",
      "rebound_second_chance_model_applied_only_in_sandbox_true",
      "rebound_second_chance_model_applied_to_normal_live_false",
      "rebound_second_chance_official_timeline_injection_forbidden",
      "rebound_second_chance_official_score_mutation_forbidden",
      "rebound_second_chance_official_scoring_events_mutation_forbidden",
      "rebound_second_chance_official_possession_mutation_forbidden",
      "rebound_second_chance_production_scoring_event_creation_forbidden",
      "rebound_second_chance_production_route_resolution_mutation_forbidden",
      "rebound_second_chance_global_route_success_mutation_forbidden",
      "rebound_second_chance_global_economy_claim_forbidden",
      "rebound_second_chance_closed_candidates_rejected",
      "rebound_second_chance_unavailable_candidates_rejected",
      "rebound_second_chance_injected_into_official_timeline_count_0",
      "rebound_second_chance_official_score_mutation_count_0",
      "rebound_second_chance_official_scoring_event_mutation_count_0",
      "rebound_second_chance_production_scoring_event_creation_count_0",
      "rebound_second_chance_production_route_resolution_mutation_count_0",
      "rebound_second_chance_global_route_success_mutation_count_0",
      "rebound_second_chance_global_economy_claim_count_0",
      ...(input.goalkeeperResponseModel.chainId === undefined ? [] : [`rebound_second_chance_chain_id_${input.goalkeeperResponseModel.chainId}`]),
    ],
    warnings: [...baseline.warnings, ...override.warnings],
  };
  const warnings = validateReboundSecondChanceModel(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}

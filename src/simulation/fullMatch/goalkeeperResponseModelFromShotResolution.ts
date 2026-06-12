import type { MatchInput } from "../../contracts/engineToCoach";
import { compareGoalkeeperResponses } from "./compareGoalkeeperResponses";
import { extractGoalkeeperResponseAttributes } from "./extractGoalkeeperResponseAttributes";
import {
  emptyGoalkeeperResponseModel,
  type GoalkeeperResponseModel,
  type GoalkeeperResponsePathResult,
} from "./goalkeeperResponseModel";
import type {
  AttributeDrivenShotResolutionModel,
  AttributeDrivenShotResolutionPathResult,
} from "./attributeDrivenShotResolutionSandbox";
import { resolveGoalkeeperResponse } from "./resolveGoalkeeperResponse";

function responseFromShotResolution(input: {
  readonly path: AttributeDrivenShotResolutionPathResult;
  readonly matchInput: MatchInput;
}): GoalkeeperResponsePathResult {
  const goalkeeperAttributes = extractGoalkeeperResponseAttributes({
    matchInput: input.matchInput,
    ...(input.path.goalkeeper.playerId === undefined ? {} : { goalkeeperId: input.path.goalkeeper.playerId }),
  });

  return {
    ...resolveGoalkeeperResponse({
      pathId: input.path.pathId,
      ...(input.path.candidateId === undefined ? {} : { candidateId: input.path.candidateId }),
      ...(input.path.shooter.playerId === undefined ? {} : { shooterId: input.path.shooter.playerId }),
      ...(goalkeeperAttributes.goalkeeperId === undefined ? {} : { goalkeeperId: goalkeeperAttributes.goalkeeperId }),
      ...(input.path.targetZone === undefined ? {} : { targetZone: input.path.targetZone }),
      sourceOutcome: input.path.outcome,
      sourceShotQuality: input.path.attributeAdjustedShotQuality,
      sourceGoalkeeperResponseQuality: input.path.attributeAdjustedGoalkeeperResponseQuality,
      shotPressureContext: input.path.defensivePressure,
      positioningScore: goalkeeperAttributes.positioningScore,
      trajectoryReadingScore: goalkeeperAttributes.trajectoryReadingScore,
      reactionScore: goalkeeperAttributes.reactionScore,
      handlingScore: goalkeeperAttributes.handlingScore,
      reboundControlScore: goalkeeperAttributes.reboundControlScore,
      concentrationScore: goalkeeperAttributes.concentrationScore,
      mentalFatigueImpact: goalkeeperAttributes.mentalFatigueImpact,
      ...(goalkeeperAttributes.role === undefined ? {} : { goalkeeperRole: goalkeeperAttributes.role }),
    }),
    warnings: [
      ...goalkeeperAttributes.warnings,
      ...resolveGoalkeeperResponse({
        pathId: input.path.pathId,
        sourceOutcome: input.path.outcome,
        sourceShotQuality: input.path.attributeAdjustedShotQuality,
        sourceGoalkeeperResponseQuality: input.path.attributeAdjustedGoalkeeperResponseQuality,
        shotPressureContext: input.path.defensivePressure,
        positioningScore: goalkeeperAttributes.positioningScore,
        trajectoryReadingScore: goalkeeperAttributes.trajectoryReadingScore,
        reactionScore: goalkeeperAttributes.reactionScore,
        handlingScore: goalkeeperAttributes.handlingScore,
        reboundControlScore: goalkeeperAttributes.reboundControlScore,
        concentrationScore: goalkeeperAttributes.concentrationScore,
        mentalFatigueImpact: goalkeeperAttributes.mentalFatigueImpact,
        ...(goalkeeperAttributes.role === undefined ? {} : { goalkeeperRole: goalkeeperAttributes.role }),
      }).warnings,
    ],
  };
}

export function goalkeeperResponseModelCannotMutateOfficialFullMatch(
  model: GoalkeeperResponseModel,
): boolean {
  const results = [model.baseline, model.override];

  return (
    !model.canInjectEventsIntoOfficialTimeline &&
    !model.canMutateOfficialScore &&
    !model.canMutateOfficialScoringEvents &&
    !model.canMutateProductionRouteResolution &&
    !model.canMutateGlobalRouteSuccessRates &&
    !model.canCreateProductionScoringEvents &&
    !model.modelAppliedToNormalLiveSelection &&
    results.every((result) =>
      result.isolatedOnly &&
      !result.canBecomeOfficialMatchEvent &&
      !result.canMutateOfficialScore &&
      !result.canCreateOfficialScoringEvent &&
      !result.canCreateProductionScoringEvent
    )
  );
}

export function goalkeeperResponseModelCannotClaimGlobalEconomy(model: GoalkeeperResponseModel): boolean {
  return !model.canClaimGlobalEconomy;
}

export function validateGoalkeeperResponseModel(model: GoalkeeperResponseModel): readonly string[] {
  const shouldValidate = model.status === "available";
  const results = [model.baseline, model.override];

  return [
    ...(shouldValidate && model.origin !== "attribute_driven_shot_resolution_sandbox"
      ? ["GOALKEEPER_RESPONSE_WRONG_ORIGIN"]
      : []),
    ...(shouldValidate && model.baseline.responseType !== "NOT_APPLICABLE"
      ? ["GOALKEEPER_RESPONSE_BASELINE_NOT_APPLICABLE"]
      : []),
    ...(shouldValidate && model.baseline.reboundState !== "none"
      ? ["GOALKEEPER_RESPONSE_BASELINE_REBOUND_NOT_NONE"]
      : []),
    ...(shouldValidate && !["CLEAN_SAVE", "PARRIED_SAVE"].includes(model.override.responseType)
      ? ["GOALKEEPER_RESPONSE_OVERRIDE_NOT_SAVE"]
      : []),
    ...(shouldValidate && model.override.saveMargin <= 0 ? ["GOALKEEPER_RESPONSE_SAVE_MARGIN_NOT_POSITIVE"] : []),
    ...(shouldValidate && !["held", "safe_deflection"].includes(model.override.reboundState)
      ? ["GOALKEEPER_RESPONSE_REBOUND_STATE_UNEXPECTED"]
      : []),
    ...(results.some((result) => result.sandboxScoringEventCreated)
      ? ["GOALKEEPER_RESPONSE_CREATED_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.sandboxScoreDelta !== 0)
      ? ["GOALKEEPER_RESPONSE_SCORE_DELTA_NON_ZERO"]
      : []),
    ...(shouldValidate && !model.modelAppliedOnlyInSandbox ? ["GOALKEEPER_RESPONSE_NOT_SANDBOX_ONLY"] : []),
    ...(model.modelAppliedToNormalLiveSelection ? ["GOALKEEPER_RESPONSE_APPLIED_TO_NORMAL_LIVE"] : []),
    ...(results.some((result) => !result.isolatedOnly) ? ["GOALKEEPER_RESPONSE_RESULT_NOT_ISOLATED"] : []),
    ...(results.some((result) => result.canBecomeOfficialMatchEvent)
      ? ["GOALKEEPER_RESPONSE_RESULT_CAN_BECOME_MATCH_EVENT"]
      : []),
    ...(results.some((result) => result.canMutateOfficialScore)
      ? ["GOALKEEPER_RESPONSE_RESULT_CAN_MUTATE_SCORE"]
      : []),
    ...(results.some((result) => result.canCreateOfficialScoringEvent)
      ? ["GOALKEEPER_RESPONSE_RESULT_CAN_CREATE_OFFICIAL_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.canCreateProductionScoringEvent)
      ? ["GOALKEEPER_RESPONSE_RESULT_CAN_CREATE_PRODUCTION_SCORING_EVENT"]
      : []),
    ...(!goalkeeperResponseModelCannotMutateOfficialFullMatch(model)
      ? ["GOALKEEPER_RESPONSE_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!goalkeeperResponseModelCannotClaimGlobalEconomy(model)
      ? ["GOALKEEPER_RESPONSE_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
  ];
}

export function goalkeeperResponseModelFromShotResolution(input: {
  readonly matchInput: MatchInput;
  readonly shotResolutionModel: AttributeDrivenShotResolutionModel;
}): GoalkeeperResponseModel {
  if (input.shotResolutionModel.status !== "available") {
    return emptyGoalkeeperResponseModel({
      ...(input.shotResolutionModel.segmentLabel === undefined ? {} : { segmentLabel: input.shotResolutionModel.segmentLabel }),
      ...(input.shotResolutionModel.chainId === undefined ? {} : { chainId: input.shotResolutionModel.chainId }),
      warnings: input.shotResolutionModel.warnings,
    });
  }

  const baseline = responseFromShotResolution({
    path: input.shotResolutionModel.baseline,
    matchInput: input.matchInput,
  });
  const override = responseFromShotResolution({
    path: input.shotResolutionModel.override,
    matchInput: input.matchInput,
  });
  const comparison = compareGoalkeeperResponses({ baseline, override });
  const result: GoalkeeperResponseModel = {
    status: "available",
    scope: "goalkeeper_response_model_sandbox",
    origin: "attribute_driven_shot_resolution_sandbox",
    ...(input.shotResolutionModel.segmentLabel === undefined ? {} : { segmentLabel: input.shotResolutionModel.segmentLabel }),
    ...(input.shotResolutionModel.chainId === undefined ? {} : { chainId: input.shotResolutionModel.chainId }),
    baseline,
    override,
    baselineSaveRequired: baseline.responseType !== "NOT_APPLICABLE",
    overrideSaveRequired: override.responseType !== "NOT_APPLICABLE" && override.responseType !== "NO_SAVE_REQUIRED",
    goalkeeperResponseDivergenceObserved: comparison.goalkeeperResponseDivergenceObserved,
    reboundStateDivergenceObserved: comparison.reboundStateDivergenceObserved,
    saveMarginObserved: comparison.saveMarginObserved,
    goalkeeperAttributeInfluenceObserved: comparison.goalkeeperAttributeInfluenceObserved,
    sandboxScoringEventDivergenceObserved: comparison.sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved: comparison.sandboxScoreDivergenceObserved,
    modelAppliedOnlyInSandbox: true,
    modelAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: input.shotResolutionModel.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: input.shotResolutionModel.rejectedUnavailableCandidateCount,
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
      "workbench_chain_goalkeeper_response_model_sandbox",
      "goalkeeper_response_model_sandbox",
      "goalkeeper_response_results_isolated_only",
      "goalkeeper_response_model_status_available",
      "goalkeeper_response_model_origin_attribute_driven_shot_resolution_sandbox",
      ...baseline.tags,
      ...override.tags,
      `goalkeeper_response_divergence_${comparison.goalkeeperResponseDivergenceObserved ? "true" : "false"}`,
      `goalkeeper_response_rebound_divergence_${comparison.reboundStateDivergenceObserved ? "true" : "false"}`,
      `goalkeeper_response_save_margin_observed_${comparison.saveMarginObserved ? "true" : "false"}`,
      `goalkeeper_response_attribute_influence_${comparison.goalkeeperAttributeInfluenceObserved ? "true" : "false"}`,
      `goalkeeper_response_scoring_event_divergence_${comparison.sandboxScoringEventDivergenceObserved ? "true" : "false"}`,
      `goalkeeper_response_score_divergence_${comparison.sandboxScoreDivergenceObserved ? "true" : "false"}`,
      "goalkeeper_response_scoring_event_created_false",
      "goalkeeper_response_score_delta_0",
      "goalkeeper_response_applied_only_in_sandbox_true",
      "goalkeeper_response_applied_to_normal_live_false",
      "goalkeeper_response_model_applied_only_in_sandbox_true",
      "goalkeeper_response_model_applied_to_normal_live_false",
      "goalkeeper_response_official_timeline_injection_forbidden",
      "goalkeeper_response_official_score_mutation_forbidden",
      "goalkeeper_response_official_scoring_events_mutation_forbidden",
      "goalkeeper_response_production_resolution_forbidden",
      "goalkeeper_response_production_scoring_event_creation_forbidden",
      "goalkeeper_response_global_route_success_mutation_forbidden",
      "goalkeeper_response_global_economy_claim_forbidden",
      "goalkeeper_response_closed_candidates_rejected",
      "goalkeeper_response_unavailable_candidates_rejected",
      "goalkeeper_response_injected_into_official_timeline_count_0",
      "goalkeeper_response_official_score_mutation_count_0",
      "goalkeeper_response_official_scoring_event_mutation_count_0",
      "goalkeeper_response_production_scoring_event_creation_count_0",
      "goalkeeper_response_production_route_resolution_mutation_count_0",
      "goalkeeper_response_global_route_success_mutation_count_0",
      "goalkeeper_response_global_economy_claim_count_0",
      ...(input.shotResolutionModel.chainId === undefined ? [] : [`goalkeeper_response_chain_id_${input.shotResolutionModel.chainId}`]),
    ],
    warnings: [...baseline.warnings, ...override.warnings],
  };
  const warnings = validateGoalkeeperResponseModel(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}

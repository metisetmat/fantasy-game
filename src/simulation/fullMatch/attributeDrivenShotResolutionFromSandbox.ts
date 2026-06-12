import type { MatchInput } from "../../contracts/engineToCoach";
import {
  emptyAttributeDrivenShotResolutionModel,
  type AttributeDrivenShotResolutionModel,
  type AttributeDrivenShotResolutionPathResult,
} from "./attributeDrivenShotResolutionSandbox";
import { compareAttributeDrivenShotResolutions } from "./compareAttributeDrivenShotResolutions";
import { extractShotResolutionActors } from "./extractShotResolutionActors";
import { resolveAttributeDrivenShot } from "./resolveAttributeDrivenShot";
import type {
  SandboxScoringEventResolutionModel,
  SandboxScoringEventResolutionPathResult,
} from "./sandboxScoringEventResolution";

function pathFromResolution(input: {
  readonly path: SandboxScoringEventResolutionPathResult;
  readonly matchInput: MatchInput;
}): AttributeDrivenShotResolutionPathResult {
  const actors = extractShotResolutionActors({
    matchInput: input.matchInput,
    ...(input.path.receiverId === undefined ? {} : { receiverId: input.path.receiverId }),
  });

  return {
    ...resolveAttributeDrivenShot({
      pathId: input.path.pathId,
      ...(input.path.candidateId === undefined ? {} : { candidateId: input.path.candidateId }),
      ...(input.path.actionType === undefined ? {} : { actionType: input.path.actionType }),
      ...(input.path.receiverId === undefined ? {} : { receiverId: input.path.receiverId }),
      ...(input.path.targetZone === undefined ? {} : { targetZone: input.path.targetZone }),
      sourceResolutionType: input.path.resolutionType,
      ...(input.path.sourceScoringCandidateType === undefined
        ? {}
        : { sourceScoringCandidateType: input.path.sourceScoringCandidateType }),
      sourceConversionProbability: input.path.sourceConversionProbability,
      sourceShotQuality: input.path.shotQuality,
      sourceGoalkeeperResponse: input.path.goalkeeperResponse,
      shooter: actors.shooter,
      goalkeeper: actors.goalkeeper,
      receptionQuality: input.path.receptionQuality,
      defensivePressure: input.path.defensivePressure,
    }),
    warnings: [
      ...actors.warnings,
      ...resolveAttributeDrivenShot({
        pathId: input.path.pathId,
        sourceResolutionType: input.path.resolutionType,
        ...(input.path.sourceScoringCandidateType === undefined
          ? {}
          : { sourceScoringCandidateType: input.path.sourceScoringCandidateType }),
        sourceConversionProbability: input.path.sourceConversionProbability,
        sourceShotQuality: input.path.shotQuality,
        sourceGoalkeeperResponse: input.path.goalkeeperResponse,
        shooter: actors.shooter,
        goalkeeper: actors.goalkeeper,
        receptionQuality: input.path.receptionQuality,
        defensivePressure: input.path.defensivePressure,
      }).warnings,
    ],
  };
}

export function attributeDrivenShotResolutionCannotMutateOfficialFullMatch(
  model: AttributeDrivenShotResolutionModel,
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

export function attributeDrivenShotResolutionCannotClaimGlobalEconomy(
  model: AttributeDrivenShotResolutionModel,
): boolean {
  return !model.canClaimGlobalEconomy;
}

export function validateAttributeDrivenShotResolutionModel(
  model: AttributeDrivenShotResolutionModel,
): readonly string[] {
  const shouldValidate = model.status === "available";
  const results = [model.baseline, model.override];

  return [
    ...(shouldValidate && model.origin !== "sandbox_scoring_event_resolution"
      ? ["ATTRIBUTE_DRIVEN_SHOT_WRONG_ORIGIN"]
      : []),
    ...(shouldValidate && model.baseline.outcome !== "NO_SCORE_ATTEMPT"
      ? ["ATTRIBUTE_DRIVEN_SHOT_BASELINE_NOT_NO_SCORE_ATTEMPT"]
      : []),
    ...(shouldValidate && !model.override.shotAttemptCreated
      ? ["ATTRIBUTE_DRIVEN_SHOT_OVERRIDE_DID_NOT_CREATE_SHOT_ATTEMPT"]
      : []),
    ...(shouldValidate && model.override.attributeAdjustedShotQuality <= model.baseline.attributeAdjustedShotQuality
      ? ["ATTRIBUTE_DRIVEN_SHOT_OVERRIDE_QUALITY_NOT_ABOVE_BASELINE"]
      : []),
    ...(results.some((result) => result.sandboxScoringEventCreated)
      ? ["ATTRIBUTE_DRIVEN_SHOT_CREATED_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.sandboxScoreDelta !== 0)
      ? ["ATTRIBUTE_DRIVEN_SHOT_SCORE_DELTA_NON_ZERO"]
      : []),
    ...(shouldValidate && !model.modelAppliedOnlyInSandbox ? ["ATTRIBUTE_DRIVEN_SHOT_NOT_SANDBOX_ONLY"] : []),
    ...(model.modelAppliedToNormalLiveSelection ? ["ATTRIBUTE_DRIVEN_SHOT_APPLIED_TO_NORMAL_LIVE"] : []),
    ...(results.some((result) => !result.isolatedOnly) ? ["ATTRIBUTE_DRIVEN_SHOT_RESULT_NOT_ISOLATED"] : []),
    ...(results.some((result) => result.canBecomeOfficialMatchEvent)
      ? ["ATTRIBUTE_DRIVEN_SHOT_RESULT_CAN_BECOME_MATCH_EVENT"]
      : []),
    ...(results.some((result) => result.canMutateOfficialScore)
      ? ["ATTRIBUTE_DRIVEN_SHOT_RESULT_CAN_MUTATE_SCORE"]
      : []),
    ...(results.some((result) => result.canCreateOfficialScoringEvent)
      ? ["ATTRIBUTE_DRIVEN_SHOT_RESULT_CAN_CREATE_OFFICIAL_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.canCreateProductionScoringEvent)
      ? ["ATTRIBUTE_DRIVEN_SHOT_RESULT_CAN_CREATE_PRODUCTION_SCORING_EVENT"]
      : []),
    ...(!attributeDrivenShotResolutionCannotMutateOfficialFullMatch(model)
      ? ["ATTRIBUTE_DRIVEN_SHOT_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!attributeDrivenShotResolutionCannotClaimGlobalEconomy(model)
      ? ["ATTRIBUTE_DRIVEN_SHOT_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
  ];
}

export function attributeDrivenShotResolutionFromSandbox(input: {
  readonly matchInput: MatchInput;
  readonly resolutionModel: SandboxScoringEventResolutionModel;
}): AttributeDrivenShotResolutionModel {
  if (input.resolutionModel.status !== "available") {
    return emptyAttributeDrivenShotResolutionModel({
      ...(input.resolutionModel.segmentLabel === undefined ? {} : { segmentLabel: input.resolutionModel.segmentLabel }),
      ...(input.resolutionModel.chainId === undefined ? {} : { chainId: input.resolutionModel.chainId }),
      warnings: input.resolutionModel.warnings,
    });
  }

  const baseline = pathFromResolution({ path: input.resolutionModel.baseline, matchInput: input.matchInput });
  const override = pathFromResolution({ path: input.resolutionModel.override, matchInput: input.matchInput });
  const comparison = compareAttributeDrivenShotResolutions({ baseline, override });
  const result: AttributeDrivenShotResolutionModel = {
    status: "available",
    scope: "attribute_driven_shot_resolution_sandbox",
    origin: "sandbox_scoring_event_resolution",
    ...(input.resolutionModel.segmentLabel === undefined ? {} : { segmentLabel: input.resolutionModel.segmentLabel }),
    ...(input.resolutionModel.chainId === undefined ? {} : { chainId: input.resolutionModel.chainId }),
    baseline,
    override,
    baselineShotAttemptCreated: baseline.shotAttemptCreated,
    overrideShotAttemptCreated: override.shotAttemptCreated,
    attributeDrivenOutcomeDivergenceObserved: comparison.attributeDrivenOutcomeDivergenceObserved,
    shotQualityDivergenceObserved: comparison.shotQualityDivergenceObserved,
    goalkeeperQualityDivergenceObserved: comparison.goalkeeperQualityDivergenceObserved,
    attributeInfluenceObserved: comparison.attributeInfluenceObserved,
    sandboxScoringEventDivergenceObserved: comparison.sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved: comparison.sandboxScoreDivergenceObserved,
    modelAppliedOnlyInSandbox: true,
    modelAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: input.resolutionModel.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: input.resolutionModel.rejectedUnavailableCandidateCount,
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
      "workbench_chain_attribute_driven_shot_resolution_sandbox",
      "attribute_driven_shot_resolution_sandbox",
      "attribute_driven_shot_resolution_results_isolated_only",
      "attribute_driven_shot_model_status_available",
      "attribute_driven_shot_model_origin_sandbox_scoring_event_resolution",
      ...baseline.tags,
      ...override.tags,
      `attribute_driven_shot_outcome_divergence_${comparison.attributeDrivenOutcomeDivergenceObserved ? "true" : "false"}`,
      `attribute_driven_shot_quality_divergence_${comparison.shotQualityDivergenceObserved ? "true" : "false"}`,
      `attribute_driven_shot_goalkeeper_quality_divergence_${comparison.goalkeeperQualityDivergenceObserved ? "true" : "false"}`,
      `attribute_driven_shot_attribute_influence_${comparison.attributeInfluenceObserved ? "true" : "false"}`,
      `attribute_driven_shot_scoring_event_divergence_${comparison.sandboxScoringEventDivergenceObserved ? "true" : "false"}`,
      `attribute_driven_shot_score_divergence_${comparison.sandboxScoreDivergenceObserved ? "true" : "false"}`,
      "attribute_driven_shot_scoring_event_created_false",
      "attribute_driven_shot_score_delta_0",
      "attribute_driven_shot_applied_only_in_sandbox_true",
      "attribute_driven_shot_applied_to_normal_live_false",
      "attribute_driven_shot_model_applied_only_in_sandbox_true",
      "attribute_driven_shot_model_applied_to_normal_live_false",
      "attribute_driven_shot_official_timeline_injection_forbidden",
      "attribute_driven_shot_official_score_mutation_forbidden",
      "attribute_driven_shot_official_scoring_events_mutation_forbidden",
      "attribute_driven_shot_production_resolution_forbidden",
      "attribute_driven_shot_production_scoring_event_creation_forbidden",
      "attribute_driven_shot_global_route_success_mutation_forbidden",
      "attribute_driven_shot_global_economy_claim_forbidden",
      "attribute_driven_shot_closed_candidates_rejected",
      "attribute_driven_shot_unavailable_candidates_rejected",
      "attribute_driven_shot_injected_into_official_timeline_count_0",
      "attribute_driven_shot_official_score_mutation_count_0",
      "attribute_driven_shot_official_scoring_event_mutation_count_0",
      "attribute_driven_shot_production_scoring_event_creation_count_0",
      "attribute_driven_shot_production_route_resolution_mutation_count_0",
      "attribute_driven_shot_global_route_success_mutation_count_0",
      "attribute_driven_shot_global_economy_claim_count_0",
      ...(input.resolutionModel.chainId === undefined ? [] : [`attribute_driven_shot_chain_id_${input.resolutionModel.chainId}`]),
    ],
    warnings: [...baseline.warnings, ...override.warnings],
  };
  const warnings = validateAttributeDrivenShotResolutionModel(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}

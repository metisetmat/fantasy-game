import { compareSandboxScoringEventResolutions } from "./compareSandboxScoringEventResolutions";
import { resolveSandboxScoringEventCandidate } from "./resolveSandboxScoringEventCandidate";
import type { SandboxScoringEventCandidateModel, SandboxScoringEventCandidatePathResult } from "./sandboxScoringEventCandidate";
import {
  emptySandboxScoringEventResolutionModel,
  type SandboxScoringEventResolutionModel,
  type SandboxScoringEventResolutionPathResult,
} from "./sandboxScoringEventResolution";

function resolutionFromCandidate(
  candidate: SandboxScoringEventCandidatePathResult,
): SandboxScoringEventResolutionPathResult {
  return resolveSandboxScoringEventCandidate({
    pathId: candidate.pathId,
    ...(candidate.candidateId === undefined ? {} : { candidateId: candidate.candidateId }),
    ...(candidate.actionType === undefined ? {} : { actionType: candidate.actionType }),
    ...(candidate.receiverId === undefined ? {} : { receiverId: candidate.receiverId }),
    ...(candidate.targetZone === undefined ? {} : { targetZone: candidate.targetZone }),
    scoringCandidateType: candidate.scoringCandidateType,
    scoringCandidateFamily: candidate.scoringCandidateFamily,
    scoringCandidateProbability: candidate.scoringCandidateProbability,
    conversionProbability: candidate.conversionProbability,
    ...(candidate.sourceOpportunityType === undefined ? {} : { opportunityType: candidate.sourceOpportunityType }),
    ...(candidate.sourceRouteOutcome === undefined ? {} : { routeOutcome: candidate.sourceRouteOutcome }),
  });
}

export function sandboxScoringEventResolutionCannotMutateOfficialFullMatch(
  model: SandboxScoringEventResolutionModel,
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

export function sandboxScoringEventResolutionCannotClaimGlobalEconomy(
  model: SandboxScoringEventResolutionModel,
): boolean {
  return !model.canClaimGlobalEconomy;
}

export function validateSandboxScoringEventResolutionModel(
  model: SandboxScoringEventResolutionModel,
): readonly string[] {
  const shouldValidate = model.status === "available";
  const results = [model.baseline, model.override];

  return [
    ...(shouldValidate && model.origin !== "sandbox_scoring_event_candidate"
      ? ["SANDBOX_SCORING_RESOLUTION_WRONG_ORIGIN"]
      : []),
    ...(shouldValidate && model.baseline.resolutionType !== "NO_SCORE_ATTEMPT"
      ? ["SANDBOX_SCORING_RESOLUTION_BASELINE_NOT_NO_SCORE_ATTEMPT"]
      : []),
    ...(shouldValidate && !["SHOT_ON_TARGET", "SAVED_BY_GK"].includes(model.override.resolutionType)
      ? ["SANDBOX_SCORING_RESOLUTION_OVERRIDE_NOT_SHOT_RESULT"]
      : []),
    ...(results.some((result) => result.sandboxScoringEventCreated)
      ? ["SANDBOX_SCORING_RESOLUTION_CREATED_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.sandboxScoreDelta !== 0)
      ? ["SANDBOX_SCORING_RESOLUTION_SCORE_DELTA_NON_ZERO"]
      : []),
    ...(shouldValidate && !model.modelAppliedOnlyInSandbox ? ["SANDBOX_SCORING_RESOLUTION_NOT_SANDBOX_ONLY"] : []),
    ...(model.modelAppliedToNormalLiveSelection ? ["SANDBOX_SCORING_RESOLUTION_APPLIED_TO_NORMAL_LIVE"] : []),
    ...(results.some((result) => !result.isolatedOnly) ? ["SANDBOX_SCORING_RESOLUTION_RESULT_NOT_ISOLATED"] : []),
    ...(results.some((result) => result.canBecomeOfficialMatchEvent)
      ? ["SANDBOX_SCORING_RESOLUTION_RESULT_CAN_BECOME_MATCH_EVENT"]
      : []),
    ...(results.some((result) => result.canMutateOfficialScore)
      ? ["SANDBOX_SCORING_RESOLUTION_RESULT_CAN_MUTATE_SCORE"]
      : []),
    ...(results.some((result) => result.canCreateOfficialScoringEvent)
      ? ["SANDBOX_SCORING_RESOLUTION_RESULT_CAN_CREATE_OFFICIAL_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.canCreateProductionScoringEvent)
      ? ["SANDBOX_SCORING_RESOLUTION_RESULT_CAN_CREATE_PRODUCTION_SCORING_EVENT"]
      : []),
    ...(!sandboxScoringEventResolutionCannotMutateOfficialFullMatch(model)
      ? ["SANDBOX_SCORING_RESOLUTION_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!sandboxScoringEventResolutionCannotClaimGlobalEconomy(model)
      ? ["SANDBOX_SCORING_RESOLUTION_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
  ];
}

export function sandboxScoringEventResolutionFromCandidate(input: {
  readonly candidateModel: SandboxScoringEventCandidateModel;
}): SandboxScoringEventResolutionModel {
  if (input.candidateModel.status !== "available") {
    return emptySandboxScoringEventResolutionModel({
      ...(input.candidateModel.segmentLabel === undefined ? {} : { segmentLabel: input.candidateModel.segmentLabel }),
      ...(input.candidateModel.chainId === undefined ? {} : { chainId: input.candidateModel.chainId }),
      warnings: input.candidateModel.warnings,
    });
  }

  const baseline = resolutionFromCandidate(input.candidateModel.baseline);
  const override = resolutionFromCandidate(input.candidateModel.override);
  const comparison = compareSandboxScoringEventResolutions({ baseline, override });
  const result: SandboxScoringEventResolutionModel = {
    status: "available",
    scope: "sandbox_scoring_event_resolution",
    origin: "sandbox_scoring_event_candidate",
    ...(input.candidateModel.segmentLabel === undefined ? {} : { segmentLabel: input.candidateModel.segmentLabel }),
    ...(input.candidateModel.chainId === undefined ? {} : { chainId: input.candidateModel.chainId }),
    baseline,
    override,
    baselineShotAttemptCreated: baseline.shotAttemptCreated,
    overrideShotAttemptCreated: override.shotAttemptCreated,
    scoringResolutionTypeDivergenceObserved: comparison.scoringResolutionTypeDivergenceObserved,
    shotAttemptCreationDivergenceObserved: comparison.shotAttemptCreationDivergenceObserved,
    shotQualityDivergenceObserved: comparison.shotQualityDivergenceObserved,
    goalkeeperResponseDivergenceObserved: comparison.goalkeeperResponseDivergenceObserved,
    sandboxScoringEventDivergenceObserved: comparison.sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved: comparison.sandboxScoreDivergenceObserved,
    modelAppliedOnlyInSandbox: true,
    modelAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: input.candidateModel.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: input.candidateModel.rejectedUnavailableCandidateCount,
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
      "workbench_chain_sandbox_scoring_event_resolution",
      "sandbox_scoring_event_resolution",
      "sandbox_scoring_resolution_results_isolated_only",
      ...baseline.tags,
      ...override.tags,
      `sandbox_scoring_resolution_type_divergence_${comparison.scoringResolutionTypeDivergenceObserved ? "true" : "false"}`,
      `sandbox_scoring_resolution_shot_attempt_divergence_${comparison.shotAttemptCreationDivergenceObserved ? "true" : "false"}`,
      `sandbox_scoring_resolution_shot_quality_divergence_${comparison.shotQualityDivergenceObserved ? "true" : "false"}`,
      `sandbox_scoring_resolution_goalkeeper_response_divergence_${comparison.goalkeeperResponseDivergenceObserved ? "true" : "false"}`,
      `sandbox_scoring_event_divergence_${comparison.sandboxScoringEventDivergenceObserved ? "true" : "false"}`,
      `sandbox_scoring_resolution_score_divergence_${comparison.sandboxScoreDivergenceObserved ? "true" : "false"}`,
      "sandbox_scoring_event_created_false",
      "sandbox_scoring_resolution_score_delta_0",
      "sandbox_scoring_resolution_applied_only_in_sandbox_true",
      "sandbox_scoring_resolution_applied_to_normal_live_false",
      "sandbox_scoring_resolution_official_timeline_injection_forbidden",
      "sandbox_scoring_resolution_official_score_mutation_forbidden",
      "sandbox_scoring_resolution_official_scoring_events_mutation_forbidden",
      "sandbox_scoring_resolution_production_resolution_forbidden",
      "sandbox_scoring_resolution_production_scoring_event_creation_forbidden",
      "sandbox_scoring_resolution_global_route_success_mutation_forbidden",
      "sandbox_scoring_resolution_global_economy_claim_forbidden",
      "sandbox_scoring_resolution_closed_candidates_rejected",
      "sandbox_scoring_resolution_unavailable_candidates_rejected",
      "sandbox_scoring_resolution_injected_into_official_timeline_count_0",
      "sandbox_scoring_resolution_official_score_mutation_count_0",
      "sandbox_scoring_resolution_official_scoring_event_mutation_count_0",
      "sandbox_scoring_resolution_production_scoring_event_creation_count_0",
      "sandbox_scoring_resolution_production_route_resolution_mutation_count_0",
      "sandbox_scoring_resolution_global_route_success_mutation_count_0",
      "sandbox_scoring_resolution_global_economy_claim_count_0",
      ...(input.candidateModel.chainId === undefined ? [] : [`sandbox_scoring_resolution_chain_id_${input.candidateModel.chainId}`]),
    ],
    warnings: [...baseline.warnings, ...override.warnings],
  };
  const warnings = validateSandboxScoringEventResolutionModel(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}

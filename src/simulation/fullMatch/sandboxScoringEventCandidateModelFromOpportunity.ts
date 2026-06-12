import { compareSandboxScoringEventCandidates } from "./compareSandboxScoringEventCandidates";
import { createSandboxScoringEventCandidate } from "./createSandboxScoringEventCandidate";
import {
  emptySandboxScoringEventCandidateModel,
  type SandboxScoringEventCandidateModel,
  type SandboxScoringEventCandidatePathResult,
} from "./sandboxScoringEventCandidate";
import type { SandboxScoringOpportunityModel, SandboxScoringOpportunityPathResult } from "./sandboxScoringOpportunityModel";

function candidateFromOpportunity(
  opportunity: SandboxScoringOpportunityPathResult,
): SandboxScoringEventCandidatePathResult {
  return createSandboxScoringEventCandidate({
    pathId: opportunity.pathId,
    ...(opportunity.candidateId === undefined ? {} : { candidateId: opportunity.candidateId }),
    ...(opportunity.actionType === undefined ? {} : { actionType: opportunity.actionType }),
    ...(opportunity.receiverId === undefined ? {} : { receiverId: opportunity.receiverId }),
    ...(opportunity.targetZone === undefined ? {} : { targetZone: opportunity.targetZone }),
    opportunityType: opportunity.opportunityType,
    opportunityFamily: opportunity.opportunityFamily,
    opportunityProbability: opportunity.opportunityProbability,
    ...(opportunity.routeOutcome === undefined ? {} : { routeOutcome: opportunity.routeOutcome }),
    dangerProbability: opportunity.sourceDangerProbability,
  });
}

export function sandboxScoringEventCandidateCannotMutateOfficialFullMatch(
  model: SandboxScoringEventCandidateModel,
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

export function sandboxScoringEventCandidateCannotClaimGlobalEconomy(
  model: SandboxScoringEventCandidateModel,
): boolean {
  return !model.canClaimGlobalEconomy;
}

export function validateSandboxScoringEventCandidateModel(
  model: SandboxScoringEventCandidateModel,
): readonly string[] {
  const shouldValidate = model.status === "available";
  const results = [model.baseline, model.override];

  return [
    ...(shouldValidate && model.origin !== "sandbox_scoring_opportunity_model"
      ? ["SANDBOX_SCORING_CANDIDATE_WRONG_ORIGIN"]
      : []),
    ...(results.some((result) => result.sandboxScoringEventCreated)
      ? ["SANDBOX_SCORING_CANDIDATE_CREATED_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.sandboxScoreDelta !== 0)
      ? ["SANDBOX_SCORING_CANDIDATE_SCORE_DELTA_NON_ZERO"]
      : []),
    ...(shouldValidate && !model.modelAppliedOnlyInSandbox ? ["SANDBOX_SCORING_CANDIDATE_NOT_SANDBOX_ONLY"] : []),
    ...(model.modelAppliedToNormalLiveSelection ? ["SANDBOX_SCORING_CANDIDATE_APPLIED_TO_NORMAL_LIVE"] : []),
    ...(results.some((result) => !result.isolatedOnly) ? ["SANDBOX_SCORING_CANDIDATE_RESULT_NOT_ISOLATED"] : []),
    ...(results.some((result) => result.canBecomeOfficialMatchEvent)
      ? ["SANDBOX_SCORING_CANDIDATE_RESULT_CAN_BECOME_MATCH_EVENT"]
      : []),
    ...(results.some((result) => result.canMutateOfficialScore)
      ? ["SANDBOX_SCORING_CANDIDATE_RESULT_CAN_MUTATE_SCORE"]
      : []),
    ...(results.some((result) => result.canCreateOfficialScoringEvent)
      ? ["SANDBOX_SCORING_CANDIDATE_RESULT_CAN_CREATE_OFFICIAL_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.canCreateProductionScoringEvent)
      ? ["SANDBOX_SCORING_CANDIDATE_RESULT_CAN_CREATE_PRODUCTION_SCORING_EVENT"]
      : []),
    ...(!sandboxScoringEventCandidateCannotMutateOfficialFullMatch(model)
      ? ["SANDBOX_SCORING_CANDIDATE_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!sandboxScoringEventCandidateCannotClaimGlobalEconomy(model)
      ? ["SANDBOX_SCORING_CANDIDATE_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
  ];
}

export function sandboxScoringEventCandidateModelFromOpportunity(input: {
  readonly opportunityModel: SandboxScoringOpportunityModel;
}): SandboxScoringEventCandidateModel {
  if (input.opportunityModel.status !== "available") {
    return emptySandboxScoringEventCandidateModel({
      ...(input.opportunityModel.segmentLabel === undefined ? {} : { segmentLabel: input.opportunityModel.segmentLabel }),
      ...(input.opportunityModel.chainId === undefined ? {} : { chainId: input.opportunityModel.chainId }),
      warnings: input.opportunityModel.warnings,
    });
  }

  const baseline = candidateFromOpportunity(input.opportunityModel.baseline);
  const override = candidateFromOpportunity(input.opportunityModel.override);
  const comparison = compareSandboxScoringEventCandidates({ baseline, override });
  const result: SandboxScoringEventCandidateModel = {
    status: "available",
    scope: "sandbox_scoring_event_candidate",
    origin: "sandbox_scoring_opportunity_model",
    ...(input.opportunityModel.segmentLabel === undefined ? {} : { segmentLabel: input.opportunityModel.segmentLabel }),
    ...(input.opportunityModel.chainId === undefined ? {} : { chainId: input.opportunityModel.chainId }),
    baseline,
    override,
    baselineScoringCandidateCreated: baseline.scoringCandidateCreated,
    overrideScoringCandidateCreated: override.scoringCandidateCreated,
    scoringCandidateTypeDivergenceObserved: comparison.scoringCandidateTypeDivergenceObserved,
    scoringCandidateFamilyDivergenceObserved: comparison.scoringCandidateFamilyDivergenceObserved,
    scoringCandidateProbabilityDivergenceObserved: comparison.scoringCandidateProbabilityDivergenceObserved,
    scoringCandidateCreationDivergenceObserved: comparison.scoringCandidateCreationDivergenceObserved,
    conversionProbabilityDivergenceObserved: comparison.conversionProbabilityDivergenceObserved,
    sandboxScoringEventDivergenceObserved: comparison.sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved: comparison.sandboxScoreDivergenceObserved,
    modelAppliedOnlyInSandbox: true,
    modelAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: input.opportunityModel.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: input.opportunityModel.rejectedUnavailableCandidateCount,
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
      "workbench_chain_sandbox_scoring_event_candidate",
      "sandbox_scoring_event_candidate",
      "sandbox_scoring_candidate_results_isolated_only",
      ...baseline.tags,
      ...override.tags,
      `sandbox_scoring_candidate_type_divergence_${comparison.scoringCandidateTypeDivergenceObserved ? "true" : "false"}`,
      `sandbox_scoring_candidate_family_divergence_${comparison.scoringCandidateFamilyDivergenceObserved ? "true" : "false"}`,
      `sandbox_scoring_candidate_probability_divergence_${comparison.scoringCandidateProbabilityDivergenceObserved ? "true" : "false"}`,
      `sandbox_scoring_candidate_creation_divergence_${comparison.scoringCandidateCreationDivergenceObserved ? "true" : "false"}`,
      `sandbox_scoring_candidate_conversion_probability_divergence_${comparison.conversionProbabilityDivergenceObserved ? "true" : "false"}`,
      `sandbox_scoring_event_divergence_${comparison.sandboxScoringEventDivergenceObserved ? "true" : "false"}`,
      `sandbox_scoring_candidate_score_divergence_${comparison.sandboxScoreDivergenceObserved ? "true" : "false"}`,
      "sandbox_scoring_event_created_false",
      "sandbox_scoring_candidate_score_delta_0",
      "sandbox_scoring_candidate_applied_only_in_sandbox_true",
      "sandbox_scoring_candidate_applied_to_normal_live_false",
      "sandbox_scoring_candidate_official_timeline_injection_forbidden",
      "sandbox_scoring_candidate_official_score_mutation_forbidden",
      "sandbox_scoring_candidate_official_scoring_events_mutation_forbidden",
      "sandbox_scoring_candidate_production_resolution_forbidden",
      "sandbox_scoring_candidate_production_scoring_event_creation_forbidden",
      "sandbox_scoring_candidate_global_route_success_mutation_forbidden",
      "sandbox_scoring_candidate_global_economy_claim_forbidden",
      "sandbox_scoring_candidate_closed_candidates_rejected",
      "sandbox_scoring_candidate_unavailable_candidates_rejected",
      "sandbox_scoring_candidate_injected_into_official_timeline_count_0",
      "sandbox_scoring_candidate_official_score_mutation_count_0",
      "sandbox_scoring_candidate_official_scoring_event_mutation_count_0",
      "sandbox_scoring_candidate_production_scoring_event_creation_count_0",
      "sandbox_scoring_candidate_production_route_resolution_mutation_count_0",
      "sandbox_scoring_candidate_global_route_success_mutation_count_0",
      "sandbox_scoring_candidate_global_economy_claim_count_0",
      ...(input.opportunityModel.chainId === undefined ? [] : [`sandbox_scoring_candidate_chain_id_${input.opportunityModel.chainId}`]),
    ],
    warnings: [...baseline.warnings, ...override.warnings],
  };
  const warnings = validateSandboxScoringEventCandidateModel(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}

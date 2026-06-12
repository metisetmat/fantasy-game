import type { ControlledRouteResolutionPathResult, ControlledRouteResolutionSandbox } from "./controlledRouteResolutionSandbox";
import { classifySandboxScoringOpportunity } from "./classifySandboxScoringOpportunity";
import { compareSandboxScoringOpportunities } from "./compareSandboxScoringOpportunities";
import {
  emptySandboxScoringOpportunityModel,
  type SandboxScoringOpportunityModel,
  type SandboxScoringOpportunityPathResult,
} from "./sandboxScoringOpportunityModel";

function pathOpportunityFromResolution(
  path: ControlledRouteResolutionPathResult,
): SandboxScoringOpportunityPathResult {
  return classifySandboxScoringOpportunity({
    pathId: path.pathId,
    ...(path.candidateId === undefined ? {} : { candidateId: path.candidateId }),
    ...(path.actionType === undefined ? {} : { actionType: path.actionType }),
    ...(path.receiverId === undefined ? {} : { receiverId: path.receiverId }),
    ...(path.targetZone === undefined ? {} : { targetZone: path.targetZone }),
    routeOutcome: path.outcome,
    dangerProbability: path.dangerProbability,
    scoringOpportunityProbability: path.scoringOpportunityProbability,
    turnoverRisk: path.turnoverRisk,
    receptionQuality: path.receptionQuality,
    defensivePressure: path.defensivePressure,
  });
}

export function sandboxScoringOpportunityCannotMutateOfficialFullMatch(
  model: SandboxScoringOpportunityModel,
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

export function sandboxScoringOpportunityCannotClaimGlobalEconomy(
  model: SandboxScoringOpportunityModel,
): boolean {
  return !model.canClaimGlobalEconomy;
}

export function validateSandboxScoringOpportunityModel(
  model: SandboxScoringOpportunityModel,
): readonly string[] {
  const shouldValidate = model.status === "available";
  const results = [model.baseline, model.override];

  return [
    ...(shouldValidate && model.origin !== "controlled_route_resolution_sandbox"
      ? ["SANDBOX_OPPORTUNITY_WRONG_ORIGIN"]
      : []),
    ...(shouldValidate && model.baseline.opportunityProbability < 0 ? ["SANDBOX_OPPORTUNITY_BASELINE_MISSING"] : []),
    ...(shouldValidate && model.override.opportunityProbability < 0 ? ["SANDBOX_OPPORTUNITY_OVERRIDE_MISSING"] : []),
    ...(results.some((result) => result.sandboxScoringEventCreated)
      ? ["SANDBOX_OPPORTUNITY_CREATED_SANDBOX_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.sandboxScoreDelta !== 0)
      ? ["SANDBOX_OPPORTUNITY_SCORE_DELTA_NON_ZERO"]
      : []),
    ...(shouldValidate && !model.modelAppliedOnlyInSandbox ? ["SANDBOX_OPPORTUNITY_NOT_SANDBOX_ONLY"] : []),
    ...(model.modelAppliedToNormalLiveSelection ? ["SANDBOX_OPPORTUNITY_APPLIED_TO_NORMAL_LIVE"] : []),
    ...(results.some((result) => !result.isolatedOnly) ? ["SANDBOX_OPPORTUNITY_RESULT_NOT_ISOLATED"] : []),
    ...(results.some((result) => result.canBecomeOfficialMatchEvent)
      ? ["SANDBOX_OPPORTUNITY_RESULT_CAN_BECOME_MATCH_EVENT"]
      : []),
    ...(results.some((result) => result.canMutateOfficialScore)
      ? ["SANDBOX_OPPORTUNITY_RESULT_CAN_MUTATE_SCORE"]
      : []),
    ...(results.some((result) => result.canCreateOfficialScoringEvent)
      ? ["SANDBOX_OPPORTUNITY_RESULT_CAN_CREATE_OFFICIAL_SCORING_EVENT"]
      : []),
    ...(results.some((result) => result.canCreateProductionScoringEvent)
      ? ["SANDBOX_OPPORTUNITY_RESULT_CAN_CREATE_PRODUCTION_SCORING_EVENT"]
      : []),
    ...(!sandboxScoringOpportunityCannotMutateOfficialFullMatch(model)
      ? ["SANDBOX_OPPORTUNITY_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!sandboxScoringOpportunityCannotClaimGlobalEconomy(model)
      ? ["SANDBOX_OPPORTUNITY_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
  ];
}

export function sandboxScoringOpportunityModelFromResolution(input: {
  readonly sandbox: ControlledRouteResolutionSandbox;
}): SandboxScoringOpportunityModel {
  if (input.sandbox.status !== "available") {
    return emptySandboxScoringOpportunityModel({
      ...(input.sandbox.segmentLabel === undefined ? {} : { segmentLabel: input.sandbox.segmentLabel }),
      ...(input.sandbox.chainId === undefined ? {} : { chainId: input.sandbox.chainId }),
      warnings: input.sandbox.warnings,
    });
  }

  if (!input.sandbox.override.candidateLegal || !input.sandbox.override.candidateAvailable) {
    return {
      ...emptySandboxScoringOpportunityModel({
        ...(input.sandbox.segmentLabel === undefined ? {} : { segmentLabel: input.sandbox.segmentLabel }),
        ...(input.sandbox.chainId === undefined ? {} : { chainId: input.sandbox.chainId }),
        warnings: [...input.sandbox.warnings, "SANDBOX_SCORING_OPPORTUNITY_MODEL_BLOCKED"],
      }),
      status: "blocked",
      origin: "controlled_route_resolution_sandbox",
      rejectedClosedCandidateCount: input.sandbox.rejectedClosedCandidateCount,
      rejectedUnavailableCandidateCount: input.sandbox.rejectedUnavailableCandidateCount,
    };
  }

  const baseline = pathOpportunityFromResolution(input.sandbox.baseline);
  const override = pathOpportunityFromResolution(input.sandbox.override);
  const comparison = compareSandboxScoringOpportunities({ baseline, override });
  const result: SandboxScoringOpportunityModel = {
    status: "available",
    scope: "sandbox_scoring_opportunity_model",
    origin: "controlled_route_resolution_sandbox",
    ...(input.sandbox.segmentLabel === undefined ? {} : { segmentLabel: input.sandbox.segmentLabel }),
    ...(input.sandbox.chainId === undefined ? {} : { chainId: input.sandbox.chainId }),
    baseline,
    override,
    baselineOpportunityCreated: baseline.opportunityCreated,
    overrideOpportunityCreated: override.opportunityCreated,
    opportunityTypeDivergenceObserved: comparison.opportunityTypeDivergenceObserved,
    opportunityFamilyDivergenceObserved: comparison.opportunityFamilyDivergenceObserved,
    opportunityProbabilityDivergenceObserved: comparison.opportunityProbabilityDivergenceObserved,
    opportunityCreationDivergenceObserved: comparison.opportunityCreationDivergenceObserved,
    sandboxScoringEventDivergenceObserved: comparison.sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved: comparison.sandboxScoreDivergenceObserved,
    modelAppliedOnlyInSandbox: true,
    modelAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: input.sandbox.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: input.sandbox.rejectedUnavailableCandidateCount,
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
      "workbench_chain_sandbox_scoring_opportunity_model",
      "sandbox_scoring_opportunity_model",
      "sandbox_opportunity_results_isolated_only",
      ...baseline.tags,
      ...override.tags,
      `sandbox_opportunity_type_divergence_${comparison.opportunityTypeDivergenceObserved ? "true" : "false"}`,
      `sandbox_opportunity_family_divergence_${comparison.opportunityFamilyDivergenceObserved ? "true" : "false"}`,
      `sandbox_opportunity_probability_divergence_${comparison.opportunityProbabilityDivergenceObserved ? "true" : "false"}`,
      `sandbox_opportunity_creation_divergence_${comparison.opportunityCreationDivergenceObserved ? "true" : "false"}`,
      `sandbox_opportunity_scoring_event_divergence_${comparison.sandboxScoringEventDivergenceObserved ? "true" : "false"}`,
      `sandbox_opportunity_score_divergence_${comparison.sandboxScoreDivergenceObserved ? "true" : "false"}`,
      "sandbox_opportunity_scoring_event_created_false",
      "sandbox_opportunity_score_delta_0",
      "sandbox_opportunity_applied_only_in_sandbox_true",
      "sandbox_opportunity_applied_to_normal_live_false",
      "sandbox_opportunity_official_timeline_injection_forbidden",
      "sandbox_opportunity_official_score_mutation_forbidden",
      "sandbox_opportunity_official_scoring_events_mutation_forbidden",
      "sandbox_opportunity_production_resolution_forbidden",
      "sandbox_opportunity_production_scoring_event_creation_forbidden",
      "sandbox_opportunity_global_route_success_mutation_forbidden",
      "sandbox_opportunity_global_economy_claim_forbidden",
      "sandbox_opportunity_closed_candidates_rejected",
      "sandbox_opportunity_unavailable_candidates_rejected",
      "sandbox_opportunity_injected_into_official_timeline_count_0",
      "sandbox_opportunity_official_score_mutation_count_0",
      "sandbox_opportunity_official_scoring_event_mutation_count_0",
      "sandbox_opportunity_production_scoring_event_creation_count_0",
      "sandbox_opportunity_production_route_resolution_mutation_count_0",
      "sandbox_opportunity_global_route_success_mutation_count_0",
      "sandbox_opportunity_global_economy_claim_count_0",
      ...(input.sandbox.chainId === undefined ? [] : [`sandbox_opportunity_chain_id_${input.sandbox.chainId}`]),
    ],
    warnings: [...baseline.warnings, ...override.warnings],
  };
  const warnings = validateSandboxScoringOpportunityModel(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}

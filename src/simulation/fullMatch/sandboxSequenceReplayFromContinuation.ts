import type { MatchInput } from "../../contracts/engineToCoach";
import type { AttributeDrivenShotResolutionModel } from "./attributeDrivenShotResolutionSandbox";
import { buildSandboxSequenceStep } from "./buildSandboxSequenceStep";
import { compareSandboxSequenceReplay } from "./compareSandboxSequenceReplay";
import type { ControlledRouteResolutionSandbox } from "./controlledRouteResolutionSandbox";
import type { GoalkeeperResponseModel } from "./goalkeeperResponseModel";
import type { MultiActionContinuationModel } from "./multiActionContinuationSandbox";
import type { ReboundSecondChanceModel } from "./reboundSecondChanceSandbox";
import type { SandboxScoringEventCandidateModel } from "./sandboxScoringEventCandidate";
import type { SandboxScoringEventResolutionModel } from "./sandboxScoringEventResolution";
import type { SandboxScoringOpportunityModel } from "./sandboxScoringOpportunityModel";
import {
  emptySandboxSequenceReplayModel,
  type SandboxSequenceReplayModel,
  type SandboxSequenceReplayPath,
  type SandboxSequenceReplayStatus,
  type SandboxSequenceStep,
  type SandboxSequenceStepType,
} from "./sandboxSequenceReplay";

function statusForSources(input: {
  readonly routeSandbox: ControlledRouteResolutionSandbox;
  readonly opportunityModel: SandboxScoringOpportunityModel;
  readonly scoringCandidateModel: SandboxScoringEventCandidateModel;
  readonly scoringResolutionModel: SandboxScoringEventResolutionModel;
  readonly attributeShotModel: AttributeDrivenShotResolutionModel;
  readonly goalkeeperResponseModel: GoalkeeperResponseModel;
  readonly reboundSecondChanceModel: ReboundSecondChanceModel;
  readonly multiActionContinuationModel: MultiActionContinuationModel;
}): SandboxSequenceReplayStatus {
  const statuses = [
    input.routeSandbox.status,
    input.opportunityModel.status,
    input.scoringCandidateModel.status,
    input.scoringResolutionModel.status,
    input.attributeShotModel.status,
    input.goalkeeperResponseModel.status,
    input.reboundSecondChanceModel.status,
    input.multiActionContinuationModel.status,
  ];

  if (statuses.every((status) => status === "available")) {
    return "available";
  }

  if (statuses.some((status) => status === "failed")) {
    return "failed";
  }

  if (statuses.some((status) => status === "blocked")) {
    return "blocked";
  }

  return "partial";
}

function pathFromSteps(input: {
  readonly pathId: "baseline" | "override";
  readonly status: SandboxSequenceReplayStatus;
  readonly steps: readonly SandboxSequenceStep[];
  readonly finalOutcome?: string;
  readonly finalTeamCandidate?: string;
  readonly finalActorCandidate?: string;
  readonly finalZoneCandidate?: string;
  readonly sandboxContinuationCreated: boolean;
}): SandboxSequenceReplayPath {
  const firstStep = input.steps[0];
  const finalStep = input.steps[input.steps.length - 1];

  return {
    pathId: input.pathId,
    status: input.status,
    steps: input.steps,
    stepCount: input.steps.length,
    ...(firstStep === undefined ? {} : { firstStepType: firstStep.stepType }),
    ...(finalStep === undefined ? {} : { finalStepType: finalStep.stepType }),
    ...(input.finalOutcome === undefined ? {} : { finalOutcome: input.finalOutcome }),
    ...(input.finalTeamCandidate === undefined ? {} : { finalTeamCandidate: input.finalTeamCandidate }),
    ...(input.finalActorCandidate === undefined ? {} : { finalActorCandidate: input.finalActorCandidate }),
    ...(input.finalZoneCandidate === undefined ? {} : { finalZoneCandidate: input.finalZoneCandidate }),
    sandboxContinuationCreated: input.sandboxContinuationCreated,
    sandboxMatchEventCreatedCount: 0,
    sandboxScoringEventCreatedCount: 0,
    sandboxScoreDeltaTotal: 0,
    officialPossessionMutationCount: 0,
    officialTimelineMutationCount: 0,
  };
}

function baselineSteps(input: {
  readonly routeSandbox: ControlledRouteResolutionSandbox;
  readonly opportunityModel: SandboxScoringOpportunityModel;
  readonly scoringCandidateModel: SandboxScoringEventCandidateModel;
  readonly scoringResolutionModel: SandboxScoringEventResolutionModel;
  readonly goalkeeperResponseModel: GoalkeeperResponseModel;
  readonly reboundSecondChanceModel: ReboundSecondChanceModel;
  readonly multiActionContinuationModel: MultiActionContinuationModel;
}): readonly SandboxSequenceStep[] {
  return [
    buildSandboxSequenceStep({ stepIndex: 0, stepType: "SANDBOX_SEQUENCE_START", source: "sequence_replay_synthetic_wrapper", pathId: "baseline", outcome: "start", confidence: 100 }),
    buildSandboxSequenceStep({ stepIndex: 1, stepType: "BASELINE_ROUTE_REFERENCE", source: "controlled_route_resolution_sandbox", pathId: "baseline", actorId: input.routeSandbox.baseline.receiverId, targetZone: input.routeSandbox.baseline.targetZone, outcome: input.routeSandbox.baseline.outcome, confidence: input.routeSandbox.baseline.dangerProbability }),
    buildSandboxSequenceStep({ stepIndex: 2, stepType: "NO_SCORING_OPPORTUNITY", source: "sandbox_scoring_opportunity_model", pathId: "baseline", outcome: input.opportunityModel.baseline.opportunityType, confidence: input.opportunityModel.baseline.opportunityProbability }),
    buildSandboxSequenceStep({ stepIndex: 3, stepType: "NO_SCORING_EVENT_CANDIDATE", source: "sandbox_scoring_event_candidate_model", pathId: "baseline", outcome: input.scoringCandidateModel.baseline.scoringCandidateType, confidence: input.scoringCandidateModel.baseline.scoringCandidateProbability, reasons: input.scoringCandidateModel.baseline.reasons }),
    buildSandboxSequenceStep({ stepIndex: 4, stepType: "NO_SCORE_ATTEMPT", source: "sandbox_scoring_event_resolution_model", pathId: "baseline", outcome: input.scoringResolutionModel.baseline.resolutionType, confidence: input.scoringResolutionModel.baseline.shotQuality, reasons: input.scoringResolutionModel.baseline.reasons }),
    buildSandboxSequenceStep({ stepIndex: 5, stepType: "NO_GOALKEEPER_RESPONSE", source: "goalkeeper_response_model_sandbox", pathId: "baseline", outcome: input.goalkeeperResponseModel.baseline.responseType, confidence: input.goalkeeperResponseModel.baseline.goalkeeperResponseScore, reasons: input.goalkeeperResponseModel.baseline.reasons }),
    buildSandboxSequenceStep({ stepIndex: 6, stepType: "NO_REBOUND", source: "rebound_second_chance_sandbox", pathId: "baseline", outcome: input.reboundSecondChanceModel.baseline.reboundOutcome, confidence: input.reboundSecondChanceModel.baseline.secondChanceProbability, reasons: input.reboundSecondChanceModel.baseline.reasons }),
    buildSandboxSequenceStep({ stepIndex: 7, stepType: "NO_CONTINUATION", source: "multi_action_continuation_sandbox", pathId: "baseline", outcome: input.multiActionContinuationModel.baseline.continuationActionType, confidence: input.multiActionContinuationModel.baseline.continuationConfidence, reasons: input.multiActionContinuationModel.baseline.reasons }),
    buildSandboxSequenceStep({ stepIndex: 8, stepType: "SANDBOX_SEQUENCE_END", source: "sequence_replay_synthetic_wrapper", pathId: "baseline", outcome: "none", teamCandidate: "none", confidence: 100 }),
  ];
}

function overrideSteps(input: {
  readonly routeSandbox: ControlledRouteResolutionSandbox;
  readonly opportunityModel: SandboxScoringOpportunityModel;
  readonly scoringCandidateModel: SandboxScoringEventCandidateModel;
  readonly scoringResolutionModel: SandboxScoringEventResolutionModel;
  readonly attributeShotModel: AttributeDrivenShotResolutionModel;
  readonly goalkeeperResponseModel: GoalkeeperResponseModel;
  readonly reboundSecondChanceModel: ReboundSecondChanceModel;
  readonly multiActionContinuationModel: MultiActionContinuationModel;
}): readonly SandboxSequenceStep[] {
  return [
    buildSandboxSequenceStep({ stepIndex: 0, stepType: "SANDBOX_SEQUENCE_START", source: "sequence_replay_synthetic_wrapper", pathId: "override", outcome: "start", confidence: 100 }),
    buildSandboxSequenceStep({ stepIndex: 1, stepType: "CONTROLLED_ROUTE_RESOLVED", source: "controlled_route_resolution_sandbox", pathId: "override", actorId: input.routeSandbox.override.resultingCarrierId ?? input.routeSandbox.override.receiverId, targetZone: input.routeSandbox.override.resultingZone ?? input.routeSandbox.override.targetZone, outcome: input.routeSandbox.override.outcome, confidence: input.routeSandbox.override.dangerProbability }),
    buildSandboxSequenceStep({ stepIndex: 2, stepType: "SCORING_OPPORTUNITY_CLASSIFIED", source: "sandbox_scoring_opportunity_model", pathId: "override", actorId: input.opportunityModel.override.receiverId, targetZone: input.opportunityModel.override.targetZone, outcome: input.opportunityModel.override.opportunityType, confidence: input.opportunityModel.override.opportunityProbability }),
    buildSandboxSequenceStep({ stepIndex: 3, stepType: "SCORING_EVENT_CANDIDATE_CREATED", source: "sandbox_scoring_event_candidate_model", pathId: "override", actorId: input.scoringCandidateModel.override.receiverId, targetZone: input.scoringCandidateModel.override.targetZone, outcome: input.scoringCandidateModel.override.scoringCandidateType, confidence: input.scoringCandidateModel.override.scoringCandidateProbability, reasons: input.scoringCandidateModel.override.reasons }),
    buildSandboxSequenceStep({ stepIndex: 4, stepType: "SHOT_RESOLVED", source: "attribute_driven_shot_resolution_sandbox", pathId: "override", actorId: input.attributeShotModel.override.shooter.playerId, targetZone: input.attributeShotModel.override.targetZone, outcome: input.attributeShotModel.override.outcome, confidence: input.attributeShotModel.override.attributeAdjustedShotQuality, reasons: input.attributeShotModel.override.factors }),
    buildSandboxSequenceStep({ stepIndex: 5, stepType: "GOALKEEPER_RESPONSE_RESOLVED", source: "goalkeeper_response_model_sandbox", pathId: "override", actorId: input.goalkeeperResponseModel.override.goalkeeperId, targetZone: input.goalkeeperResponseModel.override.targetZone, outcome: input.goalkeeperResponseModel.override.responseType, confidence: input.goalkeeperResponseModel.override.goalkeeperResponseScore, reasons: input.goalkeeperResponseModel.override.reasons }),
    buildSandboxSequenceStep({ stepIndex: 6, stepType: "REBOUND_STATE_RESOLVED", source: "rebound_second_chance_sandbox", pathId: "override", actorId: input.reboundSecondChanceModel.override.goalkeeperId, teamCandidate: input.reboundSecondChanceModel.override.recoveryTeamCandidate, targetZone: input.reboundSecondChanceModel.override.targetZone, outcome: input.reboundSecondChanceModel.override.reboundOutcome, confidence: input.reboundSecondChanceModel.override.reboundDangerScore, reasons: input.reboundSecondChanceModel.override.reasons }),
    buildSandboxSequenceStep({ stepIndex: 7, stepType: "CONTINUATION_ACTION_RESOLVED", source: "multi_action_continuation_sandbox", pathId: "override", actorId: input.multiActionContinuationModel.override.continuationActorCandidate, teamCandidate: input.multiActionContinuationModel.override.continuationTeamCandidate, targetZone: input.multiActionContinuationModel.override.continuationTargetZoneCandidate, outcome: input.multiActionContinuationModel.override.continuationOutcome, confidence: input.multiActionContinuationModel.override.continuationConfidence, createsSandboxContinuation: input.multiActionContinuationModel.override.sandboxContinuationCreated, reasons: input.multiActionContinuationModel.override.reasons }),
    buildSandboxSequenceStep({ stepIndex: 8, stepType: "SANDBOX_SEQUENCE_END", source: "sequence_replay_synthetic_wrapper", pathId: "override", actorId: input.multiActionContinuationModel.override.continuationActorCandidate, teamCandidate: input.multiActionContinuationModel.override.continuationTeamCandidate, targetZone: input.multiActionContinuationModel.override.continuationTargetZoneCandidate, outcome: input.multiActionContinuationModel.override.continuationOutcome, confidence: 100 }),
  ];
}

export function sandboxSequenceReplayCannotMutateOfficialFullMatch(model: SandboxSequenceReplayModel): boolean {
  const steps = [...model.baseline.steps, ...model.override.steps];

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
    steps.every((step) =>
      !step.createsSandboxMatchEvent &&
      !step.createsSandboxScoringEvent &&
      !step.createsOfficialMatchEvent &&
      !step.mutatesOfficialTimeline &&
      !step.mutatesOfficialPossession &&
      !step.mutatesOfficialScore &&
      !step.mutatesOfficialScoringEvents &&
      !step.createsProductionScoringEvent
    )
  );
}

export function sandboxSequenceReplayCannotClaimGlobalEconomy(model: SandboxSequenceReplayModel): boolean {
  return !model.canClaimGlobalEconomy;
}

export function validateSandboxSequenceReplayModel(model: SandboxSequenceReplayModel): readonly string[] {
  const shouldValidate = model.status === "available";

  return [
    ...(shouldValidate && model.origin !== "multi_action_continuation_sandbox"
      ? ["SANDBOX_SEQUENCE_REPLAY_WRONG_ORIGIN"]
      : []),
    ...(shouldValidate && model.baseline.stepCount !== 9 ? ["SANDBOX_SEQUENCE_BASELINE_STEP_COUNT_NOT_9"] : []),
    ...(shouldValidate && model.override.stepCount !== 9 ? ["SANDBOX_SEQUENCE_OVERRIDE_STEP_COUNT_NOT_9"] : []),
    ...(shouldValidate && model.baseline.finalOutcome !== "none" ? ["SANDBOX_SEQUENCE_BASELINE_FINAL_OUTCOME_NOT_NONE"] : []),
    ...(shouldValidate && model.override.finalOutcome !== "secured_by_goalkeeper_team" ? ["SANDBOX_SEQUENCE_OVERRIDE_FINAL_OUTCOME_UNEXPECTED"] : []),
    ...(shouldValidate && model.override.finalTeamCandidate !== "goalkeeper_team" ? ["SANDBOX_SEQUENCE_OVERRIDE_FINAL_TEAM_UNEXPECTED"] : []),
    ...(shouldValidate && model.override.finalActorCandidate !== "blitz-goalkeeper-free-safety" ? ["SANDBOX_SEQUENCE_OVERRIDE_FINAL_ACTOR_UNEXPECTED"] : []),
    ...(shouldValidate && model.override.finalZoneCandidate !== "Z3-HSR" ? ["SANDBOX_SEQUENCE_OVERRIDE_FINAL_ZONE_UNEXPECTED"] : []),
    ...(shouldValidate && !model.override.sandboxContinuationCreated ? ["SANDBOX_SEQUENCE_OVERRIDE_CONTINUATION_NOT_CREATED"] : []),
    ...(model.baseline.sandboxMatchEventCreatedCount !== 0 || model.override.sandboxMatchEventCreatedCount !== 0
      ? ["SANDBOX_SEQUENCE_CREATED_MATCH_EVENT"]
      : []),
    ...(model.baseline.sandboxScoringEventCreatedCount !== 0 || model.override.sandboxScoringEventCreatedCount !== 0
      ? ["SANDBOX_SEQUENCE_CREATED_SCORING_EVENT"]
      : []),
    ...(model.baseline.sandboxScoreDeltaTotal !== 0 || model.override.sandboxScoreDeltaTotal !== 0
      ? ["SANDBOX_SEQUENCE_SCORE_DELTA_NON_ZERO"]
      : []),
    ...(shouldValidate && !model.modelAppliedOnlyInSandbox ? ["SANDBOX_SEQUENCE_NOT_SANDBOX_ONLY"] : []),
    ...(model.modelAppliedToNormalLiveSelection ? ["SANDBOX_SEQUENCE_APPLIED_TO_NORMAL_LIVE"] : []),
    ...(!sandboxSequenceReplayCannotMutateOfficialFullMatch(model) ? ["SANDBOX_SEQUENCE_MUTATION_FORBIDDEN_BREACH"] : []),
    ...(!sandboxSequenceReplayCannotClaimGlobalEconomy(model) ? ["SANDBOX_SEQUENCE_GLOBAL_ECONOMY_CLAIM_BREACH"] : []),
  ];
}

export function sandboxSequenceReplayFromContinuation(input: {
  readonly matchInput: MatchInput;
  readonly routeSandbox: ControlledRouteResolutionSandbox;
  readonly opportunityModel: SandboxScoringOpportunityModel;
  readonly scoringCandidateModel: SandboxScoringEventCandidateModel;
  readonly scoringResolutionModel: SandboxScoringEventResolutionModel;
  readonly attributeShotModel: AttributeDrivenShotResolutionModel;
  readonly goalkeeperResponseModel: GoalkeeperResponseModel;
  readonly reboundSecondChanceModel: ReboundSecondChanceModel;
  readonly multiActionContinuationModel: MultiActionContinuationModel;
}): SandboxSequenceReplayModel {
  if (input.multiActionContinuationModel.status === "not_available") {
    return emptySandboxSequenceReplayModel({
      ...(input.multiActionContinuationModel.segmentLabel === undefined ? {} : { segmentLabel: input.multiActionContinuationModel.segmentLabel }),
      ...(input.multiActionContinuationModel.chainId === undefined ? {} : { chainId: input.multiActionContinuationModel.chainId }),
      warnings: input.multiActionContinuationModel.warnings,
    });
  }

  const status = statusForSources(input);
  const baseline = pathFromSteps({
    pathId: "baseline",
    status,
    steps: baselineSteps(input),
    finalOutcome: "none",
    finalTeamCandidate: "none",
    sandboxContinuationCreated: false,
  });
  const override = pathFromSteps({
    pathId: "override",
    status,
    steps: overrideSteps(input),
    finalOutcome: input.multiActionContinuationModel.override.continuationOutcome,
    finalTeamCandidate: input.multiActionContinuationModel.override.continuationTeamCandidate,
    ...(input.multiActionContinuationModel.override.continuationActorCandidate === undefined ? {} : {
      finalActorCandidate: input.multiActionContinuationModel.override.continuationActorCandidate,
    }),
    ...(input.multiActionContinuationModel.override.continuationTargetZoneCandidate === undefined ? {} : {
      finalZoneCandidate: input.multiActionContinuationModel.override.continuationTargetZoneCandidate,
    }),
    sandboxContinuationCreated: input.multiActionContinuationModel.override.sandboxContinuationCreated,
  });
  const comparison = compareSandboxSequenceReplay({ baseline, override });
  const result: SandboxSequenceReplayModel = {
    status,
    scope: status === "available" ? "sandbox_sequence_replay" : "production_scoring_forbidden",
    origin: "multi_action_continuation_sandbox",
    ...(input.multiActionContinuationModel.segmentLabel === undefined ? {} : { segmentLabel: input.multiActionContinuationModel.segmentLabel }),
    ...(input.multiActionContinuationModel.chainId === undefined ? {} : { chainId: input.multiActionContinuationModel.chainId }),
    baseline,
    override,
    baselineStepCount: baseline.stepCount,
    overrideStepCount: override.stepCount,
    sequenceStepCountDivergenceObserved: comparison.sequenceStepCountDivergenceObserved,
    sequenceOutcomeDivergenceObserved: comparison.sequenceOutcomeDivergenceObserved,
    sequenceFinalTeamDivergenceObserved: comparison.sequenceFinalTeamDivergenceObserved,
    sequenceFinalZoneDivergenceObserved: comparison.sequenceFinalZoneDivergenceObserved,
    sandboxMatchEventDivergenceObserved: comparison.sandboxMatchEventDivergenceObserved,
    sandboxScoringEventDivergenceObserved: comparison.sandboxScoringEventDivergenceObserved,
    sandboxScoreDivergenceObserved: comparison.sandboxScoreDivergenceObserved,
    officialPossessionDivergenceObserved: false,
    officialTimelineDivergenceObserved: false,
    modelAppliedOnlyInSandbox: status === "available",
    modelAppliedToNormalLiveSelection: false,
    rejectedClosedCandidateCount: input.multiActionContinuationModel.rejectedClosedCandidateCount,
    rejectedUnavailableCandidateCount: input.multiActionContinuationModel.rejectedUnavailableCandidateCount,
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
      "workbench_chain_sandbox_sequence_replay",
      "sandbox_sequence_replay",
      `sandbox_sequence_replay_model_status_${status}`,
      "sandbox_sequence_replay_model_origin_multi_action_continuation_sandbox",
      `sandbox_sequence_baseline_step_count_${baseline.stepCount}`,
      `sandbox_sequence_override_step_count_${override.stepCount}`,
      `sandbox_sequence_baseline_step_types_${baseline.steps.map((step) => step.stepType).join("__")}`,
      `sandbox_sequence_override_step_types_${override.steps.map((step) => step.stepType).join("__")}`,
      `sandbox_sequence_baseline_final_outcome_${baseline.finalOutcome ?? "none"}`,
      `sandbox_sequence_override_final_outcome_${override.finalOutcome ?? "none"}`,
      `sandbox_sequence_override_final_team_${override.finalTeamCandidate ?? "none"}`,
      `sandbox_sequence_override_final_actor_${override.finalActorCandidate ?? "none"}`,
      `sandbox_sequence_override_final_zone_${override.finalZoneCandidate ?? "none"}`,
      `sandbox_sequence_step_count_divergence_${comparison.sequenceStepCountDivergenceObserved ? "true" : "false"}`,
      `sandbox_sequence_outcome_divergence_${comparison.sequenceOutcomeDivergenceObserved ? "true" : "false"}`,
      `sandbox_sequence_final_team_divergence_${comparison.sequenceFinalTeamDivergenceObserved ? "true" : "false"}`,
      `sandbox_sequence_final_zone_divergence_${comparison.sequenceFinalZoneDivergenceObserved ? "true" : "false"}`,
      "sandbox_sequence_match_event_created_count_0",
      "sandbox_sequence_scoring_event_created_count_0",
      "sandbox_sequence_score_delta_total_0",
      "sandbox_sequence_official_possession_mutation_count_0",
      "sandbox_sequence_official_timeline_mutation_count_0",
      `sandbox_sequence_model_applied_only_in_sandbox_${status === "available" ? "true" : "false"}`,
      "sandbox_sequence_model_applied_to_normal_live_false",
      `sandbox_sequence_rejected_closed_count_${input.multiActionContinuationModel.rejectedClosedCandidateCount}`,
      `sandbox_sequence_rejected_unavailable_count_${input.multiActionContinuationModel.rejectedUnavailableCandidateCount}`,
      "sandbox_sequence_injected_into_official_timeline_count_0",
      "sandbox_sequence_official_score_mutation_count_0",
      "sandbox_sequence_official_scoring_event_mutation_count_0",
      "sandbox_sequence_production_scoring_event_creation_count_0",
      "sandbox_sequence_production_route_resolution_mutation_count_0",
      "sandbox_sequence_global_route_success_mutation_count_0",
      "sandbox_sequence_global_economy_claim_count_0",
      "sandbox_sequence_official_timeline_injection_forbidden",
      "sandbox_sequence_official_score_mutation_forbidden",
      "sandbox_sequence_official_scoring_events_mutation_forbidden",
      "sandbox_sequence_official_possession_mutation_forbidden",
      "sandbox_sequence_production_scoring_event_creation_forbidden",
      "sandbox_sequence_production_route_resolution_mutation_forbidden",
      "sandbox_sequence_global_route_success_mutation_forbidden",
      "sandbox_sequence_global_economy_claim_forbidden",
      ...baseline.steps.flatMap((step) => step.tags),
      ...override.steps.flatMap((step) => step.tags),
    ],
    warnings: [
      ...input.routeSandbox.warnings,
      ...input.opportunityModel.warnings,
      ...input.scoringCandidateModel.warnings,
      ...input.scoringResolutionModel.warnings,
      ...input.attributeShotModel.warnings,
      ...input.goalkeeperResponseModel.warnings,
      ...input.reboundSecondChanceModel.warnings,
      ...input.multiActionContinuationModel.warnings,
    ],
  };
  const warnings = validateSandboxSequenceReplayModel(result);

  if (warnings.length === 0) {
    return result;
  }

  return {
    ...result,
    status: "failed",
    warnings: [...result.warnings, ...warnings],
  };
}

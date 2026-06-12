import { calculateSandboxDecisionBatchConfidence } from "./calculateSandboxDecisionBatchConfidence";
import { createSandboxDecisionBatchScenarios } from "./createSandboxDecisionBatchScenarios";
import { resolveSandboxDecisionBatchScenario } from "./resolveSandboxDecisionBatchScenario";
import type { SandboxDecisionEvidenceCalibrationModel } from "./sandboxDecisionEvidenceCalibration";
import {
  emptySandboxDecisionBatchConfidenceCalibrationModel,
  type SandboxDecisionBatchConfidence,
  type SandboxDecisionBatchConfidenceCalibrationModel,
} from "./sandboxDecisionBatchConfidenceCalibration";

function confidenceRank(confidence: SandboxDecisionBatchConfidence): number {
  switch (confidence) {
    case "very_low":
      return 0;
    case "low":
      return 1;
    case "low_medium":
      return 2;
    case "medium":
      return 3;
  }
}

function scenarioByScore(
  results: SandboxDecisionBatchConfidenceCalibrationModel["scenarioResults"],
  mode: "best" | "worst",
): string | undefined {
  if (results.length === 0) {
    return undefined;
  }

  const sorted = [...results].sort((left, right) =>
    mode === "best"
      ? right.evidenceScore - left.evidenceScore
      : left.evidenceScore - right.evidenceScore
  );

  return sorted[0]?.scenarioId;
}

export function sandboxDecisionBatchConfidenceCalibrationCannotMutateOfficialFullMatch(
  model: SandboxDecisionBatchConfidenceCalibrationModel,
): boolean {
  return (
    model.officialTimelineUnchanged &&
    model.officialScoreUnchanged &&
    model.officialPossessionUnchanged &&
    model.officialScoringEventsUnchanged &&
    !model.canCreateProductionScoringEvents
  );
}

export function sandboxDecisionBatchConfidenceCalibrationCannotDriveProduction(
  model: SandboxDecisionBatchConfidenceCalibrationModel,
): boolean {
  return (
    !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution &&
    !model.modelAppliedToNormalLiveSelection
  );
}

export function sandboxDecisionBatchConfidenceCalibrationCannotClaimGlobalEconomy(
  model: SandboxDecisionBatchConfidenceCalibrationModel,
): boolean {
  return !model.canClaimGlobalEconomy;
}

export function validateSandboxDecisionBatchConfidenceCalibrationModel(
  model: SandboxDecisionBatchConfidenceCalibrationModel,
): readonly string[] {
  const shouldValidate = model.status === "available";

  return [
    ...(shouldValidate && model.origin !== "sandbox_decision_evidence_calibration"
      ? ["SANDBOX_DECISION_BATCH_WRONG_ORIGIN"]
      : []),
    ...(shouldValidate && model.scenarioCount < 6
      ? ["SANDBOX_DECISION_BATCH_SCENARIO_COUNT_TOO_LOW"]
      : []),
    ...(shouldValidate && confidenceRank(model.batchConfidence) > confidenceRank("medium")
      ? ["SANDBOX_DECISION_BATCH_CONFIDENCE_TOO_HIGH"]
      : []),
    ...(shouldValidate && model.scenarioResults.some((result) =>
      !result.suggestionOnly ||
      result.officialTruth ||
      result.canDriveLiveSelection ||
      result.canDriveProductionRouteResolution ||
      result.canCreateProductionScoringEvents ||
      result.canClaimGlobalEconomy
    )
      ? ["SANDBOX_DECISION_BATCH_SCENARIO_GUARD_BREACH"]
      : []),
    ...(!sandboxDecisionBatchConfidenceCalibrationCannotMutateOfficialFullMatch(model)
      ? ["SANDBOX_DECISION_BATCH_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!sandboxDecisionBatchConfidenceCalibrationCannotDriveProduction(model)
      ? ["SANDBOX_DECISION_BATCH_PRODUCTION_DRIVER_BREACH"]
      : []),
    ...(!sandboxDecisionBatchConfidenceCalibrationCannotClaimGlobalEconomy(model)
      ? ["SANDBOX_DECISION_BATCH_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
  ];
}

export function sandboxDecisionBatchConfidenceCalibrationFromEvidence(input: {
  readonly calibration: SandboxDecisionEvidenceCalibrationModel;
}): SandboxDecisionBatchConfidenceCalibrationModel {
  if (input.calibration.status !== "available") {
    return emptySandboxDecisionBatchConfidenceCalibrationModel({
      calibration: input.calibration,
      warnings: input.calibration.warnings,
    });
  }

  const scenarios = createSandboxDecisionBatchScenarios({ calibration: input.calibration });
  const scenarioResults = scenarios.map((scenario) =>
    resolveSandboxDecisionBatchScenario({
      calibration: input.calibration,
      scenario,
    })
  );
  const aggregate = calculateSandboxDecisionBatchConfidence({
    scenarioResults,
    singleChainEvidenceScore: input.calibration.evidenceScore,
    singleChainConfidence: input.calibration.confidence,
  });
  const bestScenarioId = scenarioByScore(scenarioResults, "best");
  const worstScenarioId = scenarioByScore(scenarioResults, "worst");
  const model: SandboxDecisionBatchConfidenceCalibrationModel = {
    status: "available",
    origin: "sandbox_decision_evidence_calibration",
    ...(input.calibration.segmentLabel === undefined ? {} : { segmentLabel: input.calibration.segmentLabel }),
    ...(input.calibration.chainId === undefined ? {} : { chainId: input.calibration.chainId }),
    recommendationType: input.calibration.recommendationType,
    suggestedTacticalTest: input.calibration.suggestedTacticalTest,
    scenarioCount: scenarioResults.length,
    scenarioResults,
    averageEvidenceScore: aggregate.averageEvidenceScore,
    minEvidenceScore: aggregate.minEvidenceScore,
    maxEvidenceScore: aggregate.maxEvidenceScore,
    batchConfidence: aggregate.batchConfidence,
    batchConfidenceLabel: aggregate.batchConfidenceLabel,
    confidenceDistribution: aggregate.confidenceDistribution,
    ...(bestScenarioId === undefined ? {} : { bestScenarioId }),
    ...(worstScenarioId === undefined ? {} : { worstScenarioId }),
    repeatedSupportingSignalCount: input.calibration.supportingSignals.length,
    repeatedLimitingSignalCount: input.calibration.limitingSignals.length,
    recommendationStability: aggregate.recommendationStability,
    confidenceChangedFromSingleChain: aggregate.confidenceChangedFromSingleChain,
    singleChainEvidenceScore: input.calibration.evidenceScore,
    singleChainConfidence: input.calibration.confidence,
    batchSummary:
      `Batch sandbox local: ${scenarioResults.length} scenarios, score moyen ${aggregate.averageEvidenceScore}/100, min ${aggregate.minEvidenceScore}, max ${aggregate.maxEvidenceScore}, confiance ${aggregate.batchConfidence}.`,
    coachSummary:
      `La confiance multi-scenarios reste prudente : ${scenarioResults.length} scenarios locaux donnent ${aggregate.averageEvidenceScore}/100 en moyenne (${aggregate.batchConfidenceLabel}). La piste varie selon le soutien autour de Z4-HSR, la reponse du gardien et la couverture du second ballon ; elle reste une suggestion a tester, pas une consigne officielle.`,
    localSandboxBatchOnly: true,
    officialTruth: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canCreateProductionScoringEvents: false,
    canClaimGlobalEconomy: false,
    officialTimelineUnchanged: true,
    officialScoreUnchanged: true,
    officialPossessionUnchanged: true,
    officialScoringEventsUnchanged: true,
    diagnosticOnly: true,
    modelAppliedOnlyInSandbox: true,
    modelAppliedToNormalLiveSelection: false,
    tags: [
      "sandbox_decision_batch_confidence_calibration",
      "sandbox_decision_batch_status_available",
      "sandbox_decision_batch_origin_evidence_calibration",
      `sandbox_decision_batch_scenario_count_${scenarioResults.length}`,
      `sandbox_decision_batch_average_score_${aggregate.averageEvidenceScore}`,
      `sandbox_decision_batch_min_score_${aggregate.minEvidenceScore}`,
      `sandbox_decision_batch_max_score_${aggregate.maxEvidenceScore}`,
      `sandbox_decision_batch_confidence_${aggregate.batchConfidence}`,
      `sandbox_decision_batch_stability_${aggregate.recommendationStability}`,
      ...(bestScenarioId === undefined ? [] : [`sandbox_decision_batch_best_scenario_${bestScenarioId}`]),
      ...(worstScenarioId === undefined ? [] : [`sandbox_decision_batch_worst_scenario_${worstScenarioId}`]),
      "sandbox_decision_batch_local_only_true",
      "sandbox_decision_batch_official_truth_false",
      "sandbox_decision_batch_can_drive_live_selection_false",
      "sandbox_decision_batch_can_drive_production_route_resolution_false",
      "sandbox_decision_batch_global_economy_claim_forbidden",
    ],
    warnings: input.calibration.warnings,
  };
  const warnings = validateSandboxDecisionBatchConfidenceCalibrationModel(model);

  if (warnings.length === 0) {
    return model;
  }

  return {
    ...model,
    status: "failed",
    warnings: [...model.warnings, ...warnings],
  };
}

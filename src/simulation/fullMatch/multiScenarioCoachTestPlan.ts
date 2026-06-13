import type {
  SandboxDecisionBatchConfidence,
  SandboxDecisionBatchConfidenceCalibrationModel,
} from "./sandboxDecisionBatchConfidenceCalibration";

export type MultiScenarioCoachTestPlanStatus =
  | "not_available"
  | "available"
  | "blocked"
  | "partial"
  | "failed";

export type MultiScenarioCoachTestPlanOrigin =
  | "none"
  | "sandbox_decision_batch_confidence_calibration";

export type MultiScenarioCoachTestId =
  | "support_around_z4_hsr"
  | "second_ball_occupation"
  | "strong_goalkeeper_fallback";

export type MultiScenarioCoachTestConfidence =
  | "low"
  | "low_medium"
  | "medium";

export type MultiScenarioCoachTest = {
  readonly testId: MultiScenarioCoachTestId;
  readonly title: string;
  readonly summary: string;
  readonly linkedScenarioId: string;
  readonly linkedScenarioType: string;
  readonly expectedPositiveSignal: string;
  readonly riskToWatch: string;
  readonly remainsUnproven: string;
  readonly confidence: MultiScenarioCoachTestConfidence;
  readonly suggestionOnly: true;
  readonly officialTruth: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canClaimGlobalEconomy: false;
};

export type MultiScenarioCoachTestPlanModel = {
  readonly status: MultiScenarioCoachTestPlanStatus;
  readonly origin: MultiScenarioCoachTestPlanOrigin;
  readonly segmentLabel?: string;
  readonly chainId?: string;
  readonly title: "Plan de test coach";
  readonly summary: string;
  readonly recommendationType: string;
  readonly batchConfidence: string;
  readonly recommendationStability: SandboxDecisionBatchConfidenceCalibrationModel["recommendationStability"];
  readonly testCount: number;
  readonly tests: readonly MultiScenarioCoachTest[];
  readonly bestScenarioId?: string;
  readonly worstScenarioId?: string;
  readonly planSuggestionOnly: true;
  readonly officialTruth: false;
  readonly canDriveCoachInstruction: false;
  readonly canDriveLiveSelection: false;
  readonly canDriveProductionRouteResolution: false;
  readonly canCreateProductionScoringEvents: false;
  readonly canClaimGlobalEconomy: false;
  readonly officialTimelineUnchanged: true;
  readonly officialScoreUnchanged: true;
  readonly officialPossessionUnchanged: true;
  readonly officialScoringEventsUnchanged: true;
  readonly diagnosticOnly: true;
  readonly modelAppliedOnlyInSandbox: true;
  readonly modelAppliedToNormalLiveSelection: false;
  readonly tags: readonly string[];
  readonly warnings: readonly string[];
};

function cappedConfidence(confidence: SandboxDecisionBatchConfidence): MultiScenarioCoachTestConfidence {
  switch (confidence) {
    case "medium":
      return "medium";
    case "low_medium":
      return "low_medium";
    case "very_low":
    case "low":
      return "low";
  }
}

export function multiScenarioCoachTestPlanCannotMutateOfficialFullMatch(
  model: MultiScenarioCoachTestPlanModel,
): boolean {
  return (
    model.officialTimelineUnchanged &&
    model.officialScoreUnchanged &&
    model.officialPossessionUnchanged &&
    model.officialScoringEventsUnchanged &&
    !model.canCreateProductionScoringEvents
  );
}

export function multiScenarioCoachTestPlanCannotDriveProduction(
  model: MultiScenarioCoachTestPlanModel,
): boolean {
  return (
    !model.canDriveCoachInstruction &&
    !model.canDriveLiveSelection &&
    !model.canDriveProductionRouteResolution &&
    !model.modelAppliedToNormalLiveSelection
  );
}

export function multiScenarioCoachTestPlanCannotClaimGlobalEconomy(
  model: MultiScenarioCoachTestPlanModel,
): boolean {
  return !model.canClaimGlobalEconomy;
}

export function emptyMultiScenarioCoachTestPlan(input: {
  readonly batchCalibration: SandboxDecisionBatchConfidenceCalibrationModel;
  readonly warnings: readonly string[];
}): MultiScenarioCoachTestPlanModel {
  return {
    status: "not_available",
    origin: "none",
    ...(input.batchCalibration.segmentLabel === undefined ? {} : { segmentLabel: input.batchCalibration.segmentLabel }),
    ...(input.batchCalibration.chainId === undefined ? {} : { chainId: input.batchCalibration.chainId }),
    title: "Plan de test coach",
    summary: "Plan de test coach indisponible : le batch sandbox local n'est pas disponible.",
    recommendationType: input.batchCalibration.recommendationType,
    batchConfidence: cappedConfidence(input.batchCalibration.batchConfidence),
    recommendationStability: input.batchCalibration.recommendationStability,
    testCount: 0,
    tests: [],
    ...(input.batchCalibration.bestScenarioId === undefined ? {} : { bestScenarioId: input.batchCalibration.bestScenarioId }),
    ...(input.batchCalibration.worstScenarioId === undefined ? {} : { worstScenarioId: input.batchCalibration.worstScenarioId }),
    planSuggestionOnly: true,
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
    tags: [],
    warnings: input.warnings,
  };
}

export function validateMultiScenarioCoachTestPlanModel(
  model: MultiScenarioCoachTestPlanModel,
): readonly string[] {
  const shouldValidate = model.status === "available";

  return [
    ...(shouldValidate && model.origin !== "sandbox_decision_batch_confidence_calibration"
      ? ["MULTI_SCENARIO_COACH_TEST_PLAN_WRONG_ORIGIN"]
      : []),
    ...(shouldValidate && (model.testCount < 2 || model.testCount > 3)
      ? ["MULTI_SCENARIO_COACH_TEST_PLAN_COUNT_OUT_OF_RANGE"]
      : []),
    ...(shouldValidate && model.tests.some((test) =>
      !test.suggestionOnly ||
      test.officialTruth ||
      test.canDriveCoachInstruction ||
      test.canDriveLiveSelection ||
      test.canDriveProductionRouteResolution ||
      test.canClaimGlobalEconomy
    )
      ? ["MULTI_SCENARIO_COACH_TEST_PLAN_TEST_GUARD_BREACH"]
      : []),
    ...(!multiScenarioCoachTestPlanCannotMutateOfficialFullMatch(model)
      ? ["MULTI_SCENARIO_COACH_TEST_PLAN_MUTATION_FORBIDDEN_BREACH"]
      : []),
    ...(!multiScenarioCoachTestPlanCannotDriveProduction(model)
      ? ["MULTI_SCENARIO_COACH_TEST_PLAN_PRODUCTION_DRIVER_BREACH"]
      : []),
    ...(!multiScenarioCoachTestPlanCannotClaimGlobalEconomy(model)
      ? ["MULTI_SCENARIO_COACH_TEST_PLAN_GLOBAL_ECONOMY_CLAIM_BREACH"]
      : []),
  ];
}

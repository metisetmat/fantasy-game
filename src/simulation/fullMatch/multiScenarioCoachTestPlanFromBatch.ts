import {
  emptyMultiScenarioCoachTestPlan,
  validateMultiScenarioCoachTestPlanModel,
  type MultiScenarioCoachTest,
  type MultiScenarioCoachTestConfidence,
  type MultiScenarioCoachTestPlanModel,
} from "./multiScenarioCoachTestPlan";
import type {
  SandboxDecisionBatchConfidence,
  SandboxDecisionBatchConfidenceCalibrationModel,
  SandboxDecisionBatchScenarioResult,
} from "./sandboxDecisionBatchConfidenceCalibration";

function confidenceFromBatch(confidence: SandboxDecisionBatchConfidence): MultiScenarioCoachTestConfidence {
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

function scenarioById(
  batch: SandboxDecisionBatchConfidenceCalibrationModel,
  scenarioId: string | undefined,
): SandboxDecisionBatchScenarioResult | undefined {
  if (scenarioId === undefined) {
    return undefined;
  }

  return batch.scenarioResults.find((scenario) => scenario.scenarioId === scenarioId);
}

function scenarioByType(
  batch: SandboxDecisionBatchConfidenceCalibrationModel,
  scenarioType: SandboxDecisionBatchScenarioResult["scenarioType"],
): SandboxDecisionBatchScenarioResult | undefined {
  return batch.scenarioResults.find((scenario) => scenario.scenarioType === scenarioType);
}

function testGuard(input: Omit<
  MultiScenarioCoachTest,
  "suggestionOnly" | "officialTruth" | "canDriveCoachInstruction" | "canDriveLiveSelection" |
  "canDriveProductionRouteResolution" | "canClaimGlobalEconomy"
>): MultiScenarioCoachTest {
  return {
    ...input,
    suggestionOnly: true,
    officialTruth: false,
    canDriveCoachInstruction: false,
    canDriveLiveSelection: false,
    canDriveProductionRouteResolution: false,
    canClaimGlobalEconomy: false,
  };
}

function buildTests(input: {
  readonly batch: SandboxDecisionBatchConfidenceCalibrationModel;
  readonly confidence: MultiScenarioCoachTestConfidence;
}): readonly MultiScenarioCoachTest[] {
  const bestScenario = scenarioById(input.batch, input.batch.bestScenarioId);
  const reboundScenario = scenarioByType(input.batch, "better_attacking_rebound_pressure");
  const worstScenario = scenarioById(input.batch, input.batch.worstScenarioId);
  const tests: MultiScenarioCoachTest[] = [];

  if (bestScenario !== undefined) {
    tests.push(testGuard({
      testId: "support_around_z4_hsr",
      title: "Renforcer le soutien autour de Z4-HSR",
      summary:
        "Tester FORWARD_PROGRESS vers control-space-hunter avec un soutien plus proche autour de Z4-HSR. Le scénario avec meilleur soutien offensif est celui qui améliore le plus la piste, mais le signal reste local et ne prouve pas encore que la route est supérieure.",
      linkedScenarioId: bestScenario.scenarioId,
      linkedScenarioType: bestScenario.scenarioType,
      expectedPositiveSignal: "better continuation after shot / better second-ball presence",
      riskToWatch: "isolated shot if support arrives late",
      remainsUnproven: "Le batch sandbox ne prouve pas encore que cette route est supérieure dans l'économie officielle.",
      confidence: input.confidence === "medium" ? "low_medium" : input.confidence,
    }));
  }

  if (reboundScenario !== undefined) {
    tests.push(testGuard({
      testId: "second_ball_occupation",
      title: "Mieux occuper le second ballon",
      summary:
        "Tester une présence plus agressive autour du rebond après tir. Le but est de vérifier si CONTROL peut transformer une parade du gardien en seconde action plutôt qu'en récupération propre par BLITZ.",
      linkedScenarioId: reboundScenario.scenarioId,
      linkedScenarioType: reboundScenario.scenarioType,
      expectedPositiveSignal: "second chance probability improves",
      riskToWatch: "overcommitting and exposing rest defense",
      remainsUnproven: "Le modèle ne prouve pas encore que l'engagement au rebond reste sûr contre une transition adverse.",
      confidence: input.confidence === "medium" ? "low_medium" : input.confidence,
    }));
  }

  if (worstScenario !== undefined) {
    tests.push(testGuard({
      testId: "strong_goalkeeper_fallback",
      title: "Prévoir la réaction au gardien fort",
      summary:
        "Tester un plan B si le gardien adverse gagne la séquence. Le scénario avec gardien plus fort fait chuter la confiance : la progression peut créer du danger, mais finir en récupération adverse.",
      linkedScenarioId: worstScenario.scenarioId,
      linkedScenarioType: worstScenario.scenarioType,
      expectedPositiveSignal: "safer continuation or better pressure after save",
      riskToWatch: "stronger goalkeeper neutralizes the attack",
      remainsUnproven: "La meilleure réponse au gardien fort reste une hypothèse locale, pas une consigne officielle.",
      confidence: "low",
    }));
  }

  return tests.slice(0, 3);
}

export function multiScenarioCoachTestPlanFromBatch(input: {
  readonly batchCalibration: SandboxDecisionBatchConfidenceCalibrationModel;
}): MultiScenarioCoachTestPlanModel {
  if (input.batchCalibration.status !== "available") {
    return emptyMultiScenarioCoachTestPlan({
      batchCalibration: input.batchCalibration,
      warnings: input.batchCalibration.warnings,
    });
  }

  const confidence = confidenceFromBatch(input.batchCalibration.batchConfidence);
  const tests = buildTests({
    batch: input.batchCalibration,
    confidence,
  });
  const model: MultiScenarioCoachTestPlanModel = {
    status: tests.length >= 2 ? "available" : "partial",
    origin: "sandbox_decision_batch_confidence_calibration",
    ...(input.batchCalibration.segmentLabel === undefined ? {} : { segmentLabel: input.batchCalibration.segmentLabel }),
    ...(input.batchCalibration.chainId === undefined ? {} : { chainId: input.batchCalibration.chainId }),
    title: "Plan de test coach",
    summary:
      "Ces tests sont des hypothèses issues du sandbox, pas des consignes officielles. Ils transforment le batch local en questions coach concrètes sans modifier le match officiel.",
    recommendationType: input.batchCalibration.recommendationType,
    batchConfidence: confidence,
    recommendationStability: input.batchCalibration.recommendationStability,
    testCount: tests.length,
    tests,
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
    tags: [
      "multi_scenario_coach_test_plan",
      `multi_scenario_coach_test_plan_status_${tests.length >= 2 ? "available" : "partial"}`,
      "multi_scenario_coach_test_plan_origin_batch_confidence",
      `multi_scenario_coach_test_count_${tests.length}`,
      ...tests.map((test) => `multi_scenario_test_${test.testId}`),
      ...tests.map((test) => `multi_scenario_test_${test.testId}_scenario_${test.linkedScenarioId}`),
      ...tests.map((test) => `multi_scenario_test_${test.testId}_confidence_${test.confidence}`),
      ...(input.batchCalibration.bestScenarioId === undefined ? [] : [`multi_scenario_test_plan_best_scenario_${input.batchCalibration.bestScenarioId}`]),
      ...(input.batchCalibration.worstScenarioId === undefined ? [] : [`multi_scenario_test_plan_worst_scenario_${input.batchCalibration.worstScenarioId}`]),
      `multi_scenario_test_plan_batch_confidence_${confidence}`,
      `multi_scenario_test_plan_stability_${input.batchCalibration.recommendationStability}`,
      "multi_scenario_test_plan_suggestion_only_true",
      "multi_scenario_test_plan_official_truth_false",
      "multi_scenario_test_plan_can_drive_live_selection_false",
      "multi_scenario_test_plan_can_drive_production_route_resolution_false",
      "multi_scenario_test_plan_global_economy_claim_forbidden",
      "multi_scenario_test_plan_production_scoring_event_creation_count_0",
      "multi_scenario_test_plan_official_timeline_unchanged_true",
      "multi_scenario_test_plan_official_score_unchanged_true",
      "multi_scenario_test_plan_official_possession_unchanged_true",
      "multi_scenario_test_plan_official_scoring_events_unchanged_true",
    ],
    warnings: input.batchCalibration.warnings,
  };
  const warnings = validateMultiScenarioCoachTestPlanModel(model);

  if (warnings.length === 0) {
    return model;
  }

  return {
    ...model,
    status: "failed",
    warnings: [...model.warnings, ...warnings],
  };
}

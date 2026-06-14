import type { MultiScenarioCoachTestPlanModel } from "./multiScenarioCoachTestPlan";
import {
  emptySelectionPreviewModel,
  selectionPreviewCardsFromCoachTests,
  selectionPreviewModelFromCards,
  validateSelectionPreviewModel,
  type SelectionPreviewModel,
} from "./selectionPreviewFromCoachTestPlan";

export function selectionPreviewFromCoachTestPlan(input: {
  readonly testPlan: MultiScenarioCoachTestPlanModel;
}): SelectionPreviewModel {
  if (input.testPlan.status !== "available") {
    return emptySelectionPreviewModel({
      testPlan: input.testPlan,
      warnings: input.testPlan.warnings,
    });
  }

  const previews = selectionPreviewCardsFromCoachTests(input.testPlan.tests);
  const model = selectionPreviewModelFromCards({
    testPlan: input.testPlan,
    previews,
  });
  const warnings = validateSelectionPreviewModel(model);

  if (warnings.length === 0) {
    return model;
  }

  return {
    ...model,
    status: "failed",
    warnings: [...model.warnings, ...warnings],
  };
}

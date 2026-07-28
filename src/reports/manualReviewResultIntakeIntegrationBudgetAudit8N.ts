import { sectionPosition } from "./storyFirstAuditUtils8H";
import type { ManualReviewResultIntakeIntegrationBudgetAudit8N } from "./manualReviewResultIntakeBoundaryTypes8N";
import type { ManualReviewResultIntakeBoundaryWarningCode8N } from "./manualReviewResultIntakeBoundaryWarnings8N";

export function auditManualReviewResultIntakeIntegrationBudget8N(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewResultIntakeIntegrationBudgetAudit8N {
  const productManualIntakeBoundaryVisible = input.productHtml.includes('id="manual-review-result-intake-boundary-8n"');
  const exportManualIntakeBoundaryVisible = input.exportHtml.includes('id="manual-review-result-intake-boundary-export-8n"');
  const productManualForm8MStillVisible = input.productHtml.includes('id="manual-post-match-review-form-8m"');
  const exportManualForm8MStillVisible = input.exportHtml.includes('id="manual-post-match-review-form-export-8m"');
  const productLearningLoop8LStillVisible = input.productHtml.includes('id="seasonless-learning-loop-8l"');
  const exportLearningLoop8LStillVisible = input.exportHtml.includes('id="seasonless-learning-loop-export-8l"');
  const productDecisionLayer8KStillVisible = input.productHtml.includes('id="coach-decision-layer-8k"');
  const exportDecisionLayer8KStillVisible = input.exportHtml.includes('id="next-match-observation-export-8k"');
  const productStoryFirstSectionVisible = input.productHtml.includes("Le match en 2 minutes");
  const exportStoryFirstSectionVisible = input.exportHtml.includes("Le match en 2 minutes");
  const productReplaySectionVisible = input.productHtml.includes("Replay coach");
  const exportReplaySectionVisible = input.exportHtml.includes("Replay coach en 60 secondes");
  const productActionPlanVisible = input.productHtml.includes("Plan d'action coach");
  const exportActionPlanVisible = input.exportHtml.includes("Plan d'action coach");
  const tacticalMapCardsStillVisible = input.productHtml.includes('id="tactical-map-cards"') &&
    input.exportHtml.includes('id="tactical-map-cards"');
  const sourceOfTruthNoteVisible = input.productHtml.includes("source de verite") ||
    input.exportHtml.includes("source de verite") ||
    input.exportHtml.includes("score_change");
  const productSectionOrderPreserved = sectionPosition(input.productHtml, "manual-post-match-review-form-8m") <
    sectionPosition(input.productHtml, "manual-review-result-intake-boundary-8n");
  const exportCompactPreserved = input.exportHtml.includes('data-story-first-export-version="8I"') &&
    input.exportHtml.includes('data-manual-review-intake-boundary-version="8N"') &&
    !/timeline complete|sandbox panel|long batch diagnostics/iu.test(input.exportHtml);
  const warnings: ManualReviewResultIntakeBoundaryWarningCode8N[] = [];

  if (!productManualIntakeBoundaryVisible) warnings.push("PRODUCT_MANUAL_INTAKE_BOUNDARY_MISSING");
  if (!exportManualIntakeBoundaryVisible) warnings.push("EXPORT_MANUAL_INTAKE_BOUNDARY_MISSING");
  if (!productManualForm8MStillVisible) warnings.push("PRODUCT_MANUAL_FORM_8M_REGRESSED");
  if (!exportManualForm8MStillVisible) warnings.push("EXPORT_MANUAL_FORM_8M_REGRESSED");
  if (!productLearningLoop8LStillVisible) warnings.push("PRODUCT_LEARNING_LOOP_8L_REGRESSED");
  if (!exportLearningLoop8LStillVisible) warnings.push("EXPORT_LEARNING_LOOP_8L_REGRESSED");
  if (!productDecisionLayer8KStillVisible) warnings.push("PRODUCT_DECISION_LAYER_8K_REGRESSED");
  if (!exportDecisionLayer8KStillVisible) warnings.push("EXPORT_DECISION_LAYER_8K_REGRESSED");
  if (!productStoryFirstSectionVisible) warnings.push("PRODUCT_STORY_FIRST_REGRESSED");
  if (!exportStoryFirstSectionVisible || !exportCompactPreserved) warnings.push("EXPORT_COMPACT_REGRESSED");
  if (!productSectionOrderPreserved) warnings.push("PRODUCT_MANUAL_INTAKE_BOUNDARY_MISSING");

  return {
    productManualIntakeBoundaryVisible,
    exportManualIntakeBoundaryVisible,
    productManualForm8MStillVisible,
    exportManualForm8MStillVisible,
    productLearningLoop8LStillVisible,
    exportLearningLoop8LStillVisible,
    productDecisionLayer8KStillVisible,
    exportDecisionLayer8KStillVisible,
    productStoryFirstSectionVisible,
    exportStoryFirstSectionVisible,
    productReplaySectionVisible,
    exportReplaySectionVisible,
    productActionPlanVisible,
    exportActionPlanVisible,
    tacticalMapCardsStillVisible,
    sourceOfTruthNoteVisible,
    productSectionOrderPreserved,
    exportCompactPreserved,
    integrationWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_MANUAL_INTAKE_INTEGRATION" : "REPAIR_MANUAL_INTAKE_INTEGRATION",
  };
}

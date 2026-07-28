import type { ManualReviewPreviewIntegrationBudgetAudit8O } from "./manualReviewPreviewRendererTypes8O";
import type { ManualReviewPreviewRendererWarningCode8O } from "./manualReviewPreviewRendererWarnings8O";

function orderPreserved(html: string, first: string, second: string): boolean {
  const firstIndex = html.indexOf(first);
  const secondIndex = html.indexOf(second);
  return firstIndex >= 0 && secondIndex >= 0 && firstIndex < secondIndex;
}

export function auditManualReviewPreviewIntegrationBudget8O(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewIntegrationBudgetAudit8O {
  const productPreviewRendererVisible = input.productHtml.includes('id="manual-review-preview-renderer-8o"');
  const exportPreviewRendererVisible = input.exportHtml.includes('id="manual-review-preview-renderer-export-8o"');
  const productManualIntakeBoundary8NStillVisible = input.productHtml.includes('id="manual-review-result-intake-boundary-8n"');
  const exportManualIntakeBoundary8NStillVisible = input.exportHtml.includes('id="manual-review-result-intake-boundary-export-8n"');
  const productManualForm8MStillVisible = input.productHtml.includes('id="manual-post-match-review-form-8m"');
  const exportManualForm8MStillVisible = input.exportHtml.includes('id="manual-post-match-review-form-export-8m"');
  const productLearningLoop8LStillVisible = input.productHtml.includes('id="seasonless-learning-loop-8l"');
  const exportLearningLoop8LStillVisible = input.exportHtml.includes('id="seasonless-learning-loop-export-8l"');
  const productDecisionLayer8KStillVisible = input.productHtml.includes('id="coach-decision-layer-8k"');
  const exportDecisionLayer8KStillVisible = input.exportHtml.includes('id="coach-decision-layer-export-8k"') ||
    input.exportHtml.includes('id="next-match-observation-export-8k"');
  const productStoryFirstSectionVisible = input.productHtml.includes("Le match en 2 minutes") || input.productHtml.includes("Lecture express");
  const exportStoryFirstSectionVisible = input.exportHtml.includes("Le match en 2 minutes");
  const productReplaySectionVisible = input.productHtml.includes("Replay coach") || input.productHtml.includes("replay");
  const exportReplaySectionVisible = input.exportHtml.includes("Replay coach en 60 secondes");
  const productActionPlanVisible = input.productHtml.includes("Plan d'action");
  const exportActionPlanVisible = input.exportHtml.includes("Plan d'action coach");
  const tacticalMapCardsStillVisible = input.productHtml.includes("Cartes tactiques") || input.exportHtml.includes("Cartes tactiques essentielles");
  const sourceOfTruthNoteVisible = input.productHtml.includes("source-of-truth") || input.exportHtml.includes("source-of-truth") || input.exportHtml.includes("score officiel");
  const productSectionOrderPreserved = orderPreserved(
    input.productHtml,
    'id="manual-review-result-intake-boundary-8n"',
    'id="manual-review-preview-renderer-8o"',
  );
  const exportCompactPreserved = input.exportHtml.includes("Preview revue manuelle") &&
    input.exportHtml.includes("Cartes tactiques essentielles") &&
    orderPreserved(input.exportHtml, "Frontiere de saisie manuelle", "Preview revue manuelle");
  const warnings: ManualReviewPreviewRendererWarningCode8O[] = [];
  if (!productPreviewRendererVisible) warnings.push("PRODUCT_PREVIEW_RENDERER_MISSING");
  if (!exportPreviewRendererVisible) warnings.push("EXPORT_PREVIEW_RENDERER_MISSING");
  if (!productManualIntakeBoundary8NStillVisible) warnings.push("PRODUCT_MANUAL_INTAKE_BOUNDARY_8N_REGRESSED");
  if (!exportManualIntakeBoundary8NStillVisible) warnings.push("EXPORT_MANUAL_INTAKE_BOUNDARY_8N_REGRESSED");
  if (!productManualForm8MStillVisible) warnings.push("PRODUCT_MANUAL_FORM_8M_REGRESSED");
  if (!exportManualForm8MStillVisible) warnings.push("EXPORT_MANUAL_FORM_8M_REGRESSED");
  if (!productLearningLoop8LStillVisible) warnings.push("PRODUCT_LEARNING_LOOP_8L_REGRESSED");
  if (!exportLearningLoop8LStillVisible) warnings.push("EXPORT_LEARNING_LOOP_8L_REGRESSED");
  if (!productDecisionLayer8KStillVisible) warnings.push("PRODUCT_DECISION_LAYER_8K_REGRESSED");
  if (!exportDecisionLayer8KStillVisible) warnings.push("EXPORT_DECISION_LAYER_8K_REGRESSED");
  if (!productStoryFirstSectionVisible) warnings.push("PRODUCT_STORY_FIRST_REGRESSED");
  if (!exportCompactPreserved) warnings.push("EXPORT_COMPACT_REGRESSED");

  return {
    productPreviewRendererVisible,
    exportPreviewRendererVisible,
    productManualIntakeBoundary8NStillVisible,
    exportManualIntakeBoundary8NStillVisible,
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
    integrationWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_PREVIEW_INTEGRATION" : "REPAIR_PREVIEW_INTEGRATION",
  };
}

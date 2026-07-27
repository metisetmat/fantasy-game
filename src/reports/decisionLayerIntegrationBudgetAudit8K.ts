import type { DecisionLayerIntegrationBudgetAudit8K } from "./coachReportDecisionLayerNextMatchObservationPlanTypes8K";
import type { CoachReportDecisionLayerNextMatchObservationPlanWarningCode } from "./coachReportDecisionLayerNextMatchObservationPlanWarnings";

export function auditDecisionLayerIntegrationBudget8K(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): DecisionLayerIntegrationBudgetAudit8K {
  const warnings: CoachReportDecisionLayerNextMatchObservationPlanWarningCode[] = [];
  const productDecisionLayerVisible = input.productHtml.includes('id="coach-decision-layer-8k"');
  const exportDecisionLayerVisible = input.exportHtml.includes('id="next-match-observation-export-8k"');
  const productStoryFirstSectionVisible = input.productHtml.includes('data-story-first-version="8H"') || input.productHtml.includes("Le match en 2 minutes");
  const exportStoryFirstSectionVisible = input.exportHtml.includes('data-story-first-export-version="8I"') && input.exportHtml.includes("Le match en 2 minutes");
  const productReplaySectionVisible = input.productHtml.includes('id="coach-replay-8e"');
  const exportReplaySectionVisible = input.exportHtml.includes('id="coach-replay-8e"');
  const productActionPlanVisible = input.productHtml.includes('id="coach-action-plan"');
  const exportActionPlanVisible = input.exportHtml.includes('id="coach-action-plan"');
  const tacticalMapCardsStillVisible = input.productHtml.includes('id="tactical-map-cards"') && input.exportHtml.includes('id="tactical-map-cards"');
  const trendsStillVisible = input.productHtml.includes("trend") || input.exportHtml.includes("Tendances prudentes compactes");
  const sourceOfTruthNoteVisible = input.productHtml.includes("source-of-truth") || input.exportHtml.includes("Source-of-truth note");
  const productSectionOrderPreserved = input.productHtml.indexOf("Le match en 2 minutes") < input.productHtml.indexOf("Plan d'action coach") &&
    input.productHtml.indexOf("Plan d'action coach") < input.productHtml.indexOf("Decider quoi observer au prochain match");
  const exportCompactPreserved = input.exportHtml.includes("compressed-export-8i") &&
    !/timeline complete|sandbox panel|long batch diagnostics/iu.test(input.exportHtml);

  if (!productDecisionLayerVisible) warnings.push("DECISION_LAYER_MISSING");
  if (!exportDecisionLayerVisible) warnings.push("NEXT_MATCH_OBSERVATION_PLAN_MISSING");
  if (!productStoryFirstSectionVisible || !productReplaySectionVisible || !productActionPlanVisible) warnings.push("PRODUCT_STORY_FIRST_REGRESSED");
  if (!exportStoryFirstSectionVisible || !exportReplaySectionVisible || !exportActionPlanVisible || !exportCompactPreserved) warnings.push("EXPORT_COMPACT_REGRESSED");

  return {
    productDecisionLayerVisible,
    exportDecisionLayerVisible,
    productStoryFirstSectionVisible,
    exportStoryFirstSectionVisible,
    productReplaySectionVisible,
    exportReplaySectionVisible,
    productActionPlanVisible,
    exportActionPlanVisible,
    tacticalMapCardsStillVisible,
    trendsStillVisible,
    sourceOfTruthNoteVisible,
    productSectionOrderPreserved,
    exportCompactPreserved,
    reportIntegrationWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_8K_REPORT_INTEGRATION" : "REPAIR_8K_REPORT_INTEGRATION",
  };
}

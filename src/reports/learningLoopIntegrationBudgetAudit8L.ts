import { sectionPosition } from "./storyFirstAuditUtils8H";
import type { LearningLoopIntegrationBudgetAudit8L } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerTypes8L";
import type { CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerWarnings";

function openTagDepthBefore(html: string, tagName: "article" | "section", index: number): number {
  const pattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, "giu");
  let depth = 0;
  for (const match of html.slice(0, Math.max(0, index)).matchAll(pattern)) {
    depth += match[0].startsWith("</") ? -1 : 1;
  }
  return depth;
}

export function auditLearningLoopIntegrationBudget8L(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): LearningLoopIntegrationBudgetAudit8L {
  const productLearningLoopVisible = input.productHtml.includes('id="seasonless-learning-loop-8l"');
  const exportLearningLoopVisible = input.exportHtml.includes('id="seasonless-learning-loop-export-8l"');
  const productDecisionLayer8KStillVisible = input.productHtml.includes('id="coach-decision-layer-8k"') &&
    input.productHtml.includes("Decider quoi observer au prochain match");
  const exportDecisionLayer8KStillVisible = input.exportHtml.includes('id="next-match-observation-export-8k"') &&
    input.exportHtml.includes("A observer au prochain match");
  const productStoryFirstSectionVisible = input.productHtml.includes("Le match en 2 minutes");
  const exportStoryFirstSectionVisible = input.exportHtml.includes('data-story-first-export-version="8I"') &&
    input.exportHtml.includes("Le match en 2 minutes");
  const productReplaySectionVisible = input.productHtml.includes("Replay");
  const exportReplaySectionVisible = input.exportHtml.includes("Replay coach en 60 secondes");
  const productActionPlanVisible = input.productHtml.includes('id="coach-action-plan"') ||
    input.productHtml.includes("Plan d'action");
  const exportActionPlanVisible = input.exportHtml.includes('id="coach-action-plan"') ||
    input.exportHtml.includes("Plan d'action coach");
  const tacticalMapCardsStillVisible = input.productHtml.includes("Cartes tactiques") &&
    input.exportHtml.includes("Cartes tactiques essentielles");
  const sourceOfTruthNoteVisible = input.productHtml.includes("Source-of-truth") &&
    input.exportHtml.includes("Source-of-truth note");
  const learningLoopPosition = sectionPosition(input.productHtml, "seasonless-learning-loop-8l");
  const productSectionOrderPreserved = sectionPosition(input.productHtml, "coach-decision-layer-8k") <
    learningLoopPosition &&
    openTagDepthBefore(input.productHtml, "article", learningLoopPosition) === 0;
  const exportCompactPreserved = exportStoryFirstSectionVisible &&
    exportDecisionLayer8KStillVisible &&
    exportLearningLoopVisible &&
    !/timeline complete|sandbox panel|long batch diagnostics/iu.test(input.exportHtml);
  const warnings: CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[] = [];

  if (!productLearningLoopVisible) warnings.push("SEASONLESS_LEARNING_LOOP_MISSING");
  if (!exportLearningLoopVisible) warnings.push("OBSERVATION_OUTCOME_TRACKER_MISSING");
  if (!productDecisionLayer8KStillVisible) warnings.push("PRODUCT_DECISION_LAYER_8K_REGRESSED");
  if (!exportDecisionLayer8KStillVisible) warnings.push("EXPORT_DECISION_LAYER_8K_REGRESSED");
  if (!productStoryFirstSectionVisible) warnings.push("PRODUCT_STORY_FIRST_REGRESSED");
  if (!productSectionOrderPreserved) warnings.push("PRODUCT_STORY_FIRST_REGRESSED");
  if (!exportCompactPreserved) warnings.push("EXPORT_COMPACT_REGRESSED");

  return {
    productLearningLoopVisible,
    exportLearningLoopVisible,
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
    recommendation: warnings.length === 0 ? "KEEP_LEARNING_LOOP_INTEGRATION" : "REPAIR_LEARNING_LOOP_INTEGRATION",
  };
}

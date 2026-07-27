import { sectionPosition } from "./storyFirstAuditUtils8H";
import type { ManualReviewFormIntegrationBudgetAudit8M } from "./manualPostMatchObservationReviewFormTypes8M";
import type { ManualPostMatchObservationReviewFormWarningCode8M } from "./manualPostMatchObservationReviewFormWarnings";

export function auditManualReviewFormIntegrationBudget8M(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewFormIntegrationBudgetAudit8M {
  const productManualFormVisible = input.productHtml.includes('id="manual-post-match-review-form-8m"');
  const exportManualFormVisible = input.exportHtml.includes('id="manual-post-match-review-form-export-8m"');
  const product8LStillVisible = input.productHtml.includes('id="seasonless-learning-loop-8l"');
  const export8LStillVisible = input.exportHtml.includes('id="seasonless-learning-loop-export-8l"');
  const product8KStillVisible = input.productHtml.includes('id="coach-decision-layer-8k"');
  const export8KStillVisible = input.exportHtml.includes('id="next-match-observation-export-8k"');
  const productStoryFirstStillVisible = input.productHtml.includes("Le match en 2 minutes");
  const exportCompactPreserved = input.exportHtml.includes('data-story-first-export-version="8I"') &&
    input.exportHtml.includes("Le match en 2 minutes") &&
    !/timeline complete|sandbox panel|long batch diagnostics/iu.test(input.exportHtml);
  const productSectionOrderPreserved = sectionPosition(input.productHtml, "seasonless-learning-loop-8l") <
    sectionPosition(input.productHtml, "manual-post-match-review-form-8m");
  const warnings: ManualPostMatchObservationReviewFormWarningCode8M[] = [];

  if (!productManualFormVisible) warnings.push("PRODUCT_FORM_MISSING");
  if (!exportManualFormVisible) warnings.push("EXPORT_FORM_MISSING");
  if (!product8LStillVisible || !export8LStillVisible) warnings.push("BASELINE_8L_REGRESSED");
  if (!product8KStillVisible || !export8KStillVisible) warnings.push("BASELINE_8K_REGRESSED");
  if (!productStoryFirstStillVisible || !exportCompactPreserved) warnings.push("BASELINE_8I_REGRESSED");
  if (!productSectionOrderPreserved) warnings.push("PRODUCT_SECTION_ORDER_REGRESSED");

  return {
    productManualFormVisible,
    exportManualFormVisible,
    product8LStillVisible,
    export8LStillVisible,
    product8KStillVisible,
    export8KStillVisible,
    productStoryFirstStillVisible,
    exportCompactPreserved,
    productSectionOrderPreserved,
    integrationWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_MANUAL_REVIEW_INTEGRATION" : "REPAIR_MANUAL_REVIEW_INTEGRATION",
  };
}

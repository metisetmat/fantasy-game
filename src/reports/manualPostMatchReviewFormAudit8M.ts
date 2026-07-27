import { countMatches } from "./storyFirstAuditUtils8H";
import type {
  ManualPostMatchObservationReviewForm8M,
  ManualPostMatchReviewFormAudit8M,
} from "./manualPostMatchObservationReviewFormTypes8M";
import type { ManualPostMatchObservationReviewFormWarningCode8M } from "./manualPostMatchObservationReviewFormWarnings";

export function auditManualPostMatchReviewForm8M(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
  readonly form: ManualPostMatchObservationReviewForm8M;
}): ManualPostMatchReviewFormAudit8M {
  const productFormVisible = input.productHtml.includes('id="manual-post-match-review-form-8m"') &&
    input.productHtml.includes("Formulaire manuel de revue post-match");
  const exportFormVisible = input.exportHtml.includes('id="manual-post-match-review-form-export-8m"') &&
    input.exportHtml.includes("Formulaire post-match a remplir");
  const reviewSectionCount = countMatches(input.productHtml, /manual-review-section-8m/giu);
  const linked8LSectionCount = input.form.sections.filter((section) =>
    input.productHtml.includes(`data-linked-8l-card-id="${section.linked8LObservationCardId}"`) &&
    input.exportHtml.includes(`data-linked-8l-card-id="${section.linked8LObservationCardId}"`),
  ).length;
  const pendingSectionCount = input.form.sections.filter((section) => section.status === "pending").length;
  const blankSectionCount = countMatches(input.productHtml, /\bblank\b/giu) >= input.form.sections.length ? input.form.sections.length : 0;
  const notEvaluatedSectionCount = countMatches(input.productHtml, /\bnot_evaluated\b/giu) >= input.form.sections.length ? input.form.sections.length : 0;
  const evidenceCountFieldCount = countMatches(input.productHtml, /manual-evidence-count-field-8m/giu);
  const contextComparableFieldCount = countMatches(input.productHtml, /manual-context-comparable-field-8m/giu);
  const coachNotesFieldCount = countMatches(input.productHtml, /manual-coach-notes-field-8m/giu);
  const cautionFieldCount = countMatches(input.productHtml, /manual-caution-8m/giu);
  const warnings: ManualPostMatchObservationReviewFormWarningCode8M[] = [];

  if (!productFormVisible) warnings.push("PRODUCT_FORM_MISSING");
  if (!exportFormVisible) warnings.push("EXPORT_FORM_MISSING");
  if (reviewSectionCount !== 3) warnings.push("REVIEW_SECTION_COUNT_INVALID");
  if (linked8LSectionCount !== 3) warnings.push("REVIEW_SECTION_NOT_LINKED_TO_8L");
  if (pendingSectionCount !== 3 || blankSectionCount !== 3 || notEvaluatedSectionCount !== 3) {
    warnings.push("REVIEW_SECTION_STATE_NOT_PENDING_BLANK");
  }
  if (evidenceCountFieldCount < 9) warnings.push("EVIDENCE_FIELD_MISSING");
  if (contextComparableFieldCount < 6) warnings.push("CONTEXT_COMPARABLE_FIELD_MISSING");
  if (coachNotesFieldCount < 3) warnings.push("COACH_NOTES_FIELD_MISSING");
  if (cautionFieldCount !== 3) warnings.push("CAUTION_FIELD_MISSING");

  return {
    productFormVisible,
    exportFormVisible,
    reviewSectionCount,
    linked8LSectionCount,
    pendingSectionCount,
    blankSectionCount,
    notEvaluatedSectionCount,
    evidenceCountFieldCount,
    contextComparableFieldCount,
    coachNotesFieldCount,
    cautionFieldCount,
    formAuditWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_MANUAL_REVIEW_FORM" : "REPAIR_MANUAL_REVIEW_FORM",
  };
}

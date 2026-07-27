import { countMatches } from "./storyFirstAuditUtils8H";
import type {
  ManualOutcomeOptionAudit8M,
  ManualPostMatchObservationReviewForm8M,
} from "./manualPostMatchObservationReviewFormTypes8M";
import type { ManualPostMatchObservationReviewFormWarningCode8M } from "./manualPostMatchObservationReviewFormWarnings";

export function auditManualOutcomeOptions8M(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
  readonly form: ManualPostMatchObservationReviewForm8M;
}): ManualOutcomeOptionAudit8M {
  const outcomeOptionCount = countMatches(input.productHtml, /manual-outcome-option-8m/giu);
  const sectionsWithFourOptionsCount = input.form.sections.filter((section) => section.outcomeOptions.length === 4).length;
  const checkedDefaultCount = countMatches(`${input.productHtml}\n${input.exportHtml}`, /<input\b[^>]*\bchecked\b/giu);
  const automaticOutcomeCount = countMatches(`${input.productHtml}\n${input.exportHtml}`, /\b(?:data-auto-outcome|auto-classified|classification calculee|resultat calcule)\b/giu);
  const warnings: ManualPostMatchObservationReviewFormWarningCode8M[] = [];

  if (outcomeOptionCount !== 12 || sectionsWithFourOptionsCount !== 3) warnings.push("OUTCOME_OPTION_COUNT_INVALID");
  if (checkedDefaultCount !== 0) warnings.push("DEFAULT_CHECKED_OUTCOME_DETECTED");
  if (automaticOutcomeCount !== 0 || !input.form.noAutomaticClassification) warnings.push("AUTOMATIC_OUTCOME_DETECTED");

  return {
    outcomeOptionCount,
    sectionsWithFourOptionsCount,
    checkedDefaultCount,
    automaticOutcomeCount,
    outcomeOptionAuditWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_MANUAL_OUTCOME_OPTIONS" : "REPAIR_MANUAL_OUTCOME_OPTIONS",
  };
}

import { countMatches } from "./storyFirstAuditUtils8H";
import type { ManualReviewFormCoachUsabilityAudit8M } from "./manualPostMatchObservationReviewFormTypes8M";
import type { ManualPostMatchObservationReviewFormWarningCode8M } from "./manualPostMatchObservationReviewFormWarnings";

export function auditManualReviewFormCoachUsability8M(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewFormCoachUsabilityAudit8M {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const manualInstructionsVisible = combined.includes("A remplir uniquement apres le prochain match") &&
    combined.includes("A completer a la main apres le prochain match");
  const coachCanFillAfterMatch = combined.includes("Notes coach") &&
    combined.includes("Preuves comptees") &&
    combined.includes("Contexte comparable");
  const fieldLabelsClearCount = countMatches(combined, /\b(?:Nombre de situations comparables|Signaux allant|Pression comparable|Score et moment comparables|Notes coach)\b/giu);
  const readonlyTextAreaCount = countMatches(input.productHtml, /<textarea\b[^>]*\breadonly\b/giu);
  const staticCheckboxCount = countMatches(combined, /<input\b[^>]*type=["']checkbox["'][^>]*>/giu);
  const visibleCautionCount = countMatches(input.productHtml, /manual-caution-8m/giu);
  const noSubmitFlowVisible = !/<button\b|type=["']?submit|<form\b/iu.test(combined);
  const warnings: ManualPostMatchObservationReviewFormWarningCode8M[] = [];

  if (!manualInstructionsVisible || !coachCanFillAfterMatch || fieldLabelsClearCount < 15 || readonlyTextAreaCount < 9 || staticCheckboxCount < 24 || visibleCautionCount !== 3 || !noSubmitFlowVisible) {
    warnings.push("COACH_USABILITY_REGRESSED");
  }

  return {
    manualInstructionsVisible,
    coachCanFillAfterMatch,
    fieldLabelsClearCount,
    readonlyTextAreaCount,
    staticCheckboxCount,
    visibleCautionCount,
    noSubmitFlowVisible,
    usabilityWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_MANUAL_REVIEW_USABILITY" : "REPAIR_MANUAL_REVIEW_USABILITY",
  };
}

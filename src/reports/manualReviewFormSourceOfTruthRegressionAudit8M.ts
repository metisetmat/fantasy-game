import type { CoachReportSeasonlessLearningLoopObservationOutcomeTracker8LModel } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerTypes8L";
import type { ManualReviewFormSourceOfTruthRegressionAudit8M } from "./manualPostMatchObservationReviewFormTypes8M";
import type { ManualPostMatchObservationReviewFormWarningCode8M } from "./manualPostMatchObservationReviewFormWarnings";

function sectionHtml(html: string, sectionId: string): string {
  const markerIndex = html.indexOf(`id="${sectionId}"`);
  if (markerIndex < 0) return "";
  const sectionStart = html.lastIndexOf("<section", markerIndex);
  if (sectionStart < 0) return "";
  const pattern = /<\/?section\b[^>]*>/giu;
  let depth = 0;
  for (const match of html.slice(sectionStart).matchAll(pattern)) {
    const tag = match[0];
    const absoluteEnd = sectionStart + (match.index ?? 0) + tag.length;
    if (tag.startsWith("</")) {
      depth -= 1;
      if (depth === 0) return html.slice(sectionStart, absoluteEnd);
    } else {
      depth += 1;
    }
  }
  return html.slice(sectionStart);
}

export function auditManualReviewFormSourceOfTruthRegression8M(input: {
  readonly baseline8L: CoachReportSeasonlessLearningLoopObservationOutcomeTracker8LModel;
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewFormSourceOfTruthRegressionAudit8M {
  const productFormHtml = sectionHtml(input.productHtml, "manual-post-match-review-form-8m");
  const exportFormHtml = sectionHtml(input.exportHtml, "manual-post-match-review-form-export-8m");
  const formHtml = `${productFormHtml}\n${exportFormHtml}`;
  const baseline8LStatusPass = input.baseline8L.status === "PASS";
  const baseline8KPreserved = input.baseline8L.baseline8KPreserved && input.productHtml.includes('id="coach-decision-layer-8k"') && input.exportHtml.includes('id="next-match-observation-export-8k"');
  const baseline8IPreserved = input.baseline8L.baseline8IPreserved && input.exportHtml.includes('data-story-first-export-version="8I"');
  const baseline8LPreserved = input.productHtml.includes('id="seasonless-learning-loop-8l"') && input.exportHtml.includes('id="seasonless-learning-loop-export-8l"');
  const noScoreMutation = input.baseline8L.sourceOfTruthRegressionAudit.noScoreMutation;
  const noEventDeletion = input.baseline8L.sourceOfTruthRegressionAudit.noEventDeletion;
  const noScoringConstantChange = input.baseline8L.sourceOfTruthRegressionAudit.noScoringConstantChange;
  const MatchBonusEventUnchanged = input.baseline8L.sourceOfTruthRegressionAudit.MatchBonusEventUnchanged;
  const batchLiveSeparationPreserved = input.baseline8L.sourceOfTruthRegressionAudit.batchLiveSeparationPreserved;
  const formDoesNotClaimNewScoreEvidence = !/(?:score_change|nouvelle preuve de score)/iu.test(formHtml);
  const formDoesNotCreateFutureEvidence = !/(?:preuve du prochain match|future evidence|resultat futur confirme)/iu.test(formHtml);
  const warnings: ManualPostMatchObservationReviewFormWarningCode8M[] = [];

  if (!baseline8LStatusPass || !baseline8LPreserved) warnings.push("BASELINE_8L_REGRESSED");
  if (!baseline8KPreserved) warnings.push("BASELINE_8K_REGRESSED");
  if (!baseline8IPreserved) warnings.push("BASELINE_8I_REGRESSED");
  if (!noScoreMutation || !noEventDeletion) warnings.push("SOURCE_OF_TRUTH_REGRESSED");
  if (!noScoringConstantChange) warnings.push("SCORING_CONSTANT_CHANGED");
  if (!MatchBonusEventUnchanged) warnings.push("MATCH_BONUS_EVENT_MUTATED");
  if (!batchLiveSeparationPreserved) warnings.push("BATCH_LIVE_SEPARATION_REGRESSED");
  if (!formDoesNotClaimNewScoreEvidence || !formDoesNotCreateFutureEvidence) warnings.push("FUTURE_EVIDENCE_CLAIM_DETECTED");

  return {
    baseline8LStatusPass,
    baseline8KPreserved,
    baseline8IPreserved,
    baseline8LPreserved,
    noScoreMutation,
    noEventDeletion,
    noScoringConstantChange,
    MatchBonusEventUnchanged,
    batchLiveSeparationPreserved,
    formDoesNotClaimNewScoreEvidence,
    formDoesNotCreateFutureEvidence,
    sourceOfTruthWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_SOURCE_OF_TRUTH_GUARDS" : "REPAIR_SOURCE_OF_TRUTH_REGRESSION",
  };
}

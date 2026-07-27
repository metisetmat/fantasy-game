import { countMatches } from "./storyFirstAuditUtils8H";
import type { ObservationOutcomeTracker8L, ObservationOutcomeTrackerAudit8L } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerTypes8L";
import type { CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerWarnings";

export function auditObservationOutcomeTracker8L(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
  readonly tracker: ObservationOutcomeTracker8L;
}): ObservationOutcomeTrackerAudit8L {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const observationCardCount = input.tracker.observationCards.length;
  const observationCardsLinkedTo8KCount = input.tracker.observationCards.filter((card) => card.linked8KDecisionCardId.endsWith("-8k")).length;
  const postMatchOutcomeOptionsVisible = ["Confirme", "Infirme", "Inconclusif", "Echantillon insuffisant"].every((label) => input.productHtml.includes(label));
  const confirmedOptionDefined = input.tracker.outcomeMatrix.some((option) => option.outcomeId === "confirmed");
  const contradictedOptionDefined = input.tracker.outcomeMatrix.some((option) => option.outcomeId === "contradicted");
  const inconclusiveOptionDefined = input.tracker.outcomeMatrix.some((option) => option.outcomeId === "inconclusive");
  const insufficientSampleOptionDefined = input.tracker.outcomeMatrix.some((option) => option.outcomeId === "insufficient_sample");
  const manualReviewInstructionsVisible = input.productHtml.includes("Apres le match, choisir") &&
    input.exportHtml.includes("A renseigner apres le prochain match");
  const automaticOutcomeClassificationCount = countMatches(combined, /\b(?:classe automatiquement|classification automatique|outcome automatique)\b/giu);
  const fabricatedNextMatchEvidenceCount = countMatches(combined, /\b(?:preuve du prochain match|next match evidence observed|prochain match observe)\b/giu);
  const observationOutcomeTrackerReady = observationCardCount === 3 &&
    observationCardsLinkedTo8KCount === 3 &&
    postMatchOutcomeOptionsVisible &&
    confirmedOptionDefined &&
    contradictedOptionDefined &&
    inconclusiveOptionDefined &&
    insufficientSampleOptionDefined &&
    manualReviewInstructionsVisible &&
    automaticOutcomeClassificationCount === 0 &&
    fabricatedNextMatchEvidenceCount === 0;
  const warnings: CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[] = [];

  if (observationCardCount !== 3) warnings.push("TRACKER_CARD_COUNT_INVALID");
  if (!postMatchOutcomeOptionsVisible || !confirmedOptionDefined || !contradictedOptionDefined || !inconclusiveOptionDefined || !insufficientSampleOptionDefined) {
    warnings.push("OBSERVATION_OUTCOME_TRACKER_MISSING");
  }
  if (automaticOutcomeClassificationCount > 0) warnings.push("AUTOMATIC_DECISION_CREATED");
  if (fabricatedNextMatchEvidenceCount > 0) warnings.push("FABRICATED_NEXT_MATCH_EVIDENCE");

  return {
    observationOutcomeTrackerReady,
    observationCardCount,
    observationCardsLinkedTo8KCount,
    postMatchOutcomeOptionsVisible,
    confirmedOptionDefined,
    contradictedOptionDefined,
    inconclusiveOptionDefined,
    insufficientSampleOptionDefined,
    manualReviewInstructionsVisible,
    automaticOutcomeClassificationCount,
    fabricatedNextMatchEvidenceCount,
    observationOutcomeTrackerWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_OBSERVATION_OUTCOME_TRACKER" : "REPAIR_OBSERVATION_OUTCOME_TRACKER",
  };
}

import { countMatches } from "./storyFirstAuditUtils8H";
import type { ObservationOutcomeTracker8L, SeasonlessLearningLoopAudit8L } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerTypes8L";
import type { CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerWarnings";

export function auditSeasonlessLearningLoop8L(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
  readonly tracker: ObservationOutcomeTracker8L;
}): SeasonlessLearningLoopAudit8L {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const seasonlessLearningLoopVisible = input.productHtml.includes('id="seasonless-learning-loop-8l"') &&
    input.productHtml.includes("Boucle d'apprentissage sans memoire de saison");
  const trackerVisible = seasonlessLearningLoopVisible && input.productHtml.includes("observation-outcome-card-8l");
  const trackerCardCount = input.tracker.observationCards.length;
  const trackerCardsPendingCount = input.tracker.observationCards.filter((card) => card.currentStatus === "pending" || card.currentStatus === "not_evaluated").length;
  const trackerCardsWithConfirmationCriteriaCount = input.tracker.observationCards.filter((card) => card.confirmationCriteria.length > 0).length;
  const trackerCardsWithDisconfirmationCriteriaCount = input.tracker.observationCards.filter((card) => card.disconfirmationCriteria.length > 0).length;
  const trackerCardsWithInsufficientEvidenceCriteriaCount = input.tracker.observationCards.filter((card) => card.insufficientEvidenceCriteria.length > 0).length;
  const trackerCardsWithMinimumEvidenceCount = input.tracker.observationCards.filter((card) => card.minimumEvidenceNeeded.length > 0).length;
  const trackerCardsWithCautionNoteCount = input.tracker.observationCards.filter((card) => card.cautionNote.length > 0).length;
  const noFutureOutcomeClaim = countMatches(combined, /\b(?:prochain match (?:confirme|infirme|prouve)|les prochains matchs montrent que|resultat futur acquis|resultat futur confirme)\b/giu) === 0;
  const noSeasonMemoryCreated = input.tracker.noSeasonMemory && countMatches(combined, /\b(?:memoire de saison creee|season memory created|tendance de saison confirmee)\b/giu) === 0;
  const noTeamStyleMemoryCreated = input.tracker.noTeamStyleMemory && countMatches(combined, /\b(?:team style memory created|style de l'equipe confirme)\b/giu) === 0;
  const noDatabasePersistenceCreated = input.tracker.noDatabaseStorage && countMatches(combined, /\b(?:base de donnees activee|database persistence created|sqlite active)\b/giu) === 0;
  const noAutomaticDecisionCreated = input.tracker.noAutomaticDecision && countMatches(combined, /\b(?:selection automatique creee|selection automatique imposee|composition automatique creee|composition automatique imposee|decision automatique creee)\b/giu) === 0;
  const warnings: CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[] = [];

  if (!seasonlessLearningLoopVisible) warnings.push("SEASONLESS_LEARNING_LOOP_MISSING");
  if (!trackerVisible) warnings.push("OBSERVATION_OUTCOME_TRACKER_MISSING");
  if (trackerCardCount !== 3) warnings.push("TRACKER_CARD_COUNT_INVALID");
  if (trackerCardsPendingCount !== 3) warnings.push("TRACKER_CARD_NOT_PENDING");
  if (trackerCardsWithConfirmationCriteriaCount !== 3) warnings.push("CONFIRMATION_CRITERIA_MISSING");
  if (trackerCardsWithDisconfirmationCriteriaCount !== 3) warnings.push("DISCONFIRMATION_CRITERIA_MISSING");
  if (trackerCardsWithInsufficientEvidenceCriteriaCount !== 3) warnings.push("INSUFFICIENT_EVIDENCE_CRITERIA_MISSING");
  if (trackerCardsWithMinimumEvidenceCount !== 3) warnings.push("MINIMUM_EVIDENCE_RULE_MISSING");
  if (!noFutureOutcomeClaim) warnings.push("FUTURE_OUTCOME_CLAIM_DETECTED");
  if (!noSeasonMemoryCreated) warnings.push("SEASON_MEMORY_CREATED");
  if (!noTeamStyleMemoryCreated) warnings.push("TEAM_STYLE_MEMORY_CREATED");
  if (!noDatabasePersistenceCreated) warnings.push("DATABASE_PERSISTENCE_CREATED");
  if (!noAutomaticDecisionCreated) warnings.push("AUTOMATIC_DECISION_CREATED");

  return {
    seasonlessLearningLoopVisible,
    trackerVisible,
    trackerCardCount,
    trackerCardsPendingCount,
    trackerCardsWithConfirmationCriteriaCount,
    trackerCardsWithDisconfirmationCriteriaCount,
    trackerCardsWithInsufficientEvidenceCriteriaCount,
    trackerCardsWithMinimumEvidenceCount,
    trackerCardsWithCautionNoteCount,
    noFutureOutcomeClaim,
    noSeasonMemoryCreated,
    noTeamStyleMemoryCreated,
    noDatabasePersistenceCreated,
    noAutomaticDecisionCreated,
    seasonlessLearningWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_SEASONLESS_LEARNING_LOOP" : "REPAIR_SEASONLESS_LEARNING_LOOP",
  };
}

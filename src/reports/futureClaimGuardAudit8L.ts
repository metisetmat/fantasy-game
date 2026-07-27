import { countMatches, stripTags } from "./storyFirstAuditUtils8H";
import type { FutureClaimGuardAudit8L } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerTypes8L";
import type { CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerWarnings";

export function auditFutureClaimGuard8L(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): FutureClaimGuardAudit8L {
  const text = stripTags(`${input.productHtml}\n${input.exportHtml}`);
  const futureMatchOutcomeClaimCount = countMatches(text, /\b(?:prochain match (?:confirme|infirme|prouve)|les prochains matchs montrent que|resultat futur acquis|resultat futur confirme)\b/giu);
  const fakeNextMatchEvidenceCount = countMatches(text, /\b(?:preuve du prochain match|evidence du prochain match|next match evidence)\b/giu);
  const predictionPresentedAsFactCount = countMatches(text, /\b(?:va confirmer|va infirmer|sera confirme|sera infirme|garantit le prochain match)\b/giu);
  const seasonTrendClaimCount = countMatches(text, /\b(?:tendance de saison confirmee|tendance de saison officielle|saison confirme|sur la saison confirme)\b/giu);
  const teamStyleMemoryClaimCount = countMatches(text, /\b(?:team style memory created|team style memory creee|style de l'equipe confirme|memoire de style creee)\b/giu);
  const historicalLearningClaimCount = countMatches(text, /\b(?:l'equipe a appris que|historique montre que|apprentissage historique)\b/giu);
  const persistentMemoryClaimCount = countMatches(text, /\b(?:memoire persistante creee|stockage persistant cree|base de donnees creee)\b/giu);
  const unsupportedConfirmationCount = countMatches(text, /\b(?:statut actuel\s*:\s*confirme|observation confirmee sans prochain match)\b/giu);
  const unsupportedDisconfirmationCount = countMatches(text, /\b(?:statut actuel\s*:\s*infirme|observation infirmee sans prochain match)\b/giu);
  const warnings: CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[] = [];

  if (futureMatchOutcomeClaimCount > 0) warnings.push("FUTURE_OUTCOME_CLAIM_DETECTED");
  if (fakeNextMatchEvidenceCount > 0) warnings.push("FABRICATED_NEXT_MATCH_EVIDENCE");
  if (predictionPresentedAsFactCount > 0) warnings.push("FUTURE_OUTCOME_CLAIM_DETECTED");
  if (seasonTrendClaimCount > 0) warnings.push("SEASON_MEMORY_CREATED");
  if (teamStyleMemoryClaimCount > 0) warnings.push("TEAM_STYLE_MEMORY_CREATED");
  if (historicalLearningClaimCount > 0) warnings.push("FUTURE_OUTCOME_CLAIM_DETECTED");
  if (persistentMemoryClaimCount > 0) warnings.push("DATABASE_PERSISTENCE_CREATED");
  if (unsupportedConfirmationCount > 0) warnings.push("UNSUPPORTED_CONFIRMATION_DETECTED");
  if (unsupportedDisconfirmationCount > 0) warnings.push("UNSUPPORTED_DISCONFIRMATION_DETECTED");

  return {
    futureMatchOutcomeClaimCount,
    fakeNextMatchEvidenceCount,
    predictionPresentedAsFactCount,
    seasonTrendClaimCount,
    teamStyleMemoryClaimCount,
    historicalLearningClaimCount,
    persistentMemoryClaimCount,
    unsupportedConfirmationCount,
    unsupportedDisconfirmationCount,
    futureClaimWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_FUTURE_CLAIM_GUARD" : "REPAIR_FUTURE_CLAIM_GUARD",
  };
}

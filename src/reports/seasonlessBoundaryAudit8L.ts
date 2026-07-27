import { countMatches, stripTags } from "./storyFirstAuditUtils8H";
import type { SeasonlessBoundaryAudit8L } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerTypes8L";
import type { CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode } from "./coachReportSeasonlessLearningLoopObservationOutcomeTrackerWarnings";

export function auditSeasonlessBoundary8L(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): SeasonlessBoundaryAudit8L {
  const text = stripTags(`${input.productHtml}\n${input.exportHtml}`);
  const seasonMemoryCreationCount = countMatches(text, /\b(?:memoire de saison creee|season memory created|tendance de saison confirmee)\b/giu);
  const teamStyleMemoryCreationCount = countMatches(text, /\b(?:team style memory created|memoire de style creee|style de l'equipe confirme)\b/giu);
  const databasePersistenceCreationCount = countMatches(text, /\b(?:database persistence created|base de donnees activee|sqlite active)\b/giu);
  const filePersistenceCreationCount = countMatches(text, /\b(?:fichier de suivi cree|file persistence created|stockage fichier active)\b/giu);
  const automaticSelectionRecommendationCount = countMatches(text, /\b(?:selectionner tel joueur|recommandation de composition|composition recommandee|selection automatique creee|selection automatique imposee)\b/giu);
  const tacticalPlanImpositionCount = countMatches(text, /\b(?:changer le systeme|plan tactique impose|tactique imposee par|il faut appliquer automatiquement|doit appliquer automatiquement)\b/giu);
  const sandboxPromotionCount = countMatches(text, /\bsandbox (?:officiel|promu|applique comme verite)\b/giu);
  const diagnosticPromotionCount = countMatches(text, /\bdiagnostic (?:officiel|promu|comme verite)\b/giu);
  const batchPromotionCount = countMatches(text, /\bbatch (?:officiel|promu|comme verite|prochain match)\b/giu);
  const boundaryNotesVisible = input.productHtml.includes("Pas de memoire de saison") &&
    input.productHtml.includes("Pas de decision automatique") &&
    input.productHtml.includes("Pas de resultat futur") &&
    input.exportHtml.includes("Pas une memoire de saison");
  const warnings: CoachReportSeasonlessLearningLoopObservationOutcomeTrackerWarningCode[] = [];

  if (seasonMemoryCreationCount > 0) warnings.push("SEASON_MEMORY_CREATED");
  if (teamStyleMemoryCreationCount > 0) warnings.push("TEAM_STYLE_MEMORY_CREATED");
  if (databasePersistenceCreationCount > 0) warnings.push("DATABASE_PERSISTENCE_CREATED");
  if (filePersistenceCreationCount > 0) warnings.push("FILE_PERSISTENCE_CREATED");
  if (automaticSelectionRecommendationCount > 0) warnings.push("SELECTION_IMPOSITION_DETECTED");
  if (tacticalPlanImpositionCount > 0) warnings.push("TACTICAL_PLAN_IMPOSITION_DETECTED");
  if (sandboxPromotionCount > 0) warnings.push("SANDBOX_LEARNING_PROMOTED");
  if (diagnosticPromotionCount > 0) warnings.push("DIAGNOSTIC_LEARNING_PROMOTED");
  if (batchPromotionCount > 0) warnings.push("BATCH_LEARNING_PROMOTED");
  if (!boundaryNotesVisible) warnings.push("SEASONLESS_LEARNING_LOOP_MISSING");

  return {
    seasonMemoryCreationCount,
    teamStyleMemoryCreationCount,
    databasePersistenceCreationCount,
    filePersistenceCreationCount,
    automaticSelectionRecommendationCount,
    tacticalPlanImpositionCount,
    sandboxPromotionCount,
    diagnosticPromotionCount,
    batchPromotionCount,
    boundaryNotesVisible,
    boundaryWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_SEASONLESS_BOUNDARIES" : "REPAIR_SEASONLESS_BOUNDARIES",
  };
}

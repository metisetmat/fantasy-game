import { countMatches } from "./storyFirstAuditUtils8H";
import type {
  ManualReviewIntakeValidationResult8N,
  ManualReviewResultIntakeBoundaryAudit8N,
} from "./manualReviewResultIntakeBoundaryTypes8N";
import type { ManualReviewResultIntakeBoundaryWarningCode8N } from "./manualReviewResultIntakeBoundaryWarnings8N";

export function auditManualReviewResultIntakeBoundary8N(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
  readonly invalidResults: readonly ManualReviewIntakeValidationResult8N[];
}): ManualReviewResultIntakeBoundaryAudit8N {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const lower = combined.toLowerCase();
  const acceptedErrorCount = (code: string): number =>
    input.invalidResults.filter((result) => result.status === "accepted_for_preview" && result.errors.some((error) => error.errorCode === code)).length;
  const seasonMemoryCreationCount = countMatches(combined, /\bcreateSeasonMemory\s*\(|\bcreateSeasonMemory\s*:\s*true\b|\bnew\s+SeasonMemory\b/giu);
  const teamStyleMemoryCreationCount = countMatches(combined, /\bcreateTeamStyleMemory\s*\(|\bcreateTeamStyleMemory\s*:\s*true\b|\bnew\s+TeamStyleMemory\b/giu);
  const databasePersistenceCreationCount = countMatches(combined, /\blocalStorage\.|indexedDB\s*\.|\bsqlite(?:3)?\s*\.\s*(?:run|exec|prepare)\s*\(|\bdb\s*\.\s*(?:run|exec|insert|save|write)\s*\(|\binsert\s+into\b|databasePersistence:\s*true/giu);
  const filePersistenceCreationCount = countMatches(combined, /\bwriteFile(?:Sync)?\s*\(|\bcreateWriteStream\s*\(|\bfs\s*\.\s*(?:writeFile|appendFile|createWriteStream)\s*\(|filePersistence:\s*true/giu);
  const localStoragePersistenceCount = countMatches(combined, /\blocalStorage\./giu);
  const backendSubmitActionCount = countMatches(combined, /fetch\s*\(\s*["'][^"']*\/api\/manual-review|axios\.\w+\s*\(\s*["'][^"']*\/api\/manual-review|<form\b[^>]*\baction=["'][^"']*\/api\/manual-review|method=["']post["']/giu);
  const formSubmitButtonCount = countMatches(combined, /<button\b[^>]*(submit|envoyer|soumettre)|<input\b[^>]*type="submit"/giu);
  const automaticSelectionRecommendationCount = countMatches(lower, /doit selectionner|selection automatique recommandee|automatic selection recommendation:\s*true/giu);
  const tacticalPlanImpositionCount = countMatches(lower, /plan tactique impose|must use this tactic/giu);
  const futureResultClaimCount = countMatches(lower, /sera confirme|sera infirme|future result confirmed|future result claim/giu);
  const fabricatedNextMatchEvidenceCount = countMatches(lower, /preuve future|next match evidence already|fabricated next match evidence/giu);
  const officialTruthPromotionCount = countMatches(lower, /promoted to official truth|devient verite officielle|officialtruth:\s*true/giu);
  const scoreMutationRequestAcceptedCount = acceptedErrorCount("SCORE_MUTATION_REQUESTED");
  const timelineMutationRequestAcceptedCount = acceptedErrorCount("TIMELINE_MUTATION_REQUESTED");
  const scoringEventCreationAcceptedCount = acceptedErrorCount("SCORING_EVENT_CREATION_REQUESTED");
  const sandboxPromotionCount = countMatches(lower, /sandbox.*official|manual intake promoted from sandbox/giu);
  const diagnosticPromotionCount = countMatches(lower, /diagnostic.*official|manual intake promoted from diagnostic/giu);
  const batchPromotionCount = countMatches(lower, /batch.*official|manual intake promoted from batch/giu);
  const boundaryNotesVisible = input.productHtml.includes("Intake contract only") &&
    input.productHtml.includes("pas verite officielle") &&
    input.exportHtml.includes("revue manuelle non officielle");
  const warnings: ManualReviewResultIntakeBoundaryWarningCode8N[] = [];

  if (seasonMemoryCreationCount > 0) warnings.push("SEASON_MEMORY_CREATED");
  if (teamStyleMemoryCreationCount > 0) warnings.push("TEAM_STYLE_MEMORY_CREATED");
  if (databasePersistenceCreationCount > 0) warnings.push("DATABASE_PERSISTENCE_CREATED");
  if (filePersistenceCreationCount > 0) warnings.push("FILE_PERSISTENCE_CREATED");
  if (localStoragePersistenceCount > 0) warnings.push("LOCAL_STORAGE_PERSISTENCE_DETECTED");
  if (backendSubmitActionCount > 0) warnings.push("BACKEND_SUBMIT_ACTION_DETECTED");
  if (formSubmitButtonCount > 0) warnings.push("SUBMIT_BUTTON_DETECTED");
  if (automaticSelectionRecommendationCount > 0) warnings.push("SELECTION_IMPOSITION_DETECTED");
  if (tacticalPlanImpositionCount > 0) warnings.push("TACTICAL_PLAN_IMPOSITION_DETECTED");
  if (futureResultClaimCount > 0) warnings.push("FUTURE_RESULT_CLAIM_DETECTED");
  if (fabricatedNextMatchEvidenceCount > 0) warnings.push("FABRICATED_NEXT_MATCH_EVIDENCE");
  if (officialTruthPromotionCount > 0) warnings.push("OFFICIAL_TRUTH_ACCEPTED");
  if (scoreMutationRequestAcceptedCount > 0) warnings.push("SCORE_MUTATION_ACCEPTED");
  if (timelineMutationRequestAcceptedCount > 0) warnings.push("TIMELINE_MUTATION_ACCEPTED");
  if (scoringEventCreationAcceptedCount > 0) warnings.push("SCORING_EVENT_MUTATION_ACCEPTED");
  if (sandboxPromotionCount > 0) warnings.push("SANDBOX_MANUAL_INTAKE_PROMOTED");
  if (diagnosticPromotionCount > 0) warnings.push("DIAGNOSTIC_MANUAL_INTAKE_PROMOTED");
  if (batchPromotionCount > 0) warnings.push("BATCH_MANUAL_INTAKE_PROMOTED");
  if (!boundaryNotesVisible) warnings.push("PRODUCT_MANUAL_INTAKE_BOUNDARY_MISSING");

  return {
    seasonMemoryCreationCount,
    teamStyleMemoryCreationCount,
    databasePersistenceCreationCount,
    filePersistenceCreationCount,
    localStoragePersistenceCount,
    backendSubmitActionCount,
    formSubmitButtonCount,
    automaticSelectionRecommendationCount,
    tacticalPlanImpositionCount,
    futureResultClaimCount,
    fabricatedNextMatchEvidenceCount,
    officialTruthPromotionCount,
    scoreMutationRequestAcceptedCount,
    timelineMutationRequestAcceptedCount,
    scoringEventCreationAcceptedCount,
    sandboxPromotionCount,
    diagnosticPromotionCount,
    batchPromotionCount,
    boundaryNotesVisible,
    boundaryWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_MANUAL_INTAKE_BOUNDARY" : "REPAIR_MANUAL_INTAKE_BOUNDARY",
  };
}

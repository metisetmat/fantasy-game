import { countMatches, stripTags } from "./storyFirstAuditUtils8H";
import type { ManualPostMatchBoundaryAudit8M } from "./manualPostMatchObservationReviewFormTypes8M";
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

export function auditManualPostMatchBoundary8M(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualPostMatchBoundaryAudit8M {
  const html = `${sectionHtml(input.productHtml, "manual-post-match-review-form-8m")}\n${sectionHtml(input.exportHtml, "manual-post-match-review-form-export-8m")}`;
  const text = stripTags(html);
  const submitButtonCount = countMatches(html, /<button\b[^>]*\btype=["']?submit\b/giu);
  const backendActionCount = countMatches(html, /\b(?:method=["']?post|action=["'][^"']+["']|fetch\s*\(|XMLHttpRequest)\b/giu);
  const localStorageCount = countMatches(html, /\blocalStorage\b/giu);
  const databasePersistenceCount = countMatches(text, /\b(?:base de donnees activee|database persistence created|sqlite active|db write)\b/giu);
  const filePersistenceCount = countMatches(text, /\b(?:fichier de suivi cree|file persistence created|stockage fichier active|ecrit dans un fichier)\b/giu);
  const automaticClassificationCount = countMatches(text, /\b(?:classification calculee|auto-classified|resultat automatique applique|classe automatiquement)\b/giu);
  const futureEvidenceClaimCount = countMatches(text, /\b(?:preuve du prochain match|prochain match confirme|prochain match infirme|resultat futur confirme)\b/giu);
  const fabricatedEvidenceCount = countMatches(text, /\b(?:evidence fabriquee|fait futur observe|future evidence)\b/giu);
  const seasonMemoryCount = countMatches(text, /\b(?:memoire de saison creee|team style memory created|tendance de saison officielle)\b/giu);
  const selectionInstructionCount = countMatches(text, /\b(?:selectionner tel joueur|composition recommandee|choisir ce titulaire)\b/giu);
  const tacticalInstructionCount = countMatches(text, /\b(?:changer le systeme|plan tactique impose|tactique imposee)\b/giu);
  const sandboxPromotionCount = countMatches(text, /\bsandbox (?:officiel|promu|applique comme verite)\b/giu);
  const diagnosticPromotionCount = countMatches(text, /\bdiagnostic (?:officiel|promu|comme verite)\b/giu);
  const batchPromotionCount = countMatches(text, /\bbatch (?:officiel|promu|comme verite|prochain match)\b/giu);
  const boundaryNotesVisible = input.productHtml.includes("Manuel uniquement") &&
    input.productHtml.includes("Sans memoire") &&
    input.productHtml.includes("Sans consigne") &&
    input.exportHtml.includes("pas une memoire d'equipe");
  const warnings: ManualPostMatchObservationReviewFormWarningCode8M[] = [];

  if (submitButtonCount > 0) warnings.push("SUBMIT_FLOW_DETECTED");
  if (backendActionCount > 0) warnings.push("BACKEND_ACTION_DETECTED");
  if (localStorageCount > 0) warnings.push("LOCAL_STORAGE_DETECTED");
  if (databasePersistenceCount > 0) warnings.push("DATABASE_PERSISTENCE_DETECTED");
  if (filePersistenceCount > 0) warnings.push("FILE_PERSISTENCE_DETECTED");
  if (automaticClassificationCount > 0) warnings.push("AUTOMATIC_OUTCOME_DETECTED");
  if (futureEvidenceClaimCount > 0) warnings.push("FUTURE_EVIDENCE_CLAIM_DETECTED");
  if (fabricatedEvidenceCount > 0) warnings.push("FABRICATED_EVIDENCE_DETECTED");
  if (seasonMemoryCount > 0) warnings.push("SEASON_MEMORY_CREATED");
  if (selectionInstructionCount > 0) warnings.push("SELECTION_IMPOSITION_DETECTED");
  if (tacticalInstructionCount > 0) warnings.push("TACTICAL_INSTRUCTION_DETECTED");
  if (sandboxPromotionCount > 0) warnings.push("SANDBOX_PROMOTION_DETECTED");
  if (diagnosticPromotionCount > 0) warnings.push("DIAGNOSTIC_PROMOTION_DETECTED");
  if (batchPromotionCount > 0) warnings.push("BATCH_PROMOTION_DETECTED");
  if (!boundaryNotesVisible) warnings.push("COACH_USABILITY_REGRESSED");

  return {
    submitButtonCount,
    backendActionCount,
    localStorageCount,
    databasePersistenceCount,
    filePersistenceCount,
    automaticClassificationCount,
    futureEvidenceClaimCount,
    fabricatedEvidenceCount,
    seasonMemoryCount,
    selectionInstructionCount,
    tacticalInstructionCount,
    sandboxPromotionCount,
    diagnosticPromotionCount,
    batchPromotionCount,
    boundaryNotesVisible,
    boundaryAuditWarningCodes: [...new Set(warnings)],
    recommendation: warnings.length === 0 ? "KEEP_MANUAL_BOUNDARIES" : "REPAIR_MANUAL_BOUNDARIES",
  };
}

import type { ManualReviewPreviewWordingAudit8O } from "./manualReviewPreviewRendererTypes8O";
import type { ManualReviewPreviewRendererWarningCode8O } from "./manualReviewPreviewRendererWarnings8O";

function countMatches(value: string, pattern: RegExp): number {
  return [...value.matchAll(pattern)].length;
}

export function auditManualReviewPreviewWording8O(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewWordingAudit8O {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const previewNonOfficialWordingVisible = combined.includes("non officielle") || combined.includes("non officiel");
  const demoFixtureWordingVisible = combined.includes("fixture de demonstration") || combined.includes("Preview demo");
  const noRealNextMatchClaimCount = countMatches(combined, /le prochain match a confirme|vrai prochain match confirme|real next match confirmed/giu);
  const noOfficialResultClaimCount = countMatches(combined, /resultat officiel de la preview|preview officielle|official preview result/giu);
  const noEngineLearningClaimCount = countMatches(combined, /moteur sait maintenant|engine learned|l'equipe a appris/giu);
  const noSeasonTrendClaimCount = countMatches(combined, /la tendance de saison est|season trend confirmed/giu);
  const noSelectionInstructionCount = countMatches(
    combined,
    /recommandation de selection officielle|selection recommandee|selection imposee active|selection imposee officiellement|doit selectionner|joueur a selectionner|titulaire conseille|remplacement conseille|composition recommandee/giu,
  );
  const noTacticalInstructionCount = countMatches(combined, /plan tactique a appliquer|consigne tactique imposee/giu);
  const ambiguousOutcomeWordingCount = countMatches(combined, /outcome officiel|confirmed officially|preuve du prochain match confirmee/giu);
  const wordingReadabilityScore = previewNonOfficialWordingVisible && demoFixtureWordingVisible ? 96 : 80;
  const warnings: ManualReviewPreviewRendererWarningCode8O[] = [];
  if (!previewNonOfficialWordingVisible) warnings.push("PREVIEW_NON_OFFICIAL_MARKER_MISSING");
  if (!demoFixtureWordingVisible) warnings.push("REAL_NEXT_MATCH_CLAIM_DETECTED");
  if (noRealNextMatchClaimCount > 0) warnings.push("REAL_NEXT_MATCH_CLAIM_DETECTED");
  if (noOfficialResultClaimCount > 0) warnings.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (noEngineLearningClaimCount > 0) warnings.push("ENGINE_LEARNING_CLAIM_DETECTED");
  if (noSelectionInstructionCount > 0) warnings.push("SELECTION_IMPOSITION_DETECTED");
  if (noTacticalInstructionCount > 0) warnings.push("TACTICAL_PLAN_IMPOSITION_DETECTED");
  if (ambiguousOutcomeWordingCount > 0) warnings.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");

  return {
    previewNonOfficialWordingVisible,
    demoFixtureWordingVisible,
    noRealNextMatchClaimCount,
    noOfficialResultClaimCount,
    noEngineLearningClaimCount,
    noSeasonTrendClaimCount,
    noSelectionInstructionCount,
    noTacticalInstructionCount,
    ambiguousOutcomeWordingCount,
    wordingReadabilityScore,
    wordingWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_PREVIEW_WORDING" : "REPAIR_PREVIEW_WORDING",
  };
}

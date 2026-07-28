import type { ManualReviewPreviewOfficialTruthBoundaryAudit8O } from "./manualReviewPreviewRendererTypes8O";
import type { ManualReviewPreviewRendererWarningCode8O } from "./manualReviewPreviewRendererWarnings8O";

function countMatches(value: string, pattern: RegExp): number {
  return [...value.matchAll(pattern)].length;
}

export function auditManualReviewPreviewOfficialTruthBoundary8O(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): ManualReviewPreviewOfficialTruthBoundaryAudit8O {
  const combined = `${input.productHtml}\n${input.exportHtml}`;
  const previewStart = combined.indexOf("manual-review-preview");
  const previewSlice = previewStart < 0 ? "" : combined.slice(previewStart);
  const officialTruthPromotionCount = countMatches(previewSlice, /officialTruth:\s*true|devient une verite officielle|est une verite officielle|official truth promoted/giu);
  const coachInputPromotedToOfficialTruthCount = countMatches(previewSlice, /coach input promoted to official truth|saisie coach promue en verite officielle/giu);
  const previewClaimedAsRealNextMatchCount = countMatches(previewSlice, /le prochain match a confirme|real next match confirmed/giu);
  const previewClaimedAsEngineResultCount = countMatches(previewSlice, /moteur sait maintenant|engine result confirmed/giu);
  const previewClaimedAsSeasonTrendCount = countMatches(previewSlice, /la tendance de saison est|season trend confirmed/giu);
  const previewClaimedAsTeamMemoryCount = countMatches(previewSlice, /team memory created|team style memory created|memoire d'equipe creee/giu);
  const automaticClassificationCount = countMatches(previewSlice, /auto-classification active|classification automatique active/giu);
  const selectionRecommendationCount = countMatches(previewSlice, /recommandation de selection|selection imposee|a selectionner/giu);
  const tacticalInstructionCount = countMatches(previewSlice, /plan tactique a appliquer|consigne tactique imposee/giu);
  const sandboxPromotionCount = countMatches(previewSlice, /sandbox promu en officiel|official sandbox truth/giu);
  const diagnosticPromotionCount = countMatches(previewSlice, /diagnostic promu en officiel|official diagnostic truth/giu);
  const batchPromotionCount = countMatches(previewSlice, /batch promu en officiel|official batch truth/giu);
  const warnings: ManualReviewPreviewRendererWarningCode8O[] = [];
  if (officialTruthPromotionCount > 0 || coachInputPromotedToOfficialTruthCount > 0) warnings.push("OFFICIAL_TRUTH_PROMOTION_DETECTED");
  if (previewClaimedAsRealNextMatchCount > 0) warnings.push("REAL_NEXT_MATCH_CLAIM_DETECTED");
  if (previewClaimedAsEngineResultCount > 0) warnings.push("ENGINE_LEARNING_CLAIM_DETECTED");
  if (selectionRecommendationCount > 0) warnings.push("SELECTION_IMPOSITION_DETECTED");
  if (tacticalInstructionCount > 0) warnings.push("TACTICAL_PLAN_IMPOSITION_DETECTED");
  if (sandboxPromotionCount > 0) warnings.push("SANDBOX_PREVIEW_PROMOTED");
  if (diagnosticPromotionCount > 0) warnings.push("DIAGNOSTIC_PREVIEW_PROMOTED");
  if (batchPromotionCount > 0) warnings.push("BATCH_PREVIEW_PROMOTED");

  return {
    officialTruthPromotionCount,
    coachInputPromotedToOfficialTruthCount,
    previewClaimedAsRealNextMatchCount,
    previewClaimedAsEngineResultCount,
    previewClaimedAsSeasonTrendCount,
    previewClaimedAsTeamMemoryCount,
    automaticClassificationCount,
    selectionRecommendationCount,
    tacticalInstructionCount,
    sandboxPromotionCount,
    diagnosticPromotionCount,
    batchPromotionCount,
    officialTruthBoundaryWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_PREVIEW_NON_OFFICIAL" : "REPAIR_OFFICIAL_TRUTH_BOUNDARY",
  };
}

import { countMatches, stripTags } from "./storyFirstAuditUtils8H";
import type { DecisionBoundaryAudit8K } from "./coachReportDecisionLayerNextMatchObservationPlanTypes8K";
import type { CoachReportDecisionLayerNextMatchObservationPlanWarningCode } from "./coachReportDecisionLayerNextMatchObservationPlanWarnings";

export function auditDecisionBoundary8K(input: {
  readonly productHtml: string;
  readonly exportHtml: string;
}): DecisionBoundaryAudit8K {
  const decisionText = stripTags(`${input.productHtml}\n${input.exportHtml}`)
    .replace(/\bpas de selection imposee\b/giu, "frontiere selection")
    .replace(/\bne force ni selection\b/giu, "frontiere selection")
    .replace(/\bne remplace pas une decision de selection\b/giu, "frontiere selection");
  const warnings: CoachReportDecisionLayerNextMatchObservationPlanWarningCode[] = [];
  const selectionImpositionCount = countMatches(decisionText, /\b(?:il faut selectionner|doit selectionner|selection imposee|choisir automatiquement)\b/giu);
  const tacticalPlanImpositionCount = countMatches(decisionText, /\b(?:il faut jouer|doit jouer|plan tactique impose|systeme impose)\b/giu);
  const automaticLineupRecommendationCount = countMatches(decisionText, /\b(?:composition imposee|onze impose|titulaire impose|aligner automatiquement)\b/giu);
  const sandboxPromotionCount = countMatches(decisionText, /\bsandbox (?:officiel|devient officiel|comme verite)\b/giu);
  const diagnosticPromotionCount = countMatches(decisionText, /\bdiagnostic (?:officiel|devient officiel|comme verite)\b/giu);
  const batchPromotionCount = countMatches(decisionText, /\bbatch (?:officiel|devient officiel|comme verite)\b/giu);
  const overclaimCount = countMatches(decisionText, /\b(?:preuve definitive|demontre definitivement|garantit le prochain match)\b/giu);
  const singleMatchOverfitCount = countMatches(decisionText, /\bun seul match suffit\b/giu);
  const boundaryNotesVisible = input.productHtml.includes("Frontieres") &&
    input.productHtml.includes("Pas de selection imposee") &&
    input.exportHtml.includes("pas consigne de selection");

  if (selectionImpositionCount > 0) warnings.push("SELECTION_IMPOSITION_DETECTED");
  if (tacticalPlanImpositionCount > 0) warnings.push("TACTICAL_PLAN_IMPOSITION_DETECTED");
  if (automaticLineupRecommendationCount > 0) warnings.push("AUTOMATIC_LINEUP_RECOMMENDATION_DETECTED");
  if (sandboxPromotionCount > 0) warnings.push("SANDBOX_DECISION_PROMOTED");
  if (diagnosticPromotionCount > 0) warnings.push("DIAGNOSTIC_DECISION_PROMOTED");
  if (batchPromotionCount > 0) warnings.push("BATCH_DECISION_PROMOTED");

  return {
    selectionImpositionCount,
    tacticalPlanImpositionCount,
    automaticLineupRecommendationCount,
    sandboxPromotionCount,
    diagnosticPromotionCount,
    batchPromotionCount,
    overclaimCount,
    singleMatchOverfitCount,
    boundaryNotesVisible,
    decisionBoundaryWarningCodes: warnings,
    recommendation: warnings.length === 0 && boundaryNotesVisible ? "KEEP_DECISION_BOUNDARIES" : "REPAIR_DECISION_BOUNDARIES",
  };
}

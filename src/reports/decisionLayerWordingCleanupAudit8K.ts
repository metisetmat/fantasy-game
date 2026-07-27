import { countMatches, stripTags } from "./storyFirstAuditUtils8H";
import type { DecisionLayerWordingCleanupAudit8K } from "./coachReportDecisionLayerNextMatchObservationPlanTypes8K";
import type { CoachReportDecisionLayerNextMatchObservationPlanWarningCode } from "./coachReportDecisionLayerNextMatchObservationPlanWarnings";

function withoutDetails(html: string): string {
  return html.replace(/<details\b[\s\S]*?<\/details>/giu, " ");
}

function section(html: string, sectionId: string): string {
  const marker = `id="${sectionId}"`;
  const index = html.indexOf(marker);
  if (index < 0) return "";
  const start = html.lastIndexOf("<section", index);
  if (start < 0) return "";
  const next = html.indexOf("</section>", index);
  return next < 0 ? html.slice(start) : html.slice(start, next + "</section>".length);
}

export function auditDecisionLayerWordingCleanup8K(input: {
  readonly productHtmlBefore8K: string;
  readonly productHtmlAfter8K: string;
  readonly exportHtmlAfter8K: string;
}): DecisionLayerWordingCleanupAudit8K {
  const warnings: CoachReportDecisionLayerNextMatchObservationPlanWarningCode[] = [];
  const replayExport = section(input.exportHtmlAfter8K, "coach-replay-8e");
  const decisionLayer = section(input.productHtmlAfter8K, "coach-decision-layer-8k");
  const productMainBefore = stripTags(withoutDetails(input.productHtmlBefore8K));
  const productMainAfter = stripTags(withoutDetails(input.productHtmlAfter8K).replace(decisionLayer, " "));
  const replayExportDuplicateTitleCount = countMatches(replayExport, /CONTROL frappe le premier CONTROL frappe le premier|BLITZ repond BLITZ|CONTROL verrouille le 12 - 7 Le/giu);
  const replayExportTruncatedSentenceCount = countMatches(replayExport, /\.{3}|…|\b(?:le|la|de|du|des|avec|dans|et|vers|devient)\s*(?:<\/li>|<\/p>)/giu);
  const replayExportMechanicalPhraseCount = countMatches(replayExport, /pese sur|score_created|sequence_actor_contribution_8d/giu);
  const productRawIdMainTextCountBefore8K = countMatches(productMainBefore, /\b(?:contract-fixture-|full-match-|event-|rc-)[a-z0-9_-]+\b|\bscore_created\b/giu);
  const rawEventIdInProductMainTextCount = countMatches(productMainAfter, /\b(?:contract-fixture-|full-match-|event-)[a-z0-9_-]+\b/giu);
  const rawPlayerIdInProductMainTextCount = countMatches(productMainAfter, /\brc-[a-z0-9_-]+\b/giu);
  const rawEffectLabelInProductMainTextCount = countMatches(productMainAfter, /\bscore_created|sequence_actor_contribution_8d\b/giu);
  const productRawIdMainTextCountAfter8K = rawEventIdInProductMainTextCount + rawPlayerIdInProductMainTextCount + rawEffectLabelInProductMainTextCount;
  const technicalLabelInDecisionLayerCount = countMatches(decisionLayer, /\bscore_created|sequence_actor_contribution_8d|contract-fixture-|rc-\b/giu);
  const decisionLayerMechanicalPhraseCount = countMatches(decisionLayer, /pese sur|preuve definitive|il faut selectionner|il faut jouer/giu);
  const penalty = replayExportDuplicateTitleCount +
    replayExportTruncatedSentenceCount +
    replayExportMechanicalPhraseCount +
    productRawIdMainTextCountAfter8K +
    technicalLabelInDecisionLayerCount +
    decisionLayerMechanicalPhraseCount;
  const decisionLayerCoachReadabilityScore = Math.max(0, 96 - penalty * 8);

  if (replayExportDuplicateTitleCount > 0) warnings.push("REPLAY_EXPORT_DUPLICATE_TITLE");
  if (replayExportTruncatedSentenceCount > 0) warnings.push("REPLAY_EXPORT_TRUNCATED_SENTENCE");
  if (productRawIdMainTextCountAfter8K > 0) warnings.push("PRODUCT_RAW_ID_MAIN_TEXT_REMAINING");
  if (rawEventIdInProductMainTextCount > 0) warnings.push("RAW_EVENT_ID_IN_MAIN_TEXT");
  if (rawPlayerIdInProductMainTextCount > 0) warnings.push("RAW_PLAYER_ID_IN_MAIN_TEXT");
  if (rawEffectLabelInProductMainTextCount > 0) warnings.push("RAW_EFFECT_LABEL_IN_MAIN_TEXT");
  if (technicalLabelInDecisionLayerCount > 0) warnings.push("TECHNICAL_LABEL_IN_DECISION_LAYER");

  return {
    replayExportDuplicateTitleCount,
    replayExportTruncatedSentenceCount,
    replayExportMechanicalPhraseCount,
    productRawIdMainTextCountBefore8K,
    productRawIdMainTextCountAfter8K,
    rawEventIdInProductMainTextCount,
    rawPlayerIdInProductMainTextCount,
    rawEffectLabelInProductMainTextCount,
    technicalLabelInDecisionLayerCount,
    decisionLayerMechanicalPhraseCount,
    decisionLayerCoachReadabilityScore,
    wordingCleanupWarningCodes: warnings,
    recommendation: warnings.length === 0 ? "KEEP_DECISION_LAYER_WORDING" : "REPAIR_DECISION_LAYER_WORDING",
  };
}

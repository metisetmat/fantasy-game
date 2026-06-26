import type { CoachTacticalMapCard } from "./coachReportTacticalMapCards";
import type { CoachReportPhaseVisualsTacticalMapCardsWarningCode } from "./coachReportPhaseVisualsTacticalMapCardsWarnings";

export interface CoachReportTacticalMapCardsAudit {
  readonly tacticalMapCardCount: number;
  readonly officialTacticalMapCardCount: number;
  readonly diagnosticTacticalMapCardCount: number;
  readonly sandboxTacticalMapCardCount: number;
  readonly visibleMapCardCount: number;
  readonly collapsedMapCardCount: number;
  readonly mapCardWithSourceCount: number;
  readonly mapCardWithConfidenceCount: number;
  readonly mapCardWithLegendCount: number;
  readonly mapCardWithActionPlanLinkCount: number;
  readonly mapCardWithNextMatchCheckCount: number;
  readonly mapCardWithLimitationCount: number;
  readonly mapCardWithInsufficientDataStateCount: number;
  readonly unsupportedMapCardCount: number;
  readonly sandboxMapCardInOfficialBodyCount: number;
  readonly overconfidentMapCardCount: number;
  readonly tacticalMapCardsWarningCodes: readonly CoachReportPhaseVisualsTacticalMapCardsWarningCode[];
  readonly recommendation: "KEEP_TACTICAL_MAP_CARDS" | "REDUCE_VISUAL_CARD_COUNT" | "IMPROVE_VISUAL_CARD_SOURCE_LABELS" | "FIX_VISUAL_CARD_TRUTH_BOUNDARY";
}

export function auditCoachReportTacticalMapCards(input: {
  readonly cards: readonly CoachTacticalMapCard[];
  readonly productReportHtml: string;
}): CoachReportTacticalMapCardsAudit {
  const tacticalMapCardCount = input.cards.length;
  const officialTacticalMapCardCount = input.cards.filter((card) => card.sourceType === "official").length;
  const diagnosticTacticalMapCardCount = input.cards.filter((card) => card.sourceType === "diagnostic").length;
  const sandboxTacticalMapCardCount = input.cards.filter((card) => card.sourceType === "sandbox").length;
  const visibleMapCardCount = input.cards.filter((card) => !card.collapsedByDefault).length;
  const collapsedMapCardCount = input.cards.filter((card) => card.collapsedByDefault).length;
  const mapCardWithSourceCount = input.cards.filter((card) => card.sourceType.length > 0).length;
  const mapCardWithConfidenceCount = input.cards.filter((card) => card.confidence.length > 0).length;
  const mapCardWithLegendCount = input.cards.filter((card) => card.visualLegend.length > 0).length;
  const mapCardWithActionPlanLinkCount = input.cards.filter((card) => card.linkedActionPlanCardId.length > 0 && card.coachingUse.length > 0).length;
  const mapCardWithNextMatchCheckCount = input.cards.filter((card) => card.nextMatchCheck.length > 0).length;
  const mapCardWithLimitationCount = input.cards.filter((card) => card.limitationNote.length > 0).length;
  const mapCardWithInsufficientDataStateCount = input.cards.filter((card) => card.insufficientDataState).length;
  const unsupportedMapCardCount = input.cards.filter((card) =>
    card.sourceType === "official" && card.affectedZones.length === 0 && !card.insufficientDataState
  ).length;
  const sandboxMapCardInOfficialBodyCount = input.cards.filter((card) => card.sourceType === "sandbox" && !card.collapsedByDefault).length;
  const overconfidentMapCardCount = input.cards.filter((card) => card.confidence === "high" && card.insufficientDataState).length;
  const cardsReady = tacticalMapCardCount >= 2 &&
    tacticalMapCardCount <= 3 &&
    visibleMapCardCount <= 3 &&
    mapCardWithSourceCount === tacticalMapCardCount &&
    mapCardWithConfidenceCount === tacticalMapCardCount &&
    mapCardWithLegendCount === tacticalMapCardCount &&
    mapCardWithActionPlanLinkCount === tacticalMapCardCount &&
    mapCardWithNextMatchCheckCount === tacticalMapCardCount &&
    mapCardWithLimitationCount === tacticalMapCardCount &&
    unsupportedMapCardCount === 0 &&
    sandboxMapCardInOfficialBodyCount === 0 &&
    overconfidentMapCardCount === 0 &&
    input.productReportHtml.includes("id=\"tactical-map-cards\"");
  const tacticalMapCardsWarningCodes: CoachReportPhaseVisualsTacticalMapCardsWarningCode[] = [
    ...(cardsReady ? ["TACTICAL_MAP_CARDS_READY" as const] : ["COACH_REPORT_PHASE_VISUALS_PARTIAL" as const]),
    ...(officialTacticalMapCardCount > 0 ? ["OFFICIAL_VISUAL_CARDS_READY" as const] : []),
    ...(mapCardWithLegendCount === tacticalMapCardCount ? ["VISUAL_LEGENDS_READY" as const] : ["VISUAL_LEGEND_MISSING" as const]),
    ...(mapCardWithSourceCount === tacticalMapCardCount ? ["VISUAL_SOURCE_BADGES_READY" as const] : ["VISUAL_SOURCE_BADGE_MISSING" as const]),
    ...(mapCardWithConfidenceCount === tacticalMapCardCount ? ["VISUAL_CONFIDENCE_BADGES_READY" as const] : ["VISUAL_CONFIDENCE_BADGE_MISSING" as const]),
    ...(mapCardWithActionPlanLinkCount === tacticalMapCardCount ? ["VISUAL_ACTION_PLAN_LINKS_READY" as const] : ["VISUAL_ACTION_PLAN_LINK_MISSING" as const]),
    ...(mapCardWithNextMatchCheckCount === tacticalMapCardCount ? ["VISUAL_NEXT_MATCH_CHECKS_READY" as const] : ["VISUAL_NEXT_MATCH_CHECK_MISSING" as const]),
    ...(mapCardWithInsufficientDataStateCount > 0 ? ["EMPTY_STATE_VISUAL_USED_CORRECTLY" as const] : []),
    ...(tacticalMapCardCount > 3 ? ["TOO_MANY_VISUAL_CARDS" as const] : []),
    ...(unsupportedMapCardCount > 0 ? ["UNSUPPORTED_VISUAL_CLAIM" as const] : []),
    ...(overconfidentMapCardCount > 0 ? ["OVERCONFIDENT_VISUAL_CLAIM" as const] : []),
    ...(sandboxMapCardInOfficialBodyCount > 0 ? ["SANDBOX_VISUAL_IN_OFFICIAL_BODY" as const] : []),
  ];

  return {
    tacticalMapCardCount,
    officialTacticalMapCardCount,
    diagnosticTacticalMapCardCount,
    sandboxTacticalMapCardCount,
    visibleMapCardCount,
    collapsedMapCardCount,
    mapCardWithSourceCount,
    mapCardWithConfidenceCount,
    mapCardWithLegendCount,
    mapCardWithActionPlanLinkCount,
    mapCardWithNextMatchCheckCount,
    mapCardWithLimitationCount,
    mapCardWithInsufficientDataStateCount,
    unsupportedMapCardCount,
    sandboxMapCardInOfficialBodyCount,
    overconfidentMapCardCount,
    tacticalMapCardsWarningCodes,
    recommendation: cardsReady
      ? "KEEP_TACTICAL_MAP_CARDS"
      : tacticalMapCardCount > 3
        ? "REDUCE_VISUAL_CARD_COUNT"
        : sandboxMapCardInOfficialBodyCount > 0 || overconfidentMapCardCount > 0
          ? "FIX_VISUAL_CARD_TRUTH_BOUNDARY"
          : "IMPROVE_VISUAL_CARD_SOURCE_LABELS",
  };
}

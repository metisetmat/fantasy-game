import type { CoachTrendSignalCard } from "./coachReportMultiMatchTrendSignals";
import type { CoachReportMultiMatchComparisonTrendSignalsWarningCode } from "./coachReportMultiMatchComparisonTrendSignalsWarnings";

export interface CoachReportMultiMatchTrendSignalsAudit {
  readonly trendSignalCardCount: number;
  readonly repeatedTrendSignalCount: number;
  readonly visibleOnceTrendSignalCount: number;
  readonly unstableTrendSignalCount: number;
  readonly insufficientDataTrendSignalCount: number;
  readonly officialTrendSignalCount: number;
  readonly diagnosticTrendSignalCount: number;
  readonly sandboxTrendSignalCount: number;
  readonly trendSignalWithSampleCount: number;
  readonly trendSignalWithPresenceCount: number;
  readonly trendSignalWithNextMatchCheckCount: number;
  readonly trendSignalWithLimitationCount: number;
  readonly trendSignalWithSourceSummaryCount: number;
  readonly trendSignalWithActionPlanLinkCount: number;
  readonly unsupportedTrendClaimCount: number;
  readonly overconfidentTrendClaimCount: number;
  readonly forcedSelectionTrendCount: number;
  readonly forcedTacticalPlanTrendCount: number;
  readonly sandboxTrendInOfficialBodyCount: number;
  readonly trendSignalsWarningCodes: readonly CoachReportMultiMatchComparisonTrendSignalsWarningCode[];
  readonly recommendation: "KEEP_TREND_SIGNALS" | "REDUCE_TREND_DENSITY" | "FIX_TREND_PRUDENCE";
}

function cardText(card: CoachTrendSignalCard): string {
  return [
    card.title,
    card.observation,
    card.coachMeaning,
    card.whyItMatters,
    card.nextMatchCheck,
    card.riskOfOverInterpretation,
    card.limitationNote,
    card.sourceSummary,
  ].join("\n");
}

function matchesForbidden(text: string, pattern: RegExp): number {
  return (text.match(pattern) ?? []).length;
}

export function auditCoachReportMultiMatchTrendSignals(input: {
  readonly trendCards: readonly CoachTrendSignalCard[];
  readonly productReportHtml: string;
}): CoachReportMultiMatchTrendSignalsAudit {
  const cards = input.trendCards;
  const visibleCards = cards.filter((card) => card.visibleInMainBody);
  const allText = cards.map(cardText).join("\n");
  const unsupportedTrendClaimCount = matchesForbidden(allText, /preuve d.finitive|v.rit. globale|tendance garantie|historique d.cide|DB confirme|SQLite prouve/giu);
  const overconfidentTrendClaimCount = matchesForbidden(allText, /\btoujours\b|\bgaranti\b|tendance garantie|preuve definitive/giu);
  const forcedSelectionTrendCount = matchesForbidden(allText, /doit s.lectionner|composition recommand.e|s.lection impos.e/giu);
  const forcedTacticalPlanTrendCount = matchesForbidden(allText, /plan tactique impos.|consigne automatique impos.e/giu);
  const sandboxTrendInOfficialBodyCount = visibleCards.filter((card) => card.sourceType === "sandbox").length;
  const trendSignalWithLimitationCount = cards.filter((card) => card.limitationNote.length > 0 && /echantillons disponibles|match courant uniquement|donnee insuffisante|volume insuffisant|pas une conclusion generale|ne remplace pas/iu.test(card.limitationNote)).length;
  const trendSignalWithNextMatchCheckCount = cards.filter((card) => /prochain match|A verifier|verifier/iu.test(card.nextMatchCheck)).length;
  const clean = input.productReportHtml.includes("id=\"multi-match-trend-signals\"") &&
    visibleCards.length >= 1 &&
    visibleCards.length <= 3 &&
    trendSignalWithLimitationCount === cards.length &&
    trendSignalWithNextMatchCheckCount === cards.length &&
    unsupportedTrendClaimCount === 0 &&
    overconfidentTrendClaimCount === 0 &&
    forcedSelectionTrendCount === 0 &&
    forcedTacticalPlanTrendCount === 0 &&
    sandboxTrendInOfficialBodyCount === 0;

  return {
    trendSignalCardCount: visibleCards.length,
    repeatedTrendSignalCount: cards.filter((card) => card.trendType === "repeated").length,
    visibleOnceTrendSignalCount: cards.filter((card) => card.trendType === "visible_once").length,
    unstableTrendSignalCount: cards.filter((card) => card.trendType === "unstable").length,
    insufficientDataTrendSignalCount: cards.filter((card) => card.trendType === "insufficient_data").length,
    officialTrendSignalCount: cards.filter((card) => card.sourceType === "official").length,
    diagnosticTrendSignalCount: cards.filter((card) => card.sourceType === "diagnostic").length,
    sandboxTrendSignalCount: cards.filter((card) => card.sourceType === "sandbox").length,
    trendSignalWithSampleCount: cards.filter((card) => card.sampleCount > 0).length,
    trendSignalWithPresenceCount: cards.filter((card) => card.presentCount >= 0 && card.absentCount >= 0).length,
    trendSignalWithNextMatchCheckCount,
    trendSignalWithLimitationCount,
    trendSignalWithSourceSummaryCount: cards.filter((card) => card.sourceSummary.length > 0).length,
    trendSignalWithActionPlanLinkCount: cards.filter((card) => card.linkedActionPlanCardIds.length > 0).length,
    unsupportedTrendClaimCount,
    overconfidentTrendClaimCount,
    forcedSelectionTrendCount,
    forcedTacticalPlanTrendCount,
    sandboxTrendInOfficialBodyCount,
    trendSignalsWarningCodes: [
      ...(clean ? ["TREND_SIGNALS_READY" as const, "MULTI_MATCH_COMPARISON_READY" as const] : ["COACH_REPORT_MULTI_MATCH_TRENDS_PARTIAL" as const]),
      ...(input.productReportHtml.includes("id=\"multi-match-trend-signals\"") ? [] : ["TREND_SECTION_MISSING" as const]),
      ...(visibleCards.length <= 3 ? [] : ["TOO_MANY_TREND_CARDS" as const]),
      ...(trendSignalWithLimitationCount === cards.length ? [] : ["TREND_LIMITATION_MISSING" as const]),
      ...(trendSignalWithNextMatchCheckCount === cards.length ? [] : ["TREND_NEXT_MATCH_CHECK_MISSING" as const]),
      ...(overconfidentTrendClaimCount === 0 ? [] : ["OVERCONFIDENT_TREND_CLAIM" as const]),
      ...(unsupportedTrendClaimCount === 0 ? [] : ["GLOBAL_PROOF_CLAIM_DETECTED" as const]),
      ...(forcedSelectionTrendCount === 0 ? [] : ["HISTORY_USED_AS_SELECTION_TRUTH" as const]),
      ...(forcedTacticalPlanTrendCount === 0 ? [] : ["FORBIDDEN_WORDING_DETECTED" as const]),
      ...(sandboxTrendInOfficialBodyCount === 0 ? [] : ["SANDBOX_TREND_IN_OFFICIAL_BODY" as const]),
    ],
    recommendation: clean ? "KEEP_TREND_SIGNALS" : visibleCards.length > 3 ? "REDUCE_TREND_DENSITY" : "FIX_TREND_PRUDENCE",
  };
}

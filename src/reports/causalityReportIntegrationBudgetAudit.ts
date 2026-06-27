import { extractSection, readTimeSecondsFromHtml } from "./coachReportHtmlAuditUtils";

export interface CausalityReportIntegrationBudgetAudit {
  readonly productCausalitySectionVisible: boolean;
  readonly exportCausalitySectionVisible: boolean;
  readonly productStoryStillVisible: boolean;
  readonly exportStoryStillVisible: boolean;
  readonly actionPlanStillVisible: boolean;
  readonly tacticalMapCardsStillVisible: boolean;
  readonly trendsStillVisible: boolean;
  readonly exportReadTimeSecondsBefore8C: number;
  readonly exportReadTimeSecondsAfter8C: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportCausalityCardCount: number;
  readonly productCausalityCardCount: number;
  readonly causalityExportTooLong: boolean;
  readonly reportIntegrationWarningCodes: readonly string[];
  readonly recommendation: string;
}

function countCards(sectionHtml: string): number {
  const articles = (sectionHtml.match(/<article\b/giu) ?? []).length;
  const listItems = (sectionHtml.match(/<li\b/giu) ?? []).length;

  return articles > 1 ? articles : listItems;
}

export function auditCausalityReportIntegrationBudget(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly exportReadTimeSecondsBefore8C: number;
}): CausalityReportIntegrationBudgetAudit {
  const productCausality = extractSection(input.productReportHtml, "official-causality-8c");
  const exportCausality = extractSection(input.exportReportHtml, "official-causality-8c");
  const exportReadTimeSecondsAfter8C = readTimeSecondsFromHtml(input.exportReportHtml);
  const exportCausalityCardCount = countCards(exportCausality);
  const productCausalityCardCount = countCards(productCausality);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8C <= 900;
  const causalityExportTooLong = exportCausalityCardCount > 3 || !exportUnder900Seconds;

  return {
    productCausalitySectionVisible: productCausality.length > 0,
    exportCausalitySectionVisible: exportCausality.length > 0,
    productStoryStillVisible: extractSection(input.productReportHtml, "official-match-story-spine").length > 0,
    exportStoryStillVisible: extractSection(input.exportReportHtml, "official-match-story-spine").length > 0,
    actionPlanStillVisible: extractSection(input.exportReportHtml, "coach-action-plan").length > 0 || input.exportReportHtml.includes("Action plan"),
    tacticalMapCardsStillVisible: extractSection(input.exportReportHtml, "tactical-map-cards").length > 0 || input.exportReportHtml.includes("Cartes tactiques"),
    trendsStillVisible: extractSection(input.exportReportHtml, "multi-match-trend-signals").length > 0 || input.exportReportHtml.includes("tendance"),
    exportReadTimeSecondsBefore8C: input.exportReadTimeSecondsBefore8C,
    exportReadTimeSecondsAfter8C,
    exportReadTimeDelta: exportReadTimeSecondsAfter8C - input.exportReadTimeSecondsBefore8C,
    exportUnder900Seconds,
    exportCausalityCardCount,
    productCausalityCardCount,
    causalityExportTooLong,
    reportIntegrationWarningCodes: [
      ...(productCausality.length > 0 ? [] : ["PRODUCT_CAUSALITY_SECTION_MISSING"]),
      ...(exportCausality.length > 0 ? [] : ["EXPORT_CAUSALITY_SECTION_MISSING"]),
      ...(exportUnder900Seconds ? [] : ["EXPORT_LENGTH_REGRESSED"]),
      ...(exportCausalityCardCount <= 3 ? [] : ["CAUSALITY_EXPORT_TOO_LONG"]),
      ...(productCausalityCardCount <= 6 ? [] : ["PRODUCT_CAUSALITY_TOO_LONG"]),
    ],
    recommendation: !causalityExportTooLong && productCausality.length > 0 && exportCausality.length > 0
      ? "KEEP_COMPACT_CAUSALITY_EXPORT"
      : "CAUSALITY_EXPORT_BUDGET_CLEANUP",
  };
}

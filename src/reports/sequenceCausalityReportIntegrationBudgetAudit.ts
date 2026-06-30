import { extractSection, readTimeSecondsFromHtml } from "./coachReportHtmlAuditUtils";

export interface SequenceCausalityReportIntegrationBudgetAudit {
  readonly productSequenceCausalitySectionVisible: boolean;
  readonly exportSequenceCausalitySectionVisible: boolean;
  readonly productStoryStillVisible: boolean;
  readonly exportStoryStillVisible: boolean;
  readonly actionPlanStillVisible: boolean;
  readonly tacticalMapCardsStillVisible: boolean;
  readonly trendsStillVisible: boolean;
  readonly exportReadTimeSecondsBefore8D: number;
  readonly exportReadTimeSecondsAfter8D: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportSequenceCardCount: number;
  readonly productSequenceCardCount: number;
  readonly reportIntegrationWarningCodes: readonly string[];
  readonly recommendation: string;
}

function cardCount(section: string): number {
  return (section.match(/<article\b/giu) ?? []).length || (section.match(/<li\b/giu) ?? []).length;
}

export function auditSequenceCausalityReportIntegrationBudget(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly exportReadTimeSecondsBefore8D: number;
}): SequenceCausalityReportIntegrationBudgetAudit {
  const productSection = extractSection(input.productReportHtml, "sequence-causality-8d");
  const exportSection = extractSection(input.exportReportHtml, "sequence-causality-8d");
  const exportReadTimeSecondsAfter8D = readTimeSecondsFromHtml(input.exportReportHtml);
  const productSequenceCardCount = cardCount(productSection);
  const exportSequenceCardCount = cardCount(exportSection);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8D <= 900;
  const clean = productSection.length > 0 &&
    exportSection.length > 0 &&
    exportUnder900Seconds &&
    exportSequenceCardCount <= 2 &&
    productSequenceCardCount >= 3 &&
    productSequenceCardCount <= 5;

  return {
    productSequenceCausalitySectionVisible: productSection.length > 0,
    exportSequenceCausalitySectionVisible: exportSection.length > 0,
    productStoryStillVisible: extractSection(input.productReportHtml, "official-match-story-spine").length > 0,
    exportStoryStillVisible: extractSection(input.exportReportHtml, "official-match-story-spine").length > 0,
    actionPlanStillVisible: extractSection(input.exportReportHtml, "coach-action-plan").length > 0 || input.exportReportHtml.includes("Action plan"),
    tacticalMapCardsStillVisible: extractSection(input.exportReportHtml, "tactical-map-cards").length > 0 || input.exportReportHtml.includes("Cartes tactiques"),
    trendsStillVisible: extractSection(input.exportReportHtml, "multi-match-trend-signals").length > 0 || input.exportReportHtml.includes("tendance"),
    exportReadTimeSecondsBefore8D: input.exportReadTimeSecondsBefore8D,
    exportReadTimeSecondsAfter8D,
    exportReadTimeDelta: exportReadTimeSecondsAfter8D - input.exportReadTimeSecondsBefore8D,
    exportUnder900Seconds,
    exportSequenceCardCount,
    productSequenceCardCount,
    reportIntegrationWarningCodes: clean ? ["REPORT_INTEGRATION_READY", "EXPORT_LENGTH_PRESERVED"] : ["EXPORT_LENGTH_REGRESSED"],
    recommendation: clean ? "KEEP_COMPACT_SEQUENCE_CAUSALITY" : "SEQUENCE_CAUSALITY_EXPORT_BUDGET_CLEANUP",
  };
}

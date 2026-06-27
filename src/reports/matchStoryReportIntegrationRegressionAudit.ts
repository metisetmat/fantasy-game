export interface MatchStoryReportIntegrationRegressionAudit {
  readonly productStorySectionVisible: boolean;
  readonly exportStorySectionVisible: boolean;
  readonly exportCompact45SecondStoryVisible: boolean;
  readonly exportReadTimeSecondsBefore8B: number;
  readonly exportReadTimeSecondsAfter8B: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly productStorySectionTooLong: boolean;
  readonly exportStorySectionTooLong: boolean;
  readonly actionPlanStillVisible: boolean;
  readonly tacticalMapCardsStillVisible: boolean;
  readonly trendsStillVisible: boolean;
  readonly reportIntegrationWarningCodes: readonly string[];
  readonly recommendation: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/giu, " ")
    .replace(/&[a-z0-9#]+;/giu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function readTimeSeconds(html: string): number {
  const appendicesIndex = html.search(/<section\s+id="appendices"[^>]*>/iu);
  const mainHtml = appendicesIndex === -1 ? html : html.slice(0, appendicesIndex);
  const wordCount = stripHtml(mainHtml).split(/\s+/u).filter((word) => word.length > 0).length;
  return Math.ceil((wordCount / 180) * 60);
}

function sectionTextLength(html: string, sectionId: string): number {
  const match = new RegExp(`<section[^>]+id="${sectionId}"[\\s\\S]*?<\\/section>`, "iu").exec(html);
  return match === null ? 0 : stripHtml(match[0]).length;
}

export function auditMatchStoryReportIntegrationRegression(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly exportReadTimeSecondsBefore8B: number;
}): MatchStoryReportIntegrationRegressionAudit {
  const productStorySectionVisible = input.productReportHtml.includes('id="official-match-story-spine"') &&
    input.productReportHtml.includes("R&eacute;cit officiel du match");
  const exportStorySectionVisible = input.exportReportHtml.includes('id="official-match-story-spine"');
  const exportCompact45SecondStoryVisible = input.exportReportHtml.includes("R&eacute;cit du match en 45 secondes") ||
    input.exportReportHtml.includes("Recit du match en 45 secondes");
  const exportReadTimeSecondsAfter8B = readTimeSeconds(input.exportReportHtml);
  const productStorySectionTooLong = sectionTextLength(input.productReportHtml, "official-match-story-spine") > 4000;
  const exportStorySectionTooLong = sectionTextLength(input.exportReportHtml, "official-match-story-spine") > 1800;
  const actionPlanStillVisible = input.productReportHtml.includes('id="action-plan"') ||
    input.productReportHtml.includes("Plan d'action");
  const tacticalMapCardsStillVisible = input.productReportHtml.includes("tactical-map-card") ||
    input.productReportHtml.includes("Cartes tactiques");
  const trendsStillVisible = input.productReportHtml.includes("multi-match-trend") ||
    input.productReportHtml.includes("Tendances");
  const reportIntegrationWarningCodes = [
    ...(productStorySectionVisible ? [] : ["PRODUCT_STORY_SECTION_MISSING"]),
    ...(exportStorySectionVisible && exportCompact45SecondStoryVisible ? [] : ["EXPORT_STORY_SECTION_MISSING"]),
    ...(exportReadTimeSecondsAfter8B <= 900 ? [] : ["EXPORT_LENGTH_REGRESSED"]),
    ...(productStorySectionTooLong ? ["PRODUCT_STORY_SECTION_TOO_LONG"] : []),
    ...(exportStorySectionTooLong ? ["EXPORT_STORY_SECTION_TOO_LONG"] : []),
    ...(actionPlanStillVisible ? [] : ["ACTION_PLAN_MISSING"]),
    ...(tacticalMapCardsStillVisible ? [] : ["TACTICAL_MAP_CARDS_MISSING"]),
    ...(trendsStillVisible ? [] : ["TRENDS_MISSING"]),
  ];

  return {
    productStorySectionVisible,
    exportStorySectionVisible,
    exportCompact45SecondStoryVisible,
    exportReadTimeSecondsBefore8B: input.exportReadTimeSecondsBefore8B,
    exportReadTimeSecondsAfter8B,
    exportReadTimeDelta: exportReadTimeSecondsAfter8B - input.exportReadTimeSecondsBefore8B,
    exportUnder900Seconds: exportReadTimeSecondsAfter8B <= 900,
    productStorySectionTooLong,
    exportStorySectionTooLong,
    actionPlanStillVisible,
    tacticalMapCardsStillVisible,
    trendsStillVisible,
    reportIntegrationWarningCodes,
    recommendation: reportIntegrationWarningCodes.length === 0 ? "KEEP_REPORT_INTEGRATION" : "FIX_REPORT_INTEGRATION",
  };
}


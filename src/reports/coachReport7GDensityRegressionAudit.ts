import type { CoachReportMultiMatchComparisonTrendSignalsWarningCode } from "./coachReportMultiMatchComparisonTrendSignalsWarnings";

export interface CoachReport7GDensityRegressionAudit {
  readonly visualDensityScore7F: number;
  readonly visualDensityScore7G: number;
  readonly visualDensityDelta: number;
  readonly mainBodySectionCount7F: number;
  readonly mainBodySectionCount7G: number;
  readonly exportSectionCount7F: number;
  readonly exportSectionCount7G: number;
  readonly trendSectionAddedCount: number;
  readonly removedOrCondensedSectionCount: number;
  readonly coachReadTimeSeconds7F: number;
  readonly coachReadTimeSeconds7G: number;
  readonly exportReadTimeSeconds7F: number;
  readonly exportReadTimeSeconds7G: number;
  readonly expressReadStillVisible: boolean;
  readonly actionPlanStillAboveFold: boolean;
  readonly tacticalMapCardsStillVisible: boolean;
  readonly densityRegressionWarningCodes: readonly CoachReportMultiMatchComparisonTrendSignalsWarningCode[];
  readonly recommendation: "KEEP_VISUAL_DENSITY" | "CONDENSE_TREND_SECTION";
}

function stripDetails(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/giu, "");
}

function mainBody(html: string): string {
  return stripDetails(html)
    .replace(/<head[\s\S]*?<\/head>/giu, "")
    .replace(/<script[\s\S]*?<\/script>/giu, "")
    .replace(/<style[\s\S]*?<\/style>/giu, "")
    .replace(/<section\s+id="appendices"[\s\S]*?(?=<\/main>|$)/giu, "")
    .replace(/<section\s+id="technical-appendices"[\s\S]*?(?=<\/main>|$)/giu, "");
}

function countSections(html: string): number {
  return (html.match(/<section\b[^>]*class="[^"]*(?:product-section|premium-section)/giu) ?? []).length;
}

function readTimeSeconds(html: string): number {
  const words = html.replace(/<[^>]+>/gu, " ").trim().split(/\s+/u).filter((word) => word.length > 0).length;
  return Math.ceil((words / 180) * 60);
}

export function auditCoachReport7GDensityRegression(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly visualDensityScore7F: number;
  readonly mainBodySectionCount7F: number;
  readonly exportSectionCount7F: number;
  readonly coachReadTimeSeconds7F: number;
  readonly exportReadTimeSeconds7F: number;
}): CoachReport7GDensityRegressionAudit {
  const productMain = mainBody(input.productReportHtml);
  const exportMain = mainBody(input.exportReportHtml);
  const mainBodySectionCount7G = countSections(productMain);
  const exportSectionCount7G = countSections(exportMain);
  const trendSectionAddedCount = input.productReportHtml.includes("id=\"multi-match-trend-signals\"") ? 1 : 0;
  const visualDensityScore7G = input.visualDensityScore7F + trendSectionAddedCount;
  const visualDensityDelta = visualDensityScore7G - input.visualDensityScore7F;
  const expressIndex = input.productReportHtml.indexOf("id=\"express-read\"");
  const actionPlanIndex = input.productReportHtml.indexOf("id=\"coach-action-plan\"");
  const tacticalMapIndex = input.productReportHtml.indexOf("id=\"tactical-map-cards\"");
  const expressReadStillVisible = expressIndex >= 0;
  const actionPlanStillAboveFold = actionPlanIndex >= 0 && (tacticalMapIndex < 0 || actionPlanIndex < tacticalMapIndex);
  const tacticalMapCardsStillVisible = tacticalMapIndex >= 0 && input.exportReportHtml.includes("id=\"tactical-map-cards\"");
  const coachReadTimeSeconds7G = readTimeSeconds(productMain);
  const exportReadTimeSeconds7G = readTimeSeconds(exportMain);
  const clean = visualDensityScore7G <= 88 &&
    visualDensityDelta <= 3 &&
    expressReadStillVisible &&
    actionPlanStillAboveFold &&
    tacticalMapCardsStillVisible &&
    exportReadTimeSeconds7G <= Math.max(900, input.exportReadTimeSeconds7F + 180);

  return {
    visualDensityScore7F: input.visualDensityScore7F,
    visualDensityScore7G,
    visualDensityDelta,
    mainBodySectionCount7F: input.mainBodySectionCount7F,
    mainBodySectionCount7G,
    exportSectionCount7F: input.exportSectionCount7F,
    exportSectionCount7G,
    trendSectionAddedCount,
    removedOrCondensedSectionCount: Math.max(0, input.mainBodySectionCount7F + trendSectionAddedCount - mainBodySectionCount7G),
    coachReadTimeSeconds7F: input.coachReadTimeSeconds7F,
    coachReadTimeSeconds7G,
    exportReadTimeSeconds7F: input.exportReadTimeSeconds7F,
    exportReadTimeSeconds7G,
    expressReadStillVisible,
    actionPlanStillAboveFold,
    tacticalMapCardsStillVisible,
    densityRegressionWarningCodes: [
      ...(clean ? ["VISUAL_DENSITY_CONTROLLED" as const, "EXPRESS_READ_PRESERVED" as const, "ACTION_PLAN_STILL_PROMINENT" as const, "TACTICAL_MAP_CARDS_PRESERVED" as const] : ["COACH_REPORT_MULTI_MATCH_TRENDS_PARTIAL" as const]),
      ...(visualDensityScore7G <= 88 ? [] : ["VISUAL_DENSITY_TOO_HIGH" as const]),
      ...(expressReadStillVisible ? [] : ["EXPRESS_READ_REGRESSED" as const]),
      ...(actionPlanStillAboveFold ? [] : ["ACTION_PLAN_NOT_PROMINENT" as const]),
      ...(tacticalMapCardsStillVisible ? [] : ["TACTICAL_MAP_CARDS_REGRESSED" as const]),
    ],
    recommendation: clean ? "KEEP_VISUAL_DENSITY" : "CONDENSE_TREND_SECTION",
  };
}

import type { CoachReportMultiMatchComparisonTrendSignalsWarningCode } from "./coachReportMultiMatchComparisonTrendSignalsWarnings";

export interface CoachReportTemplatePlaceholderCleanupAudit {
  readonly unresolvedTemplatePlaceholderCountBefore: number;
  readonly unresolvedTemplatePlaceholderCountAfter: number;
  readonly visiblePlaceholderCount: number;
  readonly mainBodyPlaceholderCount: number;
  readonly exportPlaceholderCount: number;
  readonly technicalAppendixPlaceholderCount: number;
  readonly placeholderCleanupWarningCodes: readonly CoachReportMultiMatchComparisonTrendSignalsWarningCode[];
  readonly recommendation: "KEEP_PLACEHOLDER_CLEANUP" | "FIX_VISIBLE_PLACEHOLDERS";
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ");
}

function stripDetails(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/giu, "");
}

function placeholderCount(text: string): number {
  return (text.match(/\{\{|\}\}|TODO|MISSING_DATA|TEMPLATE_PLACEHOLDER|undefined|null value/giu) ?? []).length;
}

export function auditCoachReportTemplatePlaceholderCleanup(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly beforeCount: number;
}): CoachReportTemplatePlaceholderCleanupAudit {
  const mainText = stripTags(`${stripDetails(input.productReportHtml)}\n${stripDetails(input.exportReportHtml)}`);
  const exportText = stripTags(input.exportReportHtml);
  const appendixText = stripTags(`${input.productReportHtml}\n${input.exportReportHtml}`).replace(mainText, "");
  const mainBodyPlaceholderCount = placeholderCount(mainText);
  const exportPlaceholderCount = placeholderCount(exportText);
  const technicalAppendixPlaceholderCount = placeholderCount(appendixText);
  const visiblePlaceholderCount = mainBodyPlaceholderCount + exportPlaceholderCount;
  const unresolvedTemplatePlaceholderCountAfter = placeholderCount(stripTags(`${input.productReportHtml}\n${input.exportReportHtml}`));
  const clean = unresolvedTemplatePlaceholderCountAfter === 0 &&
    visiblePlaceholderCount === 0 &&
    mainBodyPlaceholderCount === 0 &&
    exportPlaceholderCount === 0;

  return {
    unresolvedTemplatePlaceholderCountBefore: input.beforeCount,
    unresolvedTemplatePlaceholderCountAfter,
    visiblePlaceholderCount,
    mainBodyPlaceholderCount,
    exportPlaceholderCount,
    technicalAppendixPlaceholderCount,
    placeholderCleanupWarningCodes: clean ? ["TEMPLATE_PLACEHOLDERS_REMOVED"] : ["TEMPLATE_PLACEHOLDER_STILL_PRESENT"],
    recommendation: clean ? "KEEP_PLACEHOLDER_CLEANUP" : "FIX_VISIBLE_PLACEHOLDERS",
  };
}

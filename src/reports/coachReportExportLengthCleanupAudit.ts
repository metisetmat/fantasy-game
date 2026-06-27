import {
  countOccurrences,
  extractSection,
  readTimeSecondsFromHtml,
  visibleText,
} from "./coachReportHtmlAuditUtils";
import type { CoachReportExportLengthTrendCountCleanupWarningCode } from "./coachReportExportLengthTrendCountCleanupWarnings";

export interface CoachReportExportLengthCleanupAudit {
  readonly exportReadTimeSecondsBefore: number;
  readonly exportReadTimeSecondsAfter: number;
  readonly exportReadTimeDelta: number;
  readonly exportSectionCountBefore: number;
  readonly exportSectionCountAfter: number;
  readonly exportCoachSectionCountAfter: number;
  readonly exportTechnicalSectionCountAfter: number;
  readonly exportAppendixSectionCountAfter: number;
  readonly exportMainBodyCoachOnly: boolean;
  readonly exportTooLongBefore: boolean;
  readonly exportTooLongAfter: boolean;
  readonly exportLengthTargetSeconds: number;
  readonly exportLengthHardLimitSeconds: number;
  readonly removedOrCondensedExportBlocksCount: number;
  readonly duplicatedExportContentCount: number;
  readonly exportSummaryOnlySectionsCount: number;
  readonly exportLengthCleanupWarningCodes: readonly CoachReportExportLengthTrendCountCleanupWarningCode[];
  readonly recommendation: "KEEP_EXPORT_LENGTH_CLEANUP" | "CONDENSE_EXPORT_MORE" | "RESTORE_COACH_EXPORT_SCOPE";
}

function mainBody(html: string): string {
  return html
    .replace(/<head[\s\S]*?<\/head>/giu, "")
    .replace(/<style[\s\S]*?<\/style>/giu, "")
    .replace(/<script[\s\S]*?<\/script>/giu, "")
    .replace(/<details[\s\S]*?<\/details>/giu, "");
}

function sectionCount(html: string): number {
  return (html.match(/<section\b/giu) ?? []).length;
}

export function auditCoachReportExportLengthCleanup(input: {
  readonly exportHtmlBefore: string;
  readonly exportHtmlAfter: string;
  readonly exportReadTimeSecondsBeforeOverride?: number;
  readonly exportSectionCountBeforeOverride?: number;
}): CoachReportExportLengthCleanupAudit {
  const target = 900;
  const hardLimit = 1100;
  const beforeMain = mainBody(input.exportHtmlBefore);
  const afterMain = mainBody(input.exportHtmlAfter);
  const exportReadTimeSecondsBefore = input.exportReadTimeSecondsBeforeOverride ?? readTimeSecondsFromHtml(beforeMain);
  const exportReadTimeSecondsAfter = readTimeSecondsFromHtml(afterMain);
  const exportSectionCountBefore = input.exportSectionCountBeforeOverride ?? sectionCount(beforeMain);
  const exportSectionCountAfter = sectionCount(afterMain);
  const exportAppendixSectionCountAfter = countOccurrences(input.exportHtmlAfter, "<details");
  const technicalText = visibleText(afterMain).toLocaleLowerCase("fr-FR");
  const exportTechnicalSectionCountAfter = /sqlite|database|migration|calibration|sandbox_only|trace_supported|record dump|adapter spike/u.test(technicalText) ? 1 : 0;
  const exportCoachSectionCountAfter = exportSectionCountAfter - exportTechnicalSectionCountAfter;
  const duplicatedExportContentCount = Math.max(0, countOccurrences(input.exportHtmlAfter, 'id="multi-match-trend-signals"') - 1) +
    Math.max(0, countOccurrences(input.exportHtmlAfter, 'id="profiles-and-players"') - 1);
  const compactProfiles = extractSection(input.exportHtmlAfter, "profiles-and-players").includes("compact-profile-summary");
  const compactTrends = extractSection(input.exportHtmlAfter, "multi-match-trend-signals").includes("trend-card-compact");
  const exportSummaryOnlySectionsCount = (compactProfiles ? 1 : 0) + (compactTrends ? 1 : 0);
  const exportTooLongBefore = exportReadTimeSecondsBefore > hardLimit;
  const exportTooLongAfter = exportReadTimeSecondsAfter > hardLimit;
  const exportMainBodyCoachOnly = exportTechnicalSectionCountAfter === 0;
  const reduced = exportReadTimeSecondsAfter < exportReadTimeSecondsBefore;
  const ready = !exportTooLongAfter &&
    exportMainBodyCoachOnly &&
    duplicatedExportContentCount === 0 &&
    exportSummaryOnlySectionsCount >= 2;

  return {
    exportReadTimeSecondsBefore,
    exportReadTimeSecondsAfter,
    exportReadTimeDelta: exportReadTimeSecondsAfter - exportReadTimeSecondsBefore,
    exportSectionCountBefore,
    exportSectionCountAfter,
    exportCoachSectionCountAfter,
    exportTechnicalSectionCountAfter,
    exportAppendixSectionCountAfter,
    exportMainBodyCoachOnly,
    exportTooLongBefore,
    exportTooLongAfter,
    exportLengthTargetSeconds: target,
    exportLengthHardLimitSeconds: hardLimit,
    removedOrCondensedExportBlocksCount: Math.max(0, exportSectionCountBefore - exportSectionCountAfter) + exportSummaryOnlySectionsCount,
    duplicatedExportContentCount,
    exportSummaryOnlySectionsCount,
    exportLengthCleanupWarningCodes: [
      ...(ready ? ["EXPORT_LENGTH_READY" as const, "EXPORT_NOT_TOO_LONG" as const] : ["COACH_REPORT_EXPORT_LENGTH_CLEANUP_PARTIAL" as const]),
      ...(reduced ? ["EXPORT_LENGTH_REDUCED" as const] : ["EXPORT_LENGTH_NOT_REDUCED" as const]),
      ...(exportTooLongAfter ? ["EXPORT_STILL_TOO_LONG" as const] : []),
      ...(exportMainBodyCoachOnly ? ["MAIN_BODY_COACH_ONLY_PRESERVED" as const] : ["SOURCE_OF_TRUTH_AMBIGUOUS" as const]),
      ...(duplicatedExportContentCount === 0 ? [] : ["EXPORT_TOO_DENSE" as const]),
    ],
    recommendation: ready
      ? "KEEP_EXPORT_LENGTH_CLEANUP"
      : !exportMainBodyCoachOnly
        ? "RESTORE_COACH_EXPORT_SCOPE"
        : "CONDENSE_EXPORT_MORE",
  };
}

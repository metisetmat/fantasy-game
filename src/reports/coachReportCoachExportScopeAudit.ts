import type { ProductReportScopeDensityWordingCleanupWarningCode } from "./productReportScopeDensityWordingCleanupWarnings";

export interface CoachReportCoachExportScopeAudit {
  readonly exportCoachSectionsCount: number;
  readonly exportTechnicalSectionsCount: number;
  readonly exportDeveloperSectionsCount: number;
  readonly exportDatabaseSectionsCount: number;
  readonly exportPersistenceSectionsCount: number;
  readonly exportCalibrationSectionsCount: number;
  readonly exportAppendixTechnicalSectionsCount: number;
  readonly exportMainBodyCoachOnly: boolean;
  readonly exportPrintable: boolean;
  readonly exportShareable: boolean;
  readonly exportTooLong: boolean;
  readonly exportScopeWarningCodes: readonly ProductReportScopeDensityWordingCleanupWarningCode[];
  readonly recommendation: "KEEP_EXPORT_SCOPE" | "MOVE_EXPORT_TECHNICAL_SECTIONS_TO_APPENDIX" | "SHORTEN_EXPORT";
}

function stripDetails(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/giu, "");
}

function mainBody(html: string): string {
  return stripDetails(html).replace(/<section\s+id="appendices"[\s\S]*?(?=<\/main>|$)/giu, "");
}

function countSections(html: string, pattern: RegExp): number {
  return [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/giu)]
    .filter((match) => /\bid="/iu.test(match[1] ?? ""))
    .filter((match) => pattern.test(match[0]))
    .length;
}

export function auditCoachReportCoachExportScope(input: {
  readonly exportReportHtml: string;
}): CoachReportCoachExportScopeAudit {
  const exportMain = mainBody(input.exportReportHtml);
  const exportAppendix = input.exportReportHtml.replace(exportMain, "");
  const exportDatabaseSectionsCount = countSections(exportMain, /database|sqlite|adapter/iu);
  const exportPersistenceSectionsCount = countSections(exportMain, /persistent|persistence|history store|match history|historique/iu);
  const exportCalibrationSectionsCount = countSections(exportMain, /calibration|reconciliation|score economy|scoring family/iu);
  const exportDeveloperSectionsCount = exportDatabaseSectionsCount + exportPersistenceSectionsCount + exportCalibrationSectionsCount;
  const exportTechnicalSectionsCount = countSections(exportMain, /technical|validation|database|sqlite|migration|adapter|persistent|persistence|calibration|reconciliation/iu);
  const exportAppendixTechnicalSectionsCount = countSections(exportAppendix, /technical|validation|database|sqlite|migration|adapter|persistent|persistence|calibration|reconciliation/iu);
  const exportCoachSectionsCount = Math.max(0, [...exportMain.matchAll(/<section\b[^>]*\bid="/giu)].length - exportDeveloperSectionsCount);
  const exportPrintable = input.exportReportHtml.includes("@media print") && input.exportReportHtml.includes("break-inside: avoid");
  const exportShareable = input.exportReportHtml.includes("id=\"cover\"") &&
    input.exportReportHtml.includes("id=\"coach-action-plan\"") &&
    input.exportReportHtml.includes("id=\"tactical-map-cards\"") &&
    (input.exportReportHtml.includes("id=\"guardrail-summary\"") || input.exportReportHtml.includes("data-source-product-sections=\"interpretation-guard|guardrail-summary\""));
  const exportTooLong = exportMain.length > 115000;
  const exportMainBodyCoachOnly = exportDeveloperSectionsCount === 0 && exportTechnicalSectionsCount === 0;

  return {
    exportCoachSectionsCount,
    exportTechnicalSectionsCount,
    exportDeveloperSectionsCount,
    exportDatabaseSectionsCount,
    exportPersistenceSectionsCount,
    exportCalibrationSectionsCount,
    exportAppendixTechnicalSectionsCount,
    exportMainBodyCoachOnly,
    exportPrintable,
    exportShareable,
    exportTooLong,
    exportScopeWarningCodes: [
      ...(exportMainBodyCoachOnly ? ["EXPORT_SCOPE_CLEAN" as const, "MAIN_BODY_COACH_ONLY" as const] : ["EXPORT_SCOPE_TOO_BROAD" as const]),
      ...(exportDatabaseSectionsCount === 0 ? ["DATABASE_SECTIONS_NOT_IN_MAIN_BODY" as const] : ["DATABASE_SECTIONS_IN_MAIN_BODY" as const]),
      ...(exportPersistenceSectionsCount === 0 ? ["PERSISTENCE_SECTIONS_NOT_IN_MAIN_BODY" as const] : ["PERSISTENCE_SECTIONS_IN_MAIN_BODY" as const]),
      ...(exportCalibrationSectionsCount === 0 ? ["CALIBRATION_HISTORY_NOT_IN_MAIN_BODY" as const] : ["CALIBRATION_HISTORY_IN_MAIN_BODY" as const]),
      ...(exportTooLong ? ["EXPORT_TOO_LONG" as const] : []),
      ...(exportPrintable ? [] : ["TECHNICAL_DETAILS_NOT_COLLAPSED" as const]),
    ],
    recommendation: exportMainBodyCoachOnly && !exportTooLong ? "KEEP_EXPORT_SCOPE" : exportTooLong ? "SHORTEN_EXPORT" : "MOVE_EXPORT_TECHNICAL_SECTIONS_TO_APPENDIX",
  };
}

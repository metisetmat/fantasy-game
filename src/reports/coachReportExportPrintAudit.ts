import {
  containsForbiddenCoachWording,
  extractSection,
  sectionIndex,
} from "./coachReportHtmlAuditUtils";
import type { CoachReportPremiumLayoutVisualHierarchyWarningCode } from "./coachReportPremiumLayoutVisualHierarchyWarnings";

export interface CoachReportExportPrintAudit {
  readonly exportReady: boolean;
  readonly printReady: boolean;
  readonly pageBreakGuardsPresent: boolean;
  readonly coverPrintable: boolean;
  readonly actionCardsPrintable: boolean;
  readonly appendixCollapsedOrSeparated: boolean;
  readonly noCriticalInfoHiddenOnlyInInteractiveDetails: boolean;
  readonly noDeveloperNoiseInPrintBody: boolean;
  readonly printReadabilityScore: number;
  readonly exportPrintWarningCodes: readonly CoachReportPremiumLayoutVisualHierarchyWarningCode[];
  readonly recommendation: "KEEP_EXPORT_PRINT_LAYOUT" | "IMPROVE_PRINT_GUARDS" | "REDUCE_EXPORT_TECHNICAL_NOISE";
}

export function auditCoachReportExportPrint(exportHtml: string): CoachReportExportPrintAudit {
  const exportReady = exportHtml.includes("data-export-format=\"print_ready_html\"") &&
    sectionIndex(exportHtml, "cover") >= 0 &&
    sectionIndex(exportHtml, "express-read") >= 0;
  const printReady = exportHtml.includes("@media print");
  const pageBreakGuardsPresent = exportHtml.includes("break-inside: avoid") || exportHtml.includes("page-break");
  const coverPrintable = extractSection(exportHtml, "cover").includes("Score du rapport full-match");
  const actionCardsPrintable = extractSection(exportHtml, "coach-action-plan").includes("action-plan-card--primary");
  const appendixCollapsedOrSeparated = extractSection(exportHtml, "appendices").includes("<details") ||
    exportHtml.includes("report-appendix-stack");
  const noCriticalInfoHiddenOnlyInInteractiveDetails = extractSection(exportHtml, "express-read").length > 0 &&
    extractSection(exportHtml, "coach-action-plan").length > 0;
  const noDeveloperNoiseInPrintBody = !/scoreMutationCount|canDrive|workbench_chain_|SegmentRouteInput/u.test(extractSection(exportHtml, "express-read") + extractSection(exportHtml, "coach-action-plan"));
  const printReadabilityScore = [
    exportReady,
    printReady,
    pageBreakGuardsPresent,
    coverPrintable,
    actionCardsPrintable,
    appendixCollapsedOrSeparated,
    noCriticalInfoHiddenOnlyInInteractiveDetails,
    noDeveloperNoiseInPrintBody,
    !containsForbiddenCoachWording(exportHtml),
  ].filter(Boolean).length * 11;
  const ready = printReadabilityScore >= 90;
  const exportPrintWarningCodes: CoachReportPremiumLayoutVisualHierarchyWarningCode[] = [
    ready ? "EXPORT_PRINT_READY" : "EXPORT_PRINT_PARTIAL",
    ...(appendixCollapsedOrSeparated ? ["TECHNICAL_APPENDICES_COLLAPSED" as const] : ["TECHNICAL_DETAILS_NOT_COLLAPSED" as const]),
    ...(containsForbiddenCoachWording(exportHtml) ? ["FORBIDDEN_WORDING_DETECTED" as const] : []),
  ];

  return {
    exportReady,
    printReady,
    pageBreakGuardsPresent,
    coverPrintable,
    actionCardsPrintable,
    appendixCollapsedOrSeparated,
    noCriticalInfoHiddenOnlyInInteractiveDetails,
    noDeveloperNoiseInPrintBody,
    printReadabilityScore,
    exportPrintWarningCodes,
    recommendation: ready
      ? "KEEP_EXPORT_PRINT_LAYOUT"
      : !pageBreakGuardsPresent
        ? "IMPROVE_PRINT_GUARDS"
        : "REDUCE_EXPORT_TECHNICAL_NOISE",
  };
}

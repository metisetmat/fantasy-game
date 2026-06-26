import { extractSection } from "./coachReportHtmlAuditUtils";
import type { CoachReportPhaseVisualsTacticalMapCardsWarningCode } from "./coachReportPhaseVisualsTacticalMapCardsWarnings";

export interface CoachReportVisualMobileExportAudit {
  readonly mobileMapCardsReadable: boolean;
  readonly mobileMapCardsStackCorrectly: boolean;
  readonly mobileLegendReadable: boolean;
  readonly mobileNoHorizontalOverflow: boolean;
  readonly exportMapCardsPrintable: boolean;
  readonly printLegendReadable: boolean;
  readonly pageBreakGuardsForVisuals: boolean;
  readonly noCriticalVisualInfoHiddenOnlyInInteractiveDetails: boolean;
  readonly visualMobileExportWarningCodes: readonly CoachReportPhaseVisualsTacticalMapCardsWarningCode[];
  readonly recommendation: "KEEP_VISUAL_MOBILE_EXPORT" | "IMPROVE_MOBILE_VISUALS" | "IMPROVE_EXPORT_VISUALS";
}

export function auditCoachReportVisualMobileExport(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReportVisualMobileExportAudit {
  const productSection = extractSection(input.productReportHtml, "tactical-map-cards");
  const exportSection = extractSection(input.exportReportHtml, "tactical-map-cards");
  const mobileMapCardsReadable = productSection.includes("tactical-map-card") && productSection.includes("Signal prochain match");
  const mobileMapCardsStackCorrectly = input.productReportHtml.includes(".tactical-map-card-grid { grid-template-columns: 1fr; }");
  const mobileLegendReadable = productSection.includes("Legende");
  const mobileNoHorizontalOverflow = input.productReportHtml.includes("overflow-x: hidden") && input.productReportHtml.includes("overflow-wrap: anywhere");
  const exportMapCardsPrintable = exportSection.includes("tactical-map-card") && input.exportReportHtml.includes("@media print");
  const printLegendReadable = exportSection.includes("Legende");
  const pageBreakGuardsForVisuals = input.exportReportHtml.includes(".tactical-map-card") &&
    input.exportReportHtml.includes("break-inside: avoid") &&
    input.exportReportHtml.includes("page-break-inside: avoid");
  const noCriticalVisualInfoHiddenOnlyInInteractiveDetails = !productSection.includes("<details") && !exportSection.includes("<details");
  const ready = mobileMapCardsReadable &&
    mobileMapCardsStackCorrectly &&
    mobileLegendReadable &&
    mobileNoHorizontalOverflow &&
    exportMapCardsPrintable &&
    printLegendReadable &&
    pageBreakGuardsForVisuals &&
    noCriticalVisualInfoHiddenOnlyInInteractiveDetails;
  const visualMobileExportWarningCodes: CoachReportPhaseVisualsTacticalMapCardsWarningCode[] = [
    ...(mobileMapCardsReadable && mobileMapCardsStackCorrectly && mobileLegendReadable && mobileNoHorizontalOverflow
      ? ["MOBILE_VISUAL_READABILITY_READY" as const]
      : ["MOBILE_VISUAL_READABILITY_PARTIAL" as const]),
    ...(exportMapCardsPrintable && printLegendReadable && pageBreakGuardsForVisuals && noCriticalVisualInfoHiddenOnlyInInteractiveDetails
      ? ["EXPORT_VISUAL_READABILITY_READY" as const]
      : ["EXPORT_VISUAL_READABILITY_PARTIAL" as const]),
  ];

  return {
    mobileMapCardsReadable,
    mobileMapCardsStackCorrectly,
    mobileLegendReadable,
    mobileNoHorizontalOverflow,
    exportMapCardsPrintable,
    printLegendReadable,
    pageBreakGuardsForVisuals,
    noCriticalVisualInfoHiddenOnlyInInteractiveDetails,
    visualMobileExportWarningCodes,
    recommendation: ready
      ? "KEEP_VISUAL_MOBILE_EXPORT"
      : !mobileMapCardsReadable || !mobileMapCardsStackCorrectly
        ? "IMPROVE_MOBILE_VISUALS"
        : "IMPROVE_EXPORT_VISUALS",
  };
}

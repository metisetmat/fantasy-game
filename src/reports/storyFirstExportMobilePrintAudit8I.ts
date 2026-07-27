import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { StoryFirstExportMobilePrintAudit8I } from "./storyFirstExportBudgetValidationThresholdFixTypes8I";
import type { StoryFirstExportBudgetValidationThresholdFixWarningCode } from "./storyFirstExportBudgetValidationThresholdFixWarnings";

export function auditStoryFirstExportMobilePrint8I(exportHtml: string): StoryFirstExportMobilePrintAudit8I {
  const exportPrintReady = exportHtml.includes("@media print") && exportHtml.includes("Rapport coach");
  const exportPageBreaksControlled = exportHtml.includes("break-inside:avoid") || exportHtml.includes("break-inside: avoid");
  const exportNoHorizontalOverflow = exportHtml.includes("overflow-x:hidden") || exportHtml.includes("overflow-x: hidden");
  const exportCardsStackOnMobile = exportHtml.includes("@media(max-width") && exportHtml.includes("grid-template-columns:1fr");
  const exportReplayReadableOnMobile = exportHtml.includes("Replay coach en 60 secondes") && exportHtml.includes("coach-replay-export-8g");
  const exportActionPlanReadableOnMobile = exportHtml.includes("Plan d'action coach") && exportHtml.includes('id="coach-action-plan"');
  const exportTechnicalAppendixCompact = exportHtml.includes("Annexe ultra-compacte") && !/technical traceability|78\s+evenements/iu.test(exportHtml);
  const warnings: StoryFirstExportBudgetValidationThresholdFixWarningCode[] = [];
  if (!exportPrintReady || !exportPageBreaksControlled) warnings.push("EXPORT_PRINT_READY");
  if (!exportNoHorizontalOverflow || !exportCardsStackOnMobile || !exportReplayReadableOnMobile || !exportActionPlanReadableOnMobile) warnings.push("EXPORT_MOBILE_READY");
  if (warnings.length === 0) warnings.push("EXPORT_PRINT_READY", "EXPORT_MOBILE_READY");
  const pass = exportPrintReady &&
    exportPageBreaksControlled &&
    exportNoHorizontalOverflow &&
    exportCardsStackOnMobile &&
    exportReplayReadableOnMobile &&
    exportActionPlanReadableOnMobile &&
    exportTechnicalAppendixCompact;

  return {
    status: pass ? "PASS" : "FAIL",
    exportPrintReady,
    exportPageBreaksControlled,
    exportNoHorizontalOverflow,
    exportCardsStackOnMobile,
    exportReplayReadableOnMobile,
    exportActionPlanReadableOnMobile,
    exportTechnicalAppendixCompact,
    exportMobilePrintWarningCodes: warnings,
    recommendation: pass ? "KEEP_8I_EXPORT_MOBILE_PRINT" : "REPAIR_8I_EXPORT_MOBILE_PRINT",
  };
}

import type { FullMatchEconomyFinalStabilizationModel } from "./fullMatchMatchEconomyFinalStabilization";
import { renderCoachReportExportHtml } from "./renderCoachReportExportHtml";

export function renderCoachReportStoryFirstExport8H(input: {
  readonly productReportHtml: string;
  readonly fullMatchEconomyFinalStabilization: FullMatchEconomyFinalStabilizationModel;
}): string {
  return renderCoachReportExportHtml({
    productReportHtml: input.productReportHtml,
    fullMatchEconomyFinalStabilization: input.fullMatchEconomyFinalStabilization,
  });
}

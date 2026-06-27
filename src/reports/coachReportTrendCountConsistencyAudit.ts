import { countOccurrences } from "./coachReportHtmlAuditUtils";
import type { CoachTrendSignalCard } from "./coachReportMultiMatchTrendSignals";
import type { CoachReportExportLengthTrendCountCleanupWarningCode } from "./coachReportExportLengthTrendCountCleanupWarnings";

export interface CoachReportTrendCountConsistencyAudit {
  readonly trendSignalCardCountReported: number;
  readonly trendSignalCardCountRendered: number;
  readonly trendSignalCardCountProduct: number;
  readonly trendSignalCardCountExport: number;
  readonly trendTableRowCount: number;
  readonly repeatedTrendSignalCount: number;
  readonly visibleOnceTrendSignalCount: number;
  readonly unstableTrendSignalCount: number;
  readonly insufficientDataTrendSignalCount: number;
  readonly officialTrendSignalCount: number;
  readonly trendTypeCountSum: number;
  readonly trendCountMismatchCount: number;
  readonly trendCountConsistent: boolean;
  readonly trendCountWarningCodes: readonly CoachReportExportLengthTrendCountCleanupWarningCode[];
  readonly recommendation: "KEEP_TREND_COUNT_CONSISTENCY" | "FIX_TREND_COUNT_MISMATCH";
}

function productTrendCardCount(html: string): number {
  return countOccurrences(html, 'class="product-card trend-card"');
}

function exportTrendCardCount(html: string): number {
  return countOccurrences(html, "trend-card-compact");
}

export function auditCoachReportTrendCountConsistency(input: {
  readonly trendCards: readonly CoachTrendSignalCard[];
  readonly trendSignalCardCountReported: number;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly reportText: string;
}): CoachReportTrendCountConsistencyAudit {
  const trendSignalCardCountProduct = productTrendCardCount(input.productReportHtml);
  const trendSignalCardCountExport = exportTrendCardCount(input.exportReportHtml);
  const trendSignalCardCountRendered = Math.max(trendSignalCardCountProduct, trendSignalCardCountExport);
  const trendTableRowCount = input.trendCards.filter((card) => input.reportText.includes(card.title)).length;
  const repeatedTrendSignalCount = input.trendCards.filter((card) => card.trendType === "repeated").length;
  const visibleOnceTrendSignalCount = input.trendCards.filter((card) => card.trendType === "visible_once").length;
  const unstableTrendSignalCount = input.trendCards.filter((card) => card.trendType === "unstable").length;
  const insufficientDataTrendSignalCount = input.trendCards.filter((card) => card.trendType === "insufficient_data").length;
  const officialTrendSignalCount = input.trendCards.filter((card) => card.sourceType === "official").length;
  const trendTypeCountSum = repeatedTrendSignalCount + visibleOnceTrendSignalCount + unstableTrendSignalCount + insufficientDataTrendSignalCount;
  const mismatchChecks = [
    input.trendSignalCardCountReported === input.trendCards.length,
    trendSignalCardCountProduct === input.trendCards.length,
    trendSignalCardCountExport === input.trendCards.length,
    trendTypeCountSum === input.trendCards.length,
    officialTrendSignalCount === input.trendCards.length,
  ];
  const trendCountMismatchCount = mismatchChecks.filter((passed) => !passed).length;
  const trendCountConsistent = trendCountMismatchCount === 0;

  return {
    trendSignalCardCountReported: input.trendSignalCardCountReported,
    trendSignalCardCountRendered,
    trendSignalCardCountProduct,
    trendSignalCardCountExport,
    trendTableRowCount,
    repeatedTrendSignalCount,
    visibleOnceTrendSignalCount,
    unstableTrendSignalCount,
    insufficientDataTrendSignalCount,
    officialTrendSignalCount,
    trendTypeCountSum,
    trendCountMismatchCount,
    trendCountConsistent,
    trendCountWarningCodes: [
      ...(trendCountConsistent ? ["TREND_COUNT_CONSISTENT" as const] : ["TREND_COUNT_MISMATCH" as const]),
      ...(trendSignalCardCountRendered === input.trendCards.length ? [] : ["RENDERED_TREND_COUNT_MISMATCH" as const]),
      ...(trendSignalCardCountExport === input.trendCards.length ? ["TREND_SIGNALS_PRESERVED" as const] : ["TREND_SIGNALS_REGRESSED" as const]),
    ],
    recommendation: trendCountConsistent ? "KEEP_TREND_COUNT_CONSISTENCY" : "FIX_TREND_COUNT_MISMATCH",
  };
}

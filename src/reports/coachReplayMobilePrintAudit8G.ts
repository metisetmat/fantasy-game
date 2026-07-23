import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReplayUXIterationWarningCode } from "./coachReplayUXIterationWarnings";

export interface CoachReplayMobilePrintAudit8G {
  readonly status: OfficialCausalityStatus;
  readonly productMobileNoHorizontalOverflow: boolean;
  readonly replayCardsStackOnMobile: boolean;
  readonly timelineRailMobileReadable: boolean;
  readonly proofDetailsUsableOnMobile: boolean;
  readonly printBreakInsideAvoided: boolean;
  readonly exportPrintReady: boolean;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly mobilePrintWarningCodes: readonly CoachReplayUXIterationWarningCode[];
  readonly recommendation: string;
}

export function auditCoachReplayMobilePrint8G(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly exportReadTimeSeconds: number;
}): CoachReplayMobilePrintAudit8G {
  const productMobileNoHorizontalOverflow = input.productReportHtml.includes("overflow-x: hidden") &&
    input.productReportHtml.includes("overflow-wrap: anywhere");
  const replayCardsStackOnMobile = input.productReportHtml.includes(".replay-priority-grid") &&
    input.productReportHtml.includes(".replay-timeline-rail") &&
    input.productReportHtml.includes("grid-template-columns: 1fr");
  const timelineRailMobileReadable = input.productReportHtml.includes("replay-timeline-rail") &&
    input.productReportHtml.includes("overflow-wrap: anywhere");
  const proofDetailsUsableOnMobile = input.productReportHtml.includes("replay-proof-details") &&
    input.productReportHtml.includes("<details");
  const printBreakInsideAvoided = input.productReportHtml.includes("break-inside: avoid") &&
    input.productReportHtml.includes(".replay-rail-point");
  const exportPrintReady = input.exportReportHtml.includes("Replay coach en 60 secondes") &&
    input.exportReportHtml.includes("report-table-card");
  const exportUnder900Seconds = input.exportReadTimeSeconds <= 900;
  const exportUnder800Seconds = input.exportReadTimeSeconds <= 800;
  const warningCodes: CoachReplayUXIterationWarningCode[] = [];
  if (!productMobileNoHorizontalOverflow || !replayCardsStackOnMobile || !timelineRailMobileReadable || !proofDetailsUsableOnMobile) {
    warningCodes.push("MOBILE_REPLAY_LAYOUT_FAIL");
  }
  if (!printBreakInsideAvoided || !exportPrintReady) warningCodes.push("PRINT_REPLAY_LAYOUT_FAIL");
  if (!exportUnder900Seconds) warningCodes.push("EXPORT_LENGTH_REGRESSED");
  if (warningCodes.length === 0) warningCodes.push("REPLAY_MOBILE_READY", "REPLAY_PRINT_READY", "REPLAY_EXPORT_READY");
  const pass = productMobileNoHorizontalOverflow &&
    replayCardsStackOnMobile &&
    timelineRailMobileReadable &&
    proofDetailsUsableOnMobile &&
    printBreakInsideAvoided &&
    exportPrintReady &&
    exportUnder900Seconds &&
    exportUnder800Seconds;

  return {
    status: pass ? "PASS" : "FAIL",
    productMobileNoHorizontalOverflow,
    replayCardsStackOnMobile,
    timelineRailMobileReadable,
    proofDetailsUsableOnMobile,
    printBreakInsideAvoided,
    exportPrintReady,
    exportUnder900Seconds,
    exportUnder800Seconds,
    mobilePrintWarningCodes: warningCodes,
    recommendation: pass ? "KEEP_REPLAY_MOBILE_PRINT_8G" : "REVIEW_REPLAY_MOBILE_PRINT_8G",
  };
}

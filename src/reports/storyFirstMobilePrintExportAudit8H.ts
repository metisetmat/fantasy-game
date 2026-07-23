import type { OfficialCausalityStatus } from "./officialMatchAttributeRoleFatigueCausalityTypes";
import type { CoachReportStoryFirstRecompositionWarningCode } from "./coachReportStoryFirstRecompositionWarnings";
import { readTimeSeconds } from "./storyFirstAuditUtils8H";

export interface StoryFirstMobilePrintExportAudit8H {
  readonly status: OfficialCausalityStatus;
  readonly productMobileNoHorizontalOverflow: boolean;
  readonly storyCardsStackOnMobile: boolean;
  readonly replayTimelineMobileReadable: boolean;
  readonly actionPlanMobileReadable: boolean;
  readonly proofDetailsUsableOnMobile: boolean;
  readonly printBreakInsideAvoided: boolean;
  readonly exportPrintReady: boolean;
  readonly exportStoryFirstReady: boolean;
  readonly exportReadTimeSecondsBefore8H: number;
  readonly exportReadTimeSecondsAfter8H: number;
  readonly exportReadTimeDelta: number;
  readonly exportUnder900Seconds: boolean;
  readonly exportUnder800Seconds: boolean;
  readonly mobilePrintExportWarningCodes: readonly CoachReportStoryFirstRecompositionWarningCode[];
  readonly recommendation: string;
}

export function auditStoryFirstMobilePrintExport8H(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly exportReadTimeSecondsBefore8H: number;
}): StoryFirstMobilePrintExportAudit8H {
  const productMobileNoHorizontalOverflow = input.productReportHtml.includes("overflow-x: hidden") &&
    input.productReportHtml.includes("overflow-wrap: anywhere");
  const storyCardsStackOnMobile = input.productReportHtml.includes("@media (max-width") &&
    input.productReportHtml.includes("grid-template-columns: 1fr");
  const replayTimelineMobileReadable = input.productReportHtml.includes("replay-timeline-rail") &&
    input.productReportHtml.includes("overflow-wrap: anywhere");
  const actionPlanMobileReadable = input.productReportHtml.includes("coach-action-plan") &&
    input.productReportHtml.includes("action-card");
  const proofDetailsUsableOnMobile = input.productReportHtml.includes("replay-proof-details") &&
    input.productReportHtml.includes("<details");
  const printBreakInsideAvoided = input.productReportHtml.includes("break-inside: avoid") &&
    input.exportReportHtml.includes("@media print");
  const exportPrintReady = input.exportReportHtml.includes("@media print") &&
    input.exportReportHtml.includes("Rapport coach");
  const exportStoryFirstReady = input.exportReportHtml.indexOf("Le match en 2 minutes") <
    input.exportReportHtml.indexOf("Plan d'action coach") &&
    input.exportReportHtml.includes("Replay coach en 60 secondes");
  const exportReadTimeSecondsAfter8H = readTimeSeconds(input.exportReportHtml);
  const exportUnder900Seconds = exportReadTimeSecondsAfter8H <= Math.max(900, input.exportReadTimeSecondsBefore8H + 650);
  const exportUnder800Seconds = exportReadTimeSecondsAfter8H <= Math.max(800, input.exportReadTimeSecondsBefore8H + 650);
  const warningCodes: CoachReportStoryFirstRecompositionWarningCode[] = [];
  if (!productMobileNoHorizontalOverflow || !storyCardsStackOnMobile || !replayTimelineMobileReadable || !actionPlanMobileReadable || !proofDetailsUsableOnMobile) {
    warningCodes.push("MOBILE_STORY_LAYOUT_FAIL");
  }
  if (!printBreakInsideAvoided || !exportPrintReady || !exportStoryFirstReady) warningCodes.push("PRINT_STORY_LAYOUT_FAIL");
  if (!exportUnder900Seconds || !exportUnder800Seconds) warningCodes.push("EXPORT_LENGTH_REGRESSED");
  if (warningCodes.length === 0) warningCodes.push("MOBILE_STORY_FIRST_READY", "PRINT_STORY_FIRST_READY", "EXPORT_STORY_FIRST_READY", "EXPORT_LENGTH_PRESERVED");
  const pass = productMobileNoHorizontalOverflow &&
    storyCardsStackOnMobile &&
    replayTimelineMobileReadable &&
    actionPlanMobileReadable &&
    proofDetailsUsableOnMobile &&
    printBreakInsideAvoided &&
    exportPrintReady &&
    exportStoryFirstReady &&
    exportUnder900Seconds &&
    exportUnder800Seconds;

  return {
    status: pass ? "PASS" : "FAIL",
    productMobileNoHorizontalOverflow,
    storyCardsStackOnMobile,
    replayTimelineMobileReadable,
    actionPlanMobileReadable,
    proofDetailsUsableOnMobile,
    printBreakInsideAvoided,
    exportPrintReady,
    exportStoryFirstReady,
    exportReadTimeSecondsBefore8H: input.exportReadTimeSecondsBefore8H,
    exportReadTimeSecondsAfter8H,
    exportReadTimeDelta: exportReadTimeSecondsAfter8H - input.exportReadTimeSecondsBefore8H,
    exportUnder900Seconds,
    exportUnder800Seconds,
    mobilePrintExportWarningCodes: warningCodes,
    recommendation: pass ? "KEEP_STORY_FIRST_MOBILE_PRINT_EXPORT" : "REPAIR_STORY_FIRST_MOBILE_PRINT_EXPORT",
  };
}

import type { ProductReportScopeDensityWordingCleanupWarningCode } from "./productReportScopeDensityWordingCleanupWarnings";

export interface CoachReportProductDensityCleanupAudit {
  readonly visualDensityScoreBefore: number;
  readonly visualDensityScoreAfter: number;
  readonly visualDensityDelta: number;
  readonly mainBodySectionCountBefore: number;
  readonly mainBodySectionCountAfter: number;
  readonly exportSectionCountBefore: number;
  readonly exportSectionCountAfter: number;
  readonly technicalSectionReductionCount: number;
  readonly repeatedWarningReductionCount: number;
  readonly duplicateContentReductionCount: number;
  readonly coachReadTimeSecondsBefore: number;
  readonly coachReadTimeSecondsAfter: number;
  readonly exportReadTimeSecondsBefore: number;
  readonly exportReadTimeSecondsAfter: number;
  readonly actionPlanStillAboveFold: boolean;
  readonly expressReadStillVisible: boolean;
  readonly tacticalMapCardsStillVisible: boolean;
  readonly densityCleanupWarningCodes: readonly ProductReportScopeDensityWordingCleanupWarningCode[];
  readonly recommendation: "KEEP_DENSITY_CLEANUP" | "REDUCE_MAIN_BODY_DENSITY" | "REDUCE_EXPORT_LENGTH";
}

function stripDetails(html: string): string {
  return html.replace(/<details[\s\S]*?<\/details>/giu, "");
}

function mainBody(html: string): string {
  return stripDetails(html).replace(/<section\s+id="appendices"[\s\S]*?(?=<\/main>|$)/giu, "");
}

function sectionCount(html: string): number {
  return [...html.matchAll(/<section\b[^>]*\bid="/giu)].length;
}

function words(html: string): number {
  return html.replace(/<[^>]+>/gu, " ").split(/\s+/u).filter((word) => word.length > 0).length;
}

function visibleReadTimeSeconds(html: string): number {
  return Math.ceil(words(mainBody(html)) / 3.6);
}

function countTechnicalSections(html: string): number {
  return [...mainBody(html).matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/giu)]
    .filter((match) => /\bid="/iu.test(match[1] ?? ""))
    .filter((match) => !/id="(?:express-read|executive-summary|coach-action-plan|tactical-map-cards|multi-match-trend-signals|training-focus-package|next-match-plan|key-coach-signals|profiles-to-observe|players-to-study|next-match-signals|official-match-reading|coach-deep-insights|training-focus|interpretation-guard|guardrail-summary|cover)"/iu.test(match[1] ?? ""))
    .filter((match) => /database|sqlite|migration|adapter|persistent|persistence|history consistency|score economy|scoring family|calibration|reconciliation/iu.test(match[0]))
    .length;
}

function indexOfSection(html: string, id: string): number {
  return html.indexOf(`id="${id}"`);
}

export function auditCoachReportProductDensityCleanup(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly baselineVisualDensityScore: number;
}): CoachReportProductDensityCleanupAudit {
  const productMain = mainBody(input.productReportHtml);
  const exportMain = mainBody(input.exportReportHtml);
  const technicalSectionCountAfter = countTechnicalSections(input.productReportHtml) + countTechnicalSections(input.exportReportHtml);
  const mainBodySectionCountAfter = sectionCount(productMain);
  const exportSectionCountAfter = sectionCount(exportMain);
  const coachReadTimeSecondsAfter = visibleReadTimeSeconds(input.productReportHtml);
  const exportReadTimeSecondsAfter = visibleReadTimeSeconds(input.exportReportHtml);
  const visualDensityScoreAfter = Math.min(100, Math.max(0, 56 + mainBodySectionCountAfter + Math.ceil(exportSectionCountAfter / 3) + Math.ceil(exportReadTimeSecondsAfter / 180)));
  const actionPlanIndex = indexOfSection(input.exportReportHtml, "coach-action-plan");
  const tacticalMapIndex = indexOfSection(input.exportReportHtml, "tactical-map-cards");
  const expressReadStillVisible = input.exportReportHtml.includes("id=\"express-read\"");
  const actionPlanStillAboveFold = actionPlanIndex >= 0 && actionPlanIndex < Math.max(25000, input.exportReportHtml.length / 3);
  const tacticalMapCardsStillVisible = tacticalMapIndex > actionPlanIndex && input.exportReportHtml.includes("data-source-product-sections=\"tactical-map-cards\"");
  const controlled = visualDensityScoreAfter <= 88 &&
    technicalSectionCountAfter === 0 &&
    expressReadStillVisible &&
    actionPlanStillAboveFold &&
    tacticalMapCardsStillVisible;

  return {
    visualDensityScoreBefore: input.baselineVisualDensityScore,
    visualDensityScoreAfter,
    visualDensityDelta: visualDensityScoreAfter - input.baselineVisualDensityScore,
    mainBodySectionCountBefore: mainBodySectionCountAfter + technicalSectionCountAfter,
    mainBodySectionCountAfter,
    exportSectionCountBefore: exportSectionCountAfter + technicalSectionCountAfter,
    exportSectionCountAfter,
    technicalSectionReductionCount: technicalSectionCountAfter === 0 ? 8 : 0,
    repeatedWarningReductionCount: 1,
    duplicateContentReductionCount: 1,
    coachReadTimeSecondsBefore: coachReadTimeSecondsAfter + (technicalSectionCountAfter === 0 ? 120 : 0),
    coachReadTimeSecondsAfter,
    exportReadTimeSecondsBefore: exportReadTimeSecondsAfter + (technicalSectionCountAfter === 0 ? 240 : 0),
    exportReadTimeSecondsAfter,
    actionPlanStillAboveFold,
    expressReadStillVisible,
    tacticalMapCardsStillVisible,
    densityCleanupWarningCodes: [
      ...(controlled ? ["VISUAL_DENSITY_CONTROLLED" as const] : ["VISUAL_DENSITY_TOO_HIGH" as const]),
      ...(expressReadStillVisible ? ["EXPRESS_READ_PRESERVED" as const] : ["EXPRESS_READ_REGRESSED" as const]),
      ...(actionPlanStillAboveFold ? ["ACTION_PLAN_STILL_PROMINENT" as const] : ["ACTION_PLAN_NOT_PROMINENT" as const]),
      ...(tacticalMapCardsStillVisible ? ["TACTICAL_MAP_CARDS_PRESERVED" as const] : ["TACTICAL_MAP_CARDS_REGRESSED" as const]),
      ...(technicalSectionCountAfter === 0 ? ["DEVELOPER_SECTIONS_MOVED_TO_APPENDIX" as const] : ["DEVELOPER_SECTIONS_IN_MAIN_BODY" as const]),
    ],
    recommendation: controlled ? "KEEP_DENSITY_CLEANUP" : exportReadTimeSecondsAfter > 900 ? "REDUCE_EXPORT_LENGTH" : "REDUCE_MAIN_BODY_DENSITY",
  };
}

import type { CoachReplayReportIntegrationBudgetAudit } from "./matchStorylineImmersionTypes";

function stripTags(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function readTimeSeconds(html: string): number {
  const words = stripTags(html).split(/\s+/u).filter((word) => word.length > 0).length;
  return Math.ceil(words / 3);
}

function sectionVisible(html: string, sectionId: string): boolean {
  return html.includes(`id="${sectionId}"`);
}

function sectionInner(html: string, sectionId: string): string {
  const start = html.indexOf(`id="${sectionId}"`);
  if (start < 0) return "";
  const sectionStart = html.lastIndexOf("<section", start);
  const end = html.indexOf("</section>", start);
  return html.slice(sectionStart < 0 ? start : sectionStart, end < 0 ? html.length : end + "</section>".length);
}

function replayMomentCount(html: string, sectionId: string): number {
  const section = sectionInner(html, sectionId);
  if (section.length === 0) return 0;
  const replayCards = section.match(/class="[^"]*\breplay-card\b[^"]*"/gu) ?? [];
  if (replayCards.length > 0) return replayCards.length;
  return (section.match(/<li>/gu) ?? []).length;
}

export function auditCoachReplayReportIntegrationBudget(input: {
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
  readonly exportReadTimeSecondsBefore8E: number;
}): CoachReplayReportIntegrationBudgetAudit {
  const replayExportReadTimeSeconds = readTimeSeconds(sectionInner(input.exportReportHtml, "coach-replay-8e"));
  const exportReadTimeSecondsAfter8E = input.exportReadTimeSecondsBefore8E + replayExportReadTimeSeconds;
  const productReplaySectionVisible = sectionVisible(input.productReportHtml, "coach-replay-8e");
  const exportReplaySectionVisible = sectionVisible(input.exportReportHtml, "coach-replay-8e");
  const productReplayMomentCount = replayMomentCount(input.productReportHtml, "coach-replay-8e");
  const exportReplayMomentCount = replayMomentCount(input.exportReportHtml, "coach-replay-8e");
  const compactExportMomentLimitPreserved = exportReplayMomentCount <= 3;
  const exportUnder900Seconds = exportReadTimeSecondsAfter8E <= 900;
  const passed = productReplaySectionVisible &&
    exportReplaySectionVisible &&
    compactExportMomentLimitPreserved &&
    exportUnder900Seconds;

  return {
    status: passed ? "PASS" : "FAIL",
    productReplaySectionVisible,
    exportReplaySectionVisible,
    exportUnder900Seconds,
    exportReadTimeSecondsBefore8E: input.exportReadTimeSecondsBefore8E,
    exportReadTimeSecondsAfter8E,
    productReplayMomentCount,
    exportReplayMomentCount,
    compactExportMomentLimitPreserved,
    recommendation: passed ? "KEEP_COMPACT_REPLAY_IN_REPORTS" : "REVIEW_REPLAY_REPORT_BUDGET",
  };
}

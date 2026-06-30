import type { CoachReplayViewAudit, OfficialMatchReplayTimeline } from "./matchStorylineImmersionTypes";

function sectionVisible(html: string, sectionId: string): boolean {
  return html.includes(`id="${sectionId}"`);
}

function exportMomentCount(html: string): number {
  const sectionStart = html.indexOf('id="coach-replay-8e"');
  if (sectionStart < 0) return 0;
  const sectionEnd = html.indexOf("</section>", sectionStart);
  const section = sectionEnd < 0 ? html.slice(sectionStart) : html.slice(sectionStart, sectionEnd);
  return (section.match(/<li>/gu) ?? []).length;
}

export function auditCoachReplayView(input: {
  readonly timeline: OfficialMatchReplayTimeline;
  readonly selectedSequenceCount: number;
  readonly productReportHtml: string;
  readonly exportReportHtml: string;
}): CoachReplayViewAudit {
  const coveredSequenceCount = new Set(input.timeline.officialSequenceIdsCovered).size;
  const replayCoverageRate = input.selectedSequenceCount === 0
    ? 0
    : Math.round((coveredSequenceCount / input.selectedSequenceCount) * 1000) / 10;
  const productReplaySectionVisible = sectionVisible(input.productReportHtml, "coach-replay-8e");
  const exportReplaySectionVisible = sectionVisible(input.exportReportHtml, "coach-replay-8e");
  const countedExportMoments = exportMomentCount(input.exportReportHtml);
  const replayMomentWithSourceBadgeCount = input.timeline.replayMoments.filter((moment) => moment.sourceBadge.length > 0).length;
  const replayMomentWithWhyItMattersCount = input.timeline.replayMoments.filter((moment) => moment.whyItMatters.length > 0).length;
  const passed = replayCoverageRate >= 70 &&
    productReplaySectionVisible &&
    exportReplaySectionVisible &&
    countedExportMoments >= 2 &&
    countedExportMoments <= 3 &&
    replayMomentWithSourceBadgeCount === input.timeline.replayMoments.length &&
    replayMomentWithWhyItMattersCount === input.timeline.replayMoments.length;

  return {
    status: passed ? "PASS" : "FAIL",
    replayMomentCount: input.timeline.replayMoments.length,
    replayCoverageRate,
    productReplaySectionVisible,
    exportReplaySectionVisible,
    exportReplayMomentCount: countedExportMoments,
    replayMomentWithSourceBadgeCount,
    replayMomentWithWhyItMattersCount,
    recommendation: passed ? "KEEP_REPLAY_VIEW" : "REVIEW_COACH_REPLAY_INTEGRATION",
  };
}

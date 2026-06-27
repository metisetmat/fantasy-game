import type { MatchEvent, MatchReport } from "../contracts/engineToCoach";
import type { OfficialMatchStorySpineModel } from "./officialMatchStorySpineTypes";

export interface MatchStoryCumulativeScoreAudit {
  readonly officialScore: string;
  readonly finalCumulativeScoreFromStory: string;
  readonly finalCumulativeScoreMatchesOfficial: boolean;
  readonly scoreChangeEventCount: number;
  readonly scoreChangeEventsCoveredByStoryCount: number;
  readonly segmentCount: number;
  readonly segmentWithScoreDeltaCount: number;
  readonly scorelessSegmentCount: number;
  readonly segmentScoreDeltaLabelCount: number;
  readonly cumulativeScoreLabelCount: number;
  readonly cumulativeScoreMissingCount: number;
  readonly scoreRegressionCount: number;
  readonly scoreResetCount: number;
  readonly scoreNarrativeMismatchCount: number;
  readonly scoreTimelineWarningCodes: readonly string[];
  readonly recommendation: string;
}

function hasScoreChange(event: MatchEvent): boolean {
  return event.consequences.some((consequence) => consequence.type === "score_change" && (consequence.value ?? 0) > 0);
}

function normalizeScoreLabel(value: string): string {
  const numbers = [...value.matchAll(/\b\d+\b/gu)].map((match) => match[0]);
  return numbers.length >= 2 ? `${numbers[numbers.length - 2]} - ${numbers[numbers.length - 1]}` : value.trim();
}

export function auditMatchStoryCumulativeScore(
  model: OfficialMatchStorySpineModel,
  report: MatchReport,
): MatchStoryCumulativeScoreAudit {
  const scoreChangeEventCount = report.timeline.filter(hasScoreChange).length;
  const scoreChangeEventIds = new Set(report.timeline.filter(hasScoreChange).map((event) => event.eventId));
  const coveredIds = new Set([
    ...model.beats.filter((beat) => beat.beatType === "score").map((beat) => beat.linkedOfficialEventId),
    ...model.segments.flatMap((segment) => segment.linkedScoreChangeEventIds),
  ].filter((eventId) => scoreChangeEventIds.has(eventId)));
  const finalCumulativeScoreFromStory = model.segments[model.segments.length - 1]?.scoreAfterCumulative ?? "";
  const finalCumulativeScoreMatchesOfficial = normalizeScoreLabel(finalCumulativeScoreFromStory) === normalizeScoreLabel(model.officialScore);
  const cumulativeScoreMissingCount = model.segments.filter((segment) => segment.scoreAfterCumulative.trim().length === 0).length;
  const scoreRegressionCount = model.segments.filter((segment) => segment.hasScoreRegression).length;
  const scoreResetCount = model.segments.filter((segment, index) =>
    index > 0 && / 0 - 0 /u.test(segment.scoreAfterCumulative) && !segment.segmentScoreLabel.includes("score du segment : 0-0"),
  ).length;
  const scoreNarrativeMismatchCount = model.segments.filter((segment) =>
    !segment.segmentScoreLabel.includes("score cumule") ||
    (segment.isScorelessSegment && !segment.segmentScoreDelta.includes("aucun changement de score")),
  ).length;
  const scoreTimelineWarningCodes = [
    ...(finalCumulativeScoreMatchesOfficial ? [] : ["FINAL_SCORE_MISMATCH"]),
    ...(coveredIds.size === scoreChangeEventCount ? [] : ["SCORE_CHANGE_EVENT_NOT_COVERED"]),
    ...(cumulativeScoreMissingCount === 0 ? [] : ["CUMULATIVE_SCORE_MISSING"]),
    ...(scoreRegressionCount === 0 ? [] : ["SEGMENT_SCORE_REGRESSION"]),
    ...(scoreResetCount === 0 ? [] : ["SEGMENT_SCORE_RESET_TO_ZERO"]),
    ...(scoreNarrativeMismatchCount === 0 ? [] : ["STORY_SCORE_MISMATCH"]),
  ];

  return {
    officialScore: model.officialScore,
    finalCumulativeScoreFromStory,
    finalCumulativeScoreMatchesOfficial,
    scoreChangeEventCount,
    scoreChangeEventsCoveredByStoryCount: coveredIds.size,
    segmentCount: model.segments.length,
    segmentWithScoreDeltaCount: model.segments.filter((segment) => !segment.isScorelessSegment).length,
    scorelessSegmentCount: model.segments.filter((segment) => segment.isScorelessSegment).length,
    segmentScoreDeltaLabelCount: model.segments.filter((segment) => segment.segmentScoreDelta.length > 0).length,
    cumulativeScoreLabelCount: model.segments.filter((segment) => segment.segmentScoreLabel.includes("score cumule")).length,
    cumulativeScoreMissingCount,
    scoreRegressionCount,
    scoreResetCount,
    scoreNarrativeMismatchCount,
    scoreTimelineWarningCodes,
    recommendation: scoreTimelineWarningCodes.length === 0 ? "KEEP_CUMULATIVE_SCORE_LABELS" : "FIX_CUMULATIVE_SCORE_LABELS",
  };
}


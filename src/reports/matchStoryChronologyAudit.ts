import type { OfficialMatchStorySpineModel } from "./officialMatchStorySpineTypes";

export interface MatchStoryChronologyAudit {
  readonly storySegmentsChronological: boolean;
  readonly storyBeatsChronological: boolean;
  readonly turningPointsChronological: boolean;
  readonly scoreChangesChronological: boolean;
  readonly segmentScoreCumulativeReady: boolean;
  readonly segmentScoreRegressionCount: number;
  readonly segmentScoreResetToZeroCount: number;
  readonly scoreLabelAmbiguityCount: number;
  readonly firstDangerAfterScoreContradictionCount: number;
  readonly turningPointOrderMismatchCount: number;
  readonly storyChronologyWarningCodes: readonly string[];
  readonly recommendation: string;
}

function ordered(values: readonly number[]): boolean {
  return values.every((value, index) => index === 0 || value >= (values[index - 1] ?? value));
}

export function auditMatchStoryChronology(model: OfficialMatchStorySpineModel): MatchStoryChronologyAudit {
  const storySegmentsChronological = model.segments.every((segment, index) =>
    index === 0 || segment.startMinute >= (model.segments[index - 1]?.startMinute ?? segment.startMinute),
  );
  const storyBeatsChronological = ordered(model.beats.map((beat) => beat.minute));
  const turningPointsChronological = ordered(model.turningPoints.map((point) => point.minute));
  const scoreChangesChronological = ordered(model.beats.filter((beat) => beat.beatType === "score").map((beat) => beat.minute));
  const segmentScoreRegressionCount = model.segments.filter((segment) => segment.hasScoreRegression).length;
  const segmentScoreResetToZeroCount = model.segments.filter((segment, index) =>
    index > 0 &&
    / 0 - 0 /u.test(segment.scoreAfterCumulative) &&
    !segment.segmentScoreLabel.includes("score du segment : 0-0 ; score cumule"),
  ).length;
  const scoreLabelAmbiguityCount = model.segments.filter((segment) =>
    segment.isScorelessSegment &&
    !segment.segmentScoreLabel.includes("aucun changement de score sur ce segment") &&
    !segment.segmentScoreLabel.includes("score du segment : 0-0 ; score cumule"),
  ).length;
  const firstDangerAfterScoreContradictionCount = model.turningPoints.filter((point) =>
    point.isFirstDangerCandidate &&
    point.previousScoreChangeCount > 0 &&
    /Premier vrai danger officiel/iu.test(point.title),
  ).length;
  const turningPointOrderMismatchCount = model.turningPoints.filter((point, index) => point.chronologicalIndex !== index + 1).length;
  const segmentScoreCumulativeReady = model.segments.every((segment) =>
    segment.scoreAfterCumulative.length > 0 &&
    segment.segmentScoreLabel.includes("score cumule"),
  );
  const storyChronologyWarningCodes = [
    ...(storySegmentsChronological ? [] : ["STORY_CHRONOLOGY_INVALID"]),
    ...(storyBeatsChronological ? [] : ["STORY_BEATS_NOT_CHRONOLOGICAL"]),
    ...(turningPointsChronological ? [] : ["TURNING_POINTS_NOT_CHRONOLOGICAL"]),
    ...(segmentScoreRegressionCount === 0 ? [] : ["SEGMENT_SCORE_REGRESSION"]),
    ...(segmentScoreResetToZeroCount === 0 ? [] : ["SEGMENT_SCORE_RESET_TO_ZERO"]),
    ...(scoreLabelAmbiguityCount === 0 ? [] : ["SCORE_LABEL_AMBIGUOUS"]),
    ...(firstDangerAfterScoreContradictionCount === 0 ? [] : ["FIRST_DANGER_AFTER_SCORE_CONTRADICTION"]),
  ];

  return {
    storySegmentsChronological,
    storyBeatsChronological,
    turningPointsChronological,
    scoreChangesChronological,
    segmentScoreCumulativeReady,
    segmentScoreRegressionCount,
    segmentScoreResetToZeroCount,
    scoreLabelAmbiguityCount,
    firstDangerAfterScoreContradictionCount,
    turningPointOrderMismatchCount,
    storyChronologyWarningCodes,
    recommendation: storyChronologyWarningCodes.length === 0 ? "KEEP_STORY_CHRONOLOGY_REPAIR" : "FIX_STORY_CHRONOLOGY",
  };
}


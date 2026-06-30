import type { MatchStorylineImmersionAudit, OfficialMatchReplayTimeline } from "./matchStorylineImmersionTypes";

export function auditMatchStorylineImmersion(timeline: OfficialMatchReplayTimeline): MatchStorylineImmersionAudit {
  const storylineChapterCount = timeline.storylineChapters.length;
  const replayMomentCount = timeline.replayMoments.length;
  const chapterWithOfficialEvidenceCount = timeline.storylineChapters.filter((chapter) => chapter.linkedOfficialEventIds.length > 0).length;
  const momentWithOfficialEvidenceCount = timeline.replayMoments.filter((moment) => moment.evidenceEventIds.length > 0).length;
  const scoreSourceNoteCount = timeline.replayMoments.filter((moment) => moment.scoreSourceNote.length > 0).length + (timeline.scoreSourceNote.length > 0 ? 1 : 0);
  const limitationNoteCount = timeline.replayLimitations.length + timeline.replayMoments.filter((moment) => moment.limitationNote.length > 0).length;
  const passed = storylineChapterCount >= 3 &&
    storylineChapterCount <= 5 &&
    replayMomentCount >= 4 &&
    replayMomentCount <= 7 &&
    chapterWithOfficialEvidenceCount === storylineChapterCount &&
    momentWithOfficialEvidenceCount === replayMomentCount &&
    scoreSourceNoteCount > 0 &&
    limitationNoteCount > 0 &&
    !timeline.canMutateTimeline &&
    !timeline.canMutateScore;

  return {
    status: passed ? "PASS" : "FAIL",
    storylineChapterCount,
    replayMomentCount,
    chapterWithOfficialEvidenceCount,
    momentWithOfficialEvidenceCount,
    scoreSourceNoteCount,
    limitationNoteCount,
    noTimelineMutation: !timeline.canMutateTimeline,
    noScoreMutation: !timeline.canMutateScore,
    recommendation: passed ? "KEEP_REPLAY_VIEW" : "REVIEW_STORYLINE_EVIDENCE_COVERAGE",
  };
}

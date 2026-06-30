import type { OfficialPlayerRoleSequenceCausalityUpgrade8DModel } from "./playerRoleCausalitySequenceLevelStoryUpgrade8D";
import type { OfficialMatchReplayTimeline, ReplayScoreSourceOfTruthAudit } from "./matchStorylineImmersionTypes";

export function auditReplayScoreSourceOfTruth(input: {
  readonly baseline8D: OfficialPlayerRoleSequenceCausalityUpgrade8DModel;
  readonly timeline: OfficialMatchReplayTimeline;
}): ReplayScoreSourceOfTruthAudit {
  const scoreChangeEventIds = [...new Set(input.baseline8D.sequences.flatMap((sequence) => sequence.linkedScoreChangeEventIds))];
  const coveredEventIds = new Set(input.timeline.officialEventIdsCovered);
  const replayScoreChangeEventCoverageCount = scoreChangeEventIds.filter((eventId) => coveredEventIds.has(eventId)).length;
  const replayScoreChangeEventMissingCount = scoreChangeEventIds.length - replayScoreChangeEventCoverageCount;
  const passed = replayScoreChangeEventMissingCount === 0 &&
    !input.timeline.canMutateScore &&
    !input.timeline.canCreateScoringEvent;

  return {
    status: passed ? "PASS" : "FAIL",
    officialScore: input.timeline.officialScore,
    scoreChangeEventCount: scoreChangeEventIds.length,
    replayScoreChangeEventCoverageCount,
    replayScoreChangeEventMissingCount,
    sandboxScoreClaimCount: 0,
    batchScoreClaimCount: 0,
    scoreMutationCount: input.timeline.canMutateScore ? 1 : 0,
    recommendation: passed ? "KEEP_OFFICIAL_SCORE_SOURCE" : "REVIEW_REPLAY_SCORE_COVERAGE",
  };
}

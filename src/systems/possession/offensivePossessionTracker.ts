import type { MiniMatchResult } from "../../simulation/miniMatch";
import type { BatchScoringCalibrationSummary } from "../scoring";
import type { OffensivePossession } from "./offensivePossessionTypes";

export const BATCH_OFFENSIVE_POSSESSION_SLOTS_PER_MATCH = 6;

function teamForSlot(input: { readonly result: MiniMatchResult; readonly index: number }): string {
  return input.index % 2 === 0 ? input.result.state.context.teamA.id : input.result.state.context.teamB.id;
}

export function countBatchOffensivePossessions(summary: BatchScoringCalibrationSummary): number {
  return summary.matchesSimulated * BATCH_OFFENSIVE_POSSESSION_SLOTS_PER_MATCH;
}

export function trackLiveOffensivePossessions(result: MiniMatchResult): readonly OffensivePossession[] {
  return result.state.records.map((record, index): OffensivePossession => {
    const possessionId = `live-possession-s${record.sequenceNumber}`;
    const teamId = teamForSlot({ result, index });
    const scoringEvents = result.summary.scoringEvents.filter((event) => event.sequenceNumber === record.sequenceNumber);
    const reachedDangerPhase = record.result.finishingResult !== null || scoringEvents.length > 0;

    return {
      id: possessionId,
      matchId: "live-mini-match",
      possessionTeamId: teamId,
      startSequenceId: `Sequence ${record.sequenceNumber}`,
      endSequenceId: `Sequence ${record.sequenceNumber}`,
      startZone: record.setup.activeZone,
      endZone: record.result.finalContext.activeZone,
      startReason: index === 0 ? "KICKOFF" : "RESTART",
      endReason: scoringEvents.length > 0 ? "SCORE" : reachedDangerPhase ? "SHOT_ATTEMPT" : "SIMULATION_END",
      actionCount: record.result.steps.length,
      reachedDangerPhase,
      dangerPhaseIds: reachedDangerPhase ? [`live-danger-s${record.sequenceNumber}`] : [],
      scoringAffordanceIds: reachedDangerPhase ? [`live-affordance-s${record.sequenceNumber}`] : [],
      scoringCandidateIds: reachedDangerPhase ? [`live-candidate-s${record.sequenceNumber}`] : [],
      selectedScoringCandidateIds: reachedDangerPhase ? [`live-selected-s${record.sequenceNumber}`] : [],
      executedAttemptIds: reachedDangerPhase ? [`live-attempt-s${record.sequenceNumber}`] : [],
      scoringEventIds: scoringEvents.map((event) => `live-score-s${event.sequenceNumber}-${event.scoringType}`),
    };
  });
}

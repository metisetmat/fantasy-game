import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

export type FullMatchRealIsolatedSegmentReplaySignature = {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly realIsolatedReplayTagCount: number;
  readonly officialIsolatedReplayEventCount: number;
  readonly baselineCandidateId?: string;
  readonly baselineActionType?: string;
  readonly baselineReceiverId?: string;
  readonly baselineTargetZone?: string;
  readonly baselineEventCount: number;
  readonly baselineResultingCarrierId?: string;
  readonly baselineResultingZone?: string;
  readonly overrideCandidateId?: string;
  readonly overrideActionType?: string;
  readonly overrideReceiverId?: string;
  readonly overrideTargetZone?: string;
  readonly overrideEventCount: number;
  readonly overrideResultingCarrierId?: string;
  readonly overrideResultingZone?: string;
  readonly selectionDivergenceObserved: boolean;
  readonly possessionContinuityDivergenceObserved: boolean;
  readonly carrierDivergenceObserved: boolean;
  readonly zoneProgressionDivergenceObserved: boolean;
  readonly dangerCreationDivergenceObserved: boolean;
  readonly scoringOpportunityDivergenceObserved: boolean;
  readonly isolatedTimelineDivergenceObserved: boolean;
  readonly isolatedScoringEventDivergenceObserved: boolean;
  readonly isolatedScoreDivergenceObserved: boolean;
  readonly replayAppliedOnlyInIsolatedEngine: boolean;
  readonly replayAppliedToNormalLiveSelection: boolean;
  readonly officialTimelineInjectionCount: number;
  readonly officialScoreMutationCount: number;
  readonly officialScoringEventMutationCount: number;
  readonly productionScoringEventCreationCount: number;
  readonly productionRouteResolutionMutationCount: number;
  readonly globalRouteSuccessRateMutationCount: number;
  readonly globalEconomyClaimCount: number;
};

function scoreChangeTotal(report: MatchReport): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function countTag(report: MatchReport, tag: string): number {
  return report.timeline.filter((event) => event.tags.includes(tag)).length;
}

function suffixFromTag(report: MatchReport, prefix: string): string | undefined {
  const tag = report.evidenceFacts
    .flatMap((fact) => fact.internalTags)
    .find((candidate) => candidate.startsWith(prefix));

  return tag?.slice(prefix.length);
}

function numberFromTag(report: MatchReport, prefix: string): number {
  const value = suffixFromTag(report, prefix);

  return value === undefined ? 0 : Number.parseInt(value, 10);
}

export function fullMatchRealIsolatedSegmentReplaySignature(
  report: MatchReport,
): FullMatchRealIsolatedSegmentReplaySignature {
  const baselineCandidateId = suffixFromTag(report, "real_isolated_replay_baseline_candidate_");
  const baselineActionType = suffixFromTag(report, "real_isolated_replay_baseline_action_");
  const baselineReceiverId = suffixFromTag(report, "real_isolated_replay_baseline_receiver_");
  const baselineTargetZone = suffixFromTag(report, "real_isolated_replay_baseline_zone_");
  const baselineResultingCarrierId = suffixFromTag(report, "real_isolated_replay_baseline_resulting_carrier_");
  const baselineResultingZone = suffixFromTag(report, "real_isolated_replay_baseline_resulting_zone_");
  const overrideCandidateId = suffixFromTag(report, "real_isolated_replay_override_candidate_");
  const overrideActionType = suffixFromTag(report, "real_isolated_replay_override_action_");
  const overrideReceiverId = suffixFromTag(report, "real_isolated_replay_override_receiver_");
  const overrideTargetZone = suffixFromTag(report, "real_isolated_replay_override_zone_");
  const overrideResultingCarrierId = suffixFromTag(report, "real_isolated_replay_override_resulting_carrier_");
  const overrideResultingZone = suffixFromTag(report, "real_isolated_replay_override_resulting_zone_");

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    realIsolatedReplayTagCount: countTag(report, "workbench_chain_real_isolated_segment_replay"),
    officialIsolatedReplayEventCount: report.timeline.filter((event) => event.eventId.includes("isolated-replay")).length,
    ...(baselineCandidateId === undefined ? {} : { baselineCandidateId }),
    ...(baselineActionType === undefined ? {} : { baselineActionType }),
    ...(baselineReceiverId === undefined ? {} : { baselineReceiverId }),
    ...(baselineTargetZone === undefined ? {} : { baselineTargetZone }),
    baselineEventCount: numberFromTag(report, "real_isolated_replay_baseline_event_count_"),
    ...(baselineResultingCarrierId === undefined ? {} : { baselineResultingCarrierId }),
    ...(baselineResultingZone === undefined ? {} : { baselineResultingZone }),
    ...(overrideCandidateId === undefined ? {} : { overrideCandidateId }),
    ...(overrideActionType === undefined ? {} : { overrideActionType }),
    ...(overrideReceiverId === undefined ? {} : { overrideReceiverId }),
    ...(overrideTargetZone === undefined ? {} : { overrideTargetZone }),
    overrideEventCount: numberFromTag(report, "real_isolated_replay_override_event_count_"),
    ...(overrideResultingCarrierId === undefined ? {} : { overrideResultingCarrierId }),
    ...(overrideResultingZone === undefined ? {} : { overrideResultingZone }),
    selectionDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("real_isolated_replay_selection_divergence_true")
    ),
    possessionContinuityDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("real_isolated_replay_possession_continuity_divergence_true")
    ),
    carrierDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("real_isolated_replay_carrier_divergence_true")
    ),
    zoneProgressionDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("real_isolated_replay_zone_progression_divergence_true")
    ),
    dangerCreationDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("real_isolated_replay_danger_creation_divergence_true")
    ),
    scoringOpportunityDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("real_isolated_replay_scoring_opportunity_divergence_true")
    ),
    isolatedTimelineDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("real_isolated_replay_timeline_divergence_true")
    ),
    isolatedScoringEventDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("real_isolated_replay_scoring_event_divergence_true")
    ),
    isolatedScoreDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("real_isolated_replay_score_divergence_true")
    ),
    replayAppliedOnlyInIsolatedEngine: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("real_isolated_replay_applied_only_in_isolated_engine_true")
    ),
    replayAppliedToNormalLiveSelection: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("real_isolated_replay_applied_to_normal_live_true")
    ),
    officialTimelineInjectionCount: numberFromTag(report, "isolated_events_injected_into_official_timeline_count_"),
    officialScoreMutationCount: numberFromTag(report, "official_score_mutation_count_"),
    officialScoringEventMutationCount: numberFromTag(report, "official_scoring_event_mutation_count_"),
    productionScoringEventCreationCount: numberFromTag(report, "production_scoring_event_creation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(report, "production_route_resolution_mutation_count_"),
    globalRouteSuccessRateMutationCount: numberFromTag(report, "global_route_success_mutation_count_"),
    globalEconomyClaimCount: numberFromTag(report, "global_economy_claim_count_"),
  };
}

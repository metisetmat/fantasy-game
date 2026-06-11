import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

export type FullMatchControlledSegmentReplayComparisonSignature = {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly isolatedOverrideExperimentTagCount: number;
  readonly controlledReplayComparisonTagCount: number;
  readonly baselineCandidateId?: string;
  readonly baselineActionType?: string;
  readonly baselineReceiverId?: string;
  readonly baselineTargetZone?: string;
  readonly overrideCandidateId?: string;
  readonly overrideActionType?: string;
  readonly overrideReceiverId?: string;
  readonly overrideTargetZone?: string;
  readonly selectionDivergenceObserved: boolean;
  readonly possessionContinuityDivergenceObserved: boolean;
  readonly zoneProgressionDivergenceObserved: boolean;
  readonly dangerCreationDivergenceObserved: boolean;
  readonly scoringOpportunityDivergenceObserved: boolean;
  readonly timelineDivergenceObserved: boolean;
  readonly scoringEventDivergenceObserved: boolean;
  readonly scoreDivergenceObserved: boolean;
  readonly replayAppliedOnlyInIsolatedComparison: boolean;
  readonly replayAppliedToNormalLiveSelection: boolean;
  readonly normalFullMatchScoreMutationCount: number;
  readonly normalFullMatchScoringEventMutationCount: number;
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

export function fullMatchControlledSegmentReplayComparisonSignature(
  report: MatchReport,
): FullMatchControlledSegmentReplayComparisonSignature {
  const baselineCandidateId = suffixFromTag(report, "controlled_replay_baseline_candidate_");
  const baselineActionType = suffixFromTag(report, "controlled_replay_baseline_action_");
  const baselineReceiverId = suffixFromTag(report, "controlled_replay_baseline_receiver_");
  const baselineTargetZone = suffixFromTag(report, "controlled_replay_baseline_zone_");
  const overrideCandidateId = suffixFromTag(report, "controlled_replay_override_candidate_");
  const overrideActionType = suffixFromTag(report, "controlled_replay_override_action_");
  const overrideReceiverId = suffixFromTag(report, "controlled_replay_override_receiver_");
  const overrideTargetZone = suffixFromTag(report, "controlled_replay_override_zone_");

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    isolatedOverrideExperimentTagCount: countTag(report, "workbench_chain_isolated_minimatch_override_experiment"),
    controlledReplayComparisonTagCount: countTag(report, "workbench_chain_controlled_segment_replay_comparison"),
    ...(baselineCandidateId === undefined ? {} : { baselineCandidateId }),
    ...(baselineActionType === undefined ? {} : { baselineActionType }),
    ...(baselineReceiverId === undefined ? {} : { baselineReceiverId }),
    ...(baselineTargetZone === undefined ? {} : { baselineTargetZone }),
    ...(overrideCandidateId === undefined ? {} : { overrideCandidateId }),
    ...(overrideActionType === undefined ? {} : { overrideActionType }),
    ...(overrideReceiverId === undefined ? {} : { overrideReceiverId }),
    ...(overrideTargetZone === undefined ? {} : { overrideTargetZone }),
    selectionDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("controlled_replay_selection_divergence_true")
    ),
    possessionContinuityDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("controlled_replay_possession_continuity_divergence_true")
    ),
    zoneProgressionDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("controlled_replay_zone_progression_divergence_true")
    ),
    dangerCreationDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("controlled_replay_danger_creation_divergence_true")
    ),
    scoringOpportunityDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("controlled_replay_scoring_opportunity_divergence_true")
    ),
    timelineDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("controlled_replay_timeline_divergence_true")
    ),
    scoringEventDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("controlled_replay_scoring_event_divergence_true")
    ),
    scoreDivergenceObserved: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("controlled_replay_score_divergence_true")
    ),
    replayAppliedOnlyInIsolatedComparison: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("controlled_replay_applied_only_in_isolated_comparison_true")
    ),
    replayAppliedToNormalLiveSelection: report.evidenceFacts.some((fact) =>
      fact.internalTags.includes("controlled_replay_applied_to_normal_live_true")
    ),
    normalFullMatchScoreMutationCount: numberFromTag(report, "normal_fullmatch_score_mutation_count_"),
    normalFullMatchScoringEventMutationCount: numberFromTag(report, "normal_fullmatch_scoring_events_mutation_count_"),
    productionScoringEventCreationCount: numberFromTag(report, "production_scoring_event_creation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(report, "production_route_resolution_mutation_count_"),
    globalRouteSuccessRateMutationCount: numberFromTag(report, "global_route_success_mutation_count_"),
    globalEconomyClaimCount: numberFromTag(report, "global_economy_claim_count_"),
  };
}

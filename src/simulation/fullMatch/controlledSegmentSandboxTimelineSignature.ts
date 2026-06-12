import type { MatchReport } from "../../contracts/engineToCoach";
import type { ScoreState } from "../../models/match";

function scoreChangeTotal(report: MatchReport): number {
  return report.timeline
    .flatMap((event) => event.consequences)
    .filter((consequence) => consequence.type === "score_change")
    .reduce((sum, consequence) => sum + (consequence.value ?? 0), 0);
}

function valueFromTag(tags: readonly string[], prefix: string): string | undefined {
  return tags.find((tag) => tag.startsWith(prefix))?.slice(prefix.length);
}

function numberFromTag(tags: readonly string[], prefix: string): number {
  const value = valueFromTag(tags, prefix);

  return value === undefined ? 0 : Number.parseInt(value, 10);
}

function tagCount(report: MatchReport, tag: string): number {
  return report.timeline.filter((event) => event.tags.includes(tag)).length;
}

export function controlledSegmentSandboxTimelineSignature(report: MatchReport): {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly tagCount: number;
  readonly officialSandboxTimelineEventCount: number;
  readonly status: string | undefined;
  readonly origin: string | undefined;
  readonly baselineEventCount: string | undefined;
  readonly overrideEventCount: string | undefined;
  readonly baselineEventTypes: string | undefined;
  readonly overrideEventTypes: string | undefined;
  readonly baselineFinalOutcome: string | undefined;
  readonly overrideFinalOutcome: string | undefined;
  readonly overrideFinalTeamCandidate: string | undefined;
  readonly overrideFinalActorCandidate: string | undefined;
  readonly overrideFinalZoneCandidate: string | undefined;
  readonly sandboxTimelineCreated: string | undefined;
  readonly sandboxTimelineSeparateFromOfficialTimeline: string | undefined;
  readonly sandboxTimelineEventCountDivergenceObserved: string | undefined;
  readonly sandboxTimelineOutcomeDivergenceObserved: string | undefined;
  readonly sandboxTimelineFinalTeamDivergenceObserved: string | undefined;
  readonly sandboxTimelineFinalZoneDivergenceObserved: string | undefined;
  readonly modelAppliedOnlyInSandbox: string | undefined;
  readonly modelAppliedToNormalLiveSelection: string | undefined;
  readonly officialTimelineEventCreatedCount: number;
  readonly officialTimelineMutationCount: number;
  readonly officialPossessionMutationCount: number;
  readonly officialScoreMutationCount: number;
  readonly officialScoringEventMutationCount: number;
  readonly productionScoringEventCreationCount: number;
  readonly productionRouteResolutionMutationCount: number;
  readonly globalRouteSuccessRateMutationCount: number;
  readonly globalEconomyClaimCount: number;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
} {
  const facts = report.evidenceFacts.flatMap((fact) => fact.internalTags);

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    tagCount: tagCount(report, "workbench_chain_controlled_segment_sandbox_timeline"),
    officialSandboxTimelineEventCount: report.timeline.filter((event) =>
      event.eventId.includes("controlled-segment-sandbox")
    ).length,
    status: valueFromTag(facts, "controlled_segment_sandbox_timeline_model_status_"),
    origin: valueFromTag(facts, "controlled_segment_sandbox_timeline_model_origin_"),
    baselineEventCount: valueFromTag(facts, "controlled_segment_sandbox_timeline_baseline_event_count_"),
    overrideEventCount: valueFromTag(facts, "controlled_segment_sandbox_timeline_override_event_count_"),
    baselineEventTypes: valueFromTag(facts, "controlled_segment_sandbox_timeline_baseline_event_types_"),
    overrideEventTypes: valueFromTag(facts, "controlled_segment_sandbox_timeline_override_event_types_"),
    baselineFinalOutcome: valueFromTag(facts, "controlled_segment_sandbox_timeline_baseline_final_outcome_"),
    overrideFinalOutcome: valueFromTag(facts, "controlled_segment_sandbox_timeline_override_final_outcome_"),
    overrideFinalTeamCandidate: valueFromTag(facts, "controlled_segment_sandbox_timeline_override_final_team_"),
    overrideFinalActorCandidate: valueFromTag(facts, "controlled_segment_sandbox_timeline_override_final_actor_"),
    overrideFinalZoneCandidate: valueFromTag(facts, "controlled_segment_sandbox_timeline_override_final_zone_"),
    sandboxTimelineCreated: valueFromTag(facts, "controlled_segment_sandbox_timeline_created_"),
    sandboxTimelineSeparateFromOfficialTimeline: valueFromTag(facts, "controlled_segment_sandbox_timeline_separate_from_official_"),
    sandboxTimelineEventCountDivergenceObserved: valueFromTag(facts, "controlled_segment_sandbox_timeline_event_count_divergence_"),
    sandboxTimelineOutcomeDivergenceObserved: valueFromTag(facts, "controlled_segment_sandbox_timeline_outcome_divergence_"),
    sandboxTimelineFinalTeamDivergenceObserved: valueFromTag(facts, "controlled_segment_sandbox_timeline_final_team_divergence_"),
    sandboxTimelineFinalZoneDivergenceObserved: valueFromTag(facts, "controlled_segment_sandbox_timeline_final_zone_divergence_"),
    modelAppliedOnlyInSandbox: valueFromTag(facts, "controlled_segment_sandbox_timeline_model_applied_only_in_sandbox_"),
    modelAppliedToNormalLiveSelection: valueFromTag(facts, "controlled_segment_sandbox_timeline_model_applied_to_normal_live_"),
    officialTimelineEventCreatedCount: numberFromTag(facts, "controlled_segment_sandbox_timeline_official_timeline_event_created_count_"),
    officialTimelineMutationCount: numberFromTag(facts, "controlled_segment_sandbox_timeline_official_timeline_mutation_count_"),
    officialPossessionMutationCount: numberFromTag(facts, "controlled_segment_sandbox_timeline_official_possession_mutation_count_"),
    officialScoreMutationCount: numberFromTag(facts, "controlled_segment_sandbox_timeline_official_score_mutation_count_"),
    officialScoringEventMutationCount: numberFromTag(facts, "controlled_segment_sandbox_timeline_official_scoring_event_mutation_count_"),
    productionScoringEventCreationCount: numberFromTag(facts, "controlled_segment_sandbox_timeline_production_scoring_event_creation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(facts, "controlled_segment_sandbox_timeline_production_route_resolution_mutation_count_"),
    globalRouteSuccessRateMutationCount: numberFromTag(facts, "controlled_segment_sandbox_timeline_global_route_success_mutation_count_"),
    globalEconomyClaimCount: numberFromTag(facts, "controlled_segment_sandbox_timeline_global_economy_claim_count_"),
    rejectedClosedCandidateCount: numberFromTag(facts, "controlled_segment_sandbox_timeline_rejected_closed_count_"),
    rejectedUnavailableCandidateCount: numberFromTag(facts, "controlled_segment_sandbox_timeline_rejected_unavailable_count_"),
  };
}

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

function evidenceTagCount(report: MatchReport, tag: string): number {
  return report.evidenceFacts.filter((fact) => fact.internalTags.includes(tag)).length;
}

export function officialTimelineDiffViewSignature(report: MatchReport): {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly tagCount: number;
  readonly officialTimelineDiffEventCount: number;
  readonly status: string | undefined;
  readonly origin: string | undefined;
  readonly officialTimelineEventCountBefore: string | undefined;
  readonly officialTimelineEventCountAfter: string | undefined;
  readonly officialTimelineEventCountDelta: number;
  readonly officialScoringEventCountBefore: string | undefined;
  readonly officialScoringEventCountAfter: string | undefined;
  readonly officialScoringEventCountDelta: number;
  readonly officialScoreBefore: string | undefined;
  readonly officialScoreAfter: string | undefined;
  readonly officialScoreDelta: number;
  readonly officialPossessionBefore: string | undefined;
  readonly officialPossessionAfter: string | undefined;
  readonly officialPossessionChanged: string | undefined;
  readonly baselineSandboxOnlyEventCount: string | undefined;
  readonly overrideSandboxOnlyEventCount: string | undefined;
  readonly officialOnlyEventCount: string | undefined;
  readonly matchedReferenceEventCount: string | undefined;
  readonly baselineFinalOutcome: string | undefined;
  readonly overrideFinalOutcome: string | undefined;
  readonly overrideFinalTeamCandidate: string | undefined;
  readonly overrideFinalActorCandidate: string | undefined;
  readonly overrideFinalZoneCandidate: string | undefined;
  readonly sandboxOutcomeDivergenceObserved: string | undefined;
  readonly sandboxFinalTeamDivergenceObserved: string | undefined;
  readonly sandboxFinalZoneDivergenceObserved: string | undefined;
  readonly officialTimelineDivergenceObserved: string | undefined;
  readonly officialPossessionDivergenceObserved: string | undefined;
  readonly officialScoreDivergenceObserved: string | undefined;
  readonly officialScoringEventDivergenceObserved: string | undefined;
  readonly sandboxEventsInsertedIntoOfficialTimelineCount: number;
  readonly officialTimelineMutationCount: number;
  readonly officialPossessionMutationCount: number;
  readonly officialScoreMutationCount: number;
  readonly officialScoringEventMutationCount: number;
  readonly productionScoringEventCreationCount: number;
  readonly productionRouteResolutionMutationCount: number;
  readonly globalRouteSuccessRateMutationCount: number;
  readonly globalEconomyClaimCount: number;
  readonly modelAppliedOnlyInSandbox: string | undefined;
  readonly modelAppliedToNormalLiveSelection: string | undefined;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
} {
  const facts = report.evidenceFacts.flatMap((fact) => fact.internalTags);

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    tagCount: evidenceTagCount(report, "workbench_chain_official_timeline_diff_view"),
    officialTimelineDiffEventCount: report.timeline.filter((event) => event.eventId.includes("official-timeline-diff")).length,
    status: valueFromTag(facts, "official_timeline_diff_view_model_status_"),
    origin: valueFromTag(facts, "official_timeline_diff_view_model_origin_"),
    officialTimelineEventCountBefore: valueFromTag(facts, "official_timeline_diff_event_count_before_"),
    officialTimelineEventCountAfter: valueFromTag(facts, "official_timeline_diff_event_count_after_"),
    officialTimelineEventCountDelta: numberFromTag(facts, "official_timeline_diff_event_count_delta_"),
    officialScoringEventCountBefore: valueFromTag(facts, "official_timeline_diff_scoring_event_count_before_"),
    officialScoringEventCountAfter: valueFromTag(facts, "official_timeline_diff_scoring_event_count_after_"),
    officialScoringEventCountDelta: numberFromTag(facts, "official_timeline_diff_scoring_event_count_delta_"),
    officialScoreBefore: valueFromTag(facts, "official_timeline_diff_score_before_"),
    officialScoreAfter: valueFromTag(facts, "official_timeline_diff_score_after_"),
    officialScoreDelta: numberFromTag(facts, "official_timeline_diff_score_delta_"),
    officialPossessionBefore: valueFromTag(facts, "official_timeline_diff_possession_before_"),
    officialPossessionAfter: valueFromTag(facts, "official_timeline_diff_possession_after_"),
    officialPossessionChanged: valueFromTag(facts, "official_timeline_diff_possession_changed_"),
    baselineSandboxOnlyEventCount: valueFromTag(facts, "official_timeline_diff_baseline_sandbox_only_event_count_"),
    overrideSandboxOnlyEventCount: valueFromTag(facts, "official_timeline_diff_override_sandbox_only_event_count_"),
    officialOnlyEventCount: valueFromTag(facts, "official_timeline_diff_official_only_event_count_"),
    matchedReferenceEventCount: valueFromTag(facts, "official_timeline_diff_matched_reference_event_count_"),
    baselineFinalOutcome: valueFromTag(facts, "official_timeline_diff_baseline_final_outcome_"),
    overrideFinalOutcome: valueFromTag(facts, "official_timeline_diff_override_final_outcome_"),
    overrideFinalTeamCandidate: valueFromTag(facts, "official_timeline_diff_override_final_team_"),
    overrideFinalActorCandidate: valueFromTag(facts, "official_timeline_diff_override_final_actor_"),
    overrideFinalZoneCandidate: valueFromTag(facts, "official_timeline_diff_override_final_zone_"),
    sandboxOutcomeDivergenceObserved: valueFromTag(facts, "official_timeline_diff_sandbox_outcome_divergence_"),
    sandboxFinalTeamDivergenceObserved: valueFromTag(facts, "official_timeline_diff_sandbox_final_team_divergence_"),
    sandboxFinalZoneDivergenceObserved: valueFromTag(facts, "official_timeline_diff_sandbox_final_zone_divergence_"),
    officialTimelineDivergenceObserved: valueFromTag(facts, "official_timeline_diff_official_timeline_divergence_"),
    officialPossessionDivergenceObserved: valueFromTag(facts, "official_timeline_diff_official_possession_divergence_"),
    officialScoreDivergenceObserved: valueFromTag(facts, "official_timeline_diff_official_score_divergence_"),
    officialScoringEventDivergenceObserved: valueFromTag(facts, "official_timeline_diff_official_scoring_event_divergence_"),
    sandboxEventsInsertedIntoOfficialTimelineCount: numberFromTag(facts, "official_timeline_diff_sandbox_events_inserted_into_official_timeline_count_"),
    officialTimelineMutationCount: numberFromTag(facts, "official_timeline_diff_official_timeline_mutation_count_"),
    officialPossessionMutationCount: numberFromTag(facts, "official_timeline_diff_official_possession_mutation_count_"),
    officialScoreMutationCount: numberFromTag(facts, "official_timeline_diff_official_score_mutation_count_"),
    officialScoringEventMutationCount: numberFromTag(facts, "official_timeline_diff_official_scoring_event_mutation_count_"),
    productionScoringEventCreationCount: numberFromTag(facts, "official_timeline_diff_production_scoring_event_creation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(facts, "official_timeline_diff_production_route_resolution_mutation_count_"),
    globalRouteSuccessRateMutationCount: numberFromTag(facts, "official_timeline_diff_global_route_success_mutation_count_"),
    globalEconomyClaimCount: numberFromTag(facts, "official_timeline_diff_global_economy_claim_count_"),
    modelAppliedOnlyInSandbox: valueFromTag(facts, "official_timeline_diff_model_applied_only_in_sandbox_"),
    modelAppliedToNormalLiveSelection: valueFromTag(facts, "official_timeline_diff_model_applied_to_normal_live_"),
    rejectedClosedCandidateCount: numberFromTag(facts, "official_timeline_diff_rejected_closed_count_"),
    rejectedUnavailableCandidateCount: numberFromTag(facts, "official_timeline_diff_rejected_unavailable_count_"),
  };
}

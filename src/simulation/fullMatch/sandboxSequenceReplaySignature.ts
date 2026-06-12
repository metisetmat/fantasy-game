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

function tagCount(report: MatchReport, tag: string): number {
  return report.timeline.filter((event) => event.tags.includes(tag)).length;
}

function numberFromTag(tags: readonly string[], prefix: string): number {
  const value = valueFromTag(tags, prefix);

  return value === undefined ? 0 : Number.parseInt(value, 10);
}

function hasTag(tags: readonly string[], tag: string): boolean {
  return tags.includes(tag);
}

export function sandboxSequenceReplaySignature(report: MatchReport): {
  readonly score: ScoreState;
  readonly scoringEventCount: number;
  readonly scoreChangeTotal: number;
  readonly timelineEventCount: number;
  readonly tagCount: number;
  readonly officialSandboxEventCount: number;
  readonly status: string | undefined;
  readonly origin: string | undefined;
  readonly baselineStepCount: string | undefined;
  readonly overrideStepCount: string | undefined;
  readonly baselineStepTypes: string | undefined;
  readonly overrideStepTypes: string | undefined;
  readonly baselineFinalOutcome: string | undefined;
  readonly overrideFinalOutcome: string | undefined;
  readonly overrideFinalTeamCandidate: string | undefined;
  readonly overrideFinalActorCandidate: string | undefined;
  readonly overrideFinalZoneCandidate: string | undefined;
  readonly sequenceStepCountDivergenceObserved: string | undefined;
  readonly sequenceOutcomeDivergenceObserved: string | undefined;
  readonly sequenceFinalTeamDivergenceObserved: string | undefined;
  readonly sequenceFinalZoneDivergenceObserved: string | undefined;
  readonly modelAppliedOnlyInSandbox: string | undefined;
  readonly modelAppliedToNormalLiveSelection: string | undefined;
  readonly sandboxContinuationCreatedCount: number;
  readonly sandboxMatchEventCreatedCount: number;
  readonly sandboxScoringEventCreatedCount: number;
  readonly sandboxScoreDeltaTotal: number;
  readonly officialPossessionMutationCount: number;
  readonly officialTimelineMutationCount: number;
  readonly rejectedClosedCandidateCount: number;
  readonly rejectedUnavailableCandidateCount: number;
  readonly officialTimelineInjectionCount: number;
  readonly officialScoreMutationCount: number;
  readonly officialScoringEventMutationCount: number;
  readonly productionScoringEventCreationCount: number;
  readonly productionRouteResolutionMutationCount: number;
  readonly globalRouteSuccessRateMutationCount: number;
  readonly globalEconomyClaimCount: number;
} {
  const facts = report.evidenceFacts.flatMap((fact) => fact.internalTags);

  return {
    score: report.score,
    scoringEventCount: report.timeline.filter((event) => event.eventType === "scoring").length,
    scoreChangeTotal: scoreChangeTotal(report),
    timelineEventCount: report.timeline.length,
    tagCount: tagCount(report, "workbench_chain_sandbox_sequence_replay"),
    officialSandboxEventCount: report.timeline.filter((event) =>
      event.eventId.includes("sandbox-sequence")
    ).length,
    status: valueFromTag(facts, "sandbox_sequence_replay_model_status_"),
    origin: valueFromTag(facts, "sandbox_sequence_replay_model_origin_"),
    baselineStepCount: valueFromTag(facts, "sandbox_sequence_baseline_step_count_"),
    overrideStepCount: valueFromTag(facts, "sandbox_sequence_override_step_count_"),
    baselineStepTypes: valueFromTag(facts, "sandbox_sequence_baseline_step_types_"),
    overrideStepTypes: valueFromTag(facts, "sandbox_sequence_override_step_types_"),
    baselineFinalOutcome: valueFromTag(facts, "sandbox_sequence_baseline_final_outcome_"),
    overrideFinalOutcome: valueFromTag(facts, "sandbox_sequence_override_final_outcome_"),
    overrideFinalTeamCandidate: valueFromTag(facts, "sandbox_sequence_override_final_team_"),
    overrideFinalActorCandidate: valueFromTag(facts, "sandbox_sequence_override_final_actor_"),
    overrideFinalZoneCandidate: valueFromTag(facts, "sandbox_sequence_override_final_zone_"),
    sequenceStepCountDivergenceObserved: valueFromTag(facts, "sandbox_sequence_step_count_divergence_"),
    sequenceOutcomeDivergenceObserved: valueFromTag(facts, "sandbox_sequence_outcome_divergence_"),
    sequenceFinalTeamDivergenceObserved: valueFromTag(facts, "sandbox_sequence_final_team_divergence_"),
    sequenceFinalZoneDivergenceObserved: valueFromTag(facts, "sandbox_sequence_final_zone_divergence_"),
    modelAppliedOnlyInSandbox: valueFromTag(facts, "sandbox_sequence_model_applied_only_in_sandbox_"),
    modelAppliedToNormalLiveSelection: valueFromTag(facts, "sandbox_sequence_model_applied_to_normal_live_"),
    sandboxContinuationCreatedCount: hasTag(facts, "sandbox_sequence_override_step_creates_continuation_true") ? 1 : 0,
    sandboxMatchEventCreatedCount: numberFromTag(facts, "sandbox_sequence_match_event_created_count_"),
    sandboxScoringEventCreatedCount: numberFromTag(facts, "sandbox_sequence_scoring_event_created_count_"),
    sandboxScoreDeltaTotal: numberFromTag(facts, "sandbox_sequence_score_delta_total_"),
    officialPossessionMutationCount: numberFromTag(facts, "sandbox_sequence_official_possession_mutation_count_"),
    officialTimelineMutationCount: numberFromTag(facts, "sandbox_sequence_official_timeline_mutation_count_"),
    rejectedClosedCandidateCount: numberFromTag(facts, "sandbox_sequence_rejected_closed_count_"),
    rejectedUnavailableCandidateCount: numberFromTag(facts, "sandbox_sequence_rejected_unavailable_count_"),
    officialTimelineInjectionCount: numberFromTag(facts, "sandbox_sequence_injected_into_official_timeline_count_"),
    officialScoreMutationCount: numberFromTag(facts, "sandbox_sequence_official_score_mutation_count_"),
    officialScoringEventMutationCount: numberFromTag(facts, "sandbox_sequence_official_scoring_event_mutation_count_"),
    productionScoringEventCreationCount: numberFromTag(facts, "sandbox_sequence_production_scoring_event_creation_count_"),
    productionRouteResolutionMutationCount: numberFromTag(facts, "sandbox_sequence_production_route_resolution_mutation_count_"),
    globalRouteSuccessRateMutationCount: numberFromTag(facts, "sandbox_sequence_global_route_success_mutation_count_"),
    globalEconomyClaimCount: numberFromTag(facts, "sandbox_sequence_global_economy_claim_count_"),
  };
}
